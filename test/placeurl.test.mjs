import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PlaceUrl = require('../placeurl.js');
const PlaceQ = require('../placeq.js');

const gmaps = 'https://www.google.com/maps/place/%E7%8E%84%E5%93%81%E3%81%B5%E3%81%90/@35.7016533,139.7391898,17z/data=!3d35.701677!4d139.739185';
const g = PlaceUrl.parseUrl(gmaps);
assert.equal(g.kind, 'google');
assert.equal(g.name, '玄品ふぐ');
assert.equal(g.lat, 35.701677);
assert.equal(g.lng, 139.739185);
assert.equal(PlaceUrl.ready(gmaps), true);
assert.equal(PlaceUrl.ready('https://www.google.com/maps'), false);

const qll = PlaceUrl.parseUrl('https://www.google.com/maps/search/?api=1&query=35.701677,139.739185');
assert.equal(qll.name, '');
assert.equal(qll.lat, 35.701677);
assert.equal(qll.lng, 139.739185);

const qname = PlaceUrl.parseUrl('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('玄品ふぐ 神楽坂'));
assert.equal(qname.name, '玄品ふぐ 神楽坂');
assert.equal(qname.lat, null);

const dir = PlaceUrl.parseUrl('https://www.google.com/maps/dir/東京車站/玄品ふぐ/@35.70,139.74,14z/data=!4m5!1m1!2m2!1d139.739185!2d35.701677');
assert.equal(dir.name, '玄品ふぐ');
assert.equal(dir.lat, 35.701677);
assert.equal(dir.lng, 139.739185);
assert.match(dir.note, /終點/);

const apple = PlaceUrl.parseUrl('https://maps.apple.com/?ll=35.701677,139.739185&q=' + encodeURIComponent('玄品ふぐ'));
assert.equal(apple.kind, 'apple');
assert.equal(apple.name, '玄品ふぐ');
assert.equal(apple.lat, 35.701677);

const tabelog = 'https://tabelog.com/tokyo/A1309/A130905/13017152/';
assert.equal(PlaceUrl.kind(tabelog), 'tabelog');
assert.equal(PlaceUrl.readerTarget(tabelog), 'https://s.tabelog.com/tw/tokyo/A1309/A130905/13017152/');
assert.equal(PlaceUrl.readerTarget('https://s.tabelog.com/en/tokyo/A1309/A130905/13017152/'), 'https://s.tabelog.com/tw/tokyo/A1309/A130905/13017152/');
assert.equal(PlaceUrl.ready('https://tabelog.com/tokyo/'), false);

const tabelogHtml = `<title>玄品 河豚・鰻料理 神樂坂 - 牛込神樂坂/河豚 | Tabelog</title>
<script type="application/ld+json">{"@context":"http://schema.org","@type":"Restaurant","name":"玄品 河豚・鰻料理 神樂坂","address":{"@type":"PostalAddress","streetAddress":"","addressLocality":"東京都新宿区神楽坂","addressRegion":"東京","addressCountry":"JP"},"geo":{"@type":"GeoCoordinates","latitude":35.70167733788898,"longitude":139.73918518344828},"aggregateRating":{"@type":"AggregateRating","ratingValue":"3.20"}}</script>
<th>地址</th><td>東京都新宿区神楽坂5-35 第二野本ハイツ 1F</td>`;
const tb = PlaceUrl.parseHtml(tabelogHtml, tabelog);
assert.equal(tb.name, '玄品 河豚・鰻料理 神樂坂');
assert.match(tb.addr, /神楽坂5-35/);
assert.ok(Math.abs(tb.lat - 35.701677) < 0.0001);
assert.equal(tb.rating, '3.20');
assert.equal(tb.food, true);

const generic = `<meta property="og:title" content="玄品ふぐ">
<script type="application/ld+json">{"@type":["Restaurant","LocalBusiness"],"name":"玄品ふぐ","address":{"streetAddress":"神楽坂5-35","addressLocality":"新宿区","addressRegion":"東京都"},"geo":{"latitude":"35.7016","longitude":"139.7392"}}</script>`;
const web = PlaceUrl.parseHtml(generic, 'https://example.com/genpin');
assert.equal(web.name, '玄品ふぐ');
assert.match(web.addr, /神楽坂5-35/);
assert.equal(web.lat, 35.7016);

const ig = PlaceUrl.parseHtml('<meta property="og:title" content="玄品ふぐ • Instagram">', 'https://www.instagram.com/explore/locations/99/genpin-fugu/');
assert.equal(ig.name, '玄品ふぐ');
const igSlug = PlaceUrl.parseUrl('https://www.instagram.com/explore/locations/99/genpin-fugu/');
assert.equal(igSlug.name, 'genpin fugu');

const wall = PlaceUrl.parseHtml('<title>Just a moment...</title><h1>Performing security verification</h1>', 'https://tabelog.com/tokyo/A1309/A130905/13017152/');
assert.equal(wall.name, '');
const missing = PlaceUrl.parseHtml('<title>Dynamic Link Not Found</title>', 'https://maps.app.goo.gl/zzzznotreal');
assert.equal(missing.name, '');

const shortHtml = '<html><script>null,"https://www.google.com/maps/place/%E7%8E%84%E5%93%81%E3%81%B5%E3%81%90/@35.70,139.73,17z/data=!3d35.701677!4d139.739185"</script></html>';
const fromShort = PlaceUrl.parseHtml(shortHtml, 'https://maps.app.goo.gl/abcdef');
assert.equal(fromShort.name, '玄品ふぐ');
assert.equal(fromShort.lat, 35.701677);

const appleTitle = PlaceUrl.parseHtml('<title>玄品ふぐ in Shinjuku, Tokyo, Japan - Apple Maps</title><meta property="og:title" content="玄品ふぐ">', 'https://maps.apple.com/?ll=35.701677,139.739185&q=%E7%8E%84%E5%93%81%E3%81%B5%E3%81%90');
assert.equal(appleTitle.name, '玄品ふぐ');

const located = await PlaceUrl.resolve(gmaps, {
  placeq: PlaceQ,
  fetchText: async () => { throw new Error('不該再抓整頁'); },
  reverse: async () => ({ name: '玄品ふぐ', addr: '神楽坂通り · 新宿区 · 東京都 · 日本' })
});
assert.equal(located.ok, true);
assert.equal(located.spot.name, '玄品ふぐ');
assert.equal(located.spot.hint, '玄品河豚');
assert.match(located.spot.addr, /新宿區/);
assert.match(located.spot.addr, /東京/);

const failed = await PlaceUrl.resolve(tabelog, {
  fetchText: async () => '<title>Just a moment...</title>',
  search: async () => []
});
assert.equal(failed.ok, false);
assert.match(failed.message, /店名/);

const named = await PlaceUrl.resolve('https://example.com/shop', {
  fetchText: async () => generic,
  search: async () => [],
  placeq: PlaceQ
});
assert.equal(named.ok, true);
assert.equal(named.spot.hint, '玄品河豚');
assert.match(named.spot.addr, /新宿區/);

const liveG = await PlaceUrl.resolve(gmaps, { placeq: PlaceQ, fetchText: async () => { throw new Error('skip'); } });
assert.equal(liveG.ok, true, liveG.message);
assert.match(liveG.spot.name, /玄品/);
assert.ok(Math.abs(liveG.spot.lat - 35.7016) < 0.01, liveG.spot.lat);
assert.match(liveG.spot.addr, /新宿|東京|日本|神楽|神樂/);

const liveT = await PlaceUrl.resolve(tabelog, { placeq: PlaceQ });
assert.equal(liveT.ok, true, liveT.message);
assert.match(liveT.spot.name, /玄品/);
assert.ok(Math.abs(liveT.spot.lat - 35.7016) < 0.02, JSON.stringify(liveT.spot));
assert.match(liveT.spot.addr, /新宿|神樂|神楽|東京/);

console.log('placeurl ok', liveG.spot.name, liveG.spot.hint, liveG.spot.addr);
console.log('tabelog ok', liveT.spot.name, liveT.spot.addr, liveT.spot.rating);
