import api from "./client";

export interface FacturaPayload {
    Titulo: string;
    Precio: number;
    Reparto: string;
    Pagado: boolean;
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

export const editarFactura = async (id: number, data: FacturaPayload) => {
    try {
        const response = await api.put(`/Factura/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al editar factura:", error);
        throw error;
    }
};

export const eliminarFactura = async (id: number) => {
    try {
        const response = await api.delete(`/Factura/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar factura:", error);
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
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.([\w]+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('imagen', {
            uri: imageUri,
            name: filename,
            type: type,
        } as any);

        const response = await api.post(
            `/espacio/${espacioId}/factura/${facturaId}/imagen`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
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
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.([\w]+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('imagen', {
            uri: imageUri,
            name: filename,
            type: type,
        } as any);

        const response = await api.put(
            `/espacio/${espacioId}/factura/${facturaId}/imagen`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
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