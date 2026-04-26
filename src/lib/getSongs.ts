import { supabase } from "./supabase";
import { LOCAL_SONGS, LOCAL_SONGS_BY_ID } from "@/data/localSongs";

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
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  timestamp: number;
  data: Song[];
}

/** Returns fresh cache (within TTL). Pass `acceptStale=true` to return expired cache too. */
function getCachedSongs(acceptStale = false): Song[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
    if (isExpired && !acceptStale) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.data?.length > 0 ? entry.data : null;
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

/** Queries Supabase with a 5-second timeout. Returns null on error or timeout. */
async function fetchFromSupabase(): Promise<Song[] | null> {
  try {
    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 5000)
    );
    const query = supabase
      .from("songs")
      .select("*")
      .order("title")
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return null;
        return (data as DbSongRow[]).map(mapDbRowToSong);
      });
    return await Promise.race([query, timeout]);
  } catch {
    return null;
  }
}

/* ── Public API ── */

export async function getSongs(): Promise<Song[]> {
  // 1. Try Supabase (5s timeout so SSR never hangs when project is paused)
  const fromDb = await fetchFromSupabase();
  if (fromDb) {
    setCachedSongs(fromDb);
    return fromDb;
  }

  console.warn("[getSongs] Supabase unavailable — checking cache.");

  // 2. Fresh localStorage cache (within 7-day TTL)
  const fresh = getCachedSongs();
  if (fresh) return fresh;

  // 3. Stale localStorage cache — 200+ songs from a past session beats 35 local files
  const stale = getCachedSongs(true);
  if (stale) return stale;

  // 4. Last resort: 35 bundled local songs
  console.warn("[getSongs] No cache — falling back to bundled local songs.");
  return LOCAL_SONGS.slice().sort((a, b) => a.title.localeCompare(b.title));
}

export async function getSongById(id: string): Promise<Song | null> {
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const query = supabase
      .from("songs")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => (error || !data ? null : mapDbRowToSong(data as DbSongRow)));
    const result = await Promise.race([query, timeout]);
    return result ?? LOCAL_SONGS_BY_ID.get(id) ?? null;
  } catch {
    return LOCAL_SONGS_BY_ID.get(id) ?? null;
  }
}

export async function getSongsByChurch(church: string): Promise<Song[]> {
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const query = supabase
      .from("songs")
      .select("*")
      .eq("church", church)
      .order("title")
      .then(({ data, error }) =>
        error || !data ? null : (data as DbSongRow[]).map(mapDbRowToSong)
      );
    const result = await Promise.race([query, timeout]);
    if (result) return result;
  } catch { /* fall through */ }
  return LOCAL_SONGS.filter((s) => s.church === church).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
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
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const query = supabase
      .from("songs")
      .select("id")
      .then(({ data, error }) =>
        error || !data ? null : data.map((row: { id: string }) => row.id)
      );
    return (await Promise.race([query, timeout])) ?? LOCAL_SONGS.map((s) => s.id);
  } catch {
    return LOCAL_SONGS.map((s) => s.id);
  }
}
