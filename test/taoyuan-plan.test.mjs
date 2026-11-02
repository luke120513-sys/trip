import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const plannerSrc = fs.readFileSync(new URL('../planner.js', import.meta.url), 'utf8');
const taoyuan = JSON.parse(fs.readFileSync(new URL('../data/taoyuan.json', import.meta.url), 'utf8'));
const taipei = JSON.parse(fs.readFileSync(new URL('../data/taipei.json', import.meta.url), 'utf8'));

function mapOf(src, name) {
  const m = src.match(new RegExp('const ' + name + '=\\{([^}]+)\\}'));
  assert.ok(m, name);
  const out = {};
  for (const part of m[1].split(',')) {
    const kv = part.split(':');
    if (kv.length < 2) continue;
    out[kv[0].trim().replace(/['"]/g, '')] = kv[1].trim().replace(/['"]/g, '');
  }
  return out;
}

const pk = mapOf(html, 'PK');
const key = mapOf(plannerSrc, 'KEY');
for (const city of ['桃園', '中壢', '大溪', '青埔']) {
  assert.equal(pk[city], 'taoyuan', city);
  assert.equal(key[city], 'taoyuan', city);
}
assert.equal(pk['台北'], 'taipei');
assert.equal(key['台北'], 'taipei');
assert.equal(pk.TPE, 'taipei');
assert.equal(key.TPE, 'taipei');

const window = {};
vm.runInNewContext(plannerSrc, { window });
const trip = {
  dest: '桃園',
  dep: '2026-11-10',
  ret: '2026-11-12',
  pax: 2,
  days: [[], [], []]
};
const days = window.Planner.plan(trip, taoyuan, { pace: '標準', interests: ['景點', '美食', '購物', '夜景'] });
const names = days.flat().map(s => s.name);
assert.ok(names.includes('大溪老街'), names.join(','));
assert.ok(names.includes('Xpark 水族館'), names.join(','));
assert.equal(names.some(n => /台北101|故宮|九份|士林/.test(n)), false, names.join(','));
assert.ok(taipei.items.some(i => i.name.includes('台北101')));
const taipeiDays = window.Planner.plan({ ...trip, dest: '台北' }, taipei, { pace: '標準', interests: ['景點', '美食', '購物', '夜景'] });
assert.ok(taipeiDays.flat().some(s => /台北101|故宮/.test(s.name)));
assert.equal(taipeiDays.flat().some(s => /大溪老街|Xpark|石門水庫/.test(s.name)), false);

console.log('# taoyuan plan');
days.forEach((d, i) => console.log(i + 1, d.map(s => s.time + ' ' + s.name).join(' | ')));
