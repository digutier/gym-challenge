# Gym Challenge - Integración de Supabase Auth

## 📋 Contexto del Proyecto

Estamos agregando autenticación real con Supabase Auth al proyecto Gym Challenge. Esto reemplaza el sistema simple de tokens localStorage por login real con email/password.

### Estado Actual:
- PWA funcionando con tokens simples en localStorage
- 4 usuarios hardcodeados
- Sin autenticación real

### Estado Final:
- Supabase Auth integrado
- Login/Signup real con email/password
- Row Level Security (RLS) activo
- Cada usuario solo puede modificar sus propios datos
- Preparado para escalar a más usuarios

---

## 🗄️ Base de Datos (YA CONFIGURADA)

La base de datos ya fue configurada en Supabase con:

```
✅ public.profiles (conectada a auth.users)
✅ public.gym_entries (con foreign key a auth.users)
✅ RLS activado en ambas tablas
✅ 7 políticas RLS creadas
✅ Trigger automático para crear profiles
✅ Auth Settings configurado
```

**NO necesitas tocar la base de datos, solo el código.**

---

## 📦 Dependencias a Instalar

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

Si ya las tienes instaladas, verificar versiones:

```json
{
  "@supabase/auth-helpers-nextjs": "^0.10.0",
  "@supabase/supabase-js": "^2.39.0"
}
```

---

## 📂 Estructura de Archivos a Crear/Modificar

```
src/
├── app/
│   ├── layout.tsx                    # MODIFICAR: Agregar AuthProvider
│   ├── page.tsx                      # MODIFICAR: Routing con auth
│   └── api/
│       └── upload/
│           └── route.ts              # MODIFICAR: Usar session en vez de token
│
├── components/
│   ├── AuthScreen.tsx                # CREAR: Pantalla de login/signup
│   ├── Dashboard.tsx                 # MODIFICAR: Usar useAuth() hook
│   └── ... (otros componentes existentes)
│
├── contexts/
│   └── AuthContext.tsx               # CREAR: Context de autenticación
│
└── lib/
    ├── supabase.ts                   # MODIFICAR: Cliente para client components
    └── supabase-server.ts            # CREAR: Cliente para server components
```

---

## 🔧 Paso 1: Actualizar Cliente Supabase

### src/lib/supabase.ts (MODIFICAR)

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();
```

### src/lib/supabase-server.ts (CREAR NUEVO)

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export function createServerClient() {
  return createRouteHandlerClient({ cookies });
}
```

---

## 🎨 Paso 2: Crear AuthContext

### src/contexts/AuthContext.tsx (CREAR NUEVO)

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Profile = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name,
          avatar: '🧑'
        }
      }
    });
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (!error) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signUp, 
      signIn, 
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 🎨 Paso 3: Crear AuthScreen Component

