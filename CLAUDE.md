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
│   │       ├── users/search/route.ts   # Search users by email
│   │       ├── gym-history/route.ts    # GET own gym_entries, newest first (hard auth)
│   │       └── progress/               # Private body-progress photos — see Progress Photos below
│   │           ├── route.ts            #   GET today's entry (signed photo URLs)
│   │           ├── photo/route.ts      #   POST upload / DELETE remove one body-part photo
│   │           ├── details/route.ts    #   POST save note + weight
│   │           └── history/route.ts    #   GET last N days (batch-signed), newest first
│   ├── components/
│   │   ├── AuthScreen.tsx              # Login/signup screen (+ AuthScreen.styles.ts)
│   │   ├── Dashboard.tsx               # Dashboard shell: nav, modals, tab routing
│   │   ├── dashboard/
│   │   │   ├── HomeTab.tsx             # Home tab: hero card, week grid, mobile/desktop ranking
│   │   │   ├── ProgressTab.tsx         # Progreso tab: body-part photo capture + note + weight + history
│   │   │   ├── ProgressPhotoSlot.tsx   # Single body-part photo box (empty/loading/preview states)
│   │   │   ├── ProgressHistoryGallery.tsx  # Horizontal scroll strip of past days for one body part
│   │   │   ├── ProgressHistoryViewer.tsx   # Full-screen swipeable viewer (photo + note + weight)
│   │   │   ├── FeedTab.tsx             # Feed tab: period-selectable global ranking
│   │   │   ├── ProfileTab.tsx          # Profile tab: stats + friends/logout actions
│   │   │   ├── RankingList.tsx         # Shared top-5 weekly ranking list (mobile + desktop)
│   │   │   └── styles.ts               # Tailwind classNames for every file above (see Styling below)
│   │   ├── styles/                     # Cross-cutting style groups for components with no own folder
│   │   │   ├── shared.ts               #   Reusable fragments (surfaces, icon-circle button, pill tabs, form fields)
│   │   │   ├── modals.ts               #   AddFriendModal / NotificationsModal / FriendsListModal
│   │   │   ├── ranking.ts              #   GroupRanking / PodiumAvatar
│   │   │   ├── photo-viewer.ts         #   StoryViewer / PastDayModal
│   │   │   └── shell.ts                #   Dashboard.tsx sidebar/nav/top-bar/confirm-dialogs
│   │   ├── GroupRanking.tsx            # Podium + list ranking display (used by FeedTab)
│   │   ├── PodiumAvatar.tsx            # Single podium avatar (rank 1-3)
│   │   ├── StoryViewer.tsx             # Shared Instagram-style photo story overlay
│   │   ├── PastDayModal.tsx            # Modal for past day photos
│   │   ├── PhotoUpload.tsx             # Camera/upload component (+ PhotoUpload.styles.ts)
│   │   ├── AddFriendModal.tsx          # Add friend by email
│   │   ├── FriendsListModal.tsx        # Friends list + remove
│   │   ├── NotificationsModal.tsx      # Pending friend requests
│   │   ├── GymHistoryModal.tsx         # Own gym-photo history gallery (from ProfileTab)
│   │   ├── GymHistoryViewer.tsx        # Full-screen swipeable viewer for the above
│   │   ├── ServiceWorkerRegister.tsx   # PWA service worker (+ ServiceWorkerRegister.styles.ts)
│   │   └── ui/                         # shadcn/ui base components (Button, Card, Dialog, AlertDialog,
│   │                                   #   Tabs, Input, Textarea, Heading, Text)
│   ├── hooks/
│   │   ├── useWeekNavigation.ts        # Selected week state + prev/next/label derivation
│   │   ├── useDashboardStats.ts        # Week entries + ranking fetch/refresh
│   │   ├── useFriendRequests.ts        # Pending requests + friends fetch/refresh
│   │   ├── useProgressEntry.ts         # Today's progress entry fetch/upload/delete/save
│   │   ├── useProgressHistory.ts       # Last N days of progress entries fetch/refresh
│   │   └── useGymHistory.ts            # Last N days of own gym_entries fetch/refresh
│   ├── contexts/
│   │   └── AuthContext.tsx             # Supabase session auth state (see Auth Model below)
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase clients (browser session + service-role)
│   │   ├── supabase-server.ts          # Supabase server/SSR session client
│   │   ├── api-auth.ts                 # Shared API route auth helpers (see Auth Model)
│   │   ├── constants.ts                # STORAGE_BUCKET, PROGRESS_STORAGE_BUCKET, BODY_PARTS, etc.
│   │   ├── date.ts                     # Chile-timezone date/week helpers
│   │   ├── stats.ts                    # WEEKLY_GOAL, capDays, capped-total calculations
│   │   ├── image.ts                    # Client-side image compression
│   │   ├── progress.ts                 # Shared progress_entries row → ProgressEntry (signed URLs) mapper
│   │   └── utils.ts                    # cn() class-merge helper only
│   └── types/
│       └── index.ts                    # TypeScript types
├── public/
│   ├── manifest.json                   # PWA manifest
│   └── sw.js                           # Service worker
└── supabase/
    ├── schema.sql                      # Legacy schema (users/token table — superseded, see below)
    ├── friendships.sql                 # friendships table DDL
    └── progress_entries.sql            # progress_entries table DDL + private bucket instructions
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
-- Storage bucket: "gym-photos" (public — shared with friends via all-stats/day-stats/public-dashboard)

