import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FONTS, COLORS, COMMON, SIZES } from "../../styles/theme";

interface CalendarProps {
    onDateSelect?: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
    const [fechaActual, setFechaActual] = useState(new Date());
    const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
    const [hora, setHora] = useState<string>("00");
    const [minuto, setMinuto] = useState<string>("00");
    const [horaScrolling, setHoraScrolling] = useState<boolean>(false);
    const [minScrolling, setMinScrolling] = useState<boolean>(false);
    const scrollRefHora = useRef<any>(null);
    const scrollRefMin = useRef<any>(null);
    const itemHeight = 40;
    const containerHeight = 60; // visible area for scroll (3 items)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    useEffect(() => {
        // scroll to initial values on mount
        const h = parseInt(hora || "0", 10);
        const m = parseInt(minuto || "0", 10);
        setTimeout(() => {
            scrollRefHora.current?.scrollTo({ y: h * itemHeight, animated: false });
            scrollRefMin.current?.scrollTo({ y: m * itemHeight, animated: false });
        }, 0);
    }, []);

    const onHoraMomentum = (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        const index = Math.max(
            0,
            Math.min(hours.length - 1, Math.round(y / itemHeight))
        );
        const value = String(index).padStart(2, "0");
        setHora(value);
        scrollRefHora.current?.scrollTo({ y: index * itemHeight, animated: true });
        setHoraScrolling(false);
    };

    const onMinutoMomentum = (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        const index = Math.max(
            0,
            Math.min(minutes.length - 1, Math.round(y / itemHeight))
        );
        const value = String(index).padStart(2, "0");
        setMinuto(value);
        scrollRefMin.current?.scrollTo({ y: index * itemHeight, animated: true });
        setMinScrolling(false);
    };

    const obtenerDiasDelMes = (fecha: Date) => {
        return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
    };

    const obtenerPrimerDia = (fecha: Date) => {
        const day = new Date(fecha.getFullYear(), fecha.getMonth(), 1).getDay();
        return (day + 6) % 7;
    };

    const obtenerFindes = (fecha: Date) => {
        const diasEnMes = obtenerDiasDelMes(fecha);
        const fines: number[] = [];
        for (let i = 1; i <= diasEnMes; i++) {
            const diaSemana = new Date(
                fecha.getFullYear(),
                fecha.getMonth(),
                i
            ).getDay();
            if (diaSemana === 0 || diaSemana === 6) {
                fines.push(i);
            }
        }
        return fines;
    };

    const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ];

    const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];

    const handleMesAnterior = () => {
        setFechaActual(
            new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1)
        );
    };

    const handleMesSiguiente = () => {
        setFechaActual(
            new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1)
        );
    };

    const handleSeleccionarDia = (dia: number) => {
        setDiaSeleccionado(dia);
    };

    const diasEnMes = obtenerDiasDelMes(fechaActual);
    const primerDia = obtenerPrimerDia(fechaActual);
    const dias = Array.from({ length: diasEnMes }, (_, i) => i + 1);
    const espaciosVacios = Array.from({ length: primerDia }, () => null);
    const findes = obtenerFindes(fechaActual);
    return (
        <View style={styles.contenedor}>
            <View style={styles.encabezado}>
                <Pressable onPress={handleMesAnterior} style={styles.boton}>
                    <Text style={styles.botonText}> &lt; </Text>
                </Pressable>
                <Text style={styles.titulo}>
                    {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
                </Text>
                <Pressable onPress={handleMesSiguiente} style={styles.boton}>
                    <Text style={styles.botonText}>&gt;    </Text>
                </Pressable>
            </View>

            <View style={styles.diasSemana}>
                {diasSemana.map((dia) => (
                    <View key={dia} style={styles.headerDia}>
                        <Text style={styles.headerDiaText}>{dia}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.grid}>
                {espaciosVacios.map((_, i) => (
                    <View key={`vacio-${i}`} style={styles.diaVacio} />
                ))}
                {dias.map((dia) => {
                    const isFinderSemana = findes.includes(dia);
                    const isSeleccionado = diaSeleccionado === dia;
                    return (
                        <Pressable
                            key={dia}
                            onPress={() => handleSeleccionarDia(dia)}
                            style={[
                                styles.dia,
                                isFinderSemana && styles.diaFinde,
                                isSeleccionado && styles.diaSeleccionado,
                            ]}
                        >
                            <Text style={[styles.diaText, isFinderSemana && styles.diaFindeText]}>
                                {dia}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <View style={styles.timeContainer}>
                <View style={styles.timeBox}>
                    <View style={[styles.scrollWrap, { height: containerHeight }]}>
                        <ScrollView
                            ref={scrollRefHora}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={itemHeight}
                            decelerationRate="fast"
                            onMomentumScrollBegin={() => setHoraScrolling(true)}
                            onMomentumScrollEnd={onHoraMomentum}
                            onScrollBeginDrag={() => setHoraScrolling(true)}
                            contentContainerStyle={{ paddingTop: (containerHeight - itemHeight) / 2, paddingBottom: (containerHeight - itemHeight) / 2 }}
                        >
                            {hours.map((h) => {
                                const text = String(h).padStart(2, "0");
                                const selected = hora === text;
                                const hidden = !horaScrolling && !selected;
                                return (
                                    <View key={h} style={[styles.scrollItem, hidden && styles.hiddenText, selected && styles.scrollItemSelected]}>
                                        <Text style={[styles.scrollItemText, hidden && styles.hiddenText, selected && styles.selectedText]}>{text}</Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                        <View />
                    </View>
                </View>

                <Text style={{ fontSize: SIZES.popupTitle, color: COLORS.primary, textAlignVertical: "center", height: "90%", fontFamily: FONTS.title }}>
                    :
                </Text>

                <View style={styles.timeBox}>
                    <View style={[styles.scrollWrap, { height: containerHeight }]}>
                        <ScrollView
                            ref={scrollRefMin}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={false}
                            snapToInterval={itemHeight}
                            decelerationRate="fast"
                            onMomentumScrollBegin={() => setMinScrolling(true)}
                            onMomentumScrollEnd={onMinutoMomentum}
                            onScrollBeginDrag={() => setMinScrolling(true)}
                            contentContainerStyle={{ paddingTop: (containerHeight - itemHeight) / 2, paddingBottom: (containerHeight - itemHeight) / 2 }}
                        >
                            {minutes.map((m) => {
                                const text = String(m).padStart(2, "0");
                                const selected = minuto === text;
                                const hidden = !minScrolling && !selected;
                                return (
                                    <View key={m} style={[styles.scrollItem, hidden && styles.hiddenText, selected && styles.scrollItemSelected]}>
                                        <Text style={[styles.scrollItemText, hidden && styles.hiddenText, selected && styles.selectedText]}>{text}</Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                        <View />
                    </View>
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    contenedor: { maxWidth: 400 },
    encabezado: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 1,
    },
    titulo: {
        marginHorizontal: 40,
        fontSize: 20,
        textAlign: "center",
        color: "#000000ff",
        fontFamily: FONTS.title,
        fontWeight: "400",
        fontStyle: "normal",
        lineHeight: 20,
        letterSpacing: 1,
    },
    boton: {
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    botonText: {
        fontSize: 30,
        fontFamily: FONTS.regular,
        fontWeight: "bold",
        color: "#ACBF8A",
    },
    diasSemana: { flexDirection: "row", marginBottom: 10, color: "#000000ff" },
    headerDia: { flex: 1, padding: 10, alignItems: "center", color: "#000000ff" },
    headerDiaText: {
        fontWeight: "700",
        color: "#000000ff",
        fontFamily: FONTS.regular,
    },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    diaVacio: { width: "14.2857%" },
    dia: {
        width: "14.2857%",
        paddingVertical: 5,
        borderRadius: 10,

        alignItems: "center",
        marginBottom: 5,
    },
    diaText: { fontFamily: FONTS.regular },
    diaFinde: {},
    diaFindeText: { color: "#ACBF8A" },
    diaSeleccionado: {
        backgroundColor: "#E6ECDC",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    findesText: { color: "#ff0000ff" },
    scrollWrap: {
        width: "70%",
        maxHeight: "100%",
        overflow: "hidden",
        backgroundColor: COLORS.success,
        borderRadius: 8,

        shadowColor: COMMON.SHADOW.shadowColor,
        shadowOffset: COMMON.SHADOW.shadowOffset,
        shadowOpacity: COMMON.SHADOW.shadowOpacity,
        shadowRadius: COMMON.SHADOW.shadowRadius,
        elevation: COMMON.SHADOW.elevation,
    },
    scrollItem: { height: 40, justifyContent: "center", alignItems: "center" },
    scrollItemSelected: {},
    scrollItemText: { fontFamily: FONTS.title, fontSize: 20, color: "#333" },
    selectedText: { color: COLORS.primary, fontFamily: FONTS.title, fontSize: 24 },
    hiddenText: { opacity: 0 },
    centerIndicator: { position: "absolute", left: 0, right: 0, top: 10, height: 40, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#ddd" },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 25,
        paddingHorizontal: 50,
    },
    timeBox: { width: "40%", marginHorizontal: 1, alignItems: "center" },
    label: { fontFamily: FONTS.regular, marginBottom: 6, color: "#000" },
    input: {
        paddingHorizontal: 10,
        borderRadius: 8,
        width: "70%",
        height: "34%",
        textAlign: "center",
        fontFamily: FONTS.title,
        fontSize: SIZES.popupTitle,
        backgroundColor: COLORS.success,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
        color: COLORS.secondary,
    },
    fechaActual: {
        width: "14.2857%",
        padding: 10,
        borderRadius: 4,
        alignItems: "center",
        marginBottom: 5,
        backgroundColor: "#E6ECDC",
    },
});
