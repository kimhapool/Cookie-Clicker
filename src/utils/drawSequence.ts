import type { Oven } from '../data/ovens';

export type DrawStep = { kind: 'flight' | 'secret'; oven: Oven; drawIndex: number };

export function buildDrawSequence(ovens: Oven[]): DrawStep[] {
  return ovens.flatMap((oven, drawIndex) => {
    const flight: DrawStep = { kind: 'flight', oven, drawIndex };
    return oven.rarity === 'Secret' ? [flight, { ...flight, kind: 'secret' as const }] : [flight];
  });
}

// Each row covers the complete source image width; together these 57 tiles
// cover the entire image once, with no missing strips or duplicated regions.
export const COOKIE_TILES = [5, 8, 10, 11, 10, 8, 5].flatMap((columns, row) =>
  Array.from({ length: columns }, (_, column) => ({
    x: column / columns, y: row / 7, width: 1 / columns, height: 1 / 7,
  })),
);

export const FLIGHT_DURATION = 1100;
export const SECRET_DURATION = 6400;
