/**
 * AI section-structuring for single-blob songs that have no mechanical signal
 * (no verse numbers, no repeated chorus, no blank lines) — the wall-of-text
 * songs that resection-numbered.ts / resection-chorus.ts can't safely split.
 *
 * Sends the Hindi (Devanagari) + Hinglish (romanized) blobs together so Claude
 * can split BOTH consistently, then applies the SAME safety gates as the
 * mechanical scripts:
 *   - identical section keys + __order in both languages (alignment)
 *   - every DISTINCT lyric line preserved, none invented (set equality; chorus
 *     dedup allowed)
 *   - Hindi stays Devanagari, Hinglish stays Latin
 * A song that fails any gate is left as-is and logged. No words are ever edited.
 *
 * Resumable (.song-import/section-progress.json) + before/after diff.
 * Requires ANTHROPIC_API_KEY in .env.local.
 *
 *   npx tsx scripts/section-ai.ts --limit=20      # dry-run a sample
 *   npx tsx scripts/section-ai.ts                 # dry-run all
 *   npx tsx scripts/section-ai.ts --apply
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

config({ path: ".env.local" });

const APPLY = process.argv.includes("--apply");
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);
const MODEL = process.argv.find((a) => a.startsWith("--model="))?.split("=")[1] ?? "claude-sonnet-4-6";
const CONCURRENCY = Number(process.argv.find((a) => a.startsWith("--concurrency="))?.split("=")[1] ?? 4);
const MIN_LINES = 9; // shorter blobs are fine as a single block

const apiKey = process.env.ANTHROPIC_API_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!apiKey) { console.error("Missing ANTHROPIC_API_KEY in .env.local"); process.exit(1); }
if (!url || !key) { console.error("Missing Supabase env in .env.local"); process.exit(1); }
const db = createClient(url, key);

type LyricsMap = Record<string, string>;
interface Row { id: string; title: string; lyrics_hindi: LyricsMap | null; lyrics_hinglish: LyricsMap | null; }

const PROGRESS = path.join(process.cwd(), ".song-import", "section-progress.json");
const DIFF = path.join(process.cwd(), ".song-import", "section-diff.txt");
const DEVANAGARI = /[ऀ-ॿ]/;

const SYSTEM = `You organize Indian Christian worship song lyrics into sections for display.

You receive one song as JSON: { "hindi": "<blob or null>", "hinglish": "<blob or null>" }.
Each blob is the full lyrics as newline-separated lines, currently unsectioned.

Split each language into sections using these keys only: chorus, prechorus, verse1,
verse2, verse3, ..., bridge, tag, outro, intro. The chorus is the recurring hook.

ABSOLUTE RULES:
- Preserve every lyric line EXACTLY. Never edit, translate, fix, add, remove, or
  reorder words within a line.
- If the chorus repeats, include it only ONCE (key "chorus").
- "hindi" and "hinglish" are the SAME song: give them IDENTICAL section keys and the
  SAME "__order".
- Keep Hindi in Devanagari, Hinglish in romanized Latin. Do not transliterate.
- Every input line must appear in exactly one output section.

Return ONLY JSON:
{"hindi":{"verse1":"...","chorus":"...","__order":"verse1|chorus|..."}|null,
 "hinglish":{...}|null}
"__order" is the pipe-separated section keys in display order. No prose.`;

interface Out { hindi: LyricsMap | null; hinglish: LyricsMap | null; }

async function callClaude(payload: { hindi: string | null; hinglish: string | null }): Promise<Out | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 8192, system: SYSTEM,
      messages: [{ role: "user", content: JSON.stringify(payload) }] }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === "text")?.text ?? "";
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a === -1 || b === -1) return null;
  try { return JSON.parse(text.slice(a, b + 1)) as Out; } catch { return null; }
}

const lineSet = (s: string) => new Set(s.split("\n").map((l) => l.trim()).filter(Boolean));
function mapLineSet(m: LyricsMap): Set<string> {
  const out = new Set<string>();
  for (const [k, v] of Object.entries(m)) if (k !== "__order") for (const l of String(v).split("\n")) { const t = l.trim(); if (t) out.add(t); }
  return out;
}

/** Validate one language's sectioning against its original blob. Returns reason or null. */
function validate(blob: string | null, m: LyricsMap | null | undefined, script: "hindi" | "hinglish"): string | null {
  if (!blob) return m == null ? null : "expected null";
  if (!m || typeof m !== "object") return "missing map";
  const keys = Object.keys(m).filter((k) => k !== "__order");
  if (keys.length < 2) return "not sectioned";
  if (typeof m.__order !== "string") return "missing __order";
  const orderKeys = m.__order.split("|").map((s) => s.trim());
  if (new Set(orderKeys).size !== keys.length || !keys.every((k) => orderKeys.includes(k))) return "__order mismatch";
  // distinct-line equality (chorus dedup allowed)
  const before = lineSet(blob), after = mapLineSet(m);
  if (before.size !== after.size) return `line set size ${before.size}->${after.size}`;
  for (const l of before) if (!after.has(l)) return "lost a line";
  for (const [k, v] of Object.entries(m)) {
    if (k === "__order") continue;
    if (!String(v).trim()) return `empty section ${k}`;
    if (script === "hinglish" && DEVANAGARI.test(String(v))) return "devanagari in hinglish";
  }
  return null;
}

