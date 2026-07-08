export interface Tarea {
  id: string;
  estado?: "Pendiente" | "Completada" | string | null;
  horaLimite?: string | null;
  usuarioEspacioId?: string | null;
  completada?: boolean;
  fechaRealizacion?: Date | string | null;
  [key: string]: unknown;
}

export interface PlantillaTarea {
  id: string;
  Nombre?: string;
  nombre?: string;
  Descripcion?: string | null;
  descripcion?: string | null;
  karma?: number;
  DiasRepeticion?: number[];
  diasRepeticion?: number[];
  FechaLimite?: Date | string | null;
  fechaLimite?: Date | string | null;
  fechaFin?: Date | string | null;
  startDate?: Date | string | null;
  HoraLimite?: string;
  horaLimite?: string;
  tareasId?: string[];
  instanciaActiva?: Tarea | null;
  InstanciaActiva?: Tarea | null;
  [key: string]: unknown;
}

export interface ITask {
  id: string;
  Nombre: string;
  Descripcion?: string | null;
  karma: number;
  DiasRepeticion: number[];
  FechaLimite: Date;
  HoraLimite: string; // "HH:MM"
  isCompleted: boolean;
  estado?: string | null;
  FechaCompletada?: Date | null;
  usuarioAsignado?: string | null;
  usuarioAsignadoId?: string | null;
  tareasId?: string[]; // IDs de las instancias hijas
  usuariosPorDia?: Record<number, string>; // Mapa de día (0-6) a usuario asignado
  overdue?: boolean;
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
  estado?: string | null;
  FechaCompletada?: Date | null;
  usuarioAsignado?: string | null;
  usuarioAsignadoId?: string | null;
  tareasId: string[];
  usuariosPorDia?: Record<number, string>;
  overdue?: boolean;

  constructor(props: ITask) {
    this.id = props.id;
    this.Nombre = props.Nombre;
    this.Descripcion = props.Descripcion ?? null;
    this.karma = props.karma;
    this.DiasRepeticion = props.DiasRepeticion ?? [];
    this.FechaLimite = new Date(props.FechaLimite);
    this.HoraLimite = props.HoraLimite;
    this.isCompleted = !!props.isCompleted;
    this.estado = props.estado ?? null;
    this.FechaCompletada = props.FechaCompletada ? new Date(props.FechaCompletada) : null;
    this.usuarioAsignado = props.usuarioAsignado ?? null;
    this.usuarioAsignadoId = props.usuarioAsignadoId ?? null;
    this.tareasId = props.tareasId ?? [];
    this.usuariosPorDia = props.usuariosPorDia ?? {};
    this.overdue = props.overdue ?? false;
  }

  formattedTime() {
    if (this.HoraLimite) return this.HoraLimite;
    const d = this.FechaLimite;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Obtiene la próxima fecha en que la tarea debería ejecutarse
   * Considera DiasRepeticion si están definidos, sino usa FechaLimite
   */
  getNextOccurrenceDate() {
    // Si la tarea se repite determinados días
    if (this.DiasRepeticion && this.DiasRepeticion.length > 0) {
      const today = startOfDay(new Date());
      const msPerDay = 1000 * 60 * 60 * 24;
      const todayDayOfWeek = today.getDay();

      // Convertir DiasRepeticion de formato 0-based (0=lunes, 6=domingo) a getDay() (0=domingo, 6=sábado)
      // Conversión: (valor + 1) % 7
      const diasEnFormatoGetDay = this.DiasRepeticion.map(d => (d + 1) % 7);

      // Primero verificar si HOY es uno de los días de repetición
      if (
        diasEnFormatoGetDay.includes(todayDayOfWeek) &&
        today.getTime() <= startOfDay(this.FechaLimite).getTime()
      ) {
        return today;
      }

      // Si no es hoy, buscar la próxima ocurrencia a partir de MAÑANA (i=1)
      for (let i = 1; i <= 60; i++) {
        const checkDate = new Date(today.getTime() + i * msPerDay);
        const dayOfWeek = checkDate.getDay();

        // Verificar si este día está en DiasRepeticion Y no ha excedido FechaLimite
        if (
          diasEnFormatoGetDay.includes(dayOfWeek) &&
          startOfDay(checkDate).getTime() <= startOfDay(this.FechaLimite).getTime()
        ) {
          return startOfDay(checkDate);
        }
      }

      // Si no encontró una ocurrencia, retornar la FechaLimite
      return startOfDay(this.FechaLimite);
    }

    // Si no hay repetición, usar directamente FechaLimite
    return startOfDay(this.FechaLimite);
  }

  isDueToday() {
    const today = startOfDay(new Date());
    const nextOccurrence = this.getNextOccurrenceDate();
    return nextOccurrence.getTime() === today.getTime();
  }

  isDueWithinDays(days: number) {
    const today = startOfDay(new Date());
    const nextOccurrence = this.getNextOccurrenceDate();
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((nextOccurrence.getTime() - today.getTime()) / msPerDay);
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
      estado: this.isCompleted ? "Pendiente" : "Completada",
      FechaCompletada: !this.isCompleted ? now : null,
      usuarioAsignado: this.usuarioAsignado,
      usuarioAsignadoId: this.usuarioAsignadoId,
      tareasId: this.tareasId.slice(),
      overdue: this.isCompleted ? this.overdue : false, // Revertir a false si se pone pendiente, sino mantener
    });
  }
}

export default TaskModel;