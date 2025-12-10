import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Button from '../components/ui/Button';
import GLOBAL_STYLES from '../styles/styles';
import Felicidades from './popusEspera/Felicidades';
import CasiLoLogras from './popusEspera/CasiLoLogras';

const TestScreen = () => {
    const [showFelicidades, setShowFelicidades] = useState(false);
    const [showCasiLoLogras, setShowCasiLoLogras] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={[GLOBAL_STYLES.title, { marginBottom: 20 }]}>Pantalla de Prueba</Text>

            <Button
                style={GLOBAL_STYLES.buttonPrimaryGreen}
                onPress={() => setShowFelicidades(true)}
            >
                Mostrar Felicidades
            </Button>

            <View style={{ height: 20 }} />

            <Button
                style={GLOBAL_STYLES.buttonSecondaryGrey}
                onPress={() => setShowCasiLoLogras(true)}
            >
                Mostrar Casi Lo Logras
            </Button>

            {showFelicidades && (
                <Felicidades
                    visible={showFelicidades}
                    onClose={() => setShowFelicidades(false)}
                />
            )}

            {showCasiLoLogras && (
                <CasiLoLogras
                    visible={showCasiLoLogras}
                    onClose={() => setShowCasiLoLogras(false)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
});

export default TestScreen;
