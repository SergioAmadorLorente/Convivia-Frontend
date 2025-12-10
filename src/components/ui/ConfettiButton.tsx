import React, { useRef, useState, useEffect } from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleProp,
    ViewStyle,
    View,
    Animated,
    Easing,
    Dimensions,
} from "react-native";
import GLOBAL_STYLES from "../../styles/styles";
import { COLORS } from "../../styles/theme";
interface ConfettiButtonProps {
    onPress?: () => void;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: "primary" | "alt" | "success" | string;
    trigger?: boolean;
    disableAutoConfetti?: boolean;
}
const { width: screenWidth } = Dimensions.get("window");
const ConfettiButton: React.FC<ConfettiButtonProps> = ({
    onPress,
    onClick,
    disabled,
    loading,
    children,
    style,
    variant = "primary",
    trigger = false,
    disableAutoConfetti = false,
}) => {
    const resolvedOnPress = onPress ?? onClick ?? (() => { });
    const confettiCount = 30; // más partículas para la lluvia
    const particles = Array.from({ length: confettiCount });
    const animations = useRef(
        particles.map(() => ({
            translateX: new Animated.Value(Math.random() * screenWidth),
            translateY: new Animated.Value(-20 - Math.random() * 100), // empezar arriba de la pantalla
            opacity: new Animated.Value(0),
        }))
    ).current;

    const startConfetti = () => {
        animations.forEach((p) => {
            p.opacity.setValue(1);
            p.translateX.setValue(Math.random() * screenWidth); // posición inicial
            p.translateY.setValue(-300 - Math.random() * 100); // empezar arriba
            Animated.parallel([
                Animated.timing(p.translateY, {
                    toValue: 800 + Math.random() * 200,
                    duration: 2000 + Math.random() * 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(p.translateX, {
                    toValue: Math.random() * screenWidth, // nueva posición X aleatoria
                    duration: 2000 + Math.random() * 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(p.opacity, {
                    toValue: 0,
                    duration: 2000 + Math.random() * 1000,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const onButtonPress = () => {
        if (!disabled && !loading && !disableAutoConfetti) startConfetti();
        resolvedOnPress();
    };

    useEffect(() => {
        if (trigger) {
            startConfetti();
        }
    }, [trigger]);

    let baseStyle: any = GLOBAL_STYLES.buttonPrimaryGreen;
    let textStyle: any = GLOBAL_STYLES.textoBoton;

    if (variant === "alt" || variant === "secondary") {
        baseStyle = GLOBAL_STYLES.buttonSecondaryGrey;
        textStyle = GLOBAL_STYLES.textoBoton;
    }

    const buttonStyle = [baseStyle, style, disabled ? { opacity: 0.6 } : null];

    // Colores del confeti
    const confettiColors = ["#ff5f6d", "#ffc371", "#7afcff", "#9b88ff", "#6eff8a"];

    return (
        <View style={{ justifyContent: "center", alignItems: "center", width: "100%" }}>
            {/* Confeti desde arriba de la pantalla */}
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    left: -20,
                    right: 0,
                    bottom: 0,
                    zIndex: 999,
                    pointerEvents: "none",
                }}
            >
                {animations.map((p, i) => (
                    <Animated.View
                        key={i}
                        style={{
                            width: 10,
                            height: 10,
                            backgroundColor: confettiColors[i % confettiColors.length],
                            position: "absolute",
                            transform: [{ translateX: p.translateX }, { translateY: p.translateY }],
                            opacity: p.opacity,
                            borderRadius: 2,
                        }}
                    />
                ))}
            </View>
            <TouchableOpacity
                style={buttonStyle}
                onPress={onButtonPress}
                disabled={disabled}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : typeof children === "string" || typeof children === "number" ? (
                    <Text style={textStyle}>{children}</Text>
                ) : (
                    children
                )}
            </TouchableOpacity>
        </View>
    );
};
export default ConfettiButton;