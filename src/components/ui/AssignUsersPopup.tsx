
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { COLORS, FONTS } from "../../styles/styles"; // si tu proyecto usa styles.ts para tokens, puedes importar desde ahí
// Si prefieres importar desde theme.ts (donde añadiste CHECKBOX), usa esta línea:
import theme, { CHECKBOX } from "../../styles/theme"; // <-- aquí traemos el estilo global del checkbox
import { Feather } from "@expo/vector-icons";

type UserItem = {
  id: string;
  name: string;
  subtitle?: string;
};

type AssignUsersPopupProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  imageType?: "error" | "logout" | "success" | "happy" | "convivia";
  showImage?: boolean;

  users: UserItem[];
  multiSelect?: boolean;
  initialSelectedIds?: string[];
  confirmLabel?: string;
  onConfirm: (selected: UserItem[]) => void | Promise<void>;
  loadingUsers?: boolean;

  // Estilos opcionales (por si alguna pantalla necesita ajustar algo)
  containerStyle?: ViewStyle;
  popupStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  titleStyle?: TextStyle;
  itemStyle?: ViewStyle;
  itemTextStyle?: TextStyle;
  confirmButtonStyle?: ViewStyle;
  confirmTextStyle?: TextStyle;

  requireSelection?: boolean;
  listMaxHeight?: number; // altura máxima del listado antes de scroll
};

const imageMap: Record<string, any> = {
  error: require("../../assets/pngerror.png"),
  logout: require("../../assets/pnglogout.png"),
  success: require("../../assets/pngsuccessful.png"),
  happy: require("../../assets/pngCaraFeliz.png"),
  convivia: require("../../assets/pngconvivia.png"),
};

const AssignUsersPopup: React.FC<AssignUsersPopupProps> = ({
  visible,
  onClose,
  title = "Asignación de usuarios",
  imageType = "convivia",
  showImage = true,
  users,
  multiSelect = true,
  initialSelectedIds = [],
  confirmLabel = "¡Asigna!",
  onConfirm,
  loadingUsers = false,
  containerStyle,
  popupStyle,
  imageStyle,
  titleStyle,
  itemStyle,
  itemTextStyle,
  confirmButtonStyle,
  confirmTextStyle,
  requireSelection = true,
  listMaxHeight = 320,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedIds(new Set(initialSelectedIds));
    }
  }, [visible, initialSelectedIds.join("|")]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (multiSelect) {
        next.has(id) ? next.delete(id) : next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const selectedList = useMemo(
    () => users.filter((u) => selectedIds.has(u.id)),
    [users, selectedIds]
  );

  const canConfirm = !requireSelection || selectedIds.size > 0;

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await Promise.resolve(onConfirm(selectedList));
      onClose();
    } catch {
      // opcional: mostrar un toast si falla y NO cerrar
    } finally {
      setConfirming(false);
    }
  };

  const imgSource = imageType ? imageMap[imageType] : undefined;

  const renderItem = ({ item }: { item: UserItem }) => {
    const checked = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.8}
        style={[styles.item, itemStyle]}
      >
        <Text style={[styles.itemText, itemTextStyle]} numberOfLines={1}>
          {item.name}
        </Text>

        <TouchableOpacity
          onPress={() => toggleSelect(item.id)}
          activeOpacity={0.8}
          style={CHECKBOX.touchArea} // estilo global del checkbox
        >
          {/* Opción A: Feather square/check-square con estilo global */}
          <Feather
            name={checked ? "check-square" : "square"}
            size={CHECKBOX.iconSize}
            color={checked ? CHECKBOX.colors.checked : CHECKBOX.colors.unchecked}
          />
          {/* Si prefieres el checkbox custom (Opción B), reemplaza por:
            <View style={[CHECKBOX.box, checked && CHECKBOX.boxChecked]}>
              {checked && (
                <Feather name="check" size={CHECKBOX.tickSize} color={CHECKBOX.colors.tick} />
              )}
            </View>
          */}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={[styles.overlay, containerStyle]}>
        <View style={[styles.popup, popupStyle]}>
          {showImage && imgSource && (
            <Image source={imgSource} resizeMode="contain" style={[styles.image, imageStyle]} />
          )}

          <Text style={[styles.title, titleStyle]}>{title}</Text>

          <View style={{ maxHeight: listMaxHeight, width: "100%" }}>
            {loadingUsers ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
                <Text style={styles.loadingText}>Cargando usuarios…</Text>
              </View>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(u) => u.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingVertical: 6 }}
              />
            )}
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              disabled={!canConfirm || confirming}
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                (!canConfirm || confirming) && { opacity: 0.6 },
                confirmButtonStyle,
              ]}
            >
              {confirming ? (
                <ActivityIndicator size="small" color={COLORS.secondary} />
              ) : (
                <Text style={[styles.confirmButtonText, confirmTextStyle]}>
                  {confirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Overlay y card mínimos (alineados al popup estándar)
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  popup: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: FONTS.title,
  },

  // Lista mínima
  loadingBox: {
    width: "100%",
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#6A6A6A",
    fontFamily: FONTS.regular,
  },
  item: {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F5F4F2",
    marginVertical: 6,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemText: {
    color: "#333",
    fontSize: 14,
    fontFamily: FONTS.regular,
  },

  // Botón confirmar
  buttonsContainer: {
    width: "100%",
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: "#E6ECDC",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: COLORS.secondary,
    fontFamily: FONTS.bold,
  },
});

export default AssignUsersPopup;
