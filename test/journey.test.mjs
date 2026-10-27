import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
require('../visitgeo.js');
require('../spotlore.js');
const J = require('../journey.js');
const Share = require('../share.js');
const { mergeTrip } = require('../sync.js');

const trip = (over) => Object.assign({
  id: 't1', dest: '東京', dep: '2026-04-01', ret: '2026-04-05', pax: 2, orig: 'TPE', days: [[]], expenses: []
}, over);

function assertClear(svg, label) {
  const chips = [];
  const chipRe = /<g class="rlab[^"]*"[^>]*>\s*<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"[^>]*>\s*<text\b[^>]*>([^<]*)<\/text>/g;
  let m;
  while ((m = chipRe.exec(svg))) chips.push({ x: +m[1], y: +m[2], w: +m[3], h: +m[4], name: m[5] });
  const pins = [];
  const pinRe = /<g class="spotpin"(?: [^>]*)?>([\s\S]*?)<\/g>/g;
  while ((m = pinRe.exec(svg))) {
    const chunk = m[1];
    const c = chunk.match(/cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/);
    const t = chunk.match(/<text x="([^"]+)" y="([^"]+)" text-anchor="([^"]+)"[^>]*>([^<]*)<\/text>/);
    const circle = c ? { x: +c[1] - (+c[3] + 2), y: +c[2] - (+c[3] + 2), w: (+c[3] + 2) * 2, h: (+c[3] + 2) * 2, name: 'pin' } : null;
    let text = null;
    if (t) {
      const fs = 12;
      const name = t[4];
      const w = Array.from(name).length * fs * 1.05 + 6;
      const h = fs + 8;
      const tx = +t[1];
      const ty = +t[2];
      const anchor = t[3];
      let left = tx;
      if (anchor === 'middle') left = tx - w / 2;
      else if (anchor === 'end') left = tx - w;
      text = { x: left, y: ty - fs * 0.86, w, h, name };
    }
    pins.push({ circle, text });
  }
  const boxes = [...chips, ...pins.map(p => p.circle).filter(Boolean), ...pins.map(p => p.text).filter(Boolean)];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.name === 'pin' && b.name === 'pin') continue;
      const hit = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      assert.equal(hit, false, label + ' ' + a.name + ' overlaps ' + b.name);
    }
  }
}

assert.equal(J.detectCountry(trip({ dest: 'NRT' })), 'jp');
assert.equal(J.detectCountry(trip({ dest: '成田', days: [[{ name: '飯店', to: 'HND' }]] })), 'jp');
assert.equal(J.detectCountry(trip({ dest: '關西', days: [[{ name: '航班', to: 'KIX' }]] })), 'jp');
assert.equal(J.detectCountry(trip({ dest: '首爾', days: [[{ name: '航班', to: 'ICN' }]] })), 'kr');
assert.equal(J.detectCountry(trip({ dest: '金浦', days: [[{ from: 'GMP', to: 'TPE', name: '回程' }]] })), 'kr');
assert.equal(J.detectCountry(trip({ dest: '釜山', days: [[{ name: '航班', to: 'PUS' }]] })), 'kr');
assert.equal(J.detectCountry(trip({ dest: '東京' })), 'jp');
assert.equal(J.detectCountry(trip({ dest: '首爾' })), 'kr');
assert.equal(J.detectCountry(trip({ dest: '高雄', orig: 'TPE', days: [[{ name: '駁二', from: 'TPE', to: 'KHH' }]] })), 'tw');
assert.equal(J.detectCountry(trip({ dest: '台中' })), 'tw');
assert.equal(J.detectCountry(trip({ dest: '日月潭' })), 'tw');
assert.equal(J.detectCountry(trip({ dest: '東京', days: [[{ name: '淺草寺', note: '台灣朋友推薦' }]] })), 'jp');
assert.equal(J.resolveTheme(trip({ dest: '花蓮' }), 'auto'), 'tw');
assert.equal(J.resolveTheme(trip({ dest: '高雄', themeStyle: 'plain' }), 'auto'), '');

assert.equal(J.resolveTheme(trip({ dest: '首爾', themeStyle: 'plain' }), 'auto'), '');
assert.equal(J.resolveTheme(trip({ dest: '首爾' }), 'plain'), '');
assert.equal(J.resolveTheme(trip({ dest: '首爾', themeStyle: 'jp' }), 'auto'), 'jp');
assert.equal(J.resolveTheme(trip({ dest: '東京' }), 'auto'), 'jp');
assert.equal(J.resolveTheme(trip({ dest: '曼谷' }), 'kr'), 'kr');

const spot = (name, extra) => Object.assign({ name, time: '10:00' }, extra);
const jp = trip({
  days: [[
    spot('一蘭拉麵'),
    spot('淺草寺', { visited: true, visitedAt: Date.parse('2026-04-02T07:30:00') }),
    spot('明治神宮', { visited: true }),
    spot('伏見稻荷大社', { visited: true }),
    spot('金閣寺', { visited: true }),
    spot('清水寺', { visited: true })
  ], [
    spot('新宿拉麵'),
    spot('澀谷'),
    spot('上野'),
    spot('晴空塔'),
    spot('銀座'),
    { name: '電車', travel: { mode: 'transit' } }
  ]]
});
for (let i = 0; i < 9; i++) jp.days[1].push({ name: '轉乘' + i, travel: { mode: 'transit' } });
const diary = [
  { date: '2026-04-02', placeName: '一蘭拉麵', text: '湯頭很濃' },
  { date: '2026-04-03', placeName: 'Lawson', text: '御飯糰' },
  { date: '2026-04-03', placeName: '7-Eleven', dishes: '咖啡' },
  { date: '2026-04-04', placeName: '全家', text: '熱食' }
];
for (let i = 0; i < 7; i++) diary.push({ date: '2026-04-0' + ((i % 4) + 2), placeName: '食堂' + i, text: '好吃' });
const day = [spot('甲', { visited: true }), spot('乙', { visited: true }), spot('丙', { visited: true })];
jp.days.push(day);
jp.expenses = [{ amount: 1200, currency: 'JPY' }, { amount: 80, currency: 'TWD' }];

assert.equal(J.detectCity({ name: '淺草寺', lat: 34.9671, lng: 135.7727 }, trip({ dest: '東京' })), 'kyo');
assert.equal(J.detectCity({ name: '伏見稻荷大社' }, trip({ dest: '東京' })), 'kyo');
assert.equal(J.detectCity({ name: '拉麵' }, trip({ dest: '東京' })), 'tyo');
assert.equal(J.detectCity({ name: '這裡', lat: 35.7148, lng: 139.7967 }, trip({ dest: '大阪' })), 'tyo');
assert.equal(J.detectCity({ name: '海雲臺', lat: 35.1587, lng: 129.1604 }, trip({ dest: '首爾' })), 'pus');
assert.equal(J.detectCity({ name: '景福宮' }, trip({ dest: '首爾' })), 'sel');
assert.equal(J.detectCity({ name: '黑豬肉' }, trip({ dest: '濟州' })), 'cju');
assert.equal(J.detectCity({ name: '札幌啤酒' }, trip({ dest: '東京' })), 'spk');

