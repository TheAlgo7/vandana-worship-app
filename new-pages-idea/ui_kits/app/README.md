# Vandana App — UI Kit (v2.5.0)

A faithful recreation of the Vandana worship app UI: a dark-first, bilingual Hindi · Hinglish PWA for worship lyrics. Updated for v2.5.0 — 5-tab floating-pill nav, Setlist, About, Ministry pages, push notification toggle, lyrics repeat markers.

## Contents

```
ui_kits/app/
  index.html         — Interactive click-thru prototype (phone frame)
  primitives.jsx     — Icon set (Lucide-style), Star flourish, sample data, ministry list
  components.jsx     — Floating-pill BottomNav · DesktopSidebar · SongCard (fav + setlist) · LyricsBlock · NotificationToggle
  screens.jsx        — Home · Song · Present · Setlist · Favourites · Updates · Settings · About · Ministry
  AppShell.jsx       — Root wiring (state, routing, setlist toggle)
```

The kit uses `../../colors_and_type.css` at the project root for all tokens.

## How to view
Open `index.html`. It renders a 390×790 phone with the app inside:

1. **Home** — tap any song, long-press to favourite, tap the `♡` and `+` buttons inline to favourite/add to setlist.
2. **Song view** — switch Hindi ↔ Hinglish, change font size, **add to setlist**, or tap **Present**.
3. **Present mode** — block-by-block lyrics, prev/next, live language toggle.
4. **Setlist tab** — see your queue, tap **Present setlist** to start with the first song.
5. **Favourites tab** — long-press a song to add it; saved songs appear here.
6. **Settings** — toggle the Setlist feature, push notifications, default language, open About.
7. **About** — full backstory with ministry chips.

## Component map

| Component         | File             | Notes                                       |
|-------------------|------------------|---------------------------------------------|
| `BottomNav`       | components.jsx   | Floating pill, blur-glass, 5 items, expanding active |
| `DesktopSidebar`  | components.jsx   | 220px sticky sidebar for ≥900px viewports   |
| `SongCard`        | components.jsx   | Inline fav + setlist buttons, long-press fav |
| `LyricsBlock`     | components.jsx   | Lines with `(x2)` etc. render gold pill marker |
| `NotificationToggle` | components.jsx | Toggle + status label + Test button         |
| `DailyVerse`      | components.jsx   | Home, just below the title                  |
| `LanguageToggle`  | components.jsx   | Song / Present / Settings                   |
| `FontSizeControl` | components.jsx   | Song view controls row                      |
| `HomeScreen`      | screens.jsx      | Tab 1                                       |
| `SongScreen`      | screens.jsx      | `/song/[id]` — w/ setlist toggle in top bar |
| `PresentScreen`   | screens.jsx      | `/present/[id]` — fullscreen overlay        |
| `SetlistScreen`   | screens.jsx      | `/setlist` — present-in-order playlist      |
| `FavouritesScreen`| screens.jsx      | `/favourites`                               |
| `UpdatesScreen`   | screens.jsx      | `/updates`                                  |
| `SettingsScreen`  | screens.jsx      | Setlist feature toggle, notifications, theme |
| `AboutScreen`     | screens.jsx      | `/about` — ministries chips, backstory      |
| `MinistryScreen`  | screens.jsx      | `/ministry/[slug]` — filter by ministry     |

## Source of truth
Components follow the latest live source — refresh by browsing the locally mounted `Vandana Worship App/` folder.

## What the kit fakes
- No Supabase, no localStorage, no PWA manifest, no service worker.
- Pull-to-refresh gesture omitted.
- Share sheet collapsed to a "Link copied" toast.
- Push notifications are visual-only (state in component, no permission flow).
- Sample library is 10 songs vs. 80+ live; representative across ICM / FOLJ / Nations / Bridge / Anil Kant / Sheldon Bangera / Yeshua Band.
