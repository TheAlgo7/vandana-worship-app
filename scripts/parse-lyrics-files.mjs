/**
 * Lyrics text file parser + Supabase upserter.
 *
 * Reads all 4 batches of scraped lyrics text files, parses them into
 * structured JSON (verse1/chorus/bridge/etc.), and PATCHes existing
 * DB records with cleaner lyrics + correct artist names.
 *
 * Only updates songs that already exist in DB — never creates orphans.
 *
 * Run:
 *   node scripts/parse-lyrics-files.mjs [--dry-run] [--batch=1] [--limit=50]
 */

import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

const LYRICS_DIR = "C:/Users/Gaurav/Desktop/Lyrics";
const ENV_PATH = join(__dirname, "../.env.local");

const env = Object.fromEntries(
  readFileSync(ENV_PATH, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()]; })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_FILTER = (process.argv.find((a) => a.startsWith("--batch=")) ?? "").split("=")[1];
const LIMIT = parseInt((process.argv.find((a) => a.startsWith("--limit=")) ?? "--limit=0").split("=")[1]) || 0;

if (DRY_RUN) console.log("🔍 DRY RUN — no changes will be written\n");

// ── Supabase helpers ──────────────────────────────────────────────────────────

/** All DB song IDs loaded once at startup for fast matching */
let DB_IDS = null;

async function loadAllDbIds() {
  if (DB_IDS) return DB_IDS;
  const ids = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/songs?select=id,artist&order=id&offset=${from}&limit=${PAGE}`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    const data = await res.json();
    ids.push(...data);
    if (data.length < PAGE) break;
  }
  DB_IDS = ids; // array of {id, artist}
  console.log(`Loaded ${ids.length} song IDs from DB\n`);
  return ids;
}

async function songExists(id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/songs?id=eq.${encodeURIComponent(id)}&select=id,artist`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  );
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

/** Convert a title string to a DB-style slug */
function titleToSlug(title) {
  return title
    .toLowerCase()
    // Remove content in parens/brackets (often Hindi in parens, year, etc.)
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    // Remove Hindi/Devanagari characters
    .replace(/[ऀ-ॿ]/g, "")
    // Remove common prefixes
    .replace(/^\d{4}\s*new\s*worship\s*song\s*[-–]\s*/i, "")
    .replace(/^(new\s+)?hindi\s+christian\s+song\s*[-–]\s*/i, "")
    // Remove artist after last " - " (if title includes it)
    .replace(/\s*-\s*[^-]+$/, "")
    // Slug-ify
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

/** Find the best-matching DB ID for a given title */
function findDbId(title, dbIds) {
  const targetSlug = titleToSlug(title);
  if (!targetSlug) return null;

  // Exact match
  const exact = dbIds.find((r) => r.id === targetSlug);
  if (exact) return exact;

  // Prefix match (DB id starts with target, or vice versa)
  const prefix = dbIds.find((r) =>
    r.id.startsWith(targetSlug) || targetSlug.startsWith(r.id)
  );
  if (prefix) return prefix;

  // Fuzzy: target contains DB id or DB id contains target
  const contains = dbIds.find(
    (r) => r.id.includes(targetSlug) || targetSlug.includes(r.id)
  );
  return contains ?? null;
}

async function patchSong(id, patch) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/songs?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(patch),
    }
  );
  if (!res.ok) throw new Error(`PATCH ${id}: ${res.status} ${await res.text()}`);
}

// ── Section label normaliser ──────────────────────────────────────────────────

const sectionCounts = {};

function resetSectionCounts() {
  Object.keys(sectionCounts).forEach((k) => delete sectionCounts[k]);
}

