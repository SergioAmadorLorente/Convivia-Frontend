import React, { useState, useEffect } from 'react';
import { useFonts } from 'expo-font';
import SplashScreen from './src/screens/SplashScreen';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import Main from './src/screens/Main';
import CrearCuenta from './src/screens/CrearCuenta';
import IniciarSesion from './src/screens/IniciarSesion';
import RecuperarPassword from './src/screens/RecuperarPassword';
import VerificacionCuentaNueva from './src/screens/VerificacionCuentaNueva';
import RestablecerPassword from './src/screens/RestablecerPassword';
import DashBoardPersonal from './src/screens/DashBoardPersonal';
import NuevaResidencia from './src/screens/NuevaResidencia';
import UnirResidencia from './src/screens/UnirResidencia';
import Bienvenida from './src/screens/Bienvenida';
import { View, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Stack = createStackNavigator<any>();

const headerOptions: StackNavigationOptions = {
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

const CustomHeader: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => (
  <View
    style={{
      height: 450,
      backgroundColor: '#F5F4F2',
      justifyContent: 'center',
    }}
  >
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

    <View
      style={{
        alignItems: 'center',
        marginTop: 50,
      }}
    >
      <Image
        source={require('./src/assets/logo_completo.png')}
        style={{
          width: 250,
          height: 70,
          marginTop: 20,
        }}
      />
      <Image
        source={require('./src/assets/dibujo.png')}
        style={{
          width: 230,
          height: 200,
          marginTop: 40,
        }}
      />
    </View>
  </View>
);

const App: React.FC = () => {
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
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={Main} options={{ headerShown: false }} />

        <Stack.Screen
          name="Bienvenida"
          component={Bienvenida}
          options={({ route }) => ({
            header: () => (
              <CustomHeader
                onLogout={() => {
                  if ((route as any).params?.showLogoutModal) {
                    (route as any).params.showLogoutModal();
                  }
                }}
              />
            ),
          })}
        />

        <Stack.Screen name="CrearCuenta" component={CrearCuenta} options={{ ...headerOptions, title: 'Volver', headerBackTitle: 'Volver' }} />
        <Stack.Screen name="IniciarSesion" component={IniciarSesion} options={{ ...headerOptions, title: 'Volver', headerBackTitle: 'Volver' }} />
        <Stack.Screen name="RecuperarPassword" component={RecuperarPassword} options={{ ...headerOptions, title: 'Volver', headerBackTitle: 'Volver' }} />
        <Stack.Screen name="VerificacionCuentaNueva" component={VerificacionCuentaNueva} options={{ ...headerOptions, title: 'Volver', headerBackTitle: 'Volver' }} />
        <Stack.Screen name="RestablecerPassword" component={RestablecerPassword} options={{ ...headerOptions, title: 'Volver', headerBackTitle: 'Volver' }} />
        <Stack.Screen name="DashBoardPersonal" component={DashBoardPersonal} options={{ ...headerOptions, title: 'Volver', headerBackTitle: 'Volver' }} />
        <Stack.Screen name="NuevaResidencia" component={NuevaResidencia} options={{ ...headerOptions, title: 'Volver', headerBackTitle: 'Volver' }} />
        <Stack.Screen name="UnirResidencia" component={UnirResidencia} options={{ ...headerOptions, title: 'Volver', headerBackTitle: 'Volver' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
