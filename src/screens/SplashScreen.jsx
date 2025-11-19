import React from 'react';
import { View, Text, Image } from 'react-native';
import { GLOBAL_STYLES } from '../styles/styles'; // Ajusta la ruta según tu estructura

const SplashScreen = () => {
  return (
    <View style={GLOBAL_STYLES.splashContainer}>
      <Image
        source={require('../assets/logo_pantalla_carga.gif')}
        style={GLOBAL_STYLES.splashLogo}
        resizeMode="contain"
      />
      <Text style={GLOBAL_STYLES.splashText}>Cargando aplicación...</Text>
    </View>
  );
};

export default SplashScreen;

