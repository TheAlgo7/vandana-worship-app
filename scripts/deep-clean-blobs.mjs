/**
 * Deep-clean all single-blob songs in Supabase.
 * Goal: readable, artifact-free lyrics — no fake structure, just clean text.
 *
 * Run: node scripts/deep-clean-blobs.mjs [--dry-run] [--limit=50]
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, "../.env.local");

const env = Object.fromEntries(
  readFileSync(ENV_PATH, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()]; })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const PAGE_SIZE = 100;
const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = parseInt((process.argv.find((a) => a.startsWith("--limit=")) ?? "--limit=0").split("=")[1]) || 0;

if (DRY_RUN) console.log("DRY RUN\n");

// ── Deep cleaner ──────────────────────────────────────────────────────────────

function deepClean(text) {
  if (!text) return text;

  let lines = text.split("\n");

  // ── Pass 1: Strip entire intro/outro blocks ─────────────────────────────────

  // Drop lines that are SEO intro prose (often injected at top)
  const SEO_INTRO = /^(read the full|read below|here (are|is) the|lyrics of|check out|download the|listen to|this song|hindi christian song|english song|worship song lyrics|song title:|about this song|hindi song lyrics|song lyrics:|english lyrics|hinglish lyrics)/i;
  while (lines.length && SEO_INTRO.test(lines[0].trim())) lines.shift();
  lines = lines.filter((l) => !SEO_INTRO.test(l.trim()));

  // Truncate at known end-of-lyrics sentinels (everything after is metadata/code)
  const TRUNCATE_SENTINELS = [
    /^::\s*song\s*(details?|credit)/i,
    /^::\s*songs?\s*credit/i,
    /^(trending|🔥|hot|popular)\s*(worship\s*)?songs?/i,
    /^home\s*page\s*:/i,
    /^widget\s*style\s*:/i,
    /^"@context"\s*:/i,
    /^container\s*id\s*:/i,
    /^\[note:\s/i,
  ];
  const cutAt = lines.findIndex((l) => TRUNCATE_SENTINELS.some((re) => re.test(l.trim())));
  if (cutAt > 0) lines = lines.slice(0, cutAt);

  // Drop JavaScript/CSS/code fragments
  lines = lines.filter((l) => !/^\s*(var |let |const |function |document\.|window\.|iframe\.|<script|<\/script|\/\*|\*\/|@media|@keyframes|@font-face)/.test(l));
  // Lines ending with ; are code statements (CSS props, JS assignments)
  lines = lines.filter((l) => !/;\s*$/.test(l));
  // CSS selector lines: ".class {", "#id {"
  lines = lines.filter((l) => !/^\s*[.#][\w-]/.test(l));
  // Standalone braces
  lines = lines.filter((l) => !/^\s*[{}]\s*$/.test(l));
  // JSON-LD key-value lines: "key": "value" or "key": {
  lines = lines.filter((l) => !/^\s*"[\w\s@]+":\s/.test(l));
  // Lines that are purely a role/instrument credit label: "Electric Guitars:", "Backing Vocals:"
  const CREDIT_LINE = /^(lead |backing |supporting |additional )?(vocals?|guitars?|keys|bass|drums?|choir|piano|synthesizers?|arrangement|production|mixing|mastering|recording credits?|music|lyrics & music|vocal recordd?ing|shoot|edit|percussion|mix|master|media partner)\s*:/i;
  lines = lines.filter((l) => !CREDIT_LINE.test(l.trim()));
  // Song attribution lines: "Title – Artists | Genre" from scraper header
  // Also catch any line containing " | Hindi" / " | Christian" / " | Worship" genre tag
  lines = lines.filter((l) => !/\|\s*(hindi|christian|english|worship)\s*(song|lyrics|worship)?/i.test(l));
  // UI button text injected from scraper
  lines = lines.filter((l) => !/^\s*(show (english|hindi|hinglish) lyrics?|toggle lyrics?|switch (language|to))\s*$/i.test(l));
  // :: Double colon delimited section headers from jesussongs4u
  lines = lines.filter((l) => !/^::/.test(l.trim()));

  // Drop common scraper metadata lines
  const META_LINE = /^(source|song code|category|album|label|tags?|keywords?|released?|duration|views?|produced by|written by|music by|composed by|copyright|download|subscribe|share|like\s|playlist|watch|listen|singer|starring|featuring|ft\.|click here|more songs|related songs|you may also|also read|also listen|read more|see more|click to|powered by|all rights|rights reserved|channel link|song name|credit:|🔥)/i;
  lines = lines.filter((l) => !META_LINE.test(l.trim()));

  // Drop URL-only lines
  lines = lines.filter((l) => !/^\s*https?:\/\/\S+\s*$/.test(l));
  lines = lines.filter((l) => !/^\s*www\.\S+\s*$/.test(l));

  let t = lines.join("\n");

  // ── Pass 2: Strip scraper-injected English translation blocks ──────────────
  // Detect 3+ consecutive lines that are clearly English (has English function
  // words, no Hinglish markers, pure ASCII) and truncate from the first such run.

  const ENG_WORDS = /\b(you|your|me|my|we|our|him|his|her|its|they|their|the|is|are|was|were|be|been|have|has|had|will|would|could|should|may|might|must|can|who|what|which|how|why|when|where|life|love|heart|come|give|bring|brought|save|free|truth|light|sing|bless|grace|mercy|glory|peace|joy|eternal|forever|always|never|faith|hope|away|near|still|again|sad|tired|empty|thirst|water|afraid|strong|weak|broken|filled|soul|spirit)\b/g;
  const HIN_WORDS = /\b(hai|hain|mein|ko|se|ke|ki|ka|aur|nahi|tu|tere|mere|tera|mera|yeh|woh|hum|bhi|toh|ne|tha|thi|gaya|liya|liye|raha|diya|kiya|prabhu|yeshu|yesu|eeshvar|khuda|masih|pyaar|jeevan|stuti|naam|dil|aatma|pavitra|rab|duniya|zindagi|anand|karo|kare|karu|hoga|hogi|rahoon|baitha|dekho|suno|jao|aao)\b/i;

  const isEngLine = (l) => /^[a-zA-Z\s,.'!?()\-"]+$/.test(l) && !HIN_WORDS.test(l) && (l.match(ENG_WORDS) || []).length >= 2;

  {
    const lns = t.split("\n");
    let run = 0, runStart = -1;
    for (let i = 0; i < lns.length; i++) {
      const trimmed = lns[i].trim();
      if (!trimmed) { run = 0; runStart = -1; continue; }
      if (isEngLine(trimmed)) { if (run === 0) runStart = i; run++; if (run >= 3) { t = lns.slice(0, runStart).join("\n"); break; } }
      else { run = 0; runStart = -1; }
    }
  }

  // ── Pass 4: Inline artifact removal ────────────────────────────────────────

  // Inline URLs
  t = t.replace(/https?:\/\/\S+/g, "");

  // Guitar chord notation: [C], [Am], [F#m], [G/B], [Dsus4], etc.
  t = t.replace(/\[[A-G][b#]?[a-zA-Z0-9\/]*\]/g, "");
  // Clean up any lines that are now empty after chord removal (only had chords)
  t = t.replace(/^\s*\s*$/gm, "");

  // Section labels embedded inline — strip them (we don't fake-label blobs)
  // e.g. "Verse 1:", "Chorus:", "Bridge:", "[Verse 1]", "[Chorus]"
  t = t.replace(/^\s*\[?(verse\s*\d*|chorus\s*\d*|pre[-\s]?chorus\s*\d*|bridge\s*\d*|tag\s*\d*|outro|intro|interlude|refrain|stanza\s*\d*)\]?\s*:?\s*$/gim, "");

  // Repeat count markers at end of lines: "(2)", "- (2)", "(x2)", "×2", "X2", "x 2"
  t = t.replace(/\s*[-–]?\s*[\(\[]?\s*[xX×]\s*\d+\s*[\)\]]?\s*$/gm, "");
  t = t.replace(/\s*[-–]\s*\(\d+\)\s*$/gm, "");
  t = t.replace(/\s+\(\d+\)\s*$/gm, "");

  // Standalone repeat marker lines: "(2)", "2x", "x3", "(repeat)"
  t = t.replace(/^\s*[\(\[]?\s*[xX×]?\s*\d+\s*[xX]?\s*[\)\]]?\s*$/gm, "");
  t = t.replace(/^\s*\(?(repeat|x\d+|\d+x)\)?\s*$/gim, "");

  // Numbered section starters at line beginning: "1.", "2.", "1)", "(1)"
  t = t.replace(/^[\s]*\d+[.)]\s+/gm, "");
  t = t.replace(/^[\s]*\(\d+\)\s+/gm, "");

  // Ellipsis artifacts: "……", "......", "........."
  t = t.replace(/[.…]{3,}/g, "");

  // Horizontal rule artifacts: "-------", "=====", "* * *", "_ _ _"
  t = t.replace(/^[\s\-=*_~]{4,}\s*$/gm, "");

  // Fix camelCase word boundary artifacts: "haiKaliyaan" → "hai Kaliyaan"
  t = t.replace(/([a-z])([A-Z])/g, "$1 $2");

  // ── Pass 3: Capitalisation ──────────────────────────────────────────────────

  // Normalise ALL CAPS Hinglish lines to Title Case (>65% uppercase)
  t = t.replace(/^(.+)$/gm, (line) => {
    const alpha = line.replace(/[^a-zA-Z]/g, "");
    if (alpha.length < 4) return line;
    const upperRatio = (line.match(/[A-Z]/g) ?? []).length / alpha.length;
    if (upperRatio < 0.65) return line;
    // Simple lowercase + capitalise first char of line
    return line.toLowerCase().replace(/^./, (c) => c.toUpperCase());
  });

  // ── Pass 4: Structural cleanup ──────────────────────────────────────────────

  // Remove lines that are empty or only punctuation/symbols
  t = t.replace(/^[^\wऀ-ॿa-zA-Z]+$/gm, "");

  // Collapse 3+ consecutive blank lines to single blank
  t = t.replace(/\n{3,}/g, "\n\n");

  return t.trim();
}

function isBlob(lyricsMap) {
  if (!lyricsMap) return false;
  const keys = Object.keys(lyricsMap).filter((k) => k !== "__order");
  return keys.length === 1;
}

// ── Supabase ──────────────────────────────────────────────────────────────────

async function fetchPage(from) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/songs?select=id,lyrics_hinglish,lyrics_hindi&order=id&offset=${from}&limit=${PAGE_SIZE}`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Range-Unit": "items", Range: `${from}-${from + PAGE_SIZE - 1}` } }
  );
  return res.json();
}

async function patchSong(id, patch) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/songs?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    }
  );
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const stats = { checked: 0, cleaned: 0, skipped: 0, errors: 0 };

async function run() {
  let from = 0;
  let processed = 0;

  while (true) {
    const songs = await fetchPage(from);
    if (!songs.length) break;

    for (const song of songs) {
      if (LIMIT && processed >= LIMIT) break;

      stats.checked++;
      processed++;

      const hinglishIsBlob = isBlob(song.lyrics_hinglish);
      const hindiIsBlob = isBlob(song.lyrics_hindi);

      // Process all songs — clean every section regardless of blob/split
      const patch = {};

      if (song.lyrics_hinglish) {
        const cleaned = {};
        for (const [k, v] of Object.entries(song.lyrics_hinglish)) {
          cleaned[k] = k === "__order" ? v : deepClean(v);
        }
        patch.lyrics_hinglish = cleaned;
      }

      if (song.lyrics_hindi) {
        const cleaned = {};
        for (const [k, v] of Object.entries(song.lyrics_hindi)) {
          cleaned[k] = k === "__order" ? v : deepClean(v);
        }
        patch.lyrics_hindi = cleaned;
      }

      if (!patch.lyrics_hinglish && !patch.lyrics_hindi) { stats.skipped++; continue; }

      if (DRY_RUN) {
        // Show before/after for first few
        if (processed <= 5) {
          const origKey = Object.keys(song.lyrics_hinglish ?? {}).find((k) => k !== "__order");
          const orig = song.lyrics_hinglish?.[origKey ?? ""] ?? "";
          const cleaned = patch.lyrics_hinglish?.[origKey ?? ""] ?? "";
          if (orig !== cleaned) {
            console.log(`=== ${song.id} ===`);
            console.log("BEFORE:", orig.slice(0, 200));
            console.log("AFTER :", cleaned.slice(0, 200));
            console.log();
          }
        }
        stats.cleaned++;
        continue;
      }

      try {
        await patchSong(song.id, patch);
        stats.cleaned++;
        if (stats.cleaned % 100 === 0) process.stdout.write(`\r  Cleaned ${stats.cleaned} songs...`);
      } catch (e) {
        stats.errors++;
        console.error(`\nERROR ${song.id}: ${e.message}`);
      }
    }

    if (LIMIT && processed >= LIMIT) break;
    from += PAGE_SIZE;
    if (songs.length < PAGE_SIZE) break;
  }

  console.log(`\n── Summary ──────────────────────`);
  console.log(`Checked : ${stats.checked}`);
  console.log(`Cleaned : ${stats.cleaned}`);
  console.log(`Errors  : ${stats.errors}`);
  if (DRY_RUN) console.log("(DRY RUN)");
}

run().catch(console.error);
