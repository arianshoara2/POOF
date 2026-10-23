// POOF service worker — اسناد HTML همیشه شبکه‌اول (network-first)، بقیه با fallback آفلاین
// فقط برای فایل‌های خودِ اپ (same-origin) — درخواست‌های خارجی دست‌نخورده می‌مانند
const CACHE = 'poof-v25';
const CORE = ['./', './index.html', './poof-core.js', './dict-fa.jsonl', './learn.html', './practice.html', './theme-snowy.css', './theme-classic.css', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  // درخواست‌های خارجی (دیکشنری، ویکی‌پدیا و…) را لمس نکن —
  // وگرنه منطق پروکسی/خطای اپ می‌شکند
  try {
    if (new URL(e.request.url).origin !== self.location.origin) return;
  } catch (x) { return; }
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isDocument = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  if (isDocument) {
    // ناوبری و اسناد HTML: همیشه اول شبکه و ذخیره‌ی نسخه‌ی تازه در کش —
    // کش فقط وقتی آفلاینیم. این‌طوری پوسته‌ی تازه بعد از هر دیپلوی فوراً می‌رسد.
    e.respondWith(
      fetch(e.request).then((r) => {
        const copy = r.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return r;
      }).catch(() =>
        caches.match(e.request).then((m) => m || caches.match('./index.html'))
      )
    );
    return;
  }
  e.respondWith(
    fetch(e.request).then((r) => {
      const copy = r.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return r;
    }).catch(() =>
      caches.match(e.request).then((m) => m || caches.match('./index.html'))
    )
  );
});
