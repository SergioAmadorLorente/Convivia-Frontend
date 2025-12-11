import React, { useState } from "react";
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
import KarmaSelector from "../../components/ui/KarmaSelector";
import RepeatDaysSelector from "../../components/ui/RepeatDaysSelector";
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
  const [selectedDate, setSelectedDate] = useState(new Date()); // ✅ Día actual
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
        <Header
          username="@usuario"
          date="Miércoles, 15 de Septiembre"
          location="Piso Tarragona"
        />
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
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
      </ScrollView>
      <BottomBar />
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
  },
});
export default DashBoardPersonal;