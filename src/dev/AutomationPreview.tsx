// Development-only UI fixture. Never reads or writes a player's saved game.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AutomationVista } from '../components/AutomationVista';
import { TapCookie } from '../components/TapCookie';
import { TraitDraw } from '../components/TraitDraw';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OVENS } from '../data/ovens';
import type { OwnedOven, Epirus } from '../store/useGameStore';
import { traitUpgrade } from '../utils/traits';
import { BUILDINGS } from '../data/buildings';
import { allocateProduction, type ProductionEvent } from '../utils/production';

export function AutomationPreview() {
  const [counts, setCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(BUILDINGS.map(building => [building.id, 8])));
  const [event, setEvent] = useState<ProductionEvent | null>(null);
  const [taps, setTaps] = useState(0);
  const [boost, setBoost] = useState(1);
  const [ovens, setOvens] = useState<OwnedOven[]>(() => OVENS.map(oven => ({ ovenId: oven.id, level: 1, fusion: 0, trait: '없음', core: 'aurora' })));
  const [epirus, setEpirus] = useState<Record<Epirus, number>>({ aurora: 1, opternal: 0, twilight: 0, phoenix: 0, infinity: 5 });
  const cps = BUILDINGS.reduce((sum, building) => sum + building.baseCps * counts[building.id], 0) * 1.5;
  return <SafeAreaProvider><ScrollView style={s.screen} contentContainerStyle={s.content}>
    <Text style={s.title}>자동화 연출 검증</Text>
    <View style={s.cookie}>
      <TapCookie size={180} rebirths={2} language="ko" boost={boost} onTap={() => { setTaps(previous => previous + 1); return 1820; }} />
    </View>
    <Text testID="preview-taps">클릭 {taps} · 획득 {taps * 1820}</Text>
    <Pressable style={s.button} onPress={() => setBoost(previous => previous === 4 ? 1 : 4)}><Text>피버 전환</Text></Pressable>
    <Pressable style={s.button} onPress={() => setCounts(previous => ({ ...previous, grandma_oven: previous.grandma_oven + 1 }))}>
      <Text>가정용 오븐 추가</Text>
    </Pressable>
    <Pressable style={s.button} onPress={() => setEvent(previous => ({ sequence: (previous?.sequence ?? 0) + 1, gains: allocateProduction(cps, counts) }))}>
      <Text>수입 지급 {Math.floor(cps)}</Text>
    </Pressable>
    <AutomationVista counts={counts} totalCps={cps} event={event} language="ko" />
    {event && <Text testID="receipt-total">표시 합계 {Object.values(event.gains).reduce((sum, gain) => sum + gain, 0)}</Text>}
    <TraitDraw ovens={ovens} equippedId={OVENS[0].id} epirus={epirus} language="ko" onRoll={id => {
      const owned = ovens.find(oven => oven.ovenId === id)!;
      const upgrade = traitUpgrade(owned, epirus);
      if (!upgrade.canRoll) return;
      setEpirus(previous => ({ ...previous, aurora: previous.aurora - upgrade.matching, infinity: previous.infinity - upgrade.universal }));
      setOvens(previous => previous.map(oven => oven.ovenId === id ? { ...oven, trait: upgrade.next } : oven));
    }} />
    <Text style={s.credit}>Powered By Kixha</Text>
  </ScrollView></SafeAreaProvider>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8eed7' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#3b1620' },
  button: { backgroundColor: '#ffca45', padding: 15, borderRadius: 12 },
  cookie: { alignItems: 'center', backgroundColor: '#e7f4ff', borderRadius: 24 },
  credit: { fontSize: 10, color: '#62412e', textAlign: 'center' },
});
