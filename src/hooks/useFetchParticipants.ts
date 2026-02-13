import { useState, useCallback } from "react";
import {
  obtenerUsuarioEspacios,
  obtenerEspacioPorUsuarioId,
} from "../api/usuarioEspacio";
import { obtenerUsuarioPorId } from "../api/usuario";
import { obtenerRankingKarma } from "../api/karma";

interface ParticipantWithKarma {
  id: string;
  nombre: string;
  email: string;
  karmaTotal: number;
  karmaMensual: number;
  karmaSemanal: number;
}

const useFetchParticipants = () => {
  const [participants, setParticipants] = useState<ParticipantWithKarma[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchParticipants = useCallback(async (espacioId: string) => {
    try {
      setLoading(true);
      
      // Obtener todas las relaciones usuario-espacio
      const todasRelaciones = await obtenerUsuarioEspacios();
      if (!Array.isArray(todasRelaciones)) {
        setParticipants([]);
        return;
      }

      const relacionesDelEspacio = todasRelaciones.filter(
        (r: any) => r.espacioId === espacioId,
      );

      // Obtener el ranking de karma para tener los puntos de todos
      const ranking = await obtenerRankingKarma(espacioId, "total", 100);
      
      // Crear un mapa de karma por usuarioId
      const karmaMap = new Map(
        ranking.ranking.map((r: any) => [
          r.usuarioId,
          {
            karmaTotal: r.karmaTotal,
            karmaMensual: r.karmaMensual,
            karmaSemanal: r.karmaSemanal,
          },
        ])
      );

      // Obtener los datos de cada usuario
      const usuariosPromesas = relacionesDelEspacio.map(async (r: any) => {
        try {
          const usuario = await obtenerUsuarioPorId(r.usuarioId);
          if (!usuario) return null;
          
          // Combinar datos del usuario con su karma
          const karma = karmaMap.get(r.usuarioId) || {
            karmaTotal: 0,
            karmaMensual: 0,
            karmaSemanal: 0,
          };
          
          return {
            ...usuario,
            ...karma,
          };
        } catch (e) {
          // Usuario no existe, lo ignoramos silenciosamente
          return null;
        }
      });

      const usuarios = await Promise.all(usuariosPromesas);
      const participantesValidos = usuarios.filter((u) => u !== null) as ParticipantWithKarma[];
      
      // Ordenar por karma total (de mayor a menor)
      participantesValidos.sort((a, b) => b.karmaTotal - a.karmaTotal);
      
      setParticipants(participantesValidos);
    } catch (e) {
      console.error("Error fetching participants", e);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    participants,
    loading,
    fetchParticipants,
  };
};

export default useFetchParticipants;
