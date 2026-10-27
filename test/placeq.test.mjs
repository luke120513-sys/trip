import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const PlaceQ = require('../placeq.js');

const fugu = PlaceQ.plan('玄品河豚');
assert.ok(fugu.primary.includes('玄品ふぐ'), fugu.primary.join(','));
assert.ok(fugu.primary.includes('玄品fugu') || fugu.fallback.includes('玄品fugu'));
assert.ok(fugu.fallback.includes('玄品'), fugu.fallback.join(','));
assert.ok(PlaceQ.plan('拉麵').primary.includes('ラーメン'));
assert.ok(PlaceQ.plan('拉面').primary.includes('ラーメン'));
assert.ok(PlaceQ.plan('燒肉').primary.includes('焼肉'));
assert.ok(PlaceQ.plan('烧肉').primary.includes('焼肉'));
assert.ok(PlaceQ.plan('壽司').primary.includes('寿司'));
assert.ok(PlaceQ.plan('咖啡廳').primary.includes('カフェ'));
assert.ok(PlaceQ.plan('東京車站').primary.includes('東京駅'));
assert.ok(PlaceQ.plan('浅草公园').primary.includes('浅草公園') || PlaceQ.plan('公園').primary.includes('公園'));
assert.equal(PlaceQ.kanji('淺草寺'), '浅草寺');
assert.ok(PlaceQ.plan('淺草寺').primary.includes('浅草寺'));
assert.ok(PlaceQ.plan('居酒屋').primary.includes('izakaya'));

const merged = PlaceQ.dedupe([
  { name: '玄品ふぐ', addr: '港区', lat: 35.6489, lng: 139.7452, city: '東京都' },
  { name: '玄品ふぐ', addr: '港区 · 東京都', lat: 35.64892, lng: 139.74518, city: '東京都' },
  { name: '玄品ふぐ', addr: '新宿区', lat: 35.7017, lng: 139.7392, city: '東京都' }
]);
assert.equal(merged.length, 2);
assert.equal(merged[0].addr, '港区 · 東京都');

