/* Google 登入與 Firestore 共用行程。沒登入時完全不影響本機行程。 */
const FB_VER = '10.14.1';
const FB_BASE = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
const FB_CFG = {
  apiKey: 'AIzaSyAguQSoX4yxi9N3OjN0-wctY7emdD_DU3k',
  authDomain: 'flysave-28017.firebaseapp.com',
  projectId: 'flysave-28017',
  storageBucket: 'flysave-28017.firebasestorage.app',
  messagingSenderId: '55694360376',
  appId: '1:55694360376:web:86b32176cc3d3a679a4bcd',
  measurementId: 'G-ZGDHVDCK0F'
};
/* 空字串時不啟用 GIS。填入後，登入改走 Google 按鈕 + signInWithCredential，不再經過 firebaseapp.com/__/auth/handler。 */
const GOOGLE_WEB_CLIENT_ID = '';
let fbP = null, fbMods = null, cloudUser = null, cloudUnsub = null, memUnsub = null, cloudTimer = 0, cloudWriting = false, cloudAck = null;
const AUTH_INTENT = 'trip_auth_intent';

function authErrText(code) {
  const map = {
    'auth/popup-closed-by-user': '登入視窗被關掉了，請再按一次',
    'auth/cancelled-popup-request': '請先關掉剛才的登入視窗，再按一次',
    'auth/popup-blocked': '登入視窗被瀏覽器擋住了。請再按一次。若一般分頁一直失敗，用 Chrome 選單把旅伴「加到主畫面」，再從主畫面圖示打開後登入',
    'auth/unauthorized-domain': '這個網址還沒加入 Firebase 授權網域。請到主控台「驗證 → 設定 → 授權網域」加上目前的網址',
    'auth/operation-not-supported-in-this-environment': '這個分頁沒辦法開登入視窗。請再按一次；若還是不行，用 Chrome 選單把旅伴「加到主畫面」，再從主畫面圖示打開後登入',
    'auth/network-request-failed': '網路不穩，登入沒有完成，請稍後再試',
    'auth/web-storage-unsupported': '瀏覽器限制了本機儲存，沒辦法登入。可改從主畫面圖示打開旅伴再試',
    'auth/redirect-cancelled-by-user': '登入被取消了，請再按一次',
    'auth/not-ready': '登入還沒準備好，請再按一次'
  };
  return map[code] || '登入沒有完成，請再按一次。若一般分頁一直失敗，請從主畫面圖示打開旅伴再登入';
}
function rememberIntent(intent) {
  try { sessionStorage.setItem(AUTH_INTENT, JSON.stringify({ kind: intent.kind, code: intent.code || '', at: Date.now() })); } catch (e) {}
}
function takeIntent() {
  try {
    const raw = sessionStorage.getItem(AUTH_INTENT);
    sessionStorage.removeItem(AUTH_INTENT);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || !o.kind || Date.now() - (+o.at || 0) > 10 * 60 * 1000) return null;
    return o;
  } catch (e) { return null; }
}
function fbLoad() {
  if (fbP) return fbP;
  fbP = (async () => {
    const appM = await import(FB_BASE + 'firebase-app.js');
    const authM = await import(FB_BASE + 'firebase-auth.js');
    const app = appM.initializeApp(FB_CFG);
    let auth;
    try {
      auth = authM.initializeAuth(app, {
        persistence: [authM.indexedDBLocalPersistence, authM.browserLocalPersistence],
        popupRedirectResolver: authM.browserPopupRedirectResolver
      });
    } catch (e) {
      auth = authM.getAuth(app);
    }
    fbMods = { app, auth, db: null, authM, fsM: null, authReady: false };
    try { await auth.authStateReady(); } catch (e) {}
    fbMods.authReady = true;
    try { bootGis(); } catch (e) {}
    try {
      const fsM = await import(FB_BASE + 'firebase-firestore.js');
      let db;
      try {
        db = fsM.initializeFirestore(app, { localCache: fsM.persistentLocalCache({ tabManager: fsM.persistentMultipleTabManager() }) });
      } catch (e) {
        db = fsM.getFirestore(app);
      }
      fbMods.db = db;
      fbMods.fsM = fsM;
    } catch (e) {}
    return fbMods;
  })().catch(e => { fbP = null; throw e; });
  return fbP;
}
function cloudUid() { return cloudUser && cloudUser.uid || ''; }
function cloudPersist() {
  if (window.TM && typeof TM.persist === 'function') TM.persist();
  else if (window.TM) TM.save();
}
function curTrip() { return window.TM && TM.T ? TM.T() : null; }
function memberOf(user, code) {
  return {
    name: String(user.displayName || '旅伴').slice(0, 40),
    photo: typeof user.photoURL === 'string' ? user.photoURL.slice(0, 480) : '',
    email: typeof user.email === 'string' ? user.email.slice(0, 100) : '',
    joinedAt: Date.now(),
    inviteCode: code
  };
}
function tripDoc(t) {
  const o = {
    ownerUid: t.ownerUid,
    inviteCode: t.inviteCode,
    dest: t.dest || '',
    dep: t.dep || '',
    ret: t.ret || '',
    pax: +t.pax || 1,
    orig: t.orig || 'TPE',
    days: encodeDays(t.days || []),
    expenses: t.expenses || [],
    expSeen: t.expSeen || [],
    orderRev: t.orderRev || 0,
    metaRev: t.metaRev || 0,
    tomb: t.tomb || {},
    expTomb: t.expTomb || {}
  };
  return JSON.parse(JSON.stringify(o));
}
function fromDoc(data, id) {
  const o = Object.assign({}, data || {});
  o.days = decodeDays(o.days);
  if (id) o.cloudId = id;
  return o;
}
function applyMerged(t, merged) {
  const members = t.members;
  const id = t.id;
  Object.keys(t).forEach(k => { if (k !== 'id') delete t[k]; });
  Object.assign(t, merged, { id, members: members || merged.members || [] });
}
function listenTrip(id) {
  if (cloudUnsub) { cloudUnsub(); cloudUnsub = null; }
  if (memUnsub) { memUnsub(); memUnsub = null; }
  fbLoad().then(({ db, fsM }) => {
    cloudUnsub = fsM.onSnapshot(fsM.doc(db, 'trips', id), snap => {
      if (!snap.exists() || cloudWriting) return;
      const t = curTrip();
      if (!t || t.cloudId !== id) return;
      const remote = fromDoc(snap.data(), id);
      const merged = mergeTrip(t, remote);
      cloudAck = JSON.parse(JSON.stringify(merged));
      const before = JSON.stringify(tripDoc(t));
      applyMerged(t, merged);
      if (JSON.stringify(tripDoc(t)) !== before) { cloudPersist(); if (TM.getTab && (TM.getTab() === 'edit' || TM.getTab() === 'expense' || TM.getTab() === 'list')) TM.render(); }
    }, () => { if (navigator.onLine === false && TM.toast) TM.toast('目前離線，先用這台裝置上的行程'); });
    memUnsub = fsM.onSnapshot(fsM.collection(db, 'trips', id, 'members'), snap => {
      const t = curTrip();
      if (!t || t.cloudId !== id) return;
      const members = [];
      snap.forEach(d => members.push(Object.assign({ uid: d.id }, d.data())));
      t.members = members;
      cloudPersist();
      if (TM.getTab && (TM.getTab() === 'edit' || TM.getTab() === 'expense')) TM.render();
    }, () => {});
  }).catch(() => {});
}
function cloudPush() {
  const t = curTrip();
  if (!t || !t.cloudId || cloudWriting) return;
  const before = JSON.stringify(tripDoc(t));
  stampAgainst(t, cloudAck);
  if (JSON.stringify(tripDoc(t)) !== before) cloudPersist();
  if (!cloudUser) return;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(() => pushNow(t.cloudId), 450);
}
async function pushNow(id) {
  const t = curTrip();
  if (!t || t.cloudId !== id || !cloudUser) return;
  stampAgainst(t, cloudAck);
  const payload = tripDoc(t);
  if (cloudAck && JSON.stringify(tripDoc(cloudAck)) === JSON.stringify(payload)) return;
  cloudWriting = true;
  try {
    const { db, fsM } = await fbLoad();
    await fsM.runTransaction(db, async tx => {
      const ref = fsM.doc(db, 'trips', id);
      const snap = await tx.get(ref);
      const remote = snap.exists() ? fromDoc(snap.data(), id) : null;
      const base = JSON.parse(JSON.stringify(t));
      const merged = remote ? mergeTrip(base, remote) : base;
      tx.set(ref, tripDoc(merged));
      applyMerged(t, merged);
      cloudAck = JSON.parse(JSON.stringify(merged));
    });
    cloudPersist();
  } catch (e) {
    if (TM.toast) TM.toast('雲端暫時存不了，這台裝置還留著');
  } finally { cloudWriting = false; }
}
/* 一般分頁禁止整頁導向登入。Android Chrome 會把導向送進被分割的 firebaseapp.com，出現 missing initial state。彈出視窗失敗就留在本頁並說明。 */
function popupFail(err) {
  const code = err && err.code || '';
  if (TM.toast) TM.toast(authErrText(code));
  return Promise.reject(err);
}
/* 必須在點擊當下直接呼叫，前面不能 await。Auth 已在頁面載入時初始化，這裡才能留在使用者手勢裡。 */
function signInGoogle(intent) {
  if (cloudUser) return Promise.resolve(cloudUser);
  const mods = fbMods;
  if (!mods || !mods.authReady) {
    fbLoad().catch(() => {});
    const err = new Error('auth-not-ready');
    err.code = 'auth/not-ready';
    if (TM.toast) TM.toast(authErrText(err.code));
    return Promise.reject(err);
  }
  const { auth, authM } = mods;
  if (auth.currentUser) { cloudUser = auth.currentUser; return Promise.resolve(cloudUser); }
  const provider = new authM.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  let pending;
  try {
    pending = authM.signInWithPopup(auth, provider);
  } catch (e) {
    return popupFail(e);
  }
  return pending.then(cred => {
    cloudUser = cred.user;
    paintAccount();
    return cred.user;
  }).catch(popupFail);
}
function signInWithGoogleToken(idToken) {
  const mods = fbMods;
  if (!mods || !mods.authReady || !idToken) return Promise.reject(new Error('auth-not-ready'));
  const cred = mods.authM.GoogleAuthProvider.credential(idToken);
  return mods.authM.signInWithCredential(mods.auth, cred).then(res => {
    cloudUser = res.user;
    paintAccount();
    const intent = takeIntent();
    if (intent && intent.kind === 'share') return finishShare(res.user);
    if (intent && intent.kind === 'join' && intent.code) return finishJoin(intent.code, res.user);
    return res.user;
  }).catch(e => {
    if (TM.toast) TM.toast(authErrText(e && e.code));
    throw e;
  });
}
function bootGis() {
  if (!GOOGLE_WEB_CLIENT_ID || window.__gis) return;
  window.__gis = 'loading';
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true;
  s.onload = () => {
    if (!window.google || !google.accounts || !google.accounts.id) return;
    google.accounts.id.initialize({
      client_id: GOOGLE_WEB_CLIENT_ID,
      callback: (resp) => { if (resp && resp.credential) signInWithGoogleToken(resp.credential); },
      auto_select: false,
      ux_mode: 'popup',
      use_fedcm_for_prompt: true
    });
    window.__gis = 'ready';
    try { google.accounts.id.prompt(); } catch (e) {}
    renderGisButton();
  };
  s.onerror = () => { window.__gis = ''; };
  document.head.appendChild(s);
}
function renderGisButton() {
  const el = document.querySelector('#gisbtn');
  if (!el || !GOOGLE_WEB_CLIENT_ID || !window.google || !google.accounts || !google.accounts.id) return;
  el.innerHTML = '';
  google.accounts.id.renderButton(el, { type: 'standard', theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', width: 280 });
}
function signOutGoogle() {
  fbLoad().then(({ auth, authM }) => authM.signOut(auth)).then(() => { cloudUser = null; paintAccount(); if (TM.toast) TM.toast('已登出。行程仍留在這台裝置'); }).catch(() => {});
}
function joinUrl(code) {
  const u = new URL(location.href);
  u.search = '';
  u.hash = '';
  if (code) u.searchParams.set('join', code);
  return u.toString();
}
function showInvite(t) {
  const url = joinUrl(t.inviteCode);
  $('#sheetBody').innerHTML = `<h2>邀請朋友一起改</h2><p class="mut">朋友打開連結或輸入邀請碼，用 Google 登入後就能一起改這份行程。沒網路時，各自還是先改這台裝置上的複本。</p><p style="font-size:28px;font-weight:800;letter-spacing:4px;text-align:center">${TM.esc(t.inviteCode)}</p><input class="dinp" id="invurl" readonly value="${TM.esc(url)}" onclick="this.select()" style="width:100%;min-height:48px;padding:10px 12px;border:1.5px solid var(--bd);border-radius:12px;font-size:14px"><div class="row" style="margin-top:12px"><button type="button" class="btn" onclick="copyInvite()">複製連結</button><button type="button" class="btn ghost" onclick="shareInvite()">傳給朋友</button></div><button type="button" class="btn ghost blk" style="margin-top:8px" onclick="closeSheet()">關閉</button>`;
  TM.openSheet();
}
function copyInvite() {
  const v = $('#invurl') && $('#invurl').value;
  if (!v) return;
  navigator.clipboard?.writeText(v).then(() => TM.toast('已複製連結'), () => TM.toast('請長按連結複製'));
}
function shareInvite() {
  const v = $('#invurl') && $('#invurl').value;
  const t = curTrip();
  const text = t ? `一起來排「${t.dest}」的行程，邀請碼 ${t.inviteCode}` : '一起來排行程';
  if (navigator.share && v) navigator.share({ title: '旅伴行程', text, url: v }).catch(e => { if (e && e.name === 'AbortError') return; copyInvite(); });
  else copyInvite();
}
async function finishShare(user) {
  const t = curTrip();
  if (!t || !user) return;
  if (t.cloudId && t.inviteCode) { showInvite(t); listenTrip(t.cloudId); return; }
  try {
    const { db, fsM } = await fbLoad();
    ensureIds(t);
    stampAgainst(t, null);
    let code = '', ok = false;
    for (let n = 0; n < 5 && !ok; n++) {
      code = newCode();
      const inv = await fsM.getDoc(fsM.doc(db, 'invites', code));
      ok = !inv.exists();
    }
    if (!ok) { TM.toast('邀請碼暫時發不出來，請再按一次'); return; }
    const ref = fsM.doc(fsM.collection(db, 'trips'));
    t.cloudId = ref.id;
    t.inviteCode = code;
    t.ownerUid = user.uid;
    cloudWriting = true;
    await fsM.setDoc(ref, tripDoc(t));
    await fsM.setDoc(fsM.doc(db, 'invites', code), { tripId: ref.id, ownerUid: user.uid, dest: String(t.dest || '').slice(0, 40) });
    await fsM.setDoc(fsM.doc(db, 'trips', ref.id, 'members', user.uid), memberOf(user, code));
    cloudAck = JSON.parse(JSON.stringify(t));
    cloudWriting = false;
    cloudPersist();
    listenTrip(ref.id);
    TM.render();
    showInvite(t);
    TM.toast('已分享。朋友輸入邀請碼就能加入');
  } catch (e) {
    cloudWriting = false;
    TM.toast('分享沒有成功。請確認已開啟 Firestore，並貼上規則');
  }
}
function shareCloud() {
  const t = curTrip();
  if (!t) { if (TM.toast) TM.toast('請先選一個行程'); return; }
  if (t.cloudId && t.inviteCode) { showInvite(t); listenTrip(t.cloudId); return; }
  const pending = signInGoogle({ kind: 'share' });
  pending.then(user => { if (user) return finishShare(user); }).catch(() => {});
}
function openJoin(code) {
  fbLoad().catch(() => {});
  const preset = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  $('#sheetBody').innerHTML = `<h2>加入朋友的行程</h2><p class="mut">輸入 6 碼邀請碼。要加入雲端行程，需要用 Google 登入。不登入仍可自己排，資料留在這台裝置。</p><label class="fld">邀請碼<input id="jcode" maxlength="6" value="${TM.esc(preset)}" style="letter-spacing:4px;text-transform:uppercase"></label><div class="row"><button type="button" class="btn ghost" onclick="closeSheet()">取消</button><button type="button" class="btn" onclick="submitJoin()">加入</button></div>`;
  TM.openSheet();
}
async function finishJoin(code, user) {
  if (!user) return;
  try {
    const { db, fsM } = await fbLoad();
    const inv = await fsM.getDoc(fsM.doc(db, 'invites', code));
    if (!inv.exists()) { TM.toast('找不到這個邀請碼'); return; }
    const tripId = inv.data().tripId;
    const memRef = fsM.doc(db, 'trips', tripId, 'members', user.uid);
    const mine = await fsM.getDoc(memRef);
    if (!mine.exists()) await fsM.setDoc(memRef, memberOf(user, code));
    const snap = await fsM.getDoc(fsM.doc(db, 'trips', tripId));
    if (!snap.exists()) { TM.toast('行程不在了'); return; }
    const data = fromDoc(snap.data(), tripId);
    let t = (TM.trips ? TM.trips() : []).find(x => x.cloudId === tripId);
    if (!t) {
      t = Object.assign({ id: Date.now().toString(36), days: [], members: [] }, data);
      ensureIds(t);
      TM.addTripObj(t);
    } else {
      const merged = mergeTrip(t, data);
      applyMerged(t, merged);
    }
    cloudAck = JSON.parse(JSON.stringify(t));
    cloudPersist();
    listenTrip(tripId);
    TM.closeSheet();
    TM.go('edit');
    TM.toast('已加入，之後的修改會互相更新');
  } catch (e) {
    TM.toast('加入沒有成功。請確認邀請碼，以及 Firestore 規則已貼上');
  }
}
function submitJoin() {
  const code = ($('#jcode') && $('#jcode').value || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) { TM.toast('邀請碼是 6 個英數'); return; }
  const pending = signInGoogle({ kind: 'join', code });
  pending.then(user => { if (user) return finishJoin(code, user); }).catch(() => {});
}
function paintAccount() {
  const el = $('#acct');
  if (!el) return;
  if (!cloudUser) {
    const gis = GOOGLE_WEB_CLIENT_ID ? '<div id="gisbtn"></div><p class="mut">上面的 Google 按鈕不會離開這個網站。若沒有出現，再用下面的方式。</p>' : '';
    el.innerHTML = `<div class="card"><b>Google 帳號</b><p class="mut">不登入也能排行程，資料只在這台裝置。登入之後才能把行程分享給朋友、一起改。</p>${gis}<button type="button" class="btn" onclick="signInGoogle({kind:'account'}).then(()=>paintAccount()).catch(()=>{})">用 Google 登入</button></div>`;
    renderGisButton();
    return;
  }
  const name = cloudUser.displayName || cloudUser.email || '已登入';
  const photo = /^https:\/\//.test(cloudUser.photoURL || '') ? `<img class="ava" src="${TM.esc(cloudUser.photoURL)}" alt="">` : '';
  el.innerHTML = `<div class="card"><div class="memrow">${photo}<b>${TM.esc(name)}</b></div><button type="button" class="btn ghost" style="margin-top:8px" onclick="signOutGoogle()">登出</button></div>`;
}
function memberBar(t) {
  if (!t || !t.cloudId) return '';
  const ms = t.members || [];
  const ava = ms.map(m => {
    const name = m.name || '成員';
    const photo = /^https:\/\//.test(m.photo || '') ? m.photo : '';
    return photo ? `<img class="ava" src="${TM.esc(photo)}" alt="${TM.esc(name)}" title="${TM.esc(name)}">` : `<span class="ava" title="${TM.esc(name)}">${TM.esc(name.slice(0, 1))}</span>`;
  }).join('');
  return `<div class="memrow noprint">${ava || ''}<span class="mut">邀請碼 ${TM.esc(t.inviteCode || '')}</span></div>`;
}
function afterAuthReady(mods) {
  const { auth, authM } = mods;
  authM.onAuthStateChanged(auth, user => {
    cloudUser = user || null;
    paintAccount();
    const trip = curTrip();
    if (user && trip && trip.cloudId) listenTrip(trip.cloudId);
  });
  authM.getRedirectResult(auth).then(cred => {
    if (!(cred && cred.user)) return;
    cloudUser = cred.user;
    const intent = takeIntent();
    if (!intent) return;
    if (intent.kind === 'share') finishShare(cred.user);
    else if (intent.kind === 'join' && intent.code) finishJoin(intent.code, cred.user);
  }).catch(e => { if (TM.toast && e && e.code) TM.toast(authErrText(e.code)); });
}
function bootCloud() {
  if (!window.TM) return;
  const q = window.__join || new URLSearchParams(location.search).get('join');
  if (q) setTimeout(() => openJoin(q), 300);
  const t = curTrip();
  if (t && t.cloudId) {
    ensureIds(t);
    cloudAck = JSON.parse(JSON.stringify(t));
  }
  fbLoad().then(afterAuthReady).catch(() => {});
}
addEventListener('DOMContentLoaded', () => setTimeout(bootCloud, 0));
fbLoad().catch(() => {});
