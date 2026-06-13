# Vandana v3 Roadmap

Feature set reviewed and prioritized in June 2026. Items marked ✅ ship in v3.0.0.
Constraint that shapes every choice here: **no paid services** — everything must be
free-tier, client-side, or static.

## UI/UX

- ✅ **Search snippets** — when a result matched inside the lyrics, show the matched
  line under the title with the query highlighted, so people know *why* it matched.
- ✅ **Setlist reordering** — worship sets have an order; up/down controls per song
  (more reliable than drag on mobile).
- ✅ **A–Z letter jump** — a quiet letter strip while browsing filters the 3,000-song
  library to one initial, the pattern every Android contacts app already taught.
- ✅ **Present mode: blank screen** — every projection tool has it; during prayer the
  leader blanks the screen (button + `B` key, tap to restore).
- ✅ **Present mode: swipe between setlist songs** — matching the ArrowLeft/Right keys.
- ✅ **Long-press hint** — one-time dismissible tip teaching hold-to-favourite, shown
  only after a couple of songs viewed and no favourites yet.
- ✅ **Auto theme** — third option following the system light/dark preference.
  Dark stays the default.
- ✅ **Hindi UI labels** — App language setting (English / हिंदी) covering navigation,
  headers, common buttons, and empty states. Lyrics language stays a separate setting.

## Features

- ✅ **Share as image** — song sections and the daily verse render to a Sacred Noir
  card (canvas, client-side) and share via the native share sheet — built for the
  WhatsApp-forward culture of the Indian church. Download fallback on desktop.
- ✅ **Report a lyric mistake** — link on every song page, pre-filled email. The
  congregation sings these songs weekly; let them close the quality loop.
- ✅ **Update toast** — was already shipped ("New version ready → Update").
- ✅ **PWA shortcuts** — long-press the installed icon → Setlist / Favourites / Library.

## Deliberately not doing

- **Chords / transposition** — turns a devotional reader into a musician's tool;
  against the product soul in `PRODUCT.md`. Revisit only with strong user pull.
- **Accounts / cross-device sync** — heavy lift, breaks "nothing to log into",
  and would need paid infrastructure at scale.
- **Analytics** — the app promises "no tracking, ever". Keep the promise.

## Later (good candidates for v3.x)

- Per-language splitting of the lyric search index to cut its size further.
- Favourites folders/labels (e.g. "Sunday", "Youth") once favourites lists grow.
- Sticky letter headers in the song list as an alternative to the letter strip.
- A "tonight" share card for a whole setlist (song order as an image for the team).
