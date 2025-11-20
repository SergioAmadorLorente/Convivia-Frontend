import React, { useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Alert } from 'react-native';
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
      <View style={[styles.container, { justifyContent: 'center' }]}>
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
        <View style={styles.container}>
          <Text style={styles.titulo}>Iniciar sesión</Text>
          <Text style={styles.subtitulo}>¡Ya estás a punto de poder utilizar la aplicación de Convivia!</Text>

          <TextField label="Correo electrónico:" value={email} onChangeText={validateEmail} placeholder="usuario@dominio" keyboardType="email-address" error={emailError} />

          <PasswordField label="Contraseña:" value={password} onChangeText={setPassword} placeholder="• • • • • • • •" />
          <TouchableOpacity style={styles.recuperarContainer} onPress={() => navigation.navigate('RecuperarPassword')}>
            <Text style={styles.recuperarPassword}>Recuperar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsChecked(!isChecked)}>
            <View style={styles.checkbox}>{isChecked && <Ionicons name="checkmark" size={moderateScale(16)} color="#ACBF8A" />}</View>
            <Text style={styles.labelRecordarme}>Recordarme</Text>
          </TouchableOpacity>

          <PrimaryButton onPress={() => handleLogin()} disabled={!isValidEmail || loading} loading={loading} style={{ backgroundColor: isValidEmail ? '#E6ECDC' : '#ccc', width: wp('80%'), marginTop: hp('3%') }}>
            Entrar
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: hp('7%'),
    paddingHorizontal: wp('5%'),
  },
  titulo: {
    fontSize: moderateScale(40),
    color: '#6B705C',
    fontFamily: 'DMSerifDisplay_400Regular',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: moderateScale(13),
    color: '#4B4741',
    marginVertical: hp('1%'),
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
  },
  inputGroup: {
    width: wp('80%'),
    marginTop: hp('2%'),
  },
  label: {
    fontSize: moderateScale(15),
    color: '#4B4741',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: hp('0.5%'),
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    paddingHorizontal: wp('4%'),
    paddingVertical: verticalScale(8),
    fontSize: moderateScale(13),
    backgroundColor: '#F5F4F2',
  },
  errorText: {
    color: 'red',
    fontSize: moderateScale(12),
    marginTop: hp('0.5%'),
  },
  inputPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    paddingHorizontal: wp('4%'),
    height: verticalScale(40),
    backgroundColor: '#F5F4F2',
  },
  inputPassword: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: 'Montserrat_400Regular',
  },
  eyeIconButton: {
    padding: wp('0.1%'),
  },
  recuperarContainer: {
    alignItems: 'flex-end',
    marginTop: hp('0.5%'),
  },
  recuperarPassword: {
    fontSize: moderateScale(14),
    fontFamily: 'Montserrat_400Regular',
    color: '#ACBF8A',
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: wp('80%'),
    marginTop: hp('2%'),
  },
  checkbox: {
    width: wp('5%'),
    height: wp('5%'),
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#6B705C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  labelRecordarme: {
    fontSize: moderateScale(14),
    color: '#6B705C',
    fontFamily: 'Montserrat_400Regular',
  },
  botonLogearse: {
    paddingVertical: verticalScale(8),
    borderRadius: 15,
    width: wp('80%'),
    alignSelf: 'center',
    marginTop: hp('3%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  textoBotonLogearse: {
    color: '#4B4741',
    fontSize: moderateScale(15),
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
  },
});

export default IniciarSesion;
