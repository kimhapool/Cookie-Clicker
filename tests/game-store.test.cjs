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
const { useGameStore: store, loadGame, getCps, getClickGain, getOvenMultipliers, getOvenUpgradeCost } = require('../src/store/useGameStore.ts');
const { getDrawPool } = require('../src/data/drawOdds.ts');
const { buildDrawSequence, COOKIE_TILES } = require('../src/utils/drawSequence.ts');
const { MISSIONS } = require('../src/data/missions.ts');
const { BUILDINGS } = require('../src/data/buildings.ts');
const { OVENS } = require('../src/data/ovens.ts');
const initial = structuredClone(JSON.parse(JSON.stringify(store.getState())));
const get = () => store.getState();
beforeEach(() => { store.setState(structuredClone(initial)); });

test('inventory oven multipliers agree with production and tap gains across every oven and trait', () => {
  for (const oven of OVENS) {
    for (const trait of ['없음', '샤이니', '반전', '글리치']) {
      const owned = { ...initial.ovens.find(item => item.ovenId === oven.id), ovenId: oven.id, trait, fusion: 3, upgradeLevel: 7 };
      store.setState({ equippedOvenId: oven.id, ovens: [owned], buildings: { ...initial.buildings, grandma_oven: 1 } });
      const multiplier = getOvenMultipliers(owned);
      assert.equal(getClickGain(get()), Math.max(1, Math.floor(multiplier.click)), `${oven.id}/${trait} click`);
      assert.ok(Math.abs(getCps(get()) - multiplier.cps) < 1e-9, `${oven.id}/${trait} CPS`);
    }
  }
});

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

test('exchange and crafting charge exact prices and consume prepared draw items once', async () => {
  store.setState({ cookies: 1250000, chocoChips: 3009999 });
  assert.equal(get().exchangeCookies(get().cookies), true);
  assert.equal(get().cookies, 50000);
  assert.equal(get().chocoChips, 3010011);
  assert.equal(get().exchangeChips('premium'), true);
  assert.equal(get().premiumChips, 1);
  for (let i = 0; i < 3; i++) assert.equal(get().exchangeChips('dictionary'), true);
  assert.equal(get().chocoChips, 11);
  assert.equal(get().exchangeChips('dictionary'), false);
  assert.equal(get().exchangeChips('diary'), true);
  assert.equal(get().dictionaries, 0);
  assert.equal(get().diaries, 1);
  assert.equal(get().exchangeChips('diary'), false);
  assert.equal(get().prepareDrawBoost('diary'), true);
  await store.persist.rehydrate();
  assert.equal(get().nextDrawBoost, 'diary');
  assert.equal(get().diaries, 0);
  assert.ok(get().draw(true));
  assert.equal(get().premiumChips, 0);
  assert.equal(get().nextDrawBoost, 'none');
  assert.equal(get().prepareDrawBoost('diary'), false);
});

test('dismantling pays each specified crystal type while retaining the last copy', async () => {
  store.setState({ ovens: get().ovens.map(oven => ({ ...oven, level: 2 })) });
  for (const id of ['oven-8', 'oven-12', 'oven-13', 'oven-16', 'oven-10']) {
    assert.equal(get().dismantleOven(id), true);
    assert.equal(get().dismantleOven(id), false);
  }
  await store.persist.rehydrate();
  assert.deepEqual(get().epirus, { aurora: 2, opternal: 4, twilight: 0, phoenix: 2, infinity: 5 });
});

