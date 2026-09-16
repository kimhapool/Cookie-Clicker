import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BUILDINGS } from "../data/buildings";
import { OVENS, type Oven, type Rarity } from "../data/ovens";

export type Trait = "없음" | "샤이니" | "반전" | "글리치";
export type Epirus =
  "aurora" | "opternal" | "twilight" | "phoenix" | "infinity";
export type OwnedOven = {
  ovenId: string;
  level: number;
  fusion: number;
  trait: Trait;
  core: Epirus;
};
type Settings = {
  sound: boolean;
  music: boolean;
  vibration: boolean;
  language: "ko" | "en" | "ja" | "zh" | "ar" | "de" | "ru";
  tapSound: "pop" | "drum" | "bite" | "crumble";
};
type DrawBoost = "none" | "dictionary" | "diary";
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
  rebirths: number;
  buildings: Record<string, number>;
  ovens: OwnedOven[];
  equippedOvenId: string;
  lastSavedAt: number;
  pendingOffline: number;
  offlineSeconds: number;
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
  exchangeCookies(amount: number): boolean;
  exchangeChips(mode: "premium" | "dictionary" | "diary"): boolean;
  prepareDrawBoost(boost: DrawBoost): boolean;
  rebirth(): boolean;
  draw(premium?: boolean): Oven | null;
  equipOven(id: string): boolean;
  fuseOven(id: string): boolean;
  dismantleOven(id: string): boolean;
  rollTrait(id: string): boolean;
  activateBoost(multiplier: 2 | 4): boolean;
  updateSettings(value: Partial<Settings>): void;
  claimMail(id: string): boolean;
  claimMission(id: string): boolean;
  advanceTutorial(): void;
  ensureAllOvens(): void;
  resetGame(): void;
  checkOffline(): void;
  claimOffline(): number;
  tick(seconds: number): void;
};

const emptyBuildings = () =>
  Object.fromEntries(BUILDINGS.map((b) => [b.id, 0]));
const cores: Epirus[] = [
  "aurora",
  "opternal",
  "twilight",
  "phoenix",
  "infinity",
];
const allOvens = (): OwnedOven[] =>
  OVENS.map((oven, index) => ({
    ovenId: oven.id,
    level: 1,
    fusion: 0,
    trait: "없음",
    core: cores[index % cores.length],
  }));
