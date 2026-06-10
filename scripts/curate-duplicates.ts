/**
 * Duplicate + doubled-title curation for the live Supabase song library.
 *
 * What it does:
 *   1. TITLE COLLAPSE — "Mere Khuda Mere Khuda" -> "Mere Khuda" when the title
 *      is one phrase repeated back-to-back (scrape artifact). IDs never change.
 *   2. DUPLICATE MERGE — groups songs whose collapsed/normalised titles match
 *      (exactly, or as a word-order permutation). Within a group, lyric content
 *      is compared (bigram Dice similarity on normalised text):
 *        - similarity >= 0.80  -> same song. Keep the best copy, set
 *          is_verified = false on the rest (reversible; nothing is deleted).
 *        - similarity <  0.80  -> left alone, written to the review report.
 *      "Best copy" = known artist > more lyric sections > more lyric text.
 *   3. REVIEW REPORT — docs/CONTENT-REVIEW.md listing everything that needs a
 *      human decision: low-similarity title twins, Devanagari inside Hinglish,
 *      Latin words inside Hindi, Hindi/Hinglish section-count mismatches, and
 *      verified songs with no Hindi lyrics.
 *
 * DRY-RUN BY DEFAULT. Pass --apply to write changes.
 *
 *   npx tsx scripts/curate-duplicates.ts            # dry-run + report
 *   npx tsx scripts/curate-duplicates.ts --apply    # write to Supabase
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");
const LYRIC_SIM_THRESHOLD = 0.8;

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

/* ── text helpers ── */

function normTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * "mere khuda mere khuda" -> "mere khuda"; returns input when not doubled.
 * Only multi-word phrases collapse: single-word repeats ("Pavitra Pavitra
 * Pavitra", "Bhajo Bhajo") are usually the song's real hook-title, not a
 * scrape artifact, so they are left for human review.
 */
function collapseDoubled(norm: string): string {
  const m = norm.match(/^(\S+\s+\S[^]*?)(?:\s+\1)+$/);
  return m ? m[1] : norm;
}

/** Word-order independent key so "teri mahima ho" groups with "mahima teri ho". */
function bagKey(norm: string): string {
  return norm.split(" ").sort().join(" ");
}

function lyricText(map: LyricsMap | null): string {
  if (!map) return "";
  return Object.entries(map)
    .filter(([k]) => k !== "__order")
    .map(([, v]) => String(v))
    .join("\n");
}

function normLyric(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9ऀ-ॿ]+/g, " ").trim();
}

/** Bigram Dice similarity, 0..1. */
function diceSim(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const grams = (s: string) => {
    const m = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2);
      m.set(g, (m.get(g) ?? 0) + 1);
    }
    return m;
  };
  const ga = grams(a);
  const gb = grams(b);
  let overlap = 0;
  let na = 0;
  let nb = 0;
  for (const v of ga.values()) na += v;
  for (const v of gb.values()) nb += v;
  for (const [g, v] of ga) overlap += Math.min(v, gb.get(g) ?? 0);
  return (2 * overlap) / (na + nb);
}

function sectionCount(map: LyricsMap | null): number {
  if (!map) return 0;
  return Object.keys(map).filter((k) => k !== "__order").length;
}

/** Higher score = better copy to keep. */
function quality(row: Row): number {
  let score = 0;
  if (row.artist && row.artist !== "Unknown Artist") score += 1000;
  score += sectionCount(row.lyrics_hinglish) * 10 + sectionCount(row.lyrics_hindi) * 10;
  score += Math.min(lyricText(row.lyrics_hinglish).length + lyricText(row.lyrics_hindi).length, 5000) / 1000;
  return score;
}

function titleCaseFromNorm(norm: string, original: string): string {
  // Re-derive display casing from the original title's first occurrence of the phrase.
  const words = norm.split(" ").length;
  return original.split(/\s+/).slice(0, words).join(" ");
}

/* ── data access ── */

