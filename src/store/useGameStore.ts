import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BUILDINGS, buildingMultiplier, buildingUpgradeCost } from "../data/buildings";
import { OVENS, type Oven } from "../data/ovens";
import { getDrawPool, type DrawBoost } from "../data/drawOdds";
import { UPGRADES } from "../data/upgrades";
import { MISSIONS, getMissionProgress, type MissionId } from "../data/missions";
import { earnedAchievements } from "../data/achievements";
import { traitUpgrade } from "../utils/traits";

export type Trait = "없음" | "샤이니" | "반전" | "글리치";
export type Epirus =
  "aurora" | "opternal" | "twilight" | "phoenix" | "infinity";
export type OwnedOven = {
  ovenId: string;
  // Legacy save field: level stores the number of copies, not enhancement level.
  level: number;
  upgradeLevel?: number;
  fusion: number;
  trait: Trait;
  core: Epirus;
};
type Settings = {
  sound: boolean;
  music: boolean;
  musicStyle: "calm" | "exciting";
  vibration: boolean;
  language: "ko" | "en" | "ja" | "zh" | "ar" | "de" | "ru";
  tapSound: "pop" | "drum" | "bite" | "crumble";
};
type Game = {
  cookies: number;
  totalCookies: number;
  taps: number;
  totalDraws: number;
  drawXp: number;
  drawLevel: number;
  chocoChips: number;
  premiumChips: number;
  dictionaries: number;
  diaries: number;
  epirus: Record<Epirus, number>;
  settings: Settings;
  upgrades: Record<"click" | "cps" | "global", number>;
  rebirths: number;
  resets: number;
  buildings: Record<string, number>;
  buildingUpgrades: Record<string, number>;
  ovens: OwnedOven[];
  equippedOvenId: string;
  lastSavedAt: number;
  pendingOffline: number;
  offlineSeconds: number;
  incomeRemainder: number;
  boostUntil: number;
  boostMultiplier: number;
  nextDrawBoost: DrawBoost;
  claimedMail: string[];
  claimedMissions: string[];
  tutorialStep: number;
  tutorialComplete: boolean;
  achievements: string[];
  click(): number;
  buyBuilding(id: string): boolean;
  sellBuilding(id: string): boolean;
  upgradeBuilding(id: string): boolean;
  exchangeCookies(amount: number): boolean;
  exchangeChips(mode: "premium" | "dictionary" | "diary"): boolean;
  prepareDrawBoost(boost: DrawBoost): boolean;
  rebirth(): boolean;
  draw(premium?: boolean): Oven | null;
  drawMany(premium: boolean, count: number): Oven[];
  equipOven(id: string): boolean;
  upgradeOven(id: string): boolean;
  fuseOven(id: string): boolean;
  dismantleOven(id: string): boolean;
  rollTrait(id: string): boolean;
  activateBoost(multiplier: 2 | 4): boolean;
  buyUpgrade(id: "click" | "cps" | "global"): boolean;
  updateSettings(value: Partial<Settings>): void;
  claimMail(id: string): boolean;
  claimMission(id: MissionId): boolean;
  advanceTutorial(): void;
  ensureAllOvens(): void;
  resetGame(): void;
  checkOffline(): void;
  claimOffline(): number;
  tick(seconds: number): number;
};

const emptyBuildings = () =>
  Object.fromEntries(BUILDINGS.map((b) => [b.id, 0]));
const cores: Epirus[] = [
  "aurora",
  "opternal",
  "twilight",
  "phoenix",
];
const allOvens = (): OwnedOven[] =>
  OVENS.map((oven) => ({
    ovenId: oven.id,
    level: 1,
    upgradeLevel: 0,
    fusion: 0,
    trait: "없음",
    core: cores[Math.floor(Math.random() * cores.length)],
  }));
