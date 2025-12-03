import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import GLOBAL_STYLES from "../../styles/styles";
import { COLORS } from "../../styles/theme";

interface ButtonProps {
  onPress?: () => void;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "alt" | "success" | string;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  onClick,
  disabled,
  loading,
  children,
  style,
  variant = "primary",
}) => {
  const resolvedOnPress = onPress ?? onClick ?? (() => {});

  // Default to the primary green style. Use 'secondary' or 'alt' variant for grey.
  let baseStyle: any = GLOBAL_STYLES.buttonPrimaryGreen;
  let textStyle: any = GLOBAL_STYLES.textoBoton;

  if (variant === "alt" || variant === "secondary") {
    baseStyle = GLOBAL_STYLES.buttonSecondaryGrey;
    textStyle = GLOBAL_STYLES.textoBoton;
  }

  const buttonStyle = [baseStyle, style, disabled ? { opacity: 0.6 } : null];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={resolvedOnPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : typeof children === "string" || typeof children === "number" ? (
        <Text style={textStyle}>{children}</Text>
      ) : (
        // Allow custom elements (e.g. ActivityIndicator wrapped) to be passed as children
        children
      )}
    </TouchableOpacity>
  );
};

export default Button;
