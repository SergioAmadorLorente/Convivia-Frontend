import React from 'react';
import { View, Image, Text } from 'react-native';
import { GLOBAL_STYLES } from '../../styles/styles';

const Logo = () => (
  <>
    <Image
      source={require('../../assets/logoReal.png')}
      style={GLOBAL_STYLES.logo}
      resizeMode="contain"
    />

    <View style={GLOBAL_STYLES.logoContainer}>
      <Text style={GLOBAL_STYLES.tituloLogo}>Convivia</Text>
      <Text style={GLOBAL_STYLES.esloganLogo}>JUNTOS, SIN ENREDOS</Text>
    </View>
  </>
);

export default Logo;
