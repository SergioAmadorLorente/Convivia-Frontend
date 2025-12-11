
import React, { useLayoutEffect, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation } from "@react-navigation/native";

import GLOBAL_STYLES from "../../styles/styles";
import BottomBar from "../../components/ui/BottomBar";
import Header from "../../components/ui/Header";
import TabSwitcher from "../../components/ui/TabSwitcher";
import TaskItem from "../../components/ui/TaskItem";
import DayCarousel from "../../components/ui/DayCarousel";

// ✅ Tokens del tema
import { COLORS, SIZES, HELPERS } from "../../styles/theme";

const { hp, moderateScale } = HELPERS;

interface Task {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  isCompleted: boolean;
}

const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();

  // Ocultar el header del Stack (quitar flecha de atrás)
  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  const [activeTab, setActiveTab] = useState<"tareas" | "facturas">("tareas");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [tareas, setTareas] = useState<Task[]>([
    {
      id: "1",
      time: "12:00",
      title: "Bajar la basura",
      subtitle: "Orgánica y envases",
      isCompleted: false,
    },
    {
      id: "2",
      time: "15:30",
      title: "Barrer",
      subtitle: "Zonas comunes",
      isCompleted: false,
    },
    {
      id: "3",
      time: "09:30",
      title: "Limpiar el baño",
      isCompleted: false,
    },
    {
      id: "4",
      time: "09:30",
      title: "Fregar los platos",
      isCompleted: true,
    },
  ]);

  const [facturas, setFacturas] = useState<Task[]>([
    {
      id: "1",
      time: "15/12",
      title: "Electricidad",
      subtitle: "€85.50",
      isCompleted: false,
    },
    {
      id: "2",
      time: "20/12",
      title: "Internet",
      subtitle: "€45.00",
      isCompleted: true,
    },
  ]);

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={GLOBAL_STYLES.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleToggleTask = (id: string) => {
    if (activeTab === "tareas") {
      setTareas((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, isCompleted: !task.isCompleted }
            : task
        )
      );
    } else {
      setFacturas((prev) =>
        prev.map((factura) =>
          factura.id === id
            ? { ...factura, isCompleted: !factura.isCompleted }
            : factura
        )
      );
    }
  };

  const currentItems = activeTab === "tareas" ? tareas : facturas;
  const pendingItems = currentItems.filter((item) => !item.isCompleted);
  const completedItems = currentItems.filter((item) => item.isCompleted);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 🟪 Bloque gris que envuelve Header + TabSwitcher */}
        <View style={styles.headerArea}>


          <View style={styles.tabsContainer}>
            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
          </View>
        </View>

        {/* 🟫 Separador gris visible entre el header y el contenedor blanco */}
        <View style={styles.separatorGray} />

        {/* 🟩 Contenedor blanco con puntas superiores pronunciadas */}
        <View style={styles.whiteCard}>
          <DayCarousel onDaySelected={setSelectedDate} />

          <View style={styles.contentContainer}>
            {pendingItems.map((item) => (
              <TaskItem
                key={item.id}
                time={item.time}
                title={item.title}
                subtitle={item.subtitle}
                isCompleted={item.isCompleted}
                onToggle={() => handleToggleTask(item.id)}
              />
            ))}

            {completedItems.map((item) => (
              <TaskItem
                key={item.id}
                time={item.time}
                title={item.title}
                subtitle={item.subtitle}
                isCompleted={item.isCompleted}
                onToggle={() => handleToggleTask(item.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomBar />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Fondo general blanco
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  // Hace que el gris baje hasta las pestañas
  headerArea: {
    backgroundColor: COLORS.inputBackground,
  },
  // Espacio horizontal y separación entre header y tabs
  tabsContainer: {
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingBottom: hp("1%"),
    // Si el header tiene mucho paddingTop (*10), mantenemos una separación mínima aquí
    marginTop: hp("0.6%"),
  },
  // 🔹 Separador gris VISUAL entre el header gris y el contenedor blanco
  separatorGray: {
    backgroundColor: COLORS.inputBackground,
    height: hp("2.2%"), // Ajusta este valor para más/menos separación gris
  },
  // Contenedor blanco con esquinas redondeadas (más pronunciadas) arriba

  whiteCard: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    overflow: "hidden",
    // ⬅️ reintroducimos un solape pequeño para que las esquinas se vean sobre el gris
    marginTop: -hp("0.8%"),
    paddingTop: hp("1.4%"),
  },

  // Contenido interior (lista de tareas)
  contentContainer: {
    padding: 16,
  },
});

export default DashBoardPersonal;