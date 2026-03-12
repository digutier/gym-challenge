# Gym Challenge - CLAUDE.md

## Project Overview

PWA for tracking daily gym attendance among 4 friends. Users register attendance by taking a photo each day. Built with Next.js (App Router) + React + TypeScript + Tailwind CSS, with Supabase as backend (PostgreSQL + Storage). Deployed on Vercel.

## Project Structure

```
gym-challenge/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Entry point (login/redirect)
│   │   ├── dashboard/page.tsx          # Main dashboard
│   │   ├── public-dashboard/page.tsx   # Public dashboard (view all users)
│   │   └── api/
│   │       ├── upload/route.ts         # Upload photo & create entry
│   │       ├── all-stats/route.ts      # Group ranking stats
│   │       ├── user-stats/route.ts     # Single user stats
│   │       ├── day-stats/route.ts      # Stats for a specific day
│   │       ├── profile/route.ts        # User profile
│   │       └── users/search/route.ts   # Search users
│   ├── components/
│   │   ├── AuthScreen.tsx              # User selection screen
│   │   ├── Dashboard.tsx               # Main dashboard logic
│   │   ├── GroupRanking.tsx            # Group ranking display
│   │   ├── PastDayModal.tsx            # Modal for past day photos
│   │   ├── PhotoUpload.tsx             # Camera/upload component
│   │   ├── ServiceWorkerRegister.tsx   # PWA service worker
│   │   ├── WeekProgress.tsx            # Weekly grid progress
│   │   └── ui/                         # shadcn/ui base components
│   ├── contexts/
│   │   └── AuthContext.tsx             # Auth state (token in localStorage)
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client (browser)
│   │   ├── supabase-server.ts          # Supabase client (server)
│   │   ├── constants.ts                # Users and tokens
│   │   └── utils.ts                    # Helper functions
│   └── types/
│       └── index.ts                    # TypeScript types
├── public/
│   ├── manifest.json                   # PWA manifest
│   └── sw.js                           # Service worker
└── supabase/
    └── schema.sql                      # DB schema
```

## Database Schema (Supabase)

```sql
-- users: id, name, avatar, token (unique), created_at
-- gym_entries: id, user_id (FK), date (DATE), photo_url, created_at, updated_at
-- Constraint: UNIQUE(user_id, date) — one entry per user per day
-- Storage bucket: "gym-photos" (public)
```

## Auth Model

- No traditional auth — users identified by unique tokens stored in `localStorage`
- Token passed as `Authorization: Bearer {token}` header or `?token=` query param
- `AuthContext` manages current user state throughout the app

## Code Conventions

### Naming
| Element | Convention | Example |
|---|---|---|
| Variables & functions | camelCase | `userId`, `getUserStats` |
| Components | PascalCase | `GroupRanking` |
| Files | PascalCase for components | `WeekProgress.tsx` |
| Files | camelCase for lib/utils | `supabase-server.ts` |
| Types/Interfaces | PascalCase | `GymEntry`, `UserStats` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |

### TypeScript
- Always type component props explicitly
- Never use `any`
- Use types from `src/types/index.ts` — extend there when adding new shapes
- Use `async/await` — no `.then()` chains

### Components
- Functional components only, with hooks
- Keep API calls in page-level components or dedicated hooks, not deep in UI components
- Mobile-first responsive design

### Styling
- Tailwind CSS utility classes only — no custom CSS unless absolutely necessary
- Color palette: indigo-to-purple gradients (primary), green (success), white cards with `rounded-3xl shadow-2xl`
- Buttons: gradient bg, `rounded-2xl`, `hover:scale-105 active:scale-95 transition-all`
- shadcn/ui components live in `src/components/ui/`

### API Routes
- Always validate token before any operation
- Use `supabase-server.ts` (service role) for server-side DB access
- Return consistent JSON: `{ success: true, data }` or `{ error: string }`
- Compress images client-side before uploading (max ~1080px width)

## Key Patterns

- **Photo upload**: Client compresses → POST to `/api/upload` with FormData → stored in Supabase Storage as `{user_id}/{date}.jpg` → upsert `gym_entries`
- **Check registration**: GET `/api/user-stats?token=` returns today's entry status
- **Ranking**: GET `/api/all-stats` returns all users sorted by `daysThisWeek`

## Git Conventions

Branches: `main` (production), `feature/`, `fix/`, `hotfix/`

Commit format:
```
type: short description in English
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `perf`

## PWA Notes

- Manifest at `/public/manifest.json`, service worker at `/public/sw.js`
- Theme color: `#6366f1` (indigo)
- Must be served over HTTPS for PWA install prompts (Vercel handles this)
- iOS: install via Safari Share > Add to Home Screen
- Android: Chrome install banner or menu > Install app

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
```
