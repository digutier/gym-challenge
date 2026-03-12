# Gym Challenge - Sistema de Grupos

## 📋 Contexto del Proyecto

Estamos agregando un sistema de grupos al proyecto Gym Challenge. Los grupos permiten a los usuarios compartir su progreso con amigos/familia específicos.

### Concepto Clave:
- **Un usuario puede pertenecer a múltiples grupos**
- **El registro diario es único** (1 foto por día)
- **Esa foto se ve en TODOS los grupos** del usuario
- **Cada grupo muestra solo el progreso de SUS miembros**

### Estado Actual:
- Auth con Supabase funcionando ✅
- Upload de fotos funcionando ✅
- Dashboard personal funcionando ✅

### Estado Final:
- Sistema de grupos completo
- Dashboard principal rediseñado
- Vista de grupos con stats
- Crear/unirse a grupos
- Dashboard por grupo individual

---

## 🗄️ Base de Datos (YA CONFIGURADA)

La base de datos ya fue configurada en Supabase con:

```
✅ public.groups (tabla de grupos)
✅ public.group_members (membresías many-to-many)
✅ RLS activado con 7 políticas
✅ Trigger para auto-agregar creador como admin
✅ 4 funciones útiles
✅ 2 vistas para queries comunes
```

**NO necesitas tocar la base de datos, solo el código.**

---

## 🎨 Diseño del Dashboard Principal

### Estructura Visual (de arriba hacia abajo):

```
1. Header (usuario actual)
2. Sección Foto (botón grande o foto registrada)
3. Progreso Semanal (barra con 7 días)
4. Stats Periodo (mes + año lado a lado)
5. Lista de Grupos (con quick stats)
6. Botón Crear Grupo
```

### Estados:

- **Foto NO registrada hoy**: Botón grande "📸 Tomar Foto"
- **Foto YA registrada**: Mostrar foto + botón "Retomar Foto"
- **Sin grupos**: Empty state motivacional
- **Con grupos**: Lista con stats rápidas

---

## 📂 Estructura de Archivos a Crear/Modificar

```
src/
├── app/
│   ├── page.tsx                          # MODIFICAR: Nuevo dashboard principal
│   ├── groups/
│   │   ├── page.tsx                      # CREAR: Lista detallada de grupos
│   │   ├── [groupId]/
│   │   │   └── page.tsx                  # CREAR: Dashboard de grupo individual
│   │   └── new/
│   │       └── page.tsx                  # CREAR: Crear nuevo grupo
│   │
│   └── api/
│       ├── my-stats/
│       │   └── route.ts                  # CREAR: Stats personales (semana/mes/año)
│       ├── my-groups/
│       │   └── route.ts                  # CREAR: Mis grupos con quick stats
│       ├── groups/
│       │   ├── route.ts                  # CREAR: GET todos mis grupos, POST crear
│       │   └── [groupId]/
│       │       ├── route.ts              # CREAR: GET/PATCH/DELETE grupo
│       │       ├── members/
│       │       │   └── route.ts          # CREAR: GET/POST/DELETE miembros
│       │       └── stats/
│       │           └── route.ts          # CREAR: GET stats del grupo
│       │
│       └── users/
│           └── search/
│               └── route.ts              # CREAR: Buscar usuarios por email
│
├── components/
│   ├── MainDashboard.tsx                 # CREAR: Dashboard principal nuevo
│   ├── PhotoSection.tsx                  # CREAR: Sección de foto hero
│   ├── WeekProgress.tsx                  # CREAR: Barra de progreso semanal
│   ├── PeriodStats.tsx                   # CREAR: Cards de mes/año
│   ├── GroupsList.tsx                    # CREAR: Lista de grupos con quick stats
│   ├── GroupCard.tsx                     # CREAR: Card individual de grupo
│   ├── GroupDashboard.tsx                # CREAR: Dashboard de un grupo
│   ├── CreateGroupModal.tsx              # CREAR: Modal para crear grupo
│   ├── AddMemberModal.tsx                # CREAR: Modal para agregar miembros
│   └── GroupSettings.tsx                 # CREAR: Settings de grupo
│
└── types/
    └── index.ts                          # AGREGAR: Tipos para grupos
```

---

## 🔧 Paso 1: Agregar Tipos

### src/types/index.ts (AGREGAR AL FINAL)

