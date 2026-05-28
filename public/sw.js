// Service Worker — Santuário do Glow-up
const CACHE = "santuario-v1";
const STATIC = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Ignorar chamadas de API (como as do Supabase) ou outros domínios externos
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navegação: network-first, fallback cache
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/"))
    );
    return;
  }

  // Assets locais da própria aplicação
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request).then((res) => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);

      // Se for arquivo estático final do Vite (/assets/), podemos usar cache-first
      if (url.pathname.startsWith("/assets/")) {
        return cached || networkFetch;
      }

      // Para outros arquivos locais, revalida em segundo plano para não travar atualizações
      return cached ? (networkFetch, cached) : networkFetch;
    })
  );
});
