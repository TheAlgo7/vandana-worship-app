/**
 * Import the Shalom Worship batch (clean, Hindi/Hinglish-aligned lyrics) into
 * the live Supabase song library.
 *
 *   - id is the .txt filename (matches the DB's title-slug + numeric-suffix
 *     convention, and disambiguates same-title songs like "...-2").
 *   - EXISTING song (id match): its lyrics are overwritten with the Shalom
 *     version (existing copies may be unfinished / fumbled). artist/links/tags
 *     are preserved; artist is only filled when it was "Unknown Artist".
 *   - NEW song: inserted, is_verified = true.
 *   - (x2) / (2x) / dotted repeat markers are stripped on the way in.
 *
 * Section structure is taken from the file's [Verse]/[Chorus]/... markers, or
 * from blank-line stanzas when a block has no markers. Hindi & Hinglish keep
 * the same keys so the two languages stay aligned.
 *
 * DRY-RUN BY DEFAULT. Pass --apply to write. Pass --limit=N to sample.
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);
const SRC_DIR = "C:\\Users\\Gaurav\\Desktop\\Lyrics\\shalomworship_hindi_hinglish";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(url, key);

type Lang = "hindi" | "hinglish";
type LyricsMap = Record<string, string>;

/* ── line cleaning (strip repeat markers / dotted junk) ── */
const PAREN_MARKER = /\(\s*(?:[xX]\s*\d+|\d+\s*[xX])\s*\)/g;
const DOT_RUN = /\.{2,}/g;
const TRAILING_COUNT = /[\s,;।]*(?:[xX]\s*\d+|\d+\s*[xX])\s*$/;

function cleanLyricLine(line: string): string {
  let l = line.replace(/\r/g, "").replace(PAREN_MARKER, " ").replace(DOT_RUN, " ");
  let prev: string;
  do { prev = l; l = l.replace(TRAILING_COUNT, ""); } while (l !== prev);
  return l.replace(/[ \t]{2,}/g, " ").replace(/[ \t]+$/g, "").trimEnd();
}

/* ── marker normalisation ── */
function normalizeMarker(raw: string, verseCounter: { n: number }): string {
  const s = raw.replace(/^\[|\]$/g, "").replace(/:\s*$/, "").trim().toLowerCase();
  let m: RegExpMatchArray | null;
  if ((m = s.match(/^verse\s*(\d+)/))) return `verse${m[1]}`;
  if (/^verse\b/.test(s)) return `verse${verseCounter.n++}`;
  if (/^pre[\s-]?chorus/.test(s)) return "prechorus";
  if (/^chorus\s*(\d+)?/.test(s)) return "chorus";
  if (/^bridge/.test(s)) return "bridge";
  if (/^pre[\s-]?bridge/.test(s)) return "prebridge";
  if (/^tag\b/.test(s)) return "tag";
  if (/^outro/.test(s)) return "outro";
  if (/^intro/.test(s)) return "intro";
  if (/^interlude/.test(s)) return "interlude";
  if (/^refrain/.test(s)) return "refrain";
  if (/^hook/.test(s)) return "hook";
  if (/^vamp/.test(s)) return "vamp";
  return s.replace(/[^a-z0-9]+/g, "") || `verse${verseCounter.n++}`;
}

