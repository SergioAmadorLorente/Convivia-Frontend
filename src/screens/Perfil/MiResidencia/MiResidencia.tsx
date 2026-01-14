import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { COLORS, FONTS, SIZES, HELPERS, COMMON } from "../../../styles/theme";
import BottomBar from "../../../components/ui/BottomBar";

const { width } = Dimensions.get("window");

const MiResidencia: React.FC = () => {
    const navigation = useNavigation();
    const [residenciaCode, setResidenciaCode] = useState<string[] | null>(null);
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(true);

    const generateCode = () => {
        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString().split("");
        setResidenciaCode(code);
    };

    const CodeBox = ({ digit }: { digit: string }) => (
        <View style={styles.codeBox}>
            <Text style={styles.codeText}>{digit}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Custom Header Area */}
            <View style={styles.headerArea}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.accent} />
                    <Text style={styles.backText}>Volver</Text>
                </TouchableOpacity>
                <Text style={styles.screenTitle}>Mis Residencias</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Residence Card */}
                <View style={styles.residenciaCard}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="home" size={30} color="#fff" />
                    </View>
                    <Text style={styles.residenciaName}>@Nombre Piso</Text>
                    <TouchableOpacity style={styles.editIcon}>
                        <FontAwesome5 name="edit" size={20} color={COLORS.accent} />
                    </TouchableOpacity>
                </View>

                {/* Code Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Código de tu Residencia</Text>
                    <View style={styles.divider} />

                    {residenciaCode ? (
                        <View style={styles.codeContainer}>
                            {residenciaCode.map((digit, index) => (
                                <CodeBox key={index} digit={digit} />
                            ))}
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.generateButton} onPress={generateCode}>
                            <Text style={styles.generateButtonText}>Generar Código</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Participants Section */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.sectionHeaderClickable}
                        onPress={() => setIsParticipantsOpen(!isParticipantsOpen)}
                    >
                        <Text style={styles.sectionTitle}>Participantes</Text>
                        <Ionicons
                            name={isParticipantsOpen ? "chevron-up" : "chevron-down"}
                            size={24}
                            color={COLORS.secondary}
                        />
                    </TouchableOpacity>
                    <View style={styles.divider} />

                    {isParticipantsOpen && (
                        <View style={styles.participantsList}>
                            <View style={styles.participantItem}>
                                <Text style={styles.participantName}>PupuGugu</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ajustes</Text>
                    <View style={styles.divider} />

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>Cambiar de Residencia</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Abandonar Residencia</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Eliminar Residencia</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            <BottomBar />

            {/* Floating Create Button Wrapper (if needed to match Perfil, but BottomBar handles it) */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F4F2",
    },
    headerArea: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    backText: {
        fontFamily: FONTS.regular,
        fontSize: 16,
        color: COLORS.accent,
        marginLeft: 5,
    },
    screenTitle: {
        fontFamily: FONTS.title,
        fontSize: 32,
        color: COLORS.primary,
        textAlign: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    residenciaCard: {
        width: '100%',
        backgroundColor: COLORS.background,
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        ...COMMON.SHADOW,
        marginBottom: 30,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#C8C8C8', // Greyish from image
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    residenciaName: {
        flex: 1,
        fontFamily: FONTS.bold,
        fontSize: 18,
        color: '#333',
    },
    editIcon: {
        padding: 5,
    },
    section: {
        width: '100%',
        marginBottom: 25,
    },
    sectionHeaderClickable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontFamily: FONTS.regular,
        fontSize: 14,
        color: COLORS.accent,
        marginBottom: 5,
    },
    divider: {
        height: 2,
        backgroundColor: '#8F9B78', // Un greenish dark line
        marginBottom: 15,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    codeBox: {
        width: 45,
        height: 55,
        backgroundColor: '#E6ECDC',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        ...COMMON.SHADOW,
    },
    codeText: {
        fontFamily: FONTS.title,
        fontSize: 24,
        color: '#333',
    },
    generateButton: {
        backgroundColor: '#E6ECDC',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        ...COMMON.SHADOW,
    },
    generateButtonText: {
        fontFamily: FONTS.bold,
        color: COLORS.primary,
        fontSize: 16,
    },
    participantsList: {
        paddingHorizontal: 10,
    },
    participantItem: {
        ...COMMON.SHADOW,
        backgroundColor: COLORS.background,
    },
    participantName: {
        fontFamily: FONTS.regular,
        fontSize: 14,
        color: '#333',
    },
    buttonsContainer: {
        gap: 15,
    },
    actionButton: {
        backgroundColor: '#D9D9D9', // Light grey button
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
        ...COMMON.SHADOW,
    },
    actionButtonText: {
        fontFamily: FONTS.regular,
        fontSize: 16,
        color: '#333',
    },
});

export default MiResidencia;
