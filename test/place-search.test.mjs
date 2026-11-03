import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const window = {};
vm.runInNewContext(fs.readFileSync(new URL('../planner.js', import.meta.url), 'utf8'), { window });
const P = window.Planner;
const osaka = JSON.parse(fs.readFileSync(new URL('../data/osaka.json', import.meta.url), 'utf8'));
const names = q => P.match(osaka, q).map(x => x.name);

assert.ok(names('一蘭分店').some(n => n.includes('一蘭')), names('一蘭分店').join());
assert.ok(names('一兰拉面').some(n => n.includes('一蘭')), names('一兰拉面').join());
assert.ok(names('拉面').some(n => n.includes('拉麵')), names('拉面').join());
assert.ok(names('玄品ふぐ').some(n => n.includes('玄品')), names('玄品ふぐ').join());
assert.ok(names('이치란').some(n => n.includes('一蘭')), names('이치란').join());
assert.ok(names('心斎橋店').length > 0);

const near = P.match(osaka, '拉麵', { lat: 34.668, lng: 135.502 });
assert.ok(near[0].area === '道頓堀' || near[0].area === '心齋橋', near.map(x => x.area).join());

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
assert.match(html, /suggestBias/);
assert.match(html, /google\.com\/maps\/search/);
assert.match(html, /餐廳介紹|景點介紹/);

console.log('# place search ok');
