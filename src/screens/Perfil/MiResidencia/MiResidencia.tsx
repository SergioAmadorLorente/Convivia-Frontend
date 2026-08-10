import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  Image,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigation/RootStackParamList";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { COLORS, FONTS, SIZES, HELPERS, COMMON } from "../../../styles/theme";
import GLOBAL_STYLES from "../../../styles/styles";
import * as Clipboard from "expo-clipboard";
import BottomBar from "../../../components/ui/BottomBar";
import { useAuthListener } from "../../../hooks/useAuthListener";
import { useUser } from "../../../hooks";
import Popup from "../../../components/ui/Popup";
import Detalle from "../../../components/ui/Detalle";
import { obtenerEspacioPorUsuarioId, obtenerUsuarioEspacios, eliminarUsuarioEspacio, obtenerRelacionUsuarioEspacio, actualizarUsuarioEspacio } from "../../../api/usuarioEspacio";
import { obtenerEspacioPorId, eliminarEspacio } from "../../../api/espacio";
import { obtenerTareasPorEspacio, eliminarTarea } from "../../../api/tarea";
import { obtenerFacturasPorEspacio, editarFactura, FacturaPayload } from "../../../api/factura";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../hooks/useToast";

const { width } = Dimensions.get("window");

import useCodigoResidencia from "../../../hooks/useCodigoResidencia";
import LogoKarma from "../../../assets/logo_karma.svg";
import useFetchParticipants from "../../../hooks/useFetchParticipants";
import { photoCache } from "../../../hooks/useProfilePhoto";
import Desplegable from "../../../components/ui/Desplegable";

const cleanId = (id?: string | null) => (id ? String(id).replace(/-/g, "").toLowerCase() : "");

const borrarTareasDelUsuario = async (
  espacioId: string,
  usuarioEspacioRelacion: any,
  participantUserObj?: any
) => {
  try {
    const relId = cleanId(usuarioEspacioRelacion?.id || usuarioEspacioRelacion?.id_UsuarioEspacio);
    const userUid = cleanId(usuarioEspacioRelacion?.usuarioId || participantUserObj?.id);

    const targetIds = new Set([relId, userUid].filter((id) => id.length > 0));
    if (targetIds.size === 0) return;

    console.log(" Buscando tareas asociadas a IDs de usuario:", Array.from(targetIds));

    const plantillasRaw = await obtenerTareasPorEspacio(espacioId);
    if (!Array.isArray(plantillasRaw)) return;

    for (const plantilla of plantillasRaw) {
      let estaAsignada = false;

      // 1. Revisar arrays de asignación en la plantilla
      const asignaciones = [
        ...(Array.isArray(plantilla.usuariosAsignacion) ? plantilla.usuariosAsignacion : []),
        ...(Array.isArray(plantilla.UsuariosAsignacion) ? plantilla.UsuariosAsignacion : []),
        ...(Array.isArray(plantilla.usuariosAsignados) ? plantilla.usuariosAsignados : []),
        ...(Array.isArray(plantilla.UsuariosAsignados) ? plantilla.UsuariosAsignados : []),
      ];

      for (const asigId of asignaciones) {
        if (targetIds.has(cleanId(asigId))) {
          estaAsignada = true;
          break;
        }
      }

      // 2. Revisar IDs directos en la plantilla
      if (!estaAsignada) {
        const plantillaUserIds = [
          plantilla.usuarioEspacioId,
          plantilla.UsuarioEspacioId,
          plantilla.usuarioId,
          plantilla.UsuarioId,
        ];
        for (const pId of plantillaUserIds) {
          if (pId && targetIds.has(cleanId(pId))) {
            estaAsignada = true;
            break;
          }
        }
      }

      // 3. Revisar instanciaActiva (el backend la devuelve embebida en cada
      // plantilla vía GetAllByEspacioConInstanciaActivaAsync, sin N+1)
      if (!estaAsignada) {
        const instancia = plantilla.instanciaActiva ?? plantilla.InstanciaActiva ?? null;

        if (instancia) {
          const instUserIds = [
            instancia.usuarioEspacioId,
            instancia.UsuarioEspacioId,
            instancia.usuarioId,
            instancia.UsuarioId,
          ];
          const instAsignaciones = [
            ...(Array.isArray(instancia.usuariosAsignacion) ? instancia.usuariosAsignacion : []),
            ...(Array.isArray(instancia.UsuariosAsignacion) ? instancia.UsuariosAsignacion : []),
          ];

          for (const iId of [...instUserIds, ...instAsignaciones]) {
            if (iId && targetIds.has(cleanId(iId))) {
              estaAsignada = true;
              break;
            }
          }
        }
      }

      // 4. Si la tarea pertenece al usuario, la eliminamos
      if (estaAsignada) {
        console.log(` Eliminando plantilla de tarea ${plantilla.id} por pertenecer al usuario eliminado`);
        try {
          await eliminarTarea(espacioId, plantilla.id);
        } catch (delErr) {
          console.warn(` Error al eliminar tarea ${plantilla.id}:`, delErr);
        }
      }
    }
  } catch (err) {
    console.warn(" Error en borrarTareasDelUsuario:", err);
  }
};

