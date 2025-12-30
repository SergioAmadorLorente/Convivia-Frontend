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
import { obtenerEspacioPorUsuarioId, actualizarUsuarioEspacio } from "../../api/usuarioEspacio";
import { crearTarea } from "../../api/tarea";
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
        repeatDays, setRepeatDays,
        karma, setKarma,
        assignedUsers, setAssignedUsers,
        loadTask,
        isEditing,
    } = useEditTask();

    useEffect(() => {
        if (route.params?.taskToEdit) {
            const t = route.params.taskToEdit;
            loadTask({
                id: t.id,
                name: t.title,
                description: t.subtitle || "",
                time: t.time,
                repeatDays: [],
                karma: 0,
                assignedUsers: [],
            });
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
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [availableUsers] = useState([
        { id: "1", name: "Juan Pérez" },
        { id: "2", name: "María García" },
        { id: "3", name: "Lucía Fernández" },
    ]);


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

            // Determinar usuario asignado basado en LO QUE SE ACABA DE CONFIRMAR en el popup
            let usuarioAsignado: string | undefined = undefined;

            if (repeatDays.length > 0) {
                // Si hay días repetidos, usar las asignaciones por día
                const firstAssignment = Object.values(currentAssignments).find(u => u !== null);
                usuarioAsignado = firstAssignment?.id;
            } else {
                // Si no hay repetición, usar la asignación single
                usuarioAsignado = currentSingleUser?.id;
            }

            // Convertir días de string a números
            const diasNumeros = repeatDays.map(day => {
                const daysMap: Record<string, number> = {
                    'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4,
                    'Viernes': 5, 'Sábado': 6, 'Domingo': 0
                };
                return daysMap[day];
            });

            // Formatear hora
            const horaFormateada = selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime;

            const tareaData: any = {
                nombre: name.trim(),
                descripcion: description.trim() || undefined,
                fechaCreacion: new Date().toISOString(),
                // Backend usa DateOnly, así que enviamos solo la parte de la fecha YYYY-MM-DD
                FechaLimite: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
                horaLimite: horaFormateada,
                diasRepeticion: diasNumeros.length > 0 ? diasNumeros : [],
                karma: karma,
                usuariosAsignacion: usuarioAsignado ? [usuarioAsignado] : [],
                espacioId: usuarioEspacio.espacioId,
                estado: true,
                completada: false,
                tareasId: [],
            };

            console.log("📤 Datos a enviar:", JSON.stringify(tareaData, null, 2));
            console.log("📅 Fecha Límite a enviar (Mayúscula):", tareaData.FechaLimite); // LOG IMPORTANTE
            console.log("⏰ Hora Límite a enviar:", tareaData.horaLimite);
            const tareaCreada = await crearTarea(tareaData);
            console.log("✅ Tarea creada con ID:", tareaCreada);

            // Actualizar UsuarioEspacio si corresponde
            if (usuarioAsignado && tareaCreada) {
                try {
                    const usuarioEspacioAsignado = await obtenerEspacioPorUsuarioId(usuarioAsignado);
                    if (usuarioEspacioAsignado?.id_UsuarioEspacio) {
                        const tareasActualizadas = [
                            ...(usuarioEspacioAsignado.tareasId || []),
                            tareaCreada
                        ];
                        await actualizarUsuarioEspacio(usuarioEspacioAsignado.id_UsuarioEspacio, {
                            tareasId: tareasActualizadas
                        });
                    }
                } catch (updateError) {
                    console.warn("⚠️ No se pudo actualizar UsuarioEspacio con la tarea:", updateError);
                }
            }

            // Cerrar popup de asignación si seguía abierto (aunque el flujo normal lo cierra antes)
            setAssignPopupVisible(false);

            showPopup({
                title: 'Tarea creada',
                description: 'La tarea se ha creado exitosamente.',
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
            console.error('Error al crear tarea:', error);
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
                        onChangeText={(text: string) => setName(text)}
                        placeholder="Nombre"
                    />
                    <LargeTextField
                        value={description}
                        onChangeText={(text: string) => setDescription(text)}
                        placeholder="Descripcion"
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
                            onDateSelect={(date) => setSelectedDate(date)}
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
                        disabled={loading}
                    >
                        <Text style={GLOBAL_STYLES.textoBoton}>
                            {loading ? "Guardando..." : (isEditing ? "Guardar cambios" : "Crear tarea")}
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