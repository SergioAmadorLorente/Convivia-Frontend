import { useState } from 'react';

export interface Factura {
    id: string;
    name: string;
    description: string;
    amount: string;
    assignedUsers: any[];
    imageUri?: string;
    time?: string; // For display purposes in list
}

export const useEditFactura = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
    const [imageUri, setImageUri] = useState<string | undefined>(undefined);

    const [isEditing, setIsEditing] = useState(false);
    const [facturaId, setFacturaId] = useState<string | undefined>(undefined);

    const loadFactura = (factura: Factura) => {
        setFacturaId(factura.id);
        setName(factura.name);
        setDescription(factura.description);
        setAmount(factura.amount);
        setAssignedUsers(factura.assignedUsers || []);
        setImageUri(factura.imageUri);
        setIsEditing(true);
    };

    const resetForm = () => {
        setFacturaId(undefined);
        setName('');
        setDescription('');
        setAmount('');
        setAssignedUsers([]);
        setImageUri(undefined);
        setIsEditing(false);
    };

    const getFacturaData = (): Factura => ({
        id: String(facturaId),
        name,
        description,
        amount,
        assignedUsers,
        imageUri,
    });

    return {
        // State
        name, setName,
        description, setDescription,
        amount, setAmount,
        assignedUsers, setAssignedUsers,
        imageUri, setImageUri,
        isEditing,

        // Actions
        loadFactura,
        resetForm,
        getFacturaData
    };
};