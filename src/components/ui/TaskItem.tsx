import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {COLORS, FONTS, SIZES, HELPERS, COMMON} from "../../styles/theme";
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
                {isCompleted && <View style={styles.checkmark} />}
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
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
        color: "#666",
        fontFamily: "Montserrat_400Regular",
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        color: "#000",
        fontFamily: "Montserrat_700Bold",
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        fontFamily: "Montserrat_400Regular",
    },
    completedText: {
        textDecorationLine: "line-through",
        color: "#999",
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#ccc",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: "#4CAF50",
        borderColor: "#4CAF50",
    },
    checkmark: {
        width: 12,
        height: 12,
        backgroundColor: "#fff",
        borderRadius: 2,
    },
});
export default TaskItem;