import { useState, useCallback } from "react";
import {
  obtenerUsuarioEspacios,
  obtenerEspacioPorUsuarioId,
} from "../api/usuarioEspacio";
import { obtenerUsuarioPorId } from "../api/usuario";

const useFetchParticipants = () => {
  const [participants, setParticipants] = useState<any[]>([]);

  const fetchParticipants = useCallback(async (espacioId: string) => {
    try {
      const todasRelaciones = await obtenerUsuarioEspacios();
      if (Array.isArray(todasRelaciones)) {
        const relacionesDelEspacio = todasRelaciones.filter(
          (r: any) => r.espacioId === espacioId,
        );

        const usuariosPromesas = relacionesDelEspacio.map(async (r: any) => {
          try {
            const usuario = await obtenerUsuarioPorId(r.usuarioId);
            return usuario;
          } catch (e) {
            // Usuario no existe, lo ignoramos silenciosamente
            return null;
          }
        });

        const usuarios = await Promise.all(usuariosPromesas);
        setParticipants(usuarios.filter((u) => u !== null));
      }
    } catch (e) {
      console.error("Error fetching participants", e);
    }
  }, []);

  return {
    participants,
    fetchParticipants,
  };
};

export default useFetchParticipants;
