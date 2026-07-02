import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootStackParamList";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles/theme";
import { useTabColor } from "../../hooks/useTabColor";
import { useTranslation } from "react-i18next";
const BottomBar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const toggleMenu = () => {
    if (open) {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setOpen(false));
    } else {
      setOpen(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }).start();
    }
  };
  const homeColor = useTabColor("DashBoardPersonal");
  const profileColor = useTabColor("Perfil");

  // Pantallas que pertenecen a la sección de Perfil
  const profileScreens = ["Perfil", "EditarPerfil", "MiResidencia", "EditarResidencia", "MiKarma", "InfoLegal", "FAQ"];
  const isInProfileSection = profileScreens.includes(route.name);

  const navigateTo = (screenName: "DashBoardPersonal" | "Perfil") => {
    if (screenName === "Perfil") {
      // Si ya estamos en la sección de Perfil, solo volvemos atrás
      if (isInProfileSection) {
        navigation.goBack();
      } else {
        // Si venimos de Dashboard, reemplazamos
        navigation.replace("Perfil");
      }
    } else if (screenName === "DashBoardPersonal") {
      // Si no estamos en Dashboard, navegamos a él
      if (route.name !== "DashBoardPersonal") {
        navigation.replace("DashBoardPersonal");
      }
    }
  };

  return (
    <>
      {open && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlayFullScreen} />
        </TouchableWithoutFeedback>
      )}
      {/** MENÚ FLOTANTE */}
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          styles.floatingMenu,
          {
            bottom: open ? 120 : -300,
            transform: [{ scale: scaleAnim }],
            opacity: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
          }
        ]}
      >
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate("CreateFactura");
          }}
        >
          <View style={styles.circleIcon}>
            <Text style={styles.circleIconText}>€</Text>
          </View>
          <Text style={styles.menuText}>{t('bottomBar.createInvoice')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate("CreateTask");
          }}
        >
          <View style={styles.circleIcon}>
            <Text style={styles.circleIconText}>T</Text>
          </View>
          <Text style={styles.menuText}>{t('bottomBar.createTask')}</Text>
        </TouchableOpacity>
      </Animated.View>
      {/** BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tab} onPress={() => navigateTo("DashBoardPersonal")}>
          <Ionicons name="home-outline" size={28} color={homeColor} />
          <Text style={styles.label}>{t('bottomBar.home')}</Text>
        </TouchableOpacity>
        <View style={styles.plusContainer}>
          <TouchableOpacity style={styles.plusButton} onPress={toggleMenu}>
            <Ionicons name="add-outline" size={40} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={[styles.label, styles.createLabel]}>{t('bottomBar.create')}</Text>
        </View>
        <TouchableOpacity style={styles.tab} onPress={() => navigateTo("Perfil")}>
          <Ionicons name="person-outline" size={28} color={profileColor} />
          <Text style={styles.label}>{t('bottomBar.profile')}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
export default BottomBar;
const styles = StyleSheet.create({
  overlayFullScreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 1,
  },
  floatingMenu: {
    position: "absolute",
    left: 85,
    zIndex: 2,
  },
  menuItem: {
    flexDirection: "row",
    backgroundColor: "#DDE6D4",
    padding: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },
  circleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  circleIconText: { fontSize: 16 },
  menuText: { fontSize: 15, color: "#4B4741" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 80,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    zIndex: 3,
  },
  tab: { alignItems: "center" },
  label: { fontSize: 14, marginTop: 2, color: "#4B4741" },
  plusContainer: { alignItems: "center", justifyContent: "flex-end" },
  plusButton: {
    position: "absolute",
    top: -50,
    width: 75,
    height: 75,
    borderRadius: 50,
    backgroundColor: "#DDE6D4",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    zIndex: 4,
  },
  createLabel: { marginTop: 30 },
});