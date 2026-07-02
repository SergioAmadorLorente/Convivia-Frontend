import React from "react";
import { Text, View, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useLoadFonts from "../hooks/useLoadFonts";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import GLOBAL_STYLES from "../styles/styles";
import { useTranslation } from "react-i18next";

const Main: React.FC = () => {
  const navigation = useNavigation<any>();
  const fontsLoaded = useLoadFonts();
  const { t, i18n } = useTranslation();

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
