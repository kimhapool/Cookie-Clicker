import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BUILDINGS } from "../data/buildings";
import { OVENS, type Oven } from "../data/ovens";

type OwnedOven = {
  ovenId: string;
  level: number;
  fusion: number;
  trait: "없음" | "샤이니" | "반전" | "글리치";
};
type Settings = {
  sound: boolean;
  music: boolean;
  vibration: boolean;
  language: "ko" | "en";
};
type Game = {
  cookies: number;
  totalCookies: number;
  taps: number;
  chocoChips: number;
  premiumChips: number;
  dictionaries: number;
  diaries: number;
  claimedMail: string[];
  settings: Settings;
  rebirths: number;
  buildings: Record<string, number>;
  ovens: OwnedOven[];
  equippedOvenId: string;
  lastSavedAt: number;
  pendingOffline: number;
  boostUntil: number;
  click(): number;
  buyBuilding(id: string): boolean;
  sellBuilding(id: string): boolean;
  exchangeCookies(amount: number): boolean;
  rebirth(): boolean;
  draw(premium?: boolean): Oven | null;
  equipOven(id: string): boolean;
  updateSettings(value: Partial<Settings>): void;
  claimMail(id: string): boolean;
  activateBoost(): boolean;
  checkOffline(): void;
  claimOffline(): number;
  tick(seconds: number): void;
};
const initialBuildings = Object.fromEntries(BUILDINGS.map((b) => [b.id, 0]));
const initialOvens: OwnedOven[] = OVENS.map((oven, i) => ({
  ovenId: oven.id,
  level: i === 0 ? 1 : 0,
  fusion: 0,
  trait: "없음",
}));
const equipped = (state: Pick<Game, "equippedOvenId" | "ovens">) =>
  OVENS.find((o) => o.id === state.equippedOvenId) ?? OVENS[0];
const cps = (
  state: Pick<
    Game,
    "buildings" | "equippedOvenId" | "ovens" | "rebirths" | "boostUntil"
  >,
) =>
  BUILDINGS.reduce((n, b) => n + (state.buildings[b.id] || 0) * b.baseCps, 0) *
  equipped(state).cps *
  Math.pow(1.5, state.rebirths) *
  (state.boostUntil > Date.now() ? 2 : 1);
const buildingCost = (id: string, count: number) => {
  const b = BUILDINGS.find((x) => x.id === id)!;
  return Math.floor(b.baseCost * Math.pow(1.15, count));
};
export const useGameStore = create<Game>()(
  persist(
    (set, get) => ({
      cookies: 0,
      totalCookies: 0,
      taps: 0,
      chocoChips: 10,
      premiumChips: 0,
      dictionaries: 0,
      diaries: 0,
      claimedMail: [],
      settings: { sound: true, music: true, vibration: true, language: "ko" },
      rebirths: 0,
      buildings: initialBuildings,
      ovens: initialOvens,
      equippedOvenId: OVENS[0].id,
      lastSavedAt: Date.now(),
      pendingOffline: 0,
      boostUntil: 0,
      click: () => {
        const s = get();
        const gain = Math.max(
          1,
          Math.floor(
            equipped(s).click *
              Math.pow(1.5, s.rebirths) *
              (s.boostUntil > Date.now() ? 2 : 1),
          ),
        );
        set({
          cookies: s.cookies + gain,
          totalCookies: s.totalCookies + gain,
          taps: s.taps + 1,
          lastSavedAt: Date.now(),
        });
        return gain;
      },
      buyBuilding: (id) => {
        const s = get(),
          count = s.buildings[id] || 0,
          cost = buildingCost(id, count);
        if (s.cookies < cost) return false;
        set({
          cookies: s.cookies - cost,
          buildings: { ...s.buildings, [id]: count + 1 },
        });
        return true;
      },
      sellBuilding: (id) => {
        const s = get(),
          count = s.buildings[id] || 0;
        if (!count) return false;
        const refund = Math.floor(buildingCost(id, count - 1) * 0.8);
        set({
          cookies: s.cookies + refund,
          buildings: { ...s.buildings, [id]: count - 1 },
        });
        return true;
      },
      exchangeCookies: (amount) => {
        const s = get(),
          use = Math.min(s.cookies, amount);
        const chips = Math.floor(use / 100000);
        if (!chips) return false;
        set({
          cookies: s.cookies - chips * 100000,
          chocoChips: s.chocoChips + chips,
        });
        return true;
      },
      rebirth: () => {
        const s = get(),
          need = 100000 * Math.pow(5, s.rebirths);
        if (s.cookies < need) return false;
        set({ cookies: 0, rebirths: s.rebirths + 1 });
        return true;
      },
      draw: (premium = false) => {
        const s = get();
        if (premium ? s.premiumChips < 1 : s.chocoChips < 1) return null;
        const roll = Math.random();
        const oven =
          roll < 0.000329
            ? OVENS.at(-1)!
            : OVENS[Math.floor(Math.random() * (OVENS.length - 1))];
        const found = s.ovens.find((x) => x.ovenId === oven.id)!;
        set({
          [premium ? "premiumChips" : "chocoChips"]:
            (premium ? s.premiumChips : s.chocoChips) - 1,
          ovens: s.ovens.map((x) =>
            x === found ? { ...x, level: x.level + 1 } : x,
          ),
        } as Partial<Game>);
        return oven;
      },
      equipOven: (id) => {
        const owned = get().ovens.find((x) => x.ovenId === id);
        if (!owned || owned.level < 1) return false;
        set({ equippedOvenId: id });
        return true;
      },
      updateSettings: (value) =>
        set((s) => ({ settings: { ...s.settings, ...value } })),
      claimMail: (id) => {
        const s = get();
        if (s.claimedMail.includes(id)) return false;
        const reward = id === "welcome" ? 500 : id === "chips" ? 3 : 2500;
        set({
          cookies: s.cookies + reward,
          totalCookies: s.totalCookies + reward,
          claimedMail: [...s.claimedMail, id],
        });
        return true;
      },
      activateBoost: () => {
        const s = get();
        if (s.chocoChips < 3) return false;
        set({
          chocoChips: s.chocoChips - 3,
          boostUntil: Date.now() + 5 * 60 * 1000,
        });
        return true;
      },
      checkOffline: () => {
        const s = get();
        const seconds = Math.min(
          8 * 60 * 60,
          Math.max(0, Math.floor((Date.now() - s.lastSavedAt) / 1000)),
        );
        const reward = Math.floor(cps(s) * seconds);
        set({ pendingOffline: reward, lastSavedAt: Date.now() });
      },
      claimOffline: () => {
        const s = get();
        if (!s.pendingOffline) return 0;
        set({
          cookies: s.cookies + s.pendingOffline,
          totalCookies: s.totalCookies + s.pendingOffline,
          pendingOffline: 0,
          lastSavedAt: Date.now(),
        });
        return s.pendingOffline;
      },
      tick: (seconds) => {
        const s = get(),
          gain = Math.floor(cps(s) * seconds);
        if (gain)
          set({
            cookies: s.cookies + gain,
            totalCookies: s.totalCookies + gain,
            lastSavedAt: Date.now(),
          });
      },
    }),
    {
      name: "cookie-clicker-game-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        ...s,
        click: undefined,
        buyBuilding: undefined,
        sellBuilding: undefined,
        exchangeCookies: undefined,
        rebirth: undefined,
        draw: undefined,
        equipOven: undefined,
        updateSettings: undefined,
        claimMail: undefined,
        activateBoost: undefined,
        checkOffline: undefined,
        claimOffline: undefined,
        tick: undefined,
      }),
    },
  ),
);
export const getCps = cps;
