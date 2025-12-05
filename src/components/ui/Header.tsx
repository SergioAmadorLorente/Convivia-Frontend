import React from "react";
import { View, Text, StyleSheet } from "react-native";
interface HeaderProps {
    username: string;
    date: string;
    location: string;
}
const Header: React.FC<HeaderProps> = ({ username, date, location }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>
                Hola, {username}, hoy es
            </Text>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.location}>{location}</Text>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: "#f5f5f5",
    },
    greeting: {
        fontSize: 18,
        color: "#333",
        fontFamily: "Montserrat_400Regular",
    },
    date: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
        marginTop: 4,
        fontFamily: "DMSerifDisplay_400Regular",
    },
    location: {
        fontSize: 16,
        color: "#666",
        marginTop: 8,
        fontFamily: "Montserrat_400Regular",
    },
});
export default Header;