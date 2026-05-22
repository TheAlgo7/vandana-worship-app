# Vandana Design System

> Worship in your language.
> Sacred Noir · Dark-first · Bilingual.

Vandana is a **cinematic, bilingual worship-lyrics PWA** built for the Hindi-speaking Christian community. Every song lives in two forms — **Hinglish** (Roman script) for the younger generation and **Hindi** (Devanagari) for those who grew up reading it that way. One tap to switch. Dark-first because worship happens in dim rooms; mobile-first because that's where it's used; offline-ready because worship shouldn't need WiFi.

Born out of ICM Church (Isus Christos Ministries) in New Delhi under Pastor Arul Thomas. Created by Gaurav Kumar (The Algothrim).

- **Live:** https://vandanaapp.vercel.app
- **Repo:** https://github.com/TheAlgo7/vandana-worship-app
- **Version:** v2.5.0 Public Beta · May 2026
- **Stack:** Next.js 16 · React 19 · Tailwind v4 · TypeScript · Supabase · PWA · Lucide

The system in one line: **three surfaces in deep blue-black, desaturated candlelight gold as the sole accent, Lora for display, Plus Jakarta Sans for body, Noto Sans Devanagari for Hindi — all routed through CSS variables so the theme toggle is instant.**

## What's in v2.5.0

The app has expanded since the design system was first written. The components and tokens below reflect the current shipped state.

- **Floating-pill Bottom Nav** — centered, blur-glass, active item expands from 48px → 112px to reveal a label. 5 items: Home · Updates · Setlist · Favourites · Settings.
- **Desktop Sidebar** — at `min-width: 900px`, a 220px sticky sidebar replaces the mobile pill. Same nav tokens (`--nav-fill-top` → `--nav-fill-bottom` gradient pill on active).
- **Setlist** — worship-leader playlist with present-in-order. Feature-gated by a Settings toggle.
- **Ministry pages** — `/ministry/[slug]` for ICM, Nations of Worship, Bridge Music, Yeshua Band, Sheldon Bangera, Anil Kant, and seven more. SEO-friendly.
- **Push notifications** — opt-in toggle in Settings for daily verse alerts.
- **About page** — full backstory + ICM acknowledgements + JSON-LD schema for AI assistants and search engines.
- **Lyrics repeat markers** — lines ending in `(x2)`, `x3`, `— 2` get rendered as a small gold pill at the end.
- **4-tier data fallback** — Supabase → fresh cache → stale cache → 35 bundled local songs.

---

- GitHub: `TheAlgo7/vandana-worship-app@main` — full Next.js app imported into `source/`
- `source/globals.css` — original design tokens (verbatim)
- `source/*.tsx` — all React components (HomeContent, SongCard, BottomNav, DailyVerse, SongView, PresentView, FavouritesContent, UpdatesContent, LanguageToggle, FontSizeControl, AppTitle, skeletons, providers)
- `assets/logo.svg` + `assets/logo-tagline.svg` — brand marks (gold wordmark)
- `source/layout.tsx` / `source/manifest.json` — font loading + PWA metadata

---

## Content Fundamentals

**Voice.** Warm, reverent, low-key. Feels like a hymnal, not a tech product. First-person plural where it's communal ("your worship", "keep your circle real" it is NOT — that's another project). Uses "you" directly when addressing the reader ("Tap the ♡ on any song to save it here"). No marketing speak, no emojis in the UI, no "!" punctuation.

**Casing.** Sentence case everywhere except:
- **Section labels** — ALL CAPS, widely tracked (`letter-spacing: 0.18em`): `APPEARANCE`, `DEFAULT LANGUAGE`, `VERSE OF THE DAY`, `CHORUS`, `VERSE 1`, `BRIDGE`.
- **Nav items and buttons** — Title Case: `Home`, `Favourites`, `Settings`, `Present`.
- **Song titles** — Title Case, preserved in both scripts.

**Bilingual by design.** Devanagari and Roman are peers. The header morphs based on the user's language preference:
- Hinglish: **Vandana** · tagline "Worship in your language"
- Hindi: **वंदना** · tagline "दिन का वचन" (verse of the day), etc.
Never a single-language fallback — both forms are authored, stored, and displayed first-class.

**Specific voice samples:**
- Tagline: *"Worship in your language"*
- Empty favourites: *"No favourites yet" / "Tap the ♡ on any song to save it here"*
- Empty search: *"No songs found for "…"" · "Clear filters"*
- About blurb: *"Vandana is a modern, minimal worship lyrics app for the Indian church. Every song is available in both Hinglish and Hindi, with a presentation mode for worship leaders and a dark theme for late-night prayer."*
- Subtitle-y line: *"वंदना — to worship, to praise"* (italic, muted)
- Footer: *"Made with ♥ by Gaurav — The Algothrim"*

