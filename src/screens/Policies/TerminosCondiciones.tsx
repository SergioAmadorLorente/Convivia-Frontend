import React from 'react';
import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import GLOBAL_STYLES from '../../styles/styles';
import { Desplegable } from '../../components/ui';

const TerminosCondiciones: React.FC = () => {
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[GLOBAL_STYLES.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View style={GLOBAL_STYLES.container}>
        <Text style={[GLOBAL_STYLES.titulo, { fontSize: 42 }]}>Términos y Condiciones de Uso</Text>

        <View style={{ width: '85%', marginTop: 20 }}>
          <Text style={[GLOBAL_STYLES.subtitle, { marginBottom: 12 }]}>
            Al usar Convivia, aceptas cumplir con estos términos y condiciones. Léelos atentamente antes de utilizar nuestros servicios.
          </Text>

          <Desplegable title="Licencia de Uso">

          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
            Se permite descargar temporalmente una copia de los materiales en Convivia únicamente para visualización personal y transitoria sin fines comerciales. Esto constituye la concesión de una licencia, no una transferencia de título, y bajo esta licencia no puedes:
          </Text>
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12, marginLeft: 16 }]}>• Modificar o copiar los materiales</Text>
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12, marginLeft: 16 }]}>• Utilizarlos con fines comerciales o para exhibición pública</Text>
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12, marginLeft: 16 }]}>• Intentar descompilar o realizar ingeniería inversa de cualquier software en Convivia</Text>
          </Desplegable>

          <Desplegable title="Responsabilidades del Usuario">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>Como usuario de Convivia, aceptas:</Text>
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12, marginLeft: 16 }]}>• Proporcionar información precisa y veraz</Text>
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12, marginLeft: 16 }]}>• Usar la plataforma de forma responsable y conforme a la ley</Text>
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12, marginLeft: 16 }]}>• No participar en acoso, discriminación o actividades ilegales</Text>
          </Desplegable>

          <Desplegable title="Limitación de Responsabilidad">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>Convivia proporciona la plataforma "tal cual" sin garantías de ningún tipo. No seremos responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos derivados de tu uso o de la imposibilidad de usar la plataforma.</Text>
          </Desplegable>

          <Desplegable title="Modificaciones a los Términos">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>Convivia se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios serán efectivos inmediatamente al publicarse en la plataforma. Tu uso continuado de la plataforma indica tu aceptación de dichas modificaciones.</Text>
          </Desplegable>

          <Desplegable title="Contáctanos">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>Si tienes preguntas o inquietudes sobre estos términos, por favor contáctanos a través de nuestros canales de soporte.</Text>
          </Desplegable>
        </View>
      </View>
    </ScrollView>
  );
};

export default TerminosCondiciones;
