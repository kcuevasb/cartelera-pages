const CACHE_NAME = 'cartelera-v3'; // bump: purga cualquier respuesta /api/** que hubiera quedado cacheada
const APP_SHELL = [
  './', './index.html', './manifest.webmanifest', './offline.html',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];

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
// solo si no hay conexión, cae a la última copia guardada en caché para el
// app shell (mismo origen: index.html, manifest...). Así no hace falta
// acordarse de subir de versión este archivo cada vez que se actualiza la web.
//
// Nunca se cachea nada de la API del backend (biblioteca, ajustes, auth,
// csrf, proxy TMDB), sea cual sea su origen — ni siquiera como fallback
// offline. Bug corregido: la exclusión previa solo comprobaba dominios TMDB
// literales (api.themoviedb.org/image.tmdb.org), de una versión anterior de
// la app sin backend. Como ahora TMDB se llama vía proxy del backend
// (`${BACKEND_URL}/api/tmdb/**`), esas URLs no matcheaban esa exclusión y
// podían acabar cacheadas junto con /api/library, /api/auth/me y
// /api/settings, con riesgo real de servir biblioteca o sesión obsoleta.
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  if (!isSameOrigin || requestUrl.pathname.startsWith('/api/')) {
    return; // network passthrough: nunca cachear nada de la API
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
      .catch(() => caches.match(event.request).then((cached) => {
        if (cached) return cached;
        // Última red de seguridad: si es una navegación (el usuario abriendo
        // o recargando la página) y no hay ni red ni copia en caché,
        // mostramos una pantalla de "sin conexión" en vez del error nativo
        // del navegador.
        if (event.request.mode === 'navigate') {
          return caches.match('./offline.html');
        }
        return undefined;
      }))
  );
});
