import React, { useState } from 'react';
import { Text, View, Keyboard, ActivityIndicator, TouchableOpacity, TextInput, TouchableWithoutFeedback, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import GLOBAL_STYLES, { COLORS } from '../styles/styles';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../configs/firebaseConfig';

const RecuperarPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const navigation = useNavigation<any>();

  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular, Montserrat_400Regular, Montserrat_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.recuperarContainerPrincipal, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError('Por favor, introduce un correo válido');
    } else {
      setEmailError('');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={GLOBAL_STYLES.recuperarContainerPrincipal}>
        <Text style={GLOBAL_STYLES.recuperarTitulo}>Recuperar contraseña</Text>
        <Text style={GLOBAL_STYLES.recuperarSubtitulo}>¿Has olvidado tu contraseña?</Text>

        <View style={GLOBAL_STYLES.recuperarBloque}>
          <Text style={GLOBAL_STYLES.recuperarLabelCorreo}>Correo electrónico</Text>
          <TextInput style={GLOBAL_STYLES.recuperarInput} placeholder="usuario@dominio" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={validateEmail} />
          {emailError ? <Text style={GLOBAL_STYLES.recuperarErrorText}>{emailError}</Text> : null}

          <Text style={GLOBAL_STYLES.recuperarSubTextEmail}>
            {`Ingresa tu dirección de correo electrónico y te enviaremos un enlace para que puedas crear una nueva contraseña de forma segura.\n\nLa dirección ingresada debe contar con un formato estándar (por ejemplo, usuario@dominio.com).`}
          </Text>

          <TouchableOpacity
            style={[GLOBAL_STYLES.botonRecuperarPassword, { backgroundColor: isValidEmail ? COLORS.success : COLORS.disabled }]}
            disabled={!isValidEmail}
            onPress={async () => {
              try {
                await sendPasswordResetEmail(auth, email);
                Alert.alert('Correo enviado', 'Se ha enviado un correo para restablecer la contraseña. Revisa tu bandeja de entrada.');
                navigation.navigate('Main');
              } catch (err: any) {
                Alert.alert('Error', 'No se pudo enviar el correo: ' + (err?.message ?? String(err)));
              }
            }}
          >
            <Text style={GLOBAL_STYLES.textoRecuperarPassword}>Enviar correo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={GLOBAL_STYLES.botonTemp} onPress={() => navigation.navigate('RestablecerPassword')}>
          <Text style={GLOBAL_STYLES.botonTempText}>Boton Temporal Restablecer Contraseña</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RecuperarPassword;
