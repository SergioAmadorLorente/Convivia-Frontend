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
  ScrollView,
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
import { useProfilePhoto, photoCache } from "../../hooks/useProfilePhoto";

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
  const { photoUri, photoLoading, reloadPhoto } = useProfilePhoto(user?.uid);

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
    isDanger = false,
  }: {
    label: string;
    onPress?: () => void;
    icon: React.ReactNode;
    isDanger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, isDanger && styles.menuIconContainerDanger]}>
        {icon}
      </View>
      <Text style={[styles.menuText, isDanger && styles.menuTextDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={isDanger ? "#EF4444" : "#BBB"} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Título fijo – siempre visible encima del scroll */}
      <TouchableOpacity onPress={handleTitleTap} activeOpacity={1} style={styles.titleBar}>
        <Text style={GLOBAL_STYLES.title}>{t("profile.title")}</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* User Hero Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfoRow}>
            {/* Avatar */}
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => navigation.navigate("EditarPerfil")}
              activeOpacity={0.8}
            >
              {photoLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: 62, height: 62, borderRadius: 31 }}
                  onError={() => {
                    if (user?.uid) photoCache.delete(user.uid);
                    reloadPhoto(true);
                  }}
                />
              ) : (
                <Ionicons name="person" size={28} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            {/* User Details */}
            <View style={styles.userDetails}>
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={[styles.userName, { color: "#888" }]}>{t("common.loading")}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                  <View style={styles.karmaBadgePill}>
                    <LogoKarma width={14} height={14} />
                    <Text style={styles.userKarma}>
                      {t("profile.karmaPoints", { points: userKarma })}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {/* Language Icon */}
              <TouchableOpacity
                style={styles.iconActionBtn}
                onPress={() => setLangModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 18 }}>
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
                style={styles.iconActionBtn}
                onPress={() => navigation.navigate('EditarPerfil')}
                activeOpacity={0.8}
              >
                <FontAwesome5 name="pen" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Menu List Container */}
        <View style={styles.menuContainer}>

          {/* Mi Karma */}
          <MenuItem
            label={t("profile.menu.karma")}
            onPress={() => navigation.navigate("MiKarma")}
            icon={<LogoKarma width={24} height={24} />}
          />
          <View style={styles.divider} />

          {/* Mis Residencias */}
          <MenuItem
            label={t("profile.menu.residences")}
            onPress={() => navigation.navigate("MiResidencia")}
            icon={<Miresidencia width={22} height={22} />}
          />
          <View style={styles.divider} />

          {/* Preguntas frecuentes */}
          <MenuItem
            label={t("profile.menu.faq")}
            onPress={() => navigation.navigate("FAQ")}
            icon={<IconoFAQ width={22} height={22} />}
          />
          <View style={styles.divider} />

          {/* Información Legal */}
          <MenuItem
            label={t("profile.menu.legal")}
            onPress={() => navigation.navigate("InfoLegal")}
            icon={<Infolegal width={22} height={22} />}
          />
          <View style={styles.divider} />

          {/* Convivia PRO */}
          <MenuItem
            label={t("profile.menu.pro")}
            onPress={() => navigation.navigate('ConviviaPro')}
            icon={<IconoConviviaPRO width={22} height={22} />}
          />
          <View style={styles.divider} />

          {/* Cerrar Sesión */}
          <MenuItem
            label={t("profile.menu.logout")}
            onPress={() => setModalVisible(true)}
            icon={<LogoutSinFondo width={22} height={22} />}
            isDanger={true}
          />
          <Text style={styles.versionText}>
            {"v3.13.1 APKDynamic"}
          </Text>

        </View>
      </ScrollView>

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
    backgroundColor: "#F5F4F2",
  },
  titleBar: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
    alignItems: "center",
    backgroundColor: "#F5F4F2",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 110,
    paddingHorizontal: 20,
  },
  userCard: {
    width: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginTop: 12,
    marginBottom: 20,
    ...COMMON.SHADOW,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    ...COMMON.SHADOW,
  },
  userDetails: {
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  userName: {
    fontFamily: FONTS.title,
    fontSize: 19,
    color: COLORS.secondary,
    lineHeight: 22,
  },
  karmaBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    backgroundColor: "rgba(107, 112, 92, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  userKarma: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.primary,
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    ...COMMON.SHADOW,
  },
  menuContainer: {
    width: "100%",
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...COMMON.SHADOW,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F5F4F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuIconContainerDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  menuText: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: SIZES.text14,
    color: COLORS.secondary,
  },
  menuTextDanger: {
    color: "#EF4444",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0EE",
    marginHorizontal: 8,
  },
  versionText: {
    textAlign: "right",
    color: "green",
    fontSize: 11,
    marginTop: 10,
    marginBottom: 4,
    paddingRight: 8,
    opacity: 0.7,
    fontFamily: FONTS.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.background || "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
    fontFamily: FONTS.title,
    fontSize: 20,
    color: COLORS.primary || "#333",
  },
  langOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#F5F4F2",
  },
  langOptionSelected: {
    backgroundColor: "#E6ECDC",
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  langOptionText: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.text14,
    color: COLORS.secondary,
  },
});

export default Perfil;
