import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigation/RootStackParamList";
import GLOBAL_STYLES from "../../../styles/styles";
import TextField from "../../../components/ui/TextField";
import Button from "../../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../../styles/theme";

import { useRoute, RouteProp } from "@react-navigation/native";
import { actualizarEspacio } from "../../../api/espacio";

type EditarResidenciaNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EditarResidencia"
>;

type EditarResidenciaRouteProp = RouteProp<
  RootStackParamList,
  "EditarResidencia"
>;

const EditarResidencia: React.FC = () => {
  const navigation = useNavigation<EditarResidenciaNavigationProp>();
  const route = useRoute<EditarResidenciaRouteProp>();
  const { espacioId, nombreInicial, ubicacionInicial } = route.params;

  // Estados para los campos (inicialmente vacíos como se solicitó)
  const [nombre, setNombre] = useState(nombreInicial || "");
  const [ubicacion, setUbicacion] = useState(ubicacionInicial || "");
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim() || !ubicacion.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      await actualizarEspacio(espacioId, {
        nombre: nombre,
        direccion: ubicacion,
      });
      console.log("Espacio actualizado exitosamente");
      navigation.goBack();
    } catch (error) {
      console.error("Error al actualizar el espacio:", error);
      Alert.alert("Error", "Hubo un error al actualizar la residencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={localStyles.mainContainer}>
      {/* Header Area */}
      <View style={localStyles.headerContainer}>
        <TouchableOpacity
          style={localStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={30} color={COLORS.accent} />
        </TouchableOpacity>

        <Text style={localStyles.screenTitle}>Editar Mi Residencia</Text>
      </View>

      {/* Content Card */}
      <View style={localStyles.contentCard}>
        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={localStyles.formContainer}>
            <TextField
              value={nombre}
              onChangeText={setNombre}
              placeholder="Piso Tarragona"
              // No valid label prop passed, so it won't render
            />

            <TextField
              value={ubicacion}
              onChangeText={setUbicacion}
              placeholder="Calle Falsa 123"
              rightIcon={
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.secondary}
                />
              }
            />

            <Button
              onPress={handleGuardar}
              style={localStyles.saveButton}
              loading={loading}
              variant="custom" // We will override styles manually
            >
              <Text style={localStyles.saveButtonText}>¡Guardar!</Text>
            </Button>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F8F6", // Light beige/greenish tint
  },
  headerContainer: {
    paddingTop: 60, // Adjusted back for status bar
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: "#F8F8F6",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.accent,
    marginLeft: 5,
  },
  screenTitle: {
    fontFamily: FONTS.title,
    fontSize: 28,
    color: COLORS.primary, // Olive green
    textAlign: "center",
  },
  contentCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 40,
    // Add shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    gap: 15,
  },
  saveButton: {
    marginTop: 40,
    width: "90%",
    backgroundColor: COLORS.success, // Light green #E6ECDC
    borderRadius: 25,
    paddingVertical: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: "center", // Ensure button is centered
    alignItems: "center", // Ensure content (text) is centered
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.secondary, // Darker text
    textAlign: "center", // Just in case
  },
});

export default EditarResidencia; // Removed old 'styles' since we used 'localStyles'