async function fetchAll(): Promise<Row[]> {
  const rows: Row[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from("songs")
      .select("id,title,artist,lyrics_hinglish,lyrics_hindi")
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

/* ── main ── */

async function main() {
  const rows = await fetchAll();
  console.log(`Fetched ${rows.length} verified songs. Mode: ${APPLY ? "APPLY" : "DRY-RUN"}`);

  const titleFixes: { id: string; from: string; to: string }[] = [];
  const unverify: { id: string; title: string; keptId: string; sim: number }[] = [];
  const reviewPairs: { a: Row; b: Row; sim: number }[] = [];

  // 1. doubled-phrase title collapse
  const collapsedById = new Map<string, string>();
  for (const row of rows) {
    const norm = normTitle(row.title);
    const collapsed = collapseDoubled(norm);
    collapsedById.set(row.id, collapsed);
    if (collapsed !== norm) {
      titleFixes.push({ id: row.id, from: row.title, to: titleCaseFromNorm(collapsed, row.title) });
    }
  }

  // 2. group potential duplicates by collapsed title and by word-bag
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const k = bagKey(collapsedById.get(row.id)!);
    const g = groups.get(k);
    if (g) g.push(row);
    else groups.set(k, [row]);
  }

  const losers = new Set<string>();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    // compare every pair within the group
    const sorted = [...group].sort((a, b) => quality(b) - quality(a));
    const keeper = sorted[0];
    const keeperLyrics = normLyric(lyricText(keeper.lyrics_hinglish) + " " + lyricText(keeper.lyrics_hindi));
    for (const other of sorted.slice(1)) {
      const otherLyrics = normLyric(lyricText(other.lyrics_hinglish) + " " + lyricText(other.lyrics_hindi));
      const sim = diceSim(keeperLyrics, otherLyrics);
      if (sim >= LYRIC_SIM_THRESHOLD) {
        losers.add(other.id);
        unverify.push({ id: other.id, title: other.title, keptId: keeper.id, sim: Math.round(sim * 100) / 100 });
      } else {
        reviewPairs.push({ a: keeper, b: other, sim: Math.round(sim * 100) / 100 });
      }
    }
  }

  // don't bother retitling songs we're about to hide
  const liveTitleFixes = titleFixes.filter((f) => !losers.has(f.id));

  // 3. review report inputs (content-judgement issues)
  const devInHinglish = rows.filter((r) => !losers.has(r.id) && /[ऀ-ॿ]/.test(lyricText(r.lyrics_hinglish)));
  const latinInHindi = rows.filter((r) => !losers.has(r.id) && /[A-Za-z]{4,}/.test(lyricText(r.lyrics_hindi)));
  const mismatch = rows.filter((r) => {
    if (losers.has(r.id)) return false;
    const a = sectionCount(r.lyrics_hinglish);
    const b = sectionCount(r.lyrics_hindi);
    return a > 0 && b > 0 && a !== b;
  });
  const noHindi = rows.filter((r) => !losers.has(r.id) && sectionCount(r.lyrics_hindi) === 0);
  const singleWordRepeats = rows.filter(
    (r) => !losers.has(r.id) && /^(\S+)(?:\s+\1)+$/.test(normTitle(r.title)),
  );

  /* ── report ── */
  const lines: string[] = [
    "# Content Review — Vandana Song Library",
    "",
    `Generated by \`scripts/curate-duplicates.ts\` on ${new Date().toISOString().slice(0, 10)}.`,
    "Items below need an editorial decision; nothing here was changed automatically.",
    "",
    `## Possible duplicates with DIFFERENT lyrics (${reviewPairs.length})`,
    "Same/similar title but lyric similarity below the auto-merge bar — could be different songs, different verses scraped, or one bad copy.",
    "",
    ...reviewPairs.map((p) => `- [ ] \`${p.a.id}\` vs \`${p.b.id}\` — "${p.a.title}" / "${p.b.title}" (lyric sim ${p.sim})`),
    "",
    `## Devanagari mixed inside Hinglish (${devInHinglish.length})`,
    "Hinglish lyrics contain Devanagari script — transliteration glitches.",
    "",
    ...devInHinglish.map((r) => `- [ ] \`${r.id}\` — ${r.title}`),
    "",
    `## Latin words inside Hindi (${latinInHindi.length})`,
    "Hindi lyrics contain Latin-script words (4+ letters) — usually untransliterated fragments or leftover headings.",
    "",
    ...latinInHindi.map((r) => `- [ ] \`${r.id}\` — ${r.title}`),
    "",
    `## Hindi/Hinglish section-count mismatch (${mismatch.length})`,
    "Both languages exist but with different section structure — versions likely don't line up verse-for-verse.",
    "",
    ...mismatch.map(
      (r) => `- [ ] \`${r.id}\` — ${r.title} (hinglish ${sectionCount(r.lyrics_hinglish)} / hindi ${sectionCount(r.lyrics_hindi)})`,
    ),
    "",
    `## Verified songs with no Hindi lyrics (${noHindi.length})`,
    "",
    ...noHindi.map((r) => `- [ ] \`${r.id}\` — ${r.title}`),
    "",
    `## Single-word repeated titles — NOT auto-collapsed (${singleWordRepeats.length})`,
    'Often the real hook-title ("Pavitra Pavitra Pavitra" = Holy Holy Holy). Rename manually only if wrong.',
    "",
    ...singleWordRepeats.map((r) => `- [ ] \`${r.id}\` — ${r.title}`),
    "",
  ];
  const reportPath = path.join(process.cwd(), "docs", "CONTENT-REVIEW.md");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");

  console.log(`\n=== SUMMARY ===`);
  console.log(`Doubled titles to collapse  : ${liveTitleFixes.length}`);
  console.log(`Duplicates to hide          : ${unverify.length}`);
  console.log(`Review report               : docs/CONTENT-REVIEW.md`);
  console.log(`  - twin titles, diff lyrics: ${reviewPairs.length}`);
  console.log(`  - devanagari in hinglish  : ${devInHinglish.length}`);
  console.log(`  - latin in hindi          : ${latinInHindi.length}`);
  console.log(`  - section mismatch        : ${mismatch.length}`);
  console.log(`  - missing hindi           : ${noHindi.length}`);

  console.log(`\n--- title fixes ---`);
  for (const f of liveTitleFixes) console.log(`  • ${f.from}  ->  ${f.to}`);
  console.log(`\n--- duplicates to hide (keep <- hide, sim) ---`);
  for (const u of unverify) console.log(`  • ${u.keptId}  <-  ${u.id}  (${u.sim})`);

  if (!APPLY) {
    console.log(`\nDRY-RUN: no DB changes written. Re-run with --apply to commit.`);
    return;
  }

  console.log(`\nApplying...`);
  let done = 0;
  for (const f of liveTitleFixes) {
    const { error } = await db.from("songs").update({ title: f.to }).eq("id", f.id);
    if (error) console.error(`  ! title ${f.id}: ${error.message}`);
    else done++;
  }
  for (const u of unverify) {
    const { error } = await db.from("songs").update({ is_verified: false }).eq("id", u.id);
    if (error) console.error(`  ! hide ${u.id}: ${error.message}`);
    else done++;
  }
  console.log(`Done. ${done}/${liveTitleFixes.length + unverify.length} updates applied.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
