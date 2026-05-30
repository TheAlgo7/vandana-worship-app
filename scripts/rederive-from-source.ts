/**
 * Re-derive clean lyrics from the original scraped source .txt files
 * (C:\Users\Gaurav\Desktop\Work\Lyrics) and match them back to Supabase rows.
 *
 * The source has clean structure (Hinglish Lyrics / Hindi Lyrics sections,
 * real line breaks) that the original import mangled. There is NO shared key
 * (DB has no Song Code), so we match by:
 *   1. slug(title)                  -> DB id      (exact)
 *   2. slug(first Hinglish line)    -> DB id      (the importer often used this)
 *   3. normalized Hindi body prefix -> DB hindi   (content match, fallback)
 *
 * DRY-RUN/analysis by default (writes nothing). Pass --apply to write.
 *   npx tsx scripts/rederive-from-source.ts            # match-rate report
 *   npx tsx scripts/rederive-from-source.ts --apply
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

config({ path: ".env.local" });
const APPLY = process.argv.includes("--apply");

const SRC_ROOT = "C:/Users/Gaurav/Desktop/Work/Lyrics";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const db = createClient(url, key);

type LyricsMap = Record<string, string>;
interface DbRow { id: string; title: string; lyrics_hinglish: LyricsMap | null; lyrics_hindi: LyricsMap | null; }

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

function normalizeForCompare(v: string): string {
  return v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function slugify(v: string): string {
  return normalizeForCompare(v).replace(/\s+/g, "-");
}
function devKey(s: string): string {
  // normalized Devanagari prefix: strip everything except Devanagari, take first 40 chars
  return (s.match(/[ऀ-ॿ]/g) ?? []).join("").slice(0, 40);
}

/* ── Source parsing ── */
interface SourceSong { file: string; title: string; hinglish: string; hindi: string; }

function parseSource(file: string): SourceSong | null {
  const raw = fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
  const lines = raw.split("\n");
  const title = lines.find((l) => l.trim())?.trim() ?? "";

  // collect the two language sections
  const grab = (marker: RegExp): string => {
    const start = lines.findIndex((l) => marker.test(l.trim()));
    if (start < 0) return "";
    const out: string[] = [];
    for (let i = start + 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^(hinglish lyrics|hindi lyrics|english lyrics)\b/i.test(l.trim())) break;
      if (/^(source\s*:|song\s*code\s*:)/i.test(l.trim())) continue;
      out.push(l);
    }
    return out.join("\n").trim();
  };

  const hinglish = grab(/^hinglish lyrics\b/i);
  const hindi = grab(/^hindi lyrics\b/i);
  return { file, title, hinglish, hindi };
}

/** Split a continuous lyric body into verse1, verse2, ... on blank lines. */
function sectionize(body: string): LyricsMap | null {
  const stanzas = body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (!stanzas.length) return null;
  const map: LyricsMap = {};
  const order: string[] = [];
  stanzas.forEach((s, i) => { const k = `verse${i + 1}`; map[k] = s; order.push(k); });
  map.__order = order.join("|");
  return map;
}

function allSourceFiles(): string[] {
  const out: string[] = [];
  for (const b of fs.readdirSync(SRC_ROOT)) {
    const dir = path.join(SRC_ROOT, b);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith(".txt")) out.push(path.join(dir, f));
  }
  return out;
}

async function fetchDb(): Promise<DbRow[]> {
  const rows: DbRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("songs").select("id,title,lyrics_hinglish,lyrics_hindi").order("id").range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...(data as DbRow[]));
    if (data.length < 1000) break;
  }
  return rows;
}

