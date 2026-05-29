/**
 * Quality triage + lyric cleanup for the Supabase song library.
 *
 * Two jobs, in one pass:
 *  1. CLEAN  — strip scraped page-boilerplate lines (credits blocks, "Lyrics"
 *              headers, "...song lyrics chords" SEO tails), normalise stray \r,
 *              and drop sections that become empty. Real lyrics are preserved.
 *  2. GATE   — set is_verified = false for songs that are still stubs after
 *              cleaning (< MIN_LINES real lyric lines, in every language).
 *
 * Curated songs shipped in src/data/songs/*.json are always forced verified.
 *
 * DRY-RUN BY DEFAULT. Pass --apply to write changes. Pass --limit=N to sample.
 *
 *   npx tsx scripts/triage-quality.ts            # dry-run, full report
 *   npx tsx scripts/triage-quality.ts --apply    # write to Supabase
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);
const MIN_LINES = 4;

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
  languages_available: string[] | null;
  lyrics_hinglish: LyricsMap | null;
  lyrics_hindi: LyricsMap | null;
}

/** A trimmed line matching any of these is scrape boilerplate, not a lyric. */
const BOILERPLATE_LINE = [
  /^lyrics\s*(\(.*\))?[:.]?$/i,                       // "Lyrics", "Lyrics (Hindi)", "Lyrics (English Transliteration)"
  /\blyrics?\s+in\s+(hindi|english)\b/i,             // "Lyrics in Hindi", "🎵 Lyrics in English (Romanized)"
  /song\s*details?\b/i,                              // "Song Details", "📌 Song Details", "...& Credits"
  /^(audio|video|music)\s*credits?\b/i,              // "Audio Credits", "Video Credits"
  // Credit/production line: starts with a credit keyword and contains a colon
  // ("Composition and Lyrics: ...", "Music Label: ...", "Featured Artists: ...").
  /^(artist|singer|vocals?|backing|lead|chorus|music|composer|composition|composed|written|writer|lyrics?|lyricist|produced|producer|production|originally|director|directed|mixed|mixing|mastered|mastering|programming|program|arrangement|arranged|guitars?|drums?|keys?|keyboard|bass|piano|violin|flute|strings|cello|tabla|dholak|recorded|recording|label|released?|publisher|publishing|copyright|distributed|distribution|featured|feat\.?|ft\.?)\b[^\n]*:/i,
  /\b(jesus|yeshu|stuti|hindi)\b[^\n]*\bsong\s+lyrics(\s+chords)?\b/i, // "...Jesus song Lyrics chords"
  /\bhindi\s+version\s+lyrics\b/i,
  /\bnew\s+(christian\s+)?hindi\s+(worship\s+)?song\b/i,
  /\bchristian\s+(hindi\s+)?(worship\s+)?song\s+lyrics\b/i,
  /\blyrics\s+and\s+chords\b/i,
  /\bchords\s+and\s+lyrics\b/i,
  /^\[[^\]]*\]$/,                                    // whole line is a "[ Artist | Label ]" credit
  /^\|[^|]*\|$/,                                     // whole line is a "| Production |" credit
  /\bchristian\s+song\b/i,                           // "X Christian Song", SEO blurbs (never appears in real lyrics)
  /\bread\s+(the\s+)?full\s+lyrics\b/i,              // SEO description sentences
  /^[([]?\s*(verse|chorus|bridge|pre[\s-]?chorus|prechorus|intro|outro|tag|interlude|refrain|hook|coda)\s*:?\s*\d*\s*[)\]]?$/i, // inline "Verse : 1", "(Chorus)" labels
] as const;

const DEVANAGARI_RE = /[ऀ-ॿ]/;

function isBoilerplate(line: string): boolean {
  return BOILERPLATE_LINE.some((re) => re.test(line));
}

