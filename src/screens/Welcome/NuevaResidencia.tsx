// src/screens/NuevaResidencia.tsx
import React, { useState, useRef } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
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
import TextField from '../../components/ui/TextField';
import ConfettiButton from '../../components/ui/ConfettiButton';
import { FONTS, COLORS } from '../../styles/styles';

import { crearEspacio } from '../../api/espacio';

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

  // Validaciones independientes
  const nombreValido =
    nombreResidencia.trim().length > 0 &&
    nombreResidencia.trim().length <= 20;

  const direccionValida =
    direccion.trim().length > 0 &&
    direccion.trim().length <= 100;

  // El botón solo se habilita si ambos son válidos
  const hasText = nombreValido && direccionValida;

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
      showPopup({
        title: 'Campo requerido',
        description: 'Por favor, ingresa un nombre y dirección válidos para la residencia.',
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => { } }],
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Cuando tengas backend, sustituye '966069' por el código real devuelto.
      const codigoBackend = '966069';

      showPopup({
        title: 'Residencia creada',
        description: 'Puedes encontrarlo de nuevo en Perfil > Mi residencia',
        imageType: 'convivia',
        code: codigoBackend,
        buttons: [
          { text: '¡Empieza!', onPress: () => navigation.navigate('DashBoardPersonal') },
        ],
      });
    } catch (error) {
      console.error('Error al crear residencia:', error);
      showPopup({
        title: 'Error',
        description: 'Error al crear la residencia. Intenta de nuevo.',
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => { } }],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? hp('8%') : 0}
        >
          <View ref={containerRef} style={[styles.container, Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {}]}>
            <Text style={[styles.titulo, { fontSize: 40, textAlign: 'center' }]}>Crea una nueva residencia</Text>

            <Text style={GLOBAL_STYLES.subtitle}>
              <Text>Obtén el código de tu residencia en el apartado </Text>
              <Text>Perfil - Mi residencia</Text>
            </Text>

            {/* Nombre */}
            <TextField
              label="Nombre de la residencia"
              value={nombreResidencia}
              onChangeText={setNombreResidencia}
              placeholder="Piso Tarragona"
            />
            {nombreResidencia.trim().length === 0 && (
              <Text style={styles.errorText}>Ingresa un nombre válido</Text>
            )}
            {nombreResidencia.trim().length > 20 && (
              <Text style={styles.errorText}>El nombre no puede superar 20 caracteres</Text>
            )}

            {/* Dirección */}
            <TextField
              label="Dirección de la residencia"
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Calle Mayor 123, Madrid"
            />
            {direccion.trim().length === 0 && (
              <Text style={styles.errorText}>Ingresa una dirección válida</Text>
            )}
            {direccion.trim().length > 100 && (
              <Text style={styles.errorText}>La dirección no puede superar 100 caracteres</Text>
            )}

            {/* Botón */}
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
      </TouchableWithoutFeedback>

      <Popup
        visible={popupVisible}
        onClose={handleClosePopup}
        title={popupOptions.title || ''}
        description={popupOptions.description}
        imageType={popupOptions.imageType}
        buttons={popupOptions.buttons}
        code={popupOptions.code}
        buttonsContainerStyle={{ marginTop: 8 }}
      />
    </>
  );
};

export default NuevaResidencia;