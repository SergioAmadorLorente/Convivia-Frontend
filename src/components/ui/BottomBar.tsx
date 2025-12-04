import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    TouchableWithoutFeedback,
    Dimensions,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/RootStackParamList";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles/theme";
import { useTabColor } from "../../hooks/useTabColor";
const { height } = Dimensions.get("window");
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
    const homeColor = useTabColor("DashBoardPersonal");
    const profileColor = useTabColor("Perfil");
    return (
        <View style={styles.wrapper}>
            {/* -------- OVERLAY GRIS -------- */}
            {open && (
                <TouchableWithoutFeedback onPress={toggleMenu}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}
            {/* -------- MENÚ FLOTANTE -------- */}
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
            {/* -------- BOTTOM BAR -------- */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate("DashBoardPersonal")}
                >
                    <Ionicons name="home-outline" size={28} color={homeColor} />
                    <Text style={styles.label}>Inicio</Text>
                </TouchableOpacity>
                <View style={styles.plusContainer}>
                    <TouchableOpacity style={styles.plusButton} onPress={toggleMenu}>
                        <Ionicons name="add-outline" size={40} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.label, styles.createLabel]}>Crear</Text>
                </View>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate("Perfil")}
                >
                    <Ionicons name="person-outline" size={28} color={profileColor} />
                    <Text style={styles.label}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default BottomBar;
const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: height,
        alignItems: "center",
    },
    /* OVERLAY GRIS */
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 80, // altura del bottom bar
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: 1,
    },
    /* MENU FLOTANTE */
    floatingMenu: {
        position: "absolute",
        bottom: 120,
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
        justifyContent: "space-around",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        zIndex: 3,
    },
    tab: {
        alignItems: "center",
    },
    label: {
        fontSize: 14,
        marginTop: 2,
        color: "#4B4741",
    },
    plusContainer: {
        alignItems: "center",
        justifyContent: "flex-end",
    },
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
    createLabel: {
        marginTop: 30,
    },
});