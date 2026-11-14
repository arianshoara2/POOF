// POOF service worker — اسناد HTML شبکه‌اول (network-first)، بقیه‌ی فایل‌های خودِ اپ کش‌اول (cache-first)
// فقط برای فایل‌های خودِ اپ (same-origin) — درخواست‌های خارجی دست‌نخورده می‌مانند
const CACHE = 'poof-v227';
// آفلاین‌پک مترو: همه‌ی صفحه‌ها + هر دو دیکشنری از اول کش می‌شوند،
// تا بدون اینترنت هم ورتشاتس و مرور و تست‌ها کار کنند
const CORE = ['./', './index.html', './poof-core.js', './poof-minimal.css', './dict-fa.jsonl', './manual-dict.json', './learn.html', './learn-en.html', './practice.html', './wortschatz.html', './der-die-das.html', './placement-test.html', './studienkolleg-trainer.html', './wort-des-tages.html', './privacy.html', './testdaf.html', './testdaf-part1.html', './testdaf-part2.html', './testdaf-part3.html', './testdaf-part4.html', './testdaf-part5.html', './testdaf-part6.html', './testdaf-part7.html', './testdaf-part8.html', './testdaf-part9.html', './testdaf-part10.html', './Digital_TestDaF_Extra_Part2_Hoeren_Lite_DeviceVoice_1_sd70.html', './Digital_TestDaF_Extra_Part3_Schreiben_Lite_Interactive_Offline_0_ramw.html', './Digital_TestDaF_Extra_Part4_Sprechen_Lite_Interactive_Offline_0_qlce.html', './theme-snowy.css', './theme-classic.css', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
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
    const isShell = url.pathname === '/' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
    if (!isShell) {
      // صفحه‌های خود اپ (ورتشاتس و…): اول از کش، فوری باز شود؛
      // تازه‌سازی در پس‌زمینه — تا ضربه زدن و باز شدن یکی شود
      e.respondWith(
        caches.match(e.request).then((m) => {
          const net = fetch(e.request).then((r) => {
            if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
            return r;
          }).catch(() => null);
          return m || net.then((r) => r || caches.match('./index.html'));
        })
      );
      return;
    }
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
    caches.match(e.request).then((m) => {
      if (m) return m;
      return fetch(e.request).then((r) => {
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return r;
      }).catch(() =>
        caches.match(e.request).then((mm) => mm || caches.match('./index.html'))
      );
    })
  );
});

/* ===== Web Push — یادآوری‌ها (?v=253) ===== */
/* آدرس ورکر شخصی — اگه عوض شد، اینجا هم عوضش کن. پیام سمت ورکر انتخاب می‌شود؛ */
const PUSH_WORKER="https://poof-worker.vercel.app";
self.addEventListener("push",function(e){
 e.waitUntil((async()=>{
  try{
   const reg=await self.registration.pushManager.getSubscription();
   const ep=reg?encodeURIComponent(reg.endpoint):"";
   const r=await fetch(PUSH_WORKER+"/?push-msg=1&ep="+ep);
   const m=await r.json();
   if(!m||!m.title)return;
   await self.registration.showNotification(m.title,{body:m.body||"",icon:"./icon-192.png",badge:"./icon-192.png",data:{url:m.url||"./"},tag:m.tag||"poof-remind"});
  }catch(err){}
 })());
});
self.addEventListener("notificationclick",function(e){
 e.notification.close();
 const url=(e.notification.data&&e.notification.data.url)||"./";
 e.waitUntil((async()=>{
  const all=await clients.matchAll({type:"window",includeUncontrolled:true});
  for(const c of all){try{if("focus" in c)await c.focus();if(c.navigate)await c.navigate(url);return}catch(err){}}
  if(clients.openWindow)await clients.openWindow(url);
 })());
});

