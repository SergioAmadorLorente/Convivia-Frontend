import { useState, useCallback } from 'react';

export const useEmailValidation = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const validateEmail = (value: string) => {
    setEmail(value);
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) {
      setEmailError('Correo inválido');
    } else {
      setEmailError('');
    }
  };
  return {
    email,
    setEmail: validateEmail,
    isValidEmail: emailError === '' && email.length > 0,
    emailError,
  };
};
