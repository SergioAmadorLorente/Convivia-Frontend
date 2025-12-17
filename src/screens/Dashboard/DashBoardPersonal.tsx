import React, { useState, useEffect } from "react";
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
// Global
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from "../../styles/styles";
import { COLORS, HELPERS, SIZES } from "../../styles/theme";
// Componentes
import BottomBar from "../../components/ui/BottomBar";
import Header from "../../components/ui/Header";
import TabSwitcher from "../../components/ui/TabSwitcher";
import TaskItem from "../../components/ui/TaskItem";
import { auth } from "../../configs/firebaseConfig";
import { obtenerEspacioPorUsuarioId } from "../../api/usuarioEspacio";
import Desplegable from "../../components/ui/Desplegable";
import TasksFilter from "../../components/ui/TasksFilter";
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
  const [nombreEspacio, setNombreEspacio] = useState<string>("Cargando...");
  const [nombreUsuario, setNombreUsuario] = useState<string>("@usuario");
  const [loadingEspacio, setLoadingEspacio] = useState<boolean>(true);

  const [selectedFilter, setSelectedFilter] =
    useState<"today" | "week" | "all">("today");
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

  // Cargar el espacio del usuario
  useEffect(() => {
    const cargarEspacioUsuario = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          console.log("No hay usuario autenticado");
          setNombreEspacio("Sin espacio");
          setLoadingEspacio(false);
          return;
        }

        // Obtener el nombre de usuario (email sin dominio)
        const username = user.email?.split('@')[0] || "usuario";
        setNombreUsuario(`@${username}`);

        // Obtener el espacio del usuario
        const espacioData = await obtenerEspacioPorUsuarioId(user.uid);

        if (espacioData && espacioData.espacio) {
          setNombreEspacio(espacioData.espacio.nombre);
          console.log("Espacio cargado:", espacioData.espacio);
        } else {
          setNombreEspacio("Sin espacio asignado");
          console.log("Usuario no tiene espacio asignado");
        }
      } catch (error) {
        console.error("Error al cargar espacio del usuario:", error);
        setNombreEspacio("Error al cargar");
      } finally {
        setLoadingEspacio(false);
      }
    };

    cargarEspacioUsuario();
  }, []);

  if (!fontsLoaded || loadingEspacio) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const handleToggleTask = (id: string) => {
    if (activeTab === "tareas") {
      setTareas(prev =>
        prev.map(task =>
          task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        )
      );
    } else {
      setFacturas(prev =>
        prev.map(f =>
          f.id === id ? { ...f, isCompleted: !f.isCompleted } : f
        )
      );
    }
  };
  const currentItems = activeTab === "tareas" ? tareas : facturas;
  const pendingItems = currentItems.filter(i => !i.isCompleted);
  const completedItems = currentItems.filter(i => i.isCompleted);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <Header
        username="@usuario"
        date="Miércoles, 15 de Septiembre"
        location="Piso Tarragona"
      />
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      <ScrollView
        contentContainerStyle={[
          GLOBAL_STYLES.scrollContainer2,
          { paddingBottom: hp("15%") },
          Platform.OS === "web" ? WEB_FULL_VIEWPORT : {},
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <Header
          username={nombreUsuario}
          date={new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
          location={nombreEspacio}
        />
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
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
      </ScrollView>
      <BottomBar />
    </KeyboardAvoidingView>
  );
};
export default DashBoardPersonal;