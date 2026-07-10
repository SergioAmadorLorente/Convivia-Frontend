import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { COLORS, FONTS, SIZES } from "../../styles/theme";
import GLOBAL_STYLES from "../../styles/styles";
import { useTranslation } from "react-i18next";
const ITEM_HEIGHT = 50;
type TimePickerPopupProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (hour: string, minute: string) => void;
    initialHour?: string;
    initialMinute?: string;
};
const HOURS = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
);
// 🔁 INFINITE LOOP
const HOURS_LOOP = [...HOURS, ...HOURS, ...HOURS];
const MINUTES_LOOP = [...MINUTES, ...MINUTES, ...MINUTES];
const HOURS_MIDDLE_OFFSET = HOURS.length;
const MINUTES_MIDDLE_OFFSET = MINUTES.length;
const TimePickerPopup: React.FC<TimePickerPopupProps> = ({
    visible,
    onClose,
    onConfirm,
    initialHour = "00",
    initialMinute = "00",
}) => {
    const { t } = useTranslation();
    const [selectedHour, setSelectedHour] = useState(initialHour);
    const [selectedMinute, setSelectedMinute] = useState(initialMinute);
    const hourRef = useRef<FlatList>(null);
    const minuteRef = useRef<FlatList>(null);
    useEffect(() => {
        if (visible) {
            setSelectedHour(initialHour);
            setSelectedMinute(initialMinute);
            setTimeout(() => {
                hourRef.current?.scrollToIndex({
                    index: HOURS_MIDDLE_OFFSET + HOURS.indexOf(initialHour),
                    animated: false,
                });
                minuteRef.current?.scrollToIndex({
                    index: MINUTES_MIDDLE_OFFSET + MINUTES.indexOf(initialMinute),
                    animated: false,
                });
            }, 0);
        }
    }, [visible, initialHour, initialMinute]);
    const handleScroll = (
        event: any,
        data: string[],
        setFn: (val: string) => void
    ) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round((y + ITEM_HEIGHT / 2) / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
        setFn(data[clampedIndex]);
    };
    const keepHourLoop = (index: number) => {
        const realIndex = index % HOURS.length;
        hourRef.current?.scrollToIndex({
            index: HOURS_MIDDLE_OFFSET + realIndex,
            animated: false,
        });
    };
    const keepMinuteLoop = (index: number) => {
        const realIndex = index % MINUTES.length;
        minuteRef.current?.scrollToIndex({
            index: MINUTES_MIDDLE_OFFSET + realIndex,
            animated: false,
        });
    };
    const renderItem = (
        { item }: { item: string },
        selectedValue: string
    ) => {
        const isSelected = item === selectedValue;
        return (
            <View
                style={[
                    styles.timeItem,
                    isSelected && { backgroundColor: COLORS.success },
                ]}
            >
                <Text
                    style={[
                        styles.timeText,
                        isSelected && {
                            fontFamily: FONTS.title,
                            color: COLORS.primary,
                            fontSize: 24,
                        },
                    ]}
                >
                    {item}
                </Text>
            </View>
        );
    };
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <Text style={GLOBAL_STYLES.popupTitle}>
                        {t('createTask.timePicker.title')}
                    </Text>
                    <View style={styles.listsContainer}>
                        {/* HOURS LOOP */}
                        <View style={styles.listWrapper}>
                            <Text style={styles.columnHeader}>{t('createTask.timePicker.hour')}</Text>
                            <View style={styles.headerDivider} />
                            <FlatList
                                ref={hourRef}
                                data={HOURS_LOOP}
                                keyExtractor={(_, i) => "H" + i}
                                renderItem={(props) =>
                                    renderItem(props, selectedHour)
                                }
                                initialScrollIndex={
                                    HOURS_MIDDLE_OFFSET +
                                    HOURS.indexOf(selectedHour)
                                }
                                showsVerticalScrollIndicator={false}
                                snapToInterval={ITEM_HEIGHT}
                                decelerationRate="fast"
                                onMomentumScrollEnd={(e) => {
                                    handleScroll(
                                        e,
                                        HOURS_LOOP,
                                        setSelectedHour
                                    );
                                    const rawIndex = Math.round(
                                        e.nativeEvent.contentOffset.y /
                                        ITEM_HEIGHT
                                    );
                                    keepHourLoop(rawIndex);
                                }}
                                getItemLayout={(_, index) => ({
                                    length: ITEM_HEIGHT,
                                    offset: ITEM_HEIGHT * index,
                                    index,
                                })}
                            />
                        </View>
                        <View style={styles.centerSeparatorContainer}>
                            <Text style={styles.separator}>:</Text>
                        </View>
                        {/* MINUTES LOOP */}
                        <View style={styles.listWrapper}>
                            <Text style={styles.columnHeader}>{t('createTask.timePicker.minute')}</Text>
                            <View style={styles.headerDivider} />
                            <FlatList
                                ref={minuteRef}
                                data={MINUTES_LOOP}
                                keyExtractor={(_, i) => "M" + i}
                                renderItem={(props) =>
                                    renderItem(props, selectedMinute)
                                }
                                initialScrollIndex={
                                    MINUTES_MIDDLE_OFFSET +
                                    MINUTES.indexOf(selectedMinute)
                                }
                                showsVerticalScrollIndicator={false}
                                snapToInterval={ITEM_HEIGHT}
                                decelerationRate="fast"
                                onMomentumScrollEnd={(e) => {
                                    handleScroll(
                                        e,
                                        MINUTES_LOOP,
                                        setSelectedMinute
                                    );
                                    const rawIndex = Math.round(
                                        e.nativeEvent.contentOffset.y /
                                        ITEM_HEIGHT
                                    );
                                    keepMinuteLoop(rawIndex);
                                }}
                                getItemLayout={(_, index) => ({
                                    length: ITEM_HEIGHT,
                                    offset: ITEM_HEIGHT * index,
                                    index,
                                })}
                            />
                        </View>
                    </View>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={[
                                GLOBAL_STYLES.buttonSecondaryGrey,
                                { width: "45%" },
                            ]}
                            onPress={onClose}
                        >
                            <Text style={GLOBAL_STYLES.textoBoton}>
                                {t('common.cancel')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                GLOBAL_STYLES.buttonPrimaryGreen,
                                { width: "45%" },
                            ]}
                            onPress={() => {
                                onConfirm(selectedHour, selectedMinute);
                                onClose();
                            }}
                        >
                            <Text
                                style={[
                                    GLOBAL_STYLES.textoBoton,
                                    { color: COLORS.secondary },
                                ]}
                            >
                                {t('createTask.timePicker.confirm')}
                            </Text>
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
    },
    popup: {
        width: "85%",
        maxWidth: 340,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        elevation: 5,
    },
    listsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 200,
        marginBottom: 20,
        marginTop: 20,
    },
    listWrapper: {
        width: 80,
        height: "100%",
        alignItems: "center",
        overflow: "hidden",
        backgroundColor: COLORS.inputBackground,
        borderRadius: 10,
    },
    columnHeader: {
        fontFamily: FONTS.bold,
        fontSize: 12,
        color: COLORS.secondary,
        marginVertical: 5,
        textAlign: "center",
    },
    headerDivider: {
        width: "100%",
        height: 1,
        backgroundColor: COLORS.secondary,
        opacity: 0.3,
        marginBottom: 5,
    },
    timeItem: {
        height: ITEM_HEIGHT,
        width: 80,
        justifyContent: "center",
        alignItems: "center",
    },
    timeText: {
        fontSize: 20,
        fontFamily: FONTS.title,
        color: COLORS.secondary,
        textAlign: "center",
    },
    centerSeparatorContainer: {
        height: 200,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    separator: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
});
export default TimePickerPopup;