const defaultSettings: Settings = {
  sound: true,
  music: false,
  musicStyle: "calm",
  vibration: true,
  language: "ko",
  tapSound: "bite",
};
const baseState = () => ({
  cookies: 0,
  totalCookies: 0,
  taps: 0,
  totalDraws: 0,
  drawXp: 0,
  drawLevel: 1,
  chocoChips: 10,
  premiumChips: 0,
  dictionaries: 0,
  diaries: 0,
  epirus: { aurora: 0, opternal: 0, twilight: 0, phoenix: 0, infinity: 0 },
  settings: defaultSettings,
  upgrades: { click: 0, cps: 0, global: 0 },
  rebirths: 0,
  resets: 0,
  buildings: emptyBuildings(),
  buildingUpgrades: emptyBuildings(),
  ovens: allOvens(),
  equippedOvenId: OVENS[0].id,
  lastSavedAt: Date.now(),
  pendingOffline: 0,
  offlineSeconds: 0,
  incomeRemainder: 0,
  boostUntil: 0,
  boostMultiplier: 1,
  nextDrawBoost: "none" as DrawBoost,
  claimedMail: [],
  claimedMissions: [],
  tutorialStep: 0,
  tutorialComplete: false,
  achievements: [],
});
const equipped = (state: Pick<Game, "equippedOvenId">) =>
  OVENS.find((oven) => oven.id === state.equippedOvenId) ?? OVENS[0];
const traitMultiplier = (trait: Trait) =>
  trait === "샤이니"
    ? 1.15
    : trait === "반전"
      ? 1.35
      : trait === "글리치"
        ? 1.7
        : 1;
export const getOvenMultipliers = (owned: OwnedOven) => {
  const oven = OVENS.find(item => item.id === owned.ovenId) ?? OVENS[0];
  const multiplier = traitMultiplier(owned.trait) * 1.25 ** owned.fusion * 1.1 ** (owned.upgradeLevel ?? 0);
  return { click: oven.click * multiplier, cps: oven.cps * multiplier };
};
const equippedTrait = (state: Pick<Game, "ovens" | "equippedOvenId">) =>
  state.ovens.find((oven) => oven.ovenId === state.equippedOvenId)?.trait ??
  "없음";
const equippedFusion = (state: Pick<Game, "ovens" | "equippedOvenId">) =>
  state.ovens.find((oven) => oven.ovenId === state.equippedOvenId)?.fusion ?? 0;
const equippedUpgrade = (state: Pick<Game, "ovens" | "equippedOvenId">) =>
  state.ovens.find((oven) => oven.ovenId === state.equippedOvenId)?.upgradeLevel ?? 0;
export const getOvenUpgradeCost = (owned: OwnedOven) => {
  const oven = OVENS.find(item => item.id === owned.ovenId);
  if (!oven) return Infinity;
  const rank = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic", "Eternal", "Celestial", "Secret"].indexOf(oven.rarity);
  return Math.floor(1000 * (rank + 1) ** 2 * 1.65 ** (owned.upgradeLevel ?? 0));
};
const activeBoost = (state: Pick<Game, "boostUntil" | "boostMultiplier">) =>
  state.boostUntil > Date.now() ? state.boostMultiplier : 1;
export const getClickGain = (
  state: Pick<
    Game,
    | "equippedOvenId"
    | "ovens"
    | "rebirths"
    | "boostUntil"
    | "boostMultiplier"
    | "upgrades"
  >,
) =>
  Math.max(
    1,
    Math.floor(
      equipped(state).click *
        traitMultiplier(equippedTrait(state)) *
        Math.pow(1.25, equippedFusion(state)) *
        Math.pow(1.1, equippedUpgrade(state)) *
        Math.pow(1.5, state.rebirths) *
        activeBoost(state) *
        Math.pow(1.2, state.upgrades.click) *
        Math.pow(1.1, state.upgrades.global),
    ),
  );
export const getCps = (
  state: Pick<
    Game,
    | "buildings"
    | "buildingUpgrades"
    | "equippedOvenId"
    | "ovens"
    | "rebirths"
    | "boostUntil"
    | "boostMultiplier"
    | "upgrades"
  >,
) =>
  BUILDINGS.reduce(
    (sum, building) =>
      sum + (state.buildings[building.id] || 0) * building.baseCps * buildingMultiplier(state.buildingUpgrades[building.id] ?? 0),
    0,
  ) *
  equipped(state).cps *
  traitMultiplier(equippedTrait(state)) *
  Math.pow(1.25, equippedFusion(state)) *
  Math.pow(1.1, equippedUpgrade(state)) *
  Math.pow(1.5, state.rebirths) *
  activeBoost(state) *
  Math.pow(1.25, state.upgrades.cps) *
  Math.pow(1.1, state.upgrades.global);

