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
import { HELPERS, SIZES } from "../../styles/theme";
// Componentes
import BottomBar from "../../components/ui/BottomBar";
import Header from "../../components/ui/Header";
import TabSwitcher from "../../components/ui/TabSwitcher";
import TaskItem from "../../components/ui/TaskItem";
import Desplegable from "../../components/ui/Desplegable";
import TasksFilter from "../../components/ui/TasksFilter";
import Popup from "../../components/ui/Popup";
import DetalleTarea from "../../components/ui/DetalleTarea";

const { hp } = HELPERS;

const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<"tareas" | "facturas">("tareas");
  const [selectedFilter, setSelectedFilter] = useState<
    "today" | "week" | "all"
  >("today");
  const [visibility, setVisibility] = useState({
    showUnassigned: true,
    showOverdue: true,
    showCompleted: true,
  });

  const [tareas, setTareas] = useState<TaskModel[]>([
    // Pendientes - dentro de plazo (hoy) - con usuario
    new TaskModel({
      id: "1",
      Nombre: "Bajar la basura",
      Descripcion: "Orgánica y envases",
      karma: 5,
      DiasRepeticion: [],
      FechaLimite: new Date(),
      HoraLimite: "12:00",
      isCompleted: false,
      usuarioAsignado: "Juan",
    }),
    // Pendientes - dentro de plazo (mañana) - con usuario
    new TaskModel({
      id: "2",
      Nombre: "Barrer",
      Descripcion: "Zonas comunes",
      karma: 3,
      DiasRepeticion: [],
      FechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000),
      HoraLimite: "15:30",
      isCompleted: false,
      usuarioAsignado: "María",
    }),
    // Pendientes - dentro de plazo (en 2 días) - SIN usuario
    new TaskModel({
      id: "3",
      Nombre: "Limpiar el baño",
      Descripcion: null,
      karma: 7,
      DiasRepeticion: [],
      FechaLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      HoraLimite: "09:30",
      isCompleted: false,
      usuarioAsignado: null,
    }),
    // Fuera de plazo - ayer sin completar - con usuario
    new TaskModel({
      id: "4",
      Nombre: "Hacer la compra",
      Descripcion: "Supermercado",
      karma: 4,
      DiasRepeticion: [],
      FechaLimite: new Date(Date.now() - 24 * 60 * 60 * 1000),
      HoraLimite: "18:00",
      isCompleted: false,
      usuarioAsignado: "Pedro",
    }),
    // Fuera de plazo - hace 3 días sin completar - SIN usuario
    new TaskModel({
      id: "5",
      Nombre: "Limpiar la cocina",
      Descripcion: null,
      karma: 2,
      DiasRepeticion: [],
      FechaLimite: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      HoraLimite: "10:00",
      isCompleted: false,
      usuarioAsignado: null,
    }),
    // Completada - hace 2 días - con usuario
    new TaskModel({
      id: "6",
      Nombre: "Fregar los platos",
      Descripcion: null,
      karma: 1,
      DiasRepeticion: [],
      FechaLimite: new Date(Date.now() - 24 * 60 * 60 * 1000),
      HoraLimite: "09:30",
      isCompleted: true,
      FechaCompletada: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      usuarioAsignado: "Ana",
    }),
    // Completada - hace 5 días - con usuario
    new TaskModel({
      id: "7",
      Nombre: "Lavar la ropa",
      Descripcion: null,
      karma: 3,
      DiasRepeticion: [],
      FechaLimite: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      HoraLimite: "14:00",
      isCompleted: true,
      FechaCompletada: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      usuarioAsignado: "Pepe",
    }),
    // Completada - hace 8 días (debería ocultarse porque supera 7 días) - con usuario
    new TaskModel({
      id: "8",
      Nombre: "Limpiar ventanas",
      Descripcion: null,
      karma: 6,
      DiasRepeticion: [],
      FechaLimite: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      HoraLimite: "11:00",
      isCompleted: true,
      FechaCompletada: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      usuarioAsignado: "Carlos",
    }),
  ]);

  const [facturas, setFacturas] = useState<FacturaModel[]>([
    new FacturaModel({
      IdFactura: "f1",
      Nombre: "Electricidad",
      Precio: 85.5,
      Reparto: {},
      Pagado: false,
      FechaCreacion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    }),
    new FacturaModel({
      IdFactura: "f2",
      Nombre: "Internet",
      Precio: 45.0,
      Reparto: {},
      Pagado: true,
      FechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }),
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

  // Popup helper
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});
  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };
  const handleClosePopup = () => setPopupVisible(false);

  // Modal detalle de tarea
  const [taskDetailVisible, setTaskDetailVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskModel | null>(null);

  const openTaskDetail = (task: TaskModel) => {
    setSelectedTask(task);
    setTaskDetailVisible(true);
  };
  const closeTaskDetail = () => {
    setTaskDetailVisible(false);
    setSelectedTask(null);
  };

  const handleToggleTask = (id: string) => {
    if (activeTab === "tareas") {
      // ---------- TAREAS ----------
      const task = tareas.find((t) => t.id === id);
      if (!task) return;

      const due = new Date(task.FechaLimite);
      const dueStart = new Date(
        due.getFullYear(),
        due.getMonth(),
        due.getDate()
      );
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const wasOverdue = dueStart.getTime() < todayStart.getTime();

      // 🛑 Impedir completar tareas SIN asignar
      if (!task.isCompleted && !task.usuarioAsignado) {
        showPopup({
          imageType: "error",
          title: "Para completar una tarea debe estar asignada",
          description:
            "Ve al detalle de la tarea y asígnala a un usuario para poder marcarla como completada.",
          buttons: [
            { text: "Cancelar", onPress: () => {} },
            {
              text: "Ir al detalle",
              onPress: () => {
                // Puedes usar el modal o tu pantalla de edición
                setSelectedTask(task);
                setTaskDetailVisible(true);
              },
            },
          ],
        });
        return; // No togglear
      }

      // Si ya está completada y la quieren desmarcar -> confirmar
      if (task.isCompleted) {
        showPopup({
          imageType: "goback",
          title: "¿Estás seguro de que quieres marcar la tarea como pendiente?",
          description:
            "Perderás los puntos de Karma obtenidos con esta tarea y no podrás recuperarlos.",
          buttons: [
            { text: "Cancelar", onPress: () => {} },
            {
              text: "Aceptar",
              onPress: () => {
                setTareas((prev) =>
                  prev.map((t) => (t.id === id ? t.toggleComplete() : t))
                );
              },
            },
          ],
        });
        return;
      }

      // Si no estaba completada y la marcan como completada -> popups de logro o 'casi'
      if (!task.isCompleted) {
        if (wasOverdue) {
          showPopup({
            imageType: "happy",
            title: "¡Casi lo logras!",
            description:
              "La próxima vez, intenta completar la tarea dentro del plazo.\n\nHas ganado 0 puntos de Karma.",
            buttons: [{ text: "Aceptar", onPress: () => {} }],
          });
        } else {
          showPopup({
            imageType: "happy",
            title: "¡Felicidades!",
            description: `Has completado una tarea. Has ganado ${task.karma} puntos de Karma.`,
            buttons: [{ text: "Aceptar", onPress: () => {} }],
          });
        }

        setTareas((prev) =>
          prev.map((t) => (t.id === id ? t.toggleComplete() : t))
        );
      }
    } else {
      // ---------- FACTURAS ----------
      const factura = facturas.find((f) => f.IdFactura === id);
      if (!factura) return;

      // Si ya está pagada y la quieren marcar como pendiente -> confirmar (sin subtítulo)
      if (factura.Pagado) {
        showPopup({
          imageType: "goback",
          title:
            "¿Estás seguro de que quieres marcar la factura como pendiente?",
          buttons: [
            { text: "Cancelar", onPress: () => {} },
            {
              text: "Aceptar",
              onPress: () => {
                setFacturas((prev) =>
                  prev.map((f) => (f.IdFactura === id ? f.togglePaid() : f))
                );
              },
            },
          ],
        });
        return;
      }

      // Si NO estaba pagada y se marca como pagada -> popup happy y luego toggle
      showPopup({
        imageType: "happy",
        title: "Has gestionado correctamente una factura. ¡Así se hace!",
        buttons: [{ text: "Aceptar", onPress: () => {} }],
      });

      setFacturas((prev) =>
        prev.map((f) => (f.IdFactura === id ? f.togglePaid() : f))
      );
    }
  };

  const handleEditTask = (task: TaskModel) => {
    // Por ahora dejamos la navegación clásica (si la usas)
    navigation.navigate("CreateTask", { taskToEdit: task });
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
  let unassignedPendingItems: any[] = [];
  let unassignedOverdueItems: any[] = [];

  if (activeTab === "tareas") {
    // Get today's start date for comparison
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Helper to check if a task is overdue
    const isOverdue = (it: TaskModel) => {
      const d = new Date(it.FechaLimite);
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return dStart.getTime() < todayStart.getTime();
    };

    // 1. Get ALL pending (not completed) tasks
    const allPending = (currentItems as TaskModel[]).filter((i) => !isDone(i));

    // 2. Separate into assigned and unassigned
    const assignedPending = allPending.filter((i) => i.usuarioAsignado);
    const allUnassignedPending = allPending.filter((i) => !i.usuarioAsignado);

    // 3. Separate assigned into overdue and on-time pending
    overdueItems = assignedPending.filter(isOverdue);
    const onTimePending = assignedPending.filter((i) => !isOverdue(i));

    // 4. Apply filter (today/week/all) ONLY to on-time pending tasks
    pendingItems = onTimePending.filter((item) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "today") return item.isDueToday();
      if (selectedFilter === "week") return item.isDueWithinDays(7);
      return true;
    });

    // 5. If showUnassigned is true, also filter unassigned tasks by the same criteria
    if (visibility.showUnassigned) {
      const unassignedOnTime = allUnassignedPending.filter(
        (i) => !isOverdue(i)
      );
      const unassignedOverdue = allUnassignedPending.filter(isOverdue);

      unassignedPendingItems = unassignedOnTime.filter((item) => {
        if (selectedFilter === "all") return true;
        if (selectedFilter === "today") return item.isDueToday();
        if (selectedFilter === "week") return item.isDueWithinDays(7);
        return true;
      });

      unassignedOverdueItems = unassignedOverdue;

      // Add unassigned tasks to their respective arrays
      pendingItems = [...pendingItems, ...unassignedPendingItems];
      overdueItems = [...overdueItems, ...unassignedOverdueItems];
    }

    // 6. Get completed tasks shown only if completed within 7 days
    completedItems = (currentItems as TaskModel[]).filter(
      (i) =>
        isDone(i) &&
        (typeof i.isCompletedWithinDays === "function"
          ? i.isCompletedWithinDays(7)
          : true)
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
              { marginTop: 10, marginBottom: 15 },
            ]}
          >
            <TasksFilter
              onFilterChange={setSelectedFilter}
              onVisibilityChange={setVisibility}
            />
          </View>
        )}

        <View style={GLOBAL_STYLES.container}>
          <Desplegable
            title="Pendientes"
            fontSize={SIZES.text16}
            fontWeight="bold"
            defaultOpen={true}
          >
            {pendingItems.map((item) => (
              <TaskItem
                key={item.id ?? item.IdFactura}
                time={
                  item.formattedTime
                    ? item.formattedTime()
                    : item.formattedDate()
                }
                title={item.Nombre}
                isCompleted={item.isCompleted ?? item.Pagado}
                onToggle={() => handleToggleTask(item.id ?? item.IdFactura)}
                fechaLimite={
                  item.FechaLimite
                    ? new Date(item.FechaLimite).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                      })
                    : undefined
                }
                // ❗ No mostrar exclamación en facturas
                unassigned={
                  activeTab === "tareas" ? !item.usuarioAsignado : false
                }
                onPressRow={
                  activeTab === "tareas"
                    ? () => openTaskDetail(item as TaskModel)
                    : undefined
                }
              />
            ))}
          </Desplegable>

          {visibility.showOverdue && overdueItems.length > 0 && (
            <Desplegable
              title="Fuera de plazo"
              fontSize={SIZES.text16}
              fontWeight="bold"
              defaultOpen={true}
            >
              {overdueItems.map((item) => (
                <TaskItem
                  key={item.id ?? item.IdFactura}
                  time={
                    item.formattedTime
                      ? item.formattedTime()
                      : item.formattedDate()
                  }
                  title={item.Nombre}
                  isCompleted={item.isCompleted ?? item.Pagado}
                  onToggle={() => handleToggleTask(item.id ?? item.IdFactura)}
                  fechaLimite={
                    item.FechaLimite
                      ? new Date(item.FechaLimite).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                        })
                      : undefined
                  }
                  unassigned={
                    activeTab === "tareas" ? !item.usuarioAsignado : false
                  }
                  onPressRow={
                    activeTab === "tareas"
                      ? () => openTaskDetail(item as TaskModel)
                      : undefined
                  }
                />
              ))}
            </Desplegable>
          )}

          {visibility.showCompleted && (
            <Desplegable
              title="Completadas"
              fontSize={SIZES.text16}
              fontWeight="bold"
              defaultOpen={true}
            >
              {completedItems.map((item) => (
                <TaskItem
                  key={item.id ?? item.IdFactura}
                  time={
                    item.formattedTime
                      ? item.formattedTime()
                      : item.formattedDate()
                  }
                  title={item.Nombre}
                  isCompleted={item.isCompleted ?? item.Pagado}
                  onToggle={() => handleToggleTask(item.id ?? item.IdFactura)}
                  fechaLimite={
                    item.FechaLimite
                      ? new Date(item.FechaLimite).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                        })
                      : undefined
                  }
                  unassigned={
                    activeTab === "tareas" ? !item.usuarioAsignado : false
                  }
                  onPressRow={
                    activeTab === "tareas"
                      ? () => openTaskDetail(item as TaskModel)
                      : undefined
                  }
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
        buttons={
          popupOptions.buttons ?? [{ text: "Aceptar", onPress: () => {} }]
        }
        code={popupOptions.code}
      />

      {/* Modal de detalle de tarea */}
      {selectedTask && (
        <DetalleTarea
          visible={taskDetailVisible}
          task={selectedTask}
          onClose={closeTaskDetail}
          onComplete={() => {
            handleToggleTask(selectedTask.id);
            closeTaskDetail();
          }}
          onEdit={() => handleEditTask(selectedTask)}
          onAssignFactura={() => {}}
          onAssignUser={() => {}}
        />
      )}

      <BottomBar />
    </KeyboardAvoidingView>
  );
};

export default DashBoardPersonal;
