/**
 * Re-section single-blob songs that carry explicit verse numbers (1. 2. or १. २.)
 * so they render with verse/chorus structure like the Shalom imports.
 *
 * SAFETY — the whole point is aligned rendering, so a song is only rewritten when
 * BOTH languages split into the EXACT SAME section keys. If Hindi and Hinglish
 * disagree (different verse numbers, or one isn't numbered), the song is left
 * untouched and reported. No lyric line is ever added or dropped — segments are
 * just regrouped and the leading "N." marker is removed from each verse.
 *
 * Content before the first number becomes "chorus" (the repeated hook in these
 * songs); each numbered block becomes verse1, verse2, ...
 *
 * DRY-RUN BY DEFAULT. Pass --apply to write. Pass --limit=N to sample.
 *   npx tsx scripts/resection-numbered.ts           # dry-run + samples
 *   npx tsx scripts/resection-numbered.ts --apply
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing Supabase env in .env.local"); process.exit(1); }
const db = createClient(url, key);

type LyricsMap = Record<string, string>;
interface Row { id: string; lyrics_hindi: LyricsMap | null; lyrics_hinglish: LyricsMap | null; }

const DEV_DIGITS: Record<string, string> = { "०":"0","१":"1","२":"2","३":"3","४":"4","५":"5","६":"6","७":"7","८":"8","९":"9" };
const toArabic = (s: string) => s.replace(/[०-९]/g, (d) => DEV_DIGITS[d]);
/** line that starts a numbered verse, e.g. "1. text", "२) text", "3 text" */
const NUM_LINE = /^\s*([0-9०-९]{1,2})\s*[.)]\s*(.*)$/;

function contentSections(map: LyricsMap | null): [string, string][] {
  if (!map) return [];
  return Object.entries(map).filter(([k]) => k !== "__order");
}

/** Split a single blob into {chorus?, verseN...}. Returns null if not numbered. */
function resectionBlob(blob: string): { sections: LyricsMap; order: string[] } | null {
  const lines = blob.split("\n");
  const segments: { key: string | null; lines: string[] }[] = [{ key: null, lines: [] }];
  let sawNumber = false;

  for (const line of lines) {
    const m = line.match(NUM_LINE);
    if (m) {
      sawNumber = true;
      segments.push({ key: `verse${toArabic(m[1])}`, lines: m[2].trim() ? [m[2]] : [] });
    } else {
      segments[segments.length - 1].lines.push(line);
    }
  }
  if (!sawNumber) return null;

  const sections: LyricsMap = {};
  const order: string[] = [];
  for (const seg of segments) {
    const text = seg.lines.join("\n").trim();
    if (!text) continue;
    const k = seg.key ?? "chorus";
    if (k in sections) return null; // duplicate key (e.g. two "chorus" blocks) -> too ambiguous, skip
    sections[k] = text;
    order.push(k);
  }
  if (order.length < 2) return null; // nothing actually gained
  sections.__order = order.join("|");
  return { sections, order };
}

async function fetchAll(): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("songs").select("id,lyrics_hindi,lyrics_hinglish")
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
  let candidates = 0, willFix = 0, skippedMismatch = 0;
  const samples: string[] = [];
  const updates: { id: string; hi: LyricsMap | null; hn: LyricsMap | null }[] = [];

  const pool = LIMIT > 0 ? rows.slice(0, LIMIT) : rows;
  for (const row of pool) {
    const he = contentSections(row.lyrics_hinglish);
    const hh = contentSections(row.lyrics_hindi);
    // only single-blob songs (one content section each, or one side null)
    if (he.length > 1 || hh.length > 1) continue;
    const eBlob = he[0]?.[1] ?? null;
    const hBlob = hh[0]?.[1] ?? null;
    if (!eBlob && !hBlob) continue;

    const eRes = eBlob ? resectionBlob(eBlob) : null;
    const hRes = hBlob ? resectionBlob(hBlob) : null;
    if (!eRes && !hRes) continue; // neither numbered
    candidates++;

    // alignment gate: if both languages present, their section keys must match exactly
    if (eRes && hRes) {
      if (eRes.order.join("|") !== hRes.order.join("|")) { skippedMismatch++; continue; }
    } else if ((eBlob && !eRes) || (hBlob && !hRes)) {
      // one side numbered, the other present but not -> can't align, skip
      skippedMismatch++; continue;
    }

    // content-preservation gate: the set of non-empty lines must be identical
    // before and after (only the leading "N." marker is allowed to change).
    const linesOf = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
    const stripNum = (l: string) => l.replace(NUM_LINE, "$2").trim();
    const preserved = (blob: string, res: ReturnType<typeof resectionBlob>) => {
      if (!res) return true;
      const before = linesOf(blob).map(stripNum).sort();
      const after = linesOf(Object.entries(res.sections).filter(([k]) => k !== "__order").map(([, v]) => v).join("\n")).sort();
      return before.length === after.length && before.every((l, i) => l === after[i]);
    };
    if (!preserved(eBlob ?? "", eRes) || !preserved(hBlob ?? "", hRes)) {
      console.error(`  !! content mismatch, skipping ${row.id}`);
      continue;
    }

    willFix++;
    const newHinglish = eRes ? eRes.sections : row.lyrics_hinglish;
    const newHindi = hRes ? hRes.sections : row.lyrics_hindi;
    updates.push({ id: row.id, hi: newHinglish, hn: newHindi });

    if (samples.length < 6) {
      const src = eRes ?? hRes!;
      samples.push(`• ${row.id}\n    ${src.order.join(" | ")}`);
    }
  }

  console.log(`\nNumbered single-blob candidates : ${candidates}`);
  console.log(`Will re-section (aligned)        : ${willFix}`);
  console.log(`Skipped (Hindi/Hinglish mismatch): ${skippedMismatch}`);
  console.log(`\n--- samples ---\n${samples.join("\n")}`);

  if (!APPLY) {
    console.log(`\nDRY-RUN: nothing written. Re-run with --apply to commit.`);
    return;
  }

  let done = 0;
  for (const u of updates) {
    const patch: Record<string, unknown> = {};
    if (u.hi) patch.lyrics_hinglish = u.hi;
    if (u.hn) patch.lyrics_hindi = u.hn;
    const { error } = await db.from("songs").update(patch).eq("id", u.id);
    if (error) console.error(`  ! ${u.id}: ${error.message}`);
    else done++;
    if (done % 25 === 0) console.log(`  ...${done}/${updates.length}`);
  }
  console.log(`Done. ${done}/${updates.length} re-sectioned.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
