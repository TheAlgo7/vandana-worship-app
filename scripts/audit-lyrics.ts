/**
 * Lyrics quality audit for the live Supabase library.
 *
 * Read-only. Scans every verified song and reports how many are affected by
 * each junk / corruption category, then writes a per-song breakdown to
 * .song-import/lyrics-audit.txt so any claim of "clean" can be verified.
 *
 *   npx tsx scripts/audit-lyrics.ts
 *
 * Categories:
 *   paren_markers      "(2)" / "(२)" repeat cues left in lyrics
 *   english_in_hinglish English prose leaked into the romanized field
 *   latin_in_hindi      Latin letters inside the Devanagari field (corruption)
 *   pipe_in_lyrics      "|" inside a real lyric line (danda or leaked credit)
 *   credit_dash         "Chorus - X" / "Music - X" style credit lines
 *   css_js              residual CSS/JS/JSON-LD fragments
 *   misaligned          Hindi vs Hinglish section-count mismatch
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing Supabase env in .env.local"); process.exit(1); }
const db = createClient(url, key);

type LyricsMap = Record<string, string>;
interface Row { id: string; title: string; lyrics_hindi: LyricsMap | null; lyrics_hinglish: LyricsMap | null; }

const DEVANAGARI = /[ऀ-ॿ]/;
const PAREN_MARKER = /\(\s*[0-9०-९]+\s*\)/;
const ENGLISH = /\b(the|whether|worthy|praise|surrender|glory|honou?r|mighty|forever|everything|nothing|because|through|cannot|your|abundant|salvation)\b/i;
const CREDIT_DASH = /^(chorus|verse|bridge|music|vocals?|singer|lyrics|backing|lead|guitar|drums|keys|mix|master)\s*[-:–]/i;
const CSS_JS = /(lyrics-container|@media|getElementById|document\.|toggleLyrics|"@type"|widgetStyle|function\s|\{\s*$)/;

function vals(m: LyricsMap | null): string[] {
  if (!m) return [];
  return Object.entries(m).filter(([k]) => k !== "__order").map(([, v]) => String(v));
}
function sectionCount(m: LyricsMap | null): number {
  return m ? Object.keys(m).filter((k) => k !== "__order").length : 0;
}

async function fetchAll(): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("songs").select("id,title,lyrics_hindi,lyrics_hinglish")
      .eq("is_verified", true).order("id").range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...(data as Row[]));
    if (data.length < 1000) break;
  }
  return rows;
}

async function main() {
  const rows = await fetchAll();
  const cats: Record<string, string[]> = {
    paren_markers: [], english_in_hinglish: [], latin_in_hindi: [],
    pipe_in_lyrics: [], credit_dash: [], css_js: [], misaligned: [],
  };

  for (const r of rows) {
    const hi = vals(r.lyrics_hinglish);
    const hd = vals(r.lyrics_hindi);
    const allText = [...hi, ...hd].join("\n");

    if (PAREN_MARKER.test(allText)) cats.paren_markers.push(r.id);
    if (hi.some((v) => v.split("\n").some((l) => ENGLISH.test(l)))) cats.english_in_hinglish.push(r.id);
    if (hd.some((v) => /[A-Za-z]{3,}/.test(v))) cats.latin_in_hindi.push(r.id);
    if ([...hi, ...hd].some((v) => v.includes("|"))) cats.pipe_in_lyrics.push(r.id);
    if ([...hi, ...hd].some((v) => v.split("\n").some((l) => CREDIT_DASH.test(l.trim())))) cats.credit_dash.push(r.id);
    if (CSS_JS.test(allText)) cats.css_js.push(r.id);
    const a = sectionCount(r.lyrics_hinglish), b = sectionCount(r.lyrics_hindi);
    if (a > 0 && b > 0 && a !== b) cats.misaligned.push(r.id);
  }

  console.log(`\nLyrics audit — ${rows.length} verified songs\n${"=".repeat(40)}`);
  for (const [cat, ids] of Object.entries(cats)) {
    console.log(`${cat.padEnd(20)} ${String(ids.length).padStart(5)}`);
  }

  const lines = [`# Lyrics audit — ${new Date().toISOString().slice(0, 16)} — ${rows.length} verified songs`, ""];
  for (const [cat, ids] of Object.entries(cats)) {
    lines.push(`## ${cat} (${ids.length})`, ...ids.map((id) => `- ${id}`), "");
  }
  const out = path.join(process.cwd(), ".song-import", "lyrics-audit.txt");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`\nPer-song breakdown: ${path.relative(process.cwd(), out)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
