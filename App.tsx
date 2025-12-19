
import React, { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import SplashScreen from "./src/screens/SplashScreen";
import { ToastProvider } from "./src/components/ui/ToastProvider"; // ✅ Importa el Provider
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import AppNavigator from "./src/navigation/AppNavigator";

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
    <ToastProvider position="top" maxToasts={3}>
      <AppNavigator />
    </ToastProvider>
  );
};

export default App;