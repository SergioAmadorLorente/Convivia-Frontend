import React, { useState } from 'react';
import {
  Text,
  View,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { GLOBAL_STYLES, COLORS } from './styles'; // Ajusta la ruta según tu estructura

const RecuperarPassword = () => {
  // Estado para el correo electrónico y validación
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const navigation = useNavigation();

  // Carga de fuentes personalizadas
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  // Mostrar indicador de carga mientras se cargan las fuentes
  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.recuperarContainerPrincipal, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Validación del formato del correo electrónico
  const validateEmail = (text) => {
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
        {/* Título principal */}
        <Text style={GLOBAL_STYLES.recuperarTitulo}>Recuperar contraseña</Text>
        <Text style={GLOBAL_STYLES.recuperarSubtitulo}>¿Has olvidado tu contraseña?</Text>

        {/* Bloque de formulario */}
        <View style={GLOBAL_STYLES.recuperarBloque}>
          <Text style={GLOBAL_STYLES.recuperarLabelCorreo}>Correo electrónico</Text>
          <TextInput
            style={GLOBAL_STYLES.recuperarInput}
            placeholder="usuario@dominio"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={validateEmail}
          />
          {/* Mostrar mensaje de error si el correo no es válido */}
          {emailError ? <Text style={GLOBAL_STYLES.recuperarErrorText}>{emailError}</Text> : null}

          {/* Texto explicativo debajo del input */}
          <Text style={GLOBAL_STYLES.recuperarSubTextEmail}>
            Ingresa tu dirección de correo electrónico y te enviaremos un enlace para que puedas
            crear una nueva contraseña de forma segura.{'\n'}{'\n'}
            La dirección ingresada debe contar con un formato estándar (por ejemplo,
            usuario@dominio.com).
          </Text>

          {/* Botón para enviar correo de recuperación */}
          <TouchableOpacity
            style={[
              GLOBAL_STYLES.botonRecuperarPassword,
              { backgroundColor: isValidEmail ? COLORS.success : COLORS.disabled },
            ]}
            disabled={!isValidEmail}
          >
            <Text style={GLOBAL_STYLES.textoRecuperarPassword}>Enviar correo</Text>
          </TouchableOpacity>
        </View>

        {/* Botón temporal para navegación directa */}
        <TouchableOpacity
          style={GLOBAL_STYLES.botonTemp}
          onPress={() => navigation.navigate('RestablecerPassword')}
        >
          <Text style={GLOBAL_STYLES.botonTempText}>Boton Temporal Restablecer Contraseña</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RecuperarPassword;