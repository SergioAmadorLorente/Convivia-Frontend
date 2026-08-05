import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Image,
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

import { COLORS, FONTS, SIZES, COMMON } from "../../../styles/theme";
import GLOBAL_STYLES from "../../../styles/styles";
import BottomBar from "../../../components/ui/BottomBar";
import TasksDonutChart from "../../../components/ui/TasksDonutChart";
import LogoKarma from "../../../assets/logo_karma.svg";
import { useAuthListener } from "../../../hooks/useAuthListener";
import { obtenerEspacioPorUsuarioId, obtenerUsuarioEspacios } from "../../../api/usuarioEspacio";
import { obtenerKarmaUsuario, obtenerRankingKarma } from "../../../api/karma";
import { obtenerEstadisticasTareas } from "../../../api/espacio";
import { obtenerUsuarios, getFullFotoUrl } from "../../../api/usuario";
import { photoCache } from "../../../hooks/useProfilePhoto";




// Tipo para los datos de karma
interface KarmaParticipant {
    name: string;
    points: number;
    fotoUrl?: string | null;
}

interface KarmaData {
    totalPoints: number;
    monthPoints: number;
    weekPoints: number;
    completedTasks: number;
    pendingTasks: number;
    lateTasks: number;
    participants: KarmaParticipant[];
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

