import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import SplashScreen from './src/components/SplashScreen';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from './src/components/Main';
import CrearCuenta from './src/components/CrearCuenta';
import IniciarSesion from './src/components/IniciarSesion';
import RecuperarPassword from './src/components/RecuperarPassword';
import VerificacionCuentaNueva from './src/components/VerificacionCuentaNueva';
import RestablecerPassword from './src/components/RestablecerPassword';
import DashBoardPersonal from './src/components/DashBoardPersonal';
import NuevaResidencia from './src/components/NuevaResidencia';
import UnirResidencia from './src/components/UnirResidencia';
import Bienvenida from './src/components/Bienvenida';
import { View, Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
const Stack = createStackNavigator();

//evento keyboardavoid no funciona en verificacionCuentaNueva.jsx
//Se debe de mejorar el Responsive en las pantallas que lo tienen el padding no ajusta bien y algunos detalles menores mas
//SDK V54 actualizado, arreglado version de fuente duplicada,  se actualizaron 13 dependencias , 4 de ellas muy necessarias
//Otras 10 dependencias se actualizaron
// Expo version 54.0.7 actualizado correctamente
//Pagina de carga presenta errores graves
// Mirar de eliminar ESlint (muy opcional)
//react-native-worklets instalado para poder funcionar correctamente a largo plazo
//ESTA NO ES RESPONSIVE DA DESAJUSTES VerificacionCuentaNueva.jsx
//La funcion de desplazar el teclado al escribir para que no oculte el textinput no funciona, revisarlo
//KeyboardAvoidingView puede este para IOS y no configurada para android
//se ajustan los border radious al 15%
//evento keyboardavoid solucionado parcialmente, , no hace scroll al dejar paso al keyboard
//Pantalla de carga arreglada y funcional (el archivo tiene fondo gris por algun motivo, he intentado 40 veces de quitarlo pero no hay manera)
//Agregadas pantallas de UnirResidencia (Marc) y NuevaResidencia (Sergio)

const headerOptions = {
  headerShown: true,
  headerTintColor: '#ACBF8A',
  headerTitleStyle: {
    fontSize: 20,
    fontFamily: 'DMSerifDisplay_400Regular',
    color: '#ACBF8A',
  },
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: '#F5F4F2',
    elevation: 0,
    height: 150,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
};

const CustomHeader = ({ onLogout }) => (
  <View style={{
    height: 450,
    backgroundColor: '#F5F4F2',
    justifyContent: 'center',
  }}>
    {/* Botón de logout arriba a la derecha */}
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

    {/* Imágenes centradas */}
    <View style={{
      alignItems: 'center',
      marginTop: 50,
    }}>
      <Image
        source={require('./assets/logo_completo.png')}
        style={{
          width: 250,
          height: 70,
          marginTop: 20,
        }}
      />
      <Image
        source={require('./assets/dibujo.png')}
        style={{
          width: 230,
          height: 200,
          marginTop: 40
        }}
      />
    </View>
  </View>
);




export default function App() {
  //Pantalla de Carga

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 4000); // Ajustar tiempo segun convenga

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || showSplash) {
    return <SplashScreen />;
  }




  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        {/* Pantalla principal sin header */}
        <Stack.Screen name="Main" component={Main} options={{ headerShown: false }} />

        <Stack.Screen
          name="Bienvenida"
          component={Bienvenida}
          options={({ route }) => ({
            header: () => (
              <CustomHeader
                onLogout={() => {
                  if (route.params?.showLogoutModal) {
                    route.params.showLogoutModal();
                  }
                }}
              />
            ),
          })}
        />

        {/* Pantallas con header */}
        <Stack.Screen
          name="CrearCuenta"
          component={CrearCuenta}
          options={{
            ...headerOptions,
            title: 'Volver',
            headerBackTitle: 'Volver',
          }}
        />

        <Stack.Screen
          name="IniciarSesion"
          component={IniciarSesion}
          options={{
            ...headerOptions,
            title: 'Volver',
            headerBackTitle: 'Volver',
          }}
        />

        <Stack.Screen
          name="RecuperarPassword"
          component={RecuperarPassword}
          options={{
            ...headerOptions,
            title: 'Volver',
            headerBackTitle: 'Volver',
          }}
        />

        <Stack.Screen
          name="VerificacionCuentaNueva"
          component={VerificacionCuentaNueva}
          options={{
            ...headerOptions,
            title: 'Volver',
            headerBackTitle: 'Volver',
          }}
        />

        <Stack.Screen
          name="RestablecerPassword"
          component={RestablecerPassword}
          options={{
            ...headerOptions,
            title: 'Volver',
            headerBackTitle: 'Volver',
          }}
        />

        <Stack.Screen
          name="DashBoardPersonal"
          component={DashBoardPersonal}
          options={{
            ...headerOptions,
            title: 'Volver',
            headerBackTitle: 'Volver',
          }}
        />

        <Stack.Screen
          name="NuevaResidencia"
          component={NuevaResidencia}
          options={{
            ...headerOptions,
            title: 'Volver',
            headerBackTitle: 'Volver',
          }}
        />

        <Stack.Screen
          name="UnirResidencia"
          component={UnirResidencia}
          options={{
            ...headerOptions,
            title: 'Volver',
            headerBackTitle: 'Volver',
          }}
        />






      </Stack.Navigator>
    </NavigationContainer>
  );
}
