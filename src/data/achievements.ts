type AchievementProgress = {
  taps: number;
  buildings: Record<string, number>;
  ovens: { ovenId: string; level: number }[];
  chocoChips: number;
  rebirths: number;
  resets: number;
  totalDraws: number;
  achievements: string[];
};

// Stable IDs are saved; translated titles are presentation only.
export const STANDARD_ACHIEVEMENTS = ['tap', 'automation', 'collection', 'chips', 'rebirth', 'reset'] as const;
export const SECRET_ACHIEVEMENTS = ['draw50', 'secret'] as const;

export function earnedAchievements(state: AchievementProgress): string[] {
  const goals: [string, boolean][] = [
    ['tap', state.taps >= 1],
    ['automation', state.buildings.grandma_oven >= 1],
    ['collection', state.ovens.filter(oven => oven.level > 0).length >= 5],
    ['chips', state.chocoChips >= 10],
    ['rebirth', state.rebirths >= 1],
    ['reset', state.resets >= 1],
    ['draw50', state.totalDraws >= 50],
    ['secret', (state.ovens.find(oven => oven.ovenId === 'oven-16')?.level ?? 0) >= 2],
  ];
  return [...new Set([...state.achievements, ...goals.filter(([, done]) => done).map(([id]) => id)])];
}
