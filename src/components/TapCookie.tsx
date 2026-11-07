import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { cancelAnimation, Easing, interpolate, ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { labels, type GameLanguage } from '../i18n/translations';

const BOARD = '#e7f4ff';
const RAINBOW = ['#ff548a', '#ffc550', '#68e2a3', '#55baff', '#b278ff', '#ff548a'] as const;
type Receipt = { id: number; gain: number };

const Crumb = memo(function Crumb({ progress, index, size }: { progress: SharedValue<number>; index: number; size: number }) {
  const angle = index * Math.PI / 3 - Math.PI / 2;
  const motion = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.08, 0.65, 1], [0, 1, 1, 0]),
    transform: [
      { translateX: Math.cos(angle) * size * 0.53 * progress.get() },
      { translateY: Math.sin(angle) * size * 0.44 * progress.get() + 16 * progress.get() ** 2 },
      { rotate: `${progress.get() * (index % 2 ? 190 : -130)}deg` },
    ],
  }), [progress, index, size, angle]);
  return <Animated.View style={[s.crumb, { width: 4 + index % 3, height: 4 + index % 3 }, motion]} />;
});

const TapFeedback = memo(function TapFeedback({ receipt, size, language, onDone }: {
  receipt: Receipt; size: number; language: GameLanguage; onDone: (id: number) => void;
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withTiming(1, { duration: 720, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.Never }, finished => {
      if (finished) scheduleOnRN(onDone, receipt.id);
    }));
    return () => cancelAnimation(progress);
  }, [progress, receipt.id, onDone]);
  const floating = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.08, 0.72, 1], [0, 1, 1, 0]),
    transform: reduced ? [] : [
      { translateY: -size * 0.2 * progress.get() },
      { translateX: (receipt.id % 3 - 1) * Math.min(13, size * 0.06) },
    ],
  }), [progress, reduced, size, receipt.id]);
  const ring = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0, 0.06, 0.75, 1], [0, 0.85, 0, 0]),
    transform: [{ scale: 0.65 + progress.get() * 0.4 }],
  }), [progress]);
  return <View pointerEvents="none" style={s.centerOverlay} testID={`tap-feedback-${receipt.id}`}>
    {!reduced && <>
      <Animated.View style={[s.ring, { width: size, height: size }, ring]} />
      {Array.from({ length: 6 }, (_, index) => <Crumb key={index} index={index} size={size} progress={progress} />)}
    </>}
    <Animated.View style={[s.gainPosition, floating]}>
      <LinearGradient colors={['#fffef8', '#ffe3a1']} style={s.gainGlass}>
        <Text testID={`tap-gain-${receipt.id}`} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}
          style={[s.gain, { fontSize: Math.min(25, 17 + Math.log10(Math.max(1, receipt.gain)) * 1.4) }]}>
          +{receipt.gain.toLocaleString(language)}
        </Text>
      </LinearGradient>
    </Animated.View>
  </View>;
});

