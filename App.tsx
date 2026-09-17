import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
  AppState,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  Switch,
  View,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { getClickGain, getCps, useGameStore } from "./src/store/useGameStore";
import { OVENS } from "./src/data/ovens";
import { BUILDINGS } from "./src/data/buildings";
import { MISSIONS, type MissionId } from "./src/data/missions";
import { homeText, labels, modalText } from "./src/i18n/translations";
import { compactNumber } from "./src/utils/numbers";
import {
  AchievementsPage,
  AutomationPage,
  DrawPage,
  ExchangePage,
  InventoryPage,
  UpgradesPage,
} from "./src/components/GamePages";

const WINE = "#dbc3a0",
  PAPER = "#f8eed7",
  BOARD = "#e7f4ff",
  GOLD = "#ffca45",
  INK = "#3b1620";
function Cookie({
  small = false,
  onPress,
}: {
  small?: boolean;
  onPress?: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const s = small
    ? 54
    : Math.min(190, Math.max(124, width * 0.46), Math.max(124, height * 0.19));
  if (!small)
    return (
      <Pressable onPress={onPress} style={{ width: s, height: s }}>
        <Image
          source={require("./assets/cookie-cutout.png")}
          style={{ width: s, height: s }}
          resizeMode="contain"
        />
      </Pressable>
    );
  return (
    <View style={[s0.cookie, { width: s, height: s, borderRadius: s / 2 }]}>
      <View style={[s0.cookieIn, { borderRadius: s / 2 }]}>
        {[
          [22, 20],
          [53, 17],
          [70, 40],
          [31, 51],
          [57, 58],
          [30, 71],
          [63, 70],
        ].map(([l, t], i) => (
          <View
            key={i}
            style={[
              s0.chip,
              {
                left: `${l}%`,
                top: `${t}%`,
                width: 7,
                height: 10,
                borderRadius: 20,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}
function Stat({
  a,
  b,
  compact = false,
  tight = false,
}: {
  a: string;
  b: string;
  compact?: boolean;
  tight?: boolean;
}) {
  return (
    <View style={[s0.stat, compact && s0.statCompact, tight && s0.statTight]}>
      <Text style={s0.statA}>{a}</Text>
      <Text style={s0.statB}>{b}</Text>
    </View>
  );
}
function Side({
  e,
  t,
  onPress,
  compact = false,
  disabled = false,
}: {
  e: string;
  t: string;
  onPress?: () => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[s0.side, compact && s0.sideShort, disabled && s0.sideLocked]}
    >
      <Text style={s0.sideE}>{e}</Text>
      <Text style={s0.sideT}>{t}</Text>
    </Pressable>
  );
}
export default function App() {
  const [tab, setTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rebirthOpen, setRebirthOpen] = useState(false);
  const [panel, setPanel] = useState<"mail" | "missions" | null>(null);
  const [resetStage, setResetStage] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [automationGain, setAutomationGain] = useState(0);
  const [clock, setClock] = useState(Date.now());
  const [tapStage, setTapStage] = useState(0);
  const tapTimes = useRef<number[]>([]);
  const appState = useRef(AppState.currentState);
  const shownAchievements = useRef(new Set<string>());
  const ripple = useRef(new Animated.Value(0)).current;
  const bite = useRef(new Animated.Value(0)).current;
  const rainbowSpin = useRef(new Animated.Value(0)).current;
  const resetFlash = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const phone = width < 500;
  const short = height < 820;
  const cookieSize = Math.min(
    190,
    Math.max(124, width * 0.46),
    Math.max(124, height * 0.19),
  );
  const game = useGameStore();
  const text = labels[game.settings.language ?? "ko"];
  const home = homeText[game.settings.language ?? "ko"];
  const modal = modalText[game.settings.language ?? "ko"];
  const ownedBuildings = BUILDINGS.filter(
    (building) => (game.buildings[building.id] || 0) > 0,
  );
  const popPlayer = useAudioPlayer(require("./assets/audio/5D.wav"));
  const drumPlayer = useAudioPlayer(require("./assets/audio/MV.wav"));
  const bitePlayer = useAudioPlayer(require("./assets/audio/om.wav"));
  const crumblePlayer = useAudioPlayer(require("./assets/audio/wb.wav"));
  const calmMusicPlayer = useAudioPlayer(require("./assets/audio/eM.wav"));
  const excitingMusicPlayer = useAudioPlayer(require("./assets/audio/NS.wav"));
  const n = game.cookies;
  const cps = getCps(game);
  const totalBuildings = Object.values(game.buildings).reduce(
    (total, count) => total + count,
    0,
  );
  const tutorialReady =
    game.tutorialStep === 0
      ? game.taps >= 1
      : game.tutorialStep === 1
        ? totalBuildings >= 15
        : game.tutorialStep === 2
          ? game.totalDraws >= 1
          : true;
  const canOpenTab = (index: number) => {
    if (game.tutorialComplete || index === 0) return true;
    if (game.tutorialStep === 1) return index === 3;
    if (game.tutorialStep === 2) return index === 1 || index === 3;
    return game.tutorialStep >= 3;
  };
  useEffect(() => {
    const timer = setInterval(() => { const gain = game.tick(1); if (gain) { setAutomationGain(gain); setTimeout(() => setAutomationGain(0), 700); } }, 1000);
    return () => clearInterval(timer);
  }, [game.tick]);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    game.checkOffline();
  }, [game.checkOffline]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const wasInactive = /inactive|background/.test(appState.current ?? "");
      if (wasInactive && nextState === "active") game.checkOffline();
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [game.checkOffline]);
  useEffect(() => {
    game.ensureAllOvens();
  }, [game.ensureAllOvens]);
  useEffect(() => {
    const calm = game.settings.musicStyle !== "exciting";
    calmMusicPlayer.loop = true;
    excitingMusicPlayer.loop = true;
    calmMusicPlayer.volume = 0.16;
    excitingMusicPlayer.volume = 0.15;
    if (game.settings.music) {
      if (calm) {
        excitingMusicPlayer.pause();
        calmMusicPlayer.play();
      } else {
        calmMusicPlayer.pause();
        excitingMusicPlayer.play();
      }
    } else {
      calmMusicPlayer.pause();
      excitingMusicPlayer.pause();
    }
  }, [
    game.settings.music,
    game.settings.musicStyle,
    calmMusicPlayer,
    excitingMusicPlayer,
  ]);
  useEffect(() => {
    const candidates = [
      ["첫 반죽", game.taps >= 1],
      ["빵집 개업", Object.values(game.buildings).some(Boolean)],
      ["새로운 생", game.rebirths >= 1],
      ["오븐 수집가", game.totalDraws >= 10],
    ] as const;
    const found = candidates.find(
      ([name, unlocked]) => unlocked && !shownAchievements.current.has(name),
    );
    if (found) {
      shownAchievements.current.add(found[0]);
      setAchievementToast(`🏆 도전과제 달성: ${found[0]}`);
      const timer = setTimeout(() => setAchievementToast(null), 2600);
      return () => clearTimeout(timer);
    }
  }, [game.taps, game.buildings, game.rebirths, game.totalDraws]);
  useEffect(() => {
    if (tapStage !== 3) {
      rainbowSpin.stopAnimation();
      rainbowSpin.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.timing(rainbowSpin, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [rainbowSpin, tapStage]);
  const tapCookie = () => {
    const gain = game.click();
    const now = Date.now();
    tapTimes.current = [
      ...tapTimes.current.filter((time) => now - time < 850),
      now,
    ];
    setTapStage(
      tapTimes.current.length >= 15
        ? 3
        : tapTimes.current.length >= 8
          ? 2
          : tapTimes.current.length >= 3
            ? 1
            : 0,
    );
    setLastGain(gain);
    setTimeout(() => setLastGain(0), 700);
    ripple.setValue(0);
    bite.setValue(0);
    Animated.parallel([
      Animated.timing(ripple, {
        toValue: 1,
        duration: 560,
        useNativeDriver: true,
      }),
      Animated.timing(bite, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
    if (game.settings.vibration)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
        () => undefined,
      );
    if (game.settings.sound) {
      const player =
        game.settings.tapSound === "pop"
          ? popPlayer
          : game.settings.tapSound === "drum"
            ? drumPlayer
            : game.settings.tapSound === "crumble"
              ? crumblePlayer
              : bitePlayer;
      player.seekTo(0);
      player.play();
    }
  };
  const tabs = [
    `🏠\n${text.home}`,
    `🎰\n${text.draw}`,
    `🎒\n${text.inventory}`,
    `🏭\n${text.automation}`,
    `💱\n${text.exchange}`,
    `⚡\n${text.upgrades}`,
    `🏆\n${text.achievements}`,
  ];
  return (
    <SafeAreaView style={s0.safe}>
      <StatusBar style="dark" />
      <View style={[s0.head, phone && s0.headPhone, short && s0.headShort]}>
        <Pressable
          onPress={() => setProfileOpen(true)}
          style={[s0.avatar, phone && s0.avatarPhone]}
        >
          <Cookie small />
        </Pressable>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            🍪 {compactNumber(n)}
          </Text>
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            🍫 {compactNumber(game.chocoChips)}
          </Text>
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            💎 {compactNumber(game.premiumChips)}
          </Text>
        </View>
        <View style={[s0.res, s0.cps, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            ⚡ CPS {compactNumber(cps)}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setResetStage(0);
            setSettingsOpen(true);
          }}
          style={[s0.setting, phone && s0.settingPhone]}
        >
          <Text>⚙️</Text>
        </Pressable>
      </View>
      <View
        style={[
          s0.body,
          phone && s0.bodyPhone,
          short && s0.bodyShort,
          tab !== 0 && s0.hidden,
        ]}
      >
        <View style={[s0.off, short && s0.offShort]}>
          <View>
            <Text style={s0.offTitle}>{text.offline}</Text>
            <Text style={s0.offSub}>
              {game.pendingOffline
                ? `${Math.floor(game.offlineSeconds / 60)}분 ${game.offlineSeconds % 60}초 · +${game.pendingOffline.toLocaleString("ko-KR")}`
                : modal.offlineWaiting}
            </Text>
          </View>
          {ownedBuildings.length > 0 && (
            <View style={[s0.automationVista, short && s0.automationVistaShort]}>
              <View style={s0.automationVistaHead}>
                <Text style={s0.automationVistaTitle}>{home.auto} {modal.autoBakery}</Text>
                <Text style={s0.automationVistaCps}>+{compactNumber(cps)}/초</Text>
              </View>
              <View style={s0.automationVistaItems}>
                {ownedBuildings.map((building, index) => (
                  <View key={building.id} style={s0.automationVistaItem}>
                    <Text
                      style={[
                        s0.automationVistaEmoji,
                        { fontSize: 25 + index * 3 },
                      ]}
                    >
                      {building.emoji}
                    </Text>
                    <Text style={s0.automationVistaCount}>
                      ×{game.buildings[building.id]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <Pressable
            disabled={!game.pendingOffline}
            onPress={() => {
              const reward = game.claimOffline();
              if (reward && game.settings.vibration)
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                ).catch(() => undefined);
            }}
            style={[s0.claim, !game.pendingOffline && s0.claimDisabled]}
          >
            <Text style={s0.claimT}>{text.claim}</Text>
          </Pressable>
        </View>
        <View style={[s0.board, short && s0.boardShort]}>
          <View style={s0.statRow}>
            <Stat a={home.click} b={`+${getClickGain(game)}`} />
            <Stat a={home.rebirth} b={`x${Math.pow(1.5, game.rebirths).toFixed(2)}`} />
          </View>
          <Text style={s0.work}>{home.workshop}</Text>
          <View style={[s0.boostRow, short && s0.boostRowShort]}>
            <Pressable
              disabled={game.boostUntil > Date.now() || game.cookies < 5000}
              onPress={() => game.activateBoost(2)}
              style={[
                s0.boostCard,
                game.boostUntil > Date.now() && s0.claimDisabled,
              ]}
              >
                <Text style={s0.boostTitle}>🔥 {home.doublePotion}</Text>
              <View style={s0.boostMeta}>
                <Text style={s0.boostSub}>
                  {game.boostUntil > clock
                    ? `${home.active} · ${Math.ceil((game.boostUntil - clock) / 1000)}초`
                    : "2배 · 5,000 쿠키"}
                </Text>
                <View style={s0.boostUse}><Text style={s0.boostUseText}>{game.boostUntil > clock ? "✓" : home.use}</Text></View>
              </View>
            </Pressable>
            <Pressable
              disabled={game.boostUntil > Date.now() || game.cookies < 25000}
              onPress={() => game.activateBoost(4)}
              style={[
                s0.boostCard,
                s0.feverCard,
                game.boostUntil > Date.now() && s0.claimDisabled,
              ]}
              >
                <Text style={s0.boostTitle}>🌈 {home.feverTime}</Text>
              <View style={s0.boostMeta}>
                <Text style={s0.boostSub}>
                  {game.boostUntil > clock
                    ? `${home.active} · ${Math.ceil((game.boostUntil - clock) / 1000)}초`
                    : "4배 · 25,000 쿠키"}
                </Text>
                <View style={s0.boostUse}><Text style={s0.boostUseText}>{game.boostUntil > clock ? "✓" : home.use}</Text></View>
              </View>
            </Pressable>
          </View>
          <View style={s0.play}>
            <View style={[s0.left, short && s0.leftShort]}>
              <Side
                e="📬"
                t={home.mail}
                compact={short}
                disabled={!game.tutorialComplete && game.tutorialStep < 3}
                onPress={() => setPanel("mail")}
              />
              <Side
                e="📋"
                t={home.missions}
                compact={short}
                disabled={!game.tutorialComplete}
                onPress={() => setPanel("missions")}
              />
              <Pressable
                disabled={!game.tutorialComplete}
                onPress={() => setRebirthOpen(true)}
                style={[s0.side, short && s0.sideShort, !game.tutorialComplete && s0.sideLocked]}
              >
                <Text style={s0.sideE}>😇</Text>
                <Text style={s0.sideT}>{home.rebirth}</Text>
              </Pressable>
              <Pressable
                disabled={!canOpenTab(1)}
                onPress={() => setTab(1)}
                style={[s0.side, short && s0.sideShort, !canOpenTab(1) && s0.sideLocked]}
              >
                <Text style={s0.sideE}>🎲</Text>
                <Text style={s0.sideT}>{home.odds}</Text>
              </Pressable>
            </View>
            <View style={s0.cookieZone}>
              <View style={s0.shadow} />
              <View
                style={[
                  s0.cookieStage,
                  { width: cookieSize + 22, height: cookieSize + 22 },
                ]}
              >
                {tapStage > 0 && (
                  tapStage === 3 ? (
                    <Animated.View
                      style={[
                        s0.tapAura,
                        {
                          transform: [
                            {
                              rotate: rainbowSpin.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0deg", "360deg"],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={["#ff4dcc", "#ffca45", "#35b9ff", "#9e62ff"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s0.auraFill}
                      />
                    </Animated.View>
                  ) : (
                    <LinearGradient
                      colors={tapStage === 2 ? ["#ff9b46", "#d34b71"] : ["#ffcf52", "#ff8a4a"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={s0.tapAura}
                    />
                  )
                )}
                {tapStage === 3 && (
                  <>
                    <Text pointerEvents="none" style={[s0.sparkle, s0.sparkleOne]}>✦</Text>
                    <Text pointerEvents="none" style={[s0.sparkle, s0.sparkleTwo]}>✧</Text>
                    <Text pointerEvents="none" style={[s0.sparkle, s0.sparkleThree]}>✦</Text>
                    <Text pointerEvents="none" style={[s0.sparkle, s0.sparkleFour]}>✧</Text>
                  </>
                )}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    s0.ripple,
                    {
                      opacity: ripple.interpolate({
                        inputRange: [0, 0.1, 1],
                        outputRange: [0, 0.72, 0],
                      }),
                      transform: [
                        {
                          scale: ripple.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.7, 1.55],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Cookie onPress={tapCookie} />
                <Animated.View
                  pointerEvents="none"
                  style={[
                    s0.bite,
                    {
                      opacity: bite.interpolate({
                        inputRange: [0, 0.18, 1],
                        outputRange: [0, 1, 0],
                      }),
                      transform: [
                        {
                          scale: bite.interpolate({
                            inputRange: [0, 0.18, 1],
                            outputRange: [0.3, 1, 1.15],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                {lastGain > 0 && (
                  <>
                    <View
                      pointerEvents="none"
                      style={[s0.crumb, s0.crumbOne]}
                    />
                    <View
                      pointerEvents="none"
                      style={[s0.crumb, s0.crumbTwo]}
                    />
                    <View
                      pointerEvents="none"
                      style={[s0.crumb, s0.crumbThree]}
                    />
                  </>
                )}
              </View>
              {lastGain > 0 && (
                <Text style={s0.gain}>+{lastGain.toLocaleString("ko-KR")}</Text>
              )}
              {automationGain > 0 && (
                <Text style={s0.automationGain}>
                  {home.auto} +{compactNumber(automationGain)}
                </Text>
              )}
              <Text style={s0.tap}>{text.tapCookie}</Text>
            </View>
            <View style={[s0.right, short && s0.rightShort]}>
              <Stat
                compact
                tight={short}
                a={home.ownedOvens}
                b={`${game.ovens.filter((o) => o.level > 0).length}종`}
              />
              <Stat
                compact
                tight={short}
                a={home.chips}
                b={`${game.chocoChips}개`}
              />
              <Stat
                compact
                tight={short}
                a={home.buff}
                b={
                  game.boostUntil > clock
                    ? `${game.boostMultiplier}배 ${Math.ceil((game.boostUntil - clock) / 1000)}초`
                    : home.waiting
                }
              />
            </View>
          </View>
          <Pressable
            disabled={!canOpenTab(1)}
            onPress={() => setTab(1)}
            style={[s0.promo, short && s0.promoShort, !canOpenTab(1) && s0.claimDisabled]}
          >
            <Text style={s0.promoE}>🎁</Text>
            <View>
              <Text style={s0.promoT}>{text.todayOven}</Text>
              <Text style={s0.promoS}>{home.todayOvenSub}</Text>
            </View>
            <Text style={s0.arrow}>›</Text>
          </Pressable>
        </View>
      </View>
      {tab === 1 && <DrawPage />}
      {tab === 2 && <InventoryPage />}
      {tab === 3 && <AutomationPage />}
      {tab === 4 && <ExchangePage />}
      {tab === 5 && <UpgradesPage />}
      {tab === 6 && <AchievementsPage />}
      <View style={[s0.dock, phone && s0.dockPhone, short && s0.dockShort]}>
        {tabs.map((t, i) => (
          <Pressable
            key={t}
            disabled={!canOpenTab(i)}
            onPress={() => setTab(i)}
            style={[
              s0.tab,
              phone && s0.tabPhone,
              tab === i && s0.active,
              !canOpenTab(i) && s0.tabLocked,
            ]}
          >
            <Text
              numberOfLines={2}
              style={[s0.tabT, phone && s0.tabTPhone, tab === i && s0.activeT]}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>
      {achievementToast && (
        <View pointerEvents="none" style={s0.achievementToast}>
          <Text style={s0.achievementText}>{achievementToast}</Text>
        </View>
      )}
      <Modal
        transparent
        animationType="slide"
        visible={!!panel}
        onRequestClose={() => setPanel(null)}
      >
        <View style={s0.modalShade}>
          <View style={s0.modalCard}>
            <Text style={s0.modalTitle}>
              {panel === "mail" ? `📬 ${modal.mailbox}` : `📋 ${modal.todayMissions}`}
            </Text>
            {panel === "mail"
              ? [
                  ["tutorial", "안내 완료 선물", "초코칩 10개"],
                  ["welcome", "베이커리 개업 선물", "쿠키 500개"],
                  ["chips", "초코칩 꾸러미", "쿠키 3,000개"],
                  ["moon", "달빛 배송", "쿠키 2,500개"],
                ].map(([id, title, reward]) => {
                  const claimed = game.claimedMail.includes(id);
                  const unavailable =
                    id === "tutorial" && !game.tutorialComplete;
                  return (
                    <View key={id} style={s0.mailRow}>
                      <View>
                        <Text style={s0.mailTitle}>{title}</Text>
                        <Text style={s0.mailSub}>{reward}</Text>
                      </View>
                      <Pressable
                        disabled={claimed || unavailable}
                        onPress={() => {
                          if (game.claimMail(id) && game.settings.vibration)
                            Haptics.notificationAsync(
                              Haptics.NotificationFeedbackType.Success,
                            ).catch(() => undefined);
                        }}
                        style={[
                          s0.mailButton,
                          (claimed || unavailable) && s0.claimDisabled,
                        ]}
                      >
                        <Text style={s0.languageText}>
                          {claimed ? modal.claimed : unavailable ? modal.guideDone : modal.claim}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })
              : MISSIONS.map((mission) => {
                  const missionProgress: Record<MissionId, number> = {
                    tap: game.taps,
                    stockpile: game.cookies,
                    building: Object.values(game.buildings).reduce((a, b) => a + b, 0),
                    chip: game.chocoChips,
                    draw: game.totalDraws,
                    upgrade: Object.values(game.upgrades).reduce((a, b) => a + b, 0),
                    rebirth: game.rebirths,
                    lifetime: game.totalCookies,
                  };
                  const missionId = mission.id;
                  const value = missionProgress[missionId];
                  const goal = mission.target;
                  const done = value >= goal;
                  const claimed = game.claimedMissions.includes(missionId);
                  return (
                    <View key={missionId} style={s0.mailRow}>
                      <View>
                        <Text style={s0.mailTitle}>
                          {done ? "✅ " : "🎯 "}
                          {mission.title}
                        </Text>
                        <Text style={s0.mailSub}>
                          {value}/{goal} · {modal.reward} {mission.reward}
                        </Text>
                        <View style={s0.missionTrack}>
                          <View
                            style={[
                              s0.missionFill,
                              {
                                width: `${Math.min(100, (value / goal) * 100)}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                      <Pressable
                        disabled={!done || claimed}
                        onPress={() => {
                          if (
                            game.claimMission(missionId) &&
                            game.settings.vibration
                          )
                            Haptics.notificationAsync(
                              Haptics.NotificationFeedbackType.Success,
                            ).catch(() => undefined);
                        }}
                        style={[
                          s0.mailButton,
                          (!done || claimed) && s0.claimDisabled,
                        ]}
                      >
                        <Text style={s0.languageText}>
                          {claimed ? modal.claimed : modal.claim}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
            <Pressable onPress={() => setPanel(null)} style={s0.closeButton}>
              <Text style={s0.closeText}>{modal.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        animationType="fade"
        visible={settingsOpen}
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View style={s0.modalShade}>
          <View style={s0.modalCard}>
            <Text style={s0.modalTitle}>⚙️ {modal.settings}</Text>
            <View style={s0.settingRow}>
              <Text style={s0.settingLabel}>{modal.sound}</Text>
              <Switch
                value={game.settings.sound}
                onValueChange={(sound) => game.updateSettings({ sound })}
              />
            </View>
            <View style={s0.settingRow}>
              <Text style={s0.settingLabel}>{modal.music}</Text>
              <Switch
                value={game.settings.music}
                onValueChange={(music) => game.updateSettings({ music })}
              />
            </View>
            <View style={s0.settingRow}>
              <Text style={s0.settingLabel}>{modal.musicMood}</Text>
              <Pressable
                onPress={() =>
                  game.updateSettings({
                    musicStyle:
                      game.settings.musicStyle === "exciting"
                        ? "calm"
                        : "exciting",
                  })
                }
                style={s0.languageButton}
              >
                <Text style={s0.languageText}>
                  {game.settings.musicStyle === "exciting"
                    ? modal.exciting
                    : modal.calm}
                </Text>
              </Pressable>
            </View>
            <View style={s0.settingRow}>
              <Text style={s0.settingLabel}>{modal.vibration}</Text>
              <Switch
                value={game.settings.vibration}
                onValueChange={(vibration) =>
                  game.updateSettings({ vibration })
                }
              />
            </View>
            <View style={s0.settingRow}>
              <Text style={s0.settingLabel}>{modal.tapSound}</Text>
              <Pressable
                onPress={() => {
                  const sounds = ["pop", "drum", "bite", "crumble"] as const;
                  game.updateSettings({
                    tapSound:
                      sounds[
                        (sounds.indexOf(game.settings.tapSound) + 1) %
                          sounds.length
                      ],
                  });
                }}
                style={s0.languageButton}
              >
                <Text style={s0.languageText}>
                  {
                    {
                      pop: "팝",
                      drum: "드럼",
                      bite: "바삭한 한입",
                      crumble: "부스러짐",
                    }[game.settings.tapSound]
                  }
                </Text>
              </Pressable>
            </View>
            <View style={s0.settingRow}>
              <Text style={s0.settingLabel}>{modal.language}</Text>
              <Pressable
                onPress={() => {
                  const order = [
                    "ko",
                    "en",
                    "ja",
                    "zh",
                    "ar",
                    "de",
                    "ru",
                  ] as const;
                  game.updateSettings({
                    language:
                      order[
                        (order.indexOf(game.settings.language) + 1) %
                          order.length
                      ],
                  });
                }}
                style={s0.languageButton}
              >
                <Text style={s0.languageText}>
                  {
                    {
                      ko: "한국어",
                      en: "English",
                      ja: "日本語",
                      zh: "中文",
                      ar: "العربية",
                      de: "Deutsch",
                      ru: "Русский",
                    }[game.settings.language]
                  }
                </Text>
              </Pressable>
            </View>
            {resetStage > 0 && (
              <Text style={s0.resetWarning}>
                {modal.resetPrompts[resetStage]}
              </Text>
            )}
            <Pressable
              onPress={() => {
                if (resetStage >= 5) {
                  game.resetGame();
                  resetFlash.setValue(0);
                  Animated.sequence([
                    Animated.timing(resetFlash, { toValue: 0.92, duration: 120, useNativeDriver: true }),
                    Animated.timing(resetFlash, { toValue: 0, duration: 520, useNativeDriver: true }),
                  ]).start();
                  setResetStage(0);
                  setSettingsOpen(false);
                } else setResetStage(resetStage + 1);
              }}
              style={s0.resetButton}
            >
              <Text style={s0.closeText}>
                {resetStage >= 5 ? modal.resetDone : modal.reset}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setResetStage(0);
                setSettingsOpen(false);
              }}
              style={s0.closeButton}
            >
              <Text style={s0.closeText}>{modal.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal transparent animationType="fade" visible={!game.tutorialComplete}>
        <View pointerEvents="box-none" style={s0.tutorialShade}>
          <View pointerEvents="auto" style={s0.tutorialCard}>
            <Text style={s0.modalTitle}>🍪 {modal.bakeryGuide}</Text>
            <Text style={s0.tutorialText}>
              {modal.tutorialSteps[Math.min(game.tutorialStep, 4)]}
            </Text>
            <Pressable
              disabled={!tutorialReady}
              onPress={() => game.advanceTutorial()}
              style={[s0.closeButton, !tutorialReady && s0.claimDisabled]}
            >
              <Text style={s0.closeText}>
                {tutorialReady
                  ? game.tutorialStep >= 4
                    ? modal.complete
                    : modal.next
                  : game.tutorialStep === 0
                    ? modal.tapCookie
                    : game.tutorialStep === 1
                      ? `${totalBuildings}/15`
                      : modal.drawFirst}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Animated.View pointerEvents="none" style={[s0.resetFlash, { opacity: resetFlash }]} />
      <Modal
        transparent
        animationType="fade"
        visible={profileOpen}
        onRequestClose={() => setProfileOpen(false)}
      >
        <View style={s0.modalShade}>
          <View style={s0.modalCard}>
            <Text style={s0.modalTitle}>🍪 {modal.profile}</Text>
            <Text style={s0.settingLabel}>
              누적 쿠키 {game.totalCookies.toLocaleString("ko-KR")}
            </Text>
            <Text style={s0.settingLabel}>
              누적 터치 {game.taps.toLocaleString("ko-KR")}
            </Text>
            <Text style={s0.settingLabel}>
              누적 뽑기 {game.totalDraws.toLocaleString("ko-KR")}
            </Text>
            <Text style={s0.settingLabel}>
              초코칩 {game.chocoChips.toLocaleString("ko-KR")} · 프리미엄 초코칩 {game.premiumChips.toLocaleString("ko-KR")}
            </Text>
            <Text style={s0.settingLabel}>환생 {game.rebirths}회</Text>
            <Text style={s0.settingLabel}>
              {modal.equippedOven}{" "}
              {OVENS.find((oven) => oven.id === game.equippedOvenId)?.name ??
                modal.none}
            </Text>
            <Pressable
              onPress={() => setProfileOpen(false)}
              style={s0.closeButton}
            >
              <Text style={s0.closeText}>{modal.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        animationType="fade"
        visible={rebirthOpen}
        onRequestClose={() => setRebirthOpen(false)}
      >
        <View style={s0.modalShade}>
          <View style={s0.modalCard}>
            <Text style={s0.modalTitle}>😇 {home.rebirth}</Text>
            <Text style={s0.settingLabel}>{modal.currentRebirth} {game.rebirths}</Text>
            <Text style={s0.settingLabel}>
              현재 배율 x{Math.pow(1.5, game.rebirths).toFixed(2)} → 다음 x
              {Math.pow(1.5, game.rebirths + 1).toFixed(2)}
            </Text>
            <Text style={s0.mailSub}>
              현재 쿠키만 초기화되며 오븐, 자동화, 강화와 모든 영구 진행은
              유지됩니다.
            </Text>
            <View style={s0.progressTrack}>
              <View
                style={[
                  s0.progressFill,
                  {
                    width: `${Math.min(100, (game.cookies / (100000 * Math.pow(5, game.rebirths))) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={s0.mailSub}>
              {game.cookies.toLocaleString("ko-KR")} /{" "}
              {(100000 * Math.pow(5, game.rebirths)).toLocaleString("ko-KR")}
            </Text>
            <Pressable
              disabled={game.cookies < 100000 * Math.pow(5, game.rebirths)}
              onPress={() => {
                game.rebirth();
                setRebirthOpen(false);
              }}
              style={[
                s0.closeButton,
                game.cookies < 100000 * Math.pow(5, game.rebirths) &&
                  s0.claimDisabled,
              ]}
            >
              <Text style={s0.closeText}>{modal.rebirthNow}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const s0 = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER },
  resetFlash: { ...StyleSheet.absoluteFill, zIndex: 99, backgroundColor: "#fff9d8" },
  head: {
    height: 115,
    backgroundColor: WINE,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 5,
    borderColor: "#c79e6a",
  },
  headPhone: { height: 92, gap: 5, paddingHorizontal: 7 },
  headShort: { height: 78 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff7e7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#b77b38",
  },
  avatarPhone: { width: 54, height: 54, borderRadius: 27 },
  res: {
    height: 60,
    minWidth: 95,
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#fff3d5",
    borderWidth: 2,
    borderColor: "#c79e6a",
    alignItems: "center",
    justifyContent: "center",
  },
  resPhone: { minWidth: 0, height: 52, borderRadius: 11 },
  cps: { flex: 2.2 },
  resT: { fontSize: 16, fontWeight: "900", color: INK },
  resTPhone: { fontSize: 10 },
  setting: {
    width: 57,
    height: 70,
    borderRadius: 13,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#b77b38",
  },
  settingPhone: { width: 40, height: 52, borderRadius: 11 },
  body: { flex: 1, padding: 22, gap: 13 },
  bodyPhone: { padding: 14, gap: 10 },
  bodyShort: { padding: 10, gap: 7 },
  hidden: { display: "none" },
  coming: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAPER,
  },
  comingText: { fontSize: 18, fontWeight: "900", color: INK },
  off: {
    height: 118,
    borderRadius: 26,
    backgroundColor: "#fff3d5",
    borderWidth: 4,
    borderColor: "#dba020",
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  offTitle: { fontSize: 20, fontWeight: "900", color: INK, marginBottom: 8 },
  offShort: { height: 88, paddingHorizontal: 16, borderWidth: 3 },
  offSub: { fontSize: 15, fontWeight: "800", color: "#72564b" },
  claim: {
    width: 120,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#ffb900",
    alignItems: "center",
    justifyContent: "center",
  },
  claimDisabled: { opacity: 0.45 },
  modalShade: {
    flex: 1,
    backgroundColor: "#00000077",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#fff8e9",
    borderRadius: 28,
    padding: 22,
    gap: 12,
    borderWidth: 3,
    borderColor: "#d9bd85",
  },
  modalTitle: { fontSize: 25, fontWeight: "900", color: INK, marginBottom: 4 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 46,
  },
  settingLabel: { fontSize: 17, fontWeight: "800", color: INK },
  mailRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fffdf8",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eadabb",
  },
  mailTitle: { fontSize: 16, fontWeight: "900", color: INK },
  mailSub: { fontSize: 13, fontWeight: "700", color: "#746359", marginTop: 3 },
  mailButton: {
    backgroundColor: "#ffca45",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  progressTrack: {
    height: 12,
    backgroundColor: "#ecdcb9",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ffb900",
    borderRadius: 10,
  },
  missionTrack: {
    height: 6,
    marginTop: 6,
    backgroundColor: "#eadabb",
    borderRadius: 8,
    overflow: "hidden",
  },
  missionFill: { height: "100%", backgroundColor: "#77b5e8", borderRadius: 8 },
  languageButton: {
    backgroundColor: "#ffca45",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  languageText: { color: INK, fontWeight: "900" },
  closeButton: {
    backgroundColor: "#850019",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 15,
    marginTop: 8,
  },
  closeText: { color: "#fff8e9", fontSize: 16, fontWeight: "900" },
  resetButton: {
    backgroundColor: "#9e1634",
    paddingVertical: 11,
    alignItems: "center",
    borderRadius: 15,
  },
  resetWarning: {
    color: "#8a1832",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  tutorialShade: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 88,
    paddingHorizontal: 18,
  },
  tutorialCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#fff8e9",
    borderWidth: 3,
    borderColor: "#dba020",
    borderRadius: 22,
    padding: 16,
    elevation: 12,
  },
  tutorialText: { color: INK, fontSize: 16, fontWeight: "800", lineHeight: 23 },
  claimT: { fontSize: 20, fontWeight: "900", color: INK },
  board: {
    flex: 1,
    backgroundColor: BOARD,
    borderWidth: 4,
    borderColor: "#cbdcf1",
    borderRadius: 44,
    padding: 14,
  },
  boardShort: { borderRadius: 28, padding: 9 },
  statRow: {
    height: 72,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  stat: {
    flex: 1,
    maxWidth: 320,
    minWidth: 82,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#d7dce7",
    alignItems: "center",
    justifyContent: "center",
  },
  statA: { fontSize: 14, fontWeight: "800", color: "#85888e" },
  statB: { fontSize: 21, fontWeight: "900", color: "#27384f" },
  statCompact: { flex: 0, height: 54, minWidth: 0, borderRadius: 18 },
  statTight: { height: 40, borderRadius: 13 },
  work: {
    height: 28,
    textAlign: "center",
    paddingTop: 10,
    fontSize: 17,
    fontWeight: "900",
    color: INK,
  },
  boostRow: { flexDirection: "row", gap: 8, marginVertical: 5 },
  boostRowShort: { marginVertical: 1 },
  boostCard: {
    flex: 1,
    minHeight: 46,
    borderRadius: 15,
    backgroundColor: "#ffcc62",
    padding: 8,
    borderWidth: 2,
    borderColor: "#d7881c",
  },
  feverCard: { backgroundColor: "#ef8fbd", borderColor: "#a541aa" },
  boostTitle: { color: INK, fontWeight: "900", fontSize: 12 },
  boostSub: { color: "#62412e", fontWeight: "800", fontSize: 10, marginTop: 2 },
  boostMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  boostUse: { marginLeft: "auto", minWidth: 32, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 9, backgroundColor: "#fff8e9", alignItems: "center", borderWidth: 1, borderColor: "#b77925" },
  boostUseText: { color: INK, fontSize: 10, fontWeight: "900" },
  play: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { width: 66, gap: 6 },
  leftShort: { gap: 3 },
  right: { width: 100, gap: 6 },
  rightShort: { gap: 3 },
  side: {
    height: 52,
    borderRadius: 20,
    backgroundColor: GOLD,
    borderWidth: 3,
    borderColor: "#9e1634",
    alignItems: "center",
    justifyContent: "center",
  },
  sideShort: { height: 39, borderRadius: 14, borderWidth: 2 },
  sideLocked: { opacity: 0.35 },
  sideE: { fontSize: 20 },
  sideT: { fontSize: 12, fontWeight: "900", color: INK },
  cookieZone: { flex: 1, alignItems: "center", justifyContent: "center" },
  cookieStage: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tapAura: { position: "absolute", inset: 0, borderRadius: 999, opacity: 0.78, overflow: "hidden" },
  auraFill: { flex: 1, borderRadius: 999 },
  sparkle: {
    position: "absolute",
    zIndex: 6,
    color: "#fff7af",
    fontSize: 23,
    textShadowColor: "#ff54d6",
    textShadowRadius: 8,
  },
  sparkleOne: { top: -4, left: "16%" },
  sparkleTwo: { top: "22%", right: -6 },
  sparkleThree: { bottom: 2, left: -4 },
  sparkleFour: { bottom: "18%", right: "8%" },
  ripple: {
    position: "absolute",
    width: "86%",
    height: "86%",
    borderRadius: 999,
    borderWidth: 5,
    borderColor: "#fff4ae",
  },
  bite: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BOARD,
    right: -2,
    top: 7,
    zIndex: 3,
  },
  crumb: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: "#a95718",
    zIndex: 4,
  },
  crumbOne: { top: 12, left: 5 },
  crumbTwo: { bottom: 15, right: 5, width: 7, height: 7 },
  crumbThree: { top: "50%", left: -3, width: 6, height: 6 },
  gain: {
    position: "absolute",
    top: 3,
    backgroundColor: "#fff8e9",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#dba020",
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: "#8a1832",
    fontWeight: "900",
    fontSize: 18,
    elevation: 8,
  },
  shadow: {
    position: "absolute",
    width: 290,
    height: 70,
    borderRadius: 60,
    backgroundColor: "rgba(82,58,43,.22)",
    transform: [{ translateY: 110 }],
  },
  cookie: {
    backgroundColor: "#bd6818",
    borderWidth: 9,
    borderColor: "#ba6113",
    padding: 10,
    elevation: 9,
  },
  cookieIn: {
    flex: 1,
    backgroundColor: "#e8ad5a",
    borderWidth: 10,
    borderColor: "#d0842e",
    overflow: "hidden",
  },
  chip: {
    position: "absolute",
    backgroundColor: "#67300b",
    borderWidth: 2,
    borderColor: "#8a4614",
  },
  tap: { marginTop: 12, color: INK, fontWeight: "900", fontSize: 16 },
  automationGain: {
    position: "absolute",
    top: 28,
    borderRadius: 15,
    backgroundColor: "#e8fff0",
    borderWidth: 2,
    borderColor: "#56a86a",
    paddingHorizontal: 9,
    paddingVertical: 3,
    color: "#23713b",
    fontSize: 13,
    fontWeight: "900",
  },
  automationVista: {
    minHeight: 58,
    marginTop: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "#d9edff",
    borderWidth: 2,
    borderColor: "#bad5ef",
  },
  automationVistaShort: { minHeight: 46, marginTop: 4, paddingVertical: 4 },
  automationVistaHead: { flexDirection: "row", alignItems: "center" },
  automationVistaTitle: { color: INK, fontSize: 12, fontWeight: "900" },
  automationVistaCps: {
    marginLeft: "auto",
    color: "#28764a",
    fontSize: 12,
    fontWeight: "900",
  },
  automationVistaItems: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 13,
  },
  automationVistaItem: { alignItems: "center", justifyContent: "flex-end" },
  automationVistaEmoji: { lineHeight: 31 },
  automationVistaCount: {
    marginTop: -7,
    color: INK,
    fontSize: 10,
    fontWeight: "900",
  },
  promo: {
    height: 82,
    borderRadius: 26,
    backgroundColor: "#fff8ea",
    borderWidth: 2,
    borderColor: "#e2cfab",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  promoShort: { height: 64, borderRadius: 20 },
  promoE: { fontSize: 29 },
  promoT: { fontSize: 17, fontWeight: "900", color: INK },
  promoS: { fontSize: 13, fontWeight: "700", color: "#746359" },
  arrow: { marginLeft: "auto", fontSize: 38, color: "#a40c35" },
  dock: {
    height: 118,
    backgroundColor: WINE,
    borderTopWidth: 5,
    borderColor: "#c79e6a",
    padding: 11,
    flexDirection: "row",
    gap: 10,
  },
  dockPhone: { height: 108, padding: 7, gap: 4 },
  dockShort: { height: 94, padding: 6, gap: 4 },
  achievementToast: {
    position: "absolute",
    bottom: 126,
    alignSelf: "center",
    backgroundColor: "#401923",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#ffca45",
    elevation: 20,
  },
  achievementText: { color: "#fff8e9", fontSize: 15, fontWeight: "900" },
  tab: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: "#9c7047",
    borderWidth: 2,
    borderColor: "#755033",
    alignItems: "center",
    justifyContent: "center",
  },
  tabPhone: { borderRadius: 13 },
  tabLocked: { opacity: 0.35 },
  active: { backgroundColor: GOLD },
  tabT: {
    fontSize: 13,
    lineHeight: 23,
    textAlign: "center",
    fontWeight: "900",
    color: "white",
  },
  tabTPhone: { fontSize: 9, lineHeight: 17 },
  activeT: { color: INK },
});
