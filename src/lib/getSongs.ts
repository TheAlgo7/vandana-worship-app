import { supabase } from "./supabase";

/* ── Types ── */

export type Language = "hinglish" | "hindi";

/** Each language maps section names (chorus, verse1, etc.) to multiline lyric strings. */
export type LyricsMap = Record<string, string>;

export interface SongLink {
  youtube?: string;
  spotify?: string;
  apple_music?: string;
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

/* ── DB row → Song mapper ── */

interface DbSongRow {
  id: string;
  title: string;
  artist: string;
  church: string;
  album: string;
  language_default: Language;
  languages_available: Language[];
  lyrics_hinglish: LyricsMap | null;
  lyrics_hindi: LyricsMap | null;
  link_youtube: string | null;
  link_spotify: string | null;
  link_apple_music: string | null;
  tags: string[];
  seo_description: string;
  added_by: string;
}

function mapDbRowToSong(row: DbSongRow): Song {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    church: row.church,
    album: row.album,
    language_default: row.language_default,
    languages_available: row.languages_available,
    lyrics: {
      hinglish: row.lyrics_hinglish ?? {},
      hindi: row.lyrics_hindi ?? {},
    },
    links: {
      youtube: row.link_youtube ?? undefined,
      spotify: row.link_spotify ?? undefined,
      apple_music: row.link_apple_music ?? undefined,
    },
    tags: row.tags ?? [],
    seo_description: row.seo_description,
    added_by: row.added_by,
  };
}

/* ── Offline cache (localStorage, client-side only) ── */

const CACHE_KEY = "vandana-songs-cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  timestamp: number;
  data: Song[];
}

function getCachedSongs(): Song[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCachedSongs(data: Song[]): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry = { timestamp: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

/* ── Public API ── */

export async function getSongs(): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("title");

  if (error || !data) {
    const cached = getCachedSongs();
    if (cached) return cached;
    return [];
  }

  const songs = (data as DbSongRow[]).map(mapDbRowToSong);
  setCachedSongs(songs);
  return songs;
}

export async function getSongById(id: string): Promise<Song | null> {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapDbRowToSong(data as DbSongRow);
}

export async function getSongsByChurch(church: string): Promise<Song[]> {
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("church", church)
    .order("title");

  if (error || !data) return [];
  return (data as DbSongRow[]).map(mapDbRowToSong);
}

/* ── Convenience helpers (used by pages) ── */

export async function getAllSongMetas(): Promise<SongMeta[]> {
  const songs = await getSongs();
  return songs.map(({ id, title, artist, church, tags }) => ({
    id,
    title,
    artist,
    church,
    tags,
  }));
}

export async function getSongIds(): Promise<string[]> {
  const { data, error } = await supabase.from("songs").select("id");
  if (error || !data) return [];
  return data.map((row: { id: string }) => row.id);
}
