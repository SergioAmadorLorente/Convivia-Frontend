import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LogoCompleto from "../../assets/logo_completo.svg";

interface CustomHeaderProps {
  onLogout?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ onLogout }) => {
  return (
    <View
      style={{
        height: 450,
        backgroundColor: "#F5F4F2",
        justifyContent: "center",
      }}
    >
      {/* Botón de logout */}
      <TouchableOpacity
        onPress={onLogout}
        style={{
          position: "absolute",
          top: 70,
          left: 25,
          zIndex: 1,
        }}
      >
        <MaterialIcons name="logout" size={28} color="#ACBF8A" />
      </TouchableOpacity>

      {/* Logo + dibujo */}
      <View
        style={{
          alignItems: "center",
          marginTop: 50,
        }}
      >
        <LogoCompleto
          width={250}
          height={70}
          style={{
            marginTop: 20,
          }}
        />
        <Image
          source={require("../../assets/dibujo.png")}
          style={{
            width: 230,
            height: 200,
            marginTop: 40,
          }}
        />
      </View>
    </View>
  );
};

export default CustomHeader;
