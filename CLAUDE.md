# Gym Challenge - CLAUDE.md

## Project Overview

PWA for tracking daily gym attendance among 4 friends. Users register attendance by taking a photo each day. Built with Next.js (App Router) + React + TypeScript + Tailwind CSS, with Supabase as backend (PostgreSQL + Storage). Deployed on Vercel.

## Project Structure

```
gym-challenge/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Entry point — owns auth gate + today's entry state
│   │   ├── dashboard/page.tsx          # Redirect shim to "/" (kept for URL compatibility)
│   │   ├── public-dashboard/page.tsx   # Public dashboard (view all users, no auth required)
│   │   └── api/
│   │       ├── upload/route.ts         # Upload photo & create/update entry (DELETE + POST)
│   │       ├── all-stats/route.ts      # Group ranking stats (soft auth)
│   │       ├── user-stats/route.ts     # Single user stats (conditional auth)
│   │       ├── day-stats/route.ts      # Stats for a specific day (soft auth)
│   │       ├── profile/route.ts        # User profile (auto-creates on first login)
│   │       ├── friends/route.ts        # GET pending requests + accepted friends
│   │       ├── friends/request/route.ts   # POST send friend request by email
│   │       ├── friends/respond/route.ts   # POST accept/decline request
│   │       ├── friends/remove/route.ts    # POST remove friendship
│   │       └── users/search/route.ts   # Search users by email
│   ├── components/
│   │   ├── AuthScreen.tsx              # Login/signup screen
│   │   ├── Dashboard.tsx               # Dashboard shell: nav, modals, tab routing
│   │   ├── dashboard/
│   │   │   ├── HomeTab.tsx             # Home tab: hero card, week grid, mobile/desktop ranking
│   │   │   ├── WorkoutsTab.tsx         # Workouts tab (placeholder)
│   │   │   ├── FeedTab.tsx             # Feed tab: period-selectable global ranking
│   │   │   ├── ProfileTab.tsx          # Profile tab: stats + friends/logout actions
│   │   │   └── RankingList.tsx         # Shared top-5 weekly ranking list (mobile + desktop)
│   │   ├── GroupRanking.tsx            # Podium + list ranking display (used by FeedTab)
│   │   ├── PodiumAvatar.tsx            # Single podium avatar (rank 1-3)
│   │   ├── StoryViewer.tsx             # Shared Instagram-style photo story overlay
│   │   ├── PastDayModal.tsx            # Modal for past day photos
│   │   ├── PhotoUpload.tsx             # Camera/upload component
│   │   ├── AddFriendModal.tsx          # Add friend by email
│   │   ├── FriendsListModal.tsx        # Friends list + remove
│   │   ├── NotificationsModal.tsx      # Pending friend requests
│   │   ├── ServiceWorkerRegister.tsx   # PWA service worker
│   │   └── ui/                         # shadcn/ui base components (Card currently unused, kept for future use)
│   ├── hooks/
│   │   ├── useWeekNavigation.ts        # Selected week state + prev/next/label derivation
│   │   ├── useDashboardStats.ts        # Week entries + ranking fetch/refresh
│   │   └── useFriendRequests.ts        # Pending requests + friends fetch/refresh
│   ├── contexts/
│   │   └── AuthContext.tsx             # Supabase session auth state (see Auth Model below)
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase clients (browser session + service-role)
│   │   ├── supabase-server.ts          # Supabase server/SSR session client
│   │   ├── api-auth.ts                 # Shared API route auth helpers (see Auth Model)
│   │   ├── constants.ts                # STORAGE_BUCKET
│   │   ├── date.ts                     # Chile-timezone date/week helpers
│   │   ├── stats.ts                    # WEEKLY_GOAL, capDays, capped-total calculations
│   │   ├── image.ts                    # Client-side image compression
│   │   └── utils.ts                    # cn() class-merge helper only
│   └── types/
│       └── index.ts                    # TypeScript types
├── public/
│   ├── manifest.json                   # PWA manifest
│   └── sw.js                           # Service worker
└── supabase/
    ├── schema.sql                      # Legacy schema (users/token table — superseded, see below)
    └── friendships.sql                 # friendships table DDL
```

## Database Schema (Supabase)

The app queries `profiles` and `friendships` (not the legacy `users` table `schema.sql` still describes — that table predates the current Supabase Auth model and is no longer written to). `profiles`' DDL isn't currently tracked in `supabase/` — adding a migration file for it is a good follow-up, but out of scope for routine feature work.

```sql
-- profiles: id (= auth.users.id), email, name, avatar, created_at, updated_at
--   Auto-created by GET /api/profile on first login if missing.
-- friendships: id, requester_id (FK profiles), recipient_id (FK profiles),
--   status ('pending' | 'accepted' | 'declined'), created_at, updated_at
--   See supabase/friendships.sql.
-- gym_entries: id, user_id (FK), date (DATE), photo_url, created_at, updated_at
-- Constraint: UNIQUE(user_id, date) — one entry per user per day
-- Storage bucket: "gym-photos" (public)
```

## Auth Model

Standard Supabase email/password session auth via `@supabase/ssr` — not token-based (an earlier design used static tokens; that was never actually built, and `lib/utils.ts`'s `isValidToken()` remnant has been removed).

- `AuthContext` wraps `supabase.auth` (browser client from `lib/supabase.ts`) and exposes `user`, `profile`, `signUp`/`signIn`/`signOut`.
- API routes authenticate via `createServerSupabaseClient()` (`lib/supabase-server.ts`, cookie-based session) through the shared helpers in `lib/api-auth.ts`:
  - `requireAuth()` — hard auth, 401s if no session. Used by most mutation routes.
  - `requireAuthUser()` — same, but returns the full Supabase user (email, metadata) for routes that need more than just the id (`profile`).
  - `requireAuthClient()` — same, but also returns the session-scoped Supabase client for routes that need to run RLS-scoped queries as the current user, not just the service-role client (`upload`).
  - `getOptionalUserId()` — soft auth, returns the session's userId or `null`, never 401s. Used by `all-stats`/`day-stats` so those endpoints still work logged out (public dashboard).
  - `user-stats/route.ts` combines both: no auth check at all when `?userId=` is supplied, hard auth only when it's omitted.
  - `users/search/route.ts` is a deliberate exception — it inlines its own session check and uses the session client directly for its query/RPC, since its dependency on RLS couldn't be verified before touching it.
- Mutating DB writes go through `getServiceSupabase()` (service-role, bypasses RLS) in most routes; a few (`upload`, `page.tsx`'s direct `gym_entries` read) use the session-scoped client instead.

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
- Always authenticate via the `lib/api-auth.ts` helpers before any operation — see Auth Model above for which variant to use
- Use `getServiceSupabase()` (`lib/supabase.ts`, service role) for server-side DB access that should bypass RLS; use the session-scoped client (from `requireAuthClient()`/`createServerSupabaseClient()`) when a query should stay RLS-scoped to the current user
- Error responses are consistently `{ error: string }` with the corresponding HTTP status. Success responses are route-specific shapes (no uniform envelope) — check `src/types/index.ts` for the documented ones (`UploadResponse`, `UserStatsResponse`, `AllStatsResponse`, `CheckTodayResponse`) before inventing a new inline shape
- Compress images client-side before uploading (max ~1080px width) via `lib/image.ts`'s `compressImage()`

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
- No tests currently

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
```
