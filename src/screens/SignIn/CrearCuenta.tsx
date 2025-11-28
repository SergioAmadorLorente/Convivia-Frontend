import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation } from "@react-navigation/native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';
import GLOBAL_STYLES from '../../styles/styles';
import { COLORS } from '../../styles/theme';
import { auth } from '../../configs/firebaseConfig';
import Popup from '../../components/ui/Popup';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import CheckboxWithLink from '../../components/ui/CheckboxWithLink';
import useKeyboardAware from '../../hooks/useKeyboardAware';
import { useCountdown } from '../../hooks/useCountdown';
import { useEmailValidation } from '../../hooks/useEmailValidation';
import { usePasswordValidation } from '../../hooks/usePasswordValidation';
const CrearCuenta: React.FC = () => {
  const navigation = useNavigation<any>();
  const { email, setEmail, isValidEmail, emailError } = useEmailValidation();
  const { password, setPassword, validations, isValidPassword } =
    usePasswordValidation();
  const [password2, setPassword2] = useState("");
  const [errorMatch, setErrorMatch] = useState("");
  const [checkedPolitica, setCheckedPolitica] = useState(false);
  const [checkedTerminos, setCheckedTerminos] = useState(false);
  const [emailUsedError, setEmailUsedError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const { seconds, isCounting, startCountdown } = useCountdown(60);
  const scrollRef = useRef<any>(null);
  useKeyboardAware({
    containerRef: scrollRef,
    padding: 12,
    extraScroll: 30,
    enabled: true,
  });
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });
  useEffect(() => {
    if (password === password2) {
      setErrorMatch("");
    } else if (password2.length > 0) {
      setErrorMatch("Las contraseñas no coinciden");
    }
  }, [password, password2]);


  // REGISTRO + ENVÍO DE EMAIL DE VERIFICACIÓN
  const validarBBDD = async () => {
    try {
      setEmailUsedError("");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(userCredential.user);
      setModalVisible(true);
      startCountdown();
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setEmailUsedError("Este correo ya está registrado.");
      } else {
        setEmailUsedError("Error al crear la cuenta.");
      }
    }
  };

  const handleEnviarVerificacion = async () => {
    if (!isValidEmail) return;
    if (!isValidPassword) return;
    if (password !== password2) {
      setErrorMatch("Las contraseñas no coinciden");
      return;
    }
    if (!checkedPolitica || !checkedTerminos) return;
    await validarBBDD();
  };

  // Lista de requisitos incumplidos (para la UI)
  const unmetPasswordRequirements: string[] = [];
  if (!validations.length)
    unmetPasswordRequirements.push("Al menos 8 caracteres");
  if (!validations.uppercase)
    unmetPasswordRequirements.push("Al menos una letra mayúscula");
  if (!validations.number) unmetPasswordRequirements.push("Al menos un número");

  // UI PRINCIPAL
  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={GLOBAL_STYLES.container}>
            <Text style={GLOBAL_STYLES.title}>Crea tu cuenta</Text>
            <Text style={GLOBAL_STYLES.subtitle}>
              ¿Quieres empezar tu experiencia con Convivia?
            </Text>
            {/* EMAIL */}
            <TextField
              label="Correo electrónico"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailUsedError("");
              }}
              placeholder="usuario@dominio.com"
              keyboardType="email-address"
              error={emailError || emailUsedError}
            />

            {/* CONTRASEÑA */}
            <TextField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="• • • • • • • •"
              secureTextEntry
            />
            {/* VALIDACIONES */}
            <View style={{ marginVertical: 5 }}>
              <Text style={GLOBAL_STYLES.helperText}>
                Requisitos de la contraseña:
              </Text>
              {unmetPasswordRequirements.length === 0 ? (
                <Text
                  style={[
                    GLOBAL_STYLES.helperText,
                    { color: GLOBAL_STYLES.subtitulo.color },
                  ]}
                >
                  ✓ Contraseña válida
                </Text>
              ) : (
                unmetPasswordRequirements.map((msg) => (
                  <Text
                    key={msg}
                    style={[
                      GLOBAL_STYLES.helperText,
                      { color: GLOBAL_STYLES.errorText.color, marginTop: 4 },
                    ]}
                  >
                    ✘ {msg}
                  </Text>
                ))
              )}
            </View>

            {/* CONFIRMAR CONTRASEÑA */}
            <TextField
              label="Confirma la Contraseña"
              value={password2}
              onChangeText={(text) => {
                setPassword2(text);
                if (password === text) setErrorMatch("");
                else if (text.length > 0)
                  setErrorMatch("Las contraseñas no coinciden");
              }}
              placeholder="• • • • • • • •"
              secureTextEntry
              error={errorMatch}
            />
            {/* CHECKBOXES WITH LINKS */}
            <CheckboxWithLink
              checked={checkedPolitica}
              onCheckboxPress={() => setCheckedPolitica(!checkedPolitica)}
              labelText=""
              linkText="Política de Privacidad y Cookies"
              linkRoute="PoliticaCookiesPrivacidad"
            />
            <CheckboxWithLink
              checked={checkedTerminos}
              onCheckboxPress={() => setCheckedTerminos(!checkedTerminos)}
              labelText=""
              linkText="Términos y Condiciones"
              linkRoute="TerminosCondiciones"
            />
            {/* BOTÓN */}
            <Button
              style={[
                GLOBAL_STYLES.buttonPrimaryGreen,
                {
                  backgroundColor:
                    isValidEmail &&
                      checkedPolitica &&
                      checkedTerminos &&
                      password === password2 &&
                      isValidPassword &&
                      !isCounting &&
                      !emailUsedError
                      ? COLORS.success
                      : COLORS.disabled,
                },
              ]}
              disabled={
                isCounting ||
                !(
                  isValidEmail &&
                  checkedPolitica &&
                  checkedTerminos &&
                  password === password2 &&
                  isValidPassword
                ) ||
                !!emailUsedError
              }
              onPress={handleEnviarVerificacion}
            >
              {isCounting ? `Reenviando en ${seconds}s` : "Enviar verificación"}
            </Button>

            {/* POPUP */}
            <Popup
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title="¡Verificación enviada!"
              description="Revisa tu correo y la carpeta de spam."
              imageType="success"
              buttons={[
                { text: "Cerrar", onPress: () => setModalVisible(false) },
              ]}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
export default CrearCuenta;