let res = J.evaluate([jp], diary, {}, 1712000000000);
const ids = new Set(res.fresh.map(c => c.id));
['jp-first', 'tyo-senso', 'tyo-metro', 'kyo-fushimi', 'kyo-kinkaku', 'kyo-kiyomizu'].forEach(id => {
  assert.ok(ids.has(id), id);
  assert.equal(res.earned[id], 1712000000000);
});
assert.equal(ids.has('jp-archive'), false);
assert.equal(ids.has('tyo-pass'), false);
assert.equal(ids.has('jp-ramen'), false);
assert.equal(ids.has('osa-pass'), false);
assert.equal(ids.has('tyo-scramble'), false);

jp.archived = true;
jp.archivedAt = 1712100000000;
res = J.evaluate([jp], diary, res.earned, 1712200000000);
assert.deepEqual(res.fresh.map(c => c.id), ['jp-archive']);
assert.equal(res.earned['jp-first'], 1712000000000);
const again = J.evaluate([jp], diary, res.earned, 1712300000000);
assert.equal(again.fresh.length, 0);

const morning = trip({ days: [[spot('築地市場', { visited: true, time: '07:30' })]] });
assert.ok(J.evaluate([morning], [], {}, 1712000000000).fresh.some(c => c.id === 'tyo-tsukiji'));
const brunch = trip({ days: [[spot('築地', { visited: true, time: '10:40' })]] });
assert.ok(J.evaluate([brunch], [], {}, 1712000000000).fresh.some(c => c.id === 'tyo-tsukiji'));
const afternoon = trip({ days: [[spot('築地市場', { visited: true, time: '15:00', visitedAt: Date.parse('2026-04-02T15:10:00') })]] });
assert.equal(J.evaluate([afternoon], [], {}, 1712000000000).fresh.some(c => c.id === 'tyo-tsukiji'), false);
const diaryBreakfast = trip({ dest: '東京', days: [[]] });
assert.ok(J.evaluate([diaryBreakfast], [{ date: '2026-04-02', placeName: '築地', text: '早餐' }], {}, 1712000000000).fresh.some(c => c.id === 'tyo-tsukiji'));

const nearTree = trip({ dest: '大阪', days: [[spot('展望台', { visited: true, lat: 35.7101, lng: 139.8107 })]] });
assert.ok(J.evaluate([nearTree], [], {}, 1712000000000).fresh.some(c => c.id === 'tyo-skytree'));

const kept = J.evaluate([jp], diary, { 'jp-ramen': 1711000000000 }, 1712400000000);
assert.equal(kept.earned['jp-ramen'], 1711000000000);
assert.equal(kept.fresh.some(c => c.id === 'jp-ramen'), false);

const kr = trip({
  dest: '首爾',
  days: [[
    spot('景福宮', { visited: true, icon: 'sightseeing' }),
    spot('明洞逛街', { visited: true }),
    spot('韓式烤肉', { time: '18:30' }),
    spot('咖啡廳一', { icon: 'cafe' }),
    spot('咖啡廳二', { icon: 'cafe' }),
    spot('咖啡廳三', { icon: 'cafe' }),
    spot('咖啡廳四', { icon: 'cafe' })
  ], day.map(s => Object.assign({}, s))]
});
const krDiary = [{ date: '2026-04-02', placeName: '炸雞', text: '辣炒雞' }, { date: '2026-04-03', text: '又吃炸雞' }];
const krRes = J.evaluate([kr], krDiary, {}, 1712000000000);
const krIds = new Set(krRes.fresh.map(c => c.id));
['kr-first', 'sel-hanbok', 'sel-myeong', 'sel-bbq', 'sel-cafe'].forEach(id => assert.ok(krIds.has(id), id));
assert.equal(krIds.has('kr-archive'), false);
assert.equal(krIds.has('sel-chicken'), false);
assert.equal(krIds.has('kr-perfect'), false);
assert.equal(krIds.has('sel-hongdae'), false);

const tw = trip({
  dest: '高雄',
  days: [[
    spot('駁二藝術特區', { visited: true, lat: 22.61953, lng: 120.28162 }),
    spot('打狗英國領事館', { visited: true, lat: 22.61967, lng: 120.26651 }),
    spot('蓮池潭', { visited: true, lat: 22.68384, lng: 120.29645 })
  ]]
});
const twRes = J.evaluate([tw], [], {}, 1712000000000);
const twIds = new Set(twRes.fresh.map(c => c.id));
['tw-first', 'khh-pier2', 'khh-takow', 'khh-lotus'].forEach(id => assert.ok(twIds.has(id), id));
assert.equal(twIds.has('tw-archive'), false);
assert.equal(twIds.has('khh-pass'), false);
assert.equal(J.detectCity({ name: '駁二', lat: 22.61953, lng: 120.28162 }, trip({ dest: '高雄' })), 'khh');
assert.equal(J.detectCity({ name: '日月潭', lat: 23.85233, lng: 120.92861 }, trip({ dest: '台中' })), 'nto');
assert.equal(J.detectCity({ name: '九二一地震教育園區', lat: 24.04261, lng: 120.69914 }, trip({ dest: '南投' })), 'txg');
assert.equal(J.detectCity({ name: '阿里山' }, trip({ dest: '嘉義' })), 'cyi');
assert.equal(J.detectCity({ name: '台北101', lat: 25.03384, lng: 121.5645 }, trip({ dest: '高雄' })), 'tpe');
tw.archived = true;
assert.deepEqual(J.evaluate([tw], [], twRes.earned, 1712400000000).fresh.map(c => c.id), ['tw-archive']);
const packedTw = Share.normTrip(Object.assign({}, trip({ dest: '台南' }), { themeStyle: 'tw' }), 0, true);
assert.equal(packedTw.themeStyle, 'tw');
assert.equal(J.shortStyle('tw'), '台灣');
const noon = trip({ dest: '首爾', days: [[spot('烤肉', { time: '12:00' })]] });
assert.equal(J.evaluate([noon], [], {}, 1712000000000).fresh.some(c => c.id === 'sel-bbq'), false);
const nightNote = trip({ dest: '首爾', days: [[]] });
assert.ok(J.evaluate([nightNote], [{ date: '2026-04-02', text: '烤肉' }], {}, 1712000000000).fresh.some(c => c.id === 'sel-bbq'));
const chickenBeer = trip({ dest: '首爾', days: [[]] });
assert.ok(J.evaluate([chickenBeer], [{ date: '2026-04-02', text: '炸雞' }, { date: '2026-04-03', text: '生啤' }], {}, 1712000000000).fresh.some(c => c.id === 'sel-chicken'));
const moved = J.evaluate([], [], { 'jp-tokyo': 1712000000000, 'kr-shop': 1711800000000, 'jp-first': 1711000000000 }, 1713000000000);
assert.equal(moved.fresh.length, 0);
assert.equal(moved.earned['tyo-pass'], 1712000000000);
assert.equal(moved.earned['jp-tokyo'], 1712000000000);
assert.equal(moved.earned['sel-hongdae'], 1711800000000);
assert.equal(moved.earned['sel-myeong'], 1711800000000);
assert.equal(moved.earned['jp-first'], 1711000000000);
assert.equal(J.progressBrief({ 'tyo-senso': 1712000000000, 'tyo-pass': 1712000000000 }), '東京 2/8');
assert.equal(J.progressBrief({}), '尚未收集');
assert.equal(J.shortStyle('auto'), '自動');
assert.equal(J.shortStyle('plain'), '系統預設');

