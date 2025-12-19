export interface ITask {
  id: string;
  Nombre: string;
  Descripcion?: string | null;
  karma: number;
  DiasRepeticion: number[];
  FechaLimite: Date;
  HoraLimite: string; // "HH:MM"
  isCompleted: boolean;
  FechaCompletada?: Date | null;
  usuarioAsignado?: string | null;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export class TaskModel implements ITask {
  id: string;
  Nombre: string;
  Descripcion?: string | null;
  karma: number;
  DiasRepeticion: number[];
  FechaLimite: Date;
  HoraLimite: string;
  isCompleted: boolean;
  FechaCompletada?: Date | null;
  usuarioAsignado?: string | null;

  constructor(props: ITask) {
    this.id = props.id;
    this.Nombre = props.Nombre;
    this.Descripcion = props.Descripcion ?? null;
    this.karma = props.karma;
    this.DiasRepeticion = props.DiasRepeticion ?? [];
    this.FechaLimite = new Date(props.FechaLimite);
    this.HoraLimite = props.HoraLimite;
    this.isCompleted = !!props.isCompleted;
    this.FechaCompletada = props.FechaCompletada ? new Date(props.FechaCompletada) : null;
    this.usuarioAsignado = props.usuarioAsignado ?? null;
  }

  formattedTime() {
    if (this.HoraLimite) return this.HoraLimite;
    const d = this.FechaLimite;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  isDueToday() {
    const today = startOfDay(new Date());
    const due = startOfDay(this.FechaLimite);
    return due.getTime() === today.getTime();
  }

  isDueWithinDays(days: number) {
    const today = startOfDay(new Date());
    const due = startOfDay(this.FechaLimite);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((due.getTime() - today.getTime()) / msPerDay);
    return diff >= 0 && diff <= days;
  }

  isCompletedWithinDays(days: number) {
    if (!this.FechaCompletada) return false;
    const today = startOfDay(new Date());
    const done = startOfDay(new Date(this.FechaCompletada));
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((today.getTime() - done.getTime()) / msPerDay);
    return diff >= 0 && diff <= days;
  }

  toggleComplete() {
    const now = new Date();
    return new TaskModel({
      id: this.id,
      Nombre: this.Nombre,
      Descripcion: this.Descripcion,
      karma: this.karma,
      DiasRepeticion: this.DiasRepeticion.slice(),
      FechaLimite: new Date(this.FechaLimite),
      HoraLimite: this.HoraLimite,
      isCompleted: !this.isCompleted,
      FechaCompletada: !this.isCompleted ? now : null,
      usuarioAsignado: this.usuarioAsignado,
    });
  }
}
