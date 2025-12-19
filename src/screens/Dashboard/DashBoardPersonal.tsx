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
import Popup from "../../components/ui/Popup";
const { hp } = HELPERS;
// TaskModel defined in src/types/Task.ts
const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<"tareas" | "facturas">("tareas");
  const [selectedFilter, setSelectedFilter] =
    useState<"today" | "week" | "all">("today");
  const [tareas, setTareas] = useState<TaskModel[]>([
    // Pendientes - dentro de plazo (hoy) - con usuario
    new TaskModel({ id: "1", Nombre: "Bajar la basura", Descripcion: "Orgánica y envases", karma: 5, DiasRepeticion: [], FechaLimite: new Date(), HoraLimite: "12:00", isCompleted: false, usuarioAsignado: "Juan" }),
    // Pendientes - dentro de plazo (mañana) - con usuario
    new TaskModel({ id: "2", Nombre: "Barrer", Descripcion: "Zonas comunes", karma: 3, DiasRepeticion: [], FechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000), HoraLimite: "15:30", isCompleted: false, usuarioAsignado: "María" }),
    // Pendientes - dentro de plazo (en 2 días) - SIN usuario
    new TaskModel({ id: "3", Nombre: "Limpiar el baño", Descripcion: null, karma: 7, DiasRepeticion: [], FechaLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), HoraLimite: "09:30", isCompleted: false, usuarioAsignado: null }),
    // Fuera de plazo - ayer sin completar - con usuario
    new TaskModel({ id: "4", Nombre: "Hacer la compra", Descripcion: "Supermercado", karma: 4, DiasRepeticion: [], FechaLimite: new Date(Date.now() - 24 * 60 * 60 * 1000), HoraLimite: "18:00", isCompleted: false, usuarioAsignado: "Pedro" }),
    // Fuera de plazo - hace 3 días sin completar - SIN usuario
    new TaskModel({ id: "5", Nombre: "Pagar la factura", Descripcion: null, karma: 2, DiasRepeticion: [], FechaLimite: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), HoraLimite: "10:00", isCompleted: false, usuarioAsignado: null }),
    // Completada - hace 2 días - con usuario
    new TaskModel({ id: "6", Nombre: "Fregar los platos", Descripcion: null, karma: 1, DiasRepeticion: [], FechaLimite: new Date(Date.now() - 24 * 60 * 60 * 1000), HoraLimite: "09:30", isCompleted: true, FechaCompletada: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), usuarioAsignado: "Ana" }),
    // Completada - hace 5 días - SIN usuario
    new TaskModel({ id: "7", Nombre: "Lavar la ropa", Descripcion: null, karma: 3, DiasRepeticion: [], FechaLimite: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), HoraLimite: "14:00", isCompleted: true, FechaCompletada: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), usuarioAsignado: null }),
    // Completada - hace 8 días (debería ocultarse porque supera 7 días) - con usuario
    new TaskModel({ id: "8", Nombre: "Limpiar ventanas", Descripcion: null, karma: 6, DiasRepeticion: [], FechaLimite: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), HoraLimite: "11:00", isCompleted: true, FechaCompletada: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), usuarioAsignado: "Carlos" }),
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
  // Popup helper (follow NuevaResidencia pattern)
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});
  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };
  const handleClosePopup = () => setPopupVisible(false);
  const handleToggleTask = (id: string) => {
    if (activeTab === "tareas") {
      // Find task to determine popup behaviour before toggling
      const task = tareas.find(t => t.id === id);
      if (task) {
        const due = new Date(task.FechaLimite);
        const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const wasOverdue = dueStart.getTime() < todayStart.getTime();

        // If completing (was not completed before)
        if (!task.isCompleted) {
          if (wasOverdue) {
            showPopup({
              title: "¡Casi lo logras!",
              description: "La próxima vez, intenta completar la tarea dentro del plazo.\n\nHas ganado 0 puntos de Karma.",
              imageType: "happy",
              buttons: [{ text: "Aceptar", onPress: () => {} }],
            });
          } else {
            showPopup({
              title: "¡Felicidades!",
              description: `Has completado una tarea. Has ganado ${task.karma} puntos de Karma.`,
              imageType: "happy",
              buttons: [{ text: "Aceptar", onPress: () => {} }],
            });
          }
        }
      }

      setTareas(prev => prev.map(task => (task.id === id ? task.toggleComplete() : task)));
    } else {
      setFacturas(prev => prev.map(f => (f.IdFactura === id ? f.togglePaid() : f)));
    }
  };
  const handleEditTask = (task: TaskModel) => {
    console.log("handleEditTask called", { task, activeTab });
    // Only allow editing if it is a task, not a bill (factura)
    if (activeTab === "tareas") {
      navigation.navigate("CreateTask", { taskToEdit: task });
    } else {
      console.log("Navigating to CreateFactura");
      navigation.navigate("CreateFactura", { facturaToEdit: task });
    }
  };

  const currentItems = activeTab === "tareas" ? tareas : facturas;

  const isDone = (i: any) => {
    if (typeof i.isCompleted === "boolean") return i.isCompleted;
    if (typeof i.Pagado === "boolean") return i.Pagado;
    return false;
  };

  let pendingItems: any[] = [];
  let completedItems: any[] = [];
  let overdueItems: any[] = [];
  let unassignedItems: any[] = [];

  if (activeTab === "tareas") {
    // Get today's start date for comparison
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Helper to check if a task is overdue
    const isOverdue = (it: TaskModel) => {
      const d = new Date(it.FechaLimite);
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return dStart.getTime() < todayStart.getTime();
    };

    // 1. Get ALL pending (not completed) tasks
    const allPending = (currentItems as TaskModel[]).filter(i => !isDone(i));

    // 2. Separate into assigned and unassigned
    const assignedPending = allPending.filter(i => i.usuarioAsignado);
    unassignedItems = allPending.filter(i => !i.usuarioAsignado);

    // 3. Separate assigned into overdue and on-time pending
    overdueItems = assignedPending.filter(isOverdue);
    const onTimePending = assignedPending.filter(i => !isOverdue(i));

    // 4. Apply filter (today/week/all) ONLY to on-time pending tasks
    pendingItems = onTimePending.filter(item => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "today") return item.isDueToday();
      if (selectedFilter === "week") return item.isDueWithinDays(7);
      return true;
    });

    // 5. Get completed tasks shown only if completed within 7 days
    completedItems = (currentItems as TaskModel[]).filter(
      i => isDone(i) && (typeof i.isCompletedWithinDays === "function" ? i.isCompletedWithinDays(7) : true)
    );
  } else {
    // For invoices: show all, pending = not paid, completed = paid
    pendingItems = currentItems.filter((i: any) => !isDone(i));
    completedItems = currentItems.filter((i: any) => isDone(i));
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
          <Desplegable title="Pendientes" fontSize={SIZES.text16} fontWeight="bold">
            {pendingItems.map(item => (
              <TaskItem
                key={item.id ?? item.IdFactura}
                time={item.formattedTime ? item.formattedTime() : item.formattedDate()}
                title={item.Nombre}
                isCompleted={item.isCompleted ?? item.Pagado}
                onToggle={() => handleToggleTask(item.id ?? item.IdFactura)}
                fechaLimite={item.FechaLimite ? new Date(item.FechaLimite).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : undefined}
              />
            ))}
          </Desplegable>

          {overdueItems.length > 0 && (
            <Desplegable title="Fuera de plazo" fontSize={SIZES.text16} fontWeight="bold">
              {overdueItems.map(item => (
                <TaskItem
                  key={item.id ?? item.IdFactura}
                  time={item.formattedTime ? item.formattedTime() : item.formattedDate()}
                  title={item.Nombre}
                  isCompleted={item.isCompleted ?? item.Pagado}
                  onToggle={() => handleToggleTask(item.id ?? item.IdFactura)}
                  fechaLimite={item.FechaLimite ? new Date(item.FechaLimite).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : undefined}
                />
              ))}
            </Desplegable>
          )}

          {unassignedItems.length > 0 && (
            <Desplegable title="Sin asignar" fontSize={SIZES.text16} fontWeight="bold">
              {unassignedItems.map(item => (
                <TaskItem
                  key={item.id ?? item.IdFactura}
                  time={item.formattedTime ? item.formattedTime() : item.formattedDate()}
                  title={item.Nombre}
                  isCompleted={item.isCompleted ?? item.Pagado}
                  onToggle={() => handleToggleTask(item.id ?? item.IdFactura)}
                  fechaLimite={item.FechaLimite ? new Date(item.FechaLimite).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : undefined}
                />
              ))}
            </Desplegable>
          )}

          <Desplegable title="Completadas" fontSize={SIZES.text16} fontWeight="bold">
            {completedItems.map(item => (
              <TaskItem
                key={item.id ?? item.IdFactura}
                time={item.formattedTime ? item.formattedTime() : item.formattedDate()}
                title={item.Nombre}
                isCompleted={item.isCompleted ?? item.Pagado}
                onToggle={() => handleToggleTask(item.id ?? item.IdFactura)}
                fechaLimite={item.FechaLimite ? new Date(item.FechaLimite).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : undefined}
              />
            ))}
          </Desplegable>
        </View>
      </ScrollView>
      <Popup
        visible={popupVisible}
        onClose={handleClosePopup}
        title={popupOptions.title || ""}
        description={popupOptions.description}
        imageType={popupOptions.imageType}
        buttons={popupOptions.buttons ?? [{ text: "Aceptar", onPress: () => {} }]}
        code={popupOptions.code}
      />
      <BottomBar />
    </KeyboardAvoidingView>
  );
};
export default DashBoardPersonal;