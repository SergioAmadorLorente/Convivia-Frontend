import React, { useState, useRef } from 'react';
import { GLOBAL_STYLES, WEB_FULL_VIEWPORT } from '../styles/styles';
import styles from '../styles/styles';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../configs/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale } from 'react-native-size-matters';
import useLoadFonts from '../hooks/useLoadFonts';
import {useEmailValidation} from '../hooks/useEmailValidation';
import { useKeyboardAware } from '../hooks';
import TextField from '../components/ui/TextField';
import Button from '../components/ui/Button';
import Popup from '../components/ui/Popup';
import { COLORS } from '../styles/theme';



const IniciarSesion: React.FC = () => {
  const { email, setEmail: validateEmail, emailError, isValidEmail } = useEmailValidation();
  const [password, setPassword] = useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const fontsLoaded = useLoadFonts();
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});
  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };
  const handleClosePopup = () => setPopupVisible(false);
    
      const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });

  // Button enabled when both email is valid and password exists
  const isButtonEnabled = isValidEmail && password.length > 0;
  // Button-grey condition used for subtitle color
  const isButtonGrey = !isButtonEnabled;

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      /*if (user && !user.emailVerified) {
  Alert.alert('Cuenta no verificada', 'Tu correo no está verificado. Por favor revisa tu email y verifica tu cuenta.');
  // optional: navigate to a screen that explains verification
  navigation.navigate('Main');
} else {
  Alert.alert('Éxito', 'Login exitoso');
  navigation.navigate('Bienvenida');
}*/
      showPopup({
        title: 'Éxito',
        description: 'Login exitoso',
        imageType: 'success',
        buttons: [{ text: 'Aceptar', onPress: () => navigation.navigate('Bienvenida') }]
      });
    } catch (error: any) {
      showPopup({
        title: 'Error',
        description: 'Credenciales incorrectas o usuario no existe',
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => { } }]
      });
    }
    setLoading(false);
  };
  return (
    <><TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? hp('8%') : 0}>
        <View ref={containerRef} style={[
          styles.container,
          Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {},
        ]}>
          <Text style={styles.titulo}>Iniciar sesión</Text>
          <Text style={GLOBAL_STYLES.subtitle}>¡Ya estás a punto de poder utilizar la aplicación de Convivia!</Text>

          <TextField label="Correo electrónico:" value={email} onChangeText={validateEmail} placeholder="usuario@dominio" keyboardType="email-address" error={emailError} />

          <TextField label="Contraseña:" value={password} onChangeText={setPassword} placeholder="• • • • • • • •" secureTextEntry />
          <TouchableOpacity style={GLOBAL_STYLES.checkboxContainer} onPress={() => navigation.navigate('RecuperarPassword')}>
            <Text style={GLOBAL_STYLES.linkRecuperarPassword}>Recuperar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity style={GLOBAL_STYLES.checkboxContainer} onPress={() => setIsChecked(!isChecked)}>
            <View style={GLOBAL_STYLES.checkbox}>{isChecked && <Ionicons name="checkmark" size={moderateScale(16)} color="#ACBF8A" />}</View>
            <Text style={GLOBAL_STYLES.labelCheckbox}>Recuérdame</Text>
          </TouchableOpacity>

          <Button
            onPress={() => handleLogin()}
            loading={loading}
            style={[
              GLOBAL_STYLES.buttonPrimaryGreen,
              {
                backgroundColor: COLORS.success
              },
            ]}
          >
            Entrar
          </Button>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback><Popup
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
export default IniciarSesion;