// Integrate the timed multiplier only over the part of the interval it covered.
export const productionBetween = (
  state: Parameters<typeof getCps>[0], from: number, to: number,
) => {
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return 0;
  const seconds = (to - from) / 1000;
  const boosted = Math.max(0, Math.min(to, state.boostUntil) - from) / 1000;
  const normalCps = getCps({ ...state, boostUntil: 0 });
  return normalCps * (seconds + boosted * (state.boostMultiplier - 1));
};

export const isTutorialReady = (
  state: Pick<Game, "tutorialStep" | "tutorialComplete" | "taps" | "buildings" | "totalDraws">,
) => !state.tutorialComplete && (
  state.tutorialStep === 0 ? state.taps >= 1 :
  state.tutorialStep === 1 ? Object.values(state.buildings).reduce((a, b) => a + b, 0) >= 15 :
  state.tutorialStep === 2 ? state.totalDraws >= 1 :
  state.tutorialStep === 3 || state.tutorialStep === 4
);
const buildingCost = (id: string, count: number) =>
  Math.floor(
    BUILDINGS.find((building) => building.id === id)!.baseCost *
      Math.pow(1.15, count),
  );
const earnedEpirus = (oven: Oven): Partial<Record<Epirus, number>> => {
  if (oven.id === "oven-10") return { phoenix: 2 };
  if (oven.rarity === "Secret") return { infinity: 5 };
  if (oven.rarity === "Eternal") return { opternal: 2 };
  if (oven.name.includes("오로라")) return { aurora: 2 };
  return { ["aurora"]: 1 };
};

let hydrationError: unknown;
let loadPromise: Promise<void> | undefined;

export async function loadGame(): Promise<void> {
  if (useGameStore.persist.hasHydrated()) return;
  if (!loadPromise) {
    loadPromise = (async () => {
      hydrationError = undefined;
      await useGameStore.persist.rehydrate();
      if (hydrationError) throw hydrationError;
    })();
  }
  try { await loadPromise; }
  finally { loadPromise = undefined; }
}

