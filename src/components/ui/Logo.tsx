import React from "react";
import { View, Text } from "react-native";
import GLOBAL_STYLES from "../../styles/styles";
import LogoReal from "../../assets/logoReal.svg";

const Logo: React.FC = () => (
  <>
    <LogoReal style={GLOBAL_STYLES.logo} />

    <View style={GLOBAL_STYLES.logoContainer}>
      <Text style={GLOBAL_STYLES.tituloLogo}>Convivia</Text>
      <Text style={GLOBAL_STYLES.esloganLogo}>JUNTOS, SIN ENREDOS</Text>
    </View>
  </>
);

export default Logo;
