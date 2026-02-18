import React, { useState, useRef } from 'react';
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
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Popup from '../../components/ui/Popup';
import { useKeyboardAware } from '../../hooks';
import TextField from '../../components/ui/TextField';
import useCodigoResidencia from '../../hooks/useCodigoResidencia';
import ConfettiButton from '../../components/ui/ConfettiButton';
import { useAuthListener } from '../../hooks/useAuthListener';
import { crearUsuarioEspacio, obtenerUsuarioEspacios } from '../../api/usuarioEspacio';
import { obtenerEspacioPorId, obtenerEspacios, obtenerCodigoEspacio, buscarEspacioPorCodigo } from '../../api/espacio';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const UnirResidencia: React.FC = () => {
  const { codigo, handleChange } = useCodigoResidencia();
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const containerRef = useRef<any>(null);
  useKeyboardAware({ containerRef, padding: 12 });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});

  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };

  const handleClosePopup = () => setPopupVisible(false);

  // Simplificado para aceptar cualquier ID por ahora
  const formatoValido = codigo.length > 0 && codigo.match(/^[a-zA-Z0-9\-]+$/);
  const isValidCode = formatoValido;
  const user = useAuthListener();

  const handleUnirse = async () => {
    if (!isValidCode) {
      showPopup({
        title: 'Código inválido',
        description: 'Por favor, ingresa un código válido.',
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => { } }],
      });
      return;
    }

    if (!user) {
      showPopup({
        title: 'Error de sesión',
        description: 'No se detectó un usuario autenticado.',
        imageType: 'error',
        buttons: [{ text: 'Aceptar', onPress: () => { } }],
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Buscar el espacio por código usando la nueva función
      const espacioEncontrado = await buscarEspacioPorCodigo(codigo);

      if (!espacioEncontrado) {
        throw new Error("Espacio no encontrado (404)");
      }

      const realId = espacioEncontrado.id;
      const espacioData = espacioEncontrado;

      console.log("✅ Espacio encontrado:", espacioData.nombre);

      // 2. Verificar si ya es miembro
      try {
        const relaciones = await obtenerUsuarioEspacios();
        const yaEsMiembro = Array.isArray(relaciones) && relaciones.some((r: any) =>
          r.usuarioId === user.uid && r.espacioId === realId
        );

        if (yaEsMiembro) {
          console.log("⚠️ El usuario ya es miembro de este espacio.");
          showPopup({
            title: '¡Ya estás dentro!',
            description: `Ya eres miembro de ${espacioData.nombre}`,
            imageType: 'convivia',
            showCode: false,
            buttons: [{
              text: 'Ir al inicio',
              onPress: () => navigation.replace('DashBoardPersonal', { newSpaceName: espacioData.nombre })
            }],
          });
          return;
        }
      } catch (checkError) {
        console.warn("No se pudo verificar membresía previa, intentando unir de todos modos...", checkError);
      }

      // 3. Crear la relación UsuarioEspacio
      await crearUsuarioEspacio({
        usuarioId: user.uid,
        espacioId: realId,
        rol: 'miembro',
        ausente: false,
        karma: 0,
        permisoId: generateUUID(),
        tareasId: [],
        facturasId: []
      });

      console.log("✅ Usuario unido al espacio exitosamente");

      showPopup({
        title: 'Éxito',
        description: `Te has unido exitosamente a ${espacioData.nombre}`,
        imageType: 'convivia',
        showCode: false,
        buttons: [{
          text: 'Aceptar',
          onPress: () => navigation.replace('DashBoardPersonal', { newSpaceName: espacioData.nombre })
        }],
      });
    } catch (error: any) {
      console.error('Error al unirse a la residencia:', error);

      const is404 = error.message?.includes('404') || error.response?.status === 404;

      if (is404) {
        showPopup({
          title: 'Residencia no encontrada',
          description: 'El código ingresado no corresponde a ninguna residencia existente. Verifícalo e intenta de nuevo.',
          imageType: 'error',
          buttons: [{ text: 'Aceptar', onPress: () => { } }],
        });
      } else {
        showPopup({
          title: 'Error',
          description: 'No se pudo unir a la residencia. Intenta de nuevo más tarde.',
          imageType: 'error',
          buttons: [{ text: 'Aceptar', onPress: () => { } }],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6B705C" />
      </View>
    );
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'android' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'android' ? hp('8%') : 0}
        >
          <View ref={containerRef} style={[GLOBAL_STYLES.container, Platform.OS === 'web' ? WEB_FULL_VIEWPORT : {}]}>
            <Text style={GLOBAL_STYLES.title}>Únete a una residencia</Text>

            <Text style={GLOBAL_STYLES.subtitle}>
              <Text>Obtén el código de la residencia a la que quieres unirte en el apartado </Text>
              <Text>Perfil - Mi residencia</Text>
            </Text>

            <TextField
              label="Código de la residencia"
              value={codigo}
              onChangeText={handleChange}
              placeholder="- - - - -"
              keyboardType="numeric"
              error={undefined}
              textAlign="center"
              caretHidden={true} showClipboard={true} />

            <ConfettiButton
              style={[
                GLOBAL_STYLES.buttonPrimaryGreen,
                { backgroundColor: isValidCode ? '#E6ECDC' : '#ccc' },
              ]}
              disabled={!isValidCode || loading}
              onPress={handleUnirse}
              loading={loading}

            >
              Unirse
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
        showCode={popupOptions.showCode}
      />
    </>
  );
};

export default UnirResidencia;
