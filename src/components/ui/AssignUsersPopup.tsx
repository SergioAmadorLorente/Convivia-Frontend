import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  ReduceMotion,
} from "react-native-reanimated";

type UserItem = {
  id: string;
  name: string;
  fotoUrl?: string | null;
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

// Fila individual de usuario con un checkbox animado, replicando el mismo
// estilo que el checkbox de "completar tarea" del Dashboard (ver TaskItem.tsx).
const UserRow: React.FC<{
  item: UserItem;
  checked: boolean;
  onToggle: () => void;
}> = ({ item, checked, onToggle }) => {
  const checkboxScale = useSharedValue(checked ? 1 : 0);
  const checkboxBgColor = useSharedValue(checked ? 1 : 0);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      checkboxScale.value = checked ? 1 : 0;
      checkboxBgColor.value = checked ? 1 : 0;
      return;
    }
    checkboxScale.value = withSpring(checked ? 1 : 0, { damping: 12, stiffness: 150, reduceMotion: ReduceMotion.Never });
    checkboxBgColor.value = withTiming(checked ? 1 : 0, { duration: 200, reduceMotion: ReduceMotion.Never });
  }, [checked]);

  const checkboxAnimatedStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      checkboxBgColor.value,
      [0, 1],
      ["transparent", COLORS.accent]
    );
    const borderColor = interpolateColor(
      checkboxBgColor.value,
      [0, 1],
      [COLORS.secondary, COLORS.accent]
    );
    return {
      backgroundColor: bgColor,
      borderColor: borderColor,
    };
  });

  const checkmarkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkboxScale.value }],
      opacity: checkboxScale.value,
    };
  });

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={styles.item}
    >
      <View style={styles.userAvatar}>
        {item.fotoUrl ? (
          <Image
            source={{ uri: item.fotoUrl }}
            style={styles.userAvatarImage}
            resizeMode="cover"
          />
        ) : (
          <Feather name="user" size={15} color={COLORS.primary} />
        )}
      </View>
      <Text style={styles.itemText}>{item.name}</Text>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={CHECKBOX.touchArea}
      >
        <Animated.View style={[styles.customCheckbox, checkboxAnimatedStyle]}>
          <Animated.View style={checkmarkAnimatedStyle}>
            <Feather name="check" size={14} color="#FFF" />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const AssignUsersPopup: React.FC<AssignUsersPopupProps> = ({
  visible,
  onClose,
  title,
  users,
  multiSelect = true,
  initialSelectedIds = [],
  confirmLabel,
  onConfirm,
  loadingUsers = false,
}) => {
  const { t } = useTranslation();
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

  const renderItem = ({ item }: { item: UserItem }) => (
    <UserRow
      item={item}
      checked={selectedIds.has(item.id)}
      onToggle={() => toggleSelect(item.id)}
    />
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>{title || t('createTask.assignUsers.title')}</Text>

          <View style={{ maxHeight: 320, width: "100%" }}>
            {loadingUsers ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
                <Text style={styles.loadingText}>{t('createTask.assignUsers.loading')}</Text>
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
                {selectedIds.size > 0 ? (confirmLabel || t('common.accept')) : t('createTask.assignUsers.later')}
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
    flex: 1,
    marginLeft: 10,
    color: "#333",
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E6ECDC",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  userAvatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  customCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
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
