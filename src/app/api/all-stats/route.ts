import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getWeekStart, getWeekEnd } from '@/lib/utils';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    const weekStart = getWeekStart().toISOString().split('T')[0];
    const weekEnd = getWeekEnd().toISOString().split('T')[0];

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
      .select('user_id')
      .gte('date', weekStart)
      .lte('date', weekEnd);

    if (weekError) {
      console.error('Error obteniendo entradas semanales:', weekError);
      return NextResponse.json(
        { error: 'Error al obtener estadísticas' },
        { status: 500 }
      );
    }

    // Obtener todas las entradas (total)
    const { data: allEntries, error: allError } = await supabase
      .from('gym_entries')
      .select('user_id');

    if (allError) {
      console.error('Error obteniendo todas las entradas:', allError);
      return NextResponse.json(
        { error: 'Error al obtener estadísticas totales' },
        { status: 500 }
      );
    }

    // Contar días por usuario
    const weekCounts = new Map<string, number>();
    const totalCounts = new Map<string, number>();

    weekEntries?.forEach(entry => {
      const current = weekCounts.get(entry.user_id) || 0;
      weekCounts.set(entry.user_id, current + 1);
    });

    allEntries?.forEach(entry => {
      const current = totalCounts.get(entry.user_id) || 0;
      totalCounts.set(entry.user_id, current + 1);
    });

    // Combinar datos
    const usersWithStats = users?.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      daysThisWeek: weekCounts.get(user.id) || 0,
      totalDays: totalCounts.get(user.id) || 0,
    })) || [];

    // Ordenar por días de esta semana (descendente)
    usersWithStats.sort((a, b) => b.daysThisWeek - a.daysThisWeek);

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

