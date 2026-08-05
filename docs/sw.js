// sw.js — capa PWA mínima para Consultorio-123.
// Cachea el shell estático para que la app abra sin conexión. A propósito
// NUNCA cachea /api/* ni version.json (mismo motivo que friendly-123: los
// datos y el chequeo de versión siempre deben ir a la red cuando hay).
const CACHE = "c123-shell-v1";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./event-bus.js",
  "./hechos.js",
  "./device-identity.js",
  "./cxc.js",
  "./ingresos.js",
  "./inventario.js",
  "./estado-resultados.js",
  "./manifest.json",
  "./favicon.png",
];

const HOSTS_PERMITIDOS = [self.location.origin];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => Promise.allSettled(
      SHELL.map((u) => cache.add(u).catch((e) => { try { console.warn("[SW] no se pudo precachear", u, e && e.message); } catch (_) {} }))
    )).catch((e) => { try { console.warn("[SW] precache incompleto:", e && e.message); } catch (_) {} })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nombres) => Promise.all(nombres.filter((n) => n.startsWith("c123-shell-") && n !== CACHE).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const url = new URL(evento.request.url);
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.endsWith("version.json")) return;
  if (evento.request.method !== "GET") return;
  if (!HOSTS_PERMITIDOS.includes(url.origin)) return;

  const guardar = (res) => {
    if (res && (res.ok || res.type === "opaque")) {
      const copia = res.clone();
      caches.open(CACHE).then((cache) => cache.put(evento.request, copia)).catch(() => {});
    }
    return res;
  };
  evento.respondWith(
    fetch(evento.request, { cache: "no-cache" }).then(guardar).catch(() =>
      caches.match(evento.request).then((c) => c || (evento.request.mode === "navigate" ? caches.match("./index.html") : undefined))
    )
  );
});
