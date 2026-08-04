import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, FONTS, SIZES, HELPERS, COMMON } from "../../styles/theme";
import GLOBAL_STYLES from "../../styles/styles";
interface TabSwitcherProps {
    activeTab: "tareas" | "facturas";
    onTabChange: (tab: "tareas" | "facturas") => void;
}
const TabSwitcher: React.FC<TabSwitcherProps> = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "tareas" && styles.tabActive,
                ]}
                onPress={() => onTabChange("tareas")}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "tareas" && styles.tabTextActive,
                    ]}
                >
                    {t('dashboard.tabs.tasks')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "facturas" && styles.tabActive,
                ]}
                onPress={() => onTabChange("facturas")}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "facturas" && styles.tabTextActive,
                    ]}
                >
                    {t('dashboard.tabs.invoices')}
                </Text>
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 17,
        width: "90%",
        alignSelf: "center",
        marginBottom: 5,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        alignItems: "center",
        // ⭐ Sombra idéntica a tu screenshot: suave, amplia, poco opaca
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
        // Android
        elevation: 4,
    },
    tabActive: {
        backgroundColor: COLORS.success,
    },
    tabText: {
        fontSize: 16,
        color: COLORS.secondary,
        fontFamily: FONTS.regular,
    },
    tabTextActive: {
        color: COLORS.primary,
        fontFamily: FONTS.bold,
    },
});
export default TabSwitcher;