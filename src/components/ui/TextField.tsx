import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import GLOBAL_STYLES from "../../styles/styles";
import { moderateScale } from "react-native-size-matters";
import { COLORS, COMMON, SIZES } from "../../styles/theme";

interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  error?: string;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  textAlign?: 'left' | 'center' | 'right';
  contenAlign?: 'flex-start' | 'center' | 'flex-end';
  caretHidden?: boolean;
  fontSize?: number;
  showClipboard?: boolean;
  onBlur?: () => void;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  error,
  secureTextEntry = false,
  rightIcon,
  textAlign = 'left',
  contenAlign = 'flex-start',
  caretHidden = false,
  fontSize,
  showClipboard = false,
  onBlur,
}) => {
  const [show, setShow] = useState<boolean>(false);
  const isPassword = !!secureTextEntry;
  const textInputRef = useRef<TextInput>(null);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        // Primero limpiar el campo
        onChangeText("");
        // Luego establecer el nuevo valor
        setTimeout(() => {
          onChangeText(text);
        }, 0);
      }
    } catch (error) {
      // console.error("Error al pegar del portapapeles:", error);
    }
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[GLOBAL_STYLES.labelBase, GLOBAL_STYLES.labelMarginSmall]}>
          {label}
        </Text>
      )}

      <View style={[COMMON.INPUT_CONTAINER, error ? styles.inputError : null, { justifyContent: contenAlign, height: textAlign === 'center' ? moderateScale(60) : undefined }]}>
        <TextInput
          ref={textInputRef}
          style={[COMMON.INPUT_BASE, { flex: 1, textAlign: textAlign, fontSize: fontSize || (textAlign === 'center' ? moderateScale(24) : SIZES.input), fontWeight: textAlign === 'center' ? '600' : 'normal', letterSpacing: textAlign === 'center' ? 4 : 0, paddingVertical: textAlign === 'center' ? moderateScale(12) : undefined }]}
          placeholder={placeholder}
          placeholderTextColor="rgba(0, 0, 0, 0.4)"
          keyboardType={keyboardType}
          autoCapitalize={
            keyboardType === "email-address" ? "none" : "sentences"
          }
          autoCorrect={false}
          secureTextEntry={isPassword && !show}
          value={value}
          onChangeText={onChangeText}
          caretHidden={caretHidden}
          onBlur={onBlur}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShow(!show)}
            style={styles.eyeButton}
            accessible
            accessibilityRole="button"
            accessibilityLabel={
              show ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            <Ionicons
              name={show ? "eye-off" : "eye"}
              size={moderateScale(22)}
              color={COLORS.accent}
            />
          </TouchableOpacity>
        )}

        {!isPassword && showClipboard && (
          <TouchableOpacity
            onPress={handlePasteFromClipboard}
            style={styles.eyeButton}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Pegar del portapapeles"
          >
            <Ionicons
              name="clipboard-outline"
              size={moderateScale(22)}
              color={COLORS.accent}
            />
          </TouchableOpacity>
        )}

        {!isPassword && !showClipboard && rightIcon && (
          <View style={styles.eyeButton}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={GLOBAL_STYLES.errorText}>{error}</Text>}
    </View>
  );
};

export default TextField;

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "stretch",
    marginTop: 12,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 8,
  }
});
