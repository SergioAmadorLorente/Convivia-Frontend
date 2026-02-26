// src/screens/NuevaResidencia.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from '../../styles/styles';
import styles from '../../styles/styles';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Popup from '../../components/ui/Popup';
import { useKeyboardAware } from '../../hooks';
import TextField from '../../components/ui/TextField';
import ConfettiButton from '../../components/ui/ConfettiButton';

import { crearEspacio, crearEspacioConUsuario } from '../../api/espacio';
import { useAuthListener } from '../../hooks/useAuthListener';
import { obtenerEspacioPorUsuarioId } from '../../api/usuarioEspacio';

// Lista de palabras prohibidas (insultos en español e inglés)
const PALABRAS_PROHIBIDAS = [
  // Español
  'puta', 'puto', 'mierda', 'cono', 'joder', 'cabron', 'cabrón', 'gilipollas', 
  'idiota', 'tonto', 'estupido', 'estúpido', 'imbecil', 'imbécil', 'pendejo',
  'carajo', 'verga', 'chingar', 'marica', 'maricon', 'maricón', 'gay',
  // Inglés
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'crap', 'dick',
  'pussy', 'cock', 'slut', 'whore', 'nigger', 'fag', 'retard',
];

// Función para validar el nombre de la residencia
const validarNombreResidencia = (nombre: string): { valido: boolean; mensaje?: string } => {
  const nombreTrimmed = nombre.trim();
  const nombreLower = nombreTrimmed.toLowerCase();

  // Verificar palabras prohibidas
  for (const palabra of PALABRAS_PROHIBIDAS) {
    if (nombreLower.includes(palabra)) {
      return { valido: false, mensaje: 'El nombre contiene palabras inapropiadas.' };
    }
  }

  // Verificar símbolos sospechosos y patrones SQL maliciosos
  const patronesSospechosos = [
    /[<>{}[\]\\]/,  // Símbolos raros
    /script/i,       // Posible XSS
    /select.*from/i, // SQL SELECT
    /drop.*table/i,  // SQL DROP
    /insert.*into/i, // SQL INSERT
    /update.*set/i,  // SQL UPDATE
    /delete.*from/i, // SQL DELETE
    /union.*select/i, // SQL UNION
    /exec\s*\(/i,    // Ejecución de código
    /--/,            // Comentarios SQL
    /;.*drop/i,      // Comandos SQL encadenados
    /'\s*or\s*'1'\s*=\s*'1/i, // SQL Injection clásico
  ];

  for (const patron of patronesSospechosos) {
    if (patron.test(nombre)) {
      return { valido: false, mensaje: 'El nombre contiene caracteres o código no permitido.' };
    }
  }

  // Verificar que solo contenga caracteres permitidos (letras, números, espacios y algunos símbolos básicos)
  const caracteresPermitidos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-_.,!?()]+$/;
  if (!caracteresPermitidos.test(nombre)) {
    return { valido: false, mensaje: 'El nombre solo puede contener letras, números y símbolos básicos (. , - _ ! ?)' };
  }

  return { valido: true };
};

