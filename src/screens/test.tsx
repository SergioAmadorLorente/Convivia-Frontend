/*
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import Button from '../components/ui/Button';
import GLOBAL_STYLES from '../styles/styles';
import Felicidades from './popusEspera/Felicidades';
import CasiLoLogras from './popusEspera/CasiLoLogras';
import AssignUsersPopup from '../components/ui/AssignUsersPopup';
import MoneyInput from '../components/ui/MoneyInput';
import UploadImage from '../components/ui/UploadImage';
import { obtenerImagenFactura, subirImagenFactura, actualizarImagenFactura, eliminarImagenFactura } from '../api/factura';

type BackendUser = { id: string; name: string };

const TestScreen = () => {
  const [showFelicidades, setShowFelicidades] = useState(false);
  const [showCasiLoLogras, setShowCasiLoLogras] = useState(false);

  // ---- Demo: imagen de factura ----
  const [facturaImageUri, setFacturaImageUri] = useState<string | null>(null);
  const [imagenOriginal, setImagenOriginal] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState(true);
  const ESPACIO_ID = '0cb192af91b4451da20c642d212539f0';
  const FACTURA_ID = '';

  const cargarImagenFactura = async () => {
    try {
      console.log('Cargando imagen de factura...');
      const blob = await obtenerImagenFactura(ESPACIO_ID, FACTURA_ID);
      // Convertir blob a URI para React Native
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setFacturaImageUri(base64data);
        setImagenOriginal(base64data);
        console.log('Imagen cargada exitosamente');
      };
    } catch (error) {
      console.error('Error al cargar imagen:', error);
      setFacturaImageUri(null);
      setImagenOriginal(null);
    }
  };

  const guardarImagen = async () => {
    try {
      // Caso 1: Imagen no ha cambiado
      if (facturaImageUri === imagenOriginal) {
        console.log('La imagen no ha cambiado, no se hace nada');
        return;
      }

      // Caso 2: No hay imagen actual pero antes había una (eliminar)
      if (!facturaImageUri && imagenOriginal) {
        console.log('Eliminando imagen...');
        await eliminarImagenFactura(ESPACIO_ID, FACTURA_ID);
        setImagenOriginal(null);
        console.log('Imagen eliminada exitosamente');
        return;
      }

      // Caso 3: Hay imagen nueva y antes también había (actualizar)
      if (facturaImageUri && imagenOriginal) {
        console.log('Actualizando imagen...');
        await actualizarImagenFactura(ESPACIO_ID, FACTURA_ID, facturaImageUri);
        setImagenOriginal(facturaImageUri);
        console.log('Imagen actualizada exitosamente');
        return;
      }

      // Caso 4: Hay imagen nueva y antes no había (subir)
      if (facturaImageUri && !imagenOriginal) {
        console.log('Subiendo nueva imagen...');
        await subirImagenFactura(ESPACIO_ID, FACTURA_ID, facturaImageUri);
        setImagenOriginal(facturaImageUri);
        console.log('Imagen subida exitosamente');
        return;
      }
    } catch (error) {
      console.error('Error al guardar imagen:', error);
    }
  };

  useEffect(() => {
    cargarImagenFactura();
  }, []);

  // ---- Demo: selector de usuarios ----
  const [showAssignUsers, setShowAssignUsers] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<BackendUser[]>([]);

  // Usuarios simulados (cámbialos por los del backend cuando quieras)
  const [users, setUsers] = useState<BackendUser[]>([
    { id: 'u1', name: 'Pepito228 DESTROYER' },
    { id: 'u2', name: 'PupuGugu' },
    { id: 'u3', name: 'Clara DSAWTTTT' },
    { id: 'u4', name: 'Otro Usuario con nombre largo para probar scroll' },
    { id: 'u5', name: 'Usuario Cinco' },
    { id: 'u6', name: 'Usuario Seis' },
  ]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const openAssignUsers = async () => {
    // Simulación de carga desde backend (opcional)
    // setLoadingUsers(true);
    // await new Promise(r => setTimeout(r, 600));
    // setUsers(res.data); // cuando tengas API real
    // setLoadingUsers(false);
    setShowAssignUsers(true);
  };

  return (
    <View style={styles.container}>
      <Text style={[GLOBAL_STYLES.title, { marginBottom: 20 }]}>Pantalla de Prueba</Text>
      <MoneyInput onChange={(val) => console.log("Dinero:", val)} />
      <UploadImage
        label="Imagen Factura"
        initialImageUri={facturaImageUri}
        editable={modoEdicion}
        onImageSelected={(uri) => {
          console.log("Imagen seleccionada:", uri);
          setFacturaImageUri(uri);
        }}
      />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Button
          style={[GLOBAL_STYLES.buttonPrimaryGreen, { flex: 1 }]}
          onPress={() => setModoEdicion(!modoEdicion)}
        >
          {modoEdicion ? 'Modo Vista' : 'Modo Edición'}
        </Button>
        <Button
          style={[GLOBAL_STYLES.buttonSecondaryGrey, { flex: 1 }]}
          onPress={guardarImagen}
        >
          Guardar Imagen
        </Button>
      </View>
      
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

      <AssignUsersPopup
        visible={showAssignUsers}
        onClose={() => setShowAssignUsers(false)}
        title="Asignación de usuarios"
        users={users}
        multiSelect={true}
        initialSelectedIds={assignedUsers.map(u => u.id)}
        confirmLabel="¡Asigna!"
        onConfirm={(selected) => setAssignedUsers(selected)}
        loadingUsers={loadingUsers}
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
*/

import React from 'react';
import { View, Text } from 'react-native';

const TestScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Test Screen (Disabled)</Text>
  </View>
);

export default TestScreen;
