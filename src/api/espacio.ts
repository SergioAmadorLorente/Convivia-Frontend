import api from "./client";
import { crearUsuarioEspacio, UsuarioEspacioPayload } from "./usuarioEspacio";

export interface EspacioPayload {
    nombre: string;
    direccion: string;
}

export interface EspacioResponse {
    id: string;
    nombre: string;
    direccion: string;
}

// Crear un nuevo espacio
export const crearEspacio = async (data: EspacioPayload): Promise<EspacioResponse> => {
    try {
        const response = await api.post("/Espacio", data);
        return response.data;
    } catch (error) {
        console.error("Error al crear espacio:", error);
        throw error;
    }
};

// Obtener todos los espacios
export const obtenerEspacios = async () => {
    try {
        const response = await api.get("/Espacio");
        return response.data;
    } catch (error) {
        console.error("Error al obtener espacios:", error);
        throw error;
    }
};

// Obtener un espacio por ID
export const obtenerEspacioPorId = async (id: string) => {
    try {
        const response = await api.get(`/Espacio/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener espacio:", error);
        throw error;
    }
};

// Actualizar un espacio
export const actualizarEspacio = async (id: string, data: Partial<EspacioPayload>) => {
    try {
        const response = await api.put(`/Espacio/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar espacio:", error);
        throw error;
    }
};

// Eliminar un espacio
export const eliminarEspacio = async (id: string) => {
    try {
        const response = await api.delete(`/Espacio/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar espacio:", error);
        throw error;
    }
};

/**
 * Crea un nuevo espacio y automáticamente establece la relación con el usuario creador
 * @param espacioData - Datos del espacio (nombre, dirección)
 * @param usuarioId - ID del usuario que crea el espacio
 * @param rol - Rol del usuario en el espacio (por defecto "admin")
 * @returns El espacio creado y la relación UsuarioEspacio
 */
export const crearEspacioConUsuario = async (
    espacioData: EspacioPayload,
    usuarioId: string,
    rol: string = "admin"
) => {
    try {
        // 1. Crear el espacio
        const espacioCreado = await crearEspacio(espacioData);

        // 2. Crear la relación UsuarioEspacio
        const usuarioEspacioData: UsuarioEspacioPayload = {
            usuarioId: usuarioId,
            espacioId: espacioCreado.id,
            rol: rol,
            ausente: false,
            karma: 0,
        };

        const relacionCreada = await crearUsuarioEspacio(usuarioEspacioData);

        return {
            espacio: espacioCreado,
            usuarioEspacio: relacionCreada,
        };
    } catch (error) {
        console.error("Error al crear espacio con usuario:", error);
        throw error;
    }
};
