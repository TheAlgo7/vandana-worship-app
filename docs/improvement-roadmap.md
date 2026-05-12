# Vandana Improvement Roadmap

This file captures the app improvements discussed in Codex so future sessions can pick up the work without missing context.

## Priority 1: Highest Impact

- Add setlists so worship leaders can queue songs for a service. Status: implemented locally with browser storage.
- Add lyrics search, not only title and artist search. Status: implemented in the first search pass.
- Clean up lint/code health issues so future fixes are safer. Status: first pass complete, `npm run lint` passes.

## UX Polish

- Status: implemented in the first UX polish pass. Keep iterating from user/browser feedback.
- Make bottom tab transitions feel more native, ideally with a moving gold capsule indicator instead of resizing tabs independently.
- Add subtle loading states when switching pages, especially Favourites and song pages.
- Improve empty states for favourites, search no-results, offline mode, and Supabase fallback.
- Add a clear/manage affordance for recently viewed songs.
- Make song favourite state more discoverable instead of relying only on long press.
- Status: current mobile nav, loading states, empty states, clear recent action, and visible row actions are implemented locally.

## Worship Leader Flow

- Add setlists for worship sessions. Status: implemented locally with browser storage.
- Add next/previous song controls in Present Mode. Status: implemented for songs opened from the setlist queue.
- Add Present Mode controls that hide after inactivity. Status: implemented locally.
- Consider transpose/chord support later if chords are added.

## Search And Discovery

- Search lyrics in addition to song titles and artists. Status: implemented in the first search pass.
- Add filters for church, artist, language, favourites, and recently viewed. Status: church filter remains on Home; extra artist/language/library filters were removed from Home after UX review because they made the first screen too busy. Favourites and language are handled by dedicated app flows.
- Add fuzzy search so misspellings still find songs. Status: implemented locally.
- Add Popular and Newly Added sections. Needs reliable usage or added-date metadata before implementation.

## Offline And PWA

- Show a small offline indicator when cached or bundled songs are being used. Status: browser offline indicator and bundled/cached library fallback signal are implemented locally.
- Add an update-available toast when the service worker has a new version. Status: implemented locally for production service worker updates.
- Pre-cache key app routes and fallback song data more deliberately. Status: key app routes are precached locally.

## Visual Design

- Refine mobile spacing density, especially near the bottom nav.
- Add a subtle right-edge scroll fade for church filter chips.
- Keep the Sacred Noir identity, but watch for cramped rows and low-contrast secondary metadata.

## Code Health

- Exclude `Vandana Design System/` from ESLint or treat it as archived reference material. Status: complete.
- Move repeated inline styles into focused components or CSS modules over time.
- Clean up hydration/localStorage patterns in:
  - `src/components/AppTitle.tsx`
  - `src/components/BottomNav.tsx`
  - `src/components/DailyVerse.tsx`
  - `src/components/HomeContent.tsx`
  - `src/components/DesktopNav.tsx`
  - `src/contexts/FavouritesContext.tsx`
- Status: first pass complete for current lint blockers.
- Add Playwright smoke coverage for:
  - home page render
  - search
  - song open
  - favourite toggle
  - settings theme toggle
  - present mode
- Status: Playwright smoke coverage has been added locally for home, search, song open, favourite toggle, settings theme toggle, setlist, and present mode.

## Notes

- Current recommendation: start with setlists, lyrics search, and lint/code cleanup.
- Keep implementation incremental. Each feature should be verified in the running local app before pushing.
