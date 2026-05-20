import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

type Language = "hinglish" | "hindi";
type LyricsSections = Record<string, string>;

interface ParsedSong {
  id: string;
  file: string;
  title: string;
  artist: string;
  church: string | null;
  sourceUrl: string | null;
  lyrics: Record<Language, LyricsSections>;
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
  duplicateGroups: number;
  selectedCandidates: number;
  inserted: string[];
  updated: string[];
  skipped: Array<{ id: string; title: string; reason: string }>;
  unknownArtists: string[];
}

const root = path.resolve(__dirname, "..");
const songsDir = path.join(root, "src", "data", "songs");
const reportDir = path.join(root, ".song-import");
const sourceDir = path.resolve(process.argv[2] ?? "");
const shouldPublish = process.argv.includes("--publish");

dotenv.config({ path: path.join(root, ".env.local") });

const artistOverrides: Record<string, string> = {
  "kharida-tune-apne-lahoo-se": "Akash Ray",
  "khushi-khushi-manao": "Darpan Dua",
  "khushikhushi-manao": "Darpan Dua",
  "krus-hi-tera-nishan": "Dayanidhi Rao",
  "prabhu-ka-anand-hai-meri-takat": "Victor Benjamin",
  "tune-mujhe-aage-piche-gher-rakha-hai": "Dayanidhi Rao",
};

