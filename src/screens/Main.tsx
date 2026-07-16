import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useLoadFonts from "../hooks/useLoadFonts";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import GLOBAL_STYLES from "../styles/styles";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../configs/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const Main: React.FC = () => {
  const navigation = useNavigation<any>();
  const fontsLoaded = useLoadFonts();
  const { t } = useTranslation();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Comprueba si hay un usuario autenticado en Firebase y el flag REMEMBER_ME guardado
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const rememberMe = await AsyncStorage.getItem('REMEMBER_ME');
          if (rememberMe === 'true') {
            // Verificar si tiene residencia para saber a dónde redirigir
            const { obtenerEspacioPorUsuarioId } = require('../api/usuarioEspacio');
            try {
              const espacio = await obtenerEspacioPorUsuarioId(user.uid);
              if (espacio && espacio.espacioId && espacio.espacioId !== 'string') {
                navigation.replace('DashBoardPersonal');
              } else {
                navigation.replace('Bienvenida');
              }
            } catch {
              navigation.replace('Bienvenida');
            }
            return;
          }
        } catch {
          // Error de AsyncStorage: no hacer nada, mostrar pantalla normal
        }
      }
      setCheckingSession(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingSession || !fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={GLOBAL_STYLES.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={GLOBAL_STYLES.titulo}>{t('main.hello')}</Text>
      <Text style={GLOBAL_STYLES.subtitulo}>{t('main.welcome')}</Text>

      <View>
        <Text style={GLOBAL_STYLES.parrafo}>
          {t('main.description')}
        </Text>
      </View>

      <Logo />

      <Button
        style={GLOBAL_STYLES.buttonPrimaryGreen}
        onPress={() => navigation.navigate("CrearCuenta")}
      >
        {t('main.createAccount')}
      </Button>
      <Button
        style={GLOBAL_STYLES.buttonSecondaryGrey}
        onPress={() => navigation.navigate("IniciarSesion")}
      >
        {t('main.login')}
      </Button>

    </ScrollView>
  );
};

export default Main;
