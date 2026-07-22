import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Modal,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
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
import TasksDonutChart from "../../../components/ui/TasksDonutChart";
import LogoKarma from "../../../assets/logo_karma.svg";
import { useAuthListener } from "../../../hooks/useAuthListener";
import { obtenerEspacioPorUsuarioId, obtenerUsuarioEspacios } from "../../../api/usuarioEspacio";
import { obtenerKarmaUsuario, obtenerRankingKarma } from "../../../api/karma";
import { obtenerEstadisticasTareas } from "../../../api/espacio";
import { obtenerUsuarios } from "../../../api/usuario";

const { width } = Dimensions.get("window");

// Tipo para los datos de karma
interface KarmaData {
    totalPoints: number;
    monthPoints: number;
    weekPoints: number;
    completedTasks: number;
    pendingTasks: number;
    lateTasks: number;
    participants: Array<{ name: string; points: number }>;
}

const MiKarma: React.FC = () => {
    const navigation = useNavigation();
    const user = useAuthListener();
    const { t } = useTranslation();

    // Estado para los datos de karma
    const [karmaData, setKarmaData] = useState<KarmaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para el tipo de ranking y modo de vista
    const [rankingType, setRankingType] = useState<'total' | 'mensual' | 'semanal'>('total');
    const [viewMode, setViewMode] = useState<'podio' | 'lista'>('podio');
    const [allParticipants, setAllParticipants] = useState<Array<{ name: string; points: number }>>([]);
    const [infoModalVisible, setInfoModalVisible] = useState(false);

    const [fontsLoaded] = useFonts({
        DMSerifDisplay_400Regular,
        Montserrat_400Regular,
        Montserrat_700Bold,
    });

    // Cargar datos del backend
    const fetchKarmaData = useCallback(async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 1. Obtener el espacio del usuario
            const usuarioEspacio = await obtenerEspacioPorUsuarioId(user.uid);
            if (!usuarioEspacio?.espacioId) {
                throw new Error("No se encontró un espacio asignado");
            }

            const espacioId = usuarioEspacio.espacioId;
            const usuarioEspacioId = usuarioEspacio.id || usuarioEspacio.id_UsuarioEspacio;

            console.log("[MiKarma] Obteniendo estadísticas para usuarioEspacioId:", usuarioEspacioId);

            // 2. Obtener datos en paralelo con el id de relación correcto
            const limit = viewMode === 'podio' ? 3 : 100; // Top 3 para podio, todos para lista
            const [karmaUsuario, ranking, estadisticas, usuarios, usuarioEspacios] = await Promise.all([
                obtenerKarmaUsuario(espacioId, usuarioEspacioId),
                obtenerRankingKarma(espacioId, rankingType, limit),
                obtenerEstadisticasTareas(espacioId, usuarioEspacioId),
                obtenerUsuarios(),
                obtenerUsuarioEspacios(),
            ]);

            // 3. Crear un mapa de usuarios para obtener nombres
            const usuariosMap = new Map<string, string>(
                usuarios.map((u: any) => [u.id, u.nombre || u.email || "Usuario"])
            );

            // Crear un mapa de relación usuarioEspacioId -> usuarioId (Firebase UID) sólo para el espacio actual
            const uEspaciosMap = new Map<string, string>();
            if (Array.isArray(usuarioEspacios)) {
                usuarioEspacios
                    .filter((rel: any) => rel.espacioId === espacioId)
                    .forEach((rel: any) => {
                        const relId = rel.id || rel.id_UsuarioEspacio;
                        if (relId && rel.usuarioId) {
                            uEspaciosMap.set(relId.replace(/-/g, "").toLowerCase(), rel.usuarioId);
                        }
                    });
            }

            // 4. Mapear datos del ranking al formato del componente, conservando sólo miembros activos
            const getPoints = (r: any) => {
                switch (rankingType) {
                    case 'mensual':
                        return r.karmaMensual;
                    case 'semanal':
                        return r.karmaSemanal;
                    default:
                        return r.karmaTotal;
                }
            };

            const participants = ranking.ranking
                .filter((r: any) => {
                    const cleanKey = r.usuarioId?.replace(/-/g, "").toLowerCase();
                    return uEspaciosMap.has(cleanKey); // Filtrar registros inactivos/huérfanos del espacio
                })
                .map((r: any) => {
                    const cleanKey = r.usuarioId?.replace(/-/g, "").toLowerCase();
                    const firebaseUid = uEspaciosMap.get(cleanKey);
                    const name = firebaseUid ? (usuariosMap.get(firebaseUid) ?? "Usuario") : "Usuario";
                    return {
                        name,
                        points: getPoints(r),
                    };
                });

            // 5. Actualizar estado
            setKarmaData({
                totalPoints: karmaUsuario.karmaTotal,
                monthPoints: karmaUsuario.karmaMensual,
                weekPoints: karmaUsuario.karmaSemanal,
                completedTasks: estadisticas.completadas,
                pendingTasks: estadisticas.pendientes,
                lateTasks: estadisticas.tardes,
                participants: participants.slice(0, 3), // Top 3 para el podio
            });
            setAllParticipants(participants); // Todos para la lista
        } catch (err: any) {
            console.error("Error al cargar datos de karma:", err);
            setError(err.message || "Error al cargar los datos");
            setKarmaData(null);
        } finally {
            setLoading(false);
        }
    }, [user, rankingType, viewMode]);

    // Recargar datos al enfocar la pantalla
    useFocusEffect(
        useCallback(() => {
            fetchKarmaData();
        }, [fetchKarmaData])
    );

    useEffect(() => {
        fetchKarmaData();
    }, [fetchKarmaData]);

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
                <View style={styles.titleRow}>
                    <Text style={GLOBAL_STYLES.titulo}>{t('myKarma.title')}</Text>
                    <TouchableOpacity
                        style={styles.infoButton}
                        onPress={() => setInfoModalVisible(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Info karma"
                    >
                        <Ionicons name="help-circle-outline" size={26} color={COLORS.accent} />
                    </TouchableOpacity>
                </View>

                {/* Info Modal */}
                <Modal
                    visible={infoModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setInfoModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.infoModalOverlay}
                        activeOpacity={1}
                        onPress={() => setInfoModalVisible(false)}
                    >
                        <View style={styles.infoModalBox}>
                            <Ionicons name="help-circle" size={40} color={COLORS.accent} style={{ marginBottom: 10 }} />
                            <Text style={styles.infoModalTitle}>{t('myKarma.infoModalTitle')}</Text>
                            <Text style={styles.infoModalDescription}>{t('myKarma.infoModalDescription')}</Text>
                            <TouchableOpacity
                                style={styles.infoModalButton}
                                onPress={() => setInfoModalVisible(false)}
                            >
                                <Text style={styles.infoModalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
 
                {/* Loading State */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>{t('myKarma.loading')}</Text>
                    </View>
                ) : !hasData ? (
                    // Empty State
                    <View style={styles.emptyStateContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="stats-chart-outline" size={80} color={COLORS.accent} />
                        </View>
                        <Text style={styles.emptyStateTitle}>{t('myKarma.noData')}</Text>
                        <Text style={styles.emptyStateDescription}>
                            {t('myKarma.emptyDescription')}
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.emptyStateButtonText}>{t('myKarma.backProfile')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Main Points Card */}
                        <View style={styles.mainPointsCard}>
                            <Text style={styles.mainPoints}>{t('myKarma.pointsCount', { points: karmaData.totalPoints })}</Text>
                            <Text style={styles.subPoints}>{t('myKarma.ofKarma')}</Text>
                        </View>
 
                        {/* Period Cards Row */}
                        <View style={styles.periodCardsRow}>
                            <View style={styles.periodCard}>
                                <Text style={styles.cardValue}>{t('myKarma.pointsCount', { points: karmaData.monthPoints })}</Text>
                                <Text style={styles.cardLabel}>{t('myKarma.monthPoints')}</Text>
                            </View>
                            <View style={styles.periodCard}>
                                <Text style={styles.cardValue}>{t('myKarma.pointsCount', { points: karmaData.weekPoints })}</Text>
                                <Text style={styles.cardLabel}>{t('myKarma.weekPoints')}</Text>
                            </View>
                        </View>

                        {/* Statistics Section */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>{t('myKarma.statsTitle')}</Text>
 
                            {/* Header con título y selector de tipo */}
                            <View style={styles.subsectionHeader}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.subsectionTitle}>{t('myKarma.karmaKing')}</Text>
                                </View>
                                <View style={styles.underline} />
 
                            </View>

                            {/* Podio o Lista según viewMode */}
                            {viewMode === 'podio' ? (
                                /* Podium */
                                <View style={styles.podiumContainer}>
                                    {/* Position 2 - Left */}
                                    {karmaData.participants[1] && (
                                        <View style={styles.podiumColumn}>
                                            <View style={styles.avatarContainer}>
                                                <Ionicons name="person-outline" size={24} color="#999" />
                                            </View>
                                            <Text style={styles.podiumName} numberOfLines={1}>
                                                {karmaData.participants[1].name}
                                            </Text>
                                            <View style={[styles.podiumBar, styles.podiumBar2]}>
                                                <Text style={styles.podiumPoints}>
                                                    {t('myKarma.pointsCount', { points: karmaData.participants[1].points })}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Position 1 - Center (Winner) */}
                                    {karmaData.participants[0] && (
                                        <View style={styles.podiumColumn}>
                                            <View style={styles.winnerAvatarWrapper}>
                                                <View style={[styles.avatarContainer, styles.winnerAvatar]}>
                                                    <Ionicons name="person-outline" size={28} color="#999" />
                                                </View>
                                                <View style={styles.karmaBadge}>
                                                    <LogoKarma width={16} height={16} />
                                                </View>
                                            </View>
                                            <Text style={styles.podiumName} numberOfLines={1}>
                                                {karmaData.participants[0].name}
                                            </Text>
                                            <View style={[styles.podiumBar, styles.podiumBar1]}>
                                                <Text style={styles.podiumPoints}>
                                                    {t('myKarma.pointsCount', { points: karmaData.participants[0].points })}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Position 3 - Right */}
                                    {karmaData.participants[2] && (
                                        <View style={styles.podiumColumn}>
                                            <View style={styles.avatarContainer}>
                                                <Ionicons name="person-outline" size={24} color="#999" />
                                            </View>
                                            <Text style={styles.podiumName} numberOfLines={1}>
                                                {karmaData.participants[2].name}
                                            </Text>
                                            <View style={[styles.podiumBar, styles.podiumBar3]}>
                                                <Text style={styles.podiumPoints}>
                                                    {t('myKarma.pointsCount', { points: karmaData.participants[2].points })}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                /* Lista completa */
                                <View style={styles.listContainer}>
                                    {allParticipants.map((participant, index) => (
                                        <View key={index} style={styles.listItem}>
                                            <View style={styles.listRankContainer}>
                                                <Text style={[
                                                    styles.listRank,
                                                    index === 0 && styles.listRankFirst,
                                                    index === 1 && styles.listRankSecond,
                                                    index === 2 && styles.listRankThird
                                                ]}>
                                                    {index + 1}
                                                </Text>
                                            </View>
                                            <View style={styles.listAvatarContainer}>
                                                <Ionicons name="person-outline" size={20} color="#999" />
                                            </View>
                                            <Text style={styles.listName} numberOfLines={1}>
                                                {participant.name}
                                            </Text>
                                            <View style={styles.listPointsContainer}>
                                                <Text style={styles.listPoints}>
                                                    {participant.points}
                                                </Text>
                                                <Text style={styles.listPointsLabel}> {t('myKarma.points')}</Text>
                                            </View>
                                            {index === 0 && (
                                                <View style={styles.listKarmaBadge}>
                                                    <LogoKarma width={14} height={14} />
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* View Mode Selector - Debajo del podio/lista */}
                            <View style={styles.viewModeContainerBottom}>
                                {/* Ranking Type Selector */}
                                <View style={styles.selectorContainerInline}>
                                    <TouchableOpacity
                                        style={[styles.selectorButtonInline, rankingType === 'total' && styles.selectorButtonActiveInline]}
                                        onPress={() => setRankingType('total')}
                                    >
                                        <Text style={[styles.selectorButtonTextInline, rankingType === 'total' && styles.selectorButtonTextActiveInline]}>
                                            {t('myKarma.rankingTotal')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.selectorButtonInline, rankingType === 'mensual' && styles.selectorButtonActiveInline]}
                                        onPress={() => setRankingType('mensual')}
                                    >
                                        <Text style={[styles.selectorButtonTextInline, rankingType === 'mensual' && styles.selectorButtonTextActiveInline]}>
                                            {t('myKarma.rankingMonthly')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.selectorButtonInline, rankingType === 'semanal' && styles.selectorButtonActiveInline]}
                                        onPress={() => setRankingType('semanal')}
                                    >
                                        <Text style={[styles.selectorButtonTextInline, rankingType === 'semanal' && styles.selectorButtonTextActiveInline]}>
                                            {t('myKarma.rankingWeekly')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
 
                                {/* View Mode Button */}
                                <TouchableOpacity
                                    style={styles.viewModeButton}
                                    onPress={() => setViewMode(viewMode === 'podio' ? 'lista' : 'podio')}
                                >
                                    <Ionicons
                                        name={viewMode === 'podio' ? 'list' : 'podium'}
                                        size={20}
                                        color={COLORS.accent}
                                    />
                                    <Text style={styles.viewModeButtonText}>
                                        {viewMode === 'podio' ? t('myKarma.viewList') : t('myKarma.viewPodium')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Tasks Section */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.subsectionHeader}>
                                <Text style={styles.subsectionTitle}>
                                    {t('myKarma.taskStatus')}
                                </Text>
                                <View style={styles.underline} />
                            </View>

                            {/* Donut Chart Component */}
                            <TasksDonutChart
                                completedTasks={karmaData?.completedTasks || 0}
                                lateTasks={karmaData?.lateTasks || 0}
                            />
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
    viewModeContainerBottom: {
        alignItems: "center",
        marginTop: 20,
        gap: 12,
    },
    viewModeButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        ...COMMON.SHADOW,
    },
    viewModeButtonText: {
        fontFamily: FONTS.bold,
        fontSize: SIZES.text14,
        color: COLORS.accent,
        marginLeft: 6,
    },
    subsectionHeader: {
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
        marginTop: 10,
        flexWrap: "wrap",
    },
    subsectionTitle: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.text16,
        color: COLORS.accent,
    },
    selectorContainerInline: {
        flexDirection: "row",
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 2,
        ...COMMON.SHADOW,
    },
    selectorButtonInline: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    selectorButtonActiveInline: {
        backgroundColor: COLORS.accent,
    },
    selectorButtonTextInline: {
        fontFamily: FONTS.bold,
        fontSize: 11,
        color: "#999",
    },
    selectorButtonTextActiveInline: {
        color: COLORS.background,
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
        height: 100,
        backgroundColor: COLORS.background,
    },
    podiumBar3: {
        height: 80,
        backgroundColor: COLORS.background,
    },
    podiumPoints: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        color: COLORS.secondary,
        textAlign: "center",
    },
    listContainer: {
        marginTop: 20,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        ...COMMON.SHADOW,
    },
    listRankContainer: {
        width: 30,
        alignItems: "center",
    },
    listRank: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        color: "#999",
    },
    listRankFirst: {
        color: "#FFD700",
        fontSize: 18,
    },
    listRankSecond: {
        color: "#C0C0C0",
        fontSize: 17,
    },
    listRankThird: {
        color: "#CD7F32",
        fontSize: 17,
    },
    listAvatarContainer: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: "#E0E0E0",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
    },
    listName: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: SIZES.text14,
        color: COLORS.secondary,
    },
    listPointsContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        marginRight: 5,
    },
    listPoints: {
        fontFamily: FONTS.bold,
        fontSize: 16,
        color: COLORS.primary,
    },
    listPointsLabel: {
        fontFamily: FONTS.regular,
        fontSize: 12,
        color: "#999",
    },
    listKarmaBadge: {
        marginLeft: 5,
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
    // Loading State Styles
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        minHeight: 400,
    },
    loadingText: {
        marginTop: 20,
        fontFamily: FONTS.regular,
        fontSize: SIZES.text16,
        color: "#666",
    },
    switchAndButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    titleRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    infoButton: {
        marginTop: 8,
        marginLeft: 6,
        padding: 2,
    },
    infoModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
    infoModalBox: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        padding: 28,
        alignItems: "center",
        width: "100%",
        maxWidth: 340,
        ...COMMON.SHADOW,
    },
    infoModalTitle: {
        fontFamily: FONTS.title,
        fontSize: 22,
        color: COLORS.primary,
        textAlign: "center",
        marginBottom: 12,
    },
    infoModalDescription: {
        fontFamily: FONTS.regular,
        fontSize: 14,
        color: COLORS.secondary,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 22,
    },
    infoModalButton: {
        backgroundColor: COLORS.success,
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 10,
        ...COMMON.SHADOW,
    },
    infoModalButtonText: {
        fontFamily: FONTS.bold,
        fontSize: 15,
        color: COLORS.primary,
    },
});

export default MiKarma;
