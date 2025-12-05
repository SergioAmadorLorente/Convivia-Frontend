import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GLOBAL_STYLES from '../styles/styles';
import Popup from '../components/ui/Popup';

const TestScreen: React.FC = () => {
    const [popupVisible, setPopupVisible] = useState(true);

    return (
        <View style={styles.container}>
            <Text style={GLOBAL_STYLES.title}>Test Page</Text>
            <Popup
                visible={popupVisible}
                onClose={() => setPopupVisible(false)}
                title="¡Casi lo logras!"
                description="La próxima vez, intenta completar la tarea dentro del plazo.\nHas ganado 0 puntos de Karma."
                imageType="smile"
                buttons={[
                    {
                        text: 'Cerrar',
                        onPress: () => setPopupVisible(false),
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default TestScreen;
