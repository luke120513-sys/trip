import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const Legs = require('../legs.js');

const narita = { lat: 35.772, lng: 140.3929 };
const uenoShop = { lat: 35.7085, lng: 139.7748 };
const sensoji = { lat: 35.7148, lng: 139.7967 };
const airportKm = Legs.km(narita, uenoShop);
assert.ok(airportKm > 50 && airportKm < 80, 'narita to ueno km ' + airportKm);

const table = Legs.knownRoute(narita, uenoShop);
assert.equal(table.source, 'table');
assert.equal(table.alight, '京成上野');
assert.ok(table.steps.some(s => s.kind === 'ride' && s.line.includes('Skyliner') && s.lineOrig.includes('スカイライナー')));
assert.ok(table.steps.some(s => s.alight === '京成上野'));
assert.match(table.fare, /2,580/);

const walkKm = Legs.km(uenoShop, sensoji);
assert.ok(walkKm > 1.6 && walkKm < 2.6, 'ueno to sensoji ' + walkKm);
const walk = Legs.walkMin(walkKm);
assert.ok(walk >= 20 && walk <= 35, 'walk min ' + walk);
assert.match(Legs.clash('14:00', '14:00', walk), /14:00/);
assert.match(Legs.clash('14:00', '14:00', walk), /撞/);
assert.match(Legs.clash('14:00', '14:10', 27), /只隔 10 分/);
assert.equal(Legs.clash('10:00', '11:00', 20), '');
assert.match(Legs.pinWarn(0.2, '玄品ふぐ', '淺草寺'), /地圖釘/);
assert.equal(Legs.pinWarn(walkKm, '玄品ふぐ', '淺草寺'), '');

assert.equal(Legs.stationZh('成田空港 Narita Airport Terminal 1'), '成田機場第1航廈');
assert.equal(Legs.stationZh('京成上野 Keisei-Ueno'), '京成上野');
assert.equal(Legs.stationZh('浅草 Asakusa'), '淺草');
assert.equal(Legs.lineZh('京成スカイライナー Keisei Skyliner'), '京成 Skyliner');
assert.equal(Legs.lineZh('東京メトロ銀座線 Tokyo Metro Ginza Line'), '東京地鐵銀座線');
assert.equal(Legs.lineZh('京成成田スカイアクセス線'), '京成成田 Sky Access 線');
assert.equal(Legs.lineZh('つくばエクスプレス Tsukuba Express'), '筑波快線');
assert.equal(Legs.stationZh('Keisei-Takasago'), '京成高砂');
const tx = Legs.fromTransitous({ itineraries: [{ duration: 600, legs: [{ mode: 'REGIONAL_RAIL', duration: 180, routeLongName: 'つくばエクスプレス Tsukuba Express', routeColor: '000099', headsign: 'Tsukuba', from: { name: '新御徒町 Shin-Okachimachi' }, to: { name: '浅草 Asakusa' }, intermediateStops: [] }] }] });
assert.equal(tx.steps[0].line, '筑波快線');
assert.equal(tx.steps[0].lineOrig, 'つくばエクスプレス');
assert.equal(tx.steps[0].direction, '筑波');
assert.equal(tx.steps[0].alight, '淺草');

const parsed = Legs.fromTransitous({
  itineraries: [{
    duration: 3360,
    legs: [
      { mode: 'WALK', duration: 180, distance: 200, from: { name: 'START' }, to: { name: '成田空港 Narita Airport Terminal 1' } },
      { mode: 'REGIONAL_RAIL', duration: 3060, routeShortName: 'Skyliner', routeLongName: '京成スカイライナー Keisei Skyliner', routeColor: 'EE1C25', headsign: '京成上野 Keisei-Ueno', from: { name: '成田空港 Narita Airport Terminal 1' }, to: { name: '京成上野 Keisei-Ueno' }, intermediateStops: [{}, {}] },
      { mode: 'WALK', duration: 120, distance: 150, from: { name: '京成上野 Keisei-Ueno' }, to: { name: 'END' } }
    ]
  }]
});
assert.equal(parsed.source, 'transitous');
assert.equal(parsed.alight, '京成上野');
const ride = parsed.steps.find(s => s.kind === 'ride');
assert.equal(ride.line, '京成 Skyliner');
assert.equal(ride.lineOrig, '京成スカイライナー');
assert.equal(ride.color, '#EE1C25');
assert.equal(ride.direction, '京成上野');
assert.equal(ride.stops, 3);
assert.equal(ride.alight, '京成上野');
assert.equal(parsed.steps[0].to, '成田機場第1航廈');
assert.equal(parsed.steps.at(-1).from, '京成上野');
assert.equal(Legs.fromTransitous({ itineraries: [] }), null);
assert.equal(Legs.lineZh('8298941'), '');
assert.equal(Legs.lineZh('20001791'), '');

