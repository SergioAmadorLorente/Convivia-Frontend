import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";
import { COLORS, FONTS, SIZES, HELPERS, COMMON } from "../../styles/theme";
import GLOBAL_STYLES from "../../styles/styles";
interface DayCarouselProps {
    onDaySelected: (date: Date) => void;
}
const DayCarousel: React.FC<DayCarouselProps> = ({ onDaySelected }) => {
    const [selected, setSelected] = useState(0);
    const days = useMemo(() => {
        const arr = [];
        const weekdayOpts: Intl.DateTimeFormatOptions = { weekday: "long" };
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const weekday = date
                .toLocaleDateString("es-ES", weekdayOpts)
                .replace(/^\w/, c => c.toUpperCase());
            arr.push({
                num: date.getDate(),
                name: weekday,
                date: date,
            });
        }
        return arr;
    }, []);
    const selectDay = (index: number) => {
        setSelected(index);
        onDaySelected(days[index].date);
    };
    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {days.map((d, i) => {
                    const active = i === selected;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => selectDay(i)}
                            style={[styles.box, active && styles.boxActive]}
                        >
                            <Text style={[styles.num, active && styles.textActive]}>
                                {d.num}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[styles.name, active && styles.textActive]}
                            >
                                {d.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    wrapper: {
        paddingVertical: 10,
        marginTop: 10,
    },
    scrollContent: {
        paddingHorizontal: 16,
    },
    box: {
        width: 80,
        height: 70,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 14,
        marginRight: 14,
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
    num: {
        fontSize: 18,
        fontFamily: FONTS.title,
        color: COLORS.secondary,
    },
    name: {
        marginTop: 4,
        fontSize: 14,
        fontFamily: FONTS.title,
        color: COLORS.secondary,
        maxWidth: 70,
        textAlign: "center",
    },

    textActive: {
        color: COLORS.primary,
        fontFamily: FONTS.title,
    },
});
export default DayCarousel;