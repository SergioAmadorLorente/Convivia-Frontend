// components/ui/Desplegable.tsx
import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";
import GLOBAL_STYLES from "../../styles/styles";
import { COMPONENTS, FONTS } from "../../styles/theme";
import { Ionicons } from "@expo/vector-icons";

interface DesplegableProps {
  title: string;
  fontSize?: number;
  fontWeight?: "bold" | "600" | "normal";
  children?: React.ReactNode;
  /** Nuevo: hacer opcional el comportamiento de colapso */
  collapsible?: boolean;      // default true
  /** Nuevo: ocultar/mostrar icono chevron */
  showIcon?: boolean;         // default true
  /** Nuevo: estado inicial cuando colapsable es true */
  defaultOpen?: boolean;      // default false
}

const CONTENT_ANIM_DURATION = 260;

const Desplegable: React.FC<DesplegableProps> = ({
  title,
  fontSize = 14,
  fontWeight = "bold",
  children,
  collapsible = true,
  showIcon = true,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const toggleOpen = () => {
    if (!collapsible) return;
    setIsOpen((prev) => !prev);
  };

  // Selección de Montserrat según peso
  const appliedFont = fontWeight === "bold" ? FONTS.bold : FONTS.regular;

  // ¿El contenido está visible?
  const contentVisible = collapsible ? isOpen : true;

  return (
    // El layout transition en el contenedor hace que los hermanos (otras secciones)
    // esperen a que la animación de salida del contenido termine antes de moverse.
    <Animated.View
      style={styles.container}
      layout={LinearTransition.springify().damping(15).mass(0.8).reduceMotion(ReduceMotion.Never)}
    >
      <TouchableOpacity
        style={styles.headerRow}
        onPress={toggleOpen}
        disabled={!collapsible}
        activeOpacity={collapsible ? 0.7 : 1}
      >
        <Text
          style={[
            GLOBAL_STYLES.labelBase,
            styles.titleText,
            {
              fontFamily: appliedFont,
              fontSize,
              color: COMPONENTS?.DESPLEGABLE?.leftColor ?? "#ACBF8A",
            },
          ]}
        >
          {title}
        </Text>

        {showIcon && (
          <View style={styles.iconWrapper}>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={COMPONENTS?.DESPLEGABLE?.leftColor ?? "#ACBF8A"}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Línea subrayada */}
      <View style={styles.lineFull} />

      {/* Contenido: FadeIn al abrir, FadeOut al cerrar.
          El exiting es lo clave: Reanimated mantiene el nodo vivo mientras
          dura la animación de salida, así los hermanos de abajo no saltan. */}
      {contentVisible && (
        <Animated.View
          style={styles.content}
          entering={FadeIn.duration(CONTENT_ANIM_DURATION).reduceMotion(ReduceMotion.Never)}
          exiting={FadeOut.duration(CONTENT_ANIM_DURATION).reduceMotion(ReduceMotion.Never)}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 5,
    marginTop: COMPONENTS?.DESPLEGABLE?.marginTop ?? 8,
    marginBottom: COMPONENTS?.DESPLEGABLE?.marginBottom ?? 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 24,
    position: "relative",
    paddingRight: 35,
  },
  titleText: {
    flex: 1,
    paddingRight: 10,
  },
  iconWrapper: {
    position: "absolute",
    right: 0,
    top: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 24,
  },
  lineFull: {
    alignSelf: "stretch",
    height: COMPONENTS?.DESPLEGABLE?.height ?? 2,
    backgroundColor: COMPONENTS?.DESPLEGABLE?.rightColor ?? "#6B705C",
    marginTop: COMPONENTS?.DESPLEGABLE?.gap ?? 2,
    marginBottom: COMPONENTS?.DESPLEGABLE?.marginBottom ?? 12,
  },
  content: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
});
export default Desplegable;
