import { BUILDINGS, buildingMultiplier } from '../data/buildings';

export type ProductionEvent = { sequence: number; gains: Record<string, number> };

export function productionWeights(counts: Record<string, number>, upgrades: Record<string, number> = {}) {
  return BUILDINGS.map(building => ({ id: building.id, weight: Math.max(0, counts[building.id] ?? 0) * building.baseCps * buildingMultiplier(upgrades[building.id] ?? 0) }));
}

// Visual receipts add up to the actual credited integer gain, including the
// fractional-CPS remainder. All current oven/trait/boost multipliers are global.
export function allocateProduction(gain: number, counts: Record<string, number>, upgrades: Record<string, number> = {}): Record<string, number> {
  if (!Number.isFinite(gain) || gain <= 0) return {};
  const totalGain = Math.floor(gain);
  const weights = productionWeights(counts, upgrades).filter(item => item.weight > 0);
  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return {};
  const shares = weights.map(item => {
    const exact = totalGain * (item.weight / totalWeight);
    return { id: item.id, amount: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let remaining = totalGain - shares.reduce((sum, item) => sum + item.amount, 0);
  [...shares].sort((a, b) => b.remainder - a.remainder).forEach(item => {
    if (remaining > 0) { item.amount++; remaining--; }
  });
  return Object.fromEntries(shares.map(item => [item.id, item.amount]));
}

export function buildingProduction(id: string, totalCps: number, counts: Record<string, number>, upgrades: Record<string, number> = {}) {
  const weights = productionWeights(counts, upgrades);
  const total = weights.reduce((sum, item) => sum + item.weight, 0);
  return total ? totalCps * (weights.find(item => item.id === id)?.weight ?? 0) / total : 0;
}
