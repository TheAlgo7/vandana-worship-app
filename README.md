<div align="center">

<img src="public/icons/logo-tagline.svg" alt="Vandana — Worship in your language" width="260" />

<br /><br />

[![Live](https://img.shields.io/badge/Live-vandanaapp.vercel.app-C4AA7E?style=flat-square&labelColor=111111)](https://vandanaapp.vercel.app)
[![Version](https://img.shields.io/badge/Version-2.0.0-C4AA7E?style=flat-square&labelColor=111111)](https://github.com/TheAlgo7/vandana-worship-app)
[![Next.js](https://img.shields.io/badge/Next.js-16-C4AA7E?style=flat-square&logo=nextdotjs&logoColor=white&labelColor=111111)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-C4AA7E?style=flat-square&logo=typescript&logoColor=white&labelColor=111111)](https://www.typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-Installable-C4AA7E?style=flat-square&labelColor=111111)](https://vandanaapp.vercel.app)
[![Supabase](https://img.shields.io/badge/Supabase-C4AA7E?style=flat-square&logo=supabase&logoColor=white&labelColor=111111)](https://supabase.com)

</div>

<p align="center">
  <img src="./docs/assets/hero.png" width="400" alt="Vandana Worship App" />
</p>

Vandana exists because the Indian church deserved better than a mobile website with bad fonts and missing songs. Every lyric lives in two forms — **Hinglish** (Roman script) and **Hindi** (Devanagari) — one tap to switch, zero friction. The UI is dark-first because worship happens in dim rooms. It installs like an app because it is one. Born out of ICM Church (Isus Christos Ministries) in New Delhi, built by **Gaurav Kumar — The Algothrim**.

## Features

- **Bilingual lyrics** — Hinglish and Hindi authored, stored, and rendered as first-class peers. Switch per song.
- **Present Mode** — fullscreen lyric projection with auto-scroll, designed for worship leaders.
- **Favourites + recently viewed** — persisted locally, surfaced immediately on the home screen.
- **Daily verse** — a living home screen with a fresh Bible verse on every visit.
- **Offline-ready PWA** — installs to home screen, works without WiFi after first load.
- **Desktop layout** — sticky sidebar nav at ≥900px. Mobile pill nav below. Same codebase, both surfaces.
- **Resilient data layer** — 4-tier fallback: Supabase → fresh cache → stale cache → bundled songs. Survives free-tier pauses.
- **Sacred Noir design system** — dark surfaces, desaturated gold accent, Lora display type. WCAG AA compliant.

## Install to Home Screen

**Android (Chrome):**
1. Open [vandanaapp.vercel.app](https://vandanaapp.vercel.app) in Chrome
2. Tap the **⋮** menu → **Add to Home screen**
3. Tap **Add** — Vandana installs like a native app

**iOS (Safari):**
1. Open [vandanaapp.vercel.app](https://vandanaapp.vercel.app) in Safari
2. Tap the **Share** button → **Add to Home Screen**
3. Tap **Add** — the app appears on your home screen

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Database | Supabase (PostgreSQL) |
| Fonts | Lora · Plus Jakarta Sans · Noto Sans Devanagari · Cathez |
| Icons | Lucide React |
| Deployment | Vercel |
| PWA | Custom service worker, Web App Manifest |

## Design Language

**Sacred Noir.** Three-tier dark surface system — `#0A0A0E` base, `#141418` surface, `#1E1E26` elevated. A single desaturated gold accent (`#C4AA7E`) carries all interactive weight. No other hues. Typography is the interface — **Lora** for headings and song titles, **Plus Jakarta Sans** for body, **Noto Sans Devanagari** with increased line-height (2.15) for Devanagari matras to breathe.

<details>
<summary>Quick Start</summary>

```bash
git clone https://github.com/TheAlgo7/vandana-worship-app.git
cd vandana-worship-app
npm install
```

Create `.env.local` from the example:

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
npm run build
npm run lint
```

> The app ships with 35 bundled fallback songs. Point `NEXT_PUBLIC_SUPABASE_URL` at a Supabase instance with the `songs` table for the full library.

</details>

<div align="center">

Made with love by **[Gaurav — The Algothrim](https://thealgothrim.com)**

</div>
