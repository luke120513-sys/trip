/* 行程連結與備份檢查。不碰畫面。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SharePack = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SOFT = 1900;
  const HARD = 7000;

  function dateOk(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }
  function str(s, n) { return String(s == null ? '' : s).slice(0, n); }
  function cleanStr(s) {
    s = String(s == null ? '' : s);
    if (s.indexOf('data:image') >= 0) s = s.replace(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, '');
    return s.trim();
  }
  function normSpot(s, level, keepIds) {
    if (!s || typeof s !== 'object' || Array.isArray(s)) return null;
    const name = str(cleanStr(s.name), 80).trim();
    if (!name) return null;
    const o = { name };
    const time = str(s.time, 8);
    if (time) o.time = time;
    if (level < 3) {
      const note = str(cleanStr(s.note), level >= 1 ? 40 : 180).trim();
      if (note) o.note = note;
    }
    if (level < 3 && typeof s.link === 'string' && /^https?:\/\//.test(s.link) && s.link.indexOf('data:image') < 0) o.link = s.link.slice(0, 300);
    ['kind', 'icon', 'ptype', 'from', 'to', 'arr', 'leg', 'iconLabel', 'priceLabel'].forEach(k => {
      if (s[k] == null || typeof s[k] === 'object') return;
      const v = str(cleanStr(s[k]), 40);
      if (v) o[k] = v;
    });
    if (Number.isFinite(+s.lat) && Number.isFinite(+s.lng)) { o.lat = +s.lat; o.lng = +s.lng; }
    if (+s.price > 0 && +s.price < 1e9) o.price = +s.price;
    if (keepIds && typeof s.sid === 'string' && s.sid) o.sid = str(s.sid, 40);
    if (keepIds && +s.rev > 0) o.rev = +s.rev;
    return o;
  }
  function normExp(e, level, keepIds) {
    if (level >= 2 || !e || typeof e !== 'object') return null;
    const title = str(cleanStr(e.title), 80).trim();
    const amount = +e.amount;
    if (!title || !(amount > 0) || amount > 1e9) return null;
    const o = { title, amount, currency: str(e.currency || 'TWD', 8).toUpperCase(), cat: str(e.cat || '其他', 12) };
    if (e.day != null && e.day !== '' && Number.isFinite(+e.day)) o.day = +e.day;
    if (level < 1) {
      const note = str(cleanStr(e.note), 180).trim();
      if (note) o.note = note;
    }
    if (e.rateKind === 'card' || e.rateKind === 'cash') o.rateKind = e.rateKind;
    if (+e.customRate > 0 && +e.customRate < 1e7) o.customRate = +e.customRate;
    if (e.feeOn === false) o.feeOn = false;
    else if (e.feeOn === true) o.feeOn = true;
    if (e.feePct != null && Number.isFinite(+e.feePct)) o.feePct = Math.min(20, Math.max(0, +e.feePct));
    if (typeof e.payer === 'string' && e.payer) o.payer = str(e.payer, 80);
    if (Array.isArray(e.parts)) o.parts = e.parts.filter(x => typeof x === 'string' && x).slice(0, 12).map(x => str(x, 80));
    if (keepIds && typeof e.id === 'string' && e.id) o.id = str(e.id, 40);
    if (keepIds && +e.rev > 0) o.rev = +e.rev;
    return o;
  }
  const TIX_TYPES = ['機票', '飯店', '交通', '門票', '餐廳', '其他'];
  function normTicket(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const name = str(cleanStr(raw.name), 80).trim();
    if (!name) return null;
    const o = { name, type: TIX_TYPES.indexOf(raw.type) >= 0 ? raw.type : '其他' };
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw.date || '')) o.date = raw.date;
    if (/^\d{2}:\d{2}$/.test(raw.time || '')) o.time = raw.time;
    if (raw.day != null && raw.day !== '' && Number.isFinite(+raw.day) && +raw.day >= 0 && +raw.day < 40) o.day = +raw.day | 0;
    const spot = str(cleanStr(raw.spot), 80).trim();
    if (spot) o.spot = spot;
    const booking = str(cleanStr(raw.booking), 40).trim();
    if (booking) o.booking = booking;
    const notes = str(cleanStr(raw.notes), 500).trim();
    if (notes) o.notes = notes;
    if (typeof raw.link === 'string' && /^https?:\/\//.test(raw.link) && raw.link.indexOf('data:') < 0) o.link = raw.link.slice(0, 300);
    if (typeof raw.id === 'string' && raw.id) o.id = str(raw.id, 40);
    const files = [];
    (Array.isArray(raw.files) ? raw.files : []).slice(0, 4).forEach(f => {
      if (!f || typeof f !== 'object' || !f.id) return;
      const file = { id: str(f.id, 40), name: str(cleanStr(f.name || '檔案'), 80), mime: str(f.mime || '', 80) };
      if (+f.bytes > 0 && +f.bytes < 9e6) file.bytes = Math.round(+f.bytes);
      if (typeof f.data === 'string' && f.data.length > 16 && f.data.length < 1600000 && /^[A-Za-z0-9+/=]+$/.test(f.data)) file.data = f.data;
      files.push(file);
    });
    if (files.length) o.files = files;
    return o;
  }
  function normTrip(t, level, keepIds) {
    if (!t || typeof t !== 'object' || Array.isArray(t)) return null;
    const dest = str(cleanStr(t.dest), 80).trim();
    const dep = str(t.dep, 10);
    const ret = str(t.ret, 10);
    if (!dest || !dateOk(dep) || !dateOk(ret) || ret < dep) return null;
    const daysIn = Array.isArray(t.days) ? t.days : [];
    const days = daysIn.slice(0, 40).map(d => Array.isArray(d) ? d.slice(0, 30).map(s => normSpot(s, level, keepIds)).filter(Boolean) : []);
    const expenses = Array.isArray(t.expenses) ? t.expenses.slice(0, 200).map(e => normExp(e, level, keepIds)).filter(Boolean) : [];
    const o = { dest, dep, ret, pax: Math.min(9, Math.max(1, (+t.pax | 0) || 1)), orig: str(t.orig || 'TPE', 8), days, expenses };
    if (keepIds && Array.isArray(t.tickets)) {
      const tickets = t.tickets.slice(0, 40).map(normTicket).filter(Boolean);
      if (tickets.length) o.tickets = tickets;
    }
    if (keepIds) {
      if (typeof t.id === 'string' && t.id) o.id = str(t.id, 40);
      if (typeof t.cloudId === 'string' && t.cloudId) o.cloudId = str(t.cloudId, 80);
      if (typeof t.inviteCode === 'string' && /^[A-Z0-9]{6}$/.test(t.inviteCode)) o.inviteCode = t.inviteCode;
      if (typeof t.ownerUid === 'string' && t.ownerUid) o.ownerUid = str(t.ownerUid, 80);
      if (+t.orderRev) o.orderRev = +t.orderRev;
      if (+t.metaRev) o.metaRev = +t.metaRev;
      if (t.tomb && typeof t.tomb === 'object' && !Array.isArray(t.tomb)) o.tomb = t.tomb;
      if (t.expTomb && typeof t.expTomb === 'object' && !Array.isArray(t.expTomb)) o.expTomb = t.expTomb;
      if (Array.isArray(t.expSeen)) o.expSeen = t.expSeen.filter(x => typeof x === 'string').slice(0, 400);
    }
    return o;
  }
  function validateTrips(input, opts) {
    opts = opts || {};
    let arr = input;
    if (input && !Array.isArray(input) && typeof input === 'object' && Array.isArray(input.trips)) arr = input.trips;
    if (!Array.isArray(arr)) return { ok: false, error: '這不是行程備份。請選旅伴匯出的 JSON。' };
    if (!arr.length) return { ok: false, error: '檔案裡沒有行程' };
    if (arr.length > 40) return { ok: false, error: '一次最多 40 份行程' };
    const trips = [];
    for (let i = 0; i < arr.length; i++) {
      const n = normTrip(arr[i], 0, !!opts.backup);
      if (!n) return { ok: false, error: '有一份行程缺少目的地或日期' };
      trips.push(n);
    }
    return { ok: true, trips };
  }
  function packTrip(trip, lz) {
    if (!lz || typeof lz.compressToEncodedURIComponent !== 'function') return { error: '壓縮工具沒有載入' };
    let packed = null;
    for (let level = 0; level <= 3; level++) {
      const slim = normTrip(trip, level, false);
      if (!slim) return { error: '這份行程還不能分享' };
      const param = lz.compressToEncodedURIComponent(JSON.stringify({ v: 1, type: 'trip', trip: slim }));
      packed = { param, level, len: param.length };
      if (param.length <= SOFT) break;
    }
    return {
      param: packed.param,
      len: packed.len,
      level: packed.level,
      warn: packed.len > SOFT,
      tooLong: packed.len > HARD
    };
  }
  function unpackAdd(raw, lz) {
    if (!raw || typeof raw !== 'string') return null;
    if (raw.length > 20000) return { error: 'long' };
    try {
      const o = JSON.parse(raw);
      if (o && /^(flight|hotel)$/.test(o.type) && o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
        return { kind: o.type, data: o.data, tripId: typeof o.tripId === 'string' ? o.tripId : '' };
      }
    } catch (e) {}
    if (!lz || typeof lz.decompressFromEncodedURIComponent !== 'function') return { error: 'bad' };
    let s = null;
    try { s = lz.decompressFromEncodedURIComponent(raw); } catch (e) { s = null; }
    if (!s) return { error: 'bad' };
    try {
      const o = JSON.parse(s);
      if (!o || o.type !== 'trip' || !o.trip) return { error: 'bad' };
      const v = validateTrips([o.trip]);
      if (!v.ok) return { error: 'bad' };
      return { kind: 'trip', trip: v.trips[0] };
    } catch (e) { return { error: 'bad' }; }
  }
  return { SOFT, HARD, normTrip, normTicket, validateTrips, packTrip, unpackAdd, cleanStr };
});
