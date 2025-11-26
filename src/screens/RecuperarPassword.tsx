import React, { useState, useRef } from 'react';
import { Text, View, Keyboard, ActivityIndicator,Platform, TouchableOpacity, TextInput, TouchableWithoutFeedback } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from '../styles/styles';
import { COLORS } from '../styles/theme';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../configs/firebaseConfig';
import Popup from '../components/ui/Popup';
import { useKeyboardAware } from '../hooks';
import Button from '../components/ui/Button';

const RecuperarPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const navigation = useNavigation<any>();

  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular, Montserrat_400Regular, Montserrat_700Bold });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});

  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });

  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };

  const handleClosePopup = () => setPopupVisible(false);

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.recuperarContainerPrincipal, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError('Por favor, introduce un correo válido');
    } else {
      setEmailError('');
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View ref={containerRef} style={[GLOBAL_STYLES.recuperarContainerPrincipal, Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {}]}>
        <Text style={GLOBAL_STYLES.recuperarTitulo}>Recuperar contraseña</Text>
        <Text style={GLOBAL_STYLES.recuperarSubtitulo}>¿Has olvidado tu contraseña?</Text>

        <View style={GLOBAL_STYLES.recuperarBloque}>
          <Text style={[GLOBAL_STYLES.labelBase, GLOBAL_STYLES.labelMarginSmall, { alignSelf: 'flex-start' }]}>Correo electrónico</Text>
          <TextInput style={GLOBAL_STYLES.recuperarInput} placeholder="usuario@dominio" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={validateEmail} />
          {emailError ? <Text style={GLOBAL_STYLES.recuperarErrorText}>{emailError}</Text> : null}

          <Text style={GLOBAL_STYLES.recuperarSubTextEmail}>
            {`Ingresa tu dirección de correo electrónico y te enviaremos un enlace para que puedas crear una nueva contraseña de forma segura.\n\nLa dirección ingresada debe contar con un formato estándar (por ejemplo, usuario@dominio.com).`}
          </Text>

          <Button 
            style={[GLOBAL_STYLES.buttonPrimaryGreen, { backgroundColor: isValidEmail ? COLORS.success : COLORS.disabled }]}
            disabled={!isValidEmail}
            onPress={async () => {
              try {
                await sendPasswordResetEmail(auth, email);
                showPopup({ title: 'Correo enviado', description: 'Se ha enviado un correo para restablecer la contraseña. Revisa tu bandeja de entrada.', imageType: 'success', buttons: [{ text: 'Aceptar', onPress: () => navigation.navigate('Main') }] });
              } catch (err: any) {
                showPopup({ title: 'Error', description: 'No se pudo enviar el correo: ' + (err?.message ?? String(err)), imageType: 'error', buttons: [{ text: 'Aceptar', onPress: () => {} }] });
              }
            }}
          >
            Enviar correo
          </Button>
        </View>

        </View>
      </TouchableWithoutFeedback>
      <Popup visible={popupVisible} onClose={handleClosePopup} title={popupOptions.title || ''} description={popupOptions.description} imageType={popupOptions.imageType} buttons={popupOptions.buttons} />
    </>
  );
};

export default RecuperarPassword;