const sum = J.summarize(jp, diary);
assert.equal(sum.days, 5);
assert.ok(sum.visited >= 8);
assert.ok(sum.diary >= 10);
assert.match(sum.spend, /JPY/);
assert.match(sum.spend, /TWD/);

const packed = Share.normTrip(Object.assign({}, jp, { themeStyle: 'jp' }), 0, true);
assert.equal(packed.archived, true);
assert.equal(packed.archivedAt, 1712100000000);
assert.equal(packed.themeStyle, 'jp');
const shared = Share.normTrip(Object.assign({}, jp, { themeStyle: 'jp', archiveAsked: true }), 0, false);
assert.equal(shared.archived, undefined);
assert.equal(shared.themeStyle, undefined);
assert.equal(shared.archiveAsked, undefined);

const local = { days: [[]], expenses: [], tomb: {}, expTomb: {}, metaRev: 5, dest: '東京', dep: '2026-04-01', ret: '2026-04-05', pax: 2, orig: 'TPE', themeStyle: 'jp', archived: true, archivedAt: 1712100000000, archiveAsked: true };
const remote = { days: [[]], expenses: [], tomb: {}, expTomb: {}, metaRev: 2, dest: '東京', dep: '2026-04-01', ret: '2026-04-05', pax: 2, orig: 'TPE' };
const merged = mergeTrip(local, remote);
assert.equal(merged.themeStyle, 'jp');
assert.equal(merged.archived, true);
assert.equal(merged.archiveAsked, true);
const newer = mergeTrip(local, Object.assign({}, remote, { metaRev: 9, themeStyle: 'plain', archived: false }));
assert.equal(newer.themeStyle, 'plain');
assert.equal(newer.archived, undefined);
assert.equal(newer.archiveAsked, true);

['tyo', 'osa', 'kyo', 'spk', 'oka', 'fuk', 'sel', 'pus', 'cju'].forEach(id => {
  const n = J.CARDS.filter(c => c.city === id && !c.legacy).length;
  assert.ok(n >= 6 && n <= 10, id + ' ' + n);
  assert.ok(J.CITIES.some(c => c.id === id));
});
['tpe', 'txg', 'tnn', 'khh', 'hul', 'ttt', 'cyi', 'ktn', 'yil', 'nto'].forEach(id => {
  const n = J.CARDS.filter(c => c.city === id && !c.legacy).length;
  assert.ok(n >= 4 && n <= 8, id + ' ' + n);
  const city = J.CITIES.find(c => c.id === id);
  assert.equal(city.country, 'tw');
  assert.ok(city.color);
  assert.equal(city.box.length, 4);
});
for (let i = 0; i < J.CITIES.length; i++) {
  for (let j = i + 1; j < J.CITIES.length; j++) {
    const a = J.CITIES[i].box, b = J.CITIES[j].box;
    const overlap = a[0] <= b[2] && b[0] <= a[2] && a[1] <= b[3] && b[1] <= a[3];
    assert.equal(overlap, false, J.CITIES[i].id + ' ' + J.CITIES[j].id);
  }
}
assert.ok(J.CARDS.some(c => c.id === 'jp-first' && !c.city && !c.legacy));
assert.ok(J.CARDS.some(c => c.id === 'jp-archive' && !c.legacy));
assert.ok(J.CARDS.some(c => c.id === 'kr-first' && !c.legacy));
assert.ok(J.CARDS.some(c => c.id === 'tw-first' && !c.city && !c.legacy));
assert.ok(J.CARDS.some(c => c.id === 'tw-archive' && !c.legacy));
assert.ok(J.CARDS.some(c => c.id === 'jp-ramen' && c.legacy));
assert.equal(J.cardById('jp-tokyo'), null);
assert.deepEqual(J.ALIAS['jp-tokyo'], ['tyo-pass']);
assert.deepEqual(J.ALIAS['kr-spicy'], ['sel-chicken']);
assert.ok(J.CARDS.every(c => c.title && c.hint && c.desc && c.test));
const page = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(page, /成就收藏/);
assert.match(page, /openThemeSet/);
assert.match(page, /class="setrow"/);
assert.match(page, /settingsPage/);
assert.match(page, /theme-tw/);
['tpe', 'txg', 'tnn', 'khh', 'hul', 'ttt', 'cyi', 'ktn', 'yil', 'nto'].forEach(id => {
  assert.match(page, new RegExp('ach\\.city-' + id));
});

const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
assert.match(sw, /tripmate-v72/);
assert.match(sw, /journey\.js/);
assert.match(page, /v2\.25\.0/);
assert.match(page, /openVisitMap/);
assert.match(page, /class="vmap-entry"/);
assert.match(page, /\.ach-q/);

const locked = J.achMarkup('tyo-senso', {});
assert.match(locked, /class="ach-q"/);
assert.match(locked, /aria-label="如何完成：淺草寺參拜"/);
assert.match(locked, /Journey\.howTo\('tyo-senso'\)/);
assert.match(locked, /在淺草寺蓋上到此一遊/);
assert.equal(locked.startsWith('<div'), true);
const earnedCard = J.achMarkup('tyo-senso', { 'tyo-senso': 1712000000000 });
assert.equal(earnedCard.startsWith('<button'), true);
assert.equal(earnedCard.includes('ach-q'), false);
J.CARDS.forEach(c => {
  assert.equal(J.howTo(c.id), c.hint);
  assert.match(c.hint, /[\u4e00-\u9fff]/);
});
assert.equal(J.howTo('missing-card'), '');

