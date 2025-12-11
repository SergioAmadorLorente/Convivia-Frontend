
import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { COLORS, FONTS, HELPERS, COMMON } from "../../styles/theme";

const { verticalScale, moderateScale, wp, hp } = HELPERS;

export type EntityType = "tarea" | "factura";
export type Tone = "success" | "info" | "warning" | "error";

type ToastItem = {
  id: string;
  entity: EntityType;
  name: string;
  tone: Tone;
  autoHideMs?: number;
  open: boolean;
};

type ShowOptions = Omit<ToastItem, "id" | "open">;

export type ToastContextValue = {
  show: (opts: ShowOptions) => string;
  dismiss: (id?: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: "top" | "bottom";
  maxToasts?: number;
  gap?: number;
}

export function ToastProvider({
  children,
  position = "top",
  maxToasts = 3,
  gap = verticalScale(8),
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((opts: ShowOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => {
      const next: ToastItem[] = [{ id, open: true, ...opts }, ...prev];
      return next.slice(0, maxToasts);
    });
    return id;
  }, [maxToasts]);

  const dismiss = useCallback((id?: string) => {
    setToasts((prev) => {
      if (!prev.length) return prev;
      const targetId = id ?? prev[0].id;
      return prev.map((t) => (t.id === targetId ? { ...t, open: false } : t));
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.open !== false));
    }, 240);
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            alignItems: "center",
            paddingHorizontal: wp("2%"),
            ...(position === "top" ? { top: hp("2%") } : { bottom: hp("2%") }),
          }}
        >
          <View pointerEvents="box-none" style={{ maxWidth: wp("96%"), zIndex: 999, gap }}>
            {toasts.map((t) => (
              <ToastItemComponent
                key={t.id}
                {...t}
                onClose={() => dismiss(t.id)}
                gap={gap}
                position={position}
              />
            ))}
          </View>
        </View>
      </View>
    </ToastContext.Provider>
  );
}

// Componente interno del Toast
function ToastItemComponent({
  entity,
  name,
  tone,
  open,
  autoHideMs = 3200,
  onClose,
  gap,
  position,
}: ToastItem & { onClose: () => void; gap: number; position: "top" | "bottom" }) {
  const fade = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(6)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 6, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !autoHideMs) return;
    const id = setTimeout(onClose, autoHideMs);
    return () => clearTimeout(id);
  }, [open, autoHideMs, onClose]);

  const toneColors = {
    success: { bg: COLORS.success, fg: COLORS.primary, muted: COLORS.secondary },
    info: { bg: "#E8F1FB", fg: "#1f2b3a", muted: "#667085" },
    warning: { bg: "#FFF6E5", fg: "#3b2e1b", muted: "#7a6a52" },
    error: { bg: "#FDECEC", fg: "#3a1f25", muted: "#7a5d62" },
  }[tone];

  return (
    <Animated.View
      style={{
        width: wp("90%"), // ✅ ancho suficiente para texto
        flexDirection: "row",
        alignItems: "center",
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(8),
        paddingHorizontal: moderateScale(12),
        backgroundColor: toneColors.bg,
        marginBottom: position === "bottom" ? 0 : gap,
        opacity: fade,
        transform: [{ translateY }],
        ...COMMON.SHADOW,
      }}
    >
      {/* Icono */}
      <View
        style={{
          width: moderateScale(34),
          height: moderateScale(34),
          borderRadius: moderateScale(9),
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#E6E8EC",
          alignItems: "center",
          justifyContent: "center",
          marginRight: moderateScale(8),
        }}
      >
        <View
          style={{
            width: moderateScale(20),
            height: moderateScale(20),
            borderRadius: moderateScale(10),
            backgroundColor: COLORS.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: moderateScale(14), fontFamily: FONTS.bold }}>✓</Text>
        </View>
      </View>

      {/* Texto */}
      <View style={{ flex: 1, flexShrink: 1 }}>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: FONTS.bold,
            fontSize: moderateScale(14),
            color: toneColors.fg,
          }}
        >
          ¡{entity.charAt(0).toUpperCase() + entity.slice(1)} creada correctamente!
        </Text>
        <Text
          style={{
            fontFamily: FONTS.regular,
                       fontSize: moderateScale(12),
            color: toneColors.muted,
          }}
        >
          @{name}
        </Text>
      </View>

      {/* Botón cerrar */}
      <Pressable onPress={onClose} style={{ marginLeft: moderateScale(4), paddingHorizontal: moderateScale(6) }}>
        <Text style={{ color: "#5b5f61", fontSize: moderateScale(18) }}>×</Text>
      </Pressable>
    </Animated.View>
  );
}

export default ToastProvider;