const desasignarUsuarioDeFacturas = async (
  espacioId: string,
  usuarioEspacioRelacion: any,
  participantUserObj?: any
) => {
  try {
    const idsCandidatos = [
      usuarioEspacioRelacion?.id,
      usuarioEspacioRelacion?.id_UsuarioEspacio,
      usuarioEspacioRelacion?.Id,
      usuarioEspacioRelacion?.Id_UsuarioEspacio,
      usuarioEspacioRelacion?.usuarioId,
      usuarioEspacioRelacion?.UsuarioId,
      participantUserObj?.id,
      participantUserObj?.Id,
      participantUserObj?.usuarioId,
      participantUserObj?.uid,
    ];

    const userUidDirect = participantUserObj?.id || usuarioEspacioRelacion?.usuarioId;
    if (userUidDirect && (!usuarioEspacioRelacion || !usuarioEspacioRelacion.id)) {
      try {
        const relFresca = await obtenerRelacionUsuarioEspacio(userUidDirect, espacioId);
        if (relFresca) {
          idsCandidatos.push(relFresca.id, relFresca.id_UsuarioEspacio, relFresca.Id, relFresca.usuarioId);
        }
      } catch {
        // Ignorar si no se encuentra relación
      }
    }

    const targetIds = new Set(
      idsCandidatos
        .filter((id) => id !== undefined && id !== null && String(id).trim() !== "")
        .map((id) => cleanId(String(id)))
    );

    if (targetIds.size === 0) return;

    console.log(" Desasignando usuario de facturas. Target IDs:", Array.from(targetIds));

    const result = await obtenerFacturasPorEspacio(espacioId);
    const facturasRaw = Array.isArray(result)
      ? result
      : (result as any)?.$values || [];

    if (!Array.isArray(facturasRaw) || facturasRaw.length === 0) return;

    for (const factura of facturasRaw) {
      const facturaId = factura.id || factura.IdFactura || factura.id_Factura || factura.Id;
      if (!facturaId) continue;

      const deudoresDict = factura.deudores || factura.Deudores || {};
      const keys = Object.keys(deudoresDict);

      let usuarioEncontrado = false;
      const nuevosDeudores: Record<string, boolean> = {};

      for (const key of keys) {
        const keyLimpia = cleanId(key);
        if (targetIds.has(keyLimpia)) {
          usuarioEncontrado = true;
        } else {
          nuevosDeudores[key] = deudoresDict[key];
        }
      }

      if (usuarioEncontrado) {
        console.log(` Desasignando usuario de la factura ${facturaId}`);
        const precio = Number(factura.precio || factura.Precio || 0);
        const numDeudores = Object.keys(nuevosDeudores).length;
        const pagoMediano = numDeudores > 0 ? precio / numDeudores : precio;
        const pagadoGlobal = numDeudores > 0
          ? Object.values(nuevosDeudores).every((val) => val === false)
          : true;

        const payload: FacturaPayload = {
          nombre: factura.nombre || factura.Nombre || "",
          precio: precio,
          pagoMediano: pagoMediano,
          pagado: pagadoGlobal,
          creadorFactura: factura.creadorFactura || factura.CreadorFactura || "",
          deudores: nuevosDeudores,
          fechaCompletada: pagadoGlobal
            ? (factura.fechaCompletada || factura.FechaCompletada || new Date().toISOString())
            : null,
        };

        try {
          await editarFactura(espacioId, facturaId, payload);
          console.log(` Factura ${facturaId} actualizada con éxito sin el usuario desasignado.`);
        } catch (editErr) {
          console.warn(` Error al desasignar usuario de factura ${facturaId}:`, editErr);
        }
      }
    }
  } catch (err) {
    console.warn(" Error en desasignarUsuarioDeFacturas:", err);
  }
};

