import React, { useRef } from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleProp,
    ViewStyle,
    View,
    Animated,
    Easing,
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
}
const ConfettiButton: React.FC<ConfettiButtonProps> = ({
    onPress,
    onClick,
    disabled,
    loading,
    children,
    style,
    variant = "primary",
}) => {
    const resolvedOnPress = onPress ?? onClick ?? (() => { });
    // -----------------------------
    // Confeti (cuadraditos animados)
    // -----------------------------
    const confettiCount = 20;
    const particles = Array.from({ length: confettiCount });
    const animations = useRef(
        particles.map(() => ({
            translateX: new Animated.Value(0),
            translateY: new Animated.Value(0),
            opacity: new Animated.Value(1),
        }))
    ).current;
    const startConfetti = () => {
        animations.forEach((p) => {
            p.translateX.setValue(0);
            p.translateY.setValue(0);
            p.opacity.setValue(1);
            Animated.parallel([
                Animated.timing(p.translateX, {
                    toValue: (Math.random() - 0.5) * 200,
                    duration: 800 + Math.random() * 300,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(p.translateY, {
                    toValue: -150 - Math.random() * 150,
                    duration: 800 + Math.random() * 300,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(p.opacity, {
                    toValue: 0,
                    duration: 800 + Math.random() * 300,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };
    const onButtonPress = () => {
        if (!disabled && !loading) startConfetti();
        resolvedOnPress();
    };
    // -----------------------------
    // Estilos del botón (igual que tu Button)
    // -----------------------------
    let baseStyle: any = GLOBAL_STYLES.buttonPrimaryGreen;
    let textStyle: any = GLOBAL_STYLES.textoBoton;
    if (variant === "alt" || variant === "secondary") {
        baseStyle = GLOBAL_STYLES.buttonSecondaryGrey;
        textStyle = GLOBAL_STYLES.textoBoton;
    }
    const buttonStyle = [baseStyle, style, disabled ? { opacity: 0.6 } : null];
    // Colores del confeti
    const confettiColors = [
        "#ff5f6d",
        "#ffc371",
        "#7afcff",
        "#9b88ff",
        "#6eff8a",
    ];
    return (
        <View>
            {/* Confeti superpuesto */}
            <View
                style={{
                    position: "absolute",
                    width: "100%",
                    height: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999,
                }}
                pointerEvents="none"
            >
                {animations.map((p, i) => (
                    <Animated.View
                        key={i}
                        style={{
                            width: 10,
                            height: 10,
                            backgroundColor:
                                confettiColors[i % confettiColors.length],
                            position: "absolute",
                            transform: [
                                { translateX: p.translateX },
                                { translateY: p.translateY },
                            ],
                            opacity: p.opacity,
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