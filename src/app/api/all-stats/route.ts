import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getWeekStart, getWeekEnd, calculateCappedTotal, calculateCappedMonthlyTotal, getTodayDate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    
    const { searchParams } = new URL(request.url);
    const weekStartParam = searchParams.get('weekStart');
    const weekEndParam = searchParams.get('weekEnd');
    
    // Si se proporcionan parámetros de semana, usarlos; sino usar semana actual
    let weekStart: Date;
    let weekEnd: Date;
    
    if (weekStartParam && weekEndParam) {
      weekStart = new Date(weekStartParam + 'T12:00:00');
      weekEnd = new Date(weekEndParam + 'T12:00:00');
    } else {
      weekStart = getWeekStart();
      weekEnd = getWeekEnd();
    }
    
    // Determinar si es la semana actual comparando solo el día (sin hora/minuto)
    const currentWeekStart = getWeekStart();
    // Comparar solo año, mes y día (no hora/minuto/segundo)
    const isCurrentWeek = 
      weekStart.getFullYear() === currentWeekStart.getFullYear() &&
      weekStart.getMonth() === currentWeekStart.getMonth() &&
      weekStart.getDate() === currentWeekStart.getDate();
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Verificar autenticación para filtrar por amigos
    const authSupabase = await createServerSupabaseClient();
    const { data: { session } } = await authSupabase.auth.getSession();
    const currentUserId = session?.user?.id;

    // Si está autenticado, obtener solo amigos aceptados + sí mismo
    let allowedUserIds: string[] | null = null;
    if (currentUserId) {
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, recipient_id')
        .or(`recipient_id.eq.${currentUserId},requester_id.eq.${currentUserId}`)
        .eq('status', 'accepted');

      const friendIds = (friendships || []).map(f =>
        f.requester_id === currentUserId ? f.recipient_id : f.requester_id
      );
      allowedUserIds = [currentUserId, ...friendIds];
    }

    // Obtener usuarios (filtrados si autenticado)
    let usersQuery = supabase.from('profiles').select('id, name, avatar');
    if (allowedUserIds) {
      usersQuery = usersQuery.in('id', allowedUserIds);
    }
    const { data: users, error: usersError } = await usersQuery;

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
      .gte('date', weekStartStr)
      .lte('date', weekEndStr);

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

    // Obtener las fotos de hoy para todos los usuarios (solo si es la semana actual)
    const userTodayPhotos = new Map<string, { photo_url: string; timestamp: string }>();
    if (isCurrentWeek) {
      const today = getTodayDate();
      const { data: todayEntries, error: todayError } = await supabase
        .from('gym_entries')
        .select('user_id, photo_url, updated_at, created_at')
        .eq('date', today);

      if (!todayError && todayEntries) {
        todayEntries.forEach(entry => {
          userTodayPhotos.set(entry.user_id, {
            photo_url: entry.photo_url,
            timestamp: entry.updated_at || entry.created_at,
          });
        });
      }
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
      const todayPhotoData = userTodayPhotos.get(user.id);
      
      // Construir URL con timestamp para cache busting
      const todayPhotoUrl = todayPhotoData 
        ? `${todayPhotoData.photo_url}?t=${new Date(todayPhotoData.timestamp).getTime()}`
        : undefined;
      
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
        // URL de la foto de hoy (si existe) con timestamp para cache busting
        todayPhotoUrl: todayPhotoUrl,
        // Timestamp de la foto de hoy (si existe)
        todayPhotoTimestamp: todayPhotoData?.timestamp,
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
