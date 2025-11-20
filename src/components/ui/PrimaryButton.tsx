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

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ onPress, disabled, loading, children, style }) => (
  <TouchableOpacity
    style={[GLOBAL_STYLES.primaryButton, style, disabled ? GLOBAL_STYLES.disabledButton : null]}
    onPress={onPress}
    disabled={disabled}
  >
    {loading ? <ActivityIndicator size="small" color="#4B4741" /> : <Text style={GLOBAL_STYLES.primaryButtonText}>{children}</Text>}
  </TouchableOpacity>
);

export default PrimaryButton;
