// components/AnimatedLogo.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

const AnimatedLogo: React.FC = () => {
  // Animated values
  const leftScale = useRef(new Animated.Value(0)).current;
  const bottomScale = useRef(new Animated.Value(0)).current;
  const topScale = useRef(new Animated.Value(0)).current;
  const rightScale = useRef(new Animated.Value(0)).current;
  const innerLeftScale = useRef(new Animated.Value(0)).current;
  const innerBottomScale = useRef(new Animated.Value(0)).current;
  const dorlockLowScale = useRef(new Animated.Value(0)).current;
  const dorlockHightScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bottomScale, {
        toValue: 1,
        duration: 375,
        useNativeDriver: true,
      }),
      Animated.timing(leftScale, {
        toValue: 1,
        duration: 375,
        useNativeDriver: true,
      }),
      Animated.timing(topScale, {
        toValue: 1,
        duration: 375,
        useNativeDriver: true,
      }),
      Animated.timing(rightScale, {
        toValue: 1,
        duration: 375,
        useNativeDriver: true,
      }),
      Animated.timing(innerBottomScale, {
        toValue: 1,
        duration: 375,
        useNativeDriver: true,
      }),
      Animated.timing(innerLeftScale, {
        toValue: 1,
        duration: 375,
        useNativeDriver: true,
      }),
      Animated.timing(dorlockLowScale, {
        toValue: 1,
        duration: 375,
        useNativeDriver: true,
      }),
      Animated.timing(dorlockHightScale, {
        toValue: 1,
        duration: 375,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.logoShapes}>
      {/* Barras exteriores */}
      <Animated.View
        style={[
          styles.bar,
          styles.bottom,
          {
            transform: [
              { translateX: 95.5 },
              { scaleX: bottomScale },
              { translateX: -95.5 },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bar,
          styles.left,
          {
            transform: [
              { translateY: 156 },
              { scaleY: leftScale },
              { translateY: -156 },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bar,
          styles.top,
          {
            transform: [
              { translateX: -77.5 },
              { scaleX: topScale },
              { translateX: 77.5 },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bar,
          styles.right,
          {
            transform: [
              { translateY: -120 },
              { scaleY: rightScale },
              { translateY: 120 },
            ],
          },
        ]}
      />

      {/* Barras interiores */}
      <Animated.View
        style={[
          styles.bar,
          styles.innerBottom,
          {
            transform: [
              { translateX: 77.5 },
              { scaleX: innerBottomScale },
              { translateX: -77.5 },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bar,
          styles.innerLeft,
          {
            transform: [
              { translateY: 120 },
              { scaleY: innerLeftScale },
              { translateY: -120 },
            ],
          },
        ]}
      />

      {/* Tick */}
      <View style={styles.dorlockContainer}>
        <Animated.View
          style={[
            styles.bar,
            styles.dorlockHight,
            {
              transform: [
                { translateY: 21 },
                { scaleY: dorlockHightScale },
                { translateY: -21 },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.bar,
            styles.dorlockLow,
            {
              transform: [
                { translateX: -11 },
                { scaleX: dorlockLowScale },
                { translateX: 11 },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoShapes: {
    position: "relative",
    width: 191,
    height: 312,
    marginBottom: 18,
  },
  bar: { backgroundColor: "#6d715d", position: "absolute" },
  left: { left: 0, top: 0, width: 18, height: 312 },
  bottom: { left: 0, top: 294, width: 191, height: 18 },
  top: { left: 36, top: 0, width: 155, height: 18 },
  right: { left: 173, top: 0, width: 18, height: 240 },
  innerLeft: {
    left: 36,
    top: 36,
    width: 18,
    height: 240,
    backgroundColor: "#b2c49a",
  },
  innerBottom: {
    left: 36,
    top: 258,
    width: 155,
    height: 18,
    backgroundColor: "#b2c49a",
  },
  dorlockContainer: {
    position: "absolute",
    left: 145,
    top: 125,
    transform: [{ rotate: "45deg" }],
  },
  dorlockHight: {
    left: 5,
    top: 0,
    width: 12,
    height: 42,
    backgroundColor: "#b2c49a",
  },
  dorlockLow: {
    left: -10,
    top: 30,
    width: 22,
    height: 12,
    backgroundColor: "#b2c49a",
  },
});

export default AnimatedLogo;
