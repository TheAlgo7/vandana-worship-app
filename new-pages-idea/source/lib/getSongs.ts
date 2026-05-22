import { supabase } from "./supabase";
import { LOCAL_SONGS, LOCAL_SONGS_BY_ID } from "@/data/localSongs";

/* ── Types ── */

export type Language = "hinglish" | "hindi";

/** Each language maps section names (chorus, verse1, etc.) to multiline lyric strings. */
export type LyricsMap = Record<string, string>;

export interface SongLink {
  youtube?: string | null;
  spotify?: string | null;
  apple_music?: string | null;
  [key: string]: string | null | undefined;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  church: string | null;
  album: string | null;
  language_default: Language;
  languages_available: Language[];
  lyrics: Record<Language, LyricsMap>;
  links: SongLink;
  tags: string[];
  seo_description: string;
  added_by: string;
}

export type SongLibrarySource = "supabase" | "cache" | "bundled";

export interface SongLibraryResult {
  songs: Song[];
  source: SongLibrarySource;
}

/** Minimal info for listing / cards. */
export interface SongMeta {
  id: string;
  title: string;
  artist: string;
  church: string | null;
  languages_available: Language[];
  tags: string[];
  lyrics_search: string;
}

export interface SongMetaLibraryResult {
  songs: SongMeta[];
  source: SongLibrarySource;
}

/* ── DB row → Song mapper ── */

interface DbSongRow {
  id: string;
  title: string;
  artist: string;
  church: string | null;
  album: string | null;
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

const CACHE_KEY = "vandana-songs-cache-v3";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const SUPABASE_PAGE_SIZE = 1000;

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
    // localStorage full or unavailable - ignore
  }
}

/** Queries Supabase with a 5-second timeout. Returns null on error or timeout. */
async function fetchFromSupabase(): Promise<Song[] | null> {
  try {
    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 12000)
    );
    const query = (async () => {
      const rows: DbSongRow[] = [];
      for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
        const to = from + SUPABASE_PAGE_SIZE - 1;
        const { data, error } = await supabase
          .from("songs")
          .select("*")
          .not("lyrics_hinglish", "is", null)
          .order("title")
          .range(from, to);

        if (error || !data) return null;
        rows.push(...(data as DbSongRow[]));
        if (data.length < SUPABASE_PAGE_SIZE) break;
      }

      if (rows.length === 0) return null;
      const songs = rows.map(mapDbRowToSong);
      // Known-artist songs first, then Unknown Artist — each group sorted by title
      songs.sort((a, b) => {
        const aUnknown = a.artist === "Unknown Artist" ? 1 : 0;
        const bUnknown = b.artist === "Unknown Artist" ? 1 : 0;
        if (aUnknown !== bUnknown) return aUnknown - bUnknown;
        return a.title.localeCompare(b.title);
      });
      return songs;
    })();
    return await Promise.race([query, timeout]);
  } catch {
    return null;
  }
}

/* ── Public API ── */

export async function getSongLibrary(): Promise<SongLibraryResult> {
  // 1. Try Supabase (5s timeout so SSR never hangs when project is paused)
  const fromDb = await fetchFromSupabase();
  if (fromDb) {
    setCachedSongs(fromDb);
    return { songs: fromDb, source: "supabase" };
  }

  console.warn("[getSongs] Supabase unavailable - checking cache.");

  // 2. Fresh localStorage cache (within 7-day TTL)
  const fresh = getCachedSongs();
  if (fresh) return { songs: fresh, source: "cache" };

  // 3. Stale localStorage cache - 200+ songs from a past session beats 35 local files
  const stale = getCachedSongs(true);
  if (stale) return { songs: stale, source: "cache" };

  // 4. Last resort: 35 bundled local songs
  console.warn("[getSongs] No cache - falling back to bundled local songs.");
  return {
    songs: LOCAL_SONGS.slice().sort((a, b) => a.title.localeCompare(b.title)),
    source: "bundled",
  };
}

export async function getSongs(): Promise<Song[]> {
  return (await getSongLibrary()).songs;
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

export async function getSongsByMinistry(
  filterBy: "church" | "artist",
  filterValue: string,
): Promise<Song[]> {
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const query = supabase
      .from("songs")
      .select("*")
      .eq(filterBy === "church" ? "church" : "artist", filterValue)
      .order("title")
      .then(({ data, error }) =>
        error || !data ? null : (data as DbSongRow[]).map(mapDbRowToSong),
      );
    const result = await Promise.race([query, timeout]);
    if (result) return result;
  } catch { /* fall through */ }
  return LOCAL_SONGS.filter((s) =>
    filterBy === "church" ? s.church === filterValue : s.artist === filterValue,
  ).sort((a, b) => a.title.localeCompare(b.title));
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
  return (await getAllSongMetasWithSource()).songs;
}

export async function getAllSongMetasWithSource(): Promise<SongMetaLibraryResult> {
  const library = await getSongLibrary();
  const songs = library.songs.map(({ id, title, artist, church, languages_available, tags, lyrics }) => ({
    id,
    title,
    artist,
    church,
    languages_available,
    tags,
    lyrics_search: Object.values(lyrics)
      .flatMap((sections) => Object.values(sections))
      .join("\n"),
  }));

  return { songs, source: library.source };
}

export async function getSongIds(): Promise<string[]> {
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 12000));
    const query = (async () => {
      const ids: string[] = [];
      for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
        const to = from + SUPABASE_PAGE_SIZE - 1;
        const { data, error } = await supabase
          .from("songs")
          .select("id")
          .not("lyrics_hinglish", "is", null)
          .order("id")
          .range(from, to);

        if (error || !data) return null;
        ids.push(...data.map((row: { id: string }) => row.id));
        if (data.length < SUPABASE_PAGE_SIZE) break;
      }
      return ids;
    })();
    return (await Promise.race([query, timeout])) ?? LOCAL_SONGS.map((s) => s.id);
  } catch {
    return LOCAL_SONGS.map((s) => s.id);
  }
}