async function main() {
  const files = allSourceFiles();
  const dbRows = await fetchDb();
  console.log(`Source files: ${files.length} · DB songs: ${dbRows.length} · Mode: ${APPLY ? "APPLY" : "ANALYZE"}\n`);

  const byId = new Map(dbRows.map((r) => [r.id, r]));
  const byHindiKey = new Map<string, DbRow>();
  for (const r of dbRows) {
    const hk = devKey(Object.entries(r.lyrics_hindi ?? {}).filter(([k]) => k !== "__order").map(([, v]) => v).join(""));
    if (hk.length >= 20 && !byHindiKey.has(hk)) byHindiKey.set(hk, r);
  }

  const stats = { title: 0, firstHing: 0, hindiContent: 0, none: 0 };
  const matched = new Map<string, SourceSong>(); // dbId -> chosen source
  const sampleNone: string[] = [];
  const sampleByMethod: Record<string, string[]> = { title: [], firstHing: [], hindiContent: [] };

  for (const file of files) {
    let s: SourceSong | null = null;
    try { s = parseSource(file); } catch { continue; }
    if (!s) continue;

    let hit: DbRow | undefined;
    let how: keyof typeof stats = "none";

    const tSlug = slugify(s.title);
    const firstHing = s.hinglish.split("\n").find((l) => l.trim()) ?? "";
    const fhSlug = slugify(firstHing);
    const hk = devKey(s.hindi);

    if (tSlug && byId.has(tSlug)) { hit = byId.get(tSlug); how = "title"; }
    else if (fhSlug && byId.has(fhSlug)) { hit = byId.get(fhSlug); how = "firstHing"; }
    else if (hk.length >= 20 && byHindiKey.has(hk)) { hit = byHindiKey.get(hk); how = "hindiContent"; }

    stats[how]++;
    if (hit && how !== "none" && sampleByMethod[how].length < 8) {
      sampleByMethod[how].push(`    DB "${hit.title.slice(0, 38)}"  ⟷  SRC "${s.title.slice(0, 38)}"`);
    }
    if (hit) {
      // keep the richest source per DB row
      const prev = matched.get(hit.id);
      const score = (x: SourceSong) => x.hinglish.length + x.hindi.length;
      if (!prev || score(s) > score(prev)) matched.set(hit.id, s);
    } else if (sampleNone.length < 10) {
      sampleNone.push(`  ? ${path.basename(file)} — title="${s.title.slice(0, 40)}"`);
    }
  }

  console.log(`=== MATCH RATES (source files -> DB row) ===`);
  console.log(`  by slug(title)        : ${stats.title}`);
  console.log(`  by slug(1st Hinglish) : ${stats.firstHing}`);
  console.log(`  by Hindi content      : ${stats.hindiContent}`);
  console.log(`  unmatched             : ${stats.none}`);
  console.log(`  distinct DB rows matched: ${matched.size} / ${dbRows.length}`);
  console.log(`\n--- match correctness check (DB title ⟷ source title) ---`);
  for (const m of ["title", "firstHing", "hindiContent"] as const) {
    console.log(`  [${m}]\n${sampleByMethod[m].join("\n")}`);
  }
  console.log(`\n--- unmatched samples ---\n${sampleNone.join("\n")}`);

  if (!APPLY) { console.log(`\nANALYZE only — nothing written.`); return; }

  // APPLY: re-derive lyrics for matched rows
  const curated = curatedIds();
  console.log(`\nRe-deriving from source (skipping ${curated.size} curated)...`);
  let done = 0, skipped = 0;
  for (const [id, s] of matched) {
    if (curated.has(id)) { skipped++; continue; }            // never overwrite hand-curated songs
    const row = byId.get(id)!;
    const srcHi = sectionize(s.hinglish);
    const srcHn = sectionize(s.hindi);
    if (!srcHi && !srcHn) { skipped++; continue; }
    // Merge: use source where present, otherwise keep the existing DB language (never drop one).
    const hi = srcHi ?? row.lyrics_hinglish ?? null;
    const hn = srcHn ?? row.lyrics_hindi ?? null;
    const langs = [...(hi ? ["hinglish"] : []), ...(hn ? ["hindi"] : [])];
    if (!langs.length) { skipped++; continue; }
    const patch: Record<string, unknown> = {
      lyrics_hinglish: hi,
      lyrics_hindi: hn,
      languages_available: langs,
      language_default: hi ? "hinglish" : "hindi",
    };
    const { error } = await db.from("songs").update(patch).eq("id", id);
    if (error) { console.error(`  ! ${id}: ${error.message}`); continue; }
    if (++done % 100 === 0) console.log(`  ...${done}/${matched.size}`);
  }
  console.log(`Done. Re-derived ${done}, skipped ${skipped}. Now re-run triage-quality + normalize-content.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
