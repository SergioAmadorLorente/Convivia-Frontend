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
import { useAuthListener } from '../../../hooks/useAuthListener';
import { obtenerUsuarioPorId, actualizarUsuario } from '../../../api/usuario';
import { Ionicons } from '@expo/vector-icons';
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
	const currentUser = useAuthListener();
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
						// Si tienes lógica para la foto, añádela aquí
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

	if (!fontsLoaded) {
		return null;
	}

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});
		if (!result.canceled && result.assets && result.assets.length > 0) {
			setFoto(result.assets[0].uri);
		}
	};

	const handleSubmit = async () => {
		if (!currentUser?.uid) {
			showPopup({
				title: 'Error',
				description: 'Usuario no identificado',
				imageType: 'error',
				buttons: [{ text: 'Aceptar', onPress: handleClosePopup }],
			});
			return;
		}

		let finalPassword = dbPassword;

		// Si el usuario intenta cambiar la contraseña
		if (nuevaContrasena) {
			if (nuevaContrasena.length < 8 || !/\d/.test(nuevaContrasena)) {
				showPopup({
					title: 'Error',
					description: 'La contraseña debe tener al menos 8 caracteres y un número.',
					imageType: 'error',
					buttons: [{ text: 'Aceptar', onPress: handleClosePopup }],
				});
				return;
			}

			if (nuevaContrasena !== repetirContrasena) {
				showPopup({
					title: 'Error',
					description: 'Las contraseñas nuevas no coinciden',
					imageType: 'error',
					buttons: [{ text: 'Aceptar', onPress: handleClosePopup }],
				});
				return;
			}

			if (contrasenaActual !== dbPassword) {
				showPopup({
					title: 'Error',
					description: 'La contraseña actual no es correcta',
					imageType: 'error',
					buttons: [{ text: 'Aceptar', onPress: handleClosePopup }],
				});
				return;
			}

			finalPassword = nuevaContrasena;
		}

		try {
			setIsLoading(true);
			const payload: any = {
				nombre,
				email: correo,
				telefono,
				password: finalPassword, // Siempre enviamos la contraseña (nueva o la actual)
			};

			console.log('Enviando actualización de perfil:', payload);
			await actualizarUsuario(currentUser.uid, payload);

			// Limpiar campos de contraseña tras éxito
			setContrasenaActual('');
			setNuevaContrasena('');
			setRepetirContrasena('');
			// Actualizar la contraseña guardada si cambió
			if (nuevaContrasena) setDbPassword(nuevaContrasena);

			showPopup({
				title: 'Éxito',
				description: 'Perfil actualizado correctamente',
				imageType: 'success',
				buttons: [{ text: 'Aceptar', onPress: handleClosePopup }],
			});
		} catch (error) {
			// console.error("Error actualizando perfil:", error);
			showPopup({
				title: 'Error',
				description: 'No se pudo actualizar el perfil',
				imageType: 'error',
				buttons: [{ text: 'Aceptar', onPress: handleClosePopup }],
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
				<TouchableOpacity style={editarPerfilStyles.avatarWrapper} onPress={pickImage}>
					{foto ? (
						<Image source={{ uri: foto }} style={editarPerfilStyles.foto} />
					) : (
						<View style={editarPerfilStyles.fotoPlaceholder}>
							<Perfilicono width={100} height={100} />
						</View>
					)}
				</TouchableOpacity>

				{/* Form Fields */}
				<TextField
					value={nombre}
					onChangeText={setNombre}
					placeholder="Nombre"
				/>

				<TextField
					value={telefono}
					onChangeText={setTelefono}
					placeholder="Teléfono"
					keyboardType="phone-pad"
				/>

				<TextField
					value={correo}
					onChangeText={setCorreo}
					placeholder="Correo electrónico"
					keyboardType="email-address"
				/>

				<Text style={editarPerfilStyles.sectionTitle}>Cambiar Contraseña</Text>

				<Text style={editarPerfilStyles.fieldLabel}>Contraseña Actual</Text>
				<TextField
					value={contrasenaActual}
					onChangeText={setContrasenaActual}
					placeholder="• • • • • • • •"
					secureTextEntry
				/>

				<Text style={editarPerfilStyles.fieldLabel}>Nueva Contraseña</Text>
				<TextField
					value={nuevaContrasena}
					onChangeText={setNuevaContrasena}
					placeholder="• • • • • • • •"
					secureTextEntry
				/>
				<Text style={[GLOBAL_STYLES.helperText, { marginTop: 5, paddingLeft: 5 }]}>
					* Mínimo 8 caracteres y al menos un número.
				</Text>

				<Text style={editarPerfilStyles.fieldLabel}>Confirma la Contraseña</Text>
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
					Guardar cambios
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
		</View >
	);
};

const editarPerfilStyles = StyleSheet.create({
	avatarWrapper: {
		marginBottom: hp('5%'),
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
