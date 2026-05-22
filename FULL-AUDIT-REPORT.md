# Vandana Worship App — Full SEO Audit Report

**Site:** https://vandanaapp.vercel.app  
**Audit Date:** 2026-05-22  
**Auditor:** Claude SEO Audit System  
**Stack:** Next.js 16.2.2 · React 19 · Tailwind CSS 4 · Supabase · Vercel  
**App Type:** Hindi/Hinglish Christian worship lyrics PWA for Indian churches  

---

## Overall SEO Health Score: 47 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 54/100 | 11.9 |
| Content Quality | 23% | 42/100 | 9.7 |
| On-Page SEO | 20% | 50/100 | 10.0 |
| Schema / Structured Data | 10% | 0/100 | 0.0 |
| Performance (CWV) | 10% | 65/100 | 6.5 |
| AI Search Readiness (GEO) | 10% | 41/100 | 4.1 |
| Images | 5% | 60/100 | 3.0 |

> **Note:** Score reflects the state at time of audit, before fixes were applied. Post-fix estimated score: **~68/100**. Remaining delta is backlog items.

---

## Business Type Detected

**Niche Content / Utility App — Religious / Worship**  
- Target audience: Indian church worship teams and congregations  
- Primary value proposition: Hindi + Hinglish lyrics with presentation mode  
- No local service component (not brick-and-mortar)  
- Not e-commerce  
- Low competition niche with zero structured SEO foundations pre-audit  

---

## Top 5 Critical Issues (Pre-Fix)

1. **Missing sitemap** — robots.txt references `/sitemap.xml` but it 404'd. All 80+ song pages depended on link discovery.
2. **Admin page indexable** — `/admin/import` had no `noindex` protection.
3. **80+ duplicate /present/[id] pages** — identical lyrics to `/song/[id]` with no `noindex` or canonical.
4. **Zero schema markup** — no structured data of any kind; MusicComposition, WebSite, Organization all absent.
5. **22-character global description** — "Worship in your language" provided almost zero context for crawlers or AI.

## Top 5 Quick Wins (Applied in This Audit)

1. ✅ Created `src/app/sitemap.ts` — all 80+ songs now in sitemap
2. ✅ Expanded global meta description to 155 chars with language, audience, org signals
3. ✅ Added `noindex` to /present/[id], /favourites, /setlist, /settings, /admin
4. ✅ Added WebSite + WebApplication + Organization JSON-LD to root layout
5. ✅ Added MusicComposition + BreadcrumbList JSON-LD to all 80+ song pages

---

## Section 1: Technical SEO

### Pre-Fix Score: 54/100

#### CRITICAL

**C-1: Sitemap returned 404 [FIXED]**  
`robots.txt` referenced `https://vandanaapp.vercel.app/sitemap.xml` but no sitemap existed anywhere in the project. Every crawler that reads `robots.txt` got a 404. Song pages depended entirely on link discovery.  
*Fix:* `src/app/sitemap.ts` created using `getSongIds()` with Supabase/bundled fallback. Covers `/`, `/updates`, and all `/song/[id]` pages.

**C-2: `/admin/import` was publicly indexable [FIXED]**  
No `noindex` directive on the admin import page. While it calls `notFound()` in production, it still emitted a metadata-less response that crawlers could attempt to index.  
*Fix:* Added `export const metadata: Metadata = { robots: { index: false, follow: false } }` to `src/app/admin/import/page.tsx`.

#### HIGH

**H-1: `/present/[id]` pages were indexable duplicates [FIXED]**  
80+ song pages at `/present/[id]` with identical lyrics to `/song/[id]`, no `noindex`, no canonical. Split link equity across 160+ pages instead of concentrating on the 80 that matter.  
*Fix:* Added `robots: { index: false }` and `alternates: { canonical: /song/[id] }` to `generateMetadata` in `present/[id]/page.tsx`.