const extras = readFileSync(new URL('../extras.js', import.meta.url), 'utf8');
const food = readFileSync(new URL('../food.js', import.meta.url), 'utf8');
const importer = readFileSync(new URL('../importer.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
assert.match(extras, /PlaceQ\.search/);
assert.match(food, /function foodGeo[\s\S]*placeSearch\(q, dest, here\)/);
assert.match(food, /PlaceQ\.search\(q/);
assert.match(food, /diarySearch\(tok\)/);
assert.doesNotMatch(food, /foodGeo\(q \+/);
assert.match(food, /setTimeout\(\(\) => diarySearch\(tok\), 300\)/);
assert.match(food, /搜尋店名/);
assert.match(html, /setTimeout\(\(\)=>runSugg\(q,tok\),300\)/);
assert.match(html, /placeSearch\(q,t&&t\.dest\)/);
assert.match(importer, /placeSearch\(q, dest\)|placeSearch\(q,dest\)|find\(q,dest\)/);
assert.match(readFileSync(new URL('../placeurl.js', import.meta.url), 'utf8'), /PlaceQ\.search/);
assert.ok(html.includes('placeq.js'));
assert.ok(extras.includes('這家有多間分店'));
assert.match(sw, /tripmate-v60/);
assert.ok(sw.includes('placeq.js'));

assert.equal(PlaceQ.hint('玄品ふぐ'), '玄品河豚');
assert.equal(PlaceQ.hint('焼肉'), '燒肉');
assert.equal(PlaceQ.zhText('神楽坂通り · 新宿区 · 東京都 · 日本'), '神楽坂通り · 新宿區 · 東京 · 日本');
assert.equal(PlaceQ.zhText('Shinjuku · Tokyo · Japan'), '新宿區 · 東京 · 日本');
assert.equal(PlaceQ.zhText('足立区'), '足立區');
assert.equal(PlaceQ.zhText('台東区'), '台東區');
assert.equal(PlaceQ.zhText('武蔵野市'), '武藏野市');
assert.equal(PlaceQ.zhText('韩国'), '韓國');
assert.equal(PlaceQ.zhText('泰国'), '泰國');
assert.equal(PlaceQ.zhText('东京都'), '東京');
assert.equal(PlaceQ.zhText('大阪'), '大阪');
assert.equal(PlaceQ.zhText('京都'), '京都');

const tokyo = { lat: 35.6812, lng: 139.7671 };
const seen = [];
const mocked = await PlaceQ.search('玄品河豚', {
  bias: tokyo,
  few: 1,
  limit: 3,
  fetch: async (u) => {
    const s = String(u);
    seen.push(s);
    if (s.includes('photon') && s.includes('lang=zh')) return { ok: false, status: 400, json: async () => ({}) };
    if (s.includes('photon')) {
      return { ok: true, status: 200, json: async () => ({ features: [{ properties: { name: '玄品ふぐ', street: '神楽坂通り', district: 'Shinjuku', city: 'Tokyo', country: 'Japan' }, geometry: { coordinates: [139.7392, 35.7017] } }] }) };
    }
    return { ok: false, status: 500, json: async () => ({}) };
  }
});
assert.ok(seen.some(s => s.includes('lang=zh')), seen.join('\n'));
assert.ok(seen.some(s => s.includes('lang=default')));
assert.equal(mocked[0].name, '玄品ふぐ');
assert.equal(mocked[0].hint, '玄品河豚');
assert.equal(mocked[0].addr, '神楽坂通り · 新宿區 · 東京 · 日本');

const origFetch = globalThis.fetch;
let cacheCalls = 0;
globalThis.fetch = async (u) => {
  cacheCalls++;
  if (String(u).includes('photon')) return { ok: true, status: 200, json: async () => ({ features: [{ properties: { name: '快取測試店', street: '神楽坂通り', district: '新宿区', city: '東京都', country: '日本' }, geometry: { coordinates: [139.74, 35.7] } }] }) };
  return { ok: false, status: 500, json: async () => ({}) };
};
const cachedA = await PlaceQ.search('快取測試', { bias: tokyo, few: 1, limit: 3 });
const afterFirst = cacheCalls;
const cachedB = await PlaceQ.search('快取測試', { bias: tokyo, few: 1, limit: 3 });
assert.equal(cachedB[0].name, cachedA[0].name);
assert.equal(cacheCalls, afterFirst);
const pacedAt = Date.now();
await PlaceQ.search('快取測試乙', { bias: tokyo, few: 1, limit: 3 });
assert.ok(Date.now() - pacedAt >= 300, 'photon lookups should be spaced');
globalThis.fetch = origFetch;

const diarySeen = [];
const diaryHits = await PlaceQ.search('玄品河豚', {
  bias: tokyo,
  few: 3,
  limit: 6,
  fetch: async (u) => {
    const s = String(u);
    diarySeen.push(s);
    const q = decodeURIComponent(s);
    if (s.includes('lang=zh')) return { ok: false, status: 400, json: async () => ({}) };
    if (q.includes('玄品河豚') && !q.includes('ふぐ')) {
      return { ok: true, status: 200, json: async () => ({ features: [1, 2, 3].map(i => ({ properties: { name: '別的店' + i, city: 'Tokyo', country: 'Japan' }, geometry: { coordinates: [139.76, 35.68] } })) }) };
    }
    if (q.includes('ふぐ')) {
      return { ok: true, status: 200, json: async () => ({ features: [
        { properties: { name: '玄品ふぐ', street: '神楽坂通り', district: '新宿区', city: '東京都', country: '日本' }, geometry: { coordinates: [139.739, 35.702] } },
        { properties: { name: '玄品ふぐ', street: '広小路', district: '台東区', city: '東京都', country: '日本' }, geometry: { coordinates: [139.774, 35.711] } }
      ] }) };
    }
    return { ok: true, status: 200, json: async () => ({ features: [] }) };
  }
});
assert.ok(diarySeen.some(s => decodeURIComponent(s).includes('ふぐ')), 'diary search should try ふぐ');
assert.ok(diaryHits.filter(h => h.name.includes('玄品ふぐ')).length >= 2, 'diary 玄品河豚 branches ' + JSON.stringify(diaryHits));

const hits = await PlaceQ.search('玄品河豚', { bias: tokyo, limit: 8, few: 3 });
const branches = hits.filter(h => /玄品ふぐ/.test(h.name) && /東京/.test((h.city || '') + (h.addr || '')));
assert.ok(branches.length >= 2, 'expected Tokyo 玄品ふぐ branches, got ' + JSON.stringify(hits));
assert.ok(hits.every((h, i) => i === 0 || PlaceQ.km(tokyo, hits[i - 1]) <= PlaceQ.km(tokyo, h) + 0.01));
for (const h of branches) {
  assert.equal(h.hint, '玄品河豚');
  assert.match(h.addr, /[區市縣]/);
  assert.doesNotMatch(h.addr + ' ' + h.city, /Shinjuku|Tokyo|Japan|Street|Kagurazaka/);
}

console.log('place query tests ok', branches.length);
