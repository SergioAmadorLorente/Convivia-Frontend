import TaskModel from "../types/Task";
import FacturaModel from "../types/Factura";

// Caché en memoria para el Dashboard (stale-while-revalidate).
// Permite mostrar los datos al instante al volver a la pantalla mientras se refrescan.
export const dashboardCache: {
  tareas: TaskModel[] | null;
  facturas: FacturaModel[] | null;
} = {
  tareas: null,
  facturas: null,
};