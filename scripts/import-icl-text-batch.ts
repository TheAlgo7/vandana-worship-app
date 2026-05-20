import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

type Language = "hinglish" | "hindi";
type LyricsSections = Record<string, string>;

interface ParsedSong {
  id: string;
  title: string;
  artist: string;
  church: string | null;
  sourceUrl: string | null;
  lyrics: Record<Language, LyricsSections>;
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
  const id = path.basename(filePath, ".txt");
  const text = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const lines = text.split("\n").map((line) => line.trim());
  const title = lines[0];
  const rawArtist = lines[1] || "Unknown Artist";
  const artist = artistOverrides[id] ?? (rawArtist === "Unknown Artist" ? artistOverrides[slugify(title)] ?? rawArtist : rawArtist);
  const urls = lines.filter((line) => /^https?:\/\//.test(line));
  const hindiBlock = extractBlock(text, "Hindi Lyrics", "Hinglish Lyrics");
  const hinglishBlock = extractBlock(text, "Hinglish Lyrics");

  return {
    id,
    title,
    artist,
    church: null,
    sourceUrl: urls[0] ?? null,
    lyrics: {
      hinglish: parseLyricsBlock(hinglishBlock),
      hindi: parseLyricsBlock(hindiBlock),
    },
  };
}

function textLength(sections: LyricsSections | null | undefined): number {
  return Object.values(sections ?? {}).join("\n").replace(/\s+/g, "").length;
}

function sectionCount(sections: LyricsSections | null | undefined): number {
  return Object.keys(sections ?? {}).length;
}

function hasInlineChords(sections: LyricsSections | null | undefined): boolean {
  return /\[[A-G][#b]?(?:m|maj|min|sus|dim|aug|add)?\d*(?:\/[A-G][#b]?)?\]/.test(
    Object.values(sections ?? {}).join("\n")
  );
}

function hasUsableLyrics(song: ParsedSong): boolean {
  return textLength(song.lyrics.hinglish) > 0 || textLength(song.lyrics.hindi) > 0;
}

function shouldUpdate(existing: ExistingSong, incoming: ParsedSong): boolean {
  if (existing.artist === "Unknown Artist" && incoming.artist !== "Unknown Artist") return true;
  if (!existing.lyrics_hindi && textLength(incoming.lyrics.hindi) > 0) return true;
  if (!existing.lyrics_hinglish && textLength(incoming.lyrics.hinglish) > 0) return true;
  if (hasInlineChords(existing.lyrics_hindi) || hasInlineChords(existing.lyrics_hinglish)) return true;
  if (sectionCount(incoming.lyrics.hindi) > sectionCount(existing.lyrics_hindi)) return true;
  if (sectionCount(incoming.lyrics.hinglish) > sectionCount(existing.lyrics_hinglish)) return true;
  if (textLength(incoming.lyrics.hindi) > textLength(existing.lyrics_hindi) + 40) return true;
  if (textLength(incoming.lyrics.hinglish) > textLength(existing.lyrics_hinglish) + 40) return true;
  return false;
}

function toSupabaseRow(song: ParsedSong, existing?: ExistingSong) {
  const hasHinglish = textLength(song.lyrics.hinglish) > 0;
  const hasHindi = textLength(song.lyrics.hindi) > 0;
  const languages = [
    ...(hasHinglish ? ["hinglish"] as const : []),
    ...(hasHindi ? ["hindi"] as const : []),
  ];
  const tags = Array.from(new Set([...(existing?.tags ?? []), "worship", ...languages, "indianchristianlyrics"]));

  return {
    id: existing?.id ?? song.id,
    title: existing?.title ?? song.title,
    artist: song.artist !== "Unknown Artist" ? song.artist : existing?.artist ?? song.artist,
    church: existing?.church ?? song.church,
    album: existing?.album ?? null,
    language_default: languages.includes("hinglish") ? "hinglish" : "hindi",
    languages_available: languages,
    lyrics_hinglish: hasHinglish ? song.lyrics.hinglish : existing?.lyrics_hinglish ?? null,
    lyrics_hindi: hasHindi ? song.lyrics.hindi : existing?.lyrics_hindi ?? null,
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
  const songs = files.map((file) => parseTextFile(path.join(sourceDir, file)));

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
    inserted: [],
    updated: [],
    skipped: [],
    unknownArtists: [],
  };

  for (const song of songs) {
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