const seenTrips = [
  trip({ id: 'tokyo-1', dest: '東京', archived: true, days: [[{ name: '伏見稻荷大社', visited: true }]] }),
  trip({ id: 'nrt-1', dest: 'NRT', days: [[]] }),
  trip({ id: 'tpe-1', dest: '台北', days: [[{ name: '故宮博物院' }]] }),
  trip({ id: 'pus-1', dest: '釜山', archived: true, days: [[]] }),
  trip({ id: 'hul-1', dest: '花蓮', days: [[{ name: '太魯閣', from: 'TSA', to: 'HUN' }]] })
];
const places = J.visitedPlaces(seenTrips);
const by = Object.fromEntries(places.map(p => [p.id, p]));
assert.equal(by.tyo.on, true);
assert.equal(by.kyo.on, true);
assert.equal(by.osa.on, false);
assert.equal(by.tpe.on, true);
assert.equal(by.pus.on, true);
assert.equal(by.sel.on, false);
assert.equal(by.hul.on, true);
assert.equal(by.tyo.trips.length, 2);
assert.equal(by.tyo.trips.some(t => t.archived), true);
assert.equal(J.visitBrief(seenTrips), '日本 2 · 韓國 1 · 台灣 2');
assert.equal(J.visitBrief([]), '還沒有點亮的城市');
const jpMap = J.visitMapMarkup('jp', places);
assert.match(jpMap, /aria-label="日本地圖"/);
assert.match(jpMap, /<svg/);
assert.match(jpMap, /class="vreg on" data-id="tyo"/);
assert.match(jpMap, /class="vreg" data-id="osa"/);
assert.equal(/class="vreg on" data-id="osa"/.test(jpMap), false);
assert.match(jpMap, /class="vreg on" data-id="kyo"/);
assert.match(jpMap, />東京</);
assert.match(jpMap, />京都</);
['北海道', '大阪', '福岡', '沖繩', '九州', '東北', '中部', '四國'].forEach(name => {
  assert.equal(jpMap.includes('>' + name + '<'), false, name);
});
assert.equal(jpMap.includes('World_Imagery'), false);
assert.equal(jpMap.includes('leaflet'), false);
const jpPins = J.mapPins('jp', places);
assert.equal(jpPins.find(p => p.id === 'tyo').on, true);
assert.equal(jpPins.find(p => p.id === 'osa').on, false);
assert.ok(jpPins.find(p => p.id === 'tyo').lat > 35 && jpPins.find(p => p.id === 'tyo').lat < 36);
assert.ok(jpPins.find(p => p.id === 'oka').lat < 28);
const twPins = J.mapPins('tw', places);
assert.equal(twPins.find(p => p.id === 'tpe').on, true);
assert.equal(twPins.find(p => p.id === 'hul').on, true);
assert.equal(twPins.length, 14);
assert.ok(twPins.find(p => p.id === 'tpe').lng > 121 && twPins.find(p => p.id === 'tpe').lng < 122);
const twMap = J.visitMapMarkup('tw', places);
assert.match(twMap, /台灣地圖/);
assert.match(twMap, /class="vreg on" data-id="tpe"/);
assert.match(twMap, /class="vreg on" data-id="hul"/);
assert.match(twMap, /class="vreg" data-id="khh"/);
['台北', '花蓮'].forEach(name => assert.match(twMap, new RegExp('>' + name + '<')));
['台中', '台南', '高雄', '台東', '嘉義', '墾丁', '宜蘭', '南投', '桃園', '新竹', '苗栗', '彰化', '雲林', '澎湖', '金門', '馬祖', '蘭嶼', '綠島', '新竹市'].forEach(name => {
  assert.equal(twMap.includes('>' + name + '<'), false, name);
});
const sparseTw = J.visitMapMarkup('tw', [{ id: 'tpe', on: true }, { id: 'kmn', on: true }, { id: 'hul', on: true }]);
assert.deepEqual([...sparseTw.matchAll(/<text\b[^>]*>([^<]+)<\/text>/g)].map(m => m[1]).sort(), ['台北', '花蓮', '金門']);
assertClear(sparseTw, 'sparse-tw');
const crowdedTw = J.visitMapMarkup('tw', [{ id: 'ttt', on: true }, { id: 'khh', on: true }]);
assert.match(crowdedTw, />台東</);
assert.match(crowdedTw, />高雄</);
assert.equal(crowdedTw.includes('>台北<'), false);
assertClear(crowdedTw, 'taitung-kaohsiung');
['kmn', 'mzu', 'lud', 'lny'].forEach(id => {
  assert.match(twMap, new RegExp('data-id="' + id + '"'));
});
assert.equal(/<text\b[^>]*>\s*<\/text>/.test(twMap), false);
assert.equal(/<text\b[^>]*>\s*<\/text>/.test(jpMap), false);
const tokyoDetail = J.cityMapMarkup('tyo', [{ name: '淺草寺', lat: 35.7148, lng: 139.7967 }, { name: '澀谷十字路口', lat: 35.6595, lng: 139.7004 }]);
assert.match(tokyoDetail, /東京分區地圖/);
['世田谷區', '新宿區', '澀谷區', '江戶川區', '千代田區', '練馬區', '中央區', '港區'].forEach(name => assert.equal(tokyoDetail.includes(name), false, name));
assert.match(tokyoDetail, /淺草寺/);
assert.match(tokyoDetail, /澀谷十字路口/);
assert.equal((tokyoDetail.match(/class="spotpin"/g) || []).length, 2);
assertClear(tokyoDetail, 'tokyo');
const closeTokyo = J.cityMapMarkup('tyo', [{ name: '淺草寺', lat: 35.7148, lng: 139.7967 }, { name: '晴空塔', lat: 35.7101, lng: 139.8107 }]);
assert.equal((closeTokyo.match(/class="spotpin"/g) || []).length, 2);
assert.match(closeTokyo, /淺草寺/);
assert.match(closeTokyo, /晴空塔/);
assert.equal(closeTokyo.includes('千代田'), false);
assertClear(closeTokyo, 'asakusa-skytree');
const tpeDetail = J.cityMapMarkup('tpe', [{ name: '故宮博物院', lat: 25.1023, lng: 121.5485 }, { name: '九份', lat: 25.1096, lng: 121.8442 }]);
assert.match(tpeDetail, /台北分區地圖/);
['大安區', '士林區', '瑞芳區', '淡水區', '金山區', '萬里區'].forEach(name => assert.equal(tpeDetail.includes(name), false, name));
assert.match(tpeDetail, /故宮博物院/);
assert.match(tpeDetail, /九份/);
assertClear(tpeDetail, 'taipei');
const selDetail = J.cityMapMarkup('sel', [{ name: '景福宮', lat: 37.5796, lng: 126.977 }]);
assert.match(selDetail, /首爾分區地圖/);
assert.equal(selDetail.includes('鍾路區'), false);
assert.match(selDetail, /景福宮/);
assertClear(selDetail, 'seoul');
const osaDetail = J.cityMapMarkup('osa', [{ name: '大阪城', lat: 34.6873, lng: 135.5262 }]);
assert.match(osaDetail, /大阪分區地圖/);
assert.equal(osaDetail.includes('中央區'), false);
assert.match(osaDetail, /大阪城/);
assertClear(osaDetail, 'osaka');
const kinmenDetail = J.cityMapMarkup('kmn', [{ name: '莒光樓', lat: 24.433, lng: 118.318 }]);
assert.match(kinmenDetail, /金門分區地圖/);
assert.equal(kinmenDetail.includes('金城鎮'), false);
assert.match(kinmenDetail, /莒光樓/);
assertClear(kinmenDetail, 'kinmen');
J.CITIES.forEach(c => {
  const svg = J.cityMapMarkup(c.id, []);
  assert.match(svg, /<svg/, c.id);
  assert.match(svg, /[\u4e00-\u9fff]/, c.id);
  assert.equal(svg.includes('<text'), false, c.id);
});
assert.equal(J.visitMapMarkup('nope', places), '');
assert.equal(J.mapPins('nope', places).length, 0);
J.CITIES.forEach(c => {
  const pin = J.mapPins(c.country, []).find(p => p.id === c.id);
  assert.ok(pin && pin.lat > 20 && pin.lat < 50 && pin.lng > 110 && pin.lng < 150, c.id);
});
assert.match(page, /visitgeo\.js/);
assert.match(sw, /visitgeo\.js/);
assert.equal(page.includes('leaflet'), false);
assert.equal(sw.includes('leaflet'), false);
const tokyoHome = trip({
  id: 'home-1', dest: '東京', orig: 'TPE', dep: '2026-10-20', ret: '2026-10-23',
  days: [[
    { kind: 'flight', name: 'BR198 TPE→NRT', from: 'TPE', to: 'NRT', leg: 'out' },
    { name: '淺草寺', time: '10:00' },
    { kind: 'flight', name: 'BR197 HND→TPE', from: 'HND', to: 'TPE', leg: 'return', note: '回程台北' }
  ]]
});
const homeBy = Object.fromEntries(J.visitedPlaces([tokyoHome]).map(p => [p.id, p]));
assert.equal(homeBy.tyo.on, true);
assert.equal(homeBy.tpe.on, false);
assert.equal(homeBy.tyo.trips[0].dest, '東京');
const kaohsiungHome = trip({
  dest: '大阪', orig: 'KHH',
  days: [[{ kind: 'flight', from: 'KHH', to: 'KIX', name: 'IT230 KHH→KIX', leg: 'out' }]]
});
const khhBy = Object.fromEntries(J.visitedPlaces([kaohsiungHome]).map(p => [p.id, p]));
assert.equal(khhBy.osa.on, true);
assert.equal(khhBy.khh.on, false);
const seoulHome = trip({
  dest: '首爾', orig: 'TPE',
  days: [[{ kind: 'flight', from: 'ICN', to: 'TSA', name: 'BR169 ICN→TSA', leg: 'return', note: '回台北' }]]
});
const selBy = Object.fromEntries(J.visitedPlaces([seoulHome]).map(p => [p.id, p]));
assert.equal(selBy.sel.on, true);
assert.equal(selBy.tpe.on, false);
const taipeiStay = trip({ dest: '台北', orig: 'TPE', days: [[{ name: '故宮博物院' }]] });
assert.equal(Object.fromEntries(J.visitedPlaces([taipeiStay]).map(p => [p.id, p])).tpe.on, true);
const islands = trip({
  dest: '金門',
  days: [[{ name: '綠島朝日溫泉', lat: 22.662, lng: 121.493 }, { name: '蘭嶼', lat: 22.047, lng: 121.55 }], [{ name: '南竿' }]]
});
const islandBy = Object.fromEntries(J.visitedPlaces([islands]).map(p => [p.id, p]));
assert.equal(islandBy.kmn.on, true);
assert.equal(islandBy.lud.on, true);
assert.equal(islandBy.lny.on, true);
assert.equal(islandBy.mzu.on, true);
assert.equal(islandBy.ttt.on, false);
const onlyGreen = trip({ dest: '綠島', days: [[]] });
const greenBy = Object.fromEntries(J.visitedPlaces([onlyGreen]).map(p => [p.id, p]));
assert.equal(greenBy.lud.on, true);
assert.equal(greenBy.ttt.on, false);
const fromKinmen = trip({
  dest: '東京', orig: 'KNH',
  days: [[{ kind: 'flight', name: 'AE KNH→NRT', from: 'KNH', to: 'NRT', leg: 'out' }]]
});
const kinmenHome = Object.fromEntries(J.visitedPlaces([fromKinmen]).map(p => [p.id, p]));
assert.equal(kinmenHome.tyo.on, true);
assert.equal(kinmenHome.kmn.on, false);

