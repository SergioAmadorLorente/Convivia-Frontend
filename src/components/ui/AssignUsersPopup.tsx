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
} from "react-native";
import { FONTS, COLORS } from "../../styles/styles";
import { CHECKBOX } from "../../styles/theme"; // estilo global del checkbox
import { Feather } from "@expo/vector-icons";

type UserItem = {
  id: string;
  name: string;
};

type AssignUsersPopupProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  users: UserItem[];
  multiSelect?: boolean;
  initialSelectedIds?: string[];
  confirmLabel?: string;
  onConfirm: (selected: UserItem[]) => void | Promise<void>;
  loadingUsers?: boolean;
};

const AssignUsersPopup: React.FC<AssignUsersPopupProps> = ({
  visible,
  onClose,
  title = "Asignación de usuarios (Opcional)",
  users,
  multiSelect = true,
  initialSelectedIds = [],
  confirmLabel = "¡Asigna!",
  onConfirm,
  loadingUsers = false,
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

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await Promise.resolve(onConfirm(selectedList));
      onClose();
    } finally {
      setConfirming(false);
    }
  };

  const renderItem = ({ item }: { item: UserItem }) => {
    const checked = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.8}
        style={styles.item}
      >
        <Text style={styles.itemText}>{item.name}</Text>
        <TouchableOpacity
          onPress={() => toggleSelect(item.id)}
          activeOpacity={0.8}
          style={CHECKBOX.touchArea}
        >
          <Feather
            name={checked ? "check-square" : "square"}
            size={CHECKBOX.iconSize}
            color={
              checked ? CHECKBOX.colors.checked : CHECKBOX.colors.unchecked
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Image
            source={require("../../assets/pngconvivia.png")}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.title}>{title}</Text>

          <View style={{ maxHeight: 320, width: "100%" }}>
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

          <TouchableOpacity
            disabled={confirming}
            onPress={handleConfirm}
            style={styles.confirmButton}
          >
            {confirming ? (
              <ActivityIndicator size="small" color={COLORS.secondary} />
            ) : (
              <Text style={styles.confirmButtonText}>
                {selectedIds.size > 0 ? confirmLabel : "Mas tarde..."}
              </Text>
            )}
          </TouchableOpacity>
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
    width: "100%",
    alignSelf: "stretch",
    marginTop: 16,
  },
  confirmButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});

export default AssignUsersPopup;
