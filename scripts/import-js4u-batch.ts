import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

type Language = "hinglish" | "hindi";
type LyricsSections = Record<string, string>;

interface Candidate {
  id: string;
  file: string;
  sourceTitle: string;
  title: string;
  artist: string;
  sourceUrl: string | null;
  lyrics: Record<Language, LyricsSections>;
  confidence: number;
  warnings: string[];
  score: number;
}

interface ExistingSong {
  id: string;
  title: string;
  artist: string;
  church: string | null;
  album: string | null;
  language_default: Language;
  languages_available: Language[];
  lyrics_hinglish: LyricsSections | null;
  lyrics_hindi: LyricsSections | null;
  link_youtube: string | null;
  link_spotify: string | null;
  link_apple_music: string | null;
  tags: string[] | null;
  seo_description: string | null;
  added_by: string | null;
}

interface ImportReport {
  sourceDir: string;
  totalFiles: number;
  parsedFiles: number;
  duplicateGroups: number;
  selectedCandidates: number;
  inserted: string[];
  updated: string[];
  skipped: Array<{ title: string; file?: string; reason: string }>;
  review: Array<{ title: string; file: string; confidence: number; warnings: string[] }>;
  unknownArtists: string[];
}

const root = path.resolve(__dirname, "..");
const songsDir = path.join(root, "src", "data", "songs");
const reportDir = path.join(root, ".song-import");
const sourceDir = path.resolve(process.argv[2] ?? "");
const shouldPublish = process.argv.includes("--publish");
const minConfidence = Number(process.argv.find((arg) => arg.startsWith("--min-confidence="))?.split("=")[1] ?? 72);

dotenv.config({ path: path.join(root, ".env.local") });

const knownArtists = [
  "Amit Kamble",
  "Anil Kant",
  "Anish Masih",
  "Ashley Joseph",
  "Bridge Music",
  "Darpan Dua",
  "Emmanuel Gollar",
  "Filadelfia Music",
  "Glory To God India",
  "Jaago Music",
  "Jessy Robin",
  "Joseph Raj Allam",
  "Joshua Generation India",
  "Justin John",
  "Maria Kolady",
  "Merlyn Salvadi",
  "Nations of Worship",
  "Persis John",
  "Prakruthi Angelina",
  "Prince Robinson",
  "Rahul Noel Massey",
  "Ranjit J Abraham",
  "Reena Kant",
  "Robinson Shalu",
  "Roney Maben",
  "Rubina BK",
  "Samarth Shukla",
  "Sekel Jeet",
  "Shalom Ministries",
  "Sheldon Bangera",
  "Sheenu Mariyam",
  "Shelley Reddy",
  "Thanga Selvam",
  "Vipin Massey",
  "Yeshua Ministries",
].sort((a, b) => b.length - a.length);

function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeLooseTitle(value: string): string {
  return normalizeForCompare(value)
    .replace(/\bye?eshu\b/g, "yeshu")
    .replace(/\byishu\b/g, "yeshu")
    .replace(/\byeasu\b/g, "yeshu")
    .replace(/\bmasiha\b/g, "masih")
    .replace(/\bmasihaa\b/g, "masih")
    .replace(/\bmuzako\b/g, "mujhko")
    .replace(/\bmuze\b/g, "mujhe")
    .replace(/\btuzako\b/g, "tujhko")
    .replace(/\btuze\b/g, "tujhe")
    .replace(/\bjinda\b/g, "zinda")
    .replace(/\bhe\b/g, "hai")
    .replace(/\bhu\b/g, "hoon")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string): string {
  return normalizeLooseTitle(value).replace(/\s+/g, "-");
}

function normalizeText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[ \t]+$/gm, "")
    .trim();
}

function stripDevanagari(value: string): string {
  return value.replace(/[\u0900-\u097F]+/g, " ");
}

function stripGujarati(value: string): string {
  return value.replace(/[\u0A80-\u0AFF]+/g, " ");
}

function titleCase(value: string): string {
  const sacred = new Set(["yeshu", "yeshua", "masih", "prabhu", "yahweh", "hallelujah", "halleluyaah"]);
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (word === "i") return "I";
      if (sacred.has(word)) return word.charAt(0).toUpperCase() + word.slice(1);
      if (word.length <= 2) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ")
    .replace(/\bFt\b/g, "ft")
    .replace(/\bft\./gi, "ft.")
    .replace(/\be\./g, "E.")
    .replace(/\bAnd\b/g, "and");
}

