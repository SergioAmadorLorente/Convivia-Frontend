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
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from '../styles/styles';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import Popup from '../components/ui/Popup';
import { useKeyboardAware } from '../hooks';

const UnirResidencia: React.FC = () => {
  const [codigoResidencia, setCodigoResidencia] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});

  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };

  const handleClosePopup = () => setPopupVisible(false);

  const formatoValido = /^\d-\d-\d-\d-\d-\d$/;
  const isValidCode = formatoValido.test(codigoResidencia.trim());

  const handleUnirse = async () => {
    if (!isValidCode) {
      showPopup({ title: 'Código inválido', description: 'Por favor, ingresa un código válido con el formato 0-0-0-0-0-0.', imageType: 'error', buttons: [{ text: 'Aceptar', onPress: () => {} }] });
      return;
    }

    setLoading(true);
    try {
      showPopup({ title: 'Éxito', description: 'Te has unido exitosamente a la residencia', imageType: 'success', buttons: [{ text: 'Aceptar', onPress: () => navigation.navigate('DashBoardPersonal') }] });
    } catch (error) {
      console.error('Error al unirse a la residencia:', error);
      showPopup({ title: 'Error', description: 'No se pudo unir a la residencia. Intenta de nuevo.', imageType: 'error', buttons: [{ text: 'Aceptar', onPress: () => {} }] });
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: 'center' }]}> 
        <ActivityIndicator size="large" color="#6B705C" />
      </View>
    );
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'android' ? hp('8%') : 0}>
        <View ref={containerRef} style={[GLOBAL_STYLES.container, Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {}]}>
          <Text style={GLOBAL_STYLES.title}>Únete a una residencia</Text>

          <Text style={GLOBAL_STYLES.subtitle}>
            <Text style={{ fontWeight: 'bold' }}>Obtén el código de la residencia a la que quieres unirte en el apartado </Text>
            <Text style={{ fontStyle: 'italic' }}>Perfil - Mi residencia</Text>
          </Text>

          <View style={GLOBAL_STYLES.inputGroup}>
            <Text style={GLOBAL_STYLES.label}>Código de la residencia</Text>
            <TextInput
              style={[
                GLOBAL_STYLES.input,
                {
                  borderColor: codigoResidencia.length === 0 ? '#CCC' : isValidCode ? '#28e80eff' : 'red',
                },
              ]}
              placeholder="0-0-0-0-0-0"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              value={codigoResidencia}
              onChangeText={setCodigoResidencia}
            />
            {!isValidCode && codigoResidencia.length > 0 && <Text style={GLOBAL_STYLES.errorText}>Formato inválido. Usa 0-0-0-0-0-0</Text>}
          </View>

          <TouchableOpacity style={[GLOBAL_STYLES.primaryButton, { backgroundColor: isValidCode ? '#E6ECDC' : '#ccc' }]} disabled={!isValidCode || loading} onPress={handleUnirse}>
            {loading ? <ActivityIndicator size="small" color="#4B4741" /> : <Text style={GLOBAL_STYLES.primaryButtonText}>Unirse</Text>}
          </TouchableOpacity>
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
      />
    </>
  );
};



export default UnirResidencia;
