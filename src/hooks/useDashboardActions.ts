import { Alert } from "react-native";
import { completarTareaInstancia, eliminarTarea } from "../api/tarea";
import { editarFactura, eliminarFactura } from "../api/factura";
import { actualizarUsuarioEspacio } from "../api/usuarioEspacio";
import TaskModel from "../types/Task";
import FacturaModel from "../types/Factura";
import { ShowOptions, Tone } from "../components/ui/ToastProvider";
import { useToast } from "../hooks/useToast";
import { useTranslation } from 'react-i18next';

const cleanId = (id: string) => id?.replace(/-/g, "").toLowerCase() || "";


interface ActionsProps {
  espacioId: string | null;
  userRelacionId: string | null;
  currentKarma: number;
  setCurrentKarma: (k: number) => void;
  tareas: TaskModel[];
  setTareas: React.Dispatch<React.SetStateAction<TaskModel[]>>;
  facturas: FacturaModel[];
  setFacturas: React.Dispatch<React.SetStateAction<FacturaModel[]>>;
  showPopup: (opts: any) => void;
  showToast?: (opts: ShowOptions) => string;
  closeDetalle: () => void;
  CURRENT_USER_ID: string;
  activeTab: string;
  openDetalleTarea: (t: TaskModel) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
  onTaskCompletedOnTime?: (coords: { x: number; y: number }, karmaAmount: number) => void;
}

const checkIfTaskIsOverdue = (task: TaskModel): boolean => {
  // 1. Estado explícito que contiene fuera de plazo / overdue
  const estadoStr = (task.estado || "").toLowerCase();
  if (
    estadoStr.includes("fuera") ||
    estadoStr.includes("plazo") ||
    estadoStr.includes("overdue") ||
    estadoStr.includes("late")
  ) {
    return true;
  }

  // 2. Bandera overdue activa
  if (task.overdue) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 3. Comparar fecha límite con hoy (si no es fecha dummy de repetición año 3000)
  if (task.FechaLimite) {
    const due = new Date(task.FechaLimite);
    if (due.getFullYear() < 2900) {
      const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      if (dueDay.getTime() < today.getTime()) {
        return true;
      }
      if (dueDay.getTime() === today.getTime() && task.HoraLimite) {
        const [h, m] = task.HoraLimite.split(":").map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          const now = new Date();
          if (now.getHours() > h || (now.getHours() === h && now.getMinutes() > m)) {
            return true;
          }
        }
      }
    }
  }

  // 4. Si la tarea ya estaba completada, comprobar si FechaCompletada fue posterior a FechaLimite
  if (task.isCompleted && task.FechaCompletada && task.FechaLimite) {
    const limit = new Date(task.FechaLimite);
    if (limit.getFullYear() < 2900) {
      const completed = new Date(task.FechaCompletada);
      if (task.HoraLimite) {
        const [h, m] = task.HoraLimite.split(":").map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          limit.setHours(h, m, 0, 0);
        } else {
          limit.setHours(23, 59, 59, 999);
        }
      } else {
        limit.setHours(23, 59, 59, 999);
      }
      if (completed.getTime() > limit.getTime()) {
        return true;
      }
    }
  }

  return false;
};

