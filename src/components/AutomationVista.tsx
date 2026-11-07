import { memo, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, Easing, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { BUILDINGS, type Building } from '../data/buildings';
import { buildingDisplayName, labels, type GameLanguage } from '../i18n/translations';
import { compactNumber, productionNumber } from '../utils/numbers';
import { buildingProduction, type ProductionEvent } from '../utils/production';

export const BuildingStack = memo(function BuildingStack({ building, count, active = true }: {
  building: Building; count: number; active?: boolean;
}) {
  const tier = BUILDINGS.findIndex(item => item.id === building.id);
  const size = 40 + tier * 6;
  const reduced = useReducedMotion();
  const arrival = useSharedValue(1);
  const observed = useRef(active ? count : 0);
  useEffect(() => {
    if (!active) return;
    if (count > observed.current) {
      arrival.set(0);
      arrival.set(reduced ? withTiming(1, { duration: 140 }) : withSpring(1, { duration: 400, dampingRatio: 0.8 }));
    }
    observed.current = count;
  }, [active, count, reduced, arrival]);
  useEffect(() => () => cancelAnimation(arrival), [arrival]);
  const motion = useAnimatedStyle(() => ({
    opacity: interpolate(arrival.get(), [0, 0.3, 1], [0.25, 1, 1]),
    transform: reduced ? [] : [
      { translateX: (1 - arrival.get()) * -42 },
      { translateY: (1 - arrival.get()) * -15 },
      { rotate: `${(1 - arrival.get()) * -22}deg` },
      { scale: 0.92 + arrival.get() * 0.08 },
    ],
  }), [arrival, reduced]);
  const copies = Math.max(1, Math.min(4, count));
  return <View testID={`building-stack-${building.id}`} style={[s.stack, { width: size + 27 }]}>
    {Array.from({ length: copies }, (_, index) => <Animated.Text key={index}
      testID={index === copies - 1 ? `building-newest-${building.id}` : undefined}
      style={[s.emoji, { fontSize: size, lineHeight: size + 12, left: index * 6,
        bottom: index * 3, opacity: count > 0 ? 0.46 + index * (0.54 / Math.max(1, copies - 1)) : 0.25,
      }, count > 0 && index === copies - 1 && motion]}>{building.emoji}</Animated.Text>)}
  </View>;
});

function BuildingLot({ building, count, cps, language, event, active }: {
  building: Building; count: number; cps: number; language: GameLanguage;
  event: ProductionEvent | null; active: boolean;
}) {
  const reduced = useReducedMotion();
  const float = useSharedValue(1);
  const amount = event?.gains[building.id] ?? 0;
  useEffect(() => {
    if (!active || amount <= 0) return;
    float.set(0);
    float.set(withTiming(1, { duration: 850, easing: Easing.bezier(0.23, 1, 0.32, 1) }));
    return () => cancelAnimation(float);
  }, [event?.sequence, amount, active, float]);
  const feedback = useAnimatedStyle(() => ({
    opacity: interpolate(float.get(), [0, 0.1, 0.7, 1], [0, 1, 1, 0]),
    transform: reduced ? [] : [{ translateY: -float.get() * 17 }],
  }), [float, reduced]);
  const name = buildingDisplayName(building.id, building.name, language);
  return <View style={s.lot} testID={`building-lot-${building.id}`}>
    <View style={s.visual}>
      <BuildingStack building={building} count={count} active={active} />
      {amount > 0 && active && <Animated.Text pointerEvents="none" testID={`building-income-${building.id}`}
        style={[s.income, feedback]}>+{compactNumber(amount, language)}</Animated.Text>}
    </View>
    <Text style={s.name}>{name}</Text>
    <Text style={s.count}>×{compactNumber(count, language)}</Text>
    <Text style={s.cps}>CPS {productionNumber(cps, language)}</Text>
  </View>;
}

export const AutomationVista = memo(function AutomationVista({ counts, upgrades, totalCps, event, language, active = true }: {
  counts: Record<string, number>; totalCps: number; event: ProductionEvent | null;
  upgrades?: Record<string, number>;
  language: GameLanguage; active?: boolean;
}) {
  const owned = BUILDINGS.filter(building => (counts[building.id] ?? 0) > 0);
  if (!owned.length) return null;
  return <View style={s.container} testID="home-automation">
    <View style={s.header}>
      <Text style={s.heading}>🏭 {labels[language].automation}</Text>
      <Text style={s.total}>CPS {productionNumber(totalCps, language)}</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={s.items}>
      {owned.map(building => <BuildingLot key={building.id} building={building} count={counts[building.id]}
        cps={buildingProduction(building.id, totalCps, counts, upgrades)} language={language} event={event} active={active} />)}
    </ScrollView>
  </View>;
});

const s = StyleSheet.create({
  container: { marginVertical: 8, paddingTop: 10, backgroundColor: '#d9edff', borderRadius: 18 },
  header: { flexDirection: 'row', gap: 12, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12 },
  heading: { fontSize: 14, fontWeight: '900', color: '#27384f', flexShrink: 1 },
  total: { fontSize: 13, fontWeight: '800', color: '#245d3b' },
  items: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 12, gap: 8 },
  lot: { width: 128, alignItems: 'center', backgroundColor: '#edf7ff', borderRadius: 14, paddingHorizontal: 7, paddingBottom: 9 },
  visual: { height: 110, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  stack: { height: 84, alignSelf: 'center', position: 'relative' },
  emoji: { position: 'absolute' },
  income: { position: 'absolute', top: 22, alignSelf: 'center', color: '#205a32', backgroundColor: '#f1fff4', borderRadius: 9, paddingHorizontal: 5, fontWeight: '900', fontSize: 14 },
  name: { color: '#27384f', textAlign: 'center', fontSize: 12, fontWeight: '800', minHeight: 32 },
  count: { color: '#27384f', fontSize: 13, fontWeight: '800' },
  cps: { color: '#245d3b', fontSize: 12, marginTop: 2 },
});
