import api from "./client";

// Interfaz que refleja la entidad Usuario del backend
export interface UsuarioPayload {
    id?: string;
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
    premium?: boolean;
}

// Crear un nuevo usuario
export const crearUsuario = async (data: UsuarioPayload) => {
    try {
        const response = await api.post("/Usuario", data);
        return response.data;
    } catch (error) {
        // console.error("Error al crear usuario:", error);
        throw error;
    }
};

// Crear un usuario con un ID específico (Sincronización con Firebase)
export const crearUsuarioConId = async (id: string, data: UsuarioPayload) => {
    try {
        console.log("Intentando crear usuario con POST explícito:", id);
        // Usamos POST al endpoint base. Esperamos que el backend acepte el ID en el body.
        const response = await api.post("/Usuario", { ...data, id });
        return response.data;
    } catch (error) {
        // console.error("Error al crear usuario con ID (POST):", error);
        throw error;
    }
};

// Obtener todos los usuarios
export const obtenerUsuarios = async () => {
    try {
        const response = await api.get("/Usuario");
        return response.data;
    } catch (error) {
        // console.error("Error al obtener usuarios:", error);
        throw error;
    }
};

// Obtener un usuario por ID
export const obtenerUsuarioPorId = async (id: string) => {
    try {
        const response = await api.get(`/Usuario/${id}`);
        return response.data;
    } catch (error) {
        // console.error("Error al obtener usuario:", error);
        throw error;
    }
};

// Actualizar un usuario
export const actualizarUsuario = async (id: string, data: Partial<UsuarioPayload>) => {
    try {
        const response = await api.put(`/Usuario/${id}`, data);
        return response.data;
    } catch (error) {
        // console.error("Error al actualizar usuario:", error);
        throw error;
    }
};

// Eliminar un usuario
export const eliminarUsuario = async (id: string) => {
    try {
        const response = await api.delete(`/Usuario/${id}`);
        return response.data;
    } catch (error) {
        // console.error("Error al eliminar usuario:", error);
        throw error;
    }
};