/** Parse one language block (array of raw lines) into an ordered section map. */
function parseBlock(lines: string[]): LyricsMap | null {
  const hasMarkers = lines.some((l) => /^\[.+\]:?\s*$/.test(l.trim()));
  const sections: LyricsMap = {};
  const order: string[] = [];
  const verseCounter = { n: 1 };

  const put = (key: string, buf: string[]) => {
    const text = buf.map(cleanLyricLine).filter((l) => l.trim() !== "").join("\n").trim();
    if (!text || !key) return;
    if (!(key in sections)) { sections[key] = text; order.push(key); }
    // repeated marker with same key: keep first occurrence (chorus etc.)
  };

  if (hasMarkers) {
    let key: string | null = null;
    let buf: string[] = [];
    const preMarker: string[] = [];
    for (const raw of lines) {
      const t = raw.trim();
      const mk = t.match(/^\[(.+?)\]:?\s*$/);
      if (mk) {
        if (key === null && preMarker.some((l) => l.trim())) put("verse" + verseCounter.n++, preMarker);
        else if (key !== null) put(key, buf);
        key = normalizeMarker(mk[1], verseCounter);
        buf = [];
      } else if (key === null) {
        preMarker.push(raw);
      } else {
        buf.push(raw);
      }
    }
    if (key !== null) put(key, buf);
  } else {
    // no markers: split into stanzas on blank-line runs
    let buf: string[] = [];
    const flush = () => { if (buf.some((l) => l.trim())) put(`verse${verseCounter.n++}`, buf); buf = []; };
    for (const raw of lines) {
      if (raw.trim() === "") flush();
      else buf.push(raw);
    }
    flush();
  }

  if (order.length === 0) return null;
  sections.__order = order.join("|");
  return sections;
}

/* ── file parsing ── */
interface ParsedSong {
  id: string;
  title: string;
  artist: string | null;
  sourceUrl: string | null;
  hindi: LyricsMap | null;
  hinglish: LyricsMap | null;
}

function parseFile(file: string): ParsedSong | null {
  const id = path.basename(file, ".txt");
  const text = fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
  const lines = text.split("\n");

  let title = "";
  let artist: string | null = null;
  let sourceUrl: string | null = null;

  // header: title is the first non-empty line; then Artist:/Source:/Language:
  let i = 0;
  for (; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) { if (title) break; continue; }
    if (!title) { title = t; continue; }
    if (/^artist\s*:/i.test(t)) artist = t.replace(/^artist\s*:/i, "").trim() || null;
    else if (/^source\s*:/i.test(t)) sourceUrl = t.replace(/^source\s*:/i, "").trim() || null;
    else if (/^language\s*:/i.test(t)) { /* ignore */ }
    else break;
  }
  if (!title) return null;

  // find language blocks
  const blocks: { lang: Lang; start: number }[] = [];
  for (let j = 0; j < lines.length; j++) {
    const t = lines[j].trim().toLowerCase();
    if (t === "hindi lyrics") blocks.push({ lang: "hindi", start: j + 1 });
    else if (t === "hinglish lyrics") blocks.push({ lang: "hinglish", start: j + 1 });
  }

  let hindi: LyricsMap | null = null;
  let hinglish: LyricsMap | null = null;
  for (let b = 0; b < blocks.length; b++) {
    const start = blocks[b].start;
    const end = b + 1 < blocks.length ? blocks[b + 1].start - 1 : lines.length;
    const blockLines = lines.slice(start, end);
    const parsed = parseBlock(blockLines);
    if (blocks[b].lang === "hindi") hindi = parsed;
    else hinglish = parsed;
  }

  return { id, title, artist, sourceUrl, hindi, hinglish };
}

/* ── DB row build ── */
interface ExistingRow {
  id: string;
  artist: string;
  tags: string[] | null;
  link_youtube: string | null;
  link_spotify: string | null;
  link_apple_music: string | null;
}

function buildInsert(s: ParsedSong) {
  const langs: Lang[] = [];
  if (s.hinglish) langs.push("hinglish");
  if (s.hindi) langs.push("hindi");
  const artist = s.artist || "Unknown Artist";
  return {
    id: s.id,
    title: s.title,
    artist,
    church: null,
    album: null,
    language_default: langs.includes("hinglish") ? "hinglish" : "hindi",
    languages_available: langs,
    lyrics_hinglish: s.hinglish,
    lyrics_hindi: s.hindi,
    link_youtube: null,
    link_spotify: null,
    link_apple_music: null,
    tags: Array.from(new Set(["worship", ...langs])),
    seo_description: `${s.title} lyrics in ${langs.join(" and ")}${artist !== "Unknown Artist" ? ` by ${artist}` : ""}`,
    added_by: "Gaurav | Vandana",
    is_verified: true,
  };
}