### src/components/AuthScreen.tsx (CREAR NUEVO)

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (name.trim().length < 2) {
          throw new Error('El nombre debe tener al menos 2 caracteres');
        }
        
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        
        alert('¡Cuenta creada! Ya puedes usar la app.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏋️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gym Challenge
          </h1>
          <p className="text-gray-600">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear tu cuenta'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Tu nombre"
                required
                minLength={2}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="••••••••"
              required
              minLength={6}
            />
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {loading 
              ? 'Cargando...' 
              : mode === 'login' 
                ? 'Iniciar Sesión' 
                : 'Crear Cuenta'}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            {mode === 'login' 
              ? '¿No tienes cuenta? Regístrate' 
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 Paso 4: Actualizar Layout

### src/app/layout.tsx (MODIFICAR)

```typescript
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Gym Challenge',
  description: 'Track your gym attendance with friends',
  manifest: '/manifest.json',
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## 🔄 Paso 5: Actualizar Page Principal

### src/app/page.tsx (MODIFICAR)

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthScreen from '@/components/AuthScreen';
import Dashboard from '@/components/Dashboard'; // Tu componente existente

export default function Home() {
  const { user, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4 animate-bounce">💪</div>
          <p className="text-xl font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return <AuthScreen />;
  }

  // Si hay usuario, mostrar dashboard
  return <Dashboard />;
}
```

---

## 🔐 Paso 6: Actualizar API Upload

### src/app/api/upload/route.ts (MODIFICAR COMPLETAMENTE)

```typescript
import { createServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  
  try {
    // 1. Verificar autenticación
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    // 2. Verificar si ya registró hoy
    const { data: existing } = await supabase
      .from('gym_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (existing) {
      return NextResponse.json({
        message: '⚠️ Ya registraste hoy',
        alreadyRegistered: true
      });
    }
    
    // 3. Obtener foto
    const formData = await req.formData();
    const photo = formData.get('photo') as File;
    
    if (!photo) {
      return NextResponse.json(
        { error: 'Sin foto' },
        { status: 400 }
      );
    }
    
    // Validaciones
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Foto muy grande (máx 5MB)' },
        { status: 400 }
      );
    }
    
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }
    
    // 4. Subir a Supabase Storage
    const fileName = `${userId}/${today}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('gym-photos')
      .upload(fileName, photo, {
        contentType: photo.type,
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    // 5. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('gym-photos')
      .getPublicUrl(fileName);
    
    // 6. Guardar registro (RLS asegura que solo pueda insertar para sí mismo)
    const { error: dbError } = await supabase
      .from('gym_entries')
      .insert({
        user_id: userId,
        date: today,
        photo_url: publicUrl
      });
    
    if (dbError) throw dbError;
    
    // 7. Calcular días de la semana
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    
    const { data: weekEntries } = await supabase
      .from('gym_entries')
      .select('id')
      .eq('user_id', userId)
      .gte('date', startOfWeek.toISOString().split('T')[0]);
    
    const daysThisWeek = weekEntries?.length || 0;
    
    return NextResponse.json({
      success: true,
      message: `✅ ¡Registrado! Día ${daysThisWeek}/7 esta semana`,
      daysThisWeek,
      photoUrl: publicUrl
    });
    
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al subir foto' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Paso 7: Actualizar Dashboard Component

### En tu componente Dashboard existente (MODIFICAR)

Reemplaza donde usabas `localStorage.getItem('gym_token')` con `useAuth()`:

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
// ... otros imports

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  
  // Ahora tienes acceso a:
  // - user.id (en vez de user_id de token)
  // - profile.name (en vez de nombre hardcodeado)
  // - profile.avatar
  // - signOut() para logout
  
  // El resto de tu lógica sigue igual
  // Solo cambia cómo obtienes el user_id
  
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    // YA NO necesitas agregar token en headers
    // La session se maneja automáticamente con cookies
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    // ... manejar respuesta
  };
  
  // Botón de logout
  const handleLogout = () => {
    signOut();
  };
  
  // ... resto de tu componente
}
```

---

## ✅ Checklist de Implementación

### Fase 1: Setup Base
- [ ] Instalar dependencias: `@supabase/auth-helpers-nextjs`
- [ ] Crear `src/lib/supabase-server.ts`
- [ ] Modificar `src/lib/supabase.ts`

### Fase 2: Auth Context
- [ ] Crear `src/contexts/AuthContext.tsx`
- [ ] Crear `src/components/AuthScreen.tsx`
- [ ] Modificar `src/app/layout.tsx` (agregar AuthProvider)
- [ ] Modificar `src/app/page.tsx` (routing con auth)

### Fase 3: API Routes
- [ ] Modificar `src/app/api/upload/route.ts` (usar session)
- [ ] Eliminar sistema de tokens antiguo

### Fase 4: Dashboard
- [ ] Modificar componente Dashboard para usar `useAuth()`
- [ ] Reemplazar `localStorage` con `useAuth()`
- [ ] Agregar botón de logout

### Fase 5: Testing
- [ ] npm run dev
- [ ] Abrir http://localhost:3000
- [ ] Crear cuenta nueva
- [ ] Verificar que profile se crea en Supabase
- [ ] Login con la cuenta creada
- [ ] Subir foto
- [ ] Verificar que solo puede ver/modificar sus datos
- [ ] Logout y volver a login
- [ ] Probar en móvil

---

## 🐛 Troubleshooting

### Error: "No autenticado" al subir foto

```typescript
// Verificar que las cookies se están enviando
// En src/lib/supabase-server.ts asegurar:
import { cookies } from 'next/headers';

export function createServerClient() {
  return createRouteHandlerClient({ cookies });
}
```

### Error: "Cannot read properties of undefined (reading 'id')"

```typescript
// En Dashboard, siempre verificar que user existe:
const { user, profile } = useAuth();

if (!user || !profile) {
  return <div>Cargando...</div>;
}

// Ahora sí usar user.id
```

### Session no persiste al recargar

```typescript
// Verificar que AuthProvider está en layout.tsx
// Y que supabase.auth.getSession() se llama en useEffect
```

### RLS bloquea queries

```sql
-- Verificar políticas en Supabase:
SELECT * FROM pg_policies WHERE tablename = 'gym_entries';

-- Debe haber política SELECT con USING (true)
-- Para que todos puedan ver
```

---

## 🚀 Deploy

```bash
# 1. Commit cambios
git add .
git commit -m "feat: add Supabase Auth"

# 2. Push a GitHub
git push origin main

# 3. Vercel auto-deploy (si ya está conectado)
# O manualmente:
vercel --prod

# 4. Verificar env vars en Vercel:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# (NO necesitas SUPABASE_SERVICE_KEY para auth básico)
```

---

## 📱 Testing en Producción

```
1. Abrir: https://gym-challenge.vercel.app
2. Crear cuenta (Signup)
3. Verificar email en Supabase Dashboard → Authentication → Users
4. Login
5. Instalar PWA (Safari → Compartir → Agregar a Inicio)
6. Subir foto
7. Verificar en Supabase → Table Editor → gym_entries
8. Logout y volver a login
9. Compartir con amigos para que creen sus cuentas
```

---

## 🎯 Resultado Final

```
✅ Login/Signup real funcionando
✅ Session persistente (cookies)
✅ RLS protegiendo datos
✅ Cada usuario ve su dashboard personalizado
✅ Todos ven el ranking grupal
✅ PWA instalable en iOS y Android
✅ Listo para escalar a más usuarios
```

---

## 💡 Próximos Pasos Opcionales

Una vez funcionando:

1. **Forgot Password**: Supabase lo incluye automáticamente
2. **Google Login**: Agregar en 10 minutos
3. **Profile Settings**: Editar nombre y avatar
4. **Email Notifications**: Recordatorios diarios
5. **Streaks**: Días consecutivos
6. **Achievements**: Badges por logros

---

¡Listo! Usa este archivo en Cursor y construye todo paso a paso. 🚀