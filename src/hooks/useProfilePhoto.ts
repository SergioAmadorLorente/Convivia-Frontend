import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PHOTO_KEY_PREFIX = 'profile_photo_';

/**
 * Hook that persists and retrieves the user's profile photo URI in AsyncStorage.
 * The photo is stored locally per user UID, no backend required.
 */
export const useProfilePhoto = (uid: string | undefined) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const storageKey = uid ? `${PHOTO_KEY_PREFIX}${uid}` : null;

  // Load photo from AsyncStorage on mount or when uid changes
  useEffect(() => {
    if (!storageKey) return;
    AsyncStorage.getItem(storageKey)
      .then((uri) => {
        if (uri) setPhotoUri(uri);
      })
      .catch(() => {
        // Silently ignore read errors
      });
  }, [storageKey]);

  // Save a new photo URI to AsyncStorage and update state
  const savePhoto = useCallback(
    async (uri: string) => {
      if (!storageKey) return;
      try {
        await AsyncStorage.setItem(storageKey, uri);
        setPhotoUri(uri);
      } catch {
        // Silently ignore write errors
      }
    },
    [storageKey]
  );

  // Remove the photo from AsyncStorage
  const removePhoto = useCallback(async () => {
    if (!storageKey) return;
    try {
      await AsyncStorage.removeItem(storageKey);
      setPhotoUri(null);
    } catch {
      // Silently ignore errors
    }
  }, [storageKey]);

  return { photoUri, savePhoto, removePhoto };
};
