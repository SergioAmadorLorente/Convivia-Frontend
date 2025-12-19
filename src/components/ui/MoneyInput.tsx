import React, { useState } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import { COLORS, FONTS } from "../../styles/theme";

interface MoneyInputProps {
    value?: string;
    onChange: (value: string) => void;
}

const MoneyInput: React.FC<MoneyInputProps> = ({ value = "", onChange }) => {
    const [text, setText] = useState(value);

    React.useEffect(() => {
        setText(value);
    }, [value]);
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
            <View style={styles.inputWrapper}>
                <TextInput
                    value={text}
                    onChangeText={formatMoney}
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="0,00"
                    placeholderTextColor={COLORS.secondary + "55"}
                    maxLength={5}
                />
                <Text style={styles.currency}>€</Text>
            </View>
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
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        fontSize: 28,
        fontFamily: FONTS.title,
        color: COLORS.secondary,
        textAlign: "center",
        flex: 1,
    },
    currency: {
        fontSize: 28,
        fontFamily: FONTS.title,
        color: COLORS.secondary,
        marginLeft: 5,
    },
});

export default MoneyInput;