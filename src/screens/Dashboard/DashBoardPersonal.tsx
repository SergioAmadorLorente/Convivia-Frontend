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

import TaskModel from "../../types/Task";
import FacturaModel from "../../types/Factura";

import GLOBAL_STYLES, { WEB_FULL_VIEWPORT } from "../../styles/styles";
import { HELPERS, SIZES } from "../../styles/theme";

import BottomBar from "../../components/ui/BottomBar";
import Header from "../../components/ui/Header";
import TabSwitcher from "../../components/ui/TabSwitcher";
import TaskItem from "../../components/ui/TaskItem";
import Desplegable from "../../components/ui/Desplegable";
import TasksFilter from "../../components/ui/TasksFilter";
import Popup from "../../components/ui/Popup";
import Detalle from "../../components/ui/Detalle";

const { hp } = HELPERS;

const DashBoardPersonal: React.FC = () => {
  const navigation = useNavigation<any>();

  // Identificador del usuario actual (ajústalo a tu auth real)
  const CURRENT_USER_ID = "u2"; // Ej: "María"

  const [activeTab, setActiveTab] = useState<"tareas" | "facturas">("tareas");
  const [selectedFilter, setSelectedFilter] = useState<
    "today" | "week" | "all"
  >("today");
  const [visibility, setVisibility] = useState({
    showUnassigned: true,
    showOverdue: true,
    showCompleted: true,
  });

  // -------------------------
  // Demo data (sustituye por tus reales)
  // -------------------------
  const [tareas, setTareas] = useState<TaskModel[]>([
    new TaskModel({
      id: "1",
      Nombre: "Bajar la basura",
      Descripcion: "Orgánica y envases",
      karma: 5,
      DiasRepeticion: [1, 3, 5], // L, X, V
      FechaLimite: new Date(),
      HoraLimite: "12:00",
      isCompleted: false,
      usuarioAsignado: "Juan",
    }),
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

    new TaskModel({
      id: "9",
      Nombre: "Sacar el vidrio",
      Descripcion: "Contenedor verde",
      karma: 2,
      DiasRepeticion: [],
      // 📅 Fecha límite hace 2 días -> fuera de plazo
      FechaLimite: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      HoraLimite: "20:00",
      isCompleted: false,
      usuarioAsignado: "Pepe",
    }),
  ]);

  const [facturas, setFacturas] = useState<FacturaModel[]>([
    new FacturaModel({
      IdFactura: "f1",
      Nombre: "Electricidad",
      Precio: 120,
      UsuariosAsignados: [
        { id: "u1", name: "Juan", completed: true },
        { id: "u2", name: "María", completed: false },
        { id: "u3", name: "Pedro", completed: true },
      ],
      Pagado: false,
      FechaCreacion: new Date(),
      Descripcion: "Factura mensual",
    }),
    new FacturaModel({
      IdFactura: "f2",
      Nombre: "Internet",
      Precio: 45,
      UsuariosAsignados: [
        { id: "u1", name: "Juan", completed: true },
        { id: "u2", name: "María", completed: true },
      ],
      Pagado: true,
      FechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      FechaCompletada: new Date(Date.now() - 24 * 60 * 60 * 1000),
      Descripcion: "Fibra 300Mb",
    }),
  ]);
  // -------------------------

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

  // -------------------------
  // Popup helper
  // -------------------------
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});
  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };
  const handleClosePopup = () => setPopupVisible(false);

  // -------------------------
  // Detalle (tarea/factura)
  // -------------------------
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskModel | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<FacturaModel | null>(
    null
  );

  const openDetalleTarea = (task: TaskModel) => {
    setSelectedTask(task);
    setSelectedFactura(null);
    setDetalleVisible(true);
  };
  const openDetalleFactura = (factura: FacturaModel) => {
    setSelectedFactura(factura);
    setSelectedTask(null);
    setDetalleVisible(true);
  };
  const closeDetalle = () => {
    setDetalleVisible(false);
    setSelectedTask(null);
    setSelectedFactura(null);
  };

  // -------------------------
  // Normalizadores para EDITAR (CreateTask / CreateFactura)
  // -------------------------
  const normalizeTaskForEdit = (t: TaskModel) => ({
    id: t.id,
    name: t.Nombre ?? "",
    description: t.Descripcion ?? "",
    time: t.HoraLimite ?? "12:00",
    repeatDays: Array.isArray(t.DiasRepeticion) ? t.DiasRepeticion : [],
    karma: typeof t.karma === "number" ? t.karma : 0,
    assignedUsers: t.usuarioAsignado
      ? [{ id: t.usuarioAsignado, name: t.usuarioAsignado }]
      : [],
  });

  const normalizeFacturaForEdit = (f: FacturaModel) => ({
    IdFactura: f.IdFactura,
    Nombre: f.Nombre ?? "",
    Descripcion: f.Descripcion ?? "",
    Precio: typeof f.Precio === "number" ? f.Precio : 0,
    UsuariosAsignados: Array.isArray(f.UsuariosAsignados)
      ? f.UsuariosAsignados
      : [],
    Pagado: !!f.Pagado,
    FechaCreacion: f.FechaCreacion,
    FechaCompletada: f.FechaCompletada ?? null,
  });

  // -------------------------
  // Actualizadores tras guardar
  // -------------------------
  const updateTaskInState = (updated: {
    id: string;
    name: string;
    description: string;
    time: string;
    repeatDays: number[];
    karma: number;
    assignedUsers: { id: string; name: string }[];
  }) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? new TaskModel({
              id: updated.id,
              Nombre: updated.name,
              Descripcion: updated.description,
              HoraLimite: updated.time,
              DiasRepeticion: updated.repeatDays ?? [],
              karma: updated.karma,
              FechaLimite: t.FechaLimite,
              isCompleted: t.isCompleted,
              FechaCompletada: t.FechaCompletada ?? null,
              usuarioAsignado:
                updated.assignedUsers?.[0]?.name ?? t.usuarioAsignado ?? null,
            })
          : t
      )
    );
  };

  const updateFacturaInState = (
    updated: Partial<ReturnType<FacturaModel["toProps"]>> & {
      IdFactura: string;
    }
  ) => {
    setFacturas((prev) =>
      prev.map((f) =>
        f.IdFactura === updated.IdFactura
          ? new FacturaModel({
              ...f.toProps(),
              ...updated,
            })
          : f
      )
    );
  };

  // -------------------------
  // Toggle (tarea/factura)
  // -------------------------
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

      // Bloquear completar si no está asignada
      if (!task.isCompleted && !task.usuarioAsignado) {
        showPopup({
          imageType: "error",
          title: "Para completar una tarea debe estar asignada",
          description:
            "Ve al detalle de la tarea y asígnala a un usuario para poder marcarla como completada.",
          buttons: [
            { text: "Cancelar", onPress: () => {} },
            { text: "Ir al detalle", onPress: () => openDetalleTarea(task) },
          ],
        });
        return;
      }

      // Desmarcar -> confirmar
      if (task.isCompleted) {
        showPopup({
          imageType: "goback",
          title: "¿Estás seguro de que quieres marcar la tarea como pendiente?",
          description:
            "Perderás los puntos de Karma obtenidos con esta tarea. Podrás recuperarlos al completarla de nuevo.",
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

      // Completar -> popups
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

// Desmarcar (Pagado -> pendiente): confirmar
if (factura.Pagado) {
  showPopup({
    imageType: "goback",
    title: "¿Estás seguro de que quieres marcar la factura como pendiente?",
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

// 👉 Nueva lógica: permitir que el usuario actual marque su parte y, si con ello
// quedan todos completos, completar factura.

// 1) Buscar usuario actual en la factura
const usuarios = Array.isArray(factura.UsuariosAsignados)
  ? factura.UsuariosAsignados
  : [];
const yo = usuarios.find((u) => u.id === CURRENT_USER_ID);

// 2) Si no estás asignado a esta factura, no puedes marcar
if (!yo) {
  showPopup({
    imageType: "error",
    title: "No estás asignado a esta factura",
    description: "Solo los usuarios asignados pueden marcar su parte como pagada.",
    buttons: [{ text: "Aceptar", onPress: () => {} }],
  });
  return;
}

// 3) Si tu parte no estaba completada, complétala primero en el modelo
let facturaActualizada = factura;
if (!yo.completed) {
  facturaActualizada = facturaActualizada.withUserCompleted(CURRENT_USER_ID, true);

  // Persistir actualización en estado
  setFacturas((prev) =>
    prev.map((f) => (f.IdFactura === id ? facturaActualizada : f))
  );
}

// 4) Re-evaluar si ahora todos han completado su parte
if (!facturaActualizada.canMarkPaid()) {
  // Todavía falta alguien -> popup informativo (no marcamos Pagado aún)
  const restantes = (facturaActualizada.UsuariosAsignados ?? []).filter((u) => !u.completed);
  const nombresRestantes = restantes.map((u) => u.name).join(", ");
  showPopup({
    imageType: "success", // puedes usar "error" si prefieres
    title: "Has marcado tu parte como pagada",
    description: restantes.length > 0 ? `Faltan por pagar: ${nombresRestantes}.` : undefined,
    buttons: [{ text: "Aceptar", onPress: () => {} }],
  });
  return;
}

// 5) ✅ Todos completos -> marcar como Pagada + popup happy
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

  // -------------------------
  // Navegación a editar (desde Detalle)
  // -------------------------
  const handleEditTask = (task: TaskModel) => {
    const normalized = normalizeTaskForEdit(task);
    navigation.navigate("CreateTask", {
      taskToEdit: normalized,
      onSave: (updatedTaskData: any) => {
        updateTaskInState(updatedTaskData);
      },
    });
    closeDetalle();
  };

  const handleEditFactura = (factura: FacturaModel) => {
    const normalized = normalizeFacturaForEdit(factura);
    navigation.navigate("CreateFactura", {
      facturaToEdit: normalized,
      onSave: (updatedFacturaData: any) => {
        updateFacturaInState(updatedFacturaData);
      },
    });
    closeDetalle();
  };

  // -------------------------
  // Listas y filtros
  // -------------------------
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
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const isOverdue = (it: TaskModel) => {
      const d = new Date(it.FechaLimite);
      const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return dStart.getTime() < todayStart.getTime();
    };

    const allPending = (currentItems as TaskModel[]).filter((i) => !isDone(i));
    const assignedPending = allPending.filter((i) => i.usuarioAsignado);
    const allUnassignedPending = allPending.filter((i) => !i.usuarioAsignado);

    overdueItems = assignedPending.filter(isOverdue);
    const onTimePending = assignedPending.filter((i) => !isOverdue(i));

    pendingItems = onTimePending.filter((item) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "today") return item.isDueToday();
      if (selectedFilter === "week") return item.isDueWithinDays(7);
      return true;
    });

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

      pendingItems = [...pendingItems, ...unassignedPendingItems];
      overdueItems = [...overdueItems, ...unassignedOverdueItems];
    }

    completedItems = (currentItems as TaskModel[]).filter((i) => {
      return (
        isDone(i) &&
        (typeof (i as any).isCompletedWithinDays === "function"
          ? (i as any).isCompletedWithinDays(7)
          : true)
      );
    });
  } else {
    // FACTURAS: pendientes vs pagadas
    pendingItems = currentItems.filter((i: any) => !isDone(i));
    completedItems = currentItems.filter((i: any) => isDone(i));
  }

  // -------------------------
  // Helpers para facturas
  // -------------------------
  const fmtEUR = (n: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(n || 0);

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
        {/* Filtro solo para tareas */}
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
          {/* PENDIENTES */}
          <Desplegable
            title="Pendientes"
            fontSize={SIZES.text16}
            fontWeight="bold"
            defaultOpen={true}
          >
            {pendingItems.map((item: any) => {
              if (activeTab === "tareas") {
                const task = item as TaskModel;
                return (
                  <TaskItem
                    key={task.id}
                    variant="tarea"
                    time={
                      typeof (task as any).formattedTime === "function"
                        ? task.formattedTime()
                        : undefined
                    }
                    fechaLimite={
                      task.FechaLimite
                        ? new Date(task.FechaLimite).toLocaleDateString(
                            "es-ES",
                            { day: "2-digit", month: "2-digit" }
                          )
                        : undefined
                    }
                    title={task.Nombre}
                    isCompleted={task.isCompleted}
                    unassigned={!task.usuarioAsignado}
                    onToggle={() => handleToggleTask(task.id)}
                    onPressRow={() => openDetalleTarea(task)}
                  />
                );
              } else {
                const f = item as FacturaModel;
                const perStr = fmtEUR(f.perPersonPrice());
                return (
                  <TaskItem
                    key={f.IdFactura}
                    variant="factura"
                    dateLabel={f.formattedDate("es-ES")}
                    perPersonPrice={perStr}
                    title={f.Nombre}
                    isCompleted={f.Pagado}
                    paidCount={f.paidUsersCount()}
                    totalAssigned={f.totalUsersCount()}
                    onToggle={() => handleToggleTask(f.IdFactura)}
                    onPressRow={() => openDetalleFactura(f)}
                  />
                );
              }
            })}
          </Desplegable>

          {/* FUERA DE PLAZO (solo tareas) */}
          {activeTab === "tareas" &&
            visibility.showOverdue &&
            overdueItems.length > 0 && (
              <Desplegable
                title="Fuera de plazo"
                fontSize={SIZES.text16}
                fontWeight="bold"
                defaultOpen={true}
              >
                {overdueItems.map((task: TaskModel) => (
                  <TaskItem
                    key={task.id}
                    variant="tarea"
                    time={
                      typeof (task as any).formattedTime === "function"
                        ? task.formattedTime()
                        : undefined
                    }
                    fechaLimite={
                      task.FechaLimite
                        ? new Date(task.FechaLimite).toLocaleDateString(
                            "es-ES",
                            { day: "2-digit", month: "2-digit" }
                          )
                        : undefined
                    }
                    title={task.Nombre}
                    isCompleted={task.isCompleted}
                    unassigned={!task.usuarioAsignado}
                    onToggle={() => handleToggleTask(task.id)}
                    onPressRow={() => openDetalleTarea(task)}
                  />
                ))}
              </Desplegable>
            )}

          {/* COMPLETADAS / PAGADAS */}
          {visibility.showCompleted && (
            <Desplegable
              title={activeTab === "tareas" ? "Completadas" : "Pagadas"}
              fontSize={SIZES.text16}
              fontWeight="bold"
              defaultOpen={true}
            >
              {completedItems.map((item: any) => {
                if (activeTab === "tareas") {
                  const task = item as TaskModel;
                  return (
                    <TaskItem
                      key={task.id}
                      variant="tarea"
                      time={
                        typeof (task as any).formattedTime === "function"
                          ? task.formattedTime()
                          : undefined
                      }
                      fechaLimite={
                        task.FechaLimite
                          ? new Date(task.FechaLimite).toLocaleDateString(
                              "es-ES",
                              { day: "2-digit", month: "2-digit" }
                            )
                          : undefined
                      }
                      title={task.Nombre}
                      isCompleted={task.isCompleted}
                      unassigned={!task.usuarioAsignado}
                      onToggle={() => handleToggleTask(task.id)}
                      onPressRow={() => openDetalleTarea(task)}
                    />
                  );
                } else {
                  const f = item as FacturaModel;
                  const perStr = fmtEUR(f.perPersonPrice());
                  return (
                    <TaskItem
                      key={f.IdFactura}
                      variant="factura"
                      dateLabel={f.formattedDate("es-ES")}
                      perPersonPrice={perStr}
                      title={f.Nombre}
                      isCompleted={f.Pagado}
                      paidCount={f.paidUsersCount()}
                      totalAssigned={f.totalUsersCount()}
                      onToggle={() => handleToggleTask(f.IdFactura)}
                      onPressRow={() => openDetalleFactura(f)}
                    />
                  );
                }
              })}
            </Desplegable>
          )}
        </View>
      </ScrollView>

      {/* Popup global */}
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

      {/* Detalle unificado */}
      {selectedTask && (
        <Detalle
          visible={detalleVisible}
          kind="tarea"
          task={selectedTask}
          onClose={closeDetalle}
          onComplete={() => {
            handleToggleTask(selectedTask.id);
            closeDetalle(); // cierra tras completar
          }}
          onEdit={() => handleEditTask(selectedTask)}
        />
      )}

      {selectedFactura && (
        <Detalle
          visible={detalleVisible}
          kind="factura"
          factura={selectedFactura}
          onClose={closeDetalle}
          onComplete={() => {
            handleToggleTask(selectedFactura.IdFactura);
            closeDetalle(); // cierra tras completar
          }}
          onEdit={() => handleEditFactura(selectedFactura)}
        />
      )}

      <BottomBar />
    </KeyboardAvoidingView>
  );
};

export default DashBoardPersonal;