function labelToKey(raw) {
  const label = raw.toLowerCase().trim();

  if (/pre[-\s]?chorus/.test(label)) {
    sectionCounts.pre_chorus = (sectionCounts.pre_chorus ?? 0) + 1;
    return sectionCounts.pre_chorus === 1 ? "pre_chorus" : `pre_chorus${sectionCounts.pre_chorus}`;
  }
  if (/final\s*chorus/.test(label)) return "final_chorus";
  if (/chorus/.test(label)) {
    sectionCounts.chorus = (sectionCounts.chorus ?? 0) + 1;
    return sectionCounts.chorus === 1 ? "chorus" : `chorus${sectionCounts.chorus}`;
  }
  if (/verse\s*(\d*)/.test(label)) {
    const n = parseInt(label.match(/\d+/)?.[0] ?? "0");
    if (n > 0) return `verse${n}`;
    sectionCounts.verse = (sectionCounts.verse ?? 0) + 1;
    return `verse${sectionCounts.verse}`;
  }
  if (/bridge/.test(label)) {
    sectionCounts.bridge = (sectionCounts.bridge ?? 0) + 1;
    return sectionCounts.bridge === 1 ? "bridge" : `bridge${sectionCounts.bridge}`;
  }
  if (/tag/.test(label)) {
    sectionCounts.tag = (sectionCounts.tag ?? 0) + 1;
    return sectionCounts.tag === 1 ? "tag" : `tag${sectionCounts.tag}`;
  }
  if (/outro/.test(label)) return "outro";
  if (/intro/.test(label)) return "intro";
  if (/interlude/.test(label)) return "interlude";
  if (/hook/.test(label)) return "hook";

  // Fallback — slugify
  return label.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

// ── Lyrics section parser (for files WITH [Label] markers) ───────────────────

function parseSectionedLyrics(block) {
  const SECTION_RE = /^\[([^\]]+)\]\s*$/m;
  const lines = block.split("\n");
  const sections = {};
  const order = [];
  let currentKey = null;
  let buf = [];

  resetSectionCounts();

  for (const line of lines) {
    const match = line.match(/^\[([^\]]+)\]\s*$/);
    if (match) {
      if (currentKey !== null && buf.join("\n").trim()) {
        sections[currentKey] = buf.join("\n").trim();
      }
      currentKey = labelToKey(match[1]);
      order.push(currentKey);
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (currentKey !== null && buf.join("\n").trim()) {
    sections[currentKey] = buf.join("\n").trim();
  }

  if (order.length === 0) return null;
  return { __order: order.join("|"), ...sections };
}

// ── Blob cleaner (for files WITHOUT markers) ──────────────────────────────────

function cleanBlob(text) {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^(copyright|download|listen|subscribe|share|watch|source|song code):?.*/im, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([a-z])([A-Z])/g, "$1 $2") // fix camelCase scraper artifacts
    .trim();
}

function blobToSections(text) {
  const cleaned = cleanBlob(text);
  // Try splitting on inline 1. 2. 3. markers
  const parts = cleaned.split(/\n(?=\s*\d+[.)]\s)/);
  if (parts.length >= 2) {
    const sections = {};
    const order = [];
    parts.forEach((part, i) => {
      const clean = part.replace(/^\s*\d+[.)]\s*/, "").trim();
      if (!clean) return;
      const key = i === 0 ? "verse1" : `verse${i + 1}`;
      sections[key] = clean;
      order.push(key);
    });
    if (order.length > 1) return { __order: order.join("|"), ...sections };
  }
  return { __order: "verse1", verse1: cleaned };
}

// ── File-to-slug ──────────────────────────────────────────────────────────────

function fileToSlug(filename) {
  return filename
    .replace(/\.txt$/, "")
    // Remove unicode chars (Hindi in filename etc.)
    .replace(/[^\x00-\x7F]/g, "")
    // Remove common suffix patterns from messy filenames
    .replace(/-\d+$/, "") // trailing -2, -3 etc.
    .replace(/[-_]+$/, "")
    .toLowerCase()
    .trim();
}

// ── Batch-specific parsers ────────────────────────────────────────────────────

/**
 * Batch 1 — indianchristianlyrics.in
 * Line 0: title, Line 1: artist, Lines 2+: URLs
 * Has [Verse X] / [Chorus] / [Bridge] section markers.
 * Has both Hindi and Hinglish sections.
 */
function parseBatch1(content, filename) {
  const lines = content.split("\n");
  const title = lines[0]?.trim() ?? "";
  const artist = lines[1]?.trim() ?? "Unknown Artist";

  const hindiStart = content.indexOf("Hindi Lyrics");
  const hinglishStart = content.indexOf("Hinglish Lyrics");

  if (hindiStart === -1 && hinglishStart === -1) return null;

  let hindiBlock = "";
  let hinglishBlock = "";

  if (hindiStart !== -1 && hinglishStart !== -1) {
    hindiBlock = content.slice(hindiStart, hinglishStart);
    hinglishBlock = content.slice(hinglishStart);
  } else if (hinglishStart !== -1) {
    hinglishBlock = content.slice(hinglishStart);
  } else {
    hindiBlock = content.slice(hindiStart);
  }

  // Strip section headers
  const stripHeader = (b) => b.replace(/^(Hindi|Hinglish) Lyrics\s*\n-+/m, "").trim();
  hindiBlock = stripHeader(hindiBlock);
  hinglishBlock = stripHeader(hinglishBlock);

  const lyrics_hindi = hindiBlock ? parseSectionedLyrics(hindiBlock) ?? { __order: "verse1", verse1: cleanBlob(hindiBlock) } : null;
  const lyrics_hinglish = hinglishBlock ? parseSectionedLyrics(hinglishBlock) ?? { __order: "verse1", verse1: cleanBlob(hinglishBlock) } : null;

  return { title, artist, lyrics_hindi, lyrics_hinglish };
}

