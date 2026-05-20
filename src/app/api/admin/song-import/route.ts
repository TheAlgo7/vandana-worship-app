import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

export const runtime = "nodejs";

type Language = "hinglish" | "hindi";
type LyricsSections = Record<string, string>;
type Status = "drafted" | "duplicate" | "invalid" | "published";

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
  status: Status;
  reason?: string;
  duplicateOf?: string;
  file?: string;
}

const root = process.cwd();
const songsDir = path.join(root, "src", "data", "songs");
const importDir = path.join(root, ".song-import");
const draftsDir = path.join(importDir, "drafts");
const reportPath = path.join(importDir, "report.json");

function canWrite() {
  return process.env.NODE_ENV !== "production";
}

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

function parseInput(input: unknown): RawSong[] {
  if (Array.isArray(input)) return input as RawSong[];
  if (typeof input === "string") return parseInput(JSON.parse(input));
  if (typeof input === "object" && input && "songs" in input) {
    const songs = (input as { songs: unknown }).songs;
    if (Array.isArray(songs)) return songs as RawSong[];
  }
  throw new Error("Paste a JSON array or an object with a songs array.");
}

function parseLyrics(input: string | LyricsSections | undefined): LyricsSections | undefined {
  if (!input) return undefined;
  if (typeof input !== "string") return cleanSections(input);

  const sections: LyricsSections = {};
  const lines = input.replace(/\r\n/g, "\n").split("\n");
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

function buildDraft(raw: RawSong): DraftSong {
  const title = titleCase(raw.title);
  const hinglish = parseLyrics(raw.lyrics_hinglish ?? raw.lyrics?.hinglish);
  const hindi = parseLyrics(raw.lyrics_hindi ?? raw.lyrics?.hindi);
  const languages: Language[] = [
    ...(hinglish ? ["hinglish"] as const : []),
    ...(hindi ? ["hindi"] as const : []),
  ];
  const artist = raw.artist?.trim() || "Unknown Artist";
  const church = raw.church?.trim() || null;
  const tags = Array.from(new Set([
    "worship",
    ...languages,
    ...(raw.tags ?? []),
    ...(church ? [slugify(church)] : []),
  ].filter(Boolean)));

  return {
    id: slugify(title),
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

function readLocalExisting() {
  if (!fs.existsSync(songsDir)) return [];
  return fs
    .readdirSync(songsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const song = JSON.parse(fs.readFileSync(path.join(songsDir, file), "utf8")) as { id: string; title: string };
      return { id: song.id, title: song.title, source: "local" };
    });
}

async function readSupabaseExisting() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from("songs").select("id,title");
  if (error || !data) return [];
  return data.map((song: { id: string; title: string }) => ({ ...song, source: "supabase" }));
}

async function generateDrafts(songs: RawSong[]) {
  fs.mkdirSync(draftsDir, { recursive: true });
  const existing = [...readLocalExisting(), ...(await readSupabaseExisting())];
  const existingById = new Map(existing.map((song) => [song.id, song]));
  const existingByTitle = new Map(existing.map((song) => [normalizeForCompare(song.title), song]));
  const seen = new Set<string>();
  const report: ReportEntry[] = [];
  const drafts: DraftSong[] = [];

  for (const raw of songs) {
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
    if (seen.has(id)) {
      report.push({ title, id, status: "duplicate", duplicateOf: "same input batch" });
      continue;
    }

    const draft = buildDraft(raw);
    if (draft.languages_available.length === 0) {
      report.push({ title, id, status: "invalid", reason: "Missing lyrics_hinglish or lyrics_hindi" });
      continue;
    }

    seen.add(id);
    const file = path.join(draftsDir, `${id}.json`);
    fs.writeFileSync(file, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
    drafts.push(draft);
    report.push({ title, id, status: "drafted", file: path.relative(root, file) });
  }

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return { report, drafts };
}

function draftToSupabaseRow(song: DraftSong) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    church: song.church,
    album: song.album,
    language_default: song.language_default,
    languages_available: song.languages_available,
    lyrics_hinglish: song.lyrics.hinglish ?? null,
    lyrics_hindi: song.lyrics.hindi ?? null,
    link_youtube: song.links.youtube,
    link_spotify: song.links.spotify,
    link_apple_music: song.links.apple_music,
    tags: song.tags,
    seo_description: song.seo_description,
    added_by: song.added_by,
  };
}

async function publishDrafts(ids: string[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = url && key ? createClient(url, key) : null;
  const report: ReportEntry[] = [];

  fs.mkdirSync(songsDir, { recursive: true });

  for (const id of ids) {
    const draftPath = path.join(draftsDir, `${id}.json`);
    if (!fs.existsSync(draftPath)) {
      report.push({ title: id, id, status: "invalid", reason: "Draft file not found" });
      continue;
    }

    const song = JSON.parse(fs.readFileSync(draftPath, "utf8")) as DraftSong;
    fs.writeFileSync(path.join(songsDir, `${song.id}.json`), `${JSON.stringify(song, null, 2)}\n`, "utf8");

    if (supabase) {
      const { error } = await supabase.from("songs").upsert(draftToSupabaseRow(song), { onConflict: "id" });
      if (error) {
        report.push({ title: song.title, id: song.id, status: "invalid", reason: error.message });
        continue;
      }
    }

    report.push({ title: song.title, id: song.id, status: "published", file: `src/data/songs/${song.id}.json` });
  }

  return { report, supabase: Boolean(supabase) };
}

export async function POST(request: Request) {
  if (!canWrite()) {
    return NextResponse.json({ error: "Song import is local/dev only." }, { status: 403 });
  }

  try {
    const body = await request.json() as { mode?: string; input?: unknown; ids?: string[] };
    if (body.mode === "publish") {
      return NextResponse.json(await publishDrafts(body.ids ?? []));
    }

    return NextResponse.json(await generateDrafts(parseInput(body.input)));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 400 },
    );
  }
}
