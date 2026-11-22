/* SALAMA — Service Worker (v0.22) */
var CACHE = 'salama-v27';
var FICHIERS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'data.js',
  'activation.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(FICHIERS.map(function (f) {
        return c.add(f).catch(function () { return null; });
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (cles) {
      return Promise.all(cles.map(function (cle) {
        if (cle !== CACHE) return caches.delete(cle);
      }));
    })
  );
  self.clients.claim();
});

/* Stratégie : cache d'abord, puis mise à jour silencieuse en arrière-plan.
   L'app s'ouvre instantanément (même hors-ligne) et se met à jour
   toute seule dès qu'une connexion est disponible. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (depuisCache) {
      var depuisReseau = fetch(e.request).then(function (rep) {
        if (rep && rep.ok) {
          var copie = rep.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copie); });
        }
        return rep;
      }).catch(function () { return depuisCache; });
      return depuisCache || depuisReseau;
    })
  );
});
