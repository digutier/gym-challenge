# 💪 Gym Challenge

Una PWA para registrar la asistencia diaria al gym con fotos. Diseñada para un desafío entre 4 amigos.

## 🚀 Inicio Rápido

### 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve al **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. En **Storage**, crea un bucket llamado `gym-photos` y márcalo como **público**
4. Copia tus credenciales de **Settings > API**

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y completa con tus credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_role_key
```

### 3. Instalar y Ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 4. Crear Íconos PWA

Necesitas crear estos íconos en `/public`:
- `icon-192.png` (192x192 px)
- `icon-512.png` (512x512 px)  
- `apple-touch-icon.png` (180x180 px)

Puedes usar un emoji como 💪 o 🏋️ sobre fondo púrpura (#7c3aed).

## 📱 Instalar como App

### iOS (Safari)
1. Abre la URL en Safari
2. Toca el botón de compartir (cuadrado con flecha)
3. Selecciona "Agregar a pantalla de inicio"

### Android (Chrome)
1. Abre la URL en Chrome
2. Toca el menú (3 puntos)
3. Selecciona "Instalar app"

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 + React + TypeScript
- **Estilos**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deploy**: Vercel

## 📂 Estructura del Proyecto

```
gym-challenge/
├── public/
│   ├── manifest.json      # Configuración PWA
│   ├── sw.js             # Service Worker
│   └── icon-*.png        # Íconos PWA
├── src/
│   ├── app/
│   │   ├── api/          # API Routes
│   │   │   ├── check-today/
│   │   │   ├── upload/
│   │   │   ├── user-stats/
│   │   │   └── all-stats/
│   │   ├── dashboard/
│   │   ├── public-dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardRegistered.tsx
│   │   ├── DashboardNotRegistered.tsx
│   │   ├── WeekProgress.tsx
│   │   ├── GroupRanking.tsx
│   │   └── PhotoUpload.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
└── supabase/
    └── schema.sql
```

## 🎯 Características

- ✅ Registro diario con foto
- ✅ Retomar foto si ya registraste
- ✅ Progreso semanal visual
- ✅ Ranking del grupo
- ✅ Dashboard público
- ✅ PWA instalable
- ✅ Compresión automática de imágenes

## 🔧 Personalización

### Cambiar usuarios

Edita `src/lib/constants.ts`:

```typescript
export const USERS = [
  { name: 'Tu Nombre', avatar: '🧑', token: 'token-unico-1' },
  { name: 'Amigo 1', avatar: '👨', token: 'token-unico-2' },
  // ...
];
```

Y actualiza los registros en Supabase:

```sql
UPDATE users SET name = 'Nuevo Nombre' WHERE token = 'token-xxx';
```

## 🚢 Deploy en Vercel

1. Sube el repo a GitHub
2. Importa en [vercel.com](https://vercel.com)
3. Configura las variables de entorno
4. Deploy!

## 📄 Licencia

MIT
