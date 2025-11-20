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

const UnirResidencia: React.FC = () => {
  const [codigoResidencia, setCodigoResidencia] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const formatoValido = /^\d-\d-\d-\d-\d-\d$/;
  const isValidCode = formatoValido.test(codigoResidencia.trim());

  const handleUnirse = async () => {
    if (!isValidCode) {
      Alert.alert('Código inválido', 'Por favor, ingresa un código válido con el formato 0-0-0-0-0-0.');
      return;
    }

    setLoading(true);
    try {
      Alert.alert('Éxito', 'Te has unido exitosamente a la residencia');
      navigation.navigate('DashBoardPersonal');
    } catch (error) {
      console.error('Error al unirse a la residencia:', error);
      Alert.alert('Error', 'No se pudo unir a la residencia. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6B705C" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? hp('8%') : 0}>
        <View style={styles.container}>
          <Text style={styles.titulo}>Únete a una residencia</Text>

          <Text style={styles.subtitulo}>
            <Text style={styles.textoNegrita}>Obtén el código de la residencia a la que quieres unirte en el apartado </Text>
            <Text style={styles.textoCursiva}>Perfil - Mi residencia</Text>
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código de la residencia</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: codigoResidencia.length === 0 ? '#CCC' : isValidCode ? '#28e80eff' : 'red',
                },
              ]}
              placeholder="0-0-0-0-0-0"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              value={codigoResidencia}
              onChangeText={setCodigoResidencia}
            />
            {!isValidCode && codigoResidencia.length > 0 && <Text style={styles.errorText}>Formato inválido. Usa 0-0-0-0-0-0</Text>}
          </View>

          <TouchableOpacity style={[styles.botonLogearse, { backgroundColor: isValidCode ? '#E6ECDC' : '#ccc' }]} disabled={!isValidCode || loading} onPress={handleUnirse}>
            {loading ? <ActivityIndicator size="small" color="#4B4741" /> : <Text style={styles.textoBotonLogearse}>Unirse</Text>}
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

export default UnirResidencia;
