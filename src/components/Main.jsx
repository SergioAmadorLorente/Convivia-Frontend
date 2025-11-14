import React from 'react';
import {
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { GLOBAL_STYLES } from './styles'; // Ajusta la ruta si es necesario

const Main = () => {
  const navigation = useNavigation();
  // se ajusta el package-lock
  // Carga de fuentes personalizadas
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  // Mostrar indicador de carga mientras se cargan las fuentes
  if (!fontsLoaded) {
    return (
      <View style={GLOBAL_STYLES.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={GLOBAL_STYLES.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Título de bienvenida */}
      <Text style={GLOBAL_STYLES.titulo}>¡Hola!</Text>
      <Text style={GLOBAL_STYLES.subtitulo}>Bienvenido a Convivia</Text>

      {/* Párrafo descriptivo */}
      <View style={GLOBAL_STYLES.bloqueTexto}>
        <Text style={GLOBAL_STYLES.parrafo}>
          Organiza, colabora y cumple tus metas junto a tus compañeros.{'\n'}
          ¡Aquí la productividad es compartida y las ideas fluyen en sintonía!
        </Text>
      </View>

      {/* Logo principal */}
      <Image
        source={require('../../assets/logoReal.png')}
        style={GLOBAL_STYLES.logo}
        resizeMode="contain"
      />

      {/* Texto debajo del logo */}
      <View style={GLOBAL_STYLES.logoContainer}>
        <Text style={GLOBAL_STYLES.tituloLogo}>Convivia</Text>
        <Text style={GLOBAL_STYLES.esloganLogo}>JUNTOS, SIN ENREDOS</Text>
      </View>

      {/* Botón para crear cuenta */}
      <TouchableOpacity
        style={GLOBAL_STYLES.botonCrearCuenta}
        onPress={() => navigation.navigate('CrearCuenta')}
      >
        <Text style={GLOBAL_STYLES.textoBoton}>Crea una cuenta</Text>
      </TouchableOpacity>

      {/* Botón para iniciar sesión */}
      <TouchableOpacity
        style={GLOBAL_STYLES.botonIniciarSesion}
        onPress={() => navigation.navigate('IniciarSesion')}
      >
        <Text style={GLOBAL_STYLES.textoBoton}>Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Main;