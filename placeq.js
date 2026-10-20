/* 景點查詢改寫。中文食物、地點用詞改成地圖上常見的日文或英文，再合併分店。瀏覽器與測試都能用。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PlaceQ = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const JP_TRAD = '稲稻沢澤国國広廣駅驛竜龍円圓黒黑売賣渋澀辺邊楽樂条條浅淺観觀仏佛会會発發対對変變桜櫻浜濱麺麵気氣学學体體医醫鉄鐵区區価價画畫図圖関關県縣豊豐湾灣旧舊来來点點塩鹽焼燒寿壽実實宝寶双雙鶏雞緑綠絵繪続續総總声聲礼禮経經縁緣灯燈号號楼樓圧壓処處帰歸帯帶将將状狀浄淨湿濕満滿歩歩斎齋静靜亀龜団團読讀証證内內温溫黄黃臺台';
  const SIMP_TRAD = '门門东東车車龙龍风風馆館园園场場桥橋岛島广廣泽澤驿驛烧燒盐鹽龟龜图圖关關县縣丰豐价價铁鐵医醫体體学學湾灣旧舊点點来來发發对對变變乐樂气氣卖賣涩澀边邊圆圓鸡雞绿綠绘繪续續总總经經缘緣证證读讀团團满滿湿濕净淨状狀带帶处處压壓楼樓号號灯燈礼禮声聲双雙宝寶实實寿壽画画国國内內温溫黄黃台臺观觀会會浅淺';
  const TO_JP = {};
  for (let i = 0; i < JP_TRAD.length; i += 2) TO_JP[JP_TRAD[i + 1]] = JP_TRAD[i];
  const SIMP_TO_TRAD = {};
  for (let i = 0; i < SIMP_TRAD.length; i += 2) {
    const jp = TO_JP[SIMP_TRAD[i + 1]];
    if (jp) TO_JP[SIMP_TRAD[i]] = jp;
    if (SIMP_TRAD[i] !== SIMP_TRAD[i + 1]) SIMP_TO_TRAD[SIMP_TRAD[i]] = SIMP_TRAD[i + 1];
  }
  delete SIMP_TO_TRAD['台'];
  const MORE_TRAD = '韩韓马馬鸟鳥鱼魚页頁贝貝见見这這个個们們时時后後从從';
  for (let i = 0; i < MORE_TRAD.length; i += 2) SIMP_TO_TRAD[MORE_TRAD[i]] = MORE_TRAD[i + 1];
  const PLACES = [
    ['東京都', '東京'], ['东京', '東京'], ['Tokyo', '東京'],
    ['北海道', '北海道'], ['Hokkaido', '北海道'],
    ['大阪府', '大阪'], ['大阪市', '大阪'], ['大阪', '大阪'], ['Osaka', '大阪'],
    ['京都府', '京都'], ['京都市', '京都'], ['京都', '京都'], ['Kyoto', '京都'],
    ['神奈川県', '神奈川縣'], ['神奈川县', '神奈川縣'], ['Kanagawa', '神奈川'],
    ['横浜市', '橫濱市'], ['横浜', '橫濱'], ['Yokohama', '橫濱'],
    ['福岡市', '福岡'], ['福岡', '福岡'], ['福冈', '福岡'], ['Fukuoka', '福岡'],
    ['札幌市', '札幌'], ['札幌', '札幌'], ['Sapporo', '札幌'],
    ['名古屋市', '名古屋'], ['名古屋', '名古屋'], ['Nagoya', '名古屋'],
    ['沖縄県', '沖繩'], ['沖縄', '沖繩'], ['冲绳', '沖繩'], ['Okinawa', '沖繩'],
    ['奈良市', '奈良'], ['奈良', '奈良'], ['Nara', '奈良'],
    ['神戸市', '神戶'], ['神戸', '神戶'], ['Kobe', '神戶'],
    ['広島市', '廣島'], ['広島', '廣島'], ['广岛', '廣島'], ['Hiroshima', '廣島'],
    ['千代田区', '千代田區'], ['Chiyoda', '千代田區'],
    ['中央区', '中央區'], ['Chuo', '中央區'],
    ['港区', '港區'], ['Minato', '港區'],
    ['新宿区', '新宿區'], ['Shinjuku', '新宿區'],
    ['文京区', '文京區'], ['Bunkyo', '文京區'],
    ['台東区', '台東區'], ['台东区', '台東區'], ['Taito', '台東區'],
    ['墨田区', '墨田區'], ['Sumida', '墨田區'],
    ['江東区', '江東區'], ['江东区', '江東區'], ['Koto', '江東區'],
    ['品川区', '品川區'], ['Shinagawa', '品川區'],
    ['目黒区', '目黑區'], ['目黑区', '目黑區'], ['Meguro', '目黑區'],
    ['大田区', '大田區'], ['Ota', '大田區'],
    ['世田谷区', '世田谷區'], ['Setagaya', '世田谷區'],
    ['渋谷区', '澀谷區'], ['涩谷区', '澀谷區'], ['Shibuya', '澀谷區'],
    ['中野区', '中野區'], ['Nakano', '中野區'],
    ['杉並区', '杉並區'], ['杉并区', '杉並區'], ['Suginami', '杉並區'],
    ['豊島区', '豐島區'], ['丰岛区', '豐島區'], ['Toshima', '豐島區'],
    ['北区', '北區'], ['Kita', '北區'],
    ['荒川区', '荒川區'], ['Arakawa', '荒川區'],
    ['板橋区', '板橋區'], ['板桥区', '板橋區'], ['Itabashi', '板橋區'],
    ['練馬区', '練馬區'], ['练马区', '練馬區'], ['Nerima', '練馬區'],
    ['足立区', '足立區'], ['Adachi', '足立區'],
    ['葛飾区', '葛飾區'], ['葛饰区', '葛飾區'], ['Katsushika', '葛飾區'],
    ['江戸川区', '江戶川區'], ['江户川区', '江戶川區'], ['Edogawa', '江戶川區'],
    ['武蔵野市', '武藏野市'], ['武藏野市', '武藏野市'], ['Musashino', '武藏野市'],
    ['青葉区', '青葉區'], ['青叶区', '青葉區'], ['Aoba', '青葉區'],
    ['日本', '日本'], ['Japan', '日本'],
    ['韓国', '韓國'], ['韩国', '韓國'], ['South Korea', '韓國'], ['Korea', '韓國'],
    ['タイ', '泰國'], ['泰国', '泰國'], ['Thailand', '泰國'],
    ['台湾', '台灣'], ['台灣', '台灣'], ['Taiwan', '台灣'],
    ['香港', '香港'], ['Hong Kong', '香港'],
    ['中国', '中國'], ['China', '中國'],
    ['新加坡', '新加坡'], ['Singapore', '新加坡'],
    ['美国', '美國'], ['美國', '美國'], ['United States', '美國'],
    ['法国', '法國'], ['法國', '法國'], ['France', '法國'],
    ['英国', '英國'], ['英國', '英國'], ['England', '英國'],
    ['首尔', '首爾'], ['首爾', '首爾'], ['Seoul', '首爾'],
    ['釜山', '釜山'], ['Busan', '釜山'],
    ['曼谷', '曼谷'], ['Bangkok', '曼谷'],
    ['巴黎', '巴黎'], ['Paris', '巴黎'],
    ['伦敦', '倫敦'], ['倫敦', '倫敦'], ['London', '倫敦'],
    ['纽约', '紐約'], ['紐約', '紐約'], ['New York', '紐約']
  ].sort((a, b) => b[0].length - a[0].length);
  const WORDS = [
    ['咖啡廳', 'カフェ', 'cafe'],
    ['咖啡厅', 'カフェ', 'cafe'],
    ['咖啡館', 'カフェ', 'cafe'],
    ['咖啡馆', 'カフェ', 'cafe'],
    ['拉麵', 'ラーメン', 'ramen'],
    ['拉面', 'ラーメン', 'ramen'],
    ['燒肉', '焼肉', 'yakiniku'],
    ['烧肉', '焼肉', 'yakiniku'],
    ['烤肉', '焼肉', 'yakiniku'],
    ['壽司', '寿司', 'sushi'],
    ['壽喜燒', 'すき焼き', 'sukiyaki'],
    ['寿喜烧', 'すき焼き', 'sukiyaki'],
    ['天婦羅', '天ぷら', 'tempura'],
    ['天妇罗', '天ぷら', 'tempura'],
    ['烏龍麵', 'うどん', 'udon'],
    ['乌冬面', 'うどん', 'udon'],
    ['蕎麥麵', 'そば', 'soba'],
    ['荞麦面', 'そば', 'soba'],
    ['居酒屋', '居酒屋', 'izakaya'],
    ['河豚', 'ふぐ', 'fugu'],
    ['咖啡', 'カフェ', 'cafe'],
    ['神社', '神社', 'shrine'],
    ['神宮', '神宮', 'shrine'],
    ['寺廟', '寺', 'temple'],
    ['寺庙', '寺', 'temple'],
    ['寺院', '寺', 'temple'],
    ['火車站', '駅', 'station'],
    ['火车站', '駅', 'station'],
    ['車站', '駅', 'station'],
    ['车站', '駅', 'station'],
    ['公園', '公園', 'park'],
    ['公园', '公園', 'park'],
    ['市場', '市場', 'market'],
    ['市场', '市場', 'market'],
    ['溫泉', '温泉', 'onsen'],
    ['温泉', '温泉', 'onsen']
  ];
  const GENERICS = ['咖啡廳', '咖啡厅', '咖啡館', '咖啡馆', '拉麵', '拉面', 'ラーメン', '燒肉', '烧肉', '焼肉', '壽司', '寿司', '壽喜燒', '寿喜烧', 'すき焼き', '天婦羅', '天妇罗', '天ぷら', '烏龍麵', '乌冬面', 'うどん', '蕎麥麵', '荞麦面', 'そば', '居酒屋', 'izakaya', '河豚', 'ふぐ', 'fugu', '咖啡', 'カフェ', 'cafe', '神社', '神宮', 'shrine', '寺廟', '寺庙', '寺院', 'temple', '火車站', '火车站', '車站', '车站', 'station', '公園', '公园', 'park', '市場', '市场', 'market', '溫泉', '温泉', 'onsen', '寺', '駅', '站', '店'].sort((a, b) => b.length - a.length);

  function kanji(s) {
    let o = '';
    for (const c of String(s || '')) o += TO_JP[c] || c;
    return o;
  }
  function sub(s, slot) {
    let o = String(s || '');
    let changed = false;
    const words = WORDS.slice().sort((a, b) => b[0].length - a[0].length);
    for (const row of words) {
      const from = row[0];
      const rep = slot === 1 ? row[2] : row[1];
      if (!from || !rep || rep === from || !o.includes(from)) continue;
      o = o.split(from).join(rep);
      changed = true;
    }
    return changed ? o : '';
  }
  function stemOf(s) {
    s = String(s || '').trim();
    for (const g of GENERICS) {
      if (s.endsWith(g) && s.length >= g.length + 2) return s.slice(0, -g.length).trim();
    }
    return '';
  }
  function uniq(list) {
    const seen = new Set();
    const out = [];
    for (const item of list) {
      const s = String(item || '').trim().replace(/\s+/g, ' ');
      if (s.length < 2 || seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }
    return out;
  }
  function plan(q) {
    const base = String(q || '').trim();
    const ja = sub(base, 0);
    const en = sub(base, 1);
    const primary = uniq([base, kanji(base), ja, ja && kanji(ja), en, en && kanji(en)]);
    const stems = [];
    for (const s of primary) {
      const t = stemOf(s);
      if (!t) continue;
      stems.push(t, kanji(t), sub(t, 0), sub(t, 1));
    }
    return { primary, fallback: uniq(stems).filter(s => !primary.includes(s)) };
  }
  function km(a, b) {
    const R = 6371, p = Math.PI / 180;
    const dlat = (b.lat - a.lat) * p, dlon = (b.lng - a.lng) * p;
    const s = Math.sin(dlat / 2) ** 2 + Math.cos(a.lat * p) * Math.cos(b.lat * p) * Math.sin(dlon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }
  function trad(s) {
    let o = '';
    for (const c of String(s || '')) o += SIMP_TO_TRAD[c] || c;
    return o;
  }
  function zhText(s) {
    let t = trad(String(s || ''));
    if (!t) return '';
    for (const row of PLACES) {
      const from = row[0], to = row[1];
      if (!from || from === to) continue;
      if (/[A-Za-z]/.test(from)) t = t.replace(new RegExp('\\b' + from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'), to);
      else if (t.includes(from)) t = t.split(from).join(to);
    }
    t = t.replace(/([一-龯々]{1,6})区/g, '$1區').replace(/([一-龯々]{1,8})県/g, '$1縣');
    return t;
  }
  function foodHint(name) {
    let o = String(name || '');
    let changed = false;
    const rows = WORDS.slice().sort((a, b) => (b[1] || '').length - (a[1] || '').length);
    for (const row of rows) {
      const ja = row[1], zh = row[0];
      if (!ja || ja === zh || !o.includes(ja)) continue;
      if (/^[a-z0-9 ]+$/i.test(ja)) continue;
      o = o.split(ja).join(zh);
      changed = true;
    }
    o = trad(o);
    return changed && o !== name ? o : '';
  }
  function hintOf(name, query) {
    const fromName = foodHint(name);
    if (fromName) return fromName;
    const q = trad(String(query || '').trim());
    if (!q || q === name || !/[\u4e00-\u9fff]/.test(q)) return '';
    const ja = sub(q, 0);
    if (ja && (name === ja || String(name).includes(ja))) return q;
    return '';
  }
  function addr(parts) {
    const out = [];
    for (const part of parts) {
      const s = String(part || '').trim();
      if (!s || out.indexOf(s) >= 0) continue;
      out.push(s);
    }
    return out.join(' · ');
  }
  function hit(name, lat, lng, address, city) {
    if (!name || !Number.isFinite(+lat) || !Number.isFinite(+lng)) return null;
    return { name: String(name).trim(), addr: address || '', city: city || '', lat: +lat, lng: +lng };
  }
  function fromPhoton(j, q) {
    return ((j && j.features) || []).map(f => {
      const p = f.properties || {};
      const c = f.geometry && f.geometry.coordinates;
      if (!c || c.length < 2) return null;
      const city = p.city || p.state || '';
      return hit(p.name || p.street || q, +c[1], +c[0], addr([p.street, p.locality, p.district, p.city, p.state, p.country]), city);
    }).filter(Boolean);
  }
  function fromNominatim(j, q) {
    return (Array.isArray(j) ? j : []).map(x => {
      const d = x.namedetails || {};
      const name = d['name:ja'] || d.name || x.name || String(x.display_name || q).split(',')[0];
      const zhName = d['name:zh-TW'] || d['name:zh-Hant'] || d['name:zh'] || '';
      const city = (x.address && (x.address.city || x.address.town || x.address.state)) || '';
      const row = hit(String(name).trim(), +x.lat, +x.lon, String(x.display_name || ''), city);
      if (row && zhName) row.hint = trad(zhName);
      return row;
    }).filter(Boolean);
  }
  function dedupe(list) {
    const out = [];
    for (const h of list || []) {
      if (!h || !h.name) continue;
      const dup = out.find(o => o.name === h.name && Math.abs(o.lat - h.lat) < 0.0008 && Math.abs(o.lng - h.lng) < 0.0008);
      if (!dup) out.push(h);
      else if ((h.addr || '').length > (dup.addr || '').length) dup.addr = h.addr;
    }
    return out;
  }
  function near(list, bias) {
    if (!bias || !list.length) return list;
    const close = list.filter(h => km(bias, h) < 120);
    return close.length ? close : list;
  }
  function rank(list, bias) {
    const copy = list.slice();
    if (!bias) return copy;
    copy.sort((a, b) => km(bias, a) - km(bias, b));
    return copy;
  }
  let photonLang = 'zh';
  const slots = { photon: 0, nominatim: 0 };
  const mem = new Map();
  const pending = new Map();
  function cloneHits(list) { return (list || []).map(h => Object.assign({}, h)); }
  function cacheKey(q, bias, limit, few) {
    const b = bias && Number.isFinite(+bias.lat) ? (+bias.lat).toFixed(2) + ',' + (+bias.lng).toFixed(2) : '';
    return [String(q || '').trim().toLowerCase(), b, limit, few].join('|');
  }
  function remember(key, hits) {
    if (!hits || !hits.length) return;
    mem.set(key, { at: Date.now(), hits: cloneHits(hits) });
    while (mem.size > 40) mem.delete(mem.keys().next().value);
  }
  function recall(key) {
    const row = mem.get(key);
    if (!row || Date.now() - row.at > 10 * 60 * 1000) { mem.delete(key); return null; }
    return cloneHits(row.hits);
  }
  async function pace(which) {
    const gap = which === 'nominatim' ? 1100 : 350;
    const now = Date.now();
    const start = Math.max(now, slots[which] || 0);
    slots[which] = start + gap;
    if (start > now) await new Promise(res => setTimeout(res, start - now));
  }
  async function fetchPhoton(url, fetchFn) {
    const fetch = fetchFn || globalThis.fetch;
    const langs = photonLang === 'zh' ? ['zh', 'default'] : [photonLang];
    let last = null;
    for (const lang of langs) {
      const u = new URL(url, 'https://photon.komoot.io');
      u.searchParams.set('lang', lang);
      const r = await fetch(u, { signal: AbortSignal.timeout(8000) });
      last = r;
      if (r && r.status === 400 && lang === 'zh') { photonLang = 'default'; continue; }
      if (r && r.ok) return r;
    }
    return last;
  }
  async function lookup(query, bias, limit, fetchFn) {
    const paced = !fetchFn;
    try {
      if (paced) await pace('photon');
      const u = new URL('https://photon.komoot.io/api/');
      u.searchParams.set('q', query);
      u.searchParams.set('limit', String(limit || 8));
      if (bias && Number.isFinite(+bias.lat) && Number.isFinite(+bias.lng)) {
        u.searchParams.set('lat', String(bias.lat));
        u.searchParams.set('lon', String(bias.lng));
      }
      const r = await fetchPhoton(u, fetchFn);
      if (r && r.ok) {
        const hits = fromPhoton(await r.json(), query);
        if (hits.length) return hits;
      }
    } catch (e) {}
    try {
      if (paced) await pace('nominatim');
      const fetch = fetchFn || globalThis.fetch;
      const u = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&namedetails=1&accept-language=' + encodeURIComponent('zh-TW,zh,ja') + '&q=' + encodeURIComponent(query);
      const r = await fetch(u, { signal: AbortSignal.timeout(8000), headers: { 'Accept-Language': 'zh-TW,zh,ja' } });
      if (r && r.ok) return fromNominatim(await r.json(), query);
    } catch (e) {}
    return [];
  }
  function decorate(h, query) {
    const hint = h.hint || hintOf(h.name, query);
    return { name: h.name, hint: hint && hint !== h.name ? hint : '', addr: zhText(h.addr), city: zhText(h.city), lat: h.lat, lng: h.lng };
  }
  async function search(q, opt) {
    opt = opt || {};
    const bias = opt.bias || null;
    const limit = opt.limit || 8;
    const few = opt.few == null ? 3 : opt.few;
    const fetchFn = opt.fetch;
    const key = cacheKey(q, bias, limit, few);
    if (!fetchFn) {
      const hit = recall(key);
      if (hit) return hit;
      if (pending.has(key)) return pending.get(key).then(cloneHits);
    }
    const job = runSearch(q, bias, limit, few, fetchFn).then(hits => {
      if (!fetchFn) remember(key, hits);
      return hits;
    });
    if (!fetchFn) pending.set(key, job);
    try { return await job.then(cloneHits); }
    finally { if (!fetchFn) pending.delete(key); }
  }
  function fold(s) { return String(s || '').replace(/\s+/g, '').toLowerCase(); }
  function matchesQuery(h, keys) {
    const n = fold(h && h.name);
    if (n.length < 2) return false;
    return keys.some(k => {
      const t = fold(k);
      if (t.length < 2) return false;
      return n.includes(t) || (t.includes(n) && t.length - n.length <= 4);
    });
  }
  async function runSearch(q, bias, limit, few, fetchFn) {
    const queries = plan(q);
    const keys = uniq([].concat(queries.primary, queries.fallback));
    const base = String(q || '').trim();
    const rewrites = queries.primary.filter(s => s && s !== base);
    let all = [];
    let tried = 0;
    let sawRewrite = !rewrites.length;
    const pull = async list => {
      for (const query of list) {
        if (tried >= 6) return;
        tried++;
        if (rewrites.indexOf(query) >= 0) sawRewrite = true;
        all = dedupe(all.concat(await lookup(query, bias, limit, fetchFn)));
        const rel = near(all, bias).filter(h => matchesQuery(h, keys));
        if (sawRewrite && rel.length >= few) return;
      }
    };
    await pull(queries.primary);
    if (near(all, bias).filter(h => matchesQuery(h, keys)).length < few) await pull(queries.fallback);
    const ranked = rank(near(all, bias), bias);
    const rel = ranked.filter(h => matchesQuery(h, keys));
    return (rel.length ? rel : ranked).slice(0, limit).map(h => decorate(h, q));
  }

  return { plan, kanji, dedupe, search, km, hint: foodHint, zhText, fetchPhoton };
});
