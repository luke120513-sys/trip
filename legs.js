/* 兩點之間怎麼搭：整理 Transitous 的每一段，查不到時用常見機場路線或最近的站。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.Legs = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const TRAD = '东東门門车車龙龍风風国國广廣泽澤驿站浅淺観觀会會発發対對変變桜櫻浜濱麺麵気氣学學体體医醫鉄鐵区區価價画畫図圖関關県縣豊豐湾灣旧舊来來点點塩鹽焼燒寿壽実實宝寶双雙鶏雞緑綠絵繪続續総總声聲礼禮経經縁緣灯燈号號楼樓圧壓処處帰歸帯帶将將状狀浄淨湿濕满滿斎齋静靜亀龜団團読讀証證内內温溫黄黃台臺马馬鸟鳥鱼魚页頁贝貝见見这這个個们們时時后後从從韩韓稲稻売賣黒黑円圓辺邊楽樂条條営營';
  const TO_TRAD = {};
  for (let i = 0; i < TRAD.length; i += 2) TO_TRAD[TRAD[i]] = TRAD[i + 1];

  function trad(s) {
    let o = '';
    for (const c of String(s || '')) o += TO_TRAD[c] || c;
    return o;
  }
  function km(a, b) {
    if (!a || !b) return null;
    const R = 6371, p = Math.PI / 180;
    const dlat = (b.lat - a.lat) * p, dlon = (b.lng - a.lng) * p;
    const s = Math.sin(dlat / 2) ** 2 + Math.cos(a.lat * p) * Math.cos(b.lat * p) * Math.sin(dlon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }
  function walkMin(k) { return Math.max(1, Math.round((+k || 0) / 4.8 * 60)); }
  function near(p, lat, lng, r) { return p && km(p, { lat, lng }) <= r; }
  function minutes(t) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '').trim());
    if (!m) return null;
    const h = +m[1], min = +m[2];
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
  }
  function clash(prev, next, min, stay) {
    const a = minutes(prev), b = minutes(next);
    const travel = +min || 0;
    const hold = Math.max(0, +stay || 0);
    if (a == null || b == null || !(travel > 0 || hold > 0)) return '';
    const gap = b - a;
    const need = travel + hold;
    const shown = travel > 0 ? travel : hold;
    if (gap === 0) return '兩個時間都是 ' + prev + '，這段大約要 ' + shown + ' 分，時間會撞到';
    if (gap < 0) return '下一站的時間比上一站早，這段大約要 ' + shown + ' 分';
    if (gap < need) {
      if (hold > 0 && travel > 0 && gap >= travel) return '上一站大約要待 ' + hold + ' 分，再加上交通 ' + travel + ' 分，可能趕不上';
      if (hold > 0 && travel > 0) return '兩個時間只隔 ' + gap + ' 分，待 ' + hold + ' 分再搭 ' + travel + ' 分，可能趕不上';
      return '兩個時間只隔 ' + gap + ' 分，這段大約要 ' + shown + ' 分，可能趕不上';
    }
    return '';
  }
  function hm(total) {
    if (total == null || !Number.isFinite(+total)) return '';
    let m = Math.round(+total);
    m = ((m % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }
  function slotOf(raw, buffer) {
    const buf = buffer == null ? 5 : Math.max(0, +buffer || 0);
    let t = raw + buf;
    const rem = ((t % 5) + 5) % 5;
    if (rem) t += 5 - rem;
    return t;
  }
  function stayMin(spot, cat) {
    spot = spot || {};
    if (spot.stay != null && String(spot.stay) !== '' && Number.isFinite(+spot.stay) && +spot.stay >= 0) return Math.min(720, Math.round(+spot.stay));
    if (spot.kind === 'flight') return 0;
    let c = cat || '';
    if (!c) {
      if (spot.kind === 'hotel') c = 'hotel';
      else if (spot.icon) c = spot.icon;
      else if (spot.ptype === '餐廳' || spot.ptype === '美食') c = 'food';
      else if (spot.ptype === '購物') c = 'shopping';
      else if (spot.ptype === '夜景') c = 'nightlife';
      else if (spot.ptype === '咖啡') c = 'cafe';
      else c = 'sightseeing';
    }
    const note = String(spot.note || '');
    if (c === 'hotel' || spot.kind === 'hotel') return /退房/.test(note) ? 15 : 25;
    if (c === 'food') return 75;
    if (c === 'cafe') return 45;
    if (c === 'shopping') return 45;
    if (c === 'transport') return 0;
    return 60;
  }
  function isFixed(spot, tickets, day) {
    if (!spot) return false;
    if (spot.kind === 'flight') return true;
    return (tickets || []).some(t => {
      if (!t || !String(t.time || '').trim()) return false;
      if (day != null && t.day != null && t.day !== '' && +t.day !== +day) return false;
      return !!(t.spot && spot.name && t.spot === spot.name);
    });
  }
  function suggestMove(prev, next, travel, stay, buffer) {
    const a = minutes(prev);
    if (a == null) return null;
    const arrive = a + Math.max(0, +stay || 0) + Math.max(0, +travel || 0);
    const slot = slotOf(arrive, buffer);
    const b = minutes(next);
    return {
      arrive,
      arriveText: hm(arrive),
      slot,
      slotText: hm(slot),
      conflict: b != null && b < arrive,
      short: b == null ? arrive : arrive - b
    };
  }
  function shiftChain(spots, travelAt, opt) {
    const list = (spots || []).map(s => Object.assign({}, s));
    const buffer = opt && Object.prototype.hasOwnProperty.call(opt, 'buffer') ? opt.buffer : 5;
    const cats = (opt && opt.cats) || [];
    const tickets = (opt && opt.tickets) || [];
    const day = opt && opt.day;
    const start = opt && opt.start > 0 ? opt.start : 1;
    const cascade = !opt || opt.cascade !== false;
    const sameDelta = !opt || opt.sameDelta !== false;
    const changed = [];
    const skipped = [];
    let locked = null;
    for (let j = start; j < list.length; j++) {
      const prev = list[j - 1], cur = list[j];
      if (!prev || !cur) continue;
      const stay = stayMin(prev, cats[j - 1]);
      const rawTravel = typeof travelAt === 'function' ? travelAt(j, prev, cur) : (travelAt && travelAt[j]);
      const travel = Math.max(0, +rawTravel || 0);
      const sug = suggestMove(prev.time, cur.time, travel, stay, buffer);
      if (!sug || !sug.conflict) {
        if (sameDelta || !cascade) break;
        continue;
      }
      if (isFixed(cur, tickets, day)) {
        skipped.push({ index: j, name: cur.name || '', time: cur.time || '' });
        locked = null;
        continue;
      }
      const fromMin = minutes(cur.time);
      if (fromMin == null) continue;
      let target = sug.slot;
      if (sameDelta && locked != null) {
        const same = fromMin + locked;
        if (same >= sug.slot) target = same;
      }
      const delta = target - fromMin;
      if (!(delta > 0)) continue;
      if (locked == null) locked = delta;
      changed.push({ index: j, from: cur.time, to: hm(target), name: cur.name || '' });
      list[j] = Object.assign({}, cur, { time: hm(target) });
      if (!cascade) break;
    }
    return { spots: list, changed, skipped };
  }
  function resolveDay(spots, travelAt, opt) {
    return shiftChain(spots, travelAt, Object.assign({}, opt, { start: 1, cascade: true, sameDelta: false }));
  }
  function pinWarn(dist, nameA, nameB) {
    if (dist == null || dist >= 0.35) return '';
    if (!nameA || !nameB || String(nameA) === String(nameB)) return '';
    const show = dist < 0.1 ? '0.1' : dist.toFixed(1);
    return '直線只有約 ' + show + ' 公里。如果不是隔壁，請確認地圖釘的位置';
  }

  const NAMES = [
    [/成田空港第?\s*2|空港第2ビル|Narita Airport Terminal 2/i, '成田機場第2航廈'],
    [/成田空港第?\s*1|空港第1ビル|Narita Airport Terminal 1/i, '成田機場第1航廈'],
    [/成田空港|成田机场/, '成田機場'],
    [/京成上野|Keisei-?Ueno/i, '京成上野'],
    [/京成高砂|Keisei-?Takasago/i, '京成高砂'],
    [/新御徒町|Shin-?Okachimachi/i, '新御徒町'],
    [/御徒町|Okachimachi/i, '御徒町'],
    [/日暮里|Nippori/i, '日暮里'],
    [/つくば|筑波|Tsukuba/i, '筑波'],
    [/内回り|內回り|Inner Loop/i, '內環'],
    [/外回り|Outer Loop/i, '外環'],
    [/羽田空港第?\s*3|羽田机场第3|Haneda Airport Terminal 3/i, '羽田機場第3航廈'],
    [/羽田空港|羽田机场|Haneda Airport/i, '羽田機場'],
    [/浜松町|濱松町|Hamamatsucho/i, '濱松町'],
    [/品川|Shinagawa/i, '品川'],
    [/新宿|Shinjuku/i, '新宿'],
    [/東京駅|东京站|Tokyo Station/i, '東京'],
    [/関西空港|关西机场|Kansai Airport/i, '關西機場'],
    [/天王寺|Tennoji/i, '天王寺'],
    [/難波|难波|Namba/i, '難波'],
    [/新大阪|Shin-?Osaka/i, '新大阪'],
    [/梅田|Umeda/i, '梅田'],
    [/京都駅|京都站/, '京都'],
    [/桃園機場|桃园机场|Taoyuan Airport/i, '桃園機場'],
    [/台北車站|臺北車站|台北车站|Taipei Main/i, '台北車站'],
    [/浅草|淺草|Asakusa/i, '淺草'],
    [/上野|Ueno/i, '上野'],
    [/押上|Oshiage/i, '押上'],
    [/稲荷町|稻荷町|Inaricho/i, '稻荷町'],
    [/田原町|Tawaramachi/i, '田原町'],
    [/渋谷|澀谷|Shibuya/i, '澀谷'],
    [/池袋|Ikebukuro/i, '池袋'],
    [/西船橋|Nishi-?Funabashi/i, '西船橋'],
    [/三崎口|Misakiguchi/i, '三崎口']
  ];
  const LINES = [
    ['京成スカイライナー', '京成 Skyliner'],
    ['成田エクスプレス', '成田特快'],
    ['スカイアクセス', ' Sky Access '],
    ['つくばエクスプレス', '筑波快線'],
    ['山手線', '山手線'],
    ['東京モノレール', '東京單軌'],
    ['東京メトロ', '東京地鐵'],
    ['都営', '都營'],
    ['銀座線', '銀座線'],
    ['京急', '京急'],
    ['南海', '南海'],
    ['はるか', '遙號'],
    ['ラピート', 'Rapi:t']
  ];

  function stationZh(raw) {
    let s = trad(String(raw || '')).replace(/\s+/g, ' ').trim();
    if (!s || s === 'START' || s === 'END') return '';
    s = s.replace(/[（(][^）)]*[）)]/g, ' ').replace(/\s+/g, ' ').trim();
    for (const [re, to] of NAMES) {
      if (re.test(s)) return to;
    }
    const jp = s.match(/^([\u3040-\u30ff\u4e00-\u9fff々ー]+)/);
    let name = jp ? jp[1] : s;
    name = name.replace(/駅$/, '站').replace(/線$/, '線');
    if (/站$/.test(name) === false && /駅/.test(String(raw))) name += '站';
    return name;
  }
  function numericId(s) {
    return /^[\d\s._:\-\/]+$/.test(String(s || '').trim());
  }
  function lineZh(raw) {
    let s = trad(String(raw || '')).trim();
    if (!s || numericId(s)) return '';
    const local = (s.match(/^([\u3040-\u30ff\u4e00-\u9fff々ー・]+)/) || [])[1] || s;
    let zh = local;
    for (const [from, to] of LINES) if (zh.includes(from)) zh = zh.split(from).join(to);
    return zh.replace(/\s+/g, ' ').trim() || s;
  }
  function lineOrig(raw) {
    const s = String(raw || '').trim();
    const local = (s.match(/^([\u3040-\u30ff\u4e00-\u9fff々ー・]+)/) || [])[1] || '';
    return local && local !== lineZh(s) ? local : '';
  }
  function colorOf(c) {
    const s = String(c || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(s)) return s;
    if (/^[0-9a-f]{6}$/i.test(s)) return '#' + s;
    return '';
  }
  function directionOf(head, alight) {
    const s = String(head || '').replace(/[（(][^）)]*[）)]/g, ' ');
    const bits = s.split(/\s+/).map(stationZh).filter(Boolean);
    const cjk = bits.filter(x => /[\u4e00-\u9fff]/.test(x));
    const last = (cjk.length ? cjk[cjk.length - 1] : (bits.length ? bits[bits.length - 1] : '')) || '';
    if (last && last !== alight) return last;
    return alight || last || '';
  }
  function placeName(p) {
    if (!p || !p.name) return '';
    return stationZh(p.name);
  }
  function modeWord(mode) {
    const m = String(mode || '').toUpperCase();
    if (/BUS|COACH/.test(m)) return '公車';
    if (/SUBWAY|METRO/.test(m)) return '地鐵';
    if (/FERRY|SHIP|BOAT/.test(m)) return '渡輪';
    return '電車';
  }
  function agencyLabel(raw) {
    const s = String(raw || '');
    const t = trad(s);
    if (/都営|都營|東京都交通局/.test(s) || /都營|東京都交通局/.test(t)) return /バス|巴士|Bus/i.test(s + t) ? '都營巴士' : '都營';
    if (/東京メトロ|Tokyo\s*Metro/i.test(s)) return '東京地鐵';
    if (/京急|京浜急行|京濱急行/.test(s) || /京急|京濱急行/.test(t)) return '京急';
    if (/京成/.test(s) || /京成/.test(t)) return '京成';
    if (/^JR$/.test(s.trim()) || /JR東日本|JR\s*East|東日本旅客/i.test(s)) return 'JR';
    if (/東急/.test(t)) return '東急';
    if (/小田急/.test(t)) return '小田急';
    if (/西武/.test(t)) return '西武';
    if (/東武/.test(t)) return '東武';
    if (/南海/.test(t)) return '南海';
    if (/阪急/.test(t)) return '阪急';
    if (/阪神/.test(t)) return '阪神';
    if (/近鉄|近鐵/.test(s) || /近鐵/.test(t)) return '近鐵';
    if (/台北捷運|臺北捷運/.test(t)) return '台北捷運';
    const z = lineZh(s);
    if (z && !numericId(z) && z.length <= 16) return z;
    return '';
  }
  function humanName(s) {
    const t = String(s || '').trim();
    return t && !numericId(t) ? t : '';
  }
  function isCode(s) {
    return /^[A-Za-z]{1,3}\d{0,2}$/.test(String(s || ''));
  }
  function joinOp(op, zh) {
    if (!op) return zh || '';
    if (!zh) return op;
    if (zh.includes(op)) return zh;
    const gap = /[A-Za-z]$/.test(op) || /^[A-Za-z]/.test(zh) ? ' ' : '';
    return op + gap + zh;
  }
  function routeLabel(lg) {
    lg = lg || {};
    const hs = humanName(lg.routeShortName);
    const hl = humanName(lg.routeLongName);
    const hd = humanName(lg.displayName);
    let raw = '';
    if (hl && hs) {
      if (isCode(hs) || hl.toLowerCase().includes(hs.toLowerCase())) raw = hl;
      else if (hs.length > hl.length) raw = hs;
      else raw = hl;
    } else if (hl) raw = hl;
    else if (hs && !isCode(hs)) raw = hs;
    else if (hd && !isCode(hd)) raw = hd;
    let zh = raw ? lineZh(raw) : '';
    if (numericId(zh)) zh = '';
    const op = agencyLabel(lg.agencyName || lg.agency || '');
    if (zh) zh = joinOp(op, zh);
    else if (op) zh = op.length <= 3 ? joinOp(op, modeWord(lg.mode)) : op;
    else if (hs && isCode(hs)) zh = hs;
    else zh = modeWord(lg.mode);
    if (numericId(zh)) zh = modeWord(lg.mode);
    const orig = raw ? lineOrig(raw) : '';
    return { line: zh, lineOrig: orig && orig !== zh ? orig : '', short: hs && !numericId(hs) ? hs : '' };
  }

  function platformOf(place) {
    if (!place || typeof place !== 'object') return '';
    const raw = place.platformCode || place.platformName || '';
    let s = String(raw).trim();
    if (!s || s.length > 24) return '';
    if (/exit|出口|出入口/i.test(s)) {
      const rest = s.replace(/exit/ig, '').replace(/出入口|出口/g, '').replace(/\s+/g, ' ').trim();
      return rest ? '出口 ' + rest : '出口';
    }
    return '月台 ' + s;
  }
  function planFromItinerary(it) {
    if (!it || !Array.isArray(it.legs) || !it.legs.length) return null;
    const steps = [];
    for (const lg of it.legs) {
      if (!lg || !lg.mode) continue;
      const min = Math.max(1, Math.round((+lg.duration || 0) / 60) || 1);
      if (lg.mode === 'WALK' || lg.mode === 'TRANSFER') {
        const to = placeName(lg.to);
        const from = placeName(lg.from);
        const meters = Math.round(+lg.distance || 0);
        if (!to && !from && min < 2 && meters < 40) continue;
        const step = { kind: 'walk', min, to, from };
        if (meters >= 40) step.meters = meters;
        steps.push(step);
        continue;
      }
      const label = routeLabel(lg);
      const alight = placeName(lg.to);
      const board = placeName(lg.from);
      const stops = Array.isArray(lg.intermediateStops) ? lg.intermediateStops.length + 1 : 0;
      const ride = {
        kind: 'ride',
        min,
        mode: lg.mode || '',
        line: label.line,
        lineOrig: label.lineOrig,
        short: label.short,
        color: colorOf(lg.routeColor),
        direction: directionOf(lg.headsign, alight),
        alight,
        stops
      };
      if (board) ride.board = board;
      const bp = platformOf(lg.from);
      const ap = platformOf(lg.to);
      if (bp) ride.boardPlatform = bp;
      if (ap) ride.alightPlatform = ap;
      steps.push(ride);
    }
    if (!steps.some(s => s.kind === 'ride' || s.kind === 'walk')) return null;
    const ride = [...steps].reverse().find(s => s.kind === 'ride' && s.alight);
    let fare = '';
    const f = it.fare || (Array.isArray(it.fares) && it.fares[0]);
    if (f && f.amount != null) fare = '約 ' + f.amount + (f.currency ? ' ' + f.currency : '');
    return {
      source: 'transitous',
      steps,
      alight: ride ? ride.alight : '',
      min: Math.max(1, Math.round((+it.duration || 0) / 60) || 1),
      fare
    };
  }
  function fromTransitousAll(j) {
    const arr = j && Array.isArray(j.itineraries) ? j.itineraries : [];
    const out = [];
    for (const it of arr) {
      const plan = planFromItinerary(it);
      if (plan) out.push(plan);
      if (out.length >= 4) break;
    }
    return out;
  }
  function fromTransitous(j) {
    const list = fromTransitousAll(j);
    return list.length ? list[0] : null;
  }

  const AIR = [
    {
      id: 'narita', lat: 35.765, lng: 140.386, r: 6, board: '成田機場站', boardMin: 6,
      ends: [
        { lat: 35.7118, lng: 139.7731, r: 2.4, alight: '京成上野', dir: '上野', airport: '成田機場', airportDir: '成田機場', line: '京成 Skyliner', lineOrig: '京成スカイライナー', color: '#EE1C25', min: 44, stops: 2, fare: '約 ¥2,580', walk: 10 },
        { lat: 35.7281, lng: 139.7707, r: 1.5, alight: '日暮里', dir: '日暮里', airport: '成田機場', airportDir: '成田機場', line: '京成 Skyliner', lineOrig: '京成スカイライナー', color: '#EE1C25', min: 36, stops: 1, fare: '約 ¥2,580', walk: 8 },
        { lat: 35.6812, lng: 139.7671, r: 1.6, alight: '東京', dir: '東京', airport: '成田機場', airportDir: '成田機場', line: '成田特快', lineOrig: "成田エクスプレス N'EX", color: '#E60012', min: 56, stops: 1, fare: '約 ¥3,070', walk: 8 },
        { lat: 35.6896, lng: 139.7004, r: 2.2, alight: '新宿', dir: '新宿', airport: '成田機場', airportDir: '成田機場', line: '成田特快', lineOrig: "成田エクスプレス N'EX", color: '#E60012', min: 85, stops: 2, fare: '約 ¥3,250', walk: 8 }
      ]
    },
    {
      id: 'haneda', lat: 35.5494, lng: 139.7798, r: 4, board: '羽田機場站', boardMin: 8,
      ends: [
        { lat: 35.6284, lng: 139.7387, r: 1.8, alight: '品川', dir: '品川', airport: '羽田機場', airportDir: '羽田機場', line: '京急空港線', lineOrig: '京急空港線', color: '#00A0E4', min: 18, stops: 4, fare: '約 ¥330', walk: 8 },
        { lat: 35.6554, lng: 139.7571, r: 1.4, alight: '濱松町', dir: '濱松町', airport: '羽田機場', airportDir: '羽田機場', line: '東京單軌', lineOrig: '東京モノレール', color: '#00A0E9', min: 18, stops: 6, fare: '約 ¥520', walk: 6 }
      ]
    },
    {
      id: 'kix', lat: 34.4347, lng: 135.244, r: 6, board: '關西機場站', boardMin: 6,
      ends: [
        { lat: 34.6627, lng: 135.5022, r: 2.2, alight: '難波', dir: '難波', airport: '關西機場', airportDir: '關西機場', line: '南海 Rapi:t', lineOrig: '南海ラピート', color: '#E94E1B', min: 38, stops: 1, fare: '約 ¥1,720', walk: 8 },
        { lat: 34.6467, lng: 135.5136, r: 2, alight: '天王寺', dir: '天王寺', airport: '關西機場', airportDir: '關西機場', line: 'JR 遙號', lineOrig: 'JR はるか', color: '#E60012', min: 45, stops: 2, fare: '約 ¥2,200', walk: 8 },
        { lat: 34.9858, lng: 135.7588, r: 2.5, alight: '京都', dir: '京都', airport: '關西機場', airportDir: '關西機場', line: 'JR 遙號', lineOrig: 'JR はるか', color: '#E60012', min: 75, stops: 3, fare: '約 ¥3,500', walk: 8 }
      ]
    },
    {
      id: 'tpe', lat: 25.0777, lng: 121.2328, r: 6, board: '機場第一航廈站', boardMin: 6,
      ends: [
        { lat: 25.0478, lng: 121.517, r: 2.2, alight: '台北車站', dir: '台北車站', airport: '桃園機場', airportDir: '桃園機場', line: '機場捷運', lineOrig: '桃園機場捷運', color: '#7B2D8E', min: 38, stops: 6, fare: '約 NT$160', walk: 5 }
      ]
    }
  ];

  function tablePlan(air, end, toAirport) {
    const board = toAirport ? end.alight : air.board;
    const alight = toAirport ? air.board.replace(/站$/, '') : end.alight;
    const steps = [
      { kind: 'walk', min: toAirport ? end.walk : air.boardMin, to: board },
      {
        kind: 'ride',
        min: end.min,
        line: end.line,
        lineOrig: end.lineOrig,
        color: end.color,
        direction: toAirport ? end.airportDir : end.dir,
        alight,
        stops: end.stops
      },
      { kind: 'walk', min: toAirport ? air.boardMin : end.walk, from: alight }
    ];
    return { source: 'table', steps, alight, min: steps.reduce((n, s) => n + (s.min || 0), 0), fare: end.fare, note: '這是常見的機場路線，班次與票價以當天為準。' };
  }
  function knownRoute(a, b) {
    if (!a || !b) return null;
    let best = null;
    for (const air of AIR) {
      const fromAir = near(a, air.lat, air.lng, air.r);
      const toAir = near(b, air.lat, air.lng, air.r);
      if (fromAir === toAir) continue;
      const city = fromAir ? b : a;
      for (const end of air.ends) {
        const d = km(city, end);
        if (d == null || d > end.r) continue;
        if (!best || d < best.d) best = { d, plan: tablePlan(air, end, toAir && !fromAir) };
      }
    }
    return best ? best.plan : null;
  }

  const STOPS = [
    ['成田機場第1航廈', 35.7653, 140.3856],
    ['成田機場第2航廈', 35.7732, 140.3874],
    ['京成上野', 35.7118, 139.7731],
    ['上野', 35.7138, 139.777],
    ['日暮里', 35.7281, 139.7707],
    ['東京', 35.6812, 139.7671],
    ['新宿', 35.6896, 139.7004],
    ['品川', 35.6284, 139.7387],
    ['濱松町', 35.6554, 139.7571],
    ['羽田機場', 35.5494, 139.7798],
    ['淺草', 35.7107, 139.7966],
    ['押上', 35.7104, 139.813],
    ['澀谷', 35.658, 139.7016],
    ['池袋', 35.7295, 139.7109],
    ['關西機場', 34.4347, 135.244],
    ['難波', 34.6627, 135.5022],
    ['天王寺', 34.6467, 135.5136],
    ['新大阪', 34.7335, 135.5003],
    ['京都', 34.9851, 135.7588],
    ['桃園機場', 25.0777, 121.2328],
    ['台北車站', 25.0478, 121.517]
  ];
  function nearestStop(p, list) {
    let best = null;
    for (const row of list && list.length ? list : STOPS) {
      const name = row.name || row[0];
      const lat = row.lat != null ? +row.lat : +row[1];
      const lng = row.lng != null ? +row.lng : +row[2];
      const d = km(p, { lat, lng });
      if (d == null) continue;
      if (!best || d < best.km) best = { name: stationZh(name) || name, lat, lng, km: d };
    }
    return best;
  }
  function nearbyPlan(a, b, fromStop, toStop) {
    const from = fromStop || nearestStop(a);
    const to = toStop || nearestStop(b);
    if (!to || to.km > 3) return null;
    if (from && from.name === to.name) {
      const w = walkMin(km(a, b));
      return { source: 'nearby', steps: [{ kind: 'walk', min: w }], alight: to.name, min: w, fare: '', note: '兩端最近是同一站，這段用走的。' };
    }
    const rideMin = Math.max(4, Math.round(5 + km(from || a, to) / 22 * 60));
    const steps = [];
    if (from && from.km > 0.12) steps.push({ kind: 'walk', min: walkMin(from.km), to: from.name });
    steps.push({
      kind: 'ride',
      min: rideMin,
      line: '大眾運輸',
      lineOrig: '',
      color: '#334155',
      direction: to.name,
      alight: to.name,
      stops: 0
    });
    if (to.km > 0.12) steps.push({ kind: 'walk', min: walkMin(to.km), from: to.name });
    return {
      source: 'nearby',
      steps,
      alight: to.name,
      min: steps.reduce((n, s) => n + (s.min || 0), 0),
      fare: '',
      note: '沒查到班次。先在 ' + to.name + ' 下車，再步行約 ' + walkMin(to.km) + ' 分到目的地。這是估計，不是即時班次。'
    };
  }

  function labelOf(plan, mode) {
    if (plan && plan.label) return String(plan.label).slice(0, 40);
    const rides = ((plan && plan.steps) || []).filter(s => s.kind === 'ride' && s.line && s.line !== '大眾運輸' && s.line !== '開車');
    if (rides.length) return rides.map(s => s.line).slice(0, 2).join(' → ').slice(0, 40);
    if (mode === 'walk') return '全程步行';
    if (mode === 'drive') return '開車';
    return '大眾運輸';
  }
  function honesty(source) {
    if (source === 'transitous') return '時刻表估計，非即時到站。實際班次請開地圖確認。';
    if (source === 'table') return '這是常見的機場路線，班次與票價以當天為準。';
    if (source === 'nearby') return '依最近車站估算，不是即時班次。';
    return '依直線距離估算，不是即時路況或班次。';
  }
  function choices(a, b, livePlans) {
    const opts = [];
    const seen = new Set();
    function push(plan, mode) {
      if (!plan) return;
      const steps = plan.steps || [];
      if (!steps.length) return;
      if (!mode) mode = plan.mode;
      if (!mode) {
        const ride = steps.some(s => s.kind === 'ride' && s.line !== '開車' && s.mode !== 'CAR');
        mode = ride ? 'transit' : (steps.every(s => s.kind === 'walk') ? 'walk' : 'transit');
      }
      const source = plan.source || 'estimate';
      const min = Math.max(1, Math.round(+plan.min || steps.reduce((n, s) => n + (+s.min || 0), 0) || 1));
      const id = String(plan.id || [mode, source, steps.map(s => s.kind === 'ride' ? (s.line || '') + '@' + (s.alight || '') : 'w').join('/')].join(':')).slice(0, 96);
      const sig = mode + '|' + steps.filter(s => s.kind === 'ride').map(s => (s.line || '') + '@' + (s.alight || '')).join('/');
      if (seen.has(id) || seen.has(sig)) return;
      seen.add(id);
      seen.add(sig);
      opts.push({
        id,
        mode,
        source,
        min,
        label: labelOf(plan, mode),
        steps,
        fare: plan.fare || '',
        note: plan.note || honesty(source),
        alight: plan.alight || ''
      });
    }
    (livePlans || []).forEach(p => { if (p) push(Object.assign({}, p, { source: p.source || 'transitous', mode: 'transit' })); });
    if (a && b) {
      const known = knownRoute(a, b);
      if (known) push(Object.assign({ mode: 'transit' }, known));
      const dist = km(a, b);
      if (dist != null) {
        const walkM = walkMin(dist);
        const driveM = Math.max(2, Math.round(3 + dist / 28 * 60));
        push({
          id: 'est:walk',
          mode: 'walk',
          source: 'estimate',
          min: walkM,
          label: '全程步行',
          steps: [{ kind: 'walk', min: walkM, meters: Math.round(dist * 1000) }],
          note: '依直線距離、時速約 4.8 公里估算，不是實測步道，也不是即時路況。'
        });
        if (!opts.some(o => o.mode === 'transit')) {
          const near = nearbyPlan(a, b);
          if (near) push(Object.assign({ mode: 'transit' }, near));
          else {
            const transitM = Math.max(3, Math.round(5 + dist / 22 * 60));
            push({
              id: 'est:transit',
              mode: 'transit',
              source: 'estimate',
              min: transitM,
              label: '大眾運輸（直線估算）',
              steps: [{ kind: 'ride', min: transitM, line: '大眾運輸', mode: 'TRANSIT' }],
              note: '還沒有班次明細。時間依直線距離估算，不是即時列車。'
            });
          }
        }
        push({
          id: 'est:drive',
          mode: 'drive',
          source: 'estimate',
          min: driveM,
          label: '開車',
          steps: [{ kind: 'ride', min: driveM, line: '開車', mode: 'CAR' }],
          note: '依直線距離、市區時速估算，不含即時路況。'
        });
      }
    }
    const ridesOf = o => (o.steps || []).filter(s => s.kind === 'ride' && s.line !== '開車' && s.mode !== 'CAR').length;
    const penalty = { transitous: 0, table: 8, nearby: 18, estimate: 28 };
    const score = o => o.min + ridesOf(o) * 14 + (penalty[o.source] == null ? 40 : penalty[o.source]);
    let rides = opts.filter(o => o.mode === 'transit').sort((x, y) => score(x) - score(y) || x.min - y.min);
    const known = rides.find(o => o.source === 'table');
    rides = rides.slice(0, 3);
    if (known && rides.indexOf(known) < 0) rides = rides.slice(0, 2).concat(known);
    const walk = opts.find(o => o.mode === 'walk');
    const drive = opts.find(o => o.mode === 'drive');
    return rides.concat(walk || []).concat(drive || []);
  }

  return { km, walkMin, clash, pinWarn, stationZh, lineZh, fromTransitous, fromTransitousAll, choices, knownRoute, nearestStop, nearbyPlan, hm, stayMin, suggestMove, shiftChain, resolveDay, isFixed, modeWord, routeLabel };
});
