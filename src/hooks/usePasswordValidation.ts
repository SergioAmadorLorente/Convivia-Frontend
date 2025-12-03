import { useState } from "react";

export const usePasswordValidation = () => {
    const [password, setPassword] = useState("");

    const validations = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
    };
    const isValidPassword =
        validations.length && validations.uppercase && validations.number;

    return {
        password,
        setPassword,
        validations,
        isValidPassword,
    };
};
