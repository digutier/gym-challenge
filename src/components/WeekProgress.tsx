'use client';

import { WeekEntry } from '@/types';
import { getDayName, getTodayDate } from '@/lib/utils';

interface WeekProgressProps {
  entries: WeekEntry[];
}

export default function WeekProgress({ entries }: WeekProgressProps) {
  const today = getTodayDate();

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
      <h3 className="text-white/90 text-xs font-bold mb-3 uppercase tracking-widest">
        📅 Esta Semana
      </h3>
      
      <div className="grid grid-cols-7 gap-1.5">
        {entries.map((entry) => {
          const isToday = entry.date === today;
          const isPast = entry.date < today;
          
          return (
            <div
              key={entry.date}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all
                ${isToday ? 'bg-white/20 ring-2 ring-white/50' : ''}
              `}
            >
              {/* Día */}
              <span className={`text-[10px] font-semibold uppercase
                ${isToday ? 'text-white' : 'text-white/50'}
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
              `}>
                {entry.registered ? '✓' : isPast ? '✗' : '·'}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Contador */}
      <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
        <span className="text-white/50 text-xs">Completados</span>
        <div className="flex items-center gap-1">
          <span className="text-white font-black text-lg">
            {entries.filter(e => e.registered).length}
          </span>
          <span className="text-white/40 text-sm">/ 7</span>
        </div>
      </div>
    </div>
  );
}

