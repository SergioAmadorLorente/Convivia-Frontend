import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Pressable,
  ViewStyle,
} from "react-native";
import GLOBAL_STYLES from "../../styles/styles";
import { COLORS, FONTS, SIZES, COMMON, HELPERS } from "../../styles/theme";
import type { TaskModel } from "../../types/Task";

type DetalleTareaProps = {
  visible: boolean;
  task: TaskModel;
  onClose: () => void;
  /** Ejecuta la misma lógica que completar desde dashboard */
  onComplete: () => void;
  /** De momento NO funcional (stub) */
  onEdit?: () => void;
  /** De momento NO funcional (stub) */
  onAssignFactura?: () => void;
  /** De momento NO funcional (stub) */
  onAssignUser?: () => void;
};

const weekLabels = ["L", "M", "X", "J", "V", "S", "D"];

/** Detecta si DiasRepeticion contiene letras (L..D) o números (1..7) */
function isDaySelected(task: TaskModel, idx0: number): boolean {
  const rep: any[] = (task as any).DiasRepeticion || [];
  if (!Array.isArray(rep) || rep.length === 0) return false;

  const letter = weekLabels[idx0]; // L M X J V S D
  if (typeof rep[0] === "string") return rep.includes(letter);
  if (typeof rep[0] === "number") return rep.includes(idx0 + 1); // 1=Lunes .. 7=Domingo
  return false;
}

