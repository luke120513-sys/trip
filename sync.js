/* 行程合併與分帳。不依賴 Firebase，瀏覽器與測試都能用。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const now = () => Date.now();
  function newId() {
    return now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function newCode() {
    const buf = new Uint8Array(6);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(buf);
    else for (let i = 0; i < 6; i++) buf[i] = Math.floor(Math.random() * 256);
    let s = '';
    for (let i = 0; i < 6; i++) s += ALPH[buf[i] % ALPH.length];
    return s;
  }
  function ensureIds(trip) {
    if (!trip) return trip;
    (trip.days || []).forEach(d => (d || []).forEach(s => { if (s && !s.sid) s.sid = newId(); }));
    (trip.expenses || []).forEach(e => { if (e && !e.id) e.id = newId(); });
    if (!trip.tomb) trip.tomb = {};
    if (!trip.expTomb) trip.expTomb = {};
    return trip;
  }
  function coreSpot(s) {
    const o = {};
    Object.keys(s || {}).sort().forEach(k => {
      if (k === 'rev') return;
      if (k === 'travel' && s.travel && s.travel.src === 'auto') return;
      o[k] = s[k];
    });
    return JSON.stringify(o);
  }
  function coreExp(e) {
    const o = {};
    Object.keys(e || {}).sort().forEach(k => { if (k !== 'rev') o[k] = e[k]; });
    return JSON.stringify(o);
  }
  /* Firestore 不能把陣列再放進陣列，每天改包成 { spots }。本機仍用 days[i] 是景點陣列。 */
  function encodeDays(days) {
    return (days || []).map(d => ({ spots: Array.isArray(d) ? d : ((d && d.spots) || []) }));
  }
  function decodeDays(days) {
    if (!Array.isArray(days)) return [];
    return days.map(d => (Array.isArray(d) ? d : ((d && Array.isArray(d.spots)) ? d.spots : [])));
  }
  function orderKey(trip) {
    return JSON.stringify((trip.days || []).map(d => (d || []).map(s => s && s.sid || '')));
  }
  function metaKey(trip) {
    return JSON.stringify([trip.dest, trip.dep, trip.ret, trip.pax, trip.orig]);
  }
  function indexBy(days, key) {
    const m = new Map();
    (days || []).forEach(d => (d || []).forEach(s => { if (s && s[key]) m.set(s[key], s); }));
    return m;
  }
  /* 對照上次同步的版本，只給真的改過的景點、支出、順序蓋上新時間。 */
  function stampAgainst(trip, prev) {
    ensureIds(trip);
    const t = now();
    if (!prev) {
      (trip.days || []).forEach(d => (d || []).forEach(s => { if (s && !s.rev) s.rev = t; }));
      (trip.expenses || []).forEach(e => { if (e && !e.rev) e.rev = t; });
      if (!trip.orderRev) trip.orderRev = t;
      if (!trip.metaRev) trip.metaRev = t;
      return trip;
    }
    const oldS = indexBy(prev.days, 'sid');
    const oldE = new Map((prev.expenses || []).filter(e => e && e.id).map(e => [e.id, e]));
    (trip.days || []).forEach(d => (d || []).forEach(s => {
      if (!s) return;
      const p = oldS.get(s.sid);
      if (!p) s.rev = t;
      else if (coreSpot(p) !== coreSpot(s)) s.rev = t;
      else s.rev = p.rev || t;
    }));
    const curS = indexBy(trip.days, 'sid');
    oldS.forEach((_, id) => { if (!curS.has(id)) trip.tomb[id] = t; });
    (trip.expenses || []).forEach(e => {
      if (!e) return;
      const p = oldE.get(e.id);
      if (!p) e.rev = t;
      else if (coreExp(p) !== coreExp(e)) e.rev = t;
      else e.rev = p.rev || t;
    });
    const curE = new Set((trip.expenses || []).map(e => e && e.id));
    oldE.forEach((_, id) => { if (!curE.has(id)) trip.expTomb[id] = t; });
    trip.orderRev = orderKey(trip) === orderKey(prev) ? (prev.orderRev || t) : t;
    trip.metaRev = metaKey(trip) === metaKey(prev) ? (prev.metaRev || t) : t;
    const tombKeys = Object.keys(trip.tomb);
    if (tombKeys.length > 200) tombKeys.sort((a, b) => trip.tomb[a] - trip.tomb[b]).slice(0, tombKeys.length - 200).forEach(k => delete trip.tomb[k]);
    return trip;
  }
  function maxTomb(a, b) {
    const o = Object.assign({}, a || {});
    Object.entries(b || {}).forEach(([k, v]) => { o[k] = Math.max(+o[k] || 0, +v || 0); });
    return o;
  }
  function pickSpot(map, s) {
    if (!s || !s.sid) return;
    const p = map.get(s.sid);
    if (!p || (+s.rev || 0) >= (+p.rev || 0)) map.set(s.sid, s);
  }
  function mergeTrip(local, remote) {
    const L = JSON.parse(JSON.stringify(local || { days: [] }));
    ensureIds(L);
    if (!remote) return L;
    const R = JSON.parse(JSON.stringify(remote));
    ensureIds(R);
    const tomb = maxTomb(L.tomb, R.tomb);
    const expTomb = maxTomb(L.expTomb, R.expTomb);
    const win = new Map();
    [L.days, R.days].forEach(days => (days || []).forEach(d => (d || []).forEach(s => pickSpot(win, s))));
    [...win.keys()].forEach(id => { const s = win.get(id); if ((+tomb[id] || 0) >= (+s.rev || 0)) win.delete(id); });
    const localOrder = (+L.orderRev || 0) >= (+R.orderRev || 0);
    const base = localOrder ? L.days : R.days;
    const other = localOrder ? R.days : L.days;
    const used = new Set();
    const days = (base || []).map(d => {
      const row = [];
      (d || []).forEach(s => {
        if (!s || !s.sid || used.has(s.sid) || !win.has(s.sid)) return;
        used.add(s.sid);
        row.push(win.get(s.sid));
      });
      return row;
    });
    (other || []).forEach((d, di) => (d || []).forEach(s => {
      if (!s || !s.sid || used.has(s.sid) || !win.has(s.sid)) return;
      used.add(s.sid);
      while (days.length <= di) days.push([]);
      days[di].push(win.get(s.sid));
    }));
    win.forEach((s, id) => { if (used.has(id)) return; if (!days.length) days.push([]); days[0].push(s); });
    const ewin = new Map();
    [L.expenses, R.expenses].forEach(arr => (arr || []).forEach(e => {
      if (!e || !e.id) return;
      const p = ewin.get(e.id);
      if (!p || (+e.rev || 0) >= (+p.rev || 0)) ewin.set(e.id, e);
    }));
    [...ewin.keys()].forEach(id => { const e = ewin.get(id); if ((+expTomb[id] || 0) >= (+e.rev || 0)) ewin.delete(id); });
    const metaLocal = (+L.metaRev || 0) >= (+R.metaRev || 0);
    const meta = metaLocal ? L : R;
    L.days = days;
    L.expenses = [...ewin.values()];
    L.tomb = tomb;
    L.expTomb = expTomb;
    L.orderRev = Math.max(+L.orderRev || 0, +R.orderRev || 0);
    L.metaRev = Math.max(+L.metaRev || 0, +R.metaRev || 0);
    L.dest = meta.dest;
    L.dep = meta.dep;
    L.ret = meta.ret;
    L.pax = meta.pax;
    L.orig = meta.orig;
    if (Array.isArray(R.tasks)) {
      const lv = +L.tasksRev || taskStamp(L.tasks);
      const rv = +R.tasksRev || taskStamp(R.tasks);
      if (rv > lv) L.tasks = R.tasks;
      else if (lv > rv) { /* 這台比較新，留下 */ }
      else L.tasks = mergeTasks(L.tasks, R.tasks);
      L.tasksRev = Math.max(lv, rv);
    }
    L.ownerUid = R.ownerUid || L.ownerUid;
    L.inviteCode = R.inviteCode || L.inviteCode;
    L.cloudId = L.cloudId || R.cloudId;
    if (L.members && L.members.length) { /* 成員以這台裝置剛同步到的為準 */ }
    else if (R.members) L.members = R.members;
    return L;
  }
  function taskStamp(list) {
    return (Array.isArray(list) ? list : []).reduce((m, x) => Math.max(m, x && +x.rev || 0), 0);
  }
  function mergeTasks(a, b) {
    const map = new Map();
    const put = (x) => {
      if (!x || typeof x !== 'object' || Array.isArray(x)) return;
      const text = String(x.text || '').trim();
      if (!text) return;
      const id = typeof x.id === 'string' && x.id ? x.id : '';
      const copy = Object.assign({}, x, { text: text.slice(0, 80) });
      const key = id || ('anon:' + (copy.section || '') + ':' + copy.text + ':' + (copy.spot || '') + ':' + (copy.day == null ? '' : copy.day));
      const prev = map.get(key);
      if (!prev || (+copy.rev || 0) >= (+prev.rev || 0)) map.set(key, copy);
    };
    (Array.isArray(a) ? a : []).forEach(put);
    (Array.isArray(b) ? b : []).forEach(put);
    return [...map.values()].slice(0, 80);
  }
  function round2(n) { return Math.round(n); }
  /* 每人淨額 = 代付 − 分到的份。再把欠的人配給該收的人，筆數盡量少。 */
  function settleUp(expenses, toTWD) {
    const nets = new Map();
    (expenses || []).forEach(e => {
      const parts = Array.isArray(e.parts) ? e.parts.filter(Boolean) : [];
      if (!e.payer || parts.length < 2) return;
      const twd = toTWD ? toTWD(e.amount, e.currency, e) : +e.amount;
      if (!(twd > 0)) return;
      const share = twd / parts.length;
      nets.set(e.payer, (nets.get(e.payer) || 0) + twd);
      parts.forEach(p => nets.set(p, (nets.get(p) || 0) - share));
    });
    const debtors = [], creditors = [];
    nets.forEach((net, uid) => {
      const n = round2(net);
      if (n <= -1) debtors.push({ uid, net: n });
      else if (n >= 1) creditors.push({ uid, net: n });
    });
    debtors.sort((a, b) => a.net - b.net);
    creditors.sort((a, b) => b.net - a.net);
    const transfers = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(-debtors[i].net, creditors[j].net);
      if (pay >= 1) transfers.push({ from: debtors[i].uid, to: creditors[j].uid, amount: pay });
      debtors[i].net += pay;
      creditors[j].net -= pay;
      if (debtors[i].net > -1) i++;
      if (creditors[j].net < 1) j++;
    }
    const balances = [...nets.entries()].map(([uid, net]) => ({ uid, net: round2(net) })).filter(x => x.net !== 0);
    return { balances, transfers };
  }
  return { newId, newCode, ensureIds, stampAgainst, mergeTrip, settleUp, coreSpot, orderKey, encodeDays, decodeDays };
});
