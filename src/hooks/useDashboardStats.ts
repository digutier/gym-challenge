import { useState, useCallback, useEffect } from 'react';
import { WeekEntry, UserStats } from '@/types';
import { getWeekStart } from '@/lib/date';
import { WEEKLY_GOAL } from '@/lib/stats';

export function useDashboardStats(userId: string, selectedWeekStart: Date) {
  const [weekEntries, setWeekEntries] = useState<WeekEntry[]>([]);
  const [currentWeekActiveDays, setCurrentWeekActiveDays] = useState(0);
  const [ranking, setRanking] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Función central de refresco — se llama al montar, al cambiar semana,
  // y explícitamente tras upload/delete para evitar condición de carrera.
  const refreshStats = useCallback(async () => {
    setLoading(true);
    try {
      const weekStartStr = selectedWeekStart.toISOString().split('T')[0];
      const weekEndDate = new Date(selectedWeekStart);
      weekEndDate.setDate(selectedWeekStart.getDate() + 6);
      const weekEndStr = weekEndDate.toISOString().split('T')[0];

      const [userStatsRes, allStatsRes] = await Promise.all([
        fetch(`/api/user-stats?userId=${userId}&weekStart=${weekStartStr}&weekEnd=${weekEndStr}`),
        fetch(`/api/all-stats?weekStart=${weekStartStr}&weekEnd=${weekEndStr}`),
      ]);

      if (userStatsRes.ok) {
        const userStats = await userStatsRes.json();
        setWeekEntries(userStats.weekEntries);
        if (selectedWeekStart.getTime() === getWeekStart().getTime()) {
          const days = userStats.weekEntries.filter((e: WeekEntry) => e.registered).length;
          setCurrentWeekActiveDays(Math.min(days, WEEKLY_GOAL));
        }
      }

      if (allStatsRes.ok) {
        const allStats = await allStatsRes.json();
        setRanking(allStats.users);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedWeekStart]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return { weekEntries, currentWeekActiveDays, ranking, loading, refreshStats };
}
