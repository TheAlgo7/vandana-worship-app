/**
 * Focused junk-token cleanup for the live Supabase song library.
 *
 * SAFE BY DESIGN — removes only unambiguous scrape noise, never lyric words,
 * and never touches is_verified (so no song is hidden by this pass):
 *
 *   1. Repetition markers      (x2) (2x) (x 4) ( 4 x )   -> removed
 *   2. Dotted continuations    "koee khoobee ........"   -> trailing dots removed
 *   3. Trailing repeat-counts  "Yeshu raja.. - 4" "-2"   -> "- N" / "xN" tail removed
 *   4. Lines left empty / marker-only                    -> dropped
 *   5. Single-blob re-section: if a song's only section still contains blank-line
 *      separated stanzas, split into verse1..N (recovers lost positioning).
 *
 * Section order is preserved via the existing `__order` convention.
 *
 * DRY-RUN BY DEFAULT. Pass --apply to write. Pass --limit=N to sample.
 *
 *   npx tsx scripts/clean-lyric-junk.ts            # dry-run report
 *   npx tsx scripts/clean-lyric-junk.ts --apply    # write to Supabase
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);

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
  lyrics_hinglish: LyricsMap | null;
  lyrics_hindi: LyricsMap | null;
}

/** Parenthesised repetition markers: (x2) (2x) (x 4) ( 4x ) — require a digit. */
const PAREN_MARKER = /\(\s*(?:[xX]\s*\d+|\d+\s*[xX])\s*\)/g;
/** Runs of 2+ dots — scrape continuation cues, never meaningful here. */
const DOT_RUN = /\.{2,}/g;
/** Trailing repeat-count tail on a line: " - 4", " -2", " x2", " 4x" (after dots stripped). */
const TRAILING_COUNT = /[\s,;।]*(?:[-–—]\s*\d+|[xX]\s*\d+|\d+\s*[xX])\s*$/;
/** A line that is nothing but a marker / number / punctuation once trimmed. */
const MARKER_ONLY = /^[\s\-–—.,;:()xX\d।]*$/;

/** Clean one line. Returns "" if it collapses to noise. */
function cleanLine(line: string): string {
  let l = line.replace(/\r/g, "");
  l = l.replace(PAREN_MARKER, " ");
  l = l.replace(DOT_RUN, " ");
  // strip a trailing repeat-count tail (may appear twice: "teri - 8 - 2")
  let prev: string;
  do {
    prev = l;
    l = l.replace(TRAILING_COUNT, "");
  } while (l !== prev);
  l = l.replace(/[ \t]{2,}/g, " ").replace(/[ \t]+$/g, "");
  if (MARKER_ONLY.test(l)) return "";
  return l;
}

/** Clean a multiline section. Returns "" if nothing real remains. */
function cleanSection(raw: string): string {
  const lines = raw.split("\n").map(cleanLine);
  // drop emptied lines but keep paragraph structure: collapse 2+ blanks to one
  const out: string[] = [];
  for (const l of lines) {
    if (l.trim() === "" && (out.length === 0 || out[out.length - 1].trim() === "")) continue;
    out.push(l);
  }
  return out.join("\n").trim();
}

/** Split a recovered single blob into verse1..N when blank-line stanzas exist. */
function maybeResection(map: LyricsMap): { map: LyricsMap; resected: boolean } {
  const keys = Object.keys(map).filter((k) => k !== "__order");
  if (keys.length !== 1) return { map, resected: false };
  const text = map[keys[0]];
  const stanzas = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (stanzas.length < 2) return { map, resected: false };
  const rebuilt: LyricsMap = {};
  const order: string[] = [];
  stanzas.forEach((s, i) => {
    const k = `verse${i + 1}`;
    rebuilt[k] = s;
    order.push(k);
  });
  rebuilt.__order = order.join("|");
  return { map: rebuilt, resected: true };
}

/** Clean a whole language map; returns null only if it was already null. */
function cleanMap(map: LyricsMap | null): { cleaned: LyricsMap | null; changed: boolean; resected: boolean } {
  if (!map) return { cleaned: null, changed: false, resected: false };
  const out: LyricsMap = {};
  let changed = false;
  const order = typeof map.__order === "string" ? map.__order : null;

  for (const [key, value] of Object.entries(map)) {
    if (key === "__order") continue;
    const cleaned = cleanSection(String(value));
    if (cleaned !== String(value)) changed = true;
    if (cleaned) out[key] = cleaned;
    else changed = true; // section emptied
  }

  if (Object.keys(out).length === 0) {
    // Never blank out a song entirely — keep original rather than destroy data.
    return { cleaned: map, changed: false, resected: false };
  }

  if (order) {
    const survivors = order.split("|").map((k) => k.trim()).filter((k) => k && out[k] !== undefined);
    if (survivors.length) out.__order = survivors.join("|");
  }

  const { map: finalMap, resected } = maybeResection(out);
  return { cleaned: finalMap, changed: changed || resected, resected };
}

async function fetchAll(): Promise<Row[]> {
  const rows: Row[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from("songs")
      .select("id,title,lyrics_hinglish,lyrics_hindi")
      .eq("is_verified", true)
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
  const rows = await fetchAll();
  console.log(`Fetched ${rows.length} verified songs. Mode: ${APPLY ? "APPLY" : "DRY-RUN"}`);

  let cleanedCount = 0;
  let resectionCount = 0;
  const samples: string[] = [];
  const updates: { id: string; lyrics_hinglish: LyricsMap | null; lyrics_hindi: LyricsMap | null }[] = [];

  const pool = LIMIT > 0 ? rows.slice(0, LIMIT) : rows;

  for (const row of pool) {
    const hi = cleanMap(row.lyrics_hinglish);
    const hn = cleanMap(row.lyrics_hindi);
    if (!hi.changed && !hn.changed) continue;

    cleanedCount++;
    if (hi.resected || hn.resected) resectionCount++;
    if (samples.length < 20) {
      samples.push(`  • ${row.title}${hi.resected || hn.resected ? "  [re-sectioned]" : ""}`);
    }
    updates.push({ id: row.id, lyrics_hinglish: hi.cleaned, lyrics_hindi: hn.cleaned });
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Songs cleaned        : ${cleanedCount}`);
  console.log(`  of which re-sected : ${resectionCount}`);
  console.log(`Rows to update       : ${updates.length}`);
  console.log(`\n--- sample ---\n${samples.join("\n")}`);

  if (!APPLY) {
    console.log(`\nDRY-RUN: no changes written. Re-run with --apply to commit.`);
    return;
  }

  console.log(`\nApplying ${updates.length} updates...`);
  let done = 0;
  for (const u of updates) {
    const { error } = await db
      .from("songs")
      .update({ lyrics_hinglish: u.lyrics_hinglish, lyrics_hindi: u.lyrics_hindi })
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
