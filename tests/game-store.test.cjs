const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

// Exercise the real Zustand store with an isolated, asynchronous disk adapter.
// Never open the player's AsyncStorage or browser profile during these tests.
let saved = null;
let writes = 0;
let readError = false;
const storage = {
  async getItem() {
    await new Promise(resolve => setImmediate(resolve));
    if (readError) throw new Error('storage unavailable');
    return saved;
  },
  async setItem(_key, value) { saved = value; writes += 1; },
  async removeItem() { saved = null; },
};
const originalLoad = Module._load;
Module._load = function(id, ...args) {
  return id === '@react-native-async-storage/async-storage' ? storage : originalLoad.call(this, id, ...args);
};
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText, filename);
};
const { useGameStore: store, loadGame, getCps, getClickGain, getOvenUpgradeCost } = require('../src/store/useGameStore.ts');
const { getDrawPool } = require('../src/data/drawOdds.ts');
const { MISSIONS } = require('../src/data/missions.ts');
const { BUILDINGS } = require('../src/data/buildings.ts');
const { OVENS } = require('../src/data/ovens.ts');
const initial = structuredClone(JSON.parse(JSON.stringify(store.getState())));
const get = () => store.getState();
beforeEach(() => { store.setState(structuredClone(initial)); });

test('slow save restoration does not write defaults before hydration; read failure is retryable', async () => {
  const fixture = { ...initial, cookies: 4321, taps: 567, settings: { ...initial.settings, music: false } };
  saved = JSON.stringify({ state: fixture, version: 0 });
  writes = 0;
  readError = true;
  await assert.rejects(loadGame(), /storage unavailable/);
  assert.equal(writes, 0);
  assert.equal(store.persist.hasHydrated(), false);
  readError = false;
  const loading = loadGame();
  assert.equal(writes, 0);
  await loading;
  assert.equal(get().cookies, 4321);
  assert.equal(get().taps, 567);
  assert.equal(writes, 0);
});

test('all mission gates reject unmet goals, award once, and survive rehydration', async () => {
  const qualifying = {
    tap: { taps: 100 }, stockpile: { cookies: 100000 },
    building: { buildings: { ...initial.buildings, grandma_oven: 15 } },
    chip: { chocoChips: 20 }, draw: { totalDraws: 10 },
    upgrade: { upgrades: { click: 1, cps: 0, global: 0 } },
    rebirth: { rebirths: 1 }, lifetime: { totalCookies: 1000000 },
  };
  for (const mission of MISSIONS) {
    store.setState(structuredClone(initial));
    assert.equal(get().claimMission(mission.id), false, mission.id);
    store.setState(qualifying[mission.id]);
    assert.equal(get().claimMission(mission.id), true, mission.id);
    const snapshot = saved;
    assert.equal(get().claimMission(mission.id), false);
    assert.equal(saved, snapshot);
    await store.persist.rehydrate();
    assert.equal(get().claimMission(mission.id), false);
  }
});

test('tutorial gates require a tap, 15 buildings and a draw; reward is delivered only once', () => {
  get().advanceTutorial();
  assert.equal(get().tutorialStep, 0);
  assert.equal(get().claimMail('tutorial'), false);
  get().click(); get().advanceTutorial();
  get().advanceTutorial();
  assert.equal(get().tutorialStep, 1);
  store.setState({ cookies: 100000 });
  for (let i = 0; i < 14; i++) assert.equal(get().buyBuilding('grandma_oven'), true);
  get().advanceTutorial();
  assert.equal(get().tutorialStep, 1);
  get().buyBuilding('grandma_oven'); get().advanceTutorial();
  get().advanceTutorial();
  assert.equal(get().tutorialStep, 2);
  assert.ok(get().draw()); get().advanceTutorial();
  get().advanceTutorial(); get().advanceTutorial();
  assert.equal(get().tutorialComplete, true);
  const chips = get().chocoChips;
  assert.equal(get().claimMail('tutorial'), true);
  assert.equal(get().chocoChips, chips + 10);
  assert.equal(get().claimMail('tutorial'), false);
  get().advanceTutorial();
  assert.equal(get().tutorialStep, 5);
});

test('invalid requests cannot mint currency or crash economy actions', () => {
  store.setState({ cookies: 300000 });
  const baseline = saved;
  for (const amount of [-100000, NaN, Infinity, 0]) assert.equal(get().exchangeCookies(amount), false);
  assert.equal(get().claimMail('unknown'), false);
  assert.equal(get().claimMission('unknown'), false);
  assert.equal(get().buyBuilding('unknown'), false);
  assert.equal(get().sellBuilding('unknown'), false);
  assert.equal(get().buyUpgrade('unknown'), false);
  assert.equal(get().exchangeChips('unknown'), false);
  assert.equal(get().activateBoost(100), false);
  for (const seconds of [-1, NaN, Infinity]) assert.equal(get().tick(seconds), 0);
  assert.equal(saved, baseline);
  assert.equal(get().exchangeCookies(250000), true);
  assert.equal(get().cookies, 100000);
  assert.equal(get().chocoChips, 12);
});

