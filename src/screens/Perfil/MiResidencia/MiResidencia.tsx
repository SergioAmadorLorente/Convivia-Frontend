import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
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
import { obtenerEspacioPorUsuarioId, obtenerUsuarioEspacios, eliminarUsuarioEspacio, obtenerRelacionUsuarioEspacio } from "../../../api/usuarioEspacio";
import { obtenerEspacioPorId, eliminarEspacio } from "../../../api/espacio";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../hooks/useToast";

const { width } = Dimensions.get("window");

import useCodigoResidencia from "../../../hooks/useCodigoResidencia";
import useFetchParticipants from "../../../hooks/useFetchParticipants";
import { Colors } from "react-native/Libraries/NewAppScreen";

const MiResidencia: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(true);
  const user = useAuthListener();
  const { userData } = useUser();
  const { t } = useTranslation();
  const [residenciaName, setResidenciaName] = useState<string>("@Nombre Piso");
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
  const { show: showToast } = useToast();

  const handleAbandonarResidencia = () => {
    if (!user || !residenciaData) return;
    setIsAbandonPopupOpen(true);
  };

  const confirmAbandonarResidencia = async () => {
    if (!user) return;
    try {
      // 1. Necesitamos el ID de la relación UsuarioEspacio para eliminarla
      // Ya tenemos relacion.id si lo guardamos, o lo buscamos de nuevo
      const relacion = await obtenerEspacioPorUsuarioId(user.uid);
      if (relacion && relacion.id) {
        await eliminarUsuarioEspacio(relacion.id);
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

    try {
      const relacion = await obtenerEspacioPorUsuarioId(user.uid);
      if (relacion && relacion.espacioId) {
        const espacio = await obtenerEspacioPorId(relacion.espacioId);
        if (espacio) {
          setResidenciaName(espacio.nombre);
          setResidenciaData(espacio);
          fetchParticipants(espacio.id);
        }
      }
    } catch (error) {
      // console.error("Error fetching residencia:", error);
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
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={GLOBAL_STYLES.container}>
          {/* Back Button */}

          <Text style={GLOBAL_STYLES.title}>{t('myResidence.title')}</Text>

          <View style={{ width: "85%", marginTop: 20 }}>
            {/* Residence Card */}
            <View style={styles.residenciaCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="home" size={30} color="#fff" />
              </View>
              <Text style={styles.residenciaName}>{residenciaName}</Text>
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() =>
                  navigation.navigate("EditarResidencia", {
                    espacioId: residenciaData?.id || "",
                    nombreInicial: residenciaData?.nombre || "",
                    ubicacionInicial: residenciaData?.direccion || "",
                  })
                }
              >
                <FontAwesome5 name="edit" size={20} color={COLORS.accent} />
              </TouchableOpacity>
            </View>

            {/* Code Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('myResidence.codeLabel')}</Text>
              <View style={styles.divider} />

              {generatedCode ? (
                <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.8} style={{ alignItems: 'center', width: '100%' }}>
                  <View style={styles.codeContainer}>
                    {generatedCode.split("").map((digit, index) => (
                      <CodeBox key={index} digit={digit} />
                    ))}
                  </View>
                  {copied && (
                    <Text style={{ marginTop: 10, color: COLORS.primary, fontFamily: FONTS.bold, fontSize: 14 }}>
                      {t('myResidence.codeCopied')}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateCode}
                  disabled={loadingCode}
                >
                  <Text style={styles.generateButtonText}>
                    {loadingCode ? t('common.loading') : t('myResidence.generateCode')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Participants Section */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeaderClickable}
                onPress={() => setIsParticipantsOpen(!isParticipantsOpen)}
              >
                <Text style={styles.sectionTitle}>{t('myResidence.participants')}</Text>
                <Ionicons
                  name={isParticipantsOpen ? "chevron-up" : "chevron-down"}
                  size={24}
                  color={COLORS.secondary}
                />
              </TouchableOpacity>
              <View style={styles.divider} />

              {isParticipantsOpen && (
                <View style={styles.participantsList}>
                  {participants.length > 0 ? (
                    participants.map((participant, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.participantItem}
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
                        <View style={styles.participantIcon}>
                          <Ionicons name="person" size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.participantInfo}>
                          <Text style={styles.participantName}>
                            {participant?.nombre || participant?.email || "Usuario sin nombre"}
                          </Text>
                          <Text style={styles.participantKarma}>
                            {t('myResidence.karmaPointsCount', { points: participant?.karmaTotal || 0 })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={{ fontFamily: FONTS.regular, color: "#666", marginTop: 5 }}>
                      {t('myResidence.loadingParticipants')}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('myResidence.settings')}</Text>
              <View style={styles.divider} />

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleAbandonarResidencia}
                >
                  <Text
                    style={[styles.actionButtonText, { color: COLORS.error }]}
                  >
                    {t('myResidence.leaveResidence')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleEliminarResidencia}
                >
                  <Text
                    style={[styles.actionButtonText, { color: COLORS.error }]}
                  >
                    {t('myResidence.deleteResidence')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomBar />

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
    backgroundColor: COLORS.background,
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    ...COMMON.SHADOW,
    marginBottom: 30,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#C8C8C8", // Greyish from image
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  residenciaName: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: "#333",
  },
  editIcon: {
    padding: 5,
  },
  section: {
    width: "100%",
    marginBottom: 25,
  },
  sectionHeaderClickable: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.accent,
    marginBottom: 5,
  },
  divider: {
    height: 2,
    backgroundColor: "#8F9B78", // Un greenish dark line
    marginBottom: 15,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  codeBox: {
    width: 45,
    height: 55,
    backgroundColor: "#E6ECDC",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    ...COMMON.SHADOW,
  },
  codeText: {
    fontFamily: FONTS.title,
    fontSize: 24,
    color: "#333",
  },
  generateButton: {
    backgroundColor: "#E6ECDC",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    ...COMMON.SHADOW,
  },
  generateButtonText: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    fontSize: 16,
  },
  participantsList: {
    paddingHorizontal: 10,
  },
  participantItem: {
    ...COMMON.SHADOW,
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantRankContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 10,
  },
  participantRank: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#999',
  },
  participantRankFirst: {
    color: '#FFD700',
    fontSize: 18,
  },
  participantRankSecond: {
    color: '#C0C0C0',
    fontSize: 17,
  },
  participantRankThird: {
    color: '#CD7F32',
    fontSize: 17,
  },
  participantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6ECDC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  participantKarma: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.primary,
  },
  buttonsContainer: {
    gap: 15,
  },
  actionButton: {
    backgroundColor: "#D9D9D9", // Light grey button
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    ...COMMON.SHADOW,
  },
  actionButtonText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: "#333",
  },
});

export default MiResidencia;
