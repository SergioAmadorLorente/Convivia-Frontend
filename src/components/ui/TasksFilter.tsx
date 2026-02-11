
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../styles/theme";

interface TasksFilterProps {
  onFilterChange: (filter: "today" | "week" | "all") => void;
  onVisibilityChange: (visibility: {
    showUnassigned: boolean;
    showOverdue: boolean;
    showCompleted: boolean;
  }) => void;
}

const FILTER_OPTIONS = [
  { key: "today", label: "Hoy" },
  { key: "week", label: "Esta semana" },
  { key: "all", label: "Todas" },
] as const;

const SCREEN_HEIGHT = Dimensions.get("window").height;

const TasksFilter: React.FC<TasksFilterProps> = ({
  onFilterChange,
  onVisibilityChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [headerY, setHeaderY] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<"today" | "week" | "all">("today");

  const [showUnassigned, setShowUnassigned] = useState(true);
  const [showOverdue, setShowOverdue] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
    e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
      setHeaderY(pageY);
    });
  };

  const handleFilterSelect = (filter: "today" | "week" | "all") => {
    setSelectedFilter(filter);
    onFilterChange(filter);
  };

  const handleVisibilityChange = (key: "unassigned" | "overdue" | "completed") => {
    let newUnassigned = showUnassigned;
    let newOverdue = showOverdue;
    let newCompleted = showCompleted;

    if (key === "unassigned") newUnassigned = !showUnassigned;
    if (key === "overdue") newOverdue = !showOverdue;
    if (key === "completed") newCompleted = !showCompleted;

    setShowUnassigned(newUnassigned);
    setShowOverdue(newOverdue);
    setShowCompleted(newCompleted);

    onVisibilityChange({
      showUnassigned: newUnassigned,
      showOverdue: newOverdue,
      showCompleted: newCompleted,
    });
  };

  return (
    <View style={styles.wrapper}>
      {/* Cabecera compacta del desplegable */}
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setIsOpen(!isOpen)}
        onLayout={handleHeaderLayout}
        accessibilityRole="button"
        accessibilityLabel="Abrir filtros"
      >
        <Text style={styles.dropdownTitle}>Filtrar</Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.secondary}
        />
      </TouchableOpacity>

      {/* Modal para cerrar al tocar fuera */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.dropdownContent, { top: headerY + headerHeight, marginHorizontal: 15 }]}>
                {/* CUÁNDO — 3 botones compactos */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Cuándo</Text>
                  <View style={styles.filterRow}>
                    {FILTER_OPTIONS.map((item, idx) => {
                      const active = item.key === selectedFilter;
                      return (
                        <TouchableOpacity
                          key={item.key}
                          onPress={() => handleFilterSelect(item.key)}
                          style={[
                            styles.filterButton,
                            active && styles.filterButtonActive,
                            idx < FILTER_OPTIONS.length - 1 && styles.filterButtonGap,
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                        >
                          <Text
                            style={[
                              styles.filterButtonText,
                              active && styles.filterButtonTextActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Divider compacto */}
                <View style={styles.divider} />

                {/* MOSTRAR — checkboxes compactos */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Mostrar</Text>
                  <View style={styles.checkboxGroup}>
                    {[
                      { key: "unassigned", label: "Tareas sin asignar", value: showUnassigned },
                      { key: "overdue", label: "Fuera de plazo", value: showOverdue },
                      { key: "completed", label: "Completadas", value: showCompleted },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        style={styles.checkboxItem}
                        onPress={() =>
                          handleVisibilityChange(option.key as "unassigned" | "overdue" | "completed")
                        }
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: option.value }}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <View style={[styles.checkboxTouchArea, { marginTop: 0 }]}>
                          <Feather
                            name={option.value ? "check-square" : "square"}
                            size={18} // un poquito más grande
                            color={COLORS.secondary}
                          />
                        </View>
                        <Text style={styles.checkboxLabel}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 15,
    borderRadius: 12,
    // IMPORTANTE: que el overlay pueda salir fuera del wrapper
    overflow: "visible",
    position: "relative",
    zIndex: 100,
  },

  // Header más compacto
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10, // antes 14
    paddingHorizontal: 12, // antes 15
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 11,
    position: "relative",
  },
  dropdownTitle: {
    fontSize: 15, // antes 16
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },

  // Overlay del modal para cerrar al tocar fuera
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-start",
  },

  // Backdrop para cerrar al tocar fuera
  backdrop: {
    position: "absolute",
    left: -9999,
    right: -9999,
    backgroundColor: "rgba(0,0,0,0)",
    zIndex: 9,
  },

  // Panel del dropdown overlay
  dropdownContent: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 12,  // antes 15
    paddingVertical: 10,    // antes 12
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary + "15",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 10,
  },

  // Secciones compactas
  section: {
    marginBottom: 6, // antes 8
  },
  sectionLabel: {
    fontSize: 13, // antes 14
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginBottom: 6, // antes 8
    marginLeft: 2,   // antes 4
  },

  // Fila de filtros (3 botones)
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterButton: {
    flex: 1,
    height: 36, // más compacto que 45
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10, // más compacto que 14
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.secondary + "20",
  },
  filterButtonGap: {
    marginRight: 8, // separación entre botones
  },
  filterButtonActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  filterButtonText: {
    fontSize: 13, // más compacto que 16
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  filterButtonTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },

  // Divider compacto
  divider: {
    height: 1,
    backgroundColor: COLORS.secondary + "15",
    marginVertical: 6, // antes 8
  },

  // Checkboxes compactos
  checkboxGroup: {
    paddingLeft: 2, // antes 8
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6, // antes 8
  },
  checkboxTouchArea: {
    padding: 2,
    borderRadius: 999,
  },
  checkboxLabel: {
    fontSize: 12.5, // un pelín más compacto
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    marginLeft: 8,
    lineHeight: 19, // con icono 18 se alinea bien
  },
});

export default TasksFilter;