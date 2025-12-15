import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from '../../styles/styles';
import styles from '../../styles/styles';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Popup from '../../components/ui/Popup';
import { useKeyboardAware } from '../../hooks';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import ConfettiButton from '../../components/ui/ConfettiButton';

import { crearEspacioConUsuario } from '../../api/espacio';
import { auth } from '../../configs/firebaseConfig';

const NuevaResidencia: React.FC = () => {
  const [nombreResidencia, setNombreResidencia] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});

  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };

  const handleClosePopup = () => setPopupVisible(false);

  const hasText = nombreResidencia.trim().length > 0 && direccion.trim().length > 0;

  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular, Montserrat_400Regular, Montserrat_700Bold });

  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6B705C" />
      </View>
    );
  }

  const handleCrear = async () => {
    if (!hasText) {
      showPopup({ title: 'Campos requeridos', description: 'Por favor, completa todos los campos.', imageType: 'error', buttons: [{ text: 'Aceptar', onPress: () => { } }] });
      return;
    }

    // Verificar que el usuario esté autenticado
    const user = auth.currentUser;
    if (!user) {
      showPopup({
        title: 'Error de autenticación',
        description: 'No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.',
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => navigation.navigate('IniciarSesion') }]
      });
      return;
    }

    setLoading(true);
    try {
      // Crear espacio y relación con el usuario automáticamente
      const resultado = await crearEspacioConUsuario(
        {
          nombre: nombreResidencia,
          direccion: direccion
        },
        user.uid,  // ID del usuario autenticado de Firebase
        'admin'    // Rol del usuario (creador es admin)
      );

      console.log('Residencia creada:', resultado.espacio);
      console.log('Relación usuario-espacio creada:', resultado.usuarioEspacio);

      showPopup({
        title: 'Éxito',
        description: 'Residencia creada exitosamente',
        imageType: 'success',
        buttons: [{ text: 'Aceptar', onPress: () => navigation.navigate('DashBoardPersonal') }]
      });
    } catch (error) {
      console.error('Error al crear residencia:', error);
      showPopup({
        title: 'Error',
        description: 'Error al crear la residencia. Intenta de nuevo.',
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => { } }]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <><TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? hp('8%') : 0}>
        <View ref={containerRef} style={[styles.container, Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {}]}>
          <Text style={[styles.titulo, { fontSize: 40, textAlign: 'center' }]}>Crea una nueva residencia</Text>

          <Text style={GLOBAL_STYLES.subtitle}>
            <Text >Obtén el código de tu residencia en el apartado </Text>
            <Text >Perfil - Mi residencia</Text>
          </Text>

          <TextField label="Nombre de la residencia" value={nombreResidencia} onChangeText={setNombreResidencia} placeholder="Piso Tarragona" />
          <TextField label="Dirección" value={direccion} onChangeText={setDireccion} placeholder="Calle Ejemplo 123" />
          {!hasText && (nombreResidencia.length > 0 || direccion.length > 0) && <Text style={styles.errorText}>Completa todos los campos</Text>}

          <ConfettiButton
            style={[GLOBAL_STYLES.buttonPrimaryGreen, { backgroundColor: hasText ? '#E6ECDC' : '#ccc' }]}
            disabled={!hasText || loading}
            onPress={handleCrear}
            loading={loading}
          >
            Crear
          </ConfettiButton>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback><Popup
        visible={popupVisible}
        onClose={handleClosePopup}
        title={popupOptions.title || ''}
        description={popupOptions.description}
        imageType={popupOptions.imageType}
        buttons={popupOptions.buttons} />
    </>
  );
};



export default NuevaResidencia;
