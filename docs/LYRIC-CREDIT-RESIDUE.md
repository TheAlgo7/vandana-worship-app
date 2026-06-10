# Lyric Credit Residue — needs manual / AI review

These verified songs still have **freeform credit/metadata residue** that could
not be removed automatically without risking deletion of real lyrics. The
automated passes (`scripts/strip-credit-blocks.ts`) safely removed all CSS, JS,
JSON-LD, link bait, and keyword-anchored credit lines, but these remainders are
shapes that overlap with lyrics:

- bare contributor names (e.g. `Aaron Gabriel Thomas`) — identical in shape to a
  short Hinglish lyric line, so unsafe to strip by rule
- prefix-led credits the patterns don't anchor (`Song Written, Composed And Sung
  By - X`, `Executive Producers - X`, `Harmonies - X`)
- SEO title tails (`Teri Mahima Ho | Worship Song Lyrics | Robinson Shalu`)
- `Channel Link :`, label echoes (`Christian Singers Music Productions`)

Each needs a human or AI eye to delete the trailing/leading metadata while
keeping every lyric line. The bulk of each song's lyrics is already clean.

## Songs (23)

- [ ] `abhishek`
- [ ] `apni-aankhe-salib-par-uta`
- [ ] `chand-suraj-ki-prastish`
- [ ] `hai-masihah`
- [ ] `i-love-you`
- [ ] `intezaar-hai-tera`
- [ ] `jeevan-hai`
- [ ] `kaise-kahun`
- [ ] `kimti`
- [ ] `main-aya-hoon`
- [ ] `main-toh-tera`
- [ ] `mere-virudh-uthne-wali`
- [ ] `meri-chahat-yeshu`
- [ ] `mujhse-baat-kar`
- [ ] `o-gao-re-christmas`
- [ ] `pure-dil-se`
- [ ] `pyaar-hai-tujhse`
- [ ] `samarth-undel`
- [ ] `stuthi-aradhana`
- [ ] `teri-mahima-ho`
- [ ] `tujhse-acha-koi-bhi-nahi`
- [ ] `zinda-hun-yeshu-mein`
- [ ] `zinda-khuda`

## How to finish these safely

For each song, fetch `lyrics_hinglish` / `lyrics_hindi`, keep the lyric lines,
delete only the trailing/leading metadata, and `update` the row. An AI pass
(send each song's text, ask it to return lyrics-only JSON) is the practical way
to clear all 23 with a human spot-check — automation by pattern is what we
deliberately stopped, because it cannot tell a contributor's name from a one-
or two-word lyric line.
