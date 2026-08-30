import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { FONTS, COLORS } from "../../styles/styles";
import { Feather } from "@expo/vector-icons";
import LogoReal from "../../assets/logoReal.svg";
import { useTranslation } from "react-i18next";

type UserItem = {
    id: string;
    name: string;
    fotoUrl?: string | null;
};

type DayUserAssignment = {
    day: string;
    userId: string | null;
};

// Order of days in the week for sorting
const DAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

type AssignUsersByDayPopupProps = {
    visible: boolean;
    onClose: () => void;
    title?: string;
    users: UserItem[];
    days: string[];
    initialAssignments?: Record<string, string>; // day -> userId
    initialSingleUserId?: string | null; // for single user mode
    confirmLabel?: string;
    onConfirm: (assignments: Record<string, UserItem | null>) => void | Promise<void>;
    onConfirmSingleUser?: (user: UserItem | null) => void | Promise<void>;
    loadingUsers?: boolean;
};

const AssignUsersByDayPopup: React.FC<AssignUsersByDayPopupProps> = ({
    visible,
    onClose,
    title,
    users,
    days,
    initialAssignments = {},
    initialSingleUserId = null,
    confirmLabel,
    onConfirm,
    onConfirmSingleUser,
    loadingUsers = false,
}) => {
    const { t } = useTranslation();
    // Track selected user for each day
    const [assignments, setAssignments] = useState<Record<string, string | null>>({});
    const [confirming, setConfirming] = useState(false);
    // Track which day's dropdown is expanded
    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    // Track single user selection (when no days)
    const [selectedSingleUserId, setSelectedSingleUserId] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            // Initialize assignments from props
            const initial: Record<string, string | null> = {};
            days.forEach((day) => {
                initial[day] = initialAssignments[day] || null;
            });
            setAssignments(initial);
            setExpandedDay(null);
            // Initialize single user selection
            setSelectedSingleUserId(initialSingleUserId || null);
        }
    }, [visible, days.join("|"), JSON.stringify(initialAssignments), initialSingleUserId]);

    const selectUserForDay = (day: string, userId: string) => {
        setAssignments((prev) => ({
            ...prev,
            [day]: prev[day] === userId ? null : userId, // Toggle: deselect if already selected
        }));
        setExpandedDay(null);
    };

    const getUserName = (userId: string | null): string => {
        if (!userId) return t('createTask.assignUsers.selectUser');
        const user = users.find((u) => u.id === userId);
        return user ? user.name : t('createTask.assignUsers.selectUser');
    };

    const allDaysAssigned = days.every((day) => assignments[day] !== null);
    const isSingleUserMode = days.length === 0;
    const hasSelection = isSingleUserMode ? selectedSingleUserId !== null : allDaysAssigned;

    const handleConfirm = async () => {
        try {
            setConfirming(true);
            if (isSingleUserMode) {
                // Single user mode
                const selectedUser = selectedSingleUserId
                    ? users.find((u) => u.id === selectedSingleUserId) || null
                    : null;
                if (onConfirmSingleUser) {
                    await Promise.resolve(onConfirmSingleUser(selectedUser));
                }
            } else {
                // Multi-day mode
                const result: Record<string, UserItem | null> = {};
                days.forEach((day) => {
                    const userId = assignments[day];
                    result[day] = userId ? users.find((u) => u.id === userId) || null : null;
                });
                await Promise.resolve(onConfirm(result));
            }
            onClose();
        } finally {
            setConfirming(false);
        }
    };

    const randomizeAssignments = () => {
        if (users.length === 0) return;
        if (days.length === 0) {
            // Modo usuario único: asignar un usuario aleatorio
            const randomIndex = Math.floor(Math.random() * users.length);
            setSelectedSingleUserId(users[randomIndex].id);
            return;
        }
        const randomized: Record<string, string | null> = {};
        days.forEach((day) => {
            const randomIndex = Math.floor(Math.random() * users.length);
            randomized[day] = users[randomIndex].id;
        });
        setAssignments(randomized);
        setExpandedDay(null);
    };

    const renderDayAssignment = (day: string) => {
        const isExpanded = expandedDay === day;
        const selectedUserId = assignments[day];

        return (
            <View key={day} style={styles.dayContainer}>
                <Text style={styles.dayLabel}>{day}</Text>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setExpandedDay(isExpanded ? null : day)}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.dropdownText,
                            !selectedUserId && styles.placeholderText,
                        ]}
                    >
                        {getUserName(selectedUserId)}
                    </Text>
                    <Feather
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={COLORS.secondary}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.userList}>
                        {users.map((user) => (
                            <TouchableOpacity
                                key={user.id}
                                style={[
                                    styles.userItem,
                                    selectedUserId === user.id && styles.userItemSelected,
                                ]}
                                onPress={() => selectUserForDay(day, user.id)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.userAvatar}>
                                    {user.fotoUrl ? (
                                        <Image
                                            source={{ uri: user.fotoUrl }}
                                            style={styles.userAvatarImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Feather name="user" size={15} color={COLORS.primary} />
                                    )}
                                </View>
                                <Text
                                    style={[
                                        styles.userItemText,
                                        selectedUserId === user.id && styles.userItemTextSelected,
                                    ]}
                                >
                                    {user.name}
                                </Text>
                                {selectedUserId === user.id && (
                                    <Feather name="check" size={18} color={COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <LogoReal style={styles.image} width={120} height={120} />
                    <Text style={styles.title}>{title || t('createTask.assignUsers.title')}</Text>

                    {users.length > 0 && !loadingUsers && (
                        <TouchableOpacity
                            onPress={randomizeAssignments}
                            style={styles.randomizeButton}
                        >
                            <Feather name="shuffle" size={16} color={COLORS.primary} />
                            <Text style={styles.randomizeButtonText}>{t('createTask.assignUsers.random')}</Text>
                        </TouchableOpacity>
                    )}

                    {days.length === 0 ? (
                        // Single user selection mode
                        loadingUsers ? (
                            <View style={styles.loadingBox}>
                                <ActivityIndicator size="small" color={COLORS.secondary} />
                                <Text style={styles.loadingText}>{t('createTask.assignUsers.loading')}</Text>
                            </View>
                        ) : (
                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {users.map((user) => (
                                    <TouchableOpacity
                                        key={user.id}
                                        style={[
                                            styles.singleUserItem,
                                            selectedSingleUserId === user.id && styles.userItemSelected,
                                        ]}
                                        onPress={() => setSelectedSingleUserId(
                                            selectedSingleUserId === user.id ? null : user.id
                                        )}
                                        activeOpacity={0.8}
                                    >
                                        <View style={styles.userAvatar}>
                                            {user.fotoUrl ? (
                                                <Image
                                                    source={{ uri: user.fotoUrl }}
                                                    style={styles.userAvatarImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <Feather name="user" size={15} color={COLORS.primary} />
                                            )}
                                        </View>
                                        <Text
                                            style={[
                                                styles.userItemText,
                                                selectedSingleUserId === user.id && styles.userItemTextSelected,
                                            ]}
                                        >
                                            {user.name}
                                        </Text>
                                        {selectedSingleUserId === user.id && (
                                            <Feather name="check" size={18} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )
                    ) : loadingUsers ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="small" color={COLORS.secondary} />
                            <Text style={styles.loadingText}>{t('createTask.assignUsers.loading')}</Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {[...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)).map((day) => renderDayAssignment(day))}
                        </ScrollView>
                    )}

                    <View style={styles.buttonsRow}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={confirming}
                            onPress={handleConfirm}
                            style={styles.confirmButton}
                        >
                            {confirming ? (
                                <ActivityIndicator size="small" color={COLORS.secondary} />
                            ) : (
                                <Text style={styles.confirmButtonText}>
                                    {hasSelection ? (confirmLabel || t('common.accept')) : t('createTask.assignUsers.later')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    popup: {
        width: "100%",
        maxWidth: 360,
        maxHeight: "80%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
    },
    image: {
        width: 120,
        height: 120,
        marginTop: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        color: COLORS.primary,
        textAlign: "center",
        marginBottom: 16,
        fontFamily: FONTS.title,
    },
    randomizeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F4F2",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 12,
        gap: 6,
    },
    randomizeButtonText: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
    },
    scrollView: {
        width: "100%",
        maxHeight: 300,
    },
    scrollContent: {
        paddingBottom: 10,
    },
    dayContainer: {
        width: "100%",
        marginBottom: 12,
    },
    dayLabel: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginBottom: 6,
    },
    dropdown: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F5F4F2",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    dropdownText: {
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: "#333",
    },
    placeholderText: {
        color: "#999",
    },
    userList: {
        marginTop: 6,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        overflow: "hidden",
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    singleUserItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: "#F5F4F2",
        borderRadius: 10,
        marginBottom: 8,
    },
    userItemSelected: {
        backgroundColor: "#E6ECDC",
    },
    userItemText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        fontFamily: FONTS.regular,
        color: "#333",
    },
    userItemTextSelected: {
        fontFamily: FONTS.bold,
        color: COLORS.primary,
    },
    userAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#E6ECDC",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    userAvatarImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    loadingBox: {
        width: "100%",
        paddingVertical: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        marginTop: 8,
        color: "#6A6A6A",
        fontFamily: FONTS.regular,
    },
    emptyBox: {
        width: "100%",
        paddingVertical: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        textAlign: "center",
        color: "#6A6A6A",
        fontFamily: FONTS.regular,
        fontSize: 14,
    },
    buttonsRow: {
        flexDirection: "row",
        width: "100%",
        gap: 10,
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#F5F4F2",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#666",
        fontFamily: FONTS.bold,
    },
    confirmButton: {
        flex: 1,
        backgroundColor: "#E6ECDC",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    confirmButtonDisabled: {
        opacity: 0.5,
    },
    confirmButtonText: {
        color: COLORS.primary,
        fontFamily: FONTS.bold,
    },
});

export default AssignUsersByDayPopup;
