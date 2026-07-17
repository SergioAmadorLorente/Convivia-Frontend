import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { COLORS, FONTS, CHECKBOX } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";

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

  // -- Variables de Animación --
  const scale = useSharedValue(1);
  const checkboxScale = useSharedValue(isCompleted ? 1 : 0);
  const checkboxBgColor = useSharedValue(isCompleted ? 1 : 0);
  const isTogglingRef = useRef(false);

  // Sincronizar shared values si el estado cambia externamente (incluido tras aceptar modales)
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      checkboxScale.value = isCompleted ? 1 : 0;
      checkboxBgColor.value = isCompleted ? 1 : 0;
      return;
    }

    // Si cambia de estado (por ejemplo, al aceptar un modal de desmarcar o pago de factura)
    checkboxScale.value = withSpring(isCompleted ? 1 : 0, { damping: 12, stiffness: 150, reduceMotion: ReduceMotion.Never });
    checkboxBgColor.value = withTiming(isCompleted ? 1 : 0, { duration: 200, reduceMotion: ReduceMotion.Never });

    // Efecto "pop" en la tarjeta
    scale.value = withSpring(1.03, { damping: 10, stiffness: 200, reduceMotion: ReduceMotion.Never }, () => {
      scale.value = withSpring(1, { reduceMotion: ReduceMotion.Never });
    });
  }, [isCompleted]);

  const handlePressCheckbox = () => {
    console.log("[TaskItem] Checkbox pressed! isCompleted:", isCompleted, "title:", title, "variant:", variant);
    if (isTogglingRef.current) return;

    if (!isCompleted) {
      if (isFactura) {
        // Factura: tiene modal de confirmación antes de marcar como pagada.
        // Llamamos al callback inmediatamente para que abra el modal.
        // La animación se ejecutará en el useEffect tras confirmar (aceptar) el modal.
        if (onQuickToggle) {
          onQuickToggle();
        } else {
          onToggle();
        }
      } else {
        // Tarea: marcando como completada (optimista, no tiene modal de confirmación).
        // Animamos localmente de inmediato para feedback instantáneo en "Pendientes".
        isTogglingRef.current = true;

        checkboxScale.value = withSpring(1, { damping: 12, stiffness: 150, reduceMotion: ReduceMotion.Never });
        checkboxBgColor.value = withTiming(1, { duration: 150, reduceMotion: ReduceMotion.Never });

        scale.value = withSpring(1.03, { damping: 10, stiffness: 200, reduceMotion: ReduceMotion.Never }, () => {
          scale.value = withSpring(1, { reduceMotion: ReduceMotion.Never });
        });

        // Esperar 400ms a que termine el feedback y luego hacer la transición
        setTimeout(() => {
          onToggle();
          isTogglingRef.current = false;
        }, 400);
      }
    } else {
      // Desmarcando (tarea o factura): requiere confirmación por modal.
      // Llamamos de inmediato al callback para que muestre el modal.
      // Si el usuario acepta, se actualizará el estado y el useEffect animará de vuelta a desmarcado.
      if (isFactura && onQuickToggle) {
        onQuickToggle();
      } else {
        onToggle();
      }
    }
  };

  // -- Estilos Animados --
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const checkboxAnimatedStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      checkboxBgColor.value,
      [0, 1],
      ["transparent", COLORS.accent]
    );
    const borderColor = interpolateColor(
      checkboxBgColor.value,
      [0, 1],
      [COLORS.secondary, COLORS.accent]
    );
    return {
      backgroundColor: bgColor,
      borderColor: borderColor,
    };
  });

  const checkmarkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkboxScale.value }],
      opacity: checkboxScale.value,
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.duration(450).springify().damping(15).reduceMotion(ReduceMotion.Never)}
      exiting={FadeOut.duration(300).reduceMotion(ReduceMotion.Never)}
      layout={LinearTransition.springify().damping(15).mass(0.8).reduceMotion(ReduceMotion.Never)}
    >
      <Animated.View style={cardAnimatedStyle}>
        <View
          style={[
            styles.container,
            isFactura && isCompleted && styles.completedContainer
          ]}
        >
          <TouchableOpacity
            style={styles.touchableContent}
            activeOpacity={0.9}
            onPress={onPressRow}
          >
            <View style={styles.rowBody}>
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
                <Text style={[styles.title, isCompleted && styles.completedText]} numberOfLines={2}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              {/* DERECHA: (Factura) contador */}
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
            </View>
          </TouchableOpacity>

          {/* Checkbox Animado (Hermano de touchableContent, no hijo) - Oculto en facturas */}
          {!isFactura && (
            <TouchableOpacity
              onPress={handlePressCheckbox}
              activeOpacity={0.8}
              style={CHECKBOX.touchArea}
            >
              <Animated.View style={[styles.customCheckbox, checkboxAnimatedStyle]}>
                <Animated.View style={checkmarkAnimatedStyle}>
                  <Feather
                    name="check"
                    size={14}
                    color="#FFF"
                  />
                </Animated.View>
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Animated.View>
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#EAE9E6",
      },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
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
    minWidth: 58,
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

  // --- Checkbox Personalizado ---
  customCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  touchableContent: {
    flex: 1,
  },
  rowBody: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
});

export default TaskItem;

