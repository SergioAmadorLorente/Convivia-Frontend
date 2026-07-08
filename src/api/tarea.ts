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
    // console.error("❌ Error al crear tarea:", error);
    if (error?.response?.data) {
      /*/ console.error(
        "📋 Detalles del error:",
        JSON.stringify(error.response.data, null, 2),
      );*/
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

    // Normalizar fecha para la plantilla
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

    // 1. PATCH a la PlantillaTarea (el backend regenerará automáticamente las tareas)
    console.log(`📝 [PASO 1] Actualizando PlantillaTarea ${plantillaId}...`);
    const urlPlantilla = `/espacio/${espacioId}/${plantillaId}`;

    const templateData = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      karma: data.karma,
      diasRepeticion: data.diasRepeticion,
      fechaFin: shortDate,
      fechaLimite: shortDate,
      horaLimite: data.horaLimite,
      usuariosAsignacion: data.usuariosAsignacion || [],
    };

    await api.patch(urlPlantilla, templateData);
    console.log(`✅ PlantillaTarea actualizada correctamente`);

    // 2. Si hay usuario asignado e instancias existentes, actualizar la instancia directamente
    // Esto es necesario porque el backend no regenera las instancias pendientes al editar la plantilla
    const nuevoUsuarioRelId: string | null =
      Array.isArray(data.usuariosAsignacion) && data.usuariosAsignacion.length > 0
        ? data.usuariosAsignacion[0]
        : null;

    if (nuevoUsuarioRelId) {
      // Si se pasó instanceId, actualizar esa instancia directamente
      const instanciasAActualizar: string[] = instanceId ? [instanceId] : [];

      // También intentar actualizar cualquier otra instancia que venga en tareasId del response
      if (Array.isArray(data.tareasId)) {
        data.tareasId.forEach((tid: string) => {
          if (!instanciasAActualizar.includes(tid)) instanciasAActualizar.push(tid);
        });
      }

      for (const tid of instanciasAActualizar) {
        try {
          console.log(`📝 [PASO 2] Actualizando instancia ${tid} con usuarioEspacioId=${nuevoUsuarioRelId}...`);
          await api.patch(
            `/espacios/${espacioId}/tareas/${plantillaId}/${tid}`,
            { usuarioEspacioId: nuevoUsuarioRelId },
          );
          console.log(`✅ Instancia ${tid} actualizada con nuevo usuario`);
        } catch (instErr) {
          console.warn(`⚠️ No se pudo actualizar instancia ${tid}:`, instErr);
        }
      }
    }

    console.log("✅ PlantillaTarea actualizada exitosamente");
    return { success: true };
  } catch (error) {
    // console.error("❌ Error al editar tarea:", error);
    throw error;
  }
};


export const eliminarTarea = async (espacioId: string, id: string | number) => {
  try {
    const response = await api.delete(`/espacios/${espacioId}/tareas/${id}`);
    return response.data;
  } catch (error) {
    // console.error("Error al eliminar tarea:", error);
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
    // console.error("Error al obtener tareas por espacio:", error);
    throw error;
  }
};

export const obtenerTareas = async () => {
  try {
    // Fallback or generic get
    const response = await api.get("/Tareas");
    return response.data;
  } catch (error) {
    // console.error("Error al obtener tareas:", error);
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
) => {
  try {
    const url = `/espacios/${espacioId}/tareas/${plantillaId}/${tareaId}/completar`;

    const data = {
      tareaCompletada: completada,
    };

    console.log(
      `📤 Enviando POST a ${url} para marcar como ${completada ? "Completada" : "Pendiente"}. Data:`,
      data,
    );

    const response = await api.post(url, data);
    return response.data;
  } catch (error: any) {
    // console.error("❌ Error al completar instancia de tarea:", error);
    if (error.response?.data) {
      // console.error("Detalles:", JSON.stringify(error.response.data));
    }
    throw error;
  }
};
