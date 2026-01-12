'use client';

import { useState, useRef } from 'react';
import { WeekEntry } from '@/types';
import { getDayName, getTodayDate, capDays, WEEKLY_GOAL, getWeekStart, getMinWeekStart, getWeekStartForDate } from '@/lib/utils';
import PastDayModal from './PastDayModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekProgressProps {
  entries: WeekEntry[];
  currentUserId: string;
  weekStart: Date; // Lunes de la semana actual
  onWeekChange: (weekStart: Date) => void; // Callback cuando cambia la semana
}

export default function WeekProgress({ entries, currentUserId, weekStart, onWeekChange }: WeekProgressProps) {
  const today = getTodayDate();
  const currentWeekStart = getWeekStart();
  const minWeekStart = getMinWeekStart();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Asegurar que weekStart siempre tenga un valor válido
  const safeWeekStart = weekStart || currentWeekStart;

  // Min distancia para considerar swipe (50px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance; // Swipe izquierda (dedo de derecha a izquierda)
    const isRightSwipe = distance < -minSwipeDistance; // Swipe derecha (dedo de izquierda a derecha)

    if (isRightSwipe) {
      // Swipe derecha = ir a semana anterior
      goToPreviousWeek();
    } else if (isLeftSwipe) {
      // Swipe izquierda = ir a semana siguiente (solo si no es la semana actual)
      goToNextWeek();
    }
  };

  const goToPreviousWeek = () => {
    const prevWeekStart = new Date(safeWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    
    // Verificar límite mínimo (semana del 1 de enero de 2026)
    if (prevWeekStart >= minWeekStart) {
      onWeekChange(prevWeekStart);
    }
  };

  const goToNextWeek = () => {
    // Solo permitir ir a la siguiente semana si no estamos en la semana actual
    if (safeWeekStart.getTime() >= currentWeekStart.getTime()) {
      return; // Ya estamos en la semana actual o futura, no podemos avanzar
    }
    
    const nextWeekStart = new Date(safeWeekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    
    // No podemos ir más allá de la semana actual
    if (nextWeekStart <= currentWeekStart) {
      onWeekChange(nextWeekStart);
    } else {
      // Si pasamos la semana actual, ir a la semana actual
      onWeekChange(currentWeekStart);
    }
  };

  const handleDayClick = (entry: WeekEntry) => {
    const isPast = entry.date < today;
    // Solo permitir click en días pasados
    if (isPast) {
      setSelectedDate(entry.date);
    }
  };

  // Determinar la semana actual basada en los entries (para evitar parpadeo)
  // Si entries tiene datos, usar el primer entry para determinar la semana
  const displayedWeekStart = entries.length > 0 
    ? getWeekStartForDate(new Date(entries[0].date + 'T12:00:00'))
    : safeWeekStart;
  
  const isCurrentWeek = displayedWeekStart.getTime() === currentWeekStart.getTime();
  const canGoPrevious = safeWeekStart > minWeekStart;
  const canGoNext = !isCurrentWeek;

  // Formatear fecha de la semana para mostrar (usar displayedWeekStart para evitar parpadeo)
  const weekStartStr = displayedWeekStart.toISOString().split('T')[0];
  const weekEndDate = new Date(displayedWeekStart);
  weekEndDate.setDate(displayedWeekStart.getDate() + 6);
  const weekEndStr = weekEndDate.toISOString().split('T')[0];
  
  const formatWeekRange = (start: string, end: string) => {
    const startDate = new Date(start + 'T12:00:00');
    const endDate = new Date(end + 'T12:00:00');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.getDate()}-${endDate.getDate()} ${months[startDate.getMonth()]}`;
    } else {
      return `${startDate.getDate()} ${months[startDate.getMonth()]} - ${endDate.getDate()} ${months[endDate.getMonth()]}`;
    }
  };

  return (
    <>
      <div 
        ref={containerRef}
        className="bg-white/10 backdrop-blur-md rounded-2xl !p-4 border border-white/10 shadow-lg"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header con navegación */}
        <div className="flex items-center justify-between !mb-3">
          <button
            onClick={goToPreviousWeek}
            disabled={!canGoPrevious}
            className={`!p-1 !rounded-lg !transition-all ${
              canGoPrevious 
                ? '!text-white hover:!bg-white/10 active:!scale-95' 
                : '!text-white/20 !cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="!w-5 !h-5" />
          </button>
          
          <div className="flex flex-col items-center flex-1">
            <h3 className="text-white/90 text-xs font-bold uppercase tracking-widest">
              {isCurrentWeek ? '📅 Esta Semana' : '📅 Semana'}
            </h3>
            {!isCurrentWeek && (
              <span className="text-white/60 text-[10px] mt-0.5">
                {formatWeekRange(weekStartStr, weekEndStr)}
              </span>
            )}
          </div>
          
          <button
            onClick={goToNextWeek}
            disabled={!canGoNext}
            className={`!p-1 !rounded-lg !transition-all ${
              canGoNext 
                ? '!text-white hover:!bg-white/10 active:!scale-95' 
                : '!text-white/20 !cursor-not-allowed'
            }`}
          >
            <ChevronRight className="!w-5 !h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 !gap-1.5">
          {entries.map((entry) => {
            const isToday = entry.date === today;
            const isPast = entry.date < today;
            const isClickable = isPast;
            
            return (
              <button
                key={entry.date}
                onClick={() => handleDayClick(entry)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-1 !py-2 !px-1 rounded-xl transition-all
                  ${isToday ? 'bg-white/20 ring-2 ring-white/50' : ''}
                  ${isClickable ? 'hover:bg-white/10 cursor-pointer active:scale-95' : 'cursor-default'}
                `}
              >
                {/* Día */}
                <span className={`text-[10px] font-semibold uppercase
                  ${isToday ? 'text-white' : isPast ? 'text-white/70' : 'text-white/30'}
                `}>
                  {getDayName(entry.date)}
                </span>
                
                {/* Indicador */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${entry.registered 
                    ? 'bg-emerald-400 text-emerald-900 shadow-md shadow-emerald-500/30' 
                    : isPast 
                      ? 'bg-red-400/20 text-red-300' 
                      : 'bg-white/5 text-white/30'
                  }
                  ${isClickable && !entry.registered ? 'ring-2 ring-red-400/30' : ''}
                  ${isClickable && entry.registered ? 'ring-2 ring-emerald-400/50' : ''}
                `}>
                  {entry.registered ? '✓' : isPast ? '✗' : '·'}
                </div>

                {/* Indicador de clickeable para días pasados */}
                {isPast && (
                  <span className="text-[8px] text-white/40">
                    ver
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Contador - Meta de 4 días */}
        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
          <span className="text-white/50 text-xs">Meta semanal</span>
          <div className="flex items-center gap-1">
            <span className={`font-black text-lg ${
              capDays(entries.filter(e => e.registered).length) >= WEEKLY_GOAL 
                ? 'text-emerald-400' 
                : 'text-white'
            }`}>
              {capDays(entries.filter(e => e.registered).length)}
            </span>
            <span className="text-white/40 text-sm">/ {WEEKLY_GOAL}</span>
          </div>
        </div>
      </div>

      {/* Modal para ver día pasado */}
      {selectedDate && (
        <PastDayModal
          date={selectedDate}
          currentUserId={currentUserId}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