const DetalleTarea: React.FC<DetalleTareaProps> = ({
  visible,
  task,
  onClose,
  onComplete,
  onEdit,
  onAssignFactura,
  onAssignUser,
}) => {
  const fechaStr = useMemo(() => {
    if (!task.FechaLimite) return "-";
    try {
      const d = new Date(task.FechaLimite);
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
      };
      const base = d.toLocaleDateString("es-ES", options);
      return base.charAt(0).toUpperCase() + base.slice(1);
    } catch {
      return "-";
    }
  }, [task.FechaLimite]);

  const horaStr = useMemo(() => {
    if (task.HoraLimite) return task.HoraLimite;
    if (!task.FechaLimite) return "--:--";
    const d = new Date(task.FechaLimite);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }, [task.HoraLimite, task.FechaLimite]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* ✅ Cierra al pulsar fuera del modal */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Hoja inferior (bottom sheet) */}
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header: título, subtítulo y pill de puntos */}
          <View style={styles.headerBlock}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{task.Nombre}</Text>
              {task.Descripcion ? (
                <Text style={styles.subtitle}>{task.Descripcion}</Text>
              ) : null}
            </View>

            <View style={styles.pointsPill}>
              <Text style={styles.pointsText}>{task.karma ?? 0} Puntos</Text>
            </View>
          </View>

          {/* Fecha y hora límite */}
          <View style={styles.section}>
            <Text style={[GLOBAL_STYLES.labelBase, styles.sectionLabel]}>
              Fecha y hora límite
            </Text>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{fechaStr}</Text>
              <Text style={styles.timeText}>{horaStr}</Text>
            </View>
          </View>

          {/* Repetición de la tarea */}
          <View style={styles.section}>
            <Text style={[GLOBAL_STYLES.labelBase, styles.sectionLabel]}>
              Repetición de la tarea
            </Text>
            <View style={styles.weekRow}>
              {weekLabels.map((l, idx) => {
                const selected = isDaySelected(task, idx);
                return (
                  <View
                    key={l}
                    style={[
                      styles.dayChip,
                      selected
                        ? styles.dayChipSelected
                        : styles.dayChipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        selected
                          ? styles.dayChipTextSelected
                          : styles.dayChipTextUnselected,
                      ]}
                    >
                      {l}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Usuario asignado */}
          <View style={styles.section}>
            <Text style={[GLOBAL_STYLES.labelBase, styles.sectionLabel]}>
              Usuario asignado
            </Text>
            <TextInput
              editable={false}
              value={task.usuarioAsignado ?? ""}
              placeholder="Usuarios asignados"
              placeholderTextColor={COLORS.border}
              style={styles.input}
            />
          </View>

          {/* Botón: Asignar una factura */}
          <TouchableOpacity
            style={[GLOBAL_STYLES.buttonSecondaryGrey, styles.fullBtn]}
            activeOpacity={0.85}
            onPress={onAssignFactura ?? (() => {})}
          >
            <Text style={GLOBAL_STYLES.textoBoton}>Asignar una factura</Text>
          </TouchableOpacity>

          {/* Botones: Editar + Completar */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                GLOBAL_STYLES.buttonSecondaryGrey,
                styles.btnHalf,
                { marginRight: HELPERS.wp("2%") },
              ]}
              activeOpacity={0.85}
              onPress={onEdit ?? (() => {})}
            >
              <Text style={GLOBAL_STYLES.textoBoton}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                GLOBAL_STYLES.buttonPrimaryGreen,
                styles.btnHalf,
                { marginLeft: HELPERS.wp("2%") },
              ]}
              activeOpacity={0.9}
              onPress={onComplete}
            >
              <Text style={GLOBAL_STYLES.textoBoton}>
                {task.isCompleted ? "Desmarcar" : "Completar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ✅ Estilos reutilizando tema y ajustando lo imprescindible
const styles = StyleSheet.create({
  overlay: {
    ...(COMMON.OVERLAY as ViewStyle),
    justifyContent: "flex-end", // bottom sheet
  },

  sheet: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: HELPERS.moderateScale(25),
    borderTopRightRadius: HELPERS.moderateScale(25),
    paddingHorizontal: HELPERS.wp("5%"),
    paddingBottom: HELPERS.verticalScale(18),
    paddingTop: HELPERS.verticalScale(10),
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: HELPERS.verticalScale(8),
  },

  headerBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: HELPERS.verticalScale(4),
  },

  title: {
    fontSize: SIZES.welcomeTitle, // similar al mock
    color: COLORS.secondary,
    fontFamily: FONTS.title,
  },
  subtitle: {
    marginTop: HELPERS.verticalScale(4),
    fontSize: SIZES.subtitle,
    color: COLORS.secondary,
    opacity: 0.7,
    fontFamily: FONTS.regular,
  },

  pointsPill: {
    backgroundColor: COLORS.success,
    borderRadius: HELPERS.moderateScale(12),
    paddingHorizontal: HELPERS.wp("2.5%"),
    paddingVertical: HELPERS.verticalScale(6),
    marginLeft: HELPERS.wp("3%"),
  },
  pointsText: {
    fontSize: SIZES.smallText,
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
  },

  section: {
    marginTop: HELPERS.hp("2%"),
    width: "100%",
  },
  sectionLabel: {
    // Reutilizamos valores base, pero sobrescribimos lo necesario:
    fontFamily: FONTS.title,
    fontSize: SIZES.text16,
    color: COLORS.primary,
    marginBottom: HELPERS.hp("1%"),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    paddingBottom: HELPERS.verticalScale(4),
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: SIZES.text16,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
  },
  timeText: {
    fontSize: HELPERS.moderateScale(24),
    color: COLORS.secondary,
  },

  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: HELPERS.verticalScale(6),
  },
  dayChip: {
    paddingVertical: HELPERS.verticalScale(8),
    paddingHorizontal: HELPERS.moderateScale(12),
    borderRadius: HELPERS.moderateScale(12),
    minWidth: HELPERS.moderateScale(36),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8E5D3",
  },
  dayChipSelected: {
    backgroundColor: COLORS.success,
  },
  dayChipUnselected: {
    backgroundColor: "transparent",
  },
  dayChipText: {
    fontSize: SIZES.text14,
    fontFamily: FONTS.bold,
  },
  dayChipTextSelected: {
    color: "#3E5639",
  },
  dayChipTextUnselected: {
    color: COLORS.secondary,
    opacity: 0.65,
  },

  input: {
    ...(COMMON.INPUT_BASE as any),
    width: "100%",
  },

  fullBtn: {
    width: "100%",
    alignSelf: "center",
    marginTop: HELPERS.hp("2%"),
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: HELPERS.hp("2%"),
    width: "100%",
    justifyContent: "space-between",
  },
  btnHalf: {
    width: "48%",
    alignSelf: "auto",
    marginTop: 0,
  },
});

export default DetalleTarea;