function loadProgress(): Record<string, string> { try { return JSON.parse(fs.readFileSync(PROGRESS, "utf8")); } catch { return {}; } }
function saveProgress(p: Record<string, string>) { fs.mkdirSync(path.dirname(PROGRESS), { recursive: true }); fs.writeFileSync(PROGRESS, JSON.stringify(p)); }

function singleBlob(m: LyricsMap | null): string | null {
  if (!m) return null;
  const entries = Object.entries(m).filter(([k]) => k !== "__order");
  if (entries.length !== 1) return null; // already sectioned (or empty)
  return entries[0][1];
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
  const progress = loadProgress();
  let rows = (await fetchAll()).filter((r) => !progress[r.id]);
  // only single-blob songs long enough to need sectioning
  rows = rows.filter((r) => {
    const e = singleBlob(r.lyrics_hinglish), h = singleBlob(r.lyrics_hindi);
    const eLong = e && lineSet(e).size >= MIN_LINES, hLong = h && lineSet(h).size >= MIN_LINES;
    return eLong || hLong;
  });
  if (LIMIT > 0) rows = rows.slice(0, LIMIT);
  console.log(`Model: ${MODEL} | Mode: ${APPLY ? "APPLY" : "DRY-RUN"} | candidates: ${rows.length}`);

  let sectioned = 0, skipped = 0, failed = 0;
  const diff: string[] = [];

  async function one(row: Row) {
    try {
      const eBlob = singleBlob(row.lyrics_hinglish), hBlob = singleBlob(row.lyrics_hindi);
      const out = await callClaude({ hindi: hBlob, hinglish: eBlob });
      if (!out) { progress[row.id] = "fail:noparse"; failed++; return; }
      const e1 = validate(hBlob, out.hindi, "hindi");
      const e2 = validate(eBlob, out.hinglish, "hinglish");
      if (e1 || e2) { progress[row.id] = `skip:${e1 || e2}`; skipped++; return; }
      // alignment gate
      if (out.hindi && out.hinglish && out.hindi.__order !== out.hinglish.__order) {
        progress[row.id] = "skip:order-mismatch"; skipped++; return;
      }
      sectioned++;
      diff.push(`# ${row.id} -> ${(out.hinglish ?? out.hindi)!.__order}`);
      if (APPLY) {
        const patch: Record<string, unknown> = {};
        if (out.hindi) patch.lyrics_hindi = out.hindi;
        if (out.hinglish) patch.lyrics_hinglish = out.hinglish;
        const { error } = await db.from("songs").update(patch).eq("id", row.id);
        if (error) { progress[row.id] = `fail:db`; return; }
      }
      progress[row.id] = APPLY ? "applied" : "would-section";
    } catch (err) {
      progress[row.id] = `fail:${err instanceof Error ? err.message.slice(0, 60) : "err"}`; failed++;
    }
  }

  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    await Promise.all(rows.slice(i, i + CONCURRENCY).map(one));
    saveProgress(progress);
    if ((i + CONCURRENCY) % 40 === 0 || i + CONCURRENCY >= rows.length)
      console.log(`  ${Math.min(i + CONCURRENCY, rows.length)}/${rows.length}  (sectioned ${sectioned}, skipped ${skipped}, failed ${failed})`);
  }

  fs.mkdirSync(path.dirname(DIFF), { recursive: true });
  fs.writeFileSync(DIFF, diff.join("\n"), "utf8");
  console.log(`\nSectioned: ${sectioned} | Skipped (gates): ${skipped} | Failed: ${failed}`);
  console.log(`Diff: ${path.relative(process.cwd(), DIFF)}`);
  if (!APPLY) console.log(`\nDRY-RUN: nothing written. Review, then --apply.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
