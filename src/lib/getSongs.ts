import fs from "fs";
import path from "path";

/* ── Types ── */

export type Language = "hinglish" | "hindi";

/** Each language maps section names (chorus, verse1, etc.) to multiline lyric strings. */
export type LyricsMap = Record<string, string>;

export interface SongLink {
  youtube?: string;
  spotify?: string;
  [key: string]: string | undefined;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  church: string;
  album: string;
  language_default: Language;
  languages_available: Language[];
  lyrics: Record<Language, LyricsMap>;
  links: SongLink;
  tags: string[];
  seo_description: string;
  added_by: string;
}

/** Minimal info for listing / cards. */
export interface SongMeta {
  id: string;
  title: string;
  artist: string;
  church: string;
  tags: string[];
}

/* ── Helpers ── */

const songsDir = path.join(process.cwd(), "src/data/songs");

export function getSongIds(): string[] {
  return fs
    .readdirSync(songsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

export function getSong(id: string): Song | null {
  const filePath = path.join(songsDir, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Song;
}

export function getAllSongs(): Song[] {
  return getSongIds()
    .map((id) => getSong(id))
    .filter((s): s is Song => s !== null);
}

export function getAllSongMetas(): SongMeta[] {
  return getAllSongs().map(({ id, title, artist, church, tags }) => ({
    id,
    title,
    artist,
    church,
    tags,
  }));
}
