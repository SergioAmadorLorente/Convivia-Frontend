import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import {
    Montserrat_400Regular,
    Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

import { COLORS, FONTS, SIZES, COMMON, HELPERS } from "../../../styles/theme";
import GLOBAL_STYLES from "../../../styles/styles";
import BottomBar from "../../../components/ui/BottomBar";
import LogoKarma from "../../../assets/logo_karma.svg";

const { width } = Dimensions.get("window");

// Tipo para los datos de karma
interface KarmaData {
    totalPoints: number;
    monthPoints: number;
    weekPoints: number;
    completedTasks: number;
    lateTasks: number;
    participants: Array<{ name: string; points: number }>;
}

const MiKarma: React.FC = () => {
    const navigation = useNavigation();

    // Estado para simular datos (en producción vendría de API/contexto)
    const [karmaData, setKarmaData] = useState<KarmaData | null>({
        totalPoints: 290,
        monthPoints: 100,
        weekPoints: 25,
        completedTasks: 18,
        lateTasks: 4,
        participants: [
            { name: "Pepito228", points: 75 },
            { name: "Pupu Gaga", points: 290 },
            { name: "Destroyer", points: 150 },
        ],
    });

    const [fontsLoaded] = useFonts({
        DMSerifDisplay_400Regular,
        Montserrat_400Regular,
        Montserrat_700Bold,
    });

    if (!fontsLoaded) return null;

    // Verificar si hay datos
    const hasData = karmaData !== null && karmaData.totalPoints > 0;

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Title */}
                <Text style={styles.headerTitle}>Mi Karma</Text>

                {/* Debug button - remove in production */}
                <TouchableOpacity
                    style={styles.debugButton}
                    onPress={() => setKarmaData(hasData ? null : {
                        totalPoints: 290,
                        monthPoints: 100,
                        weekPoints: 25,
                        completedTasks: 18,
                        lateTasks: 4,
                        participants: [
                            { name: "Pepito228", points: 75 },
                            { name: "Pupu Gaga", points: 290 },
                            { name: "Destroyer", points: 150 },
                        ],
                    })}
                >
                    <Text style={styles.debugButtonText}>
                        {hasData ? "Simular sin datos" : "Simular con datos"}
                    </Text>
                </TouchableOpacity>

                {/* Conditional rendering: Empty state or data */}
                {!hasData ? (
                    // Empty State
                    <View style={styles.emptyStateContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="stats-chart-outline" size={80} color={COLORS.accent} />
                        </View>
                        <Text style={styles.emptyStateTitle}>No hay datos disponibles</Text>
                        <Text style={styles.emptyStateDescription}>
                            Comienza a completar tareas para acumular puntos de karma y ver tus estadísticas aquí.
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.emptyStateButtonText}>Volver al perfil</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Main Points Card */}
                        <View style={styles.mainPointsCard}>
                            <Text style={styles.mainPoints}>¡{karmaData.totalPoints} puntos!</Text>
                            <Text style={styles.subPoints}>de karma</Text>
                        </View>

                        {/* Period Cards Row */}
                        <View style={styles.periodCardsRow}>
                            <View style={styles.periodCard}>
                                <Text style={styles.cardValue}>¡{karmaData.monthPoints} puntos!</Text>
                                <Text style={styles.cardLabel}>este mes</Text>
                            </View>
                            <View style={styles.periodCard}>
                                <Text style={styles.cardValue}>¡{karmaData.weekPoints} puntos!</Text>
                                <Text style={styles.cardLabel}>esta semana</Text>
                            </View>
                        </View>

                        {/* Statistics Section */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Estadísticas</Text>
                            <View style={styles.subsectionHeader}>
                                <Text style={styles.subsectionTitle}>Rey de Karma</Text>
                                <View style={styles.underline} />
                            </View>

                            {/* Podium */}
                            <View style={styles.podiumContainer}>
                                {/* Position 2 - Left */}
                                <View style={styles.podiumColumn}>
                                    <View style={styles.avatarContainer}>
                                        <Ionicons name="person-outline" size={24} color="#999" />
                                    </View>
                                    <Text style={styles.podiumName}>Pepito228</Text>
                                    <View style={[styles.podiumBar, styles.podiumBar2]}>
                                        <Text style={styles.podiumPoints}>¡75 puntos!</Text>
                                    </View>
                                </View>

                                {/* Position 1 - Center (Winner) */}
                                <View style={styles.podiumColumn}>
                                    <View style={styles.winnerAvatarWrapper}>
                                        <View style={[styles.avatarContainer, styles.winnerAvatar]}>
                                            <Ionicons name="person-outline" size={28} color="#999" />
                                        </View>
                                        <View style={styles.karmaBadge}>
                                            <LogoKarma width={16} height={16} />
                                        </View>
                                    </View>
                                    <Text style={styles.podiumName}>Pupu Gaga</Text>
                                    <View style={[styles.podiumBar, styles.podiumBar1]}>
                                        <Text style={styles.podiumPoints}>¡290 puntos!</Text>
                                    </View>
                                </View>

                                {/* Position 3 - Right */}
                                <View style={styles.podiumColumn}>
                                    <View style={styles.avatarContainer}>
                                        <Ionicons name="person-outline" size={24} color="#999" />
                                    </View>
                                    <Text style={styles.podiumName}>Destroyer</Text>
                                    <View style={[styles.podiumBar, styles.podiumBar3]}>
                                        <Text style={styles.podiumPoints}>¡150 puntos!</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Tasks Section */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.subsectionHeader}>
                                <Text style={styles.subsectionTitle}>
                                    Tareas completas y fuera de plazo
                                </Text>
                                <View style={styles.underline} />
                            </View>

                            {/* Donut Chart */}
                            <View style={styles.chartContainer}>
                                <Svg height="280" width="280" viewBox="0 0 120 120">
                                    {/* Background circle (completed tasks - light green) */}
                                    <Circle
                                        cx="60"
                                        cy="60"
                                        r="30"
                                        stroke="#E6ECDC"
                                        strokeWidth="18"
                                        fill="none"
                                    />

                                    {/* Late tasks segment (dark) - approximately 18% */}
                                    <Circle
                                        cx="60"
                                        cy="60"
                                        r="30"
                                        stroke="#4B4741"
                                        strokeWidth="18"
                                        fill="none"
                                        strokeDasharray="34 188"
                                        strokeDashoffset="0"
                                        rotation="-90"
                                        origin="60, 60"
                                    />

                                    {/* Label line and text for "Fuera del plazo" */}
                                    <Line
                                        x1="40"
                                        y1="35"
                                        x2="20"
                                        y2="20"
                                        stroke="#4B4741"
                                        strokeWidth="0.8"
                                    />
                                    <SvgText
                                        x="15"
                                        y="15"
                                        fontSize="5"
                                        fill="#4B4741"
                                        textAnchor="middle"
                                        fontFamily={FONTS.regular}
                                    >
                                        Fuera del plazo
                                    </SvgText>
                                    <SvgText
                                        x="15"
                                        y="22"
                                        fontSize="5"
                                        fill="#4B4741"
                                        textAnchor="middle"
                                        fontFamily={FONTS.bold}
                                    >
                                        4
                                    </SvgText>

                                    {/* Label line and text for "Completadas" */}
                                    <Line
                                        x1="80"
                                        y1="75"
                                        x2="100"
                                        y2="95"
                                        stroke="#4B4741"
                                        strokeWidth="0.8"
                                    />
                                    <SvgText
                                        x="105"
                                        y="100"
                                        fontSize="5"
                                        fill="#4B4741"
                                        textAnchor="middle"
                                        fontFamily={FONTS.regular}
                                    >
                                        Completadas
                                    </SvgText>
                                    <SvgText
                                        x="105"
                                        y="107"
                                        fontSize="5"
                                        fill="#4B4741"
                                        textAnchor="middle"
                                        fontFamily={FONTS.bold}
                                    >
                                        18
                                    </SvgText>
                                </Svg>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
            <BottomBar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F4F2",
    },
    scrollContent: {
        paddingBottom: 100,
        alignItems: "center",
    },
    headerTitle: {
        ...GLOBAL_STYLES.titulo,
        marginTop: HELPERS.hp("2%"),
        marginBottom: HELPERS.hp("3%"),
    },
    mainPointsCard: {
        backgroundColor: COLORS.background,
        width: width * 0.9,
        alignItems: "center",
        paddingVertical: 30,
        borderRadius: 20,
        marginBottom: 20,
        ...COMMON.SHADOW,
    },
    mainPoints: {
        fontFamily: FONTS.title,
        fontSize: SIZES.largeTitle,
        color: COLORS.primary,
    },
    subPoints: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.text16,
        color: "#666",
        marginTop: 4,
    },
    periodCardsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: width * 0.9,
        marginBottom: 30,
    },
    periodCard: {
        width: "48%",
        backgroundColor: COLORS.background,
        borderRadius: 15,
        paddingVertical: 20,
        alignItems: "center",
        ...COMMON.SHADOW,
    },
    cardValue: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        color: COLORS.secondary,
    },
    cardLabel: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.smallText,
        color: "#666",
        marginTop: 4,
    },
    sectionContainer: {
        width: width * 0.9,
        marginBottom: 30,
    },
    sectionTitle: {
        fontFamily: FONTS.title,
        fontSize: 22,
        color: COLORS.secondary,
        marginBottom: 10,
    },
    subsectionHeader: {
        marginBottom: 20,
    },
    subsectionTitle: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.text16,
        color: COLORS.accent,
        marginBottom: 5,
    },
    underline: {
        height: 1,
        backgroundColor: COLORS.primary,
        width: "100%",
    },
    podiumContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
        height: 200,
        marginTop: 20,
    },
    podiumColumn: {
        alignItems: "center",
        marginHorizontal: 8,
        flex: 1,
    },
    avatarContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: "#E0E0E0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    winnerAvatarWrapper: {
        position: "relative",
        marginBottom: 8,
    },
    winnerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    karmaBadge: {
        position: "absolute",
        top: -2,
        right: -2,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: COLORS.secondary,
    },
    podiumName: {
        fontFamily: FONTS.bold,
        fontSize: 11,
        color: COLORS.secondary,
        marginBottom: 8,
        textAlign: "center",
    },
    podiumBar: {
        width: "100%",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 5,
        ...COMMON.SHADOW,
    },
    podiumBar1: {
        height: 120,
        backgroundColor: "#E6ECDC",
    },
    podiumBar2: {
        height: 80,
        backgroundColor: COLORS.background,
    },
    podiumBar3: {
        height: 100,
        backgroundColor: COLORS.background,
    },
    podiumPoints: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        color: COLORS.secondary,
        textAlign: "center",
    },
    chartContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    // Empty State Styles
    emptyStateContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        paddingVertical: 60,
        minHeight: 400,
    },
    emptyIconContainer: {
        marginBottom: 30,
    },
    emptyStateTitle: {
        fontFamily: FONTS.title,
        fontSize: 24,
        color: COLORS.primary,
        textAlign: "center",
        marginBottom: 15,
    },
    emptyStateDescription: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.text14,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 30,
    },
    emptyStateButton: {
        backgroundColor: COLORS.success,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        ...COMMON.SHADOW,
    },
    emptyStateButtonText: {
        fontFamily: FONTS.bold,
        fontSize: SIZES.text16,
        color: COLORS.primary,
    },
    // Debug Button Styles (remove in production)
    debugButton: {
        backgroundColor: "#FFE5B4",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#FFA500",
    },
    debugButtonText: {
        fontFamily: FONTS.bold,
        fontSize: 12,
        color: "#FF8C00",
        textAlign: "center",
    },
});

export default MiKarma;
