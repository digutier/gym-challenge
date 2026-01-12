import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getServiceSupabase } from '@/lib/supabase';
import { getWeekDates, getWeekStart, getWeekEnd, getWeekDatesForDate, getWeekStartForDate, getWeekEndForDate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    const weekStartParam = searchParams.get('weekStart');
    const weekEndParam = searchParams.get('weekEnd');

    // Si no se proporciona userId, usar el usuario autenticado
    if (!userId) {
      const supabase = await createServerSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return NextResponse.json(
          { error: 'No autenticado' },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }

    const supabase = getServiceSupabase();
    
    // Si se proporcionan parámetros de semana, usarlos; sino usar semana actual
    let weekStart: Date;
    let weekEnd: Date;
    let weekDates: string[];
    
    if (weekStartParam && weekEndParam) {
      weekStart = new Date(weekStartParam + 'T12:00:00');
      weekEnd = new Date(weekEndParam + 'T12:00:00');
      weekDates = getWeekDatesForDate(weekStart);
    } else {
      weekStart = getWeekStart();
      weekEnd = getWeekEnd();
      weekDates = getWeekDates();
    }
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Obtener entradas de esta semana
    const { data: entries, error: entriesError } = await supabase
      .from('gym_entries')
      .select('date, photo_url')
      .eq('user_id', userId)
      .gte('date', weekStartStr)
      .lte('date', weekEndStr);

    if (entriesError) {
      console.error('Error obteniendo entries:', entriesError);
      return NextResponse.json(
        { error: 'Error al obtener estadísticas' },
        { status: 500 }
      );
    }

    // Crear mapa de fechas registradas
    const registeredDates = new Map(
      entries?.map(e => [e.date, e.photo_url]) || []
    );

    // Crear array de la semana con status
    const weekEntries = weekDates.map(date => ({
      date,
      registered: registeredDates.has(date),
      photo_url: registeredDates.get(date),
    }));

    // Contar total de días registrados
    const { count: totalDays } = await supabase
      .from('gym_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return NextResponse.json({
      daysThisWeek: entries?.length || 0,
      weekEntries,
      totalDays: totalDays || 0,
    });
  } catch (error) {
    console.error('Error en user-stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
