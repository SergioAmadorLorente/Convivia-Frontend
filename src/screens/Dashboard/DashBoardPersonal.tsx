import React, { useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import TaskModel from "../../types/Task";
import FacturaModel from "../../types/Factura";

import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from "../../styles/styles";
import { HELPERS, SIZES, COLORS, FONTS } from "../../styles/theme";

import BottomBar from "../../components/ui/BottomBar";
import Header from "../../components/ui/Header";
import TabSwitcher from "../../components/ui/TabSwitcher";
import TaskItem from "../../components/ui/TaskItem";
import Desplegable from "../../components/ui/Desplegable";
import TasksFilter from "../../components/ui/TasksFilter";
import Popup from "../../components/ui/Popup";
import Detalle from "../../components/ui/Detalle";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useDashboardActions, useQuickToggleFactura } from "../../hooks/useDashboardActions";

const { hp } = HELPERS;

const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    user,
    userName,
    espacioNombre,
    espacioId,
    userRelacionId,
    currentKarma,
    setCurrentKarma,
    userNamesMap,
    tareas,
    setTareas,
    loadingTareas,
    refreshing,
    setRefreshing,
    cargarTareas,
    facturas,
    setFacturas,
  } = useDashboardData(route.params?.newSpaceName);

  const CURRENT_USER_ID = user?.uid || "u2";
  const CURRENT_USER_RELACION_ID = userRelacionId;

  const [activeTab, setActiveTab] = useState<"tareas" | "facturas">("tareas");
  const [selectedFilter, setSelectedFilter] = useState<"today" | "week" | "all">("today");
  const [visibility, setVisibility] = useState({
    showUnassigned: true,
    showOverdue: true,
    showCompleted: true,
  });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});
  const showPopup = (opts: any) => { setPopupOptions(opts); setPopupVisible(true); };
  const handleClosePopup = () => setPopupVisible(false);

  const [detalleVisible, setDetalleVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskModel | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<FacturaModel | null>(null);

  const closeDetalle = () => { setDetalleVisible(false); setSelectedTask(null); setSelectedFactura(null); };

  const openDetalleTarea = (task: TaskModel) => { setSelectedTask(task); setSelectedFactura(null); setDetalleVisible(true); };
  const openDetalleFactura = (factura: FacturaModel) => { setSelectedFactura(factura); setSelectedTask(null); setDetalleVisible(true); };

  const { handleToggleTask, handleDeleteTask, handleDeleteFactura } = useDashboardActions({
    espacioId,
    userRelacionId,
    currentKarma,
    setCurrentKarma,
    tareas,
    setTareas,
    facturas,
    setFacturas,
    showPopup,
    closeDetalle,
    CURRENT_USER_ID,
    activeTab,
    openDetalleTarea,
  });

  const { handleQuickToggleFactura } = useQuickToggleFactura(facturas, setFacturas, userRelacionId);

  const onRefresh = React.useCallback(() => { setRefreshing(true); cargarTareas(false); }, [cargarTareas, setRefreshing]);

  useFocusEffect(React.useCallback(() => { cargarTareas(); }, [espacioId, userNamesMap]));

  const handleEditTask = (task: TaskModel) => {
    navigation.navigate("CreateTask", {
      taskToEdit: {
        id: task.id,
        name: task.Nombre,
        description: task.Descripcion,
        time: task.HoraLimite,
        repeatDays: task.DiasRepeticion,
        karma: task.karma,
        date: task.FechaLimite instanceof Date ? task.FechaLimite.toISOString() : task.FechaLimite,
        assignedUsers: task.usuarioAsignado ? [{ id: task.usuarioAsignado, name: task.usuarioAsignado }] : [],
        instanceId: task.tareasId?.[0]
      },
      onSave: () => cargarTareas(),
    });
    closeDetalle();
  };

  const handleEditFactura = (f: FacturaModel) => {
    navigation.navigate("CreateFactura", {
      facturaToEdit: {
        IdFactura: f.IdFactura,
        Nombre: f.Nombre,
        Descripcion: f.Descripcion,
        Precio: f.Precio,
        UsuariosAsignados: f.UsuariosAsignados,
        Pagado: f.Pagado
      },
      onSave: () => { },
    });
    closeDetalle();
  };

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

  // Helper: la factura se considera "completada por mí" si está Pagada globalmente
  // o si este usuario ya marcó su parte
  const isFacturaPaidByMe = (item: FacturaModel): boolean => {
    if (item.Pagado) return true;
    const relId = (userRelacionId || "").replace(/-/g, "").toLowerCase();
    return (
      item.UsuariosAsignados?.some(
        (u) => u.id.replace(/-/g, "").toLowerCase() === relId && u.completed
      ) ?? false
    );
  };

  // Filtrado de items para la UI
  let pendingItems: any[] = [];
  let completedItems: any[] = [];
  let overdueItems: any[] = [];

  if (activeTab === "tareas") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const isOverdue = (it: TaskModel) => {
      const d = new Date(it.FechaLimite);
      d.setHours(0, 0, 0, 0);
      return d.getTime() < todayStart.getTime();
    };

    const allPending = tareas.filter(i => !i.isCompleted);
    overdueItems = allPending.filter(isOverdue);
    const onTimePending = allPending.filter(i => !isOverdue(i));

    const filterFunc = (item: TaskModel) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "today") return item.isDueToday();
      if (selectedFilter === "week") return item.isDueWithinDays(7);
      return true;
    };

    pendingItems = onTimePending.filter(filterFunc);
    if (!visibility.showUnassigned) {
      pendingItems = pendingItems.filter(i => i.usuarioAsignado);
      overdueItems = overdueItems.filter(i => i.usuarioAsignado);
    }
    completedItems = tareas.filter(i => i.isCompleted && i.isCompletedWithinDays(7));
  } else {
    // Filtrar facturas para mostrar solo las asignadas al usuario actual
    const facturasDelUsuario = facturas.filter(f =>
      f.UsuariosAsignados?.some(u => u.id === CURRENT_USER_ID)
    );

    // Pendientes: sin pagos completos, ordenadas por fecha de creación descendente
    pendingItems = facturasDelUsuario
      .filter(i => !i.Pagado)
      .sort((a, b) => b.FechaCreacion.getTime() - a.FechaCreacion.getTime());

    // Completadas: pagadas y dentro de retención de 3 semanas, ordenadas por FechaCompletada descendente
    completedItems = facturasDelUsuario
      .filter(i => i.isCompletedWithinRetention())
      .sort((a, b) =>
        (b.FechaCompletada?.getTime() || 0) - (a.FechaCompletada?.getTime() || 0)
      );
  }

  const fmtEUR = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n || 0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <Header username={userName} date={new Date()} location={espacioNombre} />
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        contentContainerStyle={[GLOBAL_STYLES.scrollContainer2, { paddingBottom: hp("15%") }, Platform.OS === "web" ? WEB_FULL_VIEWPORT : {}]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#8B5CF6"]} tintColor="#8B5CF6" />}
      >
        {activeTab === "tareas" && (
          <View style={[GLOBAL_STYLES.fullWidth, { marginTop: 10, marginBottom: 15 }]}>
            <TasksFilter onFilterChange={setSelectedFilter} onVisibilityChange={setVisibility} />
          </View>
        )}

        <View style={GLOBAL_STYLES.container}>
          {activeTab === "facturas" && pendingItems.length === 0 && completedItems.length === 0 && (
            <View style={[{ paddingVertical: 40 }]}>
              <Text style={{ fontSize: 16, color: COLORS.secondary, fontFamily: FONTS.regular, textAlign: "center" }}>
                No hay facturas asignadas a tu usuario
              </Text>
            </View>
          )}

          {pendingItems.length > 0 && (
            <Desplegable title={activeTab === "tareas" ? "Pendientes" : "Pendientes de pago"} fontSize={SIZES.text16} fontWeight="bold" defaultOpen={true}>
              {pendingItems.map((item: any) => (
                <TaskItem
                  key={activeTab === "tareas" ? item.id : item.IdFactura}
                  variant={activeTab === "tareas" ? "tarea" : "factura"}
                  title={item.Nombre}
                  isCompleted={activeTab === "tareas" ? item.isCompleted : isFacturaPaidByMe(item)}
                  onToggle={() => handleToggleTask(activeTab === "tareas" ? item.id : item.IdFactura)}
                  onQuickToggle={activeTab === "facturas" ? () => handleQuickToggleFactura(item.IdFactura) : undefined}
                  onPressRow={() => activeTab === "tareas" ? openDetalleTarea(item) : openDetalleFactura(item)}
                  time={activeTab === "tareas" ? item.formattedTime?.() : undefined}
                  fechaLimite={activeTab === "tareas" ? new Date(item.FechaLimite).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }) : undefined}
                  dateLabel={activeTab === "facturas" ? item.formattedDate?.("es-ES") : undefined}
                  perPersonPrice={activeTab === "facturas" ? fmtEUR(item.perPersonPrice?.()) : undefined}
                  paidCount={activeTab === "facturas" ? item.paidUsersCount?.() : undefined}
                  totalAssigned={activeTab === "facturas" ? item.totalUsersCount?.() : undefined}
                />
              ))}
            </Desplegable>
          )}

          {activeTab === "tareas" && visibility.showOverdue && overdueItems.length > 0 && (
            <Desplegable title="Fuera de plazo" fontSize={SIZES.text16} fontWeight="bold" defaultOpen={true}>
              {overdueItems.map((task: TaskModel) => (
                <TaskItem
                  key={task.id}
                  variant="tarea"
                  title={task.Nombre}
                  isCompleted={task.isCompleted}
                  onToggle={() => handleToggleTask(task.id)}
                  onPressRow={() => openDetalleTarea(task)}
                  time={task.formattedTime()}
                  fechaLimite={new Date(task.FechaLimite).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                />
              ))}
            </Desplegable>
          )}

          {visibility.showCompleted && completedItems.length > 0 && (
            <Desplegable title={activeTab === "tareas" ? "Completadas" : "Pagadas"} fontSize={SIZES.text16} fontWeight="bold" defaultOpen={true}>
              {completedItems.map((item: any) => (
                <TaskItem
                  key={activeTab === "tareas" ? item.id : item.IdFactura}
                  variant={activeTab === "tareas" ? "tarea" : "factura"}
                  title={item.Nombre}
                  isCompleted={activeTab === "tareas" ? item.isCompleted : isFacturaPaidByMe(item)}
                  onToggle={() => handleToggleTask(activeTab === "tareas" ? item.id : item.IdFactura)}
                  onQuickToggle={activeTab === "facturas" ? () => handleQuickToggleFactura(item.IdFactura) : undefined}
                  onPressRow={() => activeTab === "tareas" ? openDetalleTarea(item) : openDetalleFactura(item)}
                  time={activeTab === "tareas" ? item.formattedTime?.() : undefined}
                  dateLabel={activeTab === "facturas" ? item.formattedDate?.("es-ES") : undefined}
                  perPersonPrice={activeTab === "facturas" ? fmtEUR(item.perPersonPrice?.()) : undefined}
                  paidCount={activeTab === "facturas" ? item.paidUsersCount?.() : undefined}
                  totalAssigned={activeTab === "facturas" ? item.totalUsersCount?.() : undefined}
                />
              ))}
            </Desplegable>
          )}
        </View>
      </ScrollView>

      <Popup
        visible={popupVisible}
        onClose={handleClosePopup}
        title={popupOptions.title || ""}
        description={popupOptions.description}
        imageType={popupOptions.imageType}
        buttons={popupOptions.buttons ?? [{ text: "Aceptar", onPress: handleClosePopup }]}
      />

      {selectedTask && (
        <Detalle
          visible={detalleVisible}
          kind="tarea"
          task={selectedTask}
          onClose={closeDetalle}
          onComplete={() => { handleToggleTask(selectedTask.id); closeDetalle(); }}
          onEdit={() => handleEditTask(selectedTask)}
          onDelete={() => handleDeleteTask(selectedTask.id)}
        />
      )}

      {selectedFactura && (
        <Detalle
          visible={detalleVisible}
          kind="factura"
          factura={selectedFactura}
          onClose={closeDetalle}
          onComplete={() => { handleToggleTask(selectedFactura.IdFactura); closeDetalle(); }}
          onEdit={() => handleEditFactura(selectedFactura)}
          onDelete={() => handleDeleteFactura(selectedFactura.IdFactura)}
        />
      )}

      <BottomBar />
    </KeyboardAvoidingView>
  );
};

export default DashBoardPersonal;
