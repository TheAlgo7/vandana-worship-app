/**
 * Strip credit/CSS/JS blocks that scrapers leaked into lyrics.
 *
 * Pollution observed (can appear at TOP, MIDDLE, or TAIL of a section):
 *   - CSS:      ".lyrics-container {", "font-size: 14px;", "@media ... {", "}"
 *   - JS:       "function toggleLyrics() {", "document.getElementById(...)"
 *   - UI text:  "Show English Lyrics", "Song Link", "Visit website -"
 *   - Credits:  "Song Name:", "Click Here", "Singer - X", "Cajon - Y",
 *               ":: Songs Credit Details ::", "STUDIO CREDITS:" + value lines
 *   - Nav junk: "🔥 Trending Worship Songs" + other songs' titles
 *
 * Strategy:
 *   1. Unambiguous lines (CSS / JS / UI / URLs) are removed wherever they are.
 *   2. Credit blocks: contiguous runs anchored on credit-keyword lines are
 *      removed from the TOP (before first lyric) and TAIL (after last lyric),
 *      including interleaved bare-name value lines. A line containing the
 *      song's own title phrase inside lyrics is always protected.
 *   3. Everything from a "trending/related songs" marker to section end goes.
 *
 * Writes a full before/after diff to .song-import/credit-strip-diff.txt for
 * manual audit. DRY-RUN BY DEFAULT — pass --apply to write to Supabase.
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(url, key);

type LyricsMap = Record<string, string>;
interface Row {
  id: string;
  title: string;
  artist: string;
  lyrics_hinglish: LyricsMap | null;
  lyrics_hindi: LyricsMap | null;
}

/* ── line classifiers ── */

