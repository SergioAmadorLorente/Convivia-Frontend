import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GLOBAL_STYLES from '../../styles/styles';
import { moderateScale } from 'react-native-size-matters';

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
      {label ? <Text style={GLOBAL_STYLES.label}>{label}</Text> : null}

      <View style={GLOBAL_STYLES.inputPasswordContainer}>
        <TextInput
          style={GLOBAL_STYLES.inputPassword}
          placeholder={placeholder}
          secureTextEntry={!show}
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={() => setShow(!show)} style={GLOBAL_STYLES.eyeIconButton}>
          <Ionicons name={show ? 'eye-off' : 'eye'} size={moderateScale(22)} color="#ACBF8A" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PasswordField;
