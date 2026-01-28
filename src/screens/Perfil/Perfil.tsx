import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"; // Keep for fallback or other icons
import BottomBar from "../../components/ui/BottomBar";
import Popup from "../../components/ui/Popup";
import { COLORS, FONTS, SIZES, HELPERS, COMMON } from "../../styles/theme";

// Import SVG Assets
import LogoKarma from "../../assets/logo_karma.svg";
import Miresidencia from "../../assets/Miresidencia.svg";
import IconoFAQ from "../../assets/IconoFAQ.svg";
import Infolegal from "../../assets/Infolegal.svg";
import IconoConviviaPRO from "../../assets/Icono_Convivia_PRO.svg";
import LogoutSinFondo from "../../assets/Logout_sin_fondo.svg";
import GLOBAL_STYLES from "../../styles/styles";

const { width } = Dimensions.get("window");

const Perfil: React.FC = () => {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    navigation.navigate('Main');
  };

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <Text style={GLOBAL_STYLES.title}>Mi Perfil</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfoRow}>
            {/* Avatar Placeholder */}
            <View style={styles.avatarContainer}>
              <Ionicons name="person-outline" size={30} color={COLORS.primary} />
            </View>

            {/* User Details */}
            <View style={styles.userDetails}>
              <Text style={styles.userName}>@Nombre</Text>
              <Text style={styles.userKarma}>
                Puntos Karma
                <FontAwesome5 name="peace" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                : 290
              </Text>
            </View>

            {/* Edit Icon */}
            <TouchableOpacity style={styles.editButton}>
              <FontAwesome5 name="edit" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu List Container (White box with rounded corners) */}
        <View style={styles.menuContainer}>

          {/* Mi Karma */}
          <MenuItem
            label="Mi Karma"
            onPress={() => console.log('Mi Karma')}
            icon={<LogoKarma width={30} height={30} />}
          />
          <View style={styles.divider} />

          {/* Mis Residencias */}
          <MenuItem
            label="Mis Residencias"
            onPress={() => navigation.navigate("MiResidencia")}
            icon={<Miresidencia width={24} height={24} />}
          />
          <View style={styles.divider} />

          {/* Preguntas frecuentes */}
          <MenuItem
            label="Preguntas frecuentes"
            onPress={() => navigation.navigate("FAQ")}
            icon={<IconoFAQ width={24} height={24} />}
          />
          <View style={styles.divider} />

          {/* Información Legal */}
          <MenuItem
            label="Información Legal"
            onPress={() => navigation.navigate("InfoLegal")}
            icon={<Infolegal width={24} height={24} />}
          />
          <View style={styles.divider} />

          {/* Convivia PRO */}
          <MenuItem
            label="Convivia PRO"
            onPress={() => console.log('Convivia PRO')}
            icon={<IconoConviviaPRO width={24} height={24} />}
          />
          <View style={styles.divider} />

          {/* Cerrar Sesión */}
          <MenuItem
            label="Cerrar Sesión"
            onPress={() => setModalVisible(true)}
            icon={<LogoutSinFondo width={24} height={24} />}
          />

        </View>
      </ScrollView>
      
      <Popup
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="¿Estás seguro de que quieres cerrar la sesión?"
        description=""
        imageType="logout"
        buttons={[
          { text: 'Cancelar', onPress: () => { } },
          { text: 'Cerrar sesión', onPress: handleLogout },
        ]}
      />
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
  },
  headerTitle: {
    fontSize: SIZES.largeTitle,
    fontFamily: FONTS.title,
    color: COLORS.primary,
    marginTop: HELPERS.hp("7%"),
    marginBottom: HELPERS.hp("3%"),
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
    padding: 10,
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
});

export default Perfil;
