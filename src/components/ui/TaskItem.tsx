import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../../styles/theme";
import { CHECKBOX } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";

interface TaskItemProps {
    time: string;
    title: string;
    subtitle?: string;
    isCompleted: boolean;
    onToggle: () => void;
    fechaLimite?: string; // formato dd/mm
    unassigned?: boolean; // indica si la tarea está sin asignar
}

const TaskItem: React.FC<TaskItemProps> = ({
    time,
    title,
    subtitle,
    isCompleted,
    onToggle,
    fechaLimite,
    unassigned = false,
}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{time}</Text>
                {fechaLimite && (
                    <Text style={styles.dateText}>{fechaLimite}</Text>
                )}
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, isCompleted && styles.completedText]}>
                    {title}
                </Text>
            </View>

            {/* Icono de exclamación si está sin asignar */}
            {unassigned && (
                <View style={styles.unassignedIconContainer}>
                    <TouchableOpacity
                        onPress={() => setShowTooltip(!showTooltip)}
                        activeOpacity={0.8}
                        style={CHECKBOX.touchArea}
                    >
                        <Feather
                            name="alert-circle"
                            size={CHECKBOX.iconSize}
                            color={COLORS.accent}
                        />
                    </TouchableOpacity>
                    {showTooltip && (
                        <View style={styles.tooltip}>
                            <Text style={styles.tooltipText}>Sin asignar</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Checkbox */}
            <TouchableOpacity
                onPress={onToggle}
                activeOpacity={0.8}
                style={CHECKBOX.touchArea}
            >
                <Feather
                    name={isCompleted ? "check-square" : "square"}
                    size={CHECKBOX.iconSize}
                    color={
                        isCompleted
                            ? CHECKBOX.colors.checked
                            : CHECKBOX.colors.unchecked
                    }
                />
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.inputBackground,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    timeContainer: {
        marginRight: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    timeText: {
        fontSize: 14,
        color: COLORS.secondary,
        fontFamily: FONTS.regular,
    },
    dateText: {
        fontSize: 14,
        color: COLORS.secondary,
        fontFamily: FONTS.regular,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        color: COLORS.secondary,
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.secondary,
        fontFamily: FONTS.regular,
    },
    completedText: {
        textDecorationLine: "line-through",
        color: COLORS.border,
    },
    unassignedIconContainer: {
        marginRight: 8,
        position: "relative",
    },
    tooltip: {
        position: "absolute",
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        bottom: 28,
        right: 0,
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 5,
    },
    tooltipText: {
        fontSize: 12,
        color: COLORS.background,
        fontFamily: FONTS.regular,
    },
});
export default TaskItem;