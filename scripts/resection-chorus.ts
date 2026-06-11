/**
 * Re-section single-blob songs by detecting a repeated CHORUS block.
 *
 * For a wall-of-text song, finds the longest multi-line block (>=2 consecutive
 * lines) that appears verbatim >=2 times — that's the chorus — and splits the
 * blob into verse1 | chorus | verse2 | chorus | ... (chorus deduped to one key).
 *
 * SAME SAFETY GATES as resection-numbered:
 *   - content gate : the exact multiset of lines is unchanged (only regrouped)
 *   - alignment gate: Hindi and Hinglish must yield identical section keys, or
 *                     the song is skipped (left as a single blob).
 * Single-line refrains are ignored (chorus must be >=2 lines) to avoid splitting
 * on a verse-ending tag line.
 *
 * DRY-RUN BY DEFAULT. --apply to write. --limit=N to sample.
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

function contentSections(map: LyricsMap | null): [string, string][] {
  return map ? Object.entries(map).filter(([k]) => k !== "__order") : [];
}

/** Find the longest contiguous multi-line block that repeats verbatim. */
function findChorus(lines: string[]): string[] | null {
  const norm = lines.map((l) => l.trim());
  let best: string[] | null = null;
  for (let i = 0; i < norm.length; i++) {
    for (let j = i + 1; j < norm.length; j++) {
      // extend a match starting at i and j
      let len = 0;
      while (
        j + len < norm.length &&
        norm[i + len] === norm[j + len] &&
        norm[i + len].length > 6 &&
        i + len < j // don't let the two windows overlap
      ) len++;
      if (len >= 2 && (!best || len > best.length)) best = norm.slice(i, i + len);
    }
  }
  return best;
}

function splitByChorus(lines: string[], chorus: string[]): { sections: LyricsMap; order: string[] } | null {
  const norm = lines.map((l) => l.trim());
  const sections: LyricsMap = {};
  const order: string[] = [];
  let verseNum = 1;
  let cur: string[] = [];
  const flushVerse = () => {
    const text = cur.join("\n").trim();
    cur = [];
    if (!text) return;
    const k = `verse${verseNum++}`;
    sections[k] = text;
    order.push(k);
  };

  let i = 0;
  let chorusCount = 0;
  while (i < norm.length) {
    const isChorusHere = i + chorus.length <= norm.length &&
      chorus.every((c, k) => norm[i + k] === c);
    if (isChorusHere) {
      flushVerse();
      if (!("chorus" in sections)) { sections.chorus = chorus.join("\n"); }
      if (!order.includes("chorus")) order.push("chorus"); // chorus appears once, at first position
      i += chorus.length;
      chorusCount++;
    } else {
      cur.push(lines[i]);
      i++;
    }
  }
  flushVerse();

  if (chorusCount < 2) return null;         // chorus must actually repeat
  if (order.filter((o) => o !== "chorus").length < 1) return null; // need >=1 verse
  if (order.length < 2) return null;
  sections.__order = order.join("|");
  return { sections, order };
}

function resection(blob: string): { sections: LyricsMap; order: string[] } | null {
  const lines = blob.split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 9) return null;
  const chorus = findChorus(lines);
  if (!chorus) return null;
  return splitByChorus(lines, chorus);
}

function preserved(blob: string, res: { sections: LyricsMap } | null): boolean {
  if (!res) return true;
  // Set comparison: every DISTINCT lyric line must survive. Removing duplicate
  // chorus occurrences (intentional dedup) is allowed; losing unique content is not.
  const before = new Set(blob.split("\n").map((l) => l.trim()).filter(Boolean));
  const after = new Set(
    Object.entries(res.sections).filter(([k]) => k !== "__order")
      .flatMap(([, v]) => v.split("\n")).map((l) => l.trim()).filter(Boolean),
  );
  if (before.size !== after.size) return false;
  for (const l of before) if (!after.has(l)) return false;
  return true;
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
  let willFix = 0, skipMismatch = 0, skipContent = 0;
  const samples: string[] = [];
  const updates: { id: string; hi: LyricsMap | null; hn: LyricsMap | null }[] = [];

  const pool = LIMIT > 0 ? rows.slice(0, LIMIT) : rows;
  for (const row of pool) {
    const he = contentSections(row.lyrics_hinglish);
    const hh = contentSections(row.lyrics_hindi);
    if (he.length > 1 || hh.length > 1) continue;
    const eBlob = he[0]?.[1] ?? null;
    const hBlob = hh[0]?.[1] ?? null;
    if (!eBlob && !hBlob) continue;

    const eRes = eBlob ? resection(eBlob) : null;
    const hRes = hBlob ? resection(hBlob) : null;
    if (!eRes && !hRes) continue;

    // alignment gate
    if (eRes && hRes) {
      if (eRes.order.join("|") !== hRes.order.join("|")) { skipMismatch++; continue; }
    } else if ((eBlob && !eRes) || (hBlob && !hRes)) { skipMismatch++; continue; }

    if (!preserved(eBlob ?? "", eRes) || !preserved(hBlob ?? "", hRes)) { skipContent++; continue; }

    willFix++;
    updates.push({ id: row.id, hi: eRes ? eRes.sections : row.lyrics_hinglish, hn: hRes ? hRes.sections : row.lyrics_hindi });
    if (samples.length < 8) {
      const r = (eRes ?? hRes)!;
      samples.push(`• ${row.id}  ->  ${r.order.join(" | ")}`);
    }
  }

  console.log(`\nWill re-section by chorus : ${willFix}`);
  console.log(`Skipped (lang mismatch)   : ${skipMismatch}`);
  console.log(`Skipped (content gate)    : ${skipContent}`);
  console.log(`\n--- samples ---\n${samples.join("\n")}`);

  if (!APPLY) { console.log(`\nDRY-RUN: nothing written. Review samples, then --apply.`); return; }

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
