import api from "./client";
import { crearUsuarioEspacio, UsuarioEspacioPayload } from "./usuarioEspacio";

// Helper simple para generar UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
    // console.error("Error al crear espacio:", error);
    throw error;
  }
};

// Obtener todos los espacios
export const obtenerEspacios = async () => {
  try {
    const response = await api.get("/Espacio");
    return response.data;
  } catch (error) {
    // console.error("Error al obtener espacios:", error);
    throw error;
  }
};

// Obtener un espacio por ID
export const obtenerEspacioPorId = async (id: string) => {
  try {
    const response = await api.get(`/Espacio/${id}`);
    return response.data;
  } catch (error) {
    // console.error("Error al obtener espacio:", error);
    throw error;
  }
};

// Obtener código de invitación del espacio
export const obtenerCodigoEspacio = async (id: string) => {
  try {
    const response = await api.get(`/Espacio/${id}/getCode`);
    return response.data;
  } catch (error) {
    // console.error("Error al obtener código de espacio:", error);
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
    // console.error("Error al actualizar espacio:", error);
    throw error;
  }
};

// Eliminar un espacio
export const eliminarEspacio = async (id: string) => {
  try {
    const response = await api.delete(`/Espacio/${id}`);
    return response.data;
  } catch (error) {
    // console.error("Error al eliminar espacio:", error);
    throw error;
  }
};

/**
 * Buscar un espacio por su código de invitación
 * @param codigo - Código de invitación (puede incluir guiones)
 * @returns El espacio encontrado o null si no existe
 */
export const buscarEspacioPorCodigo = async (codigo: string): Promise<EspacioResponse | null> => {
  try {
    // Limpiar el código de entrada (solo dígitos)
    const inputCode = codigo.replace(/\D/g, "");
    console.log(`🔍 Buscando espacio con código: ${inputCode}`);

    // Obtener todos los espacios
    const espacios = await obtenerEspacios();
    console.log(`📋 Total de espacios a verificar: ${espacios.length}`);

    // Buscar el espacio que coincida con el código
    for (const espacio of espacios) {
      try {
        console.log(`🔎 Verificando espacio: ${espacio.nombre} (ID: ${espacio.id})`);
        const result = await obtenerCodigoEspacio(espacio.id);

        // Extraer el código del resultado
        let codeStr = "";
        if (typeof result === 'string') {
          codeStr = result;
        } else if (typeof result === 'object' && result !== null) {
          if ('codigo' in result) codeStr = String(result.codigo);
          else if ('code' in result) codeStr = String(result.code);
          else if ('data' in result) codeStr = String(result.data);
          else if ('value' in result) codeStr = String(result.value);
          else if ('token' in result) codeStr = String(result.token);
          else {
            const values = Object.values(result);
            if (values.length === 1 && (typeof values[0] === 'string' || typeof values[0] === 'number')) {
              codeStr = String(values[0]);
            } else {
              codeStr = JSON.stringify(result);
            }
          }
        } else {
          codeStr = String(result);
        }

        // Limpiar el código del backend (solo dígitos)
        const backendCodeClean = codeStr.replace(/\D/g, "");
        console.log(`   Código del espacio: ${backendCodeClean}`);

        if (backendCodeClean === inputCode) {
          console.log(`✅ ¡Espacio encontrado! ${espacio.nombre}`);
          return espacio;
        }
      } catch (err: any) {
        // Si falla obtener el código (404, etc.), continuar con el siguiente
        const is404 = err.message?.includes('404') || err.response?.status === 404;
        if (is404) {
          console.log(`   ⚠️ Espacio ${espacio.id} no tiene código disponible (404), continuando...`);
        } else {
          console.warn(`   ⚠️ Error al obtener código para espacio ${espacio.id}:`, err.message);
        }
        continue;
      }
    }

    // console.error(`❌ No se encontró ningún espacio con el código: ${inputCode}`);
    return null;
  } catch (error) {
    // console.error("Error al buscar espacio por código:", error);
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
    // console.error("Error al crear espacio con usuario:", error);
    throw error;
  }
};

// Interface para estadísticas de tareas
export interface EstadisticasTareas {
  completadas: number;
  pendientes: number;
  tardes: number;
}

// Obtener estadísticas de tareas de un usuario
export const obtenerEstadisticasTareas = async (
  espacioId: string,
  usuarioId: string
): Promise<EstadisticasTareas> => {
  try {
    const response = await api.get(`/espacios/${espacioId}/tareas/estadisticas/${usuarioId}`);
    return response.data;
  } catch (error) {
    // console.error("Error al obtener estadísticas de tareas:", error);
    throw error;
  }
};
