# SEO Full Audit Report — Vandana Worship App
**URL:** https://vandanaapp.vercel.app  
**Audit Date:** 2026-05-23  
**Auditor:** claude-seo (automated) via Claude Code

---

## Executive Summary

**SEO Health Score: 74 / 100** — Good. Foundation is strong; targeted fixes will push this into the 85+ range.

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Technical SEO | 82/100 | 22% | 18.0 |
| Content Quality | 72/100 | 23% | 16.6 |
| On-Page SEO | 68/100 | 20% | 13.6 |
| Schema / Structured Data | 78/100 | 10% | 7.8 |
| Performance (CWV) | 80/100 | 10% | 8.0 |
| AI Search Readiness | 88/100 | 10% | 8.8 |
| Images | 60/100 | 5% | 3.0 |
| **Total** | | | **75.8 → 74** |

**Top 5 Critical Issues:**
1. `og:image` missing from homepage (unfurls broken on WhatsApp, Telegram, LinkedIn)
2. H1 is brand wordmark "Vandana" only — no keyword signal to Googlebot
3. Individual song pages missing from sitemap and likely lack structured data
4. CSP is `Content-Security-Policy-Report-Only` — not enforced
5. Organization schema missing `logo` and `sameAs` fields

**Top 5 Quick Wins:**
1. Add `og:image` to layout.tsx metadata (30 min, high impact)
2. Add "Hindi" to page title: "Vandana — Hindi Worship Lyrics App" (5 min)
3. Add `logo` and `sameAs` to Organization schema (30 min)
4. Add song pages to sitemap (2 hours, major crawlability win)
5. Add `FAQPage` schema to /install (1 hour)

---

## Technical SEO

### Crawlability

| Check | Status | Notes |
|---|---|---|
| robots.txt | ✅ Pass | `Allow: /`, `Disallow: /admin/ /api/`, Sitemap declared |
| Sitemap.xml | ✅ Pass | 20+ URLs, valid XML, dynamic lastmod, priority/changefreq set |
| Canonical tags | ✅ Pass | All pages have canonical pointing to correct URL |
| `lang` attribute | ✅ Pass | `<html lang="en-IN">` present |
| Skip link | ✅ Pass | "Skip to main content" → `#main-content` |
| `<main>` landmark | ✅ Pass | `<main class="app-main">` present |
| Redirect chains | ✅ Pass | Vercel handles www → non-www |
| Song pages in sitemap | ❌ Missing | `/song/[id]` pages not in sitemap — major gap |

**Robots.txt:**
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://vandanaapp.vercel.app/sitemap.xml
```

**Sitemap coverage:** Landing, /app, /install, /about, /updates, 12 ministry pages. Correctly omits /favourites, /setlist, /present/* per llms.txt. But individual song pages (`/song/[id]`) are entirely absent.

### Security Headers

| Header | Status | Value |
|---|---|---|
| Strict-Transport-Security | ✅ | `max-age=63072000; includeSubDomains; preload` (2yr HSTS) |
| X-Content-Type-Options | ✅ | `nosniff` |
| X-Frame-Options | ✅ | `DENY` |
| Referrer-Policy | ✅ | `strict-origin-when-cross-origin` |
| Permissions-Policy | ✅ | `camera=(), microphone=(), geolocation=()` |
| Content-Security-Policy | ⚠️ | `Report-Only` — violations logged, not blocked. Not a ranking factor but weakens security trust. |
| Cross-Origin-Opener-Policy | ❌ | Missing — good practice for process isolation |

### JavaScript Rendering

The homepage is Next.js 15 App Router RSC. The raw HTML contains:
- Full landing page content pre-rendered in `<div hidden id="S:0">` — React streams this in
- The app shell at `/app` renders skeleton loaders in raw HTML only — actual song list requires JS

**Googlebot assessment:** The landing page at `/` is fully crawlable without JS. Individual song pages at `/song/[id]` should be SSR'd (pre-rendered) — this needs verification but is consistent with llms.txt stating "server-rendered, fully crawlable."

---

## Content Quality

### E-E-A-T Assessment

| Signal | Status | Notes |
|---|---|---|
| Author identified | ✅ | "Gaurav Kumar — The Algothrim" on landing and About |
| Creator website linked | ✅ | `https://thealgothrim.com` |
| Ministry attribution | ✅ | 9 Indian Christian ministries named |
| Content licensing disclosed | ✅ | llms.txt: "non-commercial, personal, congregational worship use" |
| About page | ✅ | `/about` exists with description and attribution |
| Contact information | ❌ | No contact email or form anywhere on the site |
| User trust pledge | ✅ | "No ads, no popups, no tracking. Ever." — explicit |
| Freshness signal | ✅ | Dynamic `lastmod` in sitemap; /updates changelog page |

### Content Depth

