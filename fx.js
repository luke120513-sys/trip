/* 支出換算。臺灣銀行牌告（現金／即期買賣）優先，讀不到再用參考匯率。瀏覽器與測試都能用。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FX = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const FEE_DEFAULT = 1.5;
  const BOT_URL = 'https://rate.bot.com.tw/xrt/flcsv/0/day';

  function num(v) {
    if (v == null) return null;
    const s = String(v).trim().replace(/,/g, '');
    if (!s || s === '-' || s === '—') return null;
    const n = +s;
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  function clock(at) {
    const d = new Date(at);
    if (!at || isNaN(d.getTime())) return '';
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function cells(line) {
    return String(line || '').replace(/^\uFEFF/, '').split(',').map(s => s.trim());
  }
  function quad(rates, code, a, b, c, d) {
    if (!/^[A-Z]{3}$/.test(code)) return;
    const row = { cashBuy: num(a), cashSell: num(b), spotBuy: num(c), spotSell: num(d) };
    if (!row.cashSell && !row.spotSell && !row.cashBuy && !row.spotBuy) return;
    rates[code] = row;
  }
  /* 每日牌告：幣別、名稱，接著現金買入、現金賣出、即期買入、即期賣出。欄位對齊「本行買入／本行賣出」。 */
  function parseBotCsv(text) {
    const raw = String(text || '');
    if (!raw || /<\s*html|challenge validation/i.test(raw)) return null;
    const lines = raw.split(/\r?\n/).map(cells).filter(r => r.some(Boolean));
    let idx = null;
    for (let i = 0; i < lines.length; i++) {
      const hits = [];
      lines[i].forEach((c, n) => { if (c === '本行買入' || c === '本行賣出') hits.push(n); });
      if (hits.length >= 4) { idx = hits.slice(0, 4); break; }
    }
    if (!idx) idx = [2, 3, 4, 5];
    const rates = {};
    lines.forEach(row => {
      if (/^[A-Z]{3}$/.test(row[0])) quad(rates, row[0], row[idx[0]], row[idx[1]], row[idx[2]], row[idx[3]]);
      else if (/^\d{8}$/.test(row[0]) && /^[A-Z]{3}$/.test(row[1]) && /buy/i.test(row[2] || '')) quad(rates, row[1], row[3], row[4], row[6], row[7]);
    });
    const usd = rates.USD && (rates.USD.spotSell || rates.USD.cashSell);
    if (!(usd > 15 && usd < 60)) return null;
    rates.TWD = { cashBuy: 1, cashSell: 1, spotBuy: 1, spotSell: 1, mid: 1 };
    return { at: Date.now(), src: 'bot', srcName: '臺灣銀行牌告', rates };
  }
  function packMid(code, mid) {
    if (!(mid > 0)) return null;
    return { cashBuy: mid, cashSell: mid, spotBuy: mid, spotSell: mid, mid };
  }
  function fromErApi(usdRates, at) {
    if (!usdRates || !(usdRates.TWD > 0)) return null;
    const rates = {};
    Object.keys(usdRates).forEach(code => {
      const row = packMid(code, usdRates.TWD / usdRates[code]);
      if (row) rates[code] = row;
    });
    if (!rates.USD) return null;
    rates.TWD = packMid('TWD', 1);
    return { at: at || Date.now(), src: 'er-api', srcName: 'open.er-api.com 參考匯率（讀不到臺灣銀行）', rates };
  }
  function fromFallback(map, offline) {
    const rates = {};
    Object.keys(map || {}).forEach(code => {
      const row = packMid(code, map[code]);
      if (row) rates[code] = row;
    });
    rates.TWD = packMid('TWD', 1);
    return { at: 0, src: 'fallback', srcName: '內建參考匯率', offline: !!offline, rates };
  }
  function normalizeCached(rec) {
    if (!rec || !rec.rates) return null;
    if (rec.rates.USD && typeof rec.rates.USD === 'object') return rec;
    if (rec.rates.TWD > 0 && rec.rates.USD > 0) return fromErApi(rec.rates, rec.at);
    return null;
  }
  /* 現金花掉的是先前換來的鈔，用現金賣出；刷卡結匯用即期賣出。沒有那一側就退到有數字的牌告。 */
  function quote(fx, ccy, kind) {
    ccy = String(ccy || 'TWD').toUpperCase();
    if (ccy === 'TWD') return { rate: 1, side: '' };
    const r = fx && fx.rates && fx.rates[ccy];
    if (!r) return { rate: null, side: '' };
    if (kind === 'card') {
      if (r.spotSell) return { rate: r.spotSell, side: '即期賣出' };
      if (r.mid) return { rate: r.mid, side: '參考中價' };
      if (r.cashSell) return { rate: r.cashSell, side: '現金賣出' };
      return { rate: null, side: '' };
    }
    if (r.cashSell) return { rate: r.cashSell, side: '現金賣出' };
    if (r.spotSell) return { rate: r.spotSell, side: '即期賣出（這幣別沒有現金牌告）' };
    if (r.mid) return { rate: r.mid, side: '參考中價' };
    return { rate: null, side: '' };
  }
  function toTWD(amount, expense, fx) {
    amount = +amount;
    if (!Number.isFinite(amount)) return { twd: null };
    const e = expense || {};
    const ccy = String(e.currency || 'TWD').toUpperCase();
    const kind = e.rateKind === 'card' ? 'card' : 'cash';
    const custom = +e.customRate > 0 ? +e.customRate : 0;
    let base, side, how;
    if (ccy === 'TWD') { base = 1; side = ''; how = 'twd'; }
    else if (custom) { base = custom; side = '自訂匯率'; how = 'custom'; }
    else {
      const q = quote(fx, ccy, kind);
      base = q.rate; side = q.side; how = 'board';
      if (base == null) return { twd: null, how: 'none', kind, side: '' };
    }
    let feePct = 0;
    const feeOn = kind === 'card' && e.feeOn !== false && ccy !== 'TWD';
    if (feeOn) {
      feePct = e.feePct == null || e.feePct === '' ? FEE_DEFAULT : +e.feePct;
      if (!Number.isFinite(feePct) || feePct < 0) feePct = FEE_DEFAULT;
      if (feePct > 20) feePct = 20;
    }
    const rate = base * (feeOn ? (1 + feePct / 100) : 1);
    return { twd: amount * rate, rate, base, feePct: feeOn ? feePct : 0, side, how, kind };
  }
  function fxLabel(fx) {
    if (!fx || fx.src === 'fallback' || !fx.at) return '目前用內建參考匯率（不是今天的牌告）';
    const hh = clock(fx.at);
    const name = fx.srcName || '匯率';
    if (fx.offline || fx.stale) return '目前離線，顯示上次的' + name + '・更新於 ' + hh;
    return name + '・更新於 ' + hh;
  }
  return { FEE_DEFAULT, BOT_URL, parseBotCsv, fromErApi, fromFallback, normalizeCached, quote, toTWD, fxLabel, clock };
});
