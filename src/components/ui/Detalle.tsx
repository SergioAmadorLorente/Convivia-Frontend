import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  PanResponder,
  Image,
} from "react-native";
import GLOBAL_STYLES from "../../styles/styles";
import { COLORS, FONTS, SIZES, COMMON, HELPERS } from "../../styles/theme";
import { Feather, Ionicons } from "@expo/vector-icons";
import TaskModel from "../../types/Task"; // export default
import FacturaModel, { IFacturaUser } from "../../types/Factura";
import TasksDonutChart from "./TasksDonutChart";
import { obtenerEstadisticasTareas } from "../../api/espacio";
import UploadImage from "./UploadImage";
import { obtenerImagenFactura } from "../../api/factura";
import { obtenerEspacioPorUsuarioId } from "../../api/usuarioEspacio";
import { useAuthListener } from "../../hooks/useAuthListener";
import UserList from "./UserList";
import { useTranslation } from "react-i18next";
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
    isAdmin?: boolean;
  };

const Detalle: React.FC<Props> = (props) => {
  const { visible, onClose } = props;
  const { t, i18n } = useTranslation();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (props.kind !== "factura") return;
        if (gestureState.dx > 40 || gestureState.vx > 0.25) {
          onClose();
        }
      },
      onPanResponderTerminate: () => { },
    })
  ).current;

  if (props.kind === "participante") {
    const { participant, participantRelacion, residenciaName, onEliminar, isCurrentUser = false, isAdmin = true } = props;

    // Obtener karma del participante
    const karmaPoints = participant?.karmaTotal ?? 0;
    const [estadisticas, setEstadisticas] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Cargar estadísticas del participante
    useEffect(() => {
      const cargarEstadisticas = async () => {
        const eId = participantRelacion?.espacioId || participant?.espacioId;
        const targetRelId =
          participantRelacion?.id ||
          participantRelacion?.id_UsuarioEspacio ||
          participantRelacion?.Id ||
          participant?.usuarioEspacioId;
        const targetUserId = participant?.id || participantRelacion?.usuarioId;

        if (eId && (targetRelId || targetUserId)) {
          try {
            setLoadingStats(true);
            let stats: any = null;
            if (targetRelId) {
              try {
                stats = await obtenerEstadisticasTareas(eId, targetRelId);
              } catch (e) {
                // Ignore fallback error
              }
            }
            if ((!stats || (stats.completadas === 0 && stats.pendientes === 0 && stats.tardes === 0)) && targetUserId && targetUserId !== targetRelId) {
              try {
                const statsUser = await obtenerEstadisticasTareas(eId, targetUserId);
                if (statsUser && (statsUser.completadas > 0 || statsUser.tardes > 0 || statsUser.pendientes > 0)) {
                  stats = statsUser;
                }
              } catch {
                // Ignore fallback error
              }
            }
            setEstadisticas(stats);
          } catch (error) {
            setEstadisticas(null);
          } finally {
            setLoadingStats(false);
          }
        }
      };

      if (visible) {
        cargarEstadisticas();
      }
    }, [visible, participantRelacion, participant]);

    const tareasCompletadas = estadisticas?.completadas ?? 0;
    const tareasFueraPlazo = estadisticas?.tardes ?? 0;
    const isAdminUser = participant?.rol?.toLowerCase() === 'admin' || participant?.rol?.toLowerCase() === 'administrador';

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

            {/* Profile Hero Block */}
            <View style={styles.participantHeroContainer}>
              <View style={styles.participantAvatarRing}>
                {participant?.fotoUrl ? (
                  <Image
                    source={{ uri: participant.fotoUrl }}
                    style={styles.participantAvatarImg}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.participantAvatarPlaceholder}>
                    <Feather name="user" size={38} color={COLORS.primary} />
                  </View>
                )}
                {isAdminUser && (
                  <View style={styles.participantAdminBadge}>
                    <Text style={styles.participantAdminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>

              <Text style={styles.participantNameLarge}>
                {participant?.nombre || participant?.email || t('common.user', 'Usuario')}
              </Text>

              <View style={styles.residenciaPill}>
                <Ionicons name="home-outline" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.residenciaPillText}>{residenciaName}</Text>
              </View>
            </View>

            {/* Karma Banner Card */}
            <View style={styles.karmaHeroCard}>
              <View style={styles.karmaIconWrapper}>
                <Ionicons name="sparkles" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.karmaTextContent}>
                <Text style={styles.karmaNumber}>{karmaPoints}</Text>
                <Text style={styles.karmaSubtitle}>{t('myKarma.ofKarma', 'Puntos de Karma')}</Text>
              </View>
              <View style={styles.karmaBadgeRight}>
                <Ionicons name="ribbon-outline" size={24} color={COLORS.primary} />
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.participantStatsRow}>
              <View style={styles.participantStatCard}>
                <View style={styles.statIconSuccess}>
                  <Ionicons name="checkmark-done-circle-outline" size={20} color="#3E5639" />
                </View>
                <View>
                  <Text style={styles.statNumber}>{loadingStats ? "..." : tareasCompletadas}</Text>
                  <Text style={styles.statLabel}>{t('dashboard.stats.completed', 'Completadas')}</Text>
                </View>
              </View>

              <View style={styles.participantStatCard}>
                <View style={styles.statIconDanger}>
                  <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
                </View>
                <View>
                  <Text style={styles.statNumber}>{loadingStats ? "..." : tareasFueraPlazo}</Text>
                  <Text style={styles.statLabel}>{t('dashboard.stats.overdue', 'Fuera de plazo')}</Text>
                </View>
              </View>
            </View>

            {/* Botón Eliminar / Info */}
            {!isCurrentUser && isAdmin ? (
              <TouchableOpacity
                style={styles.deleteParticipantBtn}
                activeOpacity={0.8}
                onPress={onEliminar}
              >
                <Feather name="user-x" size={18} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={styles.deleteParticipantBtnText}>
                  {t('myResidence.removeParticipant')}
                </Text>
              </TouchableOpacity>
            ) : isCurrentUser ? (
              <View style={styles.infoPillContainer}>
                <Ionicons name="person-circle-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.infoPillText}>{t('myResidence.errors.cannotRemoveSelf', 'Este es tu perfil')}</Text>
              </View>
            ) : (
              <View style={styles.infoPillContainer}>
                <Ionicons name="lock-closed-outline" size={16} color="#888" style={{ marginRight: 6 }} />
                <Text style={styles.infoPillText}>{t('myResidence.errors.notAdminToKick', 'Solo administradores pueden expulsar miembros')}</Text>
              </View>
            )}
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
        const base = d.toLocaleDateString(i18n.language === "es" ? "es-ES" : "en-US", {
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

    const weekLabels = ["L", "M", "X", "J", "V", "S", "D"];
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

            {/* Header Block */}
            <View style={styles.headerBlockContainer}>
              <View style={styles.titleRow}>
                <View style={styles.taskIconBadge}>
                  <Ionicons name="clipboard-outline" size={22} color={COLORS.primary} />
                </View>

                <View style={styles.titleTextWrapper}>
                  <Text style={styles.title}>{task.Nombre}</Text>
                  <View style={styles.headerBadgesRow}>
                    <View style={styles.pointsPill}>
                      <Ionicons name="sparkles" size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.pointsText}>{t('taskDetail.pointsPill', { points: task.karma ?? 0 })}</Text>
                    </View>
                    {task.overdue && (
                      <View style={styles.overdueBadge}>
                        <Ionicons name="warning-outline" size={13} color="#DC2626" style={{ marginRight: 3 }} />
                        <Text style={styles.overdueBadgeText}>{t('dashboard.tasks.overdue', 'Vencida')}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onDelete}
                  activeOpacity={0.7}
                  style={styles.deleteIconBtn}
                >
                  <Feather name="trash-2" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>

              {task.Descripcion ? (
                <View style={styles.descriptionBox}>
                  <Text style={styles.subtitle}>{task.Descripcion}</Text>
                </View>
              ) : null}
            </View>

            {/* Fecha/Hora Límite */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>{t('createTask.dateTimeLimit')}</Text>
              </View>
              <View style={[styles.cardBox, task.overdue && styles.cardBoxOverdue]}>
                <View style={styles.dateTimeItem}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.dateText, task.overdue && { color: "#DC2626", fontFamily: FONTS.bold }]}>
                    {fechaStr}
                  </Text>
                </View>
                <View style={styles.dateTimeDivider} />
                <View style={styles.dateTimeItem}>
                  <Ionicons name="time-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.timeText, task.overdue && { color: "#DC2626" }]}>
                    {horaStr}
                  </Text>
                </View>
              </View>
            </View>

            {/* Repetición de la tarea */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>{t('createTask.repeat')}</Text>
              </View>
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
                          isSelected && selected && { color: "#FFF" },
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
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>{t('taskDetail.assignedUser')}</Text>
              </View>
              {(() => {
                const assignedName =
                  selectedDayIndex !== null && isDaySelected(selectedDayIndex)
                    ? getAssignedUserForDay(selectedDayIndex) || null
                    : task.usuarioAsignado || null;
                const assignedId =
                  selectedDayIndex !== null && isDaySelected(selectedDayIndex)
                    ? String(selectedDayIndex)
                    : task.usuarioAsignadoId || task.usuarioAsignado || "";
                const users = assignedName
                  ? [{ id: assignedId, name: assignedName, fotoUrl: task.usuarioAsignadoFotoUrl ?? null }]
                  : [];
                return users.length > 0 ? (
                  <UserList users={users} />
                ) : (
                  <View style={styles.emptyUserCard}>
                    <Ionicons name="person-outline" size={18} color="#999" style={{ marginRight: 8 }} />
                    <Text style={styles.emptyUsersText}>{t('taskDetail.unassigned')}</Text>
                  </View>
                );
              })()}
            </View>

            {/* Botones: Editar + Completar */}
            <View style={styles.actionsRowNew}>
              <TouchableOpacity
                style={styles.btnEditNew}
                activeOpacity={0.8}
                onPress={onEdit}
              >
                <Feather name="edit-3" size={16} color={COLORS.secondary} style={{ marginRight: 6 }} />
                <Text style={styles.btnEditNewText}>{t('taskDetail.edit')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnCompleteNew,
                  task.isCompleted && styles.btnCompleteDone,
                ]}
                activeOpacity={0.85}
                onPress={onComplete}
              >
                <Ionicons
                  name={task.isCompleted ? "refresh-outline" : "checkmark-circle-outline"}
                  size={19}
                  color={task.isCompleted ? COLORS.primary : "#FFF"}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.btnCompleteText, task.isCompleted && styles.btnCompleteDoneText]}>
                  {task.isCompleted ? t('taskDetail.unmark') : t('taskDetail.complete')}
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

  const facturaUser = useAuthListener();
  const [facturaImageUri, setFacturaImageUri] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [userRelacionId, setUserRelacionId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !facturaUser?.uid) return;
    setFacturaImageUri(null);
    setLoadingImage(true);
    const cargar = async () => {
      try {
        const relacion = await obtenerEspacioPorUsuarioId(facturaUser.uid);
        const eId = relacion?.espacioId;
        setUserRelacionId(relacion?.id || null);
        if (!eId) { setLoadingImage(false); return; }
        const blob = await obtenerImagenFactura(eId, factura.IdFactura);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setFacturaImageUri(reader.result as string);
          setLoadingImage(false);
        };
      } catch {
        setFacturaImageUri(null);
        setLoadingImage(false);
      }
    };
    cargar();
  }, [visible, factura.IdFactura, facturaUser?.uid]);

  const totalImporte = factura.Precio ?? 0;
  const usuarios: IFacturaUser[] = Array.isArray(factura.UsuariosAsignados)
    ? factura.UsuariosAsignados
    : [];
  const pagados = usuarios.filter((u) => u.completed).length;

  const perPerson =
    usuarios.length > 0 ? totalImporte / usuarios.length : totalImporte;
  const fmt = new Intl.NumberFormat(i18n.language === "es" ? "es-ES" : "en-US", {
    style: "currency",
    currency: "EUR",
  });
  const totalStr = fmt.format(totalImporte);
  const perPersonStr = fmt.format(perPerson);

  const fechaCreacionStr = useMemo(() => {
    try {
      return factura.formattedDate(i18n.language === "es" ? "es-ES" : "en-US");
    } catch {
      const d = new Date(factura.FechaCreacion);
      return d.toLocaleDateString(i18n.language === "es" ? "es-ES" : "en-US", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  }, [factura]);
  // Helper: la factura se considera "completada por mí" si está Pagada globalmente
  // o si este usuario ya marcó su parte
  const isFacturaPaidByMe = (item: FacturaModel): boolean => {
    if (item.Pagado) return true;
    const relId = (userRelacionId || "").replace(/-/g, "").toLowerCase();
    const myUid = (facturaUser?.uid || "").replace(/-/g, "").toLowerCase();
    return (
      item.UsuariosAsignados?.some((u) => {
        const cleanUId = u.id.replace(/-/g, "").toLowerCase();
        return (cleanUId === relId || cleanUId === myUid) && u.completed;
      }) ?? false
    );
  };
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
          <View
            collapsable={false}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 40,
              backgroundColor: "transparent",
              zIndex: 9999,
            }}
            {...panResponder.panHandlers}
          />
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.headerBlock}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{factura.Nombre}</Text>
              {factura.Descripcion ? (
                <Text style={styles.subtitle}>{factura.Descripcion}</Text>
              ) : null}
            </View>

            {/* Botón Eliminar */}
            <View style={{ alignItems: "flex-end" }}>
              <TouchableOpacity
                onPress={onDelete}
                activeOpacity={0.7}
                style={styles.deleteButton}
              >
                <Feather name="trash-2" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Precio total */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('facturaDetail.totalPrice')}</Text>
            <View style={styles.priceDisplay}>
              <Text style={styles.priceBig}>{totalStr}</Text>
            </View>
          </View>

          {/* Precio por persona */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('facturaDetail.pricePerPerson')}</Text>
            <View style={styles.priceDisplay}>
              <Text style={styles.priceBig}>{perPersonStr}</Text>
            </View>
          </View>

          {/* Fotos */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('facturaDetail.photos')}</Text>
            {loadingImage ? (
              <View style={styles.imageSkeleton}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.imageSkeletonText}>Loading Photo...</Text>
              </View>
            ) : facturaImageUri ? (
              <UploadImage
                label={t('facturaDetail.invoiceImage')}
                initialImageUri={facturaImageUri}
                editable={false}
              />
            ) : (
              <View style={styles.imageSkeleton}>
                <Text style={styles.imageSkeletonText}>No photo</Text>
              </View>
            )}
          </View>

          {/* Usuarios asignados */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('facturaDetail.assignedUsers')}</Text>
            {usuarios.length > 0 ? (
              <UserList
                users={usuarios.map((u) => ({ id: u.id, name: u.name, fotoUrl: u.fotoUrl ?? null }))}
                maxHeight={160}
                renderExtra={({ userId }) => {
                  const u = usuarios.find((x) => x.id === userId);
                  const pagado = u?.completed ?? false;
                  return (
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                        borderRadius: 12,
                        backgroundColor: pagado ? "#E6ECDC" : "#FFF3CD",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: FONTS.bold,
                          fontSize: 11,
                          color: pagado ? "#4B4741" : "#856404",
                        }}
                      >
                        {pagado ? t('facturaDetail.paid') : t('facturaDetail.pending')}
                      </Text>
                    </View>
                  );
                }}
              />
            ) : (
              <Text style={styles.emptyUsers}>{t('facturaDetail.noAssignedUsers')}</Text>
            )}
          </View>

          {/* Meta: contador y fecha */}
          <View style={styles.metaRow}>
            <View style={styles.counterPill}>
              <Text style={styles.counterPillText}>
                {t('facturaDetail.paidCounter', { pagados, total: usuarios.length })}
              </Text>
            </View>
            <Text style={styles.metaDate}>{t('facturaDetail.createdDate', { date: fechaCreacionStr })}</Text>
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
              <Text style={GLOBAL_STYLES.textoBoton}>{t('taskDetail.edit')}</Text>
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
                {isFacturaPaidByMe(factura) ? t('taskDetail.unmark') : t('taskDetail.complete')}
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
    ...(COMMON.OVERLAY as any),
    justifyContent: "flex-end",
  },

  sheet: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    paddingTop: 12,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E2E2E0",
    alignSelf: "center",
    marginBottom: 16,
  },

  // ---- Tarea: Header Nuevo ----
  headerBlockContainer: {
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  taskIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
  },
  titleTextWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    color: COLORS.secondary,
    fontFamily: FONTS.title,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  headerBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#D8E5D3",
  },
  pointsText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 38, 38, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.2)",
  },
  overdueBadgeText: {
    fontSize: 12,
    color: "#DC2626",
    fontFamily: FONTS.bold,
  },
  deleteIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(220, 38, 38, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.2)",
  },
  descriptionBox: {
    marginTop: 12,
    backgroundColor: "#F7F9F5",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E6ECDC",
  },

  // ---- Secciones genéricas ----
  sectionContainer: {
    marginBottom: 18,
    width: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionAccent: {
    width: 4,
    height: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.title,
    fontSize: 15,
    color: COLORS.secondary,
  },

  // ---- Card Box Fecha/Hora ----
  cardBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F9F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E6ECDC",
  },
  cardBoxOverdue: {
    borderColor: "rgba(220, 38, 38, 0.3)",
    backgroundColor: "rgba(220, 38, 38, 0.04)",
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateTimeDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E2E0",
  },
  dateText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
  },
  timeText: {
    fontSize: 18,
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
  },

  // ---- Repetición ----
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayChip: {
    width: 40,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E2E0",
    backgroundColor: "#F8F9F5",
  },
  dayChipSelected: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.accent,
    borderWidth: 1.5,
  },
  dayChipUnselected: {
    backgroundColor: "#F8F9F5",
    borderColor: "#E2E2E0",
  },
  dayChipFocused: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
  },
  dayChipText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  dayChipTextSelected: {
    color: COLORS.primary,
  },
  dayChipTextUnselected: {
    color: "#888",
  },

  // ---- Usuario Asignado ----
  emptyUserCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E6ECDC",
  },
  emptyUsersText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#888",
  },

  // ---- Botones Tarea ----
  actionsRowNew: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  btnEditNew: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#F5F4F2",
    borderWidth: 1,
    borderColor: "#E2E2E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnEditNewText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
  },
  btnCompleteNew: {
    flex: 1.4,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnCompleteDone: {
    backgroundColor: COLORS.success,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  btnCompleteText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: "#FFF",
  },
  btnCompleteDoneText: {
    color: COLORS.primary,
  },

  // ---- Factura / Compatibilidad ----
  headerBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: HELPERS.verticalScale(10),
  },
  section: {
    marginTop: 10,
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
  imageSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.inputBackground,
    borderRadius: HELPERS.moderateScale(10),
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: HELPERS.verticalScale(18),
    marginBottom: HELPERS.verticalScale(4),
  },
  imageSkeletonText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text14,
    color: COLORS.secondary,
    opacity: 0.6,
  },
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
  emptyUsers: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text14,
    color: COLORS.border,
    paddingVertical: HELPERS.verticalScale(8),
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

  // ---- Participante Hero ----
  participantHeroContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  participantAvatarRing: {
    position: "relative",
    marginBottom: 12,
  },
  participantAvatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3.5,
    borderColor: COLORS.accent,
  },
  participantAvatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.success,
    borderWidth: 3.5,
    borderColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  participantAdminBadge: {
    position: "absolute",
    bottom: -2,
    alignSelf: "center",
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  participantAdminBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: "#FFF",
  },
  participantNameLarge: {
    fontFamily: FONTS.title,
    fontSize: 22,
    color: COLORS.secondary,
    textAlign: "center",
    marginBottom: 6,
  },
  residenciaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8E5D3",
  },
  residenciaPillText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.primary,
  },

  // ---- Karma Banner Card ----
  karmaHeroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9F5",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6ECDC",
    marginBottom: 14,
  },
  karmaIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  karmaTextContent: {
    flex: 1,
  },
  karmaNumber: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: "#4A5942",
    lineHeight: 30,
  },
  karmaSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.primary,
  },
  karmaBadgeRight: {
    opacity: 0.6,
  },

  // ---- Participant Stats Row ----
  participantStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  participantStatCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9F5",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E6ECDC",
    gap: 10,
  },
  statIconSuccess: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E6ECDC",
    alignItems: "center",
    justifyContent: "center",
  },
  statIconDanger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: "#666",
  },

  // ---- Botón Eliminar / Info ----
  deleteParticipantBtn: {
    flexDirection: "row",
    backgroundColor: "rgba(220, 38, 38, 0.08)",
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.25)",
    marginTop: 4,
  },
  deleteParticipantBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: "#DC2626",
  },
  infoPillContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F3",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E2E0",
    marginTop: 4,
  },
  infoPillText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: "#777",
    textAlign: "center",
  },
});

export default Detalle;
