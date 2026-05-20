import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

type Language = "hinglish" | "hindi";
type LyricsSections = Record<string, string>;

interface ExistingSong {
  id: string;
  title: string;
  source: "local" | "supabase";
}

interface RawSong {
  title: string;
  artist?: string;
  church?: string | null;
  album?: string | null;
  source_url?: string | null;
  youtube?: string | null;
  spotify?: string | null;
  apple_music?: string | null;
  tags?: string[];
  lyrics?: Partial<Record<Language, string | LyricsSections>>;
  lyrics_hinglish?: string | LyricsSections;
  lyrics_hindi?: string | LyricsSections;
}

interface DraftSong {
  id: string;
  title: string;
  artist: string;
  church: string | null;
  album: string | null;
  language_default: Language;
  languages_available: Language[];
  lyrics: Partial<Record<Language, LyricsSections>>;
  links: {
    youtube: string | null;
    spotify: string | null;
    apple_music: string | null;
  };
  tags: string[];
  seo_description: string;
  added_by: string;
  source_url?: string | null;
}

interface ReportEntry {
  title: string;
  id: string;
  status: "drafted" | "duplicate" | "invalid";
  reason?: string;
  duplicateOf?: string;
  file?: string;
}

const root = path.resolve(__dirname, "..");
const songsDir = path.join(root, "src", "data", "songs");
const outputDir = path.join(root, ".song-import", "drafts");
const reportPath = path.join(root, ".song-import", "report.json");
const inputPath = path.resolve(root, process.argv[2] ?? "imports/songs.batch.json");

dotenv.config({ path: path.join(root, ".env.local") });

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
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^x\d+$/i.test(word)) return word.toLowerCase();
      return word
        .split("-")
        .map((part) => part.toLowerCase().replace(/(^|[([{'"\/\-\u2013\u2014\u2026])([a-z])/g, (_match, prefix: string, letter: string) => prefix + letter.toUpperCase()))
        .join("-");
    })
    .join(" ")
    .replace(/\bFt\b/g, "ft")
    .replace(/\bft\./gi, "ft.");
}

function readLocalSongs(): ExistingSong[] {
  if (!fs.existsSync(songsDir)) return [];
  return fs
    .readdirSync(songsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const song = JSON.parse(fs.readFileSync(path.join(songsDir, file), "utf8")) as ExistingSong;
      return { id: song.id, title: song.title, source: "local" };
    });
}

async function readSupabaseSongs(): Promise<ExistingSong[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return [];

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from("songs").select("id,title");
  if (error || !data) {
    console.warn(`Supabase duplicate check skipped: ${error?.message ?? "no data"}`);
    return [];
  }

  return data
    .filter((row): row is { id: string; title: string } => Boolean(row.id && row.title))
    .map((row) => ({ id: row.id, title: row.title, source: "supabase" }));
}

function parseLyrics(input: string | LyricsSections | undefined): LyricsSections | undefined {
  if (!input) return undefined;
  if (typeof input !== "string") return cleanSections(input);

  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const sections: LyricsSections = {};
  let currentKey = "verse1";
  let verseCount = 1;
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) sections[currentKey] = text;
    buffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = parseSectionHeading(line);
    if (heading) {
      flush();
      currentKey = heading === "verse" ? `verse${verseCount++}` : heading;
      continue;
    }

    if (!line && buffer.length === 0) continue;
    if (!line && buffer.length > 0) {
      flush();
      currentKey = `verse${verseCount++}`;
      continue;
    }

    buffer.push(rawLine.trimEnd());
  }

  flush();
  return Object.keys(sections).length > 0 ? sections : undefined;
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
  if (/^chorus\s*\d*$/.test(normalized)) return "chorus";
  if (/^bridge\s*\d*$/.test(normalized)) return "bridge";
  if (/^pre[-\s]?chorus$/.test(normalized)) return "prechorus";
  if (/^tag$/.test(normalized)) return "tag";
  if (/^outro$/.test(normalized)) return "outro";
  return null;
}

function cleanSections(sections: LyricsSections): LyricsSections {
  return Object.fromEntries(
    Object.entries(sections)
      .map(([key, value]) => [key.trim().toLowerCase().replace(/\s+/g, ""), value.trim()])
      .filter(([, value]) => value.length > 0),
  );
}

function readBatch(): RawSong[] {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(inputPath, "utf8")) as unknown;
  if (Array.isArray(parsed)) return parsed as RawSong[];
  if (typeof parsed === "object" && parsed && "songs" in parsed) {
    return (parsed as { songs: RawSong[] }).songs;
  }
  throw new Error("Input must be a JSON array or an object with a songs array.");
}

