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
  tareasId?: string[]; // IDs de las instancias hijas
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
  tareasId: string[];

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
    this.tareasId = props.tareasId ?? [];
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
      FechaCompletada: !this.isCompleted ? now : null,
      usuarioAsignado: this.usuarioAsignado,
    });
  }
}

export default TaskModel;