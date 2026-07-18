const CACHE_NAME = 'cartelera-v2';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: siempre intenta traer la versión más reciente del servidor;
// solo si no hay conexión, cae a la última copia guardada en caché. Así no
// hace falta acordarse de subir de versión este archivo cada vez que se
// actualiza la web (que era justo el problema que teníamos antes).
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('api.themoviedb.org') || url.includes('image.tmdb.org')) {
    return; // estas van siempre directas a la red
  }
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
