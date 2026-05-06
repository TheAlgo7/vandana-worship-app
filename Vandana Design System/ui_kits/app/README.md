# Vandana App — UI Kit

A faithful recreation of the Vandana worship app UI: a dark-first, bilingual Hindi · Hinglish PWA for worship lyrics. This kit covers the five screens that make up the product and the reusable components they compose from.

## Contents

```
ui_kits/app/
  index.html         — Interactive click-thru prototype (phone frame)
  primitives.jsx     — Icon set (Lucide-style), Star flourish, sample data
  components.jsx     — SongCard, DailyVerse, BottomNav, SearchBar, filters, toggles
  screens.jsx        — HomeScreen, SongScreen, PresentScreen, Settings, Favourites, Updates
  AppShell.jsx       — Root component wiring screens + navigation + state
  ios-frame.jsx      — (unused) iOS starter, kept available if you prefer it
```

The kit uses `../../colors_and_type.css` at the project root for all tokens.

## How to view
Open `index.html`. It renders a 390×790 phone with the app inside:

1. Home → tap any song.
2. Song view → switch Hindi ↔ Hinglish with the toggle, change lyric size, or tap **Present**.
3. Present mode → full-screen block-by-block lyrics, with prev / next.
4. Long-press any song in the list to favourite it; the `♡ Saved` toast appears.
5. Bottom tabs: Home, Updates, Favourites, Settings.

## Component map

| Component         | File             | Where it appears                |
|-------------------|------------------|---------------------------------|
| `AppTitle`        | components.jsx   | Home header — "Vandana वंदना Worship" |
| `SearchBar`       | components.jsx   | Home                            |
| `ChurchFilter`    | components.jsx   | Home — "All / FOLJ / ICM / …"   |
| `SongCard`        | components.jsx   | Home list rows, Favourites      |
| `DailyVerse`      | components.jsx   | Home, just below the title      |
| `LanguageToggle`  | components.jsx   | Song view, Present, Settings    |
| `FontSizeControl` | components.jsx   | Song view controls row          |
| `BottomNav`       | components.jsx   | Persistent — hides in Present   |
| `HomeScreen`      | screens.jsx      | Tab 1                           |
| `SongScreen`      | screens.jsx      | `/song/[id]`                    |
| `PresentScreen`   | screens.jsx      | `/present/[id]` — overlay       |
| `FavouritesScreen`| screens.jsx      | Tab 3                           |
| `UpdatesScreen`   | screens.jsx      | Tab 2                           |
| `SettingsScreen`  | screens.jsx      | Tab 4                           |

## Source of truth
Components follow the real source in the worship app repo:
- `source/HomeContent.tsx`
- `source/SongCard.tsx`
- `source/DailyVerse.tsx`
- `source/BottomNav.tsx`
- `source/song/[id]/SongView.tsx`
- `source/settings/page.tsx`

Copy is lifted from real `songs/*.json` (see `primitives.jsx` → `SAMPLE_SONGS`).

## Things the kit fakes
- No localStorage, no PWA manifest, no service-worker registration.
- Pull-to-refresh gesture is omitted in the prototype.
- Share sheet is reduced to a "Link copied" toast.
- Updates list is stubbed (3 entries) and does not persist read state.
