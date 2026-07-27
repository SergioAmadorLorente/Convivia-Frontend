import React, { useEffect, useRef } from "react";
import * as Updates from "expo-updates";
import { useTranslation } from "react-i18next";
import { useToast } from "../hooks/useToast";

const TRANSLATIONS = {
  es: {
    downloading: "La app tiene una nueva actualización, descargando...",
    restarting: "App actualizada, reiniciando app en 5 segundos...",
  },
  en: {
    downloading: "The app has a new update, downloading...",
    restarting: "App updated, restarting app in 5 seconds...",
  },
  fr: {
    downloading: "L'application a une nouvelle mise à jour, téléchargement...",
    restarting: "Application mise à jour, redémarrage de l'application dans 5 secondes...",
  },
  it: {
    downloading: "L'app ha un nuovo aggiornamento, download in corso...",
    restarting: "App aggiornata, riavvio dell'app in 5 secondi...",
  },
  de: {
    downloading: "Die App hat ein neues Update, wird heruntergeladen...",
    restarting: "App aktualisiert, App wird in 5 Sekunden neu gestartet...",
  },
  pt: {
    downloading: "O aplicativo tem uma nova atualização, baixando...",
    restarting: "Aplicativo atualizado, reiniciando o aplicativo em 5 segundos...",
  },
};

type LangKey = keyof typeof TRANSLATIONS;

const getLangKey = (lang?: string): LangKey => {
  if (!lang) return "es";
  const code = lang.toLowerCase().slice(0, 2) as LangKey;
  return TRANSLATIONS[code] ? code : "es";
};

const UpdateChecker: React.FC = () => {
  const { i18n, t } = useTranslation();
  const toast = useToast();
  const checkingRef = useRef(false);

  useEffect(() => {
    async function checkUpdates() {
      // En modo desarrollo (__DEV__) o si expo-updates está desactivado en la build, se ignora
      if (__DEV__ || !Updates.isEnabled) {
        return;
      }

      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          const currentLang = getLangKey(i18n.language);

          // 1. Toast azul descargando
          const downloadingText =
            t("updates.downloading", { defaultValue: "" }) ||
            TRANSLATIONS[currentLang].downloading;

          if (toast && toast.show) {
            toast.show({
              entity: "tarea",
              name: downloadingText,
              tone: "info",
              autoHideMs: 4000,
            });
          }

          // Descargar actualización
          await Updates.fetchUpdateAsync();

          // 2. Toast verde informando del reinicio en 5 segundos
          const restartingText =
            t("updates.restarting", { defaultValue: "" }) ||
            TRANSLATIONS[currentLang].restarting;

          if (toast && toast.show) {
            toast.show({
              entity: "tarea",
              name: restartingText,
              tone: "success",
              autoHideMs: 5000,
            });
          }

          // Esperar 5 segundos y reiniciar la app limpiamente
          setTimeout(async () => {
            try {
              await Updates.reloadAsync();
            } catch (reloadErr) {
              console.error("[UpdateChecker] Error al reiniciar app:", reloadErr);
            }
          }, 5000);
        }
      } catch (error) {
        console.log("[UpdateChecker] Error comprobando actualizaciones:", error);
      } finally {
        checkingRef.current = false;
      }
    }

    checkUpdates();
  }, [i18n.language, t, toast]);

  return null;
};

export default UpdateChecker;
