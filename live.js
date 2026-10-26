/* 景點之間的交通：Google 路線、日韓台官方時刻連結，以及免金鑰的 Transitous 班次。 */
const LIVE = new Map();
const LIVE_TTL = 10 * 60 * 1000;
function regionOf(dest) {
  const c = (window.TM && TM.cityOf && TM.cityOf(dest)) || dest || '';
  if (/東京|大阪|京都|福岡|沖繩|札幌|名古屋|日本/.test(c)) return 'jp';
  if (/台北|臺北|高雄|台灣|臺灣/.test(c)) return 'tw';
  if (/首爾|釜山|韓國/.test(c)) return 'kr';
  return '';
}
function pad2(n) { return String(n).padStart(2, '0'); }
function departAt(trip, day, time) {
  const base = new Date((trip.dep || '2026-01-01') + 'T' + (time || '09:00') + ':00');
  if (isNaN(base)) return new Date();
  base.setDate(base.getDate() + day);
  return base;
}
function gmapsTransit(a, b, when) {
  const dep = when ? Math.floor(when.getTime() / 1000) : '';
  return 'https://www.google.com/maps/dir/?api=1&origin=' + a.lat + ',' + a.lng + '&destination=' + b.lat + ',' + b.lng + '&travelmode=transit' + (dep ? '&departure_time=' + dep : '');
}
function officialTransit(dest, fromName, toName, when) {
  const area = regionOf(dest);
  const y = when.getFullYear(), m = when.getMonth() + 1, d = when.getDate(), hh = when.getHours(), mm = when.getMinutes();
  if (area === 'jp') {
    return { label: 'Yahoo!乘換', url: 'https://transit.yahoo.co.jp/search/result?from=' + encodeURIComponent(fromName) + '&to=' + encodeURIComponent(toName) + '&y=' + y + '&m=' + pad2(m) + '&d=' + pad2(d) + '&hh=' + hh + '&m1=' + Math.floor(mm / 10) + '&m2=' + (mm % 10) + '&type=1&ticket=ic&al=1&shin=1&ex=1&hb=1&lb=1&sr=1' };
  }
  if (area === 'tw') {
    return { label: '台鐵時刻', url: 'https://www.railway.gov.tw/tra-tip-web/tip/tip001/tip112/query' };
  }
  if (area === 'kr') {
    return { label: 'Kakao 路線', url: 'https://map.kakao.com/?sName=' + encodeURIComponent(fromName) + '&eName=' + encodeURIComponent(toName) };
  }
  return null;
}
function agoText(at) {
  const s = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (s < 15) return '剛剛';
  if (s < 3600) return (Math.round(s / 60) || 1) + '分前';
  const d = new Date(at);
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
async function askTransit(a, b, when) {
  const off = -when.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const abs = Math.abs(off);
  const iso = when.getFullYear() + '-' + pad2(when.getMonth() + 1) + '-' + pad2(when.getDate()) + 'T' + pad2(when.getHours()) + ':' + pad2(when.getMinutes()) + ':00' + sign + pad2(Math.floor(abs / 60)) + ':' + pad2(abs % 60);
  const u = 'https://api.transitous.org/api/v1/plan?fromPlace=' + a.lat.toFixed(5) + ',' + a.lng.toFixed(5) + '&toPlace=' + b.lat.toFixed(5) + ',' + b.lng.toFixed(5) + '&time=' + encodeURIComponent(iso) + '&numItineraries=4';
  const r = await fetch(u, { signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw 0;
  return r.json();
}
function safeLine(s) {
  const line = String(s && s.line || '').trim();
  if (line && !/^[\d\s._:\-\/]+$/.test(line)) return line;
  if (window.Legs && Legs.modeWord) return Legs.modeWord(s && s.mode);
  return '電車';
}
function sourceTag(src) {
  if (src === 'transitous') return '時刻表估計';
  if (src === 'table') return '常見路線';
  if (src === 'nearby') return '附近站估計';
  return '直線估算';
}
function meterText(m) {
  m = Math.round(+m || 0);
  if (m < 40) return '';
  if (m >= 1000) {
    const n = m >= 10000 ? String(Math.round(m / 1000)) : (m / 1000).toFixed(1);
    return '約 ' + n + ' 公里';
  }
  return '約 ' + m + ' 公尺';
}
function stepHtml(s) {
  const esc = TM.esc;
  if (s.kind === 'walk') {
    const bits = [];
    if (s.min) bits.push('約 ' + s.min + ' 分');
    const dist = meterText(s.meters);
    if (dist) bits.push(dist);
    const meta = bits.length ? '（' + bits.join('，') + '）' : '';
    if (s.to) return `<div class="legstep"><span class="legk">步行</span>到 <b>${esc(s.to)}</b>${meta}</div>`;
    if (s.from) return `<div class="legstep"><span class="legk">步行</span>在 <b>${esc(s.from)}</b> 下車後，再到目的地${meta}</div>`;
    return `<div class="legstep"><span class="legk">步行</span>${meta || '這一段用走的'}</div>`;
  }
  if (s.line === '開車' || s.mode === 'CAR') {
    return `<div class="legstep"><span class="legk">開車</span>${s.min ? '約 ' + s.min + ' 分' : ''}</div>`;
  }
  const swatch = s.color ? `<i class="legswatch" style="background:${esc(s.color)}"></i>` : '';
  const shown = safeLine(s);
  const orig = s.lineOrig && s.lineOrig !== shown ? '（' + esc(s.lineOrig) + '）' : '';
  const line = `<span class="legline">${swatch}${esc(shown)}${orig}</span>`;
  const dir = s.direction ? ' 往 ' + esc(s.direction) : '';
  const boardBits = [];
  if (s.board) boardBits.push('從 <b>' + esc(s.board) + '</b> 進站');
  if (s.boardPlatform) boardBits.push(esc(s.boardPlatform));
  const board = boardBits.length ? `<div class="legboard">${boardBits.join(' · ')}</div>` : '';
  const rideBits = [];
  if (s.stops) rideBits.push('行經 ' + s.stops + ' 站');
  if (s.min) rideBits.push('約 ' + s.min + ' 分');
  const meta = rideBits.length ? `<div class="legfare">${rideBits.join(' · ')}</div>` : '';
  let alight = '';
  if (s.alight) {
    const tail = s.alightPlatform ? ' · ' + esc(s.alightPlatform) : '';
    alight = `<div class="legalight">${esc(s.alight)} 下車${tail}</div>`;
  }
  return `<div class="legstep">${board}<div>搭 ${line}${dir}</div>${alight}${meta}</div>`;
}
function planHtml(plan) {
  if (!plan || !plan.steps) return '';
  const esc = TM.esc;
  const tag = plan.source ? sourceTag(plan.source) : '';
  const total = plan.min ? `<div class="legtotal"><b>約 ${+plan.min} 分</b>${tag ? `<span>${esc(tag)}</span>` : ''}</div>` : '';
  const steps = plan.steps.map(stepHtml).join('');
  const fare = plan.fare ? `<div class="legfare">車資${esc(plan.fare)}</div>` : '';
  const note = plan.note ? `<div class="legfare">${esc(plan.note)}</div>` : '';
  return total + steps + fare + note;
}
function spotOf(key) {
  const parts = String(key || '').split(':');
  const t = window.TM && TM.T ? TM.T() : null;
  return t && t.days && t.days[+parts[0]] && t.days[+parts[0]][+parts[1]];
}
function shownOption(key, options) {
  const cur = spotOf(key);
  const id = cur && cur.travel && cur.travel.opt;
  if (id) {
    const hit = (options || []).find(o => o.id === id);
    if (hit) return hit;
    if (cur.travel.plan && cur.travel.plan.steps) return cur.travel.plan;
  }
  const mode = cur && cur.travel && cur.travel.mode;
  return (options || []).find(o => !mode || o.mode === mode) || (options || [])[0] || null;
}
function routeBrief(o) {
  return (o.steps || []).map(s => {
    if (s.kind === 'walk') return '步行' + (s.min ? s.min + '分' : '');
    if (s.line === '開車' || s.mode === 'CAR') return '開車' + (s.min ? s.min + '分' : '');
    return (s.line || '搭車') + (s.min ? s.min + '分' : '');
  }).filter(Boolean).slice(0, 4).join(' · ');
}
function planBriefHtml(plan) {
  if (!plan) return '';
  const esc = TM.esc;
  const line = routeBrief(plan);
  const tag = plan.source ? sourceTag(plan.source) : '';
  if (!line && !tag) return '';
  return `<div class="legbrief">${line ? esc(line) : ''}${tag ? `<span>${esc(tag)}</span>` : ''}</div>`;
}
function chipOptions(options, selectedId) {
  const list = options || [];
  const transit = list.some(o => o.mode === 'transit' && +o.min > 0 && +o.min < 180);
  return list.filter(o => o.id === selectedId || !(o.mode === 'walk' && +o.min > 90 && transit));
}
function routeChipsHtml(key, options, selectedId) {
  const esc = TM.esc;
  const parts = String(key).split(':');
  const day = +parts[0], j = +parts[1];
  const cur = spotOf(key);
  const picked = cur && cur.travel && cur.travel.src === 'pick' ? cur.travel.opt : '';
  const shown = selectedId || '';
  const list = chipOptions(options, picked || shown);
  if (list.length < 2) return '';
  return `<div class="ropts" role="listbox" aria-label="其他走法">` + list.map(o => {
    const on = picked && o.id === picked;
    const suggest = !picked && shown && o.id === shown;
    return `<button type="button" role="option" aria-selected="${on ? 'true' : 'false'}" class="ropt${on ? ' on' : ''}${suggest ? ' suggest' : ''}" data-rid="${esc(o.id)}" onclick="pickRoute(${day},${j},this.dataset.rid)"><b>${esc(o.label)}</b><span>約 ${+o.min || 0} 分</span><small>${esc(sourceTag(o.source))}</small></button>`;
  }).join('') + `</div>`;
}
function routeCardsHtml(key, options, selectedId) {
  const esc = TM.esc;
  const parts = String(key).split(':');
  const day = +parts[0], j = +parts[1];
  const picked = selectedId || '';
  return (options || []).map((o, i) => {
    const on = picked && o.id === picked;
    const open = on || (!picked && i === 0);
    const steps = open ? planHtml(o) : '';
    const brief = routeBrief(o);
    return `<div class="ropt-wrap"><button type="button" class="ropt ropt-rich${on ? ' on' : ''}" data-rid="${esc(o.id)}" onclick="pickRoute(${day},${j},this.dataset.rid)" aria-pressed="${on ? 'true' : 'false'}"><span class="ropt-h"><b>${esc(o.label)}</b><span>約 ${+o.min || 0} 分</span></span>${brief ? `<small class="ropt-brief">${esc(brief)}</small>` : ''}<small>${esc(sourceTag(o.source))}${on ? ' · 使用中' : ''}</small></button>${steps ? `<div class="ropt-detail">${steps}</div>` : ''}</div>`;
  }).join('');
}
function withMode(url, mode) {
  const tm = mode === 'walk' ? 'walking' : mode === 'drive' ? 'driving' : 'transit';
  if (!url) return '';
  if (/travelmode=/.test(url)) return url.replace(/travelmode=[a-z]+/i, 'travelmode=' + tm);
  return url + '&travelmode=' + tm;
}
async function overpassStop(p) {
  const q = '[out:json][timeout:12];node(around:1200,' + p.lat + ',' + p.lng + ')["railway"="station"];out tags 8;';
  const hosts = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  for (const host of hosts) {
    try {
      const r = await fetch(host + '?data=' + encodeURIComponent(q), { signal: AbortSignal.timeout(9000) });
      if (!r.ok) continue;
      const j = await r.json();
      const nodes = (j.elements || []).filter(e => e && e.tags && (e.tags['name:zh-Hant'] || e.tags['name:zh'] || e.tags.name) && e.lat != null);
      if (!nodes.length) continue;
      nodes.sort((a, b) => Legs.km(p, { lat: a.lat, lng: a.lon }) - Legs.km(p, { lat: b.lat, lng: b.lon }));
      const n = nodes[0];
      const name = n.tags['name:zh-Hant'] || n.tags['name:zh'] || n.tags.name;
      return { name: Legs.stationZh(name) || name, lat: +n.lat, lng: +n.lon, km: Legs.km(p, { lat: +n.lat, lng: +n.lon }) };
    } catch (e) {}
  }
  return null;
}
function withTableFare(plan, a, b) {
  if (!plan || plan.fare || !window.Legs) return plan;
  const known = Legs.knownRoute(a, b);
  if (!known || !known.fare || known.alight !== plan.alight) return plan;
  const ride = (plan.steps || []).find(s => s.kind === 'ride');
  const kride = (known.steps || []).find(s => s.kind === 'ride');
  if (!ride || !kride) return plan;
  const blob = (ride.line || '') + (ride.lineOrig || '') + (ride.short || '');
  const mark = (kride.lineOrig || kride.line || '').replace(/\s+/g, '');
  if (mark && blob.includes(mark.slice(0, 4))) plan.fare = known.fare;
  return plan;
}
async function fallbackPlan(a, b) {
  if (!window.Legs) return null;
  const known = Legs.knownRoute(a, b);
  if (known) return known;
  let from = null, to = null;
  try { [from, to] = await Promise.all([overpassStop(a), overpassStop(b)]); } catch (e) {}
  return Legs.nearbyPlan(a, b, from, to);
}
function paintLive(key, rec) {
  const box = document.querySelector('[data-live="' + key + '"]');
  const ago = document.querySelector('[data-ago="' + key + '"]');
  const mover = ago && ago.previousElementSibling;
  if (ago) {
    ago.textContent = rec && rec.at ? agoText(rec.at) : '';
    if (mover && mover.classList) { mover.classList.add('is-fresh'); setTimeout(() => mover.classList.remove('is-fresh'), 800); }
  }
  const options = rec && rec.options && rec.options.length ? rec.options : (rec && rec.plan ? [rec.plan] : []);
  window.__routeOpts = window.__routeOpts || {};
  if (options.length) {
    if (rec.sig) options.sig = rec.sig;
    window.__routeOpts[key] = options;
  }
  const selected = shownOption(key, options);
  const host = document.getElementById('ropts');
  if (host && host.dataset.key === key && options.length) host.innerHTML = routeCardsHtml(key, options, (spotOf(key) && spotOf(key).travel && spotOf(key).travel.opt) || '');
  if (!box) {
    if (selected && selected.min && typeof paintShift === 'function') paintShift(key, selected.min);
    return;
  }
  const t = window.TM && TM.T ? TM.T() : null;
  if (!t || !rec) { box.innerHTML = ''; return; }
  const mode = selected && selected.mode;
  const g = rec.gmaps ? `<a href="${TM.esc(withMode(rec.gmaps, mode))}" target="_blank" rel="noopener">在 Google 地圖看即時路線</a>` : '';
  const off = rec.official ? `<a href="${TM.esc(rec.official.url)}" target="_blank" rel="noopener">${TM.esc(rec.official.label)}</a>` : '';
  const links = `<div class="leglinks">${g}${off}</div>`;
  const picked = spotOf(key) && spotOf(key).travel && spotOf(key).travel.src === 'pick' ? spotOf(key).travel.opt : '';
  const body = selected && selected.steps ? planBriefHtml(selected) : `<div class="legstep">${TM.esc(rec.text || (rec.offline ? '目前離線，先顯示估計走法' : '正在查這段怎麼搭…'))}</div>`;
  const chips = routeChipsHtml(key, options, selected && selected.id);
  box.innerHTML = body + chips + links;
  if (!picked && selected && selected.id) box.querySelectorAll('.ropt').forEach(btn => { if (btn.dataset.rid === selected.id) btn.classList.add('suggest'); });
  if (selected && selected.min && typeof paintShift === 'function') paintShift(key, selected.min);
}
const PENDING = new Map();
async function fillOne(key, a, b, when, fromName, toName, dest) {
  const ck = [a.lat.toFixed(3), a.lng.toFixed(3), b.lat.toFixed(3), b.lng.toFixed(3), when.toISOString().slice(0, 16)].join('|');
  const hit = LIVE.get(ck);
  const official = officialTransit(dest, fromName, toName, when);
  const gmaps = gmapsTransit(a, b, when);
  const fresh = hit && hit.options && Date.now() - hit.at < LIVE_TTL;
  const sig = [a.lat.toFixed(3), a.lng.toFixed(3), b.lat.toFixed(3), b.lng.toFixed(3)].join('|');
  if (fresh) { paintLive(key, Object.assign({ gmaps, official, sig }, hit)); return; }
  const quick = window.Legs && Legs.choices ? Legs.choices(a, b, []) : [];
  if (!(hit && hit.options)) paintLive(key, { gmaps, official, options: quick, sig, at: hit && hit.at });
  if (navigator.onLine === false) {
    const rec = hit && hit.options ? Object.assign({ gmaps, official, offline: true, sig }, hit) : { gmaps, official, options: quick, offline: true, sig, at: 0, text: quick.length ? '' : '目前離線，這段還沒查過' };
    paintLive(key, rec);
    return;
  }
  if (PENDING.has(ck)) {
    PENDING.get(ck).then(rec => { if (rec) paintLive(key, Object.assign({ gmaps, official }, rec)); }).catch(() => {});
    return;
  }
  const job = (async () => {
    let plans = [];
    try {
      const raw = await askTransit(a, b, when);
      plans = window.Legs && Legs.fromTransitousAll ? Legs.fromTransitousAll(raw) : [];
      plans = plans.map(p => withTableFare(p, a, b)).filter(Boolean);
    } catch (e) { plans = []; }
    if (!plans.length) {
      try {
        const fb = await fallbackPlan(a, b);
        if (fb) plans = [fb];
      } catch (e) {}
    }
    const options = window.Legs && Legs.choices ? Legs.choices(a, b, plans) : quick;
    const rec = { at: plans.length ? Date.now() : Date.now() - (LIVE_TTL - 45000), options, gmaps, official, sig, text: options.length ? '' : '這段沒查到班次' };
    LIVE.set(ck, rec);
    return rec;
  })();
  PENDING.set(ck, job);
  try {
    const rec = await job;
    paintLive(key, rec);
  } catch (e) {
    const rec = hit && hit.options ? Object.assign({ gmaps, official, offline: true, sig }, hit) : { at: 0, options: quick, text: '班次暫時查不到，可開地圖看', gmaps, official, sig };
    paintLive(key, rec);
  } finally {
    PENDING.delete(ck);
  }
}
function fillLive() {
  if (!window.TM || !TM.T || TM.getTab() !== 'edit') return;
  const t = TM.T();
  if (!t) return;
  document.querySelectorAll('[data-live]').forEach(el => {
    const parts = (el.dataset.live || '').split(':');
    const day = +parts[0], j = +parts[1];
    const d = t.days && t.days[day];
    const prev = d && d[j - 1], cur = d && d[j];
    if (!prev || !cur || typeof ll !== 'function') return;
    const a = ll(prev), b = ll(cur);
    if (!a || !b) return;
    const when = departAt(t, day, cur.time || prev.time || '09:00');
    const key = el.dataset.live;
    fillOne(key, a, b, when, prev.name || '出發', cur.name || '抵達', t.dest);
  });
}
addEventListener('online', () => { LIVE.forEach((v, k) => { v.at = 0; }); if (typeof fillLive === 'function') fillLive(); });
