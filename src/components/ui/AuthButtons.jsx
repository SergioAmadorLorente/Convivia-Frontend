import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { GLOBAL_STYLES } from '../../styles/styles';

const AuthButtons = ({ onCreate, onSignIn }) => (
  <>
    <TouchableOpacity style={GLOBAL_STYLES.botonCrearCuenta} onPress={onCreate}>
      <Text style={GLOBAL_STYLES.textoBoton}>Crea una cuenta</Text>
    </TouchableOpacity>

    <TouchableOpacity style={GLOBAL_STYLES.botonIniciarSesion} onPress={onSignIn}>
      <Text style={GLOBAL_STYLES.textoBoton}>Inicia sesión</Text>
    </TouchableOpacity>
  </>
);

export default AuthButtons;
