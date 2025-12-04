import React from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { Montserrat_400Regular, Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { useNavigation } from "@react-navigation/native";
import GLOBAL_STYLES from "../../styles/styles";
import BottomBar from "../../components/ui/BottomBar";
import Button from "../../components/ui/Button";
import ConfettiButton from "../../components/ui/ConfettiButton";
import { COLORS } from "../../styles/theme";

const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={GLOBAL_STYLES.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={[GLOBAL_STYLES.container, { paddingBottom: 120 }]}
        keyboardShouldPersistTaps="always"
      >
        <Text style={[GLOBAL_STYLES.title, { fontSize: 28, textAlign: "center" }]}>
          Tu DashBoardPersonal comienza aquí.
        </Text>

        <Text style={[GLOBAL_STYLES.subtitle, { textAlign: "center", marginVertical: 10 }]}>
          Perfil
        </Text>

        <Button
          style={GLOBAL_STYLES.buttonPrimaryGreen}
          onPress={() => {
            console.log("Ir a NuevaResidencia");
            navigation.navigate("NuevaResidencia");
          }}
        >
          Crea una residencia nueva
        </Button>

        <Button
          style={GLOBAL_STYLES.buttonSecondaryGrey}
          onPress={() => {
            console.log("Ir a UnirResidencia");
            navigation.navigate("UnirResidencia");
          }}
        >
          Únete a una residencia!
        </Button>

        <ConfettiButton
          style={[GLOBAL_STYLES.buttonPrimaryGreen, { backgroundColor: COLORS.success }]}
          variant="success"
          onPress={() => {
            console.log("ConfettiButton presionado 🎉");
          }}
        >
          Celebrar 🎉
        </ConfettiButton>
      </ScrollView>

      {/* PIE DE PÁGINA */}
      <BottomBar />
    </KeyboardAvoidingView>
  );
};

export default DashBoardPersonal;