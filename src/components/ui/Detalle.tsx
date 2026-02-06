import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import GLOBAL_STYLES from "../../styles/styles";
import { COLORS, FONTS, SIZES, COMMON, HELPERS } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";
import TaskModel from "../../types/Task"; // export default
import FacturaModel, { IFacturaUser } from "../../types/Factura";

type Props =
  | {
    visible: boolean;
    kind: "tarea";
    task: TaskModel;
    onClose: () => void;
    onComplete: () => void; // misma lógica que en dashboard
    onEdit: () => void;
    onDelete: () => void;
  }
  | {
    visible: boolean;
    kind: "factura";
    factura: FacturaModel;
    onClose: () => void;
    onComplete: () => void; // marcar como pagada (dashboard valida)
    onEdit: () => void;
    onDelete: () => void;
    onDownloadImage?: () => void;
  }
  | {
    visible: boolean;
    kind: "participante";
    participant: any;
    participantRelacion?: any;
    residenciaName: string;
    onClose: () => void;
    onEliminar: () => void;
    isCurrentUser?: boolean;
  };

const Detalle: React.FC<Props> = (props) => {
  const { visible, onClose } = props;

  // ---- PARTICIPANTE ----
  if (props.kind === "participante") {
    const { participant, participantRelacion, residenciaName, onEliminar, isCurrentUser = false } = props;

    // Obtener karma real de la relación usuarioEspacio
    const karmaPoints = participantRelacion?.karma ?? 0;
    const tareasCompletadas = 65; // porcentaje
    const tareasFueraPlazo = 35; // porcentaje

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.headerBlock}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: '#6B705C' }]}>
                  {participant?.nombre || participant?.email || "Usuario"}
                </Text>
                <Text style={[styles.subtitle, { color: '#ACBF8A' }]}>{residenciaName}</Text>
              </View>
            </View>

            {/* Puntos de Karma */}
            <View style={styles.section}>
              <View style={[styles.karmaContainer, { paddingVertical: HELPERS.verticalScale(8) }]}>
                <Text style={styles.karmaPoints}>¡{karmaPoints} puntos!</Text>
                <Text style={styles.karmaLabel}>de karma</Text>
              </View>
            </View>

            {/* Gráfico de Tareas */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: '#6B705C' }]}>
                Tareas completas y fuera de plazo
              </Text>

              <View style={[styles.chartContainer, { marginTop: HELPERS.verticalScale(5) }]}>
                <View style={styles.donutChart}>
                  <View style={styles.donutSegment} />
                  <View style={styles.donutHole} />
                </View>

                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#4A5942" }]} />
                    <Text style={styles.legendText}>Fuera de plazo</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#E6ECDC" }]} />
                    <Text style={styles.legendText}>Completadas</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Botón Eliminar */}
            <TouchableOpacity
              style={[
                GLOBAL_STYLES.buttonSecondaryGrey,
                styles.deleteButtonFull,
                {
                  backgroundColor: isCurrentUser ? '#E5E5E5' : '#D9D9D9',
                  marginTop: HELPERS.hp("1%"),
                  opacity: isCurrentUser ? 0.5 : 1
                }
              ]}
              activeOpacity={0.85}
              onPress={onEliminar}
              disabled={isCurrentUser}
            >
              <Text
                style={[
                  GLOBAL_STYLES.textoBoton,
                  { color: isCurrentUser ? '#999' : COLORS.error }
                ]}
              >
                {isCurrentUser ? 'No puedes eliminarte a ti mismo' : 'Eliminar de la residencia'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (props.kind === "tarea") {
    const { task, onComplete, onEdit, onDelete } = props;
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

    const fechaStr = useMemo(() => {
      if (!task.FechaLimite) return "-";
      try {
        const d = new Date(task.FechaLimite);
        const base = d.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
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

    // ✅ DiasRepeticion es number[] con Lunes=0 .. Domingo=6
    const weekLabels = ["L", "M", "X", "J", "V", "S", "D"];
    const weekFullNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const isDaySelected = (idx0: number) => {
      // Backend: Lunes=0 ... Domingo=6
      return Array.isArray(task.DiasRepeticion) && task.DiasRepeticion.includes(idx0);
    };

    // Obtener usuario asignado para el día seleccionado
    const getAssignedUserForDay = (dayIndex: number | null): string => {
      if (dayIndex === null) {
        return task.usuarioAsignado ?? "";
      }
      // Si hay mapa de usuarios por día, usar ese
      if (task.usuariosPorDia && task.usuariosPorDia[dayIndex]) {
        return task.usuariosPorDia[dayIndex];
      }
      // Sino, usar el usuario general
      return task.usuarioAsignado ?? "";
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          {/* Cerrar al tocar fuera */}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.headerBlock}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{task.Nombre}</Text>
                {task.Descripcion ? (
                  <Text style={styles.subtitle}>{task.Descripcion}</Text>
                ) : null}
              </View>

              {/* Puntos de karma y Botón Eliminar */}
              <View style={{ alignItems: "flex-end", gap: 10 }}>
                <View style={styles.pointsPill}>
                  <Text style={styles.pointsText}>{task.karma ?? 0} Puntos</Text>
                </View>
                <TouchableOpacity
                  onPress={onDelete}
                  activeOpacity={0.7}
                  style={styles.deleteButton}
                >
                  <Feather name="trash-2" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Fecha/Hora */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Fecha y hora límite</Text>
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>{fechaStr}</Text>
                <Text style={styles.timeText}>{horaStr}</Text>
              </View>
            </View>

            {/* Repetición de la tarea */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Repetición de la tarea</Text>
              <View style={styles.weekRow}>
                {weekLabels.map((l, idx) => {
                  const selected = isDaySelected(idx);
                  const isSelected = selectedDayIndex === idx;
                  return (
                    <TouchableOpacity
                      key={l}
                      onPress={() => {
                        if (selected) {
                          setSelectedDayIndex(isSelected ? null : idx);
                        }
                      }}
                      activeOpacity={selected ? 0.7 : 1}
                      style={[
                        styles.dayChip,
                        selected
                          ? styles.dayChipSelected
                          : styles.dayChipUnselected,
                        isSelected && selected && styles.dayChipFocused,
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
                    </TouchableOpacity>
                  );
                })}
              </View>

            </View>

            {/* Usuario asignado */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Usuario asignado</Text>
              <TextInput
                editable={false}
                value={selectedDayIndex !== null && isDaySelected(selectedDayIndex)
                  ? getAssignedUserForDay(selectedDayIndex) || "Sin asignar"
                  : (task.usuarioAsignado ?? "")}
                placeholder="Usuarios asignados"
                placeholderTextColor={COLORS.border}
                style={styles.input}
              />
            </View>

            {/* Botones: Editar + Completar */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  GLOBAL_STYLES.buttonSecondaryGrey,
                  styles.btnHalf,
                  { marginRight: HELPERS.wp("2%") },
                ]}
                activeOpacity={0.85}
                onPress={onEdit}
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
  }

  // ---- FACTURA ----
  const { factura, onComplete, onEdit, onDelete, onDownloadImage } = props;

  const totalImporte = factura.Precio ?? 0;
  const usuarios: IFacturaUser[] = Array.isArray(factura.UsuariosAsignados)
    ? factura.UsuariosAsignados
    : [];
  const pagados = usuarios.filter((u) => u.completed).length;

  const perPerson =
    usuarios.length > 0 ? totalImporte / usuarios.length : totalImporte;
  const fmt = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  });
  const totalStr = fmt.format(totalImporte);
  const perPersonStr = fmt.format(perPerson);

  const fechaCreacionStr = useMemo(() => {
    try {
      return factura.formattedDate("es-ES");
    } catch {
      const d = new Date(factura.FechaCreacion);
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  }, [factura]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.headerBlock}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{factura.Nombre}</Text>
              {factura.Descripcion ? (
                <Text style={styles.subtitle}>{factura.Descripcion}</Text>
              ) : null}
            </View>
          </View>

          {/* Precio total */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Precio total</Text>
            <View style={styles.priceDisplay}>
              <Text style={styles.priceBig}>{totalStr}</Text>
            </View>
          </View>

          {/* Precio por persona */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Precio por persona</Text>
            <View style={styles.priceDisplay}>
              <Text style={styles.priceBig}>{perPersonStr}</Text>
            </View>
          </View>

          {/* Fotos */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Fotos</Text>
            <TouchableOpacity
              style={styles.downloadRow}
              activeOpacity={0.85}
              onPress={onDownloadImage ?? (() => { })}
            >
              <Text style={styles.downloadText}>Descargar imagen</Text>
              <View style={styles.downloadBtn}>
                <Feather name="download" size={16} color={COLORS.secondary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Usuarios asignados */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Usuarios asignados</Text>
            <TextInput
              editable={false}
              value={usuarios.map((u) => u.name).join(", ")}
              placeholder="Usuarios asignados"
              placeholderTextColor={COLORS.border}
              style={styles.input}
            />
          </View>

          {/* Meta: contador y fecha */}
          <View style={styles.metaRow}>
            <View style={styles.counterPill}>
              <Text style={styles.counterPillText}>
                {pagados}/{usuarios.length} pagados
              </Text>
            </View>
            <Text style={styles.metaDate}>Creada: {fechaCreacionStr}</Text>
          </View>

          {/* Botones: Editar + Completar */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                GLOBAL_STYLES.buttonSecondaryGrey,
                styles.btnHalf,
                { marginRight: HELPERS.wp("2%") },
              ]}
              activeOpacity={0.85}
              onPress={onEdit}
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
                {factura.Pagado ? "Desmarcar" : "Completar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    // ✅ reutiliza COMMON.OVERLAY y bottom-sheet
    ...(COMMON.OVERLAY as any),
    justifyContent: "flex-end",
  },

  sheet: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: HELPERS.moderateScale(25),
    borderTopRightRadius: HELPERS.moderateScale(25),
    paddingHorizontal: HELPERS.wp("8%"),
    paddingBottom: HELPERS.verticalScale(18),
    paddingTop: HELPERS.verticalScale(10),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: HELPERS.verticalScale(4),
  },
  headerBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: HELPERS.verticalScale(0),
  },
  title: {
    fontSize: SIZES.welcomeTitle,
    color: COLORS.secondary,
    fontFamily: FONTS.title,
    paddingHorizontal: HELPERS.wp("2%"),
  },
  subtitle: {
    marginTop: HELPERS.verticalScale(4),
    fontSize: SIZES.subtitle,
    color: COLORS.secondary,
    opacity: 0.7,
    fontFamily: FONTS.regular,
    paddingHorizontal: HELPERS.wp("2%"),
  },

  section: {
    marginTop: 0,
    width: "100%",
  },
  sectionLabel: {
    fontFamily: FONTS.title,
    fontSize: SIZES.label,
    color: COLORS.secondary,
    opacity: 1,
    marginBottom: HELPERS.hp("1%"),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#6B705C",
    paddingBottom: HELPERS.verticalScale(4),
    paddingHorizontal: HELPERS.wp("2%"),
  },

  // ---- Tarea: fecha/hora ----

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

  dateRow: {
    flexDirection: "row",
    alignItems: "baseline", // alinea por línea de base
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: SIZES.text16,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    lineHeight: SIZES.text16,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
  timeText: {
    fontSize: HELPERS.moderateScale(28),
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
    lineHeight: HELPERS.moderateScale(28),
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },

  // ---- Tarea: repetición (chips) ----
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
  dayChipFocused: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  daySelectionNote: {
    marginTop: HELPERS.verticalScale(8),
    alignItems: "center",
  },
  daySelectionNoteText: {
    fontSize: SIZES.text14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    opacity: 0.7,
  },

  // ---- Factura: precios ----
  priceDisplay: {
    marginTop: HELPERS.verticalScale(6),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: HELPERS.moderateScale(10),
    paddingVertical: HELPERS.verticalScale(10),
    backgroundColor: COLORS.inputBackground,
  },
  priceBig: {
    fontSize: HELPERS.moderateScale(22),
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
  },

  // ---- Factura: fotos ----
  downloadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: HELPERS.verticalScale(6),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: HELPERS.moderateScale(10),
    paddingVertical: HELPERS.verticalScale(10),
    paddingHorizontal: HELPERS.wp("3%"),
    backgroundColor: COLORS.inputBackground,
  },
  downloadText: {
    fontSize: SIZES.text14,
    color: COLORS.accent,
    fontFamily: FONTS.regular,
    textDecorationLine: "underline",
  },
  downloadBtn: {
    backgroundColor: "#E5ECE1",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  input: {
    ...(COMMON.INPUT_BASE as any),
    width: "100%",
  },

  metaRow: {
    marginTop: HELPERS.hp("1.5%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counterPill: {
    backgroundColor: "#E5ECE1",
    borderRadius: HELPERS.moderateScale(12),
    paddingHorizontal: HELPERS.wp("2.5%"),
    paddingVertical: HELPERS.verticalScale(6),
  },
  counterPillText: {
    fontSize: SIZES.smallText,
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
  },
  metaDate: {
    fontSize: SIZES.text14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
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
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFEBEE",
  },

  // Estilos para participante
  karmaContainer: {
    alignItems: "center",
    paddingVertical: HELPERS.verticalScale(2),
  },
  karmaPoints: {
    fontFamily: FONTS.bold,
    fontSize: HELPERS.moderateScale(32),
    color: "#4A5942",
  },
  karmaLabel: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text16,
    color: COLORS.secondary,
    opacity: 0.7,
  },
  chartContainer: {
    alignItems: "center",
    marginTop: HELPERS.verticalScale(4),
    paddingHorizontal: HELPERS.wp("2%"),
  },
  donutChart: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: HELPERS.verticalScale(12),
    position: "relative",
    backgroundColor: "#E6ECDC",
  },
  donutSegment: {
    width: 180,
    height: 180,
    borderRadius: 90,
    position: "absolute",
    backgroundColor: "#4A5942",
  },
  donutHole: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.background,
    position: "absolute",
    top: 35,
    left: 35,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: HELPERS.wp("2%"),
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text14,
    color: COLORS.secondary,
  },
  deleteButtonFull: {
    marginTop: HELPERS.hp("2%"),
    width: "85%",
    alignSelf: "center",
  },
});

export default Detalle;
