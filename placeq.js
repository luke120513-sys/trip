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
  for (let i = 0; i < SIMP_TRAD.length; i += 2) {
    const jp = TO_JP[SIMP_TRAD[i + 1]];
    if (jp) TO_JP[SIMP_TRAD[i]] = jp;
  }
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
      return hit(p.name || p.street || q, +c[1], +c[0], addr([p.street, p.locality, p.district, p.city, p.state, city ? '' : p.country]), city);
    }).filter(Boolean);
  }
  function fromNominatim(j, q) {
    return (Array.isArray(j) ? j : []).map(x => {
      const name = (x.namedetails && (x.namedetails.name || x.namedetails['name:ja'] || x.namedetails['name:zh'])) || x.name || String(x.display_name || q).split(',')[0];
      const city = (x.address && (x.address.city || x.address.town || x.address.state)) || '';
      return hit(String(name).trim(), +x.lat, +x.lon, String(x.display_name || ''), city);
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
  async function lookup(query, bias, limit, fetchFn) {
    const fetch = fetchFn || globalThis.fetch;
    try {
      const u = new URL('https://photon.komoot.io/api/');
      u.searchParams.set('q', query);
      u.searchParams.set('limit', String(limit || 8));
      if (bias && Number.isFinite(+bias.lat) && Number.isFinite(+bias.lng)) {
        u.searchParams.set('lat', String(bias.lat));
        u.searchParams.set('lon', String(bias.lng));
      }
      const r = await fetch(u, { signal: AbortSignal.timeout(8000) });
      if (r && r.ok) {
        const hits = fromPhoton(await r.json(), query);
        if (hits.length) return hits;
      }
    } catch (e) {}
    try {
      const u = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&accept-language=zh-TW&q=' + encodeURIComponent(query);
      const r = await fetch(u, { signal: AbortSignal.timeout(8000), headers: { 'Accept-Language': 'zh-TW' } });
      if (r && r.ok) return fromNominatim(await r.json(), query);
    } catch (e) {}
    return [];
  }
  async function search(q, opt) {
    opt = opt || {};
    const bias = opt.bias || null;
    const limit = opt.limit || 8;
    const few = opt.few == null ? 3 : opt.few;
    const fetchFn = opt.fetch;
    const queries = plan(q);
    let all = [];
    let tried = 0;
    const run = async list => {
      for (const query of list) {
        if (tried >= 6) return;
        tried++;
        all = dedupe(all.concat(await lookup(query, bias, limit, fetchFn)));
        if (near(all, bias).length >= few) return;
      }
    };
    await run(queries.primary);
    if (near(all, bias).length < few) await run(queries.fallback);
    return rank(near(all, bias), bias).slice(0, limit);
  }

  return { plan, kanji, dedupe, search, km };
});
