import { useState } from "react";
import { obtenerCodigoEspacio } from "../api/espacio";

export default function useCodigoResidencia() {
  const [codigo, setCodigo] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleChange = (text: string) => {
    // Elimina todo lo que no sea dígito
    const digits = text.replace(/\D/g, "");

    // Máximo 6 dígitos
    const limited = digits.slice(0, 6);

    // Inserta guiones: 0-0-0-0-0-0
    const formatted = limited.split("").join("-");

    setCodigo(formatted);
  };

  const generarCodigo = async (espacioId: string) => {
    setLoadingCode(true);
    setErrorCode(null);
    try {
      const result = await obtenerCodigoEspacio(espacioId);
      console.log("GenerarCodigo response:", result);

      let codeStr = "";
      if (typeof result === 'string') {
        codeStr = result;
      } else if (typeof result === 'object' && result !== null) {
        // Intentar propiedades comunes
        if ('codigo' in result) codeStr = String(result.codigo);
        else if ('code' in result) codeStr = String(result.code);
        else if ('data' in result) codeStr = String(result.data);
        else if ('value' in result) codeStr = String(result.value);
        else if ('token' in result) codeStr = String(result.token);
        else {
           // Si no encontramos una propiedad conocida, intentamos parsear el primer valor si es único
           const values = Object.values(result);
           if (values.length === 1 && (typeof values[0] === 'string' || typeof values[0] === 'number')) {
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
      codeStr = codeStr.replace(/^"|"$/g, '');
      
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
    errorCode
  };
}