const keikyu = Legs.fromTransitous({ itineraries: [{ duration: 1800, legs: [{ mode: 'REGIONAL_RAIL', duration: 1800, routeShortName: '8298941', routeLongName: '', agencyName: '京急', routeColor: '00AEEF', headsign: '三崎口', from: { name: '品川' }, to: { name: '三崎口' }, intermediateStops: [{}, {}] }] }] });
const keikyuRide = keikyu.steps.find(s => s.kind === 'ride');
assert.equal(keikyuRide.line, '京急電車');
assert.equal(keikyuRide.direction, '三崎口');
assert.equal(keikyuRide.short, '');
assert.doesNotMatch(keikyuRide.line, /\d/);

const tozai = Legs.fromTransitous({ itineraries: [{ duration: 900, legs: [{ mode: 'SUBWAY', duration: 900, routeShortName: '20001791', routeLongName: '東西線', agencyName: '東京メトロ', headsign: '西船橋', from: { name: '大手町' }, to: { name: '西船橋' }, intermediateStops: [] }] }] });
assert.equal(tozai.steps[0].line, '東京地鐵東西線');
assert.equal(tozai.steps[0].direction, '西船橋');
assert.doesNotMatch(tozai.steps[0].line, /20001791/);

const asakusa = Legs.fromTransitous({ itineraries: [{ duration: 600, legs: [{ mode: 'SUBWAY', duration: 600, routeShortName: '8298941', routeLongName: '都営浅草線', agencyName: '東京都交通局', headsign: '押上', from: { name: '浅草' }, to: { name: '押上' }, intermediateStops: [] }] }] });
assert.equal(asakusa.steps[0].line, '都營淺草線');
assert.doesNotMatch(asakusa.steps[0].line, /\d{4,}/);

const busOnly = Legs.fromTransitous({ itineraries: [{ duration: 400, legs: [{ mode: 'BUS', duration: 400, routeShortName: '12345678', routeLongName: '12345678', agencyName: '', headsign: '池袋', from: { name: '上野' }, to: { name: '池袋' }, intermediateStops: [] }] }] });
assert.equal(busOnly.steps[0].line, '公車');

const jrId = Legs.fromTransitous({ itineraries: [{ duration: 500, legs: [{ mode: 'REGIONAL_RAIL', duration: 500, routeShortName: '4042941', displayName: '4042941', routeLongName: '', agencyName: 'JR', headsign: '逗子', from: { name: '品川' }, to: { name: '逗子' }, intermediateStops: [] }] }] });
assert.equal(jrId.steps[0].line, 'JR 電車');
assert.doesNotMatch(JSON.stringify(jrId.steps), /4042941/);

assert.equal(Legs.stayMin({ icon: 'food' }), 75);
assert.equal(Legs.stayMin({ ptype: '餐廳' }), 75);
assert.equal(Legs.stayMin({ icon: 'food', stay: 40 }), 40);
assert.equal(Legs.stayMin({ kind: 'hotel' }), 25);
assert.equal(Legs.stayMin({ kind: 'hotel', note: '退房' }), 15);
assert.equal(Legs.stayMin({ icon: 'sightseeing' }), 60);
assert.equal(Legs.stayMin({ kind: 'flight' }), 0);
assert.equal(Legs.stayMin({ icon: 'cafe' }), 45);
assert.equal(Legs.stayMin({ icon: 'shopping' }), 45);

const sug = Legs.suggestMove('15:00', '15:00', 25, 0, 5);
assert.equal(sug.arriveText, '15:25');
assert.equal(sug.slotText, '15:30');
assert.equal(sug.conflict, true);
assert.equal(Legs.suggestMove('15:00', '15:00', 22, 0, 5).slotText, '15:30');
assert.equal(Legs.suggestMove('15:00', '15:22', 22, 0, 0).slotText, '15:25');
assert.equal(Legs.suggestMove('15:00', '16:00', 25, 0, 5).conflict, false);
assert.match(Legs.clash('15:00', '16:00', 20, 75), /待 75/);
assert.match(Legs.clash('15:00', '15:00', 25, 75), /兩個時間都是 15:00/);
assert.match(Legs.clash('15:00', '15:00', 25, 75), /撞/);

