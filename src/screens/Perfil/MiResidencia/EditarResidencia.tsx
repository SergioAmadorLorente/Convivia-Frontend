import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../navigation/RootStackParamList";
import GLOBAL_STYLES from "../../../styles/styles";
import TextField from "../../../components/ui/TextField";
import Button from "../../../components/ui/Button";

type EditarResidenciaNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EditarResidencia"
>;

const EditarResidencia: React.FC = () => {
  const navigation = useNavigation<EditarResidenciaNavigationProp>();

  // Estados para los campos (inicialmente vacíos como se solicitó)
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  const handleGuardar = () => {
    // Lógica de guardado futura
    console.log("Guardar cambios:", { nombre, ubicacion });
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={GLOBAL_STYLES.scrollContainer}>
      <View style={GLOBAL_STYLES.fullWidth}>
        <Text style={GLOBAL_STYLES.titulo}>Editar Residencia</Text>

        <View style={styles.formContainer}>
          <TextField
            label="Nombre de la residencia"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Introduce el nombre"
          />

          <TextField
            label="Ubicación"
            value={ubicacion}
            onChangeText={setUbicacion}
            placeholder="Introduce la ubicación"
          />

          <Button onPress={handleGuardar} style={styles.button}>
            Guardar Cambios
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },
  button: {
    marginTop: 40,
    width: "90%",
  },
});

export default EditarResidencia;