-- progress_entries: id, user_id (FK profiles), date (DATE),
--   back_photo_path / front_photo_path / arms_photo_path / legs_photo_path (all nullable),
--   note (TEXT, ≤300 chars), weight_kg (NUMERIC), created_at, updated_at
-- Constraint: UNIQUE(user_id, date) — one entry per user per day, same shape as gym_entries
-- Storage bucket: "progress-photos" (PRIVATE — see Progress Photos below)
-- See supabase/progress_entries.sql.
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
- `progress/*` routes are hard-auth only (`requireAuth()`), never `getOptionalUserId()` — there is no legitimate logged-out or friend view of progress photos. No friend-facing route (`all-stats`, `day-stats`, `public-dashboard`) may ever query `progress_entries`.

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
- Layout/container `className` strings don't live inline in JSX — they're extracted into a `styles.ts` (or co-located `ComponentName.styles.ts`), grouped per directory/visual-family (see the `dashboard/styles.ts` and `components/styles/*.ts` entries in Project Structure). Plain exported `const` strings for static classes; small exported functions using `cn()` for classes that depend on props/state. Genuinely-repeated fragments (surfaces, icon-circle buttons, pill tabs, form fields, rings) live in `components/styles/shared.ts` and get composed with `cn()` at each call site — check there before inlining a new "reusable-looking" class string.
- `Text`/`Heading` (`ui/text.tsx`/`ui/heading.tsx`) own color/size/weight — don't hand-roll `text-*`/`font-*` combos outside them except on the light-theme `AuthScreen` and white-on-photo overlays (`StoryViewer`/`PastDayModal`/`HomeTab` hero), which are deliberately excluded.

### API Routes
- Always authenticate via the `lib/api-auth.ts` helpers before any operation — see Auth Model above for which variant to use
- Use `getServiceSupabase()` (`lib/supabase.ts`, service role) for server-side DB access that should bypass RLS; use the session-scoped client (from `requireAuthClient()`/`createServerSupabaseClient()`) when a query should stay RLS-scoped to the current user
- Error responses are consistently `{ error: string }` with the corresponding HTTP status. Success responses are route-specific shapes (no uniform envelope) — check `src/types/index.ts` for the documented ones (`UploadResponse`, `UserStatsResponse`, `AllStatsResponse`, `CheckTodayResponse`) before inventing a new inline shape
- Compress images client-side before uploading (max ~1080px width) via `lib/image.ts`'s `compressImage()`

## Key Patterns

- **Photo upload**: Client compresses → POST to `/api/upload` with FormData → stored in Supabase Storage as `{user_id}/{date}.jpg` → upsert `gym_entries`
- **Check registration**: GET `/api/user-stats?token=` returns today's entry status
- **Ranking**: GET `/api/all-stats` returns all users sorted by `daysThisWeek`
- **Progress photos** (private, per-user only — see Auth Model): client compresses → POST to `/api/progress/photo` (FormData `{ part, photo }`) → stored in the **private** `progress-photos` bucket as `{user_id}/{date}/{part}.jpg` (`upsert: true`, no manual delete-then-upload needed since paths are deterministic) → upsert `progress_entries`. Photo columns store storage **paths**, never public URLs — every read re-signs each path (1h expiry) through `lib/progress.ts`: `toProgressEntry()` for single-day routes (`GET /api/progress`, `/api/progress/photo`, `/api/progress/details`), `toProgressEntries()` for the batch `GET /api/progress/history` (one `createSignedUrls()` call for the whole page, not N). Note/weight save separately via `POST /api/progress/details`.
- **Progress history gallery**: `ProgressTab` renders `ProgressHistoryGallery` (horizontal scroll strip, newest first, `BODY_PARTS` order drives both the upload tabs and this) filtered client-side to the selected body part from one `/api/progress/history` fetch (`useProgressHistory`) — tapping a thumbnail opens `ProgressHistoryViewer`, a full-screen swipeable viewer (touch delta + arrow buttons) showing that day's note/weight below the photo.
- **Gym photo history**: same gallery/viewer shape as above, but for `gym_entries` (public bucket, no signing needed) — opened from `HomeTab`'s "Historial de idas al gym" button (above the "Ranking Semanal" heading) as `GymHistoryModal` (a centered card, unlike Progreso's inline tab section) → `GymHistoryViewer`. The thumbnail-strip and full-screen-viewer chrome (`photoThumb*`/`historyViewer*` in `components/styles/shared.ts`) is shared between the progress and gym history UIs — reuse those before adding a new gallery/viewer style block.

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
