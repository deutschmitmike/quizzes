// Service Worker: Seite zuerst aus dem Netz (immer die neueste Version), bei fehlendem Netz aus dem Speicher. version.json und fremde Seiten (Firebase, Fotos) nie zwischenspeichern.
const C="app-v1";
self.addEventListener("install",e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(["./","./manifest.json","./icon-180.png","./icon-192.png","./icon-512.png"])).catch(()=>{})); });
self.addEventListener("activate",e=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch",e=>{ const req=e.request, u=new URL(req.url);
  if(req.method!=="GET"||u.origin!==self.location.origin||/version\.json$/.test(u.pathname)) return;
  const key=u.origin+u.pathname;
  e.respondWith(fetch(req).then(r=>{ if(r&&r.ok){ const cp=r.clone(); caches.open(C).then(c=>c.put(key,cp)); } return r; })
    .catch(()=>caches.match(key).then(m=>m||caches.match(u.origin+u.pathname.replace(/[^/]*$/,""))))); });
