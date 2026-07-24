import React, { useEffect } from "react";
import * as Updates from "expo-updates";
import { useTranslation } from "react-i18next";
import { useToast } from "../hooks/useToast";

export const UpdateChecker: React.FC = () => {
  const { show: showToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    async function checkUpdates() {
      if (__DEV__) return;

      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          // Toast azul para descargar actualización (tone: "info")
          showToast({
            entity: "tarea",
            name: t("updates.downloading"),
            tone: "info",
            autoHideMs: 4000,
          });

          await Updates.fetchUpdateAsync();

          // Toast verde para reinicio (tone: "success")
          showToast({
            entity: "tarea",
            name: t("updates.restartRequired"),
            tone: "success",
            autoHideMs: 10000,
          });
        }
      } catch (error) {
        console.log("Error al buscar actualizaciones OTA:", error);
      }
    }

    checkUpdates();
  }, [showToast, t]);

  return null;
};

export default UpdateChecker;