test('offline income splits expired boost intervals, accumulates pending claims, and is idempotent', () => {
  const realNow = Date.now;
  let now = 200000;
  Date.now = () => now;
  try {
    store.setState({ buildings: { ...initial.buildings, grandma_oven: 1 },
      lastSavedAt: now - 100000, boostUntil: now - 80000, boostMultiplier: 4 });
    get().checkOffline();
    assert.equal(get().pendingOffline, 120); // (20 * 4 + 80) * .75
    get().checkOffline();
    assert.equal(get().pendingOffline, 120);
    now += 40000;
    get().checkOffline();
    assert.equal(get().pendingOffline, 150);
    assert.equal(get().offlineSeconds, 140);
    assert.equal(get().claimOffline(), 150);
    assert.equal(get().claimOffline(), 0);
    assert.equal(get().cookies, 150);
    assert.equal(get().totalCookies, 150);
  } finally { Date.now = realNow; }
});

test('offline rewards cap at four hours and clock rollback grants nothing', () => {
  store.setState({ buildings: { ...initial.buildings, grandma_oven: 1 }, lastSavedAt: Date.now() - 86400000 });
  get().checkOffline();
  assert.equal(get().pendingOffline, 10800);
  assert.equal(get().offlineSeconds, 14400);
  get().claimOffline();
  store.setState({ lastSavedAt: Date.now() + 100000 });
  get().checkOffline();
  assert.equal(get().pendingOffline, 0);
});

test('fractional production accumulates across ticks and persists with progress', async () => {
  store.setState({ buildings: { ...initial.buildings, grandma_oven: 1 }, upgrades: { click: 0, cps: 1, global: 0 } });
  assert.equal(getCps(get()), 1.25);
  get().tick(1); get().tick(1);
  assert.equal(get().cookies, 2);
  assert.equal(get().incomeRemainder, 0.5);
  await store.persist.rehydrate();
  get().tick(1); get().tick(1);
  assert.equal(get().cookies, 5);
  assert.equal(get().totalCookies, 5);
  assert.equal(get().incomeRemainder, 0);
});

test('rebirth clears only spendable cookies, retaining buildings, upgrades, collection and lifetime', () => {
  store.setState({ cookies: 100000, totalCookies: 150000, buildings: { ...initial.buildings, grandma_oven: 15 },
    upgrades: { click: 1, cps: 1, global: 1 }, dictionaries: 2 });
  const before = JSON.parse(saved).state;
  const cps = getCps(get());
  assert.equal(get().rebirth(), true);
  assert.equal(get().cookies, 0);
  assert.equal(get().totalCookies, before.totalCookies);
  for (const key of ['ovens', 'buildings', 'upgrades', 'chocoChips', 'dictionaries']) assert.deepEqual(get()[key], before[key]);
  assert.equal(get().epirus.twilight, 2);
  assert.ok(Math.abs(getCps(get()) - cps * 1.5) < 1e-8);
});

test('draws consume currency and next boost once; fusion and sales keep inventory consistent', () => {
  store.setState({ dictionaries: 1 });
  assert.equal(get().prepareDrawBoost('dictionary'), true);
  assert.equal(get().prepareDrawBoost('dictionary'), false);
  assert.ok(get().draw());
  assert.equal(get().nextDrawBoost, 'none');
  assert.equal(get().dictionaries, 0);
  for (let i = 0; i < 9; i++) assert.ok(get().draw());
  assert.equal(get().draw(), null);
  assert.equal(get().totalDraws, 10);
  assert.equal(get().ovens.reduce((sum, oven) => sum + oven.level, 0), OVENS.length + 10);
  const id = OVENS[0].id;
  store.setState({ ovens: get().ovens.map(oven => oven.ovenId === id ? { ...oven, level: 6 } : oven) });
  assert.equal(get().fuseOven(id), true);
  assert.equal(get().fuseOven(id), true);
  assert.equal(get().fuseOven(id), false);
  assert.equal(get().ovens[0].level, 1);
  assert.equal(get().dismantleOven(id), false);
  assert.ok(getClickGain(get()) >= 1);
  store.setState({ cookies: 1000 });
  get().buyBuilding(BUILDINGS[0].id);
  get().sellBuilding(BUILDINGS[0].id);
  assert.equal(get().cookies, 980);
});

