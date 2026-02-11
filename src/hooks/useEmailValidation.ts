import { useState } from "react";

export const useEmailValidation = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  
  const validateEmail = (value: string) => {
    setEmail(value);
    
    // Expresión regular: solo letras en todo el dominio (sin números)
    const pattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z]+(?:-[a-z]+)*(?:\.[a-z]+(?:-[a-z]+)*)*\.[a-z]{2,}$/i;
    
    // Validaciones adicionales
    if (!value || value.trim() === "") {
      setEmailError("El correo es requerido");
      return;
    }
    
    if (value.length > 254) {
      setEmailError("El correo es demasiado largo");
      return;
    }
    
    const [localPart, domain] = value.split("@");
    
    if (localPart && localPart.length > 64) {
      setEmailError("La parte local del correo es demasiado larga");
      return;
    }
    
    if (!pattern.test(value.toLowerCase())) {
      setEmailError("Correo inválido");
      return;
    }
    
    // Validar que el dominio tenga al menos un punto
    if (domain && !domain.includes(".")) {
      setEmailError("El dominio debe contener un punto");
      return;
    }
    
    // Validar que no termine en punto
    if (value.endsWith(".")) {
      setEmailError("El correo no puede terminar en punto");
      return;
    }
    
    // Validar que no haya puntos consecutivos
    if (value.includes("..")) {
      setEmailError("No se permiten puntos consecutivos");
      return;
    }
    
    setEmailError("");
  };
  
  return {
    email,
    setEmail: validateEmail,
    isValidEmail: emailError === "" && email.length > 0,
    emailError,
  };
};