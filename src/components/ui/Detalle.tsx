import React, { useMemo } from "react";
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
    residenciaName: string;
    onClose: () => void;
    onEliminar: () => void;
  };

const Detalle: React.FC<Props> = (props) => {
  const { visible, onClose } = props;

  // ---- PARTICIPANTE ----
  if (props.kind === "participante") {
    const { participant, residenciaName, onEliminar } = props;

    // Datos de ejemplo - aquí deberías obtener los datos reales del usuario
    const karmaPoints = 290;
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
                <Text style={styles.title}>
                  {participant?.nombre || participant?.email || "Usuario"}
                </Text>
                <Text style={styles.subtitle}>{residenciaName}</Text>
              </View>
            </View>

            {/* Puntos de Karma */}
            <View style={styles.section}>
              <View style={styles.karmaContainer}>
                <Text style={styles.karmaPoints}>¡{karmaPoints} puntos!</Text>
                <Text style={styles.karmaLabel}>de karma</Text>
              </View>
            </View>

            {/* Gráfico de Tareas */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Tareas completas y fuera de plazo
              </Text>

              <View style={styles.chartContainer}>
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

            {/* Usuario info adicional */}
            {participant?.email && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Correo electrónico</Text>
                <TextInput
                  editable={false}
                  value={participant.email}
                  style={styles.input}
                />
              </View>
            )}

            {/* Botón Eliminar */}
            <TouchableOpacity
              style={[GLOBAL_STYLES.buttonSecondaryGrey, styles.deleteButtonFull]}
              activeOpacity={0.85}
              onPress={onEliminar}
            >
              <Text
                style={[GLOBAL_STYLES.textoBoton, { color: COLORS.error }]}
              >
                Eliminar de la residencia
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (props.kind === "tarea") {
    const { task, onComplete, onEdit, onDelete } = props;

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
    const isDaySelected = (idx0: number) => {
      // Backend: Lunes=0 ... Domingo=6
      return Array.isArray(task.DiasRepeticion) && task.DiasRepeticion.includes(idx0);
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
              <Text style={styles.sectionLabel}>Usuario asignado</Text>
              <TextInput
                editable={false}
                value={task.usuarioAsignado ?? ""}
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
    marginBottom: HELPERS.verticalScale(6),
  },
  title: {
    fontSize: SIZES.welcomeTitle,
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

  section: {
    marginTop: HELPERS.hp("2%"),
    width: "100%",
  },
  sectionLabel: {
    fontFamily: FONTS.title,
    fontSize: SIZES.label,
    color: COLORS.secondary,
    opacity: 1,
    marginBottom: HELPERS.hp("1%"),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    paddingBottom: HELPERS.verticalScale(4),
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
    paddingVertical: HELPERS.verticalScale(15),
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
    marginTop: HELPERS.verticalScale(10),
  },
  donutChart: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: HELPERS.verticalScale(20),
    position: "relative",
    backgroundColor: "#E6ECDC",
  },
  donutSegment: {
    width: 140,
    height: 140,
    borderRadius: 70,
    position: "absolute",
    backgroundColor: "#4A5942",
  },
  donutHole: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.background,
    position: "absolute",
    top: 25,
    left: 25,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: HELPERS.wp("5%"),
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
    width: "100%",
  },
});

export default Detalle;
