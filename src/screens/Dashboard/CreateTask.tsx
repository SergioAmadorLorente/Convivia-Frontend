import {
    View,
    Text,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from "../../styles/styles";
import { CHECKBOX, COLORS, COMMON, HELPERS, SIZES } from "../../styles/theme";
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
import AssignUsersPopup from "../../components/ui/AssignUsersPopup";
import TimePickerPopup from "../../components/ui/TimePickerPopup";
import { useEditTask } from "../../hooks/useEditTask";

const { hp } = HELPERS;

const CURRENT_USER = { id: "0", name: "Yo" };

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
                        onChangeText={setName}
                        placeholder="Nombre"
                    />
                    <LargeTextField
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Descripcion"
                    ></LargeTextField>
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
                    <Desplegable
                        title="Asigna a compañeros"
                        fontSize={SIZES.text16}
                        fontWeight="bold"
                        collapsible={false}
                        showIcon={false}
                    >
                        <Button
                            style={[GLOBAL_STYLES.buttonSecondaryGrey]}
                            onPress={() => handleToggleTask(1)}
                        >
                            <Text style={GLOBAL_STYLES.textoBoton}>
                                Asignar usuario a la tarea
                            </Text>
                        </Button>

                        <View
                            style={[
                                GLOBAL_STYLES.checkboxContainer,
                                { marginLeft: "40%", marginTop: 20 },
                            ]}
                        >
                            <Text
                                style={[GLOBAL_STYLES.labelCheckbox, { color: COLORS.accent }]}
                            >
                                Autoasignarse a la tarea
                            </Text>
                            <TouchableOpacity
                                style={CHECKBOX.touchArea}
                                onPress={() => {
                                    const newValue = !checkedAutoasign;
                                    setcheckedAutoasign(newValue);
                                    if (newValue) {
                                        if (!assignedUsers.find(u => u.id === CURRENT_USER.id)) {
                                            setAssignedUsers(prev => [...prev, CURRENT_USER]);
                                        }
                                    } else {
                                        setAssignedUsers(prev => prev.filter(u => u.id !== CURRENT_USER.id));
                                    }
                                }}
                            >
                                <Feather
                                    name={checkedAutoasign ? "check-square" : "square"}
                                    size={CHECKBOX.iconSize}
                                    color={
                                        checkedAutoasign
                                            ? CHECKBOX.colors.checked
                                            : CHECKBOX.colors.unchecked
                                    }
                                />
                            </TouchableOpacity>
                        </View>
                    </Desplegable>
                </View>
                <View style={{ width: "100%", marginTop: 20, alignItems: "center" }}>
                    {assignedUsers.length > 0 && (
                        <LargeTextField
                            value={assignedUsers.map((u) => u.name).join("\n")}
                            editable={false}
                            onChangeText={() => {
                                null;
                            }}
                            placeholder="Usuarios asignados"
                        />
                    )}

                    <Button
                        style={GLOBAL_STYLES.buttonPrimaryGreen}
                        onPress={() => {
                            /* noop for now */
                        }}
                    >
                        <Text style={GLOBAL_STYLES.textoBoton}>
                            {isEditing ? "Guardar cambios" : "Crear tarea"}
                        </Text>
                    </Button>
                </View>
            </ScrollView>

            <AssignUsersPopup
                visible={assignPopupVisible}
                onClose={() => setAssignPopupVisible(false)}
                users={availableUsers}
                multiSelect={true}
                initialSelectedIds={assignedUsers.map(u => u.id)}
                onConfirm={(selected) => {
                    console.log("Usuarios asignados:", selected);
                    setAssignedUsers(selected);
                    const isCurrentUserSelected = selected.some(u => u.id === CURRENT_USER.id);
                    setcheckedAutoasign(isCurrentUserSelected);
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
