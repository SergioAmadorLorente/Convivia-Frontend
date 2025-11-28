import React from 'react';
import { Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import GLOBAL_STYLES from '../../styles/styles';
import { Desplegable } from '../../components/ui';

const PoliticaCookiesPrivacidad: React.FC = () => {
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
        <Text style={GLOBAL_STYLES.titulo}>Política de Privacidad</Text>

        <View style={{ width: '85%', marginTop: 20 }}>
          <Text style={[GLOBAL_STYLES.subtitle, { marginBottom: 12 }]}>
            En Convivia, nos comprometemos a proteger tu privacidad y garantizar que tengas una experiencia positiva en nuestra plataforma.
          </Text>

          <Desplegable title="Información que Recopilamos">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
            Recopilamos información que proporcionas directamente, como tu correo electrónico e información de perfil. También recopilamos automáticamente cierta información sobre tu dispositivo y cómo interactúas con nuestros servicios.
          </Text>
          </Desplegable>

          <Desplegable title="Cómo Utilizamos Tu Información">
          <Text style={GLOBAL_STYLES.helperText}>
            Utilizamos tu información para proporcionar, mantener y mejorar nuestros servicios, comunicarnos contigo y cumplir con obligaciones legales. Tus datos nos ayudan a personalizar tu experiencia y mejorar nuestra plataforma.
          </Text>
          </Desplegable>

          <Desplegable title="Cookies y Tecnologías Similares">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
            Las cookies son pequeños archivos almacenados en tu dispositivo que nos ayudan a recordar tus preferencias y entender cómo utilizas nuestros servicios. Utilizamos cookies esenciales para funcionalidad, cookies analíticas para mejorar nuestros servicios, y cookies de preferencia para recordar tus configuraciones.
          </Text>
          </Desplegable>

          <Desplegable title="Seguridad de Datos">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 24 }]}>
            Implementamos medidas de seguridad apropiadas para proteger tu información personal del acceso no autorizado. Sin embargo, ningún método de transmisión por internet es completamente seguro.
          </Text>
          </Desplegable>

          <Desplegable title="Tus Derechos de Privacidad" >
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 24 }]}>
            Tienes derecho a acceder, actualizar o eliminar tu información personal. También puedes controlar las preferencias de cookies a través de la configuración de tu navegador. Para más información sobre tus derechos, por favor contactanos directamente.
          </Text>
          </Desplegable>

          <Desplegable title="Comprendiendo Nuestra Política de Cookies">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
            Las cookies son esenciales para cómo opera Convivia. Nos permiten recordar tu estado de sesión, preferencias, y mejorar tu experiencia general. Diferentes tipos de cookies sirven para diferentes propósitos en nuestra plataforma.
          </Text>
          </Desplegable>

          <Desplegable title="Cookies Esenciales">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
            Estas cookies son necesarias para que el sitio web funcione correctamente. Habilitan funcionalidad principal como inicio de sesión seguro, autenticación de usuario, y navegación básica del sitio. No puedes desactivar estas cookies sin impedir que el sitio funcione.
          </Text>
          </Desplegable>

          <Desplegable title="Cookies de Rendimiento y Análisis">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
            Utilizamos estas cookies para entender cómo los visitantes interactúan con nuestra plataforma. Nos ayudan a identificar qué características son más populares, rastrear errores, y medir el rendimiento general de Convivia. Estos datos se recopilan de forma anónima.
          </Text>
          </Desplegable>

          <Desplegable title="Cookies de Preferencia y Funcionalidad" >
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
            Estas cookies recuerdan las opciones que haces para proporcionar una experiencia personalizada. Por ejemplo, almacenan tu preferencia de idioma, configuración de tema, y diseños personalizados. Desactivarlas puede resultar en funcionalidad reducida.
          </Text>
          </Desplegable>

          <Desplegable title="Gestionando Tus Cookies">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
            La mayoría de los navegadores te permiten controlar las cookies a través de su configuración. Puedes elegir aceptar todas las cookies, rechazar cookies no esenciales, o ser preguntado cada vez que se establece una cookie. Ten en cuenta que bloquear cookies puede impactar tu experiencia en Convivia.
          </Text>
          </Desplegable>

          <Desplegable title="Cookies de Terceros">
          <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 24 }]}>
            Algunos de nuestros socios de servicio pueden establecer cookies en tu dispositivo para analizar el uso de la plataforma y proporcionar servicios relacionados con el contenido y servicios de la plataforma. No somos responsables de las prácticas de privacidad de terceros. Te animamos a que revises sus políticas de privacidad.
          </Text>
          </Desplegable>
        </View>
      </View>
    </ScrollView>
  );
};

export default PoliticaCookiesPrivacidad;
