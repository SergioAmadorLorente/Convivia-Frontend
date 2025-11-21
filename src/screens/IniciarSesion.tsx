import React, { useState } from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { GLOBAL_STYLES } from '../styles/styles';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../configs/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import useLoadFonts from '../hooks/useLoadFonts';
import useEmailValidation from '../hooks/useEmailValidation';
import TextField from '../components/ui/TextField';
import PasswordField from '../components/ui/PasswordField';
import PrimaryButton from '../components/ui/PrimaryButton';


const IniciarSesion: React.FC = () => {
  const { value: email, validate: validateEmail, error: emailError, isValid: isValidEmail } = useEmailValidation('');
  const [password, setPassword] = useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const fontsLoaded = useLoadFonts();

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
      const user = userCredential.user;
      if (user && !user.emailVerified) {
        Alert.alert('Cuenta no verificada', 'Tu correo no está verificado. Por favor revisa tu email y verifica tu cuenta.');
        // optional: navigate to a screen that explains verification
        navigation.navigate('Main');
      } else {
        Alert.alert('Éxito', 'Login exitoso');
        navigation.navigate('Bienvenida');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Credenciales incorrectas o usuario no existe');
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'android' ? hp('8%') : 0}>
        <View style={GLOBAL_STYLES.container}>
          <Text style={GLOBAL_STYLES.titulo}>Iniciar sesión</Text>
          <Text style={[GLOBAL_STYLES.subtitulo, { textAlign: 'center' }]}>¡Ya estás a punto de poder utilizar la aplicación de Convivia!</Text>

          <TextField label="Correo electrónico:" value={email} onChangeText={validateEmail} placeholder="usuario@dominio" keyboardType="email-address" error={emailError} />

          <PasswordField label="Contraseña:" value={password} onChangeText={setPassword} placeholder="• • • • • • • •" />
          <TouchableOpacity style={GLOBAL_STYLES.recuperarContainer} onPress={() => navigation.navigate('RecuperarPassword')}>
            <Text style={GLOBAL_STYLES.recuperarPassword}>Recuperar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity style={GLOBAL_STYLES.checkboxContainer} onPress={() => setIsChecked(!isChecked)}>
            <View style={GLOBAL_STYLES.checkbox}>{isChecked && <Ionicons name="checkmark" size={moderateScale(16)} color="#ACBF8A" />}</View>
            <Text style={GLOBAL_STYLES.labelRecordarme}>Recordarme</Text>
          </TouchableOpacity>

          <PrimaryButton
            onPress={() => handleLogin()}
            disabled={!isValidEmail || loading}
            loading={loading}
            style={[
              GLOBAL_STYLES.botonLogearse,
              (!isValidEmail)
                ? { backgroundColor: '#888' } // strong gray for invalid email
                : (loading
                    ? { backgroundColor: '#ccc' } // light gray for loading
                    : { backgroundColor: GLOBAL_STYLES.botonLogearse.backgroundColor || '#E6ECDC' }
                  ),
            ]}
          >
            Entrar
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};


export default IniciarSesion;
