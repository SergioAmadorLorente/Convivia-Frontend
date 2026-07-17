import api from "./client";

export interface FacturaPayload {
  nombre: string;
  precio: number;
  pagoMediano: number;
  pagado: boolean;
  creadorFactura: string;
  deudores: Record<string, boolean>;
  fechaCompletada?: string | null;
}

export const crearFactura = async (data: FacturaPayload) => {
  try {
    const response = await api.post("/Factura", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editarFactura = async (
  espacioId: string,
  id: string | number,
  data: FacturaPayload,
) => {
  try {
    const response = await api.put(
      `/espacio/${espacioId}/factura/${id}/merge`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const eliminarFactura = async (
  espacioId: string,
  id: string | number,
) => {
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
    // console.error("Error al obtener facturas:", error);
    throw error;
  }
};

export const obtenerFacturasPorEspacio = async (espacioId: string) => {
  try {
    const response = await api.get(`/espacio/${espacioId}/factura`);
    return response.data;
  } catch (error) {
    // console.error("Error al obtener facturas por espacio:", error);
    throw error;
  }
};

export const crearFacturaEnEspacio = async (
  espacioId: string,
  data: FacturaPayload,
) => {
  try {
    const response = await api.post(`/espacio/${espacioId}/factura`, data);
    return response.data;
  } catch (error) {
    // console.error("Error al crear factura en espacio:", error);
    throw error;
  }
};

export const obtenerFacturasPorDeudor = async (
  espacioId: string,
  usuarioId: string,
) => {
  try {
    const response = await api.get(
      `/espacio/${espacioId}/factura/deudor/${usuarioId}`,
    );
    return response.data;
  } catch (error) {
    // console.error("Error al obtener factura por deudor: ", error);
    throw error;
  }
};

// ==================== MÉTODOS PARA IMÁGENES DE FACTURAS ====================

export const obtenerImagenFactura = async (
  espacioId: string,
  facturaId: string,
) => {
  try {
    const response = await api.get(
      `/espacio/${espacioId}/factura/${facturaId}/imagen`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  } catch (error) {
    // console.error("Error al obtener imagen de factura:", error);
    throw error;
  }
};

export const subirImagenFactura = async (
  espacioId: string,
  facturaId: string,
  imageUri: string,
) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "image.jpg";
    const match = /\.([\w]+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("imagen", { uri: imageUri, name: filename, type } as any);

    const response = await api.post(
      `/espacio/${espacioId}/factura/${facturaId}/imagen`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    // console.error("Error al subir imagen de factura:", error);
    throw error;
  }
};

export const actualizarImagenFactura = async (
  espacioId: string,
  facturaId: string,
  imageUri: string,
) => {
  try {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "image.jpg";
    const match = /\.([\w]+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("imagen", { uri: imageUri, name: filename, type } as any);

    const response = await api.put(
      `/espacio/${espacioId}/factura/${facturaId}/imagen`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    // console.error("Error al actualizar imagen de factura:", error);
    throw error;
  }
};

export const eliminarImagenFactura = async (
  espacioId: string,
  facturaId: string,
) => {
  try {
    const response = await api.delete(
      `/espacio/${espacioId}/factura/${facturaId}/imagen`,
    );
    return response.data;
  } catch (error) {
    // console.error("Error al eliminar imagen de factura:", error);
    throw error;
  }
};
