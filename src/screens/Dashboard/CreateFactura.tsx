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
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import AssignUsersPopup from "../../components/ui/AssignUsersPopup";
import { useAuthListener } from "../../hooks/useAuthListener";
import { obtenerUsuarioPorId, obtenerUsuarios } from "../../api/usuario";
import { obtenerEspacioPorUsuarioId, obtenerUsuarioEspacios } from "../../api/usuarioEspacio";
import { useEditFactura } from "../../hooks/useEditFactura";
import { crearFacturaEnEspacio, editarFactura, subirImagenFactura, actualizarImagenFactura, eliminarImagenFactura, obtenerImagenFactura, FacturaPayload } from "../../api/factura";
import { Alert } from "react-native";
import UserList from "../../components/ui/UserList";

const { hp } = HELPERS;

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
                id: f.IdFactura || f.id,
                name: f.Nombre || f.name || "",
                description: f.Descripcion || f.description || "",
                amount: f.Precio != null ? String(f.Precio) : (f.amount || ""),
                assignedUsers: f.UsuariosAsignados || f.assignedUsers || [],
                imageUri: undefined,
            });
            if (f.deudores && typeof f.deudores === "object") {
                setDeudoresRaw(f.deudores as Record<string, boolean>);
            } else if (Array.isArray(f.UsuariosAsignados) && f.UsuariosAsignados.length > 0) {
                // Reconstruir deudoresRaw desde UsuariosAsignados:
                // completed=true → pagado (false en el dict), completed=false/undefined → pendiente (true)
                const rebuilt: Record<string, boolean> = {};
                f.UsuariosAsignados.forEach((u: any) => {
                    if (u.id) rebuilt[u.id] = !u.completed;
                });
                setDeudoresRaw(rebuilt);
            }
        }
    }, [route.params]);

    const [imagenOriginal, setImagenOriginal] = useState<string | null>(null);
    // deudores: relacionId -> true (pendiente) | false (pagado)
    const [deudoresRaw, setDeudoresRaw] = useState<Record<string, boolean>>({});

    const user = useAuthListener();
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [checkedAutoasign, setcheckedAutoasign] = useState(false);
    const [assignPopupVisible, setAssignPopupVisible] = useState(false);

    const currentUserData = useMemo(() => {
        return {
            id: user?.uid || "0",
            name: user?.displayName || user?.email?.split("@")[0] || "Yo"
        };
    }, [user]);

    useEffect(() => {
        const fetchMembers = async () => {
            if (!user?.uid) return;
            setLoadingUsers(true);
            try {
                const relacion = await obtenerEspacioPorUsuarioId(user.uid);
                if (relacion?.espacioId) {
                    const eId = relacion.espacioId;
                    const [todasRelaciones, todosUsuarios] = await Promise.all([
                        obtenerUsuarioEspacios(),
                        obtenerUsuarios()
                    ]);

                    const userMap: Record<string, string> = {};
                    if (Array.isArray(todosUsuarios)) {
                        todosUsuarios.forEach((u: any) => {
                            userMap[u.id] = u.nombre || u.Nombre || u.email || u.id;
                        });
                    }

                    if (Array.isArray(todasRelaciones)) {
                        const misMiembros = todasRelaciones
                            .filter((r: any) => r.espacioId === eId)
                            .map((r: any) => ({
                                id: r.usuarioId,
                                relacionId: r.id || r.id_UsuarioEspacio,
                                name: userMap[r.usuarioId] || "Miembro"
                            }));
                        setAvailableUsers(misMiembros);

                        // Si estamos creando una nueva factura y aún no hay usuarios, pre-asignar a todos los miembros
                        if (!isEditing && assignedUsers.length === 0) {
                            setAssignedUsers(misMiembros);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching space members:", err);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchMembers();
    }, [user]);

    useEffect(() => {
        if (assignedUsers.some(u => u.id === currentUserData.id)) {
            setcheckedAutoasign(true);
        } else {
            setcheckedAutoasign(false);
        }
    }, [assignedUsers, currentUserData.id]);

    const [saving, setSaving] = useState(false);

    // Cargar imagen existente cuando estamos editando
    useEffect(() => {
        const cargarImagenFactura = async () => {
            if (!isEditing || !user?.uid) return;
            const facturaId = route.params?.facturaToEdit?.IdFactura || route.params?.facturaToEdit?.id;
            if (!facturaId) return;
            try {
                const relacion = await obtenerEspacioPorUsuarioId(user.uid);
                const eId = relacion?.espacioId;
                if (!eId) return;
                const blob = await obtenerImagenFactura(eId, facturaId);
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    setImageUri(base64data);
                    setImagenOriginal(base64data);
                };
            } catch (error) {
                console.log('No hay imagen previa para esta factura o error al cargarla:', error);
                setImageUri(undefined);
                setImagenOriginal(null);
            }
        };
        cargarImagenFactura();
    }, [isEditing, user]);

    const handleSave = async () => {
        if (!name || !amount) {
            Alert.alert("Error", "El nombre y el precio son obligatorios.");
            return;
        }

        if (assignedUsers.length === 0) {
            Alert.alert("Error", "Debes asignar al menos un usuario a la factura.");
            return;
        }

        setSaving(true);
        try {
            const relacion = await obtenerEspacioPorUsuarioId(user?.uid || "");
            const eId = relacion?.espacioId;
            if (!eId) throw new Error("No se encontró el espacio del usuario.");

            // Usar directamente los IDs de usuario para el dict de deudores
            const usuariosAsignacionRaw = assignedUsers.map((u: any) => u.id).filter((id: any) => !!id);

            const eIdToUse = eId;
            const creadorId = relacion.id || relacion.id_UsuarioEspacio;
            const deudoresDict: Record<string, boolean> = {};

            usuariosAsignacionRaw.forEach((id: string) => {
                deudoresDict[id] = true; // true = Pendiente de pago
            });

            const numDeudores = Object.keys(deudoresDict).length || 1;
            const precioTotal = parseFloat(amount);

            const payload: FacturaPayload = {
                nombre: name,
                precio: precioTotal,
                pagoMediano: precioTotal / numDeudores,
                pagado: false,
                creadorFactura: creadorId,
                deudores: deudoresDict
            };

            console.log("📤 Enviando Factura Payload:", JSON.stringify(payload, null, 2));

            let result;
            const facturaIdToEdit = route.params?.facturaToEdit?.IdFactura || route.params?.facturaToEdit?.id;

            if (isEditing && facturaIdToEdit) {
                result = await editarFactura(eIdToUse, facturaIdToEdit, payload);
            } else {
                result = await crearFacturaEnEspacio(eIdToUse, payload);
            }

            const newFacturaId = result?.id || result?.IdFactura;

            // Gestión de imagen
            const targetFacturaId = (isEditing && facturaIdToEdit) ? facturaIdToEdit : newFacturaId;
            if (targetFacturaId) {
                if (imageUri && imageUri !== imagenOriginal) {
                    // Hay imagen nueva o cambiada
                    if (imagenOriginal) {
                        await actualizarImagenFactura(eIdToUse, targetFacturaId, imageUri);
                    } else {
                        await subirImagenFactura(eIdToUse, targetFacturaId, imageUri);
                    }
                    setImagenOriginal(imageUri);
                } else if (!imageUri && imagenOriginal) {
                    // Se eliminó la imagen
                    await eliminarImagenFactura(eIdToUse, targetFacturaId);
                    setImagenOriginal(null);
                }
            }

            Alert.alert("Éxito", isEditing ? "Factura actualizada correctamente." : "Factura creada correctamente.");

            if (route.params?.onSave) {
                route.params.onSave();
            }

            navigation.goBack();
        } catch (err) {
            console.error("Error al guardar factura:", err);
            Alert.alert("Error", "No se pudo guardar la factura. Inténtalo de nuevo.");
        } finally {
            setSaving(false);
        }
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
                            style={[GLOBAL_STYLES.buttonSecondaryGrey, { marginBottom: 15 }]}
                            onPress={() => setAssignPopupVisible(true)}
                        >
                            <Text style={GLOBAL_STYLES.textoBoton}>
                                Asignar usuario a la factura
                            </Text>
                        </Button>


                        {assignedUsers.length > 0 && (
                            <UserList
                                users={assignedUsers.map((u: any) => ({
                                    id: u.id || u.relacionId || "",
                                    name: u.name || u.Nombre || `Usuario (${(u.id || u.relacionId || "").slice(0, 8)})`,
                                }))}
                                renderExtra={({ userId }) => {
                                    if (!(userId in deudoresRaw)) return null;
                                    const pendiente = deudoresRaw[userId];
                                
                                    return (
                                        <View
                                            style={{
                                                paddingHorizontal: 10,
                                                paddingVertical: 3,
                                                borderRadius: 12,
                                                backgroundColor: pendiente ? "#FFF3CD" : "#E6ECDC",
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontFamily: "Montserrat_700Bold",
                                                    fontSize: 11,
                                                    color: pendiente ? "#856404" : "#4B4741",
                                                }}
                                            >
                                                {pendiente ? "Pendiente" : "Pagado"}
                                            </Text>
                                        </View>
                                    );
                                }}
                            />
                        )}
                    </Desplegable>

                    <Desplegable
                        title="Foto (opcional)"
                        fontSize={SIZES.text16}
                        fontWeight="bold"
                        collapsible={false}
                        showIcon={false}
                    >

                        <UploadImage
                            label="Imagen de la factura"
                            initialImageUri={imageUri}
                            editable={true}
                            onImageSelected={(uri) => setImageUri(uri ?? undefined)}
                        />
                    </Desplegable>
                </View>

                <View style={{ width: "100%", marginTop: 20, alignItems: "center" }}>


                    <Button
                        style={GLOBAL_STYLES.buttonPrimaryGreen}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={GLOBAL_STYLES.textoBoton}>
                            {saving ? "Guardando..." : (isEditing ? "Guardar cambios" : "Crear factura")}
                        </Text>
                    </Button>
                </View>
            </ScrollView>

            <AssignUsersPopup
                visible={assignPopupVisible}
                onClose={() => setAssignPopupVisible(false)}
                users={availableUsers}
                loadingUsers={loadingUsers}
                multiSelect={true}
                initialSelectedIds={assignedUsers.map((u: any) => u.id)}
                onConfirm={(selected) => {
                    console.log("Usuarios asignados:", selected);
                    setAssignedUsers(selected);
                }}
            />

            <BottomBar />
        </KeyboardAvoidingView >
    );
};

export default CreateFactura;