import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "../../configs/firebaseConfig";
import { useTranslation } from "react-i18next";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"; // Keep for fallback or other icons
import BottomBar from "../../components/ui/BottomBar";
import Popup from "../../components/ui/Popup";
import { useAuthListener } from "../../hooks/useAuthListener";
import { obtenerUsuarioPorId } from "../../api/usuario";
import { obtenerEspacioPorUsuarioId } from "../../api/usuarioEspacio";
import { obtenerKarmaUsuario } from "../../api/karma";
import { COLORS, FONTS, SIZES, HELPERS, COMMON } from "../../styles/theme";

import GLOBAL_STYLES from "../../styles/styles";
import { useToast } from "../../hooks/useToast";
import { useProfilePhoto } from "../../hooks/useProfilePhoto";

// Import SVG Assets
import LogoKarma from "../../assets/logo_karma.svg";
import Miresidencia from "../../assets/Miresidencia.svg";
import IconoFAQ from "../../assets/IconoFAQ.svg";
import Infolegal from "../../assets/Infolegal.svg";
import IconoConviviaPRO from "../../assets/Icono_Convivia_PRO.svg";
import LogoutSinFondo from "../../assets/Logout_sin_fondo.svg";
const { width } = Dimensions.get("window");

const Perfil: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const user = useAuthListener();
  const [userName, setUserName] = useState<string>(user?.displayName || user?.email?.split("@")[0] || "Usuario");
  const [userKarma, setUserKarma] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { photoUri, reloadPhoto } = useProfilePhoto(user?.uid);

  // Easter egg: tap title 6 times
  const { show: showToast } = useToast();
  const easterTapCount = useRef(0);
  const easterTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTitleTap = () => {
    easterTapCount.current += 1;
    if (easterTapTimer.current) clearTimeout(easterTapTimer.current);
    easterTapTimer.current = setTimeout(() => {
      easterTapCount.current = 0;
    }, 1500);
    if (easterTapCount.current >= 6) {
      easterTapCount.current = 0;
      showToast({
        entity: "tarea",
        name: "Stop tapping the screen like a crazy, or you'll cause a bug.",
        tone: "info",
        autoHideMs: 4000,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('REMEMBER_ME');
      await signOut(auth);
    } catch {
      // Ignorar errores de cierre de sesión
    }
    navigation.replace('Main');
  };

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (user) {
      const displayName = user.displayName || user.email?.split("@")[0] || "Usuario";
      setUserName(displayName);
    }
  }, [user]);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.uid) {
        // NOTA: reloadPhoto ya no se llama aquí para evitar race condition con Firestore.
        // Se llama directamente en useFocusEffect.
        const userData = await obtenerUsuarioPorId(user.uid);
        if (userData) {
          const realName = userData.nombre || userData.Nombre || user.displayName || user.email?.split("@")[0] || "Usuario";
          setUserName(realName);
        }

        // Obtener karma del usuario desde estadísticas oficiales
        try {
          const usuarioEspacio = await obtenerEspacioPorUsuarioId(user.uid);
          if (usuarioEspacio?.espacioId) {
            const usuarioEspacioId = usuarioEspacio.id || usuarioEspacio.id_UsuarioEspacio;
            const karmaData = await obtenerKarmaUsuario(usuarioEspacio.espacioId, usuarioEspacioId);
            setUserKarma(karmaData.karmaTotal || 0);
          }
        } catch (karmaError) {
          // console.error("Error al cargar karma:", karmaError);
          setUserKarma(0);
        }
      }
    } catch (error) {
      // console.error("Error al cargar los datos del usuario:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Recargar datos al volver a esta pantalla
  useFocusEffect(
    useCallback(() => {
      if (fontsLoaded && user) {
        fetchUserData();
        // Recargar foto al volver a esta pantalla (separado de fetchUserData para evitar race condition)
        reloadPhoto();
      }
    }, [fetchUserData, fontsLoaded, user, reloadPhoto])
  );

  useEffect(() => {
    if (fontsLoaded && user) {
      fetchUserData();
    }
  }, [fontsLoaded, user]);

  if (!fontsLoaded) {
    return null;
  }

  // Common wrapper for list items
  const MenuItem = ({
    label,
    onPress,
    icon,
  }: {
    label: string;
    onPress?: () => void;
    icon: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIconContainer}>
        {icon}
      </View>
      <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View
        style={styles.scrollContent}
      >
        {/* Header Title */}
        <TouchableOpacity onPress={handleTitleTap} activeOpacity={1}>
          <Text style={GLOBAL_STYLES.title}>{t("profile.title")}</Text>
        </TouchableOpacity>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfoRow}>
            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => navigation.navigate("EditarPerfil")}
              activeOpacity={0.7}
            >
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                />
              ) : (
                <Ionicons name="person-outline" size={30} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            {/* User Details */}
            <View style={styles.userDetails}>
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={[styles.userName, { color: "#999" }]}>{t("common.loading")}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.userName}>{userName}</Text>
                  <Text style={styles.userKarma}>
                    {t("profile.karmaPoints", { points: userKarma })}
                    <LogoKarma width={14} height={14} style={{ marginLeft: 4 }} />
                  </Text>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Language Icon */}
              <TouchableOpacity
                style={[styles.editButton, { marginRight: 5 }]}
                onPress={() => setLangModalVisible(true)}
              >
                <Text style={{ fontSize: 20 }}>
                  {i18n.language.startsWith("es") ? "🇪🇸"
                    : i18n.language.startsWith("fr") ? "🇫🇷"
                      : i18n.language.startsWith("it") ? "🇮🇹"
                        : i18n.language.startsWith("de") ? "🇩🇪"
                          : i18n.language.startsWith("pt") ? "🇵🇹"
                            : "🇬🇧"}
                </Text>
              </TouchableOpacity>

              {/* Edit Icon */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditarPerfil')}
              >
                <FontAwesome5 name="edit" size={18} color="#ACBF8A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Menu List Container (White box with rounded corners) */}
        <View style={styles.menuContainer}>

          {/* Mi Karma */}
          <MenuItem
            label={t("profile.menu.karma")}
            onPress={() => navigation.navigate("MiKarma")}
            icon={<LogoKarma width={30} height={30} />}
          />
          <View style={styles.divider} />

          {/* Mis Residencias */}
          <MenuItem
            label={t("profile.menu.residences")}
            onPress={() => navigation.navigate("MiResidencia")}
            icon={<Miresidencia width={24} height={24} />}
          />
          <View style={styles.divider} />

          {/* Preguntas frecuentes */}
          <MenuItem
            label={t("profile.menu.faq")}
            onPress={() => navigation.navigate("FAQ")}
            icon={<IconoFAQ width={24} height={24} />}
          />
          <View style={styles.divider} />

          {/* Información Legal */}
          <MenuItem
            label={t("profile.menu.legal")}
            onPress={() => navigation.navigate("InfoLegal")}
            icon={<Infolegal width={24} height={24} />}
          />
          <View style={styles.divider} />

          {/* Convivia PRO */}
          <MenuItem
            label={t("profile.menu.pro")}
            onPress={() => navigation.navigate('ConviviaPro')}
            icon={<IconoConviviaPRO width={24} height={24} />}
          />
          <View style={styles.divider} />

          {/* Cerrar Sesión */}
          <MenuItem
            label={t("profile.menu.logout")}
            onPress={() => setModalVisible(true)}
            icon={<LogoutSinFondo width={24} height={24} />}
          />
          <Text style={{ textAlign: "right", color: "green", fontSize: 11, marginTop: 3, paddingRight: 12, opacity: 0.7 }}>
            {"v3.9.13 APKDynamic"}
          </Text>

        </View>
      </View>

      <Popup
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={t("profile.logoutPopup.title")}
        description=""
        imageType="logout"
        buttons={[
          { text: t("profile.logoutPopup.cancel"), onPress: () => { } },
          { text: t("profile.logoutPopup.confirm"), onPress: handleLogout },
        ]}
      />

      {/* Language Selector Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("profile.language.select")}</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Español Option */}
            <TouchableOpacity
              style={[
                styles.langOption,
                i18n.language.startsWith("es") && styles.langOptionSelected
              ]}
              onPress={async () => {
                await i18n.changeLanguage("es");
                await AsyncStorage.setItem("user-language", "es");
                setLangModalVisible(false);
              }}
            >
              <Text style={styles.langOptionText}>Español 🇪🇸</Text>
              {i18n.language.startsWith("es") && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            {/* English Option */}
            <TouchableOpacity
              style={[
                styles.langOption,
                i18n.language.startsWith("en") && styles.langOptionSelected
              ]}
              onPress={async () => {
                await i18n.changeLanguage("en");
                await AsyncStorage.setItem("user-language", "en");
                setLangModalVisible(false);
              }}
            >
              <Text style={styles.langOptionText}>English 🇬🇧</Text>
              {i18n.language.startsWith("en") && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            {/* Français Option */}
            <TouchableOpacity
              style={[
                styles.langOption,
                i18n.language.startsWith("fr") && styles.langOptionSelected
              ]}
              onPress={async () => {
                await i18n.changeLanguage("fr");
                await AsyncStorage.setItem("user-language", "fr");
                setLangModalVisible(false);
              }}
            >
              <Text style={styles.langOptionText}>Français 🇫🇷</Text>
              {i18n.language.startsWith("fr") && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            {/* Italiano Option */}
            <TouchableOpacity
              style={[
                styles.langOption,
                i18n.language.startsWith("it") && styles.langOptionSelected
              ]}
              onPress={async () => {
                await i18n.changeLanguage("it");
                await AsyncStorage.setItem("user-language", "it");
                setLangModalVisible(false);
              }}
            >
              <Text style={styles.langOptionText}>Italiano 🇮🇹</Text>
              {i18n.language.startsWith("it") && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            {/* Deutsch Option */}
            <TouchableOpacity
              style={[
                styles.langOption,
                i18n.language.startsWith("de") && styles.langOptionSelected
              ]}
              onPress={async () => {
                await i18n.changeLanguage("de");
                await AsyncStorage.setItem("user-language", "de");
                setLangModalVisible(false);
              }}
            >
              <Text style={styles.langOptionText}>Deutsch 🇩🇪</Text>
              {i18n.language.startsWith("de") && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            {/* Português Option */}
            <TouchableOpacity
              style={[
                styles.langOption,
                i18n.language.startsWith("pt") && styles.langOptionSelected
              ]}
              onPress={async () => {
                await i18n.changeLanguage("pt");
                await AsyncStorage.setItem("user-language", "pt");
                setLangModalVisible(false);
              }}
            >
              <Text style={styles.langOptionText}>Português 🇵🇹</Text>
              {i18n.language.startsWith("pt") && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: HELPERS.hp("8%"),
    backgroundColor: "#F5F4F2",
  },
  userCard: {
    width: width * 0.9,
    backgroundColor: COLORS.background,
    borderRadius: 15,
    padding: 15,
    ...COMMON.SHADOW,
    marginTop: HELPERS.hp("4%"),
    marginBottom: HELPERS.hp("4%"),
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.text16,
    color: "#333",
  },
  userKarma: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.smallText,
    color: "#666",
    marginTop: 4,
  },
  editButton: {
    padding: 5,
  },
  menuContainer: {
    width: width,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: HELPERS.hp("50%"),
    ...COMMON.SHADOW,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  menuIconContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 15,
  },
  menuText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text16,
    color: "#4B4741",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: 55,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background || "#FFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary || "#333",
  },
  langOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#F5F4F2",
  },
  langOptionSelected: {
    backgroundColor: "#E6ECDC",
  },
  langOptionText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text16,
    color: "#4B4741",
  },
});

export default Perfil;
