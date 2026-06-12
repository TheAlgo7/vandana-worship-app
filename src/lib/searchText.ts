/**
 * Shared search-text normalization.
 *
 * Used on the server to pre-build the lyric search index (so the client never
 * normalizes megabytes of lyrics on the main thread) and on the client to
 * normalize queries the same way. Keep both sides in sync by only ever
 * editing this file.
 */
export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
