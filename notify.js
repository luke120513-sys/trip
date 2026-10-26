/* 通知：航班、第一站、下雨、版本、共用動態。純計算可測試；有畫面時才裝上鈴鐺。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.Notify = api;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const start = () => bootNotes(api);
    if (document.readyState === 'complete') start();
    else document.addEventListener('DOMContentLoaded', start);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const APP_VER = '2.10';
  function pad(n) { return String(n).padStart(2, '0'); }
  function hm(v) {
    const m = /^(\d{1,2}):(\d{2})/.exec(String(v || '').trim());
    if (!m) return '';
    const h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return '';
    return pad(h) + ':' + m[2];
  }
  function ymdShift(ymd, n) {
    const p = String(ymd || '').split('-').map(Number);
    if (p.length < 3 || !p[0]) return '';
    const dt = new Date(p[0], p[1] - 1, p[2]);
    dt.setDate(dt.getDate() + n);
    return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
  }
  function ymdOf(ms) {
    const d = new Date(ms);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function localMs(ymd, time) {
    const p = String(ymd || '').split('-').map(Number);
    const t = String(time || '00:00').split(':').map(Number);
    return new Date(p[0], (p[1] || 1) - 1, p[2] || 1, t[0] || 0, t[1] || 0, 0, 0).getTime();
  }
  function isRain(code, precip) {
    const c = +code;
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82) || (c >= 95 && c <= 99)) return true;
    if (precip != null && precip !== '' && +precip >= 50) return true;
    return false;
  }
  function note(id, kind, title, body, at, when, tripId) {
    return { id, kind, title, body, at, when, tripId: tripId || '', read: false };
  }
  function planNotes(ctx) {
    const now = +ctx.now || Date.now();
    const trips = ctx.trips || [];
    const notes = [];
    const H = 3600000;
    trips.forEach(t => {
      if (!t || !t.id || !t.dep) return;
      (t.days || []).forEach((day, di) => {
        const date = ymdShift(t.dep, di);
        if (!date) return;
        (day || []).forEach(s => {
          if (!s || s.kind !== 'flight') return;
          const time = hm(s.time);
          if (!time) return;
          const when = localMs(date, time);
          const sid = s.sid || (di + ':' + (s.name || 'flight'));
          const name = s.name || '航班';
          if (now >= when - 24 * H && now < when) notes.push(note('flight:' + t.id + ':' + sid + ':24', 'flight', '航班還有一天', name + ' 將在 24 小時內起飛', now, when - 24 * H, t.id));
          if (now >= when - 3 * H && now < when) notes.push(note('flight:' + t.id + ':' + sid + ':3', 'flight', '航班快起飛了', name + ' 將在 3 小時內起飛', now, when - 3 * H, t.id));
        });
        const spot = (day || []).find(s => s && s.kind !== 'flight' && hm(s.time));
        if (!spot) return;
        const st = hm(spot.time);
        const spotAt = localMs(date, st);
        const mornAt = localMs(date, st < '09:00' ? '07:00' : '08:00');
        if (now >= mornAt && now < spotAt) notes.push(note('spot:' + t.id + ':' + di + ':morn', 'spot', '今天的第一站', (spot.name || '行程') + ' 在今天', now, mornAt, t.id));
        if (now >= spotAt - H && now < spotAt) notes.push(note('spot:' + t.id + ':' + di + ':hour', 'spot', '一小時後出發', (spot.name || '行程') + ' 約一小時後', now, spotAt - H, t.id));
      });
    });
    const tomorrow = ymdShift(ymdOf(now), 1);
    const seen = new Set();
    const weather = ctx.weather || {};
    trips.forEach(t => {
      const dest = t && t.dest;
      if (!dest || seen.has(dest)) return;
      seen.add(dest);
      const daily = weather[dest] && weather[dest].daily;
      if (!daily || !Array.isArray(daily.time)) return;
      const i = daily.time.indexOf(tomorrow);
      if (i < 0) return;
      const code = daily.weather_code && daily.weather_code[i];
      const p = daily.precipitation_probability_max && daily.precipitation_probability_max[i];
      if (!isRain(code, p)) return;
      notes.push(note('wx:' + dest + ':' + tomorrow, 'wx', '明天可能下雨', dest + ' 明天的預報有雨，出門可以帶傘', now, now, t.id));
    });
    if (ctx.storedVersion && ctx.version && ctx.storedVersion !== ctx.version) {
      notes.push(note('app:' + ctx.version, 'app', '旅伴更新了', '已更新到 ' + ctx.version, now, now, ''));
    }
    return notes;
  }
  function mergeNotes(prev, next, cleared) {
    const gone = new Set(cleared || []);
    const old = new Map();
    (prev || []).forEach(n => { if (n && n.id) old.set(n.id, n); });
    const out = [];
    const seen = new Set();
    (next || []).forEach(n => {
      if (!n || !n.id || gone.has(n.id) || seen.has(n.id)) return;
      seen.add(n.id);
      const o = old.get(n.id);
      out.push(Object.assign({}, n, { read: o ? !!o.read : !!n.read, at: o && o.at ? o.at : n.at }));
    });
    return out;
  }
  return { APP_VER, isRain, planNotes, mergeNotes, hm, ymdShift, localMs };
});

function bootNotes(api) {
  if (!window.TM || window.__notesOn) return;
  window.__notesOn = true;
  const APP_VER = api.APP_VER;
  function lsGet(k, d) { try { return TM.ls.get(k, d); } catch (e) { return d; } }
  function lsSet(k, v) { try { TM.ls.set(k, v); } catch (e) {} }
  function notes() { return lsGet('notes', []) || []; }
  function saveNotes(a) { lsSet('notes', a); }
  function badge(n) { return n > 9 ? '9+' : n ? String(n) : ''; }
  function paintBadges() {
    const list = notes();
    const appN = list.filter(n => n && !n.read && n.kind === 'app').length;
    const oth = list.filter(n => n && !n.read && n.kind !== 'app').length;
    const a = document.querySelector('#annn');
    const b = document.querySelector('#nfyn');
    if (a) a.textContent = badge(appN);
    if (b) b.textContent = badge(oth);
  }
  function weatherMap(trips) {
    const cache = lsGet('wxcache', {}) || {};
    const weather = {};
    (trips || []).forEach(t => {
      if (!t) return;
      const keys = [t.dest, TM.cityOf ? TM.cityOf(t.dest) : ''];
      keys.forEach(k => { if (k && cache[k] && !weather[t.dest]) weather[t.dest] = cache[k]; });
    });
    return weather;
  }
  function scanNotes() {
    if (!window.TM) return;
    const trips = TM.trips ? TM.trips() : [];
    const prevStored = lsGet('ver', null);
    if (prevStored == null) lsSet('ver', APP_VER);
    const generated = api.planNotes({ now: Date.now(), version: APP_VER, storedVersion: prevStored, trips, weather: weatherMap(trips) });
    const prev = notes();
    const cleared = lsGet('noteclear', []) || [];
    const keep = prev.filter(n => n && (n.kind === 'app' || String(n.id).indexOf('act:') === 0));
    const merged = api.mergeNotes(prev, generated.concat(keep), cleared);
    saveNotes(merged);
    if (prevStored && prevStored !== APP_VER) lsSet('ver', APP_VER);
    paintBadges();
    scheduleLocal(merged);
  }
  const armed = new Set();
  function scheduleLocal(list) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const pushed = new Set(lsGet('notepushed', []) || []);
    const now = Date.now();
    (list || []).forEach(n => {
      if (!n || !n.id || pushed.has(n.id) || armed.has(n.id)) return;
      const fire = +n.when || now;
      const wait = fire - now;
      if (wait > 36 * 3600000) return;
      const send = () => {
        armed.delete(n.id);
        const again = new Set(lsGet('notepushed', []) || []);
        if (again.has(n.id)) return;
        again.add(n.id);
        lsSet('notepushed', [...again].slice(-300));
        if (navigator.serviceWorker) navigator.serviceWorker.ready.then(reg => {
          if (reg.active) reg.active.postMessage({ type: 'show-note', id: n.id, title: n.title, body: n.body });
          else if (reg.showNotification) reg.showNotification(n.title, { body: n.body, tag: n.id });
        }).catch(() => {});
      };
      armed.add(n.id);
      if (wait <= 0) send();
      else setTimeout(send, wait);
    });
  }
  function iosHint() {
    const ua = navigator.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    return ios && !standalone ? 'iPhone 要收到系統提醒，請用 Safari 的分享按鈕，選「加入主畫面」，再開啟通知。' : '';
  }
  function openNotes() {
    const list = notes();
    const hint = iosHint();
    const rows = list.length ? list.map((n, i) => `<button type="button" class="sg" onclick="noteReadAt(${i})"><span><b>${TM.esc(n.title)}</b>${n.read ? '' : ' <span class="chip sm">未讀</span>'}<br><small class="mut">${TM.esc(n.body || '')}</small></span></button>`).join('') : '<p class="mut">目前沒有通知</p>';
    $('#sheetBody').innerHTML = `<h2>通知</h2>${hint ? `<p class="mut">${TM.esc(hint)}</p>` : ''}${rows}<div class="row" style="margin-top:8px"><button type="button" class="btn ghost" onclick="noteReadAll()">全部標成已讀</button><button type="button" class="btn ghost" onclick="noteClear()">清除全部</button></div><button type="button" class="btn blk" style="margin-top:8px" onclick="noteEnable()">開啟通知</button><button type="button" class="btn ghost blk" style="margin-top:8px" onclick="closeSheet()">關閉</button>`;
    if (!$('#sheet').classList.contains('on')) TM.openSheet();
  }
  window.noteReadAt = function (i) {
    const list = notes();
    if (list[i]) list[i].read = true;
    saveNotes(list);
    paintBadges();
    openNotes();
  };
  window.scanNotes = scanNotes;
  window.noteMarkSeen = function (id) {
    const seen = lsGet('actseen', []) || [];
    if (seen.indexOf(id) >= 0) return;
    seen.push(id);
    lsSet('actseen', seen.slice(-200));
  };
  window.noteActivity = function (id, data) {
    const seen = lsGet('actseen', []) || [];
    if (seen.indexOf(id) >= 0) return;
    seen.push(id);
    lsSet('actseen', seen.slice(-200));
    const nid = 'act:' + id;
    const cleared = lsGet('noteclear', []) || [];
    if (cleared.indexOf(nid) >= 0) return;
    const list = notes();
    if (list.some(n => n.id === nid)) return;
    const title = data && data.type === 'join' ? '有朋友加入' : data && data.type === 'expense' ? '有新的支出' : '行程有更新';
    list.unshift({ id: nid, kind: 'act', title, body: String(data && data.text || '').slice(0, 200), at: data && data.at || Date.now(), when: data && data.at || Date.now(), tripId: '', read: false });
    saveNotes(list);
    paintBadges();
  };
  window.noteRead = function (id) {
    try { id = decodeURIComponent(id); } catch (e) {}
    const list = notes();
    const n = list.find(x => x.id === id);
    if (n) n.read = true;
    saveNotes(list);
    paintBadges();
    openNotes();
  };
  window.noteReadAll = function () {
    const list = notes();
    list.forEach(n => { if (n) n.read = true; });
    saveNotes(list);
    paintBadges();
    openNotes();
  };
  window.noteClear = function () {
    const list = notes();
    const cleared = lsGet('noteclear', []) || [];
    list.forEach(n => { if (n && n.id && cleared.indexOf(n.id) < 0) cleared.push(n.id); });
    lsSet('noteclear', cleared.slice(-400));
    saveNotes([]);
    paintBadges();
    openNotes();
  };
  window.noteEnable = function () {
    if (typeof Notification === 'undefined') { TM.toast('這台裝置沒有系統通知，仍可在鈴鐺裡看'); return; }
    Notification.requestPermission().then(p => {
      if (p !== 'granted') { TM.toast('沒有開啟系統通知，仍可在鈴鐺裡看'); return; }
      TM.toast('已開啟通知');
      scheduleLocal(notes());
    }).catch(() => TM.toast('沒有開啟系統通知'));
  };
  const ann = document.querySelector('#annbell');
  const nfy = document.querySelector('#nfybell');
  if (ann) ann.onclick = openNotes;
  if (nfy) nfy.onclick = openNotes;
  scanNotes();
  setInterval(scanNotes, 60000);
}
