
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SIZES } from "../../styles/theme";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  username: string;
  date: string | Date;   // Acepta string o Date
  location: string;
}

function formatLongDate(date: Date, locale: string): string {
  const isEs = locale.startsWith("es");
  const fmt = new Intl.DateTimeFormat(isEs ? "es-ES" : "en-US", {
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
  const { t, i18n } = useTranslation();
  const displayDate = typeof date === "string" ? date : formatLongDate(date, i18n.language);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{t('dashboard.greeting', { username })}</Text>
      <Text style={styles.date}>{displayDate}</Text>
      <Text style={styles.location}>{location}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",

    paddingTop: SIZES.paddingVertical * 7.5,
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