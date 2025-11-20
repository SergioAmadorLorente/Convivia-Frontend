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
  Alert,
} from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale, verticalScale } from 'react-native-size-matters';

const NuevaResidencia: React.FC = () => {
  const [nombreResidencia, setNombreResidencia] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const hasText = nombreResidencia.trim().length > 0;

  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular, Montserrat_400Regular, Montserrat_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6B705C" />
      </View>
    );
  }

  const handleCrear = async () => {
    if (!hasText) {
      Alert.alert('Campo requerido', 'Por favor, ingresa un nombre para la residencia.');
      return;
    }

    setLoading(true);
    try {
      Alert.alert('Éxito', 'Residencia creada exitosamente');
      navigation.navigate('DashBoardPersonal');
    } catch (error) {
      console.error('Error al crear residencia:', error);
      Alert.alert('Error', 'Error al crear la residencia. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'android' ? hp('8%') : 0}>
        <View style={styles.container}>
          <Text style={styles.titulo}>Crea una nueva residencia</Text>

          <Text style={styles.subtitulo}>
            <Text style={styles.textoNegrita}>Obtén el código de tu residencia en el apartado </Text>
            <Text style={styles.textoCursiva}>Perfil - Mi residencia</Text>
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la residencia</Text>
            <TextInput
              style={[styles.input, { borderColor: hasText ? '#28e80eff' : 'red' }]}
              placeholder="Piso Tarragona"
              autoCapitalize="words"
              autoCorrect={false}
              value={nombreResidencia}
              onChangeText={setNombreResidencia}
            />
            {!hasText && nombreResidencia.length > 0 && <Text style={styles.errorText}>Ingresa un nombre válido</Text>}
          </View>

          <TouchableOpacity style={[styles.botonLogearse, { backgroundColor: hasText ? '#E6ECDC' : '#ccc' }]} disabled={!hasText || loading} onPress={handleCrear}>
            {loading ? <ActivityIndicator size="small" color="#4B4741" /> : <Text style={styles.textoBotonLogearse}>Crear</Text>}
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
    color: '#4B4741',
    marginVertical: hp('1%'),
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    lineHeight: moderateScale(18),
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
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    paddingHorizontal: wp('4%'),
    paddingVertical: verticalScale(8),
    fontSize: moderateScale(13),
    backgroundColor: '#F5F4F2',
    width: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: moderateScale(12),
    marginTop: hp('0.5%'),
    alignSelf: 'flex-start',
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
    color: '#4B4741',
  },
  textoCursiva: {
    fontStyle: 'italic',
    color: '#4B4741',
    fontFamily: 'Montserrat_400Regular',
  },
});

export default NuevaResidencia;
