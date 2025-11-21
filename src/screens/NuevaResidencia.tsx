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

const NuevaResidencia: React.FC = () => {
  const [nombreResidencia, setNombreResidencia] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const hasText = nombreResidencia.trim().length > 0;

  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular, Montserrat_400Regular, Montserrat_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.nuevaResidenciaContainer, { justifyContent: 'center' }]}> 
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
        <View style={GLOBAL_STYLES.nuevaResidenciaContainer}>
          <Text style={GLOBAL_STYLES.nuevaResidenciaTitulo}>Crea una nueva residencia</Text>

          <Text style={GLOBAL_STYLES.nuevaResidenciaSubtitulo}>
            <Text style={GLOBAL_STYLES.nuevaResidenciaTextoNegrita}>Obtén el código de tu residencia en el apartado </Text>
            <Text style={GLOBAL_STYLES.nuevaResidenciaTextoCursiva}>Perfil - Mi residencia</Text>
          </Text>

          <View style={GLOBAL_STYLES.nuevaResidenciaInputGroup}>
            <Text style={GLOBAL_STYLES.nuevaResidenciaLabel}>Nombre de la residencia</Text>
            <TextInput
              style={[GLOBAL_STYLES.nuevaResidenciaInput, { borderColor: hasText ? '#28e80eff' : 'red' }]}
              placeholder="Piso Tarragona"
              autoCapitalize="words"
              autoCorrect={false}
              value={nombreResidencia}
              onChangeText={setNombreResidencia}
            />
            {!hasText && nombreResidencia.length > 0 && (
              <Text style={GLOBAL_STYLES.nuevaResidenciaErrorText}>Ingresa un nombre válido</Text>
            )}
          </View>

          <TouchableOpacity
            style={[GLOBAL_STYLES.nuevaResidenciaBotonLogearse, { backgroundColor: hasText ? '#E6ECDC' : '#ccc' }]}
            disabled={!hasText || loading}
            onPress={handleCrear}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#4B4741" />
            ) : (
              <Text style={GLOBAL_STYLES.nuevaResidenciaTextoBotonLogearse}>Crear</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};



export default NuevaResidencia;
