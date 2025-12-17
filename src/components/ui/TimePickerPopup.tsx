import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Platform,
} from "react-native";
import { COLORS, FONTS, SIZES, COMMON } from "../../styles/theme";
import GLOBAL_STYLES from "../../styles/styles";

type TimePickerPopupProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (hour: string, minute: string) => void;
    initialHour?: string;
    initialMinute?: string;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

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


    const handleScroll = (event: any, data: string[], setFn: (val: string) => void) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / 50);
        const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
        setFn(data[clampedIndex]);
    };

    const renderItem = ({ item }: { item: string }, selectedValue: string) => {
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
                        isSelected && { fontFamily: FONTS.title, color: COLORS.primary, fontSize: 24 },

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
                <View style={[styles.popup]}>
                    <Text style={GLOBAL_STYLES.popupTitle}>Selecciona la hora</Text>
                    <View style={styles.listsContainer}>
                        {/* Hours List */}
                        <View style={styles.listWrapper}>
                            <Text style={styles.columnHeader}>Hora</Text>
                            <FlatList
                                data={HOURS}
                                keyExtractor={(item) => item}
                                renderItem={(props) => renderItem(props, selectedHour)}
                                showsVerticalScrollIndicator={false}
                                initialScrollIndex={HOURS.indexOf(selectedHour)}
                                onMomentumScrollEnd={(e) => handleScroll(e, HOURS, setSelectedHour)}
                                onScrollEndDrag={(e) => handleScroll(e, HOURS, setSelectedHour)}
                                snapToInterval={40}
                                decelerationRate="fast"
                                getItemLayout={(data, index) => ({
                                    length: 55,
                                    offset: 55 * index,
                                    index,
                                })}
                                contentContainerStyle={{ paddingVertical: 40 }}
                            />
                            {/* Selection Lines Overlay */}
                            <View style={styles.selectionLines} pointerEvents="none" />
                        </View>

                        <Text style={styles.separator}>:</Text>

                        {/* Minutes List */}
                        <View style={styles.listWrapper}>
                            <Text style={styles.columnHeader}>Minutos</Text>
                            <FlatList
                                data={MINUTES}
                                keyExtractor={(item) => item}
                                renderItem={(props) => renderItem(props, selectedMinute)}
                                showsVerticalScrollIndicator={false}
                                initialScrollIndex={MINUTES.indexOf(selectedMinute)}
                                onMomentumScrollEnd={(e) => handleScroll(e, MINUTES, setSelectedMinute)}
                                onScrollEndDrag={(e) => handleScroll(e, MINUTES, setSelectedMinute)}
                                snapToInterval={50}
                                decelerationRate="fast"
                                getItemLayout={(data, index) => ({
                                    length: 50,
                                    offset: 50 * index,
                                    index,
                                })}
                                contentContainerStyle={{ paddingTop: 40, paddingBottom: 60 }}
                            />
                            {/* Selection Lines Overlay */}
                            <View style={styles.selectionLines} pointerEvents="none" />
                        </View>
                    </View>

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={[GLOBAL_STYLES.buttonSecondaryGrey, { width: "45%", marginTop: 0 }]}
                            onPress={onClose}
                        >
                            <Text style={GLOBAL_STYLES.textoBoton}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[GLOBAL_STYLES.buttonPrimaryGreen, { width: "45%", marginTop: 0 }]}
                            onPress={() => {
                                onConfirm(selectedHour, selectedMinute);
                                onClose();
                            }}
                        >
                            <Text style={[GLOBAL_STYLES.textoBoton, { color: COLORS.secondary }]}>Confimar</Text>
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
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Elevation for Android
        elevation: 5,
    },
    title: {
        fontSize: SIZES.popupTitle,
        fontFamily: FONTS.title,
        color: COLORS.primary,
        marginBottom: 20,
    },
    listsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 200,
        marginBottom: 20,
    },
    listWrapper: {
        width: 80,
        height: "90%",
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
    },
    timeItem: {
        height: 50,
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
    separator: {
        fontSize: 40,
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        marginHorizontal: 10,

    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    selectionLines: {
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        height: 50, // Matches item height
        marginTop: -25 + 10, // Half of height to center + offset for header
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.primary,
        opacity: 0.3,
    },
});

export default TimePickerPopup;
