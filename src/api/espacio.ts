import api from "./client";
import { crearUsuarioEspacio, UsuarioEspacioPayload } from "./usuarioEspacio";

// Helper simple para generar UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
export const crearEspacio = async (
  data: EspacioPayload
): Promise<EspacioResponse> => {
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
export const actualizarEspacio = async (
  id: string,
  data: Partial<EspacioPayload>
) => {
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
 * @returns El espacio creado y la relación UsuarioEspacio (si está disponible)
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
    let relacionCreada = null;
    try {
      const usuarioEspacioData: UsuarioEspacioPayload = {
        usuarioId: usuarioId,
        espacioId: espacioCreado.id,
        rol: rol,
        ausente: false,
        karma: 0,
        permisoId: generateUUID(),
        tareasId: [],
        facturasId: []
      };

      relacionCreada = await crearUsuarioEspacio(usuarioEspacioData);
      console.log("✅ Relación UsuarioEspacio creada exitosamente");
    } catch (usuarioEspacioError: any) {
      console.warn(
        "Advertencia: No se pudo crear la relación UsuarioEspacio, pero el espacio se creó exitosamente.",
        usuarioEspacioError?.response?.data || usuarioEspacioError.message
      );
      // Retornar el error para que la UI pueda notificarlo
      return {
        espacio: espacioCreado,
        usuarioEspacio: null,
        joinError: usuarioEspacioError
      };
    }

    return {
      espacio: espacioCreado,
      usuarioEspacio: relacionCreada,
      joinError: null
    };
  } catch (error) {
    console.error("Error al crear espacio con usuario:", error);
    throw error;
  }
};
