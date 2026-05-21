/**
 * Deterministic song cleanup script.
 *
 * Fixes mechanical corruption in bulk-uploaded songs:
 *   - Strips inline verse numbering (1., 2., 3., 4.)
 *   - Splits numbered sections into proper verse1/verse2/chorus/bridge keys
 *   - Fixes broken word boundaries from scraper (e.g. "haikaliyaannee")
 *   - Normalises ALL-CAPS Hinglish text to title-case
 *   - Removes scraper artifacts (URLs, "Copyright", "Download", etc.)
 *   - Sets __order based on discovered sections
 *
 * Run: node scripts/cleanup-songs.mjs [--dry-run] [--limit=50]
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envPath = join(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim()];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const PAGE_SIZE = 100;

const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = parseInt((process.argv.find((a) => a.startsWith("--limit=")) ?? "--limit=0").split("=")[1]) || 0;

if (DRY_RUN) console.log("🔍 DRY RUN — no changes will be written\n");

// ── Helpers ──────────────────────────────────────────────────────────────────

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase ${options.method ?? "GET"} ${path}: ${res.status} ${txt}`);
  }
  return res;
}

async function fetchPage(from, to) {
  const res = await sbFetch(
    `/songs?artist=eq.Unknown%20Artist&select=id,title,artist,church,lyrics_hinglish,lyrics_hindi&order=id&offset=${from}&limit=${PAGE_SIZE}`,
    { headers: { "Range-Unit": "items", Range: `${from}-${to}` } }
  );
  return res.json();
}

async function updateSong(id, patch) {
  await sbFetch(`/songs?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

// ── Text cleaning ─────────────────────────────────────────────────────────────

const SCRAPER_JUNK = [
  /^(copyright|download|listen|subscribe|share|watch|follow|playlist|lyrics by|music by|composed by|album:|released:|label:).*/im,
  /https?:\/\/\S+/g,
  /www\.\S+/g,
  /\[\s*\]/g,
  /\(\s*\)/g,
];

function stripScraperJunk(text) {
  let t = text;
  for (const pat of SCRAPER_JUNK) {
    t = t.replace(pat, "");
  }
  return t.replace(/\n{3,}/g, "\n\n").trim();
}

/** Fix collapsed words from bad OCR/scraping e.g. "haiKaliyaan" or "haijaana" */
function fixWordBoundaries(text) {
  // Insert space before uppercase after lowercase (camelCase artifacts)
  return text.replace(/([a-z])([A-Z])/g, "$1 $2");
}

/** Convert ALL CAPS Hinglish to Title Case (only if 60%+ chars are uppercase) */
function normaliseCaps(text) {
  const alpha = text.replace(/[^a-zA-Z]/g, "");
  if (alpha.length === 0) return text;
  const upperRatio = (alpha.match(/[A-Z]/g) ?? []).length / alpha.length;
  if (upperRatio < 0.6) return text;
  // Title-case: lowercase everything, then capitalise first letter of each line
  return text
    .toLowerCase()
    .replace(/^./gm, (c) => c.toUpperCase());
}

/**
 * Split a blob with inline numbering like:
 *   "1. Verse one text\n2. Second verse text\n3. Third"
 * Returns { verse1, verse2, ... } or null if pattern not detected.
 */
function splitByInlineNumbers(text) {
  // Match patterns: "1.", "1)", "Verse 1:", "Chorus:", "(1)", etc.
  const numbered = text.match(/(?:^|\n)\s*(?:\d+[.)]\s+|\((?:chorus|bridge|\d+)\)\s*)/i);
  if (!numbered) return null;

  const sections = {};
  const order = [];
  let sectionCount = { verse: 0, chorus: 0, bridge: 0 };

  // Try splitting on lines that start with a number or label
  const parts = text.split(/\n(?=\s*\d+[.)]\s)/);
  if (parts.length >= 2) {
    parts.forEach((part, i) => {
      const clean = part.replace(/^\s*\d+[.)]\s*/, "").trim();
      if (!clean) return;
      // First numbered section is always verse1; subsequent are verse2, verse3...
      const key = i === 0
        ? "verse1"
        : `verse${i + 1}`;
      sections[key] = clean;
      order.push(key);
    });
    if (order.length > 0) return { sections, order };
  }

  return null;
}

/**
 * Detect section labels that appear inline in the text like:
 *   "Verse 1\nText...\nChorus\nText..."
 */
