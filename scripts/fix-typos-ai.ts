/**
 * AI typo / transliteration fixer for the live Supabase song library.
 *
 * For each verified song it sends the Hindi (Devanagari) AND Hinglish (romanized)
 * section maps to Claude in one call, so the model can cross-reference the two
 * languages (the Hindi disambiguates a fumbled Hinglish word and vice-versa).
 * The model fixes ONLY clear spelling / transliteration errors — it must not
 * change meaning, translate, or add/remove lines or sections.
 *
 * SAFETY: every response is structurally validated before it is accepted —
 *   - identical section keys (and __order) to the original
 *   - identical line count per section (word-level edits only; a changed line
 *     count means the model added/removed/merged lines -> rejected)
 *   - Hindi stays Devanagari, Hinglish stays Latin
 *   - no section emptied
 * A song that fails validation is left untouched and logged.
 *
 * Resumable: progress is tracked in .song-import/typo-progress.json, so re-runs
 * skip songs already done. A full before/after diff is written to
 * .song-import/typo-diff.txt for review.
 *
 * Requires ANTHROPIC_API_KEY in .env.local (or the environment).
 *
 *   npx tsx scripts/fix-typos-ai.ts --limit=20          # dry-run a sample
 *   npx tsx scripts/fix-typos-ai.ts                     # dry-run all
 *   npx tsx scripts/fix-typos-ai.ts --apply             # write to Supabase
 *   npx tsx scripts/fix-typos-ai.ts --apply --model=claude-haiku-4-5-20251001
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);
const MODEL = process.argv.find((a) => a.startsWith("--model="))?.split("=")[1] ?? "claude-sonnet-4-6";
const CONCURRENCY = Number(process.argv.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ?? 5);

const apiKey = process.env.ANTHROPIC_API_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!apiKey) { console.error("Missing ANTHROPIC_API_KEY in .env.local"); process.exit(1); }
if (!url || !key) { console.error("Missing Supabase env in .env.local"); process.exit(1); }
const db = createClient(url, key);

type LyricsMap = Record<string, string>;
interface Row { id: string; title: string; lyrics_hinglish: LyricsMap | null; lyrics_hindi: LyricsMap | null; }

const PROGRESS_PATH = path.join(process.cwd(), ".song-import", "typo-progress.json");
const DIFF_PATH = path.join(process.cwd(), ".song-import", "typo-diff.txt");

const DEVANAGARI = /[ऀ-ॿ]/;

const SYSTEM = `You correct spelling and transliteration errors in Indian Christian worship song lyrics.

You receive one song as JSON with two parallel versions:
- "hindi": section -> Devanagari (Hindi script) text
- "hinglish": section -> romanized (Latin) text of the SAME lyrics

Use each version to cross-check the other and fix ONLY genuine errors:
- obvious spelling typos and inconsistent transliteration (e.g. "Mujhe Mein" -> "Mujh Mein" when the Hindi says "मुझ में"; "Gaatein" vs "Gaate")
- accidental letter swaps, doubled/dropped letters, wrong matras in Devanagari
- casing of the romanized text only where clearly wrong

You MUST NOT:
- change the meaning or wording, paraphrase, or "improve" lyrics
- translate between languages
- add, remove, merge, split, or reorder lines or sections
- change the number of lines in any section
- touch the "__order" value

Keep every section key exactly as given. Keep the same number of newline-separated
lines in every section. Keep Hindi in Devanagari and Hinglish in Latin script.

Return ONLY a JSON object: {"hindi": {...}|null, "hinglish": {...}|null}. No prose.`;

interface ApiResult { hindi: LyricsMap | null; hinglish: LyricsMap | null; }

async function callClaude(payload: { hindi: LyricsMap | null; hinglish: LyricsMap | null }): Promise<ApiResult | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === "text")?.text ?? "";
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) return null;
  try {
    return JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as ApiResult;
  } catch {
    return null;
  }
}

/** Validate that `out` is a safe word-level edit of `orig`. Returns reason on failure. */
function validate(orig: LyricsMap | null, out: LyricsMap | null | undefined, script: "hindi" | "hinglish"): string | null {
  if (orig === null) return out == null ? null : "expected null";
  if (!out || typeof out !== "object") return "missing map";
  const origKeys = Object.keys(orig).filter((k) => k !== "__order").sort();
  const outKeys = Object.keys(out).filter((k) => k !== "__order").sort();
  if (origKeys.join("|") !== outKeys.join("|")) return "section keys changed";
  if ((orig.__order ?? "") !== (out.__order ?? "")) return "__order changed";
  for (const k of origKeys) {
    const a = String(orig[k]).split("\n");
    const b = String(out[k] ?? "").split("\n");
    if (b.length !== a.length) return `line count changed in ${k} (${a.length}->${b.length})`;
    if (b.some((l) => l.trim() === "") && !a.some((l) => l.trim() === "")) return `blank line introduced in ${k}`;
    const joined = b.join("");
    if (script === "hindi" && DEVANAGARI.test(a.join("")) && !DEVANAGARI.test(joined)) return `${k} lost Devanagari`;
    if (script === "hinglish" && DEVANAGARI.test(joined)) return `Devanagari leaked into hinglish ${k}`;
  }
  return null;
}

