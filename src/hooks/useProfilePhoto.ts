import { useState, useEffect, useCallback } from 'react';
import { obtenerUsuarioPorId, subirFotoUsuario, getFullFotoUrl, uriToBase64 } from '../api/usuario';

/**
 * Caché a nivel de módulo (compartida entre TODAS las instancias del hook y exportada).
 * Persiste la imagen Base64 o URL resuelta en memoria.
 */
export const photoCache = new Map<string, string>();

/**
 * Hook que obtiene y actualiza la foto de perfil del usuario mediante la API del Backend.
 */
export const useProfilePhoto = (uid: string | undefined) => {
  const [photoUri, setPhotoUri] = useState<string | null>(() => {
    return uid ? (photoCache.get(uid) ?? null) : null;
  });

  // Indica si la foto de perfil se está cargando (descarga desde el backend).
  // Inicialmente true si no hay foto en caché (se va a cargar).
  const [photoLoading, setPhotoLoading] = useState<boolean>(() => {
    return uid ? !photoCache.has(uid) : false;
  });

  const loadPhoto = useCallback(async (forceOverride = false) => {
    if (!uid) {
      setPhotoUri(null);
      setPhotoLoading(false);
      return;
    }
    try {
      // 1. Si ya existe en memoria y no se fuerza recarga, usar caché
      const cached = photoCache.get(uid);
      if (cached && !forceOverride) {
        setPhotoUri(cached);
        setPhotoLoading(false);
        return;
      }

      setPhotoLoading(true);

      // 2. Obtener datos del usuario desde la BD
      const user = await obtenerUsuarioPorId(uid);
      const rawFotoUrl = user?.fotoUrl ?? user?.FotoUrl ?? null;
      const url = getFullFotoUrl(rawFotoUrl);

      if (url) {
        photoCache.set(uid, url);
        setPhotoUri(url);
      } else {
        photoCache.delete(uid);
        setPhotoUri(null);
      }
    } catch (e) {
      const cached = uid ? (photoCache.get(uid) ?? null) : null;
      setPhotoUri(cached);
    } finally {
      setPhotoLoading(false);
    }
  }, [uid]);

  // Cargar foto al montar o cuando cambie uid
  useEffect(() => {
    loadPhoto();
  }, [loadPhoto]);

  // Subir / guardar nueva foto de perfil
  const savePhoto = useCallback(
    async (uri: string) => {
      if (!uid) return;
      try {
        // Convertir la imagen a Data URI Base64 autónoma
        const base64Url = await uriToBase64(uri);

        // Guardar inmediatamente en caché local
        photoCache.set(uid, base64Url);
        setPhotoUri(base64Url);

        // Subir al backend en segundo plano (si falla no bloquea la foto local)
        try {
          await subirFotoUsuario(uid, uri);
        } catch (uploadError) {
          console.warn('[useProfilePhoto] Error al subir foto al endpoint multipart:', uploadError);
        }

        return base64Url;
      } catch (error: any) {
        console.error('[useProfilePhoto] savePhoto - Error:', error);
        throw error;
      }
    },
    [uid]
  );

  // Eliminar foto de perfil
  const removePhoto = useCallback(async () => {
    if (uid) photoCache.delete(uid);
    setPhotoUri(null);
  }, [uid]);

  return { photoUri, photoLoading, savePhoto, removePhoto, reloadPhoto: loadPhoto };
};
