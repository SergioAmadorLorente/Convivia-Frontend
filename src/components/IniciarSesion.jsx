import React, { useState } from 'react';
import {
  StyleSheet,
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
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale, verticalScale } from 'react-native-size-matters';

const IniciarSesion = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(!emailRegex.test(text) ? 'Por favor, introduce un correo válido' : '');
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      alert('Login exitoso');
      navigation.navigate('Bienvenida');


    } catch (error) {
      setEmailError('Credenciales incorrectas o usuario no existe');
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? hp('8%') : 0}
      >
        <View style={styles.container}>
          <Text style={styles.titulo}>Iniciar sesión</Text>
          <Text style={styles.subtitulo}>¡Ya estás a punto de poder utilizar la{'\n'} aplicación de Convivia!</Text>

          {/* Correo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico:</Text>
            <TextInput
              style={styles.input}
              placeholder="usuario@dominio"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={validateEmail}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Contraseña + Recuperar */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña:</Text>
            <View style={styles.inputPasswordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="• • • • • • • •"
                secureTextEntry={!showPassword}
                autoCorrect={false}
                value={password}
                maxLength={8}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIconButton}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={moderateScale(22)} color="#ACBF8A" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.recuperarContainer} onPress={() => navigation.navigate('RecuperarPassword')}>
              <Text style={styles.recuperarPassword}>Recuperar contraseña</Text>
            </TouchableOpacity>
          </View>

          {/* Recordarme */}
          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsChecked(!isChecked)}>
            <View style={styles.checkbox}>
              {isChecked && <Ionicons name="checkmark" size={moderateScale(16)} color="#ACBF8A" />}
            </View>
            <Text style={styles.labelRecordarme}>Recordarme</Text>
          </TouchableOpacity>

          {/* Botón */}
          <TouchableOpacity
            style={[styles.botonLogearse, { backgroundColor: isValidEmail ? '#E6ECDC' : '#ccc' }]}
            disabled={!isValidEmail || loading}
            onPress={() => handleLogin()}
          >
            {loading ? <ActivityIndicator size="small" color="#4B4741" /> : <Text style={styles.textoBotonLogearse}>Entrar</Text>}
          </TouchableOpacity>
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
