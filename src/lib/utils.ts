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

// ========================================
// Funciones auxiliares para Gym Challenge
// ========================================

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (timezone local)
 */
export function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Obtiene el inicio de la semana actual (lunes)
 */
export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Obtiene el fin de la semana actual (domingo)
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
