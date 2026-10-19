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
function hmLocal(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}
function summarizeItin(j) {
  const it = j && j.itineraries && j.itineraries[0];
  if (!it) return null;
  const ride = (it.legs || []).find(lg => lg && lg.mode && lg.mode !== 'WALK');
  if (!ride) return { text: '這段步行就可到', realtime: false };
  const short = String(ride.routeShortName || '').trim();
  const human = short && short.length <= 10 && !/^\d{5,}$/.test(short);
  const modeL = { SUBWAY: '地鐵', BUS: '公車', TRAM: '路面電車', RAIL: '鐵路', REGIONAL_RAIL: '鐵路', HIGHSPEED_RAIL: '高鐵', METRO: '地鐵', FERRY: '渡輪', COACH: '客運' }[ride.mode] || '';
  const name = human ? short : ([ride.agencyName, modeL].filter(Boolean).join(' ') || '大眾運輸');
  const head = ride.headsign || (ride.to && ride.to.name) || '';
  const when = hmLocal(ride.startTime || ride.scheduledStartTime);
  const rt = ride.realTime ? '即時' : '時刻表';
  return { text: [name, when ? when + ' 開' : '', head ? '往' + head : '', rt].filter(Boolean).join(' · '), realtime: !!ride.realTime };
}
async function askTransit(a, b, when) {
  const off = -when.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const abs = Math.abs(off);
  const iso = when.getFullYear() + '-' + pad2(when.getMonth() + 1) + '-' + pad2(when.getDate()) + 'T' + pad2(when.getHours()) + ':' + pad2(when.getMinutes()) + ':00' + sign + pad2(Math.floor(abs / 60)) + ':' + pad2(abs % 60);
  const u = 'https://api.transitous.org/api/v1/plan?fromPlace=' + a.lat.toFixed(5) + ',' + a.lng.toFixed(5) + '&toPlace=' + b.lat.toFixed(5) + ',' + b.lng.toFixed(5) + '&time=' + encodeURIComponent(iso) + '&numItineraries=1';
  const r = await fetch(u, { signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw 0;
  return summarizeItin(await r.json());
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
  const tx = rec.text ? `<span>${TM.esc(rec.text)}</span>` : `<span>${rec.offline ? '目前離線，顯示上次查到的班次' : '正在查班次…'}</span>`;
  box.innerHTML = tx + g + off;
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
    return;
  }
  try {
    const sum = await askTransit(a, b, when);
    const rec = { at: Date.now(), text: sum ? sum.text : '這段沒查到班次', gmaps, official };
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
