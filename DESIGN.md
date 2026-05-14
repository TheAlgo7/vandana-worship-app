---
name: Vandana
description: A quiet Hindi and Hinglish worship lyrics app for church and personal devotion.
colors:
  sacred-noir: "#0A0A0E"
  midnight-surface: "#141418"
  raised-ink: "#1E1E26"
  candle-gold: "#C4AA7E"
  candle-gold-hover: "#D4BC94"
  parchment-bg: "#F4F0E8"
  parchment-surface: "#FEFCF8"
  parchment-raised: "#EDE8DD"
  ink-primary: "#ECEAE4"
  ink-secondary: "#87849A"
  ink-muted: "#7A7788"
  light-primary: "#18151E"
  light-secondary: "#6B6878"
  light-muted: "#6F6B79"
  border-dark: "#242330"
  border-light: "#E0DACE"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  devanagari:
    fontFamily: "Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 2.15
    letterSpacing: "0"
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.18em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  page: "20px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.candle-gold}"
    textColor: "{colors.sacred-noir}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  chip:
    backgroundColor: "{colors.midnight-surface}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  song-row:
    backgroundColor: "{colors.sacred-noir}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    padding: "16px 0"
---

# Design System: Vandana

## 1. Overview

**Creative North Star: "The Quiet Hymnal"**

Vandana is a lyrics-first worship tool for Indian churches and personal devotion. The interface should feel reverent, warm, and unhurried, closer to a leather-bound hymnal than a streaming app or a dashboard.

Dark mode is the primary physical scene: a dim worship hall, a phone held in one hand, a worship leader needing lyrics without visual noise. The app uses silence, restrained surfaces, and rare gold accents so the lyrics remain the center.

Key characteristics:
- Lyrics are the product. Controls support reading, not spectacle.
- Gold is sacred light and should appear only on active states, primary actions, Scripture, and section labels.
- Mobile controls need a 44px minimum hit target.
- Avoid streaming-app color, neon, generic SaaS cards, decorative glass, and AI-looking punctuation.

## 2. Colors

The palette is Sacred Noir: deep tinted black surfaces, warm candle-gold accents, and parchment light mode.

### Primary
- **Candle Gold** (`#C4AA7E`): active tabs, selected chips, section labels, primary actions, and devotional emphasis.
- **Candle Gold Hover** (`#D4BC94`): hover and active elevation on dark surfaces.

### Neutral
- **Sacred Noir** (`#0A0A0E`): default app background.
- **Midnight Surface** (`#141418`): panels, controls, and calm grouped surfaces.
- **Raised Ink** (`#1E1E26`): elevated surfaces and skeleton blocks.
- **Parchment Background** (`#F4F0E8`): light theme base.
- **Ink Primary** (`#ECEAE4`): high-emphasis text on dark.
- **Ink Secondary** (`#87849A`): readable secondary text on dark.
- **Ink Muted** (`#7A7788`): lower-emphasis metadata that still needs to remain legible.

### Named Rules

**The Rare Gold Rule.** Gold is not decoration. Use it for selection, primary action, Scripture, and section labels.

**The No Pure White Rule.** Large surfaces should be tinted, never clinical white.

## 3. Typography

**Display Font:** Lora, with Georgia fallback.
**Body Font:** Plus Jakarta Sans, with system-ui fallback.
**Devanagari Font:** Noto Sans Devanagari, with system-ui fallback.

The pairing should feel devotional without becoming old-fashioned: Lora carries song titles and sacred headings; Plus Jakarta Sans keeps the product interface clear; Noto Sans Devanagari gives Hindi lyrics enough matra breathing room.

### Hierarchy
- **Display** (700, 34px, 1.2): song titles and primary page headings.
- **Title** (600, 22px, 1.3): empty states, update headings, compact panel headings.
- **Body** (400, 15px, 1.6): interface copy and descriptions.
- **Lyrics** (400, 18px default, 2.0): Hinglish lyrics, adjustable by the user.
- **Devanagari Lyrics** (400, 18px default, 2.15): Hindi lyrics.
- **Label** (600, 11px, 0.18em, uppercase): section labels and quiet metadata groups.

### Named Rules

**No Negative Tracking in Product UI.** Use `letter-spacing: 0` for compact controls, labels inside panels, and navigation.

## 4. Elevation

Elevation is mostly tonal, not dramatic. Surfaces separate through deep neutral layers, hairline borders, and soft shadows.

- **Default surface:** flat or a single border.
- **Floating navigation:** one glass-like pill is allowed because it is persistent and functional.
- **Toasts and notices:** use `--shadow-sm` and restrained blur.
- **Present Mode:** fixed overlays use gradients only to preserve lyric readability.

Avoid stacked cards and nested cards. A page section should be a layout band or natural grouping, not a card inside another card.

## 5. Components

### Bottom Navigation
The mobile nav is a floating pill with five icon targets. Active state expands to show the label. Keep active text readable, maintain equal internal padding, and preserve safe-area spacing.

### Song Row
Song rows are dense, scannable, and lyrics-first. Title, artist, favourite, and setlist actions must remain reachable without crowding the title. Trailing metadata can hide on narrow screens.

### Language Toggle
Hindi and Hinglish toggles should feel like mode switches, not homepage filters. Keep the labels short and avoid showing language controls where they do not directly change lyrics.

### Present Mode
Present Mode is intentionally dark, full-screen, and low chrome. Controls must be at least 44x44px and should hide without making the lyrics jump.

### Updates
Updates should read like a calm church bulletin, not release notes for software engineers. Avoid batch labels like A/B/C lists.

## 6. Do's and Don'ts

Do:
- Keep lyrics and search speed as the center of the product.
- Use one restrained accent and warm tinted neutrals.
- Use real buttons, labels, and ARIA for icon actions.
- Keep touch targets at 44px minimum.
- Run the text-integrity audit after song imports.

Don't:
- Use em dashes, `--`, emoji-heavy UI copy, or hype language.
- Use neon, streaming-app green, generic blue-purple gradients, or decorative glass cards.
- Put bridge/outro/repeated chorus sections above verses.
- Ship placeholder question marks, mojibake, or broken Hindi fallback lyrics.
- Add homepage filters that duplicate settings or song-level controls.
