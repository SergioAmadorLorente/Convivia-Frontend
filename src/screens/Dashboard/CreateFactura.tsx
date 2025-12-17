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
import UploadImage from "../../components/ui/UploadImage";
import MoneyInput from "../../components/ui/MoneyInput";
import LargeTextField from "../../components/ui/LargeTextField";
import Button from "../../components/ui/Button";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AssignUsersPopup from "../../components/ui/AssignUsersPopup";


const { hp } = HELPERS;

const CURRENT_USER = { id: "0", name: "Yo" };

const CreateFactura: React.FC = () => {
    const navigation = useNavigation<any>();

    React.useLayoutEffect(() => {
        navigation.setOptions({ title: "Crear Factura" });
    }, [navigation]);
    const [checkedAutoasign, setcheckedAutoasign] = useState(false);
    const [assignPopupVisible, setAssignPopupVisible] = useState(false);
    const [assignedUsers, setAssignedUsers] = useState<any[]>([]);

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
                        title="Precio"
                        fontSize={SIZES.text16}
                        fontWeight="bold"
                        collapsible={false}
                        showIcon={false}
                    >
                        <MoneyInput onChange={(val) => console.log("Dinero:", val)} />
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
                                Asignar usuario a la factura
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
                                Autoasignarse a la factura
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
                    <Desplegable
                        title="Foto (opcional)"
                        fontSize={SIZES.text16}
                        fontWeight="bold"
                        collapsible={false}
                        showIcon={false}
                    >
                        <UploadImage
                            label="Subir imagen"
                            onImageSelected={(uri) => {
                                console.log("Imagen seleccionada:", uri);
                            }}
                        />
                    </Desplegable>
                    <Button
                        style={GLOBAL_STYLES.buttonPrimaryGreen}
                        onPress={() => {
                            /* noop for now */
                        }}
                    >
                        <Text style={GLOBAL_STYLES.textoBoton}>Crear factura</Text>
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

            <BottomBar />
        </KeyboardAvoidingView>
    );
};

export default CreateFactura;