export function TapCookie({ size, rebirths, language, boost, onTap }: {
  size: number; rebirths: number; language: GameLanguage; boost: number; onTap: () => number;
}) {
  const reduced = useReducedMotion();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [stage, setStage] = useState(0);
  const taps = useRef<number[]>([]);
  const serial = useRef(0);
  const decay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bounce = useSharedValue(1);
  const bite = useSharedValue(1);
  const spin = useSharedValue(0);
  const aura = useSharedValue(0);
  const auraStage = boost === 4 ? 3 : Math.max(stage, boost === 2 ? 2 : 0);
  useEffect(() => {
    aura.set(withTiming(auraStage > 0 ? 1 : 0, { duration: 180, reduceMotion: ReduceMotion.Never }));
    spin.set(0);
    if (auraStage === 3 && !reduced)
      spin.set(withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1));
    return () => cancelAnimation(spin);
  }, [auraStage, reduced, aura, spin]);
  useEffect(() => () => {
    if (decay.current) clearTimeout(decay.current);
    cancelAnimation(bounce); cancelAnimation(bite); cancelAnimation(aura);
  }, [bounce, bite, aura]);
  const removeReceipt = useCallback((id: number) => setReceipts(previous => previous.filter(item => item.id !== id)), []);
  const press = () => {
    const gain = onTap();
    if (gain <= 0) return;
    const now = Date.now();
    taps.current = [...taps.current.filter(time => now - time < 850), now];
    const count = taps.current.length;
    setStage(count >= 15 ? 3 : count >= 8 ? 2 : count >= 3 ? 1 : 0);
    if (decay.current) clearTimeout(decay.current);
    decay.current = setTimeout(() => { setStage(0); taps.current = []; }, 900);
    const id = ++serial.current;
    setReceipts(previous => [...previous, { id, gain }]);
    bite.set(0);
    bite.set(withTiming(1, { duration: 280, reduceMotion: ReduceMotion.Never }));
    if (!reduced) bounce.set(withSequence(withTiming(0.95, { duration: 55 }), withSpring(1, { duration: 230, dampingRatio: 0.6 })));
  };
  const cookieMotion = useAnimatedStyle(() => ({ transform: [{ scale: bounce.get() }] }), [bounce]);
  const biteMotion = useAnimatedStyle(() => ({ opacity: interpolate(bite.get(), [0, 0.15, 0.65, 1], [0, 1, 1, 0]) }), [bite]);
  const auraMotion = useAnimatedStyle(() => ({ opacity: aura.get(), transform: [{ rotate: `${spin.get() * 360}deg` }] }), [aura, spin]);
  const sparkleMotion = useAnimatedStyle(() => ({ opacity: 0.5 + Math.sin(spin.get() * Math.PI * 4) * 0.5 }), [spin]);
  return <View testID="cookie-stage" style={[s.stage, { width: size + 22, height: size + 38 }]}>
    <Animated.View pointerEvents="none" testID="cookie-aura" style={[s.aura, { width: size + 12, height: size + 12 }, auraMotion]}>
      <LinearGradient colors={auraStage === 3 ? RAINBOW : auraStage === 2 ? ['#ff9b46', '#d34b71'] : ['#ffcf52', '#ff8a4a']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.auraFill}>
        <View style={s.auraCenter} />
      </LinearGradient>
    </Animated.View>
    <Pressable onPress={press} accessibilityRole="button" accessibilityLabel={labels[language].tapCookie}
      testID="tap-cookie" style={{ width: size, height: size }}>
      <Animated.View style={[{ width: size, height: size }, cookieMotion]}>
        <Image source={require('../../assets/cookie-cutout.png')} style={{ width: size, height: size }} resizeMode="contain" />
        {rebirths > 0 && <Text pointerEvents="none" style={[s.rebirth, { color: ['#ffca45', '#ff9a60', '#ff74be', '#8be2ff', '#b993ff'][rebirths % 5], fontSize: Math.max(16, size * 0.12) }]}>
          {['✹', '✦', '✧', '☾', '✺'][rebirths % 5]}
        </Text>}
        <Animated.View pointerEvents="none" testID="cookie-bite" style={[s.bite, { width: size * 0.19, height: size * 0.19, top: size * 0.11, right: size * 0.08 }, biteMotion]} />
      </Animated.View>
    </Pressable>
    {auraStage === 3 && <Animated.View pointerEvents="none" style={[s.sparkles, sparkleMotion]}>
      <Text style={s.sparkle}>✦</Text><Text style={s.sparkle}>✧</Text>
    </Animated.View>}
    {receipts.map(receipt => <TapFeedback key={receipt.id} receipt={receipt} size={size} language={language} onDone={removeReceipt} />)}
  </View>;
}

const s = StyleSheet.create({
  stage: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  centerOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  aura: { position: 'absolute', borderRadius: 999, overflow: 'hidden' },
  auraFill: { flex: 1, padding: 5 },
  auraCenter: { flex: 1, borderRadius: 999, backgroundColor: BOARD },
  ring: { position: 'absolute', borderWidth: 3, borderColor: '#efbd49', borderRadius: 999 },
  crumb: { position: 'absolute', borderRadius: 2, backgroundColor: '#a95718' },
  gainPosition: { position: 'absolute', top: '22%', maxWidth: '95%' },
  gainGlass: { borderRadius: 16, borderWidth: 1.5, borderColor: '#dc9b2d', paddingHorizontal: 9, paddingVertical: 3 },
  gain: { color: '#7a2334', fontWeight: '900', textAlign: 'center' },
  bite: { position: 'absolute', borderRadius: 999, backgroundColor: BOARD },
  rebirth: { position: 'absolute', top: '20%', right: '19%', fontWeight: '900', textShadowColor: '#794811', textShadowRadius: 3 },
  sparkles: { position: 'absolute', inset: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sparkle: { color: '#a83483', fontSize: 22 },
});
