import {
    View,
    Text,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity,
    Alert,
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
import { crearFactura, editarFactura, FacturaPayload, subirImagenFactura, actualizarImagenFactura } from "../../api/factura";
import { obtenerEspacioPorId } from "../../api/espacio";
import { obtenerEspacioPorUsuarioId } from "../../api/usuarioEspacio";
import { useAuthListener } from "../../hooks/useAuthListener";

const { hp } = HELPERS;

const CreateFactura: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const user = useAuthListener();
    const CURRENT_USER_ID = user?.uid || "0";
    const CURRENT_USER = { id: CURRENT_USER_ID, name: user?.displayName || "Yo" };

    const {
        name, setName,
        description, setDescription,
        amount, setAmount,
        assignedUsers, setAssignedUsers,
        imageUri, setImageUri,
        isEditing,
        loadFactura,
        getFacturaData,
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
    const [submitting, setSubmitting] = useState(false);

    const [availableUsers] = useState([
        //anyadir hook de jose aqui
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
                        onPress={async() => {
                            setSubmitting(true);
                            try {
                                const fact = getFacturaData();

                                // Validación cliente: nombre y precio
                                if (!fact.name || String(fact.name).trim() === "") {
                                    Alert.alert("Error", "El nombre de la factura es obligatorio.");
                                    return;
                                }

                                // Normalizar y parsear precio (aceptar coma como separador decimal)
                                const rawAmount = fact.amount ?? "";
                                const normalized = (typeof rawAmount === 'string' ? rawAmount : String(rawAmount)).replace(',', '.').replace(/[^0-9.\-]/g, '');
                                const parsedPrice = Number(normalized);

                                if (!isFinite(parsedPrice) || parsedPrice <= 0) {
                                    Alert.alert("Error", "Introduce un precio válido mayor que 0.");
                                    return;
                                }

                                const apifact: FacturaPayload = {
                                    Nombre: fact.name,
                                    Precio: parsedPrice,
                                    PagoMediano: null,
                                    Deudores: Object.fromEntries(
                                        (fact.assignedUsers || []).map((u: any) => [u.id, false])
                                    ),
                                    Pagado: false,
                                    CreadorFactura: CURRENT_USER_ID,
                                };

                                console.log("🔀 Payload factura a enviar:", apifact);

                                let result: any = null;

                                let spaceId: string | undefined = undefined;

                                if (isEditing) {
                                    // Para editar también intentamos averiguar el espacio (necesario si queremos actualizar imagen)
                                    const usuarioEspacio = await obtenerEspacioPorUsuarioId(CURRENT_USER_ID);
                                    spaceId = usuarioEspacio?.espacioId;

                                    result = await editarFactura(fact.id, apifact);
                                } else {
                                    // Asegurarnos de tener el espacio del usuario
                                    const usuarioEspacio = await obtenerEspacioPorUsuarioId(CURRENT_USER_ID);
                                    spaceId = usuarioEspacio?.espacioId;
                                    if (!spaceId) throw new Error("No se pudo determinar el espacio del usuario.");

                                    result = await crearFactura(spaceId, apifact);
                                }

                                // Intentar subir o actualizar imagen si proporcionaron una
                                try {
                                    const facturaId = result?.id || result?.IdFactura || result?.Id || fact.id;
                                    if (imageUri && facturaId && spaceId) {
                                        if (isEditing) {
                                            await actualizarImagenFactura(spaceId, facturaId, imageUri);
                                        } else {
                                            await subirImagenFactura(spaceId, facturaId, imageUri);
                                        }
                                    }
                                } catch (imgErr) {
                                    console.error("Error subiendo imagen de factura:", imgErr);
                                    Alert.alert("Aviso", "No se pudo subir la imagen de la factura. La factura fue guardada sin imagen.");
                                }

                                // Si se pasó un callback desde el Dashboard, lo llamamos para actualizar sin recargar
                                if (route.params?.onSave && typeof route.params.onSave === 'function') {
                                    route.params.onSave(result);
                                }

                                // Volver a la pantalla anterior; DashBoardPersonal recargará al enfocar
                                navigation.goBack();
                            } catch (e: any) {
                                console.error("Error creando/actualizando factura:", e);

                                // Extraer errores de validación del servidor si existen
                                const serverErrors = e?.response?.data?.errors;
                                if (serverErrors && typeof serverErrors === 'object') {
                                    const msgs = Object.keys(serverErrors).map((k) => {
                                        const v = serverErrors[k];
                                        if (Array.isArray(v)) return `${k}: ${v.join('; ')}`;
                                        return `${k}: ${String(v)}`;
                                    });
                                    Alert.alert("Error de validación", msgs.join('\n'));
                                } else if (e?.response?.data?.title) {
                                    Alert.alert("Error", e.response.data.title);
                                } else {
                                    Alert.alert("Error", e?.message || "No se pudo guardar la factura.");
                                }
                            } finally {
                                setSubmitting(false);
                            }
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