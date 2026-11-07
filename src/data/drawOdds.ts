import { OVENS, type Rarity } from './ovens';

export type DrawBoost = 'none' | 'dictionary' | 'diary';
const BASIC: Record<Rarity, number> = {
  Common: 45, Uncommon: 25, Rare: 14, Epic: 8, Legendary: 4.4,
  // Non-Secret ovens have 199.9 total weight. Solve w / (199.9 + w) = .000329.
  Mythic: 2, Eternal: 1, Celestial: 0.55, Secret: 199.9 * 0.000329 / (1 - 0.000329),
};
const PREMIUM: Record<Rarity, number> = {
  Common: 8, Uncommon: 13, Rare: 19, Epic: 20, Legendary: 17,
  Mythic: 12, Eternal: 7, Celestial: 3.5, Secret: 0.329,
};
const HIGH = new Set<Rarity>(['Mythic', 'Eternal', 'Celestial', 'Secret']);

// The draw and its displayed probability must use exactly the same distribution.
export function getDrawPool(premium: boolean, boost: DrawBoost, level: number) {
  const table = premium ? PREMIUM : BASIC;
  const bonus = (boost === 'diary' ? 50 : boost === 'dictionary' ? 15 : 1)
    * (premium ? 1 : 1 + Math.max(0, level - 1) * 0.035);
  const pool = OVENS.map(oven => ({ oven, weight: table[oven.rarity] * (HIGH.has(oven.rarity) ? bonus : 1) }));
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  return pool.map(item => ({ ...item, chance: item.weight / total }));
}