/**
 * Batch 2 — jesussongs4u.com
 * Line 0: messy title, Line 1: URL
 * Has Hindi/Hinglish headers but no section markers — raw blobs.
 */
function parseBatch2(content, filename) {
  const lines = content.split("\n");
  const title = lines[0]?.trim().replace(/\s*-\s*lyrics.*$/i, "").trim() ?? "";

  const hindiStart = content.indexOf("Hindi Lyrics");
  const hinglishStart = content.indexOf("Hinglish Lyrics");

  let hindiBlock = "";
  let hinglishBlock = "";

  if (hindiStart !== -1 && hinglishStart !== -1) {
    hindiBlock = content.slice(hindiStart, hinglishStart);
    hinglishBlock = content.slice(hinglishStart);
  } else if (hindiStart !== -1) {
    hindiBlock = content.slice(hindiStart);
  } else if (hinglishStart !== -1) {
    hinglishBlock = content.slice(hinglishStart);
  } else {
    // No language headers — treat whole thing as a blob after header lines
    const bodyStart = lines.findIndex((l, i) => i > 0 && l.startsWith("http")) + 1;
    hinglishBlock = lines.slice(bodyStart).join("\n");
  }

  const stripHeader = (b) => b.replace(/^(Hindi|Hinglish) Lyrics\s*\n-+/m, "").trim();
  hindiBlock = stripHeader(hindiBlock);
  hinglishBlock = stripHeader(hinglishBlock);

  const lyrics_hindi = hindiBlock ? blobToSections(hindiBlock) : null;
  const lyrics_hinglish = hinglishBlock ? blobToSections(hinglishBlock) : null;

  return { title, artist: "Unknown Artist", lyrics_hindi, lyrics_hinglish };
}

/**
 * Batch 3 — christsquare.com
 * Line 0: messy title + URL combined, Line 1: URL
 * Has Hindi Lyrics header but no section markers.
 * Often Hindi only.
 */
function parseBatch3(content, filename) {
  const lines = content.split("\n");
  // Title is everything before the URL on line 0
  const title = lines[0]?.split("https://")[0]?.trim().replace(/[-_]+$/, "") ?? "";

  const hindiStart = content.indexOf("Hindi Lyrics");
  const hinglishStart = content.indexOf("Hinglish Lyrics");

  let hindiBlock = "";
  let hinglishBlock = "";

  if (hindiStart !== -1 && hinglishStart !== -1) {
    hindiBlock = content.slice(hindiStart, hinglishStart);
    hinglishBlock = content.slice(hinglishStart);
  } else if (hindiStart !== -1) {
    hindiBlock = content.slice(hindiStart);
  } else if (hinglishStart !== -1) {
    hinglishBlock = content.slice(hinglishStart);
  }

  const stripHeader = (b) => b.replace(/^(Hindi|Hinglish) Lyrics\s*\n-+/m, "").trim();
  hindiBlock = stripHeader(hindiBlock);
  hinglishBlock = stripHeader(hinglishBlock);

  const lyrics_hindi = hindiBlock ? blobToSections(hindiBlock) : null;
  const lyrics_hinglish = hinglishBlock ? blobToSections(hinglishBlock) : null;

  return { title, artist: "Unknown Artist", lyrics_hindi, lyrics_hinglish };
}

/**
 * Batch 4 — hindichristiansongs.in
 * Line 0: title, blank, "Source: URL", "Song Code: UUID"
 * Has "Hinglish Lyrics" header, often no Hindi.
 */
function parseBatch4(content, filename) {
  const lines = content.split("\n");
  const title = lines[0]?.trim() ?? "";

  const hindiStart = content.indexOf("Hindi Lyrics");
  const hinglishStart = content.indexOf("Hinglish Lyrics");

  let hindiBlock = "";
  let hinglishBlock = "";

  if (hindiStart !== -1 && hinglishStart !== -1) {
    hindiBlock = content.slice(hindiStart, hinglishStart);
    hinglishBlock = content.slice(hinglishStart);
  } else if (hindiStart !== -1) {
    hindiBlock = content.slice(hindiStart);
  } else if (hinglishStart !== -1) {
    hinglishBlock = content.slice(hinglishStart);
  } else {
    // Body after "Song Code:" line
    const scIdx = lines.findIndex((l) => l.startsWith("Song Code:"));
    if (scIdx !== -1) hinglishBlock = lines.slice(scIdx + 2).join("\n");
  }

  const stripHeader = (b) => b
    .replace(/^(Hindi|Hinglish) Lyrics\s*\n?/m, "")
    .replace(/^Source:\s*.+$/m, "")
    .replace(/^Song Code:\s*.+$/m, "")
    .trim();

  hindiBlock = stripHeader(hindiBlock);
  hinglishBlock = stripHeader(hinglishBlock);

  const lyrics_hindi = hindiBlock ? blobToSections(hindiBlock) : null;
  const lyrics_hinglish = hinglishBlock ? blobToSections(hinglishBlock) : null;

  return { title, artist: "Unknown Artist", lyrics_hindi, lyrics_hinglish };
}

