// components/ui/Desplegable.tsx
import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
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
    if (!collapsible) return; // si no es colapsable, no hace nada
    setIsOpen((prev) => !prev);
  };

  // Selección de Montserrat según peso
  const appliedFont = fontWeight === "bold" ? FONTS.bold : FONTS.regular;

  // ¿El contenido está visible?
  const contentVisible = collapsible ? isOpen : true;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={toggleOpen}
        disabled={!collapsible} // deshabilitado si no hay colapso
        activeOpacity={collapsible ? 0.7 : 1}
      >
        <Text
          style={[
            GLOBAL_STYLES.labelBase,
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
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color={COMPONENTS?.DESPLEGABLE?.leftColor ?? "#ACBF8A"}
          />
        )}
      </TouchableOpacity>

      {/* Línea subrayada */}
      <View style={styles.lineFull} />

      {/* Contenido */}
      {contentVisible && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: COMPONENTS?.DESPLEGABLE?.marginTop ?? 8,
    marginBottom: COMPONENTS?.DESPLEGABLE?.marginBottom ?? 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

