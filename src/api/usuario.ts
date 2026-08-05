import api from "./client";
import { API_CONFIG } from "./configs/apiConfig";
import * as ImageManipulator from "expo-image-manipulator";

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

    // Las URLs antiguas que apuntan al almacenamiento efímero /uploads/perfiles/ en Render ya no existen (404).
    // Se descartan inmediatamente para no causar parpadeos ni peticiones fallidas.
    if (trimmed.includes("/uploads/perfiles/")) {
        return null;
    }

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

// Obtener foto de perfil de usuario como Blob binario (mismo sistema que facturas)
export const obtenerFotoUsuario = async (id: string): Promise<Blob> => {
    try {
        const response = await api.get(`/Usuario/${id}/foto`, {
            responseType: "blob",
        });
        const blob = response.data;
        // Verificar que sea realmente una imagen binaria válida y no un JSON de error
        if (blob && (blob.type?.startsWith("image/") || (blob.type === "" && blob.size > 100))) {
            return blob;
        }
        throw new Error("El archivo devuelto no es una imagen de perfil válida");
    } catch (error) {
        throw error;
    }
};

// Comprime y redimensiona una imagen local y la convierte a Data URL Base64.
// Máximo 600×600 px con calidad JPEG del 70% para mantener el tamaño manejable en Firestore.
export const uriToBase64 = async (uri: string): Promise<string> => {
    if (!uri) return "";
    if (uri.startsWith("data:")) return uri;
    try {
        // 1. Comprimir y redimensionar con expo-image-manipulator
        const manipulated = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 600 } }], // Máx 600px de ancho; alto se ajusta automáticamente
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // 2. Convertir la URI comprimida a Base64
        const response = await fetch(manipulated.uri);
        const blob = await response.blob();
        return await blobToBase64(blob);
    } catch (e) {
        console.warn("[uriToBase64] Error comprimiendo/convirtiendo imagen:", e);
        // Fallback: intentar convertir la URI original sin comprimir
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            return await blobToBase64(blob);
        } catch {
            return uri;
        }
    }
};

// Convierte un Blob a una cadena Data URL Base64 para usar directamente en <Image source={{ uri }} />
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
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