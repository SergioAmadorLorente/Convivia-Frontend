import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { StackNavigationOptions } from '@react-navigation/stack';

import Main from '../screens/Main';
import CrearCuenta from '../screens/CrearCuenta';
import IniciarSesion from '../screens/IniciarSesion';
import RecuperarPassword from '../screens/RecuperarPassword';
import VerificacionCuentaNueva from '../screens/VerificacionCuentaNueva';
import RestablecerPassword from '../screens/RestablecerPassword';
import DashBoardPersonal from '../screens/DashBoardPersonal';
import NuevaResidencia from '../screens/NuevaResidencia';
import UnirResidencia from '../screens/UnirResidencia';
import Bienvenida from '../screens/Bienvenida';

import CustomHeader from '../components/ui/CustomHeader';

const Stack = createStackNavigator<any>();

// Opciones comunes para los headers
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

const defaultScreenOptions: StackNavigationOptions = {
  ...headerOptions,
  title: '',
  headerBackTitle: '',
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        {/* Pantalla inicial */}
        <Stack.Screen
          name="Main"
          component={Main}
          options={{ headerShown: false }}
        />

        {/* Bienvenida con header personalizado (no usa la flecha por el header custom) */}
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

        {/* Resto de pantallas con header común y flecha sin texto */}
        <Stack.Screen
          name="CrearCuenta"
          component={CrearCuenta}
          options={defaultScreenOptions}
        />
        <Stack.Screen
          name="IniciarSesion"
          component={IniciarSesion}
          options={defaultScreenOptions}
        />
        <Stack.Screen
          name="RecuperarPassword"
          component={RecuperarPassword}
          options={defaultScreenOptions}
        />
        <Stack.Screen
          name="VerificacionCuentaNueva"
          component={VerificacionCuentaNueva}
          options={defaultScreenOptions}
        />
        <Stack.Screen
          name="RestablecerPassword"
          component={RestablecerPassword}
          options={defaultScreenOptions}
        />
        <Stack.Screen
          name="DashBoardPersonal"
          component={DashBoardPersonal}
          options={defaultScreenOptions}
        />
        <Stack.Screen
          name="NuevaResidencia"
          component={NuevaResidencia}
          options={defaultScreenOptions}
        />
        <Stack.Screen
          name="UnirResidencia"
          component={UnirResidencia}
          options={defaultScreenOptions}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;