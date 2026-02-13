import { Alert } from "react-native";
import { completarTareaInstancia, eliminarTarea } from "../api/tarea";
import { actualizarUsuarioEspacio } from "../api/usuarioEspacio";
import TaskModel from "../types/Task";
import FacturaModel from "../types/Factura";

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
    closeDetalle: () => void;
    CURRENT_USER_ID: string;
    activeTab: string;
    openDetalleTarea: (t: TaskModel) => void;
}

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
    closeDetalle,
    CURRENT_USER_ID,
    activeTab,
    openDetalleTarea,
}: ActionsProps) => {

    const handleToggleTask = async (id: string) => {
        if (activeTab === "tareas") {
            const task = tareas.find((t) => t.id === id);
            if (!task) return;

            const due = new Date(task.FechaLimite);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const wasOverdue = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime() < today.getTime();

            if (!task.isCompleted) {
                if (!task.usuarioAsignado) {
                    showPopup({
                        imageType: "error",
                        title: "Para completar una tarea debe estar asignada",
                        description: "Ve al detalle de la tarea y asígnala a un usuario.",
                        buttons: [{ text: "Cancelar" }, { text: "Ir al detalle", onPress: () => openDetalleTarea(task) }],
                    });
                    return;
                }

                // Bloquear si no está asignada al usuario actual
                if (CURRENT_USER_ID && task.usuarioAsignadoId && task.usuarioAsignadoId !== CURRENT_USER_ID) {
                    showPopup({
                        imageType: "error",
                        title: "No puedes completar esta tarea",
                        description: `Esta tarea está asignada a ${task.usuarioAsignado || "otro usuario"}.\nSolo el usuario asignado puede completarla.`,
                        buttons: [{ text: "Entendido" }],
                    });
                    return;
                }
            }

            if (task.isCompleted) {
                showPopup({
                    imageType: "goback",
                    title: "¿Estás seguro de que quieres marcar la tarea como pendiente?",
                    description: "Perderás los puntos de Karma obtenidos.",
                    buttons: [
                        { text: "Cancelar" },
                        {
                            text: "Aceptar",
                            onPress: async () => {
                                try {
                                    if (espacioId && task.tareasId && task.tareasId.length > 0) {
                                        console.log("Revertir tarea a Pendiente...");
                                        await completarTareaInstancia(espacioId, task.id, task.tareasId[task.tareasId.length - 1], false);
                                    }
                                    if (userRelacionId) {
                                        const nuevoKarma = Math.max(0, currentKarma - (task.karma || 0));
                                        await actualizarUsuarioEspacio(userRelacionId, { karma: nuevoKarma });
                                        setCurrentKarma(nuevoKarma);
                                    }
                                    setTareas((prev) => prev.map((t) => (t.id === id ? t.toggleComplete() : t)));
                                } catch (error) {
                                    Alert.alert("Error", "No se pudo actualizar la tarea.");
                                }
                            },
                        },
                    ],
                });
                return;
            }

            // Completar
            try {
                if (espacioId && task.tareasId && task.tareasId.length > 0) {
                    const nuevoEstado = wasOverdue ? "Completada Fuera de Plazo" : "Completada";
                    await completarTareaInstancia(espacioId, task.id, task.tareasId[task.tareasId.length - 1], true);
                }
            } catch (error) { console.error("Error al completar tarea:", error); }

            if (!wasOverdue && userRelacionId) {
                try {
                    const nuevoKarma = currentKarma + (task.karma || 0);
                    await actualizarUsuarioEspacio(userRelacionId, { karma: nuevoKarma });
                    setCurrentKarma(nuevoKarma);
                } catch (e) { }
            }

            showPopup({
                imageType: "happy",
                title: wasOverdue ? "¡Casi lo logras!" : "¡Felicidades!",
                description: wasOverdue ? "Has ganado 0 puntos de Karma." : `Has ganado ${task.karma} puntos de Karma.`,
                buttons: [{ text: "Aceptar" }],
            });

            setTareas((prev) => prev.map((t) => (t.id === id ? t.toggleComplete() : t)));

        } else {
            // FACTURAS
            const factura = facturas.find((f) => f.IdFactura === id);
            if (!factura) return;

            if (factura.Pagado) {
                showPopup({
                    imageType: "goback",
                    title: "¿Estás seguro de que quieres marcar la factura como pendiente?",
                    buttons: [{ text: "Cancelar" }, { text: "Aceptar", onPress: () => setFacturas(prev => prev.map(f => f.IdFactura === id ? f.togglePaid() : f)) }],
                });
                return;
            }

            const yo = factura.UsuariosAsignados?.find((u) => u.id === userRelacionId);
            if (!yo) {
                showPopup({ imageType: "error", title: "No estás asignado a esta factura", buttons: [{ text: "Aceptar" }] });
                return;
            }

            let facturaActualizada = factura;
            if (!yo.completed) {
                facturaActualizada = facturaActualizada.withUserCompleted(userRelacionId!, true);
                setFacturas(prev => prev.map(f => f.IdFactura === id ? facturaActualizada : f));
            }

            if (!facturaActualizada.canMarkPaid()) {
                const restantes = (facturaActualizada.UsuariosAsignados ?? []).filter((u) => !u.completed);
                showPopup({
                    imageType: "success",
                    title: "Has marcado tu parte como pagada",
                    description: restantes.length > 0 ? `Faltan por pagar: ${restantes.map((u) => u.name).join(", ")}.` : undefined,
                    buttons: [{ text: "Aceptar" }],
                });
                return;
            }

            showPopup({ imageType: "happy", title: "Has gestionado correctamente una factura.", buttons: [{ text: "Aceptar" }] });
            setFacturas(prev => prev.map(f => f.IdFactura === id ? f.togglePaid() : f));
        }
    };

    const handleDeleteTask = async (id: string | number) => {
        if (!espacioId) return;
        showPopup({
            imageType: "goback",
            title: "¿Eliminar tarea?",
            buttons: [
                { text: "Cancelar" },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            await eliminarTarea(espacioId, id);
                            setTareas((prev) => prev.filter((t) => t.id !== id.toString()));
                            closeDetalle();
                        } catch (error) { Alert.alert("Error", "No se pudo eliminar."); }
                    },
                },
            ],
        });
    };

    const handleDeleteFactura = async (id: string) => {
        // Implementación para facturas...
        setFacturas(prev => prev.filter(f => f.IdFactura !== id));
        closeDetalle();
    };

    return { handleToggleTask, handleDeleteTask, handleDeleteFactura };
};