const store = {};
globalThis.TM = {
  ls: {
    get: (k, d) => (k in store ? store[k] : d),
    set: (k, v) => { store[k] = v; }
  }
};
J.importState({ badges: { 'jp-first': 1713000000000, nope: 1713000000000 }, themeStyle: 'kr' });
J.importState({ badges: { 'jp-first': 1711000000000 }, themeStyle: 'nope' });
assert.equal(J.exportState().badges['jp-first'], 1711000000000);
assert.equal(J.exportState().badges.nope, undefined);
assert.equal(J.exportState().themeStyle, 'kr');
J.importState({ badges: { 'jp-tokyo': 1714000000000, 'kr-palace': 1712500000000 } });
assert.equal(J.exportState().badges['jp-tokyo'], 1714000000000);
assert.equal(J.exportState().badges['tyo-pass'], 1714000000000);
assert.equal(J.exportState().badges['sel-hanbok'], 1712500000000);
J.importState({ badges: { 'tyo-pass': 1711500000000 } });
assert.equal(J.exportState().badges['tyo-pass'], 1711500000000);
assert.equal(J.exportState().badges['jp-first'], 1711000000000);

assert.match(sw, /spotlore\.js/);
assert.match(page, /spotlore\.js/);
assert.match(page, /pinpop/);
assert.match(page, /\.spotcard/);
assert.match(page, /\.spotcard-k\.trivia/);
assert.match(page, /prefers-reduced-motion:reduce[\s\S]{0,900}\.spotpin\{opacity:1\}/);