const NuevaResidencia: React.FC = () => {
  const [nombreResidencia, setNombreResidencia] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [touched, setTouched] = useState<boolean>(false);
  const navigation = useNavigation<any>();
  const user = useAuthListener();

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});

  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };

  const handleClosePopup = () => setPopupVisible(false);

  // Validaciones independientes
  const nombreValido =
    nombreResidencia.trim().length >= 2 &&
    nombreResidencia.trim().length <= 80 &&
    validarNombreResidencia(nombreResidencia).valido;

  // El botón solo se habilita si el nombre es válido
  const hasText = nombreValido;

  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular, Montserrat_400Regular, Montserrat_700Bold });

  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });

  // Verificar si el usuario ya tiene una residencia
  useEffect(() => {
    const verificarResidenciaExistente = async () => {
      if (!user?.uid) return;

      try {
        const espacioExistente = await obtenerEspacioPorUsuarioId(user.uid);

        if (espacioExistente && espacioExistente.espacioId && espacioExistente.espacioId !== "string") {
          // El usuario ya tiene una residencia
          showPopup({
            title: 'Ya tienes una residencia',
            description: 'Solo puedes crear una residencia por cuenta. Serás redirigido a tu dashboard.',
            imageType: 'error',
            buttons: [
              {
                text: 'Ir al Dashboard',
                onPress: () => {
                  setPopupVisible(false);
                  navigation.replace('DashBoardPersonal');
                }
              }
            ],
          });
        }
      } catch (error) {
        console.log('Error verificando residencia existente:', error);
        // Si hay error, permitimos continuar (podría ser que no tenga residencia)
      }
    };

    verificarResidenciaExistente();
  }, [user]);

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6B705C" />
      </View>
    );
  }

  const handleCrear = async () => {
    if (!hasText) {
      showPopup({
        title: 'Campo requerido',
        description: 'Por favor, ingresa un nombre válido para la residencia.',
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => { } }],
      });
      return;
    }

    // Validar contenido del nombre
    const validacion = validarNombreResidencia(nombreResidencia);
    if (!validacion.valido) {
      showPopup({
        title: 'Nombre no válido',
        description: validacion.mensaje,
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => { } }],
      });
      return;
    }

    if (!user) {
      showPopup({
        title: 'Error de autenticación',
        description: 'Debes estar autenticado para crear una residencia.',
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => { } }],
      });
      return;
    }

    setLoading(true);
    try {
      const result = await crearEspacioConUsuario(
        {
          nombre: nombreResidencia.trim(),
          direccion: '',
        },
        user.uid
      );

      const espacioCreado = result.espacio;
      const codigoResidencia = espacioCreado.id;
      // @ts-ignore
      const joinError = result.joinError;

      if (joinError) {
        showPopup({
          title: 'Residencia creada con aviso',
          description: `La residencia se creó, pero hubo un problema al unirte automáticamente. Error: ${JSON.stringify(joinError.response?.data || joinError.message)}`,
          imageType: 'error',
          code: codigoResidencia,
          buttons: [
            {
              text: 'Entendido',
              onPress: () => navigation.replace('DashBoardPersonal', { newSpaceName: espacioCreado.nombre })
            },
          ],
        });
      } else {
        showPopup({
          title: 'Residencia creada',
          description: 'Puedes encontrarlo de nuevo en Perfil > Mi residencia',
          imageType: 'convivia',
          code: codigoResidencia,
          buttons: [
            {
              text: '¡Empieza!',
              onPress: () => navigation.replace('DashBoardPersonal', { newSpaceName: espacioCreado.nombre })
            },
          ],
        });
      }

      // Limpiar campos después de crear
      setNombreResidencia('');
    } catch (error) {
      // console.error('Error al crear residencia:', error);
      showPopup({
        title: 'Error',
        description: 'Error al crear la residencia. Intenta de nuevo.',
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => { } }],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? hp('8%') : 0}
        >
          <View ref={containerRef} style={[styles.container, Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {}]}>
            <Text style={[styles.titulo, { fontSize: 40, textAlign: 'center' }]}>Crea una nueva residencia</Text>

            <Text style={GLOBAL_STYLES.subtitle}>
              <Text>Obtén el código de tu residencia en el apartado </Text>
              <Text>Perfil - Mi residencia</Text>
            </Text>

            {/* Nombre */}
            <TextField
              label="Nombre de la residencia"
              value={nombreResidencia}
              onChangeText={setNombreResidencia}
              placeholder="Piso Tarragona"
              onBlur={() => setTouched(true)}
            />
            {touched && nombreResidencia.trim().length < 2 && nombreResidencia.trim().length > 0 && (
              <Text style={styles.errorText}>El nombre debe tener al menos 2 caracteres</Text>
            )}
            {touched && nombreResidencia.trim().length === 0 && (
              <Text style={styles.errorText}>Ingresa un nombre válido</Text>
            )}
            {touched && nombreResidencia.trim().length > 80 && (
              <Text style={styles.errorText}>El nombre no puede superar 80 caracteres</Text>
            )}
            {touched && nombreResidencia.trim().length >= 2 && nombreResidencia.trim().length <= 80 && !validarNombreResidencia(nombreResidencia).valido && (
              <Text style={styles.errorText}>{validarNombreResidencia(nombreResidencia).mensaje}</Text>
            )}


            {/* Botón */}
            <ConfettiButton
              style={[GLOBAL_STYLES.buttonPrimaryGreen, { backgroundColor: hasText ? '#E6ECDC' : '#ccc' }]}
              disabled={!hasText || loading}
              onPress={handleCrear}
              loading={loading}
            >
              Crear
            </ConfettiButton>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <Popup
        visible={popupVisible}
        onClose={handleClosePopup}
        title={popupOptions.title || ''}
        description={popupOptions.description}
        imageType={popupOptions.imageType}
        buttons={popupOptions.buttons}
        code={popupOptions.code}
        buttonsContainerStyle={{ marginTop: 8 }}
      />
    </>
  );
};

export default NuevaResidencia;