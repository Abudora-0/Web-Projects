/* Halcyon service worker - app shell is cache-first (so it installs and
   opens instantly), Open-Meteo calls are network-first with a cache
   fallback (so the last sky you saw still shows up offline). */
const SHELL_CACHE = "halcyon-shell-v2";
const RUNTIME_CACHE = "halcyon-runtime-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  if (url.hostname.endsWith("open-meteo.com")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  if (url.origin !== self.location.origin) return; // fonts etc. - let the network handle it

  e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
});
