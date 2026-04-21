<div align="center">
  <img src="public/icons/logo-tagline.svg" alt="Vandana" width="280" />

# Vandana

### *Worship in your language.*

**A bilingual worship lyrics PWA for Hindi-speaking Christian communities — reverent, readable, and built for phones first.**

<p>
  <a href="https://vandanaapp.vercel.app"><img src="https://img.shields.io/badge/Live-vandanaapp.vercel.app-0a0a0e?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-0a0a0e?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=000" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind v4" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
</p>

*Vandana was built from a simple conviction: the Indian church deserves a worship app that feels modern, beautiful, and genuinely usable. Songs live in both **Hindi** and **Hinglish**, the UI respects low-light church environments, and the whole experience works like an app instead of a clumsy mobile website.*

</div>

---

## Overview

Vandana is designed for actual worship use, not generic content browsing. The reading experience, typography, theme system, Present Mode, and bilingual lyrics model all exist because this product is meant to serve real people in real church settings.

Born out of **ICM Church (Isus Christos Ministries)** under **Pastor Arul Thomas**, Vandana is part digital hymnal, part PWA, and part devotional utility.

## Core Features

- **Hindi and Hinglish lyrics** stored side by side from the data layer up.
- **Searchable worship library** with clean song cards and fast navigation.
- **Present Mode** for fullscreen lyric projection with auto-scroll support.
- **Favorites and recently viewed** for repeat use during services or personal devotion.
- **Daily verse support** for a more alive and devotional home screen.
- **Installable PWA** that works offline after first load.

## Quick Start

```bash
git clone https://github.com/TheAlgo7/vandana-worship-app.git
cd vandana-worship-app
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
npm run build
npm run start
npm run lint
```

## Project Structure

```text
vandana/
├── public/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── favourites/
│   │   ├── settings/
│   │   ├── song/[id]/
│   │   └── present/[id]/
│   ├── components/
│   ├── contexts/
│   ├── data/
│   │   ├── songs/
│   │   └── verses.json
│   └── lib/
├── next.config.ts
└── package.json
```

## Content Model

Songs live in `src/data/songs/` as JSON. Each entry keeps the content bilingual, structured, and ready for static generation.

That means expanding the library is simple: add a song file, keep the shape consistent, and the app can render it cleanly across reading mode and Present Mode.

## Design Language

- **Sacred Noir.** Dark-first with restrained gold accents and reverent pacing.
- **Typography is the interface.** Lora, Plus Jakarta Sans, and Noto Sans Devanagari carry most of the emotional weight.
- **Phone-native interaction.** Bottom navigation, fast transitions, and touch-first reading.
- **No clutter.** No ad-like noise, no visual chaos, no generic worship-app feel.

<div align="center">

Built to make worship feel **beautiful, bilingual, and effortless**.

</div>
