# SEO Action Plan — Vandana Worship App

**Based on:** FULL-AUDIT-REPORT.md audit of https://vandanaapp.vercel.app  
**Date:** 2026-05-23 | Score: 74/100 → Target: 85+

---

## Critical — Fix Immediately

### C1: Add og:image to homepage

**File:** `src/app/layout.tsx`

In the root `metadata` export, add `images` to the `openGraph` block:

```ts
openGraph: {
  // ...existing fields...
  images: [{ url: `${SITE_URL}/icons/og-image.png`, width: 1200, height: 630 }],
},
```

**Impact:** Fixes blank share cards on WhatsApp, Telegram, LinkedIn, Facebook — the primary sharing channels for Indian worshippers.

---

### C2: Add song pages to sitemap

**File:** `src/app/sitemap.ts` (or wherever the sitemap is generated)

Fetch all song slugs from Supabase and add them as `/song/[id]` entries with `priority: 0.9` and `changefreq: "weekly"`.

```ts
const songs = await supabase.from('songs').select('id, updated_at');
const songEntries = songs.data?.map(s => ({
  url: `${SITE_URL}/song/${s.id}`,
  lastModified: s.updated_at,
  changeFrequency: 'weekly',
  priority: 0.9,
})) ?? [];
return [...staticRoutes, ...songEntries];
```

**Impact:** Google can discover all 80+ song pages via sitemap crawl. Each song title is a long-tail keyword with real search volume.

---

### C3: Add structured data to song pages

**File:** Song page component (e.g., `src/app/song/[id]/page.tsx`)

Add `LyricsAction` and/or `MusicComposition` schema to each song page:

```json
{
  "@context": "https://schema.org",
  "@type": "MusicComposition",
  "name": "[Song Title]",
  "inLanguage": ["hi", "en"],
  "lyricist": "[Artist name if known]",
  "publisher": { "@type": "Organization", "name": "[Ministry name]" },
  "potentialAction": {
    "@type": "LyricsAction",
    "target": "https://vandanaapp.vercel.app/song/[id]"
  }
}
```

**Impact:** Enables rich results for lyric searches — Google can show lyrics directly in SERPs.

---

## High — Fix Within 1 Week

### H1: Add "Hindi" to page title

**File:** `src/app/page.tsx` (or layout metadata)

```ts
// Before
title: "Vandana — Worship in your language"

// After
title: "Vandana — Hindi Worship Lyrics App"
```

**Impact:** "Hindi worship lyrics" is the primary search query. It's in the meta description and OG title but absent from the `<title>` tag that Google weights most.

---

### H2: Make H1 keyword-aware

**Current:** `<h1>Vandana</h1>` (brand wordmark only)

Options (pick one):
- Add a visually styled subtitle as a `<p>` immediately after H1 that includes "Hindi & Hinglish worship lyrics" — keep H1 as wordmark for brand integrity
- Or convert the animated tagline element into an `<h2>` with aria-live

The landing page's tagline "Worship in your language" already carries the keyword signal well as body text, so this is lower urgency than C1–C3.

---

### H3: Enforce CSP (not just report)

**File:** `next.config.ts` or `vercel.json`

Change `Content-Security-Policy-Report-Only` to `Content-Security-Policy`. Test thoroughly in staging first since the current policy includes `'unsafe-inline'` and `'unsafe-eval'` which need to remain for Next.js to function.

---

### H4: Complete Organization schema

**File:** `src/app/layout.tsx` — in the JSON-LD script

Add to the Organization node:
```json
{
  "@type": "Organization",
  "logo": "https://vandanaapp.vercel.app/icons/icon-512.png",
  "sameAs": [
    "https://github.com/TheAlgo7/vandana-worship-app",
    "https://thealgothrim.com"
  ]
}
```

**Impact:** Strengthens entity disambiguation — Google can build a Knowledge Panel and AI systems can reliably attribute the app to its creator.

---

## Medium — Fix Within 1 Month

### M1: FAQPage schema on /install

The install page has step-by-step instructions for 3 platforms. Wrap in FAQ schema:

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How do I install Vandana on iPhone?",
      "acceptedAnswer": { "@type": "Answer", "text": "Open vandanaapp.vercel.app in Safari, tap Share, tap Add to Home Screen." } },
    { "@type": "Question", "name": "How do I install Vandana on Android?" ... },
    { "@type": "Question", "name": "How do I install Vandana on desktop?" ... }
  ]
}
```

---

### M2: hreflang for Hindi content

The app serves both English (Hinglish) and Hindi content. Add to `<head>`:

```html
<link rel="alternate" hreflang="en-IN" href="https://vandanaapp.vercel.app" />
<link rel="alternate" hreflang="hi-IN" href="https://vandanaapp.vercel.app" />
<link rel="alternate" hreflang="x-default" href="https://vandanaapp.vercel.app" />
```

Since both scripts live on the same URL (toggle in-app), using the same URL for both hreflang values is acceptable.

---

### M3: Add internal links to content pages from landing

Add a "Recently added" or "Featured songs" strip to the landing page footer area that links to 3–5 specific song pages. This passes PageRank from the high-authority landing page to content pages.

---

### M4: SSR the About page body

The `/about` page renders skeleton HTML to Googlebot. The actual content is client-rendered. Either:
- Move the page body to a server component, or
- Add a static description in the `<main>` that Google can index

---

### M5: Add contact information

Add to the About page or footer: a contact email (even a formatted one like `gauravtiger60 [at] gmail [dot] com`) or a GitHub Issues link as the support channel. This is an E-E-A-T signal Google looks for.

---

### M6: Strengthen llms.txt with differentiators

Add a section to `llms.txt`:

```markdown
## Why Vandana

Unlike generic lyric sites, Vandana:
- Authors Hinglish and Devanagari as two separate first-class texts (not auto-transliteration)
- Provides Present Mode: full-screen block-by-block projection for worship leaders
- Includes a Setlist builder for planning and live worship flow
- Is offline-first: works without internet after first load
- Has zero ads, zero tracking, zero paywalls — permanently
```

---

## Low — Backlog

### L1: BreadcrumbList schema on ministry/song pages

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://vandanaapp.vercel.app" },
    { "@type": "ListItem", "position": 2, "name": "ICM", "item": "https://vandanaapp.vercel.app/ministry/icm" }
  ]
}
```

### L2: Directory and community listings

Submit to:
- ProductHunt (PWA + worship niche)
- AlternativeTo ("alternatives to Hindify" / "Hindi worship lyrics app")
- PWA directories (pwastats.com, progressiveapp.site)
- Indian Christian Facebook groups and WhatsApp channels

### L3: Per-song lastmod in sitemap

Instead of using build time as `lastmod` for all URLs, query each song's actual `updated_at` from Supabase. This signals freshness to Google more accurately and may trigger re-crawls when songs are updated.

---

## Score Projection

| Fix batch | Points gained | New score |
|---|---|---|
| Current | — | 74 |
| C1–C3 (critical) | +5 | 79 |
| H1–H4 (high) | +4 | 83 |
| M1–M6 (medium) | +4 | 87 |
| L1–L3 (low) | +2 | 89 |

Realistic ceiling without backlink growth: ~85–87. Breaking 90 requires domain authority growth through external backlinks from ministry sites and community mentions.