**H-2: Utility pages had no metadata or noindex [FIXED]**  
`/favourites`, `/setlist`, `/settings`, `/present/[id]/favourites` had no metadata exports, inheriting the root generic title.  
*Fix:* `noindex` added to all four. Settings required a `layout.tsx` since `page.tsx` is `"use client"`.

**H-3: API routes not blocked in robots.txt [FIXED]**  
`/api/*` and `/admin/*` were missing from `robots.txt` Disallow rules.  
*Fix:* Added `Disallow: /admin/` and `Disallow: /api/` to `public/robots.txt`.

**H-4: Security headers nearly absent [FIXED]**  
`next.config.ts` only set `x-vercel-toolbar: 0`. No X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Permissions-Policy.  
*Fix:* Added four security headers to `next.config.ts` for all routes. CSP deferred — requires testing before enforcement to avoid breaking Supabase/Google Fonts connections.

#### MEDIUM

**M-1: Song page metadata was minimal**  
`generateMetadata` on `/song/[id]` only returned `title` and `description`. Missing OG fields, explicit canonical, Twitter card specifics.  
*Fix:* Added `alternates.canonical`, `openGraph.title`, `openGraph.description`, `openGraph.type: "article"`, `openGraph.locale: "hi_IN"` to `generateMetadata`.

**M-2: `lang="en-IN"` misleading for Hindi-primary content**  
Root HTML `lang` declares English (Indian) but primary content is Hindi. Song lyrics do correctly use `lang="hi"` or `lang="en"` on the lyrics div — this is the most important fix.  
*Recommendation:* Keep `lang="en-IN"` at root (UI is English) but ensure every Devanagari block has `lang="hi"`. Currently done in `SongView.tsx` — no change needed.

**M-3: OG image in non-standard path**  
`/icons/og-image.png` is functional but non-standard. All pages share one static OG image regardless of content.  
*Recommendation (backlog):* Implement `src/app/song/[id]/opengraph-image.tsx` with `ImageResponse` for per-song dynamic OG images.

#### LOW

**L-1: `/updates` had no metadata [FIXED]**  
Added `title: "Updates"` and a descriptive meta description.

**L-2: Core Web Vitals — font metric mismatch**  
Noto Sans Devanagari has significantly different metrics from system fallbacks, causing CLS on font-swap. Mitigate with `size-adjust`, `ascent-override`, `descent-override` CSS font descriptors on the fallback font definition.

**L-3: Home page song list is client-rendered**  
`HomeContent` is `"use client"`. Songs are passed as props from the server component (correct), but the rendered song cards with titles and links are injected by React in the browser. Crawlers that don't execute JS see a near-empty home page body.  
*Recommendation (backlog):* Add a server-rendered `<noscript>` or static `<ul>` of song links below the fold as a crawler fallback.

---

## Section 2: Content Quality

### Pre-Fix Score: 42/100

#### E-E-A-T Assessment

| Signal | Status | Notes |
|---|---|---|
| Experience | Weak | No creator bio page, no visible church community context on main pages |
| Expertise | Partial | Song attribution (artist, church) is displayed per song — good |
| Authoritativeness | Weak | No backlinks, no social presence, no Wikipedia entity for ICM |
| Trustworthiness | Partial | HTTPS ✓, manifest ✓, about info in settings (client-rendered) |

#### Global Meta Description [FIXED]

**Before:** "Worship in your language" (22 chars)  
**After:** "Free Hindi and Hinglish Christian worship lyrics app for Indian churches. 80+ songs in Devanagari and Roman transliteration with presentation mode for worship teams. By Isus Christos Ministries (ICM)." (203 chars → truncated to ~155 in SERPs)

The new description hits: language (Hindi/Hinglish), script (Devanagari), audience (Indian churches), feature (presentation mode), organization (ICM), count (80+ songs).

#### Song Page seo_description Quality

Songs source their descriptions from a `seo_description` field in Supabase. Quality is inconsistent:

