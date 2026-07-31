import api from "./client";
import { API_CONFIG } from "./configs/apiConfig";

// Interfaz que refleja la entidad Usuario del backend
export interface UsuarioPayload {
    id?: string;
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
    premium?: boolean;
    fotoUrl?: string | null;
    FotoUrl?: string | null;
}

/**
 * Resuelve una URL de foto devuelta por la API.
 * Si es una URL completa (Firebase Storage o externa), la devuelve tal cual.
 * Si es una ruta relativa (/uploads/perfiles/...), le antepone el host del backend.
 */
export const getFullFotoUrl = (fotoUrl?: string | null): string | null => {
    if (!fotoUrl || typeof fotoUrl !== "string") return null;
    const trimmed = fotoUrl.trim();
    if (!trimmed) return null;
    if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("data:") ||
        trimmed.startsWith("file://") ||
        trimmed.startsWith("blob:")
    ) {
        return trimmed;
    }

    const baseUrl = API_CONFIG.BASE_URL.replace(/\/api\/?$/i, "");
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${baseUrl}${cleanPath}`;
};

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

// Actualizar un usuario (usa PATCH para fusionar campos y no sobrescribir FotoUrl en Firestore)
export const actualizarUsuario = async (id: string, data: Partial<UsuarioPayload>) => {
    try {
        const response = await api.patch(`/Usuario/${id}`, data);
        return response.data;
    } catch (error) {
        try {
            const response = await api.put(`/Usuario/${id}/merge`, data);
            return response.data;
        } catch {
            throw error;
        }
    }
};

// Subir foto de perfil de usuario
export const subirFotoUsuario = async (id: string, imageUri: string) => {
    try {
        const formData = new FormData();
        const filename = imageUri.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1].toLowerCase() : "jpg";
        const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

        // En React Native (Android e iOS), se usa el objeto con uri, name y type
        formData.append("file", {
            uri: imageUri,
            name: filename,
            type: mimeType,
        } as any);

        console.log('[subirFotoUsuario] Subiendo foto:', { id, imageUri, filename, mimeType });

        // IMPORTANTE: No incluir Content-Type manual. Axios/fetch lo genera con el
        // multipart boundary correcto automáticamente cuando se envía FormData.
        const response = await api.post(`/Usuario/${id}/foto`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Accept": "application/json",
            },
            timeout: 30000, // 30 segundos para subida de imagen
            transformRequest: (data) => data, // Evita que Axios serialice FormData como JSON
        });

        console.log('[subirFotoUsuario] Respuesta:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('[subirFotoUsuario] Error al subir foto:', {
            message: error?.message,
            status: error?.response?.status,
            data: error?.response?.data,
        });
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