import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/RootStackParamList";
const BottomBar = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [open, setOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const toggleMenu = () => {
    Animated.spring(scaleAnim, {
      toValue: open ? 0 : 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
    setOpen(!open);
  };
  return (
    <View style={styles.container}>
      {/* ------------------ MENÚ FLOTANTE (+) ------------------ */}
      <Animated.View
        style={[
          styles.floatingMenu,
          {
            transform: [{ scale: scaleAnim }],
            opacity: scaleAnim,
          },
        ]}
      >
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.circleIcon}>
            <Text style={styles.circleIconText}>€</Text>
          </View>
          <Text style={styles.menuText}>Crear nueva factura</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.circleIcon}>
            <Text style={styles.circleIconText}>T</Text>
          </View>
          <Text style={styles.menuText}>Crear nueva tarea</Text>
        </TouchableOpacity>
      </Animated.View>
      {/* ------------------ BOTTOM BAR ------------------ */}
      <View style={styles.bottomBar}>
        {/* HOME */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("DashBoardPersonal")}
        >
          <Text style={styles.icon}>🏠</Text>
          <Text style={styles.label}>Inicio</Text>
        </TouchableOpacity>
        {/* BOTÓN CENTRAL + */}
        <TouchableOpacity style={styles.plusButton} onPress={toggleMenu}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
        {/* PERFIL */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate("Perfil")}
        >
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.label}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default BottomBar;
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
  /* MENU FLOTANTE */
  floatingMenu: {
    position: "absolute",
    bottom: 115,
    left: 85,
  },
  menuItem: {
    flexDirection: "row",
    backgroundColor: "#DDE6D4",
    padding: 12,
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
  circleIconText: {
    fontSize: 16,
  },
  menuText: {
    fontSize: 15,
    color: "#4B4741",
  },
  /* BOTTOM BAR */
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#ECECEB",
    width: "100%",
    height: 80,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    justifyContent: "space-around",
    paddingHorizontal: 0,
    alignItems: "center",
    position: "relative",
  },
  /* BOTONES LATERALES */
  tab: {
    alignItems: "center",
  },
  icon: {
    fontSize: 26,
  },
  label: {
    fontSize: 14,
    marginTop: 2,
    color: "#4B4741",
  },
  /* BOTÓN + */
  plusButton: {
    position: "absolute",
    top: -30,
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "#DDE6D4",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  plus: {
    fontSize: 38,
    color: "#4B4741",
    marginTop: -2,
  },
});