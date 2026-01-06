import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getWeekStart, getWeekEnd, calculateCappedTotal, calculateCappedMonthlyTotal, getTodayDate } from '@/lib/utils';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    const weekStart = getWeekStart().toISOString().split('T')[0];
    const weekEnd = getWeekEnd().toISOString().split('T')[0];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Obtener todos los usuarios de la tabla profiles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
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

    // Obtener las fotos de hoy para todos los usuarios
    const today = getTodayDate();
    const { data: todayEntries, error: todayError } = await supabase
      .from('gym_entries')
      .select('user_id, photo_url')
      .eq('date', today);

    if (todayError) {
      console.error('Error obteniendo fotos de hoy:', todayError);
      // No es crítico, continuamos sin las fotos
    }

    // Crear mapa de fotos de hoy por usuario
    const userTodayPhotos = new Map<string, string>();
    todayEntries?.forEach(entry => {
      userTodayPhotos.set(entry.user_id, entry.photo_url);
    });

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
      const todayPhotoUrl = userTodayPhotos.get(user.id);
      
      return {
        id: user.id,
        name: user.name || 'Usuario',
        avatar: user.avatar || '🧑',
        // Días esta semana (raw, el cap se aplica en frontend)
        daysThisWeek: weekDates.length,
        // Total con cap semanal aplicado
        totalDays: calculateCappedTotal(allDates),
        // Total mensual con cap semanal aplicado
        monthlyDays: calculateCappedMonthlyTotal(allDates, currentYear, currentMonth),
        // URL de la foto de hoy (si existe)
        todayPhotoUrl: todayPhotoUrl || undefined,
      };
    }) || [];

    // Ordenar por días mensuales (descendente) para ranking mensual
    usersWithStats.sort((a, b) => b.monthlyDays - a.monthlyDays);

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
