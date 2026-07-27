import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import LogoKarma from "../../assets/logo_karma.svg";
import { FONTS, COLORS } from "../../styles/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface KarmaTrailOverlayProps {
  startX: number;
  startY: number;
  targetX?: number;
  targetY?: number;
  karmaAmount: number;
  onAnimationEnd?: () => void;
  onImpact?: () => void;
}

const PARTICLE_COUNT = 6;

interface ParticleConfig {
  delay: number;
  arcFactorX: number;
  arcFactorY: number;
  size: number;
}

const SingleParticle: React.FC<{
  config: ParticleConfig;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  isLast: boolean;
  onAnimationEnd?: () => void;
  onImpact?: () => void;
}> = ({ config, startX, startY, targetX, targetY, isLast, onAnimationEnd, onImpact }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withDelay(config.delay, withTiming(1, { duration: 80 }));
    scale.value = withDelay(
      config.delay,
      withSequence(
        withTiming(1.3, { duration: 120 }),
        withTiming(0.8, { duration: 400 })
      )
    );

    progress.value = withDelay(
      config.delay,
      withTiming(1, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }, (finished) => {
        if (finished) {
          opacity.value = withTiming(0, { duration: 100 });
          if (isLast) {
            if (onImpact) runOnJS(onImpact)();
            if (onAnimationEnd) runOnJS(onAnimationEnd)();
          }
        }
      })
    );
  }, [config, isLast, onAnimationEnd, onImpact, opacity, progress, scale, startX, startY, targetX, targetY]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const controlX = (startX + targetX) / 2 + config.arcFactorX;
    const controlY = Math.min(startY, targetY) - 50 + config.arcFactorY;

    // Bezier formula: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const currentX = Math.pow(1 - p, 2) * startX + 2 * (1 - p) * p * controlX + Math.pow(p, 2) * targetX;
    const currentY = Math.pow(1 - p, 2) * startY + 2 * (1 - p) * p * controlY + Math.pow(p, 2) * targetY;

    return {
      position: "absolute",
      left: currentX - config.size / 2,
      top: currentY - config.size / 2,
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <View style={styles.particleWrapper}>
        <View style={[styles.glowTrail, { width: config.size * 1.6, height: config.size * 1.6 }]} />
        <LogoKarma width={config.size} height={config.size} />
      </View>
    </Animated.View>
  );
};

const ImpactFloatingText: React.FC<{
  targetX: number;
  targetY: number;
  karmaAmount: number;
}> = ({ targetX, targetY, karmaAmount }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const delay = 480;
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 150 }),
        withDelay(700, withTiming(0, { duration: 300 }))
      )
    );

    scale.value = withDelay(
      delay,
      withSpring(1.2, { damping: 10, stiffness: 180 })
    );

    translateY.value = withDelay(
      delay,
      withTiming(-35, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );
  }, [opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: targetX - 45,
      top: targetY - 15,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.floatingBadge, animatedStyle]}>
      <Text style={styles.floatingBadgeText}>+{karmaAmount} Karma!</Text>
    </Animated.View>
  );
};

export const KarmaTrailOverlay: React.FC<KarmaTrailOverlayProps> = ({
  startX,
  startY,
  targetX = SCREEN_WIDTH / 2 + 50,
  targetY = 90,
  karmaAmount,
  onAnimationEnd,
  onImpact,
}) => {
  const particles = React.useMemo<ParticleConfig[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      delay: i * 55,
      arcFactorX: (Math.random() - 0.5) * 60,
      arcFactorY: (Math.random() - 0.5) * 40,
      size: 14 + (i % 3) * 4,
    }));
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((p, idx) => (
        <SingleParticle
          key={idx}
          config={p}
          startX={startX}
          startY={startY}
          targetX={targetX}
          targetY={targetY}
          isLast={idx === PARTICLE_COUNT - 1}
          onAnimationEnd={onAnimationEnd}
          onImpact={onImpact}
        />
      ))}
      <ImpactFloatingText
        targetX={targetX}
        targetY={targetY}
        karmaAmount={karmaAmount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  particleWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  glowTrail: {
    position: "absolute",
    borderRadius: 20,
    backgroundColor: "rgba(245, 166, 35, 0.4)",
    shadowColor: "#FFD700",
    shadowRadius: 10,
    shadowOpacity: 0.8,
    elevation: 8,
  },
  floatingBadge: {
    backgroundColor: COLORS.accent || "#7CA042",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 9999,
  },
  floatingBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: "#FFFFFF",
  },
});

export default KarmaTrailOverlay;
