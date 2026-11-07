// Development-only preview. No store imports, currency mutations or save writes.
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DrawSequence } from '../components/DrawSequence';
import { OVENS, type Oven } from '../data/ovens';

export function DrawPreview() {
  const [ovens, setOvens] = useState<Oven[]>([]);
  const [results, setResults] = useState<Oven[]>([]);
  const [reduced, setReduced] = useState(false);
  const done = useCallback(() => { setResults(ovens); setOvens([]); }, [ovens]);
  const start = (items: Oven[], calm = false) => {
    setReduced(calm); setResults([]); setOvens(items);
  };
  return <SafeAreaProvider><SafeAreaView style={s.screen}>
    <ScrollView contentContainerStyle={s.content}>
      <Text style={s.title}>뽑기 연출 검증</Text>
      <Text>게임 저장과 분리된 개발용 미리보기입니다.</Text>
      <Pressable style={s.button} onPress={() => start([OVENS[16]])}><Text>시크릿 1회</Text></Pressable>
      <Pressable style={s.button} onPress={() => start([OVENS[0], OVENS[16], OVENS[4], OVENS[16]])}><Text>시크릿 중복 포함 4회</Text></Pressable>
      <Pressable style={s.button} onPress={() => start(OVENS)}><Text>모든 오븐 17회</Text></Pressable>
      <Pressable style={s.button} onPress={() => start([OVENS[16]], true)}><Text>모션 줄이기</Text></Pressable>
      {results.length > 0 && <View testID="preview-results" style={s.result}>
        <Text style={s.title}>완료 · {results.length}개</Text>
        {results.map((oven, i) => <Text key={i}>{i + 1}. {oven.name}</Text>)}
      </View>}
    </ScrollView>
    <Text style={s.credit}>Powered By Kixha</Text>
    {ovens.length > 0 && <DrawSequence ovens={ovens} language="ko" onComplete={done} reducedMotion={reduced} />}
  </SafeAreaView></SafeAreaProvider>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8eed7' },
  content: { padding: 20, gap: 14 },
  title: { color: '#3b1620', fontSize: 22, fontWeight: '800' },
  button: { backgroundColor: '#ffca45', padding: 16, borderRadius: 12 },
  result: { backgroundColor: '#fff8e9', padding: 16, gap: 8 },
  credit: { fontSize: 10, textAlign: 'center', padding: 5, color: '#62412e' },
});