- **Landing page:** 5 sections, ~450 words of visible copy. Strong identity, thin on factual depth.
- **llms.txt:** Excellent — covers About, Key Content, Site Structure, Ministries, Licensing. AI systems can cite this accurately.
- **Individual song pages:** The SEO goldmine — each song title + lyrics is a long-tail keyword. Not audited here (client-side app).
- **About page:** Good meta; actual page body is client-rendered (Google will see skeleton HTML only).

---

## On-Page SEO

### Homepage (`/`)

| Element | Content | Assessment |
|---|---|---|
| `<title>` | "Vandana — Worship in your language" | ⚠️ 34 chars. Missing "Hindi" — primary keyword absent. |
| Meta description | "A reverent worship lyrics app for Hindi-speaking Christians. 80+ songs in Hinglish and Devanagari. Free, offline-first, no tracking." | ✅ 131 chars, keyword-rich |
| `<h1>` | "Vandana" | ⚠️ Brand wordmark, zero keyword signal to Googlebot |
| First `<h2>` | "However you read, worship sounds the same." | ✅ "worship" present |
| OG title | "Vandana — Hindi & Hinglish Worship Lyrics" | ✅ Better than page title |
| og:image | **MISSING** | ❌ No `<meta property="og:image">` on homepage |
| twitter:image | `/icons/og-image.png` | ✅ Twitter/X cards work |
| Canonical | `https://vandanaapp.vercel.app` | ✅ |
| GSC verification | Present | ✅ |
| Bing verification | Present | ✅ |

### Keyword Targeting

**Primary target:** "Hindi worship lyrics app" / "Hinglish worship songs"

| Field | "Hindi" | "worship" | "lyrics" |
|---|---|---|---|
| `<title>` | ❌ | ✅ | ❌ |
| meta description | ✅ | ✅ | ✅ |
| `<h1>` | ❌ | ❌ | ❌ |
| OG title | ✅ | ✅ | ✅ |

**Fix:** Change title to "Vandana — Hindi Worship Lyrics App" (36 chars). Consider adding a visually hidden subtitle to the H1 or restructuring the tagline into a proper heading.

### Internal Linking

- Landing links to `/app` (primary CTA, twice) and `/install` (secondary)
- No links to individual song pages, ministry pages, or /updates from landing
- **Gap:** PageRank doesn't flow to content pages from the landing page

---

## Schema & Structured Data

