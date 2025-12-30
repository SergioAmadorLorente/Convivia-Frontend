import api from "./client";

export interface TareaPayload {
    nombre: string;
    descripcion?: string;
    fechaCreacion?: string | Date;
    fechaLimite?: string | Date; // OPCIONAL temporalmente debido a bug backend
    horaLimite: string; // Formato HH:mm:ss
    diasRepeticion: number[];
    karma: number;
    usuariosAsignacion?: string[]; // Cambiado de usuarioAsignado a usuariosAsignacion (array)
    espacioId: string;
    estado?: boolean;
    completada?: boolean;
    tareasId?: string[];
}

export const crearTarea = async (data: TareaPayload) => {
    try {
        console.log("📤 Creando plantilla de tarea:", data);
        // Nuevo endpoint: /api/espacios/{espacioId}/tareas
        // Extraemos el espacioId y lo usamos en la URL
        const { espacioId, ...restData } = data as any; 
        
        if (!espacioId) {
            throw new Error("EspacioId es requerido para crear una tarea");
        }

        const response = await api.post(`/espacios/${espacioId}/tareas`, data);
        console.log("✅ Plantilla creada:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Error al crear tarea:", error);
        if (error?.response?.data) {
            console.error("📋 Detalles del error:", JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
};

export const editarTarea = async (id: number, data: TareaPayload) => {
    try {
        const response = await api.put(`/Plantillas/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al editar tarea:", error);
        throw error;
    }
};

export const eliminarTarea = async (id: number) => {
    try {
        const response = await api.delete(`/Plantillas/${id}`);
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
            console.warn("⚠️ Endpoint anidado no encontrado (404). Intentando fallback /Plantillas...");
            try {
                const responseFallback = await api.get("/Plantillas");
                // Filtrar manualmente por espacioId si el backend devuelve todo
                if (Array.isArray(responseFallback.data)) {
                    console.log("✅ Fallback exitoso. Filtrando tareas...");
                    return responseFallback.data.filter((t: any) => t.espacioId === espacioId);
                }
                return responseFallback.data;
            } catch (fallbackError) {
                console.error("❌ Fallback también falló:", fallbackError);
                throw error; // Lanzamos el error original si el fallback falla
            }
        }
        console.error("Error al obtener tareas por espacio:", error);
        throw error;
    }
};

export const obtenerTareas = async () => {
    try {
        // Fallback or generic get
        const response = await api.get("/Plantillas");
        return response.data;
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        throw error;
    }
};
