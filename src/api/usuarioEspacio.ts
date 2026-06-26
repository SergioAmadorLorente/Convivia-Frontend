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
    // console.error("Error al crear UsuarioEspacio:", error);
    throw error;
  }
};

// Obtener todas las relaciones UsuarioEspacio
export const obtenerUsuarioEspacios = async () => {
  try {
    const response = await api.get("/UsuarioEspacio");
    return response.data;
  } catch (error) {
    // console.error("Error al obtener UsuarioEspacios:", error);
    throw error;
  }
};

// Obtener una relación UsuarioEspacio por ID
export const obtenerUsuarioEspacioPorId = async (id: string) => {
  try {
    const response = await api.get(`/UsuarioEspacio/${id}`);
    return response.data;
  } catch (error) {
    // console.error("Error al obtener UsuarioEspacio:", error);
    throw error;
  }
};

// Actualizar una relación UsuarioEspacio (Usa PATCH como indica el backend)
export const actualizarUsuarioEspacio = async (
  id: string,
  data: Partial<UsuarioEspacioPayload>
) => {
  try {
    const response = await api.patch(`/UsuarioEspacio/${id}`, data);
    return response.data;
  } catch (error) {
    // console.error("Error al actualizar UsuarioEspacio:", error);
    throw error;
  }
};

/**
 * Obtener la relación específica entre un usuario y un espacio
 */
export const obtenerRelacionUsuarioEspacio = async (usuarioId: string, espacioId: string) => {
  try {
    const response = await api.get("/UsuarioEspacio");
    const relaciones = Array.isArray(response.data) ? response.data : [];
    return relaciones.find((r: any) => 
      r.usuarioId === usuarioId && r.espacioId === espacioId
    );
  } catch (error) {
    // console.error("Error al obtener relación específica:", error);
    return null;
  }
};

// Eliminar una relación UsuarioEspacio
export const eliminarUsuarioEspacio = async (id: string) => {
  try {
    const response = await api.delete(`/UsuarioEspacio/${id}`);
    return response.data;
  } catch (error) {
    // console.error("Error al eliminar UsuarioEspacio:", error);
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

    let relaciones: any[] = [];

    // Intentar obtener todas las relaciones UsuarioEspacio
    try {
      const response = await api.get("/UsuarioEspacio");
      console.log("📡 Respuesta de UsuarioEspacio:", response.data);

      if (Array.isArray(response.data)) {
        relaciones = response.data;
        console.log("✅ Obtenidas", relaciones.length, "relaciones");
      } else if (response.data && typeof response.data === "object") {
        console.log(
          "⚠️ Respuesta es un objeto, no array. Intentando acceder a propiedades..."
        );
        // A veces la respuesta puede estar dentro de una propiedad
        const data = response.data;
        console.log("Propiedades del objeto:", Object.keys(data));
      }
    } catch (error) {
      console.warn(
        "⚠️ No se pudo obtener UsuarioEspacios, intentando alternativa..."
      );

      // Alternativa: intentar endpoint con filtro por usuario
      try {
        const response = await api.get(`/UsuarioEspacio/usuario/${usuarioId}`);
        console.log("✅ Endpoint alternativo exitoso:", response.data);
        return response.data;
      } catch (altError) {
        console.warn(
          "⚠️ Endpoint alternativo también falló, probando otra opción..."
        );

        // Fallback removed to prevent returning incorrect space
        console.warn("⚠️ No se encontró espacio para el usuario.");
      }
    }

    if (relaciones.length === 0) {
      console.log("⚠️ No se obtuvieron relaciones");
      return null;
    }

    console.log("✅ Relaciones obtenidas:", relaciones.length, "items");

    // Buscar la relación que corresponde al usuario y tiene un ID de espacio válido
    const relacionUsuario = relaciones.find((relacion: any) => {
      console.log("🔎 Comparando:", relacion.usuarioId, "===", usuarioId);
      // Ignorar si el espacioId es "string" (valor por defecto/inválido)
      const esValido = relacion.usuarioId === usuarioId &&
        relacion.espacioId &&
        relacion.espacioId !== "string";
      return esValido;
    });

    if (!relacionUsuario) {
      console.log(
        "⚠️ No se encontró relación válida para el usuario, intentando primera relación como fallback"
      );
      return null;
    }

    console.log("✅ Relación encontrada:", relacionUsuario);

    return relacionUsuario;
  } catch (error) {
    // console.error("❌ Error al obtener espacio por usuario:", error);
    throw error;
  }
};
