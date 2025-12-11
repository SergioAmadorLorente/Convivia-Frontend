import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { StackNavigationOptions } from "@react-navigation/stack";
import Main from "../screens/Main";
import CrearCuenta from "../screens/SignIn/CrearCuenta";
import IniciarSesion from "../screens/LogIn/IniciarSesion";
import RecuperarPassword from "../screens/LogIn/RecuperarPassword";
import DashBoardPersonal from "../screens/Dashboard/DashBoardPersonal";
import NuevaResidencia from "../screens/Welcome/NuevaResidencia";
import UnirResidencia from "../screens/Welcome/UnirResidencia";
import Bienvenida from "../screens/Welcome/Bienvenida";
import PoliticaCookiesPrivacidad from "../screens/Policies/PoliticaCookiesPrivacidad";
import TerminosCondiciones from "../screens/Policies/TerminosCondiciones";
import Perfil from "../screens/Perfil/Perfil";
import CustomHeader from "../components/ui/CustomHeader";
import TestScreen from "../screens/test";
import { RootStackParamList } from "./RootStackParamList";
const Stack = createStackNavigator<RootStackParamList>();
const headerOptions: StackNavigationOptions = {
    headerShown: true,
    headerTintColor: "#ACBF8A",
    headerTitleStyle: {
        fontSize: 20,
        fontFamily: "DMSerifDisplay_400Regular",
        color: "#ACBF8A",
    },
    gestureEnabled: true,
    gestureDirection: "horizontal",
    headerShadowVisible: false,
    headerStyle: {
        backgroundColor: "#F5F4F2",
        elevation: 0,
        height: 150,
        shadowOpacity: 0,
        borderBottomWidth: 0,
    },
};
const defaultScreenOptions: StackNavigationOptions = {
    ...headerOptions,
    title: "",
    headerBackTitle: "",
};
const AppNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
                <Stack.Screen
                    name="Main"
                    component={Main}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Bienvenida"
                    component={Bienvenida}
                    options={defaultScreenOptions}
                />
                <Stack.Screen name="CrearCuenta" component={CrearCuenta} options={defaultScreenOptions} />
                <Stack.Screen name="IniciarSesion" component={IniciarSesion} options={defaultScreenOptions} />
                <Stack.Screen name="RecuperarPassword" component={RecuperarPassword} options={defaultScreenOptions} />
                <Stack.Screen name="DashBoardPersonal" component={DashBoardPersonal} options={defaultScreenOptions} />
                <Stack.Screen name="NuevaResidencia" component={NuevaResidencia} options={defaultScreenOptions} />
                <Stack.Screen name="UnirResidencia" component={UnirResidencia} options={defaultScreenOptions} />
                <Stack.Screen name="PoliticaCookiesPrivacidad" component={PoliticaCookiesPrivacidad} options={defaultScreenOptions} />
                <Stack.Screen name="TerminosCondiciones" component={TerminosCondiciones} options={defaultScreenOptions} />
                <Stack.Screen name="Perfil" component={Perfil} options={defaultScreenOptions} />
                <Stack.Screen name="test" component={TestScreen} options={defaultScreenOptions} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
export default AppNavigator;