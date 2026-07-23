import React from "react";
import { View, Text } from "react-native";
import GLOBAL_STYLES from "../styles/styles";
import AnimatedLogo from "../components/ui/AnimatedLogo";

const SplashScreen: React.FC = () => {
  return (
    <View style={GLOBAL_STYLES.splashContainer}>
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <AnimatedLogo />
        <View style={{ alignItems: "center", marginTop: 18 }}>
          <Text
            style={[
              GLOBAL_STYLES.title,
              { color: GLOBAL_STYLES.subtitulo.color },
            ]}
          >
            Convivia
          </Text>
          <Text style={GLOBAL_STYLES.subtitle}>JUNTOS, SIN ENREDOS</Text>
        </View>
      </View>
      {/*<Text style={GLOBAL_STYLES.splashText}>Cargando app</Text>*/}
    </View>
  );
};

export default SplashScreen;