function extractArtist(sourceTitle: string): string {
  const title = normalizeText(sourceTitle);
  const byMatch = title.match(/\bby\s+([^|,[\]()/-]+)/i);
  if (byMatch?.[1]) return titleCase(byMatch[1].trim());

  const ftMatch = title.match(/\b(?:ft\.?|feat\.?|featuring)\s+([^|[\]()]+)/i);
  if (ftMatch?.[1]) return titleCase(ftMatch[1].trim());

  for (const artist of knownArtists) {
    const re = new RegExp(`\\b${artist.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(title)) return artist;
  }

  const bracketArtist = title.match(/\[\s*([^[\]]{4,80})\s*\]\s*$/);
  if (bracketArtist?.[1] && !/lyrics|song|worship|christian/i.test(bracketArtist[1])) {
    return titleCase(bracketArtist[1]);
  }

  const parenArtist = title.match(/\(\s*([A-Za-z][^)]+?)\s*\)\s*(?:Hindi|Christian|Song|Lyrics|$)/i);
  if (parenArtist?.[1] && !/lyrics|song|worship|christian|new|hindi/i.test(parenArtist[1])) {
    return titleCase(parenArtist[1]);
  }

  return "Unknown Artist";
}

function cleanTitle(sourceTitle: string): string {
  let title = normalizeText(sourceTitle)
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\([^)]*[\u0900-\u097F][^)]*\)/g, " ")
    .replace(/\([^)]*[\u0A80-\u0AFF][^)]*\)/g, " ")
    .replace(/\[[^\]]*[\u0900-\u097F][^\]]*\]/g, " ")
    .replace(/\[[^\]]*[\u0A80-\u0AFF][^\]]*\]/g, " ");

  title = stripGujarati(stripDevanagari(title));

  const separators = title
    .split(/\s*(?:\/\/|\||,)\s*/g)
    .map((part) => part.trim())
    .filter(Boolean);
  if (separators.length > 1) {
    const latinSegments = separators.filter((part) => /[A-Za-z]{3}/.test(part));
    title = (latinSegments[0] ?? separators[0]).trim();
  }

  title = title
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\([^)]*\b(?:ft\.?|feat\.?|by|lyrics|song|hindi|christian|worship|official|video)\b[^)]*\)/gi, " ")
    .replace(/\(\s*[A-Za-z][^)]+\s*\)\s*$/g, " ")
    .replace(/\b(?:new|latest|official|video|with lyrics|lyrical|lyric video)\b/gi, " ")
    .replace(/\b(?:hindi|christian|jesus|worship|song|songs|lyrics|lyric|chrsitian|chritian)\b/gi, " ")
    .replace(/\b(?:20[0-9]{2}|19[0-9]{2})\b/g, " ")
    .replace(/\b(?:ft\.?|feat\.?|featuring|by)\b.*$/i, " ")
    .replace(/\b'?s\b$/i, " ")
    .replace(/\s+-\s+.*$/g, " ")
    .replace(/[^A-Za-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const artist of knownArtists) {
    const re = new RegExp(`\\b${artist.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b\\s*$`, "i");
    title = title.replace(re, "").trim();
  }

  if (/^new\s+/i.test(title)) title = title.replace(/^new\s+/i, "");
  return titleCase(title);
}

function parseSectionHeading(line: string): string | null {
  const normalized = line
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();

  if (/^verse\s*\d*$/.test(normalized)) {
    const number = normalized.match(/\d+/)?.[0];
    return number ? `verse${number}` : "verse";
  }
  if (/^repeat\s+pre[-\s]?chorus$/.test(normalized)) return "repeat_pre_chorus";
  if (/^repeat\s+chorus$/.test(normalized)) return "repeat_chorus";
  if (/^chorus\s*\d*$/.test(normalized)) return "chorus";
  if (/^pre[-\s]?chorus$/.test(normalized)) return "pre_chorus";
  if (/^bridge\s*\d*$/.test(normalized)) return "bridge";
  if (/^intro\s*\d*$/.test(normalized)) return "intro";
  if (/^outro\s*\d*$/.test(normalized)) return "outro";
  return null;
}

function stripInlineChords(line: string): string {
  return line
    .replace(/\[[A-G][#b]?(?:m|maj|min|sus|dim|aug|add)?\d*(?:\/[A-G][#b]?)?\]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trimEnd();
}

function isBoilerplateLine(line: string, title: string): boolean {
  const normalized = normalizeForCompare(line);
  const normalizedTitle = normalizeForCompare(title);
  if (!normalized) return true;
  if (/^[-_]+$/.test(line.trim())) return true;
  if (/https?:\/\/|www\.|jesussongs4u|subscribe|youtube|facebook|instagram/i.test(line)) return true;
  if (/^(hindi|hinglish)\s+lyrics$/i.test(line.trim())) return true;
  if (normalizedTitle && normalized.includes(normalizedTitle) && /lyrics|song|christian|worship|official/i.test(line)) return true;
  if (/^(lyrics|song|hindi christian song|christian song)$/i.test(line.trim())) return true;
  return false;
}

function parseLyricsBlock(block: string, title: string): LyricsSections {
  const sections: LyricsSections = {};
  const lines = normalizeText(block)
    .split("\n")
    .map((line) => stripInlineChords(line.trim()))
    .filter((line) => !isBoilerplateLine(line, title));
  let currentKey = "verse1";
  let verseCount = 1;
  let buffer: string[] = [];

  const makeUniqueKey = (baseKey: string): string => {
    if (!sections[baseKey]) return baseKey;
    let index = 2;
    while (sections[`${baseKey}${index}`]) index += 1;
    return `${baseKey}${index}`;
  };

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) sections[currentKey] = text;
    buffer = [];
  };

  for (const line of lines) {
    const heading = parseSectionHeading(line);
    if (heading) {
      flush();
      if (heading === "repeat_chorus" && sections.chorus) {
        const key = makeUniqueKey("repeat_chorus");
        sections[key] = sections.chorus;
        currentKey = key;
        continue;
      }
      currentKey = makeUniqueKey(heading === "verse" ? `verse${verseCount++}` : heading);
      continue;
    }
    buffer.push(line);
  }

  flush();
  return sections;
}

function extractBlock(text: string, startLabel: string, endLabel?: string): string {
  const start = text.search(new RegExp(`^${startLabel}\\s*$`, "im"));
  if (start < 0) return "";
  const contentStart = text.indexOf("\n", start);
  const end = endLabel ? text.search(new RegExp(`^${endLabel}\\s*$`, "im")) : -1;
  return text.slice(contentStart + 1, end > contentStart ? end : undefined).trim();
}

function textLength(sections: LyricsSections | null | undefined): number {
  return Object.values(sections ?? {}).join("\n").replace(/\s+/g, "").length;
}

function hasDevanagari(sections: LyricsSections): boolean {
  return /[\u0900-\u097F]/.test(Object.values(sections).join("\n"));
}

function hasGujaratiText(text: string): boolean {
  return /[\u0A80-\u0AFF]/.test(text);
}

function parseFile(filePath: string): Candidate | null {
  const file = path.basename(filePath);
  const text = normalizeText(fs.readFileSync(filePath, "utf8"));
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const sourceTitle = lines[0] ?? "";
  const sourceUrl = lines.find((line) => /^https?:\/\//.test(line)) ?? null;
  const title = cleanTitle(sourceTitle);
  const artist = extractArtist(sourceTitle);
  const warnings: string[] = [];

  if (!sourceTitle || !title) return null;
  if (/bible verses|depression|hopelessness|article|prayer points/i.test(sourceTitle)) warnings.push("non-song-looking title");
  if (hasGujaratiText(file + "\n" + sourceTitle)) warnings.push("unsupported script in title/file");
  if (/\b(?:gamit|gavit|mavchi|vasava)\b/i.test(file + "\n" + sourceTitle)) warnings.push("regional-language source needs manual review");
  if (title.length < 4) warnings.push("title too short after cleanup");
  if (/\s[A-Za-z]$/.test(title)) warnings.push("title has one-letter tail");
  if (knownArtists.some((artist) => normalizeForCompare(title) === normalizeForCompare(artist.split(/\s+/).at(-1) ?? ""))) {
    warnings.push("title looks like artist surname only");
  }
  if (title.split(/\s+/).length > 7) warnings.push("title still noisy after cleanup");
  if (/lyrics|song|christian|worship|official|video/i.test(title)) warnings.push("title still has boilerplate");

  const hindiBlock = extractBlock(text, "Hindi Lyrics", "Hinglish Lyrics");
  const hinglishBlock = extractBlock(text, "Hinglish Lyrics");
  const hindiSections = parseLyricsBlock(hindiBlock, title);
  const hinglishSections = parseLyricsBlock(hinglishBlock, title);

  if (textLength(hindiSections) > 0 && !hasDevanagari(hindiSections)) {
    if (textLength(hinglishSections) === 0) {
      Object.assign(hinglishSections, hindiSections);
    }
    for (const key of Object.keys(hindiSections)) delete hindiSections[key];
    warnings.push("Hindi block was romanized; stored as Hinglish");
  }

  const hindiLength = textLength(hindiSections);
  const hinglishLength = textLength(hinglishSections);
  const totalLength = hindiLength + hinglishLength;
  if (totalLength < 180) warnings.push("lyrics too short");
  if (hindiLength > 0 && hindiLength < 90) warnings.push("Hindi lyrics very short");
  if (hinglishLength > 0 && hinglishLength < 90) warnings.push("Hinglish lyrics very short");
  if (hindiLength === 0 && hinglishLength === 0) warnings.push("missing usable lyrics");
  if (artist === "Unknown Artist") warnings.push("artist unknown");

  let confidence = 100;
  for (const warning of warnings) {
    if (warning === "artist unknown") confidence -= 5;
    else if (warning.includes("short")) confidence -= 20;
    else if (warning.includes("unsupported script")) confidence -= 15;
    else if (warning.includes("romanized")) confidence -= 3;
    else confidence -= 25;
  }
  confidence = Math.max(0, Math.min(100, confidence));

  return {
    id: slugify(title),
    file,
    sourceTitle,
    title,
    artist,
    sourceUrl,
    lyrics: {
      hinglish: hinglishSections,
      hindi: hindiSections,
    },
    confidence,
    warnings,
    score: confidence + Math.min(totalLength / 60, 30) + (hindiLength > 0 && hinglishLength > 0 ? 20 : 0),
  };
}

function selectBestCandidates(candidates: Candidate[]) {
  const byTitle = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    const key = normalizeLooseTitle(candidate.title);
    const group = byTitle.get(key) ?? [];
    group.push(candidate);
    byTitle.set(key, group);
  }

  const selected: Candidate[] = [];
  const duplicateGroups = [...byTitle.values()].filter((group) => group.length > 1).length;
  for (const group of byTitle.values()) {
    selected.push(group.sort((a, b) => b.score - a.score)[0]);
  }

  return { selected: selected.sort((a, b) => a.title.localeCompare(b.title)), duplicateGroups };
}

function shouldUpdate(existing: ExistingSong, incoming: Candidate): boolean {
  if (incoming.confidence < minConfidence) return false;
  if (existing.artist === "Unknown Artist" && incoming.artist !== "Unknown Artist") return true;
  if (!existing.lyrics_hindi && textLength(incoming.lyrics.hindi) > 0) return true;
  if (!existing.lyrics_hinglish && textLength(incoming.lyrics.hinglish) > 0) return true;
  if (textLength(incoming.lyrics.hindi) > textLength(existing.lyrics_hindi) + 120) return true;
  if (textLength(incoming.lyrics.hinglish) > textLength(existing.lyrics_hinglish) + 120) return true;
  return false;
}

function toSupabaseRow(song: Candidate, existing?: ExistingSong) {
  const hasHinglish = textLength(song.lyrics.hinglish) > 0;
  const hasHindi = textLength(song.lyrics.hindi) > 0;
  const languages = [
    ...(hasHinglish ? ["hinglish"] as const : []),
    ...(hasHindi ? ["hindi"] as const : []),
  ];
  const artist = song.artist !== "Unknown Artist" ? song.artist : existing?.artist ?? song.artist;
  const tags = Array.from(new Set([...(existing?.tags ?? []), "worship", ...languages, "jesussongs4u"]));

  return {
    id: existing?.id ?? song.id,
    title: existing?.title ?? song.title,
    artist,
    church: existing?.church ?? null,
    album: existing?.album ?? null,
    language_default: languages.includes("hinglish") ? "hinglish" : "hindi",
    languages_available: languages,
    lyrics_hinglish: hasHinglish ? song.lyrics.hinglish : existing?.lyrics_hinglish ?? null,
    lyrics_hindi: hasHindi ? song.lyrics.hindi : existing?.lyrics_hindi ?? null,
    link_youtube: existing?.link_youtube ?? null,
    link_spotify: existing?.link_spotify ?? null,
    link_apple_music: existing?.link_apple_music ?? null,
    tags,
    seo_description: `${existing?.title ?? song.title} lyrics in ${languages.join(" and ")} by ${artist}`,
    added_by: existing?.added_by ?? "Gaurav | Vandana",
  };
}

function updateLocalIfExists(song: Candidate, existing?: ExistingSong) {
  const localPath = path.join(songsDir, `${existing?.id ?? song.id}.json`);
  if (!fs.existsSync(localPath)) return;

  const local = JSON.parse(fs.readFileSync(localPath, "utf8"));
  local.artist = song.artist !== "Unknown Artist" ? song.artist : local.artist;
  local.lyrics = {
    ...local.lyrics,
    hinglish: textLength(song.lyrics.hinglish) > 0 ? song.lyrics.hinglish : local.lyrics?.hinglish,
    hindi: textLength(song.lyrics.hindi) > 0 ? song.lyrics.hindi : local.lyrics?.hindi,
  };
  local.languages_available = [
    ...(local.lyrics?.hinglish ? ["hinglish"] as const : []),
    ...(local.lyrics?.hindi ? ["hindi"] as const : []),
  ];
  local.source_url = local.source_url ?? song.sourceUrl;
  fs.writeFileSync(localPath, `${JSON.stringify(local, null, 2)}\n`, "utf8");
}

async function main() {
  if (!sourceDir || !fs.existsSync(sourceDir)) {
    throw new Error(`Batch folder not found: ${sourceDir || "(missing)"}`);
  }

  const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".txt")).sort();
  const parsed = files
    .map((file) => parseFile(path.join(sourceDir, file)))
    .filter((candidate): candidate is Candidate => Boolean(candidate));
  const { selected, duplicateGroups } = selectBestCandidates(parsed);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.from("songs").select("*");
  if (error || !data) throw new Error(error?.message ?? "Could not read existing songs.");

  const existingRows = data as ExistingSong[];
  const byId = new Map(existingRows.map((song) => [song.id, song]));
  const byTitle = new Map(existingRows.map((song) => [normalizeForCompare(song.title), song]));
  const byLooseTitle = new Map(existingRows.map((song) => [normalizeLooseTitle(song.title), song]));
  const report: ImportReport = {
    sourceDir,
    totalFiles: files.length,
    parsedFiles: parsed.length,
    duplicateGroups,
    selectedCandidates: selected.length,
    inserted: [],
    updated: [],
    skipped: [],
    review: [],
    unknownArtists: [],
  };

  for (const song of selected) {
    const existing = byId.get(song.id) ?? byTitle.get(normalizeForCompare(song.title)) ?? byLooseTitle.get(normalizeLooseTitle(song.title));
    if (song.artist === "Unknown Artist") report.unknownArtists.push(song.title);

    if (song.confidence < minConfidence || song.warnings.includes("missing usable lyrics")) {
      report.review.push({ title: song.title, file: song.file, confidence: song.confidence, warnings: song.warnings });
      continue;
    }

    if (existing && !shouldUpdate(existing, song)) {
      report.skipped.push({ title: existing.title, file: song.file, reason: "existing version is already complete enough" });
      continue;
    }

    if (shouldPublish) {
      const row = toSupabaseRow(song, existing);
      const { error: upsertError } = await supabase.from("songs").upsert(row, { onConflict: "id" });
      if (upsertError) throw new Error(`${song.title}: ${upsertError.message}`);
      updateLocalIfExists(song, existing);
    }

    if (existing) report.updated.push(existing.title);
    else report.inserted.push(song.title);
  }

  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `js4u-${path.basename(sourceDir)}-report.json`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`${shouldPublish ? "Published" : "Dry run"} ${files.length} files from ${sourceDir}`);
  console.log(`Parsed files: ${report.parsedFiles}`);
  console.log(`Duplicate title groups: ${report.duplicateGroups}`);
  console.log(`Selected candidates: ${report.selectedCandidates}`);
  console.log(`Inserted: ${report.inserted.length}`);
  console.log(`Updated: ${report.updated.length}`);
  console.log(`Skipped: ${report.skipped.length}`);
  console.log(`Needs review: ${report.review.length}`);
  console.log(`Unknown artists: ${report.unknownArtists.length}`);
  console.log(`Report: ${path.relative(root, reportPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
