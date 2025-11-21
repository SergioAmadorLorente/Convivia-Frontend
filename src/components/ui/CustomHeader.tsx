import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomHeaderProps {
  onLogout?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ onLogout }) => {
  return (
    <View
      style={{
        height: 450,
        backgroundColor: '#F5F4F2',
        justifyContent: 'center',
      }}
    >
      {/* Botón de logout */}
      <TouchableOpacity
        onPress={onLogout}
        style={{
          position: 'absolute',
          top: 70,
          left: 40,
          zIndex: 1,
        }}
      >
        <MaterialIcons name="logout" size={28} color="#66b35fff" />
      </TouchableOpacity>

      {/* Logo + dibujo */}
      <View
        style={{
          alignItems: 'center',
          marginTop: 50,
        }}
      >
        <Image
          source={require('../../assets/logo_completo.png')}
          style={{
            width: 250,
            height: 70,
            marginTop: 20,
          }}
        />
        <Image
          source={require('../../assets/dibujo.png')}
          style={{
            width: 230,
            height: 200,
            marginTop: 40,
          }}
        />
      </View>
    </View>
  );
};

export default CustomHeader;