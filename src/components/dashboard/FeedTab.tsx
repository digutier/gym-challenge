'use client';

import { useState } from 'react';
import { Trophy } from 'lucide-react';
import GroupRanking from '../GroupRanking';
import { UserStats } from '@/types';

interface FeedTabProps {
  ranking: UserStats[];
  loading: boolean;
  currentUserId: string;
}

const PERIOD_LABELS = { week: 'Semana', month: 'Mes', year: 'Año' } as const;

export default function FeedTab({ ranking, loading, currentUserId }: FeedTabProps) {
  const [rankingPeriod, setRankingPeriod] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-4 lg:max-w-[800px] lg:mx-auto lg:w-full lg:px-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[#f1f5f9] text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Ranking Global
        </h3>
      </div>

      {/* Period tabs */}
      <div className="flex bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-1 gap-1">
        {(['week', 'month', 'year'] as const).map(p => (
          <button
            key={p}
            onClick={() => setRankingPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              rankingPeriod === p
                ? 'bg-[#7f0df2] text-white shadow-[0px_2px_8px_rgba(127,13,242,0.4)]'
                : 'text-[#64748b]'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {!loading && ranking.length > 0 ? (
        <GroupRanking users={ranking} currentUserId={currentUserId} period={rankingPeriod} />
      ) : loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[rgba(255,255,255,0.03)] rounded-3xl h-16 animate-pulse" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
