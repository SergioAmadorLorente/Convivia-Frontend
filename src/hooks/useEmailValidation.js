import { useState, useCallback } from 'react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function useEmailValidation(initial = '') {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');

  const validate = useCallback((text) => {
    setValue(text);
    setError(emailRegex.test(text) ? '' : 'Por favor, introduce un correo válido');
  }, []);

  return { value, setValue, error, validate, isValid: error === '' && value.length > 0 };
}
