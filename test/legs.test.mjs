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

const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(sw, /tripmate-v41/);
assert.ok(sw.includes('legs.js'));
assert.ok(html.includes('legs.js'));
assert.ok(html.includes('legwarn'));
assert.match(html, /Legs\.clash/);
assert.match(html, /Legs\.knownRoute/);

console.log('legs.test.mjs ok', walkKm.toFixed(2) + ' km', walk + ' min');
