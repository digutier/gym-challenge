import { useState } from 'react';
import { getWeekStart, getMinWeekStart } from '@/lib/date';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function useWeekNavigation() {
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(getWeekStart());

  const currentWeekStart = getWeekStart();
  const minWeekStart = getMinWeekStart();
  const isCurrentWeek = selectedWeekStart.getTime() === currentWeekStart.getTime();
  const canGoPrev = selectedWeekStart > minWeekStart;
  const canGoNext = !isCurrentWeek;

  const weekEnd = new Date(selectedWeekStart);
  weekEnd.setDate(selectedWeekStart.getDate() + 6);
  const weekLabel = selectedWeekStart.getMonth() === weekEnd.getMonth()
    ? `${selectedWeekStart.getDate()}-${weekEnd.getDate()} ${MONTHS[selectedWeekStart.getMonth()]}`
    : `${selectedWeekStart.getDate()} ${MONTHS[selectedWeekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()]}`;

  const handleWeekPrev = () => {
    const prev = new Date(selectedWeekStart);
    prev.setDate(prev.getDate() - 7);
    if (prev >= minWeekStart) setSelectedWeekStart(prev);
  };

  const handleWeekNext = () => {
    if (!canGoNext) return;
    const next = new Date(selectedWeekStart);
    next.setDate(next.getDate() + 7);
    setSelectedWeekStart(next <= currentWeekStart ? next : currentWeekStart);
  };

  return {
    selectedWeekStart,
    setSelectedWeekStart,
    weekLabel,
    isCurrentWeek,
    canGoPrev,
    canGoNext,
    handleWeekPrev,
    handleWeekNext,
  };
}
