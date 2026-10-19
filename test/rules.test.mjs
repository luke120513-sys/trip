import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, getDocs, setDoc, collection } from 'firebase/firestore';

const rules = readFileSync(process.env.RULES_PATH || new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({
  projectId: 'demo-flysave',
  firestore: { rules }
});

const trip = {
  ownerUid: 'owner',
  inviteCode: 'AB23CD',
  dest: '東京',
  dep: '2026-11-02',
  ret: '2026-11-06',
  pax: 2,
  orig: 'TPE',
  days: [{ spots: [{ sid: 's1', rev: 1, name: '淺草寺' }] }],
  expenses: [],
  orderRev: 1,
  metaRev: 1,
  tomb: {},
  expTomb: {}
};
const member = (code) => ({ name: '旅伴', photo: '', email: '', joinedAt: Date.now(), inviteCode: code });

const db = (uid) => env.authenticatedContext(uid).firestore();
const anon = () => env.unauthenticatedContext().firestore();

await env.withSecurityRulesDisabled(async (ctx) => {
  await setDoc(doc(ctx.firestore(), 'trips/t1'), trip);
  await setDoc(doc(ctx.firestore(), 'invites/AB23CD'), { tripId: 't1', ownerUid: 'owner', dest: '東京' });
  await setDoc(doc(ctx.firestore(), 'trips/t1/members/owner'), member('AB23CD'));
});

await assertSucceeds(getDoc(doc(db('owner'), 'trips/t1')));
await assertFails(getDoc(doc(db('stranger'), 'trips/t1')));
await assertFails(getDoc(doc(anon(), 'trips/t1')));
await assertFails(getDocs(collection(db('owner'), 'trips')));
await assertFails(getDocs(collection(db('owner'), 'invites')));
await assertSucceeds(getDoc(doc(db('friend'), 'invites/AB23CD')));
await assertFails(getDoc(doc(anon(), 'invites/AB23CD')));

await assertFails(setDoc(doc(db('friend'), 'trips/t1/members/friend'), member('NOPE00')));
await assertSucceeds(setDoc(doc(db('friend'), 'trips/t1/members/friend'), member('AB23CD')));
await assertFails(setDoc(doc(db('friend'), 'trips/t1/members/friend'), member('AB23CD')));
await assertFails(setDoc(doc(db('friend'), 'trips/t1/members/owner'), member('AB23CD')));
await assertSucceeds(getDoc(doc(db('friend'), 'trips/t1')));
await assertFails(getDoc(doc(db('stranger'), 'trips/t1/members/friend')));
await assertSucceeds(getDoc(doc(db('friend'), 'trips/t1/members/friend')));

const edited = Object.assign({}, trip, { days: [{ spots: [{ sid: 's1', rev: 2, name: '晴空塔' }] }] });
await assertSucceeds(setDoc(doc(db('friend'), 'trips/t1'), edited));
await assertFails(setDoc(doc(db('friend'), 'trips/t1'), Object.assign({}, edited, { ownerUid: 'friend' })));
await assertFails(setDoc(doc(db('friend'), 'trips/t1'), Object.assign({}, edited, { inviteCode: 'ZZZZZZ' })));
await assertFails(deleteDoc(doc(db('friend'), 'trips/t1')));
await assertFails(setDoc(doc(db('stranger'), 'trips/t1'), edited));

const fresh = Object.assign({}, trip, { ownerUid: 'owner', inviteCode: 'ZX98QW' });
await assertSucceeds(setDoc(doc(db('owner'), 'trips/t2'), fresh));
await assertFails(setDoc(doc(db('owner'), 'invites/ZX98QW'), { tripId: 't2', ownerUid: 'friend', dest: '東京' }));
await assertSucceeds(setDoc(doc(db('owner'), 'invites/ZX98QW'), { tripId: 't2', ownerUid: 'owner', dest: '東京' }));
await assertFails(setDoc(doc(db('owner'), 'invites/ZX98QW'), { tripId: 't2', ownerUid: 'owner', dest: '大阪' }));
await assertSucceeds(setDoc(doc(db('owner'), 'trips/t2/members/owner'), member('ZX98QW')));
await assertSucceeds(deleteDoc(doc(db('owner'), 'trips/t1')));

await env.cleanup();
console.log('rules tests ok');
