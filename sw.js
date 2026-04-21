// sw.js — Service Worker sederhana untuk offline basic caching
const CACHE = 'tktc-kartini-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  // Network-first untuk Firebase/Firestore, cache-first untuk aset lokal
  const url = e.request.url;
  if (url.includes('firestore.googleapis.com') || url.includes('identitytoolkit')){
    return; // biarkan browser menangani
  }
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(r=>{
      const copy = r.clone();
      caches.open(CACHE).then(c=> c.put(e.request, copy)).catch(()=>{});
      return r;
    }).catch(()=> caches.match('./index.html')))
  );
});