import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
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
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { createUserWithEmailAndPassword, sendEmailVerification, User } from 'firebase/auth';
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from '../styles/styles';
import { COLORS } from '../styles/theme';
import { auth } from '../configs/firebaseConfig';
import Popup from '../components/ui/Popup';
import { useKeyboardAware } from '../hooks';
import { Button } from '../components';
import TextField from '../components/ui/TextField';

const CrearCuenta: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [checkedPolitica, setCheckedPolitica] = useState<boolean>(false);
  const [checkedCookies, setCheckedCookies] = useState<boolean>(false);

  const navigation = useNavigation<any>();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
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

  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={containerRef} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[GLOBAL_STYLES.container, Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {}]}>
            <Text style={GLOBAL_STYLES.title}>Crea tu cuenta</Text>
            <Text style={GLOBAL_STYLES.subtitle}>¿Quieres empezar tu experiencia con Convivia?</Text>

            <View style={{ width: '100%', alignItems: 'center' }}>
              <TextField label="Correo electrónico" value={email} onChangeText={validateEmail} placeholder="usuario@dominio" keyboardType="email-address" error={emailError} />
              <Text style={GLOBAL_STYLES.helperText}>
                La dirección ingresada debe contar con un formato estándar (por ejemplo, usuario@dominio.com).
              </Text>
            </View>

            <TextField label="Contraseña" value={password} onChangeText={setPassword} placeholder="* * * * * * * *" secureTextEntry />

            <Text style={[GLOBAL_STYLES.labelPasswordReq, { marginVertical: verticalScale(1) }]}>La contraseña requiere al menos 8 símbolos, incluyendo como mínimo un número.</Text>

            <TextField
              label="Confirma la Contraseña"
              value={password2}
              onChangeText={(text) => {
                setPassword2(text);
                if (password !== text) {
                  setErrorMatch('Las contraseñas no coinciden');
                } else {
                  setErrorMatch('');
                }
              }}
              placeholder="* * * * * * * *"
              secureTextEntry
              error={errorMatch}
            />

            
            <View style={[GLOBAL_STYLES.checkboxContainer, { marginTop: hp('1%') }] }>
              <TouchableOpacity style={GLOBAL_STYLES.checkbox} onPress={() => setCheckedPolitica(!checkedPolitica)}>
                {checkedPolitica && <Ionicons name="checkmark" size={moderateScale(18)} color={COLORS.accent} />}
              </TouchableOpacity>
              <Text style={GLOBAL_STYLES.labelCheckbox as any}>Política de privacidad</Text>
            </View>

            <View style={[GLOBAL_STYLES.checkboxContainer, { marginTop: hp('1%') }] }>
              <TouchableOpacity style={GLOBAL_STYLES.checkbox} onPress={() => setCheckedCookies(!checkedCookies)}>
                {checkedCookies && <Ionicons name="checkmark" size={moderateScale(18)} color={COLORS.accent} />}
              </TouchableOpacity>
              <Text style={GLOBAL_STYLES.labelCheckbox as any}>Cookies</Text>
            </View>

            <Button
              style={[
                GLOBAL_STYLES.buttonPrimaryGreen,
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
              {isCounting ? `Reenviando en ${contador}s` : 'Enviar verificación'}
            </Button>

            <Text style={GLOBAL_STYLES.verificacionEnviarCodigoNuevo}>¿No te ha llegado?</Text>

            {isCounting && <Text style={GLOBAL_STYLES.verificacionContador}></Text>}

            <Popup
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title={modalTipo === 'exito' ? '¡Verificación enviada!' : 'Código reenviado'}
              description={modalTipo === 'exito' ? 'Revisa tu correo' : 'Revisa tu correo y spam'}
              imageType={'success'}
              buttons={
                modalTipo === 'exito'
                  ? [
                    { text: 'Cerrar', onPress: () => navigation.navigate('Main') },
                    { text: isCounting ? `Reenviar (${contador}s)` : 'Reenviar correo', onPress: () => { if (!isCounting) handleResend(); } },
                  ]
                  : [
                    { text: 'Cerrar', onPress: () => { } },
                    { text: isCounting ? `Reenviar (${contador}s)` : 'Reenviar correo', onPress: () => { if (!isCounting) handleResend(); } },
                  ]
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default CrearCuenta;
