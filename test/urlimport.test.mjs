import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const U = createRequire(import.meta.url)('../urlimport.js');
const tokyo = createRequire(import.meta.url)('../data/tokyo.json');
const items = tokyo.items.map(it => ({ ...it, city: '東京' }));
const importer = readFileSync(new URL('../importer.js', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.deepEqual(U.classifyUrl('https://youtu.be/eODsCeWOvuI?t=3'), { kind: 'youtube', url: 'https://www.youtube.com/watch?v=eODsCeWOvuI', id: 'eODsCeWOvuI' });
assert.equal(U.classifyUrl('https://www.youtube.com/shorts/V3CMTmvR5Js').id, 'V3CMTmvR5Js');
assert.equal(U.classifyUrl('https://www.instagram.com/reel/C8abcdeFGHI/').kind, 'instagram');
assert.equal(U.classifyUrl('https://www.instagram.com/p/C8abcdeFGHI/').kind, 'instagram');
assert.equal(U.classifyUrl('https://www.gotokyo.org/en/story/walks-and-tours/tokyo-itinerary/index.html').kind, 'article');
assert.equal(U.classifyUrl('不是網址'), null);

{
  const text = '第一天去淺草寺和東京晴空塔，第二天明治神宮、澀谷十字路口，晚上淺草今半。';
  const ex = U.extractPlaces(text, items);
  const names = ex.places.map(p => p.name);
  for (const n of ['淺草寺・雷門', '東京晴空塔', '明治神宮', '澀谷十字路口', '淺草今半']) assert.ok(names.includes(n), n);
  assert.equal(U.guessCity(text), '東京');
  assert.equal(U.guessDays(text, names.length), 2);
  const senso = ex.places.find(p => p.pid === 'tokyo-0');
  assert.ok(Math.abs(senso.lat - 35.7134) < 0.001);
}

{
  const text = 'We spent 3 unforgettable days exploring Tokyo, from Shibuya to the Studio Ghibli Museum.\n• Studio Ghibli Museum\n• Pokémon Center Tokyo';
  const ex = U.extractPlaces(text, items);
  assert.deepEqual(ex.pending.slice(0, 3), ['Studio Ghibli Museum', 'Pokémon Center Tokyo', 'Shibuya']);
  assert.equal(U.guessDays(text, 3), 3);
  assert.equal(U.guessCity(text), '東京');
}

{
  const text = 'Sensoji Temple, teamLab Planets TOKYO and TOKYO SKYTREE in Ginza';
  const names = U.extractPlaces(text, items).places.map(p => p.name);
  for (const n of ['淺草寺・雷門', 'teamLab Planets TOKYO', '東京晴空塔', '銀座']) assert.ok(names.includes(n), n);
}

{
  const days = U.splitDays([
    { name: '淺草', lat: 35.71, lng: 139.8 },
    { name: '澀谷', lat: 35.66, lng: 139.7 },
    { name: '晴空塔', lat: 35.712, lng: 139.81 }
  ], 2);
  assert.deepEqual(days.map(d => d.map(p => p.name)), [['淺草', '晴空塔'], ['澀谷']]);
}

{
  const xml = '<transcript><text start="0">We start the morning at Senso-ji temple in Asakusa and stay through lunch.</text></transcript>';
  assert.ok(U.captionsText(xml).includes('Senso-ji'));
  assert.equal(U.captionsText('<text></text>'), '');
}

{
  const md = 'Title: Tokyo in 3 days\n\nURL Source: https://www.youtube.com/watch?v=V3CMTmvR5Js\n\nShibuya and Studio Ghibli Museum\n\n[Other](https://www.youtube.com/watch?v=aaaaaaaaaaa)\nJimmy Kimmel Live\n';
  const clip = U.clipYoutube(md, 'V3CMTmvR5Js');
  assert.ok(clip.includes('Shibuya'));
  assert.equal(clip.includes('Jimmy Kimmel'), false);
  assert.equal(U.readerFailed(''), true);
  assert.equal(U.readerFailed(clip), false);
}

assert.ok(importer.includes('讀取網址'));
assert.ok(importer.includes('盡力辨識'));
assert.ok(importer.includes('urlimport.js'));
assert.ok(importer.includes('impCaption'));
assert.ok(sw.includes('urlimport.js'));
assert.match(sw, /tripmate-v32/);
{
  const ig = "Title: Post isn't available • Instagram\n\nLog in\n\nPost isn't available\n\nThe link may be broken.\n\nSign up for Instagram";
  assert.equal(U.readerFailed(ig), true);
}
assert.ok(html.includes('r.jina.ai'));
assert.ok(html.includes('noembed.com'));

console.log('url import tests ok');
