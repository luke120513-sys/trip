import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const FX = require('../fx.js');
const Share = require('../share.js');
const LZ = require('../vendor/lz-string.min.js');
const Notify = require('../notify.js');
const Food = require('../food.js');

const csv = [
  '幣別,匯率,本行買入,本行賣出,本行買入,本行賣出',
  'USD,美元,31.5,32.2,31.8,32.05',
  'JPY,日圓,0.2,0.22,0.205,0.215',
  'EUR,歐元,34,35.2,34.4,34.9'
].join('\n');
const bot = FX.parseBotCsv(csv);
assert.equal(bot.src, 'bot');
assert.equal(bot.rates.USD.cashSell, 32.2);
assert.equal(bot.rates.USD.spotSell, 32.05);
assert.equal(FX.quote(bot, 'USD', 'cash').rate, 32.2);
assert.equal(FX.quote(bot, 'USD', 'card').rate, 32.05);
assert.equal(FX.quote(bot, 'USD', 'card').side, '即期賣出');

const card = FX.toTWD(100, { currency: 'USD', rateKind: 'card', feeOn: true, feePct: 1.5 }, bot);
assert.ok(Math.abs(card.twd - 100 * 32.05 * 1.015) < 0.001);
const custom = FX.toTWD(10, { currency: 'JPY', rateKind: 'cash', customRate: 0.25 }, bot);
assert.equal(custom.twd, 2.5);
assert.equal(custom.how, 'custom');
const noFee = FX.toTWD(100, { currency: 'USD', rateKind: 'card', feeOn: false }, bot);
assert.ok(Math.abs(noFee.twd - 3205) < 0.001);
assert.equal(FX.parseBotCsv('<html>challenge'), null);
const er = FX.fromErApi({ USD: 1, TWD: 32, JPY: 150 }, 1000);
assert.ok(Math.abs(er.rates.JPY.cashSell - 32 / 150) < 1e-9);
assert.match(FX.fxLabel(bot), /臺灣銀行牌告・更新於/);

const trip = {
  dest: '大阪', dep: '2026-11-02', ret: '2026-11-04', pax: 2, orig: 'TPE',
  days: [[{ time: '09:00', name: '城', note: 'a'.repeat(300), link: 'https://example.com/x' }], []],
  expenses: [{ title: '飯', amount: 12, currency: 'JPY', rateKind: 'cash', note: '備註' }]
};
const packed = Share.packTrip(trip, LZ);
assert.ok(packed.param && packed.param.length < 7000);
const back = Share.unpackAdd(packed.param, LZ);
assert.equal(back.kind, 'trip');
assert.equal(back.trip.dest, '大阪');
assert.equal(back.trip.expenses[0].title, '飯');
const bad = Share.validateTrips([{ dest: '東京' }]);
assert.equal(bad.ok, false);
const file = Share.validateTrips({ v: 1, trips: [trip] }, { backup: true });
assert.equal(file.ok, true);
assert.equal(file.trips[0].dest, '大阪');
const stamped = Share.validateTrips({ v: 1, trips: [{ dest: '東京', dep: '2026-11-02', ret: '2026-11-03', pax: 1, orig: 'TPE', days: [[{ name: '淺草寺', time: '15:00', visited: true, visitedAt: 1760000000000 }]], expenses: [] }] }, { backup: true });
assert.equal(stamped.trips[0].days[0][0].visited, true);
assert.equal(stamped.trips[0].days[0][0].visitedAt, 1760000000000);
const plain = Share.validateTrips({ v: 1, trips: [{ dest: '東京', dep: '2026-11-02', ret: '2026-11-03', pax: 1, orig: 'TPE', days: [[{ name: '上野', visited: false }]], expenses: [] }] }, { backup: true });
assert.equal(plain.trips[0].days[0][0].visited, undefined);
const pageHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(pageHtml, /到此一遊/);
assert.match(pageHtml, /stamphit/);
assert.match(pageHtml, /\.vstamp\{[^}]*width:64px;height:64px[^}]*pointer-events:none/);
assert.match(pageHtml, /\.xtop\.stamped/);
assert.equal(pageHtml.includes('visitHold'), false);
assert.match(pageHtml, /右滑蓋上到此一遊，左滑可取消/);
assert.equal(pageHtml.includes('按住約半秒'), false);
assert.match(pageHtml, /class="dayprog"/);
assert.match(pageHtml, /prefers-reduced-motion:reduce[\s\S]*\.vstamp\.thump,\.dayprog i\{animation:none\}/);
const flight = Share.unpackAdd(JSON.stringify({ type: 'flight', data: { flightNo: 'BR198', date: '2026-11-02' } }), LZ);
assert.equal(flight.kind, 'flight');

