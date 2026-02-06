import api from "./client";

export interface TareaPayload {
  nombre: string;
  descripcion?: string;
  fechaCreacion?: string | Date;
  fechaLimite?: string | Date; // camelCase
  FechaLimite?: string | Date; // PascalCase (para compatibilidad Firestore)
  startDate?: string | Date; // Usado por el backend para visualización
  fechaFin?: string; // Usado en edición plantilla
  horaLimite: string; // Formato HH:mm:ss
  diasRepeticion: number[];
  karma: number;
  usuariosAsignacion?: string[];
  espacioId: string;
  estado?: boolean;
  completada?: boolean;
  tareasId?: string[];
}

export const crearTarea = async (data: TareaPayload) => {
  try {
    console.log("📤 Creando plantilla de tarea:", data);
    const { espacioId } = data;

    if (!espacioId) {
      throw new Error("espacioId es requerido para crear una tarea");
    }

    // Normalizar fechas para evitar Error 400 (DateOnly)
    const dateToFormat =
      data.fechaFin || data.fechaLimite || data.FechaLimite || data.startDate;
    let shortDateStr: string | undefined;
    if (dateToFormat) {
      const dateObj = new Date(dateToFormat);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        shortDateStr = `${year}-${month}-${day}`;
      }
    }

    const normalizedPayload = {
      ...data,
      fechaFin: shortDateStr,
      fechaLimite: shortDateStr,
      FechaLimite: shortDateStr,
      startDate: shortDateStr,
    };

    const response = await api.post(
      `/espacios/${espacioId}/tareas`,
      normalizedPayload,
    );
    console.log("✅ Plantilla creada:");
    return response.data;
  } catch (error: any) {
    console.error("❌ Error al crear tarea:", error);
    if (error?.response?.data) {
      console.error(
        "📋 Detalles del error:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    throw error;
  }
};

export const editarTarea = async (
  plantillaId: string,
  data: any,
  instanceId?: string,
) => {
  try {
    const { espacioId } = data;

    if (!espacioId) {
      throw new Error("espacioId es requerido para editar una tarea");
    }

    // 1. Editar la Plantilla (Cuerpo exhaustivo para asegurar persistencia)
    // Endpoint correcto para PATCH plantilla: /api/espacio/{espacioid}/{plantillaId}
    const urlPlantilla = `/espacio/${espacioId}/${plantillaId}`;

    let shortDate: string | undefined;
    let isoDate: string | undefined;

    if (data.fechaFin) {
      try {
        const dateObj = new Date(data.fechaFin);
        if (!isNaN(dateObj.getTime())) {
          isoDate = dateObj.toISOString();
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");
          shortDate = `${year}-${month}-${day}`;
        } else {
          isoDate = data.fechaFin;
          shortDate = data.fechaFin.split("T")[0];
        }
      } catch (e) {
        isoDate = data.fechaFin;
        shortDate = data.fechaFin.split("T")[0];
      }
    }

    const isSingleTask =
      !data.diasRepeticion || data.diasRepeticion.length === 0;

    const templateData = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      karma: data.karma,
      diasRepeticion: data.diasRepeticion,
      fechaFin: shortDate,
      fechaLimite: shortDate, // Clave requerida por el backend
      horaLimite: data.horaLimite,
      // Siempre incluir usuarios asignados en la plantilla para que se mantengan en futuras regeneraciones
      usuariosAsignacion: data.usuariosAsignacion || [],
      regenerar: false, // No regenerar para no perder instancias existentes
    };

    // 2. Gestionar Instancias (Iterar sobre todas si es recurrente, o una si es puntual)
    const hasRepetition =
      Array.isArray(data.diasRepeticion) && data.diasRepeticion.length > 0;

    // 2.1. PRIMERO actualizamos la plantilla
    console.log(`📝 [PATCH Plantilla] URL: ${urlPlantilla}`);
    console.log(`📤 Datos de plantilla:`, templateData);
    await api.patch(urlPlantilla, templateData);
    console.log(`✅ Plantilla actualizada correctamente`);

    if (hasRepetition) {
      // Caso: Tarea Recurrente - Actualizar TODAS las instancias existentes
      try {
        console.log(
          `🔍 Obteniendo instancias de plantilla ${plantillaId} para actualización...`,
        );
        // Endpoint sugerido por usuario: GET /api/espacios/{espacioid}/tareas/filter?plantillaId={id}
        const filterRes = await api.get(
          `/espacios/${espacioId}/tareas/filter`,
          {
            params: { plantillaId: plantillaId },
          },
        );
        const instancias = filterRes.data; // Asumimos array

        if (Array.isArray(instancias) && instancias.length > 0) {
          console.log(
            `🔄 Actualizando ${instancias.length} instancias con nuevos usuarios asignados...`,
          );

          // Crear mapeo de día de semana (0-6) → usuarioEspacioId
          // diasRepeticion y usuariosAsignacion están en el mismo orden
          // IMPORTANTE: usuariosAsignacion ya contiene usuarioEspacioIds (no userIds)
          const dayToUserEspacioIdMap: Record<number, string> = {};
          
          if (Array.isArray(data.diasRepeticion) && Array.isArray(data.usuariosAsignacion)) {
            data.diasRepeticion.forEach((dayNum: number, index: number) => {
              const usuarioEspacioId = data.usuariosAsignacion[index];
              if (usuarioEspacioId) {
                dayToUserEspacioIdMap[dayNum] = usuarioEspacioId;
              }
            });
            console.log('📅 Mapa día→usuarioEspacioId creado:', dayToUserEspacioIdMap);
          }

          // Actualizar cada instancia con el usuarioEspacioId correspondiente a su día
          let updateCount = 0;
          for (const inst of instancias) {
            // Determinar el día de la semana de esta instancia
            let instanceDayOfWeek: number | null = null;
            
            // La instancia debe tener una fecha (fechaLimite, startDate, o FechaLimite)
            const instanceDate = inst.fechaLimite || inst.startDate || inst.FechaLimite;
            
            if (instanceDate) {
              try {
                const dateObj = new Date(instanceDate);
                // getDay() retorna 0=Domingo, 1=Lunes, ..., 6=Sábado
                // Pero nuestro sistema usa 0=Lunes, ..., 6=Domingo
                // Conversión: getDay() -> nuestro sistema
                const jsDay = dateObj.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
                instanceDayOfWeek = jsDay === 0 ? 6 : jsDay - 1; // Convertir: Dom=6, Lun=0, Mar=1, ...
                console.log(`📅 Instancia ${inst.id}: fecha=${instanceDate}, día=${instanceDayOfWeek}`);
              } catch (e) {
                console.warn(`⚠️ Error al parsear fecha de instancia ${inst.id}:`, e);
              }
            }

            const iUrl = `/espacios/${espacioId}/tareas/${plantillaId}/${inst.id}`;
            
            // Payload base
            const updatePayload: any = {
              horaLimite: data.horaLimite,
              karma: data.karma,
              nombre: data.nombre,
              descripcion: data.descripcion,
              // No enviamos fechaLimite/startDate para no aplanar la recurrencia
            };

            // Asignar usuarioEspacioId correspondiente al día de esta instancia
            if (instanceDayOfWeek !== null && dayToUserEspacioIdMap[instanceDayOfWeek]) {
              const usuarioEspacioId = dayToUserEspacioIdMap[instanceDayOfWeek];
              updatePayload.usuarioEspacioId = usuarioEspacioId;
              updatePayload.relacionId = usuarioEspacioId;
              console.log(`👤 Instancia ${inst.id} (día ${instanceDayOfWeek}) → usuarioEspacioId=${usuarioEspacioId}`);
            } else {
              console.log(`ℹ️ Instancia ${inst.id}: no se encontró usuario para día ${instanceDayOfWeek}`);
            }

            try {
              console.log(`📤 Actualizando instancia ${inst.id}...`);
              await api.patch(iUrl, updatePayload);
              updateCount++;
            } catch (errPatch) {
              console.warn(
                `⚠️ Error actualizando instancia ${inst.id}`,
                errPatch,
              );
            }
          }
          console.log(`✅ Se actualizaron ${updateCount} de ${instancias.length} instancias`);
        } else {
          console.log("ℹ️ No se encontraron instancias para actualizar (puede ser normal si es nueva tarea)");
        }
      } catch (errFilter) {
        console.warn(
          "⚠️ Error obteniendo/filtrando instancias de plantilla:",
          errFilter,
        );
      }
    } else {
      // Caso: Tarea Puntual (Single) - Actualizar la instancia única
      if (instanceId) {
        // usuariosAsignacion[0] ya contiene el usuarioEspacioId (no el userId)
        const usuarioEspacioId = data.usuariosAsignacion?.[0];

        const urlInstancia = `/espacios/${espacioId}/tareas/${plantillaId}/${instanceId}`;
        const instanceData: any = {
          horaLimite: data.horaLimite,
          fechaLimite: shortDate,
          FechaLimite: isoDate,
          fechaFin: shortDate,
          startDate: isoDate,
          karma: data.karma,
          nombre: data.nombre,
          descripcion: data.descripcion,
          fechaRealizacion: null,
        };

        // Solo añadir usuario si hay uno asignado
        if (usuarioEspacioId) {
          instanceData.usuarioEspacioId = usuarioEspacioId;
          instanceData.relacionId = usuarioEspacioId;
          console.log(`👤 Tarea puntual: usuarioEspacioId=${usuarioEspacioId}`);
        }

        console.log(`📝 [PATCH Instancia única] URL: ${urlInstancia}`);
        await api.patch(urlInstancia, instanceData);
        console.log(`✅ Instancia única actualizada correctamente`);
      }
    }

    console.log("✅ Tarea e instancia actualizadas exitosamente");
    return { success: true };
  } catch (error) {
    console.error("❌ Error al editar tarea:", error);
    throw error;
  }
};

