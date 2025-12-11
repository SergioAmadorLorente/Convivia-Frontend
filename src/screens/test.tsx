import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import Button from '../components/ui/Button';
import GLOBAL_STYLES from '../styles/styles';
import Felicidades from './popusEspera/Felicidades';
import CasiLoLogras from './popusEspera/CasiLoLogras';
import AssignUsersPopup from '../components/ui/AssignUsersPopup';

type BackendUser = { id: string; name: string };

const TestScreen = () => {
  const [showFelicidades, setShowFelicidades] = useState(false);
  const [showCasiLoLogras, setShowCasiLoLogras] = useState(false);

  // ---- Demo: selector de usuarios ----
  const [showAssignUsers, setShowAssignUsers] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<BackendUser[]>([]);

  // Usuarios simulados (sustituye por los del backend)
  const [users, setUsers] = useState<BackendUser[]>([
    { id: 'u1', name: 'Pepito228 DESTROYER' },
    { id: 'u2', name: 'PupuGugu' },
    { id: 'u3', name: 'Clara DSAWTTTT' },
  ]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const openAssignUsers = async () => {
    // Si quieres simular carga desde backend, descomenta:
    // setLoadingUsers(true);
    // await new Promise(r => setTimeout(r, 600));
    // setUsers(....) // set con lo que traigas del back
    // setLoadingUsers(false);
    setShowAssignUsers(true);
  };

  return (
    <View style={styles.container}>
      <Text style={[GLOBAL_STYLES.title, { marginBottom: 20 }]}>Pantalla de Prueba</Text>

      {/* --- Botones de los popups existentes --- */}
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

      {/* --- Demo: selección de usuarios (para tareas o facturas) --- */}
      <View style={{ height: 30 }} />
      <Text style={GLOBAL_STYLES.subtitle}>
        {assignedUsers.length
          ? `Seleccionados: ${assignedUsers.map(u => u.name).join(', ')}`
          : 'Seleccionados: ninguno'}
      </Text>
      <View style={{ height: 10 }} />
      <Button
        style={GLOBAL_STYLES.buttonPrimaryGreen}
        onPress={openAssignUsers}
      >
        Abrir selector (Usuarios)
      </Button>

      {/* --- Popups existentes --- */}
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

      {/* --- Popup de asignación de usuarios --- */}
      <AssignUsersPopup
        visible={showAssignUsers}
        onClose={() => setShowAssignUsers(false)}
        title="Asignación de usuarios"  // Para facturas solo cambia este título
        imageType="convivia"
        showImage
        users={users}
        multiSelect={true} // si quieres selección única, pon false
        initialSelectedIds={assignedUsers.map(u => u.id)}
        confirmLabel="¡Asigna!"
        onConfirm={(selected) => setAssignedUsers(selected)}
        loadingUsers={loadingUsers}
        // requireSelection={false} // si quieres permitir confirmar sin selección
      />
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
