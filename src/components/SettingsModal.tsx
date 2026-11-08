import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/useGameStore';
import { modalText, type GameLanguage } from '../i18n/translations';

export const LANGUAGES: [GameLanguage, string][] = [
  ['ko', '한국어'], ['en', 'English'], ['ja', '日本語'], ['zh', '中文'],
  ['ar', 'العربية'], ['de', 'Deutsch'], ['ru', 'Русский'],
];

function Choice({ title, selected, onPress, id }: { title: string; selected: boolean; onPress(): void; id: string }) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} aria-checked={selected} testID={id}
    style={[s.choice, selected && s.selected]} onPress={onPress}>
    <Text style={s.choiceText}>{selected ? '✓ ' : ''}{title}</Text>
  </Pressable>;
}

export function SettingsModal({ visible, onClose, onReset }: { visible: boolean; onClose(): void; onReset(): void }) {
  const { settings, updateSettings } = useGameStore();
  const copy = modalText[settings.language];
  const insets = useSafeAreaInsets();
  const [resetStep, setResetStep] = useState(0);
  useEffect(() => { if (!visible) setResetStep(0); }, [visible]);
  const close = () => { setResetStep(0); onClose(); };
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
    <View style={[s.shade, { paddingTop: Math.max(16, insets.top), paddingBottom: Math.max(16, insets.bottom), direction: settings.language === 'ar' ? 'rtl' : 'ltr' }]}>
      <View style={s.card} accessibilityViewIsModal>
        <Text accessibilityRole="header" style={s.title}>⚙️ {copy.settings}</Text>
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          {(['sound', 'music', 'vibration'] as const).map(key => <View key={key} style={s.row}>
            <Text style={s.label}>{copy[key]}</Text>
            <Switch accessibilityLabel={copy[key]} testID={`setting-${key}`} value={settings[key]}
              onValueChange={value => updateSettings({ [key]: value })} trackColor={{ false: '#b7a68c', true: '#936039' }} />
          </View>)}
          <Text style={s.label}>{copy.musicMood}</Text>
          <View style={s.choices} accessibilityRole="radiogroup" accessibilityLabel={copy.musicMood}>
            {(['calm', 'exciting'] as const).map(value => <Choice key={value} id={`music-${value}`} title={copy[value]}
              selected={settings.musicStyle === value} onPress={() => updateSettings({ musicStyle: value })} />)}
          </View>
          <Text style={s.label}>{copy.tapSound}</Text>
          <View style={s.choices} accessibilityRole="radiogroup" accessibilityLabel={copy.tapSound}>
            {(['pop', 'drum', 'bite', 'crumble'] as const).map((value, index) => <Choice key={value} id={`sound-${value}`}
              title={[copy.tapPop, copy.tapDrum, copy.tapBite, copy.tapCrumble][index]} selected={settings.tapSound === value}
              onPress={() => updateSettings({ tapSound: value })} />)}
          </View>
          <Text style={s.label}>{copy.language}</Text>
          <View style={s.choices} accessibilityRole="radiogroup" accessibilityLabel={copy.language}>
            {LANGUAGES.map(([code, name]) => <Choice key={code} id={`language-${code}`} title={name}
              selected={settings.language === code} onPress={() => updateSettings({ language: code })} />)}
          </View>
          {resetStep > 0 && <Text accessibilityLiveRegion="polite" testID="reset-warning" style={s.warning}>{copy.resetPrompts[resetStep]}</Text>}
          <Pressable accessibilityRole="button" testID="reset-data" style={s.danger} onPress={() => {
            if (resetStep < 5) setResetStep(step => step + 1);
            else { setResetStep(0); onReset(); }
          }}><Text style={s.dangerText}>{resetStep > 0 ? `${resetStep}/5 · ` : ''}{copy.reset}</Text></Pressable>
        </ScrollView>
        <Pressable accessibilityRole="button" style={s.close} onPress={close}><Text style={s.choiceText}>{copy.close}</Text></Pressable>
      </View>
    </View>
  </Modal>;
}

const s = StyleSheet.create({
  shade: { flex: 1, backgroundColor: '#21111bd9', paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 580, maxHeight: '100%', padding: 18, borderRadius: 24, backgroundColor: '#fff8e9', gap: 14 },
  title: { fontSize: 23, fontWeight: '900', color: '#401923' },
  scroll: { flexShrink: 1 },
  content: { gap: 14, paddingBottom: 4 },
  row: { flexDirection: 'row', gap: 14, alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  label: { fontSize: 16, color: '#401923', fontWeight: '800', flexShrink: 1 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  choice: { minHeight: 44, paddingHorizontal: 13, paddingVertical: 10, justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: '#d6bb92', backgroundColor: '#fffbf2', maxWidth: '100%' },
  selected: { backgroundColor: '#ffe29a', borderColor: '#9c6727' },
  choiceText: { fontSize: 15, fontWeight: '800', color: '#401923', textAlign: 'center' },
  warning: { color: '#981936', fontSize: 15, lineHeight: 23, fontWeight: '700' },
  danger: { backgroundColor: '#8e1730', padding: 14, borderRadius: 12, minHeight: 46 },
  dangerText: { color: '#fff8e9', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  close: { backgroundColor: '#ffca45', padding: 14, borderRadius: 12, minHeight: 46 },
});
