import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { GLOBAL_STYLES } from '../../styles/styles';

const TextField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', error }) => (
  <View style={GLOBAL_STYLES.inputGroup}>
    {label ? <Text style={GLOBAL_STYLES.label}>{label}</Text> : null}
    <TextInput
      style={GLOBAL_STYLES.input}
      placeholder={placeholder}
      keyboardType={keyboardType}
      autoCapitalize="none"
      autoCorrect={false}
      value={value}
      onChangeText={onChangeText}
    />
    {error ? <Text style={GLOBAL_STYLES.errorText}>{error}</Text> : null}
  </View>
);

export default TextField;
