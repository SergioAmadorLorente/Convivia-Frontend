import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  ReduceMotion,
  interpolateColor,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONTS, SIZES } from "../../styles/theme";

interface LoadingViewProps {
  message?: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
}

const LoadingView: React.FC<LoadingViewProps> = ({
  message = "Cargando…",
  icon = "home",
}) => {
  const pulse = useSharedValue(0);
  const rotate = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.Never }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.Never })
      ),
      -1,
      false
    );
    rotate.value = withRepeat(
      withTiming(360, {
        duration: 2400,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.Never,
      }),
      -1,
      false
    );
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.Never }),
      -1,
      false
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.75 + 0.25 * pulse.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
    opacity: 0.35 + 0.3 * pulse.value,
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      shimmer.value,
      [0, 1],
      ["rgba(172, 191, 138, 0.25)", "rgba(172, 191, 138, 0.55)"]
    ),
  }));

  const dotGlow = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * pulse.value,
    transform: [{ scale: 0.85 + 0.3 * pulse.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Card con borde redondeado */}
      <View style={styles.card}>
        {/* Pista pulida (shimmer) en la parte superior */}
        <Animated.View style={[styles.shimmerTrack, shimmerAnimatedStyle]} />

        {/* Icono central con anillo rotatorio */}
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.ring, ringAnimatedStyle]} />
          <Animated.View style={[styles.iconCircle, iconAnimatedStyle]}>
            <Feather name={icon} size={34} color={COLORS.primary} />
          </Animated.View>
        </View>

        {/* Puntos animados */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[styles.dot, dotGlow, { marginLeft: i === 0 ? 0 : 6 }]}
            />
          ))}
        </View>

        <Text style={styles.message}>{message}</Text>
        <Text style={styles.subMessage}>{`Convivia`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    minHeight: 320,
    width: "100%",
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9F5",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E6ECDC",
    paddingHorizontal: 40,
    paddingVertical: 38,
    width: "82%",
    maxWidth: 340,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      },
    }),
  },
  shimmerTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  ring: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#D8E5D3",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  message: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.text16,
    color: COLORS.secondary,
    textAlign: "center",
  },
  subMessage: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.smallText,
    color: COLORS.primary,
    marginTop: 6,
    opacity: 0.7,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});

export default LoadingView;