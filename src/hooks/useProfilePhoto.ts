import { useState, useEffect, useCallback } from 'react';
import { obtenerUsuarioPorId, subirFotoUsuario, getFullFotoUrl } from '../api/usuario';

/**
 * Caché a nivel de módulo (compartida entre TODAS las instancias del hook y exportada).
 * Solución al problema de sincronización de Firestore: el backend guarda la fotoUrl
 * correctamente en POST /foto, pero GET /Usuario/{id} sigue devolviendo fotoUrl: null
 * durante un tiempo indefinido. Este caché persiste la URL correcta en memoria.
 */
export const photoCache = new Map<string, string>();

/**
 * Hook that retrieves and updates the user's profile photo URI via the Backend API.
 */
export const useProfilePhoto = (uid: string | undefined) => {
  // Inicializar desde caché si ya existe (evita flash de icono en re-renders)
  const [photoUri, setPhotoUri] = useState<string | null>(() => {
    return uid ? (photoCache.get(uid) ?? null) : null;
  });

  const loadPhoto = useCallback(async (forceOverride = false) => {
    if (!uid) {
      setPhotoUri(null);
      return;
    }
    try {
      const user = await obtenerUsuarioPorId(uid);
      // Usar ?? en vez de || para que null explícito no caiga a FotoUrl (undefined)
      const rawFotoUrl = user?.fotoUrl ?? user?.FotoUrl ?? null;
      const url = getFullFotoUrl(rawFotoUrl);

      if (url !== null) {
        // Backend devuelve una URL válida → actualizar caché y estado
        photoCache.set(uid, url);
        setPhotoUri(url);
      } else if (forceOverride) {
        // Se fuerza borrar la foto (ej. eliminar foto)
        photoCache.delete(uid);
        setPhotoUri(null);
      } else {
        // Backend devuelve null (Firestore aún no ha sincronizado tras el upload)
        // Usar el caché como fallback para no mostrar el icono vacío
        const cached = photoCache.get(uid) ?? null;
        setPhotoUri(cached);
      }
    } catch (e) {
      console.warn('[useProfilePhoto] loadPhoto - Error al cargar foto:', e);
      // En caso de error de red, mantener el caché
      const cached = uid ? (photoCache.get(uid) ?? null) : null;
      setPhotoUri(cached);
    }
  }, [uid]);

  // Load photo from Backend on mount or when uid changes
  useEffect(() => {
    loadPhoto();
  }, [loadPhoto]);

  // Upload a new photo to the Backend and update state
  const savePhoto = useCallback(
    async (uri: string) => {
      if (!uid) return;
      try {
        const updatedUser = await subirFotoUsuario(uid, uri);
        const rawFotoUrl = updatedUser?.fotoUrl ?? updatedUser?.FotoUrl ?? null;
        const url = getFullFotoUrl(rawFotoUrl) ?? uri;

        // Guardar en caché inmediatamente para que cualquier otra instancia
        // del hook (ej. Perfil.tsx) también pueda leerlo
        photoCache.set(uid, url);
        setPhotoUri(url);
        return url;
      } catch (error: any) {
        console.error('[useProfilePhoto] savePhoto - Error:', {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
        });
        throw error;
      }
    },
    [uid]
  );

  // Clear photo state (and cache)
  const removePhoto = useCallback(async () => {
    if (uid) photoCache.delete(uid);
    setPhotoUri(null);
  }, [uid]);

  return { photoUri, savePhoto, removePhoto, reloadPhoto: loadPhoto };
};
