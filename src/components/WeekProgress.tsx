'use client';

import { WeekEntry } from '@/types';
import { getDayName, getTodayDate } from '@/lib/utils';

interface WeekProgressProps {
  entries: WeekEntry[];
}

export default function WeekProgress({ entries }: WeekProgressProps) {
  const today = getTodayDate();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
      <h3 className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wider">
        Esta Semana
      </h3>
      
      <div className="grid grid-cols-7 gap-2">
        {entries.map((entry) => {
          const isToday = entry.date === today;
          const isPast = entry.date < today;
          
          return (
            <div
              key={entry.date}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all
                ${isToday ? 'bg-white/20 ring-2 ring-white/40' : ''}
              `}
            >
              {/* Día */}
              <span className={`text-xs font-medium
                ${isToday ? 'text-white' : 'text-white/60'}
              `}>
                {getDayName(entry.date)}
              </span>
              
              {/* Indicador */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${entry.registered 
                  ? 'bg-emerald-400 text-emerald-900' 
                  : isPast 
                    ? 'bg-red-400/30 text-red-200' 
                    : 'bg-white/10 text-white/40'
                }
              `}>
                {entry.registered ? '✓' : isPast ? '✗' : ''}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Contador */}
      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
        <span className="text-white/60 text-sm">Días completados</span>
        <span className="text-white font-bold text-lg">
          {entries.filter(e => e.registered).length} / 7
        </span>
      </div>
    </div>
  );
}

