<div align="center">

<img src="public/icons/logo-tagline.svg" alt="Vandana — Worship in your language" width="260" />

<br /><br />

<p>
  <a href="https://vandanaapp.vercel.app">
    <img src="https://img.shields.io/badge/Live-vandanaapp.vercel.app-C4AA7E?style=flat-square&logo=vercel&logoColor=C4AA7E&labelColor=0a0a0e&color=C4AA7E" alt="Live" />
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/v2.0.0-0a0a0e?style=flat-square&labelColor=0a0a0e&color=C4AA7E" alt="Version 2.0.0" />
  &nbsp;
  <img src="https://img.shields.io/badge/Next.js_16-0a0a0e?style=flat-square&logo=nextdotjs&logoColor=white&labelColor=0a0a0e&color=141418" alt="Next.js 16" />
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-0a0a0e?style=flat-square&logo=typescript&logoColor=3178C6&labelColor=0a0a0e&color=141418" alt="TypeScript" />
  &nbsp;
  <img src="https://img.shields.io/badge/PWA-0a0a0e?style=flat-square&logo=pwa&logoColor=5A0FC8&labelColor=0a0a0e&color=141418" alt="PWA" />
  &nbsp;
  <img src="https://img.shields.io/badge/Supabase-0a0a0e?style=flat-square&logo=supabase&logoColor=3FCF8E&labelColor=0a0a0e&color=141418" alt="Supabase" />
</p>

<p>
  <strong>A cinematic, bilingual worship lyrics app for the Indian church.</strong><br />
  Hindi · Hinglish · Dark-first · Present Mode · Offline-ready
</p>

</div>

---

Vandana exists because the Indian church deserved better than a mobile website with bad fonts and missing songs. Every lyric lives in two forms — **Hinglish** (Roman script) and **Hindi** (Devanagari) — one tap to switch, zero friction. The UI is dark-first because worship happens in dim rooms. It installs like an app because it is one.

Born out of **ICM Church (Isus Christos Ministries)** in New Delhi. Built by **Gaurav Kumar** (The Algothrim).

---

## Features

- **Bilingual lyrics** — Hinglish and Hindi authored, stored, and rendered as first-class peers. Switch per song.
- **Present Mode** — fullscreen lyric projection with auto-scroll, designed for worship leaders.
- **Favourites + recently viewed** — persisted locally, surfaced immediately on the home screen.
- **Daily verse** — a living home screen with a fresh Bible verse on every visit.
- **Offline-ready PWA** — installs to home screen, works without WiFi after first load.
- **Desktop layout** — sticky sidebar nav at ≥900px. Mobile pill nav below. Same codebase, both surfaces.
- **Resilient data layer** — 4-tier fallback: Supabase → fresh cache → stale cache → bundled songs. Survives free-tier pauses.
- **Sacred Noir design system** — dark surfaces, desaturated gold accent, Lora display type. WCAG AA compliant.

---

## Getting Started

```bash
git clone https://github.com/TheAlgo7/vandana-worship-app.git
cd vandana-worship-app
npm install
```

Create a `.env.local` from the example and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
CRON_SECRET=your_cron_secret
```

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # lint check
```

> The app ships with 35 bundled fallback songs. Point `NEXT_PUBLIC_SUPABASE_URL` at a Supabase instance with the `songs` table for the full library.

---

## Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Database | Supabase (PostgreSQL) |
| Fonts | Lora · Plus Jakarta Sans · Noto Sans Devanagari · Cathez |
| Icons | Lucide React |
| Deployment | Vercel |
| PWA | Custom service worker, Web App Manifest |

---

## Design Language

**Sacred Noir.** Three-tier dark surface system — `#0A0A0E` base, `#141418` surface, `#1E1E26` elevated. A single desaturated gold accent (`#C4AA7E`) carries all interactive weight: buttons, active states, section labels, the wordmark. No other hues. Depth comes from stacked surfaces, not decorative borders.

Typography is the interface. **Lora** (calligraphic, devotional) carries all headings and song titles. **Plus Jakarta Sans** carries all body copy. **Noto Sans Devanagari** pairs with increased line-height (2.15) to give Devanagari matras room to breathe. **Cathez** renders the brand wordmark — an OTF crafted specifically for the project.

The floating pill nav on mobile, the sticky sidebar on desktop, and the fullscreen Present Mode are three distinct reading surfaces — each respects the Sacred Noir palette without alteration.

---

## Project Structure

```text
vandana-worship-app/
├── public/
│   └── icons/               # PWA icons, OG image, brand SVGs
├── src/
│   ├── app/
│   │   ├── page.tsx          # Home — song list + daily verse
│   │   ├── song/[id]/        # Lyrics view with language toggle
│   │   ├── present/[id]/     # Fullscreen projection mode
│   │   ├── favourites/       # Saved songs
│   │   ├── updates/          # App changelog feed
│   │   ├── settings/         # Theme, language, about
│   │   ├── api/ping/         # Supabase keep-alive cron endpoint
│   │   ├── globals.css       # Design tokens + global styles
│   │   └── layout.tsx        # Root layout + desktop shell
│   ├── components/
│   │   ├── BottomNav.tsx     # Mobile floating pill nav
│   │   ├── DesktopNav.tsx    # Desktop sticky sidebar
│   │   ├── HomeContent.tsx   # Song list, search, church filter
│   │   ├── SongCard.tsx      # Song list row
│   │   ├── DailyVerse.tsx    # Daily Bible verse card
│   │   └── ...
│   ├── contexts/
│   │   └── FavouritesContext.tsx
│   ├── data/
│   │   ├── songs/            # JSON song library (fallback corpus)
│   │   └── verses.json       # Bible verse pool
│   └── lib/
│       ├── getSongs.ts       # Supabase + 4-tier fallback data layer
│       └── formatLyrics.ts   # Lyric block formatter
├── vercel.json               # Cron job: /api/ping every 5 days
└── package.json
```

---

## Changelog Highlights

| Version | What changed |
| ------- | ------------ |
| **v2.0.0** | Desktop sidebar layout · Floating pill nav (2026) · Supabase resilience + keep-alive · WCAG AA accessibility audit · Nav pill light-mode tokens |
| **v1.9.1** | App-wide review: skeletons, error pages, swipe bug · Lucide icon migration complete · Settings polish |
| **v1.0.0** | Sacred Noir design system · Supabase migration · Present Mode · Favourites · PWA foundation |

---

<div align="center">

Made with ♥ by **[Gaurav — The Algothrim](https://thealgothrim.com)**

</div>
