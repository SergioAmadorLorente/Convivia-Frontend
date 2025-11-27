import React, { useRef, useState } from 'react';
import { Text, View, Keyboard, ActivityIndicator, Platform, TouchableWithoutFeedback } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from '../../styles/styles';
import { COLORS } from '../../styles/theme';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../configs/firebaseConfig';
import Popup from '../../components/ui/Popup';
import { useKeyboardAware } from '../../hooks';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import { useEmailValidation } from '../../hooks/useEmailValidation';
const RecuperarPassword: React.FC = () => {
  const navigation = useNavigation<any>();
  const { email, setEmail, isValidEmail, emailError } = useEmailValidation();
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });
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
  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          ref={containerRef}
          style={[
            GLOBAL_STYLES.recuperarContainerPrincipal,
            Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {},
          ]}
        >
          <Text style={GLOBAL_STYLES.recuperarTitulo}>Recuperar contraseña</Text>
          <Text style={[GLOBAL_STYLES.recuperarSubtitulo, { marginBottom: 18 }]}>
            ¿Has olvidado tu contraseña?
          </Text>
          {/* BLOQUE PRINCIPAL */}
          <View style={[GLOBAL_STYLES.recuperarBloque, { marginTop: 0 }]}>
            <TextField
              label="Correo electrónico"
              placeholder="usuario@dominio"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />
            <Text style={GLOBAL_STYLES.recuperarSubTextEmail}>
              {`Ingresa tu dirección de correo electrónico y te enviaremos un enlace para que puedas crear una nueva contraseña de forma segura.\n\nLa dirección ingresada debe contar con un formato estándar (por ejemplo, usuario@dominio.com).`}
            </Text>
            <Button
              style={[
                GLOBAL_STYLES.buttonPrimaryGreen,
                { backgroundColor: isValidEmail ? COLORS.success : COLORS.disabled },
              ]}
              disabled={!isValidEmail}
              onPress={async () => {
                try {
                  await sendPasswordResetEmail(auth, email);
                  showPopup({
                    title: 'Correo enviado',
                    description: 'Se ha enviado un correo para restablecer la contraseña. Revisa tu bandeja de entrada.',
                    imageType: 'success',
                    buttons: [{ text: 'Aceptar', onPress: () => navigation.navigate('Main') }],
                  });
                } catch (err: any) {
                  showPopup({
                    title: 'Error',
                    description: 'No se pudo enviar el correo: ' + (err?.message ?? String(err)),
                    imageType: 'error',
                    buttons: [{ text: 'Aceptar', onPress: () => { } }],
                  });
                }
              }}
            >
              Enviar correo
            </Button>
            <Button onPress={() => navigation.navigate('RestablecerPassword')}
              style={[
                GLOBAL_STYLES.buttonPrimaryGreen,
                { backgroundColor: isValidEmail ? COLORS.success : COLORS.disabled },
              ]}
            >
              Boton temporal - Restablecer
            </Button>
            <Button onPress={() => navigation.navigate('VerificacionCuentaNueva')}
              style={[
                GLOBAL_STYLES.buttonPrimaryGreen,
                { backgroundColor: isValidEmail ? COLORS.success : COLORS.disabled },
              ]}
            >
              Boton temporal - Verificaion cuenta nueva
            </Button>

          </View>
        </View>
      </TouchableWithoutFeedback>
      {/* POPUP */}
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
export default RecuperarPassword;