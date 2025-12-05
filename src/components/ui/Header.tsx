import React from "react";
import { View, Text, StyleSheet } from "react-native";
import GLOBAL_STYLES, { COLORS, FONTS, SIZES } from "../../styles/styles";

interface HeaderProps {
    username: string;
    date: string;
    location: string;
}

const Header: React.FC<HeaderProps> = ({ username, date, location }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>Hola, {username}</Text>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.location}>{location}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingVertical: SIZES.paddingVertical,
        paddingHorizontal: SIZES.paddingHorizontal,
        backgroundColor: COLORS.inputBackground,
        width: "100%",
    },
    greeting: {
        fontSize: SIZES.label,
        color: COLORS.secondary,
        fontFamily: FONTS.regular,
    },
    date: {
        fontSize: SIZES.welcomeTitle,
        color: COLORS.primary,
        marginTop: 4,
        fontFamily: FONTS.title,
    },
    location: {
        fontSize: SIZES.subtitle,
        color: COLORS.secondary,
        marginTop: 8,
        fontFamily: FONTS.regular,
    },
});

export default Header;