const dep = '2026-11-02';
const at = new Date(2026, 10, 1, 10, 0, 0, 0).getTime();
const notes = Notify.planNotes({
  now: at,
  version: '2.9',
  storedVersion: '2.8',
  trips: [{
    id: 't1', dest: '大阪', dep, ret: '2026-11-04',
    days: [[{ kind: 'flight', time: '09:00', name: 'BR198', sid: 'f1' }, { time: '11:00', name: '城' }]]
  }],
  weather: { 大阪: { daily: { time: ['2026-11-02'], weather_code: [61], precipitation_probability_max: [80] } } }
});
assert.ok(notes.some(n => n.kind === 'flight' && n.id.endsWith(':24')));
assert.ok(notes.some(n => n.kind === 'wx'));
assert.ok(notes.some(n => n.kind === 'app'));
const morning = Notify.planNotes({
  now: new Date(2026, 10, 2, 8, 30, 0, 0).getTime(),
  version: '2.9',
  storedVersion: '2.9',
  trips: [{ id: 't1', dest: '大阪', dep, ret: '2026-11-04', days: [[{ kind: 'flight', time: '09:00', name: 'BR198', sid: 'f1' }, { time: '11:00', name: '城' }]] }]
});
assert.ok(morning.some(n => n.kind === 'spot'));
assert.ok(morning.some(n => n.id.endsWith(':3')));
assert.equal(Notify.isRain(61, 0), true);
assert.equal(Notify.isRain(0, 10), false);
const merged = Notify.mergeNotes([{ id: 'a', read: true, at: 1 }], [{ id: 'a', read: false, at: 2, title: 'x' }], ['gone']);
assert.equal(merged[0].read, true);
assert.equal(Notify.mergeNotes([], [{ id: 'gone' }], ['gone']).length, 0);

const ramen = { name: '一蘭', cuisine: 'ramen', score: 8, km: 0.4, priceLevel: 2, placeKey: 'p1' };
const cafe = { name: '星巴克', cuisine: 'coffee_shop', score: 1, km: 0.2, priceLevel: 3, placeKey: 'p2' };
assert.equal(Food.matchKind(ramen, 'ramen'), true);
assert.equal(Food.parsePriceLevel({ price_level: '2' }), 2);
assert.equal(Food.localsStars(8), 4.5);
assert.equal(Food.canAddDiary([{ placeKey: 'p1', date: '2026-10-19' }], 'p1', '2026-10-19'), false);
assert.equal(Food.canAddDiary([], 'p1', '2026-10-19'), true);
const filtered = Food.applyFoodFilter([ramen, cafe], { kinds: ['ramen'], price: 0, minLocal: 4, sort: 'local' }, { p1: { avg: 5, n: 2 } });
assert.deepEqual(filtered.map(p => p.name), ['一蘭']);
assert.equal(Food.artKind('ramen'), 'ramen');

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const foodSrc = readFileSync(new URL('../food.js', import.meta.url), 'utf8');
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
assert.equal(html.includes("['new','新增']"), false);
assert.equal(html.includes("['edit','編輯']"), false);
assert.ok(html.includes('＋ 新增行程'));
assert.ok(html.includes('建立第一個行程'));
assert.ok(html.includes('修改這份行程'));
assert.ok(html.includes('用連結分享'));
assert.ok(html.includes('function tripMenu'));
assert.ok(html.includes('function shareSheet'));
assert.ok(html.includes('function memberSheet'));
assert.ok(html.includes('aria-label="分享"'));
assert.ok(html.includes('aria-label="更多"'));
assert.ok(html.includes('onclick="planSheet()">一鍵排行程'));
assert.equal(html.includes('onclick="print()">列印行程'), false);
assert.equal(html.includes('onclick="shareCloud()">一起改'), false);
assert.ok(foodSrc.includes('在地人推薦度'));
assert.ok(html.includes('food.js'));
assert.ok(html.includes('id="nfyn"'));
assert.ok(html.includes('v2.14.0'));
assert.ok(rules.includes('match /reviews/{id}'));
assert.ok(rules.includes('match /backups/{uid}'));
assert.ok(rules.includes('match /activity/{actId}'));

console.log('batch tests ok');
