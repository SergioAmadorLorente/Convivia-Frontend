import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import GLOBAL_STYLES from '../../styles/styles';

interface AuthButtonsProps {
  onCreate: () => void;
  onSignIn: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ onCreate, onSignIn }) => (
  <>
    <TouchableOpacity style={GLOBAL_STYLES.botonStyle2} onPress={onCreate}>
      <Text style={GLOBAL_STYLES.textoBoton}>Crea una cuenta</Text>
    </TouchableOpacity>

    <TouchableOpacity style={GLOBAL_STYLES.botonStyle3} onPress={onSignIn}>
      <Text style={GLOBAL_STYLES.textoBoton}>Inicia sesión</Text>
    </TouchableOpacity>
  </>
);

export default AuthButtons;
