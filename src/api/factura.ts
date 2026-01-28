import api from "./client";

export interface FacturaPayload {
    Nombre: string;
    Precio: number;
    PagoMediano: number | null;
    Deudores: Record<string, boolean>;
    Pagado: boolean;
    CreadorFactura: string;
}


export const crearFactura = async (espacioId: string, data: FacturaPayload) => {
    try {
        const response = await api.post(`/espacio/${espacioId}/factura`, data);
        return response.data;
    } catch (error) {
        console.error("Error al crear factura:", error);
        throw error;
    }
};

export const editarFactura = async (id: string, data: FacturaPayload) => {
    try {
        const response = await api.put(`/Factura/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error al editar factura:", error);
        throw error;
    }
};

export const eliminarFactura = async (id: string) => {
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