export const useGameStore = create<Game>()(
  persist(
    (write, get) => {
      const set = (patch: Partial<Game> | ((state: Game) => Partial<Game>)) => {
        // This also protects unread saves when Fast Refresh replaces the store module.
        if (!useGameStore.persist.hasHydrated()) return;
        write((state) => {
          const next = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
          return { ...next, achievements: earnedAchievements(next) };
        });
      };
      return ({
      ...baseState(),
      click: () => {
        const state = get();
        const gain = getClickGain(state);
        set({
          cookies: state.cookies + gain,
          totalCookies: state.totalCookies + gain,
          taps: state.taps + 1,
          lastSavedAt: Date.now(),
        });
        return gain;
      },
      buyBuilding: (id) => {
        const state = get();
        if (!BUILDINGS.some((building) => building.id === id)) return false;
        const count = state.buildings[id] || 0;
        const cost = buildingCost(id, count);
        if (!Number.isFinite(cost) || state.cookies < cost) return false;
        set({
          cookies: state.cookies - cost,
          buildings: { ...state.buildings, [id]: count + 1 },
        });
        return true;
      },
      sellBuilding: (id) => {
        const state = get();
        if (!BUILDINGS.some((building) => building.id === id)) return false;
        const count = state.buildings[id] || 0;
        if (!count) return false;
        set({
          cookies:
            state.cookies + Math.floor(buildingCost(id, count - 1) * 0.8),
          buildings: { ...state.buildings, [id]: count - 1 },
        });
        return true;
      },
      upgradeBuilding: (id) => {
        const state = get();
        if (!BUILDINGS.some(building => building.id === id) || !(state.buildings[id] > 0)) return false;
        const level = state.buildingUpgrades[id] ?? 0;
        const cost = buildingUpgradeCost(id, level);
        if (!Number.isFinite(cost) || state.cookies < cost) return false;
        set({ cookies: state.cookies - cost, buildingUpgrades: { ...state.buildingUpgrades, [id]: level + 1 } });
        return true;
      },
      exchangeCookies: (amount) => {
        const state = get();
        if (!Number.isFinite(amount) || amount <= 0) return false;
        const chips = Math.floor(Math.min(state.cookies, amount) / 100000);
        if (!chips) return false;
        set({
          cookies: state.cookies - chips * 100000,
          chocoChips: state.chocoChips + chips,
        });
        return true;
      },
      exchangeChips: (mode) => {
        const state = get();
        if (!["premium", "dictionary", "diary"].includes(mode)) return false;
        const cost =
          mode === "premium" ? 10000 : mode === "dictionary" ? 1000000 : 3;
        if (mode === "diary") {
          if (state.dictionaries < cost) return false;
          set({
            dictionaries: state.dictionaries - cost,
            diaries: state.diaries + 1,
          });
          return true;
        }
        if (state.chocoChips < cost) return false;
        set(
          mode === "premium"
            ? {
                chocoChips: state.chocoChips - cost,
                premiumChips: state.premiumChips + 1,
              }
            : {
                chocoChips: state.chocoChips - cost,
                dictionaries: state.dictionaries + 1,
              },
        );
        return true;
      },
      prepareDrawBoost: (boost) => {
        const state = get();
        if (boost === "none" || state.nextDrawBoost !== "none") return false;
        if (boost === "dictionary" && state.dictionaries) {
          set({ dictionaries: state.dictionaries - 1, nextDrawBoost: boost });
          return true;
        }
        if (boost === "diary" && state.diaries) {
          set({ diaries: state.diaries - 1, nextDrawBoost: boost });
          return true;
        }
        return false;
      },
      rebirth: () => {
        const state = get();
        const need = 100000 * Math.pow(5, state.rebirths);
        if (state.cookies < need) return false;
        set({
          cookies: 0,
          rebirths: state.rebirths + 1,
          epirus: { ...state.epirus, twilight: state.epirus.twilight + 2 },
          achievements: state.achievements.includes("rebirth")
            ? state.achievements
            : [...state.achievements, "rebirth"],
        });
        return true;
      },
      draw: (premium = false) => get().drawMany(premium, 1)[0] ?? null,
      drawMany: (premium, requested) => {
        const state = get();
        if (!useGameStore.persist.hasHydrated() || !Number.isSafeInteger(requested) || requested <= 0) return [];
        const available = premium ? state.premiumChips : state.chocoChips;
        const count = Math.min(requested, Math.floor(available));
        if (count <= 0) return [];
        const drawn: Oven[] = [];
        const copies: Record<string, number> = {};
        let pool: ReturnType<typeof getDrawPool> = [];
        let poolKey = '';
        for (let index = 0; index < count; index++) {
          const level = index === 0 ? state.drawLevel : 1 + Math.floor((state.drawXp + index) / 20);
          const boost = index === 0 ? state.nextDrawBoost : 'none';
          const key = `${level}:${boost}`;
          if (key !== poolKey) { pool = getDrawPool(premium, boost, level); poolKey = key; }
          let roll = Math.random();
          const oven = pool.find(item => (roll -= item.chance) <= 0)?.oven ?? OVENS[OVENS.length - 1];
          drawn.push(oven);
          copies[oven.id] = (copies[oven.id] ?? 0) + 1;
        }
        set({
          [premium ? "premiumChips" : "chocoChips"]: available - count,
          ovens: state.ovens.map((item) =>
            copies[item.ovenId] ? { ...item, level: item.level + copies[item.ovenId] } : item,
          ),
          totalDraws: state.totalDraws + count,
          achievements: earnedAchievements(state),
          drawXp: state.drawXp + count,
          drawLevel: 1 + Math.floor((state.drawXp + count) / 20),
          nextDrawBoost: "none",
        } as Partial<Game>);
        return drawn;
      },
      equipOven: (id) => {
        if (!get().ovens.find((oven) => oven.ovenId === id && oven.level > 0))
          return false;
        set({ equippedOvenId: id });
        return true;
      },
      upgradeOven: (id) => {
        const state = get();
        const owned = state.ovens.find(oven => oven.ovenId === id && oven.level > 0);
        if (!owned) return false;
        const cost = getOvenUpgradeCost(owned);
        if (!Number.isFinite(cost) || state.cookies < cost) return false;
        set({
          cookies: state.cookies - cost,
          ovens: state.ovens.map(oven => oven.ovenId === id
            ? { ...oven, upgradeLevel: (oven.upgradeLevel ?? 0) + 1 } : oven),
        });
        return true;
      },
      fuseOven: (id) => {
        const state = get();
        const owned = state.ovens.find((oven) => oven.ovenId === id);
        if (!owned) return false;
        const needed = owned.fusion + 2;
        if (owned.level - 1 < needed) return false;
        set({
          ovens: state.ovens.map((oven) =>
            oven.ovenId === id
              ? { ...oven, level: oven.level - needed, fusion: oven.fusion + 1 }
              : oven,
          ),
        });
        return true;
      },
      dismantleOven: (id) => {
        const state = get();
        const owned = state.ovens.find((oven) => oven.ovenId === id);
        const oven = OVENS.find((item) => item.id === id);
        if (!owned || !oven || owned.level < 2) return false;
        const gain = earnedEpirus(oven);
        set({
          ovens: state.ovens.map((item) =>
            item.ovenId === id ? { ...item, level: item.level - 1 } : item,
          ),
          epirus: {
            ...state.epirus,
            aurora: state.epirus.aurora + (gain.aurora ?? 0),
            opternal: state.epirus.opternal + (gain.opternal ?? 0),
            twilight: state.epirus.twilight + (gain.twilight ?? 0),
            phoenix: state.epirus.phoenix + (gain.phoenix ?? 0),
            infinity: state.epirus.infinity + (gain.infinity ?? 0),
          },
        });
        return true;
      },
      rollTrait: (id) => {
        const state = get();
        const owned = state.ovens.find((oven) => oven.ovenId === id);
        if (!owned) return false;
        const { next, matching, universal, canRoll } = traitUpgrade(owned, state.epirus);
        if (!canRoll) return false;
        const core = owned.core;
        set({
          epirus: { ...state.epirus,
            [core]: state.epirus[core] - matching,
            ...(core !== "infinity" ? { infinity: state.epirus.infinity - universal } : {}),
          },
          ovens: state.ovens.map((oven) =>
            oven.ovenId === id ? { ...oven, trait: next } : oven,
          ),
        });
        return true;
      },
      activateBoost: (multiplier) => {
        const state = get();
        if (multiplier !== 2 && multiplier !== 4) return false;
        const cost = multiplier === 2 ? 5000 : 25000;
        if (state.cookies < cost || activeBoost(state) > 1) return false;
        set({
          cookies: state.cookies - cost,
          boostMultiplier: multiplier,
          boostUntil: Date.now() + (multiplier === 2 ? 45000 : 20000),
        });
        return true;
      },
      buyUpgrade: (id) => {
        const state = get();
        const upgrade = UPGRADES.find((item) => item.id === id);
        if (!upgrade) return false;
        const level = state.upgrades[id];
        const cost = Math.floor(
          upgrade.baseCost * Math.pow(upgrade.growth, level),
        );
        if (!Number.isFinite(cost) || state.cookies < cost) return false;
        set({
          cookies: state.cookies - cost,
          upgrades: { ...state.upgrades, [id]: level + 1 },
        });
        return true;
      },
      updateSettings: (value) =>
        set((state) => ({ settings: { ...state.settings, ...value } })),
      claimMail: (id) => {
        const state = get();
        if (!["tutorial", "welcome", "chips", "moon"].includes(id)) return false;
        if (state.claimedMail.includes(id)) return false;
        if (id === "tutorial" && !state.tutorialComplete) return false;
        const reward =
          id === "tutorial"
            ? 0
            : id === "welcome"
              ? 500
              : id === "chips"
                ? 3000
                : 2500;
        const chips = id === "tutorial" ? 10 : 0;
        set({
          cookies: state.cookies + reward,
          totalCookies: state.totalCookies + reward,
          chocoChips: state.chocoChips + chips,
          claimedMail: [...state.claimedMail, id],
        });
        return true;
      },
      claimMission: (id) => {
        const state = get();
        const mission = MISSIONS.find((item) => item.id === id);
        if (!mission || getMissionProgress(id, state) < mission.target) return false;
        if (state.claimedMissions.includes(id)) return false;
        const rewards: Record<
          MissionId,
          { cookies?: number; chips?: number; premium?: number; dictionary?: number }
        > = {
          tap: { cookies: 500 },
          stockpile: { chips: 2 },
          building: { chips: 3 },
          chip: { cookies: 2000 },
          draw: { chips: 3 },
          upgrade: { cookies: 4000 },
          rebirth: { premium: 1 },
          lifetime: { dictionary: 1 },
        };
        const reward = rewards[id];
        if (!reward) return false;
        set({
          cookies: state.cookies + (reward.cookies ?? 0),
          totalCookies: state.totalCookies + (reward.cookies ?? 0),
          chocoChips: state.chocoChips + (reward.chips ?? 0),
          premiumChips: state.premiumChips + (reward.premium ?? 0),
          dictionaries: state.dictionaries + (reward.dictionary ?? 0),
          claimedMissions: [...state.claimedMissions, id],
        });
        return true;
      },
      advanceTutorial: () => {
        const state = get();
        if (!isTutorialReady(state)) return;
        const next = state.tutorialStep + 1;
        set({ tutorialStep: next, tutorialComplete: next >= 5 });
      },
      ensureAllOvens: () => {
        const state = get();
        const map = new Map(state.ovens.map((oven) => [oven.ovenId, oven]));
        set({
          ovens: OVENS.map(
            (oven) =>
              map.get(oven.id) ?? {
                ovenId: oven.id,
                level: 1,
                upgradeLevel: 0,
                fusion: 0,
                trait: "없음",
                core: cores[Math.floor(Math.random() * cores.length)],
              },
          ),
        });
      },
      resetGame: () => {
        const resets = get().resets + 1;
        set({ ...baseState(), resets, achievements: ["reset"] });
      },
      checkOffline: () => {
        const state = get();
        const now = Date.now();
        const seconds = Math.min(
          4 * 60 * 60,
          Math.max(0, Math.floor((now - state.lastSavedAt) / 1000)),
        );
        const reward = Math.floor(productionBetween(
          state, state.lastSavedAt, state.lastSavedAt + seconds * 1000,
        ) * 0.75);
        set({
          pendingOffline: state.pendingOffline + reward,
          offlineSeconds: state.offlineSeconds + (reward > 0 ? seconds : 0),
          lastSavedAt: now,
        });
      },
      claimOffline: () => {
        const state = get();
        if (!state.pendingOffline) return 0;
        set({
          cookies: state.cookies + state.pendingOffline,
          totalCookies: state.totalCookies + state.pendingOffline,
          pendingOffline: 0,
          offlineSeconds: 0,
          lastSavedAt: Date.now(),
        });
        return state.pendingOffline;
      },
      tick: (seconds) => {
        const state = get();
        if (!Number.isFinite(seconds) || seconds <= 0) return 0;
        const now = Date.now();
        const produced = productionBetween(state, now - seconds * 1000, now)
          + state.incomeRemainder;
        const gain = Math.floor(produced + 1e-9);
        set({
          cookies: state.cookies + gain,
          totalCookies: state.totalCookies + gain,
          incomeRemainder: Math.max(0, produced - gain),
          lastSavedAt: now,
        });
        return gain;
      },
      });
    },
    {
      name: "cookie-clicker-game-v2",
      storage: createJSONStorage(() => AsyncStorage),
      // The app must restore the save before mounting any gameplay effects.
      skipHydration: true,
      onRehydrateStorage: () => (_state, error) => { hydrationError = error; },
      merge: (persisted, current) => {
        const data = persisted as Partial<Game> | undefined;
        const restored = { ...current, ...data };
        restored.settings = { ...current.settings, ...data?.settings };
        restored.upgrades = { ...current.upgrades, ...data?.upgrades };
        restored.epirus = { ...current.epirus, ...data?.epirus };
        restored.buildings = { ...current.buildings, ...data?.buildings };
        restored.buildingUpgrades = { ...current.buildingUpgrades, ...data?.buildingUpgrades };
        return { ...restored, achievements: earnedAchievements(restored) };
      },
      partialize: (state) => {
        const {
          click,
          buyBuilding,
          sellBuilding,
          upgradeBuilding,
          exchangeCookies,
          exchangeChips,
          prepareDrawBoost,
          rebirth,
          draw,
          drawMany,
          equipOven,
          upgradeOven,
          fuseOven,
          dismantleOven,
          rollTrait,
          activateBoost,
          buyUpgrade,
          updateSettings,
          claimMail,
          claimMission,
          advanceTutorial,
          ensureAllOvens,
          resetGame,
          checkOffline,
          claimOffline,
          tick,
          ...data
        } = state;
        return data;
      },
    },
  ),
);