const chain = [
  { time: '15:00', name: '上野', stay: 0, icon: 'sightseeing' },
  { time: '15:00', name: '淺草', stay: 0, icon: 'sightseeing' },
  { time: '15:20', name: '晴空塔', stay: 0, icon: 'sightseeing' },
  { time: '19:00', name: '晚餐', stay: 0, icon: 'food' }
];
const moved = Legs.shiftChain(chain, j => [0, 25, 10, 10][j], { start: 1, cats: chain.map(s => s.icon) });
assert.deepEqual(moved.changed.map(c => c.to), ['15:30', '15:50']);
assert.equal(moved.spots[3].time, '19:00');
assert.equal(chain[1].time, '15:00');

const foodChain = [
  { time: '12:00', name: '午餐', icon: 'food' },
  { time: '13:00', name: '寺', icon: 'sightseeing' }
];
const foodMoved = Legs.resolveDay(foodChain, j => (j === 1 ? 20 : 0), { cats: ['food', 'sightseeing'] });
assert.equal(foodMoved.spots[0].time, '12:00');
assert.equal(foodMoved.spots[1].time, '13:40');

const fixed = [
  { time: '15:00', name: '機場', stay: 0 },
  { time: '15:00', name: 'BR198', kind: 'flight', stay: 0 },
  { time: '15:10', name: '飯店', stay: 0, icon: 'hotel' }
];
const fixedMoved = Legs.shiftChain(fixed, j => [0, 25, 20][j], { start: 1, cascade: true });
assert.equal(fixedMoved.changed.length, 1);
assert.equal(fixedMoved.changed[0].name, '飯店');
assert.equal(fixedMoved.changed[0].to, '15:25');
assert.equal(fixedMoved.skipped[0].name, 'BR198');
assert.equal(fixedMoved.spots[1].time, '15:00');

const ticketSpots = [
  { time: '15:00', name: '上野', stay: 0 },
  { time: '15:00', name: '迪士尼', stay: 0 }
];
const ticketMoved = Legs.resolveDay(ticketSpots, j => (j === 1 ? 25 : 0), { day: 0, tickets: [{ spot: '迪士尼', day: 0, time: '15:00' }] });
assert.equal(ticketMoved.changed.length, 0);
assert.equal(ticketMoved.skipped[0].name, '迪士尼');
assert.equal(Legs.isFixed(ticketSpots[1], [{ spot: '迪士尼', day: 1, time: '15:00' }], 0), false);

const gap = [
  { time: '10:00', name: 'A', stay: 0 },
  { time: '10:00', name: 'B', stay: 0 },
  { time: '15:00', name: 'C', stay: 0 },
  { time: '15:00', name: 'D', stay: 0 }
];
const gapMoved = Legs.resolveDay(gap, j => [0, 30, 10, 40][j]);
assert.equal(gapMoved.spots[1].time, '10:35');
assert.equal(gapMoved.spots[2].time, '15:00');
assert.equal(gapMoved.spots[3].time, '15:45');

const haneda = Legs.knownRoute({ lat: 35.5494, lng: 139.7798 }, { lat: 35.6554, lng: 139.7571 });
assert.equal(haneda.alight, '濱松町');
assert.match(haneda.steps.find(s => s.kind === 'ride').line, /單軌/);
const kix = Legs.knownRoute({ lat: 34.4347, lng: 135.244 }, { lat: 34.666, lng: 135.50 });
assert.equal(kix.alight, '難波');
assert.match(kix.steps.find(s => s.kind === 'ride').lineOrig, /ラピート/);
const tpe = Legs.knownRoute({ lat: 25.08, lng: 121.23 }, { lat: 25.0478, lng: 121.517 });
assert.equal(tpe.alight, '台北車站');
assert.match(tpe.steps.find(s => s.kind === 'ride').line, /機場捷運/);

const near = Legs.nearbyPlan(uenoShop, sensoji);
assert.equal(near.alight, '淺草');
assert.match(near.note, /淺草/);
assert.ok(near.steps.some(s => s.kind === 'ride' && s.alight === '淺草'));

