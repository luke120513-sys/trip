/* 美食：城市搜尋、照片、篩選、日記。純函式可在測試裡用。 */
const FOOD_KINDS = [
  { id: 'ramen', label: '拉麵', test: /ramen|拉麵|ラーメン/i },
  { id: 'sushi', label: '壽司', test: /sushi|壽司|寿司/i },
  { id: 'yakiniku', label: '燒肉', test: /yakiniku|barbecue|korean_barbecue|bbq|燒肉|焼肉/i },
  { id: 'izakaya', label: '居酒屋', test: /izakaya|居酒屋/i },
  { id: 'coffee', label: '咖啡', test: /coffee|cafe|咖啡|珈琲/i },
  { id: 'dessert', label: '甜點', test: /dessert|ice_cream|cake|pastry|甜點|甜品/i },
  { id: 'snack', label: '小吃', test: /street_food|snack|fried|小吃|夜市/i },
  { id: 'veg', label: '素食', test: /vegetarian|vegan|素食|蔬食/i },
  { id: 'noodle', label: '麵食', test: /noodle|soba|udon|pasta|麵|蕎麥|烏龍/i },
  { id: 'hotpot', label: '火鍋', test: /hot_?pot|shabu|sukiyaki|火鍋/i },
  { id: 'seafood', label: '海鮮', test: /seafood|海鮮/i },
  { id: 'chinese', label: '中餐', test: /chinese|中華|中餐/i },
  { id: 'korean', label: '韓餐', test: /korean|韓餐|韓國/i },
  { id: 'thai', label: '泰餐', test: /thai|泰餐|泰國/i },
  { id: 'italian', label: '義式', test: /italian|pizza|義大利|披薩/i },
  { id: 'curry', label: '咖哩', test: /curry|咖哩/i }
];
const FOOD_PK = { 東京: 'tokyo', 大阪: 'osaka', 京都: 'kyoto', 福岡: 'fukuoka', 沖繩: 'okinawa', 首爾: 'seoul', 釜山: 'busan', 曼谷: 'bangkok', 香港: 'hongkong', 新加坡: 'singapore' };

