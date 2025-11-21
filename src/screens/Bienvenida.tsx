import React, { useState, useEffect } from 'react';
import { Text, View, Image, ActivityIndicator, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import GLOBAL_STYLES from '../styles/styles';

const Bienvenida: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activo, setActivo] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalTipo, setModalTipo] = useState<string>('exito');
  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular, Montserrat_400Regular, Montserrat_700Bold });

  const handleLogout = () => {
    navigation.navigate('LandingPage');
  };

  if (!fontsLoaded) {
    return (
      <View style={GLOBAL_STYLES.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  useEffect(() => {
    navigation.setParams({ showLogoutModal: () => setModalVisible(true) });
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={GLOBAL_STYLES.container} keyboardShouldPersistTaps="handled">
      <Text style={GLOBAL_STYLES.textoBienvenida}>Tu espacio compartido comienza aquí. {'\n'}¿Cómo quieres unirte?</Text>

      <TouchableOpacity style={GLOBAL_STYLES.botonCrearCuenta} onPress={() => navigation.navigate('NuevaResidencia')}>
        <Text style={GLOBAL_STYLES.textoBoton}>Crea una residencia nueva</Text>
      </TouchableOpacity>

      <TouchableOpacity style={GLOBAL_STYLES.botonIniciarSesion} onPress={() => navigation.navigate('UnirResidencia')}>
        <Text style={GLOBAL_STYLES.textoBoton}>Únete a una residencia!</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={GLOBAL_STYLES.verificacionOverlay}>
          <View style={GLOBAL_STYLES.verificacionPopup}>
            <Image source={require('../assets/pnglogout.png')} style={GLOBAL_STYLES.verificacionLogo} resizeMode="contain" />
            <Text style={GLOBAL_STYLES.verificacionPopupTextTitle}>¿Estás seguro de que quieres cerrar la sesión?</Text>

            <View style={GLOBAL_STYLES.verificacionBotonesContainer}>
              <TouchableOpacity style={GLOBAL_STYLES.verificacionCloseButton} onPress={() => setModalVisible(false)}>
                <Text style={GLOBAL_STYLES.verificacionCloseButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[GLOBAL_STYLES.buttonLogout]} onPress={() => { setModalVisible(false); handleLogout(); }}>
                <Text style={[GLOBAL_STYLES.verificacionCloseButtonText]}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Bienvenida;
