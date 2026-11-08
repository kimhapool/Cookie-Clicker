import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Modal, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, {
  cancelAnimation, Easing, interpolate, useAnimatedStyle, useReducedMotion,
  useSharedValue, withTiming, ReduceMotion, useAnimatedReaction, type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { RARITY_COLORS, type Oven } from '../data/ovens';
import { ovenDisplayName, type GameLanguage } from '../i18n/translations';
import { buildDrawSequence, COOKIE_TILES, FLIGHT_DURATION, SECRET_DURATION } from '../utils/drawSequence';

const COOKIE = require('../../assets/cookie-cutout.png');
const SPECTRUM = ['#ff5287', '#ffbf56', '#e9fb83', '#68f6cf', '#61bdff', '#a685ff', '#ff5287'] as const;

type Props = { ovens: Oven[]; language: GameLanguage; onComplete(): void; reducedMotion?: boolean; haptics?: boolean };

export const DrawSequence = memo(function DrawSequence({ ovens, language, onComplete, reducedMotion, haptics = false }: Props) {
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion ?? systemReduced;
  const steps = useMemo(() => buildDrawSequence(ovens), [ovens]);
  const [index, setIndex] = useState(0);
  const finished = useRef(false);
  const advance = useCallback(() => setIndex(current => current === index ? current + 1 : current), [index]);
  const step = steps[index];
  useEffect(() => {
    if (haptics && step?.kind === 'secret') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => undefined);
    }
  }, [haptics, step]);
  useEffect(() => {
    if (step || finished.current) return;
    finished.current = true;
    onComplete();
  }, [step, onComplete]);
  return (
    <Modal visible transparent={false} animationType="none" onRequestClose={() => {}} statusBarTranslucent navigationBarTranslucent>
      <StatusBar hidden />
      <View style={s.space} testID="draw-sequence">
        <LinearGradient colors={step?.kind === 'secret' ? ['#010104', '#09091a', '#010104'] : ['#0a1027', '#23143d', '#090d24']} style={StyleSheet.absoluteFill} />
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 42 }, (_, i) => <View key={i} style={[s.star, {
            left: `${(i * 37 + 5) % 98}%`, top: `${(i * 61 + 9) % 98}%`,
            width: i % 7 === 0 ? 3 : 1.5, height: i % 7 === 0 ? 3 : 1.5,
            opacity: step?.kind === 'secret' ? 0.16 : 0.2 + (i % 5) * 0.13,
          }]} />)}
        </View>
        {step?.kind === 'flight' && <Flight key={index} oven={step.oven} language={language} reduced={reduced} onDone={advance} />}
        {step?.kind === 'secret' && <SecretReveal key={index} oven={step.oven} language={language} reduced={reduced} onDone={advance} />}
        <SafeAreaView pointerEvents="none" style={s.progressArea}>
          <Text style={s.progress}>{Math.min(ovens.length, (step?.drawIndex ?? ovens.length - 1) + 1)} / {ovens.length}</Text>
        </SafeAreaView>
      </View>
    </Modal>
  );
});

function useTimeline(duration: number, onDone: () => void) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(0);
    progress.set(withTiming(1, { duration, easing: Easing.linear, reduceMotion: ReduceMotion.Never }, done => {
      if (done) scheduleOnRN(onDone);
    }));
    return () => cancelAnimation(progress);
  }, [duration, onDone, progress]);
  return progress;
}

function OvenGlyph({ color }: { color: string }) {
  return <View style={[s.oven, { borderColor: color }]}>
    <View style={s.ovenControls}>
      <View style={[s.ovenLight, { backgroundColor: color }]} />
      <View style={s.knob} /><View style={s.knob} />
    </View>
    <View style={s.ovenDoor}>
      <LinearGradient colors={['#361519', '#bc5526', '#f6b34c']} style={StyleSheet.absoluteFill} />
      <Image source={COOKIE} style={s.ovenCookie} resizeMode="contain" />
      <View style={s.handle} />
    </View>
    <View style={s.ovenFeet}><View style={s.foot} /><View style={s.foot} /></View>
  </View>;
}

