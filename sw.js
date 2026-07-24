// Cartelera se ha mudado a cartelera-app.onrender.com — este Service Worker
// ya no sirve la app, solo se auto-elimina (limpia caché y se desregistra)
// para que las instalaciones PWA viejas dejen de quedarse en la versión
// antigua offline.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then((clients) => clients.forEach((client) => client.navigate(client.url)))
  );
});
