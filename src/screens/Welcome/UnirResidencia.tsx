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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
        title: t('joinResidence.popups.invalidCode.title'),
        description: t('joinResidence.popups.invalidCode.description'),
        imageType: 'error',
        buttons: [{ text: t('common.accept'), onPress: () => { } }],
      });
      return;
    }

    if (!user) {
      showPopup({
        title: t('joinResidence.popups.sessionError.title'),
        description: t('joinResidence.popups.sessionError.description'),
        imageType: 'error',
        buttons: [{ text: t('common.accept'), onPress: () => { } }],
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
            title: t('joinResidence.popups.alreadyMember.title'),
            description: `Ya eres miembro de ${espacioData.nombre}`,
            imageType: 'convivia',
            showCode: false,
            buttons: [{
              text: t('joinResidence.popups.alreadyMember.goHome'),
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
        title: t('joinResidence.popups.joinSuccess.title'),
        description: `Te has unido exitosamente a ${espacioData.nombre}`,
        imageType: 'convivia',
        showCode: false,
        buttons: [{
          text: t('common.accept'),
          onPress: () => navigation.replace('DashBoardPersonal', { newSpaceName: espacioData.nombre })
        }],
      });
    } catch (error: any) {
      // console.error('Error al unirse a la residencia:', error);

      const is404 = error.message?.includes('404') || error.response?.status === 404;

      if (is404) {
        showPopup({
          title: t('joinResidence.popups.notFound.title'),
          description: t('joinResidence.popups.notFound.description'),
          imageType: 'error',
          buttons: [{ text: t('common.accept'), onPress: () => { } }],
        });
      } else {
        showPopup({
          title: t('joinResidence.popups.genericError.title'),
          description: t('joinResidence.popups.genericError.description'),
          imageType: 'error',
          buttons: [{ text: t('common.accept'), onPress: () => { } }],
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
            <Text style={GLOBAL_STYLES.title}>{t('joinResidence.title')}</Text>

            <Text style={GLOBAL_STYLES.subtitle}>
              <Text>{t('joinResidence.subtitle')}</Text>
              <Text>{t('joinResidence.subtitleLink')}</Text>
            </Text>

            <TextField
              label={t('joinResidence.codeLabel')}
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
              {t('joinResidence.joinButton')}
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
