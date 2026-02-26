import {
    View,
    Text,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from "../../styles/styles";
import { HELPERS, SIZES } from "../../styles/theme";
import { Desplegable, TextField } from "../../components";
import BottomBar from "../../components/ui/BottomBar";
import { Calendar } from "../../components/ui/Calendar";
import RepeatDaysSelector from "../../components/ui/RepeatDaysSelector";
import KarmaSelector from "../../components/ui/KarmaSelector";
import LargeTextField from "../../components/ui/LargeTextField";
import Button from "../../components/ui/Button";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import AssignUsersByDayPopup from "../../components/ui/AssignUsersByDayPopup";
import TimePickerPopup from "../../components/ui/TimePickerPopup";
import { useEditTask } from "../../hooks/useEditTask";
import { useAuthListener } from "../../hooks/useAuthListener";
import { obtenerEspacioPorUsuarioId, actualizarUsuarioEspacio, obtenerUsuarioEspacios } from "../../api/usuarioEspacio";
import { crearTarea, editarTarea, TareaPayload } from "../../api/tarea";
import { obtenerUsuarios } from "../../api/usuario";
import Popup from "../../components/ui/Popup";

const { hp } = HELPERS;

const CURRENT_USER = { id: "0", name: "Yo" };

type UserItem = {
    id: string;
    name: string;
};

const CreateTask: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const user = useAuthListener();

    React.useLayoutEffect(() => {
        navigation.setOptions({ title: route.params?.taskToEdit ? "Editar Tarea" : "Crear Tarea" });
    }, [navigation, route.params]);

    const {
        name, setName,
        description, setDescription,
        selectedTime, setSelectedTime,
        selectedDate, setSelectedDate, // Get from hook now
        repeatDays, setRepeatDays,
        karma, setKarma,
        assignedUsers, setAssignedUsers,
        loadTask,
        isEditing,
        taskId,
        instanceId,
    } = useEditTask();

    useEffect(() => {
        if (route.params?.taskToEdit) {
            const t = route.params.taskToEdit;
            console.log("📝 Editando tarea (Datos recibidos):", t);

            // 1. Mapear días numéricos a strings (para el selector visual)
            // Usamos Lunes=0, ..., Domingo=6 para que sea consistente con la lógica de envío
            const reverseDaysMap: Record<number, string> = {
                0: 'Lunes', 1: 'Martes', 2: 'Miércoles', 3: 'Jueves',
                4: 'Viernes', 5: 'Sábado', 6: 'Domingo'
            };
            // t.repeatDays viene como array de números
            const mappedDays = (t.repeatDays || []).map((d: number) => reverseDaysMap[d]).filter(Boolean);

            // 2. Cargar en hooks (text inputs, selectores)
            loadTask({
                id: t.id,
                instanceId: t.instanceId, // Cargar ID de instancia
                name: t.name,
                description: t.description,
                time: t.time,
                date: t.date ? new Date(t.date) : null, // Include date in loadTask
                repeatDays: mappedDays,
                karma: t.karma,
                assignedUsers: t.assignedUsers,
            });

            // 4. Pre-llenar asignaciones de usuario
            // El normalizador envía 'assignedUsers' como array de 1 elemento si hay usuario asignado.
            if (t.assignedUsers && t.assignedUsers.length > 0) {
                const u = t.assignedUsers[0];
                if (mappedDays.length > 0) {
                    // Caso Repetición: llenar el mapa de días
                    const newAssignments: Record<string, UserItem | null> = {};
                    mappedDays.forEach((day: string) => {
                        newAssignments[day] = u;
                    });
                    setDayUserAssignments(newAssignments);
                } else {
                    // Caso Puntual: llenar usuario único
                    setSingleUserAssignment(u);
                }
            }
        }
    }, [route.params]);

    const [checkedAutoasign, setcheckedAutoasign] = useState(false);
    const [assignPopupVisible, setAssignPopupVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Popup state
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupOptions, setPopupOptions] = useState<any>({});

    const showPopup = (opts: any) => {
        setPopupOptions(opts);
        setPopupVisible(true);
    };

    // User assignments per day: { "Lunes": UserItem, "Martes": UserItem, ... }
    const [dayUserAssignments, setDayUserAssignments] = useState<Record<string, UserItem | null>>({});

    // Single user assignment (when no repeat days are selected)
    const [singleUserAssignment, setSingleUserAssignment] = useState<UserItem | null>(null);

    // Time Picker State
    const [timePopupVisible, setTimePopupVisible] = useState(false);

    const [availableUsers, setAvailableUsers] = useState<UserItem[]>([]);

    // Button validation state
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);

    // Field validation states
    const [nameError, setNameError] = useState<string>('');
    const [nameTouched, setNameTouched] = useState(false);

    // Validate required fields: name, date, and karma (solo para creación, no edición)
    useEffect(() => {
        const hasName = name.trim().length > 0;
        const hasKarma = karma > 0;

        // Validar error de nombre solo si el campo ha sido tocado
        if (nameTouched && !hasName) {
            setNameError('El nombre no puede estar vacío');
        } else {
            setNameError('');
        }

        // Al editar, solo requerir nombre
        // Al crear, requerir nombre y karma
        if (isEditing) {
            setIsButtonEnabled(hasName);
        } else {
            setIsButtonEnabled(hasName && hasKarma);
        }
    }, [name, karma, isEditing, nameTouched]);

    useEffect(() => {
        const fetchUsersInSpace = async () => {
            if (!user?.uid) return;
            try {
                // 1. Obtener la relación usuario-espacio del usuario actual para saber en qué espacio estamos
                const myUserSpace = await obtenerEspacioPorUsuarioId(user.uid);
                if (!myUserSpace?.espacioId) return;

                const currentEspacioId = myUserSpace.espacioId;
                console.log("🏠 Buscando miembros para el espacio:", currentEspacioId);

                // 2. Obtener todas las relaciones UsuarioEspacio para filtrar por espacioId
                const allRelations = await obtenerUsuarioEspacios();
                if (!Array.isArray(allRelations)) return;

                const spaceRelations = allRelations.filter((r: any) => r.espacioId === currentEspacioId);
                const userIdsInSpace = spaceRelations.map((r: any) => r.usuarioId);

                if (userIdsInSpace.length === 0) {
                    setAvailableUsers([]);
                    return;
                }

                // 3. Obtener nombres de los usuarios (cruce de datos)
                const allUsers = await obtenerUsuarios();
                if (!Array.isArray(allUsers)) return;

                const usersInSpace = allUsers
                    .filter((u: any) => userIdsInSpace.includes(u.id))
                    .map((u: any) => ({
                        id: u.id,
                        name: u.nombre || u.email || "Usuario sin nombre"
                    }));

                console.log(`👥 ${usersInSpace.length} usuarios encontrados en el espacio.`);
                setAvailableUsers(usersInSpace);

            } catch (error) {
                // console.error("❌ Error fetching users in space:", error);
            }
        };

        fetchUsersInSpace();
    }, [user]);


    const handleCrearTareaPress = () => {
        // Validaciones iniciales (nombre y autenticación)
        if (!name.trim()) {
            showPopup({
                title: 'Campo requerido',
                description: 'Por favor, ingresa un nombre para la tarea.',
                imageType: 'error',
                buttons: [{ text: 'Aceptar', onPress: () => setPopupVisible(false) }],
            });
            return;
        }

        if (!selectedDate && repeatDays.length === 0) {
            // Si es tarea puntual (sin repetición), requerir fecha
            showPopup({
                title: 'Fecha requerida',
                description: 'Por favor, selecciona una fecha límite o días de repetición.',
                imageType: 'error',
                buttons: [{ text: 'Aceptar', onPress: () => setPopupVisible(false) }],
            });
            return;
        }

        if (!user) {
            showPopup({
                title: 'Error de autenticación',
                description: 'Debes estar autenticado para crear una tarea.',
                imageType: 'error',
                buttons: [{ text: 'Aceptar', onPress: () => setPopupVisible(false) }],
            });
            return;
        }

        // Abrir popup de asignación antes de crear
        setAssignPopupVisible(true);
    };

    const handleConfirmAssignmentAndCreate = async (
        assignments: Record<string, UserItem | null>,
        singleUser: UserItem | null
    ) => {
        // Actualizar estados locales de asignación
        setDayUserAssignments(assignments);
        setSingleUserAssignment(singleUser);

        // Proceder con la creación de la tarea
        console.log("💾 Guardando tarea. Fecha seleccionada en state:", selectedDate?.toISOString());
        await executeCreateTask(assignments, singleUser);
    };

    const executeCreateTask = async (
        currentAssignments: Record<string, UserItem | null>,
        currentSingleUser: UserItem | null
    ) => {
        setLoading(true);
        try {
            // Obtener el espacio del usuario
            const usuarioEspacio = await obtenerEspacioPorUsuarioId(user!.uid);

            if (!usuarioEspacio?.espacioId) {
                throw new Error("No se encontró un espacio asignado al usuario");
            }

            // Construir array de usuarios asignados en el mismo orden que diasNumeros
            let listaUsuariosAsignados: string[] = [];
            if (repeatDays.length > 0) {
                // Para cada día en repeatDays, obtener el userId del usuario asignado
                listaUsuariosAsignados = repeatDays
                    .map(day => currentAssignments[day]?.id)
                    .filter((id): id is string => !!id);
            } else if (currentSingleUser?.id) {
                // Usuario único para tarea puntual
                listaUsuariosAsignados = [currentSingleUser.id];
            }

            // Convertir días de string a números
            const diasNumeros = repeatDays.map(day => {
                const daysMap: Record<string, number> = {
                    'Lunes': 0, 'Martes': 1, 'Miércoles': 2, 'Jueves': 3,
                    'Viernes': 4, 'Sábado': 5, 'Domingo': 6
                };
                return daysMap[day];
            });

            // Formatear hora
            const horaFormateada = selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime;

            // Payload para editar plantilla (según endpoint /api/espacio/{espacioId}/{id})
            const baseData = {
                nombre: name,
                descripcion: description,
                karma: karma,
                diasRepeticion: diasNumeros,
                fechaFin: selectedDate,
                horaLimite: horaFormateada,
                usuariosAsignacion: listaUsuariosAsignados,
                espacioId: usuarioEspacio.espacioId,
            };

            let resultId: string | undefined;
            let responseData: any;

            if (isEditing && taskId) {
                // Para EDITAR: actualizamos la plantilla y la instancia (si existe)
                console.log("✏️ Actualizando tarea. Plantilla:", taskId, "Instancia:", instanceId);
                const editPayload = {
                    ...baseData
                };
                console.log("📤 Datos de edición a enviar:", JSON.stringify(editPayload, null, 2));

                responseData = await editarTarea(taskId, editPayload, instanceId);
                resultId = taskId;
                console.log("✅ Tarea e instancia actualizadas correctamente");
            } else {
                // Para CREAR: incluimos todos los campos adicionales con redundancia para mapeo del backend
                const tareaData: any = {
                    nombre: name.trim(),
                    descripcion: description.trim() || undefined,
                    fechaCreacion: new Date().toISOString(),
                    fechaLimite: baseData.fechaFin, // camelCase
                    FechaLimite: baseData.fechaFin, // PascalCase (para Firestore)
                    startDate: baseData.fechaFin,   // Campo que el backend suele devolver
                    fechaFin: baseData.fechaFin,    // Según schema de plantilla
                    horaLimite: baseData.horaLimite,
                    diasRepeticion: diasNumeros.length > 0 ? diasNumeros : [],
                    karma: karma,
                    usuariosAsignacion: listaUsuariosAsignados,
                    espacioId: baseData.espacioId,
                    estado: true,
                    completada: false,
                    tareasId: [],
                };

                console.log("✨ Creando nueva tarea");
                console.log("📤 Datos de creación a enviar:", JSON.stringify(tareaData, null, 2));

                responseData = await crearTarea(tareaData);
                console.log("✅ Tarea creada con ID:", responseData);
                resultId = typeof responseData === 'string' ? responseData : responseData?.id;
            }

            // Actualizar cada UsuarioEspacio asignado si corresponde
            if (listaUsuariosAsignados.length > 0 && resultId) {
                // Recopilar todos los IDs de tareas a añadir (Template + Instancias si las hay)
                const idsATareas: string[] = [resultId];
                if (typeof responseData === 'object' && Array.isArray(responseData?.tareasId)) {
                    responseData.tareasId.forEach((tid: string) => {
                        if (!idsATareas.includes(tid)) idsATareas.push(tid);
                    });
                }

                for (const userId of listaUsuariosAsignados) {
                    try {
                        const usuarioEspacioAsignado = await obtenerEspacioPorUsuarioId(userId);
                        const relacionId = usuarioEspacioAsignado?.id || usuarioEspacioAsignado?.id_UsuarioEspacio;

                        if (relacionId) {
                            const currentTasks = usuarioEspacioAsignado.tareasId || [];
                            // Filtrar IDs que ya existen para no duplicar
                            const nuevosIds = idsATareas.filter(id => !currentTasks.includes(id));

                            if (nuevosIds.length > 0) {
                                const tareasActualizadas = [...currentTasks, ...nuevosIds];
                                // actualizarUsuarioEspacio ahora usa PATCH
                                await actualizarUsuarioEspacio(relacionId, {
                                    tareasId: tareasActualizadas
                                });
                                console.log(`✅ UsuarioEspacio actualizado para usuario ${userId} con tareas: ${nuevosIds.join(', ')}`);
                            } else {
                                console.log(`ℹ️ Las tareas ya estaban asignadas al usuario ${userId}.`);
                            }
                        } else {
                            console.warn(`⚠️ No se encontró ID de relación UsuarioEspacio para usuario ${userId}`);
                        }
                    } catch (updateError) {
                        console.warn(`⚠️ No se pudo actualizar UsuarioEspacio para usuario ${userId}:`, updateError);
                    }
                }
            }

            // Cerrar popup de asignación si seguía abierto
            setAssignPopupVisible(false);

            // Llamar al callback onSave si existe (para actualizar estado en Dashboard)
            if (isEditing && route.params?.onSave) {
                const updatedData = {
                    id: taskId!,
                    name,
                    description,
                    time: selectedTime,
                    date: selectedDate,
                    repeatDays: diasNumeros,
                    karma,
                    assignedUsers: listaUsuariosAsignados.map(id => ({
                        id,
                        name: availableUsers.find(u => u.id === id)?.name || id
                    })),
                };
                route.params.onSave(updatedData);
            }

            showPopup({
                title: isEditing ? 'Tarea actualizada' : 'Tarea creada',
                description: isEditing ? 'La tarea se ha actualizado exitosamente.' : 'La tarea se ha creado exitosamente.',
                imageType: 'convivia',
                buttons: [{
                    text: 'Aceptar',
                    onPress: () => {
                        setPopupVisible(false);
                        navigation.goBack();
                    }
                }],
            });

        } catch (error: any) {
            // console.error('Error al crear tarea:', error);
            showPopup({
                title: 'Error',
                description: error?.response?.data?.message || 'Error al crear la tarea. Intenta de nuevo.',
                imageType: 'error',
                buttons: [{ text: 'Aceptar', onPress: () => setPopupVisible(false) }],
            });
        } finally {
            setLoading(false);
        }
    };

    // Get initial assignments as userId mapping for the popup
    const getInitialAssignments = (): Record<string, string> => {
        const result: Record<string, string> = {};
        Object.entries(dayUserAssignments).forEach(([day, user]) => {
            if (user) {
                result[day] = user.id;
            }
        });
        return result;
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
            <ScrollView
                contentContainerStyle={[
                    GLOBAL_STYLES.scrollContainer2,
                    { paddingBottom: hp("15%") },
                    Platform.OS === "web" ? WEB_FULL_VIEWPORT : {},
                    { alignItems: "center" },
                ]}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ marginBottom: 40, alignItems: "center", width: "100%" }}>
                    <TextField
                        value={name}
                        onChangeText={(text: string) => {
                            setName(text);
                            if (!nameTouched) setNameTouched(true);
                        }}
                        placeholder="Nombre"
                        error={nameError}
                        onBlur={() => setNameTouched(true)}
                    />
                    <LargeTextField
                        value={description}
                        onChangeText={(text: string) => setDescription(text)}
                        placeholder="Descripción (opcional) "
                    />
                </View>

                <View style={{ width: "100%", gap: 20 }}>
                    <Desplegable
                        title="Fecha y hora límite"
                        fontSize={SIZES.text16}
                        fontWeight="bold"
                        collapsible={false}
                        showIcon={false}
                    >
                        <Calendar
                            time={selectedTime}
                            onTimeClick={() => setTimePopupVisible(true)}
                            onDateSelect={(date) => {
                                console.log("📅 Calendario seleccionó fecha (Local):", date ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` : "null");
                                setSelectedDate(date);
                            }}
                            selectedDate={selectedDate}
                        />
                    </Desplegable>

                    <Desplegable
                        title="Repetición de la tarea"
                        fontSize={SIZES.text16}
                        fontWeight="bold"
                        collapsible={false}
                        showIcon={false}
                    >
                        <RepeatDaysSelector
                            initialValue={repeatDays}
                            onChange={(days: string[]) => {
                                setRepeatDays(days);
                                setDayUserAssignments((prev) => {
                                    const updated: Record<string, UserItem | null> = {};
                                    days.forEach((day) => {
                                        updated[day] = prev[day] || null;
                                    });
                                    return updated;
                                });
                            }}
                        />
                    </Desplegable>

                    {/* Se eliminó el desplegable de Asignación ya que ahora es parte del flujo de clic en 'Crear tarea' */}

                    <Desplegable
                        title="Puntos de karma"
                        fontSize={SIZES.text16}
                        fontWeight="bold"
                        collapsible={false}
                        showIcon={false}
                    >
                        <KarmaSelector
                            initialValue={karma}
                            onSelect={(points: number) => {
                                setKarma(points);
                            }}
                        />
                    </Desplegable>
                </View>

                <View style={{ width: "100%", marginTop: 20, alignItems: "center" }}>

                    <Button
                        style={GLOBAL_STYLES.buttonPrimaryGreen}
                        onPress={handleCrearTareaPress}
                        disabled={loading || !isButtonEnabled}
                    >
                        <Text style={GLOBAL_STYLES.textoBoton}>
                            {loading ? "Guardando..." : (isEditing ? "Assignar Usuarios y Guardar" : "Assignar Usuarios y Crear")}
                        </Text>
                    </Button>
                </View>
            </ScrollView>

            <AssignUsersByDayPopup
                visible={assignPopupVisible}
                onClose={() => setAssignPopupVisible(false)}
                users={availableUsers}
                days={repeatDays}
                initialAssignments={getInitialAssignments()}
                initialSingleUserId={singleUserAssignment?.id || null}
                confirmLabel="Crear"
                onConfirm={(assignments) => {
                    handleConfirmAssignmentAndCreate(assignments, singleUserAssignment);
                }}
                onConfirmSingleUser={(user) => {
                    // Pasar las asignaciones actuales de repetición (que estarán vacías si es single mode)
                    handleConfirmAssignmentAndCreate(dayUserAssignments, user);
                }}
            />

            <TimePickerPopup
                visible={timePopupVisible}
                onClose={() => setTimePopupVisible(false)}
                onConfirm={(hour, minute) => {
                    setSelectedTime(`${hour}:${minute}`);
                }}
                initialHour={selectedTime.split(":")[0]}
                initialMinute={selectedTime.split(":")[1]}
            />

            <Popup
                visible={popupVisible}
                onClose={() => setPopupVisible(false)}
                title={popupOptions.title || ''}
                description={popupOptions.description}
                imageType={popupOptions.imageType}
                buttons={popupOptions.buttons}
            />

            <BottomBar />
        </KeyboardAvoidingView>
    );
};

export default CreateTask;