import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/RootStackParamList";
const BottomBar = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [open, setOpen] = useState(false);
    const scaleAnim = new Animated.Value(0);
    const toggleMenu = () => {
        Animated.timing(scaleAnim, {
            toValue: open ? 0 : 1,
            duration: 150,
            useNativeDriver: true,
        }).start();
        setOpen(!open);
    };
    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.floatingMenu,
                    { transform: [{ scale: scaleAnim }] },
                ]}
            >
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.circleIcon}><Text>€</Text></View>
                    <Text style={styles.menuText}>Crear nueva factura</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.circleIcon}><Text>T</Text></View>
                    <Text style={styles.menuText}>Crear nueva tarea</Text>
                </TouchableOpacity>
            </Animated.View>
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate("DashBoardPersonal")}
                >
                    <Text style={styles.icon}>🏠</Text>
                    <Text style={styles.text}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.plusButton} onPress={toggleMenu}>
                    <Text style={styles.plus}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate("Perfil")}
                >
                    <Text style={styles.icon}>👤</Text>
                    <Text style={styles.text}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default BottomBar;
// Estilos igual que antes...
const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        alignItems: "center",
    },
    bottomBar: {
        flexDirection: "row",
        backgroundColor: "#ECECEB",
        width: "100%",
        height: 75,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        justifyContent: "space-between",
        paddingHorizontal: 40,
        alignItems: "center",
        position: "relative",
    },
    tab: {
        alignItems: "center",
    },
    icon: {
        fontSize: 25,
    },
    text: {
        fontSize: 14,
    },
    plusButton: {
        position: "absolute",
        top: -30,
        alignSelf: "center",
        width: 65,
        height: 65,
        borderRadius: 40,
        backgroundColor: "#DDE6D4",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
    plus: {
        fontSize: 35,
        color: "#333",
    },
    floatingMenu: {
        position: "absolute",
        bottom: 90,
        alignItems: "flex-start",
    },
    menuItem: {
        flexDirection: "row",
        backgroundColor: "#DDE6D4",
        padding: 10,
        borderRadius: 25,
        alignItems: "center",
        marginBottom: 10,
    },
    circleIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    menuText: {
        fontSize: 15,
    },
});