/** Clean one section's multiline text. Returns "" if nothing real remains. */
function cleanText(raw: string): string {
  const kept = raw
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .filter((l) => !isBoilerplate(l.trim()));
  // collapse 3+ blank lines to a single blank, trim ends
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Clean a whole language map; drop emptied sections and prune them from __order. */
function cleanMap(map: LyricsMap | null): { cleaned: LyricsMap | null; changed: boolean; lines: number } {
  if (!map) return { cleaned: null, changed: false, lines: 0 };
  const out: LyricsMap = {};
  let changed = false;
  let lines = 0;
  const order = typeof map.__order === "string" ? map.__order : null;

  for (const [key, value] of Object.entries(map)) {
    if (key === "__order") continue;
    const cleaned = cleanText(String(value));
    if (cleaned !== String(value)) changed = true;
    if (cleaned) {
      out[key] = cleaned;
      lines += cleaned.split("\n").filter((l) => l.trim()).length;
    } else {
      changed = true; // section dropped
    }
  }

  if (order) {
    const survivors = order
      .split("|")
      .map((k) => k.trim())
      .filter((k) => k && out[k] !== undefined);
    const rebuilt = survivors.join("|");
    if (survivors.length) {
      if (rebuilt !== order) changed = true;
      out.__order = rebuilt;
    } else if ("__order" in map) {
      changed = true; // order dropped entirely
    }
  }

  return { cleaned: Object.keys(out).filter((k) => k !== "__order").length ? out : null, changed, lines };
}

function loadCuratedIds(): Set<string> {
  const dir = path.join(process.cwd(), "src", "data", "songs");
  if (!fs.existsSync(dir)) return new Set();
  const ids = new Set<string>();
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".json")) continue;
    try {
      const song = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as { id?: string };
      if (song.id) ids.add(song.id);
    } catch { /* ignore */ }
  }
  return ids;
}

async function fetchAll(): Promise<Row[]> {
  const rows: Row[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from("songs")
      .select("id,title,artist,languages_available,lyrics_hinglish,lyrics_hindi")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...(data as Row[]));
    if (data.length < PAGE) break;
  }
  return rows;
}

async function main() {
  const curated = loadCuratedIds();
  const rows = await fetchAll();
  console.log(`Fetched ${rows.length} songs. Curated (always-verified): ${curated.size}. Mode: ${APPLY ? "APPLY" : "DRY-RUN"}`);

  let cleanedCount = 0;
  let unverifyCount = 0;
  const unverifySamples: string[] = [];
  const cleanSamples: string[] = [];
  const updates: { id: string; lyrics_hinglish: LyricsMap | null; lyrics_hindi: LyricsMap | null; is_verified: boolean }[] = [];

  const pool = LIMIT > 0 ? rows.slice(0, LIMIT) : rows;

  for (const row of pool) {
    const hi = cleanMap(row.lyrics_hinglish);
    const hn = cleanMap(row.lyrics_hindi);

    const realLines = Math.max(hi.lines, hn.lines);
    const isCurated = curated.has(row.id);
    const verified = isCurated || realLines >= MIN_LINES;

    const lyricsChanged = hi.changed || hn.changed;
    const becomesUnverified = !verified;

    if (lyricsChanged && cleanSamples.length < 12 && (hi.changed || hn.changed)) {
      cleanSamples.push(`  • ${row.title} (${row.artist}) — hi:${hi.lines}ln`);
    }
    if (becomesUnverified) {
      unverifyCount++;
      if (unverifySamples.length < 30) {
        unverifySamples.push(`  ✗ ${row.title} (${row.artist}) — ${realLines} real line(s)`);
      }
    }
    if (lyricsChanged) cleanedCount++;

    if (lyricsChanged || becomesUnverified) {
      updates.push({
        id: row.id,
        lyrics_hinglish: hi.cleaned,
        lyrics_hindi: hn.cleaned,
        is_verified: verified,
      });
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Songs whose lyrics get cleaned : ${cleanedCount}`);
  console.log(`Songs flagged UNVERIFIED       : ${unverifyCount}`);
  console.log(`Rows to update                 : ${updates.length}`);
  console.log(`\n--- sample cleaned ---\n${cleanSamples.join("\n")}`);
  console.log(`\n--- sample hidden (unverified) ---\n${unverifySamples.join("\n")}`);

  if (!APPLY) {
    console.log(`\nDRY-RUN: no changes written. Re-run with --apply to commit.`);
    return;
  }

  console.log(`\nApplying ${updates.length} updates...`);
  let done = 0;
  for (const u of updates) {
    const { error } = await db
      .from("songs")
      .update({ lyrics_hinglish: u.lyrics_hinglish, lyrics_hindi: u.lyrics_hindi, is_verified: u.is_verified })
      .eq("id", u.id);
    if (error) {
      console.error(`  ! ${u.id}: ${error.message}`);
      continue;
    }
    done++;
    if (done % 25 === 0) console.log(`  ...${done}/${updates.length}`);
  }
  console.log(`Done. ${done}/${updates.length} rows updated.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
