/* 旅伴 一鍵排行程（延遲載入） */
(function(){
const KEY={東京:'tokyo',大阪:'osaka',京都:'kyoto',福岡:'fukuoka',沖繩:'okinawa',首爾:'seoul',釜山:'busan',曼谷:'bangkok',NRT:'tokyo',HND:'tokyo',KIX:'osaka',ITM:'osaka',FUK:'fukuoka',OKA:'okinawa',ICN:'seoul',GMP:'seoul',PUS:'busan',BKK:'bangkok',DMK:'bangkok',香港:'hongkong',HKG:'hongkong',新加坡:'singapore',SIN:'singapore'};
const cache={};
const FX={JPY:.21,KRW:.023,THB:.95};
async function load(k){if(cache[k])return cache[k];const r=await fetch('data/'+k+'.json');if(!r.ok)throw 0;const d=await r.json();d.items=(d.items||[]).filter(i=>!i.closed);return cache[k]=d}
const LA=x=>x.lat??x.alat,LN=x=>x.lng??x.alng;const dist=(a,b)=>a.area&&a.area===b.area?Math.min(1,LA(a)!=null&&LA(b)!=null?Math.hypot(LA(a)-LA(b),(LN(a)-LN(b))*Math.cos(LA(a)*Math.PI/180))*111:1):LA(a)!=null&&LA(b)!=null?Math.hypot(LA(a)-LA(b),(LN(a)-LN(b))*Math.cos(LA(a)*Math.PI/180))*111:8;
const SLOT={早:0,午:1,下午:2,晚:3};
const hm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.round(m%60/5)*5%60).padStart(2,'0');
const toMin=s=>{const m=/^(\d\d?):(\d\d)/.exec(s||'');return m?+m[1]*60+ +m[2]:null};
const gmap=it=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(it.lat!=null?it.lat+','+it.lng:it.local+' '+(it.area||''));
function toSpot(it,time,d){return{time:hm(time),name:it.name,note:[it.area,it.note].filter(Boolean).join(' · '),kind:'auto',ptype:it.type,pid:it.id,meal:it.meal,link:gmap(it),rating:it.rating,priceInfo:it.price,summary:it.summary,src:it.src,count:it.count,checked:d.checked,lat:it.lat,lng:it.lng,alat:it.alat,alng:it.alng,area:it.area}}
function windowOf(day,isFirst,isLast){let s=9*60,e=21*60+30;const fl=day.filter(x=>x.kind==='flight'&&toMin(x.time)!=null);
 const out=fl.filter(x=>x.leg!=='return'),ret=fl.filter(x=>x.leg==='return');if(isFirst){const f=out[0];if(f){const arr=toMin(f.arr)??toMin((f.note||'').match(/抵達 (\d\d?:\d\d)/)?.[1])??toMin(f.time)+180;s=Math.max(s,arr+90)}else if(!ret.length)s=13*60}
 if(isLast){const f=ret[ret.length-1]||(!isFirst&&fl[fl.length-1]);if(f)e=Math.min(e,toMin(f.time)-180);else if(!fl.length)e=15*60}
 return[s,e]}
function plan(t,d,opt){const cap={輕鬆:2,標準:3,緊湊:4}[opt.pace]||3;const want=new Set(opt.interests);
 const used=new Set(t.days.flat().map(s=>s.pid||s.name));const its=d.items.filter(i=>!used.has(i.id)&&!used.has(i.name));
 const POI=its.filter(i=>i.type!=='餐廳'&&(want.has(i.type)||(i.type==='景點'&&want.size===0))&&i.dur<400&&i.note!=='近郊'||false).sort((a,b)=>b.count-a.count);
 const near=its.filter(i=>i.note==='近郊'&&want.has(i.type)).sort((a,b)=>b.count-a.count);
 const R=its.filter(i=>i.type==='餐廳').sort((a,b)=>b.count-a.count);const take=new Set();
 const n=t.days.length,out=[];
 for(let di=0;di<n;di++){const day=t.days[di].filter(s=>s.kind!=='auto');const[ws,we]=windowOf(day,di===0,di===n-1);let hours=(we-ws)/60;
  let c=Math.max(0,Math.min(cap+(hours>=10&&cap>2?1:0),Math.floor(hours/2.3)));const pick=[];
  if(c>=3&&n>=4&&near.length&&di===Math.floor(n/2)){const z=near.find(i=>!take.has(i.id));if(z){pick.push(z);take.add(z.id);c=1}}
  const pool=POI.filter(i=>!take.has(i.id));
  if(pick.length===0&&c>0&&pool.length){const seed=pool[0];pick.push(seed);take.add(seed.id);
   while(pick.length<c){const cand=POI.filter(i=>!take.has(i.id));if(!cand.length)break;const nx=cand.reduce((m,i)=>dist(i,seed)-i.count*.8<dist(m,seed)-m.count*.8?i:m);
    if(dist(nx,seed)>15&&pick.length>=2)break;pick.push(nx);take.add(nx.id)}}
  pick.sort((a,b)=>SLOT[a.slot]-SLOT[b.slot]);
  const sp=[];let cur=ws,pos=pick[0]||null;const center=pick[0];let lunch=false,dinner=false;
  const ms=(r,ref)=>dist(r,ref)+(LA(r)==null||LA(ref)==null?3:0)-Math.min(r.count,4)*.35;
  const meal=(m,ref)=>{const c=R.filter(r=>!take.has(r.id)&&r.meal===m);if(!c.length)return null;const best=c.reduce((x,r)=>ms(r,ref)<ms(x,ref)?r:x);take.add(best.id);return best};
  const fill=(until,ref)=>{while(until-cur>=90){const room=until-cur-30;const c=its.filter(i=>!take.has(i.id)&&i.note!=='近郊'&&i.dur<=room&&i.slot!=='晚'&&(i.type==='餐廳'?i.meal==='點心':(want.has(i.type)||i.type==='景點'||i.type==='購物'))&&dist(i,ref)<=6);
    if(!c.length)break;const b=c.reduce((x,i)=>dist(i,ref)-i.count*.5<dist(x,ref)-x.count*.5?i:x);take.add(b.id);sp.push(toSpot(b,cur,d));cur+=b.dur+30;ref=b}return ref};
  const eat=(m,t0)=>{const r=meal(m,pos||center);if(r){const t=Math.max(cur,t0);sp.push(toSpot(r,t,d));cur=t+r.dur+20;pos=r}};
  for(const p of pick){let st=p.slot==='晚'?Math.max(cur,16*60):cur;
   if(!lunch&&ws<13*60&&cur<=14*60&&(cur>=11*60||st+Math.min(p.dur,120)>12*60+30)){eat('午',11*60+30);lunch=true}
   if(!dinner&&(p.slot==='晚'&&cur>=16*60+30||cur>=17*60+30)&&cur<we){eat('晚',cur);dinner=true}
   st=p.slot==='晚'?Math.max(cur,16*60):cur;if(st-cur>=90)pos=fill(st,pos||p);cur=Math.max(cur,st);
   if(cur+p.dur>we+30)continue;sp.push(toSpot(p,cur,d));cur+=p.dur+30;pos=p}
  if(center&&!lunch&&ws<=12*60&&cur<=14*60&&we>=cur+60){eat('午',11*60+30);lunch=true}
  if(center&&we-cur>=150&&cur<17*60)pos=fill(Math.min(we,17*60+30),pos);
  if(center&&!dinner&&we>=19*60&&cur<=20*60){eat('晚',18*60);dinner=true}
  if(!center&&hours>=2){eat(we>=19*60?'晚':'午',we>=19*60?Math.max(ws,18*60+30):Math.max(ws,12*60))}
  out.push(sp)}
 return out}
function swap(t,d,i,j){const s=t.days[i][j];const used=new Set(t.days.flat().map(x=>x.pid));const c=d.items.filter(it=>!used.has(it.id)&&it.type===s.ptype&&(s.ptype!=='餐廳'||it.meal===s.meal||(!it.meal)));
 if(!c.length)return false;const best=c.reduce((x,it)=>dist(it,s)-it.count*1.5<dist(x,s)-x.count*1.5?it:x);const n=toSpot(best,toMin(s.time)??540,d);t.days[i][j]=n;return true}
const norm=x=>(x||'').toLowerCase().normalize('NFKC').replace(/[\s・·\-–（）()'’.,、]/g,'').replace(/ou/g,'o').replace(/uu/g,'u');
function match(d,q){q=norm(q);if(!q)return[];const sc=it=>{let b=0;for(const f of[it.name,it.local,it.rom,it.area&&it.name]){const n=norm(f);if(!n)continue;if(n===q)b=Math.max(b,100);else if(n.startsWith(q))b=Math.max(b,80);else if(n.includes(q))b=Math.max(b,60);else{let k=0;for(const c of n)if(c===q[k])k++;if(k===q.length&&q.length>=2)b=Math.max(b,30)}}return b?b+it.count:0};
 return d.items.map(it=>[sc(it),it]).filter(x=>x[0]).sort((a,b)=>b[0]-a[0]).slice(0,6).map(x=>x[1])}
function best(d,q){const n=norm(q);if(n.length<2)return null;let b=null,bs=0;for(const it of d.items)for(const f of[it.name,it.local,it.rom]){const m=norm(f);if(!m)continue;const s=m===n?100:((m.startsWith(n)&&n.length/m.length>=.5)||(n.startsWith(m)&&m.length>=2))?80:((m.includes(n)&&n.length/m.length>=.5&&n.length>=2)||(n.includes(m)&&m.length>=3))?60:0;if(s>bs){bs=s;b=it}}return bs>=60?b:null}
window.Planner={KEY,load,plan,swap,FX,match,toSpot,gmap,best};
})();
