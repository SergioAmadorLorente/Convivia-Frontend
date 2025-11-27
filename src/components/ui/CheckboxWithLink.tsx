import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import GLOBAL_STYLES from '../../styles/styles';
import { COLORS } from '../../styles/theme';

interface CheckboxWithLinkProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Callback when checkbox is pressed */
  onCheckboxPress: () => void;
  /** Label text (plain text part) */
  labelText: string;
  /** Link text (clickable part) */
  linkText: string;
  /** Route name to navigate to when link is pressed */
  linkRoute: string;
}

/**
 * CheckboxWithLink
 * 
 * A reusable component that combines a checkbox with a label containing a clickable link.
 * The label is split into plain text and a link (underlined, colored).
 * 
 * Example:
 * <CheckboxWithLink
 *   checked={checkedPolitica}
 *   onCheckboxPress={() => setCheckedPolitica(!checkedPolitica)}
 *   labelText=""
 *   linkText="Política de privacidad y Cookies"
 *   linkRoute="PoliticaCookiesPrivacidad"
 * />
 */
const CheckboxWithLink: React.FC<CheckboxWithLinkProps> = ({
  checked,
  onCheckboxPress,
  labelText,
  linkText,
  linkRoute,
}) => {
  const navigation = useNavigation<any>();

  const handleLinkPress = () => {
    navigation.navigate(linkRoute);
  };

  return (
    <View style={[GLOBAL_STYLES.checkboxContainer, { alignItems: 'flex-start' }]}>
      <TouchableOpacity
        style={GLOBAL_STYLES.checkbox}
        onPress={onCheckboxPress}
        accessible={true}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={moderateScale(18)}
            color={COLORS.accent}
          />
        )}
      </TouchableOpacity>

      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        {labelText && (
          <Text style={[GLOBAL_STYLES.labelCheckbox as any, { marginRight: 0 }]}>
            {labelText}
          </Text>
        )}
        <TouchableOpacity
          onPress={handleLinkPress}
          accessible={true}
          accessibilityRole="link"
          accessibilityLabel={`Navigate to ${linkRoute}`}
        >
          <Text
            style={[
              GLOBAL_STYLES.labelCheckbox as any,
              GLOBAL_STYLES.linkRecuperarPassword,
              { marginLeft: labelText ? 4 : 0 },
            ]}
          >
            {linkText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckboxWithLink;
