import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Función de shadcn para combinar clases
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Meta semanal de días al gym
export const WEEKLY_GOAL = 4;

/**
 * Aplica el cap de días a un número (máximo WEEKLY_GOAL)
 */
export function capDays(days: number): number {
  return Math.min(days, WEEKLY_GOAL);
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
 * Calcula el total de días con cap semanal aplicado
 * Agrupa las fechas por semana y aplica el cap de WEEKLY_GOAL a cada semana
 */
export function calculateCappedTotal(dates: string[]): number {
  const weekCounts = new Map<string, number>();
  
  dates.forEach(dateStr => {
    const date = new Date(dateStr + 'T12:00:00');
    const weekKey = getISOWeek(date);
    const current = weekCounts.get(weekKey) || 0;
    weekCounts.set(weekKey, current + 1);
  });
  
  let total = 0;
  weekCounts.forEach(count => {
    total += capDays(count);
  });
  
  return total;
}

/**
 * Calcula el total mensual con cap semanal aplicado
 */
export function calculateCappedMonthlyTotal(dates: string[], year: number, month: number): number {
  const monthDates = dates.filter(dateStr => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.getFullYear() === year && date.getMonth() === month;
  });
  
  return calculateCappedTotal(monthDates);
}

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
  console.log('chileDate es:');
  console.log(chileDate);
  const dateParts = (chileDate.split(',')[0]).split('-');
  return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
}

/**
 * Obtiene el nombre del mes actual en español con primera letra mayúscula (hora de Chile)
 */
export function getCurrentMonthName(): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const chileDate = getChileDate();
  return months[chileDate.getMonth()];
}

// ========================================
// Funciones auxiliares para Gym Challenge
// ========================================

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
 * Formatea fecha a día de la semana corto
 */
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
}

/**
 * Formatea fecha legible
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
 * Comprime una imagen antes de subirla
 */
export async function compressImage(file: File, maxWidth = 1080): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Error al comprimir imagen'));
          }
        },
        'image/jpeg',
        0.85
      );
    };
    
    img.onerror = () => reject(new Error('Error al cargar imagen'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Valida si es un token válido
 */
export function isValidToken(token: string): boolean {
  const validTokens = [
    'token-android-guryx',
    'token-ios-cuyi',
    'token-ios-karin',
    'token-ios-pablo',
  ];
  return validTokens.includes(token);
}
