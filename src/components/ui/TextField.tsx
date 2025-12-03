import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GLOBAL_STYLES from "../../styles/styles";
import { moderateScale } from "react-native-size-matters";
import { COLORS, COMMON } from "../../styles/theme";

interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  error?: string;
  secureTextEntry?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  error,
  secureTextEntry = false,
}) => {
  const [show, setShow] = useState<boolean>(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[GLOBAL_STYLES.labelBase, GLOBAL_STYLES.labelMarginSmall]}>
          {label}
        </Text>
      )}

      <View style={[COMMON.INPUT_CONTAINER, error ? styles.inputError : null]}>
        <TextInput
          style={[COMMON.INPUT_BASE, { flex: 1 }]}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={
            keyboardType === "email-address" ? "none" : "sentences"
          }
          autoCorrect={false}
          secureTextEntry={isPassword && !show}
          value={value}
          onChangeText={onChangeText}
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
      </View>

      {error && <Text style={GLOBAL_STYLES.errorText}>{error}</Text>}
    </View>
  );
};

export default TextField;

const styles = StyleSheet.create({
  wrapper: {
    width: "90%",
    marginTop: 12,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 8,
  },
});
