<p align="center">
  <img src="public/icons/logo-tagline.svg" alt="Vandana — Worship in your language" width="280" />
</p>

<p align="center">
  A cinematic, bilingual worship lyrics app built for the Hindi-speaking Christian community.<br/>
  Dark-first, mobile-first, offline-ready — because worship shouldn't need WiFi.
</p>

Every song lives in two forms: **Hinglish** (Roman script) for the younger generation and **Hindi** (Devanagari) for those who grew up reading it that way. One tap to switch. No friction. Just worship.

<p>
  <a href="https://vandanaapp.vercel.app"><img src="https://img.shields.io/badge/▶_Live_Demo-000?style=for-the-badge&logo=vercel&logoColor=white" /></a>
  <img src="https://img.shields.io/badge/Next.js_16-000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=000" />
  <img src="https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" />
  <a href="https://github.com/TheAlgo7/vandana-worship-app"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" /></a>
</p>

---

## ✿ What This Is

**Vandana** is a Progressive Web App for worship song lyrics — designed with the same care you'd put into a hymnal, but built for phones. It's statically generated, loads instantly, works offline, and respects both the beauty of Devanagari script and the accessibility of Roman transliteration.

The idea came during a moment of prayer — a simple thought that the Indian church deserved a modern, beautiful way to access worship lyrics. Born out of **ICM Church** (Isus Christos Ministries) under **Pastor Arul Thomas**, Vandana fills a gap no existing app covered: readable fonts, dark/light themes, and seamless Hindi–Hinglish switching in one place.

---

## 🌍 Live Demo

