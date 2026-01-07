'use client';

import { useState } from 'react';
import { WeekEntry } from '@/types';
import { getDayName, getTodayDate, capDays, WEEKLY_GOAL } from '@/lib/utils';
import PastDayModal from './PastDayModal';

interface WeekProgressProps {
  entries: WeekEntry[];
  currentUserId: string;
}

export default function WeekProgress({ entries, currentUserId }: WeekProgressProps) {
  const today = getTodayDate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDayClick = (entry: WeekEntry) => {
    const isPast = entry.date < today;
    // Solo permitir click en días pasados
    if (isPast) {
      setSelectedDate(entry.date);
    }
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl !p-4 border border-white/10 shadow-lg">
        <h3 className="text-white/90 text-xs font-bold !mb-3 uppercase tracking-widest">
          📅 Esta Semana
        </h3>
        
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
