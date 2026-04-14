const CACHE_NAME = 'neulbom-v2';  // ← 버전 올릴 때마다 변경
const ASSETS = ['./index.html', './manifest.json', './icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())  // ← 즉시 활성화
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())  // ← 모든 탭에 즉시 적용
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
