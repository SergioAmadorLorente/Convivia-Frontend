import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootStackParamList";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../styles/theme";
import { useTabColor } from "../../hooks/useTabColor";
import { useTranslation } from "react-i18next";
const BottomBar = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  /** Rotación del "+": 0° cuando cerrado, 45° (a ×) cuando abierto */
  const plusRotation = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const toggleMenu = () => {
    if (open) {
      // Cerrar: todo en paralelo (rápido y limpio)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(itemAnims[0], {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(itemAnims[1], {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => setOpen(false));
    } else {
      setOpen(true);
      // Abrir: escalonado pero ágil (el segundo ítem entra casi a la vez que
      // el primero, con un delay corto, sin esperar al final del primer spring)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(itemAnims[0], {
          toValue: 1,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(100),
          Animated.spring(itemAnims[1], {
            toValue: 1,
            friction: 8,
            tension: 90,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
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
            bottom: open ? 115 : -300,
            transform: [{ scale: scaleAnim }],
            opacity: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
          }
        ]}
      >
        <Animated.View
          style={[
            styles.menuItemShadow,
            {
              transform: [
                { translateY: itemAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              ],
              opacity: itemAnims[0],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              toggleMenu();
              navigation.navigate("CreateFactura");
            }}
          >
            <View style={[styles.circleIcon, { backgroundColor: COLORS.accent }]}>
              <Ionicons name="receipt-outline" size={14} color="#fff" />
            </View>
            <Text style={styles.menuText}>{t('bottomBar.createInvoice')}</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            styles.menuItemShadow,
            {
              transform: [
                { translateY: itemAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              ],
              opacity: itemAnims[1],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              toggleMenu();
              navigation.navigate("CreateTask");
            }}
          >
            <View style={[styles.circleIcon, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="checkbox-outline" size={14} color="#fff" />
            </View>
            <Text style={styles.menuText}>{t('bottomBar.createTask')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
      {/** BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tab} onPress={() => navigateTo("DashBoardPersonal")}>
          <Ionicons name="home-outline" size={28} color={homeColor} />
          <Text style={styles.label}>{t('bottomBar.home')}</Text>
        </TouchableOpacity>
        <View style={styles.plusContainer}>
          <TouchableOpacity style={styles.plusButton} onPress={toggleMenu}>
            <Animated.View style={{ transform: [{ rotate: plusRotation }] }}>
              <Ionicons name="add-outline" size={40} color={COLORS.primary} />
            </Animated.View>
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
    left: 0,
    right: 0,
    bottom: -300,
    zIndex: 2,
    alignItems: "center",
  },
  menuItemShadow: {
    // La sombra y el borde viven en el contenedor que se anima (viajan con la
    // píldora). El marginBottom aplica aquí, entre botones, para que el hueco
    // no hinche el interior del botón.
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EDEAE4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 18,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  circleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  menuText: {
    fontSize: 13,
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
    letterSpacing: 0.2,
  },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  createLabel: { marginTop: 30 },
});