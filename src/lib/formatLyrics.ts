import type { Song } from "./getSongs";

/* ── Sacred words that must always be capitalized ── */

const SACRED_WORDS = [
  "Pavitra Aatma", // multi-word — must be checked before single words
  "Yeshu",
  "Masih",
  "Prabhu",
  "Hallelujah",
  "Halleluya",
  "Amen",
  "Rooh",
  "Aatma",
];

/** Regex that detects Devanagari characters (Hindi script). */
const DEVANAGARI_RE = /[\u0900-\u097F]/;

/**
 * Build a single case-insensitive regex that matches all sacred words
 * at word-ish boundaries. Multi-word entries (e.g. "Pavitra Aatma")
 * are included — order matters (longest first already in the array).
 */
const sacredRe = new RegExp(
  `(?<=^|\\s|[.,;:!?'"\`()])(?:${SACRED_WORDS.map(escapeRegExp).join("|")})(?=$|\\s|[.,;:!?'"\`()])`,
  "gi",
);

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ── Public API ── */

/**
 * Format a single lyrics line:
 * 1. Trim whitespace
 * 2. Skip Hindi/Devanagari lines entirely
 * 3. Capitalize first letter
 * 4. Capitalize sacred words wherever they appear
 */
export function formatLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return trimmed;

  // Leave Devanagari lines untouched
  if (DEVANAGARI_RE.test(trimmed)) return trimmed;

  // Capitalize first letter of the line
  let result = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

  // Capitalize sacred words
  result = result.replace(sacredRe, (match) => {
    // Capitalize first letter of each word in the match
    return match
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  });

  return result;
}

/**
 * Format an entire lyrics block (multi-line string).
 * Splits on newlines, formats each line, and re-joins.
 */
export function formatBlock(block: string): string {
  return block
    .split("\n")
    .map((line) => formatLine(line))
    .join("\n");
}

/**
 * Dev-only audit: logs lines that look problematic.
 * - All lowercase (missing capitalisation)
 * - ALL CAPS (unintentional shouting)
 * - Contains double spaces
 *
 * Only runs when NODE_ENV === "development".
 */
export function formatLyricsAudit(song: Song): void {
  if (process.env.NODE_ENV !== "development") return;

  const issues: string[] = [];

  for (const [langKey, sections] of Object.entries(song.lyrics)) {
    for (const [section, text] of Object.entries(
      sections as Record<string, string>,
    )) {
      const lines = (text as string).split("\n");
      lines.forEach((raw, i) => {
        const line = raw.trim();
        if (!line) return;
        // Skip Devanagari
        if (DEVANAGARI_RE.test(line)) return;

        const lineRef = `[${langKey}/${section}:${i + 1}]`;

        if (line === line.toLowerCase() && /[a-z]/.test(line)) {
          issues.push(`${lineRef} ALL LOWER: "${line}"`);
        }
        if (line === line.toUpperCase() && line.length > 1 && /[A-Z]/.test(line)) {
          issues.push(`${lineRef} ALL CAPS:  "${line}"`);
        }
        if (/  +/.test(line)) {
          issues.push(`${lineRef} DOUBLE SP: "${line}"`);
        }
      });
    }
  }

  if (issues.length) {
    console.log(
      `%c[Vandana Audit] ${song.title} — ${issues.length} issue(s)`,
      "color: #C4AA7E; font-weight: bold",
    );
    issues.forEach((msg) => console.log(`  ${msg}`));
  }
}
