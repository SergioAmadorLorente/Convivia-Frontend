import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import BottomBar from "../../components/ui/BottomBar";
import SubscriptionCard from "../../components/ui/SubscriptionCard";
import ConviviaProHeader from "../../components/ui/ConviviaProHeader";
import Button from "../../components/ui/Button";
import { COLORS, FONTS, SIZES, HELPERS, COMMON } from "../../styles/theme";
import LogoReal from "../../assets/logoReal.svg";

const { width } = Dimensions.get("window");

const ConviviaPro: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const features = [
    "Funcionalidad premium 1: Residencias ilimitadas",
    "Funcionalidad premium 2: Soporte 24/7",
   // "Funcionalidad premium 3: Cena gratis con el equipo de Convivia",
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#A8B89E" />
        </TouchableOpacity>

        {/* Header Component */}
        <ConviviaProHeader features={features} />

        {/* White Container for Cards and Bottom Content */}
        <View style={styles.whiteContainer}>
          {/* Subscription Cards */}
          <View style={styles.cardsContainer}>
            <SubscriptionCard
              duration="1 Mes"
              price="3,99€ / Mes"
              isSelected={selectedPlan === "monthly"}
              onPress={() => setSelectedPlan("monthly")}
            />

            <SubscriptionCard
              duration="12 Meses"
              price="23,94€"
              oldPrice="47,88€"
              pricePerMonth="1,99€ / Mes"
              isSelected={selectedPlan === "yearly"}
              isBest={true}
              onPress={() => setSelectedPlan("yearly")}
            />
          </View>

          {/* Trial Info */}
          <Text style={styles.trialInfo}>
            Empieza tu periodo de prueba de 7 días gratis.
            <Text style={styles.trialInfoBold}>Cancela en cualquier momento.</Text>
          </Text>

          {/* Subscribe Button */}
          <View style={styles.buttonContainer}>
            <Button onPress={() => console.log("Suscribirse")}>
              Pruébalo gratis y subscríbete
            </Button>
          </View>
        </View>
      </ScrollView>

      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F4F2",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: HELPERS.hp("10%"),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: HELPERS.hp("2%"),
    marginBottom: 1,
    backgroundColor: "#F5F4F2",
  },
  backText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text16,
    color: "#A8B89E",
    marginLeft: 5,
  },
  whiteContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
    marginTop: -10,
    flex: 1,
  },
  cardsContainer: {
    width: "100%",
    alignSelf: "center",
  },
  trialInfo: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text14,
    color: "#4B4741",
    textAlign: "center",
    width: width * 0.85,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 1,
    lineHeight: 22,
  },
  trialInfoBold: {
    fontFamily: FONTS.bold,
  },
  buttonContainer: {
    marginTop: 5,
    marginBottom: 20,
  },
});

export default ConviviaPro;
