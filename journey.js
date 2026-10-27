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
  const STYLES = [['auto', '自動（依目的地）'], ['jp', '日本'], ['kr', '韓國'], ['plain', '系統預設']];
  const STYLE_SHORT = { auto: '自動', jp: '日本', kr: '韓國', plain: '系統預設' };
  /* 加一座城市：在這裡放一筆，再加 city 欄位相同的卡片即可。box 是 [南, 西, 北, 東]，不要跟別的城市重疊。 */
  const CITIES = [
    { id: 'tyo', country: 'jp', name: '東京', color: '#1E3A5F', box: [35.53, 139.55, 35.82, 139.92], words: ['東京', '新宿', '澀谷', '渋谷', '淺草', '浅草', '上野', '晴空塔', 'スカイツリー', '秋葉原', '銀座', '原宿', '六本木', '台場', '築地', '筑地', 'Tokyo', 'Skytree', 'Shibuya', 'Asakusa', 'Akihabara', 'Tsukiji', 'Shinjuku', 'Ueno', 'Ginza'] },
    { id: 'osa', country: 'jp', name: '大阪', color: '#C45A3A', box: [34.55, 135.35, 34.80, 135.60], words: ['大阪', '道頓堀', '心齋橋', '心斎橋', '梅田', '難波', '通天閣', '大阪城', '環球影城', 'Osaka', 'Dotonbori', 'Namba', 'Umeda'] },
    { id: 'kyo', country: 'jp', name: '京都', color: '#6B4C7A', box: [34.90, 135.65, 35.15, 135.85], words: ['京都', '伏見稻荷', '伏見稲荷', '千本鳥居', '清水寺', '金閣寺', '嵐山', '祇園', 'Kyoto', 'Fushimi', 'Arashiyama', 'Kiyomizu', 'Kinkaku'] },
    { id: 'spk', country: 'jp', name: '北海道', color: '#2F6F8F', box: [41.40, 139.30, 45.50, 145.90], words: ['北海道', '札幌', '小樽', 'Sapporo', 'Hokkaido', 'Otaru'] },
    { id: 'oka', country: 'jp', name: '沖繩', color: '#1F8A9A', box: [26.00, 127.60, 26.90, 128.30], words: ['沖繩', '沖縄', '那霸', '那覇', '首里', 'Okinawa', 'Naha'] },
    { id: 'fuk', country: 'jp', name: '福岡', color: '#C45B73', box: [33.45, 130.25, 33.70, 130.70], words: ['福岡', '博多', '中洲', '太宰府', 'Fukuoka', 'Hakata', 'Nakasu'] },
    { id: 'sel', country: 'kr', name: '首爾', color: '#0F6B56', box: [37.42, 126.80, 37.70, 127.18], words: ['首爾', '서울', '明洞', '명동', '弘大', '弘益', '홍대', '景福宮', '경복궁', '南山塔', 'Seoul', 'Myeongdong', 'Hongdae', 'Gyeongbok'] },
    { id: 'pus', country: 'kr', name: '釜山', color: '#2A6F9A', box: [35.05, 128.95, 35.30, 129.25], words: ['釜山', '부산', '海雲臺', '海雲台', '해운대', '甘川', '감천', '札嘎其', '자갈치', 'Busan', 'Haeundae', 'Gamcheon'] },
    { id: 'cju', country: 'kr', name: '濟州', color: '#C47B2B', box: [33.20, 126.15, 33.60, 126.95], words: ['濟州', '제주', '城山', '성산', '漢拿', '한라', 'Jeju', 'Hallasan', 'Seongsan'] }
  ];
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
  function blob(s) { return [s && s.name, s && s.zh, s && s.note, s && s.addr, s && s.address, s && s.area, s && s.ptype, s && s.icon, s && s.iconLabel].filter(Boolean).join(' '); }
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

  function kmBetween(aLat, aLng, bLat, bLng) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (bLat - aLat) * rad, dLng = (bLng - aLng) * rad;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }
  function inBox(lat, lng, box) { return lat >= box[0] && lat <= box[2] && lng >= box[1] && lng <= box[3]; }
  function wordScore(text, words) {
    const s = String(text || ''), low = s.toLowerCase();
    let n = 0;
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (!w) continue;
      if (/[A-Za-z]/.test(w) ? low.includes(w.toLowerCase()) : s.includes(w)) n += w.length;
    }
    return n;
  }
  function cityFromText(text) {
    let best = '', score = 0;
    CITIES.forEach(c => {
      const n = wordScore(text, c.words);
      if (n > score) { score = n; best = c.id; }
    });
    return best;
  }
  function detectCity(spot, trip) {
    const lat = spot && +spot.lat, lng = spot && +spot.lng;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const hit = CITIES.find(c => inBox(lat, lng, c.box));
      if (hit) return hit.id;
    }
    const named = cityFromText(blob(spot));
    if (named) return named;
    return cityFromText(trip && trip.dest);
  }
  function near(spot, lat, lng, km) {
    const a = spot && +spot.lat, b = spot && +spot.lng;
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    return kmBetween(a, b, lat, lng) <= (km || 0.9);
  }
  function hourOf(s) {
    const m = /^(\d{1,2}):(\d{2})/.exec(String(s && s.time || ''));
    if (m) return +m[1];
    const at = +(s && s.visitedAt);
    if (at > 1e11) {
      const d = new Date(at);
      if (!isNaN(d.getTime())) return d.getHours();
    }
    return null;
  }
  function legsOn(s) {
    if (!s || !s.travel) return 0;
    const steps = s.travel.plan && s.travel.plan.steps;
    if (Array.isArray(steps) && steps.length) {
      const rides = steps.filter(st => st && st.kind === 'ride' && String(st.mode || '').toUpperCase() !== 'CAR');
      if (rides.length) return rides.length;
    }
    return s.travel.mode === 'transit' ? 1 : 0;
  }
  function seen(ctx, city, re, at) {
    return (ctx.city[city].spots || []).some(x => {
      if (x.s.visited !== true) return false;
      if (re && re.test(blob(x.s))) return true;
      if (at && near(x.s, at[0], at[1], at[2] || 0.9)) return true;
      return false;
    });
  }
  function foodHits(ctx, city, re) {
    const bag = ctx.city[city];
    return countRe(bag.spots, re, x => blob(x.s)) + countRe(bag.diary, re, diaryBlob);
  }

  const ALIAS = {
    'jp-tokyo': ['tyo-pass'],
    'jp-osaka': ['osa-pass'],
    'kr-palace': ['sel-hanbok'],
    'kr-shop': ['sel-hongdae', 'sel-myeong'],
    'kr-spicy': ['sel-chicken'],
    'kr-bbq': ['sel-bbq'],
    'kr-cafe': ['sel-cafe']
  };
  const card = (id, country, city, title, art, hint, desc, test) => ({ id, country, city, title, art, hint, desc, test });
  const keep = (id, country, title, art, hint, desc, test) => ({ id, country, city: '', title, art, hint, desc, test, legacy: true });
  const CARDS = [
    card('jp-first', 'jp', '', '初訪日本', '🗻', '建立一趟日本行程', '第一趟日本行程已經在旅伴裡了。不管是幾天，都算數。', ctx => ctx.jp.length > 0),
    card('jp-archive', 'jp', '', '旅程封存', '📕', '封存一趟日本行程', '行程收進冊子裡。翻開的時候，還是那幾天。', ctx => ctx.jp.some(t => t.archived === true)),
    card('tyo-senso', 'jp', 'tyo', '淺草寺參拜', '🏮', '在淺草寺蓋上到此一遊', '香煙還在，雷門的燈也還在。你已經站過那一條仲見世。', ctx => seen(ctx, 'tyo', /淺草寺|浅草寺|senso-?ji/i, [35.7148, 139.7967, 0.9])),
    card('tyo-skytree', 'jp', 'tyo', '晴空塔登頂', '🗼', '到晴空塔並蓋上到此一遊', '城市在腳下鋪開。那一晚的燈，算你看過了。', ctx => seen(ctx, 'tyo', /晴空塔|スカイツリー|skytree|東京晴空塔/i, [35.7101, 139.8107, 0.9])),
    card('tyo-scramble', 'jp', 'tyo', '澀谷十字路口', '🚶', '在澀谷十字路口蓋上到此一遊', '綠燈一亮，人潮把你帶過去。你也算其中一個。', ctx => seen(ctx, 'tyo', /澀谷十字|渋谷スクランブル|shibuya crossing|scramble/i, [35.6595, 139.7004, 0.45])),
    card('tyo-tsukiji', 'jp', 'tyo', '築地市場早餐', '🐟', '早上到過築地，或日記寫下築地早餐', '市場還沒散，玉子燒還是熱的。這頓早餐會記得你。', ctx => ctx.city.tyo.spots.some(x => x.s.visited === true && (/築地|筑地|tsukiji/i.test(blob(x.s)) || near(x.s, 35.6654, 139.7707, 0.9)) && hourOf(x.s) != null && hourOf(x.s) < 11) || ctx.city.tyo.diary.some(d => /築地|筑地|tsukiji/i.test(diaryBlob(d)) && /早餐|早上|morning/i.test(diaryBlob(d)))),
    card('tyo-akiba', 'jp', 'tyo', '秋葉原巡禮', '🎮', '在秋葉原蓋上到此一遊', '霓虹、模型、唱片。這條街你走過了。', ctx => seen(ctx, 'tyo', /秋葉原|あきはばら|akihabara/i, [35.6984, 139.7731, 0.9])),
    card('tyo-metro', 'jp', 'tyo', '東京地鐵通', '🚇', '在東京搭過 6 段大眾運輸', '六段電車之後，轉乘不再讓人慌。', ctx => ctx.city.tyo.legs >= 6),
    card('tyo-izakaya', 'jp', 'tyo', '居酒屋之夜', '🍶', '傍晚五點後到過居酒屋，或寫進美食日記', '燈籠亮起來的時候，這一晚才算開始。', ctx => ctx.city.tyo.spots.some(x => x.s.visited === true && /居酒屋|izakaya/i.test(blob(x.s)) && hourOf(x.s) != null && hourOf(x.s) >= 17) || ctx.city.tyo.diary.some(d => /居酒屋|izakaya/i.test(diaryBlob(d)))),
    card('tyo-pass', 'jp', 'tyo', '東京通', '🗺️', '在東京蓋上 6 個到此一遊', '東京的巷子開始認得你了。', ctx => ctx.city.tyo.spots.filter(x => x.s.visited === true).length >= 6),
    card('osa-doton', 'jp', 'osa', '道頓堀吃到', '🦀', '到過道頓堀，或寫進美食日記', '看板的螃蟹還在揮。你也在這條河岸吃過了。', ctx => seen(ctx, 'osa', /道頓堀|dotonbori/i, [34.6687, 135.5013, 0.9]) || ctx.city.osa.diary.some(d => /道頓堀|dotonbori/i.test(diaryBlob(d)))),
    card('osa-castle', 'jp', 'osa', '大阪城', '🏯', '在大阪城蓋上到此一遊', '石垣很高，天守在上面。你走上去了。', ctx => seen(ctx, 'osa', /大阪城|osaka castle/i, [34.6873, 135.5262, 0.9])),
    card('osa-takoyaki', 'jp', 'osa', '章魚燒達人', '🐙', '行程或美食日記裡出現 2 次章魚燒', '兩盒還不夠，但已經算喜歡了。', ctx => foodHits(ctx, 'osa', /章魚燒|たこ焼き|takoyaki/i) >= 2),
    card('osa-kushi', 'jp', 'osa', '通天閣串炸', '🍢', '到過通天閣，或吃過串炸', '新世界的燈下面，串炸是熱的。', ctx => seen(ctx, 'osa', /通天閣|tsutenkaku/i, [34.6525, 135.5063, 0.9]) || foodHits(ctx, 'osa', /串炸|串かつ|kushikatsu/i) >= 1),
    card('osa-usj', 'jp', 'osa', '環球影城', '🎢', '在環球影城蓋上到此一遊', '排隊很長，出園的時候天色也不一樣了。', ctx => seen(ctx, 'osa', /環球影城|ユニバーサル|universal studios|\bUSJ\b/i, [34.6654, 135.4323, 0.9])),
    card('osa-pass', 'jp', 'osa', '大阪通', '🌉', '在大阪蓋上 6 個到此一遊', '道頓堀的燈，你也算看過一輪了。', ctx => ctx.city.osa.spots.filter(x => x.s.visited === true).length >= 6),
    card('kyo-fushimi', 'jp', 'kyo', '伏見稻荷千本鳥居', '⛩️', '在伏見稻荷蓋上到此一遊', '朱紅色一層一層上去。你走進那條隧道了。', ctx => seen(ctx, 'kyo', /伏見稻荷|伏見稲荷|千本鳥居|fushimi inari/i, [34.9671, 135.7727, 0.9])),
    card('kyo-kiyomizu', 'jp', 'kyo', '清水寺', '🔔', '在清水寺蓋上到此一遊', '舞台伸出去的時候，京都就在下面。', ctx => seen(ctx, 'kyo', /清水寺|kiyomizu/i, [34.9949, 135.7850, 0.9])),
    card('kyo-arashiyama', 'jp', 'kyo', '嵐山竹林', '🎋', '在嵐山或竹林蓋上到此一遊', '竹子很高，風一過就沙沙響。你聽過了。', ctx => seen(ctx, 'kyo', /嵐山|竹林|arashiyama|bamboo grove/i, [35.0094, 135.6668, 0.9])),
    card('kyo-kinkaku', 'jp', 'kyo', '金閣寺', '✨', '在金閣寺蓋上到此一遊', '金子貼在池子上。那一張倒影算你看過。', ctx => seen(ctx, 'kyo', /金閣寺|kinkaku/i, [35.0394, 135.7292, 0.9])),
    card('kyo-tea', 'jp', 'kyo', '抹茶甜點', '🍵', '寫下或排進一次抹茶', '苦味先到，甜味跟在後面。京都就是這樣。', ctx => foodHits(ctx, 'kyo', /抹茶|matcha|宇治/i) >= 1),
    card('kyo-pass', 'jp', 'kyo', '京都通', '🍁', '在京都蓋上 4 個到此一遊', '寺門一扇一扇推開，這座城慢慢讓你進來。', ctx => ctx.city.kyo.spots.filter(x => x.s.visited === true).length >= 4),
    card('spk-beer', 'jp', 'spk', '札幌啤酒', '🍺', '到過札幌啤酒園或博物館', '紅磚還在，麥香也還在。北國的第一杯。', ctx => seen(ctx, 'spk', /札幌啤酒|サッポロビール|sapporo beer/i, [43.0715, 141.3690, 0.9]) || foodHits(ctx, 'spk', /札幌啤酒|サッポロビール|sapporo beer/i) >= 1),
    card('spk-clock', 'jp', 'spk', '札幌時鐘台', '🕰️', '在時鐘台蓋上到此一遊', '白色的小鐘樓還在報時。你從它前面走過。', ctx => seen(ctx, 'spk', /時鐘台|時計台|clock tower/i, [43.0626, 141.3536, 0.6])),
    card('spk-odori', 'jp', 'spk', '大通公園', '🌸', '在大通公園蓋上到此一遊', '草地從車站一直鋪到電視塔。你走在中間。', ctx => seen(ctx, 'spk', /大通公園|大通公園|odori/i, [43.0596, 141.3470, 0.9])),
    card('spk-miso', 'jp', 'spk', '味噌拉麵', '🍜', '吃過味噌拉麵', '味噌的甜味先出來。札幌的冬天就靠這一碗。', ctx => foodHits(ctx, 'spk', /味噌拉麵|味噌ラーメン|miso ramen/i) >= 1),
    card('spk-otaru', 'jp', 'spk', '小樽運河', '🚢', '在小樽運河蓋上到此一遊', '倉庫的燈倒在水裡。傍晚很安靜。', ctx => seen(ctx, 'spk', /小樽運河|小樽|otaru/i, [43.1990, 141.0020, 0.9])),
    card('spk-crab', 'jp', 'spk', '螃蟹大餐', '🦀', '吃過螃蟹', '腿很多，桌子會被占滿。這一頓值得。', ctx => foodHits(ctx, 'spk', /螃蟹|かに|蟹|crab/i) >= 1),
    card('oka-shuri', 'jp', 'oka', '首里城', '🏯', '在首里城蓋上到此一遊', '紅牆對著海風。你站上那一段石階了。', ctx => seen(ctx, 'oka', /首里城|shuri/i, [26.2172, 127.7194, 0.9])),
    card('oka-chura', 'jp', 'oka', '美麗海水族館', '🐋', '到過美麗海水族館', '鯨鯊從玻璃另一邊游過。你停了很久。', ctx => seen(ctx, 'oka', /美麗海|美ら海|churaumi|水族館/i, [26.6944, 127.8779, 0.9])),
    card('oka-kokusai', 'jp', 'oka', '國際通', '🛍️', '在國際通蓋上到此一遊', '店門一間接著一間。那霸的晚上從這裡開始。', ctx => seen(ctx, 'oka', /國際通|国際通り|kokusai/i, [26.2160, 127.6880, 0.9])),
    card('oka-beach', 'jp', 'oka', '沖繩海邊', '🏖️', '到過海邊並蓋上到此一遊', '水比想像中清。鞋子可以先脫。', ctx => seen(ctx, 'oka', /海灘|沙灘|ビーチ|beach/i, null)),
    card('oka-taco', 'jp', 'oka', '塔可飯', '🌮', '吃過塔可飯', '米飯、肉末、生菜，一盒就夠走很久。', ctx => foodHits(ctx, 'oka', /塔可飯|タコライス|taco rice/i) >= 1),
    card('oka-pass', 'jp', 'oka', '沖繩通', '🌺', '在沖繩蓋上 4 個到此一遊', '島比地圖上看起來更慢。你已經跟上它的速度。', ctx => ctx.city.oka.spots.filter(x => x.s.visited === true).length >= 4),
    card('fuk-yatai', 'jp', 'fuk', '中洲屋台', '🏮', '到過中洲屋台', '窄窄的一排燈。坐下來，湯是熱的。', ctx => seen(ctx, 'fuk', /中洲屋台|屋台|yatai|中洲/i, [33.5930, 130.4060, 0.8]) || foodHits(ctx, 'fuk', /屋台|yatai/i) >= 1),
    card('fuk-canal', 'jp', 'fuk', '運河城', '🎡', '在運河城蓋上到此一遊', '運河從商場中間穿過去。摩天輪在上面轉。', ctx => seen(ctx, 'fuk', /運河城|canal city/i, [33.5900, 130.4100, 0.6])),
    card('fuk-dazaifu', 'jp', 'fuk', '太宰府', '⛩️', '在太宰府蓋上到此一遊', '參道上的梅花餅是熱的。神社在坡的盡頭。', ctx => seen(ctx, 'fuk', /太宰府|dazaifu/i, [33.5194, 130.5330, 0.9])),
    card('fuk-mentaiko', 'jp', 'fuk', '明太子', '🌶️', '吃過明太子', '鹹、辣、一點點煙燻。福岡就在這一口裡。', ctx => foodHits(ctx, 'fuk', /明太子|mentaiko|明太/i) >= 1),
    card('fuk-tower', 'jp', 'fuk', '福岡塔', '🗼', '在福岡塔蓋上到此一遊', '海邊的塔，晚上會亮。你到過它下面。', ctx => seen(ctx, 'fuk', /福岡塔|fukuoka tower/i, [33.5933, 130.3515, 0.7])),
    card('fuk-pass', 'jp', 'fuk', '福岡通', '🍜', '在福岡蓋上 4 個到此一遊', '博多的巷子不寬，可是你已經走熟了一點。', ctx => ctx.city.fuk.spots.filter(x => x.s.visited === true).length >= 4),
    card('kr-first', 'kr', '', '初訪韓國', '🏯', '建立一趟韓國行程', '第一趟韓國行程開始了。辣的、甜的，都還在前面。', ctx => ctx.kr.length > 0),
    card('kr-archive', 'kr', '', '旅程封存', '📘', '封存一趟韓國行程', '護照蓋上這一頁。下次打開，還是那個傍晚。', ctx => ctx.kr.some(t => t.archived === true)),
    card('sel-hanbok', 'kr', 'sel', '景福宮韓服打卡', '👘', '在景福宮蓋上到此一遊', '丹青還在，宮門也還在。你站進去了。', ctx => seen(ctx, 'sel', /景福宮|경복궁|gyeongbok/i, [37.5796, 126.9770, 0.7])),
    card('sel-hongdae', 'kr', 'sel', '弘大逛街', '🛍️', '在弘大蓋上到此一遊', '店門、音樂、人潮。這條街把一個下午拿走了。', ctx => seen(ctx, 'sel', /弘大|弘益|홍대|hongdae/i, [37.5563, 126.9236, 0.8])),
    card('sel-myeong', 'kr', 'sel', '明洞美妝', '💄', '在明洞蓋上到此一遊', '試色的燈很亮。袋子會在不知不覺中變重。', ctx => seen(ctx, 'sel', /明洞|명동|myeongdong/i, [37.5636, 126.9860, 0.7])),
    card('sel-namsan', 'kr', 'sel', '南山塔', '🗼', '在南山塔蓋上到此一遊', '首爾在下面一層一層亮起來。你在上面看過。', ctx => seen(ctx, 'sel', /南山塔|首爾塔|서울타워|namsan|n seoul tower/i, [37.5512, 126.9882, 0.7])),
    card('sel-gwangjang', 'kr', 'sel', '廣藏市場', '🥘', '在廣藏市場蓋上到此一遊，或寫進日記', '綠豆煎餅的聲音先到。市場的燈很暖。', ctx => seen(ctx, 'sel', /廣藏|광장시장|gwangjang/i, [37.5700, 126.9996, 0.6]) || ctx.city.sel.diary.some(d => /廣藏|광장시장|gwangjang/i.test(diaryBlob(d)))),
    card('sel-chicken', 'kr', 'sel', '炎雞啤酒', '🌶️', '同一餐或分開吃過韓式炸雞和啤酒', '辣到流淚，啤酒跟著來。這就是喜歡。', ctx => {
      const chick = /炸雞|辣雞|辣炒雞|炒雞|치킨|불닭|양념치킨|韓式炸雞|fried chicken/i;
      const beer = /啤酒|生啤|맥주|beer/i;
      const texts = ctx.city.sel.spots.map(x => blob(x.s)).concat(ctx.city.sel.diary.map(diaryBlob));
      if (texts.some(t => chick.test(t) && beer.test(t))) return true;
      return texts.some(t => chick.test(t)) && texts.some(t => beer.test(t));
    }),
    card('sel-bbq', 'kr', 'sel', '烤肉之夜', '🥩', '傍晚五點後排一頓韓國烤肉，或寫進日記', '炭火一起來，這天就還沒結束。', ctx => ctx.city.sel.spots.some(x => /烤肉|燒肉|갈비|삼겹|五花|韓式烤肉/.test(blob(x.s)) && hourOf(x.s) != null && hourOf(x.s) >= 17) || ctx.city.sel.diary.some(d => /烤肉|燒肉|갈비|삼겹/.test(diaryBlob(d)))),
    card('sel-cafe', 'kr', 'sel', '咖啡廳巡禮', '☕', '在首爾排進 4 間咖啡廳', '四間咖啡廳，四種安靜。', ctx => ctx.city.sel.spots.filter(x => x.s.icon === 'cafe' || /咖啡|咖啡廳|카페|cafe/i.test(blob(x.s))).length >= 4),
    card('pus-gamcheon', 'kr', 'pus', '甘川文化村', '🎨', '在甘川文化村蓋上到此一遊', '房子一層一層塗上顏色。坡很陡，風景也跟著陡。', ctx => seen(ctx, 'pus', /甘川|감천|gamcheon/i, [35.0975, 129.0107, 0.8])),
    card('pus-haeundae', 'kr', 'pus', '海雲臺', '🌊', '在海雲臺蓋上到此一遊', '沙灘比想像中長。海風把一天吹慢。', ctx => seen(ctx, 'pus', /海雲臺|海雲台|해운대|haeundae/i, [35.1587, 129.1604, 0.9])),
    card('pus-jagalchi', 'kr', 'pus', '札嘎其市場', '🐟', '在札嘎其市場蓋上到此一遊，或寫進日記', '海鮮在冰上，湯在旁邊。釜山的味道從這裡開始。', ctx => seen(ctx, 'pus', /札嘎其|자갈치|jagalchi/i, [35.0968, 129.0306, 0.7]) || ctx.city.pus.diary.some(d => /札嘎其|자갈치|jagalchi/i.test(diaryBlob(d)))),
    card('pus-gwangalli', 'kr', 'pus', '廣安里', '🌉', '在廣安里蓋上到此一遊', '大橋亮起來的時候，海邊的人會停一下。', ctx => seen(ctx, 'pus', /廣安里|광안리|gwangalli/i, [35.1532, 129.1186, 0.9])),
    card('pus-gukbap', 'kr', 'pus', '豬肉湯飯', '🍲', '吃過豬肉湯飯', '湯是白的，飯泡進去剛剛好。釜山人的早餐。', ctx => foodHits(ctx, 'pus', /豬肉湯飯|돼지국밥|gukbap/i) >= 1),
    card('pus-pass', 'kr', 'pus', '釜山通', '⛴️', '在釜山蓋上 4 個到此一遊', '海在城的旁邊。你已經沿著它走了一段。', ctx => ctx.city.pus.spots.filter(x => x.s.visited === true).length >= 4),
    card('cju-seongsan', 'kr', 'cju', '城山日出峰', '🌅', '在城山日出峰蓋上到此一遊', '火山口對著海。早一點到，光會先碰到你。', ctx => seen(ctx, 'cju', /城山日出峰|성산일출봉|seongsan/i, [33.4581, 126.9425, 0.9])),
    card('cju-halla', 'kr', 'cju', '漢拿山', '⛰️', '在漢拿山蓋上到此一遊', '島的最高處。風比山下大，視野也是。', ctx => seen(ctx, 'cju', /漢拿山|한라산|hallasan/i, [33.3617, 126.5292, 1.5])),
    card('cju-pork', 'kr', 'cju', '黑豬肉', '🥩', '吃過黑豬肉', '肉很香，烤盤會記得這一頓。', ctx => foodHits(ctx, 'cju', /黑豬|흑돼지|black pork/i) >= 1),
    card('cju-udo', 'kr', 'cju', '牛島', '🚲', '在牛島蓋上到此一遊', '小島繞一圈就夠。海在每一個轉彎。', ctx => seen(ctx, 'cju', /牛島|우도|udo/i, [33.5060, 126.9530, 1.2])),
    card('cju-seongeup', 'kr', 'cju', '城邑民俗村', '🏘️', '在城邑民俗村蓋上到此一遊', '石頭牆還在，草屋頂也還在。時間走得比較慢。', ctx => seen(ctx, 'cju', /城邑|성읍민속마을|seongeup/i, [33.3840, 126.7840, 0.8])),
    card('cju-pass', 'kr', 'cju', '濟州通', '🍊', '在濟州蓋上 4 個到此一遊', '橘子、風、火山石。這座島開始認得你。', ctx => ctx.city.cju.spots.filter(x => x.s.visited === true).length >= 4),
    keep('jp-ramen', 'jp', '拉麵達人', '🍜', '行程或美食日記裡出現 3 次拉麵', '三碗拉麵，三種湯頭。這趟沒有白來。', ctx => countRe(ctx.jpSpots, /拉麵|ラーメン|ramen/i, x => blob(x.s)) + countRe(ctx.jpDiary, /拉麵|ラーメン|ramen/i, diaryBlob) >= 3),
    keep('jp-shrine', 'jp', '寺社巡禮', '⛩️', '5 座寺廟或神社蓋上到此一遊', '寺鐘和鳥居都蓋上了到此一遊。慢慢走就好。', ctx => ctx.jpSpots.filter(x => x.s.visited === true && /寺|神社|神宮|大社|佛閣/.test(blob(x.s))).length >= 5),
    keep('jp-rail', 'jp', '鐵道迷', '🚃', '累積 10 段大眾運輸', '十段電車或地鐵，沿線的風景都算旅費。', ctx => ctx.jp.reduce((n, t) => n + transitLegs(t), 0) >= 10),
    keep('jp-konbini', 'jp', '便利商店高手', '🏪', '美食日記提到 7-Eleven、Lawson 或全家 3 次', '御飯糰、咖啡、熱食，便利商店就是第二個家。', ctx => countRe(ctx.jpDiary, /7-?\s?11|7-?eleven|セブン|lawson|ローソン|羅森|familymart|ファミリーマート|全家/i, diaryBlob) >= 3),
    keep('jp-early', 'jp', '早起的鳥', '🌅', '有一個景點在早上 8 點前到過', '城市還沒完全醒來，你已經在路上。', ctx => ctx.jpSpots.some(x => hmBefore8(x.s))),
    keep('jp-foodie', 'jp', '美食家', '🍱', '日本行程期間寫下 10 則美食日記', '十則日記，十種味道。記得寫下來，才不會只剩帳單。', ctx => ctx.jpDiary.length >= 10),
    keep('jp-perfect', 'jp', '完美行程', '✨', '同一天至少 3 個景點都蓋上到此一遊', '這一天每一站都到了。很少人能這樣走完。', ctx => perfect(ctx.jp)),
    keep('kr-perfect', 'kr', '完美行程', '✨', '同一天至少 3 個景點都蓋上到此一遊', '這一天每一站都到了。漢江的風可以晚一點再吹。', ctx => perfect(ctx.kr))
  ];

  function citiesOnTrip(t) {
    const ids = new Set();
    const dest = cityFromText(t && t.dest);
    if (dest) ids.add(dest);
    spotsOf(t).forEach(x => { const id = detectCity(x.s, t); if (id) ids.add(id); });
    return ids;
  }
  function makeCtx(trips, diary) {
    const jp = countryTrips(trips, 'jp');
    const kr = countryTrips(trips, 'kr');
    const city = {};
    CITIES.forEach(c => { city[c.id] = { spots: [], diary: [], legs: 0 }; });
    (trips || []).forEach(t => spotsOf(t).forEach(x => {
      const id = detectCity(x.s, t);
      if (!id || !city[id]) return;
      city[id].spots.push(x);
      city[id].legs += legsOn(x.s);
    }));
    (diary || []).forEach(d => {
      const named = cityFromText(diaryBlob(d));
      const ids = named ? [named] : [];
      if (!named) (trips || []).forEach(t => { if (inRange(d && d.date, t)) citiesOnTrip(t).forEach(id => ids.push(id)); });
      new Set(ids).forEach(id => { if (city[id]) city[id].diary.push(d); });
    });
    return {
      jp, kr, city,
      jpSpots: jp.reduce((a, t) => a.concat(spotsOf(t)), []),
      krSpots: kr.reduce((a, t) => a.concat(spotsOf(t)), []),
      jpDiary: diaryFor(jp, diary),
      krDiary: diaryFor(kr, diary)
    };
  }
  function migrateBadges(earned) {
    const prev = earned && typeof earned === 'object' ? earned : {};
    const next = {};
    Object.keys(prev).forEach(id => {
      const at = Math.round(+prev[id]);
      if (!(at > 1e11)) return;
      next[id] = at;
      (ALIAS[id] || []).forEach(to => {
        if (!(+next[to] > 1e11) || at < +next[to]) next[to] = at;
      });
    });
    return next;
  }
  function evaluate(trips, diary, earned, now) {
    const ctx = makeCtx(trips, diary);
    const prev = migrateBadges(earned);
    const next = {};
    Object.keys(prev).forEach(id => { if (+prev[id] > 1e11) next[id] = Math.round(+prev[id]); });
    const fresh = [];
    const at = now || Date.now();
    CARDS.forEach(card => {
      if (card.legacy) return;
      if (+next[card.id] > 1e11) return;
      let unlocked = false;
      try { unlocked = !!(card.test && card.test(ctx)); } catch (e) { unlocked = false; }
      if (unlocked) { next[card.id] = at; fresh.push(card); }
    });
    return { earned: next, fresh };
  }
  function cardById(id) { return CARDS.find(c => c.id === id) || null; }
  function knownBadge(id) { return !!(cardById(id) || ALIAS[id]); }

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
    paintBrief();
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
        if (!(at > 1e11) || !knownBadge(id)) return;
        if (!(+cur[id] > 1e11) || at < +cur[id]) cur[id] = Math.round(at);
      });
      saveBadges(migrateBadges(cur));
    }
    if (STYLES.some(x => x[0] === data.themeStyle)) TM.ls.set('styleCountry', data.themeStyle);
  }

  function styleLabel(v) { const f = STYLES.find(x => x[0] === v); return f ? f[1] : '自動（依目的地）'; }
  function shortStyle(v) { return STYLE_SHORT[v] || '自動'; }
  function progressBrief(earned) {
    const got = earned || badges();
    let best = null;
    CITIES.forEach(city => {
      const all = CARDS.filter(c => c.city === city.id && !c.legacy);
      if (!all.length) return;
      const n = all.filter(c => +got[c.id] > 1e11).length;
      if (!n) return;
      const score = n / all.length;
      if (!best || score > best.score || (score === best.score && n > best.n)) best = { name: city.name, n, total: all.length, score };
    });
    return best ? best.name + ' ' + best.n + '/' + best.total : '尚未收集';
  }
  function paintBrief() {
    if (typeof document === 'undefined') return;
    const ach = document.querySelector('[data-brief="ach"]');
    if (ach) ach.textContent = progressBrief();
    const theme = document.querySelector('[data-brief="theme"]');
    if (theme) theme.textContent = shortStyle(globalStyle());
  }
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
  let achCountry = 'jp';
  function achButton(card, earned) {
    const on = +earned[card.id] > 1e11;
    const cls = 'ach' + (card.city ? ' city-' + card.city : '') + (on ? '' : ' ach-lock');
    if (!on) return `<button type="button" class="${cls}" onclick="Journey.peek('${card.id}')"><span class="ach-art" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="28" r="10"/><path d="M12 54c4-12 12-16 20-16s16 4 20 16"/></svg></span><b>尚未收集</b><small>${esc(card.hint)}</small></button>`;
    return `<button type="button" class="${cls}" onclick="Journey.peek('${card.id}')"><span class="ach-art" aria-hidden="true">${card.art}</span><b>${esc(card.title)}</b><small>${esc(ymd(earned[card.id]))}</small></button>`;
  }
  function openAchieve(which) {
    if (which === 'jp' || which === 'kr') achCountry = which;
    const earned = badges();
    const tabs = `<div class="seg achtabs">${COUNTRIES.map(c => `<button type="button" class="${c.id === achCountry ? 'on' : ''}" onclick="Journey.openAchieve('${c.id}')">${c.name}</button>`).join('')}</div>`;
    const country = CARDS.filter(c => c.country === achCountry && !c.city && !c.legacy).map(c => achButton(c, earned)).join('');
    const cities = CITIES.filter(c => c.country === achCountry).map(city => {
      const all = CARDS.filter(c => c.city === city.id && !c.legacy);
      if (!all.length) return '';
      const got = all.filter(c => +earned[c.id] > 1e11).length;
      return `<div class="cityhead"><h3>${esc(city.name)}</h3><span>${got}/${all.length}</span></div><div class="achgrid">${all.map(c => achButton(c, earned)).join('')}</div>`;
    }).join('');
    const legacy = CARDS.filter(c => c.country === achCountry && c.legacy && +earned[c.id] > 1e11);
    const old = legacy.length ? `<div class="cityhead"><h3>沿途還留著</h3><span>${legacy.length}</span></div><div class="achgrid">${legacy.map(c => achButton(c, earned)).join('')}</div>` : '';
    const layer = layerEl();
    layer.innerHTML = `<div class="achpage"><div class="row" style="align-items:center"><h2 style="margin:0">成就</h2><button type="button" class="btn ghost sm" style="flex:0" onclick="Journey.closeLayer()">關閉</button></div><p class="mut achhint">卡片會從到此一遊、美食日記和封存裡長出來。</p>${tabs}<div class="achgrid">${country}</div>${cities}${old}</div>`;
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
    document.querySelector('#sheetBody').innerHTML = `<h2>主題風格</h2><p class="mut">這份行程自動判斷是${esc(name)}。選系統預設就回到旅伴原來的顏色。</p><div class="seg">${STYLES.map(([k]) => `<button type="button" class="${k === cur ? 'on' : ''}" onclick="Journey.setTripStyle('${k}')">${shortStyle(k)}</button>`).join('')}</div>`;
  }
  function setTripStyle(v) {
    const t = TM.T();
    if (!t || !STYLES.some(x => x[0] === v)) return;
    if (v === 'auto') delete t.themeStyle;
    else t.themeStyle = v;
    t.metaRev = Date.now();
    TM.save();
    if (TM.render) TM.render();
    themeSheet();
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
    STYLES, COUNTRIES, CITIES, CARDS, ALIAS, HOME, JP_AIR, KR_AIR,
    detectCountry, detectCity, resolveTheme, summarize, evaluate, cardById, migrateBadges, progressBrief, shortStyle, transitLegs, dayCount,
    apply, afterPaint, exportState, importState, setGlobalStyle, globalStyle,
    openAchieve, peek, closeLayer, celebrate, doneCelebrate,
    themeSheet, setTripStyle, askArchive, dismissArchive, startArchive, unarchive, promptArchive, maybePrompt
  };
});
