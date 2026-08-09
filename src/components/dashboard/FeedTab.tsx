'use client';

import { useState } from 'react';
import { Trophy } from 'lucide-react';
import GroupRanking from '../GroupRanking';
import { UserStats } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading } from '@/components/ui/heading';
import { feedTab as styles } from './styles';

interface FeedTabProps {
  ranking: UserStats[];
  loading: boolean;
  currentUserId: string;
}

const PERIOD_LABELS = { week: 'Semana', month: 'Mes', year: 'Año' } as const;

export default function FeedTab({ ranking, loading, currentUserId }: FeedTabProps) {
  const [rankingPeriod, setRankingPeriod] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <Heading as="h3" size="lg" className={styles.titleRow}>
          <Trophy className="w-5 h-5 text-amber-400" />
          Ranking Global
        </Heading>
      </div>

      {/* Period tabs */}
      <Tabs value={rankingPeriod} onValueChange={(v) => setRankingPeriod(v as typeof rankingPeriod)}>
        <TabsList className={styles.periodTabsList}>
          {(['week', 'month', 'year'] as const).map(p => (
            <TabsTrigger
              key={p}
              value={p}
              className={styles.periodTabTrigger}
            >
              {PERIOD_LABELS[p]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {!loading && ranking.length > 0 ? (
        <GroupRanking users={ranking} currentUserId={currentUserId} period={rankingPeriod} />
      ) : loading ? (
        <div className={styles.skeletonWrap}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
