import React, { useState } from 'react';
import {
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
import GLOBAL_STYLES from '../styles/styles';
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
      <View style={[GLOBAL_STYLES.unirResidenciaContainer, { justifyContent: 'center' }]}> 
        <ActivityIndicator size="large" color="#6B705C" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'android' ? hp('8%') : 0}>
        <View style={GLOBAL_STYLES.unirResidenciaContainer}>
          <Text style={GLOBAL_STYLES.unirResidenciaTitulo}>Únete a una residencia</Text>

          <Text style={GLOBAL_STYLES.unirResidenciaSubtitulo}>
            <Text style={GLOBAL_STYLES.unirResidenciaTextoNegrita}>Obtén el código de la residencia a la que quieres unirte en el apartado </Text>
            <Text style={GLOBAL_STYLES.unirResidenciaTextoCursiva}>Perfil - Mi residencia</Text>
          </Text>

          <View style={GLOBAL_STYLES.unirResidenciaInputGroup}>
            <Text style={GLOBAL_STYLES.unirResidenciaLabel}>Código de la residencia</Text>
            <TextInput
              style={[
                GLOBAL_STYLES.unirResidenciaInput,
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
            {!isValidCode && codigoResidencia.length > 0 && <Text style={GLOBAL_STYLES.unirResidenciaErrorText}>Formato inválido. Usa 0-0-0-0-0-0</Text>}
          </View>

          <TouchableOpacity style={[GLOBAL_STYLES.unirResidenciaBotonLogearse, { backgroundColor: isValidCode ? '#E6ECDC' : '#ccc' }]} disabled={!isValidCode || loading} onPress={handleUnirse}>
            {loading ? <ActivityIndicator size="small" color="#4B4741" /> : <Text style={GLOBAL_STYLES.unirResidenciaTextoBotonLogearse}>Unirse</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};



export default UnirResidencia;
