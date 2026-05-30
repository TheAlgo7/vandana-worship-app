/**
 * Content normalization for the Vandana song library. Three conservative jobs:
 *
 *  1. DEDUPE   — songs with an identical normalised Hinglish lyric body are true
 *                duplicates (same song scraped under different slugs/titles).
 *                Keep the best copy, flag the rest is_verified = false.
 *  2. TITLES   — strip scrape-artifact trailing numbers ("... Parameshvar 3") from
 *                the DISPLAY title only. The id/slug (and thus URLs/favourites)
 *                never changes.
 *  3. TRANSLIT — normalise a small, high-confidence set of proper-noun spelling
 *                variants in Hinglish lyrics (e.g. "yeeshu" -> "Yeshu").
 *
 * DRY-RUN BY DEFAULT. Pass --apply to write.
 *   npx tsx scripts/normalize-content.ts
 *   npx tsx scripts/normalize-content.ts --apply
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
  console.error("Missing Supabase env in .env.local");
  process.exit(1);
}
const db = createClient(url, key);

type LyricsMap = Record<string, string>;
interface Row {
  id: string;
  title: string;
  artist: string;
  church: string | null;
  is_verified: boolean;
  languages_available: string[] | null;
  lyrics_hinglish: LyricsMap | null;
  lyrics_hindi: LyricsMap | null;
}

/* ── Transliteration: whole-word, case-insensitive, canonical proper nouns ── */
const TRANSLIT: Array<[RegExp, string]> = [
  [/\byee?shu\b/gi, "Yeshu"],     // yeeshu / yeshu -> Yeshu
  [/\byesu\b/gi, "Yeshu"],
  [/\bmasee?h\b/gi, "Masih"],     // maseeh -> Masih
  [/\bpara?mes[hv]?war\b/gi, "Parmeshwar"],
  [/\bparameshvar\b/gi, "Parmeshwar"],
  [/\bprabhoo\b/gi, "Prabhu"],
  [/\bhalleluya[ah]*\b/gi, "Hallelujah"],
];

function curatedIds(): Set<string> {
  const dir = path.join(process.cwd(), "src", "data", "songs");
  const ids = new Set<string>();
  if (!fs.existsSync(dir)) return ids;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    try { const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); if (s.id) ids.add(s.id); } catch {}
  }
  return ids;
}

function bodyText(map: LyricsMap | null): string {
  if (!map) return "";
  return Object.entries(map)
    .filter(([k]) => k !== "__order")
    .map(([, v]) => v)
    .join("\n");
}

function normalizeBodyKey(map: LyricsMap | null): string {
  return bodyText(map)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function lineCount(map: LyricsMap | null): number {
  return bodyText(map).split("\n").filter((l) => l.trim()).length;
}

function normWords(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
}

/** How well a title matches the opening of the lyric body (the correct title is
 *  almost always the song's first words). Returns length of the common prefix. */
function titleBodyMatch(title: string, map: LyricsMap | null): number {
  const t = normWords(title);
  const b = normWords(bodyText(map)).slice(0, 80);
  let i = 0;
  while (i < t.length && i < b.length && t[i] === b[i]) i++;
  return i;
}

function cleanTitle(title: string): string {
  const stripped = title.replace(/\s+\d{1,2}\s*$/g, "").replace(/\s{2,}/g, " ").trim();
  return stripped.length >= 2 ? stripped : title;
}

function translitMap(map: LyricsMap | null): { out: LyricsMap | null; changed: boolean } {
  if (!map) return { out: null, changed: false };
  const out: LyricsMap = {};
  let changed = false;
  for (const [k, v] of Object.entries(map)) {
    if (k === "__order") { out[k] = v; continue; }
    let nv = v;
    for (const [re, rep] of TRANSLIT) nv = nv.replace(re, rep);
    if (nv !== v) changed = true;
    out[k] = nv;
  }
  return { out, changed };
}

async function fetchAll(): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("songs")
      .select("id,title,artist,church,is_verified,languages_available,lyrics_hinglish,lyrics_hindi")
      .order("id")
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...(data as Row[]));
    if (data.length < 1000) break;
  }
  return rows;
}