function loadProgress(): Record<string, string> {
  try { return JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf8")); } catch { return {}; }
}
function saveProgress(p: Record<string, string>) {
  fs.mkdirSync(path.dirname(PROGRESS_PATH), { recursive: true });
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(p, null, 0));
}

async function fetchAll(): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("songs")
      .select("id,title,lyrics_hinglish,lyrics_hindi")
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

function diffLines(orig: LyricsMap | null, out: LyricsMap | null): string[] {
  if (!orig || !out) return [];
  const changes: string[] = [];
  for (const k of Object.keys(orig)) {
    if (k === "__order") continue;
    const a = String(orig[k]).split("\n");
    const b = String(out[k] ?? "").split("\n");
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) changes.push(`    [${k}] "${a[i]}" -> "${b[i]}"`);
    }
  }
  return changes;
}

async function main() {
  const progress = loadProgress();
  let rows = await fetchAll();
  rows = rows.filter((r) => !progress[r.id]);
  if (LIMIT > 0) rows = rows.slice(0, LIMIT);
  console.log(`Model: ${MODEL} | Mode: ${APPLY ? "APPLY" : "DRY-RUN"} | songs to process: ${rows.length} (resumable)`);

  let changed = 0, unchanged = 0, failed = 0;
  const diffOut: string[] = [];

  async function processOne(row: Row) {
    try {
      const payload = { hindi: row.lyrics_hindi, hinglish: row.lyrics_hinglish };
      const out = await callClaude(payload);
      if (!out) { progress[row.id] = "failed:noparse"; failed++; return; }
      const e1 = validate(row.lyrics_hindi, out.hindi, "hindi");
      const e2 = validate(row.lyrics_hinglish, out.hinglish, "hinglish");
      if (e1 || e2) { progress[row.id] = `failed:${e1 || e2}`; failed++; return; }

      const changes = [...diffLines(row.lyrics_hindi, out.hindi), ...diffLines(row.lyrics_hinglish, out.hinglish)];
      if (changes.length === 0) { progress[row.id] = "unchanged"; unchanged++; return; }

      diffOut.push(`# ${row.id} — ${row.title}\n${changes.join("\n")}`);
      changed++;

      if (APPLY) {
        const patch: Record<string, unknown> = {};
        if (out.hindi) patch.lyrics_hindi = out.hindi;
        if (out.hinglish) patch.lyrics_hinglish = out.hinglish;
        const { error } = await db.from("songs").update(patch).eq("id", row.id);
        if (error) { progress[row.id] = `failed:db:${error.message}`; return; }
      }
      progress[row.id] = APPLY ? "applied" : "would-change";
    } catch (err) {
      progress[row.id] = `failed:${err instanceof Error ? err.message.slice(0, 80) : "err"}`;
      failed++;
    }
  }

  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    await Promise.all(rows.slice(i, i + CONCURRENCY).map(processOne));
    saveProgress(progress);
    if ((i + CONCURRENCY) % 50 === 0 || i + CONCURRENCY >= rows.length) {
      console.log(`  ${Math.min(i + CONCURRENCY, rows.length)}/${rows.length}  (changed ${changed}, unchanged ${unchanged}, failed ${failed})`);
    }
  }

  fs.mkdirSync(path.dirname(DIFF_PATH), { recursive: true });
  fs.writeFileSync(DIFF_PATH, diffOut.join("\n\n"), "utf8");
  console.log(`\n=== DONE ===`);
  console.log(`Changed : ${changed}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Failed   : ${failed} (left untouched; see progress file)`);
  console.log(`Diff: ${path.relative(process.cwd(), DIFF_PATH)}`);
  if (!APPLY) console.log(`\nDRY-RUN: nothing written. Review the diff, then re-run with --apply.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
