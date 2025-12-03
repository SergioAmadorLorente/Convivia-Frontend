import { useState } from "react";

export default function useCodigoResidencia() {
  const [codigo, setCodigo] = useState("");

  const handleChange = (text: string) => {
    // Elimina todo lo que no sea dígito
    const digits = text.replace(/\D/g, "");

    // Máximo 6 dígitos
    const limited = digits.slice(0, 6);

    // Inserta guiones: 0-0-0-0-0-0
    const formatted = limited.split("").join("-");

    setCodigo(formatted);
  };

  return { codigo, handleChange };
}