👉 **[vandanaapp.vercel.app](https://vandanaapp.vercel.app)**

Install it on your phone — tap **Share → Add to Home Screen** (iOS) or the install banner (Android). It works offline.

---

## 🗂️ Project Structure

```
vandana/
├── public/
│   └── manifest.json               # PWA manifest
├── src/
│   ├── app/
│   │   ├── globals.css              # Sacred Noir design tokens & theme variables
│   │   ├── layout.tsx               # Root layout (fonts, theme, meta)
│   │   ├── loading.tsx              # Global loading state
│   │   ├── error.tsx                # Error boundary
│   │   ├── page.tsx                 # Home — song list with search
│   │   ├── favourites/
│   │   │   ├── page.tsx             # Favourites page (SSG shell)
│   │   │   └── FavouritesContent.tsx # Client: favourited song list
│   │   ├── settings/
│   │   │   └── page.tsx             # Settings — theme, language, about
│   │   ├── song/
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # SSG song page
│   │   │       ├── loading.tsx      # Song page skeleton
│   │   │       ├── not-found.tsx    # 404 for invalid song IDs
│   │   │       └── SongView.tsx     # Client: lyrics, font size, language, share
│   │   └── present/
│   │       └── [id]/
│   │           ├── page.tsx         # SSG present page
│   │           └── PresentView.tsx  # Client: fullscreen auto-scroll
│   ├── components/
│   │   ├── AppTitle.tsx             # Dynamic app title (language-aware)
│   │   ├── BottomNav.tsx            # Glass-effect bottom navigation
│   │   ├── DailyVerse.tsx           # Daily Bible verse hero card
│   │   ├── FontSizeControl.tsx      # A−/Aa/A+ font scaling
│   │   ├── HomeContent.tsx          # Song list + search + recently viewed
│   │   ├── LanguageToggle.tsx       # Pill segmented Hinglish ↔ Hindi
│   │   ├── Providers.tsx            # ThemeProvider wrapper
│   │   ├── RouteTransition.tsx      # Page transition animations
│   │   ├── ServiceWorkerRegistration.tsx # SW registration for PWA
│   │   ├── SongCard.tsx             # 72px song list row with heart toggle
│   │   └── SongCardSkeleton.tsx     # Song card loading skeleton
│   ├── contexts/
│   │   └── FavouritesContext.tsx     # Favourites state (localStorage-backed)
│   ├── data/
│   │   ├── songs/                   # 34 worship song JSON files
│   │   └── verses.json             # Daily Bible verses (Hindi + English)
│   └── lib/
│       ├── formatLyrics.ts          # Lyrics parsing & verse formatting
│       └── getSongs.ts              # File-system song loader
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.2 (App Router, Turbopack) |
| UI | React 19.2.4 |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Language | TypeScript 5 |
| Theming | next-themes 0.4.6 (dark/light, `data-theme`) |
| Animations | CSS @keyframes (fadeUp, shimmer, pulse) |
| PWA | Web App Manifest + Service Worker |
| Fonts | Lora · Plus Jakarta Sans · Noto Sans Devanagari |
| Deployment | Vercel (SSG + Edge) |

---

## 🎨 Design Philosophy — Sacred Noir

- **Dark-first** — worship happens in dim rooms. The dark theme (`#0A0A0E` base) isn't an afterthought, it's the default. Light mode (`#F4F0E8`) is the override.
- **Desaturated gold accent** — `#C4AA7E` — warm but restrained, like candlelight on old paper.
- **Typography is the UI** — lyrics are the content. Lora for display headings, Plus Jakarta Sans for body, Noto Sans Devanagari for Hindi. Every font chosen with intent.
- **Zero-distraction reading** — no ads, no popups, no tracking. Just words on screen.
- **Church-native** — features like Present Mode exist because someone actually projects lyrics from a phone. This isn't a generic app with a worship skin.
- **Bilingual by design** — Hinglish and Hindi aren't a toggle bolted on. The data model stores both from day one.

---

## 🧩 Core Features

### 🎵 Worship Experience

| Feature | Description |
|---------|------------|
| Song Lyrics | Full lyrics with verse structure and chorus markers |
| Language Toggle | Switch between Hinglish (Roman) and Hindi (Devanagari) instantly |
| Font Size Control | Adjustable text size — persisted across sessions |
| Present Mode | Fullscreen, auto-scrolling lyrics for projection |
| Share Song | Native share sheet to share songs with others |
| Pull-to-Refresh | Swipe down to refresh the song list |

### 🔍 Discovery

| Feature | Description |
|---------|------------|
| Instant Search | Filter songs by title as you type |
| Recently Viewed | Quick access to songs you just visited |
| Daily Bible Verse | Rotating verse card on the home screen (Hindi + English) |
| 34 Songs | Growing library of Hindi/Hinglish worship songs |

### ❤️ Personal

| Feature | Description |
|---------|------------|
| Favourites | Heart-toggle on any song — saved locally |
| Favourites Page | Dedicated page for all your favourited songs |
| Empty States | Friendly messages when lists are empty |

### ⚙️ System

| Feature | Description |
|---------|------------|
| Dark / Light Theme | System-aware with manual override |
| Settings Page | Theme toggle, default language, about section |
| PWA Install | Add to home screen, works offline |
| Haptic Feedback | Subtle vibration on key interactions |
| Static Generation | Every song page pre-rendered at build time |

---

## 📱 Install as App

Vandana is a **Progressive Web App**. Install it like a native app:

### iOS (Safari)
1. Open [vandanaapp.vercel.app](https://vandanaapp.vercel.app)
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**

### Android (Chrome)
1. Open [vandanaapp.vercel.app](https://vandanaapp.vercel.app)
2. Tap the **install banner** or Menu → **Install App**

### Desktop (Chrome / Edge)
1. Open the site
2. Click the install icon in the address bar

---

## 🚀 Run Locally

```bash
git clone https://github.com/TheAlgo7/vandana-worship-app.git
cd vandana-worship-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📜 Adding Songs

Drop a JSON file into `src/data/songs/`:

```json
{
  "id": "your-song-slug",
  "title": "Song Title",
  "artist": "Artist Name",
  "church": "Church Name",
  "album": "Album Name",
  "language_default": "hinglish",
  "languages_available": ["hinglish", "hindi"],
  "lyrics": {
    "hinglish": {
      "chorus": "Chorus lyrics...",
      "verse1": "Verse 1 lyrics..."
    },
    "hindi": {
      "chorus": "कोरस...",
      "verse1": "पद 1..."
    }
  }
}
```

Rebuild. That's it. No CMS, no database, no deploy pipeline to configure.

---

<p align="center">
  <code>v1.9.1</code> · Sacred Noir · 2026<br/>
  © 2026 <a href="https://github.com/TheAlgo7">Gaurav Kumar</a> · <a href="https://thealgothrim.com">thealgothrim.com</a> · New Delhi, India
</p>

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
