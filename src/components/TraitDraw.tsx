import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OVENS, RARITY_COLORS } from '../data/ovens';
import { coreNames, inventoryText, ovenDisplayName, pageText, traitNames, type GameLanguage } from '../i18n/translations';
import type { Epirus, OwnedOven } from '../store/useGameStore';
import { traitUpgrade } from '../utils/traits';

export function TraitDraw({ ovens, equippedId, epirus, language, onRoll }: {
  ovens: OwnedOven[]; equippedId: string; epirus: Record<Epirus, number>; language: GameLanguage; onRoll: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [targetId, setTargetId] = useState(equippedId);
  const [picker, setPicker] = useState(false);
  const owned = ovens.find(item => item.ovenId === targetId && item.level > 0) ?? ovens.find(item => item.level > 0);
  const oven = OVENS.find(item => item.id === owned?.ovenId);
  if (!owned || !oven) return null;
  const copy = pageText[language];
  const words = inventoryText[language];
  const upgrade = traitUpgrade(owned, epirus);
  return <View style={s.card}>
    <Text style={s.heading}>✨ {copy.traitDraw}</Text>
    <Pressable accessibilityRole="button" testID="trait-target" onPress={() => setPicker(true)}
      style={[s.target, { borderColor: RARITY_COLORS[oven.rarity] }]}>
      <Text style={s.name}>{ovenDisplayName(oven.id, oven.name, language)} ▾</Text>
      <Text style={s.detail}>{oven.rarity} · {coreNames[language][owned.core]}</Text>
    </Pressable>
    <Text style={s.trait} testID="trait-current">
      {traitNames[language][owned.trait]}{upgrade.next ? `  →  ${traitNames[language][upgrade.next]}` : ' ✓'}
    </Text>
    <View style={s.resources}>
      <Text style={s.detail}>💠 {words[owned.core]} · {epirus[owned.core]}</Text>
      {owned.core !== 'infinity' && <Text style={s.detail}>🌈 {words.infinity} · {epirus.infinity}</Text>}
    </View>
    {upgrade.next && <Text style={s.detail} testID="trait-cost">
      {words[owned.core]} ×{upgrade.cost}{upgrade.universal > 0 ? ` · 🌈 ${words.infinity} −${upgrade.universal}` : ''}
    </Text>}
    <Pressable accessibilityRole="button" disabled={!upgrade.canRoll} testID="trait-roll"
      style={[s.button, !upgrade.canRoll && s.disabled]} onPress={() => onRoll(owned.ovenId)}>
      <Text style={s.buttonText}>{copy.traitDraw}</Text>
    </Pressable>
    <Modal visible={picker} transparent animationType="fade" onRequestClose={() => setPicker(false)}>
      <View style={[s.shade, { paddingTop: Math.max(16, insets.top), paddingBottom: Math.max(16, insets.bottom) }]}>
        <View style={s.modal}>
          <Text style={s.heading}>{words.collection}</Text>
          <ScrollView style={s.list} contentContainerStyle={s.options}>
            {ovens.filter(item => item.level > 0).map(item => {
              const entry = OVENS.find(candidate => candidate.id === item.ovenId);
              if (!entry) return null;
              return <Pressable key={item.ovenId} accessibilityRole="button" testID={`trait-option-${item.ovenId}`}
                style={[s.target, { borderColor: RARITY_COLORS[entry.rarity] }, item.ovenId === owned.ovenId && s.selected]}
                onPress={() => { setTargetId(item.ovenId); setPicker(false); }}>
                <Text style={s.name}>{item.ovenId === owned.ovenId ? '✓ ' : ''}{ovenDisplayName(entry.id, entry.name, language)}</Text>
                <Text style={s.detail}>{entry.rarity} · {traitNames[language][item.trait]} · {coreNames[language][item.core]}</Text>
              </Pressable>;
            })}
          </ScrollView>
          <Pressable style={s.button} accessibilityRole="button" onPress={() => setPicker(false)}><Text style={s.buttonText}>{copy.close}</Text></Pressable>
        </View>
      </View>
    </Modal>
  </View>;
}
const s = StyleSheet.create({
  card: { backgroundColor: '#fff8e9', borderRadius: 20, borderWidth: 2, borderColor: '#e4cfa9', padding: 16, gap: 14 },
  heading: { fontSize: 21, color: '#401923', fontWeight: '900' },
  target: { borderWidth: 2, borderRadius: 13, backgroundColor: '#fffdf7', padding: 13, gap: 6 },
  selected: { backgroundColor: '#fff0c9' },
  name: { fontSize: 16, fontWeight: '800', color: '#401923' },
  detail: { color: '#62412e', fontSize: 13, lineHeight: 20 },
  trait: { color: '#713671', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  resources: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  button: { minHeight: 46, backgroundColor: '#ffca45', borderRadius: 13, padding: 13, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#401923', fontWeight: '900', fontSize: 15 },
  disabled: { opacity: 0.4 },
  shade: { flex: 1, backgroundColor: '#21111bd9', paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff8e9', width: '100%', maxWidth: 600, maxHeight: '100%', padding: 16, borderRadius: 22, gap: 14 },
  list: { flexShrink: 1 },
  options: { gap: 10 },
});
