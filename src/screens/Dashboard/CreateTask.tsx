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
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AssignUsersByDayPopup from "../../components/ui/AssignUsersByDayPopup";
import TimePickerPopup from "../../components/ui/TimePickerPopup";

const { hp } = HELPERS;

const CURRENT_USER = { id: "0", name: "Yo" };

type UserItem = {
    id: string;
    name: string;
};

const CreateTask: React.FC = () => {
    const navigation = useNavigation<any>();

    React.useLayoutEffect(() => {
        navigation.setOptions({ title: "Crear Tarea" });
    }, [navigation]);
    const [checkedAutoasign, setcheckedAutoasign] = useState(false);
    const [assignPopupVisible, setAssignPopupVisible] = useState(false);

    // Days selected in RepeatDaysSelector
    const [repeatDays, setRepeatDays] = useState<string[]>([]);

    // User assignments per day: { "Lunes": UserItem, "Martes": UserItem, ... }
    const [dayUserAssignments, setDayUserAssignments] = useState<Record<string, UserItem | null>>({});

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
                        value={""}
                        onChangeText={function (text: string): void {
                            null;
                        }}
                        placeholder="Nombre"
                    />
                    <LargeTextField
                        value={""}
                        onChangeText={function (text: string): void {
                            null;
                        }}
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
                                /* noop for now */
                            }}
                        />
                    </Desplegable>

                </View>
                <View style={{ width: "100%", marginTop: 20, alignItems: "center" }}>


                    <Button
                        style={GLOBAL_STYLES.buttonPrimaryGreen}
                        onPress={() => handleToggleTask(1)}
                    >
                        <Text style={GLOBAL_STYLES.textoBoton}>Crear tarea</Text>
                    </Button>
                </View>
            </ScrollView>

            <AssignUsersByDayPopup
                visible={assignPopupVisible}
                onClose={() => setAssignPopupVisible(false)}
                users={availableUsers}
                days={repeatDays}
                initialAssignments={getInitialAssignments()}
                onConfirm={(assignments) => {
                    console.log("Asignaciones por día:", assignments);
                    setDayUserAssignments(assignments);
                    // Check if current user is assigned to any day
                    const isCurrentUserSelected = Object.values(assignments).some(
                        (user) => user?.id === CURRENT_USER.id
                    );
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