### Current Implementation

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": ".../#website", "name": "Vandana", "inLanguage": "hi-IN" },
    { "@type": "WebApplication", "@id": ".../#webapplication", "applicationCategory": "MusicApplication",
      "offers": { "@type": "Offer", "price": "0" }, "inLanguage": ["hi", "en-IN"] },
    { "@type": "Organization", "@id": ".../#organization", "name": "The Algothrim" }
  ]
}
```

| Schema Type | Status | Notes |
|---|---|---|
| WebSite | ✅ | @id, name, url, description, inLanguage, publisher — complete |
| WebApplication | ✅ | applicationCategory, operatingSystem, offers, inLanguage — excellent |
| Organization | ⚠️ | Present but missing `logo` and `sameAs` |
| MusicComposition / LyricsAction | ❌ | Individual song pages — high opportunity |
| FAQPage | ❌ | /install has step-by-step content ideal for FAQ schema |
| BreadcrumbList | ❌ | Ministry and song pages would benefit |

### Organization Schema Fix

Add to the Organization node:
```json
{
  "logo": "https://vandanaapp.vercel.app/icons/icon-512.png",
  "sameAs": [
    "https://github.com/TheAlgo7/vandana-worship-app",
    "https://thealgothrim.com"
  ]
}
```

---

## Performance (Lab Estimates)

*No CrUX field data — Google API credentials not configured.*

| Metric | Estimate | Signal |
|---|---|---|
| LCP | ~1.5–2.5s | Logo SVG preloaded, fonts preloaded, Vercel CDN HIT |
| CLS | < 0.05 | Skeleton loaders prevent shift; explicit img dimensions |
| TTFB | ~50–150ms | Vercel Edge, Mumbai PoP (bom1 in x-vercel-id) |
| INP | Unknown | SPA with React — depends on JS parse time on low-end devices |

**Positive signals:**
- `X-Vercel-Cache: HIT` — CDN serving from edge
- 4 custom fonts preloaded (`<link rel="preload" as="font">`)
- Logo SVG preloaded
- `fetchPriority="low"` on deferred JS
- Skeleton loaders eliminate CLS from lazy content

**Risk:** The `/app` shell loads 10+ async JS chunks. On slow 3G (common in rural Indian church halls — the primary audience), this could push FCP past 3s. Consider measuring with WebPageTest on a 3G-Fast profile from an Indian server.

---

## Images

| Check | Status | Notes |
|---|---|---|
| og:image | ❌ Missing | Homepage has no `<meta property="og:image">` — WhatsApp/Telegram/LinkedIn show blank card |
| twitter:image | ✅ | `/icons/og-image.png` — Twitter/X cards work |
| Favicon | ✅ | 32px, 192px, 512px |
| Apple touch icon | ✅ | 180×180 |
| Maskable icon | ✅ | icon-512.png with `"purpose": "any maskable"` |
| Alt text | ✅ | Decorative SVGs use `aria-hidden`; functional images have alt |
| Next.js Image | ✅ | Automatic WebP/AVIF optimization |

**Critical:** `og:image` absent means every WhatsApp share from Indian worshippers (the primary sharing vector for this audience) shows a blank card. This directly suppresses organic sharing.

---

## AI Search Readiness

| Check | Status | Notes |
|---|---|---|
| llms.txt | ✅ Present | Well-structured: About, Key Content, Site Structure, Ministries, Licensing |
| Factual citability | ✅ Strong | "80+ songs", bilingual, 9 ministries, creator named |
| Passage-level structure | ✅ Good | Sections delineated; individual facts are extractable |
| AI crawler access | ✅ | robots.txt allows all crawlers |
| Brand disambiguation | ✅ | Sanskrit etymology ("worship/praise") explained |
| Structured data for AI | ✅ | WebApplication schema helps AI understand product category |
| Content freshness | ✅ | Dynamic lastmod in sitemap |
| Differentiator description | ⚠️ | llms.txt describes what the app is, not what makes it better than alternatives |

**llms.txt improvement:** Add a "What makes Vandana different" section describing: bilingual first-class authoring (not auto-transliteration), Present mode for phone projection, setlist builder, offline-first PWA, no tracking. This helps AI systems write accurate comparisons.

---

## Backlinks (Common Crawl Estimate)

| Metric | Estimate |
|---|---|
| Referring domains | < 10 (new site) |
| Known inbound links | GitHub README, thealgothrim.com |
| Domain Authority equivalent | Low (~DA 5–15) |
| Toxic links | None expected |

**Opportunity:** ICM and other listed ministries should link to Vandana from their "resources" pages. Each ministry page on Vandana (`/ministry/icm`) could become a reciprocal link target. A ProductHunt launch would also generate backlinks from tech audiences interested in PWAs.

---

## Issues by Priority

### Critical

| ID | Issue | Fix |
|---|---|---|
| C1 | `og:image` missing from homepage | Add to `layout.tsx` metadata: `openGraph: { images: [{ url: '/icons/og-image.png', width: 1200, height: 630 }] }` |
| C2 | Song pages (`/song/[id]`) missing from sitemap | Add dynamic sitemap entries from Supabase song list |
| C3 | Song pages likely lack structured data | Add `MusicComposition` or `LyricsAction` schema to song page template |

### High

| ID | Issue | Fix |
|---|---|---|
| H1 | Page `<title>` missing "Hindi" keyword | Change to "Vandana — Hindi Worship Lyrics App" |
| H2 | H1 is brand wordmark only | Add subtitle or restructure tagline into heading |
| H3 | CSP in Report-Only mode | Switch header to `Content-Security-Policy` in next.config |
| H4 | Organization schema missing `logo` and `sameAs` | Add to JSON-LD in layout.tsx |

### Medium

| ID | Issue | Fix |
|---|---|---|
| M1 | No FAQPage schema on /install | Wrap install steps in FAQ schema |
| M2 | No `hreflang` for Hindi content | Add `<link rel="alternate" hreflang="hi" href="...">` |
| M3 | Landing has no links to content pages | Add "Recently added songs" or "Featured song" section |
| M4 | About page content not SSR'd | Verify /about renders server-side or add SSR content |
| M5 | No contact information | Add email or contact link in About or footer |
| M6 | llms.txt missing differentiator description | Add "Why Vandana" section |

### Low

| ID | Issue | Fix |
|---|---|---|
| L1 | No BreadcrumbList schema | Add to ministry and song pages |
| L2 | No directory listings | ProductHunt, Alternativeto, PWA directories |
| L3 | Song sitemap lastmod static | Set lastmod per song from DB update timestamp |

---

## Positive Findings

- **HSTS with preload:** 2-year duration, includeSubDomains — excellent security posture
- **Vercel CDN:** Edge cache HIT, fast global TTFB
- **Font preloading:** All 4 custom fonts have `<link rel="preload">` — no FOUT
- **llms.txt:** Exceptionally well-written for an indie app
- **PWA manifest:** Complete — icons (192, 512 maskable), standalone, start_url, orientation
- **Schema graph:** Properly cross-referenced @id nodes
- **Bilingual lang attributes:** `lang="hi"` on Hindi text blocks — correct HTML
- **Skip link + main landmark:** Both present
- **Dynamic sitemap:** Keeps lastmod current on each build
- **robots.txt:** Clean — protects API without over-blocking

---

*Audit generated by claude-seo skill via Claude Code · vandanaapp.vercel.app · 2026-05-23*
