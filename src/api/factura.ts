import api from "./client";

export interface FacturaPayload {
    nombre: string;
    precio: number;
    pagoMediano: number;
    pagado: boolean;
    creadorFactura: string;
    deudores: Record<string, boolean>;
}

export const crearFactura = async (data: FacturaPayload) => {
    try {
        const response = await api.post("/Factura", data);
        return response.data;
    } catch (error) {
        console.error("Error al crear factura:", error);
        throw error;
    }
};

export const editarFactura = async (espacioId: string, id: string | number, data: FacturaPayload) => {
    try {
        const response = await api.put(`/espacio/${espacioId}/factura/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const eliminarFactura = async (espacioId: string, id: string | number) => {
    try {
        const response = await api.delete(`/espacio/${espacioId}/factura/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const obtenerFacturas = async () => {
    try {
        const response = await api.get("/Factura");
        return response.data;
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        throw error;
    }
};

export const obtenerFacturasPorEspacio = async (espacioId: string) => {
    try {
        const response = await api.get(`/espacio/${espacioId}/factura`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener facturas por espacio:", error);
        throw error;
    }
};

export const crearFacturaEnEspacio = async (espacioId: string, data: FacturaPayload) => {
    try {
        const response = await api.post(`/espacio/${espacioId}/factura`, data);
        return response.data;
    } catch (error) {
        console.error("Error al crear factura en espacio:", error);
        throw error;
    }
};

// ==================== MÉTODOS PARA IMÁGENES DE FACTURAS ====================

export const obtenerImagenFactura = async (espacioId: string, facturaId: string) => {
    try {
        const response = await api.get(`/espacio/${espacioId}/factura/${facturaId}/imagen`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener imagen de factura:", error);
        throw error;
    }
};

export const subirImagenFactura = async (espacioId: string, facturaId: string, imageUri: string) => {
    try {
        console.log("📸 Intentando subir imagen desde:", imageUri);

        // En React Native, para enviar 'string($binary)', a veces es mejor usar fetch para obtener el blob
        const responseImage = await fetch(imageUri);
        const blob = await responseImage.blob();

        const response = await api.post(
            `/espacio/${espacioId}/factura/${facturaId}/imagen`,
            blob,
            {
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error al subir imagen de factura:", error);
        throw error;
    }
};

export const actualizarImagenFactura = async (espacioId: string, facturaId: string, imageUri: string) => {
    try {
        console.log("📸 Intentando actualizar imagen desde:", imageUri);

        const responseImage = await fetch(imageUri);
        const blob = await responseImage.blob();

        const response = await api.put(
            `/espacio/${espacioId}/factura/${facturaId}/imagen`,
            blob,
            {
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error al actualizar imagen de factura:", error);
        throw error;
    }
};

export const eliminarImagenFactura = async (espacioId: string, facturaId: string) => {
    try {
        const response = await api.delete(`/espacio/${espacioId}/factura/${facturaId}/imagen`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar imagen de factura:", error);
        throw error;
    }
};