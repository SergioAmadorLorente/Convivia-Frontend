import React from "react";
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
            {/* Nuevo checkbox usando CHECKBOX */}
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
});
export default TaskItem;