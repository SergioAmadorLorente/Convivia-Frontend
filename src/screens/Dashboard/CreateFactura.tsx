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
import { useTranslation } from 'react-i18next';
import AssignUsersPopup from "../../components/ui/AssignUsersPopup";
import { useAuthListener } from "../../hooks/useAuthListener";
import { obtenerUsuarioPorId, obtenerUsuarios } from "../../api/usuario";
import { obtenerEspacioPorUsuarioId, obtenerUsuarioEspacios } from "../../api/usuarioEspacio";
import { useEditFactura } from "../../hooks/useEditFactura";
import { crearFacturaEnEspacio, editarFactura, subirImagenFactura, actualizarImagenFactura, eliminarImagenFactura, obtenerImagenFactura, FacturaPayload } from "../../api/factura";
import { Alert } from "react-native";
import UserList from "../../components/ui/UserList";
import { useToast } from "../../hooks/useToast";
import Popup from "../../components/ui/Popup";

const { hp } = HELPERS;

const CreateFactura: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { t } = useTranslation();

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
        navigation.setOptions({ title: isEditing ? t('createInvoice.titleEdit') : t('createInvoice.titleCreate') });
    }, [navigation, isEditing, t]);

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

    // Back navigation confirmation popup
    const [backConfirmVisible, setBackConfirmVisible] = useState(false);
    const pendingBackAction = useRef<any>(null);
    // Flag to skip the confirmation when navigating back after a successful save
    const isSavingRef = useRef(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            // If we are saving, allow the navigation without showing the modal
            if (isSavingRef.current) {
                isSavingRef.current = false;
                return;
            }
            if (e.data.action.type === 'GO_BACK' || e.data.action.type === 'POP') {
                e.preventDefault();
                pendingBackAction.current = e.data.action;
                setBackConfirmVisible(true);
            }
        });
        return unsubscribe;
    }, [navigation]);

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

                        // Si estamos creando una nueva factura y aún no hay usuarios, pre-asignar solo al usuario actual
                        if (!isEditing && assignedUsers.length === 0) {
                            const currentUser = misMiembros.find((u: any) => u.id === user?.uid);
                            if (currentUser) {
                                setAssignedUsers([currentUser]);
                            }
                        }
                    }
                }
            } catch (err) {
                // console.error("Error fetching space members:", err);
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

    const { show: showToast } = useToast();

    const handleSave = async () => {
        if (!name || !amount) {
            showToast({
                entity: "factura",
                name: name || t('createInvoice.namePlaceholder'),
                tone: "error",
                autoHideMs: 3000
            });
            return;
        }

        if (assignedUsers.length === 0) {
            showToast({
                entity: "factura",
                name: t('createInvoice.toasts.mustAssignUser'),
                tone: "error",
                autoHideMs: 3000
            });
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
                // Preservar el estado si ya existía, sino inicializar a true (pendiente)
                deudoresDict[id] = deudoresRaw[id] !== undefined ? deudoresRaw[id] : true;
            });

            const numDeudores = Object.keys(deudoresDict).length || 1;
            const precioTotal = parseFloat(amount);
            // La factura está pagada globalmente solo si todos los deudores están en false (pagado)
            const esPagadoGlobal = Object.values(deudoresDict).every(val => val === false);

            const payload: FacturaPayload = {
                nombre: name,
                precio: precioTotal,
                pagoMediano: precioTotal / numDeudores,
                pagado: esPagadoGlobal,
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

            // Gestión de imagen (errores aquí no bloquean el guardado de la factura)
            const targetFacturaId = (isEditing && facturaIdToEdit) ? facturaIdToEdit : newFacturaId;
            if (targetFacturaId) {
                try {
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
                } catch (imgErr) {
                    console.warn("Error al gestionar imagen de factura:", imgErr);
                    showToast({
                        entity: "factura",
                        name: t('createInvoice.toasts.imageError') || "Error al subir la imagen, pero la factura fue guardada.",
                        tone: "error",
                        autoHideMs: 4000
                    });
                }
            }

            showToast({
                entity: "factura",
                name: isEditing ? t('createInvoice.toasts.updatedSuccess') : t('createInvoice.toasts.createdSuccess'),
                tone: "success",
                autoHideMs: 3000
            });

            if (route.params?.onSave) {
                route.params.onSave();
            }

            isSavingRef.current = true;
            navigation.goBack();
        } catch (err) {
            // console.error("Error al guardar factura:", err);
            showToast({
                entity: "factura",
                name: t('createInvoice.toasts.saveError'),
                tone: "error",
                autoHideMs: 3000
            });
        } finally {
            setSaving(false);
        }
    };
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
                <View style={{ marginBottom: 15, alignItems: "center", width: "100%" }}>
                    <TextField
                        value={name}
                        onChangeText={(text: string) => setName(text)}
                        placeholder={t('createInvoice.namePlaceholder')}
                    />
                    <LargeTextField
                        value={description}
                        onChangeText={(text: string) => setDescription(text)}
                        placeholder={t('createInvoice.descriptionPlaceholder')}
                    />
                </View>

                <View style={{ width: "100%", gap: 10, }}>
                    <Desplegable
                        title={t('createInvoice.price')}
                        fontSize={SIZES.text16}
                        fontWeight="bold"
                        collapsible={false}
                        showIcon={false}
                    >
                        <MoneyInput value={amount} onChange={(val) => setAmount(val)} />
                    </Desplegable>


                    <Desplegable
                        title={t('createInvoice.assignToCompanions')}
                        fontSize={SIZES.text16}
                        fontWeight="bold"
                        collapsible={false}
                        showIcon={false}
                        lineStyle={{ marginBottom: 4 }}
                        contentStyle={{ marginTop: -9 }}
                    >
                        <Button
                            style={[GLOBAL_STYLES.buttonSecondaryGrey, { marginBottom: 15 }]}
                            onPress={() => setAssignPopupVisible(true)}
                        >
                            <Text style={GLOBAL_STYLES.textoBoton}>
                                {t('createInvoice.assignButton')}
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
                                                {pendiente ? t('createInvoice.statusPending') : t('createInvoice.statusPaid')}
                                            </Text>
                                        </View>
                                    );
                                }}
                            />
                        )}
                    </Desplegable>

                    <View style={{ marginTop: 5 }}>
                        <Desplegable
                            title={t('createInvoice.photoOptional')}
                            fontSize={SIZES.text16}
                            fontWeight="bold"
                            collapsible={false}
                            showIcon={false}
                        >

                            <UploadImage
                                label={t('createInvoice.photoLabel')}
                                initialImageUri={imageUri}
                                editable={true}
                                onImageSelected={(uri) => setImageUri(uri ?? undefined)}
                            />
                        </Desplegable>
                    </View>
                </View>

                <View style={{ width: "100%", marginTop: 5, alignItems: "center" }}>


                    <Button
                        style={GLOBAL_STYLES.buttonPrimaryGreen}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={GLOBAL_STYLES.textoBoton}>
                            {saving ? t('common.loading') : (isEditing ? t('common.save') : t('createInvoice.createButton'))}
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

            {/* Back navigation confirmation popup */}
            <Popup
                visible={backConfirmVisible}
                onClose={() => setBackConfirmVisible(false)}
                title={isEditing ? t('createInvoice.backConfirm.titleEdit') : t('createInvoice.backConfirm.titleCreate')}
                description={t('createInvoice.backConfirm.description')}
                imageType="goback"
                buttons={[
                    {
                        text: t('createInvoice.backConfirm.exit'),
                        onPress: () => {
                            setBackConfirmVisible(false);
                            if (pendingBackAction.current) {
                                navigation.dispatch(pendingBackAction.current);
                            }
                        },
                    },
                    {
                        text: isEditing
                            ? t('createInvoice.backConfirm.continueEdit')
                            : t('createInvoice.backConfirm.continueCreate'),
                        onPress: () => {
                            setBackConfirmVisible(false);
                            pendingBackAction.current = null;
                        },
                    },
                ]}
            />

            <BottomBar />
        </KeyboardAvoidingView >
    );
};

export default CreateFactura;