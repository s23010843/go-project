/* ── Farm Market Price Portal – Service Worker ────────────────────────────
   Strategy:
     • Static assets  → Cache-first  (instant loads, background refresh)
     • API (/api/*)   → Network-first (fresh data, cached fallback)
     • CDN (fonts, Chart.js) → Cache-first (avoids repeated downloads)
     • Offline navigation  → serve cached page or /offline.html
   ─────────────────────────────────────────────────────────────────────── */

const VERSION   = 'v6';
const CACHE     = 'farm-market-' + VERSION;
const OFFLINE   = '/offline.html';

// Files to cache immediately on install
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/bot.svg',
  '/favicon.svg',
  '/intents.json',
  '/prices.json',
  '/manifest.json',
  '/offline.html',
  '/404.html',
  '/500.html',
  '/assets/videos/agriculture-environment.mp4',
];

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())   // activate immediately
  );
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())  // take control of open tabs
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET; let non-GET pass through untouched
  if (request.method !== 'GET') return;

  /* ── 1. API calls: network-first, cached fallback ── */
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  /* ── 2. CDN resources: only handle cross-origin fonts/images/styles.
     Avoid intercepting cross-origin `script` or `module` requests because
     those are CORS-sensitive and returning opaque responses causes the
     browser to reject them (see console errors). Let the browser load
     cross-origin scripts directly. */
  if (url.origin !== location.origin) {
    const allowed = ['font', 'image', 'style'];
    if (allowed.includes(request.destination)) {
      event.respondWith(cacheFirstWithNetwork(request));
    }
    return;
  }

  /* ── 3. Navigation (HTML pages): network-first, offline fallback ── */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() =>
          caches.match(request)
            .then(r => r || caches.match(OFFLINE))
        )
    );
    return;
  }

  /* ── 4. Everything else: cache-first, network fallback ── */
  event.respondWith(cacheFirstWithNetwork(request));
});

// ── Helpers ────────────────────────────────────────────────────────────────

/** Network first. On success, update the cache. On failure, serve cache. */
async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(
      JSON.stringify({ error: 'You appear to be offline. Showing cached data.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/** Cache first. On miss, fetch, store, and return. */
async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // For non-navigation assets, just fail silently
    return new Response('', { status: 408 });
  }
}
