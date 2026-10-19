import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const Tickets = require('../tickets.js');
const Share = require('../share.js');
const LZ = require('../vendor/lz-string.min.js');

const gmail = [
  'Flight: BR198 TPE to NRT',
  'Confirmation code: ABC12D',
  'Nov 2, 2026 08:15',
  'https://mail.google.com/mail/u/0/#inbox/abc'
].join('\n');
const flight = Tickets.parsePasted(gmail);
assert.equal(flight.type, '機票');
assert.equal(flight.name, 'BR198 TPE to NRT');
assert.equal(flight.booking, 'ABC12D');
assert.equal(flight.date, '2026-11-02');
assert.equal(flight.time, '08:15');
assert.match(flight.link, /^https:\/\/mail\.google\.com/);

const hotel = [
  'ホテル：新宿ワシントンホテル',
  '予約番号：HTL99881',
  '2026年11月3日 15:00 チェックイン'
].join('\n');
const stay = Tickets.parsePasted(hotel);
assert.equal(stay.type, '飯店');
assert.equal(stay.name, '新宿ワシントンホテル');
assert.equal(stay.booking, 'HTL99881');
assert.equal(stay.date, '2026-11-03');
assert.equal(stay.time, '15:00');

const jr = 'JR東日本 新幹線\n予約番号：XYZ98765\n2026-11-04 09:30';
const rail = Tickets.parsePasted(jr);
assert.equal(rail.type, '交通');
assert.equal(rail.booking, 'XYZ98765');
assert.equal(rail.date, '2026-11-04');
assert.equal(rail.time, '09:30');

const today = '2026-11-02';
const sorted = Tickets.sortTickets([
  { name: '過去', date: '2026-10-01' },
  { name: '未定' },
  { name: '之後', date: '2026-12-01', time: '09:00' },
  { name: '今天晚', date: '2026-11-02', time: '18:00' },
  { name: '今天早', date: '2026-11-02', time: '08:00' }
], today);
assert.deepEqual(sorted.map(x => x.name), ['今天早', '今天晚', '之後', '未定', '過去']);

const trip = { dep: '2026-11-02', days: [[{ name: '淺草寺' }], [{ name: '晴空塔' }]] };
assert.equal(Tickets.dayYmd(trip, 0), '2026-11-02');
assert.equal(Tickets.dayYmd(trip, 1), '2026-11-03');
assert.equal(Tickets.isToday({ day: 0, spot: '淺草寺' }, trip, '2026-11-02'), true);
assert.equal(Tickets.isToday({ date: '2026-11-03' }, trip, '2026-11-02'), false);

const plan = Tickets.decideFiles([
  { id: 'a', bytes: 100 },
  { id: 'b', bytes: 50 },
  { id: 'c', bytes: 0 }
], 120);
assert.deepEqual(plan.keep, ['a']);
assert.equal(plan.omitted, true);
assert.match(plan.note, /太大/);
const none = Tickets.decideFiles([{ id: 'big', bytes: 500 }], 100);
assert.deepEqual(none.keep, []);
assert.equal(none.note, Tickets.NOTE);
const all = Tickets.decideFiles([{ id: 'ok', bytes: 40 }], 100);
assert.equal(all.omitted, false);
assert.equal(all.note, '');

const b64 = Buffer.from('hello-ticket-image').toString('base64');
const huge = 'A'.repeat(1600000);
const wallet = {
  id: 'local1',
  dest: '東京', dep: '2026-11-02', ret: '2026-11-04', pax: 2, orig: 'TPE',
  days: [[{ name: '淺草寺', time: '10:00' }]],
  expenses: [],
  tickets: [{
    id: 'tk1', name: 'BR198 登機證', type: '機票', date: '2026-11-02', time: '08:15',
    day: 0, spot: '淺草寺', booking: 'SECRET99', notes: '靠窗',
    files: [
      { id: 'f1', name: 'pass.jpg', mime: 'image/jpeg', bytes: 18, data: b64 },
      { id: 'f2', name: 'huge.pdf', mime: 'application/pdf', bytes: 9, data: huge },
      { id: 'f3', name: 'bad.jpg', mime: 'image/jpeg', bytes: 4, data: 'not base64 !!!' }
    ]
  }]
};

const packed = Share.packTrip(wallet, LZ);
const shared = LZ.decompressFromEncodedURIComponent(packed.param);
assert.equal(shared.includes('SECRET99'), false);
assert.equal(shared.includes('靠窗'), false);
assert.equal(shared.includes('pass.jpg'), false);
const unpacked = Share.unpackAdd(packed.param, LZ);
assert.equal(unpacked.trip.tickets, undefined);

const backup = Share.validateTrips({ v: 1, trips: [wallet] }, { backup: true });
assert.equal(backup.ok, true);
const kept = backup.trips[0].tickets[0];
assert.equal(kept.booking, 'SECRET99');
assert.equal(kept.spot, '淺草寺');
assert.equal(kept.files[0].data, b64);
assert.equal(kept.files[1].data, undefined);
assert.equal(kept.files[2].data, undefined);

const meta = Tickets.normTicket(wallet.tickets[0]);
assert.equal(meta.files[0].data, undefined);
assert.equal(meta.booking, 'SECRET99');
assert.equal(Tickets.iconOf('機票'), 'icons/ui-fly.svg');
assert.equal(Tickets.iconOf('餐廳'), 'icons/cat-food.svg');
assert.equal(Tickets.guessType('迪士尼門票'), '門票');

const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
assert.match(sw, /tripmate-v32/);
assert.match(sw, /tickets\.js/);
const collab = readFileSync(new URL('../collab.js', import.meta.url), 'utf8');
assert.match(collab, /const tickets = t\.tickets/);
assert.match(collab, /if \(Array\.isArray\(tickets\)\) t\.tickets = tickets/);
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /分享連結預設不含票券/);
assert.match(html, /票券照片與 PDF 只留在這台裝置/);

console.log('tickets.test.mjs ok');
