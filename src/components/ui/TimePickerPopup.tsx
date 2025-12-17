import React, { useState, useEffect } from "react";
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
const TimePickerPopup: React.FC<TimePickerPopupProps> = ({
    visible,
    onClose,
    onConfirm,
    initialHour = "00",
    initialMinute = "00",
}) => {
    const [selectedHour, setSelectedHour] = useState(initialHour);
    const [selectedMinute, setSelectedMinute] = useState(initialMinute);
    useEffect(() => {
        if (visible) {
            setSelectedHour(initialHour);
            setSelectedMinute(initialMinute);
        }
    }, [visible, initialHour, initialMinute]);
    const handleScroll = (
        event: any,
        data: string[],
        setFn: (val: string) => void
    ) => {
        const y = event.nativeEvent.contentOffset.y;
        // 🔥 CORRECCIÓN: detecta el item centrado siempre
        const index = Math.round((y + ITEM_HEIGHT / 2) / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
        setFn(data[clampedIndex]);
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
                        Selecciona la hora
                    </Text>
                    <View style={styles.listsContainer}>
                        {/* Hours */}
                        <View style={styles.listWrapper}>
                            <Text style={styles.columnHeader}>Hora</Text>
                            <View style={styles.headerDivider} />
                            <FlatList
                                data={HOURS}
                                keyExtractor={(item) => item}
                                renderItem={(props) =>
                                    renderItem(props, selectedHour)
                                }
                                showsVerticalScrollIndicator={false}
                                initialScrollIndex={HOURS.indexOf(
                                    selectedHour
                                )}
                                onMomentumScrollEnd={(e) =>
                                    handleScroll(
                                        e,
                                        HOURS,
                                        setSelectedHour
                                    )
                                }
                                onScrollEndDrag={(e) =>
                                    handleScroll(
                                        e,
                                        HOURS,
                                        setSelectedHour
                                    )
                                }
                                snapToInterval={ITEM_HEIGHT}
                                decelerationRate="fast"
                                getItemLayout={(data, index) => ({
                                    length: ITEM_HEIGHT,
                                    offset: ITEM_HEIGHT * index,
                                    index,
                                })}
                            />
                        </View>
                        {/* Center separator */}
                        <View style={styles.centerSeparatorContainer}>
                            <Text style={styles.separator}>:</Text>
                        </View>
                        {/* Minutes */}
                        <View style={styles.listWrapper}>
                            <Text style={styles.columnHeader}>Minutos</Text>
                            <View style={styles.headerDivider} />
                            <FlatList
                                data={MINUTES}
                                keyExtractor={(item) => item}
                                renderItem={(props) =>
                                    renderItem(props, selectedMinute)
                                }
                                showsVerticalScrollIndicator={false}
                                initialScrollIndex={MINUTES.indexOf(
                                    selectedMinute
                                )}
                                onMomentumScrollEnd={(e) =>
                                    handleScroll(
                                        e,
                                        MINUTES,
                                        setSelectedMinute
                                    )
                                }
                                onScrollEndDrag={(e) =>
                                    handleScroll(
                                        e,
                                        MINUTES,
                                        setSelectedMinute
                                    )
                                }
                                snapToInterval={ITEM_HEIGHT}
                                decelerationRate="fast"
                                getItemLayout={(data, index) => ({
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
                                Cancelar
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
                                Confirmar
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
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