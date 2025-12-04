import React, { useRef, useState } from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleProp,
    ViewStyle,
    View,
    Animated,
    Easing,
    LayoutChangeEvent,
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
    // --------------------------------------------------
    // Guardar la posición y tamaño del botón en pantalla
    // --------------------------------------------------
    const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const onLayout = (e: LayoutChangeEvent) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        setLayout({ x, y, width, height });
    };
    // -----------------------------
    // Confeti (cuadraditos animados)
    // -----------------------------
    const confettiCount = 24;
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
                    duration: 700 + Math.random() * 300,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(p.translateY, {
                    toValue: -140 - Math.random() * 160,
                    duration: 700 + Math.random() * 300,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(p.opacity, {
                    toValue: 0,
                    duration: 700 + Math.random() * 300,
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
    // 🔥 Cálculo del centro del botón
    const originX = layout.width / 2;
    const originY = layout.height / 2;
    return (
        <View
            style={{ justifyContent: "center", alignItems: "center" }}
        >
            {/* Confeti superpuesto */}
            <View
                style={{
                    position: "absolute",
                    width: layout.width,
                    height: layout.height,
                    left: layout.x,
                    top: layout.y,
                    zIndex: 999,
                }}
                pointerEvents="none"
            >
                {animations.map((p, i) => (
                    <Animated.View
                        key={i}
                        style={{
                            width: 10,
                            height: 10,
                            backgroundColor: confettiColors[i % confettiColors.length],
                            position: "absolute",
                            transform: [
                                { translateX: Animated.add(p.translateX, new Animated.Value(originX)) },
                                { translateY: Animated.add(p.translateY, new Animated.Value(originY)) },
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
                onLayout={onLayout} // <- mide tamaño y posición del botón
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