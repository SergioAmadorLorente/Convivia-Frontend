
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, FONTS, SIZES } from "../../styles/theme";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  username: string;
  date: string | Date;   // Acepta string o Date
  location: string;
}

const LOCALE_MAP: Record<string, string> = {
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
};

function formatLongDate(date: Date, locale: string): string {
  const lang = locale.split("-")[0]; // "es-ES" → "es"
  const intlLocale = LOCALE_MAP[lang] ?? "en-US";

  const fmt = new Intl.DateTimeFormat(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  // Capitaliza la primera letra de cada palabra
  return fmt
    .split(" ")
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const Header: React.FC<HeaderProps> = ({ username, date, location }) => {
  const { t, i18n } = useTranslation();
  const displayDate = typeof date === "string" ? date : formatLongDate(date, i18n.language);

  const isUsernameLoading = username === "......";
  const isLocationLoading = location === "......";

  return (
    <View style={styles.container}>
      {isUsernameLoading ? (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 24 }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={[styles.greeting, { color: "#999" }]}>{t("common.loading")}</Text>
        </View>
      ) : (
        <Text style={styles.greeting}>{t('dashboard.greeting', { username })}</Text>
      )}

      <Text style={styles.date}>{displayDate}</Text>

      {isLocationLoading ? (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 20, marginTop: 8 }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={[styles.location, { color: "#999", marginTop: 0 }]}>{t("common.loading")}</Text>
        </View>
      ) : (
        <Text style={styles.location}>{location}</Text>
      )}
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