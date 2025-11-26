import React, { useState } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
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
import Popup from '../components/ui/Popup';
import { useCountdown } from '../hooks/useCountdown';
import { useEmailValidation } from '../hooks/useEmailValidation';
import { usePasswordValidation } from '../hooks/usePasswordValidation';

const CrearCuenta: React.FC = () => {
  const navigation = useNavigation<any>();
  const { email, setEmail, isValidEmail, emailError } = useEmailValidation();
  const { password, setPassword, validations, isValidPassword } = usePasswordValidation();
  const [password2, setPassword2] = useState('');
  const [errorMatch, setErrorMatch] = useState('');
  const [checkedPolitica, setCheckedPolitica] = useState(false);
  const [checkedCookies, setCheckedCookies] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState('exito');
  const { seconds, isCounting, startCountdown } = useCountdown(60);
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
  const sendVerificationEmail = async (user: User) => {
    try {
      await sendEmailVerification(user);
    } catch { }
  };
  const validarBBDD = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendVerificationEmail(userCredential.user);
      setModalTipo('exito');
      setModalVisible(true);
      startCountdown();
    } catch (error) {
      console.log(error);
    }
  };
  const handleEnviarVerificacion = async () => {
    if (!isValidEmail) return;
    if (!isValidPassword) return;
    if (password !== password2) return;
    if (!checkedPolitica || !checkedCookies) return;
    await validarBBDD();
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

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
                onChangeText={setEmail}
              />
              {emailError ? <Text style={GLOBAL_STYLES.errorText}>{emailError}</Text> : null}
              <Text style={GLOBAL_STYLES.helperText}>
                Debe seguir el formato estándar (ej: usuario@dominio.com)
              </Text>
            </View>
            <View style={GLOBAL_STYLES.verificacionContainerPassword}>
              <Text style={GLOBAL_STYLES.verificacionLabelPassword}>Contraseña</Text>
              <View style={GLOBAL_STYLES.verificacionInputPasswordContainer}>
                <TextInput
                  style={GLOBAL_STYLES.verificacionInputPassword}
                  placeholder="* * * * * * * *"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>
            <View style={{ marginVertical: 5 }}>
              <Text style={GLOBAL_STYLES.helperText}>Requisitos de la contraseña:</Text>
              <Text
                style={[
                  { color: validations.length ? GLOBAL_STYLES.subtitulo.color : GLOBAL_STYLES.errorText.color },
                  GLOBAL_STYLES.helperText
                ]}
              >
                {validations.length ? '✓' : '✘'} Al menos 8 caracteres
              </Text>

              <Text style={[
                  { color: validations.length ? GLOBAL_STYLES.subtitulo.color : GLOBAL_STYLES.errorText.color },
                  GLOBAL_STYLES.helperText
                ]}>
                {validations.uppercase ? '✓' : '✘'} Una mayúscula
              </Text>
              <Text style={[
                  { color: validations.length ? GLOBAL_STYLES.subtitulo.color : GLOBAL_STYLES.errorText.color },
                  GLOBAL_STYLES.helperText
                ]}>
                {validations.number ? '✓' : '✘'} Un número
              </Text>
            </View>
            <View style={GLOBAL_STYLES.verificacionContainerPassword}>
              <Text style={GLOBAL_STYLES.verificacionLabelPassword}>Confirma la Contraseña</Text>
              <View style={GLOBAL_STYLES.verificacionInputPasswordContainer}>
                <TextInput
                  style={GLOBAL_STYLES.verificacionInputPassword}
                  placeholder="* * * * * * * *"
                  secureTextEntry={true}
                  value={password2}
                  onChangeText={(text) => {
                    setPassword2(text);
                    setErrorMatch(text !== password ? 'Las contraseñas no coinciden' : '');
                  }}
                />
              </View>
              {errorMatch ? <Text style={GLOBAL_STYLES.errorText}>{errorMatch}</Text> : null}
            </View>
            <View style={GLOBAL_STYLES.checkboxContainer}>
              <TouchableOpacity style={GLOBAL_STYLES.checkbox} onPress={() => setCheckedPolitica(!checkedPolitica)}>
                {checkedPolitica && <Ionicons name="checkmark" size={moderateScale(18)} color={COLORS.accent} />}
              </TouchableOpacity>
              <Text style={GLOBAL_STYLES.checkboxText}>Política de privacidad</Text>
            </View>
            <View style={GLOBAL_STYLES.checkboxContainer}>
              <TouchableOpacity style={GLOBAL_STYLES.checkbox} onPress={() => setCheckedCookies(!checkedCookies)}>
                {checkedCookies && <Ionicons name="checkmark" size={moderateScale(18)} color={COLORS.accent} />}
              </TouchableOpacity>
              <Text style={GLOBAL_STYLES.checkboxText}>Cookies</Text>
            </View>
            <TouchableOpacity
              style={[
                GLOBAL_STYLES.botonIngresarMail,
                {
                  backgroundColor:
                    isValidEmail &&
                      isValidPassword &&
                      password === password2 &&
                      checkedPolitica &&
                      checkedCookies
                      ? COLORS.success
                      : COLORS.disabled,
                },
              ]}
              disabled={
                !isValidEmail ||
                !isValidPassword ||
                password !== password2 ||
                !checkedPolitica ||
                !checkedCookies
              }
              onPress={handleEnviarVerificacion}
            >
              <Text style={GLOBAL_STYLES.textoBotonIngresarMail}>Enviar verificación</Text>
            </TouchableOpacity>
            <Popup
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title={modalTipo === 'exito' ? '¡Verificación enviada!' : 'Código reenviado'}
              description="Revisa tu correo y carpeta de spam"
              imageType="success"
              buttons={[{ text: 'Cerrar', onPress: () => setModalVisible(false) }]}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
export default CrearCuenta;