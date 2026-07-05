import React from "react";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import GLOBAL_STYLES from "../../styles/styles";
import { Desplegable } from "../../components/ui";
import { useTranslation } from "react-i18next";

const PoliticaCookiesPrivacidad: React.FC = () => {
  const { t } = useTranslation();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={GLOBAL_STYLES.container}>
        <Text style={GLOBAL_STYLES.titulo}>{t("politicaCookies.title")}</Text>

        <View style={{ width: "85%", marginTop: 20 }}>
          <Text style={[GLOBAL_STYLES.subtitle, { marginBottom: 12 }]}>
            {t("politicaCookies.intro")}
          </Text>

          <Desplegable title={t("politicaCookies.section1Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("politicaCookies.section1Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("politicaCookies.section2Title")}>
            <Text style={GLOBAL_STYLES.helperText}>
              {t("politicaCookies.section2Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("politicaCookies.section3Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("politicaCookies.section3Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("politicaCookies.section4Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 24 }]}>
              {t("politicaCookies.section4Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("politicaCookies.section5Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 24 }]}>
              {t("politicaCookies.section5Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("politicaCookies.section6Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("politicaCookies.section6Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("politicaCookies.section7Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("politicaCookies.section7Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("politicaCookies.section8Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("politicaCookies.section8Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("politicaCookies.section9Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("politicaCookies.section9Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("politicaCookies.section10Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("politicaCookies.section10Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("politicaCookies.section11Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 24 }]}>
              {t("politicaCookies.section11Body")}
            </Text>
          </Desplegable>
        </View>
      </View>
    </ScrollView>
  );
};

export default PoliticaCookiesPrivacidad;