```typescript
// ========================================
// TIPOS PARA SISTEMA DE GRUPOS
// ========================================

export type Group = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type GroupWithStats = Group & {
  creator_name: string;
  creator_avatar: string;
  member_count: number;
  role?: 'admin' | 'member'; // Mi rol en este grupo
  joined_at?: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
};

export type GroupMemberWithProfile = GroupMember & {
  profile: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
};

export type GroupStats = {
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_email: string;
  days_count: number;
  last_entry_date: string | null;
};

export type UserStats = {
  days_this_week: number;
  days_this_month: number;
  days_this_year: number;
  total_days: number;
  week_entries: Array<{ date: string; registered: boolean }>;
  current_streak: number;
  longest_streak: number;
};

export type QuickGroupStats = {
  group_id: string;
  group_name: string;
  member_count: number;
  total_days_this_week: number;
  max_possible_days: number; // member_count * 7
  average_days: number;
};
```

---

## 🌐 Paso 2: API Routes

### src/app/api/my-stats/route.ts (CREAR)

```typescript
import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();
  
  try {
    // Verificar auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const today = new Date();
    
    // Calcular inicio de semana (lunes)
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calcular inicio de mes
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Calcular inicio de año
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    // Query para stats
    const { data: entries, error } = await supabase
      .from('gym_entries')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Calcular stats
    const allDates = entries?.map(e => e.date) || [];
    
    const daysThisWeek = allDates.filter(
      d => new Date(d) >= startOfWeek
    ).length;
    
    const daysThisMonth = allDates.filter(
      d => new Date(d) >= startOfMonth
    ).length;
    
    const daysThisYear = allDates.filter(
      d => new Date(d) >= startOfYear
    ).length;
    
    // Generar array de 7 días para la semana
    const weekEntries = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      weekEntries.push({
        date: dateStr,
        registered: allDates.includes(dateStr)
      });
    }
    
    // Calcular racha actual
    let currentStreak = 0;
    const sortedDates = [...allDates].sort().reverse();
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    for (const dateStr of sortedDates) {
      const entryDate = new Date(dateStr);
      entryDate.setHours(0, 0, 0, 0);
      
      if (entryDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (entryDate.getTime() < checkDate.getTime() - 86400000) {
        break;
      }
    }
    
    // Calcular racha más larga
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedAsc = [...allDates].sort();
    
    for (let i = 0; i < sortedAsc.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedAsc[i - 1]);
        const currDate = new Date(sortedAsc[i]);
        const diffDays = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / 86400000
        );
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return NextResponse.json({
      days_this_week: daysThisWeek,
      days_this_month: daysThisMonth,
      days_this_year: daysThisYear,
      total_days: allDates.length,
      week_entries: weekEntries,
      current_streak: currentStreak,
      longest_streak: longestStreak
    });
    
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener stats' },
      { status: 500 }
    );
  }
}
```

### src/app/api/my-groups/route.ts (CREAR)

