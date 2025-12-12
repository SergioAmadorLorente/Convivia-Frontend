import api from "./client";

export interface TareaPayload {
    Usuario: string;
    fechaInicio: Date;
    fechaFin: Date;
    foto: string;
    prorroga: boolean;
    estado: boolean;
}

export const crearTarea = async (data: TareaPayload) => {
    try {
        const response = await api.post("/Tarea", data);
        return response.data;
    } catch (error) {
        console.error("Error al crear tarea:", error);
        throw error;
    }
};

export const obtenerTareas = async () => {
    try {
        const response = await api.get("/Tarea");
        return response.data;
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        throw error;
    }
};

export const editarTarea = async (id: number, data: TareaPayload) => {
    try {
        const response = await api.put(`/Tarea/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al editar tarea:", error);
        throw error;
    }
};

export const eliminarTarea = async (id: number) => {
    try {
        const response = await api.delete(`/Tarea/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar tarea:", error);
        throw error;
    }
};
