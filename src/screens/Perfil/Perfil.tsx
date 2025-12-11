import React from "react";
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../../components/ui/BottomBar";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
const hp = (percentage: string) =>
  (screenHeight * parseFloat(percentage)) / 100;
const wp = (percentage: string) => (screenWidth * parseFloat(percentage)) / 100;
const moderateScale = (size: number, factor = 0.5) =>
  size + size * factor * (screenWidth / 375 - 1);

const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#6B705C" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              alignItems: "center",
              paddingTop: hp("7%"),
              paddingHorizontal: wp("5%"),
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(40),
                color: "#6B705C",
                fontFamily: "DMSerifDisplay_400Regular",
                textAlign: "center",
              }}
            >
              Perfil
            </Text>
            <Text
              style={{
                fontSize: moderateScale(13),
                color: "#4B4741",
                marginVertical: hp("1%"),
                fontFamily: "Montserrat_400Regular",
                textAlign: "center",
              }}
            >
              Perfil
            </Text>

            <TouchableOpacity
              style={{
                marginTop: hp("3%"),
                backgroundColor: "#E6ECDC",
                paddingVertical: hp("1.5%"),
                paddingHorizontal: wp("10%"),
                borderRadius: 15,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 3,
              }}
              onPress={() => navigation.navigate("UnirResidencia")}
            >
              <Text
                style={{
                  color: "#4B4741",
                  fontSize: moderateScale(15),
                  fontFamily: "Montserrat_400Regular",
                  textAlign: "center",
                }}
              >
                Perfil
              </Text>
            </TouchableOpacity>


          </View>
      <BottomBar/>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default DashBoardPersonal;
