/* 目的地主題、封存儀式、成就卡。純函式可在測試裡用。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Journey = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const HOME = { TPE: 1, TSA: 1, KHH: 1, RMQ: 1, TNN: 1, HUN: 1, TTT: 1, CYI: 1, PIF: 1, KNH: 1, LZN: 1, MFK: 1, KYD: 1, GNI: 1 };
  const JP_AIR = { NRT: 1, HND: 1, KIX: 1, ITM: 1, UKB: 1, NGO: 1, CTS: 1, FUK: 1, OKA: 1, KOJ: 1, HIJ: 1, SDJ: 1, KMQ: 1, TAK: 1, KMJ: 1, FSZ: 1, OKJ: 1, TOY: 1, KIJ: 1, AOJ: 1, MMB: 1, AKJ: 1 };
  const KR_AIR = { ICN: 1, GMP: 1, PUS: 1, CJU: 1, TAE: 1, KWJ: 1, CJJ: 1, RSU: 1 };
  const CITY_AIR = { NRT: 'tyo', HND: 'tyo', KIX: 'osa', ITM: 'osa', UKB: 'osa', FUK: 'fuk', OKA: 'oka', CTS: 'spk', ICN: 'sel', GMP: 'sel', PUS: 'pus', CJU: 'cju', TPE: 'tpe', TSA: 'tpe', RMQ: 'txg', TNN: 'tnn', KHH: 'khh', HUN: 'hul', TTT: 'ttt', CYI: 'cyi', PIF: 'ktn', KNH: 'kmn', LZN: 'mzu', MFK: 'mzu', KYD: 'lny', GNI: 'lud' };
  const JP_WORDS = ['日本', '東京', '大阪', '京都', '福岡', '札幌', '沖繩', '名古屋', '奈良', '神戶', '神戸', '橫濱', '横浜', '鎌倉', '箱根', '北海道', '廣島', '広島', '金澤', '金沢', '淺草', '浅草', '新宿', '澀谷', '渋谷', '上野', '晴空塔', '東京鐵塔', '東京塔', '道頓堀', '心齋橋', '心斎橋', '伏見稻荷', '伏見稲荷', '清水寺', '金閣寺', '嵐山', 'Tokyo', 'Osaka', 'Kyoto', 'Japan', 'Sapporo', 'Okinawa', 'Hiroshima', 'Nara', 'Kobe', 'Yokohama'];
  const KR_WORDS = ['韓國', '首爾', '釜山', '濟州', '仁川', '大邱', '光州', '慶州', '江陵', '明洞', '弘大', '弘益', '景福宮', '昌德宮', '昌慶宮', '德壽宮', '北村', '韓屋', 'Seoul', 'Busan', 'Korea', 'Jeju', 'Incheon', 'Myeongdong', 'Hongdae'];
  const TW_WORDS = ['台灣', '臺灣', '台北', '臺北', '新北', '台中', '臺中', '台南', '臺南', '高雄', '花蓮', '台東', '臺東', '嘉義', '阿里山', '墾丁', '屏東', '宜蘭', '南投', '日月潭', '太魯閣', '九份', '野柳', '淡水', '駁二', '七星潭', '三仙台', '伯朗大道', '鵝鑾鼻', '傳藝', '九族', '金門', '馬祖', '蘭嶼', '綠島', 'Taipei', 'Taichung', 'Tainan', 'Kaohsiung', 'Hualien', 'Taitung', 'Chiayi', 'Alishan', 'Kenting', 'Pingtung', 'Yilan', 'Nantou', 'Taiwan', 'Sun Moon Lake', 'Kinmen', 'Matsu', 'Lanyu', 'Green Island'];
  const STYLES = [['auto', '自動（依目的地）'], ['jp', '日本'], ['kr', '韓國'], ['tw', '台灣'], ['plain', '系統預設']];
  const STYLE_SHORT = { auto: '自動', jp: '日本', kr: '韓國', tw: '台灣', plain: '系統預設' };
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
    { id: 'cju', country: 'kr', name: '濟州', color: '#C47B2B', box: [33.20, 126.15, 33.60, 126.95], words: ['濟州', '제주', '城山', '성산', '漢拿', '한라', 'Jeju', 'Hallasan', 'Seongsan'] },
    { id: 'tpe', country: 'tw', name: '台北', color: '#1565C0', box: [24.96, 121.28, 25.30, 122.05], words: ['台北', '臺北', '新北', '台北101', '故宮', '九份', '淡水', '士林', '西門', '貓空', '象山', '野柳', '北投', '大稻埕', 'Taipei', 'Jiufen', 'Yehliu'] },
    { id: 'txg', country: 'tw', name: '台中', color: '#E07A3D', box: [24.02, 120.40, 24.50, 121.00], words: ['台中', '臺中', '科博館', '自然科學博物館', '高美', '彩虹眷村', '逢甲', '霧峰', '九二一', 'Taichung'] },
    { id: 'tnn', country: 'tw', name: '台南', color: '#8C3A4A', box: [22.88, 120.05, 23.12, 120.32], words: ['台南', '臺南', '奇美', '赤嵌', '赤崁', '安平', '億載', 'Tainan'] },
    { id: 'khh', country: 'tw', name: '高雄', color: '#0F4C81', box: [22.48, 120.22, 22.85, 120.42], words: ['高雄', '駁二', '蓮池潭', '打狗', '美麗島', '鹽埕', '旗津', 'Kaohsiung'] },
    { id: 'hul', country: 'tw', name: '花蓮', color: '#1B7A4A', box: [23.75, 121.35, 24.35, 121.80], words: ['花蓮', '太魯閣', '七星潭', '池南', 'Hualien', 'Taroko'] },
    { id: 'ttt', country: 'tw', name: '台東', color: '#C4922A', box: [22.50, 120.85, 23.45, 121.44], words: ['台東', '臺東', '三仙台', '伯朗', '池上', '知本', 'Taitung'] },
    { id: 'cyi', country: 'tw', name: '嘉義', color: '#4A5D23', box: [23.30, 120.30, 23.68, 120.84], words: ['嘉義', '阿里山', 'Alishan', 'Chiayi'] },
    { id: 'ktn', country: 'tw', name: '墾丁', color: '#E26D5A', box: [21.85, 120.62, 22.40, 120.95], words: ['墾丁', '屏東', '鵝鑾鼻', '海生館', '海洋生物博物館', '恆春', 'Kenting', 'Eluanbi'] },
    { id: 'yil', country: 'tw', name: '宜蘭', color: '#5C7C99', box: [24.40, 121.45, 24.95, 122.05], words: ['宜蘭', '傳藝', '礁溪', '羅東', 'Yilan'] },
    { id: 'nto', country: 'tw', name: '南投', color: '#6B7C3A', box: [23.70, 120.55, 24.01, 121.15], words: ['南投', '日月潭', '九族', '魚池', 'Sun Moon'] },
    { id: 'kmn', country: 'tw', name: '金門', color: '#D36B4F', box: [24.35, 118.15, 24.55, 118.55], words: ['金門', '烈嶼', '莒光樓', 'Kinmen'] },
    { id: 'mzu', country: 'tw', name: '馬祖', color: '#3E8E8A', box: [25.92, 119.90, 26.42, 120.55], words: ['馬祖', '南竿', '北竿', '東引', '莒光', 'Matsu'] },
    { id: 'lud', country: 'tw', name: '綠島', color: '#2E9B57', box: [22.60, 121.46, 22.72, 121.56], words: ['綠島', 'Green Island'] },
    { id: 'lny', country: 'tw', name: '蘭嶼', color: '#7A62C4', box: [21.98, 121.48, 22.12, 121.62], words: ['蘭嶼', 'Lanyu', 'Orchid Island'] }
  ];
  const COUNTRIES = [
    { id: 'jp', name: '日本' },
    { id: 'kr', name: '韓國' },
    { id: 'tw', name: '台灣' }
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
    const bag = { jp: 0, kr: 0, tw: 0 };
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
    if (hasWord(text, TW_WORDS)) bag.tw += w;
    const a = airScore(text);
    bag.jp += a.jp * w;
    bag.kr += a.kr * w;
    bag.tw += a.tw * w;
  }
  function detectCountry(trip) {
    if (!trip) return '';
    const bag = { jp: 0, kr: 0, tw: 0 };
    addScore(bag, trip.dest, 4);
    (trip.days || []).forEach(d => (d || []).forEach(s => {
      if (!s) return;
      addScore(bag, s.name, 2);
      addScore(bag, s.zh, 1);
      addScore(bag, s.from, 2);
      addScore(bag, s.to, 3);
      addScore(bag, s.note, 1);
    }));
    const ids = ['jp', 'kr', 'tw'];
    const max = Math.max(bag.jp, bag.kr, bag.tw);
    if (!max) return '';
    const winners = ids.filter(id => bag[id] === max);
    if (winners.length === 1) return winners[0];
    const d = String(trip.dest || '');
    const words = { jp: JP_WORDS, kr: KR_WORDS, tw: TW_WORDS };
    const named = winners.filter(id => hasWord(d, words[id]) || airScore(d)[id]);
    return (named.length === 1 ? named : winners)[0];
  }
  function resolveTheme(trip, globalStyle) {
    const g = STYLES.some(x => x[0] === globalStyle) ? globalStyle : 'auto';
    const local = trip && STYLES.some(x => x[0] === trip.themeStyle) ? trip.themeStyle : '';
    const pick = local || g;
    if (pick === 'plain') return '';
    if (pick === 'jp' || pick === 'kr' || pick === 'tw') return pick;
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

  /* 封存後的紀念品。純函式，畫面只負責把結果畫出來。 */
  const SOUVENIRS = [['pass', '登機證'], ['card', '紀念卡'], ['stamp', '印章'], ['charm', '護符'], ['badge', '徽章'], ['plaque', '木牌'], ['pack', '卡包']];
  const LOOKS = {
    pass: [['stub', '撕票根'], ['fold', '對折機票'], ['phone', '電子條碼票'], ['book', '旅程貼紙冊'], ['sleeve', '紀念票卡套']],
    card: [['gloss', '亮面明信片'], ['foil', '箔燙卡'], ['scratch', '刮刮隱藏卡'], ['popup', '立體摺卡'], ['frame', '相框收藏卡']],
    stamp: [['round', '圓印蓋面'], ['square', '方印朱泥'], ['passport', '護照蓋頁'], ['pad', '印泥台展示'], ['foil', '箔燙紀念印']],
    charm: [['pouch', '經典袋裝'], ['envelope', '扁封套'], ['rack', '神社掛排'], ['blister', '展示卡'], ['local', '在地造型']],
    badge: [['round', '卡紙圓形'], ['shield', '毛氈盾形'], ['hex', '吸塑六角'], ['board', '別針絨板'], ['tin', '金屬盒裝']],
    plaque: [['small', '小五角牌'], ['large', '大牌單掛'], ['wall', '神社掛牆'], ['wish', '台灣許願牌'], ['pray', '韓國祈福牌']],
    pack: [['soft', '撕口軟包'], ['box', '硬盒卡匣'], ['drawer', '抽屜紙盒'], ['blister', '透明展示包'], ['city', '城市限定封']]
  };  const AIR_ZH = {
    TPE: '桃園', TSA: '松山', KHH: '高雄', RMQ: '台中', TNN: '台南', HUN: '花蓮', TTT: '台東', CYI: '嘉義', PIF: '屏東',
    KNH: '金門', LZN: '南竿', MFK: '北竿', KYD: '蘭嶼', GNI: '綠島',
    NRT: '成田', HND: '羽田', KIX: '關西', ITM: '伊丹', UKB: '神戶', NGO: '中部', CTS: '新千歲', FUK: '福岡', OKA: '那霸',
    KOJ: '鹿兒島', HIJ: '廣島', SDJ: '仙台', KMQ: '小松', TAK: '高松', KMJ: '熊本', FSZ: '靜岡', OKJ: '岡山',
    ICN: '仁川', GMP: '金浦', PUS: '金海', CJU: '濟州', TAE: '大邱',
    BKK: '素萬那普', DMK: '廊曼', CNX: '清邁', HKT: '普吉', HKG: '香港', MFM: '澳門', SIN: '樟宜', KUL: '吉隆坡',
    MNL: '馬尼拉', CEB: '宿霧', SGN: '胡志明市', HAN: '河內', DAD: '峴港', DPS: '峇里島',
    PVG: '浦東', SHA: '虹橋', PEK: '首都', CDG: '戴高樂', LHR: '希斯洛', JFK: '甘迺迪', LAX: '洛杉磯', SFO: '舊金山', SYD: '雪梨', BNE: '布里斯本'
  };
  const DEST_AIR = {
    東京: 'NRT', 大阪: 'KIX', 京都: 'KIX', 福岡: 'FUK', 札幌: 'CTS', 北海道: 'CTS', 沖繩: 'OKA', 名古屋: 'NGO',
    首爾: 'ICN', 釜山: 'PUS', 濟州: 'CJU', 曼谷: 'BKK', 香港: 'HKG', 新加坡: 'SIN', 吉隆坡: 'KUL', 馬尼拉: 'MNL',
    胡志明市: 'SGN', 河內: 'HAN', 峇里島: 'DPS', 巴黎: 'CDG', 倫敦: 'LHR', 紐約: 'JFK',
    台北: 'TPE', 臺北: 'TPE', 台灣: 'TPE', 臺灣: 'TPE', 高雄: 'KHH', 台中: 'RMQ', 臺中: 'RMQ', 台南: 'TNN', 臺南: 'TNN',
    花蓮: 'HUN', 台東: 'TTT', 臺東: 'TTT', 嘉義: 'CYI', 墾丁: 'KHH', 屏東: 'KHH', 宜蘭: 'TPE', 南投: 'RMQ', 日月潭: 'RMQ'
  };
  function kindOk(v) { return SOUVENIRS.some(x => x[0] === v); }
  function kindLabel(v) { return (SOUVENIRS.find(x => x[0] === v) || ['', '紀念品'])[1]; }
  function airName(code) {
    const c = String(code || '').toUpperCase();
    if (AIR_ZH[c]) return AIR_ZH[c];
    return c;
  }
  function routeText(from, to, destName) {
    const a = from ? airName(from) : '';
    const b = to ? airName(to) : '';
    if (a && b) return a + ' → ' + b;
    if (a && destName) return a + ' → ' + destName;
    if (b && destName) return destName + ' → ' + b;
    return a || b || '';
  }
  function flightLegs(trip) {
    const out = [];
    (trip && trip.days || []).forEach(d => (d || []).forEach(s => {
      if (!s || (s.kind !== 'flight' && !isHop(s))) return;
      let from = String(s.from || '').toUpperCase();
      let to = String(s.to || '').toUpperCase();
      const name = String(s.name || '');
      if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
        const m = /([A-Z]{3})\s*(?:→|->|–|~|-)\s*([A-Z]{3})/.exec(name);
        if (m) {
          if (!/^[A-Z]{3}$/.test(from)) from = m[1];
          if (!/^[A-Z]{3}$/.test(to)) to = m[2];
        }
      }
      const no = (name.match(/[A-Z0-9]{2}\s?\d{1,4}/) || [])[0] || '';
      out.push({
        from: /^[A-Z]{3}$/.test(from) ? from : '',
        to: /^[A-Z]{3}$/.test(to) ? to : '',
        no: String(no).replace(/\s/g, ''),
        leg: s.leg === 'return' ? 'return' : 'out'
      });
    }));
    return out;
  }
  function isEat(s) {
    if (!s || s.kind === 'flight' || s.kind === 'hotel' || isHop(s)) return false;
    return s.icon === 'food' || s.icon === 'cafe' || s.ptype === '餐廳';
  }
  function isShop(s) {
    if (!s || s.kind === 'flight' || s.kind === 'hotel' || isHop(s)) return false;
    if (s.icon === 'shopping' || s.ptype === '購物') return true;
    return /伴手禮|紀念品/.test(String(s.name || '') + String(s.note || ''));
  }
  function isNature(s) {
    return !!(s && s.kind !== 'flight' && s.kind !== 'hotel' && !isHop(s) && (s.icon === 'nature' || s.icon === 'museum'));
  }
  function isSight(s) {
    if (!s || s.kind === 'flight' || s.kind === 'hotel' || isHop(s) || isEat(s) || isShop(s)) return false;
    return !!String(s.name || '').trim();
  }
  const HOME_CITY = {
    TPE: '台北', TSA: '松山', KHH: '高雄', RMQ: '台中', TNN: '台南', HUN: '花蓮', TTT: '台東', CYI: '嘉義', PIF: '屏東',
    KNH: '金門', LZN: '南竿', MFK: '北竿', KYD: '蘭嶼', GNI: '綠島'
  };
  function taiwanPlace(text) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    const code = raw.toUpperCase();
    if (HOME_CITY[code]) return HOME_CITY[code];
    if (raw === '台灣' || raw === '臺灣') return '台北';
    const id = cityFromText(raw);
    const city = id && CITIES.find(function (c) { return c.id === id; });
    return city && city.country === 'tw' ? city.name : '';
  }
  function impliedHop(trip) {
    const orig = String(trip && trip.orig || '').toUpperCase();
    const destAir = DEST_AIR[String(trip && trip.dest || '').trim()] || '';
    return !!(destAir && orig && destAir !== orig);
  }
  function abroadLeg(leg) {
    return !!((leg && leg.from && !HOME[leg.from]) || (leg && leg.to && !HOME[leg.to]));
  }
  function suggestSouvenir(trip, diary) {
    if (!trip) return 'card';
    if (flightLegs(trip).length) return 'pass';
    let shop = 0, food = 0, nature = 0, sight = 0;
    (trip.days || []).forEach(d => (d || []).forEach(s => {
      if (isShop(s)) shop++;
      else if (isEat(s)) food++;
      else if (isNature(s)) nature++;
      else if (isSight(s)) sight++;
    }));
    const notes = (diary || []).filter(d => d && inRange(d.date, trip) && (d.placeName || d.dishes)).length;
    if (shop > 0 || notes >= 2) return 'badge';
    if (food >= 2 && food > sight) return 'badge';
    if (nature > 0 && nature >= sight) return 'plaque';
    if (sight > 0) return 'card';
    if (food > 0 || notes > 0) return 'badge';
    if (impliedHop(trip)) return 'pass';
    return 'card';
  }
  function souvenirOf(trip, diary) {
    if (trip && kindOk(trip.souvenir)) return trip.souvenir;
    return suggestSouvenir(trip, diary);
  }
  function pushUnique(arr, name, max) {
    const n = String(name || '').replace(/\s+/g, ' ').trim();
    if (!n || n.length > 40 || arr.indexOf(n) >= 0 || arr.length >= max) return;
    arr.push(n);
  }
  function mdSlash(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    return m ? (+m[2]) + '/' + (+m[3]) : '';
  }
  function toneOf(trip) {
    const id = detectCountry(trip);
    return id === 'jp' || id === 'kr' || id === 'tw' ? id : 'plain';
  }
  function memoryLine(mem) {
    const spot = mem.spots[0] || '';
    const eat = mem.eats[0] || '';
    const dest = mem.dest || '這趟';
    if (mem.kind === 'pass') {
      if (mem.by === 'land') {
        if (mem.route && spot) return mem.route + '。這段路程裡的' + spot + '，還想再走一次。';
        if (mem.route) return mem.route + '。這張車票還留著那幾天的光。';
        return '這張' + dest + '的路程，還留著那幾天的光。';
      }
      if (mem.route && spot && eat) return mem.route + '。下了飛機，' + spot + '和' + eat + '都還在。';
      if (mem.route && spot) return mem.route + '。下了飛機去的' + spot + '，還想再走一次。';
      if (mem.route) return mem.route + '。這張登機證還留著那幾天的光。';
      return '這張' + dest + '的登機證，還留著那幾天的光。';
    }
    const motif = mem.motif || {};
    const voice = mem.voice || VOICE.plain;
    if (mem.kind === 'stamp') {
      if (motif.known) return '這枚' + dest + '的地標印章，中間是' + motif.land + '。';
      return '這枚' + dest + '的地標印章，先把城名留在這裡。';
    }
    if (mem.kind === 'charm') {
      if (motif.known) return voice.say + dest + '的' + voice.charm + '，還繫著' + motif.land + '的方向。';
      return voice.say + dest + '的' + voice.charm + '，收著那幾天的心願。';
    }
    if (mem.kind === 'badge') {
      if (motif.known) return '徽章上是' + dest + '的' + motif.food + '。想再看一眼就打開。';
      return '這枚' + dest + '的徽章，先收著這趟。';
    }
    if (mem.kind === 'plaque') {
      if (motif.known) return '這面' + dest + '的' + voice.plaque + '，寫著地名，畫的是' + motif.land + '。';
      return '這面' + dest + '的' + voice.plaque + '，先把城名留在木牌上。';
    }
    if (mem.kind === 'pack') {
      if (motif.known) return '這包' + dest + '的卡包，封面留著' + motif.land + '和' + motif.food + '。撕開來一張一張抽。';
      if (spot) return '這包' + dest + '的卡包，第一張是' + spot + '。';
      return '這包' + dest + '的卡包，撕開來一張一張抽。';
    }
    if (spot && eat) return dest + '的' + spot + '，還有' + eat + '。翻開這張卡就回去了。';
    if (spot) return '翻開這張卡，' + dest + '的' + spot + '還在。';
    return '這張' + dest + '的紀念卡，收著那幾天。';
  }
  function memoryOf(trip, diary) {
    const t = trip || {};
    const kind = souvenirOf(t, diary);
    const flights = flightLegs(t);
    const go = flights.find(f => f.leg !== 'return' && (f.from || f.to)) || flights.find(f => f.from || f.to) || null;
    const back = go ? flights.find(f => f !== go && f.leg === 'return' && (f.from || f.to)) : null;
    const destCity = taiwanPlace(t.dest);
    const fromCity = taiwanPlace(String(t.orig || '').trim() || 'TPE');
    const domestic = !!(destCity && fromCity);
    const abroad = flights.some(abroadLeg);
    let from = '', to = '', no = '', by = 'air';
    if (domestic && !abroad) by = 'land';
    else if (go) {
      from = go.from;
      to = go.to;
      no = go.no;
    } else if (impliedHop(t)) {
      from = String(t.orig || 'TPE').toUpperCase();
      to = DEST_AIR[String(t.dest || '').trim()] || '';
    }
    const dest = String(t.dest || '這趟').trim() || '這趟';
    const route = by === 'land'
      ? (fromCity !== destCity ? fromCity + ' → ' + destCity : destCity)
      : routeText(from, to, to ? '' : dest);
    const backRoute = by === 'land'
      ? (fromCity !== destCity ? destCity + ' → ' + fromCity : '')
      : (back ? routeText(back.from, back.to, '') : '');
    const spots = [], eats = [];
    const all = [];
    (t.days || []).forEach(d => (d || []).forEach(s => { if (s) all.push(s); }));
    function take(pred, bucket, max, visitedOnly) {
      all.forEach(s => {
        if (visitedOnly && s.visited !== true) return;
        if (!pred(s)) return;
        pushUnique(bucket, s.name, max);
      });
    }
    take(s => isSight(s) || isShop(s), spots, 4, true);
    take(s => isSight(s) || isShop(s), spots, 4, false);
    take(isEat, eats, 3, true);
    take(isEat, eats, 3, false);
    (diary || []).forEach(d => {
      if (!inRange(d && d.date, t)) return;
      pushUnique(eats, d && d.placeName, 3);
    });
    (diary || []).forEach(d => {
      if (!inRange(d && d.date, t) || !d.dishes) return;
      String(d.dishes).split(/[、,，]/).forEach(bit => pushUnique(eats, bit, 3));
    });
    const days = dayCount(t);
    const dep = mdSlash(t.dep), ret = mdSlash(t.ret);
    const when = [dep && ret ? dep + '–' + ret : (dep || ret), days ? days + ' 天' : '', (+t.pax || 0) > 0 ? (+t.pax) + ' 人' : ''].filter(Boolean).join(' · ');
    const motif = motifOf(t);
    const voice = VOICE[motif.country] || VOICE.plain;
    const year = (/^(\d{4})/.exec(String(t.dep || '')) || [])[1] || '';
    const mem = {
      kind, label: (by === 'land' && kind === 'pass') ? '路程' : faceLabel(kind, voice), dest, when, days, pax: +t.pax || 1,
      from, to, fromName: from ? airName(from) : '', toName: to ? airName(to) : '',
      no, route, backRoute, by, landFrom: by === 'land' ? fromCity : '', landTo: by === 'land' ? destCity : '',
      flew: by === 'air' && flights.length > 0,
      spots, eats, inside: (eats.length ? eats : spots).slice(0, 2), tone: toneOf(t),
      year, motif, voice, look: lookIndex(t)
    };
    mem.line = memoryLine(mem);
    return mem;
  }
  function airEnd(code, name) {
    const zh = code && AIR_ZH[code] ? AIR_ZH[code] : '';
    const label = zh || name || code || '—';
    const small = zh && code ? '<small>' + esc(code) + '</small>' : '';
    return '<span class="bp-end"><b>' + esc(label) + '</b>' + small + '</span>';
  }
  function passHtml(mem) {
    const route = passRoute(mem);
    const land = mem.by === 'land';
    const head = land ? '路程' : '登機證';
    const b = motifBits(mem);
    const back = mem.backRoute ? '<span class="bp-back">回程 ' + esc(mem.backRoute) + '</span>' : '';
    const wish = land ? '一路順風，這段路程' : '安全旅行，愉快旅程';
    return '<span class="bp"><span class="bp-top"><span>旅伴</span><b>' + head + '</b></span>' + route +
      '<span class="bp-sub">' + esc(b.city) + ' · ' + esc(b.land) + '</span>' +
      '<span class="bp-flag">' + passFlag(b, land) + '</span>' +
      '<span class="bp-split"><span class="bp-facts">' + passFactHtml(mem) + '</span><span class="bp-art">' + sceneSvg(b.scene) + blossom() + '<small>' + esc(b.land) + '</small></span></span>' +
      '<span class="bp-oneway"><b>' + (land ? '去程' : 'ONE-WAY') + '</b><small>' + (land ? '沿途車票' : 'NON-ENDORSABLE') + '</small></span>' +
      '<span class="bp-wish">' + wish + '</span>' + back + '<span class="bp-bar" aria-hidden="true"></span></span>';
  }
  function cardHtml(mem) {
    const faceWhen = (mem.when || '').split(' · ')[0] || '這幾天';
    const b = motifBits(mem);
    const key = b.scene === 'bridge' ? 'nightbridge' : b.scene;
    const scene = '<span class="mcard-scene" aria-hidden="true">' + sceneSvg(key) + '</span>';
    return '<span class="mcard mcard-' + mem.tone + '">' + scene + '<span class="mcard-shine" aria-hidden="true"></span><span class="mcard-top"><span>明信片</span><span>旅伴</span></span><b class="mcard-dest">' + esc(mem.dest) + '</b><span class="mcard-foot"><span class="mcard-sub">' + esc(b.known ? b.land : faceWhen) + '</span><span class="mcard-stamp">到此<br>一遊</span></span></span>';
  }
  /* 台、韓、日城市各自的地標、名產、風景。其他國家只用城名後備，不套晴空塔。 */
  const VOICE = {
    jp: { charm: '御守', word: '御守', plaque: '繪馬', say: '這只' },
    kr: { charm: '護身符', word: '護身', plaque: '紀念牌', say: '這只' },
    tw: { charm: '平安符', word: '平安', plaque: '祈福木牌', say: '這道' },
    plain: { charm: '祈福掛飾', word: '祈福', plaque: '紀念木牌', say: '這件' }
  };
  const MOTIFS = {
    tyo: { land: '晴空塔', mark: 'skytree', food: '壽司', foodEn: 'SUSHI', dish: 'sushi', blurb: '東京・迴轉壽司與握壽司', scene: 'skyline', en: 'TOKYO' },
    osa: { land: '大阪城', mark: 'castle', food: '章魚燒', foodEn: 'TAKOYAKI', dish: 'tako', blurb: '大阪・道頓堀的招牌小吃', scene: 'castle', en: 'OSAKA' },
    kyo: { land: '清水寺', mark: 'torii', food: '八橋', foodEn: 'YATSUHASHI', dish: 'sweet', blurb: '京都・清水坡上的和菓子', scene: 'temple', en: 'KYOTO' },
    spk: { land: '札幌時計台', mark: 'clock', food: '湯咖哩', foodEn: 'SOUP CURRY', dish: 'curry', blurb: '札幌・暖熱的湯咖哩', scene: 'snow', en: 'SAPPORO' },
    oka: { land: '守禮門', mark: 'shuri', food: '紅芋塔', foodEn: 'BENIIMO', dish: 'tart', blurb: '沖繩・紅芋做的點心', scene: 'seagate', en: 'OKINAWA' },
    fuk: { land: '太宰府', mark: 'shrine', food: '明太子', foodEn: 'MENTAIKO', dish: 'roe', blurb: '福岡・博多的明太子', scene: 'plum', en: 'FUKUOKA' },
    sel: { land: '景福宮', mark: 'palace', food: '韓式炸雞', foodEn: 'FRIED CHICKEN', dish: 'chicken', blurb: '首爾・晚一點的炸雞', scene: 'palace', en: 'SEOUL' },
    pus: { land: '海雲臺', mark: 'beach', food: '豬肉湯飯', foodEn: 'PORK SOUP', dish: 'soup', blurb: '釜山・一碗豬肉湯飯', scene: 'bridge', en: 'BUSAN' },
    cju: { land: '城山日出峰', mark: 'peak', food: '柑橘', foodEn: 'TANGERINE', dish: 'citrus', blurb: '濟州・風裡的柑橘', scene: 'volcano', en: 'JEJU' },
    tpe: { land: '台北101', mark: 't101', food: '牛肉麵', foodEn: 'BEEF NOODLE', dish: 'noodle', blurb: '台北・一碗牛肉麵', scene: 'taipei', en: 'TAIPEI' },
    txg: { land: '高美濕地', mark: 'wind', food: '太陽餅', foodEn: 'SUN CAKE', dish: 'cake', blurb: '台中・酥皮的太陽餅', scene: 'wetland', en: 'TAICHUNG' },
    tnn: { land: '赤嵌樓', mark: 'fort', food: '牛肉湯', foodEn: 'BEEF SOUP', dish: 'soup2', blurb: '台南・清晨的牛肉湯', scene: 'oldtown', en: 'TAINAN' },
    khh: { land: '美麗島穹頂', mark: 'dome', food: '鹽埕豆花', foodEn: 'DOUHUA', dish: 'tofu', blurb: '高雄・鹽埕的豆花', scene: 'harbor', en: 'KAOHSIUNG' },
    hul: { land: '太魯閣', mark: 'gorge', food: '麻糬', foodEn: 'MOCHI', dish: 'mochi', blurb: '花蓮・軟軟的麻糬', scene: 'coast', en: 'HUALIEN' },
    ttt: { land: '三仙台', mark: 'arch', food: '池上米', foodEn: 'CHISHANG RICE', dish: 'rice', blurb: '台東・池上的米', scene: 'arch', en: 'TAITUNG' },
    cyi: { land: '阿里山', mark: 'rail', food: '火雞肉飯', foodEn: 'TURKEY RICE', dish: 'bowl', blurb: '嘉義・一盤火雞肉飯', scene: 'rail', en: 'CHIAYI' },
    ktn: { land: '鵝鑾鼻', mark: 'light', food: '洋蔥', foodEn: 'ONION', dish: 'onion', blurb: '墾丁・恆春的洋蔥', scene: 'cape', en: 'KENTING' },
    yil: { land: '龜山島', mark: 'isle', food: '三星蔥', foodEn: 'SCALLION', dish: 'scallion', blurb: '宜蘭・三星的蔥', scene: 'isle', en: 'YILAN' },
    nto: { land: '日月潭', mark: 'lake', food: '阿薩姆紅茶', foodEn: 'ASSAM TEA', dish: 'tea', blurb: '南投・日月潭的紅茶', scene: 'lake', en: 'NANTOU' },
    kmn: { land: '莒光樓', mark: 'pagoda', food: '貢糖', foodEn: 'PEANUT BRITTLE', dish: 'candy', blurb: '金門・酥脆的貢糖', scene: 'pagoda', en: 'KINMEN' },
    mzu: { land: '東莒燈塔', mark: 'cliff', food: '淡菜', foodEn: 'MUSSEL', dish: 'mussel', blurb: '馬祖・海裡的淡菜', scene: 'lightsea', en: 'MATSU' },
    lud: { land: '綠島燈塔', mark: 'greenlight', food: '柴魚', foodEn: 'BONITO', dish: 'flake', blurb: '綠島・曬過的柴魚', scene: 'green', en: 'GREEN ISLAND' },
    lny: { land: '拼板舟', mark: 'canoe', food: '飛魚', foodEn: 'FLYING FISH', dish: 'flyfish', blurb: '蘭嶼・海上的飛魚', scene: 'canoe', en: 'LANYU' }
  };
  const MOTIF_ALIAS = [
    { re: /九份/, base: 'tpe', land: '九份老街', mark: 'alley', food: '芋圓', foodEn: 'TARO BALL', dish: 'taro', blurb: '九份・熱熱的芋圓', scene: 'alley', en: 'JIUFEN' },
    { re: /淡水/, base: 'tpe', land: '淡水渡船', mark: 'river', food: '阿給', foodEn: 'AGEI', dish: 'agei', blurb: '淡水・油豆腐裡的阿給', scene: 'river', en: 'TAMSUI' },
    { re: /野柳/, base: 'tpe', land: '女王頭', mark: 'queen', food: '魚丸', foodEn: 'FISH BALL', dish: 'fishball', blurb: '野柳・一碗魚丸湯', scene: 'rock', en: 'YEHLIU' },
    { re: /小樽/, base: 'spk', land: '小樽運河', mark: 'canal', food: '海產丼', foodEn: 'KAISEN', dish: 'kaisen', blurb: '小樽・運河邊的海產丼', scene: 'canal', en: 'OTARU' }
  ];
  const MARK = {
    skytree: '<path d="M32 2 v16"/><path d="M20 20 h24"/><path d="M23 20 c1 7 5 9 9 9 s8-2 9-9"/><path d="M25 34 h14"/><path d="M27 34 c1 5 3 7 5 7 s4-2 5-7"/><path d="M32 41 v14"/><path d="M21 56 h22"/>',
    castle: '<path d="M18 58 V34"/><path d="M46 58 V34"/><path d="M18 34 h28"/><path d="M24 34 V22 h16 v12"/><path d="M30 22 V12 h4 v10"/><path d="M28 12 h8"/><path d="M30 42 v10 M34 42 v10"/>',
    torii: '<path d="M8 18 h48"/><path d="M12 14 h40"/><path d="M16 26 h32"/><path d="M22 26 v30"/><path d="M42 26 v30"/>',
    clock: '<path d="M14 32 L32 16 L50 32"/><path d="M18 32 v24 h28 V32"/><circle cx="32" cy="42" r="6"/><path d="M32 42 V38 M32 42 h3"/>',
    shuri: '<path d="M6 30 Q32 8 58 30"/><path d="M12 30 h40"/><path d="M18 30 v26"/><path d="M46 30 v26"/><path d="M18 56 h28"/><path d="M28 40 v16 M36 40 v16"/>',
    shrine: '<path d="M8 32 Q32 14 56 32"/><path d="M14 32 v22 h36 V32"/><path d="M28 40 v14 M36 40 v14"/><circle cx="50" cy="16" r="2.2" fill="currentColor" stroke="none"/><path d="M50 10 v3 M50 19 v3 M44 16 h3 M53 16 h3" stroke="currentColor"/>',
    palace: '<path d="M4 28 L32 12 L60 28"/><path d="M10 28 h44 v26 H10 Z"/><path d="M20 38 v16 M30 38 v16 M40 38 v16 M48 36"/>',
    beach: '<circle cx="46" cy="16" r="6"/><path d="M6 36 q12 -8 24 0 t24 0"/><path d="M6 48 q12 -8 24 0 t24 0"/>',
    peak: '<path d="M4 58 L24 18 L32 32 L42 12 L60 58"/><path d="M24 18 l8 10"/>',
    t101: '<path d="M30 4 h4 l1 8 H29 Z"/><path d="M26 12 h12 l2 10 H24 Z"/><path d="M22 22 h20 l2 12 H20 Z"/><path d="M18 34 h28 l2 14 H16 Z"/><path d="M28 48 h8 v8 h-8 Z"/>',
    wind: '<path d="M32 58 V32"/><circle cx="32" cy="28" r="2.4"/><path d="M32 28 C30 10 42 12 38 22"/><path d="M32 28 C50 24 48 38 36 34"/><path d="M32 28 C18 40 24 48 30 38"/>',
    fort: '<path d="M8 30 L32 12 L56 30"/><path d="M14 30 v26 h36 V30"/><path d="M28 40 v16 h8 V40"/><path d="M20 30 v-6 M44 30 v-6 M32 12 v-5"/>',
    dome: '<path d="M10 50 a22 22 0 0 1 44 0"/><path d="M10 50 h44"/><circle cx="32" cy="38" r="8"/><path d="M32 30 v16 M24 38 h16"/>',
    gorge: '<path d="M6 8 L28 58"/><path d="M20 8 L34 58"/><path d="M58 8 L36 58"/><path d="M44 8 L30 58"/><path d="M28 58 q4 -10 8 0"/>',
    arch: '<path d="M8 50 Q32 8 56 50"/><path d="M18 50 Q32 24 46 50"/><path d="M6 56 h52"/>',
    rail: '<path d="M2 38 L22 16 L40 32 L62 12"/><rect x="16" y="40" width="30" height="10" rx="2"/><circle cx="24" cy="52" r="2.4"/><circle cx="38" cy="52" r="2.4"/><path d="M8 56 h48"/>',
    light: '<path d="M27 16 h10 v8 H27 Z"/><path d="M32 6 v10"/><path d="M24 24 h16 l-2 8 H26 Z"/><path d="M31 32 v18"/><path d="M22 52 h20"/>',
    cliff: '<path d="M6 58 L22 30 h18 L58 58"/><path d="M28 30 V16 h8 v8"/><path d="M32 8 v8"/><path d="M26 20 h12"/>',
    greenlight: '<ellipse cx="32" cy="48" rx="20" ry="8"/><circle cx="16" cy="42" r="5"/><path d="M16 37 V30"/><path d="M29 46 V30 h7 v8"/><path d="M27 30 h11"/><path d="M32 22 v8"/>',
    isle: '<path d="M12 42 Q18 26 32 28 Q48 20 54 36 Q60 50 36 52 Q16 56 12 42"/><circle cx="52" cy="34" r="3.5"/><path d="M6 56 q26 -8 52 0"/>',
    lake: '<path d="M2 34 L18 14 L32 26 L50 10 L62 34"/><ellipse cx="32" cy="48" rx="22" ry="8"/><circle cx="52" cy="16" r="4"/>',
    pagoda: '<path d="M32 4 L44 16 H20 Z"/><path d="M16 18 h32 l6 12 H10 Z"/><path d="M8 32 h48 l6 14 H2 Z"/><path d="M30 46 v12 M34 46 v12"/>',
    canoe: '<path d="M6 42 Q32 60 58 40"/><path d="M12 42 Q32 52 52 40"/><path d="M8 42 L2 34 h12"/><path d="M26 38 L44 16"/>',
    alley: '<path d="M6 58 V22 h18 v36"/><path d="M40 58 V14 h18 v44"/><path d="M10 30 h10 M44 26 h10"/><circle cx="32" cy="30" r="4"/><path d="M32 34 v8"/>',
    river: '<path d="M6 26 h52"/><path d="M12 26 v12 h36 V26"/><path d="M20 38 v8 M40 38 v8"/><path d="M4 52 q14 -8 28 0 t28 0"/>',
    queen: '<path d="M24 54 Q16 34 28 18 Q42 8 48 24 Q56 22 50 38 Q44 54 28 54"/><path d="M14 58 h36"/>',
    canal: '<path d="M4 16 h22 v26 H4 Z"/><path d="M38 12 h22 v30 H38 Z"/><path d="M8 24 h14 M42 22 h14"/><path d="M2 50 h60"/><path d="M2 56 h60"/>',
    pin: '<path d="M32 6 C22 6 16 16 16 24 c0 14 16 30 16 30 s16-16 16-30 C48 16 42 6 32 6z"/><circle cx="32" cy="24" r="5"/>'
  };
  const DISH = {
    sushi: '<ellipse cx="32" cy="40" rx="20" ry="9" fill="#f4efe4"/><path d="M14 36 Q32 22 50 36 Q32 30 14 36" fill="#e07a5f"/><path d="M18 34 q4 2 6 0" fill="none" stroke="#fff"/>',
    tako: '<path d="M12 46 Q32 38 52 46 L48 54 Q32 48 16 54 Z" fill="#f3e6cf"/><path d="M16 54 L10 58 h44 L48 54" fill="#c4473c"/><circle cx="32" cy="32" r="13" fill="#7a4328"/><path d="M22 30 q10 -8 20 2" fill="none" stroke="#f7f1e4" stroke-width="2"/><circle cx="26" cy="28" r="1.4" fill="#6a9a45"/>',
    sweet: '<path d="M32 10 L54 32 L32 54 L10 32 Z" fill="#c4785a"/><path d="M32 18 L46 32 L32 46 L18 32 Z" fill="#f0d2b0"/>',
    curry: '<ellipse cx="32" cy="44" rx="20" ry="11" fill="#f7f3ea"/><ellipse cx="32" cy="40" rx="16" ry="9" fill="#e0a82a"/><circle cx="26" cy="38" r="3" fill="#5d8a3e"/><circle cx="36" cy="36" r="2.4" fill="#c4473c"/>',
    tart: '<ellipse cx="32" cy="42" rx="18" ry="8" fill="#e6c48a"/><ellipse cx="32" cy="36" rx="15" ry="10" fill="#b05a9a"/><ellipse cx="32" cy="34" rx="8" ry="4" fill="#f2d2ea"/>',
    roe: '<path d="M14 30 Q32 14 50 30 Q46 50 32 54 Q18 50 14 30" fill="#f0b6a6"/><circle cx="24" cy="34" r="2" fill="#e07a5f"/><circle cx="34" cy="32" r="2.2" fill="#d45a48"/><circle cx="30" cy="42" r="2" fill="#e07a5f"/><circle cx="40" cy="40" r="1.8" fill="#d45a48"/>',
    chicken: '<circle cx="28" cy="36" r="14" fill="#e6b15a"/><circle cx="42" cy="32" r="10" fill="#f0d090"/><path d="M18 40 q10 10 22 4" fill="none" stroke="#c4903a" stroke-width="2"/>',
    soup: '<ellipse cx="32" cy="44" rx="20" ry="12" fill="#f7f4ee"/><ellipse cx="32" cy="40" rx="16" ry="8" fill="#fbfaf6"/><path d="M24 34 v12 M32 32 v12 M40 36 v10" fill="none" stroke="#5d8a3e" stroke-width="2"/>',
    citrus: '<circle cx="32" cy="36" r="16" fill="#f0a020"/><path d="M32 20 v8" fill="none" stroke="#5d8a3e" stroke-width="2"/><ellipse cx="32" cy="18" rx="3" ry="5" fill="#5d8a3e"/>',
    noodle: '<ellipse cx="32" cy="42" rx="20" ry="11" fill="#c4896a"/><ellipse cx="32" cy="38" rx="15" ry="7" fill="#e6c49a"/><path d="M18 36 H46 M20 39 H44 M22 42 H42" fill="none" stroke="#f7f1e4" stroke-width="1.6" stroke-linecap="round"/><rect x="26" y="31" width="12" height="5" rx="1.5" fill="#7a4328"/>',
    cake: '<circle cx="32" cy="34" r="16" fill="#f3ddb0"/><circle cx="32" cy="34" r="6" fill="#e0b15e"/><circle cx="32" cy="34" r="16" fill="none" stroke="#e0c48a" stroke-width="2"/>',
    soup2: '<ellipse cx="32" cy="44" rx="20" ry="12" fill="#ead8c8"/><ellipse cx="32" cy="40" rx="16" ry="8" fill="#f7f1ea"/><rect x="22" y="34" width="14" height="6" rx="1" fill="#a65d4a"/>',
    tofu: '<ellipse cx="32" cy="46" rx="20" ry="10" fill="#f7f4ee"/><ellipse cx="32" cy="38" rx="16" ry="12" fill="#fbfaf6"/><path d="M18 36 Q32 48 46 36" fill="#6b3a2a"/>',
    mochi: '<circle cx="22" cy="40" r="10" fill="#f7f4ee"/><circle cx="36" cy="34" r="12" fill="#fff"/><circle cx="46" cy="44" r="8" fill="#f3d5d8"/><path d="M32 30 q4 4 0 8" fill="none" stroke="#e7b8bc"/>',
    rice: '<ellipse cx="32" cy="44" rx="20" ry="11" fill="#f4efe4"/><ellipse cx="32" cy="38" rx="16" ry="10" fill="#fbfaf6"/>',
    bowl: '<ellipse cx="32" cy="46" rx="20" ry="11" fill="#e7d3c0"/><ellipse cx="32" cy="40" rx="16" ry="9" fill="#f7f4ee"/><ellipse cx="32" cy="34" rx="8" ry="5" fill="#f0d060"/>',
    onion: '<circle cx="32" cy="38" r="14" fill="#f0e2c4"/><circle cx="32" cy="38" r="6" fill="#e4d0aa"/><path d="M30 24 h4 v-8 h-4 z" fill="#c4a574"/>',
    scallion: '<path d="M18 58 V30" stroke="#f4efe6" stroke-width="5" fill="none"/><path d="M18 32 V8" stroke="#5d8a3e" stroke-width="5" fill="none"/><path d="M32 58 V26" stroke="#f4efe6" stroke-width="5" fill="none"/><path d="M32 28 V6" stroke="#6a9a45" stroke-width="5" fill="none"/><path d="M46 58 V34" stroke="#f4efe6" stroke-width="5" fill="none"/><path d="M46 36 V12" stroke="#3f6e32" stroke-width="5" fill="none"/>',
    tea: '<path d="M16 28 h26 v14 a12 12 0 0 1-12 12 h-4 a12 12 0 0 1-10-12 Z" fill="#f7f4ee"/><path d="M42 32 h8 a6 6 0 0 1 0 12 h-6" fill="none" stroke="#c4785a" stroke-width="3"/><ellipse cx="29" cy="28" rx="13" ry="4" fill="#6b8f4e"/>',
    candy: '<rect x="14" y="18" width="36" height="28" rx="4" fill="#e6b15a"/><circle cx="24" cy="30" r="3" fill="#c4894a"/><circle cx="36" cy="36" r="3" fill="#a86a32"/><circle cx="34" cy="26" r="2" fill="#f2ddb0"/>',
    mussel: '<path d="M16 42 Q32 12 48 42 Q32 50 16 42" fill="#2c4a44"/><path d="M20 40 Q32 22 44 40 Q32 46 20 40" fill="#f2e2c4"/>',
    flake: '<ellipse cx="32" cy="46" rx="18" ry="8" fill="#e6c49a"/><path d="M24 42 L18 22 M32 40 L34 18 M40 42 L48 24" fill="none" stroke="#c4785a" stroke-width="2"/>',
    flyfish: '<path d="M8 36 Q32 24 56 34 Q40 40 56 48 Q32 44 10 48 Q18 40 8 36" fill="#5c8eb5"/><path d="M20 32 L8 16 L18 34" fill="#9fc4da"/><circle cx="48" cy="36" r="1.4" fill="#1c140f"/>',
    case: '<rect x="16" y="24" width="32" height="26" rx="4" fill="#2f5d8a"/><path d="M24 24 v-6 h16 v6" fill="none" stroke="#2f5d8a" stroke-width="3"/><path d="M16 34 h32" fill="none" stroke="#d7e4f2" stroke-width="2"/>',
    taro: '<circle cx="22" cy="38" r="10" fill="#8a5a8a"/><circle cx="36" cy="34" r="11" fill="#a46ea4"/><circle cx="46" cy="44" r="8" fill="#c9a0c4"/>',
    agei: '<path d="M18 26 h28 l4 22 H14 Z" fill="#e6b15a"/><ellipse cx="32" cy="26" rx="14" ry="5" fill="#f0d090"/><path d="M24 34 h16" fill="none" stroke="#f7f1e4" stroke-width="2"/>',
    fishball: '<ellipse cx="32" cy="46" rx="20" ry="10" fill="#f7f4ee"/><circle cx="24" cy="38" r="6" fill="#fff"/><circle cx="36" cy="36" r="7" fill="#f7f4ee"/><circle cx="44" cy="42" r="5" fill="#efe8dc"/>',
    kaisen: '<ellipse cx="32" cy="46" rx="20" ry="10" fill="#f4efe4"/><ellipse cx="32" cy="40" rx="16" ry="8" fill="#fbfaf6"/><path d="M20 36 q8 -8 14 -2 q6 -8 12 0" fill="#e07a5f"/>'
  };
  const SCENE = {
    skyline: '<rect width="128" height="72" fill="#d5e6f2"/><circle cx="108" cy="16" r="7" fill="#f6e2b0"/><rect y="46" width="128" height="26" fill="#c5d4e0"/><rect x="8" y="36" width="12" height="22" fill="#8aa0b4"/><rect x="24" y="30" width="16" height="28" fill="#6e8698"/><path fill="#4e6578" d="M78 50 L82.5 6 H85.5 L90 50 Z"/><ellipse cx="84" cy="20" rx="7" ry="2.2" fill="#4e6578"/><rect x="100" y="34" width="16" height="24" fill="#7f96a8"/>',
    castle: '<rect width="128" height="38" fill="#f3e6d4"/><rect y="46" width="128" height="26" fill="#7ea4b4"/><path fill="#c4785a" d="M48 48 V26 h8 V16 h10 v10 h8 v22 Z"/><path fill="#8c3a32" d="M46 28 h36 l-4 6 H50 Z"/><path fill="#f3e6d4" d="M58 34 h6 v8 h-6 Z"/>',
    temple: '<rect width="128" height="40" fill="#f6eadc"/><path fill="#8ea484" d="M0 44 24 24 46 40 78 16 104 38 128 22 v24 H0 Z"/><path fill="#c4473c" d="M18 46 h10 V28 h8 V46 h10 V24 H18 Z"/><path fill="#8c3030" d="M16 28 h42 l-4 -6 H20 Z"/><circle cx="104" cy="50" r="8" fill="#b85a48"/>',
    snow: '<rect width="128" height="72" fill="#e7eef4"/><path fill="#fff" d="M0 46 22 20 40 36 62 12 84 34 108 18 128 40 v32 H0 Z"/><path fill="#d5e0ea" d="M0 50 28 28 48 42 70 22 128 52 v20 H0 Z"/><path fill="#8aa0b4" d="M54 40 64 28 74 40 v12 H54 Z"/><circle cx="64" cy="44" r="3" fill="none" stroke="#6e8698"/>',
    seagate: '<rect width="128" height="36" fill="#d5eef2"/><rect y="36" width="128" height="36" fill="#3d9aaa"/><path fill="#c4785a" d="M36 40 Q64 18 92 40 v6 H36 Z"/><path fill="#f3e6d4" d="M46 46 h8 v16 h-8 Z M74 46 h8 v16 h-8 Z"/><path fill="#e6c48a" d="M40 46 h48"/>',
    plum: '<rect width="128" height="40" fill="#f6eadc"/><path fill="#c4785a" d="M28 44 Q64 16 100 44 v20 H28 Z"/><path fill="#f3e6d4" d="M44 48 h12 v16 H44 Z M72 48 h12 v16 H72 Z"/><circle cx="20" cy="28" r="5" fill="#e7a0b0"/><circle cx="108" cy="24" r="4" fill="#e7a0b0"/><circle cx="100" cy="36" r="3" fill="#f2c4ce"/>',
    palace: '<rect width="128" height="40" fill="#d5e6f2"/><path fill="#9aab8c" d="M0 42 22 24 44 40 74 16 108 38 128 22 v22 H0 Z"/><rect y="44" width="128" height="28" fill="#e7d7b8"/><path fill="#8e2438" d="M36 46 64 28 92 46 Z"/><rect x="44" y="46" width="40" height="16" fill="#f6f1e6"/><rect x="50" y="50" width="7" height="12" fill="#c4785a"/><rect x="62" y="50" width="7" height="12" fill="#c4785a"/><rect x="74" y="50" width="7" height="12" fill="#c4785a"/>',
    bridge: '<rect width="128" height="28" fill="#d5e6f2"/><rect y="40" width="128" height="32" fill="#3d86b0"/><path fill="#e7d7b8" d="M0 40 h128 v8 H0 Z"/><path d="M8 40 Q64 8 120 40" fill="none" stroke="#c4473c" stroke-width="3"/><path d="M40 22 v18 M88 22 v18" fill="none" stroke="#c4473c" stroke-width="2"/><circle cx="24" cy="14" r="6" fill="#f6e2b0"/>',
    nightbridge: '<rect width="128" height="72" fill="#1b2a5a"/><circle cx="28" cy="16" r="7" fill="#f6e7b0"/><circle cx="96" cy="12" r="1.1" fill="#fff"/><circle cx="110" cy="22" r="1" fill="#fff"/><circle cx="70" cy="10" r="1" fill="#fff"/><rect y="40" width="128" height="32" fill="#14284a"/><path d="M6 42 Q64 8 122 42" fill="none" stroke="#f2d48a" stroke-width="3"/><path d="M28 24 v18 M64 14 v28 M100 24 v18" fill="none" stroke="#f2d48a" stroke-width="1.6"/><path fill="#e8eef8" d="M0 40 h128 v5 H0 Z"/><path d="M0 58 q16 6 32 0 t32 0 t32 0 t32 0" fill="none" stroke="#f6e2b0" stroke-width="1.2" opacity=".7"/><rect x="18" y="28" width="8" height="14" fill="#243864"/><rect x="96" y="24" width="14" height="18" fill="#2a4068"/>',
    volcano: '<rect width="128" height="30" fill="#f6eadc"/><rect y="44" width="128" height="28" fill="#3d9aaa"/><path fill="#6e8698" d="M18 48 46 16 58 30 74 12 110 48 Z"/><path fill="#c4785a" d="M52 22 64 34 70 18 Z"/><circle cx="100" cy="16" r="6" fill="#f0a020"/>',
    taipei: '<rect width="128" height="36" fill="#d5e4f2"/><circle cx="110" cy="14" r="6" fill="#f6e2b0"/><rect y="48" width="128" height="24" fill="#b7c8b4"/><rect x="8" y="34" width="12" height="22" fill="#8aa0b4"/><rect x="24" y="28" width="16" height="28" fill="#6e8698"/><path fill="#2f5d8a" d="M70 50 74 8 h6 L84 50 Z"/><path fill="#1e3a5f" d="M66 24 h22 v3 H66 Z M64 32 h26 v3 H64 Z M62 42 h30 v3 H62 Z"/>',
    wetland: '<rect width="128" height="36" fill="#d7e8f2"/><rect y="40" width="128" height="32" fill="#d5c49a"/><path fill="#e7dcc0" d="M0 48 q20 6 40 0 t40 0 t48 2 v22 H0 Z"/><path stroke="#8aa0b4" stroke-width="2" fill="none" d="M28 40 V18 M78 42 V16"/><circle cx="28" cy="16" r="3" fill="none" stroke="#8aa0b4" stroke-width="2"/><path d="M28 16 l8 4 M28 16 l-2 8 M28 16 l-8 -2" fill="none" stroke="#8aa0b4" stroke-width="1.6"/><circle cx="100" cy="14" r="6" fill="#f6e2b0"/>',
    oldtown: '<rect width="128" height="72" fill="#f3e6d4"/><path fill="#a33b32" d="M28 28 64 12 100 28 v6 H28 Z"/><rect x="36" y="34" width="56" height="28" fill="#e7d3b8"/><path fill="#6b4630" d="M58 44 h12 v18 H58 Z"/><circle cx="18" cy="48" r="10" fill="#3e6b4a"/><rect x="16" y="48" width="4" height="18" fill="#6b4630"/>',
    harbor: '<rect width="128" height="30" fill="#d5e6f2"/><rect y="42" width="128" height="30" fill="#3d86b0"/><path fill="#f6e2b0" d="M40 44 a24 20 0 0 1 48 0 Z"/><circle cx="64" cy="36" r="8" fill="#fff6d8"/><path d="M64 28 v16 M56 36 h16" fill="none" stroke="#e0b15a" stroke-width="1.4"/><rect x="16" y="30" width="10" height="16" fill="#8aa0b4"/>',
    coast: '<rect width="128" height="72" fill="#e7f1f6"/><ellipse cx="28" cy="16" rx="16" ry="6" fill="#fff"/><ellipse cx="96" cy="18" rx="18" ry="6" fill="#fff"/><path fill="#8e9a78" d="M0 46 20 30 36 40 56 16 74 36 96 20 128 40 v10 H0 Z"/><path fill="#fff" d="M56 16 l7 9 -12 1 Z"/><path fill="#6d84a0" d="M0 48 16 34 38 46 60 22 80 44 104 30 128 46 v12 H0 Z"/><rect y="52" width="128" height="20" fill="#3c86b0"/><path fill="#2f6d90" d="M0 60 Q32 52 64 60 t64 -2 v14 H0 Z"/><path fill="#6b4630" d="M16 56 34 46 50 56 l-4 1 v8 H20 Z"/><path fill="#2f5c40" d="M76 64 82 44 88 64 Z"/><path fill="#244a34" d="M90 66 96 50 102 66 Z"/>',
    arch: '<rect width="128" height="28" fill="#d5e6f2"/><rect y="36" width="128" height="36" fill="#3d86b0"/><path fill="#cbb892" d="M18 62 Q22 20 64 24 Q106 20 110 62 H92 Q86 40 64 42 Q42 40 36 62 Z"/><circle cx="24" cy="14" r="6" fill="#f6e2b0"/>',
    rail: '<rect width="128" height="72" fill="#d5e6f2"/><path fill="#6e8a58" d="M0 40 20 16 44 32 70 10 96 28 128 14 v30 H0 Z"/><path fill="#3e6b4a" d="M0 46 28 26 52 40 80 20 128 42 v12 H0 Z"/><rect x="28" y="46" width="52" height="12" rx="2" fill="#b8453a"/><circle cx="40" cy="60" r="4" fill="#2a2118"/><circle cx="68" cy="60" r="4" fill="#2a2118"/><path d="M8 64 h112" fill="none" stroke="#cbb892" stroke-width="2"/>',
    cape: '<rect width="128" height="30" fill="#d5e6f2"/><rect y="40" width="128" height="32" fill="#3d86b0"/><path fill="#d5c49a" d="M0 48 Q40 36 80 50 L128 42 v30 H0 Z"/><rect x="70" y="18" width="8" height="28" fill="#f7f4ee"/><path fill="#2a2118" d="M68 18 h12 v6 H68 Z"/><circle cx="74" cy="14" r="3" fill="#f6e2b0"/>',
    isle: '<rect width="128" height="30" fill="#d5e6f2"/><rect y="40" width="128" height="32" fill="#3d9aaa"/><ellipse cx="70" cy="42" rx="28" ry="14" fill="#6e8a58"/><ellipse cx="92" cy="40" rx="8" ry="6" fill="#8ea484"/><circle cx="24" cy="16" r="6" fill="#f6e2b0"/>',
    lake: '<rect width="128" height="72" fill="#d5e6f2"/><path fill="#6e8698" d="M0 36 18 16 36 30 58 12 80 28 104 14 128 32 v14 H0 Z"/><ellipse cx="64" cy="52" rx="40" ry="14" fill="#3d86b0"/><circle cx="104" cy="16" r="6" fill="#f6e2b0"/><path fill="#fff" d="M58 12 l6 8 -8 1 Z"/>',
    pagoda: '<rect width="128" height="72" fill="#f6eadc"/><path fill="#a33b32" d="M64 8 84 24 H44 Z"/><path fill="#8c3030" d="M40 26 h48 l8 14 H32 Z"/><path fill="#a33b32" d="M28 42 h72 l8 16 H20 Z"/><rect x="58" y="58" width="12" height="12" fill="#6b4630"/><circle cx="24" cy="20" r="6" fill="#f6e2b0"/>',
    lightsea: '<rect width="128" height="26" fill="#d5e6f2"/><rect y="36" width="128" height="36" fill="#3d86b0"/><path fill="#8a7564" d="M18 64 36 30 h24 L92 64 Z"/><rect x="52" y="16" width="8" height="16" fill="#f7f4ee"/><path fill="#2a2118" d="M50 16 h12 v5 H50 Z"/><path d="M56 8 v8" fill="none" stroke="#f6e2b0" stroke-width="2"/>',
    green: '<rect width="128" height="28" fill="#d5e6f2"/><rect y="40" width="128" height="32" fill="#3d9aaa"/><ellipse cx="64" cy="46" rx="36" ry="16" fill="#3e6b4a"/><circle cx="40" cy="40" r="8" fill="#2f5c40"/><rect x="78" y="22" width="7" height="20" fill="#f7f4ee"/><path fill="#2a2118" d="M76 22 h11 v5 H76 Z"/>',
    canoe: '<rect width="128" height="30" fill="#f6eadc"/><rect y="40" width="128" height="32" fill="#3d9aaa"/><path fill="#6b4630" d="M18 46 Q64 62 112 44 L104 50 Q64 60 28 50 Z"/><path d="M24 48 L16 36 h14" fill="none" stroke="#c4785a" stroke-width="2"/><circle cx="100" cy="16" r="6" fill="#f6e2b0"/>',
    alley: '<rect width="128" height="72" fill="#2a241c"/><rect x="8" y="16" width="28" height="56" fill="#6b4630"/><rect x="44" y="8" width="30" height="64" fill="#8c5a3c"/><rect x="86" y="20" width="32" height="52" fill="#5c4030"/><circle cx="58" cy="28" r="6" fill="#e6b15a"/><path d="M58 34 v10" fill="none" stroke="#e6b15a" stroke-width="2"/><rect x="16" y="28" width="8" height="6" fill="#f6e2b0"/><rect x="96" y="32" width="8" height="6" fill="#f6e2b0"/>',
    river: '<rect width="128" height="30" fill="#f6eadc"/><rect y="36" width="128" height="36" fill="#3d86b0"/><path fill="#cbb892" d="M8 36 h70 v14 H8 Z"/><path d="M20 50 v12 M40 50 v12 M60 50 v12" fill="none" stroke="#6b4630" stroke-width="2"/><path fill="#f3e6d4" d="M78 20 h28 v16 H78 Z"/>',
    rock: '<rect width="128" height="28" fill="#d5e6f2"/><rect y="40" width="128" height="32" fill="#3d86b0"/><path fill="#8a7564" d="M40 58 Q34 30 52 18 Q70 12 74 32 Q82 28 76 48 Q70 60 48 58 Z"/><path fill="#cbb892" d="M20 58 h88 v8 H20 Z"/><circle cx="24" cy="14" r="5" fill="#f6e2b0"/>',
    canal: '<rect width="128" height="72" fill="#d5e6f2"/><rect x="6" y="10" width="34" height="30" fill="#c4785a"/><rect x="88" y="8" width="34" height="34" fill="#8c5a3c"/><rect x="14" y="18" width="10" height="8" fill="#f6e2b0"/><rect x="96" y="16" width="10" height="8" fill="#f6e2b0"/><rect y="46" width="128" height="26" fill="#3d86b0"/><path d="M20 46 v-8 M108 46 v-10" fill="none" stroke="#6b4630" stroke-width="3"/>',
    hills: '<rect width="128" height="40" fill="#d5e6f2"/><circle cx="100" cy="18" r="8" fill="#f6e2b0"/><path fill="#8ea484" d="M0 48 24 28 48 44 80 22 128 46 v26 H0 Z"/><path fill="#6e8a58" d="M0 56 32 40 60 54 96 36 128 52 v20 H0 Z"/>'
  };
  let sovN = 0;
  function sovId(prefix) { sovN += 1; return prefix + sovN.toString(36); }
  function motifOf(trip) {
    const dest = String(trip && trip.dest || '').trim() || '這趟';
    const id = cityFromText(dest);
    const city = id ? CITIES.find(c => c.id === id) : null;
    const base = city && MOTIFS[id];
    if (base && city) {
      const over = MOTIF_ALIAS.find(a => a.base === id && a.re.test(dest));
      const row = over ? Object.assign({}, base, over) : base;
      return {
        id: city.id, name: city.name, country: city.country, known: true,
        land: row.land, mark: row.mark, food: row.food, foodEn: row.foodEn,
        dish: row.dish, blurb: row.blurb, scene: row.scene, en: row.en
      };
    }
    const country = toneOf(trip || { dest: dest });
    return {
      id: '', name: dest, country: country === 'jp' || country === 'kr' || country === 'tw' ? country : '',
      known: false, land: dest, mark: 'pin', food: '旅途紀念', foodEn: 'KEEPSAKE',
      dish: 'case', blurb: dest + '・這趟先收在這裡', scene: 'hills', en: ''
    };
  }
  function faceLabel(kind, voice) {
    const v = voice || VOICE.plain;
    if (kind === 'stamp') return '地標印章';
    if (kind === 'charm') return v.charm;
    if (kind === 'badge') return '特色徽章';
    if (kind === 'plaque') return v.plaque;
    if (kind === 'pack') return '卡包';
    return kindLabel(kind);
  }
  function markIcon(name) {
    return '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (MARK[name] || MARK.pin) + '</g>';
  }
  function sealFlower(country) {
    const ink = '#c17a6e';
    const gold = '#e0b15a';
    if (country === 'kr') {
      return '<g fill="' + ink + '"><circle cx="0" cy="-5.2" r="2.5"/><circle cx="4.9" cy="-1.5" r="2.5"/><circle cx="3" cy="4.3" r="2.5"/><circle cx="-3" cy="4.3" r="2.5"/><circle cx="-4.9" cy="-1.5" r="2.5"/><circle r="1.7" fill="' + gold + '"/></g>';
    }
    return '<g fill="' + ink + '"><circle cx="0" cy="-5.5" r="2.7"/><circle cx="5.2" cy="-1.6" r="2.7"/><circle cx="3.2" cy="4.5" r="2.7"/><circle cx="-3.2" cy="4.5" r="2.7"/><circle cx="-5.2" cy="-1.6" r="2.7"/><circle r="1.8" fill="' + gold + '"/></g>';
  }
  function nameLayout(name) {
    const n = Array.from(String(name || '')).length;
    if (n <= 2) return { size: 26, y: 124, spacing: 1 };
    if (n === 3) return { size: 18, y: 122, spacing: 2 };
    if (n === 4) return { size: 15, y: 120, spacing: 1 };
    return { size: 12, y: 118, spacing: 0.3 };
  }
  function arcText(text) {
    const chars = Array.from(String(text || '')).slice(0, 8);
    const n = chars.length || 1;
    const size = n >= 7 ? 11 : n >= 5 ? 12 : n >= 4 ? 14 : 16;
    return '<text x="100" y="42" text-anchor="middle" fill="#c17a6e" font-size="' + size + '" font-weight="700">' + esc(chars.join('')) + '</text>';
  }
  function stampHtml(mem) {
    const m = mem.motif || {};
    const lay = nameLayout(mem.dest);
    const arc = m.known ? m.land : '到此一遊';
    const flowerY = mem.year ? 148 : 158;
    const year = mem.year ? '<text x="100" y="170" text-anchor="middle" fill="#c17a6e" font-size="11" font-weight="700" letter-spacing="1">' + esc(mem.year) + '</text>' : '';
    const side = Array.from(String(mem.dest || '')).slice(0, 2).map(function (ch, i) {
      return '<text x="34" y="' + (96 + i * 18) + '" text-anchor="middle" fill="#c17a6e" font-size="14" font-weight="800">' + esc(ch) + '</text><text x="166" y="' + (96 + i * 18) + '" text-anchor="middle" fill="#c17a6e" font-size="14" font-weight="800">' + esc(ch) + '</text>';
    }).join('');
    return '<span class="sealcard papercard"><svg class="sealart" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style="color:#c17a6e"><circle cx="100" cy="100" r="92" fill="#fff8f6" stroke="#c17a6e" stroke-width="1.15"/><circle cx="100" cy="100" r="84" fill="none" stroke="#c17a6e" stroke-width="2.1" stroke-dasharray="1.15 3.3" stroke-linecap="round"/><ellipse cx="46" cy="58" rx="16" ry="6" fill="#f6d5d2"/><ellipse cx="154" cy="62" rx="14" ry="5" fill="#f6d5d2"/><circle cx="38" cy="150" r="3.2" fill="#e7a0b0"/><circle cx="46" cy="146" r="2.4" fill="#e7a0b0"/><circle cx="162" cy="148" r="3" fill="#e7a0b0"/>' + arcText(arc) + side + '<circle cx="100" cy="66" r="26" fill="#fff" stroke="#f3c4c0" stroke-width="1"/><g transform="translate(100,65.28) scale(.54) translate(-32,-32)">' + markIcon(m.mark || 'pin') + '</g><text x="100" y="' + lay.y + '" text-anchor="middle" fill="#a85a4c" font-size="' + lay.size + '" font-weight="800" letter-spacing="' + lay.spacing + '">' + esc(mem.dest || '') + '</text><g transform="translate(100 ' + flowerY + ')">' + sealFlower(m.country) + '</g>' + year + '</svg><span class="paper-foot seal-foot"><svg viewBox="0 0 12 14" width="11" height="13" aria-hidden="true"><path d="M6 1.2C3.8 1.2 2.3 3 2.3 5c0 2.6 3.7 7.2 3.7 7.2S9.7 7.6 9.7 5C9.7 3 8.2 1.2 6 1.2z" fill="none" stroke="currentColor" stroke-width="1.1"/><circle cx="6" cy="5" r="1.15" fill="currentColor"/></svg><span>地標印章</span></span></span>';
  }
  function cityPlate(city, stroke, fill) {
    const chars = Array.from(String(city || ''));
    const n = chars.length || 1;
    const fs = n <= 2 ? 12 : n <= 4 ? 10 : 8;
    const w = Math.min(96, Math.max(46, n * (fs + 1) + 16));
    const x = 70 - w / 2;
    const shown = chars.slice(0, 6).join('');
    return '<rect x="' + x + '" y="136" width="' + w + '" height="18" rx="8" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.4"/><text x="70" y="149" text-anchor="middle" fill="' + stroke + '" font-size="' + fs + '" font-weight="800">' + esc(shown) + '</text>';
  }
  function vertWord(word, x, y, fill, size) {
    return Array.from(String(word || '')).slice(0, 2).map((ch, i) => '<text x="' + x + '" y="' + (y + i * (size + 3)) + '" text-anchor="middle" fill="' + fill + '" font-size="' + size + '" font-weight="800">' + esc(ch) + '</text>').join('');
  }
  function cordLoop(color) {
    return '<path d="M70 40 C62 40 50 32 50 22 C50 12 58 6 70 6 C82 6 90 12 90 22 C90 32 78 40 70 40 Z" fill="none" stroke="' + color + '" stroke-width="3.1" stroke-linejoin="round"/>';
  }
  function tassel(color, top) {
    const strands = [-14, -7, 0, 7, 14].map(dx => '<path d="M70 ' + (top + 9) + ' L' + (70 + dx) + ' ' + (top + 40 - Math.abs(dx) * 0.25) + '" stroke="' + color + '" stroke-width="1.35" stroke-linecap="round"/>').join('');
    return '<path d="M63 ' + top + ' h14 v9 h-14 z" fill="' + color + '"/>' + strands;
  }
  function sideTassel(x, top, color) {
    const strands = [-5, 0, 5].map(dx => '<path d="M' + x + ' ' + (top + 7) + ' L' + (x + dx) + ' ' + (top + 26) + '" stroke="' + color + '" stroke-width="1.25" stroke-linecap="round"/>').join('');
    return '<path d="M' + (x - 5) + ' ' + top + ' h10 v7 h-10 z" fill="' + color + '"/>' + strands;
  }
  function charmSvg(mem) {
    const country = (mem.motif && mem.motif.country) || '';
    const voice = mem.voice || VOICE.plain;
    const city = mem.dest || '';
    const gold = '#e6c98a';
    let body = '';
    const motifMark = '<g transform="translate(48,86) scale(.5)" style="color:' + gold + '">' + markIcon((mem.motif && mem.motif.mark) || 'pin') + '</g>';
    const sideBloom = '<g fill="#f6c1cc"><circle cx="40" cy="78" r="2.2"/><circle cx="44" cy="81" r="2.2"/><circle cx="37" cy="82" r="2"/><circle cx="100" cy="76" r="2.2"/><circle cx="104" cy="80" r="2"/><circle cx="97" cy="81" r="2.1"/></g>';
    if (country === 'jp') {
      body = '<path d="M40 28 C28 8 18 16 22 30 C10 26 8 42 24 44" fill="none" stroke="#243e78" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M100 28 C112 8 122 16 118 30 C132 26 134 42 118 44" fill="none" stroke="#243e78" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M46 34 C58 18 82 18 94 34" fill="none" stroke="#243e78" stroke-width="3.2"/>' +
        '<circle cx="70" cy="30" r="5.5" fill="#e6c56a" stroke="#243e78" stroke-width="1.4"/>' +
        '<path d="M28 78 C34 52 52 46 70 58 C88 46 106 52 112 78 V168 H28 Z" fill="#c43737" stroke="' + gold + '" stroke-width="2.2"/>' +
        '<path d="M40 92 h60 v40 H40 Z" fill="none" stroke="' + gold + '" stroke-width="1.3"/>' +
        '<path d="M40 92 h60 M40 132 h60 M40 92 v40 M100 92 v40" fill="none" stroke="' + gold + '" stroke-width=".6" stroke-dasharray="1.2 1.6" opacity=".7"/>' +
        sideBloom +
        '<g transform="translate(46,82) scale(.72)" style="color:' + gold + '">' + markIcon((mem.motif && mem.motif.mark) || 'pin') + '</g>' +
        cityPlate(city, gold, '#a82e2e') +
        sideTassel(22, 108, '#e6c56a') + sideTassel(118, 108, '#e6c56a') +
        tassel('#e6c56a', 164);
    } else if (country === 'tw') {
      body = cordLoop('#a63b34') +
        '<path d="M34 82 h72 v80 H34 Z" fill="#a63b34" stroke="' + gold + '" stroke-width="2"/>' +
        '<path d="M34 82 L70 64 L106 82" fill="#8d312c" stroke="' + gold + '" stroke-width="2"/>' +
        '<g fill="#e7a0b0"><circle cx="96" cy="78" r="2.3"/><circle cx="100.2" cy="81.2" r="2.3"/><circle cx="98" cy="85.2" r="2.3"/><circle cx="93.8" cy="85.2" r="2.3"/><circle cx="91.6" cy="81.2" r="2.3"/><circle cx="96" cy="82" r="1.3" fill="#e6c56a"/></g>' +
        motifMark +
        vertWord(voice.word, 70, 118, '#f6e6c0', 13) +
        cityPlate(city, gold, 'none') +
        tassel('#f3ead8', 158);
    } else if (country === 'kr') {
      body = '<path d="M70 10 C62 10 54 18 56 26 C58 34 64 38 70 38 C76 38 82 34 84 26 C86 18 78 10 70 10 Z" fill="none" stroke="#8e2438" stroke-width="3.2" stroke-linecap="round"/>' +
        '<circle cx="70" cy="36" r="6" fill="none" stroke="' + gold + '" stroke-width="2"/>' +
        '<circle cx="70" cy="36" r="2.2" fill="' + gold + '"/>' +
        '<rect x="34" y="68" width="72" height="96" rx="18" fill="#8e2438" stroke="' + gold + '" stroke-width="2"/>' +
        '<circle cx="70" cy="86" r="7" fill="#f4efe6"/><path d="M70 79 a7 7 0 0 1 0 14 a3.5 3.5 0 0 1 0-7 a3.5 3.5 0 0 0 0-7" fill="#8e2438"/><circle cx="70" cy="82.5" r="1.3" fill="#8e2438"/><circle cx="70" cy="89.5" r="1.3" fill="#f4efe6"/>' +
        motifMark +
        vertWord(voice.word, 70, 116, '#f6e6c0', 12) +
        cityPlate(city, gold, 'none') +
        tassel('#f7f4ee', 160);
    } else {
      body = cordLoop('#b0893e') +
        '<rect x="38" y="72" width="64" height="90" rx="10" fill="#e4d2b4" stroke="#b0893e" stroke-width="2"/>' +
        vertWord(voice.word, 70, 108, '#6e5344', 16) +
        cityPlate(city, '#8a7564', 'none') +
        tassel('#d7c4a4', 158);
    }
    return body;
  }
  function charmHtml(mem) {
    const voice = mem.voice || VOICE.plain;
    const b = motifBits(mem);
    const land = b.known ? '<small>' + esc(b.land) + '</small>' : '';
    return '<span class="charmcard papercard"><svg class="charmart" viewBox="0 0 140 214" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + charmSvg(mem) + '</svg><span class="paper-foot charm-foot"><b>' + esc(voice.charm) + '</b>' + land + '<i></i></span></span>';
  }
  function pinSvg(dish, banner) {
    return '<svg class="pinart" viewBox="0 0 80 86" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><circle cx="40" cy="36" r="28" fill="#fffdf8" stroke="#c6a36a" stroke-width="3"/><g transform="translate(16,12) scale(.72)">' + (DISH[dish] || DISH.case) + '</g><ellipse cx="40" cy="66" rx="13" ry="8" fill="#2c241c" stroke="#c6a36a" stroke-width="1.4"/><text x="40" y="69" text-anchor="middle" fill="#f6e7c4" font-size="9" font-weight="800">' + esc(banner) + '</text></svg>';
  }
  function badgeHtml(mem) {
    const b = motifBits(mem);
    const title = b.known ? ((mem.dest || '') + '・' + b.food) : (mem.dest || '');
    const en = b.known ? (b.foodEn || '') : '';
    return '<span class="badgecard papercard"><span class="tagstring" aria-hidden="true"></span><span class="taghole" aria-hidden="true"></span><b class="badge-title">' + esc(title) + '</b><span class="badge-disc"><span class="badge-flora" aria-hidden="true">' + blossom() + blossom() + blossom() + blossom() + '</span>' + dishSvg(b.dish) + '<b>' + esc(mem.dest || '') + '</b>' + (en ? '<small>' + esc(en) + '</small>' : '') + '</span><span class="badge-note paper-extra">' + esc(b.land) + ' · ' + esc(b.blurb) + '</span></span>';
  }
  function plaqueName(name) {
    const chars = Array.from(String(name || '這趟')).slice(0, 6);
    if (chars.length <= 3) {
      const size = chars.length >= 3 ? 18 : 26;
      const gap = chars.length >= 3 ? 20 : 28;
      const y0 = chars.length >= 3 ? 76 : 84;
      return chars.map((ch, i) => '<text x="100" y="' + (y0 + i * gap) + '" text-anchor="middle" fill="#2a2118" font-size="' + size + '" font-weight="800">' + esc(ch) + '</text>').join('');
    }
    return '<text x="100" y="96" text-anchor="middle" fill="#2a2118" font-size="16" font-weight="800">' + esc(chars.slice(0, 5).join('')) + '</text>';
  }
  function plaqueHtml(mem) {
    const m = mem.motif || {};
    const voice = mem.voice || VOICE.plain;
    const b = motifBits(mem);
    const clip = sovId('wood');
    const scene = SCENE[m.scene] || SCENE.hills;
    const chars = Array.from(String(mem.dest || ''));
    const seal = chars.length > 0 && chars.length <= 3
      ? '<rect x="124" y="72" width="16" height="16" fill="#b4332a"/><text x="132" y="84" text-anchor="middle" fill="#f6e0c0" font-size="10" font-weight="800">旅</text>'
      : '';
    const land = b.known ? '<small class="ema-land">' + esc(b.land) + '</small>' : '';
    return '<span class="emacard papercard"><svg class="emaart" viewBox="0 0 200 228" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path class="ema-cord" d="M100 6 C118 16 124 32 100 42 C76 32 82 16 100 6" fill="none" stroke="#b4332a" stroke-width="3.2" stroke-linecap="round"/><circle cx="100" cy="24" r="5" fill="none" stroke="#b4332a" stroke-width="2.2"/><rect x="46" y="50" width="108" height="156" rx="8" fill="#e7c99a" stroke="#c4a36e" stroke-width="2"/><rect x="54" y="58" width="92" height="140" rx="4" fill="#f0dcb4"/><circle cx="100" cy="70" r="3.4" fill="#f6f1e7"/>' + plaqueName(mem.dest) + seal + '<clipPath id="' + clip + '"><rect x="54" y="58" width="92" height="140" rx="4"/></clipPath><g clip-path="url(#' + clip + ')"><g transform="translate(54,146) scale(.71875)">' + scene + '</g></g><g clip-path="url(#' + clip + ')"><g transform="translate(-18,58) scale(1.72)">' + scene + '</g></g><rect x="58" y="168" width="84" height="24" rx="4" fill="#f6e7c8" opacity=".94"/>' + cityLine(mem.dest, 100, 185, 14, '#2a2118') + '</svg><span class="paper-foot ema-foot"><span class="ema-pill">' + esc(voice.plaque) + '</span>' + land + '</span></span>';
  }
  function lookIndex(trip) {
    const n = trip && +trip.sovLook;
    if (trip && trip.sovLook != null && trip.sovLook !== '' && n >= 0 && n <= 4) return n | 0;
    return 0;
  }
  function lookKey(kind, i) {
    const rows = LOOKS[kind] || LOOKS.card;
    return (rows[i] || rows[0])[0];
  }
  function lookTitle(kind, i, mem) {
    const country = (mem && mem.motif && mem.motif.country) || '';
    const row = (LOOKS[kind] || LOOKS.card)[i] || ['', '呈現'];
    if (kind === 'charm' && row[0] === 'rack' && country !== 'jp') return '木架掛排';
    if (kind === 'charm' && row[0] === 'pouch' && country === 'tw') return '平安袋';
    if (kind === 'charm' && row[0] === 'pouch' && country === 'kr') return '護身袋';
    if (kind === 'charm' && row[0] === 'pouch' && country !== 'jp') return '祈福袋';
    if (kind === 'charm' && row[0] === 'local') {
      if (country === 'tw') return '平安符';
      if (country === 'kr') return '護身符牌';
      if (country === 'jp') return '金繡御守';
      return '祈福牌';
    }
    if (kind === 'plaque' && row[0] === 'wall' && country !== 'jp') return '木架掛牆';
    return row[1];
  }
  function motifBits(mem) {
    const m = mem.motif || {};
    return {
      city: mem.dest || '這趟',
      en: m.en || '',
      land: m.known ? m.land : (mem.dest || ''),
      food: m.known ? m.food : '旅途紀念',
      foodEn: m.foodEn || '',
      mark: m.mark || 'pin',
      dish: m.dish || 'case',
      scene: m.scene || 'hills',
      blurb: m.blurb || ((mem.dest || '') + '・這趟先收在這裡'),
      known: !!m.known,
      country: m.country || ''
    };
  }
  function inkOf(mem) {
    const c = mem && mem.motif && mem.motif.country;
    if (c === 'jp') return { main: '#c43737', gold: '#e6c98a', deep: '#8c3030', soft: '#fdeef2', line: '#c4785a' };
    if (c === 'kr') return { main: '#8e2438', gold: '#d4b483', deep: '#6b1d32', soft: '#e7f0ea', line: '#3d6b56' };
    if (c === 'tw') return { main: '#b4332a', gold: '#e0b15e', deep: '#8d312c', soft: '#f8efe6', line: '#c4785a' };
    return { main: '#8a7564', gold: '#c6a36a', deep: '#6e5344', soft: '#f6f1e7', line: '#8a7564' };
  }
  function hashStr(s) {
    let h = 2166136261;
    const str = String(s || '');
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function sceneSvg(scene) {
    return '<svg class="sceneart" viewBox="0 0 128 72" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + (SCENE[scene] || SCENE.hills) + '</svg>';
  }
  function markSvg(name, color) {
    return '<svg class="markart" viewBox="0 0 64 64" aria-hidden="true" style="color:' + (color || 'currentColor') + '">' + markIcon(name) + '</svg>';
  }
  function dishSvg(name) {
    return '<svg class="dishart" viewBox="0 0 64 64" aria-hidden="true">' + (DISH[name] || DISH.case) + '</svg>';
  }
  function cityLine(name, x, y, size, fill) {
    const chars = Array.from(String(name || ''));
    const fs = chars.length > 4 ? Math.max(13, size - 10) : chars.length > 2 ? size - 6 : size;
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" fill="' + fill + '" font-size="' + fs + '" font-weight="800">' + esc(chars.slice(0, 6).join('')) + '</text>';
  }
  function barcodeSvg(seed) {
    let h = hashStr(seed);
    let x = 0;
    let bars = '';
    for (let i = 0; i < 34; i++) {
      const w = (h & 3) === 0 ? 3 : ((h & 1) ? 2 : 1);
      bars += '<rect x="' + x + '" y="0" width="' + w + '" height="26"/>';
      x += w + 1;
      h = (h >>> 1) | ((h & 1) << 31);
    }
    return '<svg class="barcode" viewBox="0 0 ' + x + ' 26" preserveAspectRatio="none" aria-hidden="true">' + bars + '</svg>';
  }
  function qrSvg(seed) {
    let h = hashStr(seed || 'trip');
    let rects = '';
    for (let y = 0; y < 11; y++) {
      for (let x = 0; x < 11; x++) {
        const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
        if (finder || ((h >>> ((x + y * 3) % 24)) & 1)) rects += '<rect x="' + (x * 5) + '" y="' + (y * 5) + '" width="4" height="4"/>';
        if ((x + y) % 4 === 0) h = Math.imul(h ^ (x * 13 + y * 7), 16777619) >>> 0;
      }
    }
    return '<svg class="qrart" viewBox="0 0 55 55" aria-hidden="true">' + rects + '</svg>';
  }
  function landEnd(name) {
    return '<span class="bp-end bp-city"><b>' + esc(name) + '</b><small>車站</small></span>';
  }
  function passRoute(mem) {
    if (mem.by === 'land' && mem.landFrom && mem.landTo && mem.landFrom !== mem.landTo) {
      return '<span class="bp-route bp-landroute">' + landEnd(mem.landFrom) + '<span class="bp-go" aria-hidden="true">→</span>' + landEnd(mem.landTo) + '</span>';
    }
    if (mem.by === 'land') {
      return '<span class="bp-route"><span class="bp-end bp-city"><b>' + esc(mem.landTo || mem.dest) + '</b><small>這趟</small></span></span>';
    }
    if (mem.from || mem.to) {
      return '<span class="bp-route">' + airEnd(mem.from, mem.fromName) + '<span class="bp-go" aria-hidden="true">→</span>' + airEnd(mem.to, mem.toName) + '</span>';
    }
    return '<span class="bp-route"><span class="bp-end"><b>' + esc(mem.dest) + '</b></span></span>';
  }
  function passMetaLine(mem) {
    return [mem.when.split(' · ')[0] || '', mem.no || '', mem.pax ? mem.pax + ' 人' : ''].filter(Boolean);
  }
  function passFlag(b, land) {
    if (land) return '車站';
    if (b.country === 'jp') return '日本';
    if (b.country === 'kr') return '韓國';
    if (b.country === 'tw') return '台灣';
    return '旅途';
  }
  function seatOf(mem) {
    const n = (hashStr((mem.no || '') + 's') % 32) + 1;
    return n + 'ABCDEF'[hashStr(mem.dest || '') % 6];
  }
  function gateOf(mem) {
    const n = (hashStr((mem.dest || '') + 'g') % 28) + 1;
    return String.fromCharCode(65 + (hashStr(mem.no || 'g') % 6)) + String(n).padStart(2, '0');
  }
  function clockOf(mem) {
    const h = hashStr((mem.no || '') + (mem.dest || ''));
    const hh = 6 + (h % 14);
    const mm = (h >>> 4) % 60;
    return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }
  function passFactHtml(mem) {
    const land = mem.by === 'land';
    const date = (mem.when || '').split(' · ')[0] || '—';
    const rows = land
      ? [['日期', date], ['人數', (mem.pax || 1) + ' 人']]
      : [['航班', mem.no || '—'], ['日期', date], ['時間', clockOf(mem)], ['座位', seatOf(mem)], ['登機門', gateOf(mem)]];
    return rows.map(function (r) { return '<span><i>' + esc(r[0]) + '</i><b>' + esc(r[1]) + '</b></span>'; }).join('');
  }
  function blossom() {
    return '<svg class="bloom" viewBox="0 0 32 32" aria-hidden="true"><g fill="#f6c1cc"><circle cx="16" cy="6" r="4.2"/><circle cx="26" cy="13" r="4.2"/><circle cx="22" cy="24" r="4.2"/><circle cx="10" cy="24" r="4.2"/><circle cx="6" cy="13" r="4.2"/><circle cx="16" cy="16" r="2.3" fill="#f6e2b0"/></g></svg>';
  }
  function miniPouch(label, fill, cord) {
    const word = Array.from(String(label || '')).slice(0, 4).join('');
    const fs = Array.from(word).length > 3 ? 9 : 12;
    return '<svg class="minipouch" viewBox="0 0 86 128" aria-hidden="true"><path d="M43 6 C34 6 26 16 28 24 C30 32 36 36 43 36 C50 36 56 32 58 24 C60 16 52 6 43 6 Z" fill="none" stroke="' + cord + '" stroke-width="2.6"/><path d="M16 44 L43 32 L70 44 V100 H16 Z" fill="' + fill + '" stroke="#e6c98a" stroke-width="1.4"/><path d="M26 56 h34 v26 H26 Z" fill="none" stroke="#e6c98a" stroke-width="1.1"/><text x="43" y="74" text-anchor="middle" fill="#fff6e4" font-size="' + fs + '" font-weight="800">' + esc(word) + '</text><path d="M36 100 h14 v7 H36 Z" fill="#e6c56a"/><path d="M43 107 L37 122 M43 107 V124 M43 107 L49 122" stroke="#e6c56a" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>';
  }
  function passLook(mem, look) {
    const b = motifBits(mem);
    const route = passRoute(mem);
    const scene = sceneSvg(b.scene);
    const land = mem.by === 'land';
    const head = land ? '路程' : '登機證';
    const facts = passFactHtml(mem);
    if (look === 1) {
      const rightHead = land ? '路程單' : 'BOARDING PASS';
      return '<span class="foldpass"><span class="fold-left"><span class="fold-brand"><i aria-hidden="true"></i><b>旅伴</b><small>TripMate</small></span>' + route + '<span class="bp-sub">' + esc(b.city) + ' · ' + esc(b.land) + '</span><span class="bp-flag">' + passFlag(b, land) + '</span><span class="fold-art">' + scene + blossom() + '</span>' + barcodeSvg(mem.no || b.city) + '<span class="fold-wish">一路順風・旅途愉快</span></span><span class="fold-right"><span class="fold-en">' + rightHead + '</span><b>' + head + '</b>' + route + '<span class="bp-facts">' + facts + '</span><small>' + esc(b.land) + '</small></span></span>';
    }
    if (look === 2) {
      const title = land ? '電子車票' : '電子登機證';
      const en = land ? 'RAIL TICKET' : 'E-TICKET';
      const tip = land ? '到車站再出發就好' : '請於起飛前 40 分鐘完成登機';
      return '<span class="phone"><span class="phone-status"><b>09:41</b><i class="sig" aria-hidden="true"></i><i class="bat" aria-hidden="true"></i></span><span class="phone-screen"><span class="phone-h">' + title + ' <small>' + en + '</small></span>' + route + '<span class="bp-sub">' + esc(b.city) + ' · ' + esc(b.land) + '</span><span class="bp-flag">' + passFlag(b, land) + '</span><span class="bp-facts">' + facts + '</span><span class="phone-qr">' + qrSvg(b.city + (mem.no || '')) + '</span><span class="phone-no">' + (land ? '車票' : '電子票證') + ' ' + esc(mem.no || b.en || b.city) + '</span><span class="phone-tip">' + tip + '</span></span></span>';
    }
    if (look === 3) {
      return '<span class="booklet"><span class="book-cover"><span class="book-plane" aria-hidden="true"></span><b>旅伴</b><small>TripMate</small><span>我的旅行日記</span><em>收集每一段旅程</em><span class="book-leaf" aria-hidden="true"></span><i></i></span><span class="book-pocket"><span class="book-card"><b>' + esc(b.city) + '旅程貼紙</b>' + route + scene + '<small>' + esc(b.land) + '</small></span><span class="book-dots" aria-hidden="true"><i>' + blossom() + '</i><i>' + markSvg(b.mark, '#8d312c') + '</i><i class="dot-bag"></i></span></span></span>';
    }
    return '<span class="sleeve"><span class="sleeve-hole" aria-hidden="true"></span><span class="sleeve-card"><span class="sleeve-route">' + route + '</span><span class="sleeve-place"><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small><i>' + passFlag(b, land) + '</i></span>' + scene + '<span class="sleeve-meta"><b>紀念票卡</b><small>' + esc(b.en || b.city) + '</small></span><span class="sleeve-foot">TRIPMATE | MEMORY OF JOURNEY</span></span></span>';
  }
  function stampLook(mem, look) {
    const b = motifBits(mem);
    const ink = '#c4473c';
    const mark = markIcon(b.mark);
    if (look === 1) {
      const chars = Array.from(b.city).slice(0, 4);
      const fs = chars.length > 2 ? 16 : 22;
      const side = chars.map(function (ch, i) {
        return '<text x="176" y="' + (70 + i * (fs + 6)) + '" text-anchor="middle" fill="' + ink + '" font-size="' + fs + '" font-weight="800">' + esc(ch) + '</text>';
      }).join('');
      return '<span class="sqseal"><svg viewBox="0 0 220 220" aria-hidden="true"><rect width="220" height="220" fill="#fff6f3"/><rect x="10" y="10" width="200" height="200" fill="none" stroke="' + ink + '" stroke-width="10"/><rect x="24" y="24" width="172" height="172" fill="none" stroke="' + ink + '" stroke-width="2"/><g transform="translate(28,36) scale(1.7)" style="color:' + ink + '">' + mark + '</g>' + side + '<g fill="' + ink + '"><circle cx="36" cy="176" r="4.2"/><circle cx="46" cy="170" r="3.2"/><circle cx="30" cy="168" r="2.4"/></g><text x="110" y="206" text-anchor="middle" fill="' + ink + '" font-size="11" font-weight="700">' + esc(b.city) + ' · ' + esc(b.land) + '</text></svg></span>';
    }
    if (look === 2) {
      return '<span class="passpage"><span class="passpage-stitch" aria-hidden="true"></span><span class="passpage-top"><i aria-hidden="true"></i><b>旅伴 TripMate</b></span><span class="pass-seals"><span class="mini-seal" style="color:' + ink + '">' + markSvg(b.mark, ink) + '<b>' + esc(b.city) + '</b></span><span class="mini-seal seal-b" style="color:#2a6f9a">' + markSvg(b.mark, '#2a6f9a') + '<small>' + esc(b.land) + '</small></span><span class="mini-seal seal-c" style="color:#3e6b4a">' + dishSvg(b.dish) + '<small>' + esc(b.food) + '</small></span></span><span class="passpage-note">收集多國地標印記 · ' + esc(b.land) + '</span></span>';
    }
    if (look === 3) {
      return '<span class="inkset"><span class="ink-wood"><span class="ink-grain" aria-hidden="true"></span><span class="ink-latch" aria-hidden="true"></span><span class="ink-pad" aria-hidden="true"></span><span class="ink-tool"><i></i><span>' + markSvg(b.mark, '#6b4630') + '</span></span></span><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small></span>';
    }
    const foil = sovId('foil');
    return '<span class="foilseal"><svg viewBox="0 0 220 250" aria-hidden="true"><defs><linearGradient id="' + foil + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8e7b0"/><stop offset=".45" stop-color="#e6c56a"/><stop offset=".55" stop-color="#fff6d0"/><stop offset="1" stop-color="#c6a15a"/></linearGradient></defs><rect width="220" height="250" rx="18" fill="url(#' + foil + ')"/><rect x="12" y="12" width="196" height="226" rx="12" fill="none" stroke="#a8843c" stroke-width="1.2"/><path d="M26 42 V22 H46 M174 22 H194 V42 M26 208 V228 H46 M174 228 H194 V208" fill="none" stroke="#8a6a32" stroke-width="2.2"/><ellipse cx="46" cy="52" rx="18" ry="7" fill="#fff" opacity=".85"/><ellipse cx="168" cy="46" rx="16" ry="6" fill="#fff" opacity=".8"/><g transform="translate(62,48) scale(1.45)" style="color:#8a6a32">' + mark + '</g>' + cityLine(b.city, 110, 168, 32, '#6e5324') + '<text x="110" y="192" text-anchor="middle" fill="#8a6a32" font-size="13" font-weight="700">' + esc(b.land) + '</text><g fill="#e7b7c4"><circle cx="40" cy="214" r="4"/><circle cx="48" cy="208" r="3"/><circle cx="176" cy="210" r="3.4"/></g></svg></span>';
  }
  function charmArt(mem) {
    return '<svg class="charmart" viewBox="0 0 140 214" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + charmSvg(mem) + '</svg>';
  }
  function charmLook(mem, look) {
    const b = motifBits(mem);
    const voice = mem.voice || VOICE.plain;
    const ink = inkOf(mem);
    const cap = '<span class="paper-extra charm-cap">' + esc(voice.charm) + '</span>';
    if (look === 1) {
      return '<span class="envcard"><svg viewBox="0 0 280 200" aria-hidden="true"><rect x="18" y="46" width="244" height="136" rx="10" fill="#e7f0e4" stroke="#8fa58a" stroke-width="2"/><path d="M18 58 L140 124 L262 58 V46 H18 Z" fill="#f6efe4" stroke="#8fa58a" stroke-width="2"/><path d="M30 170 L140 112 L250 170" fill="none" stroke="#c4a36e" stroke-width="1.1"/><g fill="#f6c1cc"><circle cx="46" cy="78" r="3.2"/><circle cx="54" cy="82" r="2.6"/><circle cx="230" cy="70" r="3"/><circle cx="222" cy="76" r="2.4"/><circle cx="210" cy="150" r="2.8"/></g><g transform="translate(36,78) scale(1.15)" style="color:' + ink.deep + '">' + markIcon(b.mark) + '</g><g transform="translate(168 78)"><circle r="18" fill="' + ink.gold + '" stroke="#8a6a32" stroke-width="2"/><circle cy="-6" r="3" fill="#8a6a32"/><circle cx="5.4" cy="-1.6" r="3" fill="#8a6a32"/><circle cx="3.3" cy="5" r="3" fill="#8a6a32"/><circle cx="-3.3" cy="5" r="3" fill="#8a6a32"/><circle cx="-5.4" cy="-1.6" r="3" fill="#8a6a32"/><circle r="2" fill="#fff6d8"/></g>' + cityLine(b.city, 210, 128, 22, ink.deep) + '<text x="210" y="148" text-anchor="middle" fill="#8a7564" font-size="11" font-weight="800" letter-spacing="1">' + esc(b.en) + '</text><text x="210" y="166" text-anchor="middle" fill="' + ink.line + '" font-size="12" font-weight="800">' + esc(b.land) + '</text></svg>' + cap + '</span>';
    }
    if (look === 2) {
      const rackName = b.country === 'jp' ? '神社掛排' : '木架掛排';
      const labels = [b.city, b.land, (mem.spots && mem.spots[0]) || b.food];
      const fills = ['#c43737', '#3e6b4a', '#c4894a'];
      const cords = ['#243e78', '#2f4a32', '#8a6244'];
      const hooks = labels.map(function (lab, i) {
        return '<span class="rack-hook rack-' + i + '"><i class="rack-string" aria-hidden="true"></i>' + miniPouch(lab, fills[i], cords[i]) + '</span>';
      }).join('');
      return '<span class="rackcard"><span class="rack-bar" aria-hidden="true"></span><span class="rack-row">' + hooks + '</span><span class="paper-extra">' + esc(rackName) + '・' + esc(voice.charm) + '・' + esc(b.land) + '</span></span>';
    }
    if (look === 3) {
      return '<span class="showcard"><span class="show-hole" aria-hidden="true"></span><span class="show-row"><span class="show-bubble">' + miniPouch(b.city, '#c43737', '#243e78') + '</span><span class="show-side">' + sceneSvg(b.scene) + '<b>' + esc(b.city) + '</b><small>' + esc(b.en) + '</small><em>' + esc(b.land) + '</em></span></span><span class="show-foot"><i>✿</i> 旅伴 TripMate · ' + esc(voice.charm) + '</span></span>';
    }
    if (b.country === 'tw') {
      return '<span class="fancard"><svg viewBox="0 0 240 220" aria-hidden="true"><ellipse cx="36" cy="30" rx="20" ry="8" fill="#f6e2b0"/><ellipse cx="196" cy="26" rx="18" ry="7" fill="#fff"/><path d="M24 96 Q34 28 120 16 Q206 28 216 96 Q230 140 186 162 H54 Q10 140 24 96 Z" fill="#c4473c" stroke="#e6c98a" stroke-width="3"/><path d="M44 100 Q56 48 120 38 Q184 48 196 100 Q206 132 172 148 H68 Q34 132 44 100 Z" fill="#b4332a"/><path d="M70 70 q14 10 0 18 M120 52 q16 12 0 20 M170 70 q14 10 0 18" fill="none" stroke="' + ink.gold + '" stroke-width="2.2"/><g transform="translate(88,62) scale(1)" style="color:' + ink.gold + '">' + markIcon(b.mark) + '</g>' + cityLine(b.city, 120, 46, 18, '#fff6e4') + '<text x="120" y="138" text-anchor="middle" fill="' + ink.gold + '" font-size="12" font-weight="800">' + esc(b.land) + '</text><path d="M120 162 v10" stroke="#e6c56a" stroke-width="2"/><circle cx="120" cy="176" r="5" fill="#e6c56a"/><path d="M108 184 h24 l-6 18 h-12 z" fill="#e6c56a"/><path d="M120 184 L114 202 M120 184 V206 M120 184 L126 202" stroke="#c4473c" stroke-width="1.2" fill="none"/></svg><span class="paper-extra">' + esc(voice.charm) + '・' + esc(b.land) + '</span></span>';
    }
    if (b.country === 'kr') {
      return '<span class="kcharm"><svg viewBox="0 0 160 220" aria-hidden="true"><path d="M80 6 C70 6 60 16 62 26 C64 34 72 40 80 40 C88 40 96 34 98 26 C100 16 90 6 80 6 Z" fill="none" stroke="' + ink.main + '" stroke-width="3"/><rect x="28" y="36" width="104" height="140" rx="16" fill="#fbf6ee" stroke="' + ink.main + '" stroke-width="3"/><circle cx="80" cy="70" r="16" fill="#f4efe6"/><path d="M80 54 a16 16 0 0 1 0 32 a8 8 0 0 1 0-16 a8 8 0 0 0 0-16" fill="' + ink.main + '"/><circle cx="80" cy="64" r="2.2" fill="' + ink.main + '"/><circle cx="80" cy="76" r="2.2" fill="#f4efe6"/>' + cityLine(b.city, 80, 112, 20, ink.deep) + '<text x="80" y="134" text-anchor="middle" fill="' + ink.main + '" font-size="13" font-weight="800">' + esc(voice.word) + '</text><text x="80" y="154" text-anchor="middle" fill="#8a7564" font-size="12" font-weight="700">' + esc(b.land) + '</text><path d="M72 176 h16 v8 H72 Z" fill="#3d6b8a"/><path d="M80 184 L74 204 M80 184 V208 M80 184 L86 204" stroke="#c45b73" stroke-width="1.4" fill="none"/></svg>' + cap + '</span>';
    }
    if (b.country === 'jp') {
      return '<span class="goldcharm"><svg viewBox="0 0 160 220" aria-hidden="true"><path d="M80 6 C70 6 58 16 60 26 C62 36 70 42 80 42 C90 42 98 36 100 26 C102 16 90 6 80 6 Z" fill="none" stroke="' + ink.main + '" stroke-width="3"/><circle cx="80" cy="36" r="4" fill="' + ink.gold + '"/><path d="M34 64 L80 50 L126 64 V150 H34 Z" fill="#fbf6ee" stroke="' + ink.gold + '" stroke-width="3"/><path d="M48 78 h64 v36 H48 Z" fill="none" stroke="' + ink.gold + '" stroke-width="1.2" stroke-dasharray="2 1.4"/><g transform="translate(48,72) scale(.7)" style="color:' + ink.main + '">' + markIcon(b.mark) + '</g>' + cityLine(b.city, 80, 132, 18, ink.deep) + '<text x="80" y="152" text-anchor="middle" fill="' + ink.main + '" font-size="12" font-weight="800">' + esc(b.land) + '</text>' + sideTassel(24, 96, ink.gold) + sideTassel(136, 96, ink.gold) + tassel(ink.gold, 150) + '</svg>' + cap + '</span>';
    }
    return '<span class="plaincharm"><svg viewBox="0 0 160 200" aria-hidden="true"><rect x="36" y="28" width="88" height="140" rx="12" fill="#f6f1e7" stroke="#b0893e" stroke-width="2"/><g transform="translate(48,48) scale(.55)" style="color:#8a7564">' + markIcon(b.mark) + '</g>' + cityLine(b.city, 80, 116, 18, '#3a2a22') + '<text x="80" y="140" text-anchor="middle" fill="#8a7564" font-size="13" font-weight="800">' + esc(b.land) + '</text></svg>' + cap + '</span>';
  }
  function cardLook(mem, look) {
    const b = motifBits(mem);
    const ink = inkOf(mem);
    const scene = sceneSvg(b.scene);
    if (look === 1) {
      return '<span class="foilpost"><span class="foil-sky" aria-hidden="true"></span><span class="foil-scene">' + scene + '</span><span class="foil-copy"><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small><em>' + esc(b.en) + '</em></span></span>';
    }
    if (look === 2) {
      return '<span class="scratchcard"><b>' + esc(b.city) + '</b><span class="scratch-win">' + scene + '<span class="scratch-flake" aria-hidden="true"></span><i class="scratch-coin">刮開看看</i></span><small>' + esc(b.land) + '</small></span>';
    }
    if (look === 3) {
      return '<span class="popupcard"><span class="pop-side">' + scene + blossom() + '</span><span class="pop-mid"><span class="pop-rise">' + markSvg(b.mark, ink.main) + '</span><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small></span><span class="pop-side">' + scene + blossom() + '</span></span>';
    }
    return '<span class="framecard"><span class="frame-sakura" aria-hidden="true">' + blossom() + blossom() + '</span><span class="frame-wood"><span class="frame-inner">' + scene + '</span><i aria-hidden="true"></i></span><span class="frame-stand" aria-hidden="true"><i></i><i></i></span><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small></span>';
  }
  function badgeLook(mem, look) {
    const b = motifBits(mem);
    const ink = inkOf(mem);
    if (look === 1) {
      const felt = b.country === 'kr' ? '#1f6b45' : '#2f6a4a';
      const hero = b.country === 'kr'
        ? '<g transform="translate(58,48)"><circle cx="32" cy="36" r="18" fill="#e6a04a"/><ellipse cx="16" cy="22" rx="8" ry="6" fill="#e6a04a"/><ellipse cx="48" cy="22" rx="8" ry="6" fill="#e6a04a"/><circle cx="25" cy="34" r="2.2" fill="#2a2118"/><circle cx="39" cy="34" r="2.2" fill="#2a2118"/><path d="M32 36 v5 M27 44 q5 4 10 0" fill="none" stroke="#2a2118" stroke-width="1.4"/><path d="M18 38 h-7 M46 38 h7" stroke="#2a2118" stroke-width="1.2"/></g>'
        : '<g transform="translate(58,46) scale(1.05)" style="color:' + ink.deep + '">' + markIcon(b.mark) + '</g>';
      return '<span class="shieldbadge"><svg viewBox="0 0 180 220" aria-hidden="true"><path d="M90 6 L162 34 V108 C162 158 126 186 90 208 C54 186 18 158 18 108 V34 Z" fill="' + felt + '"/><path d="M90 18 L146 40 V108 C146 148 118 170 90 188 C62 170 34 148 34 108 V40 Z" fill="#f7f1e4"/><path d="M40 64 q24 -18 48 0" fill="none" stroke="' + felt + '" stroke-width="2"/><path d="M48 78 q18 -10 36 2" fill="none" stroke="' + felt + '" stroke-width="1.4"/><path d="M28 156 q28 18 62 0" fill="none" stroke="#7eb0d4" stroke-width="4"/>' + hero + cityLine(b.city, 90, 156, 18, '#1c140f') + '<text x="90" y="176" text-anchor="middle" fill="' + ink.line + '" font-size="11" font-weight="800">' + esc(b.land) + '</text><g fill="#f3c1cb"><circle cx="52" cy="48" r="3.2"/><circle cx="60" cy="54" r="2.4"/><circle cx="128" cy="46" r="2.8"/></g><g fill="#7dae58"><ellipse cx="150" cy="70" rx="8" ry="3"/><path d="M150 70 q8 8 2 16"/></g></svg><small class="paper-extra">' + esc(b.city) + ' · ' + esc(b.land) + '</small></span>';
    }
    if (look === 2) {
      return '<span class="hexbadge"><span class="hex-hole" aria-hidden="true"></span><span class="hex-shell"><span class="hex-face">' + sceneSvg(b.scene) + '<span class="hex-dish">' + dishSvg(b.dish) + '</span><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small></span></span></span>';
    }
    if (look === 3) {
      const pins = [[b.city, '#3e6b4a', '#e7f0e4'], [b.land, '#2a6f9a', '#d5e8f4'], [b.food, '#c45b73', '#f8e0e4'], [(mem.spots && mem.spots[0]) || b.en || b.food, '#c4894a', '#f6ead0']];
      return '<span class="pinboard">' + pins.map(function (p) {
        return '<span class="pin-oval" style="color:' + p[1] + ';background:' + p[2] + '"><i class="pin-ring" aria-hidden="true"></i>' + markSvg(b.mark, p[1]) + '<b>' + esc(p[0]) + '</b></span>';
      }).join('') + '<span class="paper-extra">別針收藏・' + esc(b.food) + '・' + esc(b.land) + '</span></span>';
    }
    return '<span class="tinbadge"><span class="tin-row"><span class="tin-lid tin-open"><span class="tin-well">' + dishSvg(b.dish) + '</span></span><span class="tin-lid"><span class="tin-print">' + markSvg(b.mark, '#244a34') + '</span><b>' + esc(b.city) + '</b><small>' + esc(b.food) + '</small></span></span><span class="tin-leaf" aria-hidden="true"></span><span class="tin-side">' + esc(b.land) + ' · ' + esc(b.food) + '</span></span>';
  }
  function plaqueSmall(mem) {
    const b = motifBits(mem);
    const voice = mem.voice || VOICE.plain;
    const land = b.known ? '<text x="100" y="176" text-anchor="middle" fill="#8a5a3c" font-size="12" font-weight="700">' + esc(b.land) + '</text>' : '';
    const clip = sovId('penta');
    const scene = SCENE[b.scene] || SCENE.hills;
    const art = '<clipPath id="' + clip + '"><path d="M100 62 L160 104 L144 186 L56 186 L40 104 Z"/></clipPath><g clip-path="url(#' + clip + ')"><g transform="translate(28,78) scale(1.12)">' + scene + '</g></g>';
    return '<span class="emacard papercard"><svg class="emaart ema-pent" viewBox="0 0 200 228" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path class="ema-cord" d="M100 6 C116 16 122 30 100 38 C78 30 84 16 100 6" fill="none" stroke="#b4332a" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="20" r="4.2" fill="none" stroke="#b4332a" stroke-width="2"/><path d="M100 40 L178 96 L154 200 L46 200 L22 96 Z" fill="#e7c99a" stroke="#c4a36e" stroke-width="2"/><path d="M100 54 L164 102 L146 188 L54 188 L36 102 Z" fill="#f3e0c4"/>' + art + plaqueName(mem.dest) + land + '<circle cx="48" cy="118" r="3.2" fill="#f3c1cb"/><circle cx="156" cy="116" r="2.8" fill="#f3c1cb"/></svg><span class="paper-foot ema-foot"><span class="ema-pill">' + esc(voice.plaque) + '</span></span></span>';
  }
  function plaqueLook(mem, look) {
    const b = motifBits(mem);
    const voice = mem.voice || VOICE.plain;
    const ink = inkOf(mem);
    if (look === 2) {
      const rack = b.country === 'jp' ? '神社掛牆' : '木架掛牆';
      const labels = [b.city, (mem.spots && mem.spots[0]) || b.food, b.land];
      const pegs = labels.map(function (lab) {
        return '<span class="ema-hang"><svg viewBox="0 0 86 118" aria-hidden="true"><path d="M43 2 v12" stroke="#b4332a" stroke-width="2"/><circle cx="43" cy="6" r="3.2" fill="none" stroke="#b4332a"/><rect x="8" y="18" width="70" height="92" rx="6" fill="#f3e0c4" stroke="#c4a36e" stroke-width="2"/><rect x="14" y="26" width="58" height="40" rx="3" fill="#f7f1e6"/><g transform="translate(27,28) scale(.48)" style="color:' + ink.deep + '">' + markIcon(b.mark) + '</g>' + cityLine(lab, 43, 90, 11, '#2a2118') + '</svg></span>';
      }).join('');
      return '<span class="emawall"><span class="ema-rail" aria-hidden="true"></span><span class="ema-row">' + pegs + '</span><span class="paper-extra">' + esc(rack) + '・' + esc(voice.plaque) + '・' + esc(b.land) + '</span></span>';
    }
    if (look === 3) {
      return '<span class="wishtag"><svg viewBox="0 0 220 210" aria-hidden="true"><ellipse cx="36" cy="24" rx="16" ry="6" fill="#f6e2b0"/><path d="M18 78 Q28 28 110 18 Q192 28 202 78 L186 158 H34 Z" fill="#e7a0a8"/><path d="M40 82 Q52 46 110 38 Q168 46 180 82 L168 144 H52 Z" fill="#f6d5d8"/><g transform="translate(78,58) scale(.7)" style="color:#8d312c">' + markIcon(b.mark) + '</g>' + cityLine(b.city, 110, 128, 22, '#8d312c') + '<text x="110" y="150" text-anchor="middle" fill="#a85a4c" font-size="12" font-weight="800">心想事成</text><text x="110" y="190" text-anchor="middle" fill="#8a7564" font-size="12" font-weight="700">' + esc(b.land) + '</text></svg><span class="paper-extra">許願牌 · ' + esc(b.land) + '</span></span>';
    }
    return '<span class="praytag"><svg viewBox="0 0 180 230" aria-hidden="true"><path d="M90 8 C78 8 70 20 74 30 C78 40 90 46 90 46 C90 46 102 40 106 30 C110 20 102 8 90 8 Z" fill="none" stroke="#c4785a" stroke-width="3"/><rect x="24" y="42" width="132" height="146" rx="18" fill="#f6e4c8" stroke="#c4a36e" stroke-width="2"/><rect x="36" y="54" width="108" height="52" rx="8" fill="#fbf6ee"/><g transform="translate(58,56) scale(.7)" style="color:#8c3030">' + markIcon(b.mark) + '</g>' + cityLine(b.city, 90, 136, 20, '#3a2a22') + '<text x="90" y="160" text-anchor="middle" fill="#8c3030" font-size="14" font-weight="800">祈福</text><path d="M90 188 v16" stroke="#3d6b8a" stroke-width="2"/><path d="M74 208 h32 l-8 14 h-16 z" fill="#c45b73"/><circle cx="90" cy="204" r="3" fill="#e6c56a"/></svg><span class="paper-extra">' + esc(b.city) + ' · ' + esc(b.land) + '</span></span>';
  }
  function packFaces(mem) {
    const b = motifBits(mem);
    const third = (mem.spots && mem.spots[0]) || (mem.eats && mem.eats[0]) || b.food;
    return [b.city, b.land, third];
  }
  function packLook(mem, look) {
    const b = motifBits(mem);
    const ink = inkOf(mem);
    const scene = sceneSvg(b.scene);
    const faces = packFaces(mem);
    if (look === 1) {
      const cards = [
        '<span class="rigid-card">' + scene + '<b>' + esc(faces[0]) + '</b></span>',
        '<span class="rigid-card">' + markSvg(b.mark, ink.main) + '<b>' + esc(faces[1]) + '</b></span>',
        '<span class="rigid-card on">' + dishSvg(b.dish) + '<b>' + esc(faces[2]) + '</b></span>'
      ].join('');
      return '<span class="rigidbox"><span class="rigid-brand"><b>旅伴</b><small>TripMate</small></span><span class="rigid-win">' + cards + '</span><b class="rigid-city">' + esc(b.city) + '</b><small>' + esc(b.land) + '</small><em>收藏卡匣</em></span>';
    }
    if (look === 2) {
      const slips = faces.map(function (name, i) {
        return '<span class="drawer-card">' + (i === 2 ? dishSvg(b.dish) : (i === 1 ? markSvg(b.mark, ink.main) : scene)) + '<b>' + esc(name) + '</b></span>';
      }).join('');
      return '<span class="drawerbox"><span class="drawer-shell"><span class="drawer-tray">' + slips + '</span><span class="drawer-face">' + scene + '<b>' + esc(b.city) + '</b></span></span><small>' + esc(b.land) + '</small></span>';
    }
    if (look === 3) {
      return '<span class="clearpack"><span class="clear-tab" aria-hidden="true"></span><span class="clear-card back">' + scene + '<b>' + esc(b.land) + '</b></span><span class="clear-card on">' + markSvg(b.mark, ink.main) + '<b>' + esc(b.city) + '</b></span><small>' + esc(b.food) + ' · ' + esc(b.land) + '</small></span>';
    }
    if (look === 4) {
      return '<span class="citypack"><span class="city-hill" aria-hidden="true"></span>' + scene + '<span class="city-seal" aria-hidden="true">限定</span><b>' + esc(b.city) + '</b><small>' + esc(b.en) + '</small><em>城市限定封</em><i>' + esc(b.land) + '</i></span>';
    }
    return '<span class="softpack"><span class="soft-notch" aria-hidden="true"></span><span class="soft-crinkle" aria-hidden="true"></span><b>' + esc(b.city) + '</b><small>' + esc(b.en) + '</small><span class="soft-scene">' + scene + '</span>' + dishSvg(b.dish) + '<em>' + esc(b.food) + '</em><span>卡包</span><i>' + esc(b.land) + '｜' + esc(b.food) + '</i></span>';
  }
  function boardSrc(kind, look) {
    const name = kind === 'plaque' ? 'ema' : kind;
    const i = look >= 0 && look <= 4 ? look : 0;
    return 'assets/keepsakes/' + name + '-' + i + '.webp';
  }
  function boardFace(mem) {
    const look = mem.look || 0;
    const img = '<img class="boardimg" src="' + boardSrc(mem.kind, look) + '" alt="" draggable="false">';
    return '<span class="boardface">' + img + '</span>';
  }
  function postcardPrint(mark) {
    if (mark === 'gorge') return 'assets/keepsakes/post-gorge.jpg';
    if (mark === 'skytree') return 'assets/keepsakes/post-skytree.jpg';
    return '';
  }
  function postcardHtml(mem) {
    const b = motifBits(mem);
    const label = (b.city || '') + (b.land ? ' ' + b.land : '');
    const src = postcardPrint(b.mark);
    if (src) {
      return '<span class="post post-print post-live" data-mark="' + esc(b.mark) + '"><img class="postimg" src="' + src + '" alt="' + esc(label) + '" draggable="false"></span>';
    }
    const id = sovId('post');
    return '<span class="post"><svg class="postart" viewBox="0 0 360 220" role="img" aria-label="' + esc(label) + '" data-mark="' + esc(b.mark) + '"><rect width="360" height="220" rx="18" fill="#f7f2e8"/><clipPath id="' + id + '"><rect x="14" y="14" width="332" height="168" rx="12"/></clipPath><g clip-path="url(#' + id + ')">' + postcardScene(b, id) + '</g>' + postcardStamp(b) + '</svg></span>';
  }
  function postcardScene(b, id) {
    const mark = b.mark || 'pin';
    if (mark === 'gorge') return postcardGorge(id);
    if (mark === 'skytree') return postcardSkytree(id);
    if (mark === 't101') return postcard101();
    if (mark === 'castle') return postcardCastle();
    if (mark === 'torii' || mark === 'shrine') return postcardTorii();
    if (mark === 'palace') return postcardPalace();
    if (mark === 'beach') return postcardBeach();
    if (mark === 'lake') return postcardLake();
    if (mark === 'peak' || mark === 'arch') return postcardPeak();
    return postcardMarkCard(b);
  }
  function postcardGorge(id) {
    const sky = id + 'sky';
    const water = id + 'water';
    return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec4e6"/><stop offset=".55" stop-color="#d7ecf6"/><stop offset="1" stop-color="#f6e7cf"/></linearGradient><linearGradient id="' + water + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c7c86"/><stop offset="1" stop-color="#b7ebe4"/></linearGradient></defs>' +
      '<rect x="14" y="14" width="332" height="168" fill="url(#' + sky + ')"/>' +
      '<circle cx="78" cy="52" r="16" fill="#f8e7b4"/><circle cx="78" cy="52" r="26" fill="#f8e7b4" opacity=".28"/>' +
      '<path fill="#b7c4be" d="M14 182 C48 150 36 108 78 86 C112 68 104 40 62 22 L14 14 Z"/>' +
      '<path fill="#8ea09a" d="M14 182 C40 156 28 120 62 102 C88 88 84 64 58 48 L14 70 Z"/>' +
      '<path fill="#d5ddd6" d="M52 78 C78 62 96 74 92 96 C78 90 64 98 58 112 Z" opacity=".85"/>' +
      '<path fill="#aebbb6" d="M346 182 C312 146 324 100 286 78 C250 58 258 32 304 16 L346 14 Z"/>' +
      '<path fill="#7e928c" d="M346 182 C318 150 330 112 300 96 C276 84 280 60 308 46 L346 64 Z"/>' +
      '<path fill="#e4ebe6" d="M286 70 C310 56 330 68 328 90 C312 82 296 90 292 106 Z" opacity=".8"/>' +
      '<path fill="#6e8f62" d="M46 96 c12 -18 28 -10 22 8 c10 -6 18 6 6 14 c-14 4 -24 -4 -28 -22 z"/>' +
      '<path fill="#4f734c" d="M292 84 c10 -16 24 -8 18 8 c10 -4 16 6 4 12 c-12 2 -20 -4 -22 -20 z"/>' +
      '<path fill="url(#' + water + ')" d="M118 182 C132 150 150 128 168 108 C176 98 184 98 192 108 C210 128 228 150 242 182 Z"/>' +
      '<path fill="#e9fbf8" opacity=".55" d="M146 182 C156 158 166 140 176 124 C180 132 184 140 188 124 C198 142 208 160 216 182 Z"/>' +
      '<path fill="none" stroke="#f4fffd" stroke-width="1.4" opacity=".65" d="M156 168 q12 -6 24 2 M150 176 q16 -5 30 1"/>';
  }
  function postcardSkytree(id) {
    const sky = id + 'sky';
    return '<defs><linearGradient id="' + sky + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2758"/><stop offset=".7" stop-color="#3a3f86"/><stop offset="1" stop-color="#6a4a6e"/></linearGradient></defs>' +
      '<rect x="14" y="14" width="332" height="168" fill="url(#' + sky + ')"/>' +
      '<path d="M64 58 a14 14 0 1 0 22 -8 a11 11 0 1 1 -22 8 z" fill="#f6e7b0"/>' +
      '<g fill="#fff"><circle cx="150" cy="40" r="1.1"/><circle cx="210" cy="34" r="1"/><circle cx="250" cy="52" r="1.2"/><circle cx="300" cy="42" r="1"/><circle cx="120" cy="70" r="1"/></g>' +
      '<rect x="14" y="118" width="332" height="64" fill="#16284a"/>' +
      '<g fill="#2a406c"><rect x="28" y="96" width="16" height="28"/><rect x="48" y="84" width="22" height="40"/><rect x="74" y="100" width="14" height="24"/><rect x="250" y="92" width="18" height="32"/><rect x="274" y="78" width="26" height="46"/><rect x="306" y="98" width="16" height="26"/></g>' +
      '<g fill="#f3c96a" opacity=".85"><rect x="52" y="92" width="3" height="4"/><rect x="80" y="108" width="3" height="4"/><rect x="282" y="90" width="3" height="4"/><rect x="260" y="104" width="3" height="4"/></g>' +
      '<path fill="#e7eef8" d="M174 128 L181 42 h10 L198 128 Z"/>' +
      '<ellipse cx="186" cy="74" rx="22" ry="6" fill="#f7fbff"/><ellipse cx="186" cy="100" rx="15" ry="4.5" fill="#f7fbff"/>' +
      '<rect x="184" y="30" width="4" height="16" fill="#f7fbff"/>' +
      '<path fill="#c9d4e6" d="M174 128 L164 146 h44 L198 128 Z"/>' +
      '<path fill="#f6e2b0" opacity=".35" d="M164 150 h44 l-6 18 h-32 Z"/>' +
      '<path d="M30 132 h300" stroke="#f6e2b0" stroke-width="1" opacity=".45"/>';
  }
  function postcard101() {
    return '<rect x="16" y="16" width="328" height="164" fill="#d5e6f4"/>' +
      '<circle cx="292" cy="48" r="14" fill="#f6e2b0"/>' +
      '<rect x="16" y="124" width="328" height="56" fill="#c5d4c4"/>' +
      '<rect x="40" y="100" width="22" height="36" fill="#8aa0b4"/><rect x="70" y="88" width="28" height="48" fill="#6e8698"/>' +
      '<rect x="250" y="96" width="20" height="40" fill="#8aa0b4"/><rect x="278" y="108" width="26" height="28" fill="#9aafb8"/>' +
      '<path fill="#1e3a5f" d="M168 136 L174 40 h16 L196 136 Z"/>' +
      '<path fill="#2f5d8a" d="M160 62 h56 v4 h-56 z M156 78 h64 v4 h-64 z M152 96 h72 v4 h-72 z M158 114 h48 v4 h-48 z"/>' +
      '<rect x="178" y="28" width="8" height="14" fill="#1e3a5f"/>';
  }
  function postcardCastle() {
    return '<rect x="16" y="16" width="328" height="100" fill="#f3e6d4"/>' +
      '<rect x="16" y="116" width="328" height="64" fill="#7ea4b4"/>' +
      '<circle cx="78" cy="48" r="12" fill="#f6e2b0"/>' +
      '<path fill="#f7f4ee" d="M132 128 V78 h22 V58 h28 v20 h22 v50 Z"/>' +
      '<path fill="#3e6b4a" d="M128 82 h96 l-8 12 H136 Z"/>' +
      '<path fill="#2f5c40" d="M154 62 h28 l-4 8 h-20 Z"/>' +
      '<path fill="#8c3030" d="M168 46 h12 v14 h-12 Z"/>' +
      '<rect x="158" y="100" width="10" height="16" fill="#c4785a"/><rect x="178" y="100" width="10" height="16" fill="#c4785a"/>' +
      '<path fill="#e7f4f2" d="M150 140 q30 10 60 0" opacity=".8"/>';
  }
  function postcardTorii() {
    return '<rect x="16" y="16" width="328" height="164" fill="#f6eadc"/>' +
      '<path fill="#8ea484" d="M16 120 L70 70 L120 108 L190 52 L260 100 L344 64 V180 H16 Z"/>' +
      '<path fill="#6e8a58" d="M16 140 L80 96 L150 128 L230 88 L344 130 V180 H16 Z"/>' +
      '<circle cx="300" cy="46" r="12" fill="#f6e2b0"/>' +
      '<path fill="#c4473c" d="M118 150 V86 h18 V70 h36 v16 h18 v64 Z"/>' +
      '<path fill="#8c3030" d="M110 90 h88 l-6 10 H116 Z"/>' +
      '<path fill="#f3c1cb" d="M64 108 c6 -8 14 -2 10 6 c6 -2 10 4 2 8 c-6 0 -12 -4 -12 -14 z"/>' +
      '<path fill="#f3c1cb" d="M250 96 c6 -8 14 -2 10 6 c6 -2 10 4 2 8 c-6 0 -12 -4 -12 -14 z"/>';
  }
  function postcardPalace() {
    return '<rect x="16" y="16" width="328" height="90" fill="#d5e6f2"/>' +
      '<path fill="#9aab8c" d="M16 110 L60 70 L110 100 L180 58 L250 96 L344 70 V120 H16 Z"/>' +
      '<rect x="16" y="112" width="328" height="68" fill="#e7d7b8"/>' +
      '<circle cx="70" cy="46" r="12" fill="#f6e2b0"/>' +
      '<path fill="#8e2438" d="M132 124 L180 78 L228 124 Z"/>' +
      '<rect x="146" y="124" width="68" height="40" fill="#f7f1e6"/>' +
      '<rect x="158" y="132" width="12" height="32" fill="#c4785a"/><rect x="176" y="132" width="12" height="32" fill="#c4785a"/><rect x="194" y="132" width="12" height="32" fill="#c4785a"/>';
  }
  function postcardBeach() {
    return '<rect x="16" y="16" width="328" height="96" fill="#f6e2c4"/>' +
      '<rect x="16" y="112" width="328" height="68" fill="#3d86b0"/>' +
      '<circle cx="86" cy="52" r="16" fill="#f0a020"/>' +
      '<path fill="#f7f4ee" d="M16 124 q40 -16 80 0 t80 0 t80 0 t88 0 v20 H16 Z"/>' +
      '<path d="M40 150 q20 -8 40 0 t40 0 t40 0" fill="none" stroke="#e7f4f2" stroke-width="2"/>' +
      '<path fill="#f6f1e7" d="M250 128 l16 28 h-32 Z" opacity=".9"/>';
  }
  function postcardLake() {
    return '<rect x="16" y="16" width="328" height="164" fill="#d5e6f2"/>' +
      '<circle cx="292" cy="48" r="14" fill="#f6e2b0"/>' +
      '<path fill="#6e8698" d="M16 100 L48 58 L90 86 L140 48 L190 90 L250 56 L344 96 V120 H16 Z"/>' +
      '<ellipse cx="180" cy="138" rx="120" ry="28" fill="#3d86b0"/>' +
      '<ellipse cx="168" cy="134" rx="70" ry="10" fill="#e7f4f2" opacity=".45"/>' +
      '<path fill="#fff" d="M140 48 l8 12 -12 2 Z"/>';
  }
  function postcardPeak() {
    return '<rect x="16" y="16" width="328" height="100" fill="#d5e6f2"/>' +
      '<rect x="16" y="116" width="328" height="64" fill="#3d86b0"/>' +
      '<circle cx="78" cy="48" r="12" fill="#f6e2b0"/>' +
      '<path fill="#8aa0b4" d="M40 130 L110 48 L150 90 L200 40 L300 130 Z"/>' +
      '<path fill="#f7f4ee" d="M188 52 L200 40 L214 58 L198 56 Z"/>' +
      '<path fill="#6e8a58" d="M16 130 L70 100 L130 124 L200 96 L344 128 V150 H16 Z"/>';
  }
  function postcardMarkCard(b) {
    const ink = b.country === 'kr' ? '#8e2438' : b.country === 'tw' ? '#8d312c' : b.country === 'jp' ? '#8c3030' : '#6e5344';
    return '<rect x="16" y="16" width="328" height="164" fill="#f3e6d4"/>' +
      '<path fill="#8ea484" d="M16 120 L70 78 L130 108 L200 64 L270 104 L344 76 V180 H16 Z"/>' +
      '<path fill="#d5e6f2" d="M16 16 h328 v70 H16 Z"/>' +
      '<circle cx="292" cy="46" r="12" fill="#f6e2b0"/>' +
      '<g transform="translate(148,58) scale(1.15)" style="color:' + ink + '">' + markIcon(b.mark) + '</g>';
  }
  function postcardStamp(b) {
    const art = b.mark === 'skytree'
      ? '<path fill="#8a7564" d="M22 40 L24 16 h4 L30 40 Z"/><ellipse cx="26" cy="24" rx="7" ry="2" fill="none" stroke="#8a7564" stroke-width="1"/>'
      : b.mark === 'gorge'
        ? '<path fill="#8ea09a" d="M8 40 C14 28 16 22 22 26 C18 32 16 36 14 40 Z"/><path fill="#7e928c" d="M44 40 C38 26 34 18 28 24 C32 30 36 36 38 40 Z"/><path fill="#3d9aaa" d="M18 40 C22 32 26 30 30 34 C28 36 24 38 22 40 Z"/>'
        : '<path fill="#c47a4a" d="M10 38 L26 16 L42 38 Z"/><circle cx="34" cy="16" r="4" fill="#e0b15a"/>';
    return '<path d="M338 38c8 3 12 2 18 -1M336 46c10 3 14 2 20 -1M338 54c8 3 10 2 14 0" fill="none" stroke="#c4b49a" stroke-width="1.3" stroke-linecap="round"/>' +
      '<g transform="translate(278,24)"><rect width="52" height="60" rx="3" fill="#f7f1e4" stroke="#c4b49a" stroke-width="1.2"/>' +
      '<rect x="4" y="4" width="44" height="52" rx="1" fill="none" stroke="#e4d7c4" stroke-width=".8"/>' + art + '</g>';
  }
  function boardCap(mem) {
    const b = motifBits(mem);
    const voice = mem.voice || VOICE.plain;
    if (mem.kind === 'pass') {
      return '<span class="sovcap">' + passRoute(mem) + '<small>' + esc(b.city) + ' · ' + esc(b.land) + '</small><small>' + esc(mem.label) + '</small></span>';
    }
    if (mem.kind === 'charm') {
      return '<span class="sovcap"><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small><small>' + esc(voice.charm) + '</small></span>';
    }
    if (mem.kind === 'pack') {
      const faces = packFaces(mem);
      const spot = faces[2] ? '<small>' + esc(faces[2]) + '</small>' : '';
      return '<span class="sovcap"><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small><small>卡包</small><small>' + esc(b.food) + '</small>' + spot + '</span>';
    }
    if (mem.kind === 'badge') {
      return '<span class="sovcap"><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small><small>' + esc(b.food) + '</small></span>';
    }
    if (mem.kind === 'plaque') {
      return '<span class="sovcap"><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small><small>' + esc(voice.plaque) + '</small></span>';
    }
    return '<span class="sovcap"><b>' + esc(b.city) + '</b><small>' + esc(b.land) + '</small></span>';
  }
  function objectPrint(mem) {
    const mark = (mem.motif && mem.motif.mark) || '';
    const look = mem.look || 0;
    if (look !== 0) return '';
    const city = mark === 'gorge' ? 'hul' : mark === 'skytree' ? 'tyo' : '';
    if (!city) return '';
    const file = { charm: 'charm', stamp: 'stamp', pass: 'pass', pack: 'pack', badge: 'badge', plaque: 'ema' }[mem.kind];
    if (!file) return '';
    if (city === 'tyo' && file !== 'charm' && file !== 'stamp') return '';
    if (city === 'hul' && file === 'pass' && mem.by !== 'land') return '';
    return 'assets/keepsakes/' + file + '-' + city + '.jpg';
  }
  function printFace(mem, src) {
    const b = motifBits(mem);
    const label = (b.city || '') + (b.land ? ' ' + b.land : '');
    return '<span class="post post-print" data-mark="' + esc(b.mark) + '"><img class="postimg" src="' + src + '" alt="' + esc(label) + '" draggable="false"></span>';
  }
  function souvenirBody(mem) {
    if (mem.kind === 'card' && (mem.look || 0) === 0) return postcardHtml(mem);
    const src = objectPrint(mem);
    if (src) return printFace(mem, src);
    const look = mem.look || 0;
    if (mem.kind === 'pass') return look === 0 ? passHtml(mem) : passLook(mem, look);
    if (mem.kind === 'stamp') return look === 0 ? stampHtml(mem) : stampLook(mem, look);
    if (mem.kind === 'charm') return look === 0 ? charmHtml(mem) : charmLook(mem, look);
    if (mem.kind === 'badge') return look === 0 ? badgeHtml(mem) : badgeLook(mem, look);
    if (mem.kind === 'plaque') return look === 0 ? plaqueSmall(mem) : (look === 1 ? plaqueHtml(mem) : plaqueLook(mem, look));
    if (mem.kind === 'pack') return packLook(mem, look);
    return look === 0 ? cardHtml(mem) : cardLook(mem, look);
  }
  function badgeShape(kind, dish, city) {
    const icon = '<g transform="translate(16,12) scale(.48)">' + (DISH[dish] || DISH.case) + '</g>';
    const name = '<text x="40" y="66" text-anchor="middle" fill="#3a2a22" font-size="9" font-weight="800">' + esc(Array.from(String(city || '')).slice(0, 4).join('')) + '</text>';
    if (kind === 'shield') return '<svg viewBox="0 0 80 86" aria-hidden="true"><path d="M40 4 L68 16 V40 C68 58 56 72 40 80 C24 72 12 58 12 40 V16 Z" fill="#1f6b45" stroke="#c6a36a" stroke-width="2"/><path d="M40 14 L60 22 V40 C60 54 50 64 40 70 C30 64 20 54 20 40 V22 Z" fill="#f4efe4"/>' + icon + name + '</svg>';
    if (kind === 'hex') return '<svg viewBox="0 0 80 86" aria-hidden="true"><polygon points="40,4 70,20 70,52 40,70 10,52 10,20" fill="#d5e8f4" stroke="#9bb8cc" stroke-width="2"/><polygon points="40,12 62,24 62,48 40,60 18,48 18,24" fill="#fffdf8"/>' + icon + name + '</svg>';
    return '<svg viewBox="0 0 80 86" aria-hidden="true"><circle cx="40" cy="36" r="28" fill="#fffdf8" stroke="#e7d3b4" stroke-width="6"/><circle cx="40" cy="36" r="22" fill="#fffaf3" stroke="#c6a36a" stroke-width="1.4"/>' + icon + name + '</svg>';
  }
  function badgeVariants(mem) {
    const m = mem.motif || {};
    const face = m.known ? m.food : (mem.dest || '旅途');
    const rows = [['card', 'round', '卡紙 · 圓形'], ['felt', 'shield', '毛氈 · 盾形'], ['blister', 'hex', '吸塑 · 六角']];
    return '<span class="badge-vars">' + rows.map(function (row) {
      return '<span class="bvar mount-' + row[0] + ' bface-' + row[1] + '" data-lab="' + row[2] + '">' + badgeShape(row[1], m.dish, mem.dest) + '<small>' + esc(row[2]) + '</small><b>' + esc(face) + '</b></span>';
    }).join('') + '</span>';
  }
  function emaPenSvg(mem) {
    const b = motifBits(mem);
    const chars = Array.from(String(b.land || mem.dest || '')).slice(0, 4).join('');
    const size = Array.from(chars).length > 3 ? 10 : 12;
    const clip = sovId('pen');
    const scene = SCENE[b.scene] || SCENE.hills;
    return '<svg class="emapen" viewBox="0 0 120 168" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M60 4 C74 14 78 26 60 34 C42 26 46 14 60 4" fill="none" stroke="#b4332a" stroke-width="2.6" stroke-linecap="round"/><circle cx="60" cy="18" r="3.4" fill="none" stroke="#b4332a" stroke-width="1.6"/><path d="M60 36 L112 78 L98 158 H22 L8 78 Z" fill="#e7c99a" stroke="#c4a36e" stroke-width="2"/><path d="M60 50 L100 84 L90 148 H30 L20 84 Z" fill="#f6e7c8"/><clipPath id="' + clip + '"><path d="M36 96 L84 108 L78 146 H42 Z"/></clipPath><g clip-path="url(#' + clip + ')"><g transform="translate(24,88) scale(.58)">' + scene + '</g></g><text x="60" y="78" text-anchor="middle" fill="#2a2118" font-size="' + size + '" font-weight="800">' + esc(chars) + '</text></svg>';
  }
  function emaBoardSvg(mem) {
    const b = motifBits(mem);
    const clip = sovId('board');
    const scene = SCENE[b.scene] || SCENE.hills;
    const city = Array.from(String(b.city || '')).slice(0, 6).join('');
    return '<svg class="emaboard" viewBox="0 0 220 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M110 2 C122 10 126 18 110 24 C94 18 98 10 110 2" fill="none" stroke="#b4332a" stroke-width="2.4"/><circle cx="110" cy="12" r="3" fill="none" stroke="#b4332a"/><rect x="8" y="28" width="204" height="104" rx="12" fill="#e7c99a" stroke="#c4a36e" stroke-width="2"/><clipPath id="' + clip + '"><rect x="16" y="36" width="188" height="68" rx="8"/></clipPath><g clip-path="url(#' + clip + ')"><g transform="translate(16,36) scale(1.47)">' + scene + '</g></g><rect x="16" y="104" width="188" height="20" rx="4" fill="#f6e7c8"/><text x="110" y="118" text-anchor="middle" fill="#2a2118" font-size="15" font-weight="800">' + esc(city) + '</text></svg>';
  }
  function emaRackSvg(mem) {
    const land = (mem.motif && mem.motif.known && mem.motif.land) || mem.dest || '';
    const names = [mem.dest || '', land, (mem.spots && mem.spots[0]) || land].map(function (s) { return Array.from(String(s || '')).slice(0, 4).join(''); });
    const pegs = [28, 92, 156].map(function (x, i) {
      const cx = x + 22;
      return '<g class="rackpeg" data-lab="掛牆第' + (i + 1) + '面"><circle cx="' + cx + '" cy="16" r="3" fill="#6e5344"/><path d="M' + cx + ' 16 V30" stroke="#b4332a" stroke-width="1.6" fill="none"/><rect x="' + x + '" y="30" width="44" height="58" rx="3" fill="#e7c99a" stroke="#c4a36e"/><rect x="' + (x + 4) + '" y="36" width="36" height="46" rx="2" fill="#f0dcb4"/><text x="' + cx + '" y="64" text-anchor="middle" fill="#2a2118" font-size="10" font-weight="800">' + esc(names[i] || '') + '</text></g>';
    }).join('');
    return '<svg class="emarack" viewBox="0 0 228 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect x="8" y="12" width="212" height="6" rx="2" fill="#8a6244"/>' + pegs + '</svg>';
  }
  function emaVariants(mem) {
    return '<span class="ema-vars"><span class="ema-pair"><span class="bvar ema-sm" data-lab="小五角牌">' + emaPenSvg(mem) + '<small>小</small></span><span class="bvar ema-lgv" data-lab="大牌單掛">' + emaBoardSvg(mem) + '<small>大 · 單掛</small></span></span>' + emaRackSvg(mem) + '<small class="ema-racklab">掛牆</small></span>';
  }
  function souvenirMarkup(trip, diary, opt) {
    opt = opt || {};
    const mem = opt.mem || memoryOf(trip, diary);
    if (opt.look != null && opt.look !== '') {
      const n = +opt.look;
      if (n >= 0 && n <= 4) mem.look = n | 0;
    } else if (!(mem.look >= 0)) mem.look = lookIndex(trip);
    mem.lookKey = lookKey(mem.kind, mem.look || 0);
    const size = opt.size === 'lg' ? 'lg' : 'mini';
    const body = souvenirBody(mem);
    const cap = boardCap(mem);
    const poke = size === 'lg' ? ' sov-poke' : '';
    return '<span class="sov sov-' + mem.kind + ' sov-' + size + poke + ' tone-' + mem.tone + ' look-' + mem.lookKey + '" data-look="' + mem.lookKey + '" aria-label="' + esc((mem.dest || '') + '的' + (mem.label || '紀念品')) + '"><span class="sov-hold"><span class="sov-body">' + body + '</span></span>' + cap + '</span>';
  }
  const POKE_MS = { pass: 1400, card: 1360, stamp: 1480, charm: 1460, badge: 1400, plaque: 1460, pack: 1320 };
  let holdTilt = null;
  function motionNodes(sov) {
    return sov.querySelectorAll('.sov-body,.charmart,.emaart,.sealart,.pinart,.bp,.mcard-stamp,.badge-case,.charm-foot i,.packart');
  }
  function settleSouvenir(sov) {
    if (!sov) return;
    sov.classList.remove('sov-poke');
    sov.classList.add('sov-rest');
    motionNodes(sov).forEach(function (el) {
      el.style.animation = 'none';
      el.style.transform = 'none';
      el.style.filter = 'none';
    });
  }
  function playSouvenir(sov, done) {
    if (!sov || reduced()) {
      if (sov) settleSouvenir(sov);
      if (done) done();
      return;
    }
    const token = {};
    sov._play = token;
    clearTimeout(sov._settle);
    sov.classList.remove('sov-rest');
    sov.classList.remove('sov-poke');
    motionNodes(sov).forEach(function (node) {
      node.style.animation = '';
      node.style.transform = '';
      node.style.filter = '';
    });
    void sov.offsetWidth;
    sov.classList.add('sov-poke');
    const kind = (sov.className.match(/sov-(pass|card|stamp|charm|badge|plaque|pack)/) || [])[1];
    try { haptic(12); } catch (e) {}
    sov._settle = setTimeout(function () {
      if (sov._play !== token) return;
      settleSouvenir(sov);
      if (done) done();
    }, POKE_MS[kind] || 1120);
  }
  function pokeSouvenir(el) {
    const layer = el && el.closest ? el.closest('#jlayer') : null;
    if (layer && layer.querySelector('.sovrecap')) { replaySouvenir(); return; }
    const root = el && el.querySelector ? el : null;
    const sov = root && (root.classList && root.classList.contains('sov') ? root : root && root.querySelector('.sov'));
    playSouvenir(sov);
  }
  function watchPoke(scope) {
    if (!scope || scope._poke) return;
    scope._poke = true;
    scope.addEventListener('animationend', function (e) {
      const name = e.animationName || '';
      if (!/^(passpoke|cardpoke|stampdown|charmpoke|badgepoke|emapoke|packpoke)$/.test(name)) return;
      const sov = e.target && e.target.closest ? e.target.closest('.sov') : null;
      if (!sov || sov.closest('.sovrecap') || (sov.closest('#jlayer') && sov.closest('#jlayer').querySelector('.sovrecap'))) return;
      settleSouvenir(sov);
    });
    scope.querySelectorAll('.sov-poke').forEach(function (sov) {
      if (sov.closest('#jlayer') && sov.closest('#jlayer').querySelector('.sovrecap')) return;
      clearTimeout(sov._settle);
      sov._settle = setTimeout(function () { settleSouvenir(sov); }, 1300);
    });
  }
  function tallyTrip(trip, diary) {
    const named = [];
    spotsOf(trip || {}).forEach(function (x) { if (x.s && x.s.name) named.push(x.s); });
    const seen = named.filter(function (s) { return s.visited === true; });
    const pool = seen.length ? seen : named;
    const places = pool.filter(function (s) { return isSight(s) || isShop(s) || isNature(s); }).length;
    const eats = new Set();
    pool.filter(isEat).forEach(function (s) { eats.add(String(s.name).trim()); });
    (diary || []).forEach(function (d) {
      if (!inRange(d && d.date, trip)) return;
      const n = String(d && d.placeName || '').trim();
      if (n) eats.add(n);
    });
    return { places: places, eats: eats.size };
  }
  function recapMarkup(mem, counts, sid) {
    mem = mem || {};
    counts = counts || { places: 0, eats: 0 };
    const id = safeTid(sid);
    const route = mem.route
      ? esc(mem.route) + (mem.backRoute ? ' · 回程 ' + esc(mem.backRoute) : '')
      : '這趟沒有留下航線，人還是到了。';
    const routeLab = mem.by === 'land' ? '路程' : '航線';
    const spotNames = mem.spots || [];
    const eatNames = mem.eats || [];
    const places = chipList('去過', spotNames) + chipList('吃過', eatNames);
    const empty = !spotNames.length && !eatNames.length ? '<p class="mut">這趟還沒寫下景點。目的地和日期先留在這件紀念品上。</p>' : '';
    const pick = id ? '<p class="sovpicklab">想換成別的樣子</p><div class="seg sovpick" role="group" aria-label="紀念品形態">' + SOUVENIRS.map(function (pair) {
      const k = pair[0], lab = pair[1];
      return '<button type="button" class="' + (k === mem.kind ? 'on' : '') + '" onclick="Journey.setSouvenir(\'' + id + '\',\'' + k + '\')">' + lab + '</button>';
    }).join('') + '</div>' : '';
    const lookLab = (mem.kind === 'charm' || mem.kind === 'plaque') ? '換一種掛法' : '換一種呈現';
    const lookRows = LOOKS[mem.kind] || [];
    const lookPick = id ? '<p class="sovpicklab">' + lookLab + '</p><div class="seg sovpick sovlook" role="group" aria-label="' + lookLab + '">' + lookRows.map(function (row, i) {
      return '<button type="button" class="' + (i === (mem.look || 0) ? 'on' : '') + '" onclick="Journey.setLook(\'' + id + '\',' + i + ')">' + esc(lookTitle(mem.kind, i, mem)) + '</button>';
    }).join('') + '</div>' : '';
    const actions = '<div class="row"><button type="button" class="btn" onclick="Journey.replaySouvenir()">再看一次</button><button type="button" class="btn ghost" onclick="Journey.openKeepsakes()">返回收藏</button></div>' + (id ? '<div class="row"><button type="button" class="btn ghost" onclick="Journey.openKeptTrip(\'' + id + '\')">翻開行程</button><button type="button" class="btn ghost" onclick="Journey.releaseSouvenir(\'' + id + '\')">解除封存</button></div><p class="sovdrop"><button type="button" class="textbtn" onclick="Journey.dropSouvenir(\'' + id + '\')">刪除這趟</button></p>' : '');
    return '<article class="sovrecap" hidden aria-live="polite">' + settleHtml(mem) + '<p class="sovkicker">這趟的小結算</p><h2>' + esc(mem.dest || '') + '</h2><p class="sovwhen">' + esc(mem.when || '') + '</p><p class="sovroute"><span>' + routeLab + '</span>' + route + '</p><div class="sovstats"><p class="sovstat"><b>' + counts.places + '</b><span>去過的景點</span></p><p class="sovstat"><b>' + counts.eats + '</b><span>吃過的店</span></p></div><p class="sovline">' + esc(mem.line || '') + '</p>' + places + empty + pick + lookPick + actions + '</article>';
  }
  function settleItems(mem) {
    const out = [];
    out.push({ k: '這趟', t: mem.dest || '這趟', d: mem.when || '' });
    if (mem.route) out.push({ k: '去程', t: mem.route, d: '' });
    if (mem.backRoute) out.push({ k: '回程', t: mem.backRoute, d: '' });
    (mem.spots || []).forEach(function (n) { out.push({ k: '去過', t: n, d: mem.days ? mem.days + ' 天' : '' }); });
    (mem.eats || []).forEach(function (n) { out.push({ k: '吃過', t: n, d: '' }); });
    if (out.length < 3 && mem.line) out.push({ k: '留一句', t: mem.line, d: '' });
    return out.slice(0, 6);
  }
  function shortChars(s, n) {
    return Array.from(String(s || '')).slice(0, n).join('');
  }
  function drawMedalSvg(shape, mem, title) {
    const b = motifBits(mem);
    const ink = inkOf(mem);
    const icon = '<g transform="translate(36,18) scale(.38)">' + markIcon(b.mark) + '</g>';
    const label = esc(shortChars(title, 4));
    if (shape === 'shield') {
      return '<svg class="medalart" viewBox="0 0 120 140" aria-hidden="true" style="color:' + ink.main + '"><path d="M60 6 L104 24 V62 C104 90 84 112 60 124 C36 112 16 90 16 62 V24 Z" fill="' + ink.main + '"/><path d="M60 16 L94 30 V62 C94 84 78 102 60 112 C42 102 26 84 26 62 V30 Z" fill="#fffdf8"/><path d="M60 16 L94 30 V44 H26 V30 Z" fill="' + ink.gold + '" opacity=".45"/>' + icon + '<text x="60" y="100" text-anchor="middle" fill="#3a2a22" font-size="12" font-weight="800">' + label + '</text></svg>';
    }
    if (shape === 'hex') {
      return '<svg class="medalart" viewBox="0 0 120 132" aria-hidden="true" style="color:' + ink.main + '"><polygon points="60,4 110,32 110,88 60,116 10,88 10,32" fill="' + ink.gold + '"/><polygon points="60,14 100,36 100,84 60,106 20,84 20,36" fill="#fffdf8" stroke="' + ink.main + '" stroke-width="2"/>' + icon + '<text x="60" y="92" text-anchor="middle" fill="#3a2a22" font-size="12" font-weight="800">' + label + '</text></svg>';
    }
    return '<svg class="medalart" viewBox="0 0 120 132" aria-hidden="true" style="color:' + ink.main + '"><circle cx="60" cy="52" r="48" fill="' + ink.gold + '"/><circle cx="60" cy="52" r="40" fill="#fffdf8" stroke="' + ink.main + '" stroke-width="3"/><circle cx="60" cy="52" r="34" fill="none" stroke="' + ink.gold + '" stroke-width="1.6"/>' + icon + '<text x="60" y="80" text-anchor="middle" fill="#3a2a22" font-size="12" font-weight="800">' + label + '</text><path d="M38 104 h44 l-8 14 H46 Z" fill="' + ink.main + '"/></svg>';
  }
  function drawWishSvg(mem, title, land) {
    const b = motifBits(mem);
    const clip = sovId('wish');
    const scene = SCENE[b.scene] || SCENE.hills;
    const chars = esc(shortChars(title, 6));
    const fs = Array.from(String(title || '')).length > 4 ? 11 : 14;
    return '<svg class="wishpen" viewBox="0 0 120 176" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M60 4 C74 14 78 26 60 34 C42 26 46 14 60 4" fill="none" stroke="#b4332a" stroke-width="2.6" stroke-linecap="round"/><circle cx="60" cy="18" r="3.4" fill="none" stroke="#b4332a" stroke-width="1.6"/><path d="M60 36 L112 78 L98 166 H22 L8 78 Z" fill="#e7c99a" stroke="#c4a36e" stroke-width="2"/><path d="M60 50 L100 84 L90 156 H30 L20 84 Z" fill="#f6e7c8"/><clipPath id="' + clip + '"><path d="M34 96 L86 108 L80 136 H40 Z"/></clipPath><g clip-path="url(#' + clip + ')"><g transform="translate(22,88) scale(.55)">' + scene + '</g></g><text x="60" y="76" text-anchor="middle" fill="#2a2118" font-size="' + fs + '" font-weight="800">' + chars + '</text><text x="60" y="152" text-anchor="middle" fill="#8a5a32" font-size="11" font-weight="800">' + esc(shortChars(land, 6)) + '</text></svg>';
  }
  function drawFace(mem, it, n) {
    const kind = mem.kind || 'card';
    const b = motifBits(mem);
    const ink = inkOf(mem);
    const title = it.t || '';
    const kicker = it.k || '';
    const detail = it.d || '';
    const scene = '<span class="face-scene">' + sceneSvg(b.scene) + '</span>';
    const tone = b.country || 'plain';
    if (kind === 'pack') {
      return '<span class="face face-pack tone-' + tone + '"><span class="pack-rim">' + scene + '<span class="face-mark">' + markSvg(b.mark, ink.main) + '</span><b>' + esc(title) + '</b><small>' + esc(kicker) + (detail ? ' · ' + esc(detail) : '') + '</small><i>' + esc(b.city) + ' · ' + esc(b.land) + '</i></span></span>';
    }
    if (kind === 'pass' && mem.by === 'land') {
      return '<span class="face face-pass face-rail"><span class="ticket-main"><small>路程</small><b>' + esc(title) + '</b><em>' + esc(detail || (mem.landFrom && mem.landTo ? mem.landFrom + ' → ' + mem.landTo : b.land)) + '</em>' + scene + '</span><span class="rail-stub"><i>' + esc(mem.landTo || b.city) + '</i><span class="rail-line" aria-hidden="true"></span></span></span>';
    }
    if (kind === 'pass') {
      return '<span class="face face-pass"><span class="ticket-main"><small>' + esc(kicker) + '</small><b>' + esc(title) + '</b><em>' + esc(detail || b.land) + '</em>' + scene + '</span><span class="face-perf" aria-hidden="true"></span><span class="ticket-stub"><i>' + esc(b.city) + '</i>' + barcodeSvg(title + (b.city || '')) + '</span></span>';
    }
    if (kind === 'stamp') {
      return '<span class="face face-page"><span class="page-hole" aria-hidden="true"></span><span class="face-seal" style="color:' + ink.main + '">' + markSvg(b.mark, ink.main) + '<b>' + esc(shortChars(title, 4)) + '</b></span><small>' + esc(title) + '</small><em>' + esc(b.land) + (kicker ? ' · ' + esc(kicker) : '') + '</em></span>';
    }
    if (kind === 'charm') {
      const word = (mem.voice && mem.voice.word) || '祈福';
      return '<span class="face face-slip tone-' + tone + '"><span class="slip-cord" aria-hidden="true"></span><span class="slip-head">' + esc(word) + '</span><span class="slip-art">' + markSvg(b.mark, ink.main) + '</span><b>' + esc(shortChars(title, 8)) + '</b><small>' + esc(b.land) + '</small><i>' + esc(kicker) + '</i><span class="slip-foot">紙籤</span></span>';
    }
    if (kind === 'badge') {
      const shape = ['round', 'shield', 'hex'][(n || 0) % 3];
      return '<span class="face face-medal tone-' + tone + '"><span class="medal medal-' + shape + '">' + drawMedalSvg(shape, mem, title) + '</span><b>' + esc(title) + '</b><small>' + esc(b.land) + '</small><i>' + esc(kicker) + '</i></span>';
    }
    if (kind === 'plaque') {
      return '<span class="face face-wood">' + drawWishSvg(mem, title, b.land) + '</span>';
    }
    return '<span class="face face-post tone-' + tone + '">' + scene + '<span class="post-write"><span class="face-stamp" aria-hidden="true">到此<br>一遊</span><b>' + esc(title) + '</b><small>' + esc(detail || b.land) + '</small><i>' + esc(b.city) + '</i></span></span>';
  }
  function settlePile(mem) {
    return '<div class="drawpile">' + settleItems(mem).map(function (it, n) {
      return '<button type="button" class="drawcard draw-' + (mem.kind || 'card') + '" hidden>' + drawFace(mem, it, n) + '</button>';
    }).join('') + '</div>';
  }
  function packStage(mem) {
    return '<span class="foil"><span class="foil-top"><small>CARD PACK</small><b>' + esc(mem.dest || '這趟') + '</b></span><span class="foil-rip"></span><span class="foil-bot"><b>卡包</b><small>撕開來抽</small></span></span>';
  }
  function passStage(mem) {
    const land = mem.by === 'land';
    return '<span class="stubcard"><span class="stubmain"><small>' + (land ? '路程' : '登機證') + '</small><b>' + esc(mem.route || mem.dest || '這趟') + '</b></span><span class="stubperf"></span><span class="stubbit">' + (land ? '票根' : '存根') + '</span></span>';
  }
  function cardStage(mem) {
    return '<span class="foilcard"><span class="foilskin"></span><span class="foilface"><small>紀念卡</small><b>' + esc(mem.dest || '') + '</b></span></span>';
  }
  function stampStage(mem) {
    return '<span class="book"><span class="bookcover"><small>印章冊</small><b>' + esc(mem.dest || '') + '</b></span></span>';
  }
  function charmStage(mem) {
    const voice = mem.voice || VOICE.plain;
    return '<span class="omibox"><i></i><i></i><i></i><b>' + esc(voice.charm) + '</b></span>';
  }
  function settleHtml(mem) {
    mem = mem || {};
    const kind = mem.kind || 'card';
    if (kind === 'badge') {
      return '<div class="sovset sovset-badge" data-kind="badge">' + badgeVariants(mem) + '<p class="sethint" data-idle="圓形、盾形、六角，配卡紙、毛氈或吸塑">圓形、盾形、六角，配卡紙、毛氈或吸塑</p><button type="button" class="btn ghost sm setgo" onclick="Journey.settleAct(this)">換一種掛法</button>' + settlePile(mem) + '</div>';
    }
    if (kind === 'plaque') {
      return '<div class="sovset sovset-plaque" data-kind="plaque">' + emaVariants(mem) + '<p class="sethint" data-idle="小牌、大牌單掛，或掛上一排">小牌、大牌單掛，或掛上一排</p><button type="button" class="btn ghost sm setgo" onclick="Journey.settleAct(this)">看下一掛</button>' + settlePile(mem) + '</div>';
    }
    const idle = kind === 'pack' ? '點一下，撕開卡包'
      : kind === 'pass' ? (mem.by === 'land' ? '點一下，沿這段路程看' : '點一下，撕下存根')
      : kind === 'stamp' ? '點一下，翻開印章冊'
      : kind === 'charm' ? '點一下，抽出一支籤'
      : '點一下，刮開紀念卡';
    const stage = kind === 'pack' ? packStage(mem)
      : kind === 'pass' ? passStage(mem)
      : kind === 'stamp' ? stampStage(mem)
      : kind === 'charm' ? charmStage(mem)
      : cardStage(mem);
    return '<div class="sovset sovset-' + kind + '" data-kind="' + kind + '"><button type="button" class="setgo" onclick="Journey.settleAct(this)">' + stage + '</button><p class="sethint" data-idle="' + idle + '">' + idle + '</p>' + settlePile(mem) + '</div>';
  }
  function tearHint(kind) {
    if (kind === 'pack') return '撕開了。再點一下，抽一張。';
    if (kind === 'pass') return '票根撕下了。再點一下，翻開一段。';
    if (kind === 'stamp') return '冊子開了。再點一下，蓋一頁。';
    if (kind === 'charm') return '再點一下，抽出一支籤。';
    return '刮開了。再點一下，看一條。';
  }
  function drawHint(kind) {
    if (kind === 'pack') return '再點一下，抽一張。';
    if (kind === 'pass') return '再點一下，翻開下一段。';
    if (kind === 'stamp') return '再點一下，蓋下一頁。';
    if (kind === 'charm') return '再點一下，再抽一支。';
    return '再點一下，看下一條。';
  }
  function doneHint(kind) {
    if (kind === 'pack') return '這包抽完了。';
    if (kind === 'stamp') return '每一頁都蓋過了。';
    if (kind === 'charm') return '籤都抽出來了。';
    return '這趟看完了。';
  }
  function drawOne(box) {
    const next = box.querySelector('.drawcard[hidden]');
    if (!next) return false;
    next.hidden = false;
    return !!box.querySelector('.drawcard[hidden]');
  }
  function cycleMount(box) {
    const nodes = box.querySelectorAll('.bvar,.rackpeg');
    if (!nodes.length) return;
    let i = -1;
    nodes.forEach(function (n, idx) { if (n.classList.contains('is-on')) i = idx; });
    nodes.forEach(function (n) { n.classList.remove('is-on'); });
    const next = nodes[(i + 1) % nodes.length];
    next.classList.add('is-on');
    const hint = box.querySelector('.sethint');
    const lab = next.getAttribute('data-lab');
    if (hint && lab) hint.textContent = lab;
  }
  function settleAct(btn) {
    const box = btn && btn.closest ? btn.closest('.sovset') : null;
    if (!box) return;
    const kind = box.getAttribute('data-kind') || '';
    if (kind === 'badge' || kind === 'plaque') {
      cycleMount(box);
      if (!drawOne(box)) box.classList.add('is-done');
      return;
    }
    const hint = box.querySelector('.sethint');
    if (!box.classList.contains('is-torn')) {
      box.classList.add('is-torn');
      if (hint) hint.textContent = tearHint(kind);
      return;
    }
    const more = drawOne(box);
    if (!more) box.classList.add('is-done');
    if (hint) hint.textContent = more ? drawHint(kind) : doneHint(kind);
  }
  function resetSettle(layer) {
    if (!layer || !layer.querySelectorAll) return;
    layer.querySelectorAll('.sovset').forEach(function (box) {
      box.classList.remove('is-torn');
      box.classList.remove('is-done');
      box.querySelectorAll('.is-on').forEach(function (n) { n.classList.remove('is-on'); });
      box.querySelectorAll('.drawcard').forEach(function (el) { el.hidden = true; });
      const hint = box.querySelector('.sethint');
      if (hint && hint.dataset && hint.dataset.idle) hint.textContent = hint.dataset.idle;
    });
  }
  function revealRecap(layer) {
    if (!layer || !layer.isConnected || !layer.querySelector('.sovrecap')) return;
    layer.classList.remove('sov-playing');
    layer.classList.add('sov-settled');
    const recap = layer.querySelector('.sovrecap');
    recap.hidden = false;
    try { recap.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); } catch (e) {}
  }
  function replaySouvenir() {
    if (typeof document === 'undefined') return;
    const layer = document.querySelector('#jlayer');
    if (!layer) return;
    const sov = layer.querySelector('.sov');
    const recap = layer.querySelector('.sovrecap');
    resetSettle(layer);
    if (!reduced()) {
      layer.classList.add('sov-playing');
      layer.classList.remove('sov-settled');
      if (recap) recap.hidden = true;
    }
    playSouvenir(sov, function () { revealRecap(layer); });
  }
  function safeTid(id) { return /^[A-Za-z0-9_-]+$/.test(String(id || '')) ? String(id) : ''; }
  function archivedTrips(list) {
    return (list || []).filter(t => t && t.archived).slice().sort((a, b) => (+b.archivedAt || 0) - (+a.archivedAt || 0));
  }
  function souvenirHit(t, diary) {
    const id = safeTid(t && t.id);
    if (!id) return '';
    const mem = memoryOf(t, diary);
    return '<button type="button" class="sovhit" onclick="Journey.openSouvenir(\'' + id + '\')" aria-label="' + esc(mem.dest + '的' + mem.label) + '">' + souvenirMarkup(t, diary, { size: 'mini', mem: mem }) + '</button>';
  }
  function shelfHtml(list) {
    const arch = archivedTrips(list || tripsNow());
    if (!arch.length) return '';
    const diary = diaryNow();
    return '<section class="sovshelf"><div class="sovhead"><h3>收藏</h3><button type="button" class="textbtn" onclick="Journey.openKeepsakes()">打開收藏</button></div><p class="mut sovlead">封存之後收在這裡。點一下，就是那趟帶回來的紀念品。</p><div class="sovwall">' + arch.map(t => souvenirHit(t, diary)).join('') + '</div></section>';
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
  function airCities(text) {
    const ids = [];
    const re = /\b([A-Za-z]{3})\b/g;
    let m;
    const s = String(text || '');
    while ((m = re.exec(s))) {
      const id = CITY_AIR[m[1].toUpperCase()];
      if (id && ids.indexOf(id) < 0) ids.push(id);
    }
    return ids;
  }
  function isHop(s) {
    if (!s) return false;
    if (s.kind === 'flight' || s.leg === 'out' || s.leg === 'return') return true;
    return /\b[A-Z]{3}\s*(?:→|->|–|-|~)\s*[A-Z]{3}\b/.test(String(s.name || ''));
  }
  function spotCity(s) {
    if (!s || isHop(s)) return '';
    const lat = +s.lat, lng = +s.lng;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const hit = CITIES.find(c => inBox(lat, lng, c.box));
      if (hit) return hit.id;
    }
    return cityFromText(blob(s));
  }
  /* 只算行程目的地，以及日子裡的景點。出發機場、回程航班不算去過。 */
  function citiesTouched(trip) {
    const ids = new Set();
    if (!trip) return ids;
    const add = id => { if (id) ids.add(id); };
    add(cityFromText(trip.dest));
    airCities(trip.dest).forEach(add);
    (trip.days || []).forEach(d => (d || []).forEach(s => add(spotCity(s))));
    return ids;
  }
  function visitedPlaces(trips) {
    const bag = {};
    CITIES.forEach(c => { bag[c.id] = []; });
    (trips || []).forEach(t => {
      if (!t) return;
      const row = { id: String(t.id || ''), dest: String(t.dest || ''), dep: String(t.dep || ''), ret: String(t.ret || ''), archived: t.archived === true };
      citiesTouched(t).forEach(id => { if (bag[id]) bag[id].push(row); });
    });
    return CITIES.map(c => ({ id: c.id, country: c.country, name: c.name, color: c.color, on: bag[c.id].length > 0, trips: bag[c.id] }));
  }
  function visitBrief(trips) {
    const places = visitedPlaces(trips || (typeof tripsNow === 'function' ? tripsNow() : []));
    const bits = COUNTRIES.map(c => {
      const n = places.filter(p => p.country === c.id && p.on).length;
      return n ? c.name + ' ' + n : '';
    }).filter(Boolean);
    return bits.join(' · ') || '還沒有點亮的城市';
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
    card('tw-first', 'tw', '', '初訪台灣', '🏝️', '建立一趟台灣行程', '第一趟台灣行程已經在旅伴裡了。從台北走到恆春，都算這一頁。', ctx => ctx.tw.length > 0),
    card('tw-archive', 'tw', '', '旅程封存', '📗', '封存一趟台灣行程', '行程收進冊子裡。海風、夜市和山路都還在。', ctx => ctx.tw.some(t => t.archived === true)),
    card('tpe-101', 'tw', 'tpe', '台北101', '🏙️', '在台北101蓋上到此一遊', '城市在腳下。那一層風，你站進去了。', ctx => seen(ctx, 'tpe', /台北\s?101|台北101|taipei\s?101/i, [25.03384, 121.5645, 0.6])),
    card('tpe-palace', 'tw', 'tpe', '故宮', '🏺', '在故宮蓋上到此一遊', '櫃子一格一格打開。這座城把時間收在裡面。', ctx => seen(ctx, 'tpe', /故宮|palace museum/i, [25.10157, 121.54886, 0.7])),
    card('tpe-jiufen', 'tw', 'tpe', '九份', '🏮', '在九份蓋上到此一遊', '階梯很陡，燈一盞一盞亮起來。你走過那一條老街。', ctx => seen(ctx, 'tpe', /九份|jiufen|chiufen/i, [25.10862, 121.84443, 0.8])),
    card('tpe-night', 'tw', 'tpe', '台北夜市', '🍢', '在夜市蓋上到此一遊', '士林、饒河、寧夏或臨江。晚上的台北從這裡開始。', ctx => seen(ctx, 'tpe', /夜市/, null)),
    card('tpe-yehliu', 'tw', 'tpe', '野柳', '🪨', '在野柳蓋上到此一遊', '海風很大，石頭一顆一顆站著。你走到女王頭前面了。', ctx => seen(ctx, 'tpe', /野柳|yehliu/i, [25.21135, 121.69638, 0.8])),
    card('tpe-bowl', 'tw', 'tpe', '牛肉麵與滷肉飯', '🍜', '吃過牛肉麵、滷肉飯或豆漿油條', '一碗麵、一盤飯，或一早的豆漿。台北的日常就在這裡。', ctx => foodHits(ctx, 'tpe', /牛肉麵|滷肉飯|魯肉飯|豆漿|油條/) >= 1),
    card('tpe-pass', 'tw', 'tpe', '台北通', '🗺️', '在台北蓋上 6 個到此一遊', '巷子開始認得你了。北車到淡水，不再只是地圖上的名字。', ctx => ctx.city.tpe.spots.filter(x => x.s.visited === true).length >= 6),
    card('txg-nmns', 'tw', 'txg', '科博館', '🦕', '在自然科學博物館蓋上到此一遊', '大廳很高，恐龍還在。台中的一個下午從這裡開始。', ctx => seen(ctx, 'txg', /科博館|自然科學博物館|nmns/i, [24.15683, 120.66509, 0.6])),
    card('txg-gaomei', 'tw', 'txg', '高美濕地', '🦀', '在高美濕地蓋上到此一遊', '風車、潮水、一條木棧道。夕陽下來的時候會停很久。', ctx => seen(ctx, 'txg', /高美/, [24.31486, 120.54978, 0.9])),
    card('txg-rainbow', 'tw', 'txg', '彩虹眷村', '🌈', '在彩虹眷村蓋上到此一遊', '牆上一筆一筆的顏色。巷子不長，可是每面牆都不一樣。', ctx => seen(ctx, 'txg', /彩虹眷村/, [24.13368, 120.60983, 0.5])),
    card('txg-fengjia', 'tw', 'txg', '逢甲夜市', '🍢', '在逢甲夜市蓋上到此一遊', '燈很亮，人很多。這一晚算你來過台中。', ctx => seen(ctx, 'txg', /逢甲/, [24.17735, 120.6466, 0.6])),
    card('txg-921', 'tw', 'txg', '九二一地震教育園區', '🏫', '在九二一園區蓋上到此一遊', '操場還在，教室也還在。走慢一點就好。', ctx => seen(ctx, 'txg', /九二一|地震教育/, [24.04261, 120.69914, 0.6])),
    card('txg-pass', 'tw', 'txg', '台中通', '🌇', '在台中蓋上 4 個到此一遊', '從科博館到海邊，這座城慢慢讓你進來。', ctx => ctx.city.txg.spots.filter(x => x.s.visited === true).length >= 4),
    card('tnn-chimei', 'tw', 'tnn', '奇美博物館', '🎻', '在奇美博物館蓋上到此一遊', '大廳的光很穩。琴和畫都在等你走完這一圈。', ctx => seen(ctx, 'tnn', /奇美|chimei/i, [22.93446, 120.22646, 0.6])),
    card('tnn-chihkan', 'tw', 'tnn', '赤嵌樓', '🏯', '在赤嵌樓蓋上到此一遊', '紅磚還在，城在巷子裡。你推開那一扇門了。', ctx => seen(ctx, 'tnn', /赤嵌|赤崁|chihkan/i, [22.99727, 120.2027, 0.4])),
    card('tnn-anping', 'tw', 'tnn', '安平古堡', '⚓', '在安平古堡蓋上到此一遊', '海風從城牆外過來。老街就在旁邊。', ctx => seen(ctx, 'tnn', /安平古堡|熱蘭遮|zeelandia/i, [23.00161, 120.16057, 0.5])),
    card('tnn-beef', 'tw', 'tnn', '牛肉湯', '🥣', '吃過牛肉湯、擔仔麵或蝦捲', '早上的一碗湯，或安平的蝦捲。台南是這樣吃的。', ctx => foodHits(ctx, 'tnn', /牛肉湯|擔仔麵|蝦捲/) >= 1),
    card('tnn-pass', 'tw', 'tnn', '台南通', '🏮', '在台南蓋上 4 個到此一遊', '巷子窄，廟很多。你已經走熟了一點。', ctx => ctx.city.tnn.spots.filter(x => x.s.visited === true).length >= 4),
    card('khh-pier2', 'tw', 'khh', '駁二', '🏭', '在駁二蓋上到此一遊', '倉庫還在，牆上都是畫。港邊的風從這裡進來。', ctx => seen(ctx, 'khh', /駁二|pier-?\s?2/i, [22.61953, 120.28162, 0.6])),
    card('khh-takow', 'tw', 'khh', '打狗英國領事館', '🏛️', '在打狗英國領事館蓋上到此一遊', '山坡上的紅磚，下面就是海。你走上去了。', ctx => seen(ctx, 'khh', /打狗|英國領事|british consulate|takow/i, [22.61967, 120.26651, 0.5])),
    card('khh-lotus', 'tw', 'khh', '蓮池潭', '🐉', '在蓮池潭蓋上到此一遊', '龍虎塔對著水面。風一過，城就安靜下來。', ctx => seen(ctx, 'khh', /蓮池潭|lotus pond/i, [22.68384, 120.29645, 0.8])),
    card('khh-dome', 'tw', 'khh', '美麗島站', '🌈', '在美麗島站蓋上到此一遊', '光穹在頭頂轉。出站之前會多站一下。', ctx => seen(ctx, 'khh', /美麗島/, [22.63139, 120.30186, 0.4])),
    card('khh-bowl', 'tw', 'khh', '米苔目', '🍜', '吃過米苔目或木瓜牛奶', '一碗湯，或早餐的木瓜牛奶。港都的味道從這裡開始。', ctx => foodHits(ctx, 'khh', /米苔目|木瓜牛奶/) >= 1),
    card('khh-pass', 'tw', 'khh', '高雄通', '⚓', '在高雄蓋上 4 個到此一遊', '港、河、車站。這座城你已經沿著它走了一段。', ctx => ctx.city.khh.spots.filter(x => x.s.visited === true).length >= 4),
    card('hul-taroko', 'tw', 'hul', '太魯閣', '🏞️', '在太魯閣蓋上到此一遊', '峽谷很深，路沿著山壁走。你到過這一頭。', ctx => seen(ctx, 'hul', /太魯閣|taroko/i, [24.15816, 121.62337, 0.8])),
    card('hul-qixing', 'tw', 'hul', '七星潭', '🌊', '在七星潭蓋上到此一遊', '石頭是黑的，海是直的。風會把一個下午吹慢。', ctx => seen(ctx, 'hul', /七星潭|qixing/i, [24.03143, 121.62717, 0.8])),
    card('hul-night', 'tw', 'hul', '東大門夜市', '🏮', '在東大門夜市蓋上到此一遊', '晚上的花蓮市從這條街開始。湯是熱的。', ctx => seen(ctx, 'hul', /東大門/, [23.97254, 121.61131, 0.6])),
    card('hul-pool', 'tw', 'hul', '池南', '🌲', '在池南森林遊樂區蓋上到此一遊', '林子比市區安靜。走到裡面，時間會慢下來。', ctx => seen(ctx, 'hul', /池南/, [23.9183, 121.50119, 0.8])),
    card('hul-dumpling', 'tw', 'hul', '扁食', '🥟', '吃過扁食', '一碗湯，幾顆扁食。花蓮市區的午餐常常就是這樣。', ctx => foodHits(ctx, 'hul', /扁食/) >= 1),
    card('hul-pass', 'tw', 'hul', '花蓮通', '⛰️', '在花蓮蓋上 4 個到此一遊', '山和海靠得很近。你已經在中間走了一段。', ctx => ctx.city.hul.spots.filter(x => x.s.visited === true).length >= 4),
    card('ttt-sanxian', 'tw', 'ttt', '三仙台', '🌉', '在三仙台蓋上到此一遊', '橋對著海。風很大的時候，人會站久一點。', ctx => seen(ctx, 'ttt', /三仙台|sanxiantai/i, [23.12528, 121.41776, 0.8])),
    card('ttt-brown', 'tw', 'ttt', '伯朗大道', '🌾', '在伯朗大道蓋上到此一遊', '稻子一直鋪到山邊。路很直，天空很大。', ctx => seen(ctx, 'ttt', /伯朗/, [23.09878, 121.2126, 1.2])),
    card('ttt-zhiben', 'tw', 'ttt', '知本', '♨️', '在知本蓋上到此一遊', '林子裡比較暖。走完這一圈，腳會記得。', ctx => seen(ctx, 'ttt', /知本/, [22.69726, 120.98483, 0.9])),
    card('ttt-bento', 'tw', 'ttt', '池上便當', '🍱', '吃過池上便當或釋迦', '趕路的時候是便當。產季到了，才有釋迦。', ctx => foodHits(ctx, 'ttt', /池上便當|釋迦/) >= 1),
    card('ttt-pass', 'tw', 'ttt', '台東通', '🌅', '在台東蓋上 3 個到此一遊', '海岸線很長。你已經停過其中幾站。', ctx => ctx.city.ttt.spots.filter(x => x.s.visited === true).length >= 3),
    card('cyi-alishan', 'tw', 'cyi', '阿里山', '🌲', '在阿里山蓋上到此一遊', '杉木很高，空氣比較冷。你到過這一座山。', ctx => seen(ctx, 'cyi', /阿里山|alishan/i, [23.53245, 120.80505, 1.2])),
    card('cyi-rice', 'tw', 'cyi', '火雞肉飯', '🍗', '吃過火雞肉飯', '一盤飯、一碗湯。嘉義市區的日常是這樣。', ctx => foodHits(ctx, 'cyi', /火雞肉飯/) >= 1),
    card('cyi-tea', 'tw', 'cyi', '阿里山茶', '🍵', '喝過阿里山茶', '茶是山上的。喝一口，霧還在杯子外面。', ctx => foodHits(ctx, 'cyi', /阿里山茶|高山茶/) >= 1),
    card('cyi-pass', 'tw', 'cyi', '阿里山通', '🚂', '在嘉義蓋上 2 個到此一遊', '山上的路比想像中長。你已經走上一截。', ctx => ctx.city.cyi.spots.filter(x => x.s.visited === true).length >= 2),
    card('ktn-aqua', 'tw', 'ktn', '海生館', '🐋', '在海洋生物博物館蓋上到此一遊', '魚從玻璃另一邊游過。你會在那裡停很久。', ctx => seen(ctx, 'ktn', /海生館|海洋生物博物館|nmmba/i, [22.04575, 120.69933, 0.6])),
    card('ktn-forest', 'tw', 'ktn', '墾丁森林遊樂區', '🌴', '在墾丁森林遊樂區蓋上到此一遊', '林子貼著海。走進去，風會小一點。', ctx => seen(ctx, 'ktn', /森林遊樂區|墾丁森林/, [21.96354, 120.82035, 0.8])),
    card('ktn-eluanbi', 'tw', 'ktn', '鵝鑾鼻', '🗼', '在鵝鑾鼻蓋上到此一遊', '燈塔在台灣這一頭。海在三面。', ctx => seen(ctx, 'ktn', /鵝鑾鼻|eluanbi/i, [21.9042, 120.85087, 0.7])),
    card('ktn-onion', 'tw', 'ktn', '恆春洋蔥', '🧅', '吃過恆春洋蔥', '這一帶的味道比較甜。海鮮是晚上的事。', ctx => foodHits(ctx, 'ktn', /洋蔥/) >= 1),
    card('ktn-pass', 'tw', 'ktn', '墾丁通', '🐚', '在墾丁蓋上 3 個到此一遊', '半島比地圖上更長。你已經從這一頭走到那一頭。', ctx => ctx.city.ktn.spots.filter(x => x.s.visited === true).length >= 3),
    card('yil-arts', 'tw', 'yil', '宜蘭傳藝', '🎭', '在傳藝園區蓋上到此一遊', '戲台、老街、一池水。走慢的話，一個下午剛剛好。', ctx => seen(ctx, 'yil', /傳藝/, [24.68546, 121.82375, 0.6])),
    card('yil-cake', 'tw', 'yil', '牛舌餅', '🥮', '吃過或買過牛舌餅', '這是帶回去的。咬開的時候，糖還是熱的。', ctx => foodHits(ctx, 'yil', /牛舌餅/) >= 1),
    card('yil-noodle', 'tw', 'yil', '海鮮麵', '🍜', '吃過海鮮麵', '一碗麵，海就在不遠的地方。', ctx => foodHits(ctx, 'yil', /海鮮麵/) >= 1),
    card('yil-pass', 'tw', 'yil', '宜蘭通', '🌧️', '在宜蘭蓋上 2 個到此一遊', '雨來的時候，城會更安靜。你已經在這裡待過。', ctx => ctx.city.yil.spots.filter(x => x.s.visited === true).length >= 2),
    card('nto-lake', 'tw', 'nto', '日月潭', '⛰️', '在日月潭蓋上到此一遊', '水面很寬，山圍在旁邊。你到過這一圈。', ctx => seen(ctx, 'nto', /日月潭(?!纜車)|sun moon/i, [23.85233, 120.92861, 1.2])),
    card('nto-rope', 'tw', 'nto', '日月潭纜車', '🚡', '在日月潭纜車蓋上到此一遊', '潭在腳下慢慢變小。這一趟是往上的。', ctx => seen(ctx, 'nto', /纜車|ropeway/i, [23.85618, 120.94289, 0.5])),
    card('nto-nine', 'tw', 'nto', '九族文化村', '🏘️', '在九族文化村蓋上到此一遊', '園子很大，山就在後面。走完一圈，天色會不一樣。', ctx => seen(ctx, 'nto', /九族/, [23.86498, 120.94864, 0.7])),
    card('nto-egg', 'tw', 'nto', '茶葉蛋', '🥚', '吃過日月潭茶葉蛋', '這是點心，不是正餐。茶香會留在手上。', ctx => foodHits(ctx, 'nto', /茶葉蛋/) >= 1),
    card('nto-tea', 'tw', 'nto', '阿薩姆紅茶', '🍵', '喝過阿薩姆或魚池紅茶', '這一帶的茶比較厚。喝完，湖還在外面。', ctx => foodHits(ctx, 'nto', /阿薩姆|紅茶/) >= 1),
    card('nto-pass', 'tw', 'nto', '日月潭通', '🚤', '在南投蓋上 3 個到此一遊', '潭、纜車、園區。這一片山你已經進來了。', ctx => ctx.city.nto.spots.filter(x => x.s.visited === true).length >= 3),
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
    const tw = countryTrips(trips, 'tw');
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
      jp, kr, tw, city,
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
    rootEl.classList.toggle('theme-tw', id === 'tw');
    const editing = !!(globalThis.TM && TM.getTab && TM.getTab() === 'edit');
    if (document.body) document.body.classList.toggle('trip-ro', !!(t && t.archived && editing));
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) {
      const dark = rootEl.classList.contains('dark');
      meta.content = dark ? (id === 'jp' ? '#161C26' : id === 'kr' ? '#141C1A' : id === 'tw' ? '#121E1E' : '#18212C') : (id === 'jp' ? '#F3E6D4' : id === 'kr' ? '#F4F7F2' : id === 'tw' ? '#E5F3EF' : '#F4F8FC');
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
      theme.innerHTML = `<div class="card"><b>主題風格</b><p class="mut">自動會依行程目的地換成日本、韓國或台灣的紙感背景。每份行程也可以自己改，隨時能回到系統預設。</p><div class="row" style="margin-top:8px">${STYLES.map(([k, lab]) => `<button type="button" class="chip${k === cur ? ' on' : ''}" onclick="Journey.setGlobalStyle('${k}')">${lab}</button>`).join('')}</div></div>`;
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
  const LOCK_ART = '<span class="ach-art" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="28" r="10"/><path d="M12 54c4-12 12-16 20-16s16 4 20 16"/></svg></span>';
  function achButton(card, earned) {
    const on = +earned[card.id] > 1e11;
    const cls = 'ach' + (card.city ? ' city-' + card.city : '') + (on ? '' : ' ach-lock');
    if (!on) return `<div class="${cls}">${`<button type="button" class="ach-hit" onclick="Journey.peek('${card.id}')">${LOCK_ART}<b>尚未收集</b><small>${esc(card.hint)}</small></button><button type="button" class="ach-q" aria-label="如何完成：${esc(card.title)}" onclick="Journey.howTo('${card.id}')">?</button>`}</div>`;
    return `<button type="button" class="${cls}" onclick="Journey.peek('${card.id}')"><span class="ach-art" aria-hidden="true">${card.art}</span><b>${esc(card.title)}</b><small>${esc(ymd(earned[card.id]))}</small></button>`;
  }
  function achMarkup(id, earned) {
    const card = cardById(id);
    return card ? achButton(card, earned || {}) : '';
  }
  function howTo(id) {
    const card = cardById(id);
    if (!card) return '';
    if (typeof document === 'undefined') return card.hint;
    const layer = layerEl();
    layer.innerHTML = `<div class="achpage"><button type="button" class="btn ghost sm" onclick="Journey.openAchieve()">返回收藏</button><article class="howto"><p class="howto-k">如何完成</p><h2>${esc(card.title)}</h2><p>${esc(card.hint)}</p></article></div>`;
    layer.hidden = false;
    return card.hint;
  }
  const GEO = {
    tyo: [35.6812, 139.7671], osa: [34.6937, 135.5023], kyo: [35.0116, 135.7681],
    spk: [43.0642, 141.3469], oka: [26.2124, 127.6809], fuk: [33.5904, 130.4017],
    sel: [37.5665, 126.9780], pus: [35.1796, 129.0756], cju: [33.4996, 126.5312],
    tpe: [25.0330, 121.5654], txg: [24.1477, 120.6736], tnn: [22.9999, 120.2270],
    khh: [22.6273, 120.3014], hul: [23.9872, 121.6015], ttt: [22.7583, 121.1444],
    cyi: [23.4801, 120.4491], ktn: [21.9466, 120.7987], yil: [24.7021, 121.7377],
    nto: [23.9609, 120.9719], kmn: [24.449, 118.376], mzu: [26.160, 119.950],
    lud: [22.661, 121.493], lny: [22.047, 121.549]
  };
  const VIEWS = {
    jp: [[24.20, 122.90], [45.70, 145.90]],
    tw: [[21.55, 119.25], [25.55, 122.15]],
    kr: [[33.00, 125.05], [38.85, 129.70]]
  };
  const MAP_LABEL = { jp: '日本', kr: '韓國', tw: '台灣' };
  function mapPins(countryId, places) {
    if (!VIEWS[countryId]) return [];
    const byId = {};
    (places || []).forEach(p => { if (p) byId[p.id] = p; });
    return CITIES.filter(c => c.country === countryId && GEO[c.id]).map(c => {
      const hit = byId[c.id];
      return { id: c.id, name: c.name, lat: GEO[c.id][0], lng: GEO[c.id][1], on: !!(hit && hit.on), color: c.color };
    });
  }
  function mixHex(hex, toward, t) {
    const pick = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const a = pick(hex), b = pick(toward);
    return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function visitMapMarkup(countryId, places) {
    const pack = (typeof globalThis !== 'undefined' && globalThis.VISIT_GEO) ? globalThis.VISIT_GEO[countryId] : null;
    if (!pack) return '';
    const on = {};
    (places || []).forEach(p => { if (p && p.on) on[p.id] = true; });
    const sea = `<rect class="sea" width="100%" height="100%" fill="${pack.sea}"/>`;
    const parts = pack.parts.map(p => {
      const tracked = !!p.id;
      const lit = tracked && !!on[p.id];
      const fill = lit ? p.color : mixHex(p.color, '#F7F9FC', tracked ? 0.72 : 0.34);
      const cls = 'vreg' + (lit ? ' on' : '') + (tracked ? '' : ' quiet');
      const idAttr = tracked ? ` data-id="${p.id}"` : '';
      const click = tracked ? ` onclick="Journey.openCityMap('${p.id}')"` : '';
      return `<path class="${cls}"${idAttr} fill="${fill}" d="${p.d}"${click}/>`;
    }).join('');
    const labels = labelChips(pack.labels, on, true, pack.view);
    return `<svg class="vmap" viewBox="${pack.view}" role="img" aria-label="${MAP_LABEL[countryId]}地圖">${sea}${parts}${labels}</svg>`;
  }
  function parseView(view) {
    const p = String(view || '').trim().split(/[\s,]+/).map(Number);
    if (p.length < 4 || p.some(n => !Number.isFinite(n))) return null;
    return { x: p[0], y: p[1], w: p[2], h: p[3] };
  }
  function boxesHit(a, b, pad) {
    const g = pad || 0;
    return a.x < b.x + b.w + g && a.x + a.w + g > b.x && a.y < b.y + b.h + g && a.y + a.h + g > b.y;
  }
  function insideView(box, view, margin) {
    if (!view) return true;
    const m = margin == null ? 2 : margin;
    return box.x >= view.x + m && box.y >= view.y + m && box.x + box.w <= view.x + view.w - m && box.y + box.h <= view.y + view.h - m;
  }
  function labelChips(labels, on, clickable, view) {
    const vb = parseView(view);
    const placed = [];
    const nudges = [[0, 0], [0, -26], [0, 26], [-36, 0], [36, 0], [0, -48], [0, 48], [-36, -26], [36, -26], [-36, 26], [36, 26], [-64, 0], [64, 0]];
    return (labels || []).map(l => {
      const name = String(l.name || '');
      if (!name || !(l.id && on && on[l.id])) return '';
      const n = Array.from(name).length;
      const fs = 15;
      const w = n * fs * 0.96 + 12;
      const h = fs + 8;
      let spot = null;
      for (let i = 0; i < nudges.length; i++) {
        const cx = l.x + nudges[i][0];
        const cy = l.y + nudges[i][1];
        const box = { x: cx - w / 2, y: cy - fs * 0.86, w: w, h: h };
        if (!insideView(box, vb, 1)) continue;
        if (placed.some(p => boxesHit(p, box, 4))) continue;
        spot = { cx: cx, cy: cy, box: box };
        break;
      }
      if (!spot) return '';
      placed.push(spot.box);
      const go = clickable && /^[a-z]+$/.test(l.id) ? ` data-id="${l.id}" onclick="Journey.openCityMap('${l.id}')"` : '';
      const x = Math.round(spot.box.x * 10) / 10;
      const y = Math.round(spot.box.y * 10) / 10;
      return `<g class="rlab on"${go}><rect x="${x}" y="${y}" width="${w.toFixed(1)}" height="${h}" rx="7" fill="#fff" fill-opacity="0.97"/><text x="${spot.cx}" y="${spot.cy}" text-anchor="middle" fill="#102033" font-size="${fs}" font-weight="900">${esc(name)}</text></g>`;
    }).join('');
  }
  function projectPt(proj, lat, lng) {
    const yN = Math.log(Math.tan(Math.PI / 4 + proj.n * Math.PI / 360));
    const yS = Math.log(Math.tan(Math.PI / 4 + proj.s * Math.PI / 360));
    const y = Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
    return [
      proj.x + (lng - proj.w) / (proj.e - proj.w) * proj.bw,
      proj.y + (yN - y) / (yN - yS) * proj.bh
    ];
  }
  function pinMarkup(proj, spots, view) {
    if (!proj) return '';
    const vb = parseView(view);
    const items = [];
    (spots || []).forEach((s, idx) => {
      const lat = +s.lat, lng = +s.lng;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const pt = projectPt(proj, lat, lng);
      if (!Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) return;
      items.push({ name: String(s.name || '').trim(), x: pt[0], y: pt[1], i: idx });
    });
    items.sort((a, b) => a.x - b.x || a.y - b.y);
    const placed = items.map(s => ({ x: s.x - 11, y: s.y - 11, w: 22, h: 22 }));
    const fs = 12;
    const slots = [[12, 4, 'start'], [-14, 4, 'end'], [0, -28, 'middle'], [0, 22, 'middle'], [18, -16, 'start'], [-18, -16, 'end'], [18, 16, 'start'], [-18, 16, 'end'], [0, -42, 'middle'], [36, 4, 'start'], [-36, 4, 'end']];
    return items.map((s, order) => {
      const chars = Array.from(s.name);
      const candidates = chars.length > 8 ? [s.name, chars.slice(0, 6).join('') + '…'] : [s.name];
      let chosen = null;
      let label = '';
      for (let c = 0; c < candidates.length && !chosen; c++) {
        label = candidates[c];
        if (!label) continue;
        const n = Array.from(label).length;
        const w = n * fs * 1.05 + 6;
        const h = fs + 8;
        for (let i = 0; i < slots.length; i++) {
          const anchor = slots[i][2];
          const tx = s.x + slots[i][0];
          const ty = s.y + slots[i][1];
          let left = tx;
          if (anchor === 'middle') left = tx - w / 2;
          else if (anchor === 'end') left = tx - w;
          const box = { x: left, y: ty - fs * 0.86, w: w, h: h };
          if (!insideView(box, vb, 1)) continue;
          if (placed.some(p => boxesHit(p, box, 3))) continue;
          chosen = { tx: tx, ty: ty, anchor: anchor, box: box };
          break;
        }
      }
      let text = '';
      if (chosen && label) {
        placed.push(chosen.box);
        text = `<text class="spotpin-lab" x="${chosen.tx.toFixed(1)}" y="${chosen.ty.toFixed(1)}" text-anchor="${chosen.anchor}" fill="#142033" font-size="${fs}" font-weight="800" stroke="#fff" stroke-width="3" paint-order="stroke fill">${esc(label)}</text>`;
      }
      const n = s.i + 1;
      const cx = s.x.toFixed(1);
      const cy = s.y.toFixed(1);
      return `<g class="spotpin" data-i="${s.i}" data-n="${n}" data-x="${cx}" data-y="${cy}" style="--i:${order}" tabindex="0" role="button" aria-label="${esc(s.name)}"><circle class="spotpin-dot" cx="${cx}" cy="${cy}" r="6.5" fill="#E53935" stroke="#fff" stroke-width="2"/><circle class="spotpin-face" cx="${cx}" cy="${cy}" r="4.6" fill="#fff"/><circle class="spotpin-ring" cx="${cx}" cy="${cy}" r="11" fill="none" stroke="#102033" stroke-width="2.4"/><circle class="spotpin-hit" cx="${cx}" cy="${cy}" r="16" fill="transparent"/>${text}<text class="spotpin-num" x="${cx}" y="${(s.y + 2.6).toFixed(1)}" text-anchor="middle" fill="#9f1239" font-size="8" font-weight="800">${n}</text></g>`;
    }).join('');
  }
  function citySpots(cityId) {
    const city = CITIES.find(c => c.id === cityId);
    if (!city) return [];
    const out = [];
    const seen = new Set();
    tripsNow().forEach(trip => {
      if (!trip || !citiesTouched(trip).has(cityId)) return;
      (trip.days || []).forEach(day => (day || []).forEach(s => {
        if (!s || isHop(s)) return;
        const sid = spotCity(s);
        if (sid && sid !== cityId) return;
        const lat = +s.lat, lng = +s.lng;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        if (sid !== cityId && !inBox(lat, lng, city.box)) return;
        const key = String(s.name || '') + '@' + lat.toFixed(3) + ',' + lng.toFixed(3);
        if (seen.has(key)) return;
        seen.add(key);
        out.push({
          name: String(s.name || city.name), lat, lng,
          summary: String(s.summary || ''), note: String(s.note || ''),
          rating: String(s.rating || ''), area: String(s.area || ''), zh: String(s.zh || ''),
          icon: String(s.icon || ''), ptype: String(s.ptype || ''), meal: String(s.meal || ''),
          addr: String(s.addr || s.address || '')
        });
      }));
    });
    return out.slice(0, 20);
  }
  function cityMapMarkup(cityId, spots) {
    const geo = typeof globalThis !== 'undefined' ? globalThis.VISIT_GEO : null;
    if (!geo) return '';
    const city = CITIES.find(c => c.id === cityId);
    const pack = (geo.detail && geo.detail[cityId]) || (cityId === 'tyo' ? geo.tyo23 : null);
    if (pack && pack.parts) {
      const sea = `<rect class="sea" width="100%" height="100%" fill="${pack.sea}"/>`;
      const parts = pack.parts.map(p => `<path class="vreg quiet" fill="${p.color}" d="${p.d}"/>`).join('');
      const title = cityId === 'tyo' ? '東京分區地圖' : (city ? city.name : '') + '分區地圖';
      return `<svg class="vmap vmap-detail" viewBox="${pack.view}" role="img" aria-label="${esc(title)}">${sea}${parts}${pinMarkup(pack.proj, spots, pack.view)}</svg>`;
    }
    if (!city) return '';
    const countryPack = geo[city.country];
    const frame = countryPack && countryPack.frames && countryPack.frames[cityId];
    if (countryPack && countryPack.proj && frame) {
      const pad = 26;
      const vb = [frame[0] - pad, frame[1] - pad, frame[2] - frame[0] + pad * 2, frame[3] - frame[1] + pad * 2];
      const sea = `<rect class="sea" x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="${countryPack.sea}"/>`;
      const parts = countryPack.parts.map(p => `<path class="vreg quiet" fill="${p.id === cityId ? p.color : mixHex(p.color, '#F7F9FC', 0.5)}" d="${p.d}"/>`).join('');
      const vbStr = vb.map(n => Math.round(n * 10) / 10).join(' ');
      return `<svg class="vmap vmap-detail" viewBox="${vbStr}" role="img" aria-label="${esc(city.name)}地圖">${sea}${parts}${pinMarkup(countryPack.proj, spots, vbStr)}</svg>`;
    }
    const box = city.box;
    const proj = { s: box[0] - 0.08, w: box[1] - 0.08, n: box[2] + 0.08, e: box[3] + 0.08, x: 28, y: 36, bw: 284, bh: 320 };
    return `<svg class="vmap vmap-detail" viewBox="0 0 340 380" role="img" aria-label="${esc(city.name)}地圖"><rect width="100%" height="100%" fill="#E7F4FB"/>${pinMarkup(proj, spots, '0 0 340 380')}</svg>`;
  }
  function loreApi() { return typeof globalThis !== 'undefined' ? globalThis.SpotLore : null; }
  function spotStory(spot) {
    const api = loreApi();
    if (api) return api.story(spot || {});
    return { name: String(spot && spot.name || '景點'), intro: '', trivia: [], rating: '', label: '簡介', address: '', food: false, empty: '這站還沒有收進小檔案。' };
  }
  function spotCardHtml(st) {
    const api = loreApi();
    const html = api && typeof api.cardHtml === 'function' ? api.cardHtml(st) : '';
    if (html) return html;
    const story = st || { name: '景點', intro: '', trivia: [], label: '簡介' };
    const name = esc(story.name || '景點');
    const label = esc(story.label || '簡介');
    const body = esc(story.intro || story.empty || '這站還沒有收進小檔案。');
    const trivia = (story.trivia || []).filter(Boolean).map(esc).join('<br>');
    const bits = ['<button type="button" class="spotcard-x" aria-label="關閉" onclick="Journey.clearSpot()">×</button>', '<b class="spotcard-name">' + name + '</b>', '<p class="spotcard-k">' + label + '</p><p>' + body + '</p>'];
    if (story.address) bits.push('<p class="spotcard-k addr">地址</p><p>' + esc(story.address) + '</p>');
    if (trivia) bits.push('<p class="spotcard-k trivia">冷知識</p><p>' + trivia + '</p>');
    return '<aside class="spotcard" role="dialog" aria-label="' + name + '">' + bits.join('') + '</aside>';
  }
  function nearestPin(points, x, y, radius) {
    let best = null, bestD = radius == null ? 26 : radius;
    (points || []).forEach(p => {
      if (!p || !Number.isFinite(+p.x) || !Number.isFinite(+p.y)) return;
      const d = Math.hypot(+p.x - x, +p.y - y);
      if (d <= bestD + 0.001) { bestD = d; best = p; }
    });
    return best;
  }
  function focusView(pin, vb, box, scale, anchor) {
    const api = loreApi();
    if (api && typeof api.focusView === 'function') {
      try { return api.focusView(pin, vb, box, scale, anchor); } catch (e) {}
    }
    const s = scale > 0 ? scale : 1;
    const px = (pin.x - vb.x) / vb.w * box.w;
    const py = (pin.y - vb.y) / vb.h * box.h;
    const ax = (anchor && anchor.x != null ? anchor.x : 0.34) * box.w;
    const ay = (anchor && anchor.y != null ? anchor.y : 0.46) * box.h;
    return { s: s, x: ax - px * s, y: ay - py * s };
  }
  function clampMapView(view, w, h) {
    const api = loreApi();
    if (api && typeof api.clampMapView === 'function') {
      try { return api.clampMapView(view, w, h); } catch (e) {}
    }
    const s = Math.min(3.6, Math.max(1, view && view.s || 1));
    const x0 = view && view.x || 0, y0 = view && view.y || 0;
    if (!w || !h) return { s: s, x: x0, y: y0 };
    return {
      s: s,
      x: Math.min(0, Math.max(Math.min(0, w - w * s), x0)),
      y: Math.min(0, Math.max(Math.min(0, h - h * s), y0))
    };
  }
  function placeCard(pin, stage, card) {
    const api = loreApi();
    if (api && typeof api.placeCard === 'function') {
      try { return api.placeCard(pin, stage, card); } catch (e) {}
    }
    const m = 8, topMin = 46;
    const left = Math.max(m, Math.min(pin.x + 28, Math.max(m, stage.w - card.w - m)));
    const top = Math.max(topMin, Math.min(pin.y + 16, Math.max(topMin, stage.h - card.h - m)));
    return { left: Math.round(left), top: Math.round(top) };
  }
  function focusAnchor(w) {
    const api = loreApi();
    return api ? api.focusAnchor(w) : { x: 0.34, y: 0.48 };
  }
  function mapStage(kind, cityId, svg) {
    if (!svg) return '';
    const city = cityId ? ` data-city="${cityId}"` : '';
    return `<div class="vmap-stage" data-kind="${kind}"${city}><div class="vmap-tools"><button type="button" onclick="Journey.zoomMap(1)" aria-label="放大">＋</button><button type="button" onclick="Journey.zoomMap(-1)" aria-label="縮小">－</button><button type="button" class="vmap-fit" onclick="Journey.resetMap()">全圖</button></div>${svg}</div>`;
  }
  function activeStage() { return document.querySelector('#jlayer .vmap-stage'); }
  function applyMap(stage) {
    const svg = stage.querySelector('svg.vmap');
    if (!svg) return;
    const box = { w: svg.clientWidth, h: svg.clientHeight };
    stage._view = clampMapView(stage._view || { s: 1, x: 0, y: 0 }, box.w, box.h);
    const view = stage._view;
    svg.style.transform = 'translate(' + view.x.toFixed(2) + 'px,' + view.y.toFixed(2) + 'px) scale(' + view.s.toFixed(4) + ')';
  }
  function pinPoint(stage, pin) {
    const svg = stage.querySelector('svg.vmap');
    const vb = parseView(svg.getAttribute('viewBox'));
    const box = { w: svg.clientWidth, h: svg.clientHeight };
    const view = stage._view || { s: 1, x: 0, y: 0 };
    if (!vb || !box.w || !box.h) return null;
    const px = (+pin.getAttribute('data-x') - vb.x) / vb.w * box.w;
    const py = (+pin.getAttribute('data-y') - vb.y) / vb.h * box.h;
    return { x: view.x + px * view.s, y: view.y + py * view.s };
  }
  function moveCard(stage) {
    const card = stage.querySelector('.spotcard');
    const pin = stage.querySelector('.spotpin.is-on');
    if (!card || !pin) return;
    const room = Math.max(112, (stage.clientHeight || 0) - 58);
    card.style.maxHeight = room + 'px';
    const pt = pinPoint(stage, pin);
    if (!pt) {
      card.style.left = '8px';
      card.style.top = '48px';
      return;
    }
    const pos = placeCard(pt, { w: stage.clientWidth, h: stage.clientHeight }, { w: card.offsetWidth || 180, h: card.offsetHeight || 120 });
    card.style.left = pos.left + 'px';
    card.style.top = pos.top + 'px';
    const box = stage.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    if (rect.width < 8 || rect.bottom < box.top + 24 || rect.top > box.bottom - 24) {
      card.style.left = '8px';
      card.style.top = '48px';
    }
  }
  function aimedPin(target) {
    if (!target || !target.closest) return null;
    if (target.closest('.spotpin-hit')) return null;
    const mark = target.closest('.spotpin-lab, .spotpin-dot, .spotpin-num, .spotpin-ring');
    return mark ? mark.closest('.spotpin') : null;
  }
  function pinFromTap(stage, clientX, clientY, aimed) {
    if (aimed && stage.contains(aimed)) return aimed;
    const origin = stage.getBoundingClientRect();
    const points = [...stage.querySelectorAll('.spotpin')].map(pin => {
      const pt = pinPoint(stage, pin);
      return pt ? { el: pin, x: pt.x, y: pt.y } : null;
    }).filter(Boolean);
    const hit = nearestPin(points, clientX - origin.left, clientY - origin.top, 26);
    return hit ? hit.el : null;
  }
  function ensurePinLabel(pin) {
    if (!pin || pin.querySelector('.spotpin-lab')) return;
    const name = pin.getAttribute('aria-label') || '';
    if (!name) return;
    const chars = Array.from(name);
    const label = chars.length > 8 ? chars.slice(0, 7).join('') + '…' : name;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'spotpin-lab is-added');
    text.setAttribute('x', pin.getAttribute('data-x'));
    text.setAttribute('y', ((+pin.getAttribute('data-y') || 0) - 18).toFixed(1));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#102033');
    text.setAttribute('font-size', '13');
    text.setAttribute('font-weight', '900');
    text.setAttribute('stroke', '#fff');
    text.setAttribute('stroke-width', '4');
    text.setAttribute('paint-order', 'stroke');
    text.textContent = label;
    pin.appendChild(text);
  }
  function showSpotCard(stage, spot) {
    const html = spotCardHtml(spotStory(spot));
    if (!html) return;
    const prev = stage.querySelector('.spotcard');
    if (prev) prev.outerHTML = html;
    else stage.insertAdjacentHTML('beforeend', html);
    moveCard(stage);
  }
  function focusSpot(i) {
    if (typeof document === 'undefined') return;
    const layer = document.querySelector('#jlayer');
    const stage = layer && layer.querySelector('.vmap-stage');
    if (!stage || stage.dataset.kind !== 'city') return;
    const spot = (layer._spots || [])[+i];
    const svg = stage.querySelector('svg.vmap');
    const pin = svg && svg.querySelector('.spotpin[data-i="' + (+i) + '"]');
    if (!spot || !pin) return;
    layer._focus = +i;
    svg.querySelectorAll('.spotpin').forEach(el => {
      const on = el.getAttribute('data-i') === String(+i);
      el.classList.toggle('is-on', on);
      if (on) el.setAttribute('aria-pressed', 'true');
      else el.removeAttribute('aria-pressed');
    });
    stage.classList.add('is-focus');
    if (pin.parentNode) pin.parentNode.appendChild(pin);
    ensurePinLabel(pin);
    layer.querySelectorAll('.vlist .vtrip').forEach((el, n) => el.classList.toggle('on', n === +i));
    const row = layer.querySelectorAll('.vlist .vtrip')[+i];
    if (row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
    const run = () => {
      const vb = parseView(svg.getAttribute('viewBox'));
      const box = { w: svg.clientWidth, h: svg.clientHeight };
      if (!vb || !box.w || !box.h) return false;
      const raw = focusView(
        { x: +pin.getAttribute('data-x'), y: +pin.getAttribute('data-y') },
        vb, box, 1.9, focusAnchor(stage.clientWidth)
      );
      stage._view = clampMapView(raw, box.w, box.h);
      applyMap(stage);
      showSpotCard(stage, spot);
      return true;
    };
    if (!run()) requestAnimationFrame(() => { if (!run()) requestAnimationFrame(run); });
    if (stage.scrollIntoView) stage.scrollIntoView({ block: 'nearest' });
  }
  function clearSpot() {
    if (typeof document === 'undefined') return;
    const layer = document.querySelector('#jlayer');
    const stage = layer && layer.querySelector('.vmap-stage');
    if (!layer || !stage) return;
    layer._focus = -1;
    stage.classList.remove('is-focus');
    stage.querySelectorAll('.spotpin').forEach(el => { el.classList.remove('is-on'); el.removeAttribute('aria-pressed'); });
    layer.querySelectorAll('.vlist .vtrip.on').forEach(el => el.classList.remove('on'));
    const card = stage.querySelector('.spotcard');
    if (card) card.remove();
    const svg = stage.querySelector('svg.vmap');
    const box = svg ? { w: svg.clientWidth, h: svg.clientHeight } : { w: stage.clientWidth, h: stage.clientHeight };
    stage._view = clampMapView({ s: 1, x: 0, y: 0 }, box.w, box.h);
    applyMap(stage);
  }
  function resetMap() {
    if (typeof document === 'undefined') return;
    const stage = activeStage();
    if (!stage) return;
    if (stage.classList.contains('is-focus')) { clearSpot(); return; }
    stage._view = { s: 1, x: 0, y: 0 };
    applyMap(stage);
  }
  function zoomMap(dir) {
    if (typeof document === 'undefined') return;
    const stage = activeStage();
    const svg = stage && stage.querySelector('svg.vmap');
    if (!svg) return;
    const box = { w: svg.clientWidth, h: svg.clientHeight };
    const view = stage._view || { s: 1, x: 0, y: 0 };
    const next = dir > 0 ? view.s * 1.25 : view.s / 1.25;
    const cx = box.w / 2, cy = box.h / 2, k = next / view.s;
    stage._view = clampMapView({ s: next, x: cx - (cx - view.x) * k, y: cy - (cy - view.y) * k }, box.w, box.h);
    applyMap(stage);
    moveCard(stage);
  }
  function bindVisit(layer) {
    const stage = layer.querySelector('.vmap-stage');
    if (!stage || stage._bound) return;
    stage._bound = true;
    stage._view = { s: 1, x: 0, y: 0 };
    const pointers = new Map();
    let drag = null;
    let pinch = null;
    stage.addEventListener('wheel', e => {
      if (e.target.closest && e.target.closest('.spotcard')) return;
      e.preventDefault();
      const svg = stage.querySelector('svg.vmap');
      if (!svg) return;
      const sr = stage.getBoundingClientRect();
      const mx = e.clientX - sr.left, my = e.clientY - sr.top;
      const view = stage._view || { s: 1, x: 0, y: 0 };
      const next = view.s * (e.deltaY < 0 ? 1.12 : 1 / 1.12);
      const k = next / view.s;
      const box = { w: svg.clientWidth, h: svg.clientHeight };
      stage._view = clampMapView({ s: next, x: mx - (mx - view.x) * k, y: my - (my - view.y) * k }, box.w, box.h);
      applyMap(stage);
      moveCard(stage);
    }, { passive: false });
    const TAP = 18;
    const capture = id => { try { stage.setPointerCapture(id); } catch (err) {} };
    stage.addEventListener('pointerdown', e => {
      if (e.button > 0) return;
      if (e.target.closest && e.target.closest('.spotcard, .vmap-tools')) return;
      stage._swallow = false;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const view = stage._view || { s: 1, x: 0, y: 0 };
      if (pointers.size === 1) {
        const aimed = aimedPin(e.target);
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, s: view.s, moved: 0, pinch: false, pin: aimed && stage.contains(aimed) ? aimed : null };
      } else if (pointers.size === 2) {
        const pts = [...pointers.values()];
        pinch = { dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1, s: view.s, x: view.x, y: view.y };
        if (drag) drag.pinch = true;
        pointers.forEach((_, id) => capture(id));
        stage.classList.add('is-drag');
      }
    });
    stage.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const svg = stage.querySelector('svg.vmap');
      const box = svg ? { w: svg.clientWidth, h: svg.clientHeight } : { w: 0, h: 0 };
      if (pointers.size >= 2 && pinch) {
        const pts = [...pointers.values()];
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        const sr = stage.getBoundingClientRect();
        const mx = (pts[0].x + pts[1].x) / 2 - sr.left;
        const my = (pts[0].y + pts[1].y) / 2 - sr.top;
        const next = pinch.s * (d / pinch.dist);
        const k = next / pinch.s;
        stage._view = clampMapView({ s: next, x: mx - (mx - pinch.x) * k, y: my - (my - pinch.y) * k }, box.w, box.h);
        applyMap(stage);
        moveCard(stage);
        return;
      }
      if (!drag || drag.pinch || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      if (drag.moved < TAP) return;
      if (!stage.classList.contains('is-drag')) {
        capture(drag.id);
        stage.classList.add('is-drag');
      }
      stage._view = clampMapView({ s: drag.s, x: drag.vx + dx, y: drag.vy + dy }, box.w, box.h);
      applyMap(stage);
      moveCard(stage);
    });
    const endPointer = (e, cancelled) => {
      const info = drag && drag.id === e.pointerId ? drag : null;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (info && info.pinch) info.pinch = pointers.size >= 2;
      if (pointers.size > 0) return;
      stage.classList.remove('is-drag');
      drag = null;
      if (cancelled || !info || info.pinch) return;
      if (info.moved >= TAP) { stage._swallow = true; return; }
      stage._swallow = true;
      if (stage.dataset.kind !== 'city') {
        const el = document.elementFromPoint(info.x, info.y);
        const hit = el && el.closest && el.closest('.vreg[data-id], .rlab[data-id]');
        if (hit && stage.contains(hit)) openCityMap(hit.getAttribute('data-id'));
        return;
      }
      const pin = pinFromTap(stage, info.x, info.y, info.pin);
      const el = document.elementFromPoint(info.x, info.y);
      const ui = el && el.closest && el.closest('.spotcard, .vmap-tools');
      if (pin) focusSpot(+pin.getAttribute('data-i'));
      else if (!ui && stage.classList.contains('is-focus')) clearSpot();
    };
    stage.addEventListener('pointerup', e => endPointer(e, false));
    stage.addEventListener('pointercancel', e => endPointer(e, true));
    stage.addEventListener('click', e => {
      if (stage._swallow) { stage._swallow = false; e.preventDefault(); e.stopPropagation(); return; }
      if (stage.dataset.kind !== 'city') return;
      const pin = pinFromTap(stage, e.clientX, e.clientY, aimedPin(e.target));
      if (pin) { e.preventDefault(); e.stopPropagation(); focusSpot(+pin.getAttribute('data-i')); }
    }, true);
    stage.addEventListener('keydown', e => {
      const pin = e.target.closest && e.target.closest('.spotpin');
      if (!pin) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusSpot(+pin.getAttribute('data-i')); }
    });
    if (layer._key) document.removeEventListener('keydown', layer._key);
    layer._key = e => { if (e.key === 'Escape' && layer.querySelector('.spotcard')) clearSpot(); };
    document.addEventListener('keydown', layer._key);
  }
  function openCityMap(id) {
    if (!/^[a-z0-9]+$/.test(String(id || ''))) return;
    const places = visitedPlaces(tripsNow());
    const city = places.find(p => p.id === id);
    if (!city || !city.on) { focusVisit(id); return; }
    const spots = citySpots(id);
    if (typeof document === 'undefined') return spots;
    const rows = spots.length
      ? spots.map((s, i) => `<button type="button" class="vtrip" onclick="Journey.focusSpot(${i})"><b><span class="vno">${i + 1}</span>${esc(s.name)}</b></button>`).join('')
      : '<div class="vempty"><b>這座城市還沒有帶座標的景點</b><p>行程裡的景點若有位置，會標在地圖上。</p></div>';
    const hint = '點景點會放大，旁邊有簡介和冷知識。點空白或關閉就回到城市全圖。';
    const layer = layerEl();
    layer.innerHTML = `<div class="achpage vmap-page"><div class="row" style="align-items:center"><button type="button" class="btn ghost sm" style="flex:0" onclick="Journey.openVisitMap('${city.country}')">返回</button><h2 style="margin:0">${esc(city.name)}</h2></div><p class="mut achhint">${hint}</p><div class="vmap-layout"><div class="vmap-card">${mapStage('city', id, cityMapMarkup(id, spots))}</div><div class="vlist"><div class="cityhead"><h3>景點</h3><span>${spots.length}</span></div>${rows}</div></div></div>`;
    layer._spots = spots;
    layer._focus = -1;
    layer.hidden = false;
    bindVisit(layer);
    return spots;
  }
  function visitListHtml(places) {
    const on = (places || []).filter(p => p.on);
    if (!on.length) return '<div class="vempty"><b>這個地區還沒有點亮的城市</b><p>行程目的地、景點或封存的行程對得上城市時，地圖會亮起來。</p></div>';
    return on.map(p => {
      const rows = p.trips.slice(0, 4).map(t => {
        const when = [t.dep, t.ret].filter(Boolean).join(' – ');
        const idOk = /^[A-Za-z0-9_-]+$/.test(t.id || '');
        const open = idOk ? ` onclick="Journey.openMappedTrip('${t.id}')"` : '';
        const extra = t.dest && t.dest !== p.name ? esc(t.dest) : '';
        const bits = [extra, t.archived ? '已封存' : ''].filter(Boolean).join(' · ');
        return `<button type="button" class="vtrip"${open}><b>${esc(when || p.name)}</b>${bits ? `<small>${bits}</small>` : ''}</button>`;
      }).join('');
      const more = p.trips.length > 4 ? `<p class="mut">還有 ${p.trips.length - 4} 趟</p>` : '';
      return `<section class="vitem" id="v-${p.id}"><i style="background:${p.color}"></i><div><b>${esc(p.name)}</b><span class="mut">${p.trips.length} 趟行程</span>${rows}${more}</div></section>`;
    }).join('');
  }
  function openVisitMap(which) {
    const places = visitedPlaces(tripsNow());
    if (typeof document === 'undefined') return places;
    const count = id => places.filter(p => p.country === id && p.on).length;
    let country = which;
    if (country !== 'jp' && country !== 'kr' && country !== 'tw') {
      const cur = detectCountry(globalThis.TM && TM.T && TM.T());
      const ranked = ['jp', 'tw', 'kr'].slice().sort((a, b) => count(b) - count(a));
      country = (cur && count(cur) ? cur : '') || ranked.find(id => count(id)) || cur || 'jp';
    }
    const mine = places.filter(p => p.country === country);
    const lit = mine.filter(p => p.on).length;
    const tabs = `<div class="seg achtabs">${COUNTRIES.map(c => `<button type="button" class="${c.id === country ? 'on' : ''}" onclick="Journey.openVisitMap('${c.id}')">${c.name}${count(c.id) ? ' ' + count(c.id) : ''}</button>`).join('')}</div>`;
    const layer = layerEl();
    layer.innerHTML = `<div class="achpage vmap-page"><div class="row" style="align-items:center"><h2 style="margin:0">去過的地方</h2><button type="button" class="btn ghost sm" style="flex:0" onclick="Journey.closeLayer()">關閉</button></div><p class="mut achhint">有寫進行程的城市會亮起來，也只標那些地名。點亮的城市可以再點開。地圖可以縮放、平移。</p>${tabs}<div class="vmap-layout"><div class="vmap-card">${mapStage('country', '', visitMapMarkup(country, mine))}</div><div class="vlist"><div class="cityhead"><h3>去過</h3><span>${lit}/${mine.length}</span></div>${visitListHtml(mine)}</div></div></div>`;
    layer._spots = [];
    layer._focus = -1;
    layer.hidden = false;
    bindVisit(layer);
    try { if (TM.closeSheet) TM.closeSheet(); } catch (e) {}
    return places;
  }
  function focusVisit(id) {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.vitem').forEach(el => el.classList.toggle('hot', el.id === 'v-' + id));
    const el = document.getElementById('v-' + id);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }
  function openMappedTrip(id) {
    if (!/^[A-Za-z0-9_-]+$/.test(String(id || ''))) return;
    closeLayer();
    if (typeof TM.focus === 'function' && TM.focus(id) && TM.go) TM.go('edit');
  }
  function openAchieve(which) {
    if (which === 'jp' || which === 'kr' || which === 'tw') achCountry = which;
    else if (!which) {
      const id = detectCountry(globalThis.TM && TM.T && TM.T());
      if (id) achCountry = id;
    }
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
  function stopHold() {
    const h = holdTilt;
    if (!h) return;
    if (h.raf) cancelAnimationFrame(h.raf);
    window.removeEventListener('deviceorientation', h.onOri);
    if (h.stage) {
      h.stage.removeEventListener('pointermove', h.onPtr);
      h.stage.removeEventListener('pointerleave', h.onLeave);
      h.stage.removeEventListener('pointercancel', h.onLeave);
    }
    if (h.hold) h.hold.style.transform = '';
    holdTilt = null;
  }
  function armTilt(layer) {
    stopHold();
    if (!layer || reduced() || typeof window === 'undefined') return;
    const hold = layer.querySelector('.sovstage .sov-hold');
    const stage = layer.querySelector('.sovplay');
    if (!hold || !stage) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, base = null, oriLive = false;
    function frame() {
      raf = 0;
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      const rx = Math.max(-16, Math.min(16, cx));
      const ry = Math.max(-14, Math.min(14, cy));
      if (Math.abs(rx) < 0.08 && Math.abs(ry) < 0.08) hold.style.transform = '';
      else hold.style.transform = 'rotateX(' + (-ry).toFixed(2) + 'deg) rotateY(' + rx.toFixed(2) + 'deg) translate3d(' + (rx * 0.45).toFixed(2) + 'px,' + (ry * 0.3).toFixed(2) + 'px,0)';
      if (Math.abs(tx - cx) > 0.06 || Math.abs(ty - cy) > 0.06) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function onPtr(e) {
      if (oriLive) return;
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      tx = ((e.clientX - r.left) / r.width - 0.5) * 28;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 22;
      kick();
    }
    function onLeave() {
      if (oriLive) return;
      tx = 0;
      ty = 0;
      kick();
    }
    function onOri(e) {
      if (e.beta == null || e.gamma == null) return;
      if (!base) { base = { b: e.beta, g: e.gamma }; return; }
      const nx = (e.gamma - base.g) * 0.55;
      const ny = (e.beta - base.b) * 0.34;
      if (!oriLive && Math.abs(nx) + Math.abs(ny) < 0.8) return;
      oriLive = true;
      tx = nx;
      ty = ny;
      kick();
    }
    stage.addEventListener('pointermove', onPtr);
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('pointercancel', onLeave);
    stage.addEventListener('pointerup', onLeave);
    const DOE = window.DeviceOrientationEvent;
    const ask = layer.querySelector('.tiltgo');
    holdTilt = { stage: stage, hold: hold, onPtr: onPtr, onLeave: onLeave, onOri: onOri, get raf() { return raf; }, set raf(v) { raf = v; } };
    if (DOE && typeof DOE.requestPermission === 'function') {
      if (ask) ask.hidden = false;
    } else if (DOE) {
      window.addEventListener('deviceorientation', onOri);
      if (ask) ask.hidden = true;
    } else if (ask) ask.hidden = true;
  }
  function permitTilt(btn) {
    const h = holdTilt;
    const DOE = typeof window !== 'undefined' && window.DeviceOrientationEvent;
    if (!h || !DOE) return;
    function grant() {
      window.addEventListener('deviceorientation', h.onOri);
      if (btn) btn.hidden = true;
    }
    if (typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().then(function (state) {
        if (state === 'granted') grant();
      }).catch(function () {});
      return;
    }
    grant();
  }
  function closeLayer() {
    stopHold();
    const el = document.querySelector('#jlayer');
    if (!el) return;
    if (el._key) { document.removeEventListener('keydown', el._key); el._key = null; }
    el.hidden = true;
  }

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
    const name = found === 'jp' ? '日本' : found === 'kr' ? '韓國' : found === 'tw' ? '台灣' : '還沒對上日本、韓國或台灣';
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
  function closeSheetQuiet() {
    try {
      const sheet = document.querySelector('#sheet');
      if (sheet && sheet.classList.contains('on') && TM.closeSheet) TM.closeSheet();
    } catch (e) {}
  }
  function chipList(title, names) {
    if (!names || !names.length) return '';
    return '<div class="sovsec"><b>' + esc(title) + '</b><div class="sovchips">' + names.map(n => '<span>' + esc(n) + '</span>').join('') + '</div></div>';
  }
  function openKeepsakes() {
    if (typeof document === 'undefined') return;
    stopHold();
    closeSheetQuiet();
    const arch = archivedTrips(tripsNow());
    const diary = diaryNow();
    const wall = arch.length
      ? '<div class="sovwall">' + arch.map(t => souvenirHit(t, diary)).join('') + '</div>'
      : '<div class="card"><b>還沒有收藏</b><p class="mut">走完一段行程後，在行程的 ⋯ 裡封存。它會變成登機證、紀念卡、印章、護符、徽章、木牌或卡包。</p></div>';
    const layer = layerEl();
    layer.innerHTML = '<div class="achpage sovpage"><div class="row" style="align-items:center"><h2 style="margin:0">旅途收藏</h2><button type="button" class="btn ghost sm" style="flex:0" onclick="Journey.closeLayer()">關閉</button></div><p class="mut achhint">封存之後，收成想再打開看看的紀念品。</p>' + wall + '</div>';
    layer.hidden = false;
    watchPoke(layer);
  }
  function openSouvenir(id) {
    if (typeof document === 'undefined') return;
    const sid = safeTid(id);
    const t = tripsNow().find(x => x && x.id === sid);
    if (!t || !t.archived) return;
    closeSheetQuiet();
    const diary = diaryNow();
    const mem = memoryOf(t, diary);
    const layer = layerEl();
    layer.classList.remove('sov-settled');
    layer.classList.add('sov-playing');
    layer.innerHTML = '<div class="achpage sovpage"><button type="button" class="btn ghost sm" onclick="Journey.openKeepsakes()">返回收藏</button><div class="sovstage"><button type="button" class="sovplay" onclick="Journey.replaySouvenir()" aria-label="再看一次這件' + esc(mem.label) + '">' + souvenirMarkup(t, diary, { size: 'lg', cap: false, mem: mem }) + '</button></div><button type="button" class="btn ghost sm tiltgo" hidden onclick="Journey.permitTilt(this)">讓它跟著手機傾斜</button>' + recapMarkup(mem, tallyTrip(t, diary), sid) + '</div>';    layer.hidden = false;
    armTilt(layer);
    playSouvenir(layer.querySelector('.sov'), function () { revealRecap(layer); });
  }
  function setSouvenir(id, kind) {
    const sid = safeTid(id);
    if (!sid || !kindOk(kind)) return;
    const t = tripsNow().find(x => x && x.id === sid);
    if (!t || !t.archived) return;
    t.souvenir = kind;
    t.metaRev = Date.now();
    try { TM.save(); } catch (e) {}
    const shelf = typeof document !== 'undefined' && document.querySelector('.sovshelf');
    if (shelf) {
      const html = shelfHtml(archivedTrips(tripsNow()));
      if (html) shelf.outerHTML = html;
    }
    openSouvenir(sid);
  }
  function setLook(id, look) {
    const sid = safeTid(id);
    const n = +look;
    if (!sid || !(n >= 0 && n <= 4)) return;
    const t = tripsNow().find(x => x && x.id === sid);
    if (!t || !t.archived) return;
    t.sovLook = n | 0;
    t.metaRev = Date.now();
    try { TM.save(); } catch (e) {}
    const shelf = typeof document !== 'undefined' && document.querySelector('.sovshelf');
    if (shelf) {
      const html = shelfHtml(archivedTrips(tripsNow()));
      if (html) shelf.outerHTML = html;
    }
    openSouvenir(sid);
  }
  function openKeptTrip(id) {
    const sid = safeTid(id);
    if (!sid) return;
    closeLayer();
    if (typeof TM.focus === 'function' && TM.focus(sid) && TM.go) {
      try { TM.save(); } catch (e) {}
      TM.go('edit');
    }
  }
  function releaseSouvenir(id) {
    const sid = safeTid(id);
    if (!sid) return;
    if (typeof TM.focus === 'function' && !TM.focus(sid)) return;
    closeLayer();
    unarchive();
  }
  function dropSouvenir(id) {
    const sid = safeTid(id);
    if (!sid || typeof delTrip !== 'function') return;
    delTrip(sid);
    if (!tripsNow().some(t => t && t.id === sid)) closeLayer();
  }
  function askArchive() {
    const t = TM.T();
    if (!t) return;
    if (t.archived) { unarchive(); return; }
    const sum = summarize(t, diaryNow());
    const kind = kindOk(t.souvenir) ? t.souvenir : suggestSouvenir(t, diaryNow());
    document.querySelector('#sheetBody').innerHTML = `<h2>收成紀念品</h2><p>把「${esc(t.dest)}」收成一件${esc(kindLabel(kind))}。封存後只能看，也可以再換成登機證、紀念卡、印章、護符、徽章、木牌或卡包，每一種都有五種呈現。</p><p class="mut">${sum.days} 天 · 去過 ${sum.visited} 個景點 · 美食日記 ${sum.diary} 則 · ${esc(sum.spend)}</p><div class="row"><button type="button" class="btn ghost" onclick="Journey.dismissArchive()">先不要</button><button type="button" class="btn" onclick="Journey.startArchive()">收成紀念品</button></div>`;    TM.openSheet();
  }
  function dismissArchive() { TM.closeSheet(); }
  function startArchive() {
    const t = TM.T();
    if (!t || t.archived) return;
    if (!kindOk(t.souvenir)) t.souvenir = suggestSouvenir(t, diaryNow());
    const label = kindLabel(t.souvenir);
    TM.closeSheet();
    play(t, () => {
      t.archived = true;
      t.archivedAt = Date.now();
      t.archiveAsked = true;
      t.metaRev = Date.now();
      try { TM.save(); } catch (e) {}
      if (TM.getTab && TM.getTab() === 'edit' && TM.go) TM.go('list');
      else if (TM.render) TM.render();
      try { TM.toast('已收成' + label); } catch (e) {}
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
    const diary = diaryNow();
    const preview = Object.assign({}, t, { souvenir: kindOk(t.souvenir) ? t.souvenir : suggestSouvenir(t, diary) });
    const mem = memoryOf(preview, diary);
    let el = document.querySelector('#archveil');
    if (!el) {
      el = document.createElement('div');
      el.id = 'archveil';
      el.className = 'archveil';
      document.body.appendChild(el);
    }
    if (el._t) el._t.forEach(clearTimeout);
    el.className = 'archveil';
    el.hidden = false;
    el.innerHTML = `<div class="archstage"><div class="sov-arrive">${souvenirMarkup(preview, diary, { size: 'lg', cap: false, mem })}</div><div class="archsum in"><p>收成一件${esc(mem.label)}</p><p>${esc(mem.when)}</p></div></div>`;
    watchPoke(el);
    const timers = [];
    el._t = timers;
    const later = (ms, fn) => { timers.push(setTimeout(fn, ms)); };
    if (!reduced()) {
      later(160, () => haptic(18));
      later(1200, () => el.classList.add('leave'));
    }
    later(reduced() ? 700 : 1900, () => { el.hidden = true; el.className = 'archveil'; done(); });
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
      document.querySelector('#sheetBody').innerHTML = `<h2>這趟走完了</h2><p>「${esc(t.dest)}」在 ${esc(t.ret)} 結束了。要收成一件紀念品嗎？之後還是可以打開來看。</p><div class="row"><button type="button" class="btn ghost" onclick="closeSheet()">先不要</button><button type="button" class="btn" onclick="Journey.promptArchive('${esc(curId)}')">收成紀念品</button></div>`;
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
    visitedPlaces, visitBrief, visitMapMarkup, mapPins, cityMapMarkup, citySpots, achMarkup, howTo,
    spotStory, spotCardHtml, focusView, clampMapView, placeCard, focusAnchor, mapStage, nearestPin,
    apply, afterPaint, exportState, importState, setGlobalStyle, globalStyle,
    openAchieve, peek, closeLayer, celebrate, doneCelebrate, openVisitMap, openCityMap, focusVisit, openMappedTrip,
    focusSpot, clearSpot, resetMap, zoomMap,
    themeSheet, setTripStyle, askArchive, dismissArchive, startArchive, unarchive, promptArchive, maybePrompt,
    SOUVENIRS, LOOKS, AIR_ZH, suggestSouvenir, souvenirOf, memoryOf, souvenirMarkup, shelfHtml, motifOf, lookTitle,
    openKeepsakes, openSouvenir, setSouvenir, setLook, openKeptTrip, releaseSouvenir, dropSouvenir, pokeSouvenir, replaySouvenir, recapMarkup, tallyTrip, settleAct, permitTilt
  };
});
