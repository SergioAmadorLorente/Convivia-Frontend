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
import { Feather } from "@expo/vector-icons"; // 👈 NUEVO: Feather para checkbox
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../configs/firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { moderateScale } from "react-native-size-matters";
import useLoadFonts from "../../hooks/useLoadFonts";
import { useEmailValidation } from "../../hooks/useEmailValidation";
import { useKeyboardAware } from "../../hooks";
import TextField from "../../components/ui/TextField";
import Button from "../../components/ui/Button";
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
          title: "Error",
          description:
            "El correo no esta verificada. Por favor, verifica tu correo.",
          imageType: "error",
          buttons: [
            {
              text: "Aceptar",
              onPress: () => navigation.navigate("Bienvenida"),
            },
          ],
        });
        await sendEmailVerification(userCredential.user);
        navigation.navigate("VerificacionCuentaNueva");
        return;
      }
      // OK login
      setShowConfetti(true);
      showPopup({
        title: "Éxito",
        description: "Login exitoso",
        imageType: "success",
        buttons: [
          { text: "Aceptar", onPress: () => navigation.navigate("Bienvenida") },
        ],
      });
    } catch (error) {
      showPopup({
        title: "Error",
        description: "Credenciales incorrectas o usuario no existe",
        imageType: "error",
        buttons: [{ text: "Aceptar" }],
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
            <Text style={styles.titulo}>Iniciar sesión</Text>
            <Text style={GLOBAL_STYLES.subtitle}>
              ¡Ya estás a punto de poder utilizar la aplicación de Convivia!
            </Text>
            {/* EMAIL */}
            <TextField
              label="Correo electrónico"
              value={email}
              onChangeText={validateEmail}
              placeholder="usuario@dominio"
              keyboardType="email-address"
              error={emailError}
            />
            {/* PASSWORD */}
            <TextField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="• • • • • • • •"
              secureTextEntry
            />
            {/* RECUPERAR CONTRASEÑA */}
            <TouchableOpacity
              style={GLOBAL_STYLES.checkboxContainer}
              onPress={() => navigation.navigate("RecuperarPassword")}
            >
              <Text style={GLOBAL_STYLES.link}>Recuperar contraseña</Text>
            </TouchableOpacity>
            {/* CHECKBOX RECUÉRDAME */}
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
              <Text style={GLOBAL_STYLES.labelCheckbox}>Recuérdame</Text>
            </View>
            {/* BOTÓN LOGIN */}
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
              Entrar
            </ConfettiButton>
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