test('oven enhancements preserve copies, increase production, persist, and survive rebirth', async () => {
  store.setState({ cookies: 200000, buildings: { ...initial.buildings, grandma_oven: 10 } });
  const copies = get().ovens[0].level;
  const cps = getCps(get());
  const cost = getOvenUpgradeCost(get().ovens[0]);
  assert.equal(get().upgradeOven('unknown'), false);
  assert.equal(get().upgradeOven('oven-0'), true);
  assert.equal(get().cookies, 200000 - cost);
  assert.equal(get().ovens[0].level, copies);
  assert.equal(get().ovens[0].upgradeLevel, 1);
  assert.ok(Math.abs(getCps(get()) - cps * 1.1) < 1e-8);
  assert.ok(getOvenUpgradeCost(get().ovens[0]) > cost);
  await store.persist.rehydrate();
  get().rebirth();
  assert.equal(get().ovens[0].upgradeLevel, 1);
  assert.equal(get().upgradeOven('oven-0'), false);
});

test('traits spend matching crystals first, then universal crystals, without double-spending', () => {
  store.setState({ ovens: get().ovens.map(oven => ({ ...oven, core: 'aurora' })),
    epirus: { aurora: 1, opternal: 0, twilight: 0, phoenix: 0, infinity: 5 } });
  assert.equal(get().rollTrait('oven-0'), true);
  assert.equal(get().epirus.aurora, 0);
  assert.equal(get().epirus.infinity, 5);
  assert.equal(get().rollTrait('oven-0'), true);
  assert.equal(get().epirus.infinity, 3);
  assert.equal(get().rollTrait('oven-0'), true);
  assert.equal(get().epirus.infinity, 0);
  assert.equal(get().ovens[0].trait, '글리치');
  assert.equal(get().rollTrait('oven-0'), false);
  assert.equal(get().rollTrait('oven-1'), false);
});

test('earned achievements stay unlocked after spending, selling, dismantling and reloading', async () => {
  store.setState({ cookies: 1000, ovens: get().ovens.map(oven => oven.ovenId === 'oven-16' ? { ...oven, level: 2 } : oven) });
  get().buyBuilding('grandma_oven');
  get().sellBuilding('grandma_oven');
  get().draw();
  get().dismantleOven('oven-16');
  assert.ok(get().achievements.includes('automation'));
  assert.ok(get().achievements.includes('chips'));
  assert.ok(get().achievements.includes('secret'));
  await store.persist.rehydrate();
  assert.ok(get().achievements.includes('automation'));
  assert.ok(get().achievements.includes('secret'));
});

test('shared odds cover every oven, normalize to 100%, and retain the specified Secret chance', () => {
  for (const premium of [false, true]) for (const boost of ['none', 'dictionary', 'diary']) {
    const pool = getDrawPool(premium, boost, 1);
    assert.equal(pool.length, OVENS.length);
    assert.ok(pool.every(item => item.chance > 0));
    assert.ok(Math.abs(pool.reduce((sum, item) => sum + item.chance, 0) - 1) < 1e-12);
  }
  const secretChance = (premium, boost, level) => getDrawPool(premium, boost, level).at(-1).chance;
  assert.ok(Math.abs(secretChance(false, 'none', 1) * 100 - 0.0329) < 0.000001);
  assert.ok(secretChance(false, 'diary', 1) > secretChance(false, 'dictionary', 1));
  assert.ok(secretChance(false, 'dictionary', 1) > secretChance(false, 'none', 1));
  assert.ok(secretChance(false, 'none', 20) > secretChance(false, 'none', 1));
  assert.equal(secretChance(true, 'none', 20), secretChance(true, 'none', 1));
});

test('replacing the module cannot overwrite a save before its new instance is hydrated', async () => {
  store.setState({ cookies: 97531, tutorialStep: 2, taps: 100 });
  const snapshot = saved;
  const filename = require.resolve('../src/store/useGameStore.ts');
  delete require.cache[filename];
  const fresh = require(filename);
  fresh.useGameStore.getState().ensureAllOvens();
  fresh.useGameStore.getState().checkOffline();
  fresh.useGameStore.getState().tick(1);
  fresh.useGameStore.getState().click();
  assert.equal(saved, snapshot);
  await fresh.loadGame();
  assert.equal(fresh.useGameStore.getState().cookies, 97531);
  assert.equal(fresh.useGameStore.getState().tutorialStep, 2);
  assert.equal(fresh.useGameStore.getState().taps, 100);
  fresh.useGameStore.getState().click();
  assert.equal(fresh.useGameStore.getState().cookies, 97532);
});
