import React, { useState, useRef, useEffect } from 'react';
import { GLOBAL_STYLES, WEB_FULL_VIEWPORT } from '../../../styles/styles';
import styles from '../../../styles/styles';
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	ScrollView,
	Dimensions,
	Platform,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard,
	StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuthListener } from '../../../hooks/useAuthListener';
import { obtenerUsuarioPorId, actualizarUsuario, subirFotoUsuario, getFullFotoUrl } from '../../../api/usuario';
import { useProfilePhoto } from '../../../hooks/useProfilePhoto';
import { useUser } from '../../../hooks';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import useLoadFonts from '../../../hooks/useLoadFonts';
import { useKeyboardAware } from '../../../hooks';
import TextField from '../../../components/ui/TextField';
import Button from '../../../components/ui/Button';
import Popup from '../../../components/ui/Popup';
import { COLORS, FONTS } from '../../../styles/theme';
import {
	heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Perfilicono from '../../../assets/Perfilicono.svg';

const { width } = Dimensions.get('window');

const EditarPerfil = () => {
	const navigation = useNavigation<any>();
	const currentUser = useAuthListener();
	const { refreshUserData } = useUser();
	const { t } = useTranslation();
	const { photoUri, savePhoto } = useProfilePhoto(currentUser?.uid);
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
			if (isSavingRef.current) {
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

	const fontsLoaded = useLoadFonts();
	const containerRef = useRef<any>(null);
	useKeyboardAware({ containerRef, padding: 12 });

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
					console.log('User Data fetched:', userData);
					if (userData) {
						setNombre(userData.nombre || userData.Nombre || '');
						setTelefono(userData.telefono || userData.Telefono || '');
						setCorreo(userData.email || userData.Email || '');
						setDbPassword(userData.password || userData.Password || '');
						const backendPhotoUrl = getFullFotoUrl(userData.fotoUrl || userData.FotoUrl);
						if (backendPhotoUrl) {
							setFoto(backendPhotoUrl);
						}
					}
				} catch (error) {
					// console.error("Error cargando perfil:", error);
				} finally {
					setIsLoading(false);
				}
			}
		};
		loadUserData();
	}, [currentUser]);

	// Sincroniza la foto si photoUri cambia desde el hook
	useEffect(() => {
		if (photoUri) setFoto(photoUri);
	}, [photoUri]);

	if (!fontsLoaded) {
		return null;
	}

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			quality: 0.8,
		});
		if (!result.canceled && result.assets && result.assets.length > 0) {
			const uri = result.assets[0].uri;
			setFoto(uri);
		}
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

		// Si el usuario intenta cambiar la contraseña
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

			// Subir foto si es una imagen local recién seleccionada
			if (
				foto &&
				(foto.startsWith('file:') ||
					foto.startsWith('content:') ||
					foto.startsWith('ph:') ||
					foto.startsWith('blob:'))
			) {
				console.log('Subiendo nueva foto de perfil al backend:', foto);
				const uploadedUrl = await savePhoto(foto);
				// Actualizar foto local con la URL del backend para que el display sea inmediato
				if (uploadedUrl) {
					setFoto(uploadedUrl);
					currentFotoUrl = uploadedUrl;
				}
			}

			const payload: any = {
				nombre,
				email: correo,
				telefono,
				password: finalPassword, // Siempre enviamos la contraseña (nueva o la actual)
			};

			if (currentFotoUrl && !currentFotoUrl.startsWith('file:')) {
				payload.fotoUrl = currentFotoUrl;
			}

			console.log('Enviando actualización de perfil:', payload);
			await actualizarUsuario(currentUser.uid, payload);

			// Refrescar los datos globales del usuario en el contexto
			await refreshUserData();

			// Limpiar campos de contraseña tras éxito
			setContrasenaActual('');
			setNuevaContrasena('');
			setRepetirContrasena('');
			// Actualizar la contraseña guardada si cambió
			if (nuevaContrasena) setDbPassword(nuevaContrasena);

			isSavingRef.current = true;

			showPopup({
				title: t('editProfile.popups.success.title'),
				description: t('editProfile.popups.success.description'),
				imageType: 'success',
				buttons: [{ text: t('common.accept'), onPress: () => { handleClosePopup(); navigation.navigate('Perfil'); } }],
			});
		} catch (error) {
			// console.error("Error actualizando perfil:", error);
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
		<View>
			<ScrollView

				contentContainerStyle={[
					GLOBAL_STYLES.scrollContainer2,

					Platform.OS === "web" ? WEB_FULL_VIEWPORT : {},
					{ alignItems: "center" },
				]}
				showsVerticalScrollIndicator={false}
				nestedScrollEnabled
				keyboardShouldPersistTaps="handled"
			>

				{/* Avatar Container */}
				<View style={editarPerfilStyles.avatarOuterWrapper}>
					<TouchableOpacity style={editarPerfilStyles.avatarWrapper} onPress={pickImage}>
						{foto ? (
							<Image
								source={{ uri: foto }}
								style={editarPerfilStyles.foto}
								onError={() => {
									console.warn('[EditarPerfil] Error al cargar imagen:', foto);
									setFoto(null);
								}}
							/>
						) : (
							<View style={editarPerfilStyles.fotoPlaceholder}>
								<Perfilicono width={100} height={100} />
							</View>
						)}
					</TouchableOpacity>

					{/* Botón quitar foto — solo visible cuando hay foto */}
					{foto ? (
						<TouchableOpacity
							style={editarPerfilStyles.removeFotoBadge}
							onPress={() => setFoto(null)}
							activeOpacity={0.8}
						>
							<Ionicons name="close" size={16} color="#fff" />
						</TouchableOpacity>
					) : null}
				</View>

				{/* Form Fields */}
				<TextField
					value={nombre}
					onChangeText={setNombre}
					placeholder={t('editProfile.namePlaceholder')}
				/>

				<TextField
					value={telefono}
					onChangeText={setTelefono}
					placeholder={t('editProfile.phonePlaceholder')}
					keyboardType="phone-pad"
				/>

				<TextField
					value={correo}
					onChangeText={setCorreo}
					placeholder={t('editProfile.emailPlaceholder')}
					keyboardType="email-address"
				/>

				<Text style={editarPerfilStyles.sectionTitle}>{t('editProfile.changePassword')}</Text>

				<Text style={editarPerfilStyles.fieldLabel}>{t('editProfile.currentPassword')}</Text>
				<TextField
					value={contrasenaActual}
					onChangeText={setContrasenaActual}
					placeholder="• • • • • • • •"
					secureTextEntry
				/>

				<Text style={editarPerfilStyles.fieldLabel}>{t('editProfile.newPassword')}</Text>
				<TextField
					value={nuevaContrasena}
					onChangeText={setNuevaContrasena}
					placeholder="• • • • • • • •"
					secureTextEntry
				/>
				<Text style={[GLOBAL_STYLES.helperText, { marginTop: 5, paddingLeft: 5 }]}>
					{t('editProfile.passwordHint')}
				</Text>

				<Text style={editarPerfilStyles.fieldLabel}>{t('editProfile.confirmPassword')}</Text>
				<TextField
					value={repetirContrasena}
					onChangeText={setRepetirContrasena}
					placeholder="• • • • • • • •"
					secureTextEntry
				/>

				<Button
					onPress={handleSubmit}
					style={editarPerfilStyles.submitButton}
				>
					{t('editProfile.saveButton')}
				</Button>
			</ScrollView>

			<Popup
				visible={popupVisible}
				onClose={handleClosePopup}
				title={popupOptions.title || ''}
				description={popupOptions.description}
				imageType={popupOptions.imageType}
				buttons={popupOptions.buttons}
			/>

			{/* Back navigation confirmation popup */}
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
							if (pendingBackAction.current) {
								navigation.dispatch(pendingBackAction.current);
							}
						},
					},
					{
						text: t('createTask.backConfirm.continueEdit'),
						onPress: () => {
							setBackConfirmVisible(false);
							pendingBackAction.current = null;
						},
					},
				]}
			/>
		</View >
	);
};

const editarPerfilStyles = StyleSheet.create({
	avatarOuterWrapper: {
		marginBottom: hp('5%'),
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	avatarWrapper: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	foto: {
		width: 140,
		height: 140,
		borderRadius: 70,
	},
	fotoPlaceholder: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	removeFotoBadge: {
		position: 'absolute',
		bottom: 4,
		right: -4,
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: '#C0392B',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#fff',
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3,
	},
	submitButton: {
		marginTop: hp('3%'),
		marginBottom: hp('8%'),
	},
	sectionTitle: {
		fontSize: 16,
		color: '#6B705C',
		fontFamily: FONTS.title,
		marginTop: hp('4%'),
		marginBottom: hp('2%'),
		textAlign: 'left',
		width: '90%',
		paddingBottom: hp('1%'),
		borderBottomWidth: 2,
		borderBottomColor: '#6B705C',
	},
	fieldLabel: {
		fontSize: 16,
		color: '#333',
		fontFamily: FONTS.regular,
		textAlign: 'left',
		width: '90%',
		marginTop: hp('2%'),
		marginBottom: hp('0.5%'),
	},
});

export default EditarPerfil;
