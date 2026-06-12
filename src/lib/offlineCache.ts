/**
 * Asks the service worker to pre-cache song pages so they open without
 * signal. Fire-and-forget: silently does nothing when no worker is active
 * (first visit, unsupported browser) — pages then cache on navigation
 * like before.
 */
export function requestSongPrecache(ids: string[], options?: { includePresent?: boolean }) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (ids.length === 0) return;

  const urls = ids.flatMap((id) =>
    options?.includePresent ? [`/song/${id}`, `/present/${id}`] : [`/song/${id}`],
  );

  navigator.serviceWorker.ready
    .then((registration) => {
      registration.active?.postMessage({ type: "CACHE_URLS", urls });
    })
    .catch(() => {
      /* no active worker — nothing to do */
    });
}
