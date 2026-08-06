import React, { useState, useRef, useEffect } from 'react';
import { GLOBAL_STYLES, WEB_FULL_VIEWPORT } from '../../../styles/styles';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuthListener } from '../../../hooks/useAuthListener';
import { obtenerUsuarioPorId, actualizarUsuario, getFullFotoUrl } from '../../../api/usuario';
import { useProfilePhoto } from '../../../hooks/useProfilePhoto';
import { useUser } from '../../../hooks';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import useLoadFonts from '../../../hooks/useLoadFonts';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import Popup from '../../../components/ui/Popup';
import { COLORS, FONTS } from '../../../styles/theme';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Perfilicono from '../../../assets/Perfilicono.svg';

const EditarPerfil = () => {
    const navigation = useNavigation<any>();
    const currentUser = useAuthListener();
    const { refreshUserData } = useUser();
    const { t } = useTranslation();
    const { photoUri, savePhoto, removePhoto } = useProfilePhoto(currentUser?.uid);
    const [dbPassword, setDbPassword] = useState('');
    const [foto, setFoto] = useState<string | null>(null);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasenaActual, setContrasenaActual] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [repetirContrasena, setRepetirContrasena] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupOptions, setPopupOptions] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [backConfirmVisible, setBackConfirmVisible] = useState(false);
    const pendingBackAction = useRef<any>(null);
    const isSavingRef = useRef(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            if (isSavingRef.current) return;
            if (e.data.action.type === 'GO_BACK' || e.data.action.type === 'POP') {
                e.preventDefault();
                pendingBackAction.current = e.data.action;
                setBackConfirmVisible(true);
            }
        });
        return unsubscribe;
    }, [navigation]);

    const fontsLoaded = useLoadFonts();

    const showPopup = (opts: any) => {
        setPopupOptions(opts);
        setPopupVisible(true);
    };
    const handleClosePopup = () => setPopupVisible(false);

    useEffect(() => {
        const loadUserData = async () => {
            if (currentUser?.uid) {
                try {
                    setIsLoading(true);
                    const userData = await obtenerUsuarioPorId(currentUser.uid);
                    if (userData) {
                        setNombre(userData.nombre || userData.Nombre || '');
                        setTelefono(userData.telefono || userData.Telefono || '');
                        setCorreo(userData.email || userData.Email || '');
                        setDbPassword(userData.password || userData.Password || '');
                        const backendPhotoUrl = getFullFotoUrl(userData.fotoUrl || userData.FotoUrl);
                        if (backendPhotoUrl) setFoto(backendPhotoUrl);
                    }
                } catch (error) {
                    // silent
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadUserData();
    }, [currentUser]);

    useEffect(() => {
        if (photoUri) setFoto(photoUri);
    }, [photoUri]);

    if (!fontsLoaded) return null;

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
        if (!result.canceled && result.assets?.length > 0) setFoto(result.assets[0].uri);
    };

    const handleSubmit = async () => {
        if (!currentUser?.uid) {
            showPopup({
                title: t('editProfile.popups.userNotFound.title'),
                description: t('editProfile.popups.userNotFound.description'),
                imageType: 'error',
                buttons: [{ text: t('common.accept'), onPress: handleClosePopup }],
            });
            return;
        }

        let finalPassword = dbPassword;

        if (nuevaContrasena) {
            if (nuevaContrasena.length < 8 || !/\d/.test(nuevaContrasena)) {
                showPopup({
                    title: t('editProfile.popups.invalidPassword.title'),
                    description: t('editProfile.popups.invalidPassword.description'),
                    imageType: 'error',
                    buttons: [{ text: t('common.accept'), onPress: handleClosePopup }],
                });
                return;
            }
            if (nuevaContrasena !== repetirContrasena) {
                showPopup({
                    title: t('editProfile.popups.passwordMismatch.title'),
                    description: t('editProfile.popups.passwordMismatch.description'),
                    imageType: 'error',
                    buttons: [{ text: t('common.accept'), onPress: handleClosePopup }],
                });
                return;
            }
            if (contrasenaActual !== dbPassword) {
                showPopup({
                    title: t('editProfile.popups.wrongCurrentPassword.title'),
                    description: t('editProfile.popups.wrongCurrentPassword.description'),
                    imageType: 'error',
                    buttons: [{ text: t('common.accept'), onPress: handleClosePopup }],
                });
                return;
            }
            finalPassword = nuevaContrasena;
        }

        try {
            setIsLoading(true);
            let currentFotoUrl: string | null = foto;
            if (foto && (foto.startsWith('file:') || foto.startsWith('content:') || foto.startsWith('ph:') || foto.startsWith('blob:'))) {
                const uploadedUrl = await savePhoto(foto);
                if (uploadedUrl) { setFoto(uploadedUrl); currentFotoUrl = uploadedUrl; }
            }
            const fotoParaGuardar = currentFotoUrl && !currentFotoUrl.startsWith('file:') ? currentFotoUrl : '';
            const payload: any = { nombre, email: correo, telefono, password: finalPassword, fotoUrl: fotoParaGuardar, FotoUrl: fotoParaGuardar };
            await actualizarUsuario(currentUser.uid, payload);
            await refreshUserData();
            setContrasenaActual(''); setNuevaContrasena(''); setRepetirContrasena('');
            if (nuevaContrasena) setDbPassword(nuevaContrasena);
            isSavingRef.current = true;
            showPopup({
                title: t('editProfile.popups.success.title'),
                description: t('editProfile.popups.success.description'),
                imageType: 'success',
                buttons: [{ text: t('common.accept'), onPress: () => { handleClosePopup(); navigation.navigate('Perfil'); } }],
            });
        } catch (error) {
            showPopup({
                title: t('editProfile.popups.updateError.title'),
                description: t('editProfile.popups.updateError.description'),
                imageType: 'error',
                buttons: [{ text: t('common.accept'), onPress: handleClosePopup }],
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <ScrollView
                contentContainerStyle={[
                    GLOBAL_STYLES.scrollContainer2,
                    { paddingBottom: hp('15%') },
                    Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {},
                    { alignItems: 'center' },
                ]}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Hero Header ── */}
                <View style={epStyles.heroHeader}>
                    <View style={epStyles.avatarOuterWrapper}>
                        <TouchableOpacity style={epStyles.avatarRing} onPress={pickImage} activeOpacity={0.85}>
                            {foto ? (
                                <Image source={{ uri: foto }} style={epStyles.avatarImage} onError={() => setFoto(null)} />
                            ) : (
                                <View style={epStyles.avatarPlaceholder}>
                                    <Perfilicono width={90} height={90} />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Badge camara */}
                        <TouchableOpacity style={epStyles.editBadge} onPress={pickImage} activeOpacity={0.8}>
                            <Ionicons name="camera" size={14} color="#fff" />
                        </TouchableOpacity>

                        {/* Badge quitar foto */}
                        {foto ? (
                            <TouchableOpacity
                                style={epStyles.removeBadge}
                                onPress={() => { setFoto(null); removePhoto(); }}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={13} color="#fff" />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <Text style={epStyles.heroTitle}>{t('editProfile.title', 'Editar Perfil')}</Text>
                    <Text style={epStyles.heroSubtitle}>{t('editProfile.subtitle', 'Actualiza tu informacion personal y contrasena')}</Text>
                </View>

                {/* ── Card 1: Datos personales ── */}
                <View style={epStyles.card}>
                    <View style={epStyles.cardHeaderRow}>
                        <Ionicons name="person-outline" size={18} color={COLORS.primary} />
                        <Text style={epStyles.cardHeaderTitle}>{t('editProfile.sectionPersonal', 'Datos personales')}</Text>
                    </View>

                    <View style={epStyles.fieldBlock}>
                        <View style={epStyles.fieldLabelRow}>
                            <Ionicons name="text-outline" size={14} color="#8a9070" />
                            <Text style={epStyles.fieldLabel}>{t('editProfile.namePlaceholder', 'Nombre')}</Text>
                        </View>
                        <TextField value={nombre} onChangeText={setNombre} placeholder={t('editProfile.namePlaceholder')} />
                    </View>

                    <View style={epStyles.fieldBlock}>
                        <View style={epStyles.fieldLabelRow}>
                            <Ionicons name="call-outline" size={14} color="#8a9070" />
                            <Text style={epStyles.fieldLabel}>{t('editProfile.phonePlaceholder', 'Telefono')}</Text>
                        </View>
                        <TextField value={telefono} onChangeText={setTelefono} placeholder={t('editProfile.phonePlaceholder')} keyboardType="phone-pad" />
                    </View>

                    <View style={epStyles.fieldBlock}>
                        <View style={epStyles.fieldLabelRow}>
                            <Ionicons name="mail-outline" size={14} color="#8a9070" />
                            <Text style={epStyles.fieldLabel}>{t('editProfile.emailPlaceholder', 'Correo electronico')}</Text>
                        </View>
                        <TextField value={correo} onChangeText={setCorreo} placeholder={t('editProfile.emailPlaceholder')} keyboardType="email-address" />
                    </View>
                </View>

                {/* ── Card 2: Contrasena ── */}
                <View style={epStyles.card}>
                    <View style={epStyles.cardHeaderRow}>
                        <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} />
                        <Text style={epStyles.cardHeaderTitle}>{t('editProfile.changePassword', 'Cambiar contrasena')}</Text>
                    </View>

                    <Text style={epStyles.passwordHint}>{t('editProfile.passwordSectionHint', 'Deja los campos vacios si no quieres cambiar la contrasena.')}</Text>

                    <View style={epStyles.fieldBlock}>
                        <View style={epStyles.fieldLabelRow}>
                            <Ionicons name="key-outline" size={14} color="#8a9070" />
                            <Text style={epStyles.fieldLabel}>{t('editProfile.currentPassword', 'Contrasena actual')}</Text>
                        </View>
                        <TextField value={contrasenaActual} onChangeText={setContrasenaActual} placeholder="* * * * * * * *" secureTextEntry />
                    </View>

                    <View style={epStyles.fieldBlock}>
                        <View style={epStyles.fieldLabelRow}>
                            <Ionicons name="lock-open-outline" size={14} color="#8a9070" />
                            <Text style={epStyles.fieldLabel}>{t('editProfile.newPassword', 'Nueva contrasena')}</Text>
                        </View>
                        <TextField value={nuevaContrasena} onChangeText={setNuevaContrasena} placeholder="* * * * * * * *" secureTextEntry />
                        <Text style={epStyles.inputHint}>{t('editProfile.passwordHint')}</Text>
                    </View>

                    <View style={epStyles.fieldBlock}>
                        <View style={epStyles.fieldLabelRow}>
                            <Ionicons name="checkmark-circle-outline" size={14} color="#8a9070" />
                            <Text style={epStyles.fieldLabel}>{t('editProfile.confirmPassword', 'Repetir contrasena')}</Text>
                        </View>
                        <TextField value={repetirContrasena} onChangeText={setRepetirContrasena} placeholder="* * * * * * * *" secureTextEntry />
                    </View>
                </View>

                {/* ── Boton guardar ── */}
                <View style={epStyles.buttonWrapper}>
                    <Button onPress={handleSubmit} loading={isLoading} disabled={isLoading}>
                        {t('editProfile.saveButton', 'Guardar cambios')}
                    </Button>
                </View>
            </ScrollView>

            <Popup
                visible={popupVisible}
                onClose={handleClosePopup}
                title={popupOptions.title || ''}
                description={popupOptions.description}
                imageType={popupOptions.imageType}
                buttons={popupOptions.buttons}
            />

            <Popup
                visible={backConfirmVisible}
                onClose={() => setBackConfirmVisible(false)}
                title={t('createTask.backConfirm.titleEdit')}
                description={t('createTask.backConfirm.description')}
                imageType="goback"
                buttons={[
                    {
                        text: t('createTask.backConfirm.exit'),
                        onPress: () => {
                            setBackConfirmVisible(false);
                            if (pendingBackAction.current) navigation.dispatch(pendingBackAction.current);
                        },
                    },
                    {
                        text: t('createTask.backConfirm.continueEdit'),
                        onPress: () => { setBackConfirmVisible(false); pendingBackAction.current = null; },
                    },
                ]}
            />
        </KeyboardAvoidingView>
    );
};

const epStyles = StyleSheet.create({
    heroHeader: {
        width: '100%',
        alignItems: 'center',
        paddingTop: hp('4%'),
        paddingBottom: hp('3%'),
        paddingHorizontal: 24,
        backgroundColor: '#F0F4EC',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        marginBottom: 20,
    },
    avatarOuterWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarRing: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: COLORS.primary,
        overflow: 'hidden',
        backgroundColor: '#E8EDE3',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 4,
        right: -2,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    removeBadge: {
        position: 'absolute',
        top: 2,
        right: -2,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#C0392B',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    heroTitle: {
        fontFamily: FONTS.title,
        fontSize: 22,
        color: '#2D3120',
        textAlign: 'center',
        marginBottom: 6,
    },
    heroSubtitle: {
        fontFamily: FONTS.regular,
        fontSize: 13,
        color: '#8a9070',
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 16,
    },
    card: {
        width: '92%',
        backgroundColor: '#F8F9F5',
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E8EDE3',
    },
    cardHeaderTitle: {
        fontFamily: FONTS.title,
        fontSize: 15,
        color: COLORS.primary,
    },
    fieldBlock: {
        marginBottom: 12,
    },
    fieldLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 4,
    },
    fieldLabel: {
        fontFamily: FONTS.regular,
        fontSize: 13,
        color: '#6B705C',
    },
    inputHint: {
        fontFamily: FONTS.regular,
        fontSize: 11,
        color: '#a0a88e',
        marginTop: 4,
        paddingLeft: 4,
    },
    passwordHint: {
        fontFamily: FONTS.regular,
        fontSize: 12,
        color: '#a0a88e',
        marginBottom: 12,
        lineHeight: 17,
    },
    buttonWrapper: {
        width: '92%',
        marginTop: 4,
        marginBottom: hp('3%'),
    },
});

export default EditarPerfil;
