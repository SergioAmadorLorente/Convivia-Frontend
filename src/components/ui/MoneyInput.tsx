import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../../styles/theme";
interface MoneyInputProps {
    value?: string;
    onChange: (value: string) => void;
}
const MoneyInput: React.FC<MoneyInputProps> = ({ value = "", onChange }) => {
    const [text, setText] = useState(value);
    const formatMoney = (val: string) => {
        // Quitamos todo lo que no sea número o coma
        let cleaned = val.replace(/[^0-9,]/g, "");
        // Solo permitimos una coma
        const parts = cleaned.split(",");
        if (parts.length > 2) {
            cleaned = parts[0] + "," + parts[1];
        }
        setText(cleaned);
        onChange(cleaned);
    };
    return (
        <View style={styles.container}>
            <TextInput
                value={text ? text + "€" : ""}
                onChangeText={formatMoney}
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0,00€"
                placeholderTextColor={COLORS.secondary + "55"}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.inputBackground,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 5,
        marginTop: 10,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    input: {
        fontSize: 28,
        fontFamily: FONTS.title,
        color: COLORS.secondary,
        textAlign: "center",
    },
});
export default MoneyInput;