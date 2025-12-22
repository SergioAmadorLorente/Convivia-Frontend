
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS, CHECKBOX } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";

interface TaskItemProps {
  time: string;
  title: string;
  subtitle?: string;
  isCompleted: boolean;
  onToggle: () => void;
  fechaLimite?: string; // formato dd/mm
  unassigned?: boolean; // indica si la tarea está sin asignar
  /** Abrir detalles al pulsar la fila (solo tareas) */
  onPressRow?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  time,
  title,
  subtitle,
  isCompleted,
  onToggle,
  fechaLimite,
  unassigned = false,
  onPressRow,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleTooltip = () => setShowTooltip(prev => !prev);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPressRow}
    >
      {/* Hora y fecha */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{time}</Text>
        {fechaLimite && <Text style={styles.dateText}>{fechaLimite}</Text>}
      </View>

      {/* Título + (opcional) subtítulo */}
      <View style={styles.contentContainer}>
        <Text style={[styles.title, isCompleted && styles.completedText]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {/* Icono de exclamación si está sin asignar (no se usa en facturas) */}
      {unassigned && (
        <View style={styles.unassignedIconContainer}>
          <TouchableOpacity
            onPress={toggleTooltip}
            activeOpacity={0.8}
            style={CHECKBOX.touchArea}
          >
            <Feather
              name="alert-circle"
              size={CHECKBOX.iconSize}
              color={COLORS.accent}
            />
          </TouchableOpacity>

          {/* Tooltip estilo anterior: sin flecha y un poco arriba */}
          {showTooltip && (
            <View style={styles.tooltip}>
              <Text
                style={styles.tooltipText}
                numberOfLines={1}
                ellipsizeMode="clip"
              >
                Sin asignar
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Checkbox */}
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={CHECKBOX.touchArea}
      >
        <Feather
          name={isCompleted ? "check-square" : "square"}
          size={CHECKBOX.iconSize}
          color={
            isCompleted
              ? CHECKBOX.colors.checked
              : CHECKBOX.colors.unchecked
          }
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeContainer: {
    marginRight: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    marginRight: 8, // evitamos 'gap'
  },
  dateText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: COLORS.border,
  },

  // Tooltip relativo al icono (sin flecha, arriba)
  unassignedIconContainer: {
    marginRight: 8,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    position: "absolute",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    bottom: 28,     // un poco arriba del icono (como te gustaba)
    right: 0,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,

    // Ajustes para evitar “texto vertical”
    minWidth: 88,
    maxWidth: 220,
    alignItems: "center",
  },
  tooltipText: {
    fontSize: 12,
    color: COLORS.background,
    fontFamily: FONTS.regular,
    textAlign: "center",
    lineHeight: 16,
    flexShrink: 0,
    // @ts-ignore
    writingDirection: "ltr",
  },
});

export default TaskItem;
``
