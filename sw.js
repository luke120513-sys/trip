const C='tripmate-v11',A=['./','index.html','manifest.json','icons/icon.svg','icons/icon-192.png','icons/ui-spot.svg','icons/ui-fly.svg','icons/ui-hotel.svg','icons/ui-suitcase.svg','icons/coffee-trip.svg','icons/share-trip.svg','icons/fly-fly.svg','icons/hotel-fan.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('tripmate-')&&n!==C).map(n=>caches.delete(n)))));self.clients.claim()});
// stale-while-revalidate：先回快取（秒開），背景更新；只處理 /trip/ 自己的檔案與 /flysave/deals.json（唯讀共用資料）
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin)return;
const own=u.pathname.startsWith('/trip/'),deals=u.pathname==='/flysave/deals.json';if(!own&&!deals)return;
const key=own&&r.mode==='navigate'?new Request(u.pathname,{}):(deals?new Request(u.pathname):r);
e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(key);const net=fetch(r).then(res=>{if(res.ok)c.put(key,res.clone());return res}).catch(()=>hit);if(hit){e.waitUntil(net.catch(()=>{}));return hit}return net}))});
