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
  function clash(prev, next, min) {
    const a = minutes(prev), b = minutes(next);
    if (a == null || b == null || !(min > 0)) return '';
    const gap = b - a;
    if (gap === 0) return '兩個時間都是 ' + prev + '，這段大約要 ' + min + ' 分，時間會撞到';
    if (gap < 0) return '下一站的時間比上一站早，這段大約要 ' + min + ' 分';
    if (gap < min) return '兩個時間只隔 ' + gap + ' 分，這段大約要 ' + min + ' 分，可能趕不上';
    return '';
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
    [/池袋|Ikebukuro/i, '池袋']
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
  function lineZh(raw) {
    let s = trad(String(raw || '')).trim();
    if (!s) return '';
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

  function fromTransitous(j) {
    const it = j && j.itineraries && j.itineraries[0];
    if (!it || !Array.isArray(it.legs) || !it.legs.length) return null;
    const steps = [];
    for (const lg of it.legs) {
      if (!lg || !lg.mode) continue;
      const min = Math.max(1, Math.round((+lg.duration || 0) / 60) || 1);
      if (lg.mode === 'WALK' || lg.mode === 'TRANSFER') {
        const to = placeName(lg.to);
        const from = placeName(lg.from);
        if (!to && !from && min < 2) continue;
        steps.push({ kind: 'walk', min, to, from });
        continue;
      }
      const long = lg.routeLongName || lg.routeShortName || lg.agencyName || '';
      const alight = placeName(lg.to);
      const stops = Array.isArray(lg.intermediateStops) ? lg.intermediateStops.length + 1 : 0;
      steps.push({
        kind: 'ride',
        min,
        line: lineZh(long) || '大眾運輸',
        lineOrig: lineOrig(long),
        short: String(lg.routeShortName || '').trim(),
        color: colorOf(lg.routeColor),
        direction: directionOf(lg.headsign, alight),
        alight,
        stops
      });
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
      note: '沒查到班次。先在 ' + to.name + ' 下車，再步行約 ' + walkMin(to.km) + ' 分到目的地。'
    };
  }

  return { km, walkMin, clash, pinWarn, stationZh, lineZh, fromTransitous, knownRoute, nearestStop, nearbyPlan };
});