function buildDraft(raw: RawSong): DraftSong {
  const title = titleCase(raw.title);
  const id = slugify(title);
  const hinglish = parseLyrics(raw.lyrics_hinglish ?? raw.lyrics?.hinglish);
  const hindi = parseLyrics(raw.lyrics_hindi ?? raw.lyrics?.hindi);
  const languages = [
    ...(hinglish ? ["hinglish"] as const : []),
    ...(hindi ? ["hindi"] as const : []),
  ];
  const artist = raw.artist?.trim() || "Unknown Artist";
  const church = raw.church?.trim() || null;
  const sourceTags = raw.tags ?? [];
  const tags = Array.from(new Set([
    "worship",
    ...languages,
    ...sourceTags,
    ...(church ? [slugify(church)] : []),
  ].filter(Boolean)));

  return {
    id,
    title,
    artist,
    church,
    album: raw.album ?? null,
    language_default: languages.includes("hinglish") ? "hinglish" : "hindi",
    languages_available: languages,
    lyrics: {
      ...(hinglish ? { hinglish } : {}),
      ...(hindi ? { hindi } : {}),
    },
    links: {
      youtube: raw.youtube ?? null,
      spotify: raw.spotify ?? null,
      apple_music: raw.apple_music ?? null,
    },
    tags,
    seo_description: `${title} lyrics in ${languages.join(" and ")} by ${artist}${church ? ` - ${church}` : ""}`,
    added_by: "Gaurav | Vandana",
    source_url: raw.source_url ?? null,
  };
}

async function main() {
  const batch = readBatch();
  const existing = [...readLocalSongs(), ...(await readSupabaseSongs())];
  const existingById = new Map(existing.map((song) => [song.id, song]));
  const existingByTitle = new Map(existing.map((song) => [normalizeForCompare(song.title), song]));
  const seenBatchIds = new Set<string>();
  const report: ReportEntry[] = [];

  fs.mkdirSync(outputDir, { recursive: true });

  for (const raw of batch) {
    const title = raw.title?.trim();
    if (!title) {
      report.push({ title: "(missing title)", id: "", status: "invalid", reason: "Missing title" });
      continue;
    }

    const id = slugify(title);
    const duplicate = existingById.get(id) ?? existingByTitle.get(normalizeForCompare(title));
    if (duplicate) {
      report.push({ title, id, status: "duplicate", duplicateOf: `${duplicate.source}:${duplicate.id}` });
      continue;
    }
    if (seenBatchIds.has(id)) {
      report.push({ title, id, status: "duplicate", duplicateOf: "same input batch" });
      continue;
    }

    const draft = buildDraft(raw);
    if (draft.languages_available.length === 0) {
      report.push({ title, id, status: "invalid", reason: "Missing lyrics_hinglish/lyrics_hindi" });
      continue;
    }

    seenBatchIds.add(id);
    const file = path.join(outputDir, `${id}.json`);
    fs.writeFileSync(file, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
    report.push({ title, id, status: "drafted", file: path.relative(root, file) });
  }

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const drafted = report.filter((entry) => entry.status === "drafted").length;
  const duplicates = report.filter((entry) => entry.status === "duplicate").length;
  const invalid = report.filter((entry) => entry.status === "invalid").length;
  console.log(`Processed ${batch.length} songs`);
  console.log(`Drafted: ${drafted}`);
  console.log(`Duplicates: ${duplicates}`);
  console.log(`Invalid: ${invalid}`);
  console.log(`Report: ${path.relative(root, reportPath)}`);
  console.log(`Drafts: ${path.relative(root, outputDir)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
