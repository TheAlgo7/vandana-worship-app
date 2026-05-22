# Vandana Worship App — SEO Action Plan

**Audit Date:** 2026-05-22  
**All Critical and High items have been fixed in this audit session.**  
**This plan covers remaining Medium and Low items.**

---

## Already Fixed (This Session)

| # | Fix | File(s) |
|---|---|---|
| ✅ | Created `sitemap.ts` — resolves the 404 sitemap | `src/app/sitemap.ts` |
| ✅ | Added `Disallow: /admin/` and `/api/` to robots.txt | `public/robots.txt` |
| ✅ | Created `public/llms.txt` | `public/llms.txt` |
| ✅ | Added security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | `next.config.ts` |
| ✅ | Expanded global meta description from 22 → 155 chars | `src/app/layout.tsx` |
| ✅ | Added WebSite + WebApplication + Organization JSON-LD | `src/app/layout.tsx` |
| ✅ | Added MusicComposition + BreadcrumbList JSON-LD to all song pages | `src/lib/schema.ts`, `src/app/song/[id]/page.tsx` |
| ✅ | Added ItemList JSON-LD to homepage | `src/app/page.tsx` |
| ✅ | Added `noindex` to `/present/[id]` with canonical to `/song/[id]` | `src/app/present/[id]/page.tsx` |
| ✅ | Added `noindex` to `/present/[id]/favourites` | `src/app/present/[id]/favourites/page.tsx` |
| ✅ | Added `noindex` to `/favourites` | `src/app/favourites/page.tsx` |
| ✅ | Added `noindex` to `/setlist` | `src/app/setlist/page.tsx` |
| ✅ | Added `noindex` to `/settings` via layout | `src/app/settings/layout.tsx` |
| ✅ | Added `noindex` to `/admin/import` | `src/app/admin/import/page.tsx` |
| ✅ | Added title + description to `/updates` | `src/app/updates/page.tsx` |
| ✅ | Enriched song page metadata with OG fields and explicit canonical | `src/app/song/[id]/page.tsx` |

---

## Medium Priority — Fix Within 1 Month

### M-1: Create a standalone `/about` server page

**Why:** The About content (ICM attribution, "Vandana means worship", song library scope) is buried inside `/settings` as a `"use client"` component. AI crawlers and Google need a canonical, server-rendered entity page for Vandana. This is the single highest remaining GEO impact item.

**What to build:**
- `src/app/about/page.tsx` — Server Component, 200+ words, prose format
- Content: what Vandana is, what "Vandana" means, ICM partnership, song library scope, creator attribution, link to thealgothrim.com
- Include WebApplication + Organization JSON-LD
- Add to desktop nav or footer so crawlers can reach it

**Effort:** ~1-2 hours

---

### M-2: Audit and improve thin `seo_description` values in Supabase

**Why:** ~30-40% of songs have descriptions like "Hallelujah! Prabhu Mere lyrics in Hindi and Hinglish by Unknown Artist." These are the primary AI-readable signals per song. Thin descriptions = no AI citation advantage.

**What to fix in Supabase `songs` table `seo_description` column:**
1. Replace all "Unknown Artist" descriptions with artist context (genre, thematic reference, first lyric line)
2. Add ministry context for ICM songs: "by Ps. Arul Thomas / Dr. Mahima John Arul, ICM Church"
3. For cover songs, add: "Hindi/Hinglish worship cover, originally by [original artist]" — see `yahweh-sabaoth.json` as the gold standard

**Template:**
```
[Song Title] lyrics in Hindi and Hinglish — [theme/mood] worship song by [artist/ministry]. [First lyric line in Hinglish].
```

**Effort:** Ongoing content work, ~30 min per batch of 10 songs

---

### M-3: Add section label semantics to SongView

**Why:** Lyric section labels (Verse 1, Chorus, Bridge) are rendered as `<span class="section-label">`. Search engines and AI parsers cannot infer document structure from spans.

