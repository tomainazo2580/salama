/* SALAMA — Service Worker (v0.18) */
var CACHE = 'salama-v18';
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

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (rep) {
      return rep || fetch(e.request);
    })
  );
});