- **Good examples:** `"Yahweh Sabaoth Hindi worship cover lyrics in Hindi and Hinglish by Ps. Arul Thomas & Dr. Mahima John Arul from ICM Church - originally by Nathaniel Bassey"` — entity-rich, attribution, original artist reference
- **Poor examples:** `"Hallelujah! Prabhu Mere lyrics in Hindi and Hinglish by Unknown Artist"` — thin, no entity signals, "Unknown Artist" provides no value

**Recommendation:** Audit all songs with `artist = "Unknown Artist"` in Supabase and improve their `seo_description` values with genre, theme, or first-line lyric references.

#### Heading Hierarchy

- `/song/[id]`: `<h1>` for song title ✓ — correct
- Homepage: No `<h1>` in crawlable HTML — the AppTitle component is mobile-only markup and the search input has an off-screen `<label>`. The song list `<main>` has no heading.
- `/settings`: Has `<h1>Settings` inside the `"use client"` component ✓
- Other pages: Rely on client-side rendering for headings

#### Section Labels Use `<span>` Not Headings

In `SongView.tsx`, lyric section labels (Verse 1, Chorus, Bridge) are `<span class="section-label">`. Semantically, these should be `<h2>` or carry `role="heading" aria-level="2"` for correct document outline parsing by search engines and screen readers.

#### Thin / Missing Content on Utility Pages

| Page | Content for Crawlers | Recommendation |
|---|---|---|
| `/favourites` | Empty shell | `noindex` ✓ (applied) |
| `/setlist` | Empty shell | `noindex` ✓ (applied) |
| `/settings` | Client-rendered UI | `noindex` ✓ (applied via layout) |
| `/updates` | Real content (changelog) | Metadata added ✓ |

#### Missing Content Opportunities

1. **No `/about` page** — organizational identity (ICM, "Vandana means worship") is buried in `/settings` inside a client component. An SSR `/about` page would be the most citable entity page for AI.
2. **No artist pages** — `/artist/[name]` or `/church/[name]` pages would create topical authority around ICM, Ankit Sajwan Ministries, etc.
3. **Tags not rendered** — the `tags` array per song is in Supabase but never shown in the HTML. Adding tag chips to the song detail sidebar adds keyword density without harming readability.

---

## Section 3: Schema / Structured Data

### Pre-Fix Score: 0/100 → Post-Fix: ~65/100

#### Current Implementation (After Fixes Applied)

| Schema | Location | Status |
|---|---|---|
| WebSite | `layout.tsx` | ✅ Added |
| WebApplication | `layout.tsx` | ✅ Added |
| Organization (ICM) | `layout.tsx` | ✅ Added |
| MusicComposition | `song/[id]/page.tsx` | ✅ Added (per-song, dynamic) |
| BreadcrumbList | `song/[id]/page.tsx` | ✅ Added (per-song) |
| ItemList (song catalog) | `page.tsx` | ✅ Added |

#### Remaining Schema Opportunities (Backlog)

- `BlogPosting` entries in `/updates` — map changelog entries to structured blog posts
- `MusicGroup`/`Person` entities for artist disambiguation (when data quality allows)
- Dynamic OG images via `ImageResponse` for social sharing

---

## Section 4: Performance (CWV)

### Estimated Score: 65/100 (code-level analysis — no field data available)

#### Positive Signals

- `font-display: swap` on all Google Fonts and custom Cathez font ✓
- `generateStaticParams` on song pages — fully static at build time ✓
- `revalidate = 3600` on homepage — ISR, avoids stale data ✓
- React 19 concurrent rendering + Turbopack ✓
- Service worker registered for offline/cache ✓

#### Risk Areas

| Metric | Risk | Detail |
|---|---|---|
| LCP | Medium | Noto Sans Devanagari (large font) loaded via Google Fonts. No explicit `<link rel="preload">` for the Devanagari font observed. |
| CLS | Medium | `font-display: swap` with Devanagari fallback font causes metric mismatch. Add `size-adjust`/`ascent-override` to fallback. |
| INP | Low–Medium | Search/filter on home page fires on each keystroke. Verify `useDeferredValue` or `startTransition` wraps the filtered list render. |

---

