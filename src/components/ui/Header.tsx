
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SIZES } from "../../styles/theme";

interface HeaderProps {
  username: string;
  date: string | Date;   // Acepta string o Date
  location: string;
}

function formatLongDateEs(date: Date): string {
  const fmt = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  // Capitaliza cada palabra (Miércoles, 15 de Septiembre)
  return fmt
    .split(" ")
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const Header: React.FC<HeaderProps> = ({ username, date, location }) => {
  const displayDate = typeof date === "string" ? date : formatLongDateEs(date);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hola, {username}, hoy es</Text>
      <Text style={styles.date}>{displayDate}</Text>
      <Text style={styles.location}>{location}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    // ⬇️ Bajamos ligeramente el contenido del header
    paddingTop: SIZES.paddingVertical * 7.5,   // antes: 4
    paddingBottom: SIZES.paddingVertical * 0.6,
    paddingHorizontal: SIZES.paddingHorizontal,
    backgroundColor: COLORS.inputBackground,
    width: "100%",
  },
  greeting: {
    fontSize: SIZES.label,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
  date: {
    fontSize: SIZES.welcomeTitle,
    color: COLORS.primary,
    marginTop: 4,
    fontFamily: FONTS.title, // DM Serif Display
    textAlign: "center",
  },
  location: {
    fontSize: SIZES.subtitle,
    color: COLORS.secondary,
    marginTop: 8,
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
});

export default Header;