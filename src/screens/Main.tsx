import React, { useEffect, useState, useRef } from "react";
import { Text, View, ScrollView, ActivityIndicator, Animated, Easing } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useLoadFonts from "../hooks/useLoadFonts";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import GLOBAL_STYLES from "../styles/styles";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../configs/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { COLORS, FONTS } from "../styles/theme";

const Main: React.FC = () => {
  const navigation = useNavigation<any>();
  const fontsLoaded = useLoadFonts();
  const { t } = useTranslation();
  const [checkingSession, setCheckingSession] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0.6)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const breatheAnim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.6,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breatheAnim.start();
    return () => breatheAnim.stop();
  }, [fadeAnim, scaleAnim]);

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
      <View style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
          marginBottom: 30,
        }}>
          <Logo />
        </Animated.View>

        <View style={{
          position: "absolute",
          bottom: 80,
          alignItems: "center",
          gap: 15,
        }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{
            fontFamily: FONTS.regular,
            fontSize: 14,
            color: COLORS.secondary,
            opacity: 0.7,
            letterSpacing: 0.5,
          }}>
            {t('main.loadingHome')}
          </Text>
        </View>
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
        onPress={() => {
          // Ya que el back tarda en levantarse no queiro que se itnente levantar con la petiion de crear cuenta o muy probable de error de creacion de usuasrio o se cree mal
          fetch('https://convivia-backend-1ytr.onrender.com/health', {
            method: 'GET',
            headers: { accept: '*/*' },
          })
            .then((res) => res.text())
            .then((text) => console.log('[Backend health]', text))
            .catch((err) => console.log('[Backend health] error:', err));

          navigation.navigate("CrearCuenta");
        }}
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