const multi = Legs.fromTransitousAll({
  itineraries: [
    { duration: 1200, legs: [
      { mode: 'WALK', duration: 240, distance: 170, from: { name: 'START' }, to: { name: '西葛西' } },
      { mode: 'SUBWAY', duration: 900, distance: 4000, routeLongName: '東西線', routeColor: '00A0E4', agencyName: '東京メトロ', headsign: '中野', from: { name: '西葛西', platformCode: '1' }, to: { name: '大手町（東京）', platformCode: 'South Exit' }, intermediateStops: [{}, {}, {}, {}, {}, {}] }
    ] },
    { duration: 1600, legs: [
      { mode: 'BUS', duration: 1500, routeLongName: '都営バス', agencyName: '東京都交通局', headsign: '門前仲町', from: { name: '西葛西' }, to: { name: '門前仲町' }, intermediateStops: [{}, {}] }
    ] }
  ]
});
assert.equal(multi.length, 2);
assert.equal(Legs.fromTransitous({ itineraries: [{ duration: 1200, legs: [] }] }), null);
assert.equal(multi[0].steps[0].kind, 'walk');
assert.equal(multi[0].steps[0].meters, 170);
assert.equal(multi[0].steps[1].board, '西葛西');
assert.equal(multi[0].steps[1].boardPlatform, '月台 1');
assert.equal(multi[0].steps[1].alightPlatform, '出口 South');
assert.equal(multi[0].steps[1].stops, 7);
assert.match(multi[0].steps[1].line, /東西線/);
assert.equal(multi[1].steps[0].line.includes('都營') || multi[1].steps[0].line.includes('巴士'), true);
const messy = [{ source: 'transitous', min: 74, steps: [
  { kind: 'ride', line: '東成田線', alight: '京成成田', min: 10 },
  { kind: 'ride', line: '京成本線', alight: '京成高砂', min: 30 },
  { kind: 'ride', line: '京成 Skyliner', alight: '京成上野', min: 34 }
] }];
const ranked = Legs.choices(narita, uenoShop, messy);
assert.equal(ranked[0].source, 'table', 'simpler airport route should lead');
assert.match(ranked[0].label, /Skyliner/);
assert.ok(ranked.filter(o => o.mode === 'transit').length >= 2);
const opts = Legs.choices(narita, uenoShop, multi);
assert.ok(opts.length >= 2, 'choices ' + opts.length);
assert.ok(opts.some(o => o.mode === 'walk'));
assert.ok(opts.some(o => o.mode === 'drive'));
assert.ok(opts.filter(o => o.mode === 'transit').length >= 1);
assert.ok(opts.every(o => o.note && /估計|估算|常見|非即時|當天/.test(o.note)));
const plain = Legs.choices({ lat: 35.69, lng: 139.7 }, { lat: 35.70, lng: 139.71 }, []);
assert.ok(plain.some(o => o.mode === 'walk' && o.id === 'est:walk'));
assert.ok(plain.some(o => o.mode === 'drive'));
assert.ok(plain.some(o => o.mode === 'transit'));
assert.equal(Legs.fromTransitousAll({ itineraries: [] }).length, 0);

const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(sw, /tripmate-v73/);
assert.ok(sw.includes('legs.js'));
assert.ok(html.includes('legs.js'));
assert.ok(html.includes('daysum'));
assert.ok(html.includes('pickRoute'));
assert.ok(html.includes('openSpot'));
assert.match(readFileSync(new URL('../live.js', import.meta.url), 'utf8'), /numItineraries=4/);
assert.match(readFileSync(new URL('../live.js', import.meta.url), 'utf8'), /routeChipsHtml/);
assert.match(html, /touch-action:pan-y/);
assert.match(html, /overflow-x:clip/);
assert.match(readFileSync(new URL('../live.js', import.meta.url), 'utf8'), /pickRoute\(\$\{day\},\$\{j\},this\.dataset\.rid,event\)/);
assert.match(readFileSync(new URL('../live.js', import.meta.url), 'utf8'), /target="_blank"/);
assert.ok(html.includes('legwarn'));
assert.match(html, /Legs\.clash/);
assert.match(html, /Legs\.knownRoute/);
assert.match(html, /往後移到/);
assert.match(html, /時間排開/);
assert.match(html, /依距離重排/);
assert.match(html, /setAutoShift|autoShift/);
assert.match(html, /大約 /);
assert.match(html, /paintShift/);
assert.match(readFileSync(new URL('../live.js', import.meta.url), 'utf8'), /safeLine/);

console.log('legs.test.mjs ok', walkKm.toFixed(2) + ' km', walk + ' min');