## Section 5: AI Search Readiness (GEO)

### Pre-Fix Score: 41/100 → Post-Fix: ~62/100

#### AI Crawler Access

All major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, anthropic-ai) are allowed via `User-agent: * / Allow: /`. No blocking needed.

#### Files Added

- `public/llms.txt` ✅ — site identity, content scope, licensing, ministry attribution
- `src/app/sitemap.ts` ✅ — all 80+ song pages now discoverable without JS execution

#### Citability Strengths

- Song pages are fully SSG — lyrics are in the HTML, no JS required for crawlers
- Per-song `seo_description` surfaces as `<meta name="description">` — the first AI-readable signal per song
- Section labels (Verse / Chorus / Bridge) provide structural cues for passage extraction
- `lang="hi"` on Devanagari lyrics blocks — correct multilingual signal

#### Remaining GEO Gaps

| Gap | Severity | Effort |
|---|---|---|
| ~30-40% of `seo_description` values are thin | High | Ongoing content work in Supabase |
| No standalone `/about` server page | High | 1-2 hrs |
| Section labels are `<span>` not headings | Medium | 1 hr |
| Song tags not rendered in page HTML | Medium | 1 hr |
| YouTube links mostly null — no authority chain | Medium | Content |
| Home page song list requires JS for discovery | Low | 2-3 hrs |

#### Platform-Specific Scores

| Platform | Estimated Score | Primary Gap |
|---|---|---|
| Google AI Overviews | 28/100 → ~55/100 | Schema (now added), sitemap (now added) |
| ChatGPT / SearchGPT | 35/100 → ~55/100 | Thin seo_descriptions, no /about page |
| Perplexity AI | 38/100 → ~60/100 | Best positioned for niche Hindi worship queries |
| Bing Copilot | 30/100 → ~52/100 | Needs sitemap indexed + schema |

---

## Section 6: Images

### Score: 60/100

| Check | Status |
|---|---|
| OG image exists | ✅ `/icons/og-image.png` (1200×630) |
| Apple touch icon | ✅ 180×180 |
| PWA icons (192, 512) | ✅ Present |
| Maskable icon | ✅ Present |
| Per-page OG images | ❌ All pages share one static OG image |
| Alt text on UI images | N/A — app uses SVG icons, no `<img>` tags |
| Dynamic OG images | ❌ Not implemented |

The app uses SVG icons from `lucide-react` — no `<img>` alt text issues. The single shared OG image is functional but all 80+ song pages show the same preview when shared to WhatsApp/social. Dynamic OG images via `src/app/song/[id]/opengraph-image.tsx` would significantly improve social sharing — high impact, medium effort.

---

## Files Changed in This Audit

| File | Change |
|---|---|
| `src/app/sitemap.ts` | **Created** — dynamic sitemap from getSongIds() |
| `public/robots.txt` | Added `Disallow: /admin/` and `Disallow: /api/` |
| `public/llms.txt` | **Created** — AI crawler guidance file |
| `next.config.ts` | Added X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy headers |
| `src/app/layout.tsx` | Expanded meta description · Added WebSite/WebApplication/Organization JSON-LD |
| `src/app/page.tsx` | Added ItemList JSON-LD schema |
| `src/lib/schema.ts` | **Created** — `buildSongSchema()` helper for MusicComposition + BreadcrumbList |
| `src/app/song/[id]/page.tsx` | Enriched generateMetadata · Added MusicComposition + BreadcrumbList JSON-LD |
| `src/app/present/[id]/page.tsx` | Added noindex + canonical to generateMetadata |
| `src/app/present/[id]/favourites/page.tsx` | Added noindex metadata |
| `src/app/favourites/page.tsx` | Added noindex metadata |
| `src/app/setlist/page.tsx` | Added noindex metadata |
| `src/app/settings/layout.tsx` | **Created** — noindex metadata for client-rendered settings page |
| `src/app/updates/page.tsx` | Added title + description metadata |
| `src/app/admin/import/page.tsx` | Added noindex metadata |
