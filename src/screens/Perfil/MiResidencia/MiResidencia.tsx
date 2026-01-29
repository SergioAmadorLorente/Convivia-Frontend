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
import Popup from "../../../components/ui/Popup";
import Detalle from "../../../components/ui/Detalle";
import { obtenerEspacioPorUsuarioId, obtenerUsuarioEspacios, eliminarUsuarioEspacio, obtenerRelacionUsuarioEspacio } from "../../../api/usuarioEspacio";
import { obtenerEspacioPorId } from "../../../api/espacio";
import { obtenerUsuarioPorId } from "../../../api/usuario";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const { width } = Dimensions.get("window");

import useCodigoResidencia from "../../../hooks/useCodigoResidencia";
import { Colors } from "react-native/Libraries/NewAppScreen";

const MiResidencia: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(true);
  const user = useAuthListener();
  const [residenciaName, setResidenciaName] = useState<string>("@Nombre Piso");
  const [residenciaData, setResidenciaData] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  const { generatedCode, generarCodigo, loadingCode } = useCodigoResidencia();
  const [isAbandonPopupOpen, setIsAbandonPopupOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [selectedParticipantRelacion, setSelectedParticipantRelacion] = useState<any>(null);

  const fetchParticipants = async (espacioId: string) => {
    try {
      const todasRelaciones = await obtenerUsuarioEspacios();
      if (Array.isArray(todasRelaciones)) {
        const relacionesDelEspacio = todasRelaciones.filter(
          (r: any) => r.espacioId === espacioId
        );

        const usuariosPromesas = relacionesDelEspacio.map(async (r: any) => {
          try {
            const usuario = await obtenerUsuarioPorId(r.usuarioId);
            return usuario;
          } catch (e) {
            // Usuario no existe, lo ignoramos silenciosamente
            return null;
          }
        });

        const usuarios = await Promise.all(usuariosPromesas);
        setParticipants(usuarios.filter((u) => u !== null));
      }
    } catch (e) {
      console.error("Error fetching participants", e);
    }
  };

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
        // Alert.alert("Éxito", "Has abandonado la residencia correctamente.");
        // Redirigir a UnirResidencia o refrescar
        setIsAbandonPopupOpen(false);
        navigation.reset({
          index: 0,
          routes: [{ name: "UnirResidencia" }],
        });
      } else {
        Alert.alert("Error", "No se encontró tu información de miembro.");
      }
    } catch (error) {
      console.error("Error al abandonar residencia:", error);
      Alert.alert("Error", "Ocurrió un error al intentar abandonar la residencia.");
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
      console.error("Error fetching residencia:", error);
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
        console.error("Error al obtener relación usuarioEspacio:", error);
        setSelectedParticipantRelacion(null);
      }
    }
    setIsParticipantModalOpen(true);
  };

  const handleEliminarParticipante = () => {
    setIsParticipantModalOpen(false);
    Alert.alert(
      "Eliminar participante",
      `¿Estás seguro de que quieres eliminar a ${selectedParticipant?.nombre || "este usuario"} de la residencia?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            // Aquí implementar la lógica para eliminar el usuario
            console.log("Eliminando usuario:", selectedParticipant);
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={GLOBAL_STYLES.container}>
          {/* Back Button */}

          <Text style={GLOBAL_STYLES.title}>Mis Residencias</Text>

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
              <Text style={styles.sectionTitle}>Código de tu Residencia</Text>
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
                      ¡Copiado!
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
                    {loadingCode ? "Generando..." : "Generar Código"}
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
                <Text style={styles.sectionTitle}>Participantes</Text>
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
                        <View style={styles.participantIcon}>
                          <Ionicons name="person" size={20} color={COLORS.primary} />
                        </View>
                        <Text style={styles.participantName}>
                          {participant.nombre || participant.email || "Usuario sin nombre"}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={{ fontFamily: FONTS.regular, color: "#666", marginTop: 5 }}>
                      Cargando participantes...
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ajustes</Text>
              <View style={styles.divider} />

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleAbandonarResidencia}
                >
                  <Text
                    style={[styles.actionButtonText, { color: COLORS.error }]}
                  >
                    Abandonar Residencia
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Text
                    style={[styles.actionButtonText, { color: COLORS.error }]}
                  >
                    Eliminar Residencia
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
        titleComponent={
          <Text>
            ¿Estás seguro de que quieres <Text style={{ color: COLORS.error }}>abandonar</Text> esta residencia?
          </Text>
        }
        description="Perderas todos tus puntos de karma"
        buttons={[
          {
            text: "Cancelar",
            onPress: () => setIsAbandonPopupOpen(false),
            style: GLOBAL_STYLES.buttonSecondaryGrey,
            textStyle: { color: COLORS.primary }
          },
          {
            text: "Abandonar",
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
  participantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6ECDC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  participantName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: "#333",
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