async function main() {
  const curated = curatedIds();
  const rows = await fetchAll();
  console.log(`Fetched ${rows.length} songs. Mode: ${APPLY ? "APPLY" : "DRY-RUN"}\n`);

  // 1. DEDUPE — group verified, non-stub songs by identical body
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    if (!r.is_verified) continue;
    if (lineCount(r.lyrics_hinglish) < 4) continue;
    const k = normalizeBodyKey(r.lyrics_hinglish);
    if (k.length < 20) continue; // ignore trivially short bodies
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(r);
  }
  const dupLosers = new Set<string>();
  const dupSamples: string[] = [];
  for (const [, g] of groups) {
    if (g.length < 2) continue;
    const ranked = [...g].sort((a, b) => {
      // Title that matches the lyrics' opening is the correct one — weight it heavily.
      const score = (r: Row) =>
        (curated.has(r.id) ? 1000 : 0) +
        titleBodyMatch(r.title, r.lyrics_hinglish) * 4 +
        (r.lyrics_hindi ? 6 : 0) +
        (r.artist !== "Unknown Artist" ? 3 : 0) +
        (r.church ? 1 : 0);
      const d = score(b) - score(a);
      if (d !== 0) return d;
      const lc = lineCount(b.lyrics_hinglish) - lineCount(a.lyrics_hinglish);
      if (lc !== 0) return lc;
      return a.id.length - b.id.length;
    });
    const keep = ranked[0];
    for (const loser of ranked.slice(1)) dupLosers.add(loser.id);
    if (dupSamples.length < 15) dupSamples.push(`  keep "${keep.title}" — drop ${ranked.slice(1).map((r) => `"${r.title}"`).join(", ")}`);
  }

  // 2 + 3. TITLE + TRANSLIT per row
  const updates: { id: string; patch: Record<string, unknown> }[] = [];
  let titleCount = 0, translitCount = 0;
  const titleSamples: string[] = [], translitSamples: string[] = [];

  for (const r of rows) {
    const patch: Record<string, unknown> = {};

    if (dupLosers.has(r.id)) patch.is_verified = false;

    const nt = cleanTitle(r.title);
    if (nt !== r.title) {
      patch.title = nt;
      titleCount++;
      if (titleSamples.length < 12) titleSamples.push(`  "${r.title}" -> "${nt}"`);
    }

    const hi = translitMap(r.lyrics_hinglish);
    if (hi.changed) {
      patch.lyrics_hinglish = hi.out;
      translitCount++;
      if (translitSamples.length < 12) translitSamples.push(`  ${r.title}`);
    }

    if (Object.keys(patch).length) updates.push({ id: r.id, patch });
  }

  console.log(`=== SUMMARY ===`);
  console.log(`Duplicate songs flagged unverified : ${dupLosers.size}`);
  console.log(`Titles cleaned (display only)      : ${titleCount}`);
  console.log(`Songs with translit normalization  : ${translitCount}`);
  console.log(`Total rows to update               : ${updates.length}`);
  console.log(`\n--- dedupe sample ---\n${dupSamples.join("\n")}`);
  console.log(`\n--- title sample ---\n${titleSamples.join("\n")}`);
  console.log(`\n--- translit sample (songs touched) ---\n${translitSamples.join("\n")}`);

  if (!APPLY) { console.log(`\nDRY-RUN: nothing written. Re-run with --apply.`); return; }

  console.log(`\nApplying ${updates.length} updates...`);
  let done = 0;
  for (const u of updates) {
    const { error } = await db.from("songs").update(u.patch).eq("id", u.id);
    if (error) { console.error(`  ! ${u.id}: ${error.message}`); continue; }
    if (++done % 50 === 0) console.log(`  ...${done}/${updates.length}`);
  }
  console.log(`Done. ${done}/${updates.length} rows updated.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
