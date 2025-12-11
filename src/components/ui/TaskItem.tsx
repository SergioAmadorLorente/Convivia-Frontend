import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS, SIZES, HELPERS, COMMON } from "../../styles/theme";
import GLOBAL_STYLES from "../../styles/styles";
interface TaskItemProps {
    time: string;
    title: string;
    subtitle?: string;
    isCompleted: boolean;
    onToggle: () => void;
}
const TaskItem: React.FC<TaskItemProps> = ({
    time,
    title,
    subtitle,
    isCompleted,
    onToggle,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{time}</Text>
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, isCompleted && styles.completedText]}>
                    {title}
                </Text>
                {subtitle && (
                    <Text style={[styles.subtitle, isCompleted && styles.completedText]}>
                        {subtitle}
                    </Text>
                )}
            </View>
            <TouchableOpacity
                style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
                onPress={onToggle}
            >
                {isCompleted && (
                    <Text style={styles.tick}>✔</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    timeContainer: {
        marginRight: 16,
    },
    timeText: {
        fontSize: 14,
        color: COLORS.secondary,
        fontFamily: FONTS.regular,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        color: COLORS.secondary,
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.secondary,
        fontFamily: FONTS.regular,
    },
    completedText: {
        textDecorationLine: "line-through",
        color: COLORS.border,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    tick: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: "bold",
    },
});
export default TaskItem;