const knownArtistHints = [
  "Amit Kamble",
  "Anil Kant",
  "Bridge Music",
  "Celestial Reverie",
  "Darpan Dua",
  "Glory To God India",
  "Hallelujah the Band",
  "Jaago Music",
  "Joseph Raj Allam",
  "Nations of Worship",
  "Sheldon Bangera",
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

function slugify(value: string): string {
  return normalizeForCompare(value).replace(/\s+/g, "-");
}

function titleCase(value: string): string {
  const sacred = new Set(["yeshu", "yeshua", "masih", "prabhu", "yahweh", "hallelujah"]);
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^x\d+$/i.test(word)) return word.toLowerCase();
      return word
        .split("-")
        .map((part) => {
          const lowered = part.toLowerCase();
          if (sacred.has(lowered)) return lowered.charAt(0).toUpperCase() + lowered.slice(1);
          return lowered.replace(/(^|[([{'"\/\-\u2013\u2014\u2026])([a-z])/g, (_match, prefix: string, letter: string) => prefix + letter.toUpperCase());
        })
        .join("-");
    })
    .join(" ")
    .replace(/\bFt\b/g, "ft")
    .replace(/\bft\./gi, "ft.");
}

function firstLyricLine(block: string): string {
  return block
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !/^[-_]+$/.test(line) && !/^(\d+\.?\s*)?$/.test(line))
    ?.replace(/^\s*\d+[\s.)-]+/, "") ?? "";
}

function cleanTitle(rawTitle: string, hinglishBlock: string): string {
  const sourceTitle = rawTitle.trim();
  const titleSource = /[A-Za-z]{3}/.test(sourceTitle) ? sourceTitle : firstLyricLine(hinglishBlock) || sourceTitle;
  const firstPart = titleSource.split("|")[0] ?? titleSource;
  const cleaned = firstPart
    .replace(/^\s*\d+[\s.)-]+/, "")
    .replace(/\([^)]*\b(?:lyrics|song|hindi|christian|official|video)\b[^)]*\)/gi, " ")
    .replace(/\b(?:lyrics|lyric|hindi|christian|song|official|video|chords?|ppt)\b/gi, " ")
    .replace(/\s+-\s+.*$/g, " ")
    .replace(/[^A-Za-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return /[A-Za-z]{3}/.test(cleaned) ? titleCase(cleaned) : sourceTitle;
}

function hasSafeImportTitle(song: ParsedSong): boolean {
  if (!song.id) return false;
  if (song.title.length > 80) return false;
  if (/^\d+\s/.test(song.title)) return false;
  if (/[\u0900-\u097F]/.test(song.title)) return false;
  if (/lyrics|songcode|source:|https?:/i.test(song.title)) return false;
  return true;
}

function extractArtist(rawTitle: string, id: string): string {
  if (artistOverrides[id]) return artistOverrides[id];

  const parts = rawTitle.split("|").map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1 && /[A-Za-z]{3}/.test(parts[1])) {
    const ft = parts.find((part) => /\b(?:ft\.?|feat\.?|featuring)\b/i.test(part));
    return titleCase([parts[1], ft && ft !== parts[1] ? ft : ""].filter(Boolean).join(" "));
  }

  const ftMatch = rawTitle.match(/\b(?:ft\.?|feat\.?|featuring)\s+([^|[\]()]+)/i);
  if (ftMatch?.[1]) return titleCase(ftMatch[1].trim());

  const haystack = `${rawTitle} ${id.replace(/[-_]+/g, " ")}`;
  for (const artist of knownArtistHints) {
    const re = new RegExp(`\\b${artist.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(haystack)) return artist;
  }

  return "Unknown Artist";
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
  if (/^hook\s*\d*$/.test(normalized)) return "hook";
  if (/^tag\s*\d*$/.test(normalized)) return "tag";
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

function parseLyricsBlock(block: string): LyricsSections {
  const sections: LyricsSections = {};
  const lines = block.replace(/\r\n/g, "\n").split("\n");
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

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || /^-+$/.test(line)) continue;

    const heading = parseSectionHeading(line);
    if (heading) {
      flush();
      if (heading === "repeat_chorus" && sections.chorus) {
        const repeatKey = makeUniqueKey("repeat_chorus");
        sections[repeatKey] = sections.chorus;
        currentKey = repeatKey;
        continue;
      }
      const key = heading === "verse" ? `verse${verseCount++}` : heading;
      currentKey = makeUniqueKey(key);
      continue;
    }

    buffer.push(stripInlineChords(rawLine));
  }

  flush();
  return sections;
}

function extractBlock(text: string, startLabel: string, endLabel?: string): string {
  const start = text.indexOf(startLabel);
  if (start < 0) return "";
  const contentStart = text.indexOf("\n", start);
  const end = endLabel ? text.indexOf(endLabel, contentStart) : -1;
  return text.slice(contentStart + 1, end > -1 ? end : undefined).trim();
}

function parseTextFile(filePath: string): ParsedSong {
  const file = path.basename(filePath);
  const fallbackId = path.basename(filePath, ".txt");
  const text = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const lines = text.split("\n").map((line) => line.trim());
  const rawTitle = lines.find(Boolean) ?? fallbackId;
  const urls = lines
    .map((line) => line.replace(/^Source:\s*/i, "").trim())
    .filter((line) => /^https?:\/\//.test(line));
  const hindiBlock = extractBlock(text, "Hindi Lyrics", "Hinglish Lyrics");
  const hinglishBlock = extractBlock(text, "Hinglish Lyrics");
  const title = cleanTitle(rawTitle, hinglishBlock);
  const id = slugify(title) || slugify(fallbackId);
  const artist = artistOverrides[id] ?? extractArtist(rawTitle, id);
  const lyrics = {
    hinglish: parseLyricsBlock(hinglishBlock),
    hindi: parseLyricsBlock(hindiBlock),
  };

  return {
    id,
    file,
    title,
    artist,
    church: null,
    sourceUrl: urls[0] ?? null,
    lyrics,
    score: textLength(lyrics.hinglish) + textLength(lyrics.hindi) + (artist !== "Unknown Artist" ? 100 : 0),
  };
}

function textLength(sections: LyricsSections | null | undefined): number {
  return Object.values(sections ?? {}).join("\n").replace(/\s+/g, "").length;
}

function hasInlineChords(sections: LyricsSections | null | undefined): boolean {
  return /\[[A-G][#b]?(?:m|maj|min|sus|dim|aug|add)?\d*(?:\/[A-G][#b]?)?\]/.test(
    Object.values(sections ?? {}).join("\n")
  );
}

function hasUsableLyrics(song: ParsedSong): boolean {
  return textLength(song.lyrics.hinglish) > 0 || textLength(song.lyrics.hindi) > 0;
}

function selectBestCandidates(songs: ParsedSong[]) {
  const byTitle = new Map<string, ParsedSong[]>();
  for (const song of songs) {
    const key = normalizeForCompare(song.title);
    const group = byTitle.get(key) ?? [];
    group.push(song);
    byTitle.set(key, group);
  }

  const selected: ParsedSong[] = [];
  const duplicateGroups = [...byTitle.values()].filter((group) => group.length > 1).length;
  for (const group of byTitle.values()) {
    selected.push(group.sort((a, b) => b.score - a.score)[0]);
  }

  return { selected: selected.sort((a, b) => a.title.localeCompare(b.title)), duplicateGroups };
}

function shouldUpdate(existing: ExistingSong, incoming: ParsedSong): boolean {
  if (existing.artist === "Unknown Artist" && incoming.artist !== "Unknown Artist") return true;
  if (!existing.lyrics_hindi && textLength(incoming.lyrics.hindi) > 0) return true;
  if (!existing.lyrics_hinglish && textLength(incoming.lyrics.hinglish) > 0) return true;
  if (hasInlineChords(existing.lyrics_hindi) || hasInlineChords(existing.lyrics_hinglish)) return true;
  return false;
}

function toSupabaseRow(song: ParsedSong, existing?: ExistingSong) {
  const hasHinglish = textLength(song.lyrics.hinglish) > 0;
  const hasHindi = textLength(song.lyrics.hindi) > 0;
  const keepsExistingHinglish = !hasHinglish && textLength(existing?.lyrics_hinglish) > 0;
  const keepsExistingHindi = !hasHindi && textLength(existing?.lyrics_hindi) > 0;
  const useIncomingHinglish =
    hasHinglish && (!existing?.lyrics_hinglish || hasInlineChords(existing.lyrics_hinglish));
  const useIncomingHindi =
    hasHindi && (!existing?.lyrics_hindi || hasInlineChords(existing.lyrics_hindi));
  const languages = [
    ...(useIncomingHinglish || keepsExistingHinglish || textLength(existing?.lyrics_hinglish) > 0 ? ["hinglish"] as const : []),
    ...(useIncomingHindi || keepsExistingHindi || textLength(existing?.lyrics_hindi) > 0 ? ["hindi"] as const : []),
  ];
  const sourceTag = song.sourceUrl?.includes("hindichristiansongs.in") ? "hindichristiansongs" : "indianchristianlyrics";
  const tags = Array.from(new Set([...(existing?.tags ?? []), "worship", ...languages, sourceTag]));

  return {
    id: existing?.id ?? song.id,
    title: existing?.title ?? song.title,
    artist: song.artist !== "Unknown Artist" ? song.artist : existing?.artist ?? song.artist,
    church: existing?.church ?? song.church,
    album: existing?.album ?? null,
    language_default: languages.includes("hinglish") ? "hinglish" : "hindi",
    languages_available: languages,
    lyrics_hinglish: useIncomingHinglish ? song.lyrics.hinglish : existing?.lyrics_hinglish ?? (hasHinglish ? song.lyrics.hinglish : null),
    lyrics_hindi: useIncomingHindi ? song.lyrics.hindi : existing?.lyrics_hindi ?? (hasHindi ? song.lyrics.hindi : null),
    link_youtube: existing?.link_youtube ?? null,
    link_spotify: existing?.link_spotify ?? null,
    link_apple_music: existing?.link_apple_music ?? null,
    tags,
    seo_description: `${existing?.title ?? song.title} lyrics in ${languages.join(" and ")} by ${song.artist !== "Unknown Artist" ? song.artist : existing?.artist ?? song.artist}`,
    added_by: existing?.added_by ?? "Gaurav | Vandana",
  };
}

function updateLocalIfExists(song: ParsedSong, existing?: ExistingSong) {
  const localPath = path.join(songsDir, `${existing?.id ?? song.id}.json`);
  if (!fs.existsSync(localPath)) return;

  const local = JSON.parse(fs.readFileSync(localPath, "utf8"));
  if (!local.artist || local.artist === "Unknown Artist") {
    local.artist = song.artist !== "Unknown Artist" ? song.artist : local.artist;
  }
  const localHinglishLength = textLength(local.lyrics?.hinglish);
  const localHindiLength = textLength(local.lyrics?.hindi);
  local.lyrics = {
    ...local.lyrics,
    hinglish:
      localHinglishLength === 0 && textLength(song.lyrics.hinglish) > 0
        ? song.lyrics.hinglish
        : local.lyrics?.hinglish,
    hindi:
      localHindiLength === 0 && textLength(song.lyrics.hindi) > 0
        ? song.lyrics.hindi
        : local.lyrics?.hindi,
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
  const songs = files.map((file) => parseTextFile(path.join(sourceDir, file)));
  const { selected, duplicateGroups } = selectBestCandidates(songs);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.from("songs").select("*");
  if (error || !data) throw new Error(error?.message ?? "Could not read existing songs.");

  const existingRows = data as ExistingSong[];
  const byId = new Map(existingRows.map((song) => [song.id, song]));
  const byTitle = new Map(existingRows.map((song) => [normalizeForCompare(song.title), song]));
  const report: ImportReport = {
    sourceDir,
    totalFiles: files.length,
    duplicateGroups,
    selectedCandidates: selected.length,
    inserted: [],
    updated: [],
    skipped: [],
    unknownArtists: [],
  };

  for (const song of selected) {
    if (!hasSafeImportTitle(song)) {
      report.skipped.push({ id: song.id || song.file, title: song.title, reason: "title needs manual cleanup" });
      continue;
    }

    if (!hasUsableLyrics(song)) {
      report.skipped.push({ id: song.id, title: song.title, reason: "missing lyrics" });
      continue;
    }

    const existing = byId.get(song.id) ?? byTitle.get(normalizeForCompare(song.title));
    const row = toSupabaseRow(song, existing);

    if (row.artist === "Unknown Artist") report.unknownArtists.push(song.title);

    if (existing && !shouldUpdate(existing, song)) {
      report.skipped.push({ id: existing.id, title: existing.title, reason: "existing version is already complete enough" });
      continue;
    }

    if (shouldPublish) {
      const { error: upsertError } = await supabase.from("songs").upsert(row, { onConflict: "id" });
      if (upsertError) throw new Error(`${song.title}: ${upsertError.message}`);
      updateLocalIfExists(song, existing);
    }

    if (existing) report.updated.push(existing.title);
    else report.inserted.push(song.title);
  }

  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `icl-${path.basename(sourceDir)}-report.json`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`${shouldPublish ? "Published" : "Dry run"} ${files.length} files from ${sourceDir}`);
  console.log(`Duplicate title groups: ${report.duplicateGroups}`);
  console.log(`Selected candidates: ${report.selectedCandidates}`);
  console.log(`Inserted: ${report.inserted.length}`);
  console.log(`Updated: ${report.updated.length}`);
  console.log(`Skipped: ${report.skipped.length}`);
  console.log(`Unknown artists after overrides: ${report.unknownArtists.length}`);
  console.log(`Report: ${path.relative(root, reportPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
