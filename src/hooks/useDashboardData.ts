import { useState, useEffect, useRef } from "react";
import { useAuthListener } from "./useAuthListener";
import { obtenerUsuarioPorId, obtenerUsuarios } from "../api/usuario";
import { obtenerEspacioPorUsuarioId, obtenerUsuarioEspacios } from "../api/usuarioEspacio";
import { obtenerEspacioPorId } from "../api/espacio";
import { obtenerTareasPorEspacio, obtenerDetalleTareaInstancia } from "../api/tarea";
import TaskModel from "../types/Task";
import FacturaModel from "../types/Factura";

export const useDashboardData = (newSpaceName?: string) => {
    const user = useAuthListener();
    const [userName, setUserName] = useState<string>("Usuario");
    const [espacioNombre, setEspacioNombre] = useState<string>(newSpaceName || "Mi espacio");
    const [espacioId, setEspacioId] = useState<string | null>(null);
    const [userRelacionId, setUserRelacionId] = useState<string | null>(null);
    const [currentKarma, setCurrentKarma] = useState<number>(0);
    const [loadingEspacio, setLoadingEspacio] = useState<boolean>(true);
    const [userNamesMap, setUserNamesMap] = useState<Record<string, string>>({});
    const [tareas, setTareas] = useState<TaskModel[]>([]);
    const [loadingTareas, setLoadingTareas] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [facturas, setFacturas] = useState<FacturaModel[]>([
        new FacturaModel({
            IdFactura: "f1",
            Nombre: "Electricidad",
            Precio: 120,
            UsuariosAsignados: [
                { id: "u1", name: "Juan", completed: true },
                { id: "u2", name: "María", completed: false },
                { id: "u3", name: "Pedro", completed: true },
            ],
            Pagado: false,
            FechaCreacion: new Date(),
            Descripcion: "Factura mensual",
        }),
        new FacturaModel({
            IdFactura: "f2",
            Nombre: "Internet",
            Precio: 45,
            UsuariosAsignados: [
                { id: "u1", name: "Juan", completed: true },
                { id: "u2", name: "María", completed: true },
            ],
            Pagado: true,
            FechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            FechaCompletada: new Date(Date.now() - 24 * 60 * 60 * 1000),
            Descripcion: "Fibra 300Mb",
        }),
    ]);

    // Cargar información del espacio del usuario
    useEffect(() => {
        const cargarEspacio = async () => {
            try {
                if (user?.uid) {
                    let displayName = user.displayName || user.email?.split("@")[0] || "Usuario";
                    try {
                        const usuarioData = await obtenerUsuarioPorId(user.uid);
                        if (usuarioData?.nombre || usuarioData?.Nombre) {
                            displayName = usuarioData.nombre || usuarioData.Nombre;
                        }
                    } catch (e) {
                        console.log("No se pudo obtener usuario de la BD");
                    }
                    setUserName(displayName);

                    const result = await obtenerEspacioPorUsuarioId(user.uid);
                    if (result?.espacioId && result.espacioId !== "string") {
                        setEspacioId(result.espacioId);
                        setUserRelacionId(result.id || result.id_UsuarioEspacio);
                        setCurrentKarma(result.karma || 0);

                        try {
                            const espacioData = await obtenerEspacioPorId(result.espacioId);
                            if (espacioData?.nombre && !newSpaceName) {
                                setEspacioNombre(espacioData.nombre);
                            }
                        } catch (espacioError) {
                            if (!newSpaceName) setEspacioNombre("Mi espacio");
                        }
                    } else {
                        setEspacioNombre("Mi espacio");
                    }
                }
            } catch (error) {
                console.error("Error al cargar espacio:", error);
                setEspacioNombre("Mi espacio");
            } finally {
                setLoadingEspacio(false);
            }
        };
        cargarEspacio();
    }, [user, newSpaceName]);

    // Nombres de usuario
    useEffect(() => {
        const cargarNombresUsuario = async () => {
            try {
                const [users, uEspacios] = await Promise.all([
                    obtenerUsuarios(),
                    obtenerUsuarioEspacios()
                ]);

                if (Array.isArray(users)) {
                    const map: Record<string, string> = {};
                    users.forEach((u: any) => { map[u.id] = u.nombre || u.email || u.id; });
                    if (Array.isArray(uEspacios)) {
                        uEspacios.forEach((rel: any) => {
                            const relId = rel.id || rel.id_UsuarioEspacio;
                            if (relId && rel.usuarioId && map[rel.usuarioId]) {
                                map[relId] = map[rel.usuarioId];
                            }
                        });
                    }
                    setUserNamesMap(map);
                }
            } catch (error) {
                console.error("Error cargando nombres de usuario:", error);
            }
        };
        cargarNombresUsuario();
    }, [espacioId]);

    const cargarTareas = async (showLoading = true) => {
        if (!espacioId) return;
        if (showLoading) setLoadingTareas(true);
        try {
            const tareasRaw = await obtenerTareasPorEspacio(espacioId);
            if (Array.isArray(tareasRaw)) {
                const mappedTasks = tareasRaw.map((t: any) => {
                    const fechaFuente = t.startDate || t.fechaFin || t.fechaLimite || t.FechaLimite || t.fecha_limite;
                    const fechaObj = fechaFuente ? new Date(fechaFuente) : null;
                    const rawTime = t.HoraLimite ?? t.horaLimite ?? t.time ?? t.Time ?? t.hora ?? t.Hora;
                    let cleanTime = "12:00";
                    if (rawTime && typeof rawTime === 'string' && rawTime.length >= 5) cleanTime = rawTime.substring(0, 5);

                    const userId = t.usuariosAsignacion?.[0];
                    const userNameResolved = userId ? userNamesMap[userId] || userId : null;

                    return new TaskModel({
                        id: t.id,
                        Nombre: t.nombre || t.Nombre,
                        Descripcion: t.descripcion || t.Descripcion,
                        karma: t.karma,
                        DiasRepeticion: t.diasRepeticion || [],
                        FechaLimite: (fechaObj as any) || new Date(),
                        HoraLimite: cleanTime,
                        isCompleted: t.completada || t.Completada || false,
                        usuarioAsignado: userNameResolved,
                        tareasId: t.tareasId || []
                    });
                });

                setTareas(prevTareas => {
                    const mergedTasks = mappedTasks.map(newTask => {
                        const existing = prevTareas.find(t => t.id === newTask.id);
                        if (existing) {
                            const prevLastInstance = existing.tareasId?.[existing.tareasId.length - 1];
                            const newLastInstance = newTask.tareasId?.[newTask.tareasId.length - 1];
                            if (prevLastInstance === newLastInstance) {
                                return new TaskModel({
                                    ...newTask as any,
                                    FechaLimite: existing.FechaLimite,
                                    HoraLimite: existing.HoraLimite,
                                });
                            }
                        }
                        return newTask;
                    });

                    setTimeout(() => {
                        const tasksToEnrich = mergedTasks.filter(t => {
                            const needsEnrichment = t.HoraLimite === "12:00" || !t.usuarioAsignado;
                            return t.tareasId && t.tareasId.length > 0 && needsEnrichment;
                        });
                        if (tasksToEnrich.length > 0) fetchRealTaskTimes(tasksToEnrich, espacioId);
                    }, 100);

                    return mergedTasks;
                });
            }
        } catch (error) {
            console.error("Error cargando tareas:", error);
        } finally {
            if (showLoading) setLoadingTareas(false);
            setRefreshing(false);
        }
    };

    const fetchRealTaskTimes = async (currentTasks: TaskModel[], eId: string) => {
        const candidates = currentTasks.filter(t => t.tareasId && t.tareasId.length > 0);
        if (candidates.length === 0) return;

        const updates = await Promise.all(candidates.map(async (task) => {
            try {
                const lastInstanceId = task.tareasId[task.tareasId.length - 1];
                const detail = await obtenerDetalleTareaInstancia(eId, task.id, lastInstanceId);
                const result: any = { id: task.id };
                let hasUpdate = false;
                const timeFound = detail?.horaLimite || detail?.HoraLimite || detail?.hora;
                if (timeFound && typeof timeFound === 'string' && timeFound.length >= 5) {
                    result.realTime = timeFound.substring(0, 5);
                    hasUpdate = true;
                }
                const dateFound = detail?.fechaLimite || detail?.FechaLimite;
                if (dateFound) {
                    result.realDate = new Date(dateFound);
                    hasUpdate = true;
                }
                const userRelId = detail?.usuarioEspacioId || detail?.relacionId;
                if (userRelId) {
                    result.realUserId = userRelId;
                    hasUpdate = true;
                }
                if (hasUpdate) return result;
            } catch (e) { }
            return null;
        }));

        const validUpdates = updates.filter(u => u !== null);
        if (validUpdates.length > 0) {
            setTareas(prevTareas => prevTareas.map(t => {
                const update = validUpdates.find(u => u.id === t.id);
                if (update) {
                    const assignedName = update.realUserId ? userNamesMap[update.realUserId] || update.realUserId : t.usuarioAsignado;
                    return new TaskModel({ ...t, FechaLimite: update.realDate || t.FechaLimite, HoraLimite: update.realTime || t.HoraLimite, usuarioAsignado: assignedName });
                }
                return t;
            }));
        }
    };

    return {
        user,
        userName,
        espacioNombre,
        espacioId,
        userRelacionId,
        currentKarma,
        setCurrentKarma,
        loadingEspacio,
        userNamesMap,
        tareas,
        setTareas,
        loadingTareas,
        refreshing,
        setRefreshing,
        cargarTareas,
        facturas,
        setFacturas
    };
};
