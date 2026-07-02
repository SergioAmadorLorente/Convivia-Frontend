import React, { useState, useEffect } from 'react';
import { Text, View, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import GLOBAL_STYLES from '../../styles/styles';
import Popup from '../../components/ui/Popup';
import Button from '../../components/ui/Button';
import CustomHeader from '../../components/ui/CustomHeader';
import { useAuthListener } from '../../hooks/useAuthListener';
import { obtenerEspacioPorUsuarioId } from '../../api/usuarioEspacio';

const Bienvenida: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const user = useAuthListener();
  const [activo, setActivo] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTipo, setModalTipo] = useState<string>('exito');
  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular, Montserrat_400Regular, Montserrat_700Bold });
  const [checkingResidence, setCheckingResidence] = useState<boolean>(true);

  // Verificar si el usuario ya tiene una residencia al cargar la pantalla
  useEffect(() => {
    const verificarYRedirigir = async () => {
      if (!user?.uid) {
        setCheckingResidence(false);
        return;
      }

      try {
        const espacioExistente = await obtenerEspacioPorUsuarioId(user.uid);

        if (espacioExistente && espacioExistente.espacioId && espacioExistente.espacioId !== "string") {
          // El usuario ya tiene una residencia -> redirigir al Dashboard
          console.log("✅ Usuario ya tiene residencia, redirigiendo al Dashboard");
          navigation.replace('DashBoardPersonal');
          return;
        }
      } catch (error) {
        console.log('Error verificando residencia en Bienvenida:', error);
      }

      setCheckingResidence(false);
    };

    verificarYRedirigir();
  }, [user]);

  const handleLogout = () => {
    navigation.navigate('Main');
  };

  // useLayoutEffect debe estar ANTES del return condicional
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          onLogout={() => setModalVisible(true)}
        />
      ),
    });
  }, [navigation]);

  if (!fontsLoaded || checkingResidence) {
    return (
      <View style={GLOBAL_STYLES.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={GLOBAL_STYLES.container} keyboardShouldPersistTaps="handled">
      <Text style={[GLOBAL_STYLES.title, { fontSize: 28 }]}>{t('welcome.title')}</Text>

      <Button style={GLOBAL_STYLES.buttonPrimaryGreen} onPress={() => navigation.navigate('NuevaResidencia')}>{t('welcome.createButton')}</Button>

      <Button style={GLOBAL_STYLES.buttonSecondaryGrey} onPress={() => navigation.navigate('UnirResidencia')}>{t('welcome.joinButton')}</Button>

      <Popup
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t('welcome.logoutPopup.title')}
        description={''}
        imageType={'logout'}
        buttons={[
          { text: t('welcome.logoutPopup.cancel'), onPress: () => { } },
          { text: t('welcome.logoutPopup.confirm'), onPress: () => { handleLogout(); } },
        ]}
      />
    </ScrollView>
  );
};

export default Bienvenida;
