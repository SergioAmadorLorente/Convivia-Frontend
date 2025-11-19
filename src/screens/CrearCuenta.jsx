import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from 'react-native-size-matters';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { GLOBAL_STYLES, COLORS } from '../styles/styles';
import { auth } from '../configs/firebaseConfig';

const CrearCuenta = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [checkedPolitica, setCheckedPolitica] = useState(false);
  const [checkedCookies, setCheckedCookies] = useState(false);

  const navigation = useNavigation();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password2, setPassword2] = useState('');
  const [showPassword2, setShowPassword2] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [errorMatch, setErrorMatch] = useState('');
  const [contador, setContador] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState('exito');

  // Agregar validación para la contraseña (al menos 8 caracteres y un número)
  const isValidPassword = password.length >= 8 && /\d/.test(password);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  useEffect(() => {
    if (!isCounting) return; // No hace nada si no está contando

    if (contador === 0) {
      setIsCounting(false); // Detiene el conteo y reactiva el botón
      return;
    }

    const timer = setInterval(() => {
      setContador((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [contador, isCounting]); // Dependencias: contador y isCounting

  const validateEmail = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError('Por favor, introduce un correo válido');
    } else {
      setEmailError('');
    }
  };

  const validarBBDD = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('IniciarSesion');
    } catch (error) {
      setEmailError('No se pudo crear la cuenta: ' + error.message);
    }
  };

  // Función para manejar el envío inicial o reenvío (mismo botón)
  const handleEnviarVerificacion = () => {
    setContador(60); // Inicia o reinicia la cuenta atrás
    setIsCounting(true); // Deshabilita el botón y activa el conteo
    validarBBDD();


  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={GLOBAL_STYLES.container}>
            <Text style={GLOBAL_STYLES.title}>Crea tu cuenta</Text>
            <Text style={GLOBAL_STYLES.subtitle}>
              ¿Quieres empezar tu experiencia con Convivia?
            </Text>

            <View style={{ width: '100%', alignItems: 'center' }}>
              {/* Campo de correo electrónico */}
              <Text style={GLOBAL_STYLES.label}>Correo electrónico</Text>
              <TextInput
                style={GLOBAL_STYLES.inputEmailCrearCuenta}
                placeholder="usuario@dominio"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={validateEmail}
              />
              {/* Mostrar mensaje de error si el correo no es válido */}
              {emailError ? <Text style={GLOBAL_STYLES.errorText}>{emailError}</Text> : null}

              {/* Texto de ayuda debajo del campo de correo */}
              <Text style={GLOBAL_STYLES.helperText}>
                La dirección ingresada debe contar con un formato estándar (por ejemplo,
                usuario@dominio.com).
              </Text>
            </View>

            {/* Contraseña */}
            <View style={GLOBAL_STYLES.verificacionContainerPassword}>
              <Text style={GLOBAL_STYLES.verificacionLabelPassword}>Contraseña</Text>
              <View style={GLOBAL_STYLES.verificacionInputPasswordContainer}>
                <TextInput
                  style={GLOBAL_STYLES.verificacionInputPassword}
                  placeholder="* * * * * * * *"
                  secureTextEntry={!showPassword}
                  autoCorrect={false}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={GLOBAL_STYLES.verificacionEyeIconButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={23}
                    color={COLORS.accent}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={GLOBAL_STYLES.verificacionLabelPasswordReq}>
              La contraseña requiere al menos 8 símbolos, incluyendo como mínimo un número.
            </Text>

            {/* Confirmación de contraseña */}
            <View style={GLOBAL_STYLES.verificacionContainerPassword}>
              <Text style={GLOBAL_STYLES.verificacionLabelPassword}>Confirma la Contraseña</Text>
              <View style={GLOBAL_STYLES.verificacionInputPasswordContainer}>
                <TextInput
                  style={GLOBAL_STYLES.verificacionInputPassword}
                  placeholder="* * * * * * * *"
                  secureTextEntry={!showPassword2}
                  autoCorrect={false}
                  value={password2}
                  onChangeText={(text) => {
                    setPassword2(text);
                    if (password !== text) {
                      setErrorMatch('Las contraseñas no coinciden');
                    } else {
                      setErrorMatch('');
                    }
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword2(!showPassword2)}
                  style={GLOBAL_STYLES.verificacionEyeIconButton}
                >
                  <Ionicons
                    name={showPassword2 ? 'eye-off' : 'eye'}
                    size={23}
                    color={COLORS.accent}
                  />
                </TouchableOpacity>
              </View>
              {/* Mostrar mensaje de error si las contraseñas no coinciden */}
              {errorMatch ? <Text style={GLOBAL_STYLES.errorText}>{errorMatch}</Text> : null}
            </View>

            {/* Checkbox Política de privacidad */}
            <View style={GLOBAL_STYLES.checkboxContainer}>
              <TouchableOpacity
                style={GLOBAL_STYLES.checkbox}
                onPress={() => setCheckedPolitica(!checkedPolitica)}
              >
                {checkedPolitica && (
                  <Ionicons name="checkmark" size={moderateScale(18)} color={COLORS.accent} />
                )}
              </TouchableOpacity>
              <Text style={GLOBAL_STYLES.checkboxText}>Política de privacidad</Text>
            </View>

            {/* Checkbox Cookies */}
            <View style={GLOBAL_STYLES.checkboxContainer}>
              <TouchableOpacity
                style={GLOBAL_STYLES.checkbox}
                onPress={() => setCheckedCookies(!checkedCookies)}
              >
                {checkedCookies && (
                  <Ionicons name="checkmark" size={moderateScale(18)} color={COLORS.accent} />
                )}
              </TouchableOpacity>
              <Text style={GLOBAL_STYLES.checkboxText}>Cookies</Text>
            </View>

            {/* Botón principal: Envío inicial o reenvío (se deshabilita durante el conteo) */}
            <TouchableOpacity
              style={[
                GLOBAL_STYLES.botonIngresarMail,
                {
                  backgroundColor:
                    (isValidEmail && checkedPolitica && checkedCookies && password === password2 && isValidPassword && !isCounting)
                      ? COLORS.success
                      : COLORS.disabled,
                },
              ]}
              disabled={isCounting || !(isValidEmail && checkedPolitica && checkedCookies && password === password2 && isValidPassword)} // Deshabilitado si contando O no válido
              onPress={async () => {
                try {
                  await createUserWithEmailAndPassword(auth, email, password);
                 
                  setModalVisible(true);
                  setModalTipo('exito');
                  
                } catch (error) {
                  setEmailError('No se pudo crear la cuenta: ' + error.message);
                }
              }}
            >
              <Text style={GLOBAL_STYLES.textoBotonIngresarMail}>
                {isCounting ? `Reenviando en ${contador}s` : 'Enviar verificación'} {/* Opcional: Cambia texto durante conteo */}
              </Text>
            </TouchableOpacity>

            {/* Texto informativo (opcional, para indicar que se puede reenviar después) */}
            <Text style={GLOBAL_STYLES.verificacionEnviarCodigoNuevo}>
              ¿No te ha llegado?
            </Text>

            {/* Mostrar contador solo si está contando */}
            {isCounting && <Text style={GLOBAL_STYLES.verificacionContador}></Text>}

            {/* //{contador}s  lo dejo asi para ocultarlo por si a UX le parece bien */}

            {/* Modal para éxito o reenviar */}
            <Modal
              transparent={true}
              animationType="fade"
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={GLOBAL_STYLES.overlay || { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={GLOBAL_STYLES.popup || { width: '80%', padding: 20, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' }}>
                  {modalTipo === 'exito' ? (
                    <>
                      <Image
                        source={require('../assets/pngsuccessful.png')}
                        style={GLOBAL_STYLES.verificacionLogo}
                        resizeMode="contain"
                      />
                      <Text style={GLOBAL_STYLES.popupTextTitle || { fontSize: 20, fontWeight: 'bold' }}>¡Verificación enviada!</Text>
                      <Text style={GLOBAL_STYLES.popupTextSubTitle || { fontSize: 14, marginVertical: 10 }}>Revisa tu correo</Text>
                      <TouchableOpacity
                        style={GLOBAL_STYLES.closeButton || { backgroundColor: COLORS.accent, padding: 10, borderRadius: 5 }}
                        onPress={() => {
                          setModalVisible(false);
                          navigation.navigate("Main");
                        }}
                      >
                        <Text style={GLOBAL_STYLES.closeButtonText || { color: 'white' }}>Cerrar</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={GLOBAL_STYLES.popupTextTitle || { fontSize: 20, fontWeight: 'bold' }}>Código reenviado</Text>
                      <Text style={GLOBAL_STYLES.popupTextSubTitle || { fontSize: 14, marginVertical: 10 }}>Revisa tu correo y spam</Text>
                      <TouchableOpacity
                        style={GLOBAL_STYLES.closeButton || { backgroundColor: COLORS.accent, padding: 10, borderRadius: 5 }}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={GLOBAL_STYLES.closeButtonText || { color: 'white' }}>Cerrar</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default CrearCuenta;