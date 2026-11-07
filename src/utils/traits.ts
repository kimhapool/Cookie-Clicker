import type { Epirus, OwnedOven, Trait } from '../store/useGameStore';

const TRAITS: Trait[] = ['없음', '샤이니', '반전', '글리치'];
export function traitUpgrade(owned: OwnedOven, epirus: Record<Epirus, number>) {
  const index = TRAITS.indexOf(owned.trait);
  const next = TRAITS[index + 1];
  const cost = next ? index + 1 : 0;
  const matching = Math.min(epirus[owned.core] ?? 0, cost);
  const universal = cost - matching;
  return { next, cost, matching, universal,
    canRoll: owned.level > 0 && index >= 0 && !!next && universal <= (owned.core === 'infinity' ? 0 : epirus.infinity),
  };
}
