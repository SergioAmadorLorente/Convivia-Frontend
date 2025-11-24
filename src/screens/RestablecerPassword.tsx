import React, { useState, useEffect, useRef } from 'react';
import { Platform ,Text, View, Keyboard, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from 'react-native-size-matters';
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from '../styles/styles';
import { COLORS } from '../styles/theme';
import { useKeyboardAware } from '../hooks';

const RestablecerPassword: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular, Montserrat_400Regular, Montserrat_700Bold });

  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });

  const isPasswordValid = password.length >= 8 && password === confirmPassword;

  useEffect(() => {
    if (password.length === 0 && confirmPassword.length === 0) {
      setPasswordError('');
      return;
    }

    if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
    } else if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
    } else {
      setPasswordError(' ');
    }
  }, [password, confirmPassword]);

  const handleChangePassword = () => {
    if (!passwordError) {
      console.log('Contraseña válida, proceder con el cambio.');
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.restablecerContainer, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View ref={containerRef} style={[GLOBAL_STYLES.restablecerContainer, Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {}]}>
        <Text style={GLOBAL_STYLES.restablecerTitulo}>Restablecer contraseña</Text>
        <Text style={GLOBAL_STYLES.restablecerSubtitulo}>Cambia tu contraseña si no te acuerdas de ella</Text>

          <View style={GLOBAL_STYLES.restablecerInputGroup}>
          <Text style={GLOBAL_STYLES.restablecerLabel}>Contraseña</Text>
          <View style={GLOBAL_STYLES.restablecerInputPasswordContainer}>
            <TextInput style={GLOBAL_STYLES.restablecerInputPassword} placeholder="* * * * * * * *" secureTextEntry={!showPassword} autoCorrect={false} textContentType="newPassword" value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={GLOBAL_STYLES.restablecerEyeIconButton}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={moderateScale(22)} color={COLORS.accent} />
            </TouchableOpacity>
          </View>
          <Text style={GLOBAL_STYLES.restablecerErrorText}>{passwordError}</Text>
        </View>

          <View style={GLOBAL_STYLES.restablecerInputGroup}>
          <Text style={GLOBAL_STYLES.restablecerLabel}>Confirma la contraseña</Text>
          <View style={GLOBAL_STYLES.restablecerInputPasswordContainer}>
            <TextInput style={GLOBAL_STYLES.restablecerInputPassword} placeholder="* * * * * * * *" secureTextEntry={!showConfirmPassword} autoCorrect={false} textContentType="newPassword" value={confirmPassword} onChangeText={setConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={GLOBAL_STYLES.restablecerEyeIconButton}>
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={moderateScale(22)} color={COLORS.accent} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleChangePassword} disabled={!isPasswordValid} style={[GLOBAL_STYLES.restablecerBoton, { backgroundColor: !isPasswordValid ? COLORS.disabled : COLORS.success }]}>
          <Text style={GLOBAL_STYLES.restablecerTextoBoton}>Restablecer contraseña</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RestablecerPassword;