**Emoji.** Essentially no emoji in UI copy. One exception: the songs-added pill in the Updates feed uses `🎵` (inherited, should be phased out). The heart uses the Lucide `Heart` icon or the glyph `♥` / `♡` depending on context — never the red emoji.

**Tone markers.** British spellings (*favourites*, *colour* — though the code is mixed). Devotional words are kept in their native form (*Hallelujah*, *Kadosh*, *Yeshu*, *vandana*, *masih*). The app never italicises English loans from Hindi — they just exist.

---

## Visual Foundations

### Palette — "Sacred Noir"
Three-tier dark surface system: `#0A0A0E` (base) → `#141418` (surface) → `#1E1E26` (elevated). Depth from stacked surfaces, **not borders**. Cards float naturally. Accent is a single desaturated gold — `#C4AA7E` on dark, `#7A6340` on light — warm like candlelight on old paper, never the "church website 2009" purple or blue. Semantic text is 3-tier too: `#ECEAE4` / `#87849A` / `#44424F`. **No other colors.** No red destructive, no green success; state is communicated through accent intensity and opacity. Two border tokens: `#242330` (visible) and `#1C1B26` (subtle).

### Typography
- **Display:** Lora — warm, calligraphic, devotional. Used for `h1`–`h3`, song titles, the brand wordmark. Weights 400/500/600/700; italic used sparingly (brand wordmark, verse-of-the-day body).
- **Body:** Plus Jakarta Sans — geometric sans with soft terminals. Weights 400/500/600. Legible at small sizes, especially at `11px` and `13px` where lesser fonts collapse.
- **Devanagari:** Noto Sans Devanagari — paired with increased line-height (`2.15`) because matras need room.
- **Brand (logo):** Cathez — custom hand-crafted OTF, shipped in `fonts/Cathez-0vAm4.otf` and loaded via `@font-face` in `colors_and_type.css`.
- **Scale:** 11 / 13 / 15 / 18 / 22 / 28 / 36 / 48 px — 8 steps, every step has a purpose.
- **Tracking:** -0.03em on large display (editorial density), 0.18em on section labels (`VERSE 1`, `CHORUS`).

### Backgrounds, imagery, decoration
- **Solid dark.** No gradients as primary backgrounds. One exception: a **very subtle radial gold glow** behind the home header and song title (`radial-gradient(circle, var(--accent) 0%, transparent 70%)` at `0.07`–`0.08` opacity). You feel it more than see it.
- **Top/bottom bars** use linear protective gradients (`rgba(8,8,10,0.85) → transparent`) only in present mode.
- **No hand-drawn illustrations.** No patterns. No grain overlays. No textures.
- **No imagery in the core UI** — album art is deliberately absent (respect for the lyrics as content). Custom brand icons (PNG/SVG) only.
- A tiny **4-pointed star SVG** (gold stroke, 14×14, 0.3 opacity) sits above song titles on the lyrics page as a devotional flourish.

