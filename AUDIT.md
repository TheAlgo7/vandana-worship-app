# Vandana — Audit & Progress Tracker
> "Worship in your language"
> Built by Gaurav | The Algothrim

---

## PHASE 1 — Foundation (Do First)
- [x] Next.js project created with TypeScript + Tailwind + App Router
- [x] Folder structure created (app/, components/, data/songs/, lib/, styles/)
- [x] Dependencies installed: next-themes, framer-motion, next-pwa
- [x] globals.css — all CSS variables for dark + light theme
- [x] Google Fonts loaded: Cormorant Garamond + Plus Jakarta Sans + Noto Sans Devanagari
- [x] layout.tsx — ThemeProvider wrapped, font classes applied, PWA meta tags
- [x] next.config.ts — next-pwa configured
- [x] public/manifest.json — PWA manifest complete
- [x] First song JSON added: chamka-sitara.json + choo-le-mujhe.json (ICM)
- [x] getSongs.ts helper working (getSongs + getSongById)
- [x] Vercel deployment live at vandanaapp.vercel.app

---

## PHASE 2 — Core Screens
- [x] Home page — top bar with Vandana wordmark
- [x] Home page — search bar (live filter)
- [x] Home page — Browse by Church horizontal scroll pills
- [x] Home page — All Songs list with SongCard component
- [x] Home page — bottom nav bar (Home / Search / Settings)
- [x] Song lyrics page — title + artist display
- [x] Song lyrics page — language toggle (EN / हिंदी / Hinglish)
- [x] Song lyrics page — lyrics rendered by section
- [x] Song lyrics page — section labels (VERSE, CHORUS, BRIDGE)
- [x] Song lyrics page — font size control (3 levels, persisted)
- [x] Song lyrics page — external links row (YouTube / Spotify / Apple Music)
- [x] Song lyrics page — back navigation
- [x] Presentation mode — pure black background
- [x] Presentation mode — tap to toggle controls
- [x] Presentation mode — font size control
- [x] Presentation mode — language toggle
- [x] Presentation mode — auto-scroll toggle
- [x] Settings modal — dark/light theme toggle
- [x] Settings modal — default language preference
- [x] Settings modal — About section + credits

---

## DESIGN POLISH — Phase 2.5
- [x] Accent color replaced: purple → warm gold (#D4A853 dark / #9A6F20 light)
- [x] Cormorant Garamond heading font applied to all h1 elements
- [x] Lyrics wrapping fixed: word-break keep-all + overflow-wrap break-word + side padding
- [x] Subtitle changed to "Worship in your language"
- [x] Church pills, tag pills, nav, toggle all use gold accent via CSS variables

---

## PHASE 3 — Polish & Interactions
- [ ] Framer Motion: SongCard staggered entrance on home
- [ ] Framer Motion: language toggle crossfade (300ms)
- [ ] Framer Motion: page transitions
- [ ] SongCard press animation (scale 0.97)
- [ ] Theme transition smooth (full screen color fade)
- [ ] Devanagari font rendering tested on Android
- [ ] Devanagari font rendering tested on iOS
- [ ] Font size preference persisted across sessions (localStorage)
- [ ] Search filters correctly across title + artist + church
- [ ] Hindi search input works (type in Devanagari and get results)
- [ ] All external links open in new tab
- [ ] No hardcoded hex colors anywhere — all CSS vars

---

## PHASE 4 — PWA & Offline
- [ ] Service worker registered
- [ ] App installable on Android (Add to Home Screen)
- [ ] App installable on iOS (Add to Home Screen)
- [ ] Lyrics load offline after first visit
- [ ] Home screen loads offline
- [ ] PWA icon 192x192 created
- [ ] PWA icon 512x512 created
- [ ] Splash screen configured
- [ ] Lighthouse PWA score > 90

---

## PHASE 5 — Content (Songs Database)
- [ ] 1 song added (ICM) — for UI testing only
- [ ] UI complete and approved before adding more songs
- [ ] 10 ICM songs added
- [ ] 5 FOLJ songs added
- [ ] 5 Nation of Worship songs added
- [ ] 5 Sheldon Bangera songs added
- [ ] 5 Anil Kant songs added
- [ ] Song format consistent across all entries
- [ ] All songs have SEO descriptions
- [ ] All songs have correct church/artist attribution
- [ ] Hindi lyrics verified for accuracy
- [ ] YouTube links added wherever available

---

## PHASE 6 — Church Features
- [ ] ICM church page built (/church/icm)
- [ ] Pastor Arul Thomas bio + photo
- [ ] ICM 3.0 donation section with UPI QR
- [ ] FOLJ church page built
- [ ] Church filter working on home screen
- [ ] Pastor Arul Thomas blessing received before public launch

---

## PHASE 7 — SEO & Launch
- [ ] Meta tags on every song page (title, description, og:image)
- [ ] Sitemap.xml generated
- [ ] robots.txt configured
- [ ] Domain purchased (vandanaapp.in or vandanaworship.in)
- [ ] Custom domain connected on Vercel
- [ ] Google Search Console submitted
- [ ] Shared in ICM WhatsApp group
- [ ] Shared on @thealgothrim Instagram
- [ ] Shared on @gaurav.algo Instagram story

---

## FUTURE (Phase 8+)
- [ ] Worship set builder (create a playlist for a service)
- [ ] Song key / BPM metadata for musicians
- [ ] Chord charts for guitarists
- [ ] Request a song form
- [ ] Admin panel for adding songs without editing JSON
- [ ] Supabase migration (when songs exceed 200)
- [ ] FOLJ / Nation of Worship / Sheldon full catalogs
- [ ] Community song submissions with moderation
- [ ] Ankur Narula Ministry songs
- [ ] Dayanidhi Rao songs

---

## KNOWN ISSUES / BUGS
> Add issues here as you find them during development

- None yet

---

## SONG DATABASE LOG
> Track every song added

| Song Title | Artist | Church | Language | Added On | Verified |
|---|---|---|---|---|---|
| Yeshu Mera Gawah | ICM Worship | ICM | HI + Hinglish | — | No |

---

## DESIGN DECISIONS LOG
> Document why you made specific choices so future-you doesn't question it

| Decision | Reason |
|---|---|
| Cormorant Garamond for titles | Editorial, warm, matches Apple Music reference. Worship feels reverent not techy. |
| Warm parchment light mode (#F5F0E8) | Clinical white is cold. Worship context needs warmth. |
| Gold accent (#D4A853) | Reverence without being "church-website-from-2009" blue. |
| CSS variables over Tailwind for theme | next-themes swaps class on html tag, CSS vars respond instantly with zero JS. |
| JSON files over database | Zero backend needed for MVP. Vercel rebuilds in 30s when you add a song. Migrate to Supabase at 200+ songs. |
| Mobile-first 375px | 97% of worship app usage is mobile. Desktop is secondary (projection use only). |
| Presentation mode as separate route | Keeps lyrics page clean. Worship leaders can bookmark /present/[id] directly. |

---

*Last updated: April 2026 | Vandana v0.1 MVP*
