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

let res = J.evaluate([jp], diary, {}, 1712000000000);
const ids = new Set(res.fresh.map(c => c.id));
['jp-first', 'jp-ramen', 'jp-shrine', 'jp-rail', 'jp-konbini', 'jp-tokyo', 'jp-early', 'jp-foodie', 'jp-perfect'].forEach(id => {
  assert.ok(ids.has(id), id);
  assert.equal(res.earned[id], 1712000000000);
});
assert.equal(ids.has('jp-archive'), false);
assert.equal(ids.has('jp-osaka'), false);

jp.archived = true;
jp.archivedAt = 1712100000000;
res = J.evaluate([jp], diary, res.earned, 1712200000000);
assert.deepEqual(res.fresh.map(c => c.id), ['jp-archive']);
assert.equal(res.earned['jp-first'], 1712000000000);
const again = J.evaluate([jp], diary, res.earned, 1712300000000);
assert.equal(again.fresh.length, 0);

const earlyOnly = trip({ days: [[spot('市場', { visited: true, time: '07:30' })]] });
assert.ok(J.evaluate([earlyOnly], [], {}, 1712000000000).fresh.some(c => c.id === 'jp-early'));
const late = trip({ days: [[spot('市場', { visited: true, time: '09:00', visitedAt: Date.parse('2026-04-02T09:10:00') })]] });
assert.equal(J.evaluate([late], [], {}, 1712000000000).fresh.some(c => c.id === 'jp-early'), false);

const kr = trip({
  dest: '首爾',
  days: [[
    spot('景福宮', { visited: true, icon: 'sightseeing' }),
    spot('明洞逛街'),
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
['kr-first', 'kr-spicy', 'kr-palace', 'kr-shop', 'kr-bbq', 'kr-cafe', 'kr-perfect'].forEach(id => assert.ok(krIds.has(id), id));
assert.equal(krIds.has('kr-archive'), false);

const tw = trip({
  dest: '高雄',
  days: [[
    spot('駁二', { visited: true }),
    spot('蓮池潭', { visited: true }),
    spot('六合夜市', { visited: true }),
    spot('瑞豐夜市')
  ], day.map(s => Object.assign({}, s))]
});
const twDiary = [
  { date: '2026-04-02', text: '牛肉麵' },
  { date: '2026-04-03', placeName: '滷肉飯', text: '配湯' }
];
const twRes = J.evaluate([tw], twDiary, {}, 1712000000000);
const twIds = new Set(twRes.fresh.map(c => c.id));
['tw-first', 'tw-kaohsiung', 'tw-night', 'tw-noodle', 'tw-perfect'].forEach(id => assert.ok(twIds.has(id), id));
assert.equal(twIds.has('tw-archive'), false);
assert.equal(twIds.has('tw-taipei'), false);
tw.archived = true;
assert.deepEqual(J.evaluate([tw], twDiary, twRes.earned, 1712400000000).fresh.map(c => c.id), ['tw-archive']);
const packedTw = Share.normTrip(Object.assign({}, trip({ dest: '台南' }), { themeStyle: 'tw' }), 0, true);
assert.equal(packedTw.themeStyle, 'tw');
const noon = trip({ dest: '首爾', days: [[spot('烤肉', { time: '12:00' })]] });
assert.equal(J.evaluate([noon], [], {}, 1712000000000).fresh.some(c => c.id === 'kr-bbq'), false);
const nightNote = trip({ dest: '首爾', days: [[]] });
assert.ok(J.evaluate([nightNote], [{ date: '2026-04-02', text: '烤肉' }], {}, 1712000000000).fresh.some(c => c.id === 'kr-bbq'));

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

assert.equal(J.CARDS.filter(c => c.country === 'jp').length, 11);
assert.equal(J.CARDS.filter(c => c.country === 'kr').length, 8);
assert.equal(J.CARDS.filter(c => c.country === 'tw').length, 15);
assert.ok(J.CARDS.every(c => c.title && c.hint && c.desc && c.test));

const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
assert.match(sw, /tripmate-v56/);
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

console.log('journey tests ok');
