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
  const u = 'https://api.transitous.org/api/v1/plan?fromPlace=' + a.lat.toFixed(5) + ',' + a.lng.toFixed(5) + '&toPlace=' + b.lat.toFixed(5) + ',' + b.lng.toFixed(5) + '&time=' + encodeURIComponent(iso) + '&numItineraries=1';
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
function stepHtml(s) {
  const esc = TM.esc;
  if (s.kind === 'walk') {
    if (s.to) return `<div class="legstep">步行到 <b>${esc(s.to)}</b>${s.min ? '（約 ' + s.min + ' 分）' : ''}</div>`;
    if (s.from) return `<div class="legstep">在 <b>${esc(s.from)}</b> 下車後，步行約 ${s.min || 1} 分到目的地</div>`;
    return `<div class="legstep">這段步行約 ${s.min || 1} 分</div>`;
  }
  const swatch = s.color ? `<i class="legswatch" style="background:${esc(s.color)}"></i>` : '';
  const shown = safeLine(s);
  const orig = s.lineOrig && s.lineOrig !== shown ? '（' + esc(s.lineOrig) + '）' : '';
  const line = `<span class="legline">${swatch}${esc(shown)}${orig}</span>`;
  const dir = s.direction ? ' 往 ' + esc(s.direction) : '';
  const bits = [];
  if (s.stops) bits.push(s.stops + ' 站');
  if (s.min) bits.push('約 ' + s.min + ' 分');
  const meta = bits.length ? '（' + bits.join('，') + '）' : '';
  const alight = s.alight ? `<div class="legalight">在 ${esc(s.alight)} 下車${meta}</div>` : '';
  return `<div class="legstep">搭 ${line}${dir}${alight}</div>`;
}
function planHtml(plan) {
  if (!plan || !plan.steps) return '';
  const esc = TM.esc;
  const steps = plan.steps.map(stepHtml).join('');
  const fare = plan.fare ? `<div class="legfare">車資${esc(plan.fare)}</div>` : '';
  const note = plan.note ? `<div class="legfare">${esc(plan.note)}</div>` : '';
  return steps + fare + note;
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
  if (!box) return;
  const t = window.TM && TM.T ? TM.T() : null;
  if (!t || !rec) { box.innerHTML = ''; return; }
  const g = `<a href="${TM.esc(rec.gmaps)}" target="_blank" rel="noopener">Google 路線</a>`;
  const off = rec.official ? `<a href="${TM.esc(rec.official.url)}" target="_blank" rel="noopener">${TM.esc(rec.official.label)}</a>` : '';
  const links = `<div class="leglinks">${g}${off}</div>`;
  const body = rec.plan ? planHtml(rec.plan) : `<div class="legstep">${TM.esc(rec.text || (rec.offline ? '目前離線，顯示上次查到的走法' : '正在查這段怎麼搭…'))}</div>`;
  box.innerHTML = body + links;
  if (rec && rec.plan && rec.plan.min && typeof paintShift === 'function') paintShift(key, rec.plan.min);
}
async function fillOne(key, a, b, when, fromName, toName, dest) {
  const ck = [a.lat.toFixed(3), a.lng.toFixed(3), b.lat.toFixed(3), b.lng.toFixed(3), when.toISOString().slice(0, 16)].join('|');
  const hit = LIVE.get(ck);
  const official = officialTransit(dest, fromName, toName, when);
  const gmaps = gmapsTransit(a, b, when);
  if (hit && Date.now() - hit.at < LIVE_TTL) { paintLive(key, Object.assign({ gmaps, official }, hit)); return; }
  paintLive(key, { gmaps, official, text: '', at: hit && hit.at });
  if (navigator.onLine === false) {
    if (hit) paintLive(key, Object.assign({ gmaps, official, offline: true }, hit));
    else {
      const plan = window.Legs && (Legs.knownRoute(a, b) || Legs.nearbyPlan(a, b));
      paintLive(key, { gmaps, official, plan, text: plan ? '' : '目前離線，這段還沒查過', offline: true, at: 0 });
    }
    return;
  }
  try {
    let plan = null;
    try {
      const raw = await askTransit(a, b, when);
      plan = window.Legs ? Legs.fromTransitous(raw) : null;
    } catch (e) { plan = null; }
    if (plan && !plan.fare) plan = withTableFare(plan, a, b);
    if (!plan) plan = await fallbackPlan(a, b);
    const rec = { at: Date.now(), plan, text: plan ? '' : '這段沒查到班次', gmaps, official };
    LIVE.set(ck, rec);
    paintLive(key, rec);
  } catch (e) {
    const rec = hit ? Object.assign({ gmaps, official, offline: true }, hit) : { at: 0, text: '班次暫時查不到，可開地圖看', gmaps, official };
    paintLive(key, rec);
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
