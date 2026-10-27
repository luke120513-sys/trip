/* 目的地主題、封存儀式、成就卡。純函式可在測試裡用。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Journey = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const HOME = { TPE: 1, TSA: 1, KHH: 1, RMQ: 1, TNN: 1, HUN: 1 };
  const JP_AIR = { NRT: 1, HND: 1, KIX: 1, ITM: 1, UKB: 1, NGO: 1, CTS: 1, FUK: 1, OKA: 1, KOJ: 1, HIJ: 1, SDJ: 1, KMQ: 1, TAK: 1, KMJ: 1, FSZ: 1, OKJ: 1, TOY: 1, KIJ: 1, AOJ: 1, MMB: 1, AKJ: 1 };
  const KR_AIR = { ICN: 1, GMP: 1, PUS: 1, CJU: 1, TAE: 1, KWJ: 1, CJJ: 1, RSU: 1 };
  const JP_WORDS = ['日本', '東京', '大阪', '京都', '福岡', '札幌', '沖繩', '名古屋', '奈良', '神戶', '神戸', '橫濱', '横浜', '鎌倉', '箱根', '北海道', '廣島', '広島', '金澤', '金沢', '淺草', '浅草', '新宿', '澀谷', '渋谷', '上野', '晴空塔', '東京鐵塔', '東京塔', '道頓堀', '心齋橋', '心斎橋', '伏見稻荷', '伏見稲荷', '清水寺', '金閣寺', '嵐山', 'Tokyo', 'Osaka', 'Kyoto', 'Japan', 'Sapporo', 'Okinawa', 'Hiroshima', 'Nara', 'Kobe', 'Yokohama'];
  const KR_WORDS = ['韓國', '首爾', '釜山', '濟州', '仁川', '大邱', '光州', '慶州', '江陵', '明洞', '弘大', '弘益', '景福宮', '昌德宮', '昌慶宮', '德壽宮', '北村', '韓屋', 'Seoul', 'Busan', 'Korea', 'Jeju', 'Incheon', 'Myeongdong', 'Hongdae'];
  const TOKYO = ['東京', '新宿', '澀谷', '渋谷', '淺草', '浅草', '上野', '晴空塔', '秋葉原', '銀座', '原宿', '六本木', '台場', '築地', 'Tokyo', 'Skytree'];
  const OSAKA = ['大阪', '道頓堀', '心齋橋', '心斎橋', '梅田', '難波', '通天閣', '大阪城', '環球影城', 'Osaka'];
  const STYLES = [['auto', '自動（依目的地）'], ['jp', '日本'], ['kr', '韓國'], ['plain', '系統預設']];
  const COUNTRIES = [
    { id: 'jp', name: '日本' },
    { id: 'kr', name: '韓國' }
  ];

  function hasWord(text, words) {
    const s = String(text || '');
    const low = s.toLowerCase();
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (!w) continue;
      if (/[A-Za-z]/.test(w) ? low.includes(w.toLowerCase()) : s.includes(w)) return true;
    }
    return false;
  }
  function airScore(text) {
    const bag = { jp: 0, kr: 0 };
    const re = /\b([A-Za-z]{3})\b/g;
    let m;
    const s = String(text || '');
    while ((m = re.exec(s))) {
      const c = m[1].toUpperCase();
      if (HOME[c]) continue;
      if (JP_AIR[c]) bag.jp++;
      if (KR_AIR[c]) bag.kr++;
    }
    return bag;
  }
  function addScore(bag, text, w) {
    if (!text) return;
    if (hasWord(text, JP_WORDS)) bag.jp += w;
    if (hasWord(text, KR_WORDS)) bag.kr += w;
    const a = airScore(text);
    bag.jp += a.jp * w;
    bag.kr += a.kr * w;
  }
  function detectCountry(trip) {
    if (!trip) return '';
    const bag = { jp: 0, kr: 0 };
    addScore(bag, trip.dest, 4);
    (trip.days || []).forEach(d => (d || []).forEach(s => {
      if (!s) return;
      addScore(bag, s.name, 2);
      addScore(bag, s.zh, 1);
      addScore(bag, s.from, 2);
      addScore(bag, s.to, 3);
      addScore(bag, s.note, 1);
    }));
    if (!bag.jp && !bag.kr) return '';
    if (bag.jp === bag.kr) {
      const d = String(trip.dest || '');
      const j = hasWord(d, JP_WORDS) || airScore(d).jp;
      const k = hasWord(d, KR_WORDS) || airScore(d).kr;
      if (j && !k) return 'jp';
      if (k && !j) return 'kr';
    }
    return bag.jp >= bag.kr ? 'jp' : 'kr';
  }
  function resolveTheme(trip, globalStyle) {
    const g = STYLES.some(x => x[0] === globalStyle) ? globalStyle : 'auto';
    const local = trip && STYLES.some(x => x[0] === trip.themeStyle) ? trip.themeStyle : '';
    const pick = local || g;
    if (pick === 'plain') return '';
    if (pick === 'jp' || pick === 'kr') return pick;
    return trip ? detectCountry(trip) : '';
  }
  function spotsOf(trip) {
    const out = [];
    (trip.days || []).forEach((d, di) => (d || []).forEach(s => { if (s) out.push({ s, day: d, di }); }));
    return out;
  }
  function blob(s) { return [s && s.name, s && s.zh, s && s.note, s && s.ptype, s && s.icon, s && s.iconLabel].filter(Boolean).join(' '); }
  function diaryBlob(d) { return [d && d.placeName, d && d.dishes, d && d.text].filter(Boolean).join(' '); }
  function inRange(date, trip) { return !!(date && trip && trip.dep && trip.ret && date >= trip.dep && date <= trip.ret); }
  function countryTrips(trips, id) { return (trips || []).filter(t => detectCountry(t) === id); }
  function diaryFor(trips, diary) {
    return (diary || []).filter(d => (trips || []).some(t => inRange(d && d.date, t)));
  }
  function countRe(list, re, read) {
    let n = 0;
    (list || []).forEach(x => { if (re.test(read(x))) n++; });
    return n;
  }
  function transitLegs(trip) {
    let n = 0;
    (trip.days || []).forEach(d => (d || []).forEach(s => {
      if (!s || !s.travel) return;
      const steps = s.travel.plan && s.travel.plan.steps;
      if (Array.isArray(steps) && steps.length) {
        const rides = steps.filter(st => st && st.kind === 'ride' && String(st.mode || '').toUpperCase() !== 'CAR');
        if (rides.length) { n += rides.length; return; }
      }
      if (s.travel.mode === 'transit') n++;
    }));
    return n;
  }
  function hmBefore8(s) {
    if (!s || s.visited !== true) return false;
    const m = /^(\d{1,2}):(\d{2})/.exec(String(s.time || ''));
    if (m && +m[1] < 8) return true;
    const at = +s.visitedAt;
    if (at > 1e11) {
      const d = new Date(at);
      if (!isNaN(d.getTime()) && d.getHours() < 8) return true;
    }
    return false;
  }
  function cityVisited(trips, words) {
    let n = 0;
    (trips || []).forEach(t => {
      const destHit = hasWord(t.dest, words);
      spotsOf(t).forEach(({ s }) => {
        if (s.visited !== true) return;
        if (destHit || hasWord(blob(s), words)) n++;
      });
    });
    return n;
  }
  function perfect(trips) {
    return (trips || []).some(t => (t.days || []).some(d => Array.isArray(d) && d.length >= 3 && d.every(s => s && s.visited === true)));
  }
  function dayCount(trip) {
    const n = Math.round((new Date(trip.ret) - new Date(trip.dep)) / 864e5) + 1;
    return Number.isFinite(n) && n > 0 ? n : (trip.days || []).length || 1;
  }
  function summarize(trip, diary) {
    const days = dayCount(trip);
    const visited = spotsOf(trip).filter(x => x.s.visited === true).length;
    const notes = (diary || []).filter(d => inRange(d && d.date, trip)).length;
    const by = {};
    (trip.expenses || []).forEach(e => {
      const c = String(e && e.currency || 'TWD').toUpperCase();
      const n = +e.amount;
      if (n > 0) by[c] = (by[c] || 0) + n;
    });
    const spend = Object.keys(by).map(c => Math.round(by[c]).toLocaleString('zh-TW') + ' ' + c).join('、') || '還沒記支出';
    return { days, visited, diary: notes, spend };
  }

  const CARDS = [
    { id: 'jp-first', country: 'jp', title: '初訪日本', art: '🗻', hint: '建立一趟日本行程', desc: '第一趟日本行程已經在旅伴裡了。不管是幾天，都算數。', test: ctx => ctx.jp.length > 0 },
    { id: 'jp-ramen', country: 'jp', title: '拉麵達人', art: '🍜', hint: '行程或美食日記裡出現 3 次拉麵', desc: '三碗拉麵，三種湯頭。這趟沒有白來。', test: ctx => countRe(ctx.jpSpots, /拉麵|ラーメン|ramen/i, x => blob(x.s)) + countRe(ctx.jpDiary, /拉麵|ラーメン|ramen/i, diaryBlob) >= 3 },
    { id: 'jp-shrine', country: 'jp', title: '寺社巡禮', art: '⛩️', hint: '5 座寺廟或神社蓋上到此一遊', desc: '寺鐘和鳥居都蓋上了到此一遊。慢慢走就好。', test: ctx => ctx.jpSpots.filter(x => x.s.visited === true && /寺|神社|神宮|大社|佛閣/.test(blob(x.s))).length >= 5 },
    { id: 'jp-rail', country: 'jp', title: '鐵道迷', art: '🚃', hint: '累積 10 段大眾運輸', desc: '十段電車或地鐵，沿線的風景都算旅費。', test: ctx => ctx.jp.reduce((n, t) => n + transitLegs(t), 0) >= 10 },
    { id: 'jp-konbini', country: 'jp', title: '便利商店高手', art: '🏪', hint: '美食日記提到 7-Eleven、Lawson 或全家 3 次', desc: '御飯糰、咖啡、熱食，便利商店就是第二個家。', test: ctx => countRe(ctx.jpDiary, /7-?\s?11|7-?eleven|セブン|lawson|ローソン|羅森|familymart|ファミリーマート|全家/i, diaryBlob) >= 3 },
    { id: 'jp-tokyo', country: 'jp', title: '東京通', art: '🗼', hint: '在東京蓋上 6 個到此一遊', desc: '東京的巷子開始認得你了。', test: ctx => cityVisited(ctx.jp, TOKYO) >= 6 },
    { id: 'jp-osaka', country: 'jp', title: '大阪通', art: '🐙', hint: '在大阪蓋上 6 個到此一遊', desc: '道頓堀的燈，你也算看過一輪了。', test: ctx => cityVisited(ctx.jp, OSAKA) >= 6 },
    { id: 'jp-early', country: 'jp', title: '早起的鳥', art: '🌅', hint: '有一個景點在早上 8 點前到過', desc: '城市還沒完全醒來，你已經在路上。', test: ctx => ctx.jpSpots.some(x => hmBefore8(x.s)) },
    { id: 'jp-foodie', country: 'jp', title: '美食家', art: '🍱', hint: '日本行程期間寫下 10 則美食日記', desc: '十則日記，十種味道。記得寫下來，才不會只剩帳單。', test: ctx => ctx.jpDiary.length >= 10 },
    { id: 'jp-perfect', country: 'jp', title: '完美行程', art: '✨', hint: '同一天至少 3 個景點都蓋上到此一遊', desc: '這一天每一站都到了。很少人能這樣走完。', test: ctx => perfect(ctx.jp) },
    { id: 'jp-archive', country: 'jp', title: '旅程封存', art: '📕', hint: '封存一趟日本行程', desc: '行程收進冊子裡。翻開的時候，還是那幾天。', test: ctx => ctx.jp.some(t => t.archived === true) },
    { id: 'kr-first', country: 'kr', title: '初訪韓國', art: '🏯', hint: '建立一趟韓國行程', desc: '第一趟韓國行程開始了。辣的、甜的，都還在前面。', test: ctx => ctx.kr.length > 0 },
    { id: 'kr-spicy', country: 'kr', title: '炎雞愛好者', art: '🌶️', hint: '吃過 2 次韓式炸雞或辣炒雞', desc: '辣到流淚也還是再點一盤。這就是喜歡。', test: ctx => countRe(ctx.krSpots, /炸雞|辣炒雞|辣雞|炒雞|불닭|양념치킨|韓式炸雞/i, x => blob(x.s)) + countRe(ctx.krDiary, /炸雞|辣炒雞|辣雞|炒雞|불닭|양념치킨|韓式炸雞/i, diaryBlob) >= 2 },
    { id: 'kr-palace', country: 'kr', title: '韓服打卡', art: '👘', hint: '到宮殿或韓屋，並蓋上到此一遊', desc: '宮殿的丹青還在，你也站進去了。', test: ctx => ctx.krSpots.some(x => x.s.visited === true && /景福宮|昌德宮|昌慶宮|德壽宮|宮殿|韓屋|北村|韓服/.test(blob(x.s))) },
    { id: 'kr-shop', country: 'kr', title: '弘大明洞逛街', art: '🛍️', hint: '行程裡排進弘大或明洞', desc: '人潮、店門、試穿，街道把一天帶走了。', test: ctx => ctx.krSpots.some(x => /弘大|弘益|明洞|홍대|명동/.test(blob(x.s))) || ctx.krDiary.some(d => /弘大|弘益|明洞|홍대|명동/.test(diaryBlob(d))) },
    { id: 'kr-bbq', country: 'kr', title: '烤肉之夜', art: '🥩', hint: '傍晚五點後排一頓韓國烤肉', desc: '炭火一起來，這天就還沒結束。', test: ctx => ctx.krSpots.some(x => /烤肉|燒肉|갈비|삼겹|五花/.test(blob(x.s)) && /^(\d{1,2})/.test(String(x.s.time || '')) && +RegExp.$1 >= 17) || ctx.krDiary.some(d => /烤肉|燒肉|갈비|삼겹/.test(diaryBlob(d))) },
    { id: 'kr-cafe', country: 'kr', title: '咖啡廳巡禮', art: '☕', hint: '在韓國排進 4 間咖啡廳', desc: '四間咖啡廳，四種安靜。', test: ctx => ctx.krSpots.filter(x => x.s.icon === 'cafe' || /咖啡|咖啡廳|카페|cafe/i.test(blob(x.s))).length >= 4 },
    { id: 'kr-perfect', country: 'kr', title: '完美行程', art: '✨', hint: '同一天至少 3 個景點都蓋上到此一遊', desc: '這一天每一站都到了。漢江的風可以晚一點再吹。', test: ctx => perfect(ctx.kr) },
    { id: 'kr-archive', country: 'kr', title: '旅程封存', art: '📘', hint: '封存一趟韓國行程', desc: '護照蓋上這一頁。下次打開，還是首爾的那個傍晚。', test: ctx => ctx.kr.some(t => t.archived === true) }
  ];

  function makeCtx(trips, diary) {
    const jp = countryTrips(trips, 'jp');
    const kr = countryTrips(trips, 'kr');
    return {
      jp, kr,
      jpSpots: jp.reduce((a, t) => a.concat(spotsOf(t)), []),
      krSpots: kr.reduce((a, t) => a.concat(spotsOf(t)), []),
      jpDiary: diaryFor(jp, diary),
      krDiary: diaryFor(kr, diary)
    };
  }
  function evaluate(trips, diary, earned, now) {
    const ctx = makeCtx(trips, diary);
    const prev = earned && typeof earned === 'object' ? earned : {};
    const next = {};
    const fresh = [];
    const at = now || Date.now();
    CARDS.forEach(card => {
      let have = +prev[card.id];
      let unlocked = false;
      try { unlocked = !!card.test(ctx); } catch (e) { unlocked = false; }
      if (have > 1e11) next[card.id] = have;
      else if (unlocked) { next[card.id] = at; fresh.push(card); }
    });
    return { earned: next, fresh };
  }
  function cardById(id) { return CARDS.find(c => c.id === id) || null; }

  function reduced() {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function haptic(n) {
    try { if (!reduced() && navigator.vibrate) navigator.vibrate(n); } catch (e) {}
  }
  function esc(s) {
    return typeof globalThis.TM !== 'undefined' && TM.esc ? TM.esc(s) : String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function tripsNow() { return (globalThis.TM && TM.trips && TM.trips()) || []; }
  function diaryNow() { try { return (TM.ls.get('fooddiary', []) || []); } catch (e) { return []; } }
  function badges() { try { return TM.ls.get('badges', {}) || {}; } catch (e) { return {}; } }
  function saveBadges(m) { try { TM.ls.set('badges', m); } catch (e) {} }
  function globalStyle() { try { const v = TM.ls.get('styleCountry', 'auto'); return STYLES.some(x => x[0] === v) ? v : 'auto'; } catch (e) { return 'auto'; } }
  function setGlobalStyle(v) { if (!STYLES.some(x => x[0] === v)) return; TM.ls.set('styleCountry', v); apply(); if (TM.render) TM.render(); }

  function apply(trip) {
    if (typeof document === 'undefined') return '';
    const t = trip || (globalThis.TM && TM.T && TM.T());
    const id = resolveTheme(t, globalStyle());
    const rootEl = document.documentElement;
    rootEl.classList.toggle('theme-jp', id === 'jp');
    rootEl.classList.toggle('theme-kr', id === 'kr');
    const editing = !!(globalThis.TM && TM.getTab && TM.getTab() === 'edit');
    if (document.body) document.body.classList.toggle('trip-ro', !!(t && t.archived && editing));
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) {
      const dark = rootEl.classList.contains('dark');
      meta.content = dark ? (id === 'jp' ? '#161C26' : id === 'kr' ? '#141C1A' : '#18212C') : (id === 'jp' ? '#F3E6D4' : id === 'kr' ? '#F4F7F2' : '#F4F8FC');
    }
    return id;
  }

  let checking = false, celebrating = false, prompting = false;
  function afterPaint() {
    apply();
    paintBoxes();
    if (checking || celebrating || prompting) return;
    checking = true;
    let fresh = [];
    try {
      const res = evaluate(tripsNow(), diaryNow(), badges());
      const prev = JSON.stringify(badges());
      if (JSON.stringify(res.earned) !== prev) saveBadges(res.earned);
      fresh = res.fresh;
    } catch (e) { fresh = []; }
    checking = false;
    if (fresh.length) { celebrate(fresh[0], fresh.slice(1)); return; }
    maybePrompt();
  }
  function exportState() {
    return { badges: badges(), themeStyle: globalStyle() };
  }
  function importState(data) {
    if (!data || typeof data !== 'object') return;
    if (data.badges && typeof data.badges === 'object') {
      const cur = badges();
      Object.keys(data.badges).forEach(id => {
        const at = +data.badges[id];
        if (!(at > 1e11) || !cardById(id)) return;
        if (!(+cur[id] > 1e11) || at < +cur[id]) cur[id] = Math.round(at);
      });
      saveBadges(cur);
    }
    if (STYLES.some(x => x[0] === data.themeStyle)) TM.ls.set('styleCountry', data.themeStyle);
  }

  function styleLabel(v) { const f = STYLES.find(x => x[0] === v); return f ? f[1] : '自動（依目的地）'; }
  function paintBoxes() {
    const theme = document.querySelector('#themebox');
    const ach = document.querySelector('#achievebox');
    if (theme) {
      const cur = globalStyle();
      theme.innerHTML = `<div class="card"><b>主題風格</b><p class="mut">自動會依行程目的地換成日本或韓國的紙感背景。每份行程也可以自己改，隨時能回到系統預設。</p><div class="row" style="margin-top:8px">${STYLES.map(([k, lab]) => `<button type="button" class="chip${k === cur ? ' on' : ''}" onclick="Journey.setGlobalStyle('${k}')">${lab}</button>`).join('')}</div></div>`;
    }
    if (ach) {
      const earned = badges();
      const bits = COUNTRIES.map(c => {
        const all = CARDS.filter(card => card.country === c.id);
        const got = all.filter(card => +earned[card.id] > 1e11).length;
        return `${c.name} ${got}/${all.length}`;
      }).join(' · ');
      ach.innerHTML = `<div class="card"><b>成就</b><p class="mut">把走過的日子收成一張張卡片。${esc(bits)}</p><button type="button" class="btn ghost" onclick="Journey.openAchieve()">打開收藏</button></div>`;
    }
  }
  function ymd(at) {
    const d = new Date(+at);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  }
  function openAchieve() {
    const earned = badges();
    const blocks = COUNTRIES.map(c => {
      const all = CARDS.filter(card => card.country === c.id);
      const got = all.filter(card => +earned[card.id] > 1e11).length;
      const cards = all.map(card => {
        const on = +earned[card.id] > 1e11;
        if (!on) return `<button type="button" class="ach ach-lock" onclick="Journey.peek('${card.id}')"><span class="ach-art" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="28" r="10"/><path d="M12 54c4-12 12-16 20-16s16 4 20 16"/></svg></span><b>尚未收集</b><small>${esc(card.hint)}</small></button>`;
        return `<button type="button" class="ach" onclick="Journey.peek('${card.id}')"><span class="ach-art" aria-hidden="true">${card.art}</span><b>${esc(card.title)}</b><small>${esc(ymd(earned[card.id]))}</small></button>`;
      }).join('');
      return `<h3>${c.name} ${got}/${all.length}</h3><div class="achgrid">${cards}</div>`;
    }).join('');
    const layer = layerEl();
    layer.innerHTML = `<div class="achpage"><div class="row" style="align-items:center"><h2 style="margin:0">成就</h2><button type="button" class="btn ghost sm" style="flex:0" onclick="Journey.closeLayer()">關閉</button></div><p class="mut">卡片會自己從行程、到此一遊、美食日記和封存裡長出來。以後還可以再加別的國家。</p>${blocks}</div>`;
    layer.hidden = false;
  }
  function peek(id) {
    const card = cardById(id);
    if (!card) return;
    const at = +badges()[id];
    const on = at > 1e11;
    const layer = layerEl();
    layer.innerHTML = `<div class="achpage"><button type="button" class="btn ghost sm" onclick="Journey.openAchieve()">返回收藏</button><article class="achbig${on ? '' : ' ach-lock'}"><span class="ach-art">${on ? card.art : ''}</span><h2>${on ? esc(card.title) : '尚未收集'}</h2><p>${esc(on ? card.desc : card.hint)}</p>${on ? `<p class="mut">${esc(ymd(at))} 收集</p>` : ''}</article></div>`;
    layer.hidden = false;
  }
  function layerEl() {
    let el = document.querySelector('#jlayer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'jlayer';
      el.className = 'jlayer';
      el.hidden = true;
      document.body.appendChild(el);
    }
    return el;
  }
  function closeLayer() { const el = document.querySelector('#jlayer'); if (el) el.hidden = true; }

  function celebrate(card, rest) {
    celebrating = true;
    const layer = layerEl();
    const colors = ['#C23B3B', '#1E3A5F', '#E7B15A', '#0F6B56', '#F0B4A8', '#B4332A'];
    const conf = reduced() ? '' : Array.from({ length: 18 }, (_, i) => {
      const ang = (i / 18) * Math.PI * 2;
      const dist = 78 + (i % 4) * 22;
      const x = Math.round(Math.cos(ang) * dist);
      const y = Math.round(Math.sin(ang) * dist - 30);
      return `<i class="conf" style="--x:${x}px;--y:${y}px;background:${colors[i % colors.length]}"></i>`;
    }).join('');
    layer.innerHTML = `<div class="cele">${conf}<article class="achbig flip"><span class="ach-art">${card.art}</span><h2>${esc(card.title)}</h2><p>${esc(card.desc)}</p><p class="mut">剛收集到</p><button type="button" class="btn" onclick="Journey.doneCelebrate()">收下</button></article></div>`;
    layer.hidden = false;
    haptic(16);
    try { TM.toast('解鎖成就：' + card.title + (rest && rest.length ? '，還有 ' + rest.length + ' 張' : '')); } catch (e) {}
    layer._rest = rest || [];
  }
  function doneCelebrate() {
    const layer = document.querySelector('#jlayer');
    const rest = layer && layer._rest || [];
    celebrating = false;
    if (rest.length) celebrate(rest[0], rest.slice(1));
    else { closeLayer(); maybePrompt(); }
  }

  function themeSheet() {
    const t = TM.T();
    if (!t) return;
    const cur = STYLES.some(x => x[0] === t.themeStyle) ? t.themeStyle : 'auto';
    const found = detectCountry(t);
    const name = found === 'jp' ? '日本' : found === 'kr' ? '韓國' : '還沒對上日本或韓國';
    TM.openSheet();
    document.querySelector('#sheetBody').innerHTML = `<h2>主題風格</h2><p class="mut">這份行程自動判斷是${esc(name)}。選系統預設就回到旅伴原來的顏色。</p><div class="row">${STYLES.map(([k, lab]) => `<button type="button" class="chip${k === cur ? ' on' : ''}" onclick="Journey.setTripStyle('${k}')">${lab}</button>`).join('')}</div>`;
  }
  function setTripStyle(v) {
    const t = TM.T();
    if (!t || !STYLES.some(x => x[0] === v)) return;
    if (v === 'auto') delete t.themeStyle;
    else t.themeStyle = v;
    t.metaRev = Date.now();
    TM.closeSheet();
    TM.save();
    if (TM.render) TM.render();
  }

  function spendLine(sum) { return sum.spend; }
  function askArchive() {
    const t = TM.T();
    if (!t) return;
    if (t.archived) { unarchive(); return; }
    const sum = summarize(t, diaryNow());
    document.querySelector('#sheetBody').innerHTML = `<h2>封存行程</h2><p>把「${esc(t.dest)}」收成一本可以再翻開的冊子。封存後只能看，可以隨時解除。</p><p class="mut">${sum.days} 天 · 去過 ${sum.visited} 個景點 · 美食日記 ${sum.diary} 則 · ${esc(sum.spend)}</p><div class="row"><button type="button" class="btn ghost" onclick="Journey.dismissArchive()">先不要</button><button type="button" class="btn" onclick="Journey.startArchive()">封存行程</button></div>`;
    TM.openSheet();
  }
  function dismissArchive() { TM.closeSheet(); }
  function startArchive() {
    const t = TM.T();
    if (!t || t.archived) return;
    TM.closeSheet();
    play(t, () => {
      t.archived = true;
      t.archivedAt = Date.now();
      t.archiveAsked = true;
      t.metaRev = Date.now();
      if (TM.getTab && TM.getTab() === 'edit') TM.go('list');
      else TM.save();
      try { TM.toast('已收進封存'); } catch (e) {}
    });
  }
  function unarchive() {
    const t = TM.T();
    if (!t || !t.archived) return;
    delete t.archived;
    delete t.archivedAt;
    t.metaRev = Date.now();
    TM.closeSheet();
    TM.save();
    if (TM.render) TM.render();
    try { TM.toast('已解除封存，可以再改'); } catch (e) {}
  }
  function play(t, done) {
    const sum = summarize(t, diaryNow());
    let el = document.querySelector('#archveil');
    if (!el) {
      el = document.createElement('div');
      el.id = 'archveil';
      el.className = 'archveil';
      document.body.appendChild(el);
    }
    el.className = 'archveil';
    el.hidden = false;
    el.innerHTML = `<div class="archstage"><div class="journal"><div class="journal-spine"></div><b>${esc(t.dest)}</b><small>${esc(t.dep)} – ${esc(t.ret)}</small><span class="jstamp"><b>${esc(t.dest)}</b><small>${esc(String(t.dep).slice(5))}–${esc(String(t.ret).slice(5))}</small></span></div><div class="archsum"><p>${sum.days} 天</p><p>去過 ${sum.visited} 個景點</p><p>美食日記 ${sum.diary} 則</p><p>總花費 ${esc(sum.spend)}</p></div><div class="shelfmini">封存</div></div>`;
    if (reduced()) {
      el.querySelector('.jstamp').classList.add('in');
      el.querySelector('.archsum').classList.add('in');
      setTimeout(() => { el.hidden = true; done(); }, 700);
      return;
    }
    const stamp = el.querySelector('.jstamp');
    const summary = el.querySelector('.archsum');
    setTimeout(() => { stamp.classList.add('thump'); haptic(18); }, 420);
    setTimeout(() => summary.classList.add('in'), 980);
    setTimeout(() => el.classList.add('leave'), 2100);
    setTimeout(() => { el.hidden = true; done(); }, 2800);
  }
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function maybePrompt() {
    if (prompting || celebrating) return;
    if (document.querySelector('#sheet') && document.querySelector('#sheet').classList.contains('on')) return;
    if (document.querySelector('#archveil') && !document.querySelector('#archveil').hidden) return;
    const today = todayStr();
    const t = tripsNow().find(x => x && !x.archived && !x.archiveAsked && x.ret && x.ret < today);
    if (!t) return;
    prompting = true;
    t.archiveAsked = true;
    try { TM.save(); } catch (e) {}
    prompting = false;
    const was = TM.getTab && TM.getTab();
    if (TM.trips) {
      const curId = t.id;
      document.querySelector('#sheetBody').innerHTML = `<h2>這趟走完了</h2><p>「${esc(t.dest)}」在 ${esc(t.ret)} 結束了。要封存起來嗎？之後還是可以打開來看。</p><div class="row"><button type="button" class="btn ghost" onclick="closeSheet()">先不要</button><button type="button" class="btn" onclick="Journey.promptArchive('${esc(curId)}')">封存行程</button></div>`;
      TM.openSheet();
    }
    void was;
  }
  function promptArchive(id) {
    const t = tripsNow().find(x => x && x.id === id);
    if (!t) return;
    TM.closeSheet();
    if (typeof TM.focus === 'function' && !TM.focus(id)) return;
    startArchive();
  }

  return {
    STYLES, COUNTRIES, CARDS, HOME, JP_AIR, KR_AIR,
    detectCountry, resolveTheme, summarize, evaluate, cardById, transitLegs, dayCount,
    apply, afterPaint, exportState, importState, setGlobalStyle, globalStyle,
    openAchieve, peek, closeLayer, celebrate, doneCelebrate,
    themeSheet, setTripStyle, askArchive, dismissArchive, startArchive, unarchive, promptArchive, maybePrompt
  };
});