            // 3. Crear un mapa de usuarios para obtener nombres y fotos
            const usuariosMap = new Map<string, any>(
                usuarios.map((u: any) => [u.id, u])
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

            const participants: KarmaParticipant[] = await Promise.all(
                ranking.ranking
                    .filter((r: any) => {
                        const cleanKey = r.usuarioId?.replace(/-/g, "").toLowerCase();
                        return uEspaciosMap.has(cleanKey); // Filtrar registros inactivos/huérfanos del espacio
                    })
                    .map(async (r: any) => {
                        const cleanKey = r.usuarioId?.replace(/-/g, "").toLowerCase();
                        const firebaseUid = uEspaciosMap.get(cleanKey);
                        const userObj = firebaseUid ? usuariosMap.get(firebaseUid) : null;
                        const name = userObj ? (userObj.nombre || userObj.email || "Usuario") : "Usuario";

                        const rawFotoUrl = userObj?.fotoUrl ?? userObj?.FotoUrl ?? null;
                        const fotoUrl =
                            (firebaseUid ? photoCache.get(firebaseUid) : null) ??
                            getFullFotoUrl(rawFotoUrl) ??
                            null;

                        return {
                            name,
                            points: getPoints(r),
                            fotoUrl,
                        };
                    })
            );

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
                {/* ── Header ── */}
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

                {/* ── Info Modal ── */}
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

                {/* ── Loading ── */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>{t('myKarma.loading')}</Text>
                    </View>

                ) : !hasData ? (
                    /* ── Empty State ── */
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
                        {/* ── Hero card: puntos totales ── */}
                        <View style={styles.heroCard}>
                            <View style={styles.heroLogoRow}>
                                <LogoKarma width={28} height={28} />
                                <Text style={styles.heroLabel}>{t('myKarma.ofKarma')}</Text>
                            </View>
                            <Text style={styles.heroPoints}>
                                {t('myKarma.pointsCount', { points: karmaData.totalPoints })}
                            </Text>
                            <View style={styles.heroDivider} />
                            <View style={styles.heroPeriodRow}>
                                <View style={styles.heroPeriodItem}>
                                    <Text style={styles.heroPeriodValue}>
                                        {t('myKarma.pointsCount', { points: karmaData.monthPoints })}
                                    </Text>
                                    <Text style={styles.heroPeriodLabel}>{t('myKarma.monthPoints')}</Text>
                                </View>
                                <View style={styles.heroPeriodDivider} />
                                <View style={styles.heroPeriodItem}>
                                    <Text style={styles.heroPeriodValue}>
                                        {t('myKarma.pointsCount', { points: karmaData.weekPoints })}
                                    </Text>
                                    <Text style={styles.heroPeriodLabel}>{t('myKarma.weekPoints')}</Text>
                                </View>
                            </View>
                        </View>

                        {/* ── Sección ranking ── */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionHeaderAccent} />
                                <Text style={styles.sectionTitle}>{t('myKarma.karmaKing')}</Text>
                            </View>

                            {/* Podio o Lista */}
                            {viewMode === 'podio' ? (
                                <View style={styles.podiumContainer}>
                                    {/* Posición 2 – plata */}
                                    {karmaData.participants[1] && (
                                        <View style={styles.podiumColumn}>
                                            <View style={[styles.podiumAvatarRing, styles.podiumRingSilver]}>
                                                {karmaData.participants[1].fotoUrl ? (
                                                    <Image
                                                        source={{ uri: karmaData.participants[1].fotoUrl }}
                                                        style={styles.podiumAvatarImg}
                                                    />
                                                ) : (
                                                    <Ionicons name="person" size={22} color="#A8A8A8" />
                                                )}
                                            </View>
                                            <Text style={styles.podiumMedal}>🥈</Text>
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

                                    {/* Posición 1 – oro (centro, más alto) */}
                                    {karmaData.participants[0] && (
                                        <View style={[styles.podiumColumn, { zIndex: 2 }]}>
                                            <View style={[styles.podiumAvatarRing, styles.podiumRingGold, styles.podiumAvatarRingLarge]}>
                                                {karmaData.participants[0].fotoUrl ? (
                                                    <Image
                                                        source={{ uri: karmaData.participants[0].fotoUrl }}
                                                        style={styles.podiumAvatarImgLarge}
                                                    />
                                                ) : (
                                                    <Ionicons name="person" size={30} color="#FFD700" />
                                                )}
                                            </View>
                                            <View style={styles.karmaBadge}>
                                                <LogoKarma width={13} height={13} />
                                            </View>
                                            <Text style={styles.podiumMedal}>🥇</Text>
                                            <Text style={[styles.podiumName, styles.podiumNameWinner]} numberOfLines={1}>
                                                {karmaData.participants[0].name}
                                            </Text>
                                            <View style={[styles.podiumBar, styles.podiumBar1]}>
                                                <Text style={[styles.podiumPoints, styles.podiumPointsWinner]}>
                                                    {t('myKarma.pointsCount', { points: karmaData.participants[0].points })}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Posición 3 – bronce */}
                                    {karmaData.participants[2] && (
                                        <View style={styles.podiumColumn}>
                                            <View style={[styles.podiumAvatarRing, styles.podiumRingBronze]}>
                                                {karmaData.participants[2].fotoUrl ? (
                                                    <Image
                                                        source={{ uri: karmaData.participants[2].fotoUrl }}
                                                        style={styles.podiumAvatarImg}
                                                    />
                                                ) : (
                                                    <Ionicons name="person" size={22} color="#CD7F32" />
                                                )}
                                            </View>
                                            <Text style={styles.podiumMedal}>🥉</Text>
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
                                    {allParticipants.map((participant: any, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.listItem,
                                                index === 0 && styles.listItemGold,
                                                index === 1 && styles.listItemSilver,
                                                index === 2 && styles.listItemBronze,
                                            ]}
                                        >
                                            <Text style={[
                                                styles.listRank,
                                                index === 0 && styles.listRankFirst,
                                                index === 1 && styles.listRankSecond,
                                                index === 2 && styles.listRankThird,
                                            ]}>
                                                {index + 1}
                                            </Text>
                                            <View style={[
                                                styles.listAvatarContainer,
                                                index === 0 && styles.listAvatarGold,
                                                index === 1 && styles.listAvatarSilver,
                                                index === 2 && styles.listAvatarBronze,
                                            ]}>
                                                {participant.fotoUrl ? (
                                                    <Image
                                                        source={{ uri: participant.fotoUrl }}
                                                        style={{ width: 33, height: 33, borderRadius: 16.5 }}
                                                    />
                                                ) : (
                                                    <Ionicons name="person" size={18} color={COLORS.primary} />
                                                )}
                                            </View>
                                            <Text style={styles.listName} numberOfLines={1}>
                                                {participant.name}
                                            </Text>
                                            <View style={styles.listPointsContainer}>
                                                <Text style={styles.listPoints}>{participant.points}</Text>
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

                            {/* Controles: selector periodo + toggle vista */}
                            <View style={styles.controlsRow}>
                                <View style={styles.pillSelector}>
                                    {(['total', 'mensual', 'semanal'] as const).map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[styles.pillBtn, rankingType === type && styles.pillBtnActive]}
                                            onPress={() => setRankingType(type)}
                                        >
                                            <Text style={[styles.pillBtnText, rankingType === type && styles.pillBtnTextActive]}>
                                                {t(`myKarma.ranking${type === 'total' ? 'Total' : type === 'mensual' ? 'Monthly' : 'Weekly'}`)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TouchableOpacity
                                    style={styles.toggleViewBtn}
                                    onPress={() => setViewMode(viewMode === 'podio' ? 'lista' : 'podio')}
                                >
                                    <Ionicons
                                        name={viewMode === 'podio' ? 'list' : 'podium'}
                                        size={18}
                                        color={COLORS.primary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ── Sección tareas ── */}
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionHeaderAccent} />
                                <Text style={styles.sectionTitle}>{t('myKarma.taskStatus')}</Text>
                            </View>
                            <View style={styles.chartCard}>
                                <TasksDonutChart
                                    completedTasks={karmaData?.completedTasks || 0}
                                    lateTasks={karmaData?.lateTasks || 0}
                                />
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
        paddingBottom: 110,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 4,
    },

    // ── Header ──
    titleRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    infoButton: {
        marginTop: 8,
        marginLeft: 6,
        padding: 2,
    },

    // ── Hero card ──
    heroCard: {
        width: "100%",
        backgroundColor: COLORS.success,
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 24,
        alignItems: "center",
        marginBottom: 24,
        ...COMMON.SHADOW,
    },
    heroLogoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    heroLabel: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.text14,
        color: COLORS.primary,
        letterSpacing: 0.5,
    },
    heroPoints: {
        fontFamily: FONTS.title,
        fontSize: SIZES.largeTitle,
        color: COLORS.secondary,
        marginBottom: 4,
    },
    heroDivider: {
        width: 60,
        height: 2,
        backgroundColor: COLORS.accent,
        borderRadius: 2,
        marginVertical: 16,
        opacity: 0.7,
    },
    heroPeriodRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "center",
    },
    heroPeriodItem: {
        flex: 1,
        alignItems: "center",
    },
    heroPeriodDivider: {
        width: 1,
        backgroundColor: COLORS.accent,
        opacity: 0.5,
        marginVertical: 4,
    },
    heroPeriodValue: {
        fontFamily: FONTS.bold,
        fontSize: SIZES.text16,
        color: COLORS.secondary,
    },
    heroPeriodLabel: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.smallText,
        color: COLORS.primary,
        marginTop: 2,
    },

    // ── Sección ──
    sectionContainer: {
        width: "100%",
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    sectionHeaderAccent: {
        width: 4,
        height: 22,
        backgroundColor: COLORS.accent,
        borderRadius: 4,
    },
    sectionTitle: {
        fontFamily: FONTS.title,
        fontSize: 20,
        color: COLORS.secondary,
    },

    // ── Podio ──
    podiumContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
        height: 240,
        marginBottom: 8,
    },
    podiumColumn: {
        alignItems: "center",
        marginHorizontal: 6,
        flex: 1,
    },
    podiumAvatarRing: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 2.5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
        marginBottom: 2,
        ...COMMON.SHADOW,
    },
    podiumAvatarRingLarge: {
        width: 66,
        height: 66,
        borderRadius: 33,
        borderWidth: 3,
    },
    podiumRingGold: { borderColor: "#FFD700" },
    podiumRingSilver: { borderColor: "#A8A8A8" },
    podiumRingBronze: { borderColor: "#CD7F32" },
    podiumAvatarImg: {
        width: 46,
        height: 46,
        borderRadius: 23,
    },
    podiumAvatarImgLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    karmaBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.accent,
    },
    podiumMedal: {
        fontSize: 18,
        marginTop: 2,
        marginBottom: 2,
    },
    podiumName: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        color: COLORS.secondary,
        marginBottom: 6,
        textAlign: "center",
    },
    podiumNameWinner: {
        fontSize: 11,
        color: COLORS.primary,
    },
    podiumBar: {
        width: "100%",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    podiumBar1: {
        height: 130,
        backgroundColor: "rgba(255,215,0,0.18)",
        borderTopWidth: 3,
        borderTopColor: "#FFD700",
    },
    podiumBar2: {
        height: 105,
        backgroundColor: "rgba(168,168,168,0.15)",
        borderTopWidth: 3,
        borderTopColor: "#A8A8A8",
    },
    podiumBar3: {
        height: 85,
        backgroundColor: "rgba(205,127,50,0.15)",
        borderTopWidth: 3,
        borderTopColor: "#CD7F32",
    },
    podiumPoints: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        color: COLORS.secondary,
        textAlign: "center",
    },
    podiumPointsWinner: {
        color: COLORS.primary,
        fontSize: 11,
    },

    // ── Lista ──
    listContainer: {
        gap: 8,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
        ...COMMON.SHADOW,
    },
    listItemGold: {
        backgroundColor: "rgba(255,215,0,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,215,0,0.30)",
    },
    listItemSilver: {
        backgroundColor: "rgba(168,168,168,0.08)",
        borderWidth: 1,
        borderColor: "rgba(168,168,168,0.25)",
    },
    listItemBronze: {
        backgroundColor: "rgba(205,127,50,0.08)",
        borderWidth: 1,
        borderColor: "rgba(205,127,50,0.25)",
    },
    listRank: {
        fontFamily: FONTS.bold,
        fontSize: 15,
        color: "#999",
        width: 28,
        textAlign: "center",
    },
    listRankFirst: { color: "#FFD700", fontSize: 18 },
    listRankSecond: { color: "#A8A8A8", fontSize: 17 },
    listRankThird: { color: "#CD7F32", fontSize: 17 },
    listAvatarContainer: {
        width: 37,
        height: 37,
        borderRadius: 18.5,
        backgroundColor: "#E8E8E8",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
        borderWidth: 2,
        borderColor: "transparent",
    },
    listAvatarGold: { borderColor: "#FFD700" },
    listAvatarSilver: { borderColor: "#A8A8A8" },
    listAvatarBronze: { borderColor: "#CD7F32" },
    listName: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: SIZES.text14,
        color: COLORS.secondary,
    },
    listPointsContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        marginRight: 4,
    },
    listPoints: {
        fontFamily: FONTS.bold,
        fontSize: 15,
        color: COLORS.primary,
    },
    listPointsLabel: {
        fontFamily: FONTS.regular,
        fontSize: 11,
        color: "#999",
    },
    listKarmaBadge: { marginLeft: 4 },

    // ── Controles ──
    controlsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        gap: 10,
    },
    pillSelector: {
        flexDirection: "row",
        backgroundColor: COLORS.background,
        borderRadius: 20,
        padding: 3,
        ...COMMON.SHADOW,
        flex: 1,
    },
    pillBtn: {
        flex: 1,
        paddingVertical: 7,
        paddingHorizontal: 8,
        borderRadius: 18,
        alignItems: "center",
    },
    pillBtnActive: {
        backgroundColor: COLORS.primary,
    },
    pillBtnText: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        color: "#aaa",
    },
    pillBtnTextActive: {
        color: COLORS.background,
    },
    toggleViewBtn: {
        backgroundColor: COLORS.background,
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: "center",
        alignItems: "center",
        ...COMMON.SHADOW,
    },

    // ── Tareas ──
    chartCard: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        padding: 8,
        ...COMMON.SHADOW,
    },

    // ── Empty State ──
    emptyStateContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
        paddingVertical: 60,
        minHeight: 400,
    },
    emptyIconContainer: { marginBottom: 30 },
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
        borderRadius: 12,
        ...COMMON.SHADOW,
    },
    emptyStateButtonText: {
        fontFamily: FONTS.bold,
        fontSize: SIZES.text16,
        color: COLORS.primary,
    },

    // ── Loading ──
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

    // ── Info Modal ──
    infoModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 30,
    },
    infoModalBox: {
        backgroundColor: COLORS.background,
        borderRadius: 24,
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
        borderRadius: 12,
        ...COMMON.SHADOW,
    },
    infoModalButtonText: {
        fontFamily: FONTS.bold,
        fontSize: 15,
        color: COLORS.primary,
    },
});

export default MiKarma;