```typescript
import { createServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    // Usar la vista my_groups que ya creamos
    const { data: groups, error } = await supabase
      .from('my_groups')
      .select('*')
      .order('joined_at', { ascending: false });
    
    if (error) throw error;
    
    // Para cada grupo, calcular quick stats
    const groupsWithQuickStats = await Promise.all(
      (groups || []).map(async (group) => {
        // Calcular inicio de semana
        const today = new Date();
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        // Contar entrenamientos de la semana del grupo
        const { data: weekStats } = await supabase.rpc(
          'get_group_stats',
          {
            p_group_id: group.id,
            p_start_date: startOfWeek.toISOString().split('T')[0],
            p_end_date: new Date().toISOString().split('T')[0]
          }
        );
        
        const totalDaysThisWeek = weekStats?.reduce(
          (sum: number, s: any) => sum + s.days_count,
          0
        ) || 0;
        
        const memberCount = group.member_count || 0;
        const maxPossibleDays = memberCount * 7;
        const averageDays = memberCount > 0 
          ? totalDaysThisWeek / memberCount 
          : 0;
        
        return {
          ...group,
          quick_stats: {
            total_days_this_week: totalDaysThisWeek,
            max_possible_days: maxPossibleDays,
            average_days: Math.round(averageDays * 10) / 10,
            percentage: maxPossibleDays > 0
              ? Math.round((totalDaysThisWeek / maxPossibleDays) * 100)
              : 0
          }
        };
      })
    );
    
    return NextResponse.json({ groups: groupsWithQuickStats });
    
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### src/app/api/groups/route.ts (CREAR)

```typescript
import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Obtener todos mis grupos
export async function GET() {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    // Usar vista groups_with_stats
    const { data: groups, error } = await supabase
      .from('groups_with_stats')
      .select('*')
      .in('id', 
        supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', session.user.id)
      );
    
    if (error) throw error;
    
    return NextResponse.json({ groups: groups || [] });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear nuevo grupo
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const body = await req.json();
    const { name, description } = body;
    
    // Validaciones
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }
    
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'El nombre es muy largo (máx 100 caracteres)' },
        { status: 400 }
      );
    }
    
    // Crear grupo
    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: session.user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // El trigger ya agregó al creador como miembro admin
    
    return NextResponse.json({ group }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### src/app/api/groups/[groupId]/route.ts (CREAR)

```typescript
import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Obtener detalles de un grupo
export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { groupId } = params;
    
    // Verificar que el usuario es miembro
    const canView = await supabase.rpc('user_can_view_group', {
      p_group_id: groupId
    });
    
    if (!canView.data) {
      return NextResponse.json(
        { error: 'No tienes acceso a este grupo' },
        { status: 403 }
      );
    }
    
    // Obtener grupo
    const { data: group, error } = await supabase
      .from('groups_with_stats')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ group });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Actualizar grupo
export async function PATCH(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { groupId } = params;
    const body = await req.json();
    const { name, description } = body;
    
    // Actualizar (RLS verifica que sea el creador)
    const { data: group, error } = await supabase
      .from('groups')
      .update({
        name: name?.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No tienes permiso para editar este grupo' },
          { status: 403 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({ group });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Borrar grupo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { groupId } = params;
    
    // Borrar (RLS verifica que sea el creador)
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'No tienes permiso para borrar este grupo' },
          { status: 403 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### src/app/api/groups/[groupId]/members/route.ts (CREAR)

```typescript
import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Obtener miembros del grupo
export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { groupId } = params;
    
    // Verificar acceso
    const canView = await supabase.rpc('user_can_view_group', {
      p_group_id: groupId
    });
    
    if (!canView.data) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }
    
    // Obtener miembros con profiles
    const { data: members, error } = await supabase
      .from('group_members')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        profile:profiles(id, name, email, avatar)
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({ members: members || [] });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Agregar miembro al grupo
export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { groupId } = params;
    const body = await req.json();
    const { user_id } = body;
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      );
    }
    
    // Insertar (RLS verifica que seas admin)
    const { data: member, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: user_id,
        role: 'member'
      })
      .select(`
        id,
        user_id,
        role,
        joined_at,
        profile:profiles(id, name, email, avatar)
      `)
      .single();
    
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'El usuario ya es miembro del grupo' },
          { status: 400 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({ member }, { status: 201 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remover miembro o salirse del grupo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { groupId } = params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      );
    }
    
    // Borrar (RLS verifica permisos)
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### src/app/api/groups/[groupId]/stats/route.ts (CREAR)

```typescript
import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { groupId } = params;
    const { searchParams } = new URL(req.url);
    
    // Parámetros opcionales
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    // Verificar acceso
    const canView = await supabase.rpc('user_can_view_group', {
      p_group_id: groupId
    });
    
    if (!canView.data) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }
    
    // Calcular fechas por defecto (semana actual)
    let start = startDate;
    let end = endDate;
    
    if (!start) {
      const today = new Date();
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      start = startOfWeek.toISOString().split('T')[0];
    }
    
    if (!end) {
      end = new Date().toISOString().split('T')[0];
    }
    
    // Obtener stats usando la función
    const { data: stats, error } = await supabase.rpc('get_group_stats', {
      p_group_id: groupId,
      p_start_date: start,
      p_end_date: end
    });
    
    if (error) throw error;
    
    return NextResponse.json({ 
      stats: stats || [],
      period: { start, end }
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### src/app/api/users/search/route.ts (CREAR)

```typescript
import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }
    
    // Usar la función de búsqueda
    const { data: users, error } = await supabase.rpc(
      'search_users_by_email',
      {
        p_email_query: query.trim(),
        p_limit: 10
      }
    );
    
    if (error) throw error;
    
    // Filtrar usuario actual de resultados
    const filtered = (users || []).filter(
      (u: any) => u.user_id !== session.user.id
    );
    
    return NextResponse.json({ users: filtered });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 🎨 Paso 3: Componentes UI

### src/components/PhotoSection.tsx (CREAR)

```typescript
'use client';

import { useState, useRef } from 'react';

type PhotoSectionProps = {
  todayEntry: { photo_url: string; timestamp: string } | null;
  onPhotoUpload: (file: File) => Promise<void>;
  uploading: boolean;
};

export default function PhotoSection({
  todayEntry,
  onPhotoUpload,
  uploading
}: PhotoSectionProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file