import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from 'react-native-size-matters';
import { GLOBAL_STYLES, COLORS } from '../styles/styles'; // Ajusta la ruta según tu estructura

const RestablecerPassword = () => {
  // Estados para contraseñas y validación
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const isPasswordValid = password.length >= 8 && password === confirmPassword;

  // Validación de contraseñas
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
    // Aquí podrías enviar la contraseña al backend si todo está bien
    if (!passwordError) {
      console.log('Contraseña válida, proceder con el cambio.');
    }
  };

  // Mostrar indicador de carga mientras se cargan las fuentes
  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.restablecerContainer, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={GLOBAL_STYLES.restablecerContainer}>
        {/* Título principal */}
        <Text style={GLOBAL_STYLES.restablecerTitulo}>Restablecer contraseña</Text>
        <Text style={GLOBAL_STYLES.restablecerSubtitulo}>
          Cambia tu contraseña si no te acuerdas de ella
        </Text>

        {/* Campo de contraseña */}
        <View style={GLOBAL_STYLES.restablecerInputGroup}>
          <Text style={GLOBAL_STYLES.restablecerLabel}>Contraseña</Text>
          <View style={GLOBAL_STYLES.restablecerInputPasswordContainer}>
            <TextInput
              style={GLOBAL_STYLES.restablecerInputPassword}
              placeholder="* * * * * * * *"
              secureTextEntry={!showPassword}
              autoCorrect={false}
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={GLOBAL_STYLES.restablecerEyeIconButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={moderateScale(22)}
                color={COLORS.accent}
              />
            </TouchableOpacity>
          </View>
          <Text style={GLOBAL_STYLES.restablecerErrorText}>{passwordError}</Text>
        </View>

        {/* Campo de confirmación */}
        <View style={GLOBAL_STYLES.restablecerInputGroup}>
          <Text style={GLOBAL_STYLES.restablecerLabel}>Confirma la contraseña</Text>
          <View style={GLOBAL_STYLES.restablecerInputPasswordContainer}>
            <TextInput
              style={GLOBAL_STYLES.restablecerInputPassword}
              placeholder="* * * * * * * *"
              secureTextEntry={!showConfirmPassword}
              autoCorrect={false}
              autoComplete="confirmPassword"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={GLOBAL_STYLES.restablecerEyeIconButton}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={moderateScale(22)}
                color={COLORS.accent}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón para enviar nueva contraseña */}
        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={!isPasswordValid}
          style={[
            GLOBAL_STYLES.restablecerBoton,
            { backgroundColor: !isPasswordValid ? COLORS.disabled : COLORS.success },
          ]}
        >
          <Text style={GLOBAL_STYLES.restablecerTextoBoton}>Restablecer contraseña</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RestablecerPassword;