function Flight({ oven, language, reduced, onDone }: { oven: Oven; language: GameLanguage; reduced: boolean; onDone(): void }) {
  const { width } = useWindowDimensions();
  const progress = useTimeline(reduced ? 420 : FLIGHT_DURATION, onDone);
  const color = RARITY_COLORS[oven.rarity];
  const motion = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: interpolate(p, [0, 0.14, 0.8, 1], [0, 1, 1, 0]),
      transform: reduced ? [] : [
        { translateX: interpolate(p, [0, 0.42, 0.62, 1], [-width / 2 - 230, -30, 30, width / 2 + 230]) },
        { translateY: interpolate(p, [0, 0.5, 1], [70, -15, -65]) },
        { rotate: `${interpolate(p, [0, 0.42, 0.62, 1], [-40, -6, 8, 50])}deg` },
        { scale: interpolate(p, [0, 0.4, 0.65, 1], [0.65, 1, 1, 0.7]) },
      ],
    };
  }, [progress, reduced, width]);
  return <View style={s.scene} testID={`flight-${oven.id}`}>
    <Animated.View style={[s.flight, motion]}>
      {!reduced && <LinearGradient colors={['transparent', color]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={s.trail} />}
      <Text style={[s.orb, { color }]}>✦</Text>
      <OvenGlyph color={color} />
      <Text style={[s.rarity, { color }]}>{oven.rarity}</Text>
      <Text style={s.name}>{ovenDisplayName(oven.id, oven.name, language)}</Text>
    </Animated.View>
  </View>;
}

function CookieTile({ tile, index, size, progress }: { tile: typeof COOKIE_TILES[number]; index: number; size: number; progress: SharedValue<number> }) {
  const x = tile.x * size, y = tile.y * size;
  const angle = index * 2.39996;
  const dx = Math.cos(angle) * size * (0.14 + (index % 5) * 0.025);
  const dy = Math.sin(angle) * size * (0.14 + (index % 7) * 0.02);
  const motion = useAnimatedStyle(() => {
    const p = progress.get();
    const spread = interpolate(p, [0, 0.16, 0.37, 0.58, 0.81, 1], [0, 0, 1, 1, 0, 0]);
    const mix = interpolate(p, [0, 0.37, 0.58, 0.81, 1], [0, 0, 1, 0, 0]);
    return { transform: [
      { translateX: dx * spread - dy * mix * 0.65 },
      { translateY: dy * spread + dx * mix * 0.65 },
      { rotate: `${((index % 2 ? -1 : 1) * (25 + index % 80)) * spread}deg` },
    ] };
  }, [progress, dx, dy, index]);
  return <Animated.View testID={`cookie-piece-${index}`} style={[s.piece, {
    left: x, top: y, width: tile.width * size + 0.35, height: tile.height * size + 0.35,
  }, motion]}>
    <Image source={COOKIE} resizeMode="contain" style={{ position: 'absolute', left: -x, top: -y, width: size, height: size }} />
  </Animated.View>;
}