const MiResidencia: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const user = useAuthListener();
  const { userData } = useUser();
  const { t } = useTranslation();
  const [residenciaName, setResidenciaName] = useState<string>("@Nombre Piso");
  const [loadingResidencia, setLoadingResidencia] = useState<boolean>(true);
  const [residenciaData, setResidenciaData] = useState<any>(null);

  const { participants, fetchParticipants } = useFetchParticipants();
  const { generatedCode, generarCodigo, loadingCode } = useCodigoResidencia();
  const [isAbandonPopupOpen, setIsAbandonPopupOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isEliminarParticipantePopupOpen, setIsEliminarParticipantePopupOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [selectedParticipantRelacion, setSelectedParticipantRelacion] = useState<any>(null);
  const [isEliminandoParticipante, setIsEliminandoParticipante] = useState(false);
  const [userRol, setUserRol] = useState<string | null>(null);
  // Transfer-admin flow
  const [isTransferAdminOpen, setIsTransferAdminOpen] = useState(false);
  const [newAdminCandidate, setNewAdminCandidate] = useState<any>(null);
  const { show: showToast } = useToast();

  const isAdmin =
    userRol === "admin" ||
    userRol === "administrador" ||
    participants.some(
      (p: any) =>
        (p.id === user?.uid || p.id === userData?.id) &&
        (p.rol?.toLowerCase() === "admin" || p.rol?.toLowerCase() === "administrador")
    );

  const handleAbandonarResidencia = () => {
    if (!user || !residenciaData) return;

    // Si el usuario es admin y hay otros miembros, debe transferir el rol antes de salir
    const otrosMiembros = participants.filter(
      (p: any) => p.id !== user.uid && p.id !== userData?.id
    );
    if (isAdmin && otrosMiembros.length > 0) {
      setNewAdminCandidate(null);
      setIsTransferAdminOpen(true);
      return;
    }

    // Sin otros miembros o no es admin: salir directamente
    setIsAbandonPopupOpen(true);
  };

  const confirmTransferirAdmin = async () => {
    if (!newAdminCandidate || !residenciaData?.id) return;
    try {
      // Obtener la relación UsuarioEspacio del candidato para actualizar su rol
      const relacion = await obtenerRelacionUsuarioEspacio(newAdminCandidate.id, residenciaData.id);
      if (!relacion?.id) {
        Alert.alert(t('common.error'), t('myResidence.errors.memberNotFound'));
        return;
      }
      await actualizarUsuarioEspacio(relacion.id, { rol: 'admin' });
      setIsTransferAdminOpen(false);
      setNewAdminCandidate(null);
      // Ahora sí puede abrir el popup de abandonar
      setIsAbandonPopupOpen(true);
    } catch {
      Alert.alert(t('common.error'), t('myResidence.errors.leaveError'));
    }
  };

  const confirmAbandonarResidencia = async () => {
    if (!user) return;
    try {
      // 1. Necesitamos el ID de la relación UsuarioEspacio para eliminarla
      const relacion = await obtenerEspacioPorUsuarioId(user.uid);
      if (relacion && relacion.id) {
        // Eliminar todas las tareas asignadas al usuario antes de abandonar
        if (relacion.espacioId) {
          await borrarTareasDelUsuario(relacion.espacioId, relacion, { id: user.uid });
          await desasignarUsuarioDeFacturas(relacion.espacioId, relacion, { id: user.uid });
        }

        await eliminarUsuarioEspacio(relacion.id);

        // 2. Comprobar si quedan más miembros en la residencia
        // Si era el último, eliminar el espacio para que no quede vacío
        if (relacion.espacioId) {
          try {
            const todasRelaciones = await obtenerUsuarioEspacios();
            const miembrosRestantes = Array.isArray(todasRelaciones)
              ? todasRelaciones.filter((r: any) => r.espacioId === relacion.espacioId)
              : [];
            if (miembrosRestantes.length === 0) {
              await eliminarEspacio(relacion.espacioId);
              console.log('[MiResidencia] Residencia eliminada por quedarse sin miembros.');
            }
          } catch {
            // Si falla la comprobación no bloqueamos al usuario
          }
        }

        setIsAbandonPopupOpen(false);
        // Redirigir a Bienvenida para que pueda crear o unirse a otra residencia
        navigation.reset({
          index: 0,
          routes: [{ name: "Bienvenida" }],
        });
      } else {
        Alert.alert(t('common.error'), t('myResidence.errors.memberNotFound'));
      }
    } catch (error) {
      // console.error("Error al abandonar residencia:", error);
      Alert.alert(t('common.error'), t('myResidence.errors.leaveError'));
    }
  };

  const handleEliminarResidencia = () => {
    if (!user || !residenciaData) return;
    setIsDeletePopupOpen(true);
  };

  const confirmEliminarResidencia = async () => {
    if (!residenciaData?.id) return;
    try {
      await eliminarEspacio(residenciaData.id);
      setIsDeletePopupOpen(false);
      // Redirigir a Bienvenida para que pueda crear o unirse a otra residencia
      navigation.reset({
        index: 0,
        routes: [{ name: "Bienvenida" }],
      });
    } catch (error) {
      // console.error("Error al eliminar residencia:", error);
      Alert.alert(t('common.error'), t('myResidence.errors.deleteError'));
    }
  };

  const fetchResidencia = async () => {
    if (!user) return;
    setLoadingResidencia(true);
    try {
      const relacion = await obtenerEspacioPorUsuarioId(user.uid);
      if (relacion && relacion.espacioId) {
        const rolNormalizado = (relacion.rol || relacion.Rol || relacion.role || relacion.Role || "").toLowerCase();
        setUserRol(rolNormalizado);
        const espacio = await obtenerEspacioPorId(relacion.espacioId);
        if (espacio) {
          setResidenciaName(espacio.nombre);
          setResidenciaData(espacio);
          fetchParticipants(espacio.id);
        }
      }
    } catch (error) {
      // console.error("Error fetching residencia:", error);
    } finally {
      setLoadingResidencia(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchResidencia();
    }, [user])
  );

  const handleGenerateCode = async () => {
    if (residenciaData?.id) {
      await generarCodigo(residenciaData.id);
    }
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await Clipboard.setStringAsync(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const CodeBox = ({ digit }: { digit: string }) => (
    <View style={styles.codeBox}>
      <Text style={styles.codeText}>{digit}</Text>
    </View>
  );

  const handleParticipantPress = async (participant: any) => {
    setSelectedParticipant(participant);
    // Obtener la relación usuarioEspacio para este participante y el espacio actual
    if (participant?.id && residenciaData?.id) {
      try {
        const relacion = await obtenerRelacionUsuarioEspacio(participant.id, residenciaData.id);
        setSelectedParticipantRelacion(relacion);
      } catch (error) {
        // console.error("Error al obtener relación usuarioEspacio:", error);
        setSelectedParticipantRelacion(null);
      }
    }
    setIsParticipantModalOpen(true);
  };

  const handleEliminarParticipante = () => {
    setIsParticipantModalOpen(false);
    setIsEliminarParticipantePopupOpen(true);
  };

  const confirmEliminarParticipante = async () => {
    if (!selectedParticipantRelacion?.id) {
      showToast({
        entity: "tarea",
        name: t('myResidence.toasts.getMemberError'),
        tone: "error",
      });
      return;
    }

    setIsEliminandoParticipante(true);
    try {
      // 1. Eliminar todas las tareas asignadas al usuario antes de eliminarlo
      if (residenciaData?.id && selectedParticipantRelacion) {
        await borrarTareasDelUsuario(
          residenciaData.id,
          selectedParticipantRelacion,
          selectedParticipant
        );
        await desasignarUsuarioDeFacturas(
          residenciaData.id,
          selectedParticipantRelacion,
          selectedParticipant
        );
      }

      // 2. Eliminar la relación usuario-espacio
      await eliminarUsuarioEspacio(selectedParticipantRelacion.id);
      setIsEliminarParticipantePopupOpen(false);
      showToast({
        entity: "tarea",
        name: t('myResidence.toasts.memberRemoved'),
        tone: "success",
      });
      // Refrescar la lista de participantes
      if (residenciaData?.id) {
        await fetchParticipants(residenciaData.id);
      }
      setSelectedParticipant(null);
      setSelectedParticipantRelacion(null);
    } catch (error) {
      // console.error("Error al eliminar participante:", error);
      showToast({
        entity: "tarea",
        name: t('myResidence.toasts.removeMemberError'),
        tone: "error",
      });
    } finally {
      setIsEliminandoParticipante(false);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={GLOBAL_STYLES.container}>
          <Text style={GLOBAL_STYLES.title}>{t('myResidence.title')}</Text>

          <View style={{ width: "100%", paddingHorizontal: 20, marginTop: 15 }}>
            {/* Residence Hero Card */}
            <View style={styles.residenciaCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="home-sharp" size={26} color="#fff" />
              </View>
              {loadingResidencia ? (
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={[styles.residenciaName, { color: "#888" }]}>{t("common.loading")}</Text>
                </View>
              ) : (
                <View style={{ flex: 1, justifyContent: "center", marginRight: 10 }}>
                  <Text style={styles.residenciaName} numberOfLines={2} adjustsFontSizeToFit>{residenciaName}</Text>
                </View>
              )}
              {isAdmin && (
                <TouchableOpacity
                  style={styles.editIconBtn}
                  onPress={() =>
                    navigation.navigate("EditarResidencia", {
                      espacioId: residenciaData?.id || "",
                      nombreInicial: residenciaData?.nombre || "",
                      ubicacionInicial: residenciaData?.direccion || "",
                    })
                  }
                  activeOpacity={0.8}
                >
                  <FontAwesome5 name="pen" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Code Section */}
            <Animated.View
              style={styles.section}
              layout={LinearTransition.duration(260).reduceMotion(ReduceMotion.Never)}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderAccent} />
                <Text style={styles.sectionTitle}>{t('myResidence.codeLabel')}</Text>
              </View>

              {generatedCode ? (
                <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.85} style={{ alignItems: 'center', width: '100%' }}>
                  <View style={styles.codeContainer}>
                    {generatedCode.split("").map((digit, index) => (
                      <CodeBox key={index} digit={digit} />
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 }}>
                    <Ionicons name={copied ? "checkmark-circle" : "copy-outline"} size={16} color={copied ? COLORS.primary : "#888"} />
                    <Text style={{ color: copied ? COLORS.primary : "#777", fontFamily: FONTS.bold, fontSize: 13 }}>
                      {copied ? t('myResidence.codeCopied') : "Toca para copiar código"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateCode}
                  disabled={loadingCode}
                  activeOpacity={0.85}
                >
                  <Ionicons name="key-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.generateButtonText}>
                    {loadingCode ? t('common.loading') : t('myResidence.generateCode')}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Participants Section */}
            <Desplegable title={t('myResidence.participants')} defaultOpen={true}>
              <View style={styles.participantsList}>
                {participants.length > 0 ? (
                  participants.map((participant, index) => (
                    <Animated.View
                      key={participant.id || index}
                      entering={FadeInDown.delay(index * 40).duration(450).springify().damping(15).reduceMotion(ReduceMotion.Never)}
                      layout={LinearTransition.springify().damping(15).mass(0.8).reduceMotion(ReduceMotion.Never)}
                    >
                      <TouchableOpacity
                        style={[
                          styles.participantItem,
                          index === 0 && styles.participantItemGold,
                          index === 1 && styles.participantItemSilver,
                          index === 2 && styles.participantItemBronze,
                        ]}
                        onPress={() => handleParticipantPress(participant)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.participantRankContainer}>
                          <Text style={[
                            styles.participantRank,
                            index === 0 && styles.participantRankFirst,
                            index === 1 && styles.participantRankSecond,
                            index === 2 && styles.participantRankThird
                          ]}>
                            {index + 1}
                          </Text>
                        </View>
                        <View style={styles.participantIconWrapper}>
                          {participant?.fotoUrl ? (
                            <Image
                              source={{ uri: participant.fotoUrl }}
                              style={[
                                { width: 42, height: 42, borderRadius: 21 },
                                index === 0 && styles.avatarGold,
                                index === 1 && styles.avatarSilver,
                                index === 2 && styles.avatarBronze,
                              ]}
                              onError={() => {
                                if (participant?.id) photoCache.delete(participant.id);
                              }}
                            />
                          ) : (
                            <View style={[
                              styles.participantIcon,
                              index === 0 && styles.avatarGold,
                              index === 1 && styles.avatarSilver,
                              index === 2 && styles.avatarBronze,
                            ]}>
                              <Ionicons name="person" size={20} color={COLORS.primary} />
                            </View>
                          )}
                          {participant?.rol === 'admin' && (
                            <View style={styles.adminBadge}>
                              <Text style={styles.adminBadgeText}>Admin</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.participantInfo}>
                          <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={styles.participantName}>
                              {participant?.nombre || participant?.email || "Usuario sin nombre"}
                            </Text>
                            {index === 0 && (
                              <LogoKarma width={16} height={16} style={{ marginLeft: 6, marginBottom: 2 }} />
                            )}
                          </View>
                          <Text style={styles.participantKarma}>
                            {t('myResidence.karmaPointsCount', { points: participant?.karmaTotal || 0 })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))
                ) : (
                  <Text style={{ fontFamily: FONTS.regular, color: "#666", marginTop: 5 }}>
                    {t('myResidence.loadingParticipants')}
                  </Text>
                )}
              </View>
            </Desplegable>

            {/* Settings Section */}
            <Animated.View
              style={[styles.section, { marginTop: 15 }]}
              layout={LinearTransition.duration(260).reduceMotion(ReduceMotion.Never)}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderAccent} />
                <Text style={styles.sectionTitle}>{t('myResidence.settings')}</Text>
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.actionButtonDanger}
                  onPress={handleAbandonarResidencia}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 10 }} />
                  <Text style={styles.actionButtonDangerText}>
                    {t('myResidence.leaveResidence')}
                  </Text>
                </TouchableOpacity>

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.actionButtonDelete}
                    onPress={handleEliminarResidencia}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={20} color="#DC2626" style={{ marginRight: 10 }} />
                    <Text style={styles.actionButtonDeleteText}>
                      {t('myResidence.deleteResidence')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      <BottomBar />

      {/* Modal: seleccionar nuevo admin antes de abandonar */}
      <Modal
        visible={isTransferAdminOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTransferAdminOpen(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
          <View style={{
            backgroundColor: COLORS.background,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
          }}>
            <Text style={{
              fontFamily: FONTS.bold,
              fontSize: 18,
              color: COLORS.primary,
              marginBottom: 8,
            }}>
              {t('myResidence.transferAdmin.title')}
            </Text>
            <Text style={{
              fontFamily: FONTS.regular,
              fontSize: 14,
              color: '#666',
              marginBottom: 20,
            }}>
              {t('myResidence.transferAdmin.description')}
            </Text>

            <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
              {participants
                .filter((p: any) => p.id !== user?.uid && p.id !== userData?.id)
                .map((p: any) => {
                  const selected = newAdminCandidate?.id === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setNewAdminCandidate(p)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 10,
                        marginBottom: 8,
                        backgroundColor: selected ? '#E6ECDC' : '#F5F5F5',
                        borderWidth: selected ? 1.5 : 0,
                        borderColor: selected ? COLORS.accent : 'transparent',
                      }}
                    >
                      <View style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: selected ? COLORS.accent : '#D0D0D0',
                        justifyContent: 'center', alignItems: 'center',
                        marginRight: 12,
                      }}>
                        <Ionicons name="person" size={18} color={selected ? '#fff' : COLORS.primary} />
                      </View>
                      <Text style={{
                        fontFamily: FONTS.bold,
                        fontSize: 15,
                        color: COLORS.primary,
                        flex: 1,
                      }}>
                        {p.nombre || p.email || 'Usuario'}
                      </Text>
                      {selected && (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                      )}
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => { setIsTransferAdminOpen(false); setNewAdminCandidate(null); }}
                style={[GLOBAL_STYLES.buttonSecondaryGrey, { flex: 1, paddingVertical: 12 }]}
              >
                <Text style={{ fontFamily: FONTS.regular, color: COLORS.primary, textAlign: 'center' }}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmTransferirAdmin}
                disabled={!newAdminCandidate}
                style={[GLOBAL_STYLES.buttonPrimaryGreen, { flex: 1, paddingVertical: 12, opacity: newAdminCandidate ? 1 : 0.4 }]}
              >
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, textAlign: 'center' }}>
                  {t('myResidence.transferAdmin.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Popup
        visible={isAbandonPopupOpen}
        onClose={() => setIsAbandonPopupOpen(false)}
        imageType="delete"
        title={t('myResidence.popups.leaveTitle')}
        description={t('myResidence.popups.leaveDescription')}
        buttons={[
          {
            text: t('common.cancel'),
            onPress: () => setIsAbandonPopupOpen(false),
            style: GLOBAL_STYLES.buttonSecondaryGrey,
            textStyle: { color: COLORS.primary }
          },
          {
            text: t('myResidence.popups.leaveConfirm'),
            onPress: confirmAbandonarResidencia,
            style: [GLOBAL_STYLES.buttonPrimaryGreen,],
            textStyle: { color: COLORS.primary }
          },
        ]}
      />

      <Detalle
        visible={isParticipantModalOpen}
        kind="participante"
        participant={selectedParticipant}
        participantRelacion={selectedParticipantRelacion}
        residenciaName={residenciaName}
        onClose={() => setIsParticipantModalOpen(false)}
        onEliminar={handleEliminarParticipante}
        isCurrentUser={selectedParticipant?.id === userData?.id}
        isAdmin={userRol === 'admin'}
      />
      <Popup
        visible={isDeletePopupOpen}
        onClose={() => setIsDeletePopupOpen(false)}
        imageType="delete"
        title={t('myResidence.popups.deleteTitle')}
        description={t('myResidence.popups.deleteDescription')}
        buttons={[
          {
            text: t('common.cancel'),
            onPress: () => setIsDeletePopupOpen(false),
            style: GLOBAL_STYLES.buttonSecondaryGrey,
            textStyle: { color: COLORS.primary }
          },
          {
            text: t('myResidence.popups.deleteConfirm'),
            onPress: confirmEliminarResidencia,
            style: [GLOBAL_STYLES.buttonPrimaryGreen,],
            textStyle: { color: COLORS.primary }
          },
        ]}
      />

      <Popup
        visible={isEliminarParticipantePopupOpen}
        onClose={() => setIsEliminarParticipantePopupOpen(false)}
        imageType="delete"
        title={t('myResidence.popups.removeTitleWithName', { name: selectedParticipant?.nombre || "este usuario" })}
        description={t('myResidence.popups.removeDescription')}
        buttons={[
          {
            text: t('common.cancel'),
            onPress: () => setIsEliminarParticipantePopupOpen(false),
            style: GLOBAL_STYLES.buttonSecondaryGrey,
            textStyle: { color: COLORS.primary }
          },
          {
            text: t('myResidence.popups.removeConfirm'),
            onPress: confirmEliminarParticipante,
            style: GLOBAL_STYLES.buttonPrimaryGreen,
            textStyle: { color: COLORS.primary },
          }
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  residenciaCard: {
    width: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    ...COMMON.SHADOW,
    marginBottom: 24,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...COMMON.SHADOW,
  },
  residenciaName: {
    fontFamily: FONTS.title,
    fontSize: 20,
    color: COLORS.secondary,
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    ...COMMON.SHADOW,
  },
  section: {
    width: "100%",
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionHeaderAccent: {
    width: 4,
    height: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.title,
    fontSize: 18,
    color: COLORS.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E2E0",
    marginBottom: 15,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    width: "100%",
  },
  codeBox: {
    width: 46,
    height: 56,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    ...COMMON.SHADOW,
    borderWidth: 1,
    borderColor: "#E6ECDC",
  },
  codeText: {
    fontFamily: FONTS.title,
    fontSize: 24,
    color: COLORS.primary,
  },
  generateButton: {
    flexDirection: "row",
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...COMMON.SHADOW,
  },
  generateButtonText: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    fontSize: 15,
  },
  participantsList: {
    paddingHorizontal: 2,
    gap: 8,
  },
  participantItem: {
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: "#E6ECDC",
    ...(Platform.OS === 'ios' ? COMMON.SHADOW : { elevation: 0 }),
  },
  participantItemGold: {
    borderLeftWidth: 4,
    borderLeftColor: "#EAB308",
    backgroundColor: COLORS.background,
  },
  participantItemSilver: {
    borderLeftWidth: 4,
    borderLeftColor: "#94A3B8",
    backgroundColor: COLORS.background,
  },
  participantItemBronze: {
    borderLeftWidth: 4,
    borderLeftColor: "#D97706",
    backgroundColor: COLORS.background,
  },
  participantRankContainer: {
    width: 28,
    alignItems: 'center',
    marginRight: 10,
  },
  participantRank: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#999',
  },
  participantRankFirst: {
    color: '#EAB308',
    fontSize: 17,
  },
  participantRankSecond: {
    color: '#94A3B8',
    fontSize: 16,
  },
  participantRankThird: {
    color: '#D97706',
    fontSize: 16,
  },
  participantIconWrapper: {
    alignItems: 'center',
    marginRight: 14,
  },
  participantIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6ECDC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGold: {
    borderWidth: 2,
    borderColor: '#EAB308',
  },
  avatarSilver: {
    borderWidth: 2,
    borderColor: '#94A3B8',
  },
  avatarBronze: {
    borderWidth: 2,
    borderColor: '#D97706',
  },
  adminBadge: {
    marginTop: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  adminBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#fff',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  participantKarma: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.primary,
  },
  buttonsContainer: {
    gap: 12,
  },
  actionButtonDanger: {
    flexDirection: "row",
    backgroundColor: "rgba(220, 38, 38, 0.07)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.25)",
  },
  actionButtonDangerText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: "#DC2626",
  },
  actionButtonDelete: {
    flexDirection: "row",
    backgroundColor: "rgba(220, 38, 38, 0.12)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.35)",
  },
  actionButtonDeleteText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: "#DC2626",
  },
});

export default MiResidencia;
