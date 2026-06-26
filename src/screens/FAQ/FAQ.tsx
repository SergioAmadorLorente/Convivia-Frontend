import React from "react";
import { Text, View, ScrollView } from "react-native";
import GLOBAL_STYLES from "../../styles/styles";
import { Desplegable } from "../../components/ui";

const FAQ: React.FC = () => {
    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1, backgroundColor: "#F5F4F2" }}
            showsVerticalScrollIndicator={false}
        >
            <Text style={GLOBAL_STYLES.titulo}>Preguntas Frecuentes</Text>

            <View style={GLOBAL_STYLES.container}>
                <View style={{ width: "85%", marginTop: 20 }}>
                    <Text style={[GLOBAL_STYLES.subtitle, { marginBottom: 12 }]}>
                        Aquí encontrarás respuestas a las dudas más comunes.
                    </Text>

                    <Desplegable title="¿Cómo se pueden añadir integrantes a una residencia?">
                        <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
                            Para añadir integrantes a una residencia, el integrante interesado debe ingresar el código generado aleatoriamente por el administrador
                            de la misma en la pantalla de unirse a una residencia.
                        </Text>
                    </Desplegable>

                    <Desplegable title="¿Cómo puedo gestionar una factura?">
                        <Text style={GLOBAL_STYLES.helperText}>
                            Para gestionar una factura, solo tienes que acceder a la pantalla "Mis Facturas" en la sección "Mi Perfil".
                        </Text>
                    </Desplegable>

                    <Desplegable title="¿Cómo eliminar a un integrante de una residencia?">
                        <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
                            El administrador puede eliminar a un integrante desde la pantalla "Mi Residencia".
                            También el integrante puede abandonar la residencia desde la pantalla "Mi Residencia".
                        </Text>
                    </Desplegable>

                    <Desplegable title="¿Cómo puedo crear una residencia?">
                        <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
                            Una vez registrado como usuario, puedes crear una residencia al pulsar la opción "Crear Residencia".
                        </Text>
                    </Desplegable>

                    <Desplegable title="¿Cómo puedo gestionar una tarea?">
                        <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
                            Desde "Mi Perfil", puedes gestionar tareas, se abrirá un desplegable en el cual se puede gestionar la fecha. miembros asignados y otros parámetros.
                        </Text>
                    </Desplegable>
                </View>
            </View>
        </ScrollView>
    );
};

export default FAQ;
