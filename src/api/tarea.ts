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
    const urlPlantilla = `/espacios/${espacioId}/tareas/${plantillaId}`;

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
      // Si es tarea puntual (sin repetición), enviamos array vacío al TEMPLATE para evitar error 500 del backend
      usuariosAsignacion: isSingleTask ? [] : data.usuariosAsignacion,
      regenerar: true,
    };

    // 2. Gestionar Instancias (Iterar sobre todas si es recurrente, o una si es puntual)
    const hasRepetition =
      Array.isArray(data.diasRepeticion) && data.diasRepeticion.length > 0;

    if (hasRepetition) {
      // Caso: Tarea Recurrente
      // 2.1. Eliminamos la instancia puntual "fantasma" si venimos de un cambio Single -> Recurring
      if (instanceId) {
        // Intentamos borrarla por si acaso era la instancia única antigua
        // (Si ya era recurrente, esto podría borrar una instancia válida, pero el backend regenerará
        // nuevas instancias. El usuario pide "editar de una en una", así que quizás
        // deberíamos obtener TODAS y editarlas).
        // NOTA: Si `regenerar: true` funciona, el backend podría haber recreado cosas.
        // Pero el usuario dice explícitamente: "obtener todas... y editarlas de una en una".

        // Primero borramos la 'ghost' si fuera el caso de transición.
        // Asumimos que instanceId refería a la tarea que se clicó.
        // Si era Single, se borra. Si era una de las recurrentes, se borrará y se 'regenerará'
        // o la actualizaremos en el bucle abajo si la API filter la devuelve.
        // Para mayor seguridad en transición:
        try {
          // Solo si creemos que es ghost (transición).
          // Pero como el usuario pide 'editar una en una', vamos a confiar en el bucle de abajo.
        } catch (e) { }
      }

      // 2.2. Obtener todas las instancias de la plantilla
      try {
        console.log(
          `� Obteniendo instancias de plantilla ${plantillaId} para edición masiva...`,
        );
        // Endpoint sugerido por usuario: GET /api/espacios/{espacioid}/tareas/filter?plantillaId={id}
        const filterRes = await api.get(
          `/espacios/${espacioId}/tareas/filter`,
          {
            params: { plantillaId: plantillaId },
          },
        );
        const instancias = filterRes.data; // Asumimos array

        if (Array.isArray(instancias)) {
          console.log(
            `🔄 Actualizando ${instancias.length} instancias manualmente...`,
          );

          // Preparamos payload común para instancias
          // OJO: No sobreescribir fechaLimite específica de la instancia con la fechaFin del template
          let relId = data.usuariosAsignacion?.[0];
          if (relId) {
            try {
              const {
                obtenerEspacioPorUsuarioId,
              } = require("./usuarioEspacio");
              const userRel = await obtenerEspacioPorUsuarioId(relId);
              if (userRel) relId = userRel.id || userRel.id_UsuarioEspacio;
            } catch (e) { }
          }

          for (const inst of instancias) {
            const iUrl = `/espacios/${espacioId}/tareas/${plantillaId}/${inst.id}`;
            // Mantenemos la fecha original de la instancia, solo actualizamos hora y asignación
            const updatePayload = {
              horaLimite: data.horaLimite,
              usuarioEspacioId: relId,
              relacionId: relId,
              karma: data.karma,
              // No enviamos fechaLimite/startDate para no aplanar la recurrencia
            };
            try {
              await api.patch(iUrl, updatePayload);
            } catch (errPatch) {
              console.warn(
                `⚠️ Error actualizando instancia ${inst.id}`,
                errPatch,
              );
            }
          }
        }
      } catch (errFilter) {
        console.warn(
          "⚠️ Error obteniendo/filtrando instancias de plantilla:",
          errFilter,
        );
      }
    } else {
      // Caso: Tarea Puntual (Single)
      if (instanceId) {
        let relId = data.usuariosAsignacion?.[0];
        if (relId) {
          try {
            const { obtenerEspacioPorUsuarioId } = require("./usuarioEspacio");
            const userRel = await obtenerEspacioPorUsuarioId(relId);
            if (userRel) relId = userRel.id || userRel.id_UsuarioEspacio;
          } catch (e) { }
        }

        const urlInstancia = `/espacios/${espacioId}/tareas/${plantillaId}/${instanceId}`;
        const instanceData = {
          horaLimite: data.horaLimite,
          fechaLimite: shortDate,
          FechaLimite: isoDate,
          fechaFin: shortDate,
          startDate: isoDate,
          usuarioEspacioId: relId,
          relacionId: relId,
          fechaRealizacion: null,
        };

        console.log(`📝 [PATCH Instancia única] URL: ${urlInstancia}`);
        await api.patch(urlInstancia, instanceData);
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

/**
 * Cambia el estado de una instancia de tarea a completada o pendiente
 * @param espacioId ID del espacio
 * @param plantillaId ID de la plantilla de tarea
 * @param tareaId ID de la instancia de tarea (tercer nivel)
 * @param completada true para completada, false para pendiente
 */
export const completarTareaInstancia = async (
  espacioId: string,
  plantillaId: string,
  tareaId: string,
  completada: boolean,
  estadoPersonalizado?: string,
) => {
  try {
    const url = `/espacios/${espacioId}/tareas/${plantillaId}/${tareaId}`;

    // 1. Obtener detalles actuales de la instancia para preservar usuario y hora
    let currentDetails: any = {};
    try {
      const responseGet = await api.get(url);
      currentDetails = responseGet.data;
    } catch (e) {
      console.warn("⚠️ No se pudo obtener detalle previo para PATCH completar:", e);
    }

    const data = {
      fechaRealizacion: completada ? new Date().toISOString() : null,
      estado: estadoPersonalizado || (completada ? "Completada" : "Pendiente"),
      usuarioEspacioId: currentDetails.usuarioEspacioId || currentDetails.relacionId || "String", // Fallback por si acaso
      horaLimite: currentDetails.horaLimite || "12:00:00"
    };

    console.log(`📤 Enviando PATCH a ${url} para marcar como ${completada ? 'Completada' : 'Pendiente'}. Data:`, data);

    const response = await api.patch(url, data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error al completar instancia de tarea:", error);
    if (error.response?.data) {
      console.error("Detalles:", JSON.stringify(error.response.data));
    }
    throw error;
  }
};
