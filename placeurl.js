/* 單一店家網址：從 Google 地圖、食べログ、Apple 地圖、Instagram 與一般餐廳頁讀出一間店。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PlaceUrl = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const FAIL = '讀不到這個網址的店名。請改打店名，例如：玄品河豚。';
  const SRC = { google: 'Google 地圖', tabelog: '食べログ', apple: 'Apple 地圖', instagram: 'Instagram', web: '網站' };
  const PLACE_TYPE = /Restaurant|FoodEstablishment|CafeOrCoffeeShop|Bakery|BarOrPub|LocalBusiness|TouristAttraction|LodgingBusiness|Hotel|Store|Place|CivicStructure/i;
  const FOOD_TYPE = /Restaurant|FoodEstablishment|Cafe|Bakery|BarOrPub/i;

  function dec(s) {
    s = String(s || '');
    s = s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    s = s.replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    s = s.replace(/\\\//g, '/').replace(/\\u0026/gi, '&').replace(/&amp;/g, '&');
    try { s = decodeURIComponent(s.replace(/\+/g, ' ')); }
    catch { s = s.replace(/\+/g, ' '); }
    return s.replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
  }
  function badName(s) {
    const t = String(s || '').trim();
    if (t.length < 2 || t.length > 120) return true;
    if (/^(google maps|apple maps|instagram|tabelog|食べログ|just a moment\.{0,3}|attention required|access denied|security verification|performing security verification|dynamic link not found|page not found|not found|404|error|login|log in|sign in)$/i.test(t)) return true;
    return /not found|security verification|just a moment|captcha/i.test(t) && t.length < 80;
  }
  function cleanLabel(s) {
    s = dec(s).split('@')[0].replace(/^\/+|\/+$/g, '').trim();
    return badName(s) ? '' : s;
  }
  function coord(lat, lng) {
    lat = +lat;
    lng = +lng;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    if (Math.abs(lat) < 0.01 && Math.abs(lng) < 0.01) return null;
    return { lat, lng };
  }
  function hrefOf(input) {
    let s = String(input || '').trim();
    if (!s) return '';
    if (!/^https?:\/\//i.test(s)) {
      if (/^(?:maps\.app\.goo\.gl|goo\.gl|maps\.google\.|www\.google\.|google\.|maps\.apple\.|tabelog\.|s\.tabelog\.|www\.instagram\.|instagram\.|instagr\.am)/i.test(s)) s = 'https://' + s;
      else return '';
    }
    try { return new URL(s).href; }
    catch { return ''; }
  }
  function kind(url) {
    let u;
    try { u = new URL(url); }
    catch { return ''; }
    const h = u.hostname.replace(/^www\./, '').toLowerCase();
    const path = u.pathname;
    if (h === 'maps.app.goo.gl' || h === 'goo.gl') return 'google';
    if (h === 'maps.apple.com' || h.endsWith('.maps.apple.com')) return 'apple';
    if (h === 'tabelog.com' || h.endsWith('.tabelog.com')) return 'tabelog';
    if (h === 'instagram.com' || h === 'instagr.am' || h.endsWith('.instagram.com')) return 'instagram';
    if (h.startsWith('maps.google.') || ((h === 'google.com' || h.endsWith('.google.com') || /^google\.[a-z.]+$/.test(h)) && path.startsWith('/maps'))) return 'google';
    return 'web';
  }
  function isUrl(input) {
    return !!hrefOf(input);
  }
  function isShort(url) {
    try {
      const h = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
      return h === 'maps.app.goo.gl' || h === 'goo.gl';
    } catch { return false; }
  }
  function ready(input) {
    const url = hrefOf(input);
    if (!url) return false;
    let u;
    try { u = new URL(url); }
    catch { return false; }
    const k = kind(url);
    if (k === 'google' && /goo\.gl$/.test(u.hostname.replace(/^www\./, ''))) return u.pathname.replace(/\//g, '').length >= 4;
    if (k === 'google') return /\/maps\/(place|search|dir)\//.test(u.pathname) || /[?&](q|query|ll|destination)=/.test(u.search) || /@-?\d/.test(u.pathname) || /!3d-?\d/.test(u.href);
    if (k === 'tabelog') return /\/\d{5,}(\/|$)/.test(u.pathname);
    if (k === 'apple') return /[?&](q|ll|address|name|coordinate)=/.test(u.search) || /\/place\//.test(u.pathname);
    if (k === 'instagram') return /\/(?:p|reel|tv|explore\/locations)\//.test(u.pathname);
    return u.hostname.includes('.') && u.pathname.length > 1;
  }
  function qCoord(q) {
    const m = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(String(q || ''));
    return m ? coord(m[1], m[2]) : null;
  }
  function numsFrom(s) {
    const text = String(s || '');
    const d3 = [...text.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)];
    if (d3.length) return coord(d3[d3.length - 1][1], d3[d3.length - 1][2]);
    const d12 = [...text.matchAll(/!1d(-?\d+(?:\.\d+)?)!2d(-?\d+(?:\.\d+)?)/g)];
    if (d12.length) {
      const last = d12[d12.length - 1];
      return coord(last[2], last[1]);
    }
    const at = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(text);
    return at ? coord(at[1], at[2]) : null;
  }
  function pathName(pathname) {
    const parts = String(pathname || '').split('/').filter(Boolean);
    const i = parts.findIndex(p => p === 'place' || p === 'search' || p === 'dir');
    if (i < 0) return '';
    const rest = parts.slice(i + 1).filter(p => p && !p.startsWith('@') && !p.startsWith('data') && !p.includes('!3d') && !p.includes('!1d') && !/^\d+z$/.test(p));
    if (!rest.length) return '';
    const use = parts[i] === 'dir' ? rest[rest.length - 1] : rest[0];
    return cleanLabel(use);
  }
  function parseUrl(input) {
    const url = hrefOf(input);
    if (!url) return null;
    const u = new URL(url);
    const k = kind(url);
    const spot = { name: '', addr: '', lat: null, lng: null, kind: k, source: SRC[k] || SRC.web, url, short: isShort(url), food: k === 'tabelog', note: '', rating: '' };
    if (k === 'google') {
      const q = u.searchParams.get('q') || u.searchParams.get('query') || u.searchParams.get('destination') || '';
      const ll = u.searchParams.get('ll') || u.searchParams.get('center') || '';
      const c = numsFrom(u.href) || qCoord(q) || qCoord(ll);
      if (c) { spot.lat = c.lat; spot.lng = c.lng; }
      spot.name = pathName(u.pathname) || (!qCoord(q) ? cleanLabel(q) : '');
      if (/\/maps\/dir\//.test(u.pathname)) spot.note = '這是路線連結，已帶入終點。';
    } else if (k === 'apple') {
      const q = u.searchParams.get('q') || u.searchParams.get('name') || '';
      const ll = u.searchParams.get('ll') || u.searchParams.get('coordinate') || u.searchParams.get('center') || '';
      const c = qCoord(ll) || numsFrom(u.href) || qCoord(q);
      if (c) { spot.lat = c.lat; spot.lng = c.lng; }
      spot.name = !qCoord(q) ? cleanLabel(q.split('\n')[0]) : '';
      spot.addr = dec(u.searchParams.get('address') || '');
    } else if (k === 'instagram') {
      const m = /\/explore\/locations\/\d+\/([^/?#]+)/.exec(u.pathname);
      if (m) spot.name = cleanLabel(dec(m[1]).replace(/-/g, ' '));
    }
    return spot;
  }
  function readerTarget(input) {
    const url = hrefOf(input);
    if (!url || kind(url) !== 'tabelog') return url;
    const u = new URL(url);
    let path = u.pathname.replace(/^\/(?:en|tw|cn|kr)(?=\/)/, '');
    if (!path.startsWith('/')) path = '/' + path;
    return 'https://s.tabelog.com/tw' + path + (u.search || '');
  }
  function meta(html, prop) {
    const re = new RegExp('<meta\\b[^>]*(?:property|name)=["\']' + prop + '["\'][^>]*>', 'i');
    const re2 = new RegExp('<meta\\b[^>]*content=["\']([^"\']+)["\'][^>]*(?:property|name)=["\']' + prop + '["\'][^>]*>', 'i');
    const tag = re.exec(html);
    if (tag) {
      const c = /content=["']([^"']+)["']/i.exec(tag[0]);
      if (c) return dec(c[1]);
    }
    const m = re2.exec(html);
    return m ? dec(m[1]) : '';
  }
  function pageTitle(html) {
    const md = /^Title:\s*(.+)$/m.exec(html);
    if (md) return dec(md[1]);
    const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
    return m ? dec(m[1]) : '';
  }
  function cleanTitle(t) {
    t = dec(t);
    t = t.replace(/\s*[|\-–—｜]\s*(?:Tabelog|食べログ|Apple Maps|Google Maps|Instagram).*$/i, '');
    t = t.replace(/\s+[•·]\s*Instagram.*$/i, '');
    t = t.replace(/\s+on Instagram:.*$/i, '');
    t = t.replace(/^地圖\s*[:：]\s*/, '');
    const inn = /^(.*?)\s+in\s+\S.{0,80}$/i.exec(t);
    if (inn && inn[1].length >= 2 && inn[1].length < t.length) t = inn[1];
    return t.trim();
  }
  function jsonBlocks(html) {
    const out = [];
    const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html))) {
      const raw = m[1].trim().replace(/^\s*<!--/, '').replace(/-->\s*$/, '');
      try { out.push(JSON.parse(raw)); }
      catch { /* 略過壞掉的區塊 */ }
    }
    return out;
  }
  function typesOf(node) {
    const t = node && node['@type'];
    if (!t) return [];
    return (Array.isArray(t) ? t : [t]).map(x => String(x));
  }
  function collectPlaces(node, out, seen) {
    if (!node || typeof node !== 'object') return;
    if (seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) { node.forEach(n => collectPlaces(n, out, seen)); return; }
    if (node['@graph']) collectPlaces(node['@graph'], out, seen);
    const types = typesOf(node);
    const name = typeof node.name === 'string' ? node.name.trim() : '';
    if (name && types.some(t => PLACE_TYPE.test(t)) && !badName(name)) out.push(node);
    for (const k of Object.keys(node)) {
      if (k === '@context') continue;
      if (node[k] && typeof node[k] === 'object') collectPlaces(node[k], out, seen);
    }
  }
  function scorePlace(node) {
    const types = typesOf(node).join(' ');
    let s = 0;
    if (FOOD_TYPE.test(types)) s += 5;
    if (/LocalBusiness|Tourist|Lodging|Hotel|Store/i.test(types)) s += 3;
    if (node.geo) s += 4;
    if (node.address) s += 2;
    if (/^Place$/i.test(types) && !node.geo) s -= 2;
    return s;
  }
  function geoOf(node) {
    const g = node && (node.geo || (node.location && node.location.geo));
    if (!g) return null;
    if (Array.isArray(g)) return geoOf({ geo: g[0] });
    return coord(g.latitude != null ? g.latitude : g.lat, g.longitude != null ? g.longitude : g.lng);
  }
  function addrOf(node) {
    const a = node && node.address;
    if (!a) return '';
    if (typeof a === 'string') return dec(a);
    const country = { JP: '日本', TW: '台灣', KR: '韓國', TH: '泰國', US: '美國', CN: '中國', HK: '香港', SG: '新加坡' };
    const bits = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode, country[String(a.addressCountry || '').toUpperCase()] || a.addressCountry].map(x => dec(x)).filter(Boolean);
    const kept = [];
    for (const bit of bits) {
      if (kept.some(prev => prev.includes(bit) || bit.includes(prev))) continue;
      kept.push(bit);
    }
    return kept.join(' ');
  }
  function htmlAddress(html) {
    const boxed = /rstinfo-table__address[^>]*>([\s\S]{4,240}?)<\//i.exec(html);
    const row = /(?:地址|住所)\s*<\/(?:th|dt)>[\s\S]{0,500}?<(?:td|dd)[^>]*>([\s\S]{4,700}?)<\/(?:td|dd)>/i.exec(html);
    const raw = (boxed && boxed[1]) || (row && row[1]) || '';
    if (!raw) return '';
    const text = dec(raw.replace(/<[^>]+>/g, ' ')).split(/看大地圖|地図|地圖|尋找週邊/)[0].replace(/\s+/g, ' ').trim();
    return text.length >= 4 ? text : '';
  }
  function embedded(html) {
    const found = [];
    const re = /https?:(?:\\\/|\/){2}[^"'\\\s<>]+/g;
    let m;
    while ((m = re.exec(String(html || '')))) {
      let u = m[0].replace(/\\\//g, '/').replace(/\\u0026/gi, '&').replace(/&amp;/g, '&').replace(/[,.)]+$/g, '');
      if (/google\.[^/\s]+\/maps|maps\.google\.|maps\.apple\.com|tabelog\.com/i.test(u)) found.push(u);
    }
    const src = /^URL Source:\s*(\S+)/m.exec(html);
    if (src) found.push(src[1]);
    return found;
  }
  function parseHtml(html, pageUrl) {
    html = String(html || '');
    const places = [];
    jsonBlocks(html).forEach(b => collectPlaces(b, places, new Set()));
    places.sort((a, b) => scorePlace(b) - scorePlace(a));
    const best = places[0];
    const spot = { name: '', addr: '', lat: null, lng: null, rating: '', food: false, note: '' };
    if (best) {
      spot.name = cleanLabel(best.name);
      spot.addr = htmlAddress(html) || addrOf(best);
      const g = geoOf(best);
      if (g) { spot.lat = g.lat; spot.lng = g.lng; }
      const ar = best.aggregateRating;
      if (ar && ar.ratingValue) spot.rating = String(ar.ratingValue);
      if (FOOD_TYPE.test(typesOf(best).join(' '))) spot.food = true;
    }
    if (!spot.addr) spot.addr = htmlAddress(html);
    if (!spot.name) spot.name = cleanLabel(cleanTitle(meta(html, 'og:title') || meta(html, 'twitter:title') || pageTitle(html)));
    if (badName(spot.name)) spot.name = '';
    if (spot.lat == null || !spot.name) {
      for (const u of embedded(html)) {
        const p = parseUrl(u);
        if (!p) continue;
        if (!spot.name && p.name) spot.name = p.name;
        if (spot.lat == null && p.lat != null) { spot.lat = p.lat; spot.lng = p.lng; }
        if (p.note) spot.note = p.note;
        if (spot.name && spot.lat != null) break;
      }
    }
    if (spot.lat == null) {
      const m = /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(html);
      if (m) {
        const c = coord(m[1], m[2]);
        if (c) { spot.lat = c.lat; spot.lng = c.lng; }
      }
    }
    if (pageUrl) {
      const p = parseUrl(pageUrl);
      if (p) {
        if (!spot.name && p.name) spot.name = p.name;
        if (spot.lat == null && p.lat != null) { spot.lat = p.lat; spot.lng = p.lng; }
      }
    }
    return spot;
  }
  function richer(a, b) {
    if (!a) return b || '';
    if (!b) return a;
    const score = s => (/\d/.test(s) ? 3 : 0) + Math.min(String(s).length, 80) / 40;
    return score(b) > score(a) + 0.2 ? b : a;
  }
  function localize(spot, placeq) {
    const Q = placeq || (typeof PlaceQ !== 'undefined' ? PlaceQ : null);
    if (!Q) return spot;
    if (spot.addr && Q.zhText) spot.addr = Q.zhText(spot.addr);
    if (Q.hint) {
      const hint = Q.hint(spot.name);
      if (hint && hint !== spot.name) spot.hint = hint;
    }
    return spot;
  }
  async function defaultFetch(url) {
    const r = await fetch('https://r.jina.ai/' + url, {
      signal: AbortSignal.timeout(22000),
      headers: { 'X-Respond-With': 'html', 'X-No-Cache': 'true', Accept: 'text/html,text/plain;q=0.9,*/*;q=0.8' }
    });
    if (!r.ok) throw new Error('http');
    return r.text();
  }
  async function defaultReverse(lat, lng) {
    const q = 'lat=' + encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lng) + '&limit=1';
    let r = await fetch('https://photon.komoot.io/reverse?' + q + '&lang=default', { signal: AbortSignal.timeout(8000) });
    if (r.status === 400) r = await fetch('https://photon.komoot.io/reverse?' + q, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error('http');
    const j = await r.json();
    const f = (j.features || [])[0];
    if (!f) return null;
    const p = f.properties || {};
    const parts = [p.street, p.locality, p.district, p.city, p.state, p.country].filter(Boolean);
    return { name: p.name || '', addr: parts.join(' · ') };
  }
  async function defaultSearch(q, dest) {
    if (typeof placeSearch === 'function') return placeSearch(q, dest);
    if (typeof geoSearch === 'function') return geoSearch(q, dest);
    if (typeof PlaceQ !== 'undefined' && PlaceQ.search) {
      try { return await PlaceQ.search(q, { limit: 8, few: 3 }); } catch (e) { return []; }
    }
    return [];
  }
  async function resolve(input, opt) {
    opt = opt || {};
    const url = hrefOf(input);
    if (!url || !ready(input)) return { ok: false, message: FAIL };
    const direct = parseUrl(url);
    let spot = direct || { name: '', addr: '', lat: null, lng: null, kind: kind(url), source: SRC.web, url, food: false, note: '', rating: '' };
    const needsFetch = !!(spot.short || spot.kind === 'tabelog' || spot.kind === 'instagram' || spot.kind === 'web' || (!spot.name && spot.lat == null));
    if (needsFetch) {
      const target = spot.kind === 'tabelog' ? readerTarget(url) : url;
      let html = '';
      try { html = await (opt.fetchText || defaultFetch)(target); }
      catch { html = ''; }
      const parsed = parseHtml(html, target);
      if (parsed.name && !spot.name) spot.name = parsed.name;
      spot.addr = richer(spot.addr, parsed.addr);
      if (spot.lat == null && parsed.lat != null) { spot.lat = parsed.lat; spot.lng = parsed.lng; }
      if (parsed.rating) spot.rating = parsed.rating;
      if (parsed.food) spot.food = true;
      if (parsed.note && !spot.note) spot.note = parsed.note;
    }
    if (spot.lat != null && !spot.addr) {
      try {
        const rev = await (opt.reverse || defaultReverse)(spot.lat, spot.lng);
        if (rev) {
          if (!spot.name && rev.name && !badName(rev.name)) spot.name = rev.name;
          if (rev.addr) spot.addr = rev.addr;
        }
      } catch { /* 沒有地址仍可用座標 */ }
    }
    if (spot.lat == null && spot.name) {
      try {
        const q = [spot.name, spot.addr].filter(Boolean).join(' ');
        const hits = await (opt.search || (qq => defaultSearch(qq, opt.dest)))(q) || [];
        const hit = hits[0];
        if (hit && hit.lat != null) {
          if (!spot.name) spot.name = hit.name;
          spot.lat = +hit.lat;
          spot.lng = +hit.lng;
          if (hit.addr) spot.addr = richer(spot.addr, hit.addr);
          if (hit.hint) spot.hint = hit.hint;
        }
      } catch { /* 找不到座標仍保留店名 */ }
    }
    if (!spot.name || badName(spot.name)) return { ok: false, message: FAIL };
    spot.url = url;
    spot.hint = spot.hint || '';
    localize(spot, opt.placeq);
    return { ok: true, spot };
  }

  return { FAIL, isUrl, ready, kind, parseUrl, readerTarget, parseHtml, resolve };
});
