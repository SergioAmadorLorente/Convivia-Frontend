import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import TaskModel from "../../types/Task";
import FacturaModel from "../../types/Factura";

import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from "../../styles/styles";
import { HELPERS, SIZES } from "../../styles/theme";

import BottomBar from "../../components/ui/BottomBar";
import Header from "../../components/ui/Header";
import TabSwitcher from "../../components/ui/TabSwitcher";
import TaskItem from "../../components/ui/TaskItem";
import Desplegable from "../../components/ui/Desplegable";
import TasksFilter from "../../components/ui/TasksFilter";
import Popup from "../../components/ui/Popup";
import Detalle from "../../components/ui/Detalle";
import { useAuthListener } from "../../hooks/useAuthListener";
import { obtenerEspacioPorId, obtenerEspacios } from "../../api/espacio";
import { obtenerEspacioPorUsuarioId } from "../../api/usuarioEspacio";
import { obtenerTareasPorEspacio, obtenerDetallePlantilla, obtenerDetalleTareaInstancia } from "../../api/tarea";

const { hp } = HELPERS;

const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useAuthListener();

  // Identificador del usuario actual (ajústalo a tu auth real)
  const CURRENT_USER_ID = user?.uid || "u2";

  const [userName, setUserName] = useState<string>("Usuario");
  // Priorizar el nombre pasado por parámetro si existe
  const [espacioNombre, setEspacioNombre] = useState<string>(route.params?.newSpaceName || "Mi espacio");
  const [espacioId, setEspacioId] = useState<string | null>(null);
  const [loadingEspacio, setLoadingEspacio] = useState<boolean>(true);

  // Escuchar cambios en los parámetros de navegación (ej: al crear una nueva residencia)
  useEffect(() => {
    if (route.params?.newSpaceName) {
      setEspacioNombre(route.params.newSpaceName);
    }
  }, [route.params?.newSpaceName]);

  // Cargar información del espacio del usuario
  useEffect(() => {
    const cargarEspacio = async () => {
      try {
        if (user?.uid) {
          // Obtener nombre del usuario desde Firebase
          const displayName = user.displayName || user.email?.split("@")[0] || "Usuario";
          setUserName(displayName);

          // Obtener espacio del usuario
          const result = await obtenerEspacioPorUsuarioId(user.uid);

          if (result?.espacioId && result.espacioId !== "string") {
            setEspacioId(result.espacioId);
            // Obtener los datos completos del espacio usando su ID
            try {
              const espacioData = await obtenerEspacioPorId(result.espacioId);
              if (espacioData?.nombre) {
                console.log("✅ Espacio cargado:", espacioData.nombre);
                // Solo actualizar si NO hay un nombre nuevo en los parámetros
                if (!route.params?.newSpaceName) {
                  setEspacioNombre(espacioData.nombre);
                }
              }
            } catch (espacioError) {
              console.warn("⚠️ Espacio asignado no encontrado (404), buscando fallback...");

              // Si ya tenemos un nombre válido por parámetro, no sobreescribir con fallback aleatorio
              if (route.params?.newSpaceName) {
                console.log("✅ Usando nombre de espacio pasado por parámetros:", route.params.newSpaceName);
                return;
              }

              // Fallback: Si falla la obtención del espacio específico, mostramos "Mi espacio"
              setEspacioNombre("Mi espacio");
            }
          } else {
            console.warn("No se encontró espacioId en el resultado");
            setEspacioNombre("Mi espacio");
          }
        }
      } catch (error) {
        console.error("Error al cargar espacio:", error);
        setEspacioNombre("Mi espacio");
      } finally {
        setLoadingEspacio(false);
      }
    };

    cargarEspacio();
  }, [user, route.params?.newSpaceName]);

  const [activeTab, setActiveTab] = useState<"tareas" | "facturas">("tareas");
  const [selectedFilter, setSelectedFilter] = useState<
    "today" | "week" | "all"
  >("today");
  const [visibility, setVisibility] = useState({
    showUnassigned: true,
    showOverdue: true,
    showCompleted: true,
  });

  // -------------------------
  // Datos reales (inicializados vacíos)
  // -------------------------
  const [tareas, setTareas] = useState<TaskModel[]>([]);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Ref para el intervalo de polling
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Función reutilizable para cargar tareas
  const cargarTareas = async (showLoading = true) => {
    if (!espacioId) return;

    if (showLoading) {
      setLoadingTareas(true);
    }

    try {
      console.log("🔄 Cargando tareas para espacio:", espacioId);
      const tareasRaw = await obtenerTareasPorEspacio(espacioId);

      if (Array.isArray(tareasRaw)) {
        console.log("✅ Tareas (plantillas) recibidas:", tareasRaw.length);

        const mappedTasks = tareasRaw.map((t: any) => {
          // BACKEND devuelve 'startDate' en lugar de 'fechaLimite'
          // y NO devuelve hora explícita en la plantilla.
          // Usaremos startDate como fecha límite.

          const fechaFuente = t.startDate || t.fechaLimite || t.FechaLimite;
          const fechaObj = fechaFuente ? new Date(fechaFuente) : new Date();

          // La hora real suele estar en la instancia (tarea hija), no en la plantilla.
          // Intentamos leer de la plantilla por si acaso, o default "12:00".
          // Luego enriqueceremos esto con otra llamada.
          const rawTime = t.HoraLimite ?? t.horaLimite ??
            t.time ?? t.Time ??
            t.hora ?? t.Hora;

          let cleanTime = "12:00";
          if (rawTime && typeof rawTime === 'string' && rawTime.length >= 5) {
            cleanTime = rawTime.substring(0, 5);
          }

          return new TaskModel({
            id: t.id,
            Nombre: t.nombre || t.Nombre,
            Descripcion: t.descripcion || t.Descripcion,
            karma: t.karma,
            DiasRepeticion: t.diasRepeticion || [],

            FechaLimite: fechaObj,
            HoraLimite: cleanTime,

            isCompleted: t.completada || t.Completada || false,
            usuarioAsignado: t.usuariosAsignacion?.[0] || null,
            tareasId: t.tareasId || [] // Guardamos los IDs de instancias
          });
        });

        // 🚀 OPTIMIZACIÓN: Fusión Inteligente (Smart Merge)
        // En lugar de reemplazar todo ciegamente, comparamos con lo que ya tenemos.
        // Si la tarea ya existe y tiene la misma instancia, preservamos los datos enriquecidos (Hora/Fecha)
        // para evitar un fetch innecesario y parpadeos en la UI.

        setTareas(prevTareas => {
          const mergedTasks = mappedTasks.map(newTask => {
            const existing = prevTareas.find(t => t.id === newTask.id);

            if (existing) {
              // Verificar si es la misma instancia de tarea (mismo ID de tarea hija)
              const prevLastInstance = existing.tareasId?.[existing.tareasId.length - 1];
              const newLastInstance = newTask.tareasId?.[newTask.tareasId.length - 1];

              // Si es la misma instancia y ya tenemos datos enriquecidos (no es 12:00 por defecto), 
              // conservamos los datos locales.
              const hasValidLocalTime = existing.HoraLimite !== "12:00";
              const sameInstance = prevLastInstance === newLastInstance;

              if (sameInstance && hasValidLocalTime) {
                return new TaskModel({
                  ...newTask as any, // Propiedades base actualizadas (Nombre, Karma, etc)
                  FechaLimite: existing.FechaLimite, // MANTENER fecha real recuperada
                  HoraLimite: existing.HoraLimite,   // MANTENER hora real recuperada
                });
              }
            }
            return newTask;
          });

          // Identificar qué tareas NECESITAN ser enriquecidas (son nuevas o cambió su instancia)
          // Lo hacemos en un timeout para no bloquear el renderizado del setTareas
          setTimeout(() => {
            const tasksToEnrich = mergedTasks.filter(t => {
              // Necesita update si:
              // 1. Tiene instancias (tareasId > 0)
              // 2. Y (Su hora es la default "12:00" O acabamos de detectar que cambió su instancia)
              // Simplificación: Si su hora es "12:00" y tiene instancias, intentamos enriquecer.
              return t.tareasId && t.tareasId.length > 0 && t.HoraLimite === "12:00";
            });

            if (tasksToEnrich.length > 0) {
              fetchRealTaskTimes(tasksToEnrich, espacioId);
            }
          }, 100);

          return mergedTasks;
        });
      }
    } catch (error) {
      console.error("Error cargando tareas:", error);
    } finally {
      if (showLoading) {
        setLoadingTareas(false);
      }
      setRefreshing(false);
    }
  };

  // Handler para pull-to-refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    cargarTareas(false);
  }, [espacioId]);

  // Cargar tareas al enfocar la pantalla
  useFocusEffect(
    React.useCallback(() => {
      // Cargar tareas una vez al entrar o volver a la pantalla
      cargarTareas();

      return () => {
        // Cleanup si fuera necesario
      };
    }, [espacioId])
  );

  // Función para enriquecer tareas con detalles de instancias (Horas reales)
  const fetchRealTaskTimes = async (currentTasks: TaskModel[], eId: string) => {
    // Solo procesamos tareas que tienen instancias
    const candidates = currentTasks.filter(t => t.tareasId && t.tareasId.length > 0);

    if (candidates.length === 0) return;

    console.log(`🕒 Buscando horas reales para ${candidates.length} tareas...`);

    // Hacemos las peticiones en paralelo
    const updates = await Promise.all(candidates.map(async (task) => {
      try {
        // Tomamos la última instancia (asumiendo que es la más relevante/reciente)
        const lastInstanceId = task.tareasId[task.tareasId.length - 1];
        const detail = await obtenerDetalleTareaInstancia(eId, task.id, lastInstanceId);

        const result: any = { id: task.id };
        let hasUpdate = false;

        // 1. Buscamos HORA
        const timeFound = detail?.horaLimite || detail?.HoraLimite || detail?.hora;
        if (timeFound && typeof timeFound === 'string' && timeFound.length >= 5) {
          result.realTime = timeFound.substring(0, 5);
          hasUpdate = true;
        }

        // 2. Buscamos FECHA LIMITE
        const dateFound = detail?.fechaLimite || detail?.FechaLimite;
        if (dateFound) {
          result.realDate = new Date(dateFound);
          hasUpdate = true;
        }

        if (hasUpdate) return result;

      } catch (e) {
        console.warn(`Falló al obtener detalles para tarea ${task.Nombre}`, e);
      }
      return null;
    }));

    // Filtramos actualizaciones válidas
    const validUpdates = updates.filter(u => u !== null) as { id: string, realTime?: string, realDate?: Date }[];

    if (validUpdates.length > 0) {
      console.log(`✅ Actualizando detalles (hora/fecha) de ${validUpdates.length} tareas.`);
      setTareas(prevTareas => prevTareas.map(t => {
        const update = validUpdates.find(u => u.id === t.id);
        if (update) {
          // Return new updated instance
          return new TaskModel({
            id: t.id,
            Nombre: t.Nombre,
            Descripcion: t.Descripcion,
            karma: t.karma,
            DiasRepeticion: t.DiasRepeticion,
            // Usamos la fecha real de la instancia si existe, si no la que ya tenía
            FechaLimite: update.realDate || t.FechaLimite,
            // Usamos la hora real de la instancia si existe, si no la que ya tenía
            HoraLimite: update.realTime || t.HoraLimite,
            isCompleted: t.isCompleted,
            FechaCompletada: t.FechaCompletada,
            usuarioAsignado: t.usuarioAsignado,
            tareasId: t.tareasId
          });
        }
        return t;
      }));
    }
  };

  const [facturas, setFacturas] = useState<FacturaModel[]>([
    new FacturaModel({
      IdFactura: "f1",
      Nombre: "Electricidad",
      Precio: 120,
      UsuariosAsignados: [
        { id: "u1", name: "Juan", completed: true },
        { id: "u2", name: "María", completed: false },
        { id: "u3", name: "Pedro", completed: true },
      ],
      Pagado: false,
      FechaCreacion: new Date(),
      Descripcion: "Factura mensual",
    }),
    new FacturaModel({
      IdFactura: "f2",
      Nombre: "Internet",
      Precio: 45,
      UsuariosAsignados: [
        { id: "u1", name: "Juan", completed: true },
        { id: "u2", name: "María", completed: true },
      ],
      Pagado: true,
      FechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      FechaCompletada: new Date(Date.now() - 24 * 60 * 60 * 1000),
      Descripcion: "Fibra 300Mb",
    }),
  ]);
  // -------------------------

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // -------------------------
  // Popup helper
  // -------------------------
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});
  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };
  const handleClosePopup = () => setPopupVisible(false);

  // -------------------------
  // Detalle (tarea/factura)
  // -------------------------
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskModel | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<FacturaModel | null>(
    null
  );

  const openDetalleTarea = (task: TaskModel) => {
    setSelectedTask(task);
    setSelectedFactura(null);
    setDetalleVisible(true);
  };
  const openDetalleFactura = (factura: FacturaModel) => {
    setSelectedFactura(factura);
    setSelectedTask(null);
    setDetalleVisible(true);
  };
  const closeDetalle = () => {
    setDetalleVisible(false);
    setSelectedTask(null);
    setSelectedFactura(null);
  };

  // -------------------------
  // Normalizadores para EDITAR (CreateTask / CreateFactura)
  // -------------------------
  const normalizeTaskForEdit = (t: TaskModel) => ({
    id: t.id,
    name: t.Nombre ?? "",
    description: t.Descripcion ?? "",
    time: t.HoraLimite ?? "12:00",
    repeatDays: Array.isArray(t.DiasRepeticion) ? t.DiasRepeticion : [],
    karma: typeof t.karma === "number" ? t.karma : 0,
    assignedUsers: t.usuarioAsignado
      ? [{ id: t.usuarioAsignado, name: t.usuarioAsignado }]
      : [],
  });

  const normalizeFacturaForEdit = (f: FacturaModel) => ({
    IdFactura: f.IdFactura,
    Nombre: f.Nombre ?? "",
    Descripcion: f.Descripcion ?? "",
    Precio: typeof f.Precio === "number" ? f.Precio : 0,
    UsuariosAsignados: Array.isArray(f.UsuariosAsignados)
      ? f.UsuariosAsignados
      : [],
    Pagado: !!f.Pagado,
    FechaCreacion: f.FechaCreacion,
    FechaCompletada: f.FechaCompletada ?? null,
  });

  // -------------------------
  // Actualizadores tras guardar
  // -------------------------
  const updateTaskInState = (updated: {
    id: string;
    name: string;
    description: string;
    time: string;
    repeatDays: number[];
    karma: number;
    assignedUsers: { id: string; name: string }[];
  }) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? new TaskModel({
            id: updated.id,
            Nombre: updated.name,
            Descripcion: updated.description,
            HoraLimite: updated.time,
            DiasRepeticion: updated.repeatDays ?? [],
            karma: updated.karma,
            FechaLimite: t.FechaLimite,
            isCompleted: t.isCompleted,
            FechaCompletada: t.FechaCompletada ?? null,
            usuarioAsignado:
              updated.assignedUsers?.[0]?.name ?? t.usuarioAsignado ?? null,
          })
          : t
      )
    );
  };

  const updateFacturaInState = (
    updated: Partial<ReturnType<FacturaModel["toProps"]>> & {
      IdFactura: string;
    }
  ) => {
    setFacturas((prev) =>
      prev.map((f) =>
        f.IdFactura === updated.IdFactura
          ? new FacturaModel({
            ...f.toProps(),
            ...updated,
          })
          : f
      )
    );
  };

  // -------------------------
  // Toggle (tarea/factura)
  // -------------------------
  const handleToggleTask = (id: string) => {
    if (activeTab === "tareas") {
      // ---------- TAREAS ----------
      const task = tareas.find((t) => t.id === id);
      if (!task) return;

      const due = new Date(task.FechaLimite);
      const dueStart = new Date(
        due.getFullYear(),
        due.getMonth(),
        due.getDate()
      );
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const wasOverdue = dueStart.getTime() < todayStart.getTime();

      // Bloquear completar si no está asignada
      if (!task.isCompleted && !task.usuarioAsignado) {
        showPopup({
          imageType: "error",
          title: "Para completar una tarea debe estar asignada",
          description:
            "Ve al detalle de la tarea y asígnala a un usuario para poder marcarla como completada.",
          buttons: [
            { text: "Cancelar", onPress: () => { } },
            { text: "Ir al detalle", onPress: () => openDetalleTarea(task) },
          ],
        });
        return;
      }

      // Desmarcar -> confirmar
      if (task.isCompleted) {
        showPopup({
          imageType: "goback",
          title: "¿Estás seguro de que quieres marcar la tarea como pendiente?",
          description:
            "Perderás los puntos de Karma obtenidos con esta tarea. Podrás recuperarlos al completarla de nuevo.",
          buttons: [
            { text: "Cancelar", onPress: () => { } },
            {
              text: "Aceptar",
              onPress: () => {
                setTareas((prev) =>
                  prev.map((t) => (t.id === id ? t.toggleComplete() : t))
                );
              },
            },
          ],
        });
        return;
      }

      // Completar -> popups
      if (!task.isCompleted) {
        if (wasOverdue) {
          showPopup({
            imageType: "happy",
            title: "¡Casi lo logras!",
            description:
              "La próxima vez, intenta completar la tarea dentro del plazo.\n\nHas ganado 0 puntos de Karma.",
            buttons: [{ text: "Aceptar", onPress: () => { } }],
          });
        } else {
          showPopup({
            imageType: "happy",
            title: "¡Felicidades!",
            description: `Has completado una tarea. Has ganado ${task.karma} puntos de Karma.`,
            buttons: [{ text: "Aceptar", onPress: () => { } }],
          });
        }

        setTareas((prev) =>
          prev.map((t) => (t.id === id ? t.toggleComplete() : t))
        );
      }
    } else {

      // ---------- FACTURAS ----------
      const factura = facturas.find((f) => f.IdFactura === id);
      if (!factura) return;

      // Desmarcar (Pagado -> pendiente): confirmar
      if (factura.Pagado) {
        showPopup({
          imageType: "goback",
          title: "¿Estás seguro de que quieres marcar la factura como pendiente?",
          buttons: [
            { text: "Cancelar", onPress: () => { } },
            {
              text: "Aceptar",
              onPress: () => {
                setFacturas((prev) =>
                  prev.map((f) => (f.IdFactura === id ? f.togglePaid() : f))
                );
              },
            },
          ],
        });
        return;
      }

      // 👉 Nueva lógica: permitir que el usuario actual marque su parte y, si con ello
      // quedan todos completos, completar factura.

      // 1) Buscar usuario actual en la factura
      const usuarios = Array.isArray(factura.UsuariosAsignados)
        ? factura.UsuariosAsignados
        : [];
      const yo = usuarios.find((u) => u.id === CURRENT_USER_ID);

      // 2) Si no estás asignado a esta factura, no puedes marcar
      if (!yo) {
        showPopup({
          imageType: "error",
          title: "No estás asignado a esta factura",
          description: "Solo los usuarios asignados pueden marcar su parte como pagada.",
          buttons: [{ text: "Aceptar", onPress: () => { } }],
        });
        return;
      }

      // 3) Si tu parte no estaba completada, complétala primero en el modelo
      let facturaActualizada = factura;
      if (!yo.completed) {
        facturaActualizada = facturaActualizada.withUserCompleted(CURRENT_USER_ID, true);

        // Persistir actualización en estado
        setFacturas((prev) =>
          prev.map((f) => (f.IdFactura === id ? facturaActualizada : f))
        );
      }

      // 4) Re-evaluar si ahora todos han completado su parte
      if (!facturaActualizada.canMarkPaid()) {
        // Todavía falta alguien -> popup informativo (no marcamos Pagado aún)
        const restantes = (facturaActualizada.UsuariosAsignados ?? []).filter((u) => !u.completed);
        const nombresRestantes = restantes.map((u) => u.name).join(", ");
        showPopup({
          imageType: "success", // puedes usar "error" si prefieres
          title: "Has marcado tu parte como pagada",
          description: restantes.length > 0 ? `Faltan por pagar: ${nombresRestantes}.` : undefined,
          buttons: [{ text: "Aceptar", onPress: () => { } }],
        });
        return;
      }

      // 5) ✅ Todos completos -> marcar como Pagada + popup happy
      showPopup({
        imageType: "happy",
        title: "Has gestionado correctamente una factura. ¡Así se hace!",
        buttons: [{ text: "Aceptar", onPress: () => { } }],
      });

      setFacturas((prev) =>
        prev.map((f) => (f.IdFactura === id ? f.togglePaid() : f))
      );
    }
  };

  // -------------------------
  // Navegación a editar (desde Detalle)
  // -------------------------
  const handleEditTask = (task: TaskModel) => {
    const normalized = normalizeTaskForEdit(task);
    navigation.navigate("CreateTask", {
      taskToEdit: normalized,
      onSave: (updatedTaskData: any) => {
        updateTaskInState(updatedTaskData);
      },
    });
    closeDetalle();
  };

  const handleEditFactura = (factura: FacturaModel) => {
    const normalized = normalizeFacturaForEdit(factura);
    navigation.navigate("CreateFactura", {
      facturaToEdit: normalized,
      onSave: (updatedFacturaData: any) => {
        updateFacturaInState(updatedFacturaData);
      },
    });
    closeDetalle();
  };

  // -------------------------
  // Listas y filtros
  // -------------------------
  const currentItems = activeTab === "tareas" ? tareas : facturas;

  const isDone = (i: any) => {
    if (typeof i.isCompleted === "boolean") return i.isCompleted;
    if (typeof i.Pagado === "boolean") return i.Pagado;
    return false;
  };

  let pendingItems: any[] = [];
  let completedItems: any[] = [];
  let overdueItems: any[] = [];
  let unassignedPendingItems: any[] = [];
  let unassignedOverdueItems: any[] = [];

  if (activeTab === "tareas") {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const isOverdue = (it: TaskModel) => {
      const d = new Date(it.FechaLimite);
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return dStart.getTime() < todayStart.getTime();
    };

    const allPending = (currentItems as TaskModel[]).filter((i) => !isDone(i));
    const assignedPending = allPending.filter((i) => i.usuarioAsignado);
    const allUnassignedPending = allPending.filter((i) => !i.usuarioAsignado);

    overdueItems = assignedPending.filter(isOverdue);
    const onTimePending = assignedPending.filter((i) => !isOverdue(i));

    pendingItems = onTimePending.filter((item) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "today") return item.isDueToday();
      if (selectedFilter === "week") return item.isDueWithinDays(7);
      return true;
    });

    if (visibility.showUnassigned) {
      const unassignedOnTime = allUnassignedPending.filter(
        (i) => !isOverdue(i)
      );
      const unassignedOverdue = allUnassignedPending.filter(isOverdue);

      unassignedPendingItems = unassignedOnTime.filter((item) => {
        if (selectedFilter === "all") return true;
        if (selectedFilter === "today") return item.isDueToday();
        if (selectedFilter === "week") return item.isDueWithinDays(7);
        return true;
      });

      unassignedOverdueItems = unassignedOverdue;

      pendingItems = [...pendingItems, ...unassignedPendingItems];
      overdueItems = [...overdueItems, ...unassignedOverdueItems];
    }

    completedItems = (currentItems as TaskModel[]).filter((i) => {
      return (
        isDone(i) &&
        (typeof (i as any).isCompletedWithinDays === "function"
          ? (i as any).isCompletedWithinDays(7)
          : true)
      );
    });
  } else {
    // FACTURAS: pendientes vs pagadas
    pendingItems = currentItems.filter((i: any) => !isDone(i));
    completedItems = currentItems.filter((i: any) => isDone(i));
  }

  // -------------------------
  // Helpers para facturas
  // -------------------------
  const fmtEUR = (n: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(n || 0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <Header
        username={`@${userName.split(" ")[0].toLowerCase()}`}
        date={new Date()}
        location={espacioNombre}
      />

      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        contentContainerStyle={[
          GLOBAL_STYLES.scrollContainer2,
          { paddingBottom: hp("15%") },
          Platform.OS === "web" ? WEB_FULL_VIEWPORT : {},
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8B5CF6"]} // Color morado para Android
            tintColor="#8B5CF6" // Color morado para iOS
          />
        }
      >
        {/* Filtro solo para tareas */}
        {activeTab === "tareas" && (
          <View
            style={[
              GLOBAL_STYLES.fullWidth,
              { marginTop: 10, marginBottom: 15 },
            ]}
          >
            <TasksFilter
              onFilterChange={setSelectedFilter}
              onVisibilityChange={setVisibility}
            />
          </View>
        )}

        <View style={GLOBAL_STYLES.container}>
          {/* PENDIENTES */}
          {pendingItems.length > 0 && (
            <Desplegable
              title="Pendientes"
              fontSize={SIZES.text16}
              fontWeight="bold"
              defaultOpen={true}
            >
              {pendingItems.map((item: any) => {
                if (activeTab === "tareas") {
                  const task = item as TaskModel;
                  return (
                    <TaskItem
                      key={task.id}
                      variant="tarea"
                      time={
                        typeof (task as any).formattedTime === "function"
                          ? task.formattedTime()
                          : undefined
                      }
                      fechaLimite={
                        task.FechaLimite
                          ? new Date(task.FechaLimite).toLocaleDateString(
                            "es-ES",
                            { day: "2-digit", month: "2-digit" }
                          )
                          : undefined
                      }
                      title={task.Nombre}
                      isCompleted={task.isCompleted}
                      unassigned={!task.usuarioAsignado}
                      onToggle={() => handleToggleTask(task.id)}
                      onPressRow={() => openDetalleTarea(task)}
                    />
                  );
                } else {
                  const f = item as FacturaModel;
                  const perStr = fmtEUR(f.perPersonPrice());
                  return (
                    <TaskItem
                      key={f.IdFactura}
                      variant="factura"
                      dateLabel={f.formattedDate("es-ES")}
                      perPersonPrice={perStr}
                      title={f.Nombre}
                      isCompleted={f.Pagado}
                      paidCount={f.paidUsersCount()}
                      totalAssigned={f.totalUsersCount()}
                      onToggle={() => handleToggleTask(f.IdFactura)}
                      onPressRow={() => openDetalleFactura(f)}
                    />
                  );
                }
              })}
            </Desplegable>
          )}

          {/* FUERA DE PLAZO (solo tareas) */}
          {activeTab === "tareas" &&
            visibility.showOverdue &&
            overdueItems.length > 0 && (
              <Desplegable
                title="Fuera de plazo"
                fontSize={SIZES.text16}
                fontWeight="bold"
                defaultOpen={true}
              >
                {overdueItems.map((task: TaskModel) => (
                  <TaskItem
                    key={task.id}
                    variant="tarea"
                    time={
                      typeof (task as any).formattedTime === "function"
                        ? task.formattedTime()
                        : undefined
                    }
                    fechaLimite={
                      task.FechaLimite
                        ? new Date(task.FechaLimite).toLocaleDateString(
                          "es-ES",
                          { day: "2-digit", month: "2-digit" }
                        )
                        : undefined
                    }
                    title={task.Nombre}
                    isCompleted={task.isCompleted}
                    unassigned={!task.usuarioAsignado}
                    onToggle={() => handleToggleTask(task.id)}
                    onPressRow={() => openDetalleTarea(task)}
                  />
                ))}
              </Desplegable>
            )}

          {/* COMPLETADAS / PAGADAS */}
          {visibility.showCompleted && completedItems.length > 0 && (
            <Desplegable
              title={activeTab === "tareas" ? "Completadas" : "Pagadas"}
              fontSize={SIZES.text16}
              fontWeight="bold"
              defaultOpen={true}
            >
              {completedItems.map((item: any) => {
                if (activeTab === "tareas") {
                  const task = item as TaskModel;
                  return (
                    <TaskItem
                      key={task.id}
                      variant="tarea"
                      time={
                        typeof (task as any).formattedTime === "function"
                          ? task.formattedTime()
                          : undefined
                      }
                      fechaLimite={
                        task.FechaLimite
                          ? new Date(task.FechaLimite).toLocaleDateString(
                            "es-ES",
                            { day: "2-digit", month: "2-digit" }
                          )
                          : undefined
                      }
                      title={task.Nombre}
                      isCompleted={task.isCompleted}
                      unassigned={!task.usuarioAsignado}
                      onToggle={() => handleToggleTask(task.id)}
                      onPressRow={() => openDetalleTarea(task)}
                    />
                  );
                } else {
                  const f = item as FacturaModel;
                  const perStr = fmtEUR(f.perPersonPrice());
                  return (
                    <TaskItem
                      key={f.IdFactura}
                      variant="factura"
                      dateLabel={f.formattedDate("es-ES")}
                      perPersonPrice={perStr}
                      title={f.Nombre}
                      isCompleted={f.Pagado}
                      paidCount={f.paidUsersCount()}
                      totalAssigned={f.totalUsersCount()}
                      onToggle={() => handleToggleTask(f.IdFactura)}
                      onPressRow={() => openDetalleFactura(f)}
                    />
                  );
                }
              })}
            </Desplegable>
          )}
        </View>
      </ScrollView>

      {/* Popup global */}
      <Popup
        visible={popupVisible}
        onClose={handleClosePopup}
        title={popupOptions.title || ""}
        description={popupOptions.description}
        imageType={popupOptions.imageType}
        buttons={
          popupOptions.buttons ?? [{ text: "Aceptar", onPress: () => { } }]
        }
        code={popupOptions.code}
      />

      {/* Detalle unificado */}
      {selectedTask && (
        <Detalle
          visible={detalleVisible}
          kind="tarea"
          task={selectedTask}
          onClose={closeDetalle}
          onComplete={() => {
            handleToggleTask(selectedTask.id);
            closeDetalle(); // cierra tras completar
          }}
          onEdit={() => handleEditTask(selectedTask)}
        />
      )}

      {selectedFactura && (
        <Detalle
          visible={detalleVisible}
          kind="factura"
          factura={selectedFactura}
          onClose={closeDetalle}
          onComplete={() => {
            handleToggleTask(selectedFactura.IdFactura);
            closeDetalle(); // cierra tras completar
          }}
          onEdit={() => handleEditFactura(selectedFactura)}
        />
      )}

      <BottomBar />
    </KeyboardAvoidingView>
  );
};

export default DashBoardPersonal;
