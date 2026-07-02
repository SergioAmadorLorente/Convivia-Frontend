import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigation/RootStackParamList";
import GLOBAL_STYLES from "../../../styles/styles";
import TextField from "../../../components/ui/TextField";
import Button from "../../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../../styles/theme";
import { WebView } from "react-native-webview";

import { useRoute, RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { actualizarEspacio } from "../../../api/espacio";

type EditarResidenciaNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EditarResidencia"
>;

type EditarResidenciaRouteProp = RouteProp<
  RootStackParamList,
  "EditarResidencia"
>;

interface Coordinates {
  lat: number;
  lon: number;
}

const EditarResidencia: React.FC = () => {
  const navigation = useNavigation<EditarResidenciaNavigationProp>();
  const route = useRoute<EditarResidenciaRouteProp>();
  const { espacioId, nombreInicial, ubicacionInicial } = route.params;
  const { t } = useTranslation();

  // Estados para los campos
  const [nombre, setNombre] = useState(nombreInicial || "");
  const [ubicacion, setUbicacion] = useState(ubicacionInicial || "");
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);

  const debounceTimer = useRef<number | null>(null);

  // Geocodificación con debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (ubicacion.trim().length > 3) {
      setLoadingMap(true);
      debounceTimer.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              ubicacion
            )}&limit=1`,
            {
              headers: {
                'User-Agent': 'ConviviaApp/1.0',
                'Accept': 'application/json',
              },
            }
          );

          // Verificar si la respuesta es exitosa
          if (!response.ok) {
            // console.error(`Error HTTP: ${response.status}`);
            setCoordinates(null);
            setLoadingMap(false);
            return;
          }

          // Verificar que la respuesta sea JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            // console.error('La respuesta no es JSON:', contentType);
            setCoordinates(null);
            setLoadingMap(false);
            return;
          }

          const data = await response.json();

          if (data && data.length > 0) {
            setCoordinates({
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
            });
          } else {
            setCoordinates(null);
          }
        } catch (error) {
          // console.error("Error en geocodificación:", error);
          setCoordinates(null);
        } finally {
          setLoadingMap(false);
        }
      }, 1000);
    } else {
      setCoordinates(null);
      setLoadingMap(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [ubicacion]);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert(t('common.error'), t('editResidence.errors.emptyName'));
      return;
    }

    setLoading(true);
    try {
      await actualizarEspacio(espacioId, {
        nombre: nombre,
        direccion: ubicacion.trim() || "",
      });
      console.log("Espacio actualizado exitosamente");
      navigation.goBack();
    } catch (error) {
      // console.error("Error al actualizar el espacio:", error);
      Alert.alert(t('common.error'), t('editResidence.errors.updateError'));
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

        <Text style={localStyles.screenTitle}>{t('editResidence.title')}</Text>
      </View>

      {/* Content Card */}
      <View style={localStyles.contentCard}>
        <ScrollView
          contentContainerStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={localStyles.formContainer}>
            <TextField
              label={t('editResidence.nameLabel')}
              value={nombre}
              onChangeText={setNombre}
              placeholder={t('newResidence.namePlaceholder')}
            />

            <TextField
              label={t('editResidence.locationLabel')}
              value={ubicacion}
              onChangeText={setUbicacion}
              placeholder={t('editResidence.locationPlaceholder')}
              rightIcon={
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.secondary}
                />
              }
            />

            {/* Indicador de carga del mapa */}
            {loadingMap && ubicacion.trim().length > 3 && (
              <View style={localStyles.mapLoadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={localStyles.mapLoadingText}>
                  {t('editResidence.searchingLocation')}
                </Text>
              </View>
            )}

            {/* Mapa */}
            {coordinates && !loadingMap && (
              <View style={localStyles.mapContainer}>
                <Text style={localStyles.mapLabel}>{t('editResidence.mapLabel')}</Text>
                <WebView
                  style={localStyles.map}
                  source={{
                    html: `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                          <style>
                            body { margin: 0; padding: 0; }
                            #map { width: 100%; height: 100vh; }
                          </style>
                        </head>
                        <body>
                          <div id="map"></div>
                          <script>
                            var map = L.map('map').setView([${coordinates.lat}, ${coordinates.lon}], 15);
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                              attribution: '© OpenStreetMap contributors'
                            }).addTo(map);
                            L.marker([${coordinates.lat}, ${coordinates.lon}]).addTo(map)
                              .bindPopup('${ubicacion}')
                              .openPopup();
                          </script>
                        </body>
                      </html>
                    `,
                  }}
                  scrollEnabled={false}
                  bounces={false}
                />
              </View>
            )}

            <Button
              onPress={handleGuardar}
              style={localStyles.saveButton}
              loading={loading}
              variant="custom" // We will override styles manually
            >
              <Text style={localStyles.saveButtonText}>{t('editResidence.saveButton')}</Text>
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
  mapLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    backgroundColor: "#F8F8F6",
    borderRadius: 10,
    marginTop: 10,
    width: "90%",
  },
  mapLoadingText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 10,
  },
  mapContainer: {
    width: "90%",
    marginTop: 20,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: COLORS.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
    padding: 15,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  map: {
    width: "100%",
    height: 250,
  },
});

export default EditarResidencia; // Removed old 'styles' since we used 'localStyles'
