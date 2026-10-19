/* 旅伴：從網址內文擷取地點（純函式，可在 Node 測試） */
(function(root, factory){
const api = factory();
if (typeof module === 'object' && module.exports) module.exports = api;
if (root) root.UrlImport = api;
})(typeof window !== 'undefined' ? window : null, function(){
const FOLD = '稲稻沢澤国國広廣駅驛竜龍円圓黒黑売賣渋澀辺邊楽樂条條浅淺観觀仏佛会會発發対對変變桜櫻浜濱麺麵気氣学學体體医醫鉄鐵区區価價画畫図圖関關県縣豊豐湾灣旧舊来來点點塩鹽焼燒寿壽実實宝寶双雙鶏雞緑綠絵繪続續総總声聲礼禮経經縁緣灯燈号號楼樓圧壓処處帰歸帯帶将將状狀浄淨湿濕満滿歩歩斎齋静靜亀龜団團読讀証證内內温溫黄黃臺台';
const VAR = {};
for (let i = 0; i < FOLD.length; i += 2) VAR[FOLD[i]] = FOLD[i + 1];
const fold = s => { let o = ''; for (const c of String(s || '')) o += VAR[c] || c; return o; };
const AKA = {'tokyo-1':['skytree','sky tree','tokyo skytree','天空樹','東京晴空樹'],'tokyo-2':['tokyo tower','tokyotower','東京塔'],'tokyo-11':['disney','disneyland','disney sea','tokyo disney','迪士尼樂園','迪士尼海洋'],'tokyo-12':['harry potter','warner bros','studio tour'],'tokyo-6':['teamlab planets','team lab'],'tokyo-18':['teamlab borderless'],'osaka-0':['universal studios','universal studio japan','usj'],'osaka-6':['harukas','abeno harukas'],'osaka-7':['umeda sky','sky building'],'osaka-8':['kaiyukan','osaka aquarium'],'kyoto-1':['fushimi inari','inari shrine'],'hongkong-1':['victoria peak','the peak','peak tram'],'seoul-7':['namsan','namsan tower','n seoul tower','seoul tower'],'seoul-10':['lotte world tower','seoul sky'],'fukuoka-8':['canal city'],'fukuoka-3':['fukuoka tower'],'singapore-5':['universal studios singapore'],'bangkok-1':['wat pho'],'okinawa-1':['churaumi','美ら海']};
const CITY_EN = [['hong kong','香港'],['tokyo','東京'],['osaka','大阪'],['kyoto','京都'],['fukuoka','福岡'],['okinawa','沖繩'],['seoul','首爾'],['busan','釜山'],['bangkok','曼谷'],['singapore','新加坡'],['sapporo','札幌'],['taipei','台北'],['nagoya','名古屋']];
const CITY_ZH = ['東京','大阪','京都','福岡','沖繩','首爾','釜山','曼谷','香港','新加坡','札幌','名古屋','台北','高雄','吉隆坡','巴黎','倫敦','紐約'];
const LAT_BLOCK = new Set(['tokyo','osaka','kyoto','japan','japanese','hotel','market','temple','shrine','park','tower','city','station','street','museum','center','centre','garden','palace','river']);
const STOP = new Set(['tokyo','osaka','kyoto','japan','japanese','day','days','itinerary','travel','vlog','guide','first','time','the','and','with','from','this','that','your','our','what','how','spend','perfect','ultimate','must','visit','visits','hidden','gems','video','youtube','instagram','morning','airport','arrival','exploring','traveling','travelling','experience','recap','logistics','concluding','anime','crowds','food','culture','tips','lots','iconic','sights','neighborhoods','neighbourhoods','museum','center','centre','city','trip','unforgettable','example','personal','diary','helpful','anyone','planning','wondering','realistically','everything','experienced','wish','knew','before','going','enjoy','content','forget','like','subscribe','helps','share','more','journeys','adventure','quick','introduction','central','local','youth','nightlife','views','eastern','western','northern','southern','departure','inflight','in-flight','flight','areas','into','meal','confirm','watch','sign','please','include','videos','chapters','view','download','subscribed','katie','wake','playback','device','history','recommendations','computer','error','occurred','retrieving','sharing','information','later','shortly','restarting','begin','doesnt','date','dec','likes','comments','sort','top','add','awesome','thank','read','reply','hide','show','about','kawaii','old','town','best','vacation','check','table','where','japans','comment','like','love','great','nice','wow','yes','nope','super','really','very','just','only','also','been','were','was','have','has','had','will','would','could','should','there','here','they','them','your','youre','its','its','full','video','watch','night','life','challenge','maximizing','premier','access','without','overspending','things','always','make','avoid','them','biggest','regrets','dont','these','mistakes','white','house','dancer','refuses','police','orders','window','smashed','tofu','cart','lady','costly','tourist','never','favourite','neighborhood','neighbourhood','drift','cars','ramen','ultimate','step','stepbystep','including','incl','temple','shrine','market','outer','palace','garden','park','station','street','river','hills','inner']);
const SUFFIX = /(?:寺|神社|神宮|宮|公園|市場|美術館|博物館|塔|駅|站|通|橫町|横丁|横町|商店街|離宮|御苑|城|山|島|橋|拉麵|拉面|壽司|寿司|燒肉|烧肉|咖啡|咖啡廳|居酒屋|丼)$/;
const ZH_DAY = {'一':1,'二':2,'兩':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};

function normKey(s){
  return fold(String(s || '').toLowerCase().normalize('NFKC').replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60)).replace(/[\s・·･\-–—（）()[\]'’.,、，。/／&＆+＋]/g, '').replace(/ou/g, 'o').replace(/uu/g, 'u'));
}
function hasCjk(s){ return /[\u3040-\u30ff\u4e00-\u9fff]/.test(s); }
function compactLat(s){ return String(s || '').toLowerCase().normalize('NFKC').replace(/[^a-z0-9]+/g, '').replace(/ou/g, 'o').replace(/uu/g, 'u'); }

function youtubeId(input){
  const s = String(input || '').trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  let u;
  try { u = new URL(/^https?:\/\//i.test(s) ? s : 'https://' + s); }
  catch { return ''; }
  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'youtu.be') {
    const id = u.pathname.split('/').filter(Boolean)[0] || '';
    return /^[\w-]{11}$/.test(id) ? id : '';
  }
  if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com')) {
    const v = u.searchParams.get('v') || '';
    if (/^[\w-]{11}$/.test(v)) return v;
    const m = /\/(?:embed|shorts|live|v)\/([\w-]{11})/.exec(u.pathname);
    return m ? m[1] : '';
  }
  return '';
}
function classifyUrl(raw){
  let s = String(raw || '').trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) {
    if (/^(?:www\.|youtu\.be\/|youtube\.com\/|m\.youtube\.com\/|instagram\.com\/|instagr\.am\/)/i.test(s)) s = 'https://' + s;
    else return null;
  }
  let u;
  try { u = new URL(s); }
  catch { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  const id = youtubeId(u.href);
  if (id && (host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com'))) {
    return { kind: 'youtube', url: 'https://www.youtube.com/watch?v=' + id, id };
  }
  if (host === 'instagram.com' || host.endsWith('.instagram.com') || host === 'instagr.am') {
    return { kind: 'instagram', url: u.href };
  }
  return { kind: 'article', url: u.href };
}

function countSub(text, needle){
  if (!needle) return 0;
  let n = 0, i = 0;
  while ((i = text.indexOf(needle, i)) >= 0) { n++; i += needle.length; }
  return n;
}
function cityHits(text){
  const raw = String(text || '');
  const low = raw.toLowerCase();
  const scored = [];
  for (const name of CITY_ZH) {
    const n = countSub(raw, name);
    if (n) scored.push({ city: name, n });
  }
  for (const [en, zh] of CITY_EN) {
    const re = new RegExp('\\b' + en.replace(/\s+/g, '\\s+') + '\\b', 'gi');
    const n = (low.match(re) || []).length;
    if (!n) continue;
    const prev = scored.find(x => x.city === zh);
    if (prev) prev.n += n;
    else scored.push({ city: zh, n });
  }
  scored.sort((a, b) => b.n - a.n);
  return scored;
}
function guessCity(text){ const h = cityHits(text); return h.length ? h[0].city : ''; }
function guessDays(text, nPlaces){
  const raw = String(text || '');
  let d = 0;
  const m = /(\d{1,2})(?:\s*[-]\s*|\s+(?:\S+\s+){0,3})days?\b/i.exec(raw);
  if (m) d = +m[1];
  const mz = /(?<!第)([一二兩三四五六七八九十]|\d{1,2})\s*天/.exec(raw);
  if (mz) d = Math.max(d, ZH_DAY[mz[1]] || +mz[1] || 0);
  const listed = [...raw.matchAll(/\bday\s*(\d{1,2})\b/gi)].map(x => +x[1]);
  const listedZh = [...raw.matchAll(/第\s*([一二兩三四五六七八九十]|\d{1,2})\s*天/g)].map(x => ZH_DAY[x[1]] || +x[1] || 0);
  if (listed.length || listedZh.length) d = Math.max(d, ...listed, ...listedZh);
  if (d >= 1 && d <= 14) return d;
  const n = nPlaces || 1;
  return Math.max(1, Math.min(7, Math.ceil(n / 4)));
}

function latNeedles(it){
  const out = [];
  const push = s => {
    const c = compactLat(s);
    if (c.length >= 5 && !LAT_BLOCK.has(c)) out.push(c);
  };
  if (it.rom) push(it.rom);
  (AKA[it.id] || []).forEach(push);
  if (it.name && !hasCjk(it.name)) push(it.name);
  if (it.local && !hasCjk(it.local)) push(it.local);
  return [...new Set(out)];
}
function cjkNeedles(it){
  const out = [];
  const push = s => {
    s = fold(String(s || '').normalize('NFKC').trim());
    if (s.length >= 2 && hasCjk(s)) out.push(s);
  };
  push(it.name);
  push(it.local);
  if (it.name) {
    const short = it.name.replace(/（[^）]*）|\([^)]*\)/g, '').replace(/\s*(TOKYO|東京|本店|分店)$/i, '').trim();
    push(short);
    const seg = short.split(/[・·]/)[0].trim();
    if (seg !== short) push(seg);
    const rest = fold(short.normalize('NFKC')).replace(/^(東京|大阪|京都|福岡|首爾|曼谷|香港|新加坡)/, '');
    if (rest.length >= 2 && rest !== fold(short.normalize('NFKC'))) push(rest);
  }
  (AKA[it.id] || []).forEach(push);
  return [...new Set(out)];
}
function coord(it){
  const lat = it.lat != null ? +it.lat : +it.alat;
  const lng = it.lng != null ? +it.lng : +it.alng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return {};
  return { lat, lng };
}

function extractPlaces(text, items){
  const raw = String(text || '').normalize('NFKC');
  const folded = fold(raw);
  const compact = compactLat(raw);
  const spans = [];
  const list = Array.isArray(items) ? items : [];
  for (const it of list) {
    if (!it || !it.name) continue;
    for (const needle of cjkNeedles(it)) {
      let from = 0;
      while (from < folded.length) {
        const i = folded.indexOf(needle, from);
        if (i < 0) break;
        spans.push({ i, j: i + needle.length, it, weak: false, len: needle.length });
        from = i + needle.length;
      }
    }
    const seenLat = new Set();
    for (const needle of latNeedles(it)) {
      if (seenLat.has(needle)) continue;
      let from = 0, hit = false;
      while (from < compact.length) {
        const i = compact.indexOf(needle, from);
        if (i < 0) break;
        hit = true;
        from = i + needle.length;
      }
      if (hit) seenLat.add(needle);
    }
    for (const needle of seenLat) spans.push({ i: -1, j: -1, it, weak: false, len: needle.length + 20, lat: true });
  }
  const weak = [];
  for (const it of list) {
    const name = fold(String(it.name || '').normalize('NFKC'));
    if (!hasCjk(name) || name.length < 3) continue;
    for (let len = 2; len <= 4 && len < name.length; len++) {
      const needle = name.slice(0, len);
      if (!/^[\u3040-\u30ff\u4e00-\u9fff]+$/.test(needle)) continue;
      if (CITY_ZH.includes(needle)) continue;
      let from = 0;
      while (from < folded.length) {
        const i = folded.indexOf(needle, from);
        if (i < 0) break;
        const j = i + len;
        const beforeOk = i === 0 || !/[\u3040-\u30ff\u4e00-\u9fff]/.test(folded[i - 1]);
        const afterOk = j >= folded.length || !/[\u3040-\u30ff\u4e00-\u9fff]/.test(folded[j]);
        if (beforeOk && afterOk) weak.push({ i, j, it, weak: true, len, count: it.count || 0 });
        from = j;
      }
    }
  }
  const strong = spans.filter(s => !s.lat && !s.weak);
  const accepted = [];
  const covered = (s) => accepted.some(u => u.i >= 0 && s.i >= 0 && s.i < u.j && s.j > u.i);
  strong.sort((a, b) => b.len - a.len || a.i - b.i);
  for (const s of strong) { if (!covered(s)) accepted.push(s); }
  const bestWeak = new Map();
  for (const s of weak) {
    const k = s.i + ':' + s.j;
    const prev = bestWeak.get(k);
    if (!prev || s.count > prev.count) bestWeak.set(k, s);
  }
  for (const s of bestWeak.values()) { if (!covered(s)) accepted.push(s); }
  const byId = new Map();
  for (const s of accepted) {
    const id = s.it.id || s.it.name;
    if (!byId.has(id)) byId.set(id, s);
  }
  for (const s of spans.filter(s => s.lat)) {
    const id = s.it.id || s.it.name;
    if (!byId.has(id)) byId.set(id, s);
  }
  const places = [...byId.values()].map(s => {
    const it = s.it;
    const c = coord(it);
    return {
      name: it.name,
      local: it.local || '',
      area: it.area || '',
      type: it.type || '',
      pid: it.id || '',
      city: it.city || '',
      rom: it.rom || '',
      aka: AKA[it.id] || [],
      lat: c.lat,
      lng: c.lng,
      source: 'catalog',
      weak: !!s.weak
    };
  });
  const pending = loosePhrases(raw, accepted.filter(s => s.i >= 0), places);
  return { places: dedupePlaces(places), pending };
}

function cleanPhrase(s){
  let t = String(s || '').replace(/（[^）]*）|\([^)]*\)/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/[#*_`|]/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/^day\s*\d+[^:：]{0,48}[:：]\s*/i, '').trim();
  t = t.replace(/[，,].*$/, '').trim();
  t = t.replace(/^(?:lots of|iconic|what we|this vlog|whether|if you|feel free)\b.*$/i, '').trim();
  return t;
}
function isStopPhrase(s){
  const n = s.toLowerCase().replace(/[.。!！?？:：]+$/g, '').trim();
  if (!n || STOP.has(n) || STOP.has(n.replace(/\s+/g, ''))) return true;
  const words = n.split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  if (words.every(w => STOP.has(w.replace(/[^a-z0-9\u4e00-\u9fff]/gi, '')) || w.length < 3)) return true;
  if (CITY_ZH.includes(s) || CITY_EN.some(([en]) => en === n)) return true;
  return false;
}
function loosePhrases(text, spans, places){
  const taken = new Set();
  const takenLat = [];
  for (const p of places || []) {
    taken.add(normKey(p.name));
    if (p.local) taken.add(normKey(p.local));
    for (const s of [p.name, p.local, p.rom].concat(p.aka || [])) {
      const c = compactLat(s);
      if (c.length >= 4) takenLat.push(c);
    }
  }
  const inside = (i) => spans.some(s => s.i >= 0 && i >= s.i && i < s.j);
  const out = [];
  const push = (s) => {
    s = cleanPhrase(s);
    if (!s) return;
    if (/\s+and\s+/i.test(s)) { s.split(/\s+and\s+/i).forEach(push); return; }
    if (s.length < 2 || s.length > 42) return;
    if (!hasCjk(s) && !/\s/.test(s) && s.length < 5) return;
    if (isStopPhrase(s)) return;
    if (/\b(vlog|subscribe|playlist|community|youtube|channel|views|itinerary)\b/i.test(s) && !hasCjk(s)) return;
    if (/[a-z][A-Z]/.test(s)) return;
    const key = normKey(s);
    if (taken.has(key)) return;
    if (places.some(p => { const n = normKey(p.name); return key.length >= 2 && (n.includes(key) || key.includes(n) || (p.local && normKey(p.local).includes(key))); })) return;
    const ck = compactLat(s);
    if (ck.length >= 4 && takenLat.some(t => t === ck || (ck.length >= 5 && t.includes(ck)) || (t.length >= 5 && ck.includes(t)))) return;
    if (out.some(x => x.length > s.length && x.toLowerCase().includes(s.toLowerCase()))) return;
    if (!out.some(x => normKey(x) === key)) out.push(s);
  };
  for (const m of text.matchAll(/(?:^|\n)\s*(?:[-*•・]|\d+[.)])\s+([^\n]{2,80})/g)) push(m[1]);
  for (const m of text.matchAll(/[•・]\s*([^•・\n]{2,60})/g)) push(m[1]);
  for (const m of text.matchAll(/[「『"“]([^」』"”\n]{2,40})[」』"”]/g)) push(m[1]);
  for (const m of text.matchAll(/\b[\p{Lu}][\p{L}\p{M}'’-]{2,}(?:[ \t]+(?:of|the|and|in|at|&)[ \t]+[\p{Lu}][\p{L}\p{M}'’-]{1,}|[ \t]+[\p{Lu}][\p{L}\p{M}'’-]{2,}){0,4}/gu)) push(m[0]);
  for (const m of text.matchAll(/\b[\p{Lu}][\p{L}\p{M}]{4,}\b/gu)) push(m[0]);
  for (const line of text.split(/\n/)) {
    const w = line.trim();
    if (/^[\u3040-\u30ff\u4e00-\u9fff・\s]{2,16}$/.test(w)) push(w);
  }
  for (const m of text.matchAll(/[\u3040-\u30ff\u4e00-\u9fff]{2,12}/g)) {
    if (inside(m.index)) continue;
    if (!SUFFIX.test(m[0])) continue;
    if (spans.some(s => s.i >= 0 && s.j - s.i >= 2 && s.i >= m.index && s.j <= m.index + m[0].length)) continue;
    push(m[0]);
  }
  return out.slice(0, 16);
}

function dedupePlaces(list){
  const out = [];
  const better = (a, b) => {
    const sa = (a.source === 'catalog' ? 5 : a.source === 'geo' ? 3 : 1) + (Number.isFinite(+a.lat) ? 2 : 0);
    const sb = (b.source === 'catalog' ? 5 : b.source === 'geo' ? 3 : 1) + (Number.isFinite(+b.lat) ? 2 : 0);
    return sa > sb;
  };
  for (const p of list || []) {
    if (!p || !p.name) continue;
    const key = normKey(p.name);
    const dup = out.find(o => {
      if (p.pid && o.pid && p.pid === o.pid) return true;
      const ok = normKey(o.name);
      if (ok === key) return true;
      if (ok.length >= 4 && key.length >= 4 && (ok.includes(key) || key.includes(ok))) return true;
      if (Number.isFinite(+o.lat) && Number.isFinite(+p.lat) && Math.abs(+o.lat - +p.lat) < 0.0004 && Math.abs(+o.lng - +p.lng) < 0.0004) return true;
      return false;
    });
    if (!dup) out.push({ ...p });
    else if (better(p, dup)) {
      const name = dup.source === 'catalog' ? dup.name : p.name;
      Object.assign(dup, p, { name: p.source === 'catalog' ? p.name : name });
    }
  }
  return out;
}

function km(a, b){
  const R = 6371, p = Math.PI / 180;
  const dla = (b.lat - a.lat) * p, dlo = (b.lng - a.lng) * p;
  const s = Math.sin(dla / 2) ** 2 + Math.cos(a.lat * p) * Math.cos(b.lat * p) * Math.sin(dlo / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
function splitDays(places, dayCount){
  const src = (places || []).filter(p => p && p.name);
  let n = Math.max(1, Math.min(14, dayCount | 0 || 1));
  if (!src.length) return [];
  n = Math.min(n, src.length);
  const geo = src.filter(p => Number.isFinite(+p.lat) && Number.isFinite(+p.lng)).map(p => ({ ...p, lat: +p.lat, lng: +p.lng }));
  const rest = src.filter(p => !Number.isFinite(+p.lat) || !Number.isFinite(+p.lng));
  const buckets = Array.from({ length: n }, () => []);
  if (!geo.length) {
    src.forEach((p, i) => buckets[Math.min(n - 1, Math.floor(i * n / src.length))].push(p));
    return buckets;
  }
  const used = new Array(geo.length).fill(false);
  used[0] = true;
  const tour = [geo[0]];
  while (tour.length < geo.length) {
    const cur = tour[tour.length - 1];
    let bi = -1, bd = 1e12;
    for (let i = 0; i < geo.length; i++) {
      if (used[i]) continue;
      const d = km(cur, geo[i]);
      if (d < bd) { bd = d; bi = i; }
    }
    used[bi] = true;
    tour.push(geo[bi]);
  }
  const size = tour.length / n;
  tour.forEach((p, i) => buckets[Math.min(n - 1, Math.floor(i / size))].push(p));
  rest.forEach((p, i) => buckets[i % n].push(p));
  return buckets;
}

function captionsText(xml){
  const raw = String(xml || '');
  if (raw.length < 20 || !/<(?:text|p)\b/i.test(raw)) return '';
  const parts = [];
  const re = /<(?:text|p)\b[^>]*>([\s\S]*?)<\/(?:text|p)>/gi;
  let m;
  while ((m = re.exec(raw))) {
    const t = m[1].replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
    if (t) parts.push(t);
  }
  const text = parts.join(' ').trim();
  return text.length >= 40 ? text : '';
}
function clipYoutube(md, id){
  const raw = String(md || '');
  const title = (/^Title:\s*(.+)$/m.exec(raw) || [])[1] || '';
  const chrome = /^(?:back|search|search with your voice|video \d+|copy(?: link)?|info|shopping|share(?: link)?|live|cancel confirm|youtube home|include playlist|tap to unmute|skip navigation|sign in|show more|watch later|save|report|transcript|comments?|description|subscribe|like|dislike|views?|home|shorts|you|more|na+n(?:\s*\/\s*na+n)?)$/i;
  const kept = [];
  let skipShort = false;
  for (const line of raw.split(/\n/)) {
    if (/^#{1,3}\s*\[@/.test(line) || /youtube\.com\/@/.test(line)) { skipShort = true; continue; }
    if (id) {
      const ids = [...line.matchAll(/[?&]v=([\w-]{11})/g)].map(m => m[1]);
      if (ids.some(x => x !== id)) { skipShort = true; continue; }
    }
    let t = line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/[#>*_`|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!t || t.length < 3) continue;
    if (/^(?:Title|URL Source|Warning|Markdown Content|Published Time):/.test(t)) continue;
    if (/^\d{1,2}:\d{2}(?:\s*\/\s*\d{1,2}:\d{2})?$/.test(t)) continue;
    t = t.replace(/^[•・\-]+\s*/, '').replace(/\s+/g, ' ').trim();
    t = t.replace(/(?:…|\.{2,})\s*more\b/ig, ' ').replace(/\bshow less\b/ig, ' ').replace(/\s+/g, ' ').trim();
    if (skipShort && t.length < 160) continue;
    skipShort = false;
    if (/skip navigation|tap to unmute|you'?re signed out|show transcript|follow along using the transcript|this helps protect our community|target url returned error|playback doesn'?t begin|videos you watch|sign in to confirm|include playlist|error occurred while retrieving|^subscribers?$|^\d[\d,.]*k? views|wake up with |^show less$|^chapters$|^view all$|^watch full video$/i.test(t)) continue;
    if (chrome.test(t)) continue;
    if (/^(?:image|video) \d+$/i.test(t)) continue;
    if (kept[kept.length - 1] === t) continue;
    kept.push(t);
  }
  return (title ? title + '\n' : '') + kept.join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 14000);
}
function clipArticle(md){
  const raw = String(md || '');
  const title = (/^Title:\s*(.+)$/m.exec(raw) || [])[1] || '';
  const body = raw
    .replace(/^Title:.*$/m, '')
    .replace(/^(?:URL Source|Warning|Published Time|Markdown Content):.*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '');
  return (title + '\n' + body).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 14000);
}
function readerFailed(text){
  const t = String(text || '').trim();
  if (t.length < 40) return true;
  if (/just a moment|access denied|please log in|log in • instagram|login • instagram/i.test(t) && t.length < 1800) return true;
  if (/instagram/i.test(t) && /log in|sign up|isn'?t available|captcha|not available/i.test(t)) return true;
  return false;
}

return { classifyUrl, youtubeId, guessCity, cityHits, guessDays, extractPlaces, dedupePlaces, splitDays, captionsText, clipYoutube, clipArticle, readerFailed, normKey, km };
});
