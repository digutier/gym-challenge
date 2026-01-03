import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getWeekDates, getWeekStart, getWeekEnd } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requerido' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    
    const weekStart = getWeekStart().toISOString().split('T')[0];
    const weekEnd = getWeekEnd().toISOString().split('T')[0];
    const weekDates = getWeekDates();

    // Obtener entradas de esta semana
    const { data: entries, error: entriesError } = await supabase
      .from('gym_entries')
      .select('date, photo_url')
      .eq('user_id', userId)
      .gte('date', weekStart)
      .lte('date', weekEnd);

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

