import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { useAuthListenerFull } from "./useAuthListener";
import { obtenerUsuarioPorId, obtenerUsuarios, getFullFotoUrl, obtenerFotoUsuario, blobToBase64 } from "../api/usuario";
import { photoCache } from "./useProfilePhoto";
import {
  obtenerEspacioPorUsuarioId,
  obtenerUsuarioEspacios,
} from "../api/usuarioEspacio";
import { obtenerEspacioPorId } from "../api/espacio";
import { obtenerTareasPorEspacio, eliminarTarea } from "../api/tarea";
import TaskModel from "../types/Task";
import type { PlantillaTarea, Tarea } from "../types/Task";
import FacturaModel from "../types/Factura";
import { obtenerFacturasPorDeudor, eliminarFactura } from "../api/factura";
import { obtenerKarmaUsuario } from "../api/karma";
import { dashboardCache } from "./dashboardCache";

export const useDashboardData = (newSpaceName?: string) => {
  const { user, authLoading } = useAuthListenerFull();
  const [userName, setUserName] = useState<string>("......");
  const [espacioNombre, setEspacioNombre] = useState<string>(
    newSpaceName || "......",
  );
  const [espacioId, setEspacioId] = useState<string | null>(null);
  const [userRelacionId, setUserRelacionId] = useState<string | null>(null);
  const [currentKarma, setCurrentKarma] = useState<number>(0);
  const [loadingKarma, setLoadingKarma] = useState<boolean>(true);
  const [loadingEspacio, setLoadingEspacio] = useState<boolean>(true);
  const [userNamesMap, setUserNamesMap] = useState<Record<string, { name: string; fotoUrl: string | null }>>({});
  // Inicializar desde caché en memoria (stale-while-revalidate):
  // si hay datos previos, se muestran al instante mientras se refrescan en segundo plano
  const [tareas, setTareasState] = useState<TaskModel[]>(() => dashboardCache.tareas ?? []);
  const [loadingTareas, setLoadingTareas] = useState(() => dashboardCache.tareas === null);
  const [facturas, setFacturasState] = useState<FacturaModel[]>(() => dashboardCache.facturas ?? []);
  const [loadingFacturas, setLoadingFacturas] = useState(() => dashboardCache.facturas === null);
  const [refreshing, setRefreshing] = useState(false);

  // Setters que mantienen la caché sincronizada (compatibles con setter funcional o valor)
  const setTareas = (updater: SetStateAction<TaskModel[]>) => {
    setTareasState((prev) => {
      const next = typeof updater === "function" ? (updater as (p: TaskModel[]) => TaskModel[])(prev) : updater;
      dashboardCache.tareas = next;
      return next;
    });
  };
  const setFacturas = (updater: SetStateAction<FacturaModel[]>) => {
    setFacturasState((prev) => {
      const next = typeof updater === "function" ? (updater as (p: FacturaModel[]) => FacturaModel[])(prev) : updater;
      dashboardCache.facturas = next;
      return next;
    });
  };


  // Cargar información del espacio del usuario
  useEffect(() => {
    const cargarEspacio = async () => {
      let tieneEspacio = false;
      try {
        if (user?.uid) {
          let displayName =
            user.displayName || user.email?.split("@")[0] || "Usuario";

          const [usuarioData, result] = await Promise.all([
            obtenerUsuarioPorId(user.uid).catch((e) => {
              console.log("No se pudo obtener usuario de la BD", e);
              return null;
            }),
            obtenerEspacioPorUsuarioId(user.uid).catch((e) => {
              console.log("No se pudo obtener el espacio del usuario", e);
              return null;
            })
          ]);

          if (usuarioData?.nombre || usuarioData?.Nombre) {
            displayName = usuarioData.nombre || usuarioData.Nombre;
          }
          setUserName(displayName);

          if (result?.espacioId && result.espacioId !== "string") {
            setEspacioId(result.espacioId);
            tieneEspacio = true;

            const relId = result.id || result.id_UsuarioEspacio;
            setUserRelacionId(relId);

            cargarKarma(result.espacioId, relId);

            try {
              const espacioData = await obtenerEspacioPorId(result.espacioId);
              if (espacioData?.nombre && !newSpaceName) {
                setEspacioNombre(espacioData.nombre);
              }
            } catch (espacioError) {
              if (!newSpaceName) setEspacioNombre("Mi espacio");
            }
          } else {
            setEspacioNombre("Mi espacio");
          }
        }
      } catch (error) {
        // console.error("Error al cargar espacio:", error);
        setEspacioNombre("Mi espacio");
      } finally {
        setLoadingEspacio(false);
        if (!tieneEspacio) {
          setLoadingTareas(false);
          setLoadingFacturas(false);
        }
      }
    };
    // Don't attempt to load until Firebase auth has resolved
    if (authLoading) return;
    cargarEspacio();
  }, [user, authLoading, newSpaceName]);

  // Nombres de usuario — carga todos los miembros del espacio en 1-2 llamadas de red
  // (antes hacía 1 llamada por miembro = N+1). Usa obtenerUsuarios() en batch.
  const nombresLoadingRef = useRef<Promise<Record<string, { name: string; fotoUrl: string | null }>> | null>(null);

  const cargarNombresUsuario = async (targetEspacioId?: string) => {
    try {
      const currentEspacioId = targetEspacioId || espacioId || espacioIdRef.current;
      if (!currentEspacioId) return {};

      // Si ya hay una carga de nombres en curso, reutilizarla (evita duplicar peticiones)
      if (nombresLoadingRef.current) {
        try {
          return await nombresLoadingRef.current;
        } catch {
          // Si falló la anterior, reintentamos
        }
      }

      const promise = (async () => {
        const cleanId = (id: string) => id?.replace(/-/g, "").toLowerCase() || "";

        // Obtener relaciones y TODOS los usuarios en paralelo (solo 2 llamadas)
        const [uEspacios, usuariosRaw] = await Promise.all([
          obtenerUsuarioEspacios().catch(() => null),
          obtenerUsuarios().catch(() => null),
        ]);

        const uEspaciosRaw = Array.isArray(uEspacios) ? uEspacios : uEspacios?.$values || [];
        const usuariosList = Array.isArray(usuariosRaw) ? usuariosRaw : (usuariosRaw as any)?.$values || [];

        // Indexar usuarios por id y por id limpio para búsqueda O(1)
        const usuariosPorId: Record<string, any> = {};
        (usuariosList || []).forEach((u: any) => {
          const uid = u.id || u.Id;
          if (uid) {
            usuariosPorId[uid] = u;
            usuariosPorId[cleanId(uid)] = u;
          }
        });

        // Fallback seguro: si el batch no trajo algún miembro (u falló obtenerUsuarios),
        // resolverlo individualmente solo en ese caso
        const faltantes = (uEspaciosRaw || []).filter((rel: any) => {
          const usuarioId = rel.usuarioId;
          if (!usuarioId) return false;
          return !usuariosPorId[usuarioId] && !usuariosPorId[cleanId(usuarioId)];
        });

        if (faltantes.length > 0) {
          await Promise.all(
            faltantes.map(async (rel: any) => {
              const usuarioId = rel.usuarioId;
              try {
                const u = await obtenerUsuarioPorId(usuarioId);
                if (u) {
                  usuariosPorId[usuarioId] = u;
                  usuariosPorId[cleanId(usuarioId)] = u;
                }
              } catch {
                // Silenciar
              }
            })
          );
        }

        const map: Record<string, { name: string; fotoUrl: string | null }> = {};

        if (Array.isArray(uEspaciosRaw)) {
          const targetClean = cleanId(currentEspacioId);

          // Filtrar relaciones por espacioId de forma estricta (idéntica a useFetchParticipants)
          const relacionesDelEspacio = uEspaciosRaw.filter((rel: any) => {
            return rel.espacioId === currentEspacioId || cleanId(rel.espacioId || "") === targetClean;
          });

          relacionesDelEspacio.forEach((rel: any) => {
            const relId = rel.id || rel.id_UsuarioEspacio;
            const usuarioId = rel.usuarioId;
            if (!usuarioId) return;

            const u = usuariosPorId[usuarioId] || usuariosPorId[cleanId(usuarioId)];
            let entry: { name: string; fotoUrl: string | null };
            if (u) {
              const nombre = u.nombre || u.email || u.id || "Miembro";
              const rawFoto = u?.fotoUrl ?? u?.FotoUrl ?? null;
              const fotoUrl = (usuarioId ? photoCache.get(usuarioId) : null) ?? getFullFotoUrl(rawFoto) ?? null;
              entry = { name: nombre, fotoUrl };
            } else {
              const fallback = `Usuario (${usuarioId.slice(0, 4)})`;
              entry = { name: fallback, fotoUrl: null };
            }
            if (relId) map[relId] = entry;
            if (usuarioId) map[usuarioId] = entry;
            if (relId) map[cleanId(relId || "")] = entry;
            if (usuarioId) map[cleanId(usuarioId || "")] = entry;
          });
        }

        setUserNamesMap(map);
        userNamesMapRef.current = map;
        return map;
      })();

      nombresLoadingRef.current = promise;
      try {
        return await promise;
      } finally {
        if (nombresLoadingRef.current === promise) {
          nombresLoadingRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error al cargar nombres de usuario del espacio:", error);
    }
    return {};
  };

  useEffect(() => {
    if (espacioId) {
      cargarNombresUsuario(espacioId);
    }
  }, [espacioId]);

  const tareasRef = useRef<TaskModel[]>([]);
  useEffect(() => {
    tareasRef.current = tareas;
  }, [tareas]);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const espacioIdRef = useRef(espacioId);
  useEffect(() => {
    espacioIdRef.current = espacioId;
  }, [espacioId]);

  const userNamesMapRef = useRef(userNamesMap);
  useEffect(() => {
    userNamesMapRef.current = userNamesMap;
  }, [userNamesMap]);

  const userRelacionIdRef = useRef(userRelacionId);
  useEffect(() => {
    userRelacionIdRef.current = userRelacionId;
  }, [userRelacionId]);

  const cargarKarma = async (targetEspacioId?: string, targetRelacionId?: string, showLoading = false) => {
    const currentEspacioId = targetEspacioId || espacioId || espacioIdRef.current;
    const currentRelacionId = targetRelacionId || userRelacionId || userRelacionIdRef.current;
    if (!currentEspacioId || !currentRelacionId) {
      setLoadingKarma(false);
      return;
    }

    if (showLoading) setLoadingKarma(true);
    try {
      const karmaData = await obtenerKarmaUsuario(currentEspacioId, currentRelacionId);
      if (karmaData && typeof karmaData.karmaTotal === "number") {
        setCurrentKarma(karmaData.karmaTotal);
      }
    } catch (err) {
      // console.error("Error al cargar karma:", err);
    } finally {
      setLoadingKarma(false);
    }
  };

  const cargarFacturas = async (
    showLoading = true,
    nombresPromise?: Promise<Record<string, { name: string; fotoUrl: string | null }>>,
  ) => {
    const currentEspacioId = espacioIdRef.current;
    const currentUser = userRef.current;
    if (!currentEspacioId || !currentUser?.uid) {
      setLoadingFacturas(false);
      return;
    }
    // Solo mostrar loading si no hay datos previos en caché (refresco silencioso en segundo plano)
    if (showLoading && dashboardCache.facturas === null) setLoadingFacturas(true);
    try {
      const result = await obtenerFacturasPorDeudor(currentEspacioId, currentUser.uid);

      // Manejar tanto array directo como objeto con $values (común en .NET)
      const facturasRaw = Array.isArray(result)
        ? result
        : result?.$values || [];

      // Garantizar que los nombres de usuario estén cargados antes de mapear
      // los deudores. Sin esto, en la primera carga puede haber una carrera
      // entre cargarNombresUsuario() y cargarFacturas(), haciendo que todos
      // los deudores se filtren -> contador "0/0" / detalle sin miembros.
      // Se espera la promesa compartida SIN bloquear al resto de cargas en
      // paralelo (cargarTareas la crea y la pasa como parámetro).
      const names =
        nombresPromise ??
        (Object.keys(userNamesMapRef.current).length === 0
          ? cargarNombresUsuario(currentEspacioId)
          : Promise.resolve(userNamesMapRef.current));
      await names;

      if (Array.isArray(facturasRaw)) {
        // Función para limpiar GUIDs y comparar sin guiones
        const cleanId = (id: string) =>
          id?.replace(/-/g, "").toLowerCase() || "";

        const mapped = facturasRaw.map((f: any) => {
          // El nuevo backend usa un diccionario 'deudores'
          const deudoresDict = f.deudores || f.Deudores || {};
          const relIds = Object.keys(deudoresDict);

          const userNames = relIds
            .map((relId: string) => {
              const cleanedRelId = cleanId(relId);
              // Buscar en el mapa usando el ID limpio
              const nameKey = Object.keys(userNamesMapRef.current).find(
                (k) => cleanId(k) === cleanedRelId,
              );

              if (!nameKey) {
                // Si el usuario fue expulsado o abandonó el espacio, no pertenece a la residencia
                return null;
              }

              const entry = userNamesMapRef.current[nameKey];
              if (!entry) return null;
              const resolvedName = typeof entry === 'string' ? entry : entry.name;
              const resolvedFoto = typeof entry === 'string' ? null : (entry.fotoUrl ?? null);
              return {
                id: relId,
                name: resolvedName,
                fotoUrl: resolvedFoto,
                // en deudores: true = pendiente (no pagado), false = pagado
                completed: deudoresDict[relId] === false,
              };
            })
            .filter((u): u is NonNullable<typeof u> => u !== null);

          return new FacturaModel({
            IdFactura: f.id || f.Id || f.IdFactura || "",
            Nombre: f.nombre || f.Nombre || "Factura sin nombre",
            Descripcion: f.descripcion || f.Descripcion || "",
            Precio: f.precio || f.Precio || 0,
            Pagado: f.pagado || f.Pagado || false,
            FechaCreacion: f.fechaCreacion || f.FechaCreacion || new Date(),
            // Si la factura llega como Pagado=true pero sin FechaCompletada (dato antiguo o
            // incompleto del backend), usamos la fecha de hoy como fallback. Sin esto,
            // isCompletedWithinDays(20) devuelve false → la factura se borraría al instante.
            FechaCompletada: f.fechaCompletada || f.FechaCompletada || ((f.pagado || f.Pagado) ? new Date() : null),
            UsuariosAsignados: userNames,
            creadorFactura: f.creadorFactura || f.CreadorFactura || "",
          });
        });

        console.log("Facturas mapeadas:", mapped.length);
        setFacturas(mapped);

        // Eliminar del backend las facturas pagadas que superaron los 20 días de visibilidad
        limpiarFacturasAntiguas(currentEspacioId, mapped).catch((error) => {
          console.warn("Error en limpieza de facturas antiguas:", error);
        });
      }
    } catch (err) {
      // console.error("Error cargando facturas:", err);
    } finally {
      setLoadingFacturas(false);
    }
  };

  // Elimina automáticamente del backend las tareas completadas que superaron los 7 días de visibilidad
  const limpiarTareasAntiguas = async (targetEspacioId: string, tareasMapeadas: TaskModel[]) => {
    const tareasAntiguas = tareasMapeadas.filter(
      (t) => t.isCompleted && !t.isCompletedWithinDays(7)
    );

    if (tareasAntiguas.length === 0) return;

    // Eliminar en paralelo, sin bloquear la UI. Los errores se ignoran silenciosamente
    // (p.ej. 404 si otro usuario ya eliminó la tarea).
    const eliminadas = new Set<string>();
    await Promise.all(
      tareasAntiguas.map(async (task) => {
        try {
          await eliminarTarea(targetEspacioId, task.id);
          eliminadas.add(task.id);
        } catch (error) {
          console.warn(`No se pudo eliminar la tarea antigua ${task.id}:`, error);
        }
      })
    );

    // Si alguna se eliminó correctamente, actualizar el estado local
    if (eliminadas.size > 0) {
      setTareas((prev) => prev.filter((t) => !eliminadas.has(t.id)));
    }
  };

  // Elimina automáticamente del backend las facturas pagadas que superaron los 20 días de visibilidad
  const limpiarFacturasAntiguas = async (targetEspacioId: string, facturasMapeadas: FacturaModel[]) => {
    const facturasAntiguas = facturasMapeadas.filter(
      (f) => f.Pagado && !f.isCompletedWithinDays(20)
    );

    if (facturasAntiguas.length === 0) return;

    // Eliminar en paralelo, sin bloquear la UI. Los errores se ignoran silenciosamente
    // (p.ej. 404 si otro usuario ya eliminó la factura).
    const eliminadas = new Set<string>();
    await Promise.all(
      facturasAntiguas.map(async (factura) => {
        try {
          await eliminarFactura(targetEspacioId, factura.IdFactura);
          eliminadas.add(factura.IdFactura);
        } catch (error) {
          console.warn(`No se pudo eliminar la factura antigua ${factura.IdFactura}:`, error);
        }
      })
    );

    // Si alguna se eliminó correctamente, actualizar el estado local
    if (eliminadas.size > 0) {
      setFacturas((prev) => prev.filter((f) => !eliminadas.has(f.IdFactura)));
    }
  };

  const cargarTareas = async (showLoading = true) => {
    const currentEspacioId = espacioIdRef.current;
    if (!currentEspacioId) {
      if (!loadingEspacio) {
        setLoadingTareas(false);
        setLoadingFacturas(false);
      }
      return;
    }
    if (showLoading) {
      // Solo mostrar loading si no hay datos previos en caché (refresco silencioso)
      setLoadingTareas(dashboardCache.tareas === null);
    }
    try {
      // Crear (NO esperar) la promesa compartida de nombres de usuario:
      // se lanza en paralelo con las tareas, facturas y karma. Gracias a
      // nombresLoadingRef, cargarFacturas y el bloque de tareas reutilizan
      // esta misma promesa sin duplicar llamadas de red.
      // Esto mantiene el fix del bug "0/0" (las facturas esperan a los nombres
      // antes de mapear deudores) SIN bloquear secuencialmente la carga.
      const nombresPromise =
        Object.keys(userNamesMapRef.current).length === 0
          ? cargarNombresUsuario(currentEspacioId)
          : Promise.resolve(userNamesMapRef.current);

      // Paralelizar carga de tareas, facturas y karma.
      // Cada sección finaliza de forma independiente (no se esperan entre sí).
      await Promise.all([
        cargarFacturas(showLoading, nombresPromise),
        cargarKarma(currentEspacioId),
        (async () => {
          // Obtener tareas y nombres en paralelo: la promesa de nombres ya está
          // en curso (o resuelta), y obtenerTareasPorEspacio se lanza al instante.
          const [currentNamesMap, tareasRaw] = await Promise.all([
            nombresPromise,
            obtenerTareasPorEspacio(currentEspacioId),
          ]);

          if (!Array.isArray(tareasRaw)) return;

          const plantillas = tareasRaw as PlantillaTarea[];

          const mappedTasks = await Promise.all(
            plantillas.map(async (plantilla) => {
              // El backend devuelve la instanciaActiva embebida en cada plantilla
              // (GetAllByEspacioConInstanciaActivaAsync). No hay que hacer N+1.
              let instanciaActiva: any =
                plantilla.instanciaActiva ?? plantilla.InstanciaActiva ?? null;

              const esRepetida =
                (plantilla.diasRepeticion && plantilla.diasRepeticion.length > 0) ||
                (plantilla.DiasRepeticion && plantilla.DiasRepeticion.length > 0);

              const fechaFinFuente =
                plantilla.fechaFin ?? plantilla.fechaLimite ?? plantilla.FechaLimite;

              let fechaLimiteObj: Date;
              if (esRepetida) {
                fechaLimiteObj = fechaFinFuente
                  ? new Date(fechaFinFuente as string | Date)
                  : new Date(3000, 0, 1);
              } else {
                const fechaFuente =
                  plantilla.startDate ??
                  plantilla.fechaFin ??
                  plantilla.fechaLimite ??
                  plantilla.FechaLimite;
                fechaLimiteObj = fechaFuente
                  ? new Date(fechaFuente as string | Date)
                  : new Date();
              }

              const rawTime =
                instanciaActiva?.horaLimite ??
                (instanciaActiva?.HoraLimite as string | null | undefined) ??
                plantilla.HoraLimite ??
                plantilla.horaLimite;
              const cleanTime =
                rawTime && typeof rawTime === "string" && rawTime.length >= 5
                  ? rawTime.substring(0, 5)
                  : "12:00";

              const diasRep =
                plantilla.diasRepeticion || plantilla.DiasRepeticion || [];

              // 1. Resolver el usuarioEspacioId desde la instancia activa
              const activeInstanceUserId: string | null =
                instanciaActiva?.usuarioEspacioId ??
                (instanciaActiva?.UsuarioEspacioId as string | null | undefined) ??
                null;

              const userNameResolved = activeInstanceUserId
                ? (() => {
                    const entry = currentNamesMap[activeInstanceUserId];
                    return entry ? (typeof entry === 'string' ? entry : entry.name) : activeInstanceUserId;
                  })()
                : null;

              const userFotoUrlResolved = activeInstanceUserId
                ? (() => {
                    const entry = currentNamesMap[activeInstanceUserId];
                    return entry && typeof entry !== 'string' ? (entry.fotoUrl ?? null) : null;
                  })()
                : null;

              // 2. Resolver mapa de usuarios por día (tareas repetitivas)
              const resolvedUsuariosPorDia: Record<number, string> = {};
              // Intentar leer desde la instancia si tiene el mapa, o construirlo
              if (activeInstanceUserId && Array.isArray(diasRep) && diasRep.length > 0) {
                // Para tareas repetitivas la instancia tiene diaSemana
                const diaSemana = instanciaActiva?.diaSemana as number | undefined;
                if (typeof diaSemana === "number" && diaSemana >= 0) {
                  resolvedUsuariosPorDia[diaSemana] = userNameResolved || activeInstanceUserId;
                }
              }

              const instanciaId = instanciaActiva?.id ?? instanciaActiva?.Id ?? null;
              const rawState = (instanciaActiva?.estado ?? instanciaActiva?.Estado) as string | null | undefined;
              const completedState =
                rawState === "Completada" ||
                rawState === "Completada Fuera de Plazo" ||
                instanciaActiva?.completada === true ||
                (instanciaActiva?.Completada as boolean | null | undefined) === true;

              const fechaRealizacionRaw =
                instanciaActiva?.fechaRealizacion ??
                (instanciaActiva?.FechaRealizacion as string | Date | null | undefined);

              // Para tareas de repetición, el backend expone fechaEjecutada con la
              // fecha correcta de la semana en curso. Se prefiere sobre fechaRealizacion
              // para usar siempre la fecha real de ejecución de la semana actual,
              // independientemente de cuándo se creó la plantilla.
              const fechaEjecutadaRaw =
                instanciaActiva?.fechaEjecutada ??
                instanciaActiva?.FechaEjecutada ??
                null;

              // fechaCompletada solo tiene sentido si la tarea está completada.
              // Si está completada, se usa la fechaEjecutada (semana en curso) y
              // como fallback fechaRealizacion; si tampoco existe, hoy.
              const fechaCompletada = completedState
                ? (fechaEjecutadaRaw ?? fechaRealizacionRaw)
                  ? new Date((fechaEjecutadaRaw ?? fechaRealizacionRaw) as string | Date)
                  : new Date()
                : null;

              return new TaskModel({
                id: String(plantilla.id),
                Nombre: plantilla.nombre || plantilla.Nombre || "Tarea sin nombre",
                Descripcion: plantilla.descripcion || plantilla.Descripcion,
                karma: Number(plantilla.karma || 0),
                DiasRepeticion: diasRep,
                FechaLimite: fechaLimiteObj,
                HoraLimite: cleanTime,
                isCompleted: completedState,
                estado:
                  rawState ||
                  (instanciaActiva
                    ? completedState
                      ? "Completada"
                      : "Pendiente"
                    : "Pendiente"),
                usuarioAsignado: userNameResolved,
                usuarioAsignadoId: activeInstanceUserId,
                usuarioAsignadoFotoUrl: userFotoUrlResolved,
                tareasId:
                  Array.isArray(plantilla.tareasId) && plantilla.tareasId.length > 0
                    ? plantilla.tareasId
                    : instanciaId
                      ? [String(instanciaId)]
                      : [],
                FechaCompletada: fechaCompletada,
                overdue: ((instanciaActiva?.overdue ?? instanciaActiva?.Overdue) as boolean | undefined) ?? false,
                usuariosPorDia: resolvedUsuariosPorDia,
              });
            })
          );

          setTareas(mappedTasks);

          // Eliminar del backend las tareas completadas que superaron los 7 días de visibilidad
          limpiarTareasAntiguas(currentEspacioId, mappedTasks).catch((error) => {
            console.warn("Error en limpieza de tareas antiguas:", error);
          });
        })(),
      ]);
    } catch (error) {
      // console.error("Error cargando tareas:", error);
    } finally {
      if (showLoading) {
        setLoadingTareas(false);
      }
      setRefreshing(false);
    }
  };

  return {
    user,
    authLoading,
    userName,
    espacioNombre,
    espacioId,
    userRelacionId,
    currentKarma,
    setCurrentKarma,
    loadingKarma,
    loadingEspacio,
    userNamesMap,
    tareas,
    setTareas,
    loadingTareas,
    loadingFacturas,
    refreshing,
    setRefreshing,
    cargarTareas,
    facturas,
    setFacturas,
  };
};