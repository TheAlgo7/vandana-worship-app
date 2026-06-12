const STATIC_CACHE = "vandana-static-v10";
const RUNTIME_CACHE = "vandana-runtime-v7";
const PRECACHE_URLS = [
  "/",
  "/app",
  "/updates",
  "/favourites",
  "/setlist",
  "/settings",
  "/manifest.json",
  "/icons/favicon-32.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/logo-tagline.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  // Pre-cache pages the user will need without signal (e.g. tonight's setlist).
  if (event.data && event.data.type === "CACHE_URLS" && Array.isArray(event.data.urls)) {
    event.waitUntil(cacheUrls(event.data.urls));
  }
});

const CACHE_URLS_MAX = 80;

async function cacheUrls(urls) {
  const cache = await caches.open(RUNTIME_CACHE);
  await Promise.all(
    urls.slice(0, CACHE_URLS_MAX).map(async (url) => {
      try {
        const resolved = new URL(url, self.location.origin);
        if (resolved.origin !== self.location.origin) return;
        const existing = await cache.match(resolved.href);
        if (existing) return;
        const response = await fetch(resolved.href);
        if (response.ok && response.type === "basic") {
          await cache.put(resolved.href, response);
        }
      } catch {
        /* offline right now — the page will cache on a later visit */
      }
    })
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    // Only cache successful, basic responses — never a 404/500 or opaque error.
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const home = await caches.match("/");
    return home || Response.error();
  }
}

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Vandana", {
      body: data.body ?? "",
      icon: "/icons/icon-192.png",
      badge: "/icons/favicon-32.png",
      tag: data.tag ?? "vandana",
      silent: data.silent ?? false,
      data: { url: data.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const url = event.notification.data?.url ?? "/";
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        return clients.openWindow(url);
      })
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;
  return (await networkPromise) || Response.error();
}
