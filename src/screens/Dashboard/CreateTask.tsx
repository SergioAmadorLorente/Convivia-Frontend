import {
    View,
    Text,
    Platform,
    KeyboardAvoidingView,
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

const { hp } = HELPERS;

const CURRENT_USER = { id: "0", name: "Yo" };

type UserItem = {
    id: string;
    name: string;
};

const CreateTask: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

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
            // Map the simple task object to the form state
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

    // User assignments per day: { "Lunes": UserItem, "Martes": UserItem, ... }
    const [dayUserAssignments, setDayUserAssignments] = useState<Record<string, UserItem | null>>({});

    // Single user assignment (when no repeat days are selected)
    const [singleUserAssignment, setSingleUserAssignment] = useState<UserItem | null>(null);

    // Time Picker State
    const [timePopupVisible, setTimePopupVisible] = useState(false);

    const [availableUsers] = useState([
        { id: "1", name: "Juan Pérez" },
        { id: "2", name: "María García" },
        { id: "3", name: "Lucía Fernández" },
    ]);

    function handleToggleTask(id: any) {
        setAssignPopupVisible(true);
    }

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
                        onPress={() => handleToggleTask(1)}
                    >
                        <Text style={GLOBAL_STYLES.textoBoton}>
                            {isEditing ? "Guardar cambios" : "Crear tarea"}
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
                onConfirm={(assignments) => {
                    console.log("Asignaciones por día:", assignments);
                    setDayUserAssignments(assignments);
                    // Check if current user is assigned to any day
                    const isCurrentUserSelected = Object.values(assignments).some(
                        (user) => user?.id === CURRENT_USER.id
                    );
                    setcheckedAutoasign(isCurrentUserSelected);
                }}
                onConfirmSingleUser={(user) => {
                    console.log("Usuario asignado:", user);
                    setSingleUserAssignment(user);
                    setcheckedAutoasign(user?.id === CURRENT_USER.id);
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

            <BottomBar />
        </KeyboardAvoidingView>
    );
};

export default CreateTask;