### Animation & motion
- **Easing everywhere:** `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint) for entries; `ease` for transitions.
- **Durations:** 100ms press feedback · 200ms base transition · 350ms theme flash.
- **Keyframes:** `fadeIn` (opacity), `fadeUp` (8px rise + fade), `shimmer` (skeleton), `themeFlash` (full-screen 0.38→0 overlay on theme swap).
- **No bounces, no springs.** Nothing elastic. Nothing playful.
- Staggered card entrance on Home (fadeUp); route transitions use a 220ms fade.

### Interaction states
- **Hover (desktop):** border/color shifts to accent; no scale.
- **Active / press:** `transform: scale(0.97)` via global `button:active, a:active` rule. 100ms. Cards add a neumorphic inset press shadow on `:active`: `inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.03)` + `border-radius` morphs to `--radius-md`.
- **Focus:** `2px solid var(--accent)` outline with 2px offset — always visible for keyboard users.
- **Active-selected (pills, toggles):** solid accent background + `bg-base` text + **gold glow shadow** `0 2px 8px var(--accent-glow)`.

### Borders, shadows, depth
- **Borders** are mostly *implied* by surface contrast (3-tier). When present: 1px, either `--border` or `--border-subtle`.
- **Outer shadow:** `0 4px 24px rgba(0,0,0,0.4)` dark / `0.08` light. Used on floating elements (toasts).
- **Inner shadow:** Used on search input (`inset 0 1px 3px rgba(0,0,0,0.4)`) and on pressed cards. Creates that "recessed panel" feel.
- **Neumorphic panel:** Controls toolbar on the lyrics page — `--bg-surface` + inner highlight `0 1px 0 rgba(255,255,255,0.04) inset` + soft drop shadow.

### Transparency & blur
Used sparingly, two places:
1. **Bottom nav** — `rgba(14,14,18,0.92)` + `backdrop-filter: blur(24px) saturate(180%)`. Content scrolls beneath without competing.
2. **Present mode controls** — `rgba(8,8,10,0.85)` protective gradients that fade to transparent (not capsules — gradients).

Everything else is opaque.

### Corner radii
- `8px` — skeleton blocks, small inputs
- `12px` — cards, inputs (default)
- `16px` — neumorphic panels, update cards
- `24px` — (reserved, not heavily used)
- `999px` (pill) — **every button, toggle, chip, search input**. The pill is the default shape of interaction. If it's tappable, it's pilled.

### Cards
- Background `--bg-surface` on a `--bg-base` page. No border needed (surface contrast does the work).
- Radius `12px` (`--radius-md`) default; `16px` (`--radius-lg`) for denser content (updates, controls toolbar).
- **Song rows are not cards** — they're flat 76px list items separated by `border-bottom: 1px solid --border-subtle` with a 3×28px accent pill on the left (opacity 0.45) and a chevron on the right.
- No drop shadow on cards in rest state. Shadow only emerges on press (inset) or for truly floating elements.

### Layout rules
- **Mobile-first 375px.** `max-width: 40rem` (640px) centered container on everything above `page`. Desktop is "projection only."
- **Fixed bottom nav** 56px + safe-area-inset — every screen has it (4-item: Home · Updates · Favourites · Settings).
- **Search input** is always 52px tall, pill-radius, with inset shadow + left-inset search icon at 34px.
- **Song card rows** 76px. Thumb-friendly, not scroll-wasteful.
- **Padding:** `20px` horizontal on all content containers. `16px` on denser components. `24px` on spacious states (empty states, about).

### Imagery vibe (when images appear)
- Warm, candle-lit, never clinical.
- Never stock photos. Never office/workplace imagery.
- OG image is the only imagery shipping — 1200×630, brand mark centered, dark background, gold wordmark.

---

## Iconography

The app uses **Lucide** (`lucide-react@1.7.0`) for all UI icons — 24px default, `strokeWidth: 2`. Active state is communicated by switching `fill` from `"none"` to `"var(--accent)"`. No icon is ever emoji.

Icons in use:
- **Nav:** `House`, `Bell`, `Heart`, `Settings`
- **Actions:** `Search` (aliased as `MagnifyingGlass`), `ChevronRight`, `ChevronLeft`, `Share2`, `Play`, `Pause`, `SearchX`, `HeartOff`
- **Brand:** a custom 4-pointed **star** SVG (authored inline, gold stroke, 0.3 opacity) above song titles — a devotional flourish.

**Unicode characters as icons:** ✕ (exit), ♥ ♡ (hearts in copy), › (list bullet in Updates). These are preferred over emoji when a heavier, non-color glyph is needed.

**Emoji:** essentially banned in the UI. One legacy: `🎵` on the Updates "songs added" pill — should be replaced with a Lucide `Music` icon in a future pass.

Vandana serves icons from **CDN** (Lucide React, tree-shaken by the Next.js compiler). No local icon sprite. The design system recreates Lucide via the CDN build `https://unpkg.com/lucide-static@latest/icons/<name>.svg` or uses `<i data-lucide="name">` with the Lucide CDN script.

**Logos & brand marks:**
- `assets/logo.svg` — the "Vandana" wordmark in gold (2000×2000 viewBox, pure SVG).
- `assets/logo-tagline.svg` — the wordmark plus "Worship in your language" tagline, sized for README / OG card.

---

## Index

Root of this design system:

| File | Purpose |
|------|---------|
| `README.md` | This document. |
| `colors_and_type.css` | CSS variables: colors, type, spacing, radii, shadows, transitions. **Import this into any Vandana artifact.** |
| `SKILL.md` | Claude Code skill manifest. |
| `assets/` | SVG brand marks. |
| `source/` | Original Next.js codebase imported verbatim — read for ground truth. |
| `preview/` | Design-system preview cards (colors, type, spacing, components, brand). |
| `ui_kits/app/` | High-fidelity recreation of the Vandana PWA: Home, Song, Present, Settings screens + reusable components. |

The one product is **the Vandana PWA**. There's no marketing site (`vandanaapp.vercel.app` *is* the app). A single UI kit covers it end-to-end.

---

## Caveats / known substitutions

- PNG icons (`favicon-32`, `icon-192`, `icon-512`, `apple-touch-icon`, `og-image`) are referenced by `manifest.json` but not present in the repo's `public/`. The SVG logos in `assets/` are the source of truth — PNGs would need to be regenerated.
- The `src/data/songs/` JSON and `src/data/verses.json` are not mirrored here — read them in the repo or fetch via GitHub if you need the corpus.
