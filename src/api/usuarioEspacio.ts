import api from "./client";

// Interfaz que refleja la entidad UsuarioEspacio del backend
export interface UsuarioEspacioPayload {
    ausente?: boolean;
    karma?: number;
    rol: string;
    espacioId: string;
    usuarioId: string;
    tareasId?: string[];
    permisoId?: string;
    facturasId?: string[];
}

// Crear un nuevo UsuarioEspacio (relación entre usuario y espacio)
export const crearUsuarioEspacio = async (data: UsuarioEspacioPayload) => {
    try {
        const response = await api.post("/UsuarioEspacio", data);
        return response.data;
    } catch (error) {
        console.error("Error al crear UsuarioEspacio:", error);
        throw error;
    }
};

// Obtener todas las relaciones UsuarioEspacio
export const obtenerUsuarioEspacios = async () => {
    try {
        const response = await api.get("/UsuarioEspacio");
        return response.data;
    } catch (error) {
        console.error("Error al obtener UsuarioEspacios:", error);
        throw error;
    }
};

// Obtener una relación UsuarioEspacio por ID
export const obtenerUsuarioEspacioPorId = async (id: string) => {
    try {
        const response = await api.get(`/UsuarioEspacio/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener UsuarioEspacio:", error);
        throw error;
    }
};

// Actualizar una relación UsuarioEspacio
export const actualizarUsuarioEspacio = async (
    id: string,
    data: Partial<UsuarioEspacioPayload>
) => {
    try {
        const response = await api.put(`/UsuarioEspacio/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al actualizar UsuarioEspacio:", error);
        throw error;
    }
};

// Eliminar una relación UsuarioEspacio
export const eliminarUsuarioEspacio = async (id: string) => {
    try {
        const response = await api.delete(`/UsuarioEspacio/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar UsuarioEspacio:", error);
        throw error;
    }
};

/**
 * Obtener el espacio asociado a un usuario específico
 * @param usuarioId - ID del usuario (Firebase UID)
 * @returns La relación UsuarioEspacio con los datos del espacio incluidos
 */
export const obtenerEspacioPorUsuarioId = async (usuarioId: string) => {
    try {
        console.log("🔍 Buscando espacio para usuario:", usuarioId);

        // Obtener todas las relaciones UsuarioEspacio
        const response = await api.get("/UsuarioEspacio");

        console.log("📡 Respuesta completa:", response);
        console.log("📦 response.data:", response.data);
        console.log("📊 Tipo de response.data:", typeof response.data);
        console.log("🔢 Es array?:", Array.isArray(response.data));

        // Verificar que response.data sea un array
        if (!Array.isArray(response.data)) {
            console.error("❌ response.data NO es un array:", response.data);
            return null;
        }

        const relaciones = response.data;
        console.log("✅ Relaciones obtenidas:", relaciones.length, "items");

        // Buscar la relación que corresponde al usuario
        const relacionUsuario = relaciones.find(
            (relacion: any) => {
                console.log("🔎 Comparando:", relacion.usuarioId, "===", usuarioId);
                return relacion.usuarioId === usuarioId;
            }
        );

        if (!relacionUsuario) {
            console.log("⚠️ No se encontró relación para el usuario");
            return null; // El usuario no tiene espacio asignado
        }

        console.log("✅ Relación encontrada:", relacionUsuario);
        console.log("🏠 Obteniendo espacio con ID:", relacionUsuario.espacioId);

        // Obtener los datos completos del espacio
        const espacioResponse = await api.get(`/Espacio/${relacionUsuario.espacioId}`);

        console.log("🏠 Espacio obtenido:", espacioResponse.data);

        return {
            ...relacionUsuario,
            espacio: espacioResponse.data
        };
    } catch (error) {
        console.error("❌ Error al obtener espacio por usuario:", error);
        throw error;
    }
};