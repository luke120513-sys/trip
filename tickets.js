/* 票券：從郵件文字帶入欄位、決定備份要不要帶檔案。畫面與 IndexedDB 只在瀏覽器使用。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.Tickets = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const TYPES = [
    ['機票', 'icons/ui-fly.svg'],
    ['飯店', 'icons/cat-hotel.svg'],
    ['交通', 'icons/cat-transport.svg'],
    ['門票', 'icons/cat-sightseeing.svg'],
    ['餐廳', 'icons/cat-food.svg'],
    ['其他', 'icons/cat-custom.svg']
  ];
  const NOTE = '票券圖片與 PDF 留在這台裝置，這份備份只有名稱、日期與訂位編號。';
  const MONTH = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(y, m, d) {
    y = +y; m = +m; d = +d;
    if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return '';
    return y + '-' + pad(m) + '-' + pad(d);
  }
  function todayYmd(now) {
    const d = now ? new Date(now) : new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function dayYmd(trip, index) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trip && trip.dep || '');
    if (!m || !Number.isFinite(+index)) return '';
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    d.setDate(d.getDate() + (+index));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function guessType(text) {
    const s = String(text || '');
    if (/機票|登機|登機證|boarding|e-?ticket|航班|flight\b/i.test(s)) return '機票';
    if (/飯店|酒店|旅館|住宿|入住|ホテル|宿泊|hotel|voucher/i.test(s)) return '飯店';
    if (/JR|新幹線|地鐵|交通|rail|train|bus|pass\b/i.test(s)) return '交通';
    if (/門票|入場|attraction|迪士尼|museum|ticket/i.test(s)) return '門票';
    if (/餐廳|用餐|restaurant|予約.*食事/i.test(s)) return '餐廳';
    return '其他';
  }
  function parsePasted(text) {
    const raw = String(text || '').replace(/\u00a0/g, ' ').trim();
    const out = { name: '', type: '其他', date: '', time: '', booking: '', notes: '', link: '' };
    if (!raw) return out;
    const link = raw.match(/https?:\/\/[^\s<>"']+/i);
    if (link) out.link = link[0].slice(0, 300);
    out.type = guessType(raw);
    const booking = raw.match(/(?:確認碼|確認編號|訂位代號|訂位編號|訂單編號|訂單号|預約編號|预约编号|予約番号|確認番号|confirmation(?:\s*code|\s*number)?|booking(?:\s*ref(?:erence)?|\s*number|\s*code)?|record\s*locator|pnr|e-?ticket(?:\s*number)?|票號|票号)\s*[:：#№]?\s*([A-Z0-9][A-Z0-9-]{3,22})/i);
    if (booking) out.booking = booking[1].toUpperCase();
    const y = raw.match(/(20\d{2})\s*[年\-/.]\s*(\d{1,2})\s*[月\-/.]\s*(\d{1,2})/);
    if (y) out.date = ymd(y[1], y[2], y[3]);
    else {
      const en = raw.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2}),?\s+(20\d{2})/i);
      if (en) out.date = ymd(en[3], MONTH[en[1].slice(0, 3).toLowerCase()], en[2]);
    }
    const tm = raw.match(/(\d{1,2})\s*[:：]\s*(\d{2})/);
    if (tm && +tm[1] < 24 && +tm[2] < 60) out.time = pad(tm[1]) + ':' + pad(tm[2]);
    const named = raw.match(/(?:航班|飯店|酒店|旅館|店名|餐廳|票券|ホテル|ticket|hotel|flight)\s*[:：]\s*([^\n]{2,40})/i);
    if (named) out.name = named[1].trim();
    else {
      const line = raw.split(/\n/).map(s => s.trim()).find(s => s && !/^https?:/i.test(s) && s.length <= 40 && !/確認|訂位|訂單|booking|confirmation|pnr|予約番号/i.test(s));
      if (line) out.name = line.replace(/^[\-\*•\d.)\s]+/, '').slice(0, 40);
    }
    out.notes = raw.slice(0, 500);
    return out;
  }
  function normTicket(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const name = String(raw.name || '').trim().slice(0, 80);
    if (!name) return null;
    const o = { name, type: normType(raw.type) };
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw.date || '')) o.date = raw.date;
    if (/^\d{2}:\d{2}$/.test(raw.time || '')) o.time = raw.time;
    if (raw.day != null && raw.day !== '' && Number.isFinite(+raw.day) && +raw.day >= 0 && +raw.day < 40) o.day = +raw.day | 0;
    const spot = String(raw.spot || '').trim().slice(0, 80);
    if (spot) o.spot = spot;
    const booking = String(raw.booking || '').trim().slice(0, 40);
    if (booking) o.booking = booking;
    const notes = String(raw.notes || '').replace(/data:[^,\s]+;base64,[A-Za-z0-9+/=]+/g, '').trim().slice(0, 500);
    if (notes) o.notes = notes;
    if (typeof raw.link === 'string' && /^https?:\/\//.test(raw.link)) o.link = raw.link.slice(0, 300);
    if (typeof raw.id === 'string' && raw.id) o.id = String(raw.id).slice(0, 40);
    if (raw.used === true) o.used = true;
    const files = [];
    (Array.isArray(raw.files) ? raw.files : []).slice(0, 4).forEach(f => {
      if (!f || typeof f !== 'object' || !f.id) return;
      const file = { id: String(f.id).slice(0, 40), name: String(f.name || '檔案').slice(0, 80), mime: String(f.mime || '').slice(0, 80) };
      if (+f.bytes > 0) file.bytes = Math.round(+f.bytes);
      files.push(file);
    });
    if (files.length) o.files = files;
    return o;
  }
  function sortTickets(list, today) {
    const rank = t => {
      if (today && t.date === today) return 0;
      if (t.date && today && t.date > today) return 1;
      if (!t.date) return 2;
      return 3;
    };
    return (list || []).slice().sort((a, b) => rank(a) - rank(b) || String(a.date || '').localeCompare(String(b.date || '')) || String(a.time || '').localeCompare(String(b.time || '')) || String(a.name).localeCompare(String(b.name)));
  }
  function partitionTickets(list) {
    const active = [];
    const used = [];
    (list || []).forEach(t => { if (t && t.used === true) used.push(t); else if (t) active.push(t); });
    return { active, used };
  }
  function isToday(ticket, trip, today) {
    if (!ticket || !today) return false;
    if (ticket.date === today) return true;
    return ticket.day != null && dayYmd(trip, ticket.day) === today;
  }
  function decideFiles(items, budget) {
    let used = 0;
    let omitted = false;
    const keep = [];
    (items || []).forEach(it => {
      const n = +it.bytes || 0;
      if (!n || used + n > budget) { omitted = true; return; }
      used += n;
      keep.push(it.id);
    });
    const note = !omitted ? '' : (keep.length ? '有些票券檔案太大，這份備份沒有帶那些圖片與 PDF。' : NOTE);
    return { keep, omitted, used, note };
  }
  function normType(raw) {
    const t = String(raw || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 16);
    return t || '其他';
  }
  function iconOf(type) {
    const row = TYPES.find(t => t[0] === type);
    return row ? row[1] : 'icons/cat-custom.svg';
  }

  return { TYPES, NOTE, todayYmd, dayYmd, guessType, parsePasted, normTicket, normType, sortTickets, partitionTickets, isToday, decideFiles, iconOf };
});

/* 以下只在瀏覽器跑：IndexedDB 存檔、表單與全螢幕檢視。 */
function tixEsc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function tixId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function tixDb() {
  return new Promise((ok, no) => {
    const r = indexedDB.open('tripmate-tickets', 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('files')) r.result.createObjectStore('files'); };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => no(r.error);
  });
}
function tixKey(tripId, ticketId, fileId) { return tripId + ':' + ticketId + ':' + fileId; }
async function tixPut(tripId, ticketId, file) {
  const db = await tixDb();
  await new Promise((ok, no) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').put({ mime: file.mime, name: file.name, blob: file.blob }, tixKey(tripId, ticketId, file.id));
    tx.oncomplete = () => ok();
    tx.onerror = () => no(tx.error);
  });
}
async function tixGet(tripId, ticketId, fileId) {
  const db = await tixDb();
  return new Promise((ok, no) => {
    const tx = db.transaction('files', 'readonly');
    const q = tx.objectStore('files').get(tixKey(tripId, ticketId, fileId));
    q.onsuccess = () => ok(q.result || null);
    q.onerror = () => no(q.error);
  });
}
async function tixDel(tripId, ticketId, fileId) {
  const db = await tixDb();
  await new Promise((ok, no) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').delete(tixKey(tripId, ticketId, fileId));
    tx.oncomplete = () => ok();
    tx.onerror = () => no(tx.error);
  });
}
async function tixDropTrip(tripId) {
  const db = await tixDb();
  await new Promise((ok, no) => {
    const tx = db.transaction('files', 'readwrite');
    const store = tx.objectStore('files');
    const q = store.getAllKeys();
    q.onsuccess = () => {
      (q.result || []).forEach(k => { if (String(k).startsWith(tripId + ':')) store.delete(k); });
    };
    tx.oncomplete = () => ok();
    tx.onerror = () => no(tx.error);
  });
}
function tixB64(blob) {
  return new Promise((ok, no) => {
    const r = new FileReader();
    r.onload = () => { const s = String(r.result || ''); const i = s.indexOf(','); ok(i >= 0 ? s.slice(i + 1) : s); };
    r.onerror = () => no(r.error);
    r.readAsDataURL(blob);
  });
}
function tixFromB64(data, mime) {
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime || 'application/octet-stream' });
}
async function tixAttach(trip, tripId, budget) {
  const tickets = (trip.tickets || []).map(Tickets.normTicket).filter(Boolean);
  const items = [];
  for (const t of tickets) {
    for (const f of t.files || []) {
      let rec = null;
      try { rec = await tixGet(tripId, t.id, f.id); } catch (e) { rec = null; }
      items.push({ id: t.id + ':' + f.id, bytes: rec && rec.blob ? rec.blob.size : 0, rec, file: f });
    }
  }
  const plan = Tickets.decideFiles(items, budget);
  const keep = new Set(plan.keep);
  for (const it of items) {
    if (!keep.has(it.id) || !it.rec) continue;
    try { it.file.data = await tixB64(it.rec.blob); it.file.bytes = it.rec.blob.size; } catch (e) { /* 讀不到就略過 */ }
  }
  tickets.forEach(t => (t.files || []).forEach(f => { if (!f.data) delete f.data; }));
  return { tickets, omitted: plan.omitted, note: plan.note };
}
async function tixIngest(trip) {
  const id = trip && trip.id;
  for (const t of trip.tickets || []) {
    for (const f of t.files || []) {
      if (!f.data || !id) { delete f.data; continue; }
      try { await tixPut(id, t.id, { id: f.id, name: f.name, mime: f.mime, blob: tixFromB64(f.data, f.mime) }); } catch (e) { /* 裝置存不了就只留欄位 */ }
      delete f.data;
    }
  }
}
if (typeof Tickets !== 'undefined') {
  Tickets.attachFiles = tixAttach;
  Tickets.ingestFiles = tixIngest;
  Tickets.dropTrip = tixDropTrip;
}
var tixDraft = null, tixOn = false, tixLock = null;
function openTickets() { const t = TM.T(); if (!t) { TM.toast('請先選一份行程'); TM.go('list'); return; } if (typeof setExpPane === 'function') setExpPane('tix'); else TM.go('expense'); }
function closeTickets() { tixOn = false; TM.go('edit'); }
let tixUsedOpen = false;
function ticketPage(t) {
  const today = Tickets.todayYmd();
  const parts = Tickets.partitionTickets(t.tickets || []);
  const active = Tickets.sortTickets(parts.active, today);
  const used = Tickets.sortTickets(parts.used, today);
  const empty = !active.length && !used.length ? '<div class="card mut">還沒有票券。可以上傳登機證、飯店券、QR code 或 PDF，也可以貼上郵件裡的文字。</div>' : (!active.length ? '<div class="card mut">還沒有未使用的票券。</div>' : '');
  const cards = active.map(x => ticketCard(x, today, t)).join('');
  const head = active.some(x => Tickets.isToday(x, t, today)) ? '<h2 style="font-size:16px">今天的票券在最上面</h2>' : '';
  const usedBox = used.length ? `<details class="tixusedbox"${tixUsedOpen ? ' open' : ''} ontoggle="tixUsedOpen=this.open"><summary>已使用 (${used.length})</summary>${used.map(x => ticketCard(x, today, t)).join('')}</details>` : '';
  return `<div class="caveat">票券存在這台裝置，離線也能打開。分享連結不會帶票券。檔案太大時，雲端與 JSON 只備份名稱、日期和訂位編號。</div><div class="row" style="margin:8px 0"><button type="button" class="btn ghost" onclick="closeTickets()">回到每日行程</button><button type="button" class="btn" onclick="ticketForm()">＋ 新增票券</button></div>${head}${empty}${cards}${usedBox}`;
}
function ticketCard(x, today, t) {
  const ico = Tickets.iconOf(x.type);
  const when = [x.date, x.time].filter(Boolean).join(' ');
  const todayMark = !x.used && Tickets.isToday(x, t, today) ? '<span class="chip sm" style="flex:0">今天</span>' : '';
  const usedMark = x.used ? '<span class="chip sm tixbadge" style="flex:0">已使用</span>' : '';
  const useBtn = x.used
    ? `<button type="button" class="btn ghost blk tixuse" onclick="ticketMarkUsed('${tixEsc(x.id)}',false)">取消已使用</button>`
    : `<button type="button" class="btn ghost blk tixuse" onclick="ticketMarkUsed('${tixEsc(x.id)}',true)">標記已使用</button>`;
  return `<div class="card${x.used ? ' tixused' : ''}"><div class="row"><img src="${ico}" alt="" width="28" height="28"><b>${tixEsc(x.name)}</b> ${todayMark}${usedMark}<span class="mut" style="flex:0">${tixEsc(x.type)}</span></div><div class="mut">${tixEsc([when, x.booking && ('訂位 ' + x.booking), x.spot].filter(Boolean).join(' · '))}</div><div class="row" style="margin-top:8px"><button type="button" class="btn sm" onclick="ticketQuick('${tixEsc(x.id)}')">打開</button><button type="button" class="btn ghost sm" onclick="ticketForm('${tixEsc(x.id)}')">編輯</button><button type="button" class="btn ghost sm" onclick="ticketRm('${tixEsc(x.id)}')">刪除</button></div>${useBtn}</div>`;
}
function ticketMarkUsed(id, on) {
  const t = TM.T(); if (!t) return;
  if (t.archived) { TM.toast('這份行程已封存，只能看'); return; }
  const cur = (t.tickets || []).find(x => x.id === id); if (!cur) return;
  if (on !== false && on !== 'false') { cur.used = true; tixUsedOpen = true; }
  else delete cur.used;
  TM.save(); TM.render(); TM.toast(cur.used ? '已標記為使用過' : '已改回未使用');
}
function ticketTodayHtml(t) {
  const today = Tickets.todayYmd();
  const list = Tickets.sortTickets(t.tickets || [], today).filter(x => !x.used && Tickets.isToday(x, t, today));
  if (!list.length) return '';
  return `<div class="card noprint" id="todaytix"><div class="row"><b>今天的票券</b><button type="button" class="chip" onclick="openTickets()">全部票券</button></div><div class="row" style="margin-top:8px">${list.map(x => `<button type="button" class="chip" onclick="ticketQuick('${tixEsc(x.id)}')">${tixEsc(x.type)} ${tixEsc(x.name)}</button>`).join('')}</div></div>`;
}
function ticketChip(day, name) {
  const t = TM.T(); if (!t) return '';
  const hits = (t.tickets || []).filter(x => x.day === day && x.spot && x.spot === name);
  if (!hits.length) return '';
  return hits.map(x => ` <button type="button" class="chip sm${x.used ? ' tixused' : ''}" onclick="ticketQuick('${tixEsc(x.id)}')">${tixEsc(x.type)}${x.used ? ' 已使用' : ''}</button>`).join('');
}
function ticketDayChip(day) {
  const t = TM.T(); if (!t) return '';
  const hits = (t.tickets || []).filter(x => x.day === day && !x.spot);
  if (!hits.length) return '';
  return `<div class="row" style="margin:0 0 8px">${hits.map(x => `<button type="button" class="chip sm" onclick="ticketQuick('${tixEsc(x.id)}')">${tixEsc(x.type)} ${tixEsc(x.name)}</button>`).join('')}</div>`;
}
function ticketSpots(t, day) {
  if (day === '' || day == null || !t.days[+day]) return [];
  return t.days[+day].map(s => s && s.name).filter(Boolean);
}
async function ticketForm(id) {
  const trip = TM.T && TM.T();
  if (trip && trip.archived) { TM.toast('這份行程已封存，只能看'); return; }
  const t = TM.T(); if (!t) return;
  const cur = id ? (t.tickets || []).find(x => x.id === id) : null;
  tixDraft = { id: cur ? cur.id : '', files: [] };
  if (cur) {
    for (const f of cur.files || []) {
      try {
        const rec = await tixGet(t.id, cur.id, f.id);
        if (rec && rec.blob) tixDraft.files.push({ id: f.id, name: f.name || rec.name, mime: rec.mime || f.mime, blob: rec.blob, url: URL.createObjectURL(rec.blob) });
      } catch (e) {}
    }
  }
  const preset = !cur || !cur.type ? '其他' : (Tickets.TYPES.some(([n]) => n === cur.type) ? cur.type : '');
  const custom = preset ? '' : (cur && cur.type || '');
  const days = '<option value="">不指定</option>' + t.days.map((_, i) => `<option value="${i}"${cur && cur.day === i ? ' selected' : ''}>Day ${i + 1} · ${tixEsc(TM.dayDate(t, i))}</option>`).join('');
  const spots = ticketSpots(t, cur && cur.day != null ? cur.day : '');
  const spotOpts = '<option value="">不指定景點</option>' + spots.map(n => `<option${cur && cur.spot === n ? ' selected' : ''}>${tixEsc(n)}</option>`).join('');
  $('#sheetBody').innerHTML = `<h2>${cur ? '編輯票券' : '新增票券'}</h2><p class="mut">可上傳照片、截圖或 PDF，或貼上郵件內文。名稱和種類都可以自己取，之後按編輯就能改。分享連結不會帶這些票券。</p><label class="fld">貼上郵件文字或連結<textarea id="tixpaste" rows="3" placeholder="例如：訂單編號、日期、Gmail 裡複製的一段"></textarea></label><button type="button" class="btn ghost sm" onclick="ticketApplyPaste()">帶入貼上的內容</button><label class="fld">名稱（自己取，隨時可改）<input id="tixname" maxlength="80" placeholder="例如：去程登機證、迪士尼一日券" value="${tixEsc(cur && cur.name || '')}"></label><div class="fld">種類</div><div class="row" id="tixtypes">${Tickets.TYPES.map(([n]) => `<button type="button" class="chip${n === preset ? ' on' : ''}" data-tixt="${n}" onclick="ticketSetType('${n}')"><img src="${Tickets.iconOf(n)}" alt="" width="16" height="16">${n}</button>`).join('')}</div><label class="fld">自訂種類（選填，會取代上面的選項）<input id="tixtcustom" maxlength="16" placeholder="例如：演唱會、SIM 卡、JR Pass" value="${tixEsc(custom)}" oninput="ticketCustomInput()"></label><div class="row"><label class="fld">日期<input type="date" id="tixdate" value="${tixEsc(cur && cur.date || '')}"></label><label class="fld">時間<input type="time" id="tixtime" value="${tixEsc(cur && cur.time || '')}"></label></div><div class="row"><label class="fld">哪一天<select id="tixday" onchange="ticketDayChange()">${days}</select></label><label class="fld">哪個景點<select id="tixspot">${spotOpts}</select></label></div><label class="fld">訂位編號<input id="tixbook" maxlength="40" value="${tixEsc(cur && cur.booking || '')}"></label><label class="fld">備註<textarea id="tixnote" rows="2">${tixEsc(cur && cur.notes || '')}</textarea></label><label class="fld">照片、截圖或 PDF<input id="tixfile" type="file" accept="image/*,application/pdf" multiple onchange="ticketFiles(this)"></label><div id="tixfiles">${tixFileList()}</div><p class="mut" id="tixocr"></p><div class="row"><button type="button" class="btn ghost" onclick="closeSheet()">取消</button><button type="button" class="btn" onclick="ticketSave()">儲存</button></div>`;
  TM.openSheet();
}
function ticketSetType(n) {
  document.querySelectorAll('[data-tixt]').forEach(b => b.classList.toggle('on', b.dataset.tixt === n));
  const c = $('#tixtcustom'); if (c) c.value = '';
}
function ticketCustomInput() {
  const c = $('#tixtcustom');
  if (c && c.value.trim()) document.querySelectorAll('[data-tixt]').forEach(b => b.classList.remove('on'));
  else if (!document.querySelector('[data-tixt].on')) document.querySelectorAll('[data-tixt]').forEach(b => b.classList.toggle('on', b.dataset.tixt === '其他'));
}
function ticketType() {
  const custom = ($('#tixtcustom') && $('#tixtcustom').value || '').trim();
  if (custom) return Tickets.normType(custom);
  const b = document.querySelector('[data-tixt].on');
  return b ? b.dataset.tixt : '其他';
}
function ticketDayChange() {
  const t = TM.T(); const day = $('#tixday') && $('#tixday').value;
  const box = $('#tixspot'); if (!box || !t) return;
  const spots = ticketSpots(t, day);
  box.innerHTML = '<option value="">不指定景點</option>' + spots.map(n => `<option>${tixEsc(n)}</option>`).join('');
}
function ticketApplyPaste() {
  const parsed = Tickets.parsePasted($('#tixpaste') && $('#tixpaste').value);
  const set = (id, val) => { const el = $('#' + id); if (el && val && !el.value.trim()) el.value = val; };
  set('tixname', parsed.name); set('tixdate', parsed.date); set('tixtime', parsed.time); set('tixbook', parsed.booking);
  const note = $('#tixnote'); if (note && parsed.notes && !note.value.trim()) note.value = parsed.notes;
  if (parsed.type && parsed.type !== '其他' && ticketType() === '其他') ticketSetType(parsed.type);
  if (!parsed.booking && !parsed.date && !parsed.name) TM.toast('這段裡沒有看出訂位編號或日期，請再改一下欄位');
  else TM.toast('已帶入看得懂的欄位，請再對一下');
}
function tixFileList() {
  if (!tixDraft || !tixDraft.files.length) return '';
  return tixDraft.files.map(f => `<div class="mut">${tixEsc(f.name)} · ${f.mime === 'application/pdf' || /\.pdf$/i.test(f.name) ? 'PDF' : '圖片'}</div>`).join('');
}
async function tixShrink(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(bmp.width * scale));
  c.height = Math.max(1, Math.round(bmp.height * scale));
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  try { bmp.close(); } catch (e) {}
  const blob = await new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.72));
  return { blob: blob || file, canvas: c };
}
async function ticketFiles(input) {
  const files = [...(input.files || [])].slice(0, 4);
  input.value = '';
  if (!tixDraft) tixDraft = { id: '', files: [] };
  for (const file of files) {
    if (tixDraft.files.length >= 4) break;
    if (file.size > 8 * 1024 * 1024) { TM.toast('單一檔案請小於 8MB'); continue; }
    const pdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    let blob = file, canvas = null;
    if (!pdf) {
      try { const shrunk = await tixShrink(file); blob = shrunk.blob; canvas = shrunk.canvas; }
      catch (e) { TM.toast('這張圖讀不起來，請改用 JPG、PNG 或 PDF'); continue; }
    }
    tixDraft.files.push({ id: tixId(), name: file.name.slice(0, 80), mime: pdf ? 'application/pdf' : 'image/jpeg', blob, url: URL.createObjectURL(blob) });
    if (canvas) ticketOcr(canvas);
  }
  const box = $('#tixfiles'); if (box) box.innerHTML = tixFileList();
}
async function ticketOcr(canvas) {
  const say = $('#tixocr'); if (say) say.textContent = '正在從圖片讀訂位編號與日期…';
  try {
    if (typeof tessWorker !== 'function') { if (say) say.textContent = ''; return; }
    const w = await tessWorker(() => {});
    const out = await w.recognize(canvas);
    const parsed = Tickets.parsePasted(out && out.data && out.data.text || '');
    const set = (id, val) => { const el = $('#' + id); if (el && val && !el.value.trim()) el.value = val; };
    set('tixname', parsed.name); set('tixdate', parsed.date); set('tixtime', parsed.time); set('tixbook', parsed.booking);
    if (parsed.type && parsed.type !== '其他' && ticketType() === '其他') ticketSetType(parsed.type);
    if (say) say.textContent = parsed.booking || parsed.date ? '已從圖片帶入看得懂的欄位，請再對一下。照片沒有上傳。' : '圖片裡沒有看出訂位編號，可以自己填。';
  } catch (e) { if (say) say.textContent = '這次沒讀成，請自己填訂位編號。'; }
}
async function ticketSave() {
  const cur = TM.T && TM.T();
  if (cur && cur.archived) { TM.toast('這份行程已封存，只能看'); return; }
  const t = TM.T(); if (!t || !tixDraft) return;
  const name = $('#tixname').value.trim();
  if (!name) { TM.toast('請寫票券名稱'); return; }
  const id = tixDraft.id || tixId();
  const day = $('#tixday').value;
  const item = Tickets.normTicket({
    id, name, type: ticketType(), date: $('#tixdate').value, time: $('#tixtime').value,
    day: day === '' ? null : +day, spot: $('#tixspot').value, booking: $('#tixbook').value, notes: $('#tixnote').value
  });
  if (!item) { TM.toast('請寫票券名稱'); return; }
  item.files = [];
  for (const f of tixDraft.files) {
    try { await tixPut(t.id, id, f); item.files.push({ id: f.id, name: f.name, mime: f.mime, bytes: f.blob.size }); }
    catch (e) { TM.toast('有一個檔案存不進這台裝置'); }
  }
  if (!t.tickets) t.tickets = [];
  const i = t.tickets.findIndex(x => x.id === id);
  if (i >= 0 && t.tickets[i] && t.tickets[i].used) item.used = true;
  if (i >= 0) t.tickets[i] = item; else t.tickets.push(item);
  t.tickets = t.tickets.slice(0, 40);
  tixOn = false;
  TM.save(); TM.closeSheet(); TM.render(); TM.toast('已存進這份行程的票券');
}
async function ticketRm(id) {
  const trip = TM.T && TM.T();
  if (trip && trip.archived) { TM.toast('這份行程已封存，只能看'); return; }
  const t = TM.T(); if (!t || !confirm('刪除這張票券？')) return;
  const cur = (t.tickets || []).find(x => x.id === id);
  t.tickets = (t.tickets || []).filter(x => x.id !== id);
  if (cur) { for (const f of cur.files || []) { try { await tixDel(t.id, id, f.id); } catch (e) {} } }
  TM.save(); TM.render();
}
async function ticketQuick(id) {
  const t = TM.T(); if (!t) return;
  const cur = (t.tickets || []).find(x => x.id === id); if (!cur) return;
  const urls = [];
  for (const f of cur.files || []) {
    try {
      const rec = await tixGet(t.id, cur.id, f.id);
      if (rec && rec.blob) urls.push({ url: URL.createObjectURL(rec.blob), pdf: (rec.mime || f.mime) === 'application/pdf', name: f.name || '' });
    } catch (e) {}
  }
  const view = urls.length ? urls.map(f => f.pdf ? `<iframe title="${tixEsc(f.name)}" src="${f.url}"></iframe><a class="btn ghost sm" href="${f.url}" target="_blank" rel="noopener">另開 PDF</a>` : `<img alt="${tixEsc(cur.name)}" src="${f.url}">`).join('') : '<p class="mut">這張票券沒有存檔，下面是訂位資料。</p>';
  const old = document.getElementById('tixview'); if (old) old.remove();
  const el = document.createElement('div');
  el.id = 'tixview'; el.className = 'tixview';
  const useLabel = cur.used ? '取消已使用' : '標記已使用';
  el.innerHTML = `<div class="tixbar"><button type="button" class="btn ghost sm" onclick="ticketCloseQuick()">關閉</button><b>${tixEsc(cur.name)}</b><button type="button" class="btn ghost sm" onclick="ticketCloseQuick();ticketMarkUsed('${tixEsc(cur.id)}',${cur.used ? 'false' : 'true'})">${useLabel}</button></div><p class="tixhint">請把螢幕亮度調到最亮，閘口才掃得到 QR code。</p><div class="tixstage">${view}<p class="tixmeta">${tixEsc([cur.type, cur.date, cur.time, cur.booking && ('訂位 ' + cur.booking)].filter(Boolean).join(' · '))}${cur.used ? ' · 已使用' : ''}</p></div>`;
  document.body.append(el);
  if (navigator.wakeLock && navigator.wakeLock.request) { try { tixLock = await navigator.wakeLock.request('screen'); } catch (e) { tixLock = null; } }
}
function ticketCloseQuick() {
  const el = document.getElementById('tixview'); if (el) el.remove();
  if (tixLock) { try { tixLock.release(); } catch (e) {} tixLock = null; }
}
