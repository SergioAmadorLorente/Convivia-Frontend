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

const TerminosCondiciones: React.FC = () => {
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
        <Text style={[GLOBAL_STYLES.titulo, { fontSize: 42 }]}>
          {t("terminosCondiciones.title")}
        </Text>

        <View style={{ width: "85%", marginTop: 20 }}>
          <Text style={[GLOBAL_STYLES.subtitle, { marginBottom: 12 }]}>
            {t("terminosCondiciones.intro")}
          </Text>

          <Desplegable title={t("terminosCondiciones.section1Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("terminosCondiciones.section1Body")}
            </Text>
            <Text
              style={[
                GLOBAL_STYLES.helperText,
                { marginBottom: 12, marginLeft: 16 },
              ]}
            >
              {t("terminosCondiciones.section1Item1")}
            </Text>
            <Text
              style={[
                GLOBAL_STYLES.helperText,
                { marginBottom: 12, marginLeft: 16 },
              ]}
            >
              {t("terminosCondiciones.section1Item2")}
            </Text>
            <Text
              style={[
                GLOBAL_STYLES.helperText,
                { marginBottom: 12, marginLeft: 16 },
              ]}
            >
              {t("terminosCondiciones.section1Item3")}
            </Text>
          </Desplegable>

          <Desplegable title={t("terminosCondiciones.section2Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("terminosCondiciones.section2Body")}
            </Text>
            <Text
              style={[
                GLOBAL_STYLES.helperText,
                { marginBottom: 12, marginLeft: 16 },
              ]}
            >
              {t("terminosCondiciones.section2Item1")}
            </Text>
            <Text
              style={[
                GLOBAL_STYLES.helperText,
                { marginBottom: 12, marginLeft: 16 },
              ]}
            >
              {t("terminosCondiciones.section2Item2")}
            </Text>
            <Text
              style={[
                GLOBAL_STYLES.helperText,
                { marginBottom: 12, marginLeft: 16 },
              ]}
            >
              {t("terminosCondiciones.section2Item3")}
            </Text>
          </Desplegable>

          <Desplegable title={t("terminosCondiciones.section3Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("terminosCondiciones.section3Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("terminosCondiciones.section4Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("terminosCondiciones.section4Body")}
            </Text>
          </Desplegable>

          <Desplegable title={t("terminosCondiciones.section5Title")}>
            <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
              {t("terminosCondiciones.section5Body")}
            </Text>
          </Desplegable>
        </View>
      </View>
    </ScrollView>
  );
};

export default TerminosCondiciones;
