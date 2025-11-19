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
import { GLOBAL_STYLES, COLORS } from '../styles/styles'; // Ajusta la ruta según tu estructura

//NOOOOOOOOOOOO BORRRRARRRRRRRRR

const VerificacionCuentaNueva = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password2, setPassword2] = useState('');
  const [showPassword2, setShowPassword2] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [errorMatch, setErrorMatch] = useState('');
  const [contador, setContador] = useState(60);
  const [activo, setActivo] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState('exito');

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  // Mostrar indicador de carga mientras se cargan las fuentes
  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.verificacionContainer, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Temporizador para reenviar código
  useEffect(() => {
    if (contador === 0) {
      setActivo(true);
      return;
    }

    const timer = setInterval(() => {
      setContador((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [contador]);

  // Formatear código de verificación
  const handleChange = (text) => {
    const numeros = text.replace(/\D/g, '').slice(0, 6);
    setCodigo(numeros);
  };

  const formateado = codigo.split('').join('-');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={GLOBAL_STYLES.verificacionScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={GLOBAL_STYLES.verificacionContainer}>
            {/* Título y subtítulo */}
            <Text style={GLOBAL_STYLES.verificacionTitulo}>Verificación</Text>
            <Text style={GLOBAL_STYLES.verificacionSubtitulo}>
              ¡Ya estás a punto de poder utilizar la aplicación de Convivia!
            </Text>

            {/* Código de verificación */}
            <Text style={GLOBAL_STYLES.verificacionLabelCodigo}>Código de verificación</Text>
            <TextInput
              style={GLOBAL_STYLES.verificacionInputCodigo}
              placeholder="0-0-0-0-0-0"
              keyboardType="numeric"
              autoCorrect={false}
              value={formateado}
              onChangeText={handleChange}
              maxLength={11}
            />

            {/* Botón para reenviar código */}
            <TouchableOpacity
              disabled={!activo}
              onPress={() => {
                setContador(60);
                setActivo(false);
                setModalVisible(true);
                setModalTipo('reenviar');
              }}
            >
              <Text
                style={[
                  GLOBAL_STYLES.verificacionEnviarCodigoNuevo,
                  !activo && { color: 'gray', textDecorationLine: 'line-through' },
                ]}
              >
                Enviar código de nuevo
              </Text>
            </TouchableOpacity>

            <Text style={GLOBAL_STYLES.verificacionContador}>{contador}s</Text>

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
            </View>

            {/* Botón de finalizar */}
            <TouchableOpacity
              style={[
                GLOBAL_STYLES.verificacionBotonFinalizar,
                (password !== password2 || password.length < 8 || codigo.length !== 6) && {
                  opacity: 0.5,
                },
              ]}
              disabled={password !== password2 || password.length < 8 || codigo.length !== 6}
              onPress={() => {
                setModalVisible(true);
                setModalTipo('exito');
              }}
            >
              <Text style={GLOBAL_STYLES.verificacionTextoBotonFinalizar}>Finalizar registro</Text>
            </TouchableOpacity>

            {/* Modal de resultado */}
            <Modal
              transparent={true}
              animationType="fade"
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={GLOBAL_STYLES.verificacionOverlay}>
                <View style={GLOBAL_STYLES.verificacionPopup}>
                  {modalTipo === 'exito' ? (
                    <>
                      <Image
                        source={require('../assets/pngsuccessful.png')}
                        style={GLOBAL_STYLES.verificacionLogo}
                        resizeMode="contain"
                      />
                      <Text style={GLOBAL_STYLES.verificacionPopupTextTitle}>¡Felicidades!</Text>
                      <Text style={GLOBAL_STYLES.verificacionPopupTextSubTitle}>
                        Puedes utilizar tu cuenta
                      </Text>
                      <TouchableOpacity
                        style={GLOBAL_STYLES.verificacionCloseButton}
                        onPress={() => {
                          setModalVisible(false);
                          navigation.navigate('IniciarSesion');
                        }}
                      >
                        <Text style={GLOBAL_STYLES.verificacionCloseButtonText}>Iniciar sesión</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Image
                        source={require('../assets/pngsuccessful.png')}
                        style={GLOBAL_STYLES.verificacionLogo}
                        resizeMode="contain"
                      />
                      <Text style={GLOBAL_STYLES.verificacionPopupTextTitle}>Código reenviado</Text>
                      <Text style={GLOBAL_STYLES.verificacionPopupTextSubTitle}>
                        Revise su correo y spam
                      </Text>
                      <TouchableOpacity
                        style={GLOBAL_STYLES.verificacionCloseButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={GLOBAL_STYLES.verificacionCloseButtonText}>Cerrar</Text>
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

export default VerificacionCuentaNueva;