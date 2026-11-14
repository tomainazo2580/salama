/* SALAMA — Service Worker */
/* ⚠️⚠️ INCRÉMENTE LA VERSION À CHAQUE MISE À JOUR DU SITE ⚠️⚠️ */
var VERSION = 'v0.22';
var CACHE = 'salama-' + VERSION;

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
        return c.add(f).catch(function (err) {
          console.warn('[SW] Échec cache : ' + f, err);
          return null;
        });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (cles) {
      return Promise.all(cles.map(function (cle) {
        if (cle !== CACHE) return caches.delete(cle);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (rep) {
      if (rep) return rep;
      return fetch(e.request).then(function (reponse) {
        // Met en cache à la volée toute nouvelle ressource
        if (reponse && reponse.status === 200) {
          var copie = reponse.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copie); });
        }
        return reponse;
      }).catch(function () {
        return new Response('Hors ligne', { status: 503 });
      });
    })
  );
});
