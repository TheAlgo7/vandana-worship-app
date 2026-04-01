# ✝️ Vandana

### Worship lyrics in your heart language~

A cinematic, bilingual worship lyrics app built for the Hindi-speaking Christian community. Dark-first, mobile-first, offline-ready — because worship shouldn't need WiFi.

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

**Vandana** is a Progressive Web App for worship song lyrics — designed with the same care you'd put into a hymnal, but built for phones. It's statically generated, loads instantly, works offline, and respects both the beauty of Devanagari script and the accessibility of Roman transliteration. Present mode turns your phone into a projector-ready lyric display.

---

## 🌍 Live Demo

👉 **[vandanaapp.vercel.app](https://vandanaapp.vercel.app)**

Install it on your phone — tap **Share → Add to Home Screen** (iOS) or the install banner (Android). It works offline.

---

## 🗂️ Project Structure

```
vandana/
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (fonts, theme, meta)
│   │   ├── page.tsx           # Home — song list with search
│   │   ├── globals.css        # Tailwind v4 entry
│   │   ├── song/
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # SSG song page
│   │   │       └── SongView.tsx   # Client: lyrics, font size, language
│   │   └── present/
│   │       └── [id]/
│   │           ├── page.tsx       # SSG present page
│   │           └── PresentView.tsx # Client: fullscreen auto-scroll
│   ├── components/
│   │   ├── BottomNav.tsx      # Fixed bottom navigation
│   │   ├── FontSizeControl.tsx # Pinch-free font scaling
│   │   ├── HomeContent.tsx    # Song list + search + filters
│   │   ├── LanguageToggle.tsx # Hinglish ↔ Hindi switch
│   │   ├── Providers.tsx      # ThemeProvider wrapper
│   │   ├── SearchBar.tsx      # Instant search
│   │   ├── SettingsModal.tsx  # Bottom sheet settings
│   │   └── SongCard.tsx       # Song list item
│   ├── data/
│   │   └── songs/
│   │       ├── chamka-sitara.json
│   │       └── choo-le-mujhe.json
│   ├── lib/
│   │   └── getSongs.ts       # File-system song loader
│   └── styles/
│       └── globals.css        # Design tokens & theme variables
├── next.config.ts
├── tailwind.config.ts (v4 — CSS-first)
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
| Animations | Framer Motion 12 |
| PWA | Web App Manifest (public/manifest.json) |
| Fonts | Cormorant Garamond · Plus Jakarta Sans · Noto Sans Devanagari |
| Deployment | Vercel (SSG + Edge) |

---

## 🎨 Design Philosophy

- **Dark-first** — worship happens in dim rooms. The dark theme isn't an afterthought, it's the default.
- **Typography is the UI** — lyrics are the content. Cormorant Garamond for headings, Plus Jakarta Sans for body, Noto Sans Devanagari for Hindi. Every font chosen with intent.
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
| Font Size Control | Adjustable text size — no pinching required |
| Present Mode | Fullscreen, auto-scrolling lyrics for projection |

### 🔍 Discovery

| Feature | Description |
|---------|------------|
| Instant Search | Filter songs by title as you type |
| Church Filters | Quick-filter pills for church categories |
| Song Cards | Clean list with song metadata |

### ⚙️ System

| Feature | Description |
|---------|------------|
| Dark / Light Theme | System-aware with manual override |
| Settings Modal | Bottom-sheet with theme, language defaults, about |
| PWA Install | Add to home screen, works offline |
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

## 🛠️ Build for Production

```bash
npm run build
npm start
```

The build statically generates all song and present pages at build time.

---

## 📜 Adding Songs

Drop a JSON file into `src/data/songs/`:

```json
{
  "id": "your-song-slug",
  "title": { "hinglish": "Song Title", "hindi": "गीत शीर्षक" },
  "lyrics": {
    "hinglish": ["Verse 1 line 1", "Verse 1 line 2", "", "Chorus line..."],
    "hindi": ["पद 1 पंक्ति 1", "पद 1 पंक्ति 2", "", "कोरस..."]
  }
}
```

Rebuild. That's it. No CMS, no database, no deploy pipeline to configure.

---

<p align="center">
  <code>v0.1.0</code> · July 2025<br/>
  © 2025 <a href="https://github.com/TheAlgo7">Gaurav Kumar</a> · <a href="https://thealgothrim.com">thealgothrim.com</a> · New Delhi, India
</p>

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
