import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import GLOBAL_STYLES from '../../styles/styles';

interface PrimaryButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}


const PrimaryButton: React.FC<PrimaryButtonProps> = ({ onPress, disabled, loading, children, style }) => {
  // If a backgroundColor is provided in style, use it; otherwise, use the default from GLOBAL_STYLES
  const buttonStyle = [
    GLOBAL_STYLES.primaryButton,
    style,
    disabled ? { opacity: 0.6 } : null,
  ];
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4B4741" />
      ) : (
        <Text style={GLOBAL_STYLES.primaryButtonText}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
