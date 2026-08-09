/**
 * Obtiene la fecha/hora actual en zona horaria de Chile (America/Santiago)
 */
export function getChileDate(): Date {
  const now = new Date();
  // Convertir a hora de Chile usando Intl
  const chileTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const year = parseInt(chileTime.find(p => p.type === 'year')!.value);
  const month = parseInt(chileTime.find(p => p.type === 'month')!.value) - 1; // Month is 0-indexed
  const day = parseInt(chileTime.find(p => p.type === 'day')!.value);
  const hour = parseInt(chileTime.find(p => p.type === 'hour')!.value);
  const minute = parseInt(chileTime.find(p => p.type === 'minute')!.value);
  const second = parseInt(chileTime.find(p => p.type === 'second')!.value);

  return new Date(year, month, day, hour, minute, second);
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD en hora de Chile
 */
export function getTodayDate(): string {
  const chileDate = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
  const dateParts = (chileDate.split(',')[0]).split('-');
  return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Obtiene el nombre del mes actual en español con primera letra mayúscula (hora de Chile)
 */
export function getCurrentMonthName(): string {
  const chileDate = getChileDate();
  return MONTH_NAMES[chileDate.getMonth()];
}

/**
 * Nombre de mes en español a partir de su índice (0 = enero)
 */
export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES[monthIndex];
}

/**
 * Obtiene el número de semana ISO de una fecha
 */
export function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

/**
 * Obtiene el inicio de la semana actual (lunes) en hora de Chile
 */
export function getWeekStart(): Date {
  const chileDate = getChileDate();
  const day = chileDate.getDay();
  const diff = chileDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(chileDate);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Obtiene el fin de la semana actual (domingo) en hora de Chile
 */
export function getWeekEnd(): Date {
  const monday = getWeekStart();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Genera array de fechas de la semana actual
 */
export function getWeekDates(): string[] {
  const monday = getWeekStart();
  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Obtiene el inicio de la semana (lunes) para una fecha específica
 */
export function getWeekStartForDate(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Obtiene el fin de la semana (domingo) para una fecha específica
 */
export function getWeekEndForDate(date: Date): Date {
  const monday = getWeekStartForDate(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Genera array de fechas de una semana específica (basada en una fecha)
 */
export function getWeekDatesForDate(date: Date): string[] {
  const monday = getWeekStartForDate(date);
  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Obtiene el límite mínimo (semana del 1 de enero de 2026)
 */
export function getMinWeekStart(): Date {
  // 1 de enero de 2026 en hora de Chile
  const minDate = new Date('2026-01-05T12:00:00');
  return getWeekStartForDate(minDate);
}

/**
 * Formatea fecha a día de la semana corto
 */
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
}

/**
 * Formatea una fecha en formato chileno (ej: "lunes, 4 de enero")
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Formatea una fecha corta para badges (ej: "12 ago")
 */
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Formatea un timestamp ISO a hora chilena (ej: "14:30")
 */
export function formatTimeChile(timestamp: string): string {
  const date = new Date(timestamp);

  // Convertir a hora chilena usando Intl.DateTimeFormat
  const chileTime = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return chileTime;
}