export const useDashboardActions = ({
  espacioId,
  userRelacionId,
  currentKarma,
  setCurrentKarma,
  tareas,
  setTareas,
  facturas,
  setFacturas,
  showPopup,
  showToast,
  t,
  closeDetalle,
  CURRENT_USER_ID,
  activeTab,
  openDetalleTarea,
  onTaskCompletedOnTime,
}: ActionsProps) => {
  const handleToggleTask = async (id: string, coords?: { pageX?: number; pageY?: number }): Promise<boolean> => {
    if (activeTab === "tareas") {
      const task = tareas.find((t) => t.id === id);
      if (!task) return false;

      const wasOverdue = checkIfTaskIsOverdue(task);

      if (!task.isCompleted) {
        if (!task.usuarioAsignado) {
          showPopup({
            imageType: "error",
            title: "Para completar una tarea debe estar asignada",
            description: "Ve al detalle de la tarea y asígnala a un usuario.",
            buttons: [
              { text: "Cancelar" },
              { text: "Ir al detalle", onPress: () => openDetalleTarea(task) },
            ],
          });
          return false;
        }

        // Bloquear si no está asignada al usuario actual
        const cleanAssignedId = cleanId(task.usuarioAsignadoId || "");
        const cleanUserRelId = cleanId(userRelacionId || "");
        const cleanFirebaseUid = cleanId(CURRENT_USER_ID || "");

        const isAssignedToMe =
          cleanAssignedId === cleanUserRelId ||
          cleanAssignedId === cleanFirebaseUid;

        if (!isAssignedToMe) {
          showPopup({
            imageType: "error",
            title: t("createTask.popups.notAssignedToMe.title"),
            description: t("createTask.popups.notAssignedToMe.description")
              .replace("{{name}}", task.usuarioAsignado || t("createTask.popups.notAssignedToMe.otherUser")),
            buttons: [{ text: t("common.accept") }],
          });
          return false;
        }
      }

      if (task.isCompleted) {
        showPopup({
          imageType: "goback",
          title: t("createTask.popups.successUnMarked.title"),
          description: t("createTask.popups.successUnMarked.description"),
          buttons: [
            { text: t("common.cancel") },
            {
              text: t("common.accept"),
              onPress: async () => {
                try {
                  if (espacioId && task.tareasId && task.tareasId.length > 0) {
                    console.log("Revertir tarea a Pendiente...");
                    await completarTareaInstancia(
                      espacioId,
                      task.id,
                      task.tareasId[task.tareasId.length - 1],
                      false,
                    );
                  }
                   if (userRelacionId) {
                     const isTaskOverdue = checkIfTaskIsOverdue(task);
                     const nuevoKarma = isTaskOverdue
                       ? currentKarma + (task.karma || 0) // Fuera de plazo → devolver karma (SUMAR)
                       : Math.max(0, currentKarma - (task.karma || 0)); // A tiempo → restar karma
                     setCurrentKarma(nuevoKarma);
                   }
                  setTareas((prev) =>
                    prev.map((t) => (t.id === id ? t.toggleComplete() : t)),
                  );
                  showToast?.({
                    entity: "tarea",
                    name: t("createTask.popups.taskReactivated"),
                    tone: "info",
                    autoHideMs: 3000,
                  });
                } catch (error) {
                  Alert.alert("Error", "No se pudo actualizar la tarea.");
                }
              },
            },
          ],
        });
        return true;
      }

      // Completar (Optimista)
      const oldTareas = tareas;
      const oldKarma = currentKarma;

      setTareas((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const toggled = t.toggleComplete();
          // Si era vencida, marcamos el estado para que el uncheck sepa que hubo penalización
          if (wasOverdue) {
            toggled.estado = "Completada Fuera de Plazo";
          }
          return toggled;
        }),
      );

if (userRelacionId) {
  if (!wasOverdue) {
    // A tiempo → suma
    const nuevoKarma = currentKarma + (task.karma || 0);
    if ((task.karma || 0) > 0 && onTaskCompletedOnTime) {
      const startX = coords?.pageX ?? 180;
      const startY = coords?.pageY ?? 400;
      onTaskCompletedOnTime({ x: startX, y: startY }, task.karma || 0);
    }
    setCurrentKarma(nuevoKarma);
  } else {
    // Fuera de plazo → resta el karma de la tarea
    const nuevoKarma = Math.max(0, currentKarma - (task.karma || 0));
    if ((task.karma || 0) > 0 && onTaskCompletedOnTime) {
      const startX = coords?.pageX ?? 180;
      const startY = coords?.pageY ?? 400;
      // Pasamos karma negativo para indicar que se resta
      onTaskCompletedOnTime({ x: startX, y: startY }, -(task.karma || 0));
    }
    setCurrentKarma(nuevoKarma);
  }
}

      if (showToast) {
        showToast({
          entity: "tarea",
          name: wasOverdue
            ? t("taskCompletion.toastOverdueKarmaDeducted", { karma: task.karma })
            : t("taskCompletion.toastOnTime", { karma: task.karma }),
          tone: (wasOverdue ? "warning" : "success") as Tone,
          autoHideMs: 3000,
        });
      } else {
        showPopup({
          imageType: "happy",
          title: wasOverdue ? t("taskCompletion.popupOverdueTitle") : t("taskCompletion.popupOnTimeTitle"),
          description: wasOverdue
            ? t("taskCompletion.popupOverdueDesc")
            : t("taskCompletion.popupOnTimeDesc", { karma: task.karma }),
          buttons: [{ text: t("common.accept") }],
        });
      }

      if (espacioId && task.tareasId && task.tareasId.length > 0) {
        completarTareaInstancia(
          espacioId,
          task.id,
          task.tareasId[task.tareasId.length - 1],
          true,
        ).catch((error) => {
          console.error("[Karma] Error al completar instancia de tarea (revertiendo):", error);
          setTareas(oldTareas);
          setCurrentKarma(oldKarma);
          Alert.alert("Error", "No se pudo completar la tarea en el servidor.");
        });
      }
      return true;
    } else {
      // FACTURAS
      const factura = facturas.find((f) => f.IdFactura === id);
      if (!factura) return false;

      const yo = factura.UsuariosAsignados?.find(
        (u) => cleanId(u.id) === cleanId(CURRENT_USER_ID || ""),
      );
      if (!yo) {
        showPopup({
          imageType: "error",
          title: t("dashboard.invoices.notAssigned"),
          buttons: [{ text: t("common.accept") }],
        });
        return false;
      }

      if (yo.completed) {
        // DESMARCAR PAGO
        showPopup({
          imageType: "goback",
          title: t("dashboard.invoices.unmarkPaymentTitle"),
          description: t("dashboard.invoices.unmarkPaymentDescription"),
          buttons: [
            { text: t("common.cancel") },
            {
              text: t("common.accept"),
              onPress: async () => {
                const desmarcada = factura!.withUserCompleted(yo!.id, false);
                setFacturas((prev) =>
                  prev.map((f) => (f.IdFactura === id ? desmarcada : f)),
                );

                if (espacioId) {
                  try {
                    await editarFactura(espacioId, id, {
                      nombre: desmarcada.Nombre,
                      precio: desmarcada.Precio,
                      pagoMediano: desmarcada.perPersonPrice(),
                      pagado: desmarcada.Pagado,
                      creadorFactura:
                        desmarcada.creadorFactura || CURRENT_USER_ID,
                      deudores: Object.fromEntries(
                        desmarcada.UsuariosAsignados.map((u) => [
                          u.id,
                          !u.completed,
                        ]),
                      ),
                      fechaCompletada: desmarcada.FechaCompletada
                        ? desmarcada.FechaCompletada.toISOString()
                        : null,
                    });
                  } catch (e) {
                    // console.error("Error actualizando factura:", e);
                    Alert.alert(
                      t("common.error"),
                      t("dashboard.invoices.updatePaymentError"),
                    );
                    return;
                  }

                  if (showToast) {
                    showToast({
                      entity: "factura",
                      name: t("dashboard.invoices.unmarkPaymentToast"),
                      tone: "info",
                      autoHideMs: 3000,
                    });
                  }
                }
              },
            },
          ],
        });
      } else {
        // MARCAR COMO PAGADO
        showPopup({
          imageType: "success",
          title: t("dashboard.invoices.confirmPaymentTitle"),
          description: t("dashboard.invoices.confirmPaymentDescription"),
          buttons: [
            { text: t("common.cancel") },
            {
              text: t("common.accept"),
              onPress: async () => {
                const marcada = factura!.withUserCompleted(yo!.id, true);
                setFacturas((prev) =>
                  prev.map((f) => (f.IdFactura === id ? marcada : f)),
                );

                if (espacioId) {
                  try {
                    await editarFactura(espacioId, id, {
                      nombre: marcada.Nombre,
                      precio: marcada.Precio,
                      pagoMediano: marcada.perPersonPrice(),
                      pagado: marcada.Pagado,
                      creadorFactura: marcada.creadorFactura || CURRENT_USER_ID,
                      deudores: Object.fromEntries(
                        marcada.UsuariosAsignados.map((u) => [
                          u.id,
                          !u.completed,
                        ]),
                      ),
                      fechaCompletada: marcada.FechaCompletada
                        ? marcada.FechaCompletada.toISOString()
                        : null,
                    });
                  } catch (e) {
                    // console.error("Error actualizando factura:", e);
                    Alert.alert(
                      t("common.error"),
                      t("dashboard.invoices.updatePaymentError"),
                    );
                    return;
                  }
                }

                if (marcada.Pagado) {
                  if (showToast) {
                    showToast({
                      entity: "factura",
                      name: t("dashboard.invoices.invoiceCompletedToast")
                        .replace("{{name}}", marcada.Nombre || t("dashboard.invoices.fallbackInvoiceWord")),
                      tone: "success",
                      autoHideMs: 3000,
                    });
                  } else {
                    showPopup({
                      imageType: "happy",
                      title: t("dashboard.invoices.invoiceCompletedTitle"),
                      description: t("dashboard.invoices.invoiceCompletedDescription"),
                      buttons: [{ text: t("common.accept") }],
                    });
                  }
                } else {
                  const restantes = marcada.UsuariosAsignados.filter(
                    (u) => !u.completed,
                  );
                  if (showToast) {
                    showToast({
                      entity: "factura",
                      name: restantes.length > 0
                        ? t("dashboard.invoices.partPaidRemainingToast")
                          .replace("{{names}}", restantes.map((u) => u.name).join(", "))
                        : t("dashboard.invoices.partPaidToast")
                          .replace("{{name}}", marcada.Nombre || t("dashboard.invoices.fallbackInvoiceName")),
                      tone: "success",
                      autoHideMs: 3500,
                    });
                  } else {
                    showPopup({
                      imageType: "success",
                      title: t("dashboard.invoices.partPaidTitle"),
                      description:
                        restantes.length > 0
                          ? t("dashboard.invoices.partPaidRemaining").replace("{{names}}", restantes.map((u) => u.name).join(", "))
                          : undefined,
                      buttons: [{ text: t("common.accept") }],
                    });
                  }
                }
              },
            },
          ],
        });
      }
      return true;
    }
    return false;
  };

