import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from 'react-native-size-matters';
import { createUserWithEmailAndPassword, sendEmailVerification, User } from 'firebase/auth';
import GLOBAL_STYLES from '../styles/styles';
import { COLORS } from '../styles/theme';
import { auth } from '../configs/firebaseConfig';

const CrearCuenta: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [checkedPolitica, setCheckedPolitica] = useState<boolean>(false);
  const [checkedCookies, setCheckedCookies] = useState<boolean>(false);

  const navigation = useNavigation<any>();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password2, setPassword2] = useState<string>('');
  const [showPassword2, setShowPassword2] = useState<boolean>(false);
  const [codigo, setCodigo] = useState<string>('');
  const [errorMatch, setErrorMatch] = useState<string>('');
  const [contador, setContador] = useState<number>(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTipo, setModalTipo] = useState<string>('exito');

  const isValidPassword = password.length >= 8 && /\d/.test(password);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  useEffect(() => {
    if (!isCounting) return;

    if (contador === 0) {
      setIsCounting(false);
      return;
    }

    const timer = setInterval(() => {
      setContador((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [contador, isCounting]);

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError('Por favor, introduce un correo válido');
    } else {
      setEmailError('');
    }
  };

  const sendVerificationEmail = async (user: User) => {
    try {
      await sendEmailVerification(user);
    } catch (err) {
      console.warn('Error sending verification email:', err);
    }
  };

  const validarBBDD = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // send verification email
      await sendVerificationEmail(userCredential.user);
      setModalTipo('exito');
      setModalVisible(true);
      // start resend timer
      setContador(60);
      setIsCounting(true);
    } catch (error: any) {
      setEmailError('No se pudo crear la cuenta: ' + (error?.message ?? String(error)));
    }
  };

  const handleEnviarVerificacion = async () => {
    // validation before attempting
    if (!isValidEmail) {
      setEmailError('Introduce un correo válido');
      return;
    }
    if (!isValidPassword) {
      setErrorMatch('La contraseña debe tener al menos 8 caracteres y contener un número.');
      return;
    }
    if (password !== password2) {
      setErrorMatch('Las contraseñas no coinciden');
      return;
    }
    if (!checkedPolitica || !checkedCookies) {
      setEmailError('Debes aceptar la política y las cookies');
      return;
    }

    await validarBBDD();
  };

  const handleResend = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendVerificationEmail(user);
        setContador(60);
        setIsCounting(true);
        setModalTipo('reenvio');
        setModalVisible(true);
      } else {
        setEmailError('Usuario no disponible para reenviar correo. Inicia sesión o crea la cuenta de nuevo.');
      }
    } catch (err: any) {
      setEmailError('Error al reenviar el correo: ' + (err?.message ?? String(err)));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'android' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={GLOBAL_STYLES.container}>
            <Text style={GLOBAL_STYLES.title}>Crea tu cuenta</Text>
            <Text style={GLOBAL_STYLES.subtitle}>¿Quieres empezar tu experiencia con Convivia?</Text>

            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={GLOBAL_STYLES.label}>Correo electrónico</Text>
              <TextInput
                style={GLOBAL_STYLES.inputEmailCrearCuenta}
                placeholder="usuario@dominio"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={validateEmail}
              />
              {emailError ? <Text style={GLOBAL_STYLES.errorText}>{emailError}</Text> : null}

              <Text style={GLOBAL_STYLES.helperText}>
                La dirección ingresada debe contar con un formato estándar (por ejemplo, usuario@dominio.com).
              </Text>
            </View>

            <View style={GLOBAL_STYLES.verificacionContainerPassword}>
              <Text style={GLOBAL_STYLES.verificacionLabelPassword}>Contraseña</Text>
              <View style={GLOBAL_STYLES.verificacionInputPasswordContainer}>
                <TextInput
                  style={GLOBAL_STYLES.verificacionInputPassword}
                  placeholder="* * * * * * * *"
                  secureTextEntry={!showPassword}
                  autoCorrect={false}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={GLOBAL_STYLES.verificacionEyeIconButton}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={23} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={GLOBAL_STYLES.verificacionLabelPasswordReq}>La contraseña requiere al menos 8 símbolos, incluyendo como mínimo un número.</Text>

            <View style={GLOBAL_STYLES.verificacionContainerPassword}>
              <Text style={GLOBAL_STYLES.verificacionLabelPassword}>Confirma la Contraseña</Text>
              <View style={GLOBAL_STYLES.verificacionInputPasswordContainer}>
                <TextInput
                  style={GLOBAL_STYLES.verificacionInputPassword}
                  placeholder="* * * * * * * *"
                  secureTextEntry={!showPassword2}
                  autoCorrect={false}
                  value={password2}
                  onChangeText={(text) => {
                    setPassword2(text);
                    if (password !== text) {
                      setErrorMatch('Las contraseñas no coinciden');
                    } else {
                      setErrorMatch('');
                    }
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)} style={GLOBAL_STYLES.verificacionEyeIconButton}>
                  <Ionicons name={showPassword2 ? 'eye-off' : 'eye'} size={23} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
              {errorMatch ? <Text style={GLOBAL_STYLES.errorText}>{errorMatch}</Text> : null}
            </View>

            <View style={GLOBAL_STYLES.checkboxContainer}>
              <TouchableOpacity style={GLOBAL_STYLES.checkbox} onPress={() => setCheckedPolitica(!checkedPolitica)}>
                {checkedPolitica && <Ionicons name="checkmark" size={moderateScale(18)} color={COLORS.accent} />}
              </TouchableOpacity>
              <Text style={GLOBAL_STYLES.checkboxText as any}>Política de privacidad</Text>
            </View>

            <View style={GLOBAL_STYLES.checkboxContainer}>
              <TouchableOpacity style={GLOBAL_STYLES.checkbox} onPress={() => setCheckedCookies(!checkedCookies)}>
                {checkedCookies && <Ionicons name="checkmark" size={moderateScale(18)} color={COLORS.accent} />}
              </TouchableOpacity>
              <Text style={GLOBAL_STYLES.checkboxText as any}>Cookies</Text>
            </View>

            <TouchableOpacity
              style={[
                GLOBAL_STYLES.botonIngresarMail,
                {
                  backgroundColor:
                    (isValidEmail && checkedPolitica && checkedCookies && password === password2 && isValidPassword && !isCounting)
                      ? COLORS.success
                      : COLORS.disabled,
                },
              ]}
              disabled={isCounting || !(isValidEmail && checkedPolitica && checkedCookies && password === password2 && isValidPassword)}
              onPress={handleEnviarVerificacion}
            >
              <Text style={GLOBAL_STYLES.textoBotonIngresarMail}>{isCounting ? `Reenviando en ${contador}s` : 'Enviar verificación'}</Text>
            </TouchableOpacity>

            <Text style={GLOBAL_STYLES.verificacionEnviarCodigoNuevo}>¿No te ha llegado?</Text>

            {isCounting && <Text style={GLOBAL_STYLES.verificacionContador}></Text>}

            <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
              <View style={GLOBAL_STYLES.overlay as any || { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={GLOBAL_STYLES.popup as any || { width: '80%', padding: 20, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' }}>
                  {modalTipo === 'exito' ? (
                    <>
                      <Image source={require('../assets/pngsuccessful.png')} style={GLOBAL_STYLES.verificacionLogo} resizeMode="contain" />
                      <Text style={GLOBAL_STYLES.popupTextTitle as any || { fontSize: 20, fontWeight: 'bold' }}>¡Verificación enviada!</Text>
                      <Text style={GLOBAL_STYLES.popupTextSubTitle as any || { fontSize: 14, marginVertical: 10 }}>Revisa tu correo</Text>
                      <TouchableOpacity style={GLOBAL_STYLES.closeButton as any || { backgroundColor: COLORS.accent, padding: 10, borderRadius: 5 }} onPress={() => { setModalVisible(false); navigation.navigate('Main'); }}>
                        <Text style={GLOBAL_STYLES.closeButtonText as any || { color: 'white' }}>Cerrar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity disabled={isCounting} onPress={handleResend} style={[GLOBAL_STYLES.closeButton as any || { backgroundColor: isCounting ? '#ccc' : COLORS.accent, padding: 10, borderRadius: 5, marginTop: 8 }]}>
                        <Text style={GLOBAL_STYLES.closeButtonText as any || { color: 'white' }}>{isCounting ? `Reenviar (${contador}s)` : 'Reenviar correo'}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={GLOBAL_STYLES.popupTextTitle as any || { fontSize: 20, fontWeight: 'bold' }}>Código reenviado</Text>
                      <Text style={GLOBAL_STYLES.popupTextSubTitle as any || { fontSize: 14, marginVertical: 10 }}>Revisa tu correo y spam</Text>
                      <TouchableOpacity style={GLOBAL_STYLES.closeButton as any || { backgroundColor: COLORS.accent, padding: 10, borderRadius: 5 }} onPress={() => setModalVisible(false)}>
                        <Text style={GLOBAL_STYLES.closeButtonText as any || { color: 'white' }}>Cerrar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity disabled={isCounting} onPress={handleResend} style={[GLOBAL_STYLES.closeButton as any || { backgroundColor: isCounting ? '#ccc' : COLORS.accent, padding: 10, borderRadius: 5, marginTop: 8 }]}>
                        <Text style={GLOBAL_STYLES.closeButtonText as any || { color: 'white' }}>{isCounting ? `Reenviar (${contador}s)` : 'Reenviar correo'}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default CrearCuenta;
