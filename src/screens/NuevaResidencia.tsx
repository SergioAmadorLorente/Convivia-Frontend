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
} from 'react-native';
import GLOBAL_STYLES from '../styles/styles';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import Popup from '../components/ui/Popup';

const NuevaResidencia: React.FC = () => {
  const [nombreResidencia, setNombreResidencia] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<any>();

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupOptions, setPopupOptions] = useState<any>({});

  const showPopup = (opts: any) => {
    setPopupOptions(opts);
    setPopupVisible(true);
  };

  const handleClosePopup = () => setPopupVisible(false);

  const hasText = nombreResidencia.trim().length > 0;

  const [fontsLoaded] = useFonts({ DMSerifDisplay_400Regular, Montserrat_400Regular, Montserrat_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: 'center' }]}> 
        <ActivityIndicator size="large" color="#6B705C" />
      </View>
    );
  }

  const handleCrear = async () => {
    if (!hasText) {
      showPopup({ title: 'Campo requerido', description: 'Por favor, ingresa un nombre para la residencia.', imageType: 'error', buttons: [{ text: 'Aceptar', onPress: () => {} }] });
      return;
    }

    setLoading(true);
    try {
      showPopup({ title: 'Éxito', description: 'Residencia creada exitosamente', imageType: 'success', buttons: [{ text: 'Aceptar', onPress: () => navigation.navigate('DashBoardPersonal') }] });
    } catch (error) {
      console.error('Error al crear residencia:', error);
      showPopup({ title: 'Error', description: 'Error al crear la residencia. Intenta de nuevo.', imageType: 'error', buttons: [{ text: 'Aceptar', onPress: () => {} }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <><TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? hp('8%') : 0}>
        <View style={styles.container}>
          <Text style={styles.titulo}>Crea una nueva residencia</Text>

          <Text style={GLOBAL_STYLES.subtitle}>
            <Text style={{ fontWeight: 'bold' }}>Obtén el código de tu residencia en el apartado </Text>
            <Text style={{ fontStyle: 'italic' }}>Perfil - Mi residencia</Text>
          </Text>

          <View style={GLOBAL_STYLES.inputGroup}>
            <Text style={GLOBAL_STYLES.label}>Nombre de la residencia</Text>
            <TextInput
              style={[GLOBAL_STYLES.input, { borderColor: hasText ? '#28e80eff' : 'red' }]}
              placeholder="Piso Tarragona"
              autoCapitalize="words"
              autoCorrect={false}
              value={nombreResidencia}
              onChangeText={setNombreResidencia} />
            {!hasText && nombreResidencia.length > 0 && <Text style={styles.errorText}>Ingresa un nombre válido</Text>}
          </View>

          <TouchableOpacity
            style={[GLOBAL_STYLES.primaryButton, { backgroundColor: hasText ? '#E6ECDC' : '#ccc' }]}
            disabled={!hasText || loading}
            onPress={handleCrear}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#4B4741" />
            ) : (
              <Text style={GLOBAL_STYLES.primaryButtonText}>Crear</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback><Popup
        visible={popupVisible}
        onClose={handleClosePopup}
        title={popupOptions.title || ''}
        description={popupOptions.description}
        imageType={popupOptions.imageType}
        buttons={popupOptions.buttons} />
    </>
  );
};



export default NuevaResidencia;