function placeKey(name, lat, lng) {
  const s = String(name || '').trim().toLowerCase() + '|' + Number(lat || 0).toFixed(3) + '|' + Number(lng || 0).toFixed(3);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
function localsStars(score) {
  const s = +score || 0;
  if (s >= 9) return 5;
  if (s >= 7) return 4.5;
  if (s >= 5) return 4;
  if (s >= 3) return 3.5;
  if (s >= 1) return 3;
  if (s >= -1) return 2.5;
  return 2;
}
function starText(n) {
  const v = Math.max(0, Math.min(5, Math.round((+n || 0) * 2) / 2));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)));
}
function parsePriceLevel(src) {
  const tags = src || {};
  const bag = [tags.price_level, tags['price:level'], tags.price, tags.charge, tags.fee, tags.cost, tags.cuisine && ''].filter(Boolean).join(' ');
  const dollars = bag.match(/＄|\$/g);
  if (dollars && dollars.length) return Math.min(4, dollars.length);
  const raw = String(tags.price_level || tags['price:level'] || '');
  if (/^[1-4]$/.test(raw.trim())) return +raw;
  if (/cheap|inexpensive|budget|低價|平價/i.test(bag)) return 1;
  if (/moderate|中價/i.test(bag)) return 2;
  if (/expensive|pricey|高價/i.test(bag)) return 3;
  if (/luxury|very_expensive|奢華/i.test(bag)) return 4;
  return 0;
}
function priceMarks(n) { return n > 0 ? '＄'.repeat(n) : ''; }
function kindBlob(p) { return [p && p.cuisine, p && p.name, p && p.amenity, p && p.diet].filter(Boolean).join(' '); }
function matchKind(p, id) {
  const k = FOOD_KINDS.find(x => x.id === id);
  return !!(k && k.test.test(kindBlob(p)));
}
function applyFoodFilter(list, flt, mate) {
  flt = flt || {};
  const kinds = Array.isArray(flt.kinds) ? flt.kinds : [];
  const out = (list || []).filter(p => {
    if (kinds.length && !kinds.some(id => matchKind(p, id))) return false;
    const price = +p.priceLevel || 0;
    if (+flt.price > 0) {
      if (!price) { if (flt.unkPrice === false) return false; }
      else if (price !== +flt.price) return false;
    }
    if (+flt.minLocal > 0 && localsStars(p.score) < +flt.minLocal) return false;
    const avg = mate && mate[p.placeKey] && mate[p.placeKey].avg;
    if (+flt.minMate > 0) {
      if (!avg) { if (flt.unkMate === false) return false; }
      else if (avg < +flt.minMate) return false;
    }
    return true;
  }).map(p => Object.assign({}, p));
  const sort = flt.sort || 'local';
  out.sort((a, b) => {
    if (sort === 'dist') return (a.km == null ? 99 : a.km) - (b.km == null ? 99 : b.km);
    if (sort === 'price') return ((a.priceLevel || 9) - (b.priceLevel || 9)) || (b.score - a.score);
    if (sort === 'mate') {
      const aa = mate && mate[a.placeKey] ? mate[a.placeKey].avg : -1;
      const bb = mate && mate[b.placeKey] ? mate[b.placeKey].avg : -1;
      return bb - aa || b.score - a.score;
    }
    const ma = mate && mate[a.placeKey] ? mate[a.placeKey].avg : 0;
    const mb = mate && mate[b.placeKey] ? mate[b.placeKey].avg : 0;
    return (b.score + mb) - (a.score + ma) || ((a.km == null ? 99 : a.km) - (b.km == null ? 99 : b.km));
  });
  return out.slice(0, 16);
}
function canAddDiary(list, key, date) {
  return !(list || []).some(x => x && x.placeKey === key && x.date === date);
}
function artKind(cui) {
  const s = String(cui || '');
  if (/ramen|noodle|拉麵|麵/i.test(s)) return 'ramen';
  if (/sushi|壽司/i.test(s)) return 'sushi';
  if (/coffee|cafe|咖啡/i.test(s)) return 'cafe';
  if (/dessert|cake|甜/i.test(s)) return 'sweet';
  return 'generic';
}
function foodArt(kind) {
  const bg = { ramen: '#F4D7B0', sushi: '#F7E7C6', cafe: '#E7D3C0', sweet: '#F6D5DE', generic: '#E7E0D4' }[kind] || '#E7E0D4';
  const fg = '#8A5A44';
  let shape = '<circle cx="50" cy="48" r="18" fill="none" stroke="' + fg + '" stroke-width="3"/>';
  if (kind === 'ramen') shape = '<rect x="18" y="30" width="64" height="34" rx="8" fill="none" stroke="' + fg + '" stroke-width="3"/><path d="M28 42c6 6 10 6 16 0M48 42c6 6 10 6 16 0" fill="none" stroke="' + fg + '" stroke-width="3"/>';
  else if (kind === 'sushi') shape = '<rect x="16" y="40" width="68" height="16" rx="8" fill="none" stroke="' + fg + '" stroke-width="3"/><circle cx="34" cy="48" r="3" fill="' + fg + '"/><circle cx="50" cy="48" r="3" fill="' + fg + '"/><circle cx="66" cy="48" r="3" fill="' + fg + '"/>';
  else if (kind === 'cafe') shape = '<path d="M28 36h34v20a10 10 0 0 1-10 10H38a10 10 0 0 1-10-10z" fill="none" stroke="' + fg + '" stroke-width="3"/><path d="M62 42h8a7 7 0 0 1 0 14h-8" fill="none" stroke="' + fg + '" stroke-width="3"/>';
  else if (kind === 'sweet') shape = '<path d="M50 28c8 8 16 10 16 22a16 16 0 0 1-32 0c0-12 8-14 16-22z" fill="none" stroke="' + fg + '" stroke-width="3"/>';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="' + bg + '"/>' + shape + '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

let foodPlace = null, foodSug = [], foodSugTok = 0, foodSugTimer = 0, foodFlt = null, FOOD_RAW = [], FOOD_VIEW = [], MATE = {}, diaryDraft = null, diaryStars = 0, foodTok = 0;

function foodFilter() {
  if (foodFlt) return foodFlt;
  const d = { kinds: [], price: 0, unkPrice: true, minLocal: 0, minMate: 0, unkMate: true, sort: 'local' };
  try {
    const s = TM.ls.get('foodflt', null);
    if (s && typeof s === 'object') {
      d.kinds = Array.isArray(s.kinds) ? s.kinds.filter(id => FOOD_KINDS.some(k => k.id === id)) : [];
      d.price = +s.price || 0;
      d.unkPrice = s.unkPrice !== false;
      d.minLocal = +s.minLocal || 0;
      d.minMate = +s.minMate || 0;
      d.unkMate = s.unkMate !== false;
      if (['local', 'dist', 'price', 'mate'].indexOf(s.sort) >= 0) d.sort = s.sort;
    }
  } catch (e) {}
  foodFlt = d;
  return d;
}
function saveFoodFilter() { try { TM.ls.set('foodflt', foodFlt); } catch (e) {} }
function diaryList() { try { return TM.ls.get('fooddiary', []) || []; } catch (e) { return []; } }
function saveDiary(list) { TM.ls.set('fooddiary', list.slice(0, 40)); }
function myStars(key) {
  const rows = diaryList().filter(x => x.placeKey === key);
  return rows.length ? +rows[rows.length - 1].stars || 0 : 0;
}
function foodPackKey(place) {
  if (!place) return '';
  const t = TM.T();
  const name = (TM.cityOf && TM.cityOf(place.name)) || place.name;
  if (t && (name === (TM.cityOf && TM.cityOf(t.dest)) || name === t.dest || place.name === t.dest)) {
    const k = TM.PKEY && TM.PKEY(t);
    if (k) return k;
  }
  return FOOD_PK[name] || FOOD_PK[place.name] || '';
}
function foodFltLabel() {
  const f = foodFilter();
  const bits = [];
  if (f.kinds.length) bits.push(f.kinds.map(id => (FOOD_KINDS.find(k => k.id === id) || {}).label).filter(Boolean).join('、'));
  if (f.price) bits.push(priceMarks(f.price) + (f.unkPrice ? '（含未標價）' : ''));
  if (f.minLocal) bits.push('在地人推薦度 ≥ ' + f.minLocal);
  if (f.minMate) bits.push('旅伴評分 ≥ ' + f.minMate);
  return bits.length ? '篩選：' + bits.join(' · ') : '未篩選';
}
function foodSortBar() {
  const f = foodFilter();
  const items = [['local', '在地推薦'], ['dist', '距離'], ['price', '價格'], ['mate', '旅伴評分']];
  return '<button type="button" class="btn ghost sm" onclick="foodFilterSheet()">篩選</button>' + items.map(([k, n]) => `<button type="button" class="chip${f.sort === k ? ' on' : ''}" onclick="foodSetSort('${k}')">${n}</button>`).join('');
}
function foodChips() {
  const t = TM.T();
  const cur = t ? ((TM.cityOf && TM.cityOf(t.dest)) || t.dest) : '';
  const keys = typeof CITY_LL === 'object' ? Object.keys(CITY_LL) : [];
  let html = '<button type="button" class="chip" onclick="foodHere()">我的位置</button>';
  if (cur) html += `<button type="button" class="chip${foodPlace && foodPlace.name === cur ? ' on' : ''}" onclick="foodChip(this.dataset.n)" data-n="${TM.esc(cur)}">${TM.esc(cur)}</button>`;
  keys.forEach(k => { if (k === cur) return; html += `<button type="button" class="chip${foodPlace && foodPlace.name === k ? ' on' : ''}" onclick="foodChip(this.dataset.n)" data-n="${TM.esc(k)}">${TM.esc(k)}</button>`; });
  return '<div class="fscroll">' + html + '</div>';
}
function extraFood() {
  const name = foodPlace && foodPlace.name || (TM.T() ? ((TM.cityOf && TM.cityOf(TM.T().dest)) || TM.T().dest) : '');
  const hint = foodPlace && foodPlace.hint && foodPlace.hint !== name ? '（' + foodPlace.hint + '）' : '';
  return `<h2 id="foodtitle">${name ? TM.esc(name + hint) + ' 美食' : '美食'}</h2>
<div class="caveat">在地人推薦度是依開放街圖標籤粗估的，不是 Google 評分。旅伴評分是大家在美食日記留下的星星，也不是 Google。店家可能缺漏或已歇業。</div>
<label class="fld">城市，或貼上餐廳網址<input id="foodq" autocomplete="off" placeholder="例如：大阪，或 Google 地圖、食べログ連結" oninput="foodType()" value="${TM.esc(name)}"></label>
<div id="foodsug"></div>
<div class="dh"><h2 style="font-size:16px;margin:0">收藏的店</h2></div>
<div id="foodfavs"></div>
${foodChips()}
<div class="row" id="foodsort">${foodSortBar()}</div>
<p class="mut" id="foodfltlbl">${TM.esc(foodFltLabel())}</p>
<h2 style="font-size:16px">在地人通常吃什麼</h2><div id="foodlocal">正在整理這個地方的吃法…</div>
<div class="dh" style="margin-top:8px"><h2 style="font-size:16px;margin:0">附近的店</h2><button type="button" class="btn ghost sm noprint" onclick="reloadFood()">重新整理</button></div>
<div id="foodosm" class="card mut">正在尋找附近的店…</div>
<div class="dh"><h2 style="font-size:16px;margin:0">美食日記</h2><button type="button" class="btn sm" onclick="openDiary(-1)">＋ 記下今天吃的</button></div>
<div id="fooddiary"></div>`;
}
function setFoodPlace(p) {
  foodPlace = p;
  if (p && p.user) { try { TM.ls.set('foodplace', { name: p.name, lat: p.lat, lng: p.lng, user: true }); } catch (e) {} }
  const h = $('#foodtitle');
  if (h && p) h.textContent = p.name + (p.hint && p.hint !== p.name ? '（' + p.hint + '）' : '') + ' 美食';
  const q = $('#foodq');
  if (q && p && document.activeElement !== q) q.value = p.name;
  paintFood(true);
}
async function ensureFoodPlace() {
  const t = TM.T();
  if (foodPlace && foodPlace.user && Number.isFinite(+foodPlace.lat)) return foodPlace;
  if (!t) {
    if (foodPlace && Number.isFinite(+foodPlace.lat)) return foodPlace;
    try { foodPlace = TM.ls.get('foodplace', null); } catch (e) { foodPlace = null; }
    if (foodPlace && Number.isFinite(+foodPlace.lat)) return foodPlace;
    return null;
  }
  const name = (TM.cityOf && TM.cityOf(t.dest)) || t.dest;
  if (foodPlace && !foodPlace.user && foodPlace.name === name && Number.isFinite(+foodPlace.lat)) return foodPlace;
  const b = typeof cityBias === 'function' ? cityBias(name) : null;
  if (b) { foodPlace = { name, lat: b.lat, lng: b.lng, user: false }; return foodPlace; }
  try {
    if (typeof geoFind === 'function') {
      const g = await geoFind(name);
      if (g) { foodPlace = { name: g.name || name, lat: +g.latitude, lng: +g.longitude, user: false }; return foodPlace; }
    }
  } catch (e) {}
  return null;
}
let foodUrlSpot = null;
function foodType() { const q = $('#foodq') && $('#foodq').value.trim(); const tok = ++foodSugTok; clearTimeout(foodSugTimer); const box = $('#foodsug'); if (!q || q.length < 2) { if (box) box.innerHTML = ''; return; } if (window.PlaceUrl && PlaceUrl.isUrl(q)) { if (!PlaceUrl.ready(q)) { if (box) box.innerHTML = '<div class="mut">貼上完整的店家網址，會直接帶出這一間。</div>'; return; } if (box) box.innerHTML = '<div class="mut">正在讀這個網址…</div>'; foodSugTimer = setTimeout(() => runFoodUrl(q, tok), 280); return; } foodSugTimer = setTimeout(() => runFoodSug(q, tok), 280); }
async function runFoodUrl(q, tok) {
  const box = $('#foodsug');
  let res;
  try { res = await PlaceUrl.resolve(q, { dest: TM.T() && TM.T().dest, search: qq => foodGeo(qq) }); }
  catch (e) { res = { ok: false, message: PlaceUrl.FAIL }; }
  if (tok !== foodSugTok || !box) return;
  if (!res.ok) { foodUrlSpot = null; box.innerHTML = `<div class="mut">${TM.esc(res.message)}</div>`; return; }
  const s = res.spot;
  foodUrlSpot = s;
  const hint = s.hint && s.hint !== s.name ? ` <small class="mut">${TM.esc(s.hint)}</small>` : '';
  const where = s.addr || (s.lat != null ? '已取得座標' : '還沒有座標，仍可收藏');
  box.innerHTML = `<div class="card" id="foodurl" style="padding:10px"><b>${TM.esc(s.name)}</b>${hint}<div class="mut">${TM.esc(where)}</div><div class="mut">${TM.esc(s.source || '')}${s.rating ? ' · 評分 ' + TM.esc(s.rating) : ''}</div><div class="row" style="margin-top:8px"><button type="button" class="btn sm" onclick="foodFavAdd()">加入收藏</button><button type="button" class="btn ghost sm" onclick="foodDiaryFromUrl()">寫進日記</button></div></div>`;
}
function foodFavList() { try { return TM.ls.get('foodfav', []) || []; } catch (e) { return []; } }
function paintFoodFavs() {
  const box = $('#foodfavs');
  if (!box) return;
  const list = foodFavList();
  if (!list.length) { box.innerHTML = '<div class="card mut">貼上餐廳網址後，可以收到這裡，或寫進美食日記。</div>'; return; }
  box.innerHTML = list.map((s, i) => `<div class="card"><b>${TM.esc(s.name)}</b>${s.hint && s.hint !== s.name ? ` <small class="mut">${TM.esc(s.hint)}</small>` : ''}<div class="mut">${TM.esc(s.addr || '')}</div><button type="button" class="btn ghost sm" onclick="foodFavRm(${i})">移除</button></div>`).join('');
}
function foodFavAdd() {
  const s = foodUrlSpot;
  if (!s) return;
  const key = placeKey(s.name, s.lat, s.lng);
  const list = foodFavList().filter(x => placeKey(x.name, x.lat, x.lng) !== key);
  list.unshift({ name: s.name, hint: s.hint || '', addr: s.addr || '', lat: +s.lat || 0, lng: +s.lng || 0, url: s.url || '', at: Date.now() });
  TM.ls.set('foodfav', list.slice(0, 30));
  TM.toast('已加入收藏');
  paintFoodFavs();
}
function foodFavRm(i) {
  const list = foodFavList();
  list.splice(i, 1);
  TM.ls.set('foodfav', list);
  paintFoodFavs();
}
function foodDiaryFromUrl() {
  const s = foodUrlSpot;
  if (!s) return;
  openDiary(-1);
  if (!diaryDraft) return;
  diaryDraft.placeName = s.name;
  diaryDraft.lat = +s.lat || 0;
  diaryDraft.lng = +s.lng || 0;
  diaryDraft.placeKey = placeKey(s.name, s.lat, s.lng);
  const n = $('#dname');
  if (n) n.value = s.name;
}
async function foodGeo(q) {
  q = String(q || '').trim();
  if (q.length < 2) return [];
  const dest = (typeof TM !== 'undefined' && TM.T && TM.T() && TM.T().dest) || '';
  if (typeof geoSearch === 'function') return geoSearch(q, dest);
  return [];
}
async function runFoodSug(q, tok) {
  const hits = await foodGeo(q);
  if (tok !== foodSugTok) return;
  foodSug = hits.slice(0, 6);
  const box = $('#foodsug');
  if (!box) return;
  box.innerHTML = foodSug.length ? foodSug.map((g, i) => `<button type="button" class="sg" onclick="foodPick(${i})"><span><b>${TM.esc(g.name)}</b>${g.hint && g.hint !== g.name ? ` <small class="mut">${TM.esc(g.hint)}</small>` : ''}<br><small class="mut">${TM.esc(g.addr || '')}</small></span></button>`).join('') : '<div class="mut">找不到這個地方，換個說法再試。</div>';
}
function foodPick(i) { const g = foodSug[i]; if (!g) return; foodSugTok++; const box = $('#foodsug'); if (box) box.innerHTML = ''; setFoodPlace({ name: g.name, hint: g.hint || '', lat: g.lat, lng: g.lng, user: true }); }
function foodChip(name) {
  name = String(name || '');
  const b = typeof cityBias === 'function' ? cityBias(name) : null;
  if (b) { setFoodPlace({ name, lat: b.lat, lng: b.lng, user: true }); return; }
  const local = $('#foodlocal'), osm = $('#foodosm');
  if (local) local.innerHTML = '<div class="card mut">正在找這個地方…</div>';
  if (osm) osm.textContent = '正在尋找附近的店…';
  const run = typeof geoFind === 'function' ? geoFind(name) : Promise.resolve(null);
  Promise.resolve(run).then(g => {
    if (!g) { TM.toast('找不到這個地方'); return; }
    setFoodPlace({ name: g.name || name, lat: +g.latitude, lng: +g.longitude, user: true });
  }).catch(() => TM.toast('找不到這個地方'));
}
function foodHere() {
  if (!navigator.geolocation) { TM.toast('這台裝置沒有定位'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    setFoodPlace({ name: '我的位置', lat: pos.coords.latitude, lng: pos.coords.longitude, user: true });
  }, () => TM.toast('沒有拿到位置。可以改輸入城市名稱'), { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 });
}
function foodPoints() {
  const pts = [];
  if (foodPlace && Number.isFinite(+foodPlace.lat)) pts.push({ lat: +foodPlace.lat, lng: +foodPlace.lng });
  const t = TM.T();
  if (t && foodPlace && ((TM.cityOf && TM.cityOf(t.dest)) === foodPlace.name || t.dest === foodPlace.name)) {
    (t.days || []).forEach(d => (d || []).forEach(s => {
      const p = TM.ll(s);
      if (p && TM.havKm(foodPlace, p) > 0.8 && TM.havKm(foodPlace, p) < 30 && pts.length < 2) pts.push(p);
    }));
  }
  return pts.slice(0, 2);
}
function foodCacheKey() {
  if (!foodPlace || !Number.isFinite(+foodPlace.lat)) return '';
  return (foodPlace.name || '') + '|' + Number(foodPlace.lat).toFixed(2) + '|' + Number(foodPlace.lng).toFixed(2);
}
async function overpassEls(pts) {
  if (!pts.length) return [];
  const body = pts.map(p => `node["amenity"~"^(restaurant|fast_food|cafe|food_court)$"](around:1400,${p.lat},${p.lng});way["amenity"~"^(restaurant|fast_food|cafe|food_court)$"](around:1400,${p.lat},${p.lng});`).join('');
  const q = '[out:json][timeout:12];(' + body + ');out center tags 40;';
  const urls = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  for (let i = 0; i < urls.length; i++) {
    try {
      const r = await fetch(urls[i], { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: q, signal: AbortSignal.timeout(8000) });
      if (!r.ok) continue;
      const j = await r.json();
      if (j && Array.isArray(j.elements) && j.elements.length) return j.elements;
    } catch (e) {}
  }
  return [];
}
async function foodSearch(pts) {
  const over = await overpassEls(pts);
  if (over.length >= 8) return over;
  let extra = [];
  try { extra = (await nominatimFood(pts)).concat(await photonFood(pts)); } catch (e) { extra = []; }
  const all = over.concat(extra);
  if (all.length) return all;
  throw new Error('osm');
}
function rankFood(els, pack, pts) {
  const seen = new Set();
  const out = [];
  els.forEach(e => {
    const tag = e.tags || {};
    const name = tag.name || tag['name:zh'] || tag['name:en'];
    if (!name) return;
    const lat = e.lat != null ? +e.lat : (e.center && +e.center.lat);
    const lng = e.lon != null ? +e.lon : (e.center && +e.center.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const key = name + '|' + lat.toFixed(3) + '|' + lng.toFixed(3);
    if (seen.has(key)) return;
    seen.add(key);
    const year = /^(\d{4})/.exec(tag.start_date || '');
    const item = {
      name, lat, lng,
      cuisine: tag.cuisine || '',
      brand: tag.brand || '',
      year: year ? +year[1] : 0,
      addr: [tag['addr:suburb'], tag['addr:city'], tag['addr:street']].filter(Boolean).join(' '),
      amenity: tag.amenity || '',
      diet: [tag['diet:vegetarian'], tag['diet:vegan']].filter(v => v && v !== 'no').join(' '),
      priceLevel: parsePriceLevel(tag),
      image: /^https:\/\//.test(tag.image || '') ? tag.image : (/^https:\/\//.test(tag['image:url'] || '') ? tag['image:url'] : ''),
      commons: tag.wikimedia_commons || '',
      wikidata: /^Q\d+$/.test(tag.wikidata || '') ? tag.wikidata : ''
    };
    const sc = foodScore(item, pack);
    let near = null;
    pts.forEach(p => { const km = TM.havKm(p, item); if (near == null || km < near) near = km; });
    item.score = sc.s;
    item.reasons = sc.reasons;
    item.km = near;
    item.placeKey = placeKey(item.name, item.lat, item.lng);
    out.push(item);
  });
  out.sort((a, b) => b.score - a.score || (a.km || 99) - (b.km || 99));
  return out.slice(0, 40);
}
function gmaps(p) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((p.name || '') + ' ' + p.lat + ',' + p.lng);
}
function commonsFrom(file) {
  let name = String(file || '').trim();
  if (!name || /^category:/i.test(name)) return null;
  name = name.replace(/^https?:\/\/commons\.wikimedia\.org\/wiki\//i, '').replace(/^File:/i, '');
  try { name = decodeURIComponent(name); } catch (e) {}
  if (!name || /^category:/i.test(name)) return null;
  const fileName = name.replace(/^File:/i, '');
  return { url: 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(fileName) + '?width=480', credit: 'Wikimedia Commons', href: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(fileName) };
}
async function wikiP18(qid) {
  const r = await fetch('https://www.wikidata.org/w/api.php?action=wbgetentities&ids=' + qid + '&props=claims&format=json&origin=*', { signal: AbortSignal.timeout(8000) });
  if (!r.ok) return null;
  const j = await r.json();
  const claims = j.entities && j.entities[qid] && j.entities[qid].claims;
  const p18 = claims && claims.P18 && claims.P18[0];
  const file = p18 && p18.mainsnak && p18.mainsnak.datavalue && p18.mainsnak.datavalue.value;
  return file ? commonsFrom('File:' + file) : null;
}
async function resolveFoodPhoto(p) {
  const key = p.placeKey || placeKey(p.name, p.lat, p.lng);
  const bag = TM.ls.get('foodimg', {}) || {};
  const hit = bag[key];
  const ttl = hit && hit.url ? 14 * 864e5 : 2 * 864e5;
  if (hit && Date.now() - (hit.at || 0) < ttl) return hit;
  let rec = { url: '', credit: '', href: '', at: Date.now() };
  try {
    if (/^https:\/\//.test(p.image || '')) rec = { url: p.image, credit: '開放街圖', href: 'https://www.openstreetmap.org/#map=18/' + p.lat + '/' + p.lng, at: Date.now() };
    else if (p.commons) { const c = commonsFrom(p.commons); if (c) rec = Object.assign({ at: Date.now() }, c); }
    else if (p.wikidata) { const c = await wikiP18(p.wikidata); if (c) rec = Object.assign({ at: Date.now() }, c); }
  } catch (e) {}
  try {
    bag[key] = rec;
    const keys = Object.keys(bag);
    while (keys.length > 80) delete bag[keys.shift()];
    TM.ls.set('foodimg', bag);
  } catch (e) {}
  return rec;
}
function watchFoodPhotos() {
  document.querySelectorAll('img.fphoto[data-key]').forEach(img => {
    const go = () => {
      const p = FOOD_VIEW.find(x => x.placeKey === img.dataset.key);
      if (!p) return;
      resolveFoodPhoto(p).then(rec => {
        if (!rec || !rec.url || !img.isConnected) return;
        img.dataset.credit = rec.credit || '';
        img.dataset.href = rec.href || '';
        img.referrerPolicy = 'no-referrer';
        img.src = rec.url;
        const cap = img.parentElement && img.parentElement.querySelector('.fattr');
        if (cap) {
          const href = /^https:\/\//.test(rec.href || '') ? rec.href : '';
          cap.innerHTML = '照片來源：' + (href ? `<a href="${TM.esc(href)}" target="_blank" rel="noopener">${TM.esc(rec.credit || '外部')}</a>` : TM.esc(rec.credit || '外部'));
        }
      }).catch(() => {});
    };
    if (!window.IntersectionObserver) { go(); return; }
    const io = new IntersectionObserver(es => { es.forEach(en => { if (!en.isIntersecting) return; io.disconnect(); go(); }); }, { rootMargin: '240px' });
    io.observe(img);
  });
}
function showOsm() {
  const osm = $('#foodosm');
  if (!osm) return;
  const flt = foodFilter();
  FOOD_VIEW = applyFoodFilter(FOOD_RAW, flt, MATE);
  const lbl = $('#foodfltlbl');
  if (lbl) lbl.textContent = foodFltLabel();
  const sort = $('#foodsort');
  if (sort) sort.innerHTML = foodSortBar();
  if (!FOOD_RAW.length) { osm.className = 'card mut'; osm.textContent = '這附近沒查到餐廳。可以換個範圍，或稍後按重新整理。'; return; }
  if (!FOOD_VIEW.length) { osm.className = 'card mut'; osm.textContent = '沒有符合篩選的店。可以放寬條件。'; return; }
  osm.className = '';
  osm.innerHTML = FOOD_VIEW.map((p, i) => {
    const lvl = p.score >= 6 ? '比較像在地' : p.score >= 2 ? '可以參考' : '偏普通';
    const km = p.km == null ? '' : p.km < 1 ? '約 ' + Math.round(p.km * 1000) + ' 公尺' : '約 ' + (p.km < 10 ? p.km.toFixed(1) : Math.round(p.km)) + ' 公里';
    const art = foodArt(artKind(p.cuisine || p.name));
    const mate = MATE[p.placeKey];
    const mine = myStars(p.placeKey);
    const localS = localsStars(p.score);
    const mateLine = mate && mate.n ? `旅伴評分 ${mate.avg} ${starText(mate.avg)}（${mate.n} 則）` : '還沒有旅伴評分';
    const price = p.priceLevel ? priceMarks(p.priceLevel) : '價格未標';
    const hint = typeof PlaceQ !== 'undefined' && PlaceQ.hint ? PlaceQ.hint(p.name) : '';
    const addr = typeof PlaceQ !== 'undefined' && PlaceQ.zhText ? PlaceQ.zhText(p.addr || '') : (p.addr || '');
    return `<div class="card fcard"><img class="fphoto" alt="${TM.esc(p.name)}" loading="lazy" src="${art}" data-key="${TM.esc(p.placeKey)}" onerror="this.onerror=null;this.src='${art}'"><div class="fbody"><div class="row"><b>${TM.esc(p.name)}</b>${hint ? ` <small class="mut">${TM.esc(hint)}</small>` : ''}<span class="chip sm" style="flex:0">${lvl}</span></div><div class="fstars">在地人推薦度 ${localS} ${starText(localS)}</div><div class="fstars">${TM.esc(mateLine)}</div>${mine ? `<div class="mut">我的評分 ${mine} ${starText(mine)}</div>` : ''}<div class="mut">${[p.cuisine, price, addr, km].filter(Boolean).map(TM.esc).join(' · ')}</div><div>${(p.reasons || []).map(r => `<span class="tagchip">${TM.esc(r)}</span>`).join('')}</div><div class="fattr">示意插圖，不是店家照片</div><div class="row" style="margin-top:8px"><button type="button" class="btn sm" onclick="addOsm(${i})">加入行程</button><button type="button" class="btn ghost sm" onclick="openDiary(${i})">寫進日記</button><a class="btn ghost sm" href="${TM.esc(gmaps(p))}" target="_blank" rel="noopener">Google 地圖</a></div></div></div>`;
  }).join('') + '<p class="mut">在地人推薦度與旅伴評分都不是 Google 評分。Mapillary 需要金鑰，所以沒有用。</p>';
  watchFoodPhotos();
}
function paintDiary() {
  paintFoodFavs();
  const box = $('#fooddiary');
  if (!box) return;
  const list = diaryList();
  const signed = typeof cloudUid === 'function' && cloudUid();
  const hint = signed ? '已登入的日記會公開成旅伴評分（不含 Email）。同一家一天一筆。' : '未登入只存在這台裝置，不會進旅伴評分。登入後再記的才會公開。';
  if (!list.length) { box.innerHTML = `<div class="card mut">${TM.esc(hint)}</div>`; return; }
  box.innerHTML = `<p class="mut">${TM.esc(hint)}</p>` + list.slice().reverse().map(d => {
    const pics = (d.photos || []).slice(0, 3).map(src => `<img class="dthumb" alt="" loading="lazy" src="${TM.esc(src)}">`).join('');
    return `<div class="card"><b>${TM.esc(d.placeName)}</b> <span class="mut">${TM.esc(d.date)} · ${starText(d.stars)}</span>${d.dishes ? `<div class="mut">點了 ${TM.esc(d.dishes)}</div>` : ''}${d.text ? `<p>${TM.esc(d.text)}</p>` : ''}${d.price ? `<div class="mut">${TM.esc(d.price)} ${TM.esc(d.currency || '')}</div>` : ''}${pics ? `<div class="row">${pics}</div>` : ''}<button type="button" class="btn ghost sm" onclick="diaryRm('${TM.esc(d.id)}')">刪除</button></div>`;
  }).join('');
}
async function refreshMate(keys) {
  const uniq = [...new Set(keys.filter(Boolean))];
  if (!uniq.length || typeof communityScores !== 'function') return;
  try {
    const got = await communityScores(uniq);
    if (got && typeof got === 'object') MATE = Object.assign({}, MATE, got);
  } catch (e) {}
}
function reloadFood() {
  const key = foodCacheKey();
  if (key) { const bag = TM.ls.get('foodcache', {}) || {}; delete bag[key]; TM.ls.set('foodcache', bag); }
  paintFood(true);
}
async function paintFood(force) {
  const tok = ++foodTok;
  const local = $('#foodlocal'), osm = $('#foodosm');
  if (!local || !osm) return;
  const place = await ensureFoodPlace();
  if (tok !== foodTok) return;
  if (!place) {
    local.innerHTML = '<div class="card mut">輸入城市，或點上面的城市。不會預設成東京。</div>';
    osm.className = 'card mut';
    osm.textContent = '選好地方之後，這裡會列出附近的店。';
    paintDiary();
    return;
  }
  const h = $('#foodtitle');
  if (h) h.textContent = place.name + ' 美食';
  const key = foodPackKey(place);
  let pack = null;
  try { const db = await loadFoodDb(); pack = key && db[key]; } catch (e) { pack = null; }
  if (tok !== foodTok) return;
  if (pack) local.innerHTML = pack.dishes.map((d, i) => `<div class="card"><b>${TM.esc(d.name)}</b> <span class="mut">${TM.esc(d.local || '')}</span><p style="margin:6px 0">${TM.esc(d.why)}</p><div class="mut">可以往這些地方找：${TM.esc(d.where)}</div><button type="button" class="btn sm" style="margin-top:8px" onclick="addDish('${TM.esc(key)}',${i})">加入行程</button></div>`).join('');
  else local.innerHTML = '<div class="card mut">這個地方還沒有整理好的在地飲食，下面仍會找附近的店。</div>';
  const pts = foodPoints();
  if (!pts.length) { osm.className = 'card mut'; osm.textContent = '還不知道這個地方的位置。'; paintDiary(); return; }
  osm.className = 'card mut';
  osm.textContent = '正在尋找「' + place.name + '」附近的店…';
  const ck = foodCacheKey();
  const bag = TM.ls.get('foodcache', {}) || {};
  const hit = !force && bag[ck] && Date.now() - bag[ck].at < 12 * 3600 * 1000 ? bag[ck] : null;
  try {
    const els = hit ? hit.els : await foodSearch(pts);
    if (!hit) {
      try { bag[ck] = { at: Date.now(), els }; const keys = Object.keys(bag); while (keys.length > 8) delete bag[keys.shift()]; TM.ls.set('foodcache', bag); } catch (err) {}
    }
    if (tok !== foodTok || TM.getTab() !== 'food') return;
    FOOD_RAW = rankFood(els, pack, pts);
    showOsm();
    paintDiary();
    refreshMate(FOOD_RAW.map(p => p.placeKey)).then(() => { if (tok === foodTok && TM.getTab() === 'food') showOsm(); });
  } catch (e) {
    if (tok !== foodTok) return;
    osm.className = 'card mut';
    osm.textContent = '這次沒查到，請稍後再按重新整理。';
    paintDiary();
  }
}
function foodFilterSheet() {
  const f = foodFilter();
  const kinds = FOOD_KINDS.map(k => `<button type="button" class="chip${f.kinds.indexOf(k.id) >= 0 ? ' on' : ''}" onclick="foodToggleKind('${k.id}')">${k.label}</button>`).join('');
  const prices = [0, 1, 2, 3, 4].map(n => `<button type="button" class="chip${f.price === n ? ' on' : ''}" onclick="foodSetPrice(${n})">${n ? priceMarks(n) : '不限'}</button>`).join('');
  const mins = [0, 3, 3.5, 4, 4.5].map(n => `<button type="button" class="chip${f.minLocal === n ? ' on' : ''}" data-star="local" onclick="foodSetMin('local',${n})">${n ? n : '不限'}</button>`).join('');
  const mins2 = [0, 3, 3.5, 4, 4.5].map(n => `<button type="button" class="chip${f.minMate === n ? ' on' : ''}" onclick="foodSetMin('mate',${n})">${n ? n : '不限'}</button>`).join('');
  $('#sheetBody').innerHTML = `<h2>篩選店家</h2><div class="fld">料理（可多選）</div><div class="row">${kinds}</div><div class="fld">價格（開放街圖有標才分得出來）</div><div class="row">${prices}</div><label class="chip"><input type="checkbox" ${f.unkPrice ? 'checked' : ''} onchange="foodToggleUnk('price',this.checked)"> 包含未標價格</label><div class="fld">在地人推薦度至少（不是 Google）</div><div class="row">${mins}</div><div class="fld">旅伴評分至少（使用者日記，不是 Google）</div><div class="row">${mins2}</div><label class="chip"><input type="checkbox" ${f.unkMate ? 'checked' : ''} onchange="foodToggleUnk('mate',this.checked)"> 包含還沒有旅伴評分的店</label><div class="row" style="margin-top:10px"><button type="button" class="btn ghost" onclick="closeSheet()">關閉</button></div>`;
  TM.openSheet();
}
function foodToggleKind(id) { const f = foodFilter(); const i = f.kinds.indexOf(id); if (i >= 0) f.kinds.splice(i, 1); else f.kinds.push(id); saveFoodFilter(); foodFilterSheet(); showOsm(); }
function foodSetPrice(n) { foodFilter().price = n; saveFoodFilter(); foodFilterSheet(); showOsm(); }
function foodSetMin(which, n) { const f = foodFilter(); if (which === 'mate') f.minMate = n; else f.minLocal = n; saveFoodFilter(); foodFilterSheet(); showOsm(); }
function foodToggleUnk(which, on) { const f = foodFilter(); if (which === 'mate') f.unkMate = !!on; else f.unkPrice = !!on; saveFoodFilter(); showOsm(); }
function foodSetSort(k) { foodFilter().sort = k; saveFoodFilter(); showOsm(); }
function todayYmd() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function openDiary(i) {
  const p = i >= 0 ? FOOD_VIEW[i] : null;
  diaryDraft = { placeName: p ? p.name : '', lat: p ? p.lat : 0, lng: p ? p.lng : 0, placeKey: p ? p.placeKey : '', date: todayYmd(), photos: [] };
  diaryStars = 0;
  const ccys = typeof CCY_L === 'object' ? Object.keys(CCY_L) : ['TWD', 'JPY', 'USD'];
  const guess = TM.T() && typeof guessCcy === 'function' ? guessCcy(TM.T().dest) : 'TWD';
  $('#sheetBody').innerHTML = `<h2>記下吃過的</h2><label class="fld">店名<input id="dname" maxlength="80" value="${TM.esc(diaryDraft.placeName)}" oninput="diaryName()"></label><div id="dsug"></div><button type="button" class="btn ghost sm" onclick="diarySearch()">搜尋店名</button><label class="fld">日期<input type="date" id="ddate" value="${diaryDraft.date}"></label><div class="fld">幾顆星</div><div class="row" id="dstars">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="btn ghost sm" data-ds="${n}" onclick="diarySetStars(${n})">${n}</button>`).join('')}</div><label class="fld">點了什麼<input id="ddish" maxlength="200" placeholder="例如：醬油拉麵、煎餃"></label><label class="fld">心得<textarea id="dtext" maxlength="500" rows="3" placeholder="最多 500 字"></textarea></label><div class="row"><label class="fld">付了多少<input id="dprice" type="number" min="0" step="0.01"></label><label class="fld">幣別<select id="dccy">${ccys.map(c => `<option value="${c}"${c === guess ? ' selected' : ''}>${TM.esc((typeof CCY_L === 'object' && CCY_L[c]) || c)}</option>`).join('')}</select></label></div><label class="fld">照片（會壓到約 200KB，最多 3 張）<input id="dfiles" type="file" accept="image/*" multiple onchange="diaryFiles(this)"></label><div class="row" id="dprev"></div><p class="mut">同一家一天只能記一筆。未登入只留在這台裝置；登入後這則會公開成旅伴評分，不會附上 Email。</p><div class="row"><button type="button" class="btn ghost" onclick="closeSheet()">取消</button><button type="button" class="btn" onclick="diarySave()">儲存</button></div>`;
  TM.openSheet();
}
function diaryName() { if (diaryDraft) { diaryDraft.placeKey = ''; } }
function diarySetStars(n) { diaryStars = n; document.querySelectorAll('[data-ds]').forEach(b => b.classList.toggle('on', +b.dataset.ds <= n)); }
async function diarySearch() {
  const q = $('#dname') && $('#dname').value.trim();
  if (!q) { TM.toast('先寫店名'); return; }
  const box = $('#dsug');
  if (box) box.innerHTML = '<div class="mut">搜尋中…</div>';
  const hits = await foodGeo(q + (foodPlace && foodPlace.name && foodPlace.name !== '我的位置' ? ' ' + foodPlace.name : ''));
  diaryDraft.hits = hits.slice(0, 5);
  if (!box) return;
  box.innerHTML = diaryDraft.hits.length ? diaryDraft.hits.map((g, i) => `<button type="button" class="sg" onclick="diaryPickHit(${i})"><span><b>${TM.esc(g.name)}</b>${g.hint && g.hint !== g.name ? ` <small class="mut">${TM.esc(g.hint)}</small>` : ''}<br><small class="mut">${TM.esc(g.addr || '')}</small></span></button>`).join('') : '<div class="mut">地圖上沒有這家。仍可用你打的店名儲存。</div>';
}
function diaryPickHit(i) {
  const g = diaryDraft && diaryDraft.hits && diaryDraft.hits[i];
  if (!g) return;
  diaryDraft.placeName = g.name;
  diaryDraft.lat = g.lat;
  diaryDraft.lng = g.lng;
  diaryDraft.placeKey = placeKey(g.name, g.lat, g.lng);
  if ($('#dname')) $('#dname').value = g.name;
  const box = $('#dsug');
  if (box) box.innerHTML = '<div class="mut">已帶入這家店</div>';
}
async function shrinkPhoto(file, target) {
  const bmp = await createImageBitmap(file);
  let w = bmp.width, h = bmp.height, q = 0.72;
  const canvas = document.createElement('canvas');
  let blob = null;
  for (let n = 0; n < 6; n++) {
    const scale = Math.min(1, 1280 / Math.max(w, h));
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', q));
    if (blob && blob.size <= target) break;
    q -= 0.1;
    w *= 0.8; h *= 0.8;
  }
  try { bmp.close(); } catch (e) {}
  return blob;
}
function blobDataUrl(blob) { return new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result || '')); fr.onerror = () => no(new Error('read')); fr.readAsDataURL(blob); }); }
async function diaryFiles(input) {
  const files = [...(input.files || [])].slice(0, 3);
  input.value = '';
  if (!diaryDraft) return;
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    try {
      const blob = await shrinkPhoto(files[i], 200 * 1024);
      if (!blob) continue;
      urls.push(await blobDataUrl(blob));
    } catch (e) { TM.toast('有一張照片讀不起來'); }
  }
  diaryDraft.photos = urls.slice(0, 3);
  const box = $('#dprev');
  if (box) box.innerHTML = diaryDraft.photos.map(src => `<img class="dthumb" alt="" src="${src}">`).join('');
}
async function diarySave() {
  const tname = ($('#dname') && $('#dname').value || '').trim().slice(0, 80);
  const date = $('#ddate') && $('#ddate').value;
  const text = ($('#dtext') && $('#dtext').value || '').trim().slice(0, 500);
  const dishes = ($('#ddish') && $('#ddish').value || '').trim().slice(0, 200);
  const price = +($('#dprice') && $('#dprice').value);
  const currency = ($('#dccy') && $('#dccy').value) || 'TWD';
  if (!tname) { TM.toast('請寫店名'); return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) { TM.toast('請選日期'); return; }
  if (!(diaryStars >= 1 && diaryStars <= 5)) { TM.toast('請點星星'); return; }
  const lat = diaryDraft && diaryDraft.placeName === tname ? +diaryDraft.lat || 0 : 0;
  const lng = diaryDraft && diaryDraft.placeName === tname ? +diaryDraft.lng || 0 : 0;
  const key = (diaryDraft && diaryDraft.placeName === tname && diaryDraft.placeKey) || placeKey(tname, lat, lng);
  const list = diaryList();
  if (!canAddDiary(list, key, date)) { TM.toast('這家今天已經記過了'); return; }
  const photos = (diaryDraft && diaryDraft.photos || []).slice(0, 3);
  const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), placeKey: key, placeName: tname, lat, lng, date, stars: diaryStars, text, dishes, price: price > 0 ? price : 0, currency, photos, at: Date.now() };
  if (typeof cloudUid === 'function' && cloudUid() && typeof saveFoodReview === 'function') {
    try {
      const res = await saveFoodReview(item);
      if (res && res.ok === false && res.reason === 'dup') { TM.toast('這家今天已經記過了'); return; }
      if (res && res.id) item.cloudId = res.id;
    } catch (e) { TM.toast('已存在這台裝置，雲端這次沒寫入'); }
  }
  try { list.push(item); saveDiary(list); }
  catch (e) { item.photos = []; try { list.push(item); saveDiary(list); TM.toast('空間不夠，照片沒有留下'); } catch (err) { TM.toast('這台裝置空間不夠，沒有存成'); return; } }
  MATE[key] = MATE[key] || { avg: 0, n: 0 };
  TM.closeSheet();
  if (TM.getTab() === 'food') { showOsm(); paintDiary(); refreshMate([key]).then(() => { if (TM.getTab() === 'food') showOsm(); }); }
  TM.toast('已寫進美食日記');
}
async function diaryRm(id) {
  if (!confirm('刪除這則日記？')) return;
  const list = diaryList().filter(x => x.id !== id);
  const gone = diaryList().find(x => x.id === id);
  saveDiary(list);
  if (gone && gone.cloudId && typeof deleteFoodReview === 'function') { try { await deleteFoodReview(gone.cloudId); } catch (e) {} }
  paintDiary();
  showOsm();
}
function addOsm(i) {
  const p = FOOD_VIEW[i], t = TM.T();
  if (!p || !t) { TM.toast('請先建立行程，才能加進某一天'); return; }
  askDay('加入「' + p.name + '」？' + (p.cuisine ? '（' + p.cuisine + '）' : ''), di => {
    const hint = typeof PlaceQ !== 'undefined' && PlaceQ.hint ? PlaceQ.hint(p.name) : '';
    const addr = typeof PlaceQ !== 'undefined' && PlaceQ.zhText ? PlaceQ.zhText(p.addr || '') : (p.addr || '');
    pushFood(di, { time: '12:30', name: p.name, zh: hint || undefined, note: [hint && hint !== p.name ? hint : '', p.cuisine, addr, (p.reasons || []).slice(0, 2).join('、')].filter(Boolean).join(' · '), icon: 'food', ptype: '餐廳', lat: p.lat, lng: p.lng, link: gmaps(p) });
  });
}
async function addDish(key, idx) {
  const t = TM.T();
  let db = null;
  try { db = await loadFoodDb(); } catch (e) { db = null; }
  const pack = db && db[key];
  const d = pack && pack.dishes && pack.dishes[idx];
  if (!t || !d) { TM.toast('請先建立行程，才能加進某一天'); return; }
  TM.toast('正在找可以代表這道料理的店…');
  let hit = null;
  try { const hits = await geoSearch(d.q || d.name, (foodPlace && foodPlace.name) || t.dest); hit = hits[0] || null; } catch (e) {}
  const label = hit ? '要加入「' + d.name + '」。地圖上找到「' + hit.name + '」。' : '要加入「' + d.name + '」（' + d.where + '）。';
  askDay(label, i => {
    const spot = { time: '12:30', name: hit ? hit.name : d.name, zh: hit && hit.hint || undefined, note: [d.name !== (hit && hit.name) ? d.name : '', hit && hit.hint && hit.hint !== hit.name ? hit.hint : '', d.why, hit ? hit.addr : d.where].filter(Boolean).join(' · ').slice(0, 180), icon: 'food', ptype: '餐廳' };
    if (hit) { spot.lat = hit.lat; spot.lng = hit.lng; spot.link = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(hit.lat + ',' + hit.lng); }
    pushFood(i, spot);
  });
}

if (typeof module === 'object' && module.exports) {
  module.exports = { placeKey, localsStars, starText, parsePriceLevel, matchKind, applyFoodFilter, canAddDiary, artKind };
}
