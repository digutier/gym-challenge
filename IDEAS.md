# Gym Challenge - Feature Ideas

## Headline Features

### 1. Streak Counter + Streak Shields
- **Effort:** Medium | **Impact:** High
- Display each user's consecutive-week streak (weeks hitting the 4-day goal) on their ranking card and profile.
- Add a "streak shield" mechanic: one free shield per month that protects a streak if the user misses the goal one week.
- Show streak flames on avatars in the ranking.
- **Hint:** Compute from `gym_entries` grouped by ISO week. Add `shield_available` + `last_shield_month` columns to `profiles`. Display fire emoji + number in `GroupRanking.tsx`.

### 2. Reactions & Hype System
- **Effort:** Medium | **Impact:** High
- When viewing a friend's photo (story modal or past day modal), allow quick emoji reactions: fire, muscle, clap, laughing.
- Reactions appear as floating animations on the photo and are persisted.
- Photo owner sees a reaction count badge. On app open, show a toast if a friend reacted.
- **Hint:** Create a `reactions` table (id, entry_id, reactor_user_id, emoji, created_at). Add floating emoji animation with CSS keyframes. Query reactions in `day-stats` and `all-stats` API routes.

### 3. Monthly Recap + Photo Collage
- **Effort:** High | **Impact:** High
- End-of-month (or on-demand) recap card: total days trained, best streak, photo grid collage, rank position, and stat comparison ("trained 20% more than last month").
- Designed to be screenshot-friendly and shareable to Instagram Stories or WhatsApp.
- **Hint:** New `/recap` route + API endpoint for monthly entries. Use CSS Grid for the photo collage. Share via Web Share API (`navigator.share`).

### 4. Push Notification Reminders
- **Effort:** High | **Impact:** High
- Send a push notification at a configurable time (default: 6 PM Chile time) if the user hasn't uploaded their photo yet.
- Also notify when a friend uploads ("Diego just checked in at the gym").
- **Hint:** Extend existing service worker in `ServiceWorkerRegister.tsx`. Store subscriptions in a new `push_subscriptions` table. Use Supabase Edge Functions or a cron job to trigger at 6 PM using existing Chile timezone utilities.

---

## QoL Improvements

### 5. Pull-to-Refresh
- **Effort:** Low | **Impact:** Medium
- Pull-to-refresh gesture on the main dashboard to reload today's entry and weekly stats.
- **Hint:** Touch event listeners on the dashboard container (similar to swipe in `WeekProgress.tsx`). On pull past threshold, re-call `checkTodayEntry()` and re-fetch stats in `Dashboard.tsx`.

### 6. Celebration Animation on Upload
- **Effort:** Low | **Impact:** Medium
- On successful photo upload: confetti particles, bouncing avatar, and a message like "Dia 3 de 4 esta semana!" or "Meta semanal cumplida!" if goal hit. Lasts ~2 seconds then transitions to photo view.
- **Hint:** `CelebrationOverlay.tsx` with CSS-only confetti (multiple divs with randomized `animation-delay`). Trigger from `handlePhotoUpload` in `page.tsx` using `daysThisWeek` from the upload API response.

### 7. Weekly Goal Progress Ring
- **Effort:** Low | **Impact:** Medium
- Animated SVG circular progress ring replacing the "3/4" text counter. Color transitions white → yellow → green. Pulses when goal is reached.
- **Hint:** SVG circle with `stroke-dasharray` / `stroke-dashoffset`. Use `capDays()` value. Place in `WeekProgress.tsx` footer. Animate with CSS transitions.

### 8. Photo Thumbnails in Week Grid
- **Effort:** Low | **Impact:** Medium
- Show a tiny circular thumbnail of the uploaded photo inside each registered day circle in the week grid, instead of just a green check.
- **Hint:** `photo_url` is already returned in `weekEntries` from `user-stats` API. In `WeekProgress.tsx`, conditionally render `<img className="rounded-full object-cover" />` inside the day circle when `entry.registered && entry.photo_url`.

### 9. "Who's at the Gym Right Now?" Indicator
- **Effort:** Low | **Impact:** Medium
- Pulsing green dot on a friend's avatar in the ranking if they uploaded a photo within the last 2 hours. Shows relative time: "hace 45 min".
- **Hint:** `todayPhotoTimestamp` is already in `all-stats` response. In `GroupRanking.tsx`, compare against current time. Use `animate-ping` or existing `pulse-glow` keyframe.

### 10. Haptic Feedback on Key Actions
- **Effort:** Low | **Impact:** Low
- Subtle `navigator.vibrate()` on swipe completion, photo upload success, and story tap.
- **Hint:** Wrap in feature-detection check. ~10 lines across `WeekProgress.tsx`, `page.tsx`, and `GroupRanking.tsx`.

---

## Fun / Experimental

### 11. "Shame Timer" Countdown
- **Effort:** Low | **Impact:** Medium
- If it's past 8 PM Chile time and no photo uploaded, show a countdown timer to midnight: "Te quedan 3h 42m para no perder el dia." Turns red as midnight approaches.
- **Hint:** Use `getChileDate()` to check current hour. If >= 20 and no entry, render a `setInterval`-based countdown component.

### 12. Challenge of the Week Mini-Goals
- **Effort:** Low | **Impact:** Medium
- Each Monday, a fun bonus challenge auto-assigns (e.g. "Early Bird: Upload before 9 AM", "Perfect Week: Hit all 4 days before Friday"). Cosmetic only, no ranking impact.
- **Hint:** Static array of ~20 challenges, selected deterministically by ISO week number (modulo). Dismissible banner in `Dashboard.tsx`. No DB changes needed.

### 13. All-Time Heatmap Calendar
- **Effort:** Medium | **Impact:** Medium
- GitHub-style contribution heatmap showing all gym days across all months. Cells colored by presence (0 = gray, 1-2 = light green, 3-4 = dark green). Toggle between users.
- **Hint:** Data from `all-stats` already includes all entries. CSS Grid of 7 rows (days) x N columns (weeks). Use `getWeekStartForDate` utility for alignment. No external library needed.

---

## Recommended Implementation Order

1. **#6 Celebration Animation** — Highest ROI, zero backend, makes the daily core action feel rewarding
2. **#8 Photo Thumbnails in Week Grid** — ~30 min, data already flows through unused
3. **#1 Streak Counter** — Biggest motivational impact, data already exists in `gym_entries`
4. **#2 Reactions** — Gives users a reason to open the app on rest days
