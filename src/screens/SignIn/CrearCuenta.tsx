import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  AppState,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { moderateScale } from "react-native-size-matters";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import GLOBAL_STYLES from "../../styles/styles";
import { COLORS, CHECKBOX } from "../../styles/theme";
import { auth } from "../../configs/firebaseConfig";
import Popup from "../../components/ui/Popup";
import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";
import useKeyboardAware from "../../hooks/useKeyboardAware";
import { useCountdown } from "../../hooks/useCountdown";
import { useEmailValidation } from "../../hooks/useEmailValidation";
import { usePasswordValidation } from "../../hooks/usePasswordValidation";
import { crearUsuario, crearUsuarioConId } from "../../api/usuario";

const CrearCuenta: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { email, setEmail, isValidEmail, emailError } = useEmailValidation();
  const { password, setPassword, validations, isValidPassword } =
    usePasswordValidation();
  const [nombre, setNombre] = useState("");
  const [password2, setPassword2] = useState("");
  const [errorMatch, setErrorMatch] = useState("");
  const [checkedPolitica, setCheckedPolitica] = useState(false);
  const [checkedTerminos, setCheckedTerminos] = useState(false);
  const [emailUsedError, setEmailUsedError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [verificacionEnviada, setVerificacionEnviada] = useState(false);
  const { seconds, isCounting, startCountdown } = useCountdown(60);
  const scrollRef = useRef<any>(null);
  const appState = useRef(AppState.currentState);

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
    if (password === password2) setErrorMatch("");
    else if (password2.length > 0)
      setErrorMatch(t('createAccount.passwordMismatch'));
  }, [password, password2]);

  // Detectar cuando la app vuelve al primer plano y verificar email
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      // Solo verificar si se envió la verificación y la app vuelve a estar activa
      if (
        verificacionEnviada &&
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        try {
          // Recargar el usuario actual de Firebase
          await auth.currentUser?.reload();

          // Verificar si el email fue verificado
          if (auth.currentUser?.emailVerified) {
            // Email verificado, redirigir a inicio de sesión
            setModalVisible(false);
            navigation.navigate("IniciarSesion");
          }
        } catch (error) {
          // console.error("Error al verificar el estado del email:", error);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [verificacionEnviada, navigation]);

  const validarBBDD = async () => {
    try {
      setEmailUsedError("");
      // 1. Crear en Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Crear en la BD con los datos completos
      await crearUsuarioConId(userCredential.user.uid, {
        id: userCredential.user.uid,
        nombre: nombre,
        email: email,
        password: password,
        premium: false,
      });

      // 3. Enviar verificación de email
      await sendEmailVerification(userCredential.user);
      setModalVisible(true);
      setVerificacionEnviada(true);
      startCountdown();
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setEmailUsedError(t('createAccount.emailUsed'));
      } else {
        // console.error("Error creating account:", error);
        setEmailUsedError(t('createAccount.genericError'));
      }
    }
  };
  const handleEnviarVerificacion = async () => {
    if (!isValidEmail || !isValidPassword) return;
    if (password !== password2) {
      setErrorMatch(t('createAccount.passwordMismatch'));
      return;
    }
    if (!checkedPolitica || !checkedTerminos) return;
    await validarBBDD();
  };
  // Validaciones password
  const unmetPasswordRequirements: string[] = [];
  if (!validations.length) unmetPasswordRequirements.push(t('createAccount.reqLength'));
  if (!validations.uppercase)
    unmetPasswordRequirements.push(t('createAccount.reqUppercase'));
  if (!validations.number)
    unmetPasswordRequirements.push(t('createAccount.reqNumber'));
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
            <Text style={GLOBAL_STYLES.title}>{t('createAccount.title')}</Text>
            <Text style={GLOBAL_STYLES.subtitle}>
              {t('createAccount.subtitle')}
            </Text>
            {/* NOMBRE */}
            <TextField
              label={t('createAccount.nameLabel')}
              value={nombre}
              onChangeText={setNombre}
              placeholder={t('createAccount.namePlaceholder')}
              keyboardType="default"
            />
            {/* EMAIL */}
            <TextField
              label={t('createAccount.emailLabel')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailUsedError("");
              }}
              placeholder={t('createAccount.emailPlaceholder')}
              keyboardType="email-address"
              error={emailError || emailUsedError}
            />
            {/* CONTRASEÑA */}
            <TextField
              label={t('createAccount.passwordLabel')}
              value={password}
              onChangeText={setPassword}
              placeholder="• • • • • • • •"
              secureTextEntry
            />
            {/* VALIDACIONES */}
            <View style={{ marginVertical: 5 }}>
              <Text style={GLOBAL_STYLES.helperText}>
                {t('createAccount.passwordRequirements')}
              </Text>
              {unmetPasswordRequirements.length === 0 ? (
                <Text
                  style={[
                    GLOBAL_STYLES.helperText,
                    { color: GLOBAL_STYLES.subtitulo.color },
                  ]}
                >
                  {t('createAccount.validPassword')}
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
              label={t('createAccount.confirmPasswordLabel')}
              value={password2}
              onChangeText={(text) => {
                setPassword2(text);
                if (password === text) setErrorMatch("");
                else if (text.length > 0)
                  setErrorMatch(t('createAccount.passwordMismatch'));
              }}
              placeholder="• • • • • • • •"
              secureTextEntry
              error={errorMatch}
            />
            {/* CHECKBOX POLÍTICA PRIVACIDAD */}
            <View style={GLOBAL_STYLES.checkboxContainer}>
              <TouchableOpacity
                style={CHECKBOX.touchArea}
                onPress={() => setCheckedPolitica(!checkedPolitica)}
              >
                <Feather
                  name={checkedPolitica ? "check-square" : "square"}
                  size={CHECKBOX.iconSize}
                  color={
                    checkedPolitica
                      ? CHECKBOX.colors.checked
                      : CHECKBOX.colors.unchecked
                  }
                />
              </TouchableOpacity>
              <Text
                style={[
                  GLOBAL_STYLES.labelCheckbox,
                  { color: COLORS.accent, textDecorationLine: "underline" },
                ]}
                onPress={() =>
                  navigation.navigate("PoliticaCookiesPrivacidad")
                }
              >
                {t('createAccount.privacyLabel')}
              </Text>
            </View>
            {/* CHECKBOX TÉRMINOS Y CONDICIONES */}
            <View style={GLOBAL_STYLES.checkboxContainer}>
              <TouchableOpacity
                style={CHECKBOX.touchArea}
                onPress={() => setCheckedTerminos(!checkedTerminos)}
              >
                <Feather
                  name={checkedTerminos ? "check-square" : "square"}
                  size={CHECKBOX.iconSize}
                  color={
                    checkedTerminos
                      ? CHECKBOX.colors.checked
                      : CHECKBOX.colors.unchecked
                  }
                />
              </TouchableOpacity>
              <Text
                style={[
                  GLOBAL_STYLES.labelCheckbox,
                  { color: COLORS.accent, textDecorationLine: "underline" },
                ]}
                onPress={() => navigation.navigate("TerminosCondiciones")}
              >
                {t('createAccount.termsLabel')}
              </Text>
            </View>
            {/* BOTÓN */}
            <Button
              style={[
                GLOBAL_STYLES.buttonPrimaryGreen,
                {
                  backgroundColor:
                    nombre.trim() &&
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
                  nombre.trim() &&
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
              {isCounting ? t('createAccount.resendText', { seconds }) : t('createAccount.sendVerification')}
            </Button>
            {/* POPUP */}
            <Popup
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title={t('createAccount.popups.verificationSent.title')}
              description={t('createAccount.popups.verificationSent.description')}
              imageType="success"
              buttons={[
                { text: t('common.close'), onPress: () => setModalVisible(false) },
              ]}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};
export default CrearCuenta;