async function main() {
  const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".txt")).sort();
  const pool = LIMIT > 0 ? files.slice(0, LIMIT) : files;
  console.log(`Found ${files.length} files. Mode: ${APPLY ? "APPLY" : "DRY-RUN"}${LIMIT ? ` (limit ${LIMIT})` : ""}`);

  // existing rows by id
  const existing = new Map<string, ExistingRow>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("songs")
      .select("id,artist,tags,link_youtube,link_spotify,link_apple_music")
      .order("id")
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    for (const r of data as ExistingRow[]) existing.set(r.id, r);
    if (data.length < 1000) break;
  }

  let inserts = 0, updates = 0, skipped = 0;
  const sampleNew: string[] = [];
  const sampleUpd: string[] = [];
  const rowsToInsert: ReturnType<typeof buildInsert>[] = [];
  const rowsToUpdate: { id: string; patch: Record<string, unknown> }[] = [];

  for (const f of pool) {
    const parsed = parseFile(path.join(SRC_DIR, f));
    if (!parsed || (!parsed.hindi && !parsed.hinglish)) { skipped++; continue; }
    const ins = buildInsert(parsed);
    const ex = existing.get(parsed.id);

    if (ex) {
      const patch: Record<string, unknown> = {
        lyrics_hinglish: ins.lyrics_hinglish,
        lyrics_hindi: ins.lyrics_hindi,
        languages_available: ins.languages_available,
        language_default: ins.language_default,
        is_verified: true,
      };
      // fill artist only if existing is Unknown and Shalom has a real one
      if (ex.artist === "Unknown Artist" && parsed.artist) patch.artist = parsed.artist;
      rowsToUpdate.push({ id: parsed.id, patch });
      updates++;
      if (sampleUpd.length < 8) sampleUpd.push(`  ~ ${parsed.id}`);
    } else {
      rowsToInsert.push(ins);
      inserts++;
      if (sampleNew.length < 8) sampleNew.push(`  + ${parsed.id} (${parsed.title})`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`New songs to insert : ${inserts}`);
  console.log(`Existing to update  : ${updates}`);
  console.log(`Skipped (no lyrics) : ${skipped}`);
  console.log(`\n--- sample new ---\n${sampleNew.join("\n")}`);
  console.log(`\n--- sample updates ---\n${sampleUpd.join("\n")}`);

  if (process.argv.includes("--dump")) {
    for (const f of ["aa-prabhu.txt", "abraham-ka-prabhu.txt", "aag-mein-ek-aur.txt"]) {
      const p = parseFile(path.join(SRC_DIR, f));
      console.log(`\n######## ${f} ########`);
      console.log(JSON.stringify({ title: p?.title, artist: p?.artist, hindi: p?.hindi, hinglish: p?.hinglish }, null, 2));
    }
  }

  if (!APPLY) {
    console.log(`\nDRY-RUN: nothing written. Re-run with --apply to commit.`);
    return;
  }

  let done = 0;
  for (const r of rowsToInsert) {
    const { error } = await db.from("songs").insert(r);
    if (error) console.error(`  ! insert ${r.id}: ${error.message}`);
    else done++;
    if (done % 25 === 0) console.log(`  ...${done}`);
  }
  for (const u of rowsToUpdate) {
    const { error } = await db.from("songs").update(u.patch).eq("id", u.id);
    if (error) console.error(`  ! update ${u.id}: ${error.message}`);
    else done++;
    if (done % 25 === 0) console.log(`  ...${done}`);
  }
  console.log(`Done. ${done}/${inserts + updates} rows written.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
