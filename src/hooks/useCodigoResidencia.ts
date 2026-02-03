import { useState } from "react";
import { obtenerCodigoEspacio } from "../api/espacio";

export default function useCodigoResidencia() {
  const [codigo, setCodigo] = useState("");
  const [digitos, setDigitos] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleChange = (text: string) => {
    // Detectar si es backspace comparando longitudes
    const esBackspace = text.length < codigo.length;

    if (esBackspace) {
      // Remover el último dígito
      const nuevosDigitos = digitos.slice(0, -1);
      setDigitos(nuevosDigitos);

      // Formatear
      const positions = new Array(6).fill(" ");
      nuevosDigitos.split("").forEach((digit, index) => {
        positions[index] = digit;
      });
      const formatted = positions.join("-");
      setCodigo(formatted);
    } else {
      // Agregar nuevo dígito - elimina todo lo que no sea dígito
      const nuevosDigitos = text.replace(/\D/g, "").slice(0, 6);
      setDigitos(nuevosDigitos);

      // Crear 6 posiciones con espacios como placeholder
      const positions = new Array(6).fill(" ");

      // Llenar las posiciones con los dígitos ingresados
      nuevosDigitos.split("").forEach((digit, index) => {
        positions[index] = digit;
      });

      // Unir con guiones: X-X-X-X-X-X (donde X es dígito o espacio)
      const formatted = positions.join("-");

      setCodigo(formatted);
    }
  };

  const generarCodigo = async (espacioId: string) => {
    setLoadingCode(true);
    setErrorCode(null);
    try {
      const result = await obtenerCodigoEspacio(espacioId);
      console.log("GenerarCodigo response:", result);

      let codeStr = "";
      if (typeof result === "string") {
        codeStr = result;
      } else if (typeof result === "object" && result !== null) {
        // Intentar propiedades comunes
        if ("codigo" in result) codeStr = String(result.codigo);
        else if ("code" in result) codeStr = String(result.code);
        else if ("data" in result) codeStr = String(result.data);
        else if ("value" in result) codeStr = String(result.value);
        else if ("token" in result) codeStr = String(result.token);
        else {
          // Si no encontramos una propiedad conocida, intentamos parsear el primer valor si es único
          const values = Object.values(result);
          if (
            values.length === 1 &&
            (typeof values[0] === "string" || typeof values[0] === "number")
          ) {
            codeStr = String(values[0]);
          } else {
            // Último recurso: mostrar el objeto como string para depuración visual en la UI
            codeStr = JSON.stringify(result);
          }
        }
      } else {
        codeStr = String(result);
      }

      // Limpiar comillas si el stringify añadió extras o si el backend devolvió "\"123\""
      codeStr = codeStr.replace(/^"|"$/g, "");

      setGeneratedCode(codeStr);
      return codeStr;
    } catch (error: any) {
      console.error("Error generating code:", error);
      setErrorCode(error.message || "Error al generar código");
    } finally {
      setLoadingCode(false);
    }
  };

  return {
    codigo,
    handleChange,
    generatedCode,
    generarCodigo,
    loadingCode,
    errorCode,
  };
}