function splitByInlineLabels(text) {
  const LABEL_RE = /^(verse\s*[12345]?|chorus|pre[-\s]?chorus|bridge|tag|outro|final\s*chorus|pre[-\s]?bridge)\s*:?\s*$/im;
  const lines = text.split("\n");
  const sections = {};
  const order = [];
  let current = null;
  let buf = [];
  let sectionCount = { verse: 0, chorus: 0, bridge: 0 };

  for (const line of lines) {
    const match = line.trim().match(LABEL_RE);
    if (match) {
      if (current && buf.join("\n").trim()) {
        sections[current] = buf.join("\n").trim();
      }
      // Determine key
      const label = match[1].toLowerCase().replace(/\s+/g, "_");
      let key;
      if (label.startsWith("verse")) {
        sectionCount.verse++;
        key = `verse${sectionCount.verse}`;
      } else if (label.includes("pre")) {
        key = sectionCount.chorus > 0 ? `pre_chorus${sectionCount.chorus + 1}` : "pre_chorus";
      } else if (label.startsWith("chorus") || label === "final_chorus") {
        sectionCount.chorus++;
        key = sectionCount.chorus === 1 ? "chorus" : `chorus${sectionCount.chorus}`;
      } else if (label.startsWith("bridge")) {
        sectionCount.bridge++;
        key = sectionCount.bridge === 1 ? "bridge" : `bridge${sectionCount.bridge}`;
      } else {
        key = label;
      }
      current = key;
      order.push(key);
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (current && buf.join("\n").trim()) {
    sections[current] = buf.join("\n").trim();
  }

  if (order.length > 1) return { sections, order };
  return null;
}

function cleanSection(text) {
  let t = stripScraperJunk(text);
  t = fixWordBoundaries(t);
  t = normaliseCaps(t);
  // Strip trailing (x2) repeat markers left in lyrics — leave them if they're on lyric lines
  t = t.replace(/^\s*x\d+\s*$/gim, "").trim();
  // Remove blank-line-only runs
  t = t.replace(/\n{3,}/g, "\n\n").trim();
  return t;
}

// ── Main processing ───────────────────────────────────────────────────────────

function processLyricsMap(lyricsMap, language) {
  if (!lyricsMap) return null;

  const keys = Object.keys(lyricsMap).filter((k) => k !== "__order");
  // If already properly split (more than just verse1), just clean text in each section
  if (keys.length > 1) {
    const cleaned = { __order: lyricsMap.__order ?? keys.join("|") };
    for (const k of keys) {
      cleaned[k] = cleanSection(lyricsMap[k] ?? "");
    }
    return cleaned;
  }

  // Single blob (usually verse1) — attempt splitting
  const blob = lyricsMap[keys[0]] ?? "";
  const cleaned = cleanSection(blob);

  // Try label-based split first
  const labelSplit = splitByInlineLabels(cleaned);
  if (labelSplit) {
    return {
      __order: labelSplit.order.join("|"),
      ...labelSplit.sections,
    };
  }

  // Try numbered split
  const numSplit = splitByInlineNumbers(cleaned);
  if (numSplit) {
    return {
      __order: numSplit.order.join("|"),
      ...numSplit.sections,
    };
  }

  // Can't split deterministically — at least clean the text
  return {
    __order: "verse1",
    verse1: cleaned,
  };
}

function processSong(song) {
  const hinglish = processLyricsMap(song.lyrics_hinglish, "hinglish");
  const hindi = processLyricsMap(song.lyrics_hindi, "hindi");

  return {
    lyrics_hinglish: hinglish,
    lyrics_hindi: hindi,
  };
}

// ── Run ───────────────────────────────────────────────────────────────────────

const stats = { total: 0, split: 0, cleaned_only: 0, skipped: 0, errors: 0 };

async function run() {
  console.log("Fetching Unknown Artist songs from Supabase...\n");

  let from = 0;
  let processed = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    let songs;
    try {
      songs = await fetchPage(from, to);
    } catch (err) {
      console.error("Fetch error:", err.message);
      break;
    }
    if (!songs.length) break;

    for (const song of songs) {
      if (LIMIT && processed >= LIMIT) break;

      try {
        const before_hinglish_keys = Object.keys(song.lyrics_hinglish ?? {}).filter((k) => k !== "__order");
        const patch = processSong(song);
        const after_keys = Object.keys(patch.lyrics_hinglish ?? {}).filter((k) => k !== "__order");

        const wasSplit = after_keys.length > before_hinglish_keys.length;
        if (wasSplit) stats.split++;
        else stats.cleaned_only++;

        stats.total++;

        const status = wasSplit ? "SPLIT" : "CLEAN";
        console.log(`[${status}] ${song.id} — ${before_hinglish_keys.length} → ${after_keys.length} sections`);

        if (!DRY_RUN) {
          await updateSong(song.id, patch);
        }
      } catch (err) {
        stats.errors++;
        console.error(`[ERROR] ${song.id}: ${err.message}`);
      }

      processed++;
    }

    if (LIMIT && processed >= LIMIT) break;
    from += PAGE_SIZE;
    if (songs.length < PAGE_SIZE) break;
  }

  console.log("\n── Summary ─────────────────────");
  console.log(`Total processed : ${stats.total}`);
  console.log(`Sections split  : ${stats.split}`);
  console.log(`Cleaned only    : ${stats.cleaned_only}`);
  console.log(`Errors          : ${stats.errors}`);
  if (DRY_RUN) console.log("\n(DRY RUN — nothing was written)");
}

run().catch(console.error);
