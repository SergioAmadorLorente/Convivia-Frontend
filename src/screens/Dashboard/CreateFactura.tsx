import {
    View,
    Text,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from "../../styles/styles";
import { CHECKBOX, COLORS, HELPERS, SIZES } from "../../styles/theme";
import { Desplegable, TextField } from "../../components";
import BottomBar from "../../components/ui/BottomBar";
import UploadImage from "../../components/ui/UploadImage";
import MoneyInput from "../../components/ui/MoneyInput";
import LargeTextField from "../../components/ui/LargeTextField";
import Button from "../../components/ui/Button";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import AssignUsersPopup from "../../components/ui/AssignUsersPopup";
import { useEditFactura } from "../../hooks/useEditFactura";

const { hp } = HELPERS;

const CURRENT_USER = { id: "0", name: "Yo" };

const CreateFactura: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const {
        name, setName,
        description, setDescription,
        amount, setAmount,
        assignedUsers, setAssignedUsers,
        imageUri, setImageUri,
        isEditing,
        loadFactura,
    } = useEditFactura();

    React.useLayoutEffect(() => {
        navigation.setOptions({ title: isEditing ? "Editar Factura" : "Crear Factura" });
    }, [navigation, isEditing]);

    useEffect(() => {
        console.log("CreateFactura mounted. Params:", route.params);
        if (route.params?.facturaToEdit) {
            console.log("Editing factura:", route.params.facturaToEdit);
            const f = route.params.facturaToEdit;
            loadFactura({
                id: f.id,
                name: f.title,
                description: f.subtitle || "",
                amount: f.subtitle ? f.subtitle.replace("€", "") : "", // Simple parsing assumption
                assignedUsers: [],
                imageUri: undefined,
            });
        }
    }, [route.params]);

    const [checkedAutoasign, setcheckedAutoasign] = useState(false);
    const [assignPopupVisible, setAssignPopupVisible] = useState(false);

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
                        title="Precio"
                        fontSize={SIZES.text16}
                        fontWeight="bold"
                        collapsible={false}
                        showIcon={false}
                    >
                        <MoneyInput value={amount} onChange={(val) => setAmount(val)} />
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
                            onChangeText={() => { }}
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
                                setImageUri(uri || undefined);
                            }}
                        />
                    </Desplegable>

                    <Button
                        style={GLOBAL_STYLES.buttonPrimaryGreen}
                        onPress={() => {
                            console.log("Factura creada:", {
                                nombre: name,
                                descripcion: description,
                                usuarios: assignedUsers,
                            });
                        }}
                    >
                        <Text style={GLOBAL_STYLES.textoBoton}>
                            {isEditing ? "Guardar cambios" : "Crear factura"}
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

            <BottomBar />
        </KeyboardAvoidingView>
    );
};

export default CreateFactura;