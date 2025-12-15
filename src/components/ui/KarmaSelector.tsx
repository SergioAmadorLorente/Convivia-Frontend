import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { COLORS, FONTS } from "../../styles/theme";
interface KarmaSelectorProps {
    onSelect: (value: number) => void;
}
const KarmaSelector: React.FC<KarmaSelectorProps> = ({ onSelect }) => {
    const KARMA_POINTS = [5, 15, 25, 50];
    const [selected, setSelected] = useState<number | null>(null);
    const handleSelect = (v: number) => {
        setSelected(v);
        onSelect(v);
    };
    return (
        <View style={styles.wrapper}>
            <View style={styles.row}>
                {KARMA_POINTS.map((p, i) => {
                    const active = p === selected;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => handleSelect(p)}
                            style={[styles.box, active && styles.boxActive]}
                        >
                            <Text style={[styles.points, active && styles.textActive]}>
                                {p}
                            </Text>
                            <Text style={[styles.label, active && styles.textActive]}>
                                Puntos
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    wrapper: {
        paddingVertical: 10,
        marginTop: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 0,
    },
    box: {
        width: 70,
        height: 55,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    boxActive: {
        backgroundColor: COLORS.success,
    },
    points: {
        fontSize: 20,
        fontFamily: FONTS.title,
        color: COLORS.secondary,
    },
    label: {
        marginTop: 4,
        fontSize: 14,
        fontFamily: FONTS.title,
        color: COLORS.secondary,
    },
    textActive: {
        color: COLORS.primary,
        fontFamily: FONTS.title,
    },
});
export default KarmaSelector;