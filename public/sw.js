// Service Worker بسيط لتفعيل التثبيت كتطبيق
const CACHE = 'rawaj-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  // نمرر الطلبات عادي (شبكة أولاً) — نخليه بسيط
  return;
});
