export interface IFacturaDto {
  IdFactura: string;
  Nombre: string;
  Precio: number;
  Reparto: Record<string, number>;
  Pagado: boolean;
  DocumentoUrl?: Uint8Array | null;
  TareaId?: string | null;
  FechaCreacion: Date;
}

export class FacturaModel implements IFacturaDto {
  IdFactura: string;
  Nombre: string;
  Precio: number;
  Reparto: Record<string, number>;
  Pagado: boolean;
  DocumentoUrl?: Uint8Array | null;
  TareaId?: string | null;
  FechaCreacion: Date;

  constructor(props: Partial<IFacturaDto> & { IdFactura: string; Nombre: string; Precio: number }) {
    this.IdFactura = props.IdFactura;
    this.Nombre = props.Nombre;
    this.Precio = props.Precio;
    this.Reparto = props.Reparto ?? {};
    this.Pagado = !!props.Pagado;
    this.DocumentoUrl = props.DocumentoUrl ?? null;
    this.TareaId = props.TareaId ?? null;
    this.FechaCreacion = props.FechaCreacion ? new Date(props.FechaCreacion) : new Date();
  }

  formattedDate() {
    return this.FechaCreacion.toLocaleDateString();
  }

  togglePaid() {
    return new FacturaModel({
      IdFactura: this.IdFactura,
      Nombre: this.Nombre,
      Precio: this.Precio,
      Reparto: { ...this.Reparto },
      Pagado: !this.Pagado,
      DocumentoUrl: this.DocumentoUrl ? new Uint8Array(this.DocumentoUrl) : null,
      TareaId: this.TareaId ?? undefined,
      FechaCreacion: new Date(this.FechaCreacion),
    });
  }
}
