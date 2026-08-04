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
import Animated, { LinearTransition, ReduceMotion } from "react-native-reanimated";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

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
import { useToast } from "../../hooks/useToast";
import { KarmaTrailOverlay } from "../../components/ui/KarmaTrailOverlay";

const { hp } = HELPERS;

const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t, i18n } = useTranslation();
  const { show: showToast } = useToast();

  const {
    user,
    authLoading,
    userName,
    espacioNombre,
    espacioId,
    userRelacionId,
    currentKarma,
    setCurrentKarma,
    loadingKarma,
    loadingEspacio,
    userNamesMap,
    tareas,
    setTareas,
    loadingTareas,
    loadingFacturas,
    refreshing,
    setRefreshing,
    cargarTareas,
    facturas,
    setFacturas,
  } = useDashboardData(route.params?.newSpaceName);

  const CURRENT_USER_ID = user?.uid || "u2";
  const CURRENT_USER_RELACION_ID = userRelacionId;

  const [activeTab, setActiveTab] = useState<"tareas" | "facturas">("tareas");
  const isLoading = authLoading || loadingEspacio || (activeTab === "tareas" ? loadingTareas : loadingFacturas);
  const [selectedFilter, setSelectedFilter] = useState<"today" | "week" | "all">("today");
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>("all");
  const [visibility, setVisibility] = useState({
    showUnassigned: true,
    showOverdue: true,
    showCompleted: true,
  });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});
  const showPopup = (opts: any) => { setPopupOptions(opts); setPopupVisible(true); };
  const handleClosePopup = () => setPopupVisible(false);

  // -- Karma Trail Animation State --
  const [karmaTrail, setKarmaTrail] = useState<{ x: number; y: number; amount: number; key: number } | null>(null);
  const [karmaTargetCoords, setKarmaTargetCoords] = useState<{ x: number; y: number }>({ x: 200, y: 90 });
  const [headerImpactAnimating, setHeaderImpactAnimating] = useState(false);

  const handleTaskCompletedOnTime = (startCoords: { x: number; y: number }, karmaAmount: number) => {
    setKarmaTrail({ x: startCoords.x, y: startCoords.y, amount: karmaAmount, key: Date.now() });
  };

  const handleKarmaImpact = () => {
    setHeaderImpactAnimating(true);
    setTimeout(() => setHeaderImpactAnimating(false), 600);
    setKarmaTrail(null);
  };

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
    showToast,
    t,
    closeDetalle,
    CURRENT_USER_ID,
    activeTab,
    openDetalleTarea,
    onTaskCompletedOnTime: handleTaskCompletedOnTime,
  });

  const { handleQuickToggleFactura } = useQuickToggleFactura(facturas, setFacturas, userRelacionId, espacioId, CURRENT_USER_ID);

  const onRefresh = React.useCallback(() => { setRefreshing(true); cargarTareas(false); }, [cargarTareas, setRefreshing]);

  useFocusEffect(React.useCallback(() => { cargarTareas(); }, [espacioId]));

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
        assignedUsers: task.usuarioAsignadoId && task.usuarioAsignado
          ? [{ id: task.usuarioAsignadoId, name: task.usuarioAsignado }]
          : [],
        instanceId: task.tareasId?.[0],
        tareasId: task.tareasId || [],
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
    const myUid = (user?.uid || "").replace(/-/g, "").toLowerCase();
    return (
      item.UsuariosAsignados?.some((u) => {
        const cleanUId = u.id.replace(/-/g, "").toLowerCase();
        return (cleanUId === relId || cleanUId === myUid) && u.completed;
      }) ?? false
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
      if (it.overdue) return true;
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
    if (selectedUserFilter !== "all") {
      pendingItems = pendingItems.filter(i => i.usuarioAsignado === selectedUserFilter);
      overdueItems = overdueItems.filter(i => i.usuarioAsignado === selectedUserFilter);
    }
    completedItems = tareas.filter(i => i.isCompleted && i.isCompletedWithinDays(7));
    if (selectedUserFilter !== "all") {
      completedItems = completedItems.filter(i => i.usuarioAsignado === selectedUserFilter);
    }
  } else {
    // Mostrar todas las facturas (tanto pendientes como completadas)

    // Pendientes: sin pagos completos, ordenadas por fecha de creación descendente
    pendingItems = facturas
      .filter(i => !i.Pagado)
      .sort((a, b) => b.FechaCreacion.getTime() - a.FechaCreacion.getTime());

    // Completadas: todas las pagadas (dentro de los 20 días de visibilidad), ordenadas por FechaCompletada descendente
    completedItems = facturas
      .filter(i => i.Pagado && i.isCompletedWithinDays(20))
      .sort((a, b) =>
        (b.FechaCompletada?.getTime() || 0) - (a.FechaCompletada?.getTime() || 0)
      );
  }

  const fmtEUR = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n || 0);

  return (
    <View style={{ flex: 1 }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <Header
        username={userName}
        date={new Date()}
        location={espacioNombre}
        karma={currentKarma}
        loadingKarma={loadingKarma}
        onKarmaLayout={(coords) => setKarmaTargetCoords(coords)}
        isImpactAnimating={headerImpactAnimating}
      />
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        contentContainerStyle={[GLOBAL_STYLES.scrollContainer2, { paddingTop: hp("0.5%"), paddingBottom: hp("15%") }, Platform.OS === "web" ? WEB_FULL_VIEWPORT : {}]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#8B5CF6"]} tintColor="#8B5CF6" />}
      >
        {activeTab === "tareas" && (
          <View style={[GLOBAL_STYLES.fullWidth, { marginTop: 4, marginBottom: 12 }]}>
            <TasksFilter
              currentFilter={selectedFilter}
              currentVisibility={visibility}
              currentUserFilter={selectedUserFilter}
              userNamesMap={userNamesMap}
              currentUserName={userName}
              onFilterChange={setSelectedFilter}
              onVisibilityChange={setVisibility}
              onUserFilterChange={setSelectedUserFilter}
            />
          </View>
        )}

        {isLoading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60, minHeight: 300 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 20, fontFamily: FONTS.regular, fontSize: SIZES.text16, color: "#666" }}>
              {t('common.loading')}
            </Text>
          </View>
        ) : (
          <Animated.View
            layout={LinearTransition.springify().damping(15).mass(0.8).reduceMotion(ReduceMotion.Never)}
            style={GLOBAL_STYLES.container}
          >
            {activeTab === "facturas" && pendingItems.length === 0 && completedItems.length === 0 && (
              <View style={[{ paddingVertical: 40 }]}>
                <Text style={{ fontSize: 16, color: COLORS.secondary, fontFamily: FONTS.regular, textAlign: "center" }}>
                  {t('dashboard.noInvoices')}
                </Text>
              </View>
            )}

            {activeTab === "tareas" && tareas.length === 0 && (
              <View style={[{ paddingVertical: 40 }]}>
                <Text style={{ fontSize: 16, color: COLORS.secondary, fontFamily: FONTS.regular, textAlign: "center" }}>
                  {t('dashboard.noTasks')}
                </Text>
              </View>
            )}

            {pendingItems.length > 0 && (
              <Desplegable title={activeTab === "tareas" ? t('dashboard.sections.pending') : t('dashboard.sections.pendingPayment')} fontSize={SIZES.text16} fontWeight="bold" defaultOpen={true}>
                {pendingItems.map((item: any) => (
                  <TaskItem
                    key={activeTab === "tareas" ? item.id : item.IdFactura}
                    variant={activeTab === "tareas" ? "tarea" : "factura"}
                    title={item.Nombre}
                    subtitle={activeTab === "tareas" ? item.usuarioAsignado || undefined : undefined}
                    unassigned={activeTab === "tareas" ? !item.usuarioAsignado : undefined}
                    isCompleted={activeTab === "tareas" ? item.isCompleted : isFacturaPaidByMe(item)}
                    onToggle={(coords) => handleToggleTask(activeTab === "tareas" ? item.id : item.IdFactura, coords)}
                    onQuickToggle={activeTab === "facturas" ? () => handleQuickToggleFactura(item.IdFactura) : undefined}
                    onPressRow={() => activeTab === "tareas" ? openDetalleTarea(item) : openDetalleFactura(item)}
                    time={activeTab === "tareas" ? item.formattedTime?.() : undefined}
                    fechaLimite={activeTab === "tareas" ? new Date(item.FechaLimite).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { day: "2-digit", month: "2-digit" }) : undefined}
                    isOverdue={activeTab === "tareas" ? !!item.overdue : false}
                    dateLabel={activeTab === "facturas" ? item.formattedDate?.(i18n.language === 'en' ? 'en-US' : 'es-ES') : undefined}
                    perPersonPrice={activeTab === "facturas" ? fmtEUR(item.perPersonPrice?.()) : undefined}
                    paidCount={activeTab === "facturas" ? item.paidUsersCount?.() : undefined}
                    totalAssigned={activeTab === "facturas" ? item.totalUsersCount?.() : undefined}
                  />
                ))}
              </Desplegable>
            )}

            {activeTab === "tareas" && visibility.showOverdue && overdueItems.length > 0 && (
              <Desplegable title={t('dashboard.sections.overdue')} fontSize={SIZES.text16} fontWeight="bold" defaultOpen={true}>
                {overdueItems.map((task: TaskModel) => (
                  <TaskItem
                    key={task.id}
                    variant="tarea"
                    title={task.Nombre}
                    subtitle={task.usuarioAsignado || undefined}
                    unassigned={!task.usuarioAsignado}
                    isCompleted={task.isCompleted}
                    isOverdue={true}
                    onToggle={() => handleToggleTask(task.id)}
                    onPressRow={() => openDetalleTarea(task)}
                    time={task.formattedTime()}
                    fechaLimite={new Date(task.FechaLimite).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { day: "2-digit", month: "2-digit" })}
                  />
                ))}
              </Desplegable>
            )}

            {visibility.showCompleted && completedItems.length > 0 && (
              <Desplegable title={activeTab === "tareas" ? t('dashboard.sections.completed') : t('dashboard.sections.paid')} fontSize={SIZES.text16} fontWeight="bold" defaultOpen={true}>
                {completedItems.map((item: any) => (
                  <TaskItem
                    key={activeTab === "tareas" ? item.id : item.IdFactura}
                    variant={activeTab === "tareas" ? "tarea" : "factura"}
                    title={item.Nombre}
                    subtitle={activeTab === "tareas" ? item.usuarioAsignado || undefined : undefined}
                    isCompleted={activeTab === "tareas" ? item.isCompleted : isFacturaPaidByMe(item)}
                    onToggle={() => handleToggleTask(activeTab === "tareas" ? item.id : item.IdFactura)}
                    onQuickToggle={activeTab === "facturas" ? () => handleQuickToggleFactura(item.IdFactura) : undefined}
                    onPressRow={() => activeTab === "tareas" ? openDetalleTarea(item) : openDetalleFactura(item)}
                    time={activeTab === "tareas" ? item.formattedTime?.() : undefined}
                    dateLabel={activeTab === "facturas" ? item.formattedDate?.(i18n.language === 'en' ? 'en-US' : 'es-ES') : undefined}
                    perPersonPrice={activeTab === "facturas" ? fmtEUR(item.perPersonPrice?.()) : undefined}
                    paidCount={activeTab === "facturas" ? item.paidUsersCount?.() : undefined}
                    totalAssigned={activeTab === "facturas" ? item.totalUsersCount?.() : undefined}
                  />
                ))}
              </Desplegable>
            )}
          </Animated.View>
        )}
      </ScrollView>

      <Popup
        visible={popupVisible}
        onClose={handleClosePopup}
        title={popupOptions.title || ""}
        description={popupOptions.description}
        imageType={popupOptions.imageType}
        buttons={popupOptions.buttons ?? [{ text: t('common.accept'), onPress: handleClosePopup }]}
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

    </KeyboardAvoidingView>

      {/* Karma Trail Overlay — outside KeyboardAvoidingView so Android elevation works in Release APKs */}
      {karmaTrail && (
        <KarmaTrailOverlay
          key={karmaTrail.key}
          startX={karmaTrail.x}
          startY={karmaTrail.y}
          targetX={karmaTargetCoords.x}
          targetY={karmaTargetCoords.y}
          karmaAmount={karmaTrail.amount}
          onImpact={handleKarmaImpact}
          onAnimationEnd={() => setKarmaTrail(null)}
        />
      )}

      <BottomBar />
    </View>
  );
};

export default DashBoardPersonal;