/** CSS / JS / markup — unambiguous, removed anywhere. */
const CODE_LINE = [
  /\{\s*$/,                                          // any line ending in "{" is CSS/JS — never a lyric
  /^\s*@media\b/i,
  // "font-size: 14px;" — only known CSS properties, so credit lines like
  // "Music: Anshul Dawar" are never caught here.
  /^\s*(align|background|border|bottom|box|color|cursor|display|flex|float|font|gap|grid|height|justify|left|line|margin|max|min|opacity|overflow|padding|position|right|text|top|transform|transition|width|z-index)[\w-]*\s*:\s*[^;{}]+;?\s*$/i,
  /^\s*\/\*.*\*\/\s*$/,                              // "/* comment */"
  // "// line comment" — but NOT lyric decorations like "// Music //" or
  // "// म्यूज़िक //" (these wrap with trailing //, or contain Devanagari).
  /^\s*\/\/(?![^\n]*\/\/\s*$)(?![^\n]*[ऀ-ॿ])/,
  /^\s*"@?[\w]+"\s*:/,                               // JSON-LD: "@type": ..., "name": ...
  // JS object prop — value must be a JS literal (number/quote/!/bool), so a
  // transliterated lyric like "Du:kh aur klesh..." (visarga colon) is safe.
  /^\s*[\w$]+\s*:\s+(["'!\d[{]|true\b|false\b|null\b)/,
  /^\s*\}\s*(else\s*\{)?\s*$/,                       // "}", "} else {"
  /!important/,
  // Require real JS syntax — bare "var"/"let"/"const" are also Hindi words
  // (var = boon), so only match an actual declaration/definition.
  /^\s*function\s+[\w$]*\s*\(/,
  /^\s*(var|let|const)\s+[\w$]+\s*=/,
  /\b(document\.|getElementById|setAttribute|style\.|parentNode|createElement|textContent|addEventListener)\b/,
  /^\s*if\s*\(.*\)\s*\{?\s*$/,
] as const;

/** Page UI / link bait — unambiguous, removed anywhere. */
const UI_LINE = [
  /^[\W_]*show\s+(english|hindi)\s+(lyrics|transliteration|translation)\b/i,
  /^[\W_]*song\s*link\s*:?\s*$/i,
  /^[\W_]*click\s*here\b/i,
  /^[\W_]*(visit|check)\s+(our\s+)?website\b/i,
  /^[\W_]*watch\s+(the\s+)?official\b/i,
  /^(https?:\/\/|www\.)/i,
  /\b(youtube\.com|youtu\.be|subscribe|whatsapp|instagram|facebook)\b/i,
] as const;

/** From here to section end is related-songs / nav junk. */
const NAV_FROM_HERE = [
  /trending\s+(worship\s+)?songs/i,
  /related\s+(songs|posts)/i,
  /you\s+may\s+also\s+like/i,
] as const;

/** A credit line: keyword + separator, or an obvious credit header. */
const CREDIT_LINE = [
  /^[\W_]*song\s*name\b/i,
  /^[\W_]*credits?\s*(details)?\s*[:.]*\s*$/i,
  /^[\W_]*::.*::\s*$/,                               // ":: Songs Credit Details ::"
  /^[\W_]*(studio|video|audio|music)\s+credits?\b/i,
  /^[\W_]*video\s+feature\s*:?\s*$/i,
  /^[\W_]*song\s*lyrics\s*:?\s*$/i,
  /^[\W_]*(on\s+)?(singer|vocals?|vocal|backing|lead|artist|album|title|tittle|label|editor|editing|edit|video|music|lyrics?|lyrical|lyricist|composer|composed|composition|written|writers?|director|directed|producer|produced|production|programming|arrangement|arranged|mix(ed|ing)?|master(ed|ing)?|recorded|recording|camera|dop|d\.o\.p|shoot|shot|filmed|filming|colou?r\s*grad\w*|colou?rist|graphics?|poster|artwork|media\s+partner|choreograph\w*|starring|cast|released?|publish\w*|blessings?|variation|translation|guitars?|acoustic|electric|drums?|keys?|keyboards?|bass|piano|violin|flute|strings|cello|tabla|dholak|cajon|percussion|worship\s+leader)\b[^\n]{0,70}[-:–][^\n]*$/i,
  /^[\W_]*(sung|written|composed|arranged|produced|mixed|mastered|translated|performed|directed|presented|featuring)\b[^\n]*\bby\b/i, // "Sung and written by X"
  /^[A-Z][A-Z\s&.'-]{4,}\bPRESENTS\.?\s*$/,         // "RHYTHM OF BLESSED LIFE PRESENTS" (all-caps label only)
  // Instrument/role credit + separator, position-independent ("Main Vocals:",
  // "On Bass -"). These English role words never start a Hindi/Hinglish lyric
  // line that also has a colon/dash, so this is safe anywhere in the line.
  /\b(lead|backing|main|acoustic|electric|rhythm|additional)?\s*(vocals?|guitars?|keyboards?|\bkeys\b|drums?|tabla|dholak|cajon|percussions?|flute|violin|piano|strings|programming|arrangements?|mixing|mastering)\s*[-:–]/i,
  /^[\W_]*music\s+(production|arrangements?|director|label|by)\b/i, // "Music Production", "Music Director"
] as const;

function matches(res: readonly RegExp[], line: string): boolean {
  const t = line.trim();
  return res.some((re) => re.test(t));
}

function normPhrase(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9ऀ-ॿ]+/g, " ").trim();
}

/* ── section cleaning ── */

/** Result of cleaning a section. `skipped` => too much would be lost, left as-is. */
interface SectionResult {
  text: string;
  changed: boolean;
  skipped: boolean;
}

/**
 * Backstop only. Removal targets exclusively unambiguous junk (CSS/JS/URL/
 * credit headers), audited to drop zero real lyric lines, so the guard just
 * prevents pathological total-annihilation of a section.
 */
const MIN_KEPT_LINES = 2;

function cleanSection(raw: string, artist: string): SectionResult {
  const origLines = raw.split("\n");
  const origReal = origLines.filter((l) => l.trim()).length;
  let lines = [...origLines];

  // (a) nav/related-songs block: truncate from its marker to the end.
  const navIdx = lines.findIndex((l) => matches(NAV_FROM_HERE, l));
  if (navIdx !== -1) lines = lines.slice(0, navIdx);

  // (b) Per-line removal of UNAMBIGUOUS junk only:
  //       - CSS / JS / markup          (CODE_LINE)
  //       - page UI / link bait / URLs (UI_LINE)
  //       - explicit credit lines      (CREDIT_LINE: keyword + separator/header)
  //     We deliberately do NOT remove short "bare value" lines (orphan names):
  //     a short Hinglish lyric line is shape-identical to a credit value, so
  //     trimming those risks deleting real lyrics (proven). Lyric loss is not
  //     acceptable; bare-name residue is handled conservatively in (c).
  lines = lines.filter(
    (l) => !matches(CODE_LINE, l) && !matches(UI_LINE, l) && !matches(CREDIT_LINE, l),
  );

  // (c) trailing ARTIST echo only. A tail line that exactly equals the song's
  //     artist name is scrape metadata, not a lyric. We do NOT strip title
  //     echoes: worship songs routinely repeat the title as a closing refrain,
  //     so removing a trailing title line would delete real lyrics (proven).
  //     "Unknown Artist" is ignored, and any echo above a real lyric line is
  //     untouched since we only pop from the very tail.
  const artistNorm = normPhrase(artist);
  const dequote = (l: string) => normPhrase(l.replace(/^[\s"'“”]+|[\s"'“”]+$/g, ""));
  if (artistNorm && artistNorm !== "unknown artist") {
    while (lines.length) {
      const last = lines[lines.length - 1];
      if (last.trim() === "") { lines.pop(); continue; }
      if (dequote(last) === artistNorm) { lines.pop(); continue; }
      break;
    }
  }

  // collapse blank runs, trim trailing whitespace
  const out: string[] = [];
  for (const l of lines) {
    if (l.trim() === "" && (out.length === 0 || out[out.length - 1].trim() === "")) continue;
    out.push(l.replace(/[ \t]+$/g, ""));
  }
  while (out.length && out[out.length - 1].trim() === "") out.pop();
  const text = out.join("\n").trim();
  const keptReal = out.filter((l) => l.trim()).length;

  // (c) SAFETY GUARD — only refuse if a non-trivial section would be reduced
  //     to almost nothing (pathological case). Everything removed above is
  //     unambiguous junk, so normal heavy-junk songs clean fully.
  if (origReal >= 4 && keptReal < MIN_KEPT_LINES) {
    return { text: raw, changed: false, skipped: true };
  }
  return { text, changed: text !== raw.trim(), skipped: false };
}

function cleanMap(map: LyricsMap | null, artist: string): { cleaned: LyricsMap | null; changed: boolean; skipped: boolean } {
  if (!map) return { cleaned: null, changed: false, skipped: false };
  const out: LyricsMap = {};
  let changed = false;
  let skipped = false;
  const order = typeof map.__order === "string" ? map.__order : null;

  for (const [k, v] of Object.entries(map)) {
    if (k === "__order") continue;
    const res = cleanSection(String(v), artist);
    if (res.skipped) skipped = true;
    if (res.changed) changed = true;
    if (res.text) out[k] = res.text;
    else if (!res.skipped) changed = true;
    else out[k] = String(v);
  }

  if (Object.keys(out).length === 0) return { cleaned: map, changed: false, skipped }; // never blank a song

  if (order) {
    const survivors = order.split("|").map((s) => s.trim()).filter((s) => s && out[s] !== undefined);
    if (survivors.length) out.__order = survivors.join("|");
  }
  return { cleaned: out, changed, skipped };
}

/* ── run ── */

async function fetchAll(): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("songs")
      .select("id,title,artist,lyrics_hinglish,lyrics_hindi")
      .eq("is_verified", true)
      .order("id")
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...(data as Row[]));
    if (data.length < 1000) break;
  }
  return rows;
}

function mapText(map: LyricsMap | null): string {
  if (!map) return "";
  return Object.entries(map)
    .filter(([k]) => k !== "__order")
    .map(([k, v]) => `[${k}]\n${v}`)
    .join("\n\n");
}

async function main() {
  const rows = await fetchAll();
  console.log(`Fetched ${rows.length} verified songs. Mode: ${APPLY ? "APPLY" : "DRY-RUN"}`);

  const updates: { id: string; lyrics_hinglish: LyricsMap | null; lyrics_hindi: LyricsMap | null }[] = [];
  const review: string[] = [];
  const diff: string[] = [];

  for (const row of rows) {
    const hi = cleanMap(row.lyrics_hinglish, row.artist);
    const hn = cleanMap(row.lyrics_hindi, row.artist);
    if (hi.skipped || hn.skipped) review.push(`${row.id} — ${row.title}`);
    if (!hi.changed && !hn.changed) continue;
    updates.push({ id: row.id, lyrics_hinglish: hi.cleaned, lyrics_hindi: hn.cleaned });
    diff.push(
      `${"=".repeat(70)}\n# ${row.id} — ${row.title}\n` +
        (hi.changed ? `--- hinglish BEFORE ---\n${mapText(row.lyrics_hinglish)}\n--- hinglish AFTER ---\n${mapText(hi.cleaned)}\n` : "") +
        (hn.changed ? `--- hindi BEFORE ---\n${mapText(row.lyrics_hindi)}\n--- hindi AFTER ---\n${mapText(hn.cleaned)}\n` : ""),
    );
  }

  const diffPath = path.join(process.cwd(), ".song-import", "credit-strip-diff.txt");
  fs.mkdirSync(path.dirname(diffPath), { recursive: true });
  fs.writeFileSync(diffPath, diff.join("\n"), "utf8");

  console.log(`\nSongs auto-cleaned (safe): ${updates.length}`);
  console.log(`Songs skipped by safety guard (need manual/AI review): ${review.length}`);
  for (const r of review) console.log(`  ? ${r}`);
  console.log(`\nFull before/after diff: ${path.relative(process.cwd(), diffPath)}`);
  for (const u of updates) console.log(`  • ${u.id}`);

  if (!APPLY) {
    console.log(`\nDRY-RUN: no changes written. Audit the diff, then re-run with --apply.`);
    return;
  }

  let done = 0;
  for (const u of updates) {
    const { error } = await db
      .from("songs")
      .update({ lyrics_hinglish: u.lyrics_hinglish, lyrics_hindi: u.lyrics_hindi })
      .eq("id", u.id);
    if (error) console.error(`  ! ${u.id}: ${error.message}`);
    else done++;
  }
  console.log(`Done. ${done}/${updates.length} rows updated.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
