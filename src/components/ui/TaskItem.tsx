
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS, CHECKBOX } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';

type Variant = "tarea" | "factura";

interface TaskItemProps {
  /** 'tarea' por defecto; 'factura' para facturas */
  variant?: Variant;

  /** Tarea: hora (HH:MM) y opcional fecha (dd/mm); Factura: usar dateLabel */
  time?: string;
  fechaLimite?: string; // dd/mm en tareas
  /** Factura: fecha en dd/mm */
  dateLabel?: string;
  /** Factura: precio por persona, ya formateado (ej: "32,50 €") */
  perPersonPrice?: string;

  title: string;
  subtitle?: string;

  /** Estado: completado/pagado */
  isCompleted: boolean;

  /** Toggle checkbox (para tareas, o toggle rápido en facturas si onQuickToggle no está definido) */
  onToggle: () => void;

  /** (Opcional) Callback para toggle rápido sin abrir detalle (principalmente para facturas) */
  onQuickToggle?: () => void;

  /** Tarea: si está sin asignar, muestra icono + tooltip */
  unassigned?: boolean;

  /** Abrir detalle al pulsar fila */
  onPressRow?: () => void;

  /** Factura: contador "pagados/total" para el lado derecho (ej: 3/4) */
  paidCount?: number;
  totalAssigned?: number;
}

const TaskItem: React.FC<TaskItemProps> = ({
  variant = "tarea",
  time,
  fechaLimite,
  dateLabel,
  perPersonPrice,
  title,
  subtitle,
  isCompleted,
  onToggle,
  onQuickToggle,
  unassigned = false,
  onPressRow,
  paidCount,
  totalAssigned,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const toggleTooltip = () => setShowTooltip(prev => !prev);
  const { t } = useTranslation();

  const isFactura = variant === "factura";
  const counterText =
    typeof paidCount === "number" && typeof totalAssigned === "number"
      ? `${paidCount}/${totalAssigned}`
      : undefined;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isFactura && isCompleted && styles.completedContainer
      ]}
      activeOpacity={0.9}
      onPress={onPressRow}
    >
      {/* IZQUIERDA */}
      {!isFactura ? (
        // ---- TAREA: Hora + (opcional) Fecha ----
        <View style={styles.leftTaskCol}>
          {/* {time ? <Text style={styles.timeText}>{time}</Text> : null} */}
          {fechaLimite ? <Text style={styles.dateText}>{fechaLimite}</Text> : null}
        </View>
      ) : (
        // ---- FACTURA: Fecha (dd/mm) + Precio por persona debajo ----
        <View style={styles.leftInvoiceCol}>
          {dateLabel ? <Text style={styles.dateText}>{dateLabel}</Text> : null}
          {perPersonPrice ? (
            <Text style={styles.perPersonText}>{perPersonPrice}</Text>
          ) : null}
        </View>
      )}

      {/* CENTRO: Título + subtítulo */}
      <View style={styles.contentContainer}>
        <Text style={[styles.title, isCompleted && styles.completedText]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* DERECHA: (Factura) contador + checkbox */}
      {isFactura && counterText && (
        <View style={styles.counterBox}>
          <Text style={styles.counterText}>{counterText}</Text>
        </View>
      )}

      {/* Icono de exclamación SOLO en tareas sin asignar */}
      {!isFactura && unassigned && (
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

          {showTooltip && (
            <View style={styles.tooltip}>
              <Text
                style={styles.tooltipText}
                numberOfLines={1}
                ellipsizeMode="clip"
              >
                {t("createTask.popups.unassigned.title")}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Checkbox (tarea o factura) */}
      <TouchableOpacity
        onPress={isFactura && onQuickToggle ? onQuickToggle : onToggle}
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
  completedContainer: {
    backgroundColor: "#F5F5F5",
    opacity: 0.7,
  },

  // --- IZQUIERDA TAREA ---
  leftTaskCol: {
    marginRight: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },

  // --- IZQUIERDA FACTURA ---
  leftInvoiceCol: {
    marginRight: 14,
    flexDirection: "column",
    alignItems: "flex-start",
    minWidth: 72,
  },
  perPersonText: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: FONTS.bold,
  },

  // --- CENTRO ---
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

  // --- DERECHA FACTURA: contador ---
  counterBox: {
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#E5ECE1",
  },
  counterText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
  },

  // --- Tooltip tarea sin asignar ---
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
    bottom: 28,
    right: 0,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
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
