import api from "./client";

export interface TareaPayload {
    nombre: string;
    descripcion?: string;
    fechaCreacion?: string | Date;
    fechaLimite?: string | Date; // camelCase
    FechaLimite?: string | Date; // PascalCase (para compatibilidad Firestore)
    startDate?: string | Date;   // Usado por el backend para visualización
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
        const dateToFormat = data.fechaFin || data.fechaLimite || data.FechaLimite || data.startDate;
        let shortDateStr: string | undefined;
        if (dateToFormat) {
            const dateObj = new Date(dateToFormat);
            if (!isNaN(dateObj.getTime())) {
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                shortDateStr = `${year}-${month}-${day}`;
            }
        }

        const normalizedPayload = {
            ...data,
            fechaFin: shortDateStr,
            fechaLimite: shortDateStr,
            FechaLimite: shortDateStr,
            startDate: shortDateStr
        };

        const response = await api.post(`/espacios/${espacioId}/tareas`, normalizedPayload);
        console.log("✅ Plantilla creada:");
        return response.data;
    } catch (error: any) {
        console.error("❌ Error al crear tarea:", error);
        if (error?.response?.data) {
            console.error("📋 Detalles del error:", JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
};

export const editarTarea = async (plantillaId: string, data: any, instanceId?: string) => {
    try {
        const { espacioId } = data;
        
        if (!espacioId) {
            throw new Error("espacioId es requerido para editar una tarea");
        }

        // 1. Editar la Plantilla (Cuerpo exhaustivo para asegurar persistencia)
        const urlPlantillaSingular = `/espacio/${espacioId}/${plantillaId}`;
        const urlPlantillaDirecta = `/Plantillas/${plantillaId}`;

        let shortDate: string | undefined;
        let isoDate: string | undefined;

        if (data.fechaFin) {
            try {
                const dateObj = new Date(data.fechaFin);
                if (!isNaN(dateObj.getTime())) {
                    isoDate = dateObj.toISOString();
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    shortDate = `${year}-${month}-${day}`; 
                } else {
                    isoDate = data.fechaFin;
                    shortDate = data.fechaFin.split('T')[0];
                }
            } catch (e) {
                isoDate = data.fechaFin;
                shortDate = data.fechaFin.split('T')[0];
            }
        }
        
        const templateData = {
            nombre: data.nombre,
            descripcion: data.descripcion,
            karma: data.karma,
            diasRepeticion: data.diasRepeticion,
            fechaFin: shortDate, 
            fechaLimite: shortDate, // Clave requerida por el backend
            horaLimite: data.horaLimite,
            usuariosAsignacion: data.usuariosAsignacion,
            regenerar: true // Forzar regeneración de instancias
        };

        console.log(`📝 [PATCH Plantilla] Intentando: ${urlPlantillaSingular}`);
        console.log(`📤 Payload Plantilla:`, JSON.stringify(templateData, null, 2));
        const payloadPlantilla = templateData; // Enviar directamente sin wrapper dto
        try {
            await api.patch(urlPlantillaSingular, payloadPlantilla);
        } catch (e) {
            console.warn("⚠️ Falló PATCH singular, probando directo...");
            try { await api.patch(urlPlantillaDirecta, payloadPlantilla); } catch (e2) {}
        }

        // 2. Editar la Instancia (si existe)
        if (instanceId) {
            let relId = data.usuariosAsignacion?.[0]; 
            if (relId) {
                try {
                    const { obtenerEspacioPorUsuarioId } = require("./usuarioEspacio");
                    const userRel = await obtenerEspacioPorUsuarioId(relId);
                    if (userRel) relId = userRel.id || userRel.id_UsuarioEspacio;
                } catch (e) {}
            }

            const urlInstancia = `/espacios/${espacioId}/tareas/${plantillaId}/${instanceId}`;
            const instanceData = {
                horaLimite: data.horaLimite,
                fechaLimite: shortDate,
                FechaLimite: isoDate,      // Redundancia ISO para la instancia
                fechaFin: shortDate,
                startDate: isoDate,
                usuarioEspacioId: relId,
                relacionId: relId,
                fechaRealizacion: null
            };
            
            console.log(`📝 [PATCH Instancia] URL: ${urlInstancia}`);
            console.log(`📤 Payload Instancia:`, JSON.stringify(instanceData, null, 2));
            await api.patch(urlInstancia, instanceData); // Enviar sin wrapper dto
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

export const obtenerDetallePlantilla = async (espacioId: string, plantillaId: string) => {
    try {
        // Intento de obtener detalle de la plantilla (nivel 2)
        const response = await api.get(`/espacios/${espacioId}/tareas/${plantillaId}`);
        console.log(`🔍 Detalle Plantilla ${plantillaId}:`, JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.warn(`⚠️ No se pudo obtener detalle de plantilla ${plantillaId}`, error);
        return null;
    }
}

export const obtenerDetalleTareaInstancia = async (espacioId: string, plantillaId: string, tareaId: string) => {
    try {
        // Intento de obtener detalle de la instancia de tarea (nivel 3)
        const response = await api.get(`/espacios/${espacioId}/tareas/${plantillaId}/${tareaId}`);
        console.log(`🔍 Detalle Instancia Tarea ${tareaId}:`, JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.warn(`⚠️ No se pudo obtener detalle de instancia tarea ${tareaId}`, error);
        return null;
    }
}
