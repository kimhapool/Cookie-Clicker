import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import {
  Animated,
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
import {
  AchievementsPage,
  AutomationPage,
  DrawPage,
  ExchangePage,
  InventoryPage,
  UpgradesPage,
} from "./src/components/GamePages";

const WINE = "#850019",
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
    : Math.min(190, Math.max(100, width * 0.285), Math.max(100, height * 0.19));
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
}: {
  e: string;
  t: string;
  onPress?: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[s0.side, compact && s0.sideShort]}>
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
  const [tapStage, setTapStage] = useState(0);
  const tapTimes = useRef<number[]>([]);
  const ripple = useRef(new Animated.Value(0)).current;
  const bite = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const phone = width < 500;
  const short = height < 820;
  const cookieSize = Math.min(
    190,
    Math.max(100, width * 0.285),
    Math.max(100, height * 0.19),
  );
  const game = useGameStore();
  const popPlayer = useAudioPlayer(require("./assets/audio/5D.wav"));
  const drumPlayer = useAudioPlayer(require("./assets/audio/MV.wav"));
  const bitePlayer = useAudioPlayer(require("./assets/audio/om.wav"));
  const crumblePlayer = useAudioPlayer(require("./assets/audio/wb.wav"));
  const musicPlayer = useAudioPlayer(require("./assets/audio/eM.wav"));
  const n = game.cookies;
  const cps = getCps(game);
  useEffect(() => {
    const timer = setInterval(() => game.tick(1), 1000);
    return () => clearInterval(timer);
  }, [game.tick]);
  useEffect(() => {
    game.checkOffline();
  }, [game.checkOffline]);
  useEffect(() => {
    game.ensureAllOvens();
  }, [game.ensureAllOvens]);
  useEffect(() => {
    musicPlayer.loop = true;
    musicPlayer.volume = 0.16;
    if (game.settings.music) musicPlayer.play();
    else musicPlayer.pause();
  }, [game.settings.music, musicPlayer]);
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
    "🏠\n홈",
    "🎰\n뽑기",
    "🎒\n인벤토리",
    "🏭\n자동화",
    "💱\n교환",
    "⚡\n강화",
    "🏆\n도전과제",
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
            🍪 {n.toLocaleString("ko-KR")}
          </Text>
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            🍫 {game.chocoChips.toLocaleString("ko-KR")}
          </Text>
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            💎 {game.premiumChips.toLocaleString("ko-KR")}
          </Text>
        </View>
        <View style={[s0.res, s0.cps, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            ⚡ CPS {Math.floor(cps).toLocaleString("ko-KR")}
          </Text>
        </View>
        <Pressable
          onPress={() => setSettingsOpen(true)}
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
            <Text style={s0.offTitle}>오프라인 보상</Text>
            <Text style={s0.offSub}>
              {game.pendingOffline
                ? `돌아온 보상 · +${game.pendingOffline.toLocaleString("ko-KR")}`
                : "오프라인 보상을 준비 중입니다"}
            </Text>
          </View>
          {BUILDINGS.some(
            (building) => (game.buildings[building.id] || 0) > 0,
          ) && (
            <View style={s0.automationStrip}>
              {BUILDINGS.filter(
                (building) => (game.buildings[building.id] || 0) > 0,
              ).map((building) => (
                <View key={building.id} style={s0.automationIcon}>
                  <Text style={s0.automationEmoji}>{building.emoji}</Text>
                  <Text style={s0.automationCount}>
                    ×{game.buildings[building.id]}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <Pressable
            disabled={!game.pendingOffline}
            onPress={() => game.claimOffline()}
            style={[s0.claim, !game.pendingOffline && s0.claimDisabled]}
          >
            <Text style={s0.claimT}>받기</Text>
          </Pressable>
        </View>
        <View style={[s0.board, short && s0.boardShort]}>
          <View style={s0.statRow}>
            <Stat a="클릭" b={`+${getClickGain(game)}`} />
            <Stat a="환생" b={`x${Math.pow(1.5, game.rebirths).toFixed(2)}`} />
          </View>
          <Text style={s0.work}>쿠키 작업대</Text>
          <View style={[s0.boostRow, short && s0.boostRowShort]}>
            <Pressable
              disabled={game.boostUntil > Date.now() || game.cookies < 5000}
              onPress={() => game.activateBoost(2)}
              style={[
                s0.boostCard,
                game.boostUntil > Date.now() && s0.claimDisabled,
              ]}
            >
              <Text style={s0.boostTitle}>🔥 더블 포션</Text>
              <Text style={s0.boostSub}>
                {game.boostUntil > Date.now() ? "적용 중" : "2배 · 5,000 쿠키"}
              </Text>
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
              <Text style={s0.boostTitle}>🌈 피버 타임</Text>
              <Text style={s0.boostSub}>
                {game.boostUntil > Date.now() ? "적용 중" : "4배 · 25,000 쿠키"}
              </Text>
            </Pressable>
          </View>
          <View style={s0.play}>
            <View style={[s0.left, short && s0.leftShort]}>
              <Side
                e="📬"
                t="우편"
                compact={short}
                onPress={() => setPanel("mail")}
              />
              <Side
                e="📋"
                t="미션"
                compact={short}
                onPress={() => setPanel("missions")}
              />
              <Pressable
                onPress={() => setRebirthOpen(true)}
                style={[s0.side, short && s0.sideShort]}
              >
                <Text style={s0.sideE}>😇</Text>
                <Text style={s0.sideT}>환생</Text>
              </Pressable>
              <Pressable
                onPress={() => setTab(1)}
                style={[s0.side, short && s0.sideShort]}
              >
                <Text style={s0.sideE}>🎲</Text>
                <Text style={s0.sideT}>확률</Text>
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
                  <LinearGradient
                    colors={
                      tapStage === 3
                        ? ["#ff4dcc", "#ffca45", "#35b9ff", "#9e62ff"]
                        : tapStage === 2
                          ? ["#ff9b46", "#d34b71"]
                          : ["#ffcf52", "#ff8a4a"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s0.tapAura}
                  />
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
              <Text style={s0.tap}>쿠키를 눌러 굽기</Text>
            </View>
            <View style={[s0.right, short && s0.rightShort]}>
              <Stat
                compact
                tight={short}
                a="보유 오븐"
                b={`${game.ovens.filter((o) => o.level > 0).length}종`}
              />
              <Stat
                compact
                tight={short}
                a="초코칩"
                b={`${game.chocoChips}개`}
              />
              <Stat
                compact
                tight={short}
                a="버프"
                b={game.boostUntil > Date.now() ? "2배 적용" : "대기"}
              />
            </View>
          </View>
          <Pressable
            onPress={() => setTab(1)}
            style={[s0.promo, short && s0.promoShort]}
          >
            <Text style={s0.promoE}>🎁</Text>
            <View>
              <Text style={s0.promoT}>오늘의 오븐</Text>
              <Text style={s0.promoS}>오늘의 오븐을 확인하세요</Text>
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
            onPress={() => setTab(i)}
            style={[s0.tab, phone && s0.tabPhone, tab === i && s0.active]}
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
      <Modal
        transparent
        animationType="slide"
        visible={!!panel}
        onRequestClose={() => setPanel(null)}
      >
        <View style={s0.modalShade}>
          <View style={s0.modalCard}>
            <Text style={s0.modalTitle}>
              {panel === "mail" ? "📬 우편함" : "📋 오늘의 미션"}
            </Text>
            {panel === "mail"
              ? [
                  ["tutorial", "안내 완료 선물", "초코칩 10개"],
                  ["welcome", "베이커리 개업 선물", "쿠키 500개"],
                  ["chips", "초코칩 꾸러미", "쿠키 3,000개"],
                  ["moon", "달빛 배송", "쿠키 2,500개"],
                ].map(([id, title, reward]) => {
                  const claimed = game.claimedMail.includes(id);
                  return (
                    <View key={id} style={s0.mailRow}>
                      <View>
                        <Text style={s0.mailTitle}>{title}</Text>
                        <Text style={s0.mailSub}>{reward}</Text>
                      </View>
                      <Pressable
                        disabled={claimed}
                        onPress={() => game.claimMail(id)}
                        style={[s0.mailButton, claimed && s0.claimDisabled]}
                      >
                        <Text style={s0.languageText}>
                          {claimed ? "받음" : "받기"}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })
              : [
                  ["tap", "쿠키 100회 굽기", game.taps, 100, "쿠키 500개"],
                  [
                    "chip",
                    "초코칩 20개 모으기",
                    game.chocoChips,
                    20,
                    "쿠키 2,000개",
                  ],
                  [
                    "building",
                    "자동화 오븐 1개 구매",
                    Object.values(game.buildings).reduce((a, b) => a + b, 0),
                    1,
                    "초코칩 2개",
                  ],
                ].map(([id, title, current, target, reward]) => {
                  const missionId = String(id);
                  const value = Number(current);
                  const goal = Number(target);
                  const done = value >= goal;
                  const claimed = game.claimedMissions.includes(missionId);
                  return (
                    <View key={String(title)} style={s0.mailRow}>
                      <View>
                        <Text style={s0.mailTitle}>
                          {done ? "✅ " : "🎯 "}
                          {title}
                        </Text>
                        <Text style={s0.mailSub}>
                          {value}/{goal} · 보상 {reward}
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
                        onPress={() => game.claimMission(missionId)}
                        style={[
                          s0.mailButton,
                          (!done || claimed) && s0.claimDisabled,
                        ]}
                      >
                        <Text style={s0.languageText}>
                          {claimed ? "받음" : "받기"}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
            <Pressable onPress={() => setPanel(null)} style={s0.closeButton}>
              <Text style={s0.closeText}>닫기</Text>
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
            <Text style={s0.modalTitle}>⚙️ 설정</Text>
            <View style={s0.settingRow}>
              <Text style={s0.settingLabel}>효과음</Text>
              <Switch
                value={game.settings.sound}
                onValueChange={(sound) => game.updateSettings({ sound })}
              />
            </View>
            <View style={s0.settingRow}>
              <Text style={s0.settingLabel}>배경 음악</Text>
              <Switch
                value={game.settings.music}
                onValueChange={(music) => game.updateSettings({ music })}
              />
            </View>
            <View style={s0.settingRow}>
              <Text style={s0.settingLabel}>진동</Text>
              <Switch
                value={game.settings.vibration}
                onValueChange={(vibration) =>
                  game.updateSettings({ vibration })
                }
              />
            </View>
            <View style={s0.settingRow}>
              <Text style={s0.settingLabel}>탭 효과음</Text>
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
              <Text style={s0.settingLabel}>언어</Text>
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
                {
                  [
                    "",
                    "데이터를 삭제하시겠습니까?",
                    "정말로요?",
                    "진짜 정말로 리셋하시겠습니까?",
                    "정말로 지금까지 한 것을 삭제하시겠습니까? 노력한 기록입니다.",
                    "정말 진짜로 삭제하시겠습니까? 해금한 도전과제와 노력이 사라지며 되돌릴 수 없습니다. 마지막 경고입니다.",
                  ][resetStage]
                }
              </Text>
            )}
            <Pressable
              onPress={() => {
                if (resetStage >= 5) {
                  game.resetGame();
                  setResetStage(0);
                  setSettingsOpen(false);
                } else setResetStage(resetStage + 1);
              }}
              style={s0.resetButton}
            >
              <Text style={s0.closeText}>
                {resetStage >= 5 ? "삭제 완료" : "데이터 초기화"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSettingsOpen(false)}
              style={s0.closeButton}
            >
              <Text style={s0.closeText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal transparent animationType="fade" visible={!game.tutorialComplete}>
        <View style={s0.tutorialShade}>
          <View style={s0.tutorialCard}>
            <Text style={s0.modalTitle}>🍪 베이커리 안내</Text>
            <Text style={s0.tutorialText}>
              {
                [
                  "가운데 쿠키를 눌러 첫 쿠키를 구워보세요.",
                  "쿠키가 쌓이면 자동화 오븐을 구매하실 수 있습니다.",
                  "자동화 오븐을 15개까지 늘려보세요.",
                  "초코칩으로 오븐 뽑기에 도전해 보세요.",
                  "안내를 완료했습니다. 우편함에서 초코칩 10개를 받아가세요.",
                ][Math.min(game.tutorialStep, 4)]
              }
            </Text>
            <Pressable
              onPress={() => game.advanceTutorial()}
              style={s0.closeButton}
            >
              <Text style={s0.closeText}>
                {game.tutorialStep >= 4 ? "완료" : "다음"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        animationType="fade"
        visible={profileOpen}
        onRequestClose={() => setProfileOpen(false)}
      >
        <View style={s0.modalShade}>
          <View style={s0.modalCard}>
            <Text style={s0.modalTitle}>🍪 베이커 프로필</Text>
            <Text style={s0.settingLabel}>
              누적 쿠키 {game.totalCookies.toLocaleString("ko-KR")}
            </Text>
            <Text style={s0.settingLabel}>
              누적 터치 {game.taps.toLocaleString("ko-KR")}
            </Text>
            <Text style={s0.settingLabel}>
              누적 뽑기 {game.totalDraws.toLocaleString("ko-KR")}
            </Text>
            <Text style={s0.settingLabel}>환생 {game.rebirths}회</Text>
            <Text style={s0.settingLabel}>
              장착 오븐{" "}
              {OVENS.find((oven) => oven.id === game.equippedOvenId)?.name ??
                "없음"}
            </Text>
            <Pressable
              onPress={() => setProfileOpen(false)}
              style={s0.closeButton}
            >
              <Text style={s0.closeText}>닫기</Text>
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
            <Text style={s0.modalTitle}>😇 환생</Text>
            <Text style={s0.settingLabel}>현재 환생 {game.rebirths}회</Text>
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
              <Text style={s0.closeText}>환생하기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const s0 = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER },
  head: {
    height: 115,
    backgroundColor: WINE,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 5,
    borderColor: "#d69d2b",
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
    borderColor: "#b10b39",
  },
  avatarPhone: { width: 54, height: 54, borderRadius: 27 },
  res: {
    height: 60,
    minWidth: 95,
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#fff3d5",
    borderWidth: 2,
    borderColor: "#b46a5f",
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
    borderColor: "#b46a5f",
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
  sideE: { fontSize: 20 },
  sideT: { fontSize: 12, fontWeight: "900", color: INK },
  cookieZone: { flex: 1, alignItems: "center", justifyContent: "center" },
  cookieStage: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tapAura: { position: "absolute", inset: 0, borderRadius: 999, opacity: 0.78 },
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
  automationStrip: {
    minHeight: 52,
    marginHorizontal: 8,
    marginBottom: 7,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#d8edff",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  automationIcon: { flexDirection: "row", alignItems: "center" },
  automationEmoji: { fontSize: 30 },
  automationCount: {
    marginLeft: -5,
    marginTop: 20,
    color: INK,
    fontSize: 11,
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
    borderColor: "#d69d2b",
    padding: 11,
    flexDirection: "row",
    gap: 10,
  },
  dockPhone: { height: 108, padding: 7, gap: 4 },
  dockShort: { height: 94, padding: 6, gap: 4 },
  tab: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: "#b00838",
    borderWidth: 2,
    borderColor: "#760019",
    alignItems: "center",
    justifyContent: "center",
  },
  tabPhone: { borderRadius: 13 },
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
