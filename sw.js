const CACHE_NAME = 'neulbom-v6';
const ASSETS = ['./index.html', './manifest.json', './icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // 외부 API 요청은 캐시 없이 바로 통과
  const url = e.request.url;
  if(url.startsWith('http') && !url.includes(self.location.origin) &&
     !url.includes('github.io')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if(res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'FORCE_UPDATE') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
