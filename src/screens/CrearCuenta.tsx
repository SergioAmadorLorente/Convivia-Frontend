import React, { useState } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
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
import TextField from '../components/ui/TextField';
import PasswordField from '../components/ui/PasswordField';
import PrimaryButton from '../components/ui/PrimaryButton';
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={GLOBAL_STYLES.container}>
            <Text style={GLOBAL_STYLES.title}>Crea tu cuenta</Text>
            <Text style={GLOBAL_STYLES.subtitle}>
              ¿Quieres empezar tu experiencia con Convivia?
            </Text>
            {/* Email */}
            <TextField
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder="usuario@dominio.com"
              keyboardType="email-address"
              error={emailError}
            />
            {/* Password */}
            <PasswordField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="* * * * * * * *"
            />
            <View style={{ marginVertical: 5 }}>
              <Text style={GLOBAL_STYLES.helperText}>Requisitos de la contraseña:</Text>
              <Text
                style={[
                  { color: validations.length ? GLOBAL_STYLES.subtitulo.color : GLOBAL_STYLES.errorText.color },
                  GLOBAL_STYLES.helperText,
                ]}
              >
                {validations.length ? '✓' : '✘'} Al menos 8 caracteres
              </Text>
              <Text
                style={[
                  { color: validations.uppercase ? GLOBAL_STYLES.subtitulo.color : GLOBAL_STYLES.errorText.color },
                  GLOBAL_STYLES.helperText,
                ]}
              >
                {validations.uppercase ? '✓' : '✘'} Una mayúscula
              </Text>
              <Text
                style={[
                  { color: validations.number ? GLOBAL_STYLES.subtitulo.color : GLOBAL_STYLES.errorText.color },
                  GLOBAL_STYLES.helperText,
                ]}
              >
                {validations.number ? '✓' : '✘'} Un número
              </Text>
            </View>
            {/* Confirm Password */}
            <PasswordField
              label="Confirma la Contraseña"
              value={password2}
              onChangeText={(text) => {
                setPassword2(text);
                setErrorMatch(text !== password ? 'Las contraseñas no coinciden' : '');
              }}
              placeholder="* * * * * * * *"
            />
            {errorMatch ? <Text style={GLOBAL_STYLES.errorText}>{errorMatch}</Text> : null}
            {/* Checkboxes */}
            <View style={GLOBAL_STYLES.checkboxContainer}>
              <TouchableOpacity
                style={GLOBAL_STYLES.checkbox}
                onPress={() => setCheckedPolitica(!checkedPolitica)}
              >
                {checkedPolitica && <Ionicons name="checkmark" size={moderateScale(18)} color={COLORS.accent} />}
              </TouchableOpacity>
              <Text style={GLOBAL_STYLES.checkboxText}>Política de privacidad</Text>
            </View>
            <View style={GLOBAL_STYLES.checkboxContainer}>
              <TouchableOpacity
                style={GLOBAL_STYLES.checkbox}
                onPress={() => setCheckedCookies(!checkedCookies)}
              >
                {checkedCookies && <Ionicons name="checkmark" size={moderateScale(18)} color={COLORS.accent} />}
              </TouchableOpacity>
              <Text style={GLOBAL_STYLES.checkboxText}>Cookies</Text>
            </View>
            {/* Submit Button */}
            <PrimaryButton
              onPress={handleEnviarVerificacion}
              disabled={
                !isValidEmail ||
                !isValidPassword ||
                password !== password2 ||
                !checkedPolitica ||
                !checkedCookies
              }
              style={{
                backgroundColor:
                  isValidEmail &&
                    isValidPassword &&
                    password === password2 &&
                    checkedPolitica &&
                    checkedCookies
                    ? COLORS.success
                    : COLORS.disabled,
              }}
            >
              Enviar verificación
            </PrimaryButton>
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