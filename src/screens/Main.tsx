import React from "react";
import { Text, View, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import useLoadFonts from "../hooks/useLoadFonts";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import GLOBAL_STYLES from "../styles/styles";

const Main: React.FC = () => {
  const navigation = useNavigation<any>();
  const fontsLoaded = useLoadFonts();

  return (
    <ScrollView
      contentContainerStyle={GLOBAL_STYLES.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={GLOBAL_STYLES.titulo}>¡Hola!</Text>
      <Text style={GLOBAL_STYLES.subtitulo}>Bienvenido a Convivia</Text>

      <View>
        <Text style={GLOBAL_STYLES.parrafo}>
          Organiza, colabora y cumple tus metas junto a tus compañeros.{"\n"}
          ¡Aquí la productividad es compartida y las ideas fluyen en sintonía!
        </Text>
      </View>

      <Logo />

      <Button
        style={GLOBAL_STYLES.buttonPrimaryGreen}
        onPress={() => navigation.navigate("CrearCuenta")}
      >
        Crea una cuenta
      </Button>
      <Button
        style={GLOBAL_STYLES.buttonSecondaryGrey}
        onPress={() => navigation.navigate("IniciarSesion")}
      >
        Inicia sesión
      </Button>
    </ScrollView>
  );
};

export default Main;
