import React, { useRef, useState } from "react";
import {
  Text,
  View,
  Keyboard,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation } from "@react-navigation/native";
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from "../../styles/styles";
import { COLORS } from "../../styles/theme";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../configs/firebaseConfig";
import Popup from "../../components/ui/Popup";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";
import { useKeyboardAware } from "../../hooks";
import { useEmailValidation } from "../../hooks/useEmailValidation";
const RecuperarPassword: React.FC = () => {
  const navigation = useNavigation<any>();
  // Hook de validación de email
  const { email, setEmail, isValidEmail, emailError } = useEmailValidation();
  // Carga de fuentes
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });
  // Popup
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});
  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });
  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };
  const handleClosePopup = () => setPopupVisible(false);
  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const handleResetPassword = async () => {
    if (!isValidEmail) return;
    try {
      await sendPasswordResetEmail(auth, email);
      showPopup({
        title: "Correo enviado",
        description:
          "Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.",
        imageType: "success",
        buttons: [
          {
            text: "Aceptar",
            onPress: () => navigation.navigate("IniciarSesion"),
          },
        ],
      });
    } catch (err: any) {
      console.log(err);
      let message = "No se pudo enviar el correo.";
      if (err.code === "auth/user-not-found")
        message = "No existe ninguna cuenta con este correo.";
      if (err.code === "auth/invalid-email")
        message = "El correo ingresado no es válido.";
      showPopup({
        title: "Error",
        description: message,
        imageType: "error",
        buttons: [{ text: "Aceptar", onPress: () => {} }],
      });
    }
  };
  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          ref={containerRef}
          style={[
            GLOBAL_STYLES.container,
            Platform.OS === "web" ? WEB_FULL_VIEWPORT : {},
          ]}
        >
          <Text style={GLOBAL_STYLES.titulo}>Recuperar contraseña</Text>
          <Text style={[GLOBAL_STYLES.subtitle, { marginBottom: 18 }]}>
            ¿Has olvidado tu contraseña?
          </Text>
          {/* BLOQUE PRINCIPAL */}
          <View style={[GLOBAL_STYLES.recuperarBloque, { marginTop: 0 }]}>
            <TextField
              label="Correo electrónico"
              placeholder="usuario@dominio.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />
            <Text style={[GLOBAL_STYLES.helperText, { marginTop: 10 }]}>
              {`Ingresa tu correo electrónico y te enviaremos un enlace para crear una nueva contraseña.\n\nDebe tener un formato válido, por ejemplo: usuario@dominio.com`}
            </Text>
            <Button
              style={[
                GLOBAL_STYLES.buttonPrimaryGreen,
                {
                  backgroundColor: isValidEmail
                    ? COLORS.success
                    : COLORS.disabled,
                },
              ]}
              disabled={!isValidEmail}
              onPress={handleResetPassword}
            >
              Enviar correo
            </Button>
          </View>
        </View>
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
export default RecuperarPassword;
