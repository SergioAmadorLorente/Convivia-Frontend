
// src/types/Factura.ts
export type IFacturaUser = {
  id: string;
  name: string;
  /** true si ese usuario ya ha completado/pagado su parte */
  completed?: boolean;
};

export interface IFactura {
  IdFactura: string;
  Nombre: string;
  Descripcion?: string | null;

  /** Importe total de la factura */
  Precio: number;

  /** Usuarios asignados a la factura */
  UsuariosAsignados?: IFacturaUser[];

  /** Estado de pago global (solo puede pasar a true si todos han completed=true) */
  Pagado: boolean;

  /** Fecha de creación */
  FechaCreacion: Date | string;

  /** Fecha de completada (cuando Pagado = true) */
  FechaCompletada?: Date | string | null;

  /** (Opcional, legacy) Reparto viejo, por compatibilidad si tu código lo referencia */
  Reparto?: Record<string, number>;
}

/**
 * Modelo de Factura con utilidades para:
 * - Calcular precio por persona
 * - Contar usuarios pagados/total
 * - Controlar el marcado como Pagado (solo si todos están en completed=true)
 * - Formatear fechas
 */
export class FacturaModel implements IFactura {
  IdFactura: string;
  Nombre: string;
  Descripcion?: string | null;
  Precio: number;
  UsuariosAsignados: IFacturaUser[];
  Pagado: boolean;
  FechaCreacion: Date;
  FechaCompletada?: Date | null;
  Reparto?: Record<string, number>;

  constructor(props: IFactura) {
    this.IdFactura = props.IdFactura;
    this.Nombre = props.Nombre;
    this.Descripcion = props.Descripcion ?? null;
    this.Precio = Number(props.Precio) || 0;
    this.UsuariosAsignados = Array.isArray(props.UsuariosAsignados)
      ? props.UsuariosAsignados.map(u => ({ ...u }))
      : [];
    this.Pagado = !!props.Pagado;

    // Normaliza fechas
    this.FechaCreacion =
      props.FechaCreacion instanceof Date
        ? props.FechaCreacion
        : new Date(props.FechaCreacion);
    this.FechaCompletada =
      props.FechaCompletada
        ? props.FechaCompletada instanceof Date
          ? props.FechaCompletada
          : new Date(props.FechaCompletada)
        : null;

    // (Opcional, legacy)
    this.Reparto = props.Reparto;
  }

  /** Número total de usuarios asignados */
  totalUsersCount(): number {
    return this.UsuariosAsignados.length;
  }

  /** Número de usuarios que han marcado completed=true */
  paidUsersCount(): number {
    return this.UsuariosAsignados.filter(u => !!u.completed).length;
  }

  /** Precio por persona (total / nº usuarios); si no hay usuarios, devuelve total */
  perPersonPrice(): number {
    const total = this.Precio || 0;
    const n = this.totalUsersCount();
    return n > 0 ? total / n : total;
  }

  /** Puede marcarse como Pagado si hay al menos 1 usuario y todos están completed=true */
  canMarkPaid(): boolean {
    const n = this.totalUsersCount();
    if (n === 0) return false;
    return this.UsuariosAsignados.every(u => !!u.completed);
  }

  /** Devuelve "dd/mm" para la fecha de creación (útil en TaskItem variante factura) */
  formattedDate(locale: string = "es-ES"): string {
    try {
      return this.FechaCreacion.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return "--/--";
    }
  }

  /**
   * Marca/desmarca Pagado respetando la regla:
   * - Si está Pagado=true -> al desmarcar, se pone Pagado=false y FechaCompletada=null.
   * - Si está Pagado=false -> solo permite Pagado=true si canMarkPaid() es true; si no, NO cambia.
   * Inmutable: devuelve una NUEVA instancia.
   */
  togglePaid(): FacturaModel {
    // Desmarcar pago (volver a pendiente)
    if (this.Pagado) {
      return new FacturaModel({
        ...this.toProps(),
        Pagado: false,
        FechaCompletada: null,
      });
    }

    // Marcar como pagada: solo si todos han completed=true
    if (!this.canMarkPaid()) {
      // No cambiar nada (podrías lanzar error si prefieres)
      return new FacturaModel({ ...this.toProps() });
    }

    return new FacturaModel({
      ...this.toProps(),
      Pagado: true,
      FechaCompletada: new Date(),
    });
  }

  /** Clona con usuarios actualizados */
  withUpdatedUsers(users: IFacturaUser[]): FacturaModel {
    return new FacturaModel({
      ...this.toProps(),
      UsuariosAsignados: users.map(u => ({ ...u })),
    });
  }

  /** Marca/unmarca completed para un usuario concreto (por id) */
  withUserCompleted(userId: string, completed: boolean = true): FacturaModel {
    const users = this.UsuariosAsignados.map(u =>
      u.id === userId ? { ...u, completed } : u
    );
    return this.withUpdatedUsers(users);
  }

  /** Añade un usuario asignado */
  addUser(user: IFacturaUser): FacturaModel {
    const exists = this.UsuariosAsignados.some(u => u.id === user.id);
    const users = exists
      ? this.UsuariosAsignados
      : [...this.UsuariosAsignados, { ...user }];
    return this.withUpdatedUsers(users);
  }

  /** Elimina un usuario asignado por id */
  removeUser(userId: string): FacturaModel {
    const users = this.UsuariosAsignados.filter(u => u.id !== userId);
    return this.withUpdatedUsers(users);
  }

  /** Devuelve objeto plano IFactura (útil para pasar por navigate/onSave) */
  toProps(): IFactura {
    return {
      IdFactura: this.IdFactura,
      Nombre: this.Nombre,
      Descripcion: this.Descripcion,
      Precio: this.Precio,
      UsuariosAsignados: this.UsuariosAsignados.map(u => ({ ...u })),
      Pagado: this.Pagado,
      FechaCreacion: this.FechaCreacion,
      FechaCompletada: this.FechaCompletada ?? null,
      Reparto: this.Reparto,
    };
  }
}
export default FacturaModel;