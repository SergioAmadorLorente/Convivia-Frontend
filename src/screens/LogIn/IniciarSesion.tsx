import React, { useState, useRef } from "react";
import { GLOBAL_STYLES, WEB_FULL_VIEWPORT } from "../../styles/styles";
import styles from "../../styles/styles";
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { auth } from "../../configs/firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import useLoadFonts from "../../hooks/useLoadFonts";
import { useEmailValidation } from "../../hooks/useEmailValidation";
import { useKeyboardAware } from "../../hooks";
import TextField from "../../components/ui/TextField";

import Popup from "../../components/ui/Popup";
import { COLORS, CHECKBOX } from "../../styles/theme";
import ConfettiButton from "../../components/ui/ConfettiButton";
const IniciarSesion: React.FC = () => {
  const {
    email,
    setEmail: validateEmail,
    emailError,
    isValidEmail,
  } = useEmailValidation();
  const { t } = useTranslation();
  const [password, setPassword] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false); // visual
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const fontsLoaded = useLoadFonts();
  const [showConfetti, setShowConfetti] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});
  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };
  const handleClosePopup = () => setPopupVisible(false);
  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });
  const isButtonEnabled = isValidEmail && password.length > 0;
  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const handleLogin = async () => {
    setShowConfetti(false);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (!userCredential.user.emailVerified) {
        showPopup({
          title: t('login.popups.emailNotVerified.title'),
          description: t('login.popups.emailNotVerified.description'),
          imageType: "error",
          buttons: [
            {
              text: t('common.accept'),
              onPress: () => navigation.navigate("Bienvenida"),
            },
          ],
        });
        await sendEmailVerification(userCredential.user);
        navigation.navigate("VerificacionCuentaNueva");
        return;
      }

      // OK login - Verificar si el usuario tiene una residencia
      setShowConfetti(true);

      // Importar la función para verificar residencia
      const { obtenerEspacioPorUsuarioId } = require("../../api/usuarioEspacio");

      try {
        const espacioExistente = await obtenerEspacioPorUsuarioId(userCredential.user.uid);

        if (espacioExistente && espacioExistente.espacioId && espacioExistente.espacioId !== "string") {
          // Usuario tiene residencia -> ir al Dashboard
          showPopup({
            title: t('login.popups.welcomeBack.title'),
            description: t('login.popups.welcomeBack.description'),
            imageType: "success",
            buttons: [
              { text: t('common.continue'), onPress: () => navigation.replace("DashBoardPersonal") },
            ],
          });
        } else {
          // Usuario NO tiene residencia -> ir a Bienvenida para crear/unirse
          showPopup({
            title: t('login.popups.loginOk.title'),
            description: t('login.popups.loginOk.description'),
            imageType: "success",
            buttons: [
              { text: t('common.continue'), onPress: () => navigation.replace("Bienvenida") },
            ],
          });
        }
      } catch (espacioError) {
        console.log("Error verificando residencia, redirigiendo a Bienvenida:", espacioError);
        // Si hay error verificando, ir a Bienvenida por seguridad
        showPopup({
          title: t('login.popups.loginOkSimple.title'),
          description: t('login.popups.loginOkSimple.description'),
          imageType: "success",
          buttons: [
            { text: t('common.accept'), onPress: () => navigation.navigate("Bienvenida") },
          ],
        });
      }
    } catch (error) {
      showPopup({
        title: t('login.popups.wrongCredentials.title'),
        description: t('login.popups.wrongCredentials.description'),
        imageType: "error",
        buttons: [{ text: t('common.accept') }],
      });
    }
    setLoading(false);
  };
  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? hp("8%") : 0}
        >
          <View
            ref={containerRef}
            style={[
              styles.container,
              Platform.OS === "web" ? WEB_FULL_VIEWPORT : {},
            ]}
          >
            {/* TÍTULO */}
            <Animated.View style={{ alignSelf: "stretch", alignItems: "center" }} entering={FadeInDown.delay(0).duration(500).springify().damping(14).reduceMotion(ReduceMotion.Never)}>
              <Text style={styles.titulo}>{t('login.title')}</Text>
            </Animated.View>
            {/* SUBTÍTULO */}
            <Animated.View style={{ alignSelf: "stretch", alignItems: "center" }} entering={FadeInDown.delay(80).duration(500).springify().damping(14).reduceMotion(ReduceMotion.Never)}>
              <Text style={GLOBAL_STYLES.subtitle}>
                {t('login.subtitle')}
              </Text>
            </Animated.View>
            {/* EMAIL */}
            <Animated.View style={{ alignSelf: "stretch" }} entering={FadeInDown.delay(160).duration(500).springify().damping(14).reduceMotion(ReduceMotion.Never)}>
              <TextField
                label={t('login.emailLabel')}
                value={email}
                onChangeText={validateEmail}
                placeholder={t('login.emailPlaceholder')}
                keyboardType="email-address"
                error={emailError}
              />
            </Animated.View>
            {/* PASSWORD */}
            <Animated.View style={{ alignSelf: "stretch" }} entering={FadeInDown.delay(240).duration(500).springify().damping(14).reduceMotion(ReduceMotion.Never)}>
              <TextField
                label={t('login.passwordLabel')}
                value={password}
                onChangeText={setPassword}
                placeholder="• • • • • • • •"
                secureTextEntry
              />
            </Animated.View>
            {/* RECUPERAR CONTRASEÑA */}
            <Animated.View style={{ alignSelf: "stretch", alignItems: "center" }} entering={FadeInDown.delay(320).duration(500).springify().damping(14).reduceMotion(ReduceMotion.Never)}>
              <TouchableOpacity
                style={GLOBAL_STYLES.checkboxContainer}
                onPress={() => navigation.navigate("RecuperarPassword")}
              >
                <Text style={GLOBAL_STYLES.link}>{t('login.recoverPassword')}</Text>
              </TouchableOpacity>
            </Animated.View>
            {/* CHECKBOX RECUÉRDAME */}
            <Animated.View style={{ alignSelf: "stretch", alignItems: "center" }} entering={FadeInDown.delay(380).duration(500).springify().damping(14).reduceMotion(ReduceMotion.Never)}>
              <View style={GLOBAL_STYLES.checkboxContainer}>
                <TouchableOpacity
                  style={CHECKBOX.touchArea}
                  onPress={() => setIsChecked(!isChecked)}
                >
                  <Feather
                    name={isChecked ? "check-square" : "square"}
                    size={CHECKBOX.iconSize}
                    color={
                      isChecked
                        ? CHECKBOX.colors.checked
                        : CHECKBOX.colors.unchecked
                    }
                  />
                </TouchableOpacity>
                <Text style={GLOBAL_STYLES.labelCheckbox}>{t('login.rememberMe')}</Text>
              </View>
            </Animated.View>
            {/* BOTÓN LOGIN */}
            <Animated.View style={{ alignSelf: "stretch", alignItems: "center" }} entering={FadeInDown.delay(460).duration(500).springify().damping(14).reduceMotion(ReduceMotion.Never)}>
              <ConfettiButton
                onPress={handleLogin}
                disabled={!isButtonEnabled}
                style={[
                  GLOBAL_STYLES.buttonPrimaryGreen,
                  { backgroundColor: COLORS.success },
                ]}
                variant="success"
                disableAutoConfetti={true}
                trigger={showConfetti}
              >
                {t('login.loginButton')}
              </ConfettiButton>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {/* POPUP */}
      <Popup
        visible={popupVisible}
        onClose={handleClosePopup}
        title={popupOptions.title || ""}
        description={popupOptions.description}
        imageType={popupOptions.imageType}
        buttons={popupOptions.buttons}
      />
    </>
  );
};
export default IniciarSesion;