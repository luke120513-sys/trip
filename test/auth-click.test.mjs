import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../collab.js', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

function fnBody(name) {
  const start = src.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name);
  const next = src.slice(start + 1).search(/\nfunction /);
  return src.slice(start, start + 1 + (next < 0 ? src.length : next));
}

const sign = fnBody('signInGoogle');
assert.equal(sign.startsWith('async '), false);
assert.equal(sign.includes('await'), false);
assert.ok(sign.includes('signInWithPopup'));
assert.equal(sign.includes('signInWithRedirect'), false);

const share = fnBody('shareCloud');
const join = fnBody('submitJoin');
for (const body of [share, join]) {
  assert.equal(body.includes('await'), false);
  assert.ok(body.indexOf('signInGoogle(') >= 0);
}

assert.ok(src.includes('indexedDBLocalPersistence'));
assert.ok(src.includes('browserLocalPersistence'));
assert.ok(src.includes('browserPopupRedirectResolver'));
assert.ok(src.includes('getRedirectResult'));
assert.ok(src.includes("code !== 'auth/popup-blocked'"));
assert.ok(src.includes("code !== 'auth/operation-not-supported-in-this-environment'"));
assert.ok(src.includes('signInWithRedirect'));
assert.ok(src.includes('這個網址還沒加入 Firebase 授權網域'));
assert.ok(src.includes('登入視窗被關掉了'));
assert.match(sw, /tripmate-v26/);

console.log('auth click tests ok');
