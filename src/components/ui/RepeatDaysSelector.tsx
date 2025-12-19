import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { COLORS, FONTS } from "../../styles/theme";
interface RepeatDaysSelectorProps {
    onChange: (days: string[]) => void;
}
const DAYS = [
    { label: "L", name: "Lunes" },
    { label: "M", name: "Martes" },
    { label: "X", name: "Miércoles" },
    { label: "J", name: "Jueves" },
    { label: "V", name: "Viernes" },
    { label: "S", name: "Sábado" },
    { label: "D", name: "Domingo" },
];
const RepeatDaysSelector: React.FC<RepeatDaysSelectorProps> = ({ onChange }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const toggleDay = (day: string) => {
        let updated = selected.includes(day)
            ? selected.filter(d => d !== day)
            : [...selected, day];
        setSelected(updated);
        onChange(updated);
    };
    return (
        <View style={styles.wrapper}>
            <View style={styles.row}>
                {DAYS.map((d, i) => {
                    const active = selected.includes(d.name);
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => toggleDay(d.name)}
                            style={[styles.box, active && styles.boxActive]}
                        >
                            <Text style={[styles.label, active && styles.textActive]}>
                                {d.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    wrapper: {
        paddingVertical: 10,
        marginTop: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 0,
    },
    box: {
        width: 45,
        height: 45,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    boxActive: {
        backgroundColor: COLORS.success,
    },
    label: {
        fontSize: 18,
        fontFamily: FONTS.title,
        color: COLORS.secondary,
    },
    textActive: {
        color: COLORS.primary,
        fontFamily: FONTS.title,
    },
});
export default RepeatDaysSelector;