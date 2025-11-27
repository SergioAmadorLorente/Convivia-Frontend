import React, { useState, useEffect, useRef } from 'react';
import { Platform, Text, View, Keyboard, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from '../../styles/styles';
import { COLORS } from '../../styles/theme';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { usePasswordValidation } from '../../hooks/usePasswordValidation';
import { useKeyboardAware } from '../../hooks';
const RestablecerPassword: React.FC = () => {
  const { password, setPassword, validations, isValidPassword } = usePasswordValidation();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [matchError, setMatchError] = useState('');
  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });
  // VERIFICAR COINCIDENCIA
  useEffect(() => {
    if (confirmPassword.length === 0) {
      setMatchError('');
      return;
    }
    if (confirmPassword === password) {
      setMatchError('');
    } else {
      setMatchError('Las contraseñas no coinciden');
    }
  }, [password, confirmPassword]);
  const unmetPasswordRequirements: string[] = [];
  if (!validations.length) unmetPasswordRequirements.push('Al menos 8 caracteres');
  if (!validations.uppercase) unmetPasswordRequirements.push('Al menos una letra mayúscula');
  if (!validations.number) unmetPasswordRequirements.push('Al menos un número');
  const canSubmit =
    isValidPassword &&
    confirmPassword === password &&
    matchError === '';
  const handleChangePassword = () => {
    if (!canSubmit) return;
    console.log("Contraseña válida — proceder con el cambio");
  };
  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        ref={containerRef}
        style={[
          GLOBAL_STYLES.container,
          Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {},
        ]}
      >
        <Text style={GLOBAL_STYLES.titulo}>Restablecer contraseña</Text>
        <Text style={GLOBAL_STYLES.subtitle}>
          Cambia tu contraseña si no te acuerdas de ella
        </Text>
        {/* NUEVA CONTRASEÑA */}
        <TextField
          label="Nueva contraseña"
          placeholder="* * * * * * * *"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {/* REQUISITOS DE CONTRASEÑA */}
        <View style={{ marginVertical: 5 }}>
          <Text style={GLOBAL_STYLES.helperText}>Requisitos de la contraseña:</Text>
          {unmetPasswordRequirements.length === 0 ? (
            <Text style={[GLOBAL_STYLES.helperText, { color: COLORS.accent }]}>
              ✓ Contraseña válida
            </Text>
          ) : (
            unmetPasswordRequirements.map((req) => (
              <Text
                key={req}
                style={[GLOBAL_STYLES.helperText, { color: COLORS.error, marginTop: 4 }]}
              >
                ✘ {req}
              </Text>
            ))
          )}
        </View>
        {/* CONFIRMAR */}
        <TextField
          label="Confirma la contraseña"
          placeholder="* * * * * * * *"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={matchError}
        />
        {/* BOTÓN */}
        <Button
          onPress={handleChangePassword}
          disabled={!canSubmit}
          style={[
            GLOBAL_STYLES.buttonPrimaryGreen,
            { backgroundColor: canSubmit ? COLORS.success : COLORS.disabled },
          ]}
        >
          Restablecer contraseña
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
};
export default RestablecerPassword;