// Restrict deletion of overdue tasks to admins
const handleDeleteTask = async (id: string | number, isAdmin: boolean, isOverdue: boolean) => {
    if (!espacioId) return;

    // Check if the user is allowed to delete overdue tasks
    if (isOverdue && !isAdmin) {
        showToast?.({
            entity: "tarea",
            name: t("createTask.popups.notAuthorized"),
            tone: "error",
            autoHideMs: 3000,
        });
        return;
    }

    showPopup({
        imageType: "goback",
        title: t("createTask.popups.successTaskDeleted.deleteTaskQuestion"),
        buttons: [
            { text: t("common.cancel") },
            {
                text: t("common.delete"),
                onPress: async () => {
                    try {
                        await eliminarTarea(espacioId, id);
                        setTareas((prev) => prev.filter((t) => t.id !== id.toString()));
                        closeDetalle();

                        showToast?.({
                            entity: "tarea",
                            name: t("createTask.popups.successTaskDeleted.title"),
                            tone: "success",
                            autoHideMs: 3000,
                        });

                    } catch (error) {
                        Alert.alert("Error", "No se pudo eliminar.");
                    }
                },
            },
        ],
    });
};

  const handleDeleteFactura = async (id: string) => {
    if (!espacioId) return;
    showPopup({
      imageType: "goback",
      title: t("dashboard.invoices.deleteQuestion") || "¿Deseas eliminar esta factura?",
      buttons: [
        { text: t("common.cancel") },
        {
          text: t("common.delete"),
          onPress: async () => {
            try {
              await eliminarFactura(espacioId, id);
              setFacturas((prev) => prev.filter((f) => f.IdFactura !== id));
              closeDetalle();

              showToast?.({
                entity: "factura",
                name: t("dashboard.invoices.deletedSuccess") || "Factura eliminada correctamente",
                tone: "success",
                autoHideMs: 3000,
              });
            } catch (error) {
              Alert.alert(t("common.error") || "Error", "No se pudo eliminar la factura.");
            }
          },
        },
      ],
    });
  };

  return { handleToggleTask, handleDeleteTask, handleDeleteFactura };
};

