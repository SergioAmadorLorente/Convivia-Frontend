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
import { TaskModel } from "../../types/Task";
import { FacturaModel } from "../../types/Factura";
// Global
import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from "../../styles/styles";
import { COLORS, HELPERS, SIZES } from "../../styles/theme";
// Componentes
import BottomBar from "../../components/ui/BottomBar";
import Header from "../../components/ui/Header";
import TabSwitcher from "../../components/ui/TabSwitcher";
import TaskItem from "../../components/ui/TaskItem";
import Desplegable from "../../components/ui/Desplegable";
import TasksFilter from "../../components/ui/TasksFilter";
const { hp } = HELPERS;
// TaskModel defined in src/types/Task.ts
const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"tareas" | "facturas">("tareas");
  const [selectedFilter, setSelectedFilter] =
    useState<"today" | "week" | "all">("today");
  const [tareas, setTareas] = useState<TaskModel[]>([
    new TaskModel({ id: "1", Nombre: "Bajar la basura", Descripcion: "Orgánica y envases", karma: 1, DiasRepeticion: [], FechaLimite: new Date(), HoraLimite: "12:00", isCompleted: false }),
    new TaskModel({ id: "2", Nombre: "Barrer", Descripcion: "Zonas comunes", karma: 1, DiasRepeticion: [], FechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000), HoraLimite: "15:30", isCompleted: false }),
    new TaskModel({ id: "3", Nombre: "Limpiar el baño", Descripcion: null, karma: 1, DiasRepeticion: [], FechaLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), HoraLimite: "09:30", isCompleted: false }),
    new TaskModel({ id: "4", Nombre: "Fregar los platos", Descripcion: null, karma: 1, DiasRepeticion: [], FechaLimite: new Date(Date.now() - 24 * 60 * 60 * 1000), HoraLimite: "09:30", isCompleted: true }),
  ]);
  const [facturas, setFacturas] = useState<FacturaModel[]>([
    new FacturaModel({ IdFactura: "f1", Nombre: "Electricidad", Precio: 85.5, Reparto: {}, Pagado: false, FechaCreacion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }),
    new FacturaModel({ IdFactura: "f2", Nombre: "Internet", Precio: 45.0, Reparto: {}, Pagado: true, FechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }),
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
      setTareas(prev => prev.map(task => (task.id === id ? task.toggleComplete() : task)));
    } else {
      setFacturas(prev => prev.map(f => (f.IdFactura === id ? f.togglePaid() : f)));
    }
  };
  const currentItems = activeTab === "tareas" ? tareas : facturas;
  // Apply filter only for tareas; facturas are always shown (no FechaLimite)
  let filteredItems: Array<any> = [];
  if (activeTab === "tareas") {
    // Narrow type to TaskModel[] so we can call TaskModel methods without TS errors
    filteredItems = (currentItems as TaskModel[]).filter(item => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "today") return item.isDueToday();
      if (selectedFilter === "week") return item.isDueWithinDays(7);
      return true;
    });
  } else {
    // facturas: show all
    filteredItems = currentItems as FacturaModel[];
  }

  const isDone = (i: any) => {
    if (typeof i.isCompleted === "boolean") return i.isCompleted;
    if (typeof i.Pagado === "boolean") return i.Pagado;
    return false;
  };

  let pendingItems: any[] = [];
  let completedItems: any[] = [];

  if (activeTab === "tareas") {
    // For tasks: show pending tasks, and completed tasks only if completed within 7 days
    pendingItems = filteredItems.filter((i: any) => !isDone(i));
    completedItems = filteredItems.filter((i: any) => isDone(i) && (typeof i.isCompletedWithinDays === "function" ? i.isCompletedWithinDays(7) : true));
  } else {
    // For invoices: show all, pending = not paid, completed = paid
    pendingItems = filteredItems.filter((i: any) => !isDone(i));
    completedItems = filteredItems.filter((i: any) => isDone(i));
  }
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
        {/* ⬅️ SOLO aparece cuando estás en "tareas" */}
        {activeTab === "tareas" && (
          <View
            style={[
              GLOBAL_STYLES.fullWidth,
              { marginTop: 10, marginBottom: 15 }
            ]}
          >
            <TasksFilter onFilterChange={setSelectedFilter} />
          </View>
        )}
        <View style={GLOBAL_STYLES.container}>
          <Desplegable
            title="Pendientes"
            fontSize={SIZES.text16}
            fontWeight="bold"
            collapsible={false}
            showIcon={false}
          >
            {pendingItems.map(item => (
              <TaskItem
                key={item.id ?? item.IdFactura}
                time={item.formattedTime ? item.formattedTime() : item.formattedDate()}
                title={item.Nombre}
                subtitle={item.Descripcion ?? (item.Precio !== undefined ? `€${item.Precio.toFixed(2)}` : undefined)}
                isCompleted={item.isCompleted ?? item.Pagado}
                onToggle={() => handleToggleTask(item.id ?? item.IdFactura)}
              />
            ))}
          </Desplegable>
          <Desplegable
            title="Completadas"
            fontSize={SIZES.text16}
            fontWeight="bold"
            collapsible={false}
            showIcon={false}
          >
            {completedItems.map(item => (
              <TaskItem
                key={item.id ?? item.IdFactura}
                time={item.formattedTime ? item.formattedTime() : item.formattedDate()}
                title={item.Nombre}
                subtitle={item.Descripcion ?? (item.Precio !== undefined ? `€${item.Precio.toFixed(2)}` : undefined)}
                isCompleted={item.isCompleted ?? item.Pagado}
                onToggle={() => handleToggleTask(item.id ?? item.IdFactura)}
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