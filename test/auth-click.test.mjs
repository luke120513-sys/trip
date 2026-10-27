import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../collab.js', import.meta.url), 'utf8');
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function fnBody(name) {
  const start = src.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name);
  const next = src.slice(start + 1).search(/\n(?:async )?function /);
  return src.slice(start, start + 1 + (next < 0 ? src.length : next));
}

const sign = fnBody('signInGoogle');
assert.equal(sign.startsWith('async '), false);
assert.equal(sign.includes('await'), false);
assert.ok(sign.includes('signInWithPopup'));
assert.equal(sign.includes('signInWithRedirect'), false);
assert.ok(sign.includes('authReady'));

const share = fnBody('shareCloud');
const join = fnBody('submitJoin');
for (const body of [share, join]) {
  assert.equal(body.includes('await'), false);
  assert.ok(body.indexOf('signInGoogle(') >= 0);
  assert.equal(body.includes('signInWithRedirect'), false);
}

assert.equal(src.includes('signInWithRedirect('), false);
assert.ok(src.includes('indexedDBLocalPersistence'));
assert.ok(src.includes('browserLocalPersistence'));
assert.ok(src.includes('browserPopupRedirectResolver'));
assert.ok(src.includes('authStateReady'));
assert.ok(src.includes('getRedirectResult'));
assert.ok(src.includes('signInWithCredential'));
assert.ok(src.includes('https://accounts.google.com/gsi/client'));
assert.ok(src.includes('55694360376-msm09rbmep1egq816gk98gfbqs0300n3.apps.googleusercontent.com'));
assert.ok(src.includes('改用彈出視窗登入'));
assert.ok(src.includes('加到主畫面'));
assert.ok(src.includes('這個網址還沒加入 Firebase 授權網域'));
assert.ok(src.includes('登入視窗被關掉了'));
assert.match(sw, /tripmate-v71/);
assert.ok(sw.includes('/__/auth/'));
assert.ok(sw.includes('firebaseapp.com'));
assert.ok(sw.includes('accounts.google.com'));
assert.ok(html.includes('firebase-auth.js'));
assert.ok(html.includes('modulepreload'));

console.log('auth click tests ok');
