const C='tripmate-v65',A=['./','index.html','manifest.json','planner.js','placeq.js','placeurl.js','legs.js','journey.js','extras.js','food.js','fx.js','share.js','tickets.js','notify.js','visitgeo.js','spotlore.js','vendor/lz-string.min.js','sync.js','collab.js','live.js','importer.js','urlimport.js','data/local-food.json','icons/icon.svg','icons/icon-192.png','icons/ui-spot.svg','icons/ui-fly.svg','icons/ui-hotel.svg','icons/ui-suitcase.svg','icons/coffee-trip.svg','icons/share-trip.svg','icons/fly-fly.svg','icons/hotel-fan.svg','icons/cat-food.svg','icons/cat-sightseeing.svg','icons/cat-shopping.svg','icons/cat-hotel.svg','icons/cat-transport.svg','icons/cat-cafe.svg','icons/cat-nature.svg','icons/cat-museum.svg','icons/cat-nightlife.svg','icons/cat-custom.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('tripmate-')&&n!==C).map(n=>caches.delete(n)))));self.clients.claim()});
// stale-while-revalidate：先回快取（秒開），背景更新；只處理 /trip/ 自己的檔案
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
if(u.pathname.indexOf('/__/auth/')>=0||u.pathname.indexOf('/__/firebase/')>=0)return;
const h=u.hostname;
if(h==='accounts.google.com'||h.endsWith('.google.com')||h.endsWith('.googleapis.com')||h.endsWith('.gstatic.com')||h.endsWith('.firebaseapp.com')||h.endsWith('.web.app')||h==='firebaseapp.com')return;
if(r.method!=='GET'||u.origin!==location.origin)return;
if(!u.pathname.startsWith('/trip/'))return;
const key=r.mode==='navigate'?new Request(u.pathname,{}):r;
e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(key);const net=fetch(r).then(res=>{if(res.ok)c.put(key,res.clone());return res}).catch(()=>hit);if(hit){e.waitUntil(net.catch(()=>{}));return hit}return net}))});
self.addEventListener('message',e=>{const d=e.data||{};if(d.type!=='show-note')return;const title=String(d.title||'旅伴').slice(0,80),body=String(d.body||'').slice(0,180),tag=String(d.id||'trip').slice(0,80);self.registration.showNotification(title,{body,tag,icon:'icons/icon-192.png'})});
