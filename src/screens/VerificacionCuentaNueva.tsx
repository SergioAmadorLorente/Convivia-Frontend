import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
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
import GLOBAL_STYLES, { COLORS, WEB_FULL_VIEWPORT } from '../styles/styles';
import Popup from '../components/ui/Popup';
import { useKeyboardAware } from '../hooks';

const VerificacionCuentaNueva: React.FC = () => {
  const navigation = useNavigation<any>();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password2, setPassword2] = useState<string>('');
  const [showPassword2, setShowPassword2] = useState<boolean>(false);
  const [codigo, setCodigo] = useState<string>('');
  const [errorMatch, setErrorMatch] = useState<string>('');
  const [contador, setContador] = useState<number>(60);
  const [activo, setActivo] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTipo, setModalTipo] = useState<string>('exito');

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.verificacionContainer, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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

  const handleChange = (text: string) => {
    const numeros = text.replace(/\D/g, '').slice(0, 6);
    setCodigo(numeros);
  };

  const formateado = codigo.split('').join('-');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <ScrollView ref={containerRef} contentContainerStyle={GLOBAL_STYLES.verificacionScrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[GLOBAL_STYLES.verificacionContainer, Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {}]}>
            <Text style={GLOBAL_STYLES.verificacionTitulo}>Verificación</Text>
            <Text style={GLOBAL_STYLES.verificacionSubtitulo}>¡Ya estás a punto de poder utilizar la aplicación de Convivia!</Text>

            <Text style={GLOBAL_STYLES.verificacionLabelCodigo}>Código de verificación</Text>
            <TextInput style={GLOBAL_STYLES.verificacionInputCodigo} placeholder="0-0-0-0-0-0" keyboardType="numeric" autoCorrect={false} value={formateado} onChangeText={handleChange} maxLength={11} />

            <TouchableOpacity disabled={!activo} onPress={() => { setContador(60); setActivo(false); setModalVisible(true); setModalTipo('reenviar'); }}>
              <Text style={[GLOBAL_STYLES.verificacionEnviarCodigoNuevo, !activo && { color: 'gray', textDecorationLine: 'line-through' }]}>
                Enviar código de nuevo
              </Text>
            </TouchableOpacity>

            <Text style={GLOBAL_STYLES.verificacionContador}>{contador}s</Text>

            <View style={GLOBAL_STYLES.verificacionContainerPassword}>
              <Text style={GLOBAL_STYLES.verificacionLabelPassword}>Contraseña</Text>
              <View style={GLOBAL_STYLES.verificacionInputPasswordContainer}>
                <TextInput style={GLOBAL_STYLES.verificacionInputPassword} placeholder="* * * * * * * *" secureTextEntry={!showPassword} autoCorrect={false} value={password} onChangeText={setPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={GLOBAL_STYLES.verificacionEyeIconButton}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={23} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={GLOBAL_STYLES.verificacionLabelPasswordReq}>La contraseña requiere al menos 8 símbolos, incluyendo como mínimo un número.</Text>

            <View style={GLOBAL_STYLES.verificacionContainerPassword}>
              <Text style={GLOBAL_STYLES.verificacionLabelPassword}>Confirma la Contraseña</Text>
              <View style={GLOBAL_STYLES.verificacionInputPasswordContainer}>
                <TextInput style={GLOBAL_STYLES.verificacionInputPassword} placeholder="* * * * * * * *" secureTextEntry={!showPassword2} autoCorrect={false} value={password2} onChangeText={(text) => { setPassword2(text); if (password !== text) { setErrorMatch('Las contraseñas no coinciden'); } else { setErrorMatch(''); } }} />
                <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)} style={GLOBAL_STYLES.verificacionEyeIconButton}>
                  <Ionicons name={showPassword2 ? 'eye-off' : 'eye'} size={23} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={[GLOBAL_STYLES.verificacionBotonFinalizar, (password !== password2 || password.length < 8 || codigo.length !== 6) && { opacity: 0.5 }]} disabled={password !== password2 || password.length < 8 || codigo.length !== 6} onPress={() => { setModalVisible(true); setModalTipo('exito'); }}>
              <Text style={GLOBAL_STYLES.verificacionTextoBotonFinalizar}>Finalizar registro</Text>
            </TouchableOpacity>

            <Popup
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title={modalTipo === 'exito' ? '¡Felicidades!' : 'Código reenviado'}
              description={modalTipo === 'exito' ? 'Puedes utilizar tu cuenta' : 'Revise su correo y spam'}
              imageType={'success'}
              buttons={
                modalTipo === 'exito'
                  ? [
                      { text: 'Iniciar sesión', onPress: () => navigation.navigate('IniciarSesion') },
                    ]
                  : [
                      { text: 'Cerrar', onPress: () => {} },
                    ]
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default VerificacionCuentaNueva;
