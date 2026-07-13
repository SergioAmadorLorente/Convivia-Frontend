import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, SIZES } from "../../styles/theme";
import LogoReal from "../../assets/logoReal.svg";
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get("window");

interface ConviviaProHeaderProps {
  features: string[];
}

const ConviviaProHeader: React.FC<ConviviaProHeaderProps> = ({ features }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>{t('conviviaPro.title')}</Text>
      <Text style={styles.subtitle}>Convivia PRO</Text>

      <View style={styles.iconWrapper}>
        <LogoReal width={160} height={120} />
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons
              name="checkmark"
              size={24}
              color="#A8B89E"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
    backgroundColor: "#F5F4F2",
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 28,
    color: "#4B4741",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: FONTS.title,
    fontSize: 28,
    color: "#A8B89E",
    marginBottom: 25,
    textAlign: "center",
  },
  iconWrapper: {
    marginVertical: 5,
    alignItems: "center",
  },
  featuresContainer: {
    width: width * 0.85,
    marginTop: 15,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 6,
  },
  featureText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text14,
    color: "#4B4741",
    flex: 1,
    lineHeight: 20,
  },
});

export default ConviviaProHeader;