test('timed boosts charge once, survive reload, and expire at their exact duration', async () => {
  const realNow = Date.now;
  let now = 900000;
  Date.now = () => now;
  try {
    store.setState({ cookies: 30000, buildings: { ...initial.buildings, grandma_oven: 1 } });
    for (const [multiplier, cost, duration] of [[2, 5000, 45000], [4, 25000, 20000]]) {
      const balance = get().cookies;
      assert.equal(get().activateBoost(multiplier), true);
      assert.equal(get().cookies, balance - cost);
      assert.equal(get().activateBoost(multiplier), false);
      await store.persist.rehydrate();
      assert.equal(getCps(get()), multiplier);
      assert.equal(getClickGain(get()), multiplier);
      now += duration;
      assert.equal(getCps(get()), 1);
      assert.equal(getClickGain(get()), 1);
    }
    assert.equal(get().cookies, 0);
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

test('draw presentation preserves every draw and always includes each Secret cinematic', () => {
  const draws = [OVENS[0], OVENS[16], OVENS[4], OVENS[16]];
  const steps = buildDrawSequence(draws);
  assert.deepEqual(steps.map(step => [step.drawIndex, step.kind]), [
    [0, 'flight'], [1, 'flight'], [1, 'secret'], [2, 'flight'], [3, 'flight'], [3, 'secret'],
  ]);
  assert.deepEqual(steps.filter(step => step.kind === 'flight').map(step => step.oven.id), draws.map(oven => oven.id));
  assert.equal(buildDrawSequence(Array(5).fill(OVENS[16])).filter(step => step.kind === 'secret').length, 5);
  assert.deepEqual(buildDrawSequence([]), []);
});

test('57 cookie source tiles cover the entire image with no missing or overlapping source regions', () => {
  assert.equal(COOKIE_TILES.length, 57);
  assert.ok(Math.abs(COOKIE_TILES.reduce((sum, tile) => sum + tile.width * tile.height, 0) - 1) < 1e-12);
  COOKIE_TILES.forEach((a, i) => {
    assert.ok(a.x >= 0 && a.y >= 0 && a.x + a.width <= 1 + 1e-12 && a.y + a.height <= 1 + 1e-12);
    COOKIE_TILES.slice(i + 1).forEach(b => {
      const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      assert.ok(overlapX < 1e-12 || overlapY < 1e-12);
    });
  });
});

test('building receipts conserve credited income and include global production multipliers', () => {
  const { allocateProduction, buildingProduction } = require('../src/utils/production.ts');
  const counts = { grandma_oven: 9, bakery: 3, cookie_factory: 2, space_bakery: 1 };
  for (const gain of [1, 2, 5, 100, 423411, 1000000000]) {
    const receipt = allocateProduction(gain, counts);
    assert.equal(Object.values(receipt).reduce((sum, value) => sum + value, 0), gain);
    assert.ok(Object.values(receipt).every(value => Number.isSafeInteger(value) && value >= 0));
    assert.equal(receipt.research_lab, undefined);
  }
  assert.deepEqual(allocateProduction(13, { grandma_oven: 1, bakery: 1 }), { grandma_oven: 1, bakery: 12 });
  assert.deepEqual(allocateProduction(0, counts), {});
  assert.deepEqual(allocateProduction(NaN, counts), {});
  assert.deepEqual(allocateProduction(100, {}), {});
  store.setState({ buildings: counts, rebirths: 2, upgrades: { click: 0, cps: 3, global: 2 } });
  const total = getCps(get());
  const shares = BUILDINGS.map(building => buildingProduction(building.id, total, counts));
  assert.ok(Math.abs(shares.reduce((a, b) => a + b, 0) - total) < 0.000001);
  assert.ok(buildingProduction('grandma_oven', total, counts) > 9);
  assert.equal(buildingProduction('missing', total, counts), 0);
});

test('building upgrades affect only their type, persist, and survive selling and rebirth', async () => {
  const { buildingUpgradeCost } = require('../src/data/buildings.ts');
  const { allocateProduction, buildingProduction } = require('../src/utils/production.ts');
  assert.equal(get().upgradeBuilding('grandma_oven'), false);
  store.setState({ cookies: 10000000, buildings: { ...initial.buildings, grandma_oven: 1, bakery: 1 } });
  const before = get().cookies;
  assert.equal(get().upgradeBuilding('grandma_oven'), true);
  assert.equal(get().cookies, before - 1000);
  assert.equal(getCps(get()), 13.2);
  assert.equal(buildingUpgradeCost('grandma_oven', 1), 1750);
  assert.equal(get().upgradeBuilding('missing'), false);
  assert.equal(get().upgradeBuilding('space_bakery'), false);
  const receipts = allocateProduction(132, get().buildings, get().buildingUpgrades);
  assert.deepEqual(receipts, { grandma_oven: 12, bakery: 120 });
  assert.equal(buildingProduction('grandma_oven', getCps(get()), get().buildings, get().buildingUpgrades), 1.2);
  const snapshot = get().buildingUpgrades;
  await store.persist.rehydrate();
  assert.deepEqual(get().buildingUpgrades, snapshot);
  assert.equal(get().rebirth(), true);
  assert.equal(get().buildingUpgrades.grandma_oven, 1);
  get().sellBuilding('grandma_oven');
  assert.equal(get().buildingUpgrades.grandma_oven, 1);
  assert.equal(get().upgradeBuilding('grandma_oven'), false);
  const legacy = { ...initial, cookies: 123 };
  delete legacy.buildingUpgrades;
  // Start with fresh defaults, like a real process, then restore a pre-upgrade save.
  store.setState(structuredClone(initial));
  saved = JSON.stringify({ state: legacy, version: 0 });
  await store.persist.rehydrate();
  assert.deepEqual(get().buildingUpgrades, initial.buildingUpgrades);
  assert.equal(get().cookies, 123);
});

test('trait draws target an unequipped oven, expose exact costs, and persist each next tier', async () => {
  const { traitUpgrade } = require('../src/utils/traits.ts');
  const targetId = OVENS[16].id;
  store.setState({ epirus: { aurora: 1, opternal: 0, twilight: 0, phoenix: 0, infinity: 5 },
    ovens: get().ovens.map(oven => ({ ...oven, core: 'aurora' })) });
  const originalEquipped = get().equippedOvenId;
  const target = () => get().ovens.find(oven => oven.ovenId === targetId);
  for (const [next, cost] of [['샤이니', 1], ['반전', 2], ['글리치', 3]]) {
    const plan = traitUpgrade(target(), get().epirus);
    assert.equal(plan.cost, cost);
    assert.equal(plan.next, next);
    assert.equal(plan.canRoll, true);
    assert.equal(get().rollTrait(targetId), true);
    await store.persist.rehydrate();
    assert.equal(target().trait, next);
    assert.equal(get().equippedOvenId, originalEquipped);
    assert.equal(get().ovens.find(oven => oven.ovenId === originalEquipped).trait, '없음');
  }
  assert.equal(get().epirus.aurora, 0);
  assert.equal(get().epirus.infinity, 0);
  assert.equal(traitUpgrade(target(), get().epirus).canRoll, false);
  assert.equal(get().rollTrait(targetId), false);
});

test('batched draws match sequential odds, boosts, XP and inventory with one save per batch', () => {
  const originalRandom = Math.random;
  const seeded = () => {
    let seed = 74131;
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  };
  try {
    for (const premium of [false, true]) for (const boost of ['none', 'dictionary', 'diary']) {
      const fixture = { ...structuredClone(initial), chocoChips: 245, premiumChips: 245, drawXp: 19, drawLevel: 1, nextDrawBoost: boost };
      store.setState(fixture);
      Math.random = seeded();
      const sequential = Array.from({ length: 245 }, () => get().draw(premium).id);
      const expected = JSON.parse(JSON.stringify(get()));
      store.setState(fixture);
      Math.random = seeded();
      writes = 0;
      const batch = get().drawMany(premium, 500).map(oven => oven.id);
      assert.deepEqual(batch, sequential);
      assert.deepEqual(JSON.parse(JSON.stringify(get())), expected);
      assert.equal(writes, 1);
      assert.deepEqual(get().drawMany(premium, 1), []);
    }
    store.setState({ ...structuredClone(initial), chocoChips: 5000 });
    writes = 0;
    assert.equal(get().drawMany(false, 5000).length, 5000);
    assert.equal(get().chocoChips, 0);
    assert.equal(get().totalDraws, 5000);
    assert.equal(writes, 1);
    for (const invalid of [0, -1, 1.5, NaN, Infinity]) assert.deepEqual(get().drawMany(false, invalid), []);
  } finally { Math.random = originalRandom; }
});

test('all seven languages cover every oven and UI dictionary without Korean fallback or corrupt text', () => {
  const translations = require('../src/i18n/translations.ts');
  const langs = ['ko', 'en', 'ja', 'zh', 'ar', 'de', 'ru'];
  const dictionaries = ['labels', 'pageText', 'homeText', 'modalText', 'inventoryText', 'traitNames', 'progressText', 'accountText', 'automationText', 'coreNames'];
  const check = (value, language) => {
    if (typeof value === 'string') {
      assert.ok(!value.includes('\uFFFD'), value);
      if (language !== 'ko') assert.ok(!/[가-힣]/u.test(value), `${language}: ${value}`);
    } else if (value && typeof value === 'object') Object.values(value).forEach(item => check(item, language));
  };
  for (const language of langs) {
    for (const name of dictionaries) {
      assert.deepEqual(Object.keys(translations[name][language]).sort(), Object.keys(translations[name].ko).sort(), `${name}/${language}`);
      check(translations[name][language], language);
    }
    const names = OVENS.map(oven => translations.ovenDisplayName(oven.id, oven.name, language));
    assert.equal(new Set(names).size, 17);
    names.forEach(name => check(name, language));
    assert.equal(translations.modalText[language].resetPrompts.length, 6);
  }
});

test('building and oven enhancements qualify for the permanent-upgrade mission', () => {
  const { getMissionProgress } = require('../src/data/missions.ts');
  store.setState({ buildingUpgrades: { ...initial.buildingUpgrades, bakery: 1 } });
  assert.equal(getMissionProgress('upgrade', get()), 1);
  assert.equal(get().claimMission('upgrade'), true);
  store.setState(structuredClone(initial));
  store.setState({ ovens: get().ovens.map((oven, index) => ({ ...oven, upgradeLevel: index === 0 ? 1 : 0 })) });
  assert.equal(getMissionProgress('upgrade', get()), 1);
  assert.equal(get().claimMission('upgrade'), true);
});

test('full reset clears progress and pending rewards, keeps reset milestone, and persists defaults', async () => {
  store.setState({
    cookies: 9e9, totalCookies: 1e12, taps: 3000, totalDraws: 500, drawXp: 7, drawLevel: 26,
    chocoChips: 99, premiumChips: 55, dictionaries: 3, diaries: 2, rebirths: 4, resets: 2,
    buildings: { ...initial.buildings, bakery: 8 }, buildingUpgrades: { ...initial.buildingUpgrades, bakery: 3 },
    ovens: [{ ovenId: 'oven-16', level: 8, upgradeLevel: 4, fusion: 2, trait: '글리치', core: 'phoenix' }],
    equippedOvenId: 'oven-16', epirus: { aurora: 8, opternal: 7, twilight: 6, phoenix: 5, infinity: 4 },
    pendingOffline: 9999, offlineSeconds: 3600, incomeRemainder: .8, boostUntil: Date.now()+60000,
    boostMultiplier: 4, nextDrawBoost: 'diary', claimedMail: ['tutorial'], claimedMissions: ['tap'],
    tutorialStep: 5, tutorialComplete: true, achievements: ['tap','draw50','secret'],
    settings: { ...initial.settings, music: true, language: 'de' },
  });
  get().resetGame();
  await store.persist.rehydrate();
  for (const key of ['cookies','totalCookies','taps','totalDraws','drawXp','pendingOffline','offlineSeconds','incomeRemainder','boostUntil','rebirths','premiumChips','dictionaries','diaries']) assert.equal(get()[key], 0, key);
  assert.equal(get().resets, 3);
  assert.equal(get().drawLevel, 1);
  assert.equal(get().chocoChips, 10);
  assert.equal(get().boostMultiplier, 1);
  assert.equal(get().nextDrawBoost, 'none');
  assert.equal(get().tutorialComplete, false);
  assert.equal(get().tutorialStep, 0);
  assert.deepEqual(get().buildings, initial.buildings);
  assert.deepEqual(get().buildingUpgrades, initial.buildingUpgrades);
  assert.deepEqual(get().epirus, initial.epirus);
  assert.deepEqual(get().settings, initial.settings);
  assert.deepEqual(get().claimedMail, []);
  assert.deepEqual(get().claimedMissions, []);
  assert.equal(get().equippedOvenId, OVENS[0].id);
  assert.equal(get().ovens.length, OVENS.length);
  assert.ok(get().ovens.every(oven => oven.level===1 && oven.upgradeLevel===0 && oven.fusion===0 && oven.trait==='없음'));
  assert.ok(get().achievements.includes('reset'));
  assert.ok(!get().achievements.includes('tap'));
  assert.ok(!get().achievements.includes('draw50'));
  assert.ok(!get().achievements.includes('secret'));
});
