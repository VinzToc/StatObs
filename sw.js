/* Service worker – Observation EPS
   Pour publier une mise à jour : changer VERSION ci-dessous. */
const VERSION = 'v1';
const CACHE = 'observation-eps-' + VERSION;
const CHART_URL = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';

const CORE = [
  './',
  'index.html',
  'panneau_saisie.html',
  'statistiques.html',
  'pwa.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    // Chart.js (CDN) : mis en cache si possible, sinon au premier usage en ligne
    try {
      const res = await fetch(new Request(CHART_URL, { mode: 'no-cors' }));
      await cache.put(CHART_URL, res);
    } catch (e) { /* hors ligne à l'installation : on réessaiera à l'usage */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('observation-eps-') && k !== CACHE)
                          .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Stratégie : cache d'abord, mise à jour en arrière-plan (fonctionne hors ligne)
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;               // POST Google Sheets : jamais intercepté

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && req.url !== CHART_URL) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });

    const network = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }).catch(() => null);

    if (cached) { event.waitUntil(network); return cached; }

    const res = await network;
    if (res) return res;

    if (req.mode === 'navigate') {
      const fallback = await cache.match('index.html');
      if (fallback) return fallback;
    }
    return new Response('Hors ligne', { status: 503, statusText: 'Offline' });
  })());
});
