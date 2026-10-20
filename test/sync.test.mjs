import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { stampAgainst, mergeTrip, settleUp, newCode, encodeDays, decodeDays } = createRequire(import.meta.url)('../sync.js');

const spot = (sid, rev, name, extra = {}) => Object.assign({ sid, rev, name }, extra);

{
  const local = { days: [[spot('a', 2, '新名稱'), spot('b', 1, '乙')]], orderRev: 3, metaRev: 1, dest: '東京', tomb: {}, expTomb: {}, expenses: [] };
  const remote = { days: [[spot('a', 1, '舊名稱'), spot('c', 5, '丙')]], orderRev: 1, metaRev: 1, dest: '東京', tomb: {}, expTomb: {}, expenses: [] };
  const m = mergeTrip(local, remote);
  const names = m.days[0].map(s => s.name);
  assert.deepEqual(names, ['新名稱', '乙', '丙']);
}

{
  const local = { days: [[spot('a', 1, '甲'), spot('b', 1, '乙')]], orderRev: 2, metaRev: 1, dest: '東京', tomb: { a: 9 }, expTomb: {}, expenses: [] };
  const remote = { days: [[spot('a', 4, '舊甲'), spot('b', 1, '乙')]], orderRev: 1, metaRev: 1, dest: '東京', tomb: {}, expTomb: {}, expenses: [] };
  const m = mergeTrip(local, remote);
  assert.deepEqual(m.days[0].map(s => s.sid), ['b']);
}

{
  const local = { days: [[spot('a', 1, '甲'), spot('b', 1, '乙')]], orderRev: 2, metaRev: 1, dest: '東京', tomb: {}, expTomb: {}, expenses: [] };
  const remote = { days: [[spot('b', 1, '乙'), spot('a', 1, '甲')]], orderRev: 8, metaRev: 1, dest: '大阪', tomb: {}, expTomb: {}, expenses: [] };
  remote.metaRev = 9;
  const m = mergeTrip(local, remote);
  assert.deepEqual(m.days[0].map(s => s.sid), ['b', 'a']);
  assert.equal(m.dest, '大阪');
}

{
  const local = { days: [[]], orderRev: 1, metaRev: 1, dest: '東京', tomb: {}, expTomb: {}, expenses: [], tasksRev: 10, tasks: [{ id: 't1', section: 'buy', text: '人形燒', rev: 10, done: false }] };
  const remote = { days: [[]], orderRev: 1, metaRev: 1, dest: '東京', tomb: {}, expTomb: {}, expenses: [], tasksRev: 4, tasks: [{ id: 't1', section: 'buy', text: '舊的', rev: 4, done: true }] };
  const m = mergeTrip(local, remote);
  assert.equal(m.tasks[0].text, '人形燒');
  const newer = mergeTrip(local, { days: [[]], tasksRev: 20, tasks: [{ id: 't2', section: 'prep', text: '換匯', rev: 20 }], tomb: {}, expTomb: {}, expenses: [] });
  assert.equal(newer.tasks[0].text, '換匯');
  const kept = mergeTrip(local, { days: [[]], dest: '東京', tomb: {}, expTomb: {}, expenses: [] });
  assert.equal(kept.tasks[0].text, '人形燒');
}

{
  const prev = { days: [[spot('a', 1, '甲')]], expenses: [{ id: 'e', rev: 1, title: '飯', amount: 10 }], orderRev: 1, metaRev: 1, dest: '東京', dep: '2026-11-02', ret: '2026-11-06', pax: 2, orig: 'TPE', tomb: {}, expTomb: {} };
  const cur = JSON.parse(JSON.stringify(prev));
  cur.days[0][0].name = '甲改';
  cur.days[0].push(spot('b', 1, '乙'));
  cur.expenses[0].amount = 20;
  stampAgainst(cur, prev);
  assert.ok(cur.days[0][0].rev > 1);
  assert.ok(cur.days[0][1].rev > 1);
  assert.ok(cur.expenses[0].rev > 1);
  assert.ok(cur.orderRev > 1);
}

{
  const fx = (amt) => amt;
  const exp = [
    { payer: 'a', parts: ['a', 'b', 'c'], amount: 300, currency: 'TWD' },
    { payer: 'b', parts: ['a', 'b'], amount: 40, currency: 'TWD' }
  ];
  const { transfers } = settleUp(exp, fx);
  const pay = (from, to) => transfers.find(t => t.from === from && t.to === to);
  assert.equal(pay('b', 'a').amount, 80);
  assert.equal(pay('c', 'a').amount, 100);
}

{
  const code = newCode();
  assert.equal(code.length, 6);
  assert.match(code, /^[A-Z2-9]+$/);
  assert.equal(/[01IO]/.test(code), false);
}

{
  const days = [[{ sid: 'a', name: '甲', src: ['https://a.example'] }], []];
  const enc = encodeDays(days);
  const walk = (v, inArr) => {
    if (Array.isArray(v)) {
      if (inArr) throw new Error('nested array');
      v.forEach(x => walk(x, true));
    } else if (v && typeof v === 'object') Object.values(v).forEach(x => walk(x, false));
  };
  walk(enc, false);
  assert.deepEqual(decodeDays(enc), days);
}

console.log('sync tests ok');