export const eliminarTarea = async (espacioId: string, id: string | number) => {
  try {
    const response = await api.delete(`/espacios/${espacioId}/tareas/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    throw error;
  }
};

export const obtenerTareasPorEspacio = async (espacioId: string) => {
  try {
    console.log(`Intentando obtener tareas de: /espacios/${espacioId}/tareas`);
    const response = await api.get(`/espacios/${espacioId}/tareas`);
    return response.data;
  } catch (error: any) {
    // Si es 404, intentamos el endpoint antiguo como fallback
    if (error.response && error.response.status === 404) {
      console.warn(
        "⚠️ Endpoint anidado no encontrado (404). Intentando fallback /Tareas...",
      );
      try {
        const responseFallback = await api.get("/Tareas");
        // Filtrar manualmente por espacioId si el backend devuelve todo
        if (Array.isArray(responseFallback.data)) {
          console.log("✅ Fallback exitoso. Filtrando tareas...");
          return responseFallback.data.filter(
            (t: any) => t.espacioId === espacioId,
          );
        }
        return responseFallback.data;
      } catch (fallbackError) {
        console.warn(
          "⚠️ No hay tareas creadas en esta residencia (fallback también falló)",
          fallbackError,
        );
        // Retornar array vacío en lugar de lanzar error cuando no hay tareas
        return [];
      }
    }
    console.error("Error al obtener tareas por espacio:", error);
    throw error;
  }
};

export const obtenerTareas = async () => {
  try {
    // Fallback or generic get
    const response = await api.get("/Tareas");
    return response.data;
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    throw error;
  }
};

export const obtenerDetallePlantilla = async (
  espacioId: string,
  plantillaId: string,
) => {
  try {
    // Intento de obtener detalle de la plantilla (nivel 2)
    // Usamos validateStatus para manejar el 404 manualmente sin disparar el interceptor global
    const response = await api.get(
      `/espacios/${espacioId}/tareas/${plantillaId}`,
      {
        validateStatus: (status) => status < 500,
      },
    );

    if (response.status === 404) {
      console.log(
        `ℹ️ Plantilla ${plantillaId} no encontrada (404). Posiblemente eliminada.`,
      );
      return null;
    }

    console.log(
      `🔍 Detalle Plantilla ${plantillaId}:`,
      JSON.stringify(response.data, null, 2),
    );
    return response.data;
  } catch (error) {
    console.warn(
      `⚠️ Error al obtener detalle de plantilla ${plantillaId}`,
      error,
    );
    return null;
  }
};

export const obtenerDetalleTareaInstancia = async (
  espacioId: string,
  plantillaId: string,
  tareaId: string,
) => {
  try {
    // Intento de obtener detalle de la instancia de tarea (nivel 3)
    // Manejamos 404 manualmente para evitar ruido en consola si la instancia fue borrada
    const response = await api.get(
      `/espacios/${espacioId}/tareas/${plantillaId}/${tareaId}`,
      {
        validateStatus: (status) => status < 500,
      },
    );

    if (response.status === 404) {
      // Esto es común si la instancia fue eliminada (ej. al cambiar a recurrente -> puntual)
      // pero la plantilla aún guarda referencias antiguas.
      return null;
    }

    console.log(
      `🔍 Detalle Instancia Tarea ${tareaId}:`,
      JSON.stringify(response.data, null, 2),
    );
    return response.data;
  } catch (error) {
    console.warn(
      `⚠️ Error al obtener detalle de instancia tarea ${tareaId}`,
      error,
    );
    return null;
  }
};
