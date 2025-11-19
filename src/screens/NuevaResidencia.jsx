import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale, verticalScale } from 'react-native-size-matters';

const NuevaResidencia = () => {
    const [nombreResidencia, setNombreResidencia] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    // Validación simple: Se activa solo si hay texto ingresado (al menos 1 carácter no vacío)
    const hasText = nombreResidencia.trim().length > 0;

    const [fontsLoaded] = useFonts({
        DMSerifDisplay_400Regular,
        Montserrat_400Regular,
        Montserrat_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#6B705C" />
            </View>
        );
    }

    const handleCrear = async () => {
        if (!hasText) {
            alert('Por favor, ingresa un nombre para la residencia.');
            return;
        }

        setLoading(true);
        try {
            // Lógica para crear la residencia (ej. guardar en Firebase/Firestore)
            // Por ahora, solo un ejemplo simple. Si necesitas Firebase, agrega aquí:
            // import { db } from '../firebaseConfig';
            // import { collection, addDoc } from 'firebase/firestore';
            // await addDoc(collection(db, 'residencias'), { nombre: nombreResidencia });

            alert('Residencia creada exitosamente');
            navigation.navigate('DashBoardPersonal');
        } catch (error) {
            console.error('Error al crear residencia:', error);
            alert('Error al crear la residencia. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? hp('8%') : 0}
            >
                <View style={styles.container}>
                    <Text style={styles.titulo}>Crea una nueva residencia</Text>

                    {/* Subtítulo con estilos mixtos: Negrita en "Obtén" y "apartado", cursiva en "Perfil - Mi residencia" */}
                    <Text style={styles.subtitulo}>
                        <Text style={styles.textoNegrita}>Obtén el código de tu residencia en el apartado
                            {'\n'}</Text>

                        <Text style={styles.textoCursiva}>Perfil - Mi residencia</Text>
                    </Text>

                    {/* Input para Nombre de la residencia */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nombre de la residencia</Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: hasText ? '#28e80eff' : 'red'  // Borde gris si válido, rojo si vacío
                                }
                            ]}
                            placeholder="Piso Tarragona"
                            autoCapitalize="words"
                            autoCorrect={false}
                            value={nombreResidencia}
                            onChangeText={setNombreResidencia}  // Actualiza el estado al escribir
                        />
                        {/* Mensaje de error opcional: Si hay texto pero inválido (ej. solo espacios) */}
                        {!hasText && nombreResidencia.length > 0 && (
                            <Text style={styles.errorText}>Ingresa un nombre válido</Text>
                        )}
                    </View>

                    {/* Botón: Se activa SOLO si hasText es true */}
                    <TouchableOpacity
                        style={[
                            styles.botonLogearse,
                            {
                                backgroundColor: hasText ? '#E6ECDC' : '#ccc'  // Verde si texto, gris si no
                            }
                        ]}
                        disabled={!hasText || loading}  // Deshabilitado si no hay texto o está cargando
                        onPress={handleCrear}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#4B4741" />
                        ) : (
                            <Text style={styles.textoBotonLogearse}>Crear</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingTop: hp('7%'),
        paddingHorizontal: wp('5%'),
    },
    titulo: {
        fontSize: moderateScale(40),
        color: '#6B705C',
        fontFamily: 'DMSerifDisplay_400Regular',
        textAlign: 'center',
        marginBottom: hp('1%'),
    },
    subtitulo: {
        fontSize: moderateScale(13),
        color: '#4B4741', // Gris para el texto base
        marginVertical: hp('1%'),
        fontFamily: 'Montserrat_400Regular',
        textAlign: 'center',
        lineHeight: moderateScale(18), // Mejora el espaciado con el salto de línea
    },
    inputGroup: {
        width: wp('80%'),
        marginTop: hp('5%'),
    },
    label: {
        fontSize: moderateScale(14),
        color: '#4B4741',
        fontFamily: 'Montserrat_400Regular',
        marginBottom: hp('0.5%'),
        alignSelf: 'flex-start', // Alinea la etiqueta a la izquierda
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 10,
        paddingHorizontal: wp('4%'),
        paddingVertical: verticalScale(8),
        fontSize: moderateScale(13),
        backgroundColor: '#F5F4F2',
        width: '100%', // Asegura que ocupe todo el ancho del grupo
    },
    errorText: {
        color: 'red',
        fontSize: moderateScale(12),
        marginTop: hp('0.5%'),
        alignSelf: 'flex-start', // Alinea el error a la izquierda
        fontFamily: 'Montserrat_400Regular',
    },
    botonLogearse: {
        paddingVertical: verticalScale(8),
        borderRadius: 15,
        width: wp('80%'),
        alignSelf: 'center',
        marginTop: hp('3%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    textoBotonLogearse: {
        color: '#4B4741',
        fontSize: moderateScale(15),
        textAlign: 'center',
        fontFamily: 'Montserrat_400Regular',
    },
    textoNegrita: {
        fontFamily: 'Montserrat_700Bold',
        color: '#4B4741', // Gris para negrita
    },
    textoCursiva: {
        fontStyle: 'italic',
        color: '#4B4741', // Gris para cursiva
        fontFamily: 'Montserrat_400Regular',
    },
});

export default NuevaResidencia;