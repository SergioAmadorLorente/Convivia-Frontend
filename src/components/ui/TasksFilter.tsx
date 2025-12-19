import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { COLORS, FONTS } from "../../styles/theme";
interface TasksFilterProps {
    onFilterChange: (filter: "today" | "week" | "all") => void;
}
const FILTER_OPTIONS = [
    { key: "today", label: "Hoy" },
    { key: "week", label: "Esta semana" },
    { key: "all", label: "Todo" }
] as const;
const TasksFilter: React.FC<TasksFilterProps> = ({ onFilterChange }) => {
    const [selected, setSelected] = useState<"today" | "week" | "all">("today");
    const handleSelect = (key: "today" | "week" | "all") => {
        setSelected(key);
        onFilterChange(key);
    };
    return (
        <View style={styles.wrapper}>
            <View style={styles.row}>
                {FILTER_OPTIONS.map(item => {
                    const active = item.key === selected;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            onPress={() => handleSelect(item.key)}
                            style={[styles.box, active && styles.boxActive]}
                        >
                            <Text style={[styles.label, active && styles.textActive]}>
                                {item.label}
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
        paddingVertical: 0,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
    },
    box: {
        width: 100,
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
        fontSize: 16,
        fontFamily: FONTS.regular,
        color: COLORS.secondary,
        textAlign: "center",
    },
    textActive: {
        color: COLORS.primary,
        fontFamily: FONTS.bold,
    },
});
export default TasksFilter;