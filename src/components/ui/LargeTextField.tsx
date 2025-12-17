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

interface LargeTextFieldProps {
    label?: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: TextInputProps["keyboardType"];
    error?: string;
    secureTextEntry?: boolean;
    editable?: boolean;
}

const LargeTextField: React.FC<LargeTextFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    error,
    secureTextEntry = false,
    editable = true,
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

            <View style={[COMMON.INPUT_CONTAINER, { height: 90, }, error ? styles.inputError : null]}>
                <TextInput
                    style={[COMMON.INPUT_BASE, { flex: 1, height: moderateScale(80), textAlignVertical: "top" }]}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    autoCapitalize={
                        keyboardType === "email-address" ? "none" : "sentences"
                    }
                    autoCorrect={false}
                    secureTextEntry={isPassword && !show}
                    value={value}
                    onChangeText={onChangeText}
                    editable={editable}
                    multiline={true}
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

export default LargeTextField;

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
