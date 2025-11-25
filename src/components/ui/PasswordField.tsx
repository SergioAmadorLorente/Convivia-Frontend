import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GLOBAL_STYLES from '../../styles/styles';
import { moderateScale } from 'react-native-size-matters';
import { SIZES, FONTS } from '../../styles/theme';

interface PasswordFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, value, onChangeText, placeholder }) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <View style={GLOBAL_STYLES.inputGroup}>
      {label ? <Text style={[GLOBAL_STYLES.labelBase]}>{label}</Text> : null}

      <View style={[GLOBAL_STYLES.inputPasswordContainer, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <TextInput
          style={{ flex: 1, fontSize: SIZES.passwordInput, fontFamily: FONTS.regular, paddingVertical: 0 }}
          placeholder={placeholder}
          secureTextEntry={!show}
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={() => setShow(!show)} style={[GLOBAL_STYLES.eyeIconButton, { marginLeft: 8 }]} accessible accessibilityLabel={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          <Ionicons name={show ? 'eye-off' : 'eye'} size={moderateScale(22)} color="#ACBF8A" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PasswordField;
