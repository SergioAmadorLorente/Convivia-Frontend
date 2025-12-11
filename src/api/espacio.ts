import api from "./client";

export interface EspacioPayload {
    nombre: string;
    direccion: string;
}

export const crearEspacio = async (data: EspacioPayload) => {
    try {
        const response = await api.post("/Espacio", data);
        return response.data;
    } catch (error) {
        console.error("Error al crear espacio:", error);
        throw error;
    }
};