const PARSERS = { "1": parseBatch1, "2": parseBatch2, "3": parseBatch3, "4": parseBatch4 };

// ── Main ──────────────────────────────────────────────────────────────────────

const stats = { checked: 0, updated: 0, not_in_db: 0, parse_fail: 0, errors: 0 };

async function processBatch(batchNum) {
  const dir = join(LYRICS_DIR, `batch-${batchNum}`);
  const parser = PARSERS[String(batchNum)];
  if (!parser) { console.error(`No parser for batch ${batchNum}`); return; }

  let files;
  try { files = readdirSync(dir).filter((f) => f.endsWith(".txt")); }
  catch (e) { console.error(`Cannot read ${dir}: ${e.message}`); return; }

  console.log(`\n── Batch ${batchNum} (${files.length} files) ──────────────────────`);

  const dbIds = await loadAllDbIds();
  let count = 0;

  for (const filename of files) {
    if (LIMIT && count >= LIMIT) break;
    stats.checked++;
    count++;

    const content = readFileSync(join(dir, filename), "utf8");

    let parsed;
    try {
      parsed = parser(content, filename);
    } catch (e) {
      stats.parse_fail++;
      console.error(`[PARSE ERROR] ${filename}: ${e.message}`);
      continue;
    }

    if (!parsed || (!parsed.lyrics_hinglish && !parsed.lyrics_hindi)) {
      stats.parse_fail++;
      continue;
    }

    // Find DB record
    let existing = null;
    const filenameSlug = fileToSlug(filename);

    if (batchNum === 1) {
      // batch-1: clean filenames → direct slug match
      existing = dbIds.find((r) => r.id === filenameSlug) ?? null;
      if (!existing) {
        const base = filenameSlug.replace(/-\d+$/, "");
        existing = base !== filenameSlug ? dbIds.find((r) => r.id === base) ?? null : null;
      }
    } else {
      // batch 2-4: try filename slug first (works when filename is already a slug),
      // then fall back to title-based matching
      if (filenameSlug) {
        existing = dbIds.find((r) => r.id === filenameSlug) ??
                   dbIds.find((r) => r.id.startsWith(filenameSlug) || filenameSlug.startsWith(r.id)) ??
                   null;
      }
      if (!existing && parsed.title) {
        existing = findDbId(parsed.title, dbIds);
      }
    }

    if (!existing) {
      stats.not_in_db++;
      if (batchNum === 1) console.log(`[NOT IN DB] ${fileToSlug(filename)}`);
      continue;
    }

    // Build patch
    const patch = {};
    if (parsed.lyrics_hinglish) patch.lyrics_hinglish = parsed.lyrics_hinglish;
    if (parsed.lyrics_hindi) patch.lyrics_hindi = parsed.lyrics_hindi;
    if (existing.artist === "Unknown Artist" && parsed.artist && parsed.artist !== "Unknown Artist") {
      patch.artist = parsed.artist;
    }

    if (Object.keys(patch).length === 0) continue;

    const sectionCount = Object.keys(parsed.lyrics_hinglish ?? parsed.lyrics_hindi ?? {}).filter((k) => k !== "__order").length;
    const status = sectionCount > 1 ? "SPLIT" : "BLOB";
    if (batchNum <= 2) {
      console.log(`[${status}] ${existing.id} — ${sectionCount} section(s)`);
    }

    if (!DRY_RUN) {
      try {
        await patchSong(existing.id, patch);
        stats.updated++;
      } catch (e) {
        stats.errors++;
        console.error(`  ERROR patching ${existing.id}: ${e.message}`);
      }
    } else {
      stats.updated++;
    }
  }
}

async function run() {
  const batches = BATCH_FILTER ? [parseInt(BATCH_FILTER)] : [1, 2, 3, 4];

  for (const b of batches) {
    await processBatch(b);
  }

  console.log("\n── Summary ──────────────────────────────────────────────");
  console.log(`Files checked  : ${stats.checked}`);
  console.log(`Updated in DB  : ${stats.updated}`);
  console.log(`Not in DB      : ${stats.not_in_db}`);
  console.log(`Parse failures : ${stats.parse_fail}`);
  console.log(`Errors         : ${stats.errors}`);
  if (DRY_RUN) console.log("\n(DRY RUN — nothing was written)");
}

run().catch(console.error);