const sky = J.spotStory({ name: '晴空塔' });
assert.match(sky.intro, /富士山/);
assert.ok(sky.trivia.length >= 1 && sky.trivia.length <= 3);
assert.match(sky.trivia.join(''), /634/);
assert.match(sky.trivia.join(''), /武藏/);
assert.match(sky.trivia.join(''), /心柱/);
assert.match(sky.rating, /Tripadvisor/);
const skyCard = J.spotCardHtml(sky);
assert.match(skyCard, /簡介/);
assert.match(skyCard, /冷知識/);
assert.match(skyCard, /spotcard-x/);
assert.equal(skyCard.includes('神隱少女'), false);
const customSky = J.spotStory({ name: '晴空塔', summary: '自訂的一句簡介。' });
assert.match(customSky.intro, /自訂的一句簡介/);
assert.ok(customSky.trivia.length);
['淺草寺', '故宮', '九份', '景福宮', '莒光樓'].forEach(name => {
  const st = J.spotStory({ name });
  assert.ok(st.intro, name);
  assert.ok(st.trivia.length >= 1 && st.trivia.length <= 3, name);
  const html = J.spotCardHtml(st);
  assert.match(html, /簡介/, name);
  assert.match(html, /冷知識/, name);
});
assert.match(J.spotStory({ name: '淺草寺' }).trivia.join(''), /700|風雷神門/);
assert.match(J.spotStory({ name: '故宮' }).trivia.join(''), /70 萬/);
assert.match(J.spotStory({ name: '九份' }).trivia.join(''), /九戶/);
assert.match(J.spotStory({ name: '景福宮' }).trivia.join(''), /1867|節氣/);
assert.match(J.spotStory({ name: '莒光樓' }).trivia.join(''), /毋忘在莒/);
const hkPalace = J.spotStory({ name: '香港故宮文化博物館' });
assert.equal(hkPalace.trivia.length, 0);
assert.equal(hkPalace.intro.includes('70 萬'), false);
const grill = J.spotStory({ name: '敘敘苑 晴空塔店' });
assert.equal(grill.trivia.length, 0);
const shib = J.spotStory({ name: '澀谷十字路口' });
assert.ok(shib.intro);
assert.ok(shib.trivia.length >= 1 && shib.trivia.length <= 3);
assert.match(J.spotCardHtml(shib), /冷知識/);
assert.match(J.spotCardHtml(J.spotStory({ name: '完全沒有的點' })), /還沒有收進小檔案/);
const addrOnly = J.spotStory({ name: '完全沒有的點', note: '神楽坂通り · 新宿區 · 東京 · 日本' });
assert.equal(addrOnly.intro, '');
assert.equal(addrOnly.address, '神楽坂通り · 新宿區 · 東京 · 日本');
assert.match(J.spotCardHtml(addrOnly), /簡介<\/p><p>這站還沒有收進小檔案。/);
assert.match(J.spotCardHtml(addrOnly), /地址<\/p><p>神楽坂通り · 新宿區 · 東京 · 日本/);
const skyAddr = J.spotStory({ name: '晴空塔', summary: '墨田區 · 東京 · 日本', note: '墨田區 · 東京 · 日本' });
assert.match(skyAddr.intro, /富士山/);
assert.equal(skyAddr.intro.includes('墨田'), false);
assert.equal(skyAddr.address, '墨田區 · 東京 · 日本');
assert.equal(grill.food, true);
assert.equal(grill.label, '必點');
assert.match(grill.intro, /和牛|燒肉/);
assert.equal(grill.intro.includes('晴空塔'), false);
assert.match(J.spotCardHtml(grill), /必點/);
assert.equal(J.spotCardHtml(grill).includes('簡介'), false);
const fugu = J.spotStory({ name: '玄品ふぐ', note: '港區 · 東京都', icon: 'food' });
assert.match(fugu.intro, /河豚/);
assert.equal(fugu.intro.includes('港區'), false);
assert.equal(fugu.address, '港區 · 東京都');
const fuguCard = J.spotCardHtml(fugu);
assert.match(fuguCard, /必點<\/p><p>[^<]*河豚/);
assert.match(fuguCard, /地址<\/p><p>港區 · 東京都/);
assert.equal(fuguCard.includes('簡介'), false);
const minn = J.spotStory({ name: 'MINN 西葛西', note: '東京都江戶川區西葛西' });
assert.equal(minn.intro, '');
assert.match(minn.address, /江戶川/);
assert.match(J.spotCardHtml(minn), /簡介<\/p><p>這站還沒有收進小檔案。/);
assert.match(J.spotCardHtml(minn), /地址<\/p><p>東京都江戶川區西葛西/);
const bareFood = J.spotStory({ name: '沒聽過的食堂', icon: 'food', note: '港區 · 東京都' });
assert.equal(bareFood.intro, '');
assert.equal(bareFood.label, '必點');
assert.match(J.spotCardHtml(bareFood), /必點<\/p><p>這家還沒有必點紀錄。/);
const afuri = J.spotStory({ name: 'AFURI 阿夫利', summary: '清爽柚子鹽拉麵，新宿／原宿／澀谷皆有店。' });
assert.equal(afuri.label, '必點');
assert.match(afuri.intro, /柚子鹽拉麵/);
assert.equal(afuri.intro.includes('皆有店'), false);
const ginza = J.spotStory({ name: '銀座' });
assert.equal(ginza.food, false);
assert.equal(ginza.label, '簡介');
assert.match(ginza.intro, /百貨|精品/);
[
  ['淺草今半', /壽喜燒|黑毛和牛/],
  ['銀座 篝', /雞白湯/],
  ['六歌仙', /燒肉/],
  ['牛舌の檸檬', /牛舌/],
  ['HARBS 水果千層', /千層/],
  ['牛かつもと村', /石板|炸牛排/],
  ['名代 宇奈とと', /鰻/],
  ['大和壽司（豐洲市場）', /鮪/],
  ['六厘舍', /沾麵/],
  ['煉瓦亭', /蛋包飯|炸豬排/],
  ['麵屋翔 本店', /拉麵/],
  ['無敵家拉麵', /拉麵/],
  ['五代目花山烏冬', /烏龍/],
  ['喫茶You 蛋包飯', /蛋包飯/],
  ['壽司三昧 築地', /壽司/],
  ['鳥藤 親子丼', /親子丼/],
  ['肉的大山 炸肉餅', /炸肉餅/]
].forEach(([name, re]) => {
  const st = J.spotStory({ name, ptype: '餐廳', note: '港區 · 東京都' });
  assert.equal(st.label, '必點', name);
  assert.match(st.intro, re, name + ' ' + st.intro);
  assert.equal(st.intro.includes('港區'), false, name);
  const html = J.spotCardHtml(st);
  assert.match(html, /必點/, name);
  assert.equal(html.includes('簡介'), false, name);
  assert.match(html, /地址/, name);
});

const wideCard = J.placeCard({ x: 211, y: 193 }, { w: 640, h: 420 }, { w: 220, h: 140 });
assert.ok(wideCard.left > 211);
assert.ok(wideCard.left + 220 <= 632);
assert.ok(wideCard.top >= 46);
assert.equal(211 >= wideCard.left - 6 && 211 <= wideCard.left + 226 && 193 >= wideCard.top - 6 && 193 <= wideCard.top + 146, false);
const narrowCard = J.placeCard({ x: 180, y: 90 }, { w: 360, h: 300 }, { w: 210, h: 120 });
assert.ok(narrowCard.left >= 8 && narrowCard.top >= 46);
assert.ok(narrowCard.left + 210 <= 352 && narrowCard.top + 120 <= 292);
assert.equal(180 >= narrowCard.left - 6 && 180 <= narrowCard.left + 216 && 90 >= narrowCard.top - 6 && 90 <= narrowCard.top + 126, false);
const focus = J.focusView({ x: 200, y: 250 }, { x: 0, y: 0, w: 400, h: 500 }, { w: 300, h: 375 }, 1.9, J.focusAnchor(640));
assert.equal(focus.s, 1.9);
assert.ok(focus.x < 0 && focus.y < 0);
const clamped = J.clampMapView({ s: 2, x: 10, y: -9999 }, 300, 400);
assert.equal(clamped.s, 2);
assert.equal(clamped.x, 0);
assert.equal(clamped.y, -400);
assert.equal(J.clampMapView({ s: 0.2, x: 5, y: 5 }, 100, 100).s, 1);
const staged = J.mapStage('city', 'tyo', '<svg class="vmap"></svg>');
assert.match(staged, /data-kind="city"/);
assert.match(staged, /data-city="tyo"/);
assert.match(staged, /aria-label="放大"/);
assert.match(staged, /全圖/);
assert.match(closeTokyo, /data-i="0"/);
assert.match(closeTokyo, /data-i="1"/);
const mixedTokyo = J.cityMapMarkup('tyo', [{ name: '淺草寺', lat: 35.7148, lng: 139.7967 }, { name: '晴空塔', lat: 35.7101, lng: 139.8107 }, { name: '澀谷十字路口', lat: 35.6595, lng: 139.7004 }]);
assert.match(mixedTokyo, /data-i="1"[^>]*aria-label="晴空塔"/);
assert.match(mixedTokyo, /data-i="2"[^>]*aria-label="澀谷十字路口"/);
assert.match(closeTokyo, /aria-label="晴空塔"/);
assert.match(closeTokyo, /role="button"/);
assert.match(closeTokyo, /class="spotpin-hit"/);
assert.match(closeTokyo, /class="spotpin-num"/);
assert.match(closeTokyo, /class="spotpin-ring"/);
assert.match(closeTokyo, />1</);
assert.match(closeTokyo, />2</);
const near = J.nearestPin([{ i: 0, x: 0, y: 0 }, { i: 1, x: 14, y: 4 }], 14, 4, 26);
assert.equal(near.i, 1);
assert.equal(J.nearestPin([{ i: 0, x: 0, y: 0 }], 40, 0, 26), null);
const towerStory = J.spotStory({ name: '東京鐵塔' });
assert.ok(towerStory.intro);
assert.ok(towerStory.trivia.length >= 1 && towerStory.trivia.length <= 3);
assert.match(towerStory.trivia.join(''), /333/);
assert.match(J.spotCardHtml(towerStory), /冷知識/);
['明治神宮', '上野恩賜公園', '皇居外苑', '秋葉原', '哈利波特影城', '澀谷十字路口'].forEach(name => {
  const st = J.spotStory({ name });
  assert.ok(st.trivia.length >= 1, name);
  assert.match(J.spotCardHtml(st), /簡介/, name);
});

