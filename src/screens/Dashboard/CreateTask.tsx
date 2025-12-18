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
import { useNavigation } from "@react-navigation/native";
import AssignUsersPopup from "../../components/ui/AssignUsersPopup";
import TimePickerPopup from "../../components/ui/TimePickerPopup";

const { hp } = HELPERS;

const CURRENT_USER = { id: "0", name: "Yo" };

const CreateTask: React.FC = () => {
    const navigation = useNavigation<any>();

    React.useLayoutEffect(() => {
        navigation.setOptions({ title: "Crear Tarea" });
    }, [navigation]);

    // Estados para los campos de texto
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");

    const [checkedAutoasign, setcheckedAutoasign] = useState(false);
    const [assignPopupVisible, setAssignPopupVisible] = useState(false);
    const [assignedUsers, setAssignedUsers] = useState<any[]>([]);

    // Time Picker State
    const [timePopupVisible, setTimePopupVisible] = useState(false);
    const [selectedTime, setSelectedTime] = useState("12:00");

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
                        value={taskName}
                        onChangeText={(text: string) => setTaskName(text)}
                        placeholder="Nombre"
                    />
                    <LargeTextField
                        value={taskDescription}
                        onChangeText={(text: string) => setTaskDescription(text)}
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
                                /* noop for now */
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
                                /* noop for now */
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
                            onChangeText={() => { }}
                            placeholder="Usuarios asignados"
                        />
                    )}

                    <Button
                        style={GLOBAL_STYLES.buttonPrimaryGreen}
                        onPress={() => {
                            console.log("Crear tarea:", {
                                nombre: taskName,
                                descripcion: taskDescription,
                                usuarios: assignedUsers,
                                hora: selectedTime,
                            });
                        }}
                    >
                        <Text style={GLOBAL_STYLES.textoBoton}>Crear tarea</Text>
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