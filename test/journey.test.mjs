import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const J = require('../journey.js');
const Share = require('../share.js');
const { mergeTrip } = require('../sync.js');

const trip = (over) => Object.assign({
  id: 't1', dest: '東京', dep: '2026-04-01', ret: '2026-04-05', pax: 2, orig: 'TPE', days: [[]], expenses: []
}, over);

assert.equal(J.detectCountry(trip({ dest: 'NRT' })), 'jp');
assert.equal(J.detectCountry(trip({ dest: '成田', days: [[{ name: '飯店', to: 'HND' }]] })), 'jp');
assert.equal(J.detectCountry(trip({ dest: '關西', days: [[{ name: '航班', to: 'KIX' }]] })), 'jp');
assert.equal(J.detectCountry(trip({ dest: '首爾', days: [[{ name: '航班', to: 'ICN' }]] })), 'kr');
assert.equal(J.detectCountry(trip({ dest: '金浦', days: [[{ from: 'GMP', to: 'TPE', name: '回程' }]] })), 'kr');
assert.equal(J.detectCountry(trip({ dest: '釜山', days: [[{ name: '航班', to: 'PUS' }]] })), 'kr');
assert.equal(J.detectCountry(trip({ dest: '東京' })), 'jp');
assert.equal(J.detectCountry(trip({ dest: '首爾' })), 'kr');
assert.equal(J.detectCountry(trip({ dest: '高雄', orig: 'TPE', days: [[{ name: '駁二', from: 'TPE', to: 'KHH' }]] })), '');

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
assert.ok(J.CARDS.some(c => c.id === 'jp-first' && !c.city && !c.legacy));
assert.ok(J.CARDS.some(c => c.id === 'jp-archive' && !c.legacy));
assert.ok(J.CARDS.some(c => c.id === 'kr-first' && !c.legacy));
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

const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
assert.match(sw, /tripmate-v55/);
assert.match(sw, /journey\.js/);

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

console.log('journey tests ok');
