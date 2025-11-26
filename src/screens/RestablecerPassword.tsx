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
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';

const RestablecerPassword: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

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

        <TextField label="Contraseña" placeholder="* * * * * * * *" secureTextEntry value={password} onChangeText={setPassword} error={passwordError} />

        <TextField label="Confirma la contraseña" placeholder="* * * * * * * *" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

        <Button onPress={handleChangePassword} disabled={!isPasswordValid} style={[GLOBAL_STYLES.buttonPrimaryGreen, { backgroundColor: !isPasswordValid ? COLORS.disabled : COLORS.success }]}>Restablecer contraseña</Button>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RestablecerPassword;
