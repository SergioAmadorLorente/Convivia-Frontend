import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS, SIZES, COMMON } from "../../styles/theme";

interface SubscriptionCardProps {
  duration: string;
  price: string;
  oldPrice?: string;
  pricePerMonth?: string;
  isSelected: boolean;
  isBest?: boolean;
  onPress: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  duration,
  price,
  oldPrice,
  pricePerMonth,
  isSelected,
  isBest = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        isBest && styles.planCardBest,
        isSelected && styles.planCardSelected,
      ]}
      onPress={onPress}
    >
      <View style={styles.planHeader}>
        <Text style={styles.planDuration}>{duration}</Text>
        <View style={[
          styles.radioButton,
          isSelected && styles.radioButtonSelected
        ]}>
          {isSelected && <View style={styles.radioButtonInner} />}
        </View>
      </View>

      {oldPrice ? (
        <>
          <View style={styles.priceRow}>
            <Text style={styles.planPriceOld}>{oldPrice}</Text>
            <Text style={styles.planPriceNew}>{price}</Text>
          </View>
          {pricePerMonth && (
            <Text style={styles.planPricePerMonth}>{pricePerMonth}</Text>
          )}
        </>
      ) : (
        <Text style={styles.planPrice}>{price}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  planCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    ...COMMON.SHADOW,
  },
  planCardBest: {
    borderColor: "#A8B89E",
    borderWidth: 2.5,
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planDuration: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.text16,
    color: COLORS.primary,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioButtonInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
  },
  planPrice: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text16,
    color: "#4B4741",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  planPriceOld: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text16,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 12,
  },
  planPriceNew: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.text16,
    color: "#A8B89E",
  },
  planPricePerMonth: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text14,
    color: "#666",
  },
});

export default SubscriptionCard;
