import { getISOWeek } from './date';

// Meta semanal de días al gym
export const WEEKLY_GOAL = 4;

/**
 * Aplica el cap de días a un número (máximo WEEKLY_GOAL)
 */
export function capDays(days: number): number {
  return Math.min(days, WEEKLY_GOAL);
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
