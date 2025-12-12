// screens/DashBoardPersonal.tsx
import React, { useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation } from "@react-navigation/native";
 
// ✅ Globales y tokens
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from "../../styles/styles";
import { COLORS, HELPERS, SIZES } from "../../styles/theme";
 
// ✅ Componentes existentes
import BottomBar from "../../components/ui/BottomBar";
import Header from "../../components/ui/Header";
import TabSwitcher from "../../components/ui/TabSwitcher";
import TaskItem from "../../components/ui/TaskItem";
import DayCarousel from "../../components/ui/DayCarousel";
import Desplegable from "../../components/ui/Desplegable";
 
const { hp } = HELPERS;
 
interface Task {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  isCompleted: boolean;
}
 
const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();

 
  const [activeTab, setActiveTab] = useState<"tareas" | "facturas">("tareas");
  const [selectedDate, setSelectedDate] = useState(new Date());
 
  const [tareas, setTareas] = useState<Task[]>([
    { id: "1", time: "12:00", title: "Bajar la basura", subtitle: "Orgánica y envases", isCompleted: false },
    { id: "2", time: "15:30", title: "Barrer", subtitle: "Zonas comunes", isCompleted: false },
    { id: "3", time: "09:30", title: "Limpiar el baño", isCompleted: false },
    { id: "4", time: "09:30", title: "Fregar los platos", isCompleted: true },
  ]);
 
  const [facturas, setFacturas] = useState<Task[]>([
    { id: "1", time: "15/12", title: "Electricidad", subtitle: "€85.50", isCompleted: false },
    { id: "2", time: "20/12", title: "Internet", subtitle: "€45.00", isCompleted: true },
  ]);
 
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });
 
  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
 
  const handleToggleTask = (id: string) => {
    if (activeTab === "tareas") {
      setTareas((prev) =>
        prev.map((task) => (task.id === id ? { ...task, isCompleted: !task.isCompleted } : task))
      );
    } else {
      setFacturas((prev) =>
        prev.map((factura) => (factura.id === id ? { ...factura, isCompleted: !factura.isCompleted } : factura))
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
      {/* Header (tu componente) */}
      <Header
          username="@usuario"
          date="Miércoles, 15 de Septiembre"
          location="Piso Tarragona"
        />
        {/* Tabs */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      <ScrollView
        contentContainerStyle={[
          GLOBAL_STYLES.scrollContainer2,         // ✅ ancho completo, fondo blanco
          { paddingBottom: hp("15%") },           // puedes mover esto a un global si prefieres
          Platform.OS === "web" ? WEB_FULL_VIEWPORT : {},
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
 
        {/* Carrusel (envuelto en fullWidth para asegurar ancho) */}
        <View style={GLOBAL_STYLES.fullWidth}>
          <DayCarousel onDaySelected={setSelectedDate} />
        </View>
 
        {/* Contenido con fondo blanco (usa container global) */}
        <View style={GLOBAL_STYLES.container}>
          {/* Sección: Pendientes */}
          <Desplegable
            title="Pendientes"
            fontSize={SIZES.text16}
            fontWeight="bold"
            collapsible={false}
            showIcon={false}
          >
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
          </Desplegable>
 
          {/* Sección: Completadas */}
          <Desplegable
            title="Completadas"
            fontSize={SIZES.text16}
            fontWeight="bold"
            collapsible={false}
            showIcon={false}
          >
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
          </Desplegable>
        </View>
      </ScrollView>
 
      <BottomBar />
    </KeyboardAvoidingView>
  );
};
 
export default DashBoardPersonal;
