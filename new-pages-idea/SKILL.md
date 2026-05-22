---
name: vandana-design
description: Use this skill to generate well-branded interfaces and assets for Vandana — the bilingual Hindi · Hinglish worship-lyrics PWA — either for production or throwaway prototypes, slides, and mocks. Contains the Sacred Noir design system, colors, type, fonts, logo assets, and a full interactive UI kit recreation of the app.
user-invocable: true
---

# Vandana Design Skill

Vandana is a dark-first, bilingual worship-lyrics PWA. Three surfaces in deep blue-black, one desaturated candlelight gold accent, Lora display + Plus Jakarta body + Noto Sans Devanagari. Warm, reverent, low-key. Pill-shaped interaction, no emoji, no gradients, no bounces.

## Start here
1. **Read `README.md`** — full context: brand voice, visual foundations, iconography, index.
2. **Read `colors_and_type.css`** — the tokens that drive every artifact. Import it directly into new HTML files.
3. **Look at `preview/`** — 23 design-system cards (colors, type, spacing, components, brand) showing every token and component variant in use.
4. **Look at `ui_kits/app/`** — a working interactive recreation of the whole app. `screens.jsx` and `components.jsx` are the reference implementations. Treat them as the source of truth for how to build anything that touches the UI.
5. **Look at `assets/`** — `logo.svg`, `logo-tagline.svg`. Copy these into any artifact that needs the wordmark.

## When asked to build
- **Throwaway artifact (slide / mock / static HTML):** copy `colors_and_type.css` and `assets/logo*.svg` into your working folder, import the CSS, and use components from `ui_kits/app/components.jsx` / `screens.jsx` as direct references. Prefer `var(--...)` tokens over hard-coded values.
- **Production code:** read `source/` (the imported Next.js app) as ground truth. Respect the existing component API — don't invent new props.
- **New screen for the app:** follow the layout rules in README → Visual Foundations → Layout rules. Mobile-first, `max-width: 40rem`, 20px padding, 56px bottom nav, pill-shaped everything tappable.

## Non-negotiables
- **No emoji in UI copy.** Use Lucide icons or brand SVGs.
- **No gradients as primary backgrounds.** Except the subtle radial gold glow behind hero text.
- **Every interactive thing is pill-radius.**
- **Dark is the default.** Light theme exists but is rarely the starting point.
- **Bilingual peer treatment.** If you show Hinglish, also author the Hindi. Never fallback.
- **Icons are Lucide only**, 24px / strokeWidth 2, active state = fill accent.

## If the user invokes the skill with no direction
Ask what they want — a slide deck, a marketing asset, a new screen, a standalone HTML prototype — and what content. Then ask whether they want strict brand adherence or a more experimental variant. Then act as a senior designer and produce HTML artifacts or production code depending on the need.

## File map

```
README.md                  — brand voice, visuals, iconography, index
colors_and_type.css        — all CSS variables
SKILL.md                   — this file
assets/                    — logo.svg, logo-tagline.svg
preview/                   — 23 system cards
source/                    — imported Next.js source (read-only reference)
ui_kits/app/               — interactive recreation of the app
  index.html               — the click-thru prototype
  primitives.jsx           — icons + sample songs + sample verse
  components.jsx           — SongCard, DailyVerse, BottomNav, SearchBar, toggles, filter
  screens.jsx              — Home, Song, Present, Favourites, Updates, Settings
  AppShell.jsx             — root wiring
```