/**
 * Hook separado para manejar toggle rápido de facturas sin popups
 * (solo actualiza estado local, sin confirmaciones)
 */
export const useQuickToggleFactura = (
  facturas: FacturaModel[],
  setFacturas: React.Dispatch<React.SetStateAction<FacturaModel[]>>,
  userRelacionId: string | null,
  espacioId?: string | null,
  CURRENT_USER_ID?: string,
) => {
  const handleQuickToggleFactura = async (facturaId: string) => {
    const factura = facturas.find((f) => f.IdFactura === facturaId);
    if (!factura || !userRelacionId) return;

    const yo = factura.UsuariosAsignados?.find((u) => {
      const cleanU = u.id.replace(/-/g, "").toLowerCase();
      const cleanRelId = userRelacionId.replace(/-/g, "").toLowerCase();
      return cleanU === cleanRelId;
    });
    if (!yo) return;

    // Toggle del estado completed del usuario actual
    const facturaActualizada = factura.withUserCompleted(yo.id, !yo.completed);
    setFacturas((prev) =>
      prev.map((f) => (f.IdFactura === facturaId ? facturaActualizada : f)),
    );

    // Actualizar en el servidor
    if (espacioId) {
      try {
        await editarFactura(espacioId, facturaId, {
          nombre: facturaActualizada.Nombre,
          precio: facturaActualizada.Precio,
          pagoMediano: facturaActualizada.perPersonPrice(),
          pagado: facturaActualizada.Pagado,
          creadorFactura:
            facturaActualizada.creadorFactura || CURRENT_USER_ID || "",
          deudores: Object.fromEntries(
            facturaActualizada.UsuariosAsignados.map((u) => [
              u.id,
              !u.completed,
            ]),
          ),
          fechaCompletada: facturaActualizada.FechaCompletada
            ? facturaActualizada.FechaCompletada.toISOString()
            : null,
        });
      } catch (e) {
        // console.error("Error actualizando factura:", e);
        // Revertir en caso de error
        setFacturas((prev) =>
          prev.map((f) => (f.IdFactura === facturaId ? factura : f)),
        );
      }
    }
  };

  return { handleQuickToggleFactura };
};
