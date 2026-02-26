import api from "./client";

// Interfaces para las respuestas del backend
export interface KarmaUsuario {
  karmaTotal: number;
  karmaSemanal: number;
  karmaMensual: number;
}

export interface UsuarioRanking {
  usuarioId: string;
  karmaTotal: number;
  karmaSemanal: number;
  karmaMensual: number;
  posicion: number;
}

export interface RankingResponse {
  espacioId: string;
  tipoKarma: "total" | "semanal" | "mensual";
  totalUsuarios: number;
  ranking: UsuarioRanking[];
}

// Obtener karma de un usuario específico
export const obtenerKarmaUsuario = async (
  espacioId: string,
  usuarioId: string
): Promise<KarmaUsuario> => {
  try {
    const response = await api.get(`/espacio/${espacioId}/Karma/${usuarioId}`);
    return response.data;
  } catch (error) {
    // console.error("Error al obtener karma del usuario:", error);
    throw error;
  }
};

// Obtener ranking de karma del espacio
export const obtenerRankingKarma = async (
  espacioId: string,
  tipoKarma: "total" | "semanal" | "mensual" = "total",
  top?: number
): Promise<RankingResponse> => {
  try {
    const params: any = { tipoKarma };
    if (top) {
      params.top = top;
    }
    
    const response = await api.get(`/espacio/${espacioId}/karma/ranking`, {
      params,
    });
    return response.data;
  } catch (error) {
    // console.error("Error al obtener ranking de karma:", error);
    throw error;
  }
};