function Slash({ index, width, height, progress }: { index: number; width: number; height: number; progress: SharedValue<number> }) {
  const motion = useAnimatedStyle(() => {
    const cycle = (progress.get() * 4 + index / 9) % 1;
    return {
      opacity: Math.sin(cycle * Math.PI) * 0.42,
      transform: [
        { translateX: (cycle - 0.5) * width * 1.6 },
        { rotate: `${index % 2 ? -28 : 28}deg` },
      ],
    };
  }, [progress, index, width]);
  return <Animated.View style={[s.slash, {
    top: height * (0.1 + (index * 0.109) % 0.8), width: width * 1.5,
  }, motion]}>
    <LinearGradient colors={['transparent', '#91d7ff', '#f1c8ff', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
  </Animated.View>;
}

function SecretReveal({ oven, language, reduced, onDone }: { oven: Oven; language: GameLanguage; reduced: boolean; onDone(): void }) {
  const { width, height } = useWindowDimensions();
  const size = Math.min(380, width * 0.62, height * 0.43);
  const progress = useTimeline(reduced ? 1800 : SECRET_DURATION, onDone);
  const [phase, setPhase] = useState(0);
  useAnimatedReaction(
    () => progress.get() < 0.16 ? 0 : progress.get() < 0.37 ? 1 : progress.get() < 0.81 ? 2 : 3,
    (current, previous) => { if (current !== previous) scheduleOnRN(setPhase, current); },
    [progress],
  );
  const spectrum = useAnimatedStyle(() => ({
    opacity: reduced ? 0.7 : interpolate(progress.get(), [0, 0.16, 0.65, 0.82, 1], [0.35, 0.65, 0.55, 1, 0.7]),
    transform: reduced ? [] : [{ rotate: `${progress.get() * 540}deg` }],
  }), [progress, reduced]);
  const reveal = useAnimatedStyle(() => ({ opacity: interpolate(progress.get(), [0, 0.1, 0.77, 0.9, 1], [0, 0.65, 0.65, 1, 1]) }), [progress]);
  return <View style={s.scene} testID="secret-reveal">
    {!reduced && <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 9 }, (_, index) => <Slash key={index} index={index} width={width} height={height} progress={progress} />)}
    </View>}
    <View testID={`secret-stage-${phase}`} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ translateY: -height * 0.06 }] }}>
      <Animated.View style={[s.spectrum, { width: size * 1.38, height: size * 1.38, borderRadius: size }, spectrum]}>
        <LinearGradient colors={SPECTRUM} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={[s.spectrumCenter, { borderRadius: size }]} />
      </Animated.View>
      {reduced || phase === 0 || phase === 3 ? <Image source={COOKIE} resizeMode="contain" style={{ width: size, height: size }} /> :
        <View style={{ width: size, height: size }}>
          {COOKIE_TILES.map((tile, index) => <CookieTile key={index} tile={tile} index={index} size={size} progress={progress} />)}
        </View>}
    </View>
    <Animated.View style={[s.secretTitle, { top: height * 0.44 + size * 0.77 }, reveal]}>
      <Text style={s.secretRarity}>∞ SECRET ∞</Text>
      <Text style={s.secretName}>{ovenDisplayName(oven.id, oven.name, language)}</Text>
      <Text style={s.secretMultiplier}>×95</Text>
    </Animated.View>
  </View>;
}

const s = StyleSheet.create({
  space: { flex: 1, backgroundColor: '#010104' },
  scene: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  star: { position: 'absolute', backgroundColor: '#e2ecff', borderRadius: 3 },
  progressArea: { position: 'absolute', left: 0, right: 0, bottom: 16, alignItems: 'center' },
  progress: { color: '#d2d7f2', fontSize: 14, fontWeight: '700' },
  flight: { width: 240, alignItems: 'center' },
  trail: { position: 'absolute', right: 100, top: 68, width: 260, height: 30, borderRadius: 30, opacity: 0.35 },
  orb: { position: 'absolute', top: -60, right: 12, fontSize: 70 },
  oven: { width: 144, height: 154, backgroundColor: '#30344e', borderWidth: 3, borderRadius: 19, padding: 9 },
  ovenControls: { height: 24, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  ovenLight: { width: 39, height: 7, borderRadius: 3, marginRight: 15 },
  knob: { width: 15, height: 15, borderRadius: 8, backgroundColor: '#ddd4c6', borderWidth: 3, borderColor: '#8c8495' },
  ovenDoor: { flex: 1, borderWidth: 4, borderColor: '#171c30', borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  ovenCookie: { width: 72, height: 72 },
  handle: { position: 'absolute', top: 7, height: 5, width: 65, borderRadius: 3, backgroundColor: '#dfcbb8' },
  ovenFeet: { position: 'absolute', bottom: -11, left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-between' },
  foot: { width: 18, height: 9, borderRadius: 3, backgroundColor: '#82788d' },
  rarity: { fontSize: 15, fontWeight: '800', marginTop: 24 },
  name: { color: '#fff6e1', fontSize: 20, lineHeight: 28, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  piece: { position: 'absolute', overflow: 'hidden' },
  spectrum: { position: 'absolute', overflow: 'hidden', boxShadow: '0 0 34px rgba(135, 112, 255, 0.4)' },
  spectrumCenter: { position: 'absolute', inset: 8, backgroundColor: '#05050d' },
  slash: { position: 'absolute', left: '-25%', height: 2 },
  secretTitle: { position: 'absolute', left: 22, right: 22, alignItems: 'center', gap: 10 },
  secretRarity: { color: '#d5bbff', fontSize: 17, fontWeight: '800', letterSpacing: 3 },
  secretName: { color: '#fff5dc', fontSize: 21, lineHeight: 29, fontWeight: '900', textAlign: 'center', maxWidth: 460 },
  secretMultiplier: { color: '#ffd77b', fontSize: 30, fontWeight: '900' },
});