const passTrip = trip({
  dest: '東京', orig: 'TPE', archived: true, souvenir: 'pass',
  days: [[
    { kind: 'flight', name: 'BR198 TPE→NRT', from: 'TPE', to: 'NRT', time: '08:30', leg: 'out' },
    { name: '淺草寺', icon: 'sightseeing', visited: true },
    { name: '一蘭拉麵', icon: 'food', visited: true }
  ], [
    { kind: 'flight', name: 'BR199 NRT→TPE', from: 'NRT', to: 'TPE', time: '18:00', leg: 'return' }
  ]]
});
assert.equal(J.suggestSouvenir(Object.assign({}, passTrip, { souvenir: '' }), []), 'pass');
const mem = J.memoryOf(passTrip, [{ date: '2026-04-02', placeName: '一蘭拉麵', dishes: '醬油拉麵' }]);
assert.equal(mem.route, '桃園 → 成田');
assert.equal(mem.backRoute, '成田 → 桃園');
assert.ok(mem.spots.includes('淺草寺'));
assert.ok(mem.eats.includes('一蘭拉麵'));
assert.match(mem.line, /桃園 → 成田/);
assert.match(mem.line, /淺草寺/);
const passHtml = J.souvenirMarkup(passTrip, [], { size: 'lg', cap: false });
assert.match(passHtml, /sov-pass/);
assert.match(passHtml, /<b>桃園<\/b><small>TPE<\/small>/);
assert.match(passHtml, /<b>成田<\/b><small>NRT<\/small>/);
assert.equal(/<b>TPE<\/b>/.test(passHtml), false);
assert.equal(/<b>NRT<\/b>/.test(passHtml), false);
const shop = trip({ dest: '大阪', days: [[{ name: '心齋橋', icon: 'shopping', visited: true }, { name: '道頓堀', icon: 'food', visited: true }]] });
assert.equal(J.suggestSouvenir(shop, []), 'badge');
assert.match(J.souvenirMarkup(shop, [], { size: 'lg' }), /sov-badge/);
assert.match(J.souvenirMarkup(shop, [], { size: 'lg' }), /章魚燒/);
assert.equal(/晴空塔/.test(J.souvenirMarkup(shop, [], { size: 'lg' })), false);
const nature = trip({ dest: '花蓮', days: [[{ name: '太魯閣', icon: 'nature', visited: true }]] });
assert.equal(J.suggestSouvenir(nature, []), 'plaque');
assert.match(J.souvenirMarkup(nature, [], { size: 'mini' }), /sov-plaque/);
const hulCard = J.souvenirMarkup(nature, [], { size: 'lg' });
assert.match(hulCard, /祈福木牌/);
assert.match(hulCard, />花</);
assert.match(hulCard, />蓮</);
assert.match(J.memoryOf(nature, []).line, /花蓮/);
assert.match(J.memoryOf(nature, []).line, /太魯閣/);
assert.equal(/繪馬|御守/.test(hulCard), false);
const see = trip({ dest: '京都', days: [[{ name: '清水寺', icon: 'sightseeing', visited: true }, { name: '伏見稻荷', visited: true }]] });
assert.equal(J.suggestSouvenir(see, []), 'card');
assert.match(J.souvenirMarkup(see, [], { size: 'lg' }), /mcard-shine/);
assert.equal(J.souvenirOf(Object.assign({}, see, { souvenir: 'stamp' }), []), 'stamp');
assert.equal(J.souvenirOf(Object.assign({}, see, { souvenir: 'figure' }), []), 'card');
assert.equal(J.suggestSouvenir(trip({ dest: '東京', days: [[]] }), []), 'pass');
const tokyoStamp = J.souvenirMarkup(trip({ dest: '東京', souvenir: 'stamp' }), [], { size: 'lg' });
assert.match(tokyoStamp, /晴空塔/);
assert.match(tokyoStamp, /sov-poke/);
const lands = new Set();
const foods = new Set();
J.CITIES.forEach(c => {
  const motif = J.motifOf({ dest: c.name, days: [] });
  assert.equal(motif.known, true, c.name);
  assert.equal(motif.id, c.id, c.name);
  assert.ok(motif.land && motif.food && motif.mark && motif.scene, c.name);
  lands.add(motif.land);
  foods.add(motif.food);
  const stamp = J.souvenirMarkup(trip({ dest: c.name, souvenir: 'stamp' }), [], { size: 'mini' });
  assert.match(stamp, new RegExp(motif.land), c.name);
  if (c.id !== 'tyo') assert.equal(stamp.includes('晴空塔'), false, c.name);
  const badge = J.souvenirMarkup(trip({ dest: c.name, souvenir: 'badge' }), [], { size: 'lg' });
  assert.match(badge, new RegExp(motif.food), c.name);
  if (c.id !== 'osa') assert.equal(badge.includes('章魚燒'), false, c.name);
});
assert.equal(lands.size, J.CITIES.length);
assert.equal(foods.size, J.CITIES.length);
assert.equal(J.motifOf({ dest: '札幌', days: [] }).land, '札幌時計台');
assert.equal(J.motifOf({ dest: '九份', days: [] }).land, '九份老街');
assert.notEqual(J.motifOf({ dest: '九份', days: [] }).land, J.motifOf({ dest: '台北', days: [] }).land);
assert.match(J.souvenirMarkup(trip({ dest: '京都', souvenir: 'charm' }), [], { size: 'lg' }), /御守/);
assert.equal(/平安符|護身符/.test(J.souvenirMarkup(trip({ dest: '京都', souvenir: 'charm' }), [], { size: 'lg' })), false);
assert.match(J.souvenirMarkup(trip({ dest: '首爾', souvenir: 'charm' }), [], { size: 'lg' }), /護身符/);
assert.equal(/御守/.test(J.souvenirMarkup(trip({ dest: '首爾', souvenir: 'charm' }), [], { size: 'lg' })), false);
assert.match(J.souvenirMarkup(trip({ dest: '台南', souvenir: 'charm' }), [], { size: 'lg' }), /平安符/);
assert.equal(/御守/.test(J.souvenirMarkup(trip({ dest: '台南', souvenir: 'charm' }), [], { size: 'lg' })), false);
assert.match(J.souvenirMarkup(trip({ dest: '釜山', souvenir: 'plaque' }), [], { size: 'lg' }), /紀念牌/);
assert.match(J.souvenirMarkup(trip({ dest: '京都', souvenir: 'plaque' }), [], { size: 'lg' }), /繪馬/);
const bangkok = J.souvenirMarkup(trip({ dest: '曼谷', souvenir: 'stamp' }), [], { size: 'lg' });
assert.equal(J.motifOf({ dest: '曼谷', days: [] }).known, false);
assert.match(bangkok, /曼谷/);
assert.equal(/晴空塔|章魚燒|御守/.test(bangkok), false);
assert.match(J.souvenirMarkup(trip({ dest: '曼谷', souvenir: 'charm' }), [], { size: 'lg' }), /祈福掛飾/);
assert.deepEqual(J.SOUVENIRS.map(x => x[0]), ['pass', 'card', 'stamp', 'charm', 'badge', 'plaque', 'pack']);
assert.match(page, /stampdown/);
assert.match(page, /charmsway/);
assert.match(page, /badgeglow/);
assert.match(page, /emaswing/);
assert.match(page, /passflutter/);
const packedSov = Share.normTrip(Object.assign({}, passTrip), 0, true);
assert.equal(packedSov.souvenir, 'pass');
assert.equal(Share.normTrip(Object.assign({}, passTrip, { souvenir: 'stamp' }), 0, true).souvenir, 'stamp');
assert.equal(Share.normTrip(Object.assign({}, passTrip, { souvenir: 'pack' }), 0, true).souvenir, 'pack');
assert.equal(Share.normTrip(Object.assign({}, passTrip, { souvenir: 'pack', sovLook: 3 }), 0, true).sovLook, 3);
assert.equal(Share.normTrip(Object.assign({}, passTrip, { sovLook: 9 }), 0, true).sovLook, undefined);
assert.equal(Share.normTrip(Object.assign({}, passTrip, { souvenir: 'nope' }), 0, true).souvenir, undefined);
assert.equal(Share.normTrip(Object.assign({}, passTrip), 0, false).souvenir, undefined);
const keepLocal = { days: [[]], expenses: [], tomb: {}, expTomb: {}, metaRev: 5, dest: '東京', dep: '2026-04-01', ret: '2026-04-05', pax: 2, orig: 'TPE', archived: true, archivedAt: 1712100000000, souvenir: 'pass' };
const keepRemote = { days: [[]], expenses: [], tomb: {}, expTomb: {}, metaRev: 9, dest: '東京', dep: '2026-04-01', ret: '2026-04-05', pax: 2, orig: 'TPE', archived: true, archivedAt: 1712100000000, souvenir: 'card' };
assert.equal(mergeTrip(keepLocal, keepRemote).souvenir, 'card');
assert.equal(mergeTrip(keepRemote, keepLocal).souvenir, 'card');
assert.equal(mergeTrip(Object.assign({}, keepRemote, { metaRev: 1 }), keepLocal).souvenir, 'pass');
const wall = J.shelfHtml([passTrip, Object.assign({}, nature, { id: 'hul', archived: true, archivedAt: 10 })]);
assert.match(wall, /sov-pass/);
assert.match(wall, /sov-plaque/);
assert.match(wall, /旅途|收藏|打開收藏/);
const six = ['pass', 'card', 'stamp', 'charm', 'badge', 'plaque'].map((souvenir, i) => trip({
  id: 's' + i,
  dest: ['東京', '京都', '大阪', '首爾', '台北', '花蓮'][i],
  souvenir,
  archived: true,
  archivedAt: 100 - i
}));
const sixWall = J.shelfHtml(six);
['sov-pass', 'sov-card', 'sov-stamp', 'sov-charm', 'sov-badge', 'sov-plaque'].forEach(k => assert.match(sixWall, new RegExp(k)));
assert.equal(/sov-figure|禮包|手辦/.test(sixWall), false);
assert.equal(/sov-pack/.test(sixWall), false);
const sovCss = page.slice(page.indexOf('.sovshelf'), page.indexOf('@media (prefers-reduced-motion'));
assert.equal(/rotate\(/.test(sovCss), false);
[['pass', '東京'], ['card', '京都'], ['stamp', '大阪'], ['charm', '首爾'], ['badge', '台北'], ['plaque', '花蓮'], ['pack', '大阪']].forEach(([kind, dest]) => {
  const html = J.souvenirMarkup(trip({ dest, souvenir: kind }), [], { size: 'lg' });
  assert.equal(/rotate\(|skew[XY]?\(/.test(html), false, kind);
});
const lookCities = { pass: '東京', card: '釜山', stamp: '大阪', charm: '京都', badge: '台北', plaque: '首爾', pack: '台南' };
Object.keys(J.LOOKS).forEach(kind => {
  assert.equal(J.LOOKS[kind].length, 5, kind);
  J.LOOKS[kind].forEach((row, i) => {
    const html = J.souvenirMarkup(trip({
      dest: lookCities[kind],
      souvenir: kind,
      sovLook: i,
      orig: 'TPE',
      days: kind === 'pass' ? [[{ kind: 'flight', name: 'BR198 TPE→NRT', from: 'TPE', to: 'NRT', leg: 'out' }]] : [[]]
    }), [], { size: 'lg', look: i });
    assert.match(html, new RegExp('data-look="' + row[0] + '"'), kind + i);
    assert.match(html, new RegExp(lookCities[kind]), kind + row[1]);
    assert.equal(/rotate\(|skew[XY]?\(/.test(html), false, kind + row[0]);
    const motif = J.motifOf({ dest: lookCities[kind], days: [] });
    assert.match(html, new RegExp(motif.land), kind + ' ' + row[1]);
  });
});
['東京', '大阪', '京都'].forEach(dest => {
  for (let i = 0; i < 5; i++) {
    const html = J.souvenirMarkup(trip({ dest, souvenir: 'charm', sovLook: i }), [], { size: 'lg', look: i });
    assert.match(html, /御守/, dest + i);
    assert.equal(/平安符|護身符/.test(html), false, dest + i);
  }
});
['台北', '台南', '高雄'].forEach(dest => {
  for (let i = 0; i < 5; i++) {
    const html = J.souvenirMarkup(trip({ dest, souvenir: 'charm', sovLook: i }), [], { size: 'lg', look: i });
    assert.match(html, /平安符/, dest + i);
    assert.equal(/御守/.test(html), false, dest + i);
  }
});
['首爾', '釜山', '濟州'].forEach(dest => {
  for (let i = 0; i < 5; i++) {
    const html = J.souvenirMarkup(trip({ dest, souvenir: 'charm', sovLook: i }), [], { size: 'lg', look: i });
    assert.match(html, /護身符/, dest + i);
    assert.equal(/御守/.test(html), false, dest + i);
  }
});
const packHtml = J.souvenirMarkup(trip({ dest: '大阪', souvenir: 'pack' }), [], { size: 'lg' });
assert.match(packHtml, /卡包/);
assert.match(packHtml, /章魚燒/);
assert.match(J.memoryOf(trip({ dest: '大阪', souvenir: 'pack' }), []).line, /大阪城/);
assert.equal(J.lookTitle('charm', 2, J.memoryOf(trip({ dest: '東京', souvenir: 'charm' }), [])), '神社掛排');
assert.equal(J.lookTitle('charm', 2, J.memoryOf(trip({ dest: '台北', souvenir: 'charm' }), [])), '木架掛排');
assert.equal(J.lookTitle('charm', 4, J.memoryOf(trip({ dest: '台南', souvenir: 'charm' }), [])), '平安符');
assert.equal(J.lookTitle('plaque', 2, J.memoryOf(trip({ dest: '首爾', souvenir: 'plaque' }), [])), '木架掛牆');

console.log('journey tests ok');
