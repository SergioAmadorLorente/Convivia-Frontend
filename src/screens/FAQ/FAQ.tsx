import React from "react";
import { Text, View, ScrollView } from "react-native";
import GLOBAL_STYLES from "../../styles/styles";
import { Desplegable } from "../../components/ui";

const FAQ: React.FC = () => {
    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={GLOBAL_STYLES.container}>
                <Text style={GLOBAL_STYLES.titulo}>Preguntas Frecuentes</Text>

                <View style={{ width: "85%", marginTop: 20 }}>
                    <Text style={[GLOBAL_STYLES.subtitle, { marginBottom: 12 }]}>
                        Aquí encontrarás respuestas a las dudas más comunes.
                    </Text>

                    <Desplegable title="¿Cómo se pueden añadir integrantes a una residencia?">
                        <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
                            euismod pellentesque dui. Phasellus pellentesque hendrerit
                            bibendum. Nunc tristique metus sed dictum condimentum.
                        </Text>
                    </Desplegable>

                    <Desplegable title="¿Cómo puedo gestionar una factura?">
                        <Text style={GLOBAL_STYLES.helperText}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
                            euismod pellentesque dui. Phasellus pellentesque hendrerit
                            bibendum. Nunc tristique metus sed dictum condimentum.
                        </Text>
                    </Desplegable>

                    <Desplegable title="¿Cómo eliminar a un integrante de una residencia?">
                        <Text style={[GLOBAL_STYLES.helperText, { marginBottom: 12 }]}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
                            euismod pellentesque dui. Phasellus pellentesque hendrerit
                            bibendum. Nunc tristique metus sed dictum condimentum.
                        </Text>
                    </Desplegable>
                </View>
            </View>
        </ScrollView>
    );
};

export default FAQ;
