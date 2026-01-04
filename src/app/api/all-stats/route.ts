import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getWeekStart, getWeekEnd, capDays, calculateCappedTotal, calculateCappedMonthlyTotal } from '@/lib/utils';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    const weekStart = getWeekStart().toISOString().split('T')[0];
    const weekEnd = getWeekEnd().toISOString().split('T')[0];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Obtener todos los usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, avatar');

    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError);
      return NextResponse.json(
        { error: 'Error al obtener usuarios' },
        { status: 500 }
      );
    }

    // Obtener todas las entradas de esta semana
    const { data: weekEntries, error: weekError } = await supabase
      .from('gym_entries')
      .select('user_id, date')
      .gte('date', weekStart)
      .lte('date', weekEnd);

    if (weekError) {
      console.error('Error obteniendo entradas semanales:', weekError);
      return NextResponse.json(
        { error: 'Error al obtener estadísticas' },
        { status: 500 }
      );
    }

    // Obtener todas las entradas (total) con fecha para calcular cap semanal
    const { data: allEntries, error: allError } = await supabase
      .from('gym_entries')
      .select('user_id, date');

    if (allError) {
      console.error('Error obteniendo todas las entradas:', allError);
      return NextResponse.json(
        { error: 'Error al obtener estadísticas totales' },
        { status: 500 }
      );
    }

    // Agrupar fechas por usuario
    const userWeekDates = new Map<string, string[]>();
    const userAllDates = new Map<string, string[]>();

    weekEntries?.forEach(entry => {
      const dates = userWeekDates.get(entry.user_id) || [];
      dates.push(entry.date);
      userWeekDates.set(entry.user_id, dates);
    });

    allEntries?.forEach(entry => {
      const dates = userAllDates.get(entry.user_id) || [];
      dates.push(entry.date);
      userAllDates.set(entry.user_id, dates);
    });

    // Combinar datos con cap semanal aplicado
    const usersWithStats = users?.map(user => {
      const weekDates = userWeekDates.get(user.id) || [];
      const allDates = userAllDates.get(user.id) || [];
      
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        // Días esta semana (raw, el cap se aplica en frontend)
        daysThisWeek: weekDates.length,
        // Total con cap semanal aplicado
        totalDays: calculateCappedTotal(allDates),
        // Total mensual con cap semanal aplicado
        monthlyDays: calculateCappedMonthlyTotal(allDates, currentYear, currentMonth),
      };
    }) || [];

    // Ordenar por días de esta semana capeados (descendente)
    usersWithStats.sort((a, b) => capDays(b.daysThisWeek) - capDays(a.daysThisWeek));

    return NextResponse.json({
      users: usersWithStats,
    });
  } catch (error) {
    console.error('Error en all-stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

