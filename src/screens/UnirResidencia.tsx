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
import Popup from '../components/ui/Popup';

const UnirResidencia: React.FC = () => {
  const [codigoResidencia, setCodigoResidencia] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});

  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };

  const handleClosePopup = () => setPopupVisible(false);

  const formatoValido = /^\d-\d-\d-\d-\d-\d$/;
  const isValidCode = formatoValido.test(codigoResidencia.trim());

  const handleUnirse = async () => {
    if (!isValidCode) {
      showPopup({ title: 'Código inválido', description: 'Por favor, ingresa un código válido con el formato 0-0-0-0-0-0.', imageType: 'error', buttons: [{ text: 'Aceptar', onPress: () => {} }] });
      return;
    }

    setLoading(true);
    try {
      showPopup({ title: 'Éxito', description: 'Te has unido exitosamente a la residencia', imageType: 'success', buttons: [{ text: 'Aceptar', onPress: () => navigation.navigate('DashBoardPersonal') }] });
    } catch (error) {
      console.error('Error al unirse a la residencia:', error);
      showPopup({ title: 'Error', description: 'No se pudo unir a la residencia. Intenta de nuevo.', imageType: 'error', buttons: [{ text: 'Aceptar', onPress: () => {} }] });
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
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'android' ? hp('8%') : 0}>
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
      <Popup
        visible={popupVisible}
        onClose={handleClosePopup}
        title={popupOptions.title || ''}
        description={popupOptions.description}
        imageType={popupOptions.imageType}
        buttons={popupOptions.buttons}
      />
    </>
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
