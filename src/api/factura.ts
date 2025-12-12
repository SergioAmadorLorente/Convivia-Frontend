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