const defaultSettings: Settings = {
  sound: true,
  music: true,
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
  rebirths: 0,
  buildings: emptyBuildings(),
  ovens: allOvens(),
  equippedOvenId: OVENS[0].id,
  lastSavedAt: Date.now(),
  pendingOffline: 0,
  offlineSeconds: 0,
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
const equippedTrait = (state: Pick<Game, "ovens" | "equippedOvenId">) =>
  state.ovens.find((oven) => oven.ovenId === state.equippedOvenId)?.trait ??
  "없음";
const activeBoost = (state: Pick<Game, "boostUntil" | "boostMultiplier">) =>
  state.boostUntil > Date.now() ? state.boostMultiplier : 1;
export const getClickGain = (
  state: Pick<
    Game,
    "equippedOvenId" | "ovens" | "rebirths" | "boostUntil" | "boostMultiplier"
  >,
) =>
  Math.max(
    1,
    Math.floor(
      equipped(state).click *
        traitMultiplier(equippedTrait(state)) *
        Math.pow(1.5, state.rebirths) *
        activeBoost(state),
    ),
  );
export const getCps = (
  state: Pick<
    Game,
    | "buildings"
    | "equippedOvenId"
    | "ovens"
    | "rebirths"
    | "boostUntil"
    | "boostMultiplier"
  >,
) =>
  BUILDINGS.reduce(
    (sum, building) =>
      sum + (state.buildings[building.id] || 0) * building.baseCps,
    0,
  ) *
  equipped(state).cps *
  traitMultiplier(equippedTrait(state)) *
  Math.pow(1.5, state.rebirths) *
  activeBoost(state);
const buildingCost = (id: string, count: number) =>
  Math.floor(
    BUILDINGS.find((building) => building.id === id)!.baseCost *
      Math.pow(1.15, count),
  );
const rarityWeight: Record<Rarity, number> = {
  Common: 45,
  Uncommon: 25,
  Rare: 14,
  Epic: 8,
  Legendary: 4.4,
  Mythic: 2,
  Eternal: 1,
  Celestial: 0.55,
  Secret: 0.0329,
};
const premiumWeight: Record<Rarity, number> = {
  Common: 8,
  Uncommon: 13,
  Rare: 19,
  Epic: 20,
  Legendary: 17,
  Mythic: 12,
  Eternal: 7,
  Celestial: 3.5,
  Secret: 0.329,
};
const highRarity: Rarity[] = ["Mythic", "Eternal", "Celestial", "Secret"];
const randomOven = (premium: boolean, boost: DrawBoost) => {
  const weights = premium ? premiumWeight : rarityWeight;
  const multiplier = boost === "diary" ? 50 : boost === "dictionary" ? 15 : 1;
  const pool = OVENS.map((oven) => ({
    oven,
    weight:
      weights[oven.rarity] *
      (highRarity.includes(oven.rarity) ? multiplier : 1),
  }));
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  return pool.find((item) => (roll -= item.weight) <= 0)?.oven ?? OVENS[0];
};
const earnedEpirus = (oven: Oven): Partial<Record<Epirus, number>> => {
  if (oven.id === "oven-10") return { phoenix: 2 };
  if (oven.rarity === "Secret") return { infinity: 5 };
  if (oven.rarity === "Eternal") return { opternal: 2 };
  if (oven.name.includes("오로라")) return { aurora: 2 };
  return { ["aurora"]: 1 };
};

export const useGameStore = create<Game>()(
  persist(
    (set, get) => ({
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
        const count = state.buildings[id] || 0;
        const cost = buildingCost(id, count);
        if (state.cookies < cost) return false;
        set({
          cookies: state.cookies - cost,
          buildings: { ...state.buildings, [id]: count + 1 },
        });
        return true;
      },
      sellBuilding: (id) => {
        const state = get();
        const count = state.buildings[id] || 0;
        if (!count) return false;
        set({
          cookies:
            state.cookies + Math.floor(buildingCost(id, count - 1) * 0.8),
          buildings: { ...state.buildings, [id]: count - 1 },
        });
        return true;
      },
      exchangeCookies: (amount) => {
        const state = get();
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
      draw: (premium = false) => {
        const state = get();
        if (premium ? state.premiumChips < 1 : state.chocoChips < 1)
          return null;
        const oven = randomOven(premium, state.nextDrawBoost);
        const owned = state.ovens.find((item) => item.ovenId === oven.id)!;
        const draws = state.totalDraws + 1;
        set({
          [premium ? "premiumChips" : "chocoChips"]:
            (premium ? state.premiumChips : state.chocoChips) - 1,
          ovens: state.ovens.map((item) =>
            item.ovenId === oven.id ? { ...item, level: item.level + 1 } : item,
          ),
          totalDraws: draws,
          drawXp: state.drawXp + 1,
          drawLevel: 1 + Math.floor((state.drawXp + 1) / 20),
          nextDrawBoost: "none",
        } as Partial<Game>);
        return oven;
      },
      equipOven: (id) => {
        if (!get().ovens.find((oven) => oven.ovenId === id && oven.level > 0))
          return false;
        set({ equippedOvenId: id });
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
        if (!owned || owned.trait === "글리치") return false;
        const traits: Trait[] = ["없음", "샤이니", "반전", "글리치"];
        const next = traits[traits.indexOf(owned.trait) + 1];
        const cost = traits.indexOf(next);
        const core = owned.core;
        if (state.epirus[core] < cost) return false;
        set({
          epirus: { ...state.epirus, [core]: state.epirus[core] - cost },
          ovens: state.ovens.map((oven) =>
            oven.ovenId === id ? { ...oven, trait: next } : oven,
          ),
        });
        return true;
      },
      activateBoost: (multiplier) => {
        const state = get();
        const cost = multiplier === 2 ? 5000 : 25000;
        if (state.cookies < cost || activeBoost(state) > 1) return false;
        set({
          cookies: state.cookies - cost,
          boostMultiplier: multiplier,
          boostUntil: Date.now() + (multiplier === 2 ? 45000 : 20000),
        });
        return true;
      },
      updateSettings: (value) =>
        set((state) => ({ settings: { ...state.settings, ...value } })),
      claimMail: (id) => {
        const state = get();
        if (state.claimedMail.includes(id)) return false;
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
        if (state.claimedMissions.includes(id)) return false;
        const rewards: Record<string, { cookies?: number; chips?: number }> = {
          tap: { cookies: 500 },
          building: { chips: 2 },
          chip: { cookies: 2000 },
        };
        const reward = rewards[id];
        if (!reward) return false;
        set({
          cookies: state.cookies + (reward.cookies ?? 0),
          totalCookies: state.totalCookies + (reward.cookies ?? 0),
          chocoChips: state.chocoChips + (reward.chips ?? 0),
          claimedMissions: [...state.claimedMissions, id],
        });
        return true;
      },
      advanceTutorial: () => {
        const state = get();
        const next = state.tutorialStep + 1;
        set({ tutorialStep: next, tutorialComplete: next >= 5 });
      },
      ensureAllOvens: () => {
        const state = get();
        const map = new Map(state.ovens.map((oven) => [oven.ovenId, oven]));
        set({
          ovens: OVENS.map(
            (oven, index) =>
              map.get(oven.id) ?? {
                ovenId: oven.id,
                level: 1,
                fusion: 0,
                trait: "없음",
                core: cores[index % cores.length],
              },
          ),
        });
      },
      resetGame: () => set(baseState()),
      checkOffline: () => {
        const state = get();
        const seconds = Math.min(
          4 * 60 * 60,
          Math.max(0, Math.floor((Date.now() - state.lastSavedAt) / 1000)),
        );
        const reward = Math.floor(getCps(state) * seconds * 0.75);
        set({
          pendingOffline: reward,
          offlineSeconds: seconds,
          lastSavedAt: Date.now(),
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
        const gain = Math.floor(getCps(state) * seconds);
        if (gain)
          set({
            cookies: state.cookies + gain,
            totalCookies: state.totalCookies + gain,
            lastSavedAt: Date.now(),
          });
      },
    }),
    {
      name: "cookie-clicker-game-v2",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const {
          click,
          buyBuilding,
          sellBuilding,
          exchangeCookies,
          exchangeChips,
          prepareDrawBoost,
          rebirth,
          draw,
          equipOven,
          fuseOven,
          dismantleOven,
          rollTrait,
          activateBoost,
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