**Fix in `src/app/song/[id]/SongView.tsx`:**
```tsx
// Change from:
<span className="section-label">{formatSectionLabel(key)}</span>
// To:
<h2 className="section-label" aria-label={formatSectionLabel(key)}>{formatSectionLabel(key)}</h2>
// OR if visual styling prevents h2:
<span className="section-label" role="heading" aria-level={2}>{formatSectionLabel(key)}</span>
```

**Effort:** ~30 minutes

---

### M-4: Render song tags in page HTML

**Why:** The `tags` array per song (e.g., `["worship", "praise", "icm", "hindi", "hinglish", "2025"]`) contains valuable entity signals but is never rendered. It's invisible to crawlers.

**Fix in `SongView.tsx` — add to the Song Details sidebar:**
```tsx
{song.tags.length > 0 && (
  <div>
    <p style={{ ...labelStyle }}>Tags</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {song.tags.map((tag) => (
        <span key={tag} style={{ ...tagChipStyle }}>{tag}</span>
      ))}
    </div>
  </div>
)}
```

**Effort:** ~30 minutes

---

### M-5: Add Content-Security-Policy header

**Why:** The CSP is the most important security header and the one missing. Requires careful testing.

**Process:**
1. First deploy with `Content-Security-Policy-Report-Only` header to discover violations
2. Iteratively tighten the policy based on reports
3. Switch to enforcing `Content-Security-Policy`

**Starting policy for `next.config.ts`:**
```
Content-Security-Policy-Report-Only:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co;
```

**Effort:** ~2 hours including testing

---

### M-6: Add YouTube/Spotify links to more songs in Supabase

**Why:** Songs with `link_youtube` null miss the authority chain that links Vandana's lyrics page to the original artist's well-known content. YouTube channel correlation is the strongest brand signal for AI citations (~0.737 correlation per GEO research).

**Priority songs to add YouTube links for:**
- ICM original songs (Ps. Arul Thomas / Dr. Mahima John Arul)
- Cover songs — link to the original artist's YouTube (e.g., Nathaniel Bassey for Yahweh Sabaoth)

**Effort:** Ongoing, ~5 min per song to find and add the link in Supabase

---

## Low Priority — Backlog

### L-1: Dynamic OG images for song pages

Per-song OG images render the song title in Devanagari/Hinglish, dramatically improving WhatsApp/social sharing (primary distribution channel for Indian worship apps).

**Implementation:** `src/app/song/[id]/opengraph-image.tsx` using Next.js `ImageResponse`

**Effort:** ~3-4 hours

---

### L-2: Server-rendered song directory on homepage as crawler fallback

`HomeContent` is `"use client"` — song titles/links are JS-rendered. Add a server-rendered `<ul>` of song links (visually hidden or below-fold) to ensure 100% JS-free crawlability.

**Effort:** ~1 hour

---

### L-3: Font metric overrides for CLS reduction

Add `size-adjust`, `ascent-override`, `descent-override` to the fallback font definition for Noto Sans Devanagari in `globals.css` to minimize CLS from font-swap.

**Effort:** ~1 hour testing + implementation

---

### L-4: Artist/Ministry pages

Create `/ministry/[slug]` or `/artist/[slug]` pages that aggregate songs by ICM, Ankit Sajwan Ministries, etc. Creates topical authority and additional indexable surface area.

**Effort:** ~4-6 hours (new route + data model)

---

### L-5: Submit sitemap to Google Search Console and Bing Webmaster Tools

Once deployed, manually submit `https://vandanaapp.vercel.app/sitemap.xml` in GSC and Bing to accelerate indexing of the newly created sitemap.

**Effort:** 15 minutes

---

## Estimated Score Improvement

| Phase | Score | Notes |
|---|---|---|
| Pre-audit | 47/100 | Baseline |
| After this session's fixes | ~68/100 | Critical + High items resolved |
| After Medium items (M-1 through M-4) | ~78/100 | About page + content quality + UX semantics |
| After Low/backlog items | ~85/100 | Dynamic OG images + server fallback + artist pages |
