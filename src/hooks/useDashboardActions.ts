import { Alert } from "react-native";
import { completarTareaInstancia, eliminarTarea } from "../api/tarea";
import { editarFactura } from "../api/factura";
import { actualizarUsuarioEspacio } from "../api/usuarioEspacio";
import TaskModel from "../types/Task";
import FacturaModel from "../types/Factura";

const cleanId = (id: string) => id?.replace(/-/g, '').toLowerCase() || "";

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

            const yo = factura.UsuariosAsignados?.find((u) => cleanId(u.id) === cleanId(CURRENT_USER_ID || ""));
            if (!yo) {
                showPopup({ imageType: "error", title: "No estás asignado a esta factura", buttons: [{ text: "Aceptar" }] });
                return;
            }

            if (yo.completed) {
                // DESMARCAR PAGO
                showPopup({
                    imageType: "goback",
                    title: "¿Desmarcar tu pago?",
                    description: "Confirmar que revertirá su pago y que la factura podría volver a “Pendientes”.",
                    buttons: [
                        { text: "Cancelar" },
                        {
                            text: "Aceptar",
                            onPress: async () => {
                                const desmarcada = factura.withUserCompleted(yo.id, false);
                                setFacturas(prev => prev.map(f => f.IdFactura === id ? desmarcada : f));

                                if (espacioId) {
                                    try {
                                        await editarFactura(espacioId, id, {
                                            nombre: desmarcada.Nombre,
                                            precio: desmarcada.Precio,
                                            pagoMediano: desmarcada.perPersonPrice(),
                                            pagado: desmarcada.Pagado,
                                            creadorFactura: desmarcada.creadorFactura || CURRENT_USER_ID,
                                            deudores: Object.fromEntries(desmarcada.UsuariosAsignados.map(u => [u.id, !u.completed])),
                                        });
                                    } catch (e) {
                                        console.error("Error actualizando factura:", e);
                                        Alert.alert("Error", "No se pudo actualizar el pago en el servidor.");
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
                    title: "¿Confirmar acción de pago?",
                    description: "Se marcará tu parte como pagada. Esta acción no otorga puntos de karma.",
                    buttons: [
                        { text: "Cancelar" },
                        {
                            text: "Aceptar",
                            onPress: async () => {
                                const marcada = factura.withUserCompleted(yo.id, true);
                                setFacturas(prev => prev.map(f => f.IdFactura === id ? marcada : f));

                                if (espacioId) {
                                    try {
                                        await editarFactura(espacioId, id, {
                                            nombre: marcada.Nombre,
                                            precio: marcada.Precio,
                                            pagoMediano: marcada.perPersonPrice(),
                                            pagado: marcada.Pagado,
                                            creadorFactura: marcada.creadorFactura || CURRENT_USER_ID,
                                            deudores: Object.fromEntries(marcada.UsuariosAsignados.map(u => [u.id, !u.completed])),
                                        });
                                    } catch (e) {
                                        console.error("Error actualizando factura:", e);
                                        Alert.alert("Error", "No se pudo actualizar el pago en el servidor.");
                                        return;
                                    }
                                }

                                if (marcada.Pagado) {
                                    showPopup({
                                        imageType: "happy",
                                        title: "¡Factura completada!",
                                        description: "Todos los participantes han pagado su parte.",
                                        buttons: [{ text: "Aceptar" }]
                                    });
                                } else {
                                    const restantes = marcada.UsuariosAsignados.filter(u => !u.completed);
                                    showPopup({
                                        imageType: "success",
                                        title: "Has marcado tu parte como pagada",
                                        description: restantes.length > 0
                                            ? `Faltan por pagar: ${restantes.map(u => u.name).join(", ")}.`
                                            : undefined,
                                        buttons: [{ text: "Aceptar" }],
                                    });
                                }
                            },
                        },
                    ],
                });
            }
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
