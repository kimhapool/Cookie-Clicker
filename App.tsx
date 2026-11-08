import { s0 } from "./App.styles";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { SettingsModal } from "./src/components/SettingsModal";
import { HomePage } from "./src/components/HomePage";
import {
  Animated,
  AppState,
  Image,
  Modal,
  Pressable,
  Platform,
  ActivityIndicator,
  StatusBar as NativeStatusBar,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getCps, isTutorialReady, loadGame, useGameStore } from "./src/store/useGameStore";
import { OVENS } from "./src/data/ovens";
import { allocateProduction, type ProductionEvent } from "./src/utils/production";
import { MISSIONS, getMissionProgress } from "./src/data/missions";
import { STANDARD_ACHIEVEMENTS, SECRET_ACHIEVEMENTS } from "./src/data/achievements";
import { accountText, labels, mailDisplay, missionDisplay, modalText, ovenDisplayName, pageText, progressText } from "./src/i18n/translations";
import { compactNumber, productionNumber } from "./src/utils/numbers";
import {
  AchievementsPage,
  AutomationPage,
  DrawPage,
  ExchangePage,
  InventoryPage,
  UpgradesPage,
} from "./src/components/GamePages";

export default function App() {
  if (__DEV__ && Platform.OS === 'web' && typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('preview') === 'draw') {
    const { DrawPreview } = require('./src/dev/DrawPreview');
    return <DrawPreview />;
  }
  if (__DEV__ && Platform.OS === 'web' && typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('preview') === 'automation') {
    const { AutomationPreview } = require('./src/dev/AutomationPreview');
    return <AutomationPreview />;
  }
  return <RestoreGame />;
}

function RestoreGame() {
  // Fast Refresh can replace the store while preserving React component state.
  // Readiness belongs to this exact store instance, not a boolean.
  const [loadedStore, setLoadedStore] = useState<typeof useGameStore | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    loadGame().then(() => {
      if (!cancelled) setLoadedStore(() => useGameStore);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [useGameStore, retry]);
  return (
    <SafeAreaProvider>
      {loadedStore === useGameStore ? <GameApp /> : (
        <SafeAreaView style={[s0.safe, s0.loading]}>
          {failed ? <>
            <Text style={s0.settingLabel}>저장 데이터를 불러오지 못했습니다.</Text>
            <Text style={s0.mailSub}>기존 기록은 유지됩니다. 다시 불러올 수 있습니다.</Text>
            <Pressable accessibilityRole="button" onPress={() => setRetry(value => value + 1)} style={s0.closeButton}>
              <Text style={s0.closeText}>다시 불러오기</Text>
            </Pressable>
          </> : <ActivityIndicator size="large" color="#850019" />}
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

function GameApp() {
  const insets = useSafeAreaInsets();
  const modalInsets = { paddingTop: Math.max(16, insets.top), paddingBottom: Math.max(16, insets.bottom) };
  const [homeOdds, setHomeOdds] = useState(false);
  const [tab, setTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rebirthOpen, setRebirthOpen] = useState(false);
  const [panel, setPanel] = useState<"mail" | "missions" | null>(null);
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [productionEvent, setProductionEvent] = useState<ProductionEvent | null>(null);
  const [clock, setClock] = useState(Date.now());
  const appState = useRef(AppState.currentState);
  const shownAchievements = useRef(new Set(useGameStore.getState().achievements));
  const resetFlash = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const phone = width < 500;
  const short = height < 820;
  const game = useGameStore();
  const text = labels[game.settings.language ?? "ko"];
  const modal = modalText[game.settings.language ?? "ko"];
  const account = accountText[game.settings.language ?? "ko"];
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
  const tutorialReady = isTutorialReady(game);
  const canOpenTab = (index: number) => {
    if (game.tutorialComplete || index === 0) return true;
    if (game.tutorialStep === 1) return index === 3;
    if (game.tutorialStep === 2) return index === 1 || index === 3;
    return game.tutorialStep >= 3;
  };
  useEffect(() => {
    // Game audio respects the device's silent setting and stays in the foreground.
    void setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false,
      allowsRecording: false, interruptionMode: 'mixWithOthers' }).catch(() => undefined);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    game.ensureAllOvens();
    game.checkOffline();
    let lastTick = Date.now();
    const settle = () => {
      const now = Date.now();
      const gain = game.tick((now - lastTick) / 1000);
      lastTick = now;
      if (gain) {
        const { buildings: counts, buildingUpgrades } = useGameStore.getState();
        setProductionEvent(previous => ({ sequence: (previous?.sequence ?? 0) + 1,
          gains: allocateProduction(gain, counts, buildingUpgrades),
        }));
      }
    };
    const timer = setInterval(() => {
      if (appState.current === "active") settle();
    }, 1000);
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (appState.current === "active" && nextState !== "active") settle();
      if (appState.current !== "active" && nextState === "active") {
        game.checkOffline();
        lastTick = Date.now();
      }
      appState.current = nextState;
    });
    return () => { subscription.remove(); clearInterval(timer); };
  }, [game.tick, game.checkOffline, game.ensureAllOvens]);
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
    const fresh = game.achievements.filter(id => !shownAchievements.current.has(id));
    if (!fresh.length) return;
    fresh.forEach(id => shownAchievements.current.add(id));
    const words = progressText[game.settings.language];
    const names = fresh.map(id => {
      const normal = STANDARD_ACHIEVEMENTS.findIndex(key => key === id);
      const secret = SECRET_ACHIEVEMENTS.findIndex(key => key === id);
      return normal >= 0 ? words.achievements[normal][0]
        : secret >= 0 ? words.secretAchievements[secret][0] : null;
    }).filter(Boolean);
    if (names.length) setAchievementToast(`🏆 ${names.join(" · ")}`);
  }, [game.achievements, game.settings.language]);
  useEffect(() => {
    if (!achievementToast) return;
    const timer = setTimeout(() => setAchievementToast(null), 2600);
    return () => clearTimeout(timer);
  }, [achievementToast]);
  const tapCookie = () => {
    const gain = game.click();
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
      void player.seekTo(0).then(() => player.play()).catch(() => undefined);
    }
    return gain;
  };
  const fullTabs = [
    `🏠\n${text.home}`,
    `🎰\n${text.draw}`,
    `🎒\n${text.inventory}`,
    `🏭\n${text.automation}`,
    `💱\n${text.exchange}`,
    `⚡\n${text.upgrades}`,
    `🏆\n${text.achievements}`,
  ];
  const compactTabLabels: Record<string, string[]> = {
    ko: ["홈", "뽑기", "가방", "자동", "교환", "강화", "업적"],
    en: ["Home", "Draw", "Bag", "Auto", "Exch.", "Upg.", "Ach."],
    ja: ["ホーム", "ガチャ", "持ち物", "自動", "交換", "強化", "実績"],
    zh: ["主页", "抽取", "背包", "自动", "兑换", "强化", "成就"],
    ar: ["الرئيسية", "سحب", "حقيبة", "تلقائي", "تبادل", "ترقية", "إنجاز"],
    de: ["Start", "Ziehen", "Tasche", "Auto", "Tausch", "Upgrade", "Erfolg"],
    ru: ["Дом", "Призыв", "Сумка", "Авто", "Обмен", "Улучш.", "Успех"],
  };
  const tabIcons = ["🏠", "🎰", "🎒", "🏭", "💱", "⚡", "🏆"];
  const tabs = phone
    ? compactTabLabels[game.settings.language ?? "ko"].map((label, index) => `${tabIcons[index]}\n${label}`)
    : fullTabs;
  return (
    <SafeAreaView style={[s0.safe, { direction: game.settings.language === "ar" ? "rtl" : "ltr" }]}>
      {Platform.OS === 'android' && Number(Platform.Version) < 35
        ? <NativeStatusBar barStyle="dark-content" backgroundColor="#f8eed7" translucent={false} />
        : <StatusBar style="dark" />}
      <View style={[s0.head, short && s0.headShort, phone && s0.headPhone]}>
        <Pressable accessibilityRole="button"
          accessibilityLabel={modal.profile}
          testID="profile-button"
          onPress={() => setProfileOpen(true)}
          style={[s0.avatar, phone && s0.avatarPhone]}
        >
          <Image source={require("./assets/cookie-cutout.png")} style={{ width: 46, height: 46 }} resizeMode="contain" />
        </Pressable>
        <View style={[s0.resources, phone && s0.resourcesPhone]}>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            🍪 {compactNumber(n, game.settings.language ?? "ko")}
          </Text>
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            🍫 {compactNumber(game.chocoChips, game.settings.language ?? "ko")}
          </Text>
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            💎 {compactNumber(game.premiumChips, game.settings.language ?? "ko")}
          </Text>
        </View>
        <View style={[s0.res, s0.cps, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            ⚡ CPS {productionNumber(cps, game.settings.language ?? "ko")}
          </Text>
        </View>
        </View>
        <Pressable accessibilityRole="button"
          onPress={() => {
            setSettingsOpen(true);
          }}
          accessibilityLabel={modal.settings}
          testID="settings-button"
          style={[s0.setting, phone && s0.settingPhone]}
        >
          <Text>⚙️</Text>
        </Pressable>
      </View>
      {!game.tutorialComplete && (
        <View style={s0.tutorialCard}>
          <ScrollView style={s0.tutorialCopy}>
            <Text style={s0.tutorialTitle}>🍪 {modal.bakeryGuide} · {game.tutorialStep + 1}/5</Text>
            <Text style={s0.tutorialText}>
              {modal.tutorialSteps[Math.min(game.tutorialStep, 4)]}
            </Text>
          </ScrollView>
          <Pressable accessibilityRole="button" disabled={!tutorialReady} onPress={() => game.advanceTutorial()}
            style={[s0.tutorialNext, !tutorialReady && s0.claimDisabled]}>
            <Text style={s0.closeText}>
              {tutorialReady ? (game.tutorialStep >= 4 ? modal.complete : modal.next)
                : game.tutorialStep === 0 ? modal.tapCookie
                : game.tutorialStep === 1 ? `${totalBuildings}/15` : modal.drawFirst}
            </Text>
          </Pressable>
        </View>
      )}
      <HomePage active={tab === 0} clock={clock} productionEvent={productionEvent} canDraw={canOpenTab(1)}
        onTap={tapCookie} onPanel={setPanel} onRebirth={() => setRebirthOpen(true)}
        onDraw={odds => { setHomeOdds(odds); setTab(1); }} />
      {tab === 1 && <DrawPage initialOdds={homeOdds} />}
      {tab === 2 && <InventoryPage />}
      {tab === 3 && <AutomationPage />}
      {tab === 4 && <ExchangePage />}
      {tab === 5 && <UpgradesPage />}
      {tab === 6 && <AchievementsPage />}
      <View style={[s0.dock, phone && s0.dockPhone, short && s0.dockShort]}>
        {tabs.map((t, i) => (
          <Pressable accessibilityRole="button"
            key={t}
            accessibilityLabel={fullTabs[i].replace("\n", " ")}
            accessibilityState={{ selected: tab === i, disabled: !canOpenTab(i) }}
            aria-current={tab === i ? 'page' : undefined}
            testID={`navigation-${i}`}
            disabled={!canOpenTab(i)}
            onPress={() => { setHomeOdds(false); setTab(i); }}
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
      <Text style={s0.credit}>Powered By Kixha</Text>
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
        <View style={[s0.modalShade, modalInsets, { direction: game.settings.language === "ar" ? "rtl" : "ltr" }]}>
          <View style={[s0.modalCard, s0.panelCard]}>
            <Text style={s0.modalTitle}>
              {panel === "mail" ? `📬 ${modal.mailbox}` : `📋 ${modal.todayMissions}`}
            </Text>
            <ScrollView style={s0.panelScroll} contentContainerStyle={s0.panelContent}>
            {panel === "mail"
              ? [
                  ["tutorial", "안내 완료 선물", "초코칩 10개"],
                  ["welcome", "베이커리 개업 선물", "쿠키 500개"],
                  ["chips", "초코칩 꾸러미", "쿠키 3,000개"],
                  ["moon", "달빛 배송", "쿠키 2,500개"],
                ].map(([id, title, reward]) => {
                  const mailCopy = mailDisplay(id, title, reward, game.settings.language ?? "ko");
                  const claimed = game.claimedMail.includes(id);
                  const unavailable =
                    id === "tutorial" && !game.tutorialComplete;
                  return (
                    <View key={id} style={s0.mailRow}>
                      <View style={s0.rowCopy}>
                        <Text style={s0.mailTitle}>{mailCopy.title}</Text>
                        <Text style={s0.mailSub}>{mailCopy.reward}</Text>
                      </View>
                      <Pressable accessibilityRole="button"
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
                  const missionId = mission.id;
                  const missionCopy = missionDisplay(
                    mission.id,
                    mission.title,
                    mission.reward,
                    game.settings.language ?? "ko",
                  );
                  const value = getMissionProgress(missionId, game);
                  const goal = mission.target;
                  const done = value >= goal;
                  const claimed = game.claimedMissions.includes(missionId);
                  return (
                    <View key={missionId} style={s0.mailRow}>
                      <View style={s0.rowCopy}>
                        <Text style={s0.mailTitle}>
                          {done ? "✅ " : "🎯 "}
                          {missionCopy.title}
                        </Text>
                        <Text style={s0.mailSub}>
                          {value}/{goal} · {modal.reward} {missionCopy.reward}
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
                      <Pressable accessibilityRole="button"
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
            </ScrollView>
            <Pressable accessibilityRole="button" onPress={() => setPanel(null)} style={s0.closeButton}>
              <Text style={s0.closeText}>{modal.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} onReset={() => {
        setSettingsOpen(false);
        setTab(0);
        resetFlash.setValue(0);
        Animated.timing(resetFlash, { toValue: 0.92, duration: 120, useNativeDriver: true }).start(() => {
          shownAchievements.current = new Set();
          game.resetGame();
          Animated.timing(resetFlash, { toValue: 0, duration: 520, useNativeDriver: true }).start();
        });
      }} />
      <Modal
        transparent
        animationType="fade"
        visible={profileOpen}
        onRequestClose={() => setProfileOpen(false)}
      >
        <View style={[s0.modalShade, modalInsets, { direction: game.settings.language === "ar" ? "rtl" : "ltr" }]}>
          <View style={s0.modalCard}>
            <Text style={s0.modalTitle}>🍪 {modal.profile}</Text>
            <Text style={s0.settingLabel}>
              {account.totalCookies} {game.totalCookies.toLocaleString(game.settings.language)}
            </Text>
            <Text style={s0.settingLabel}>
              {account.totalTaps} {game.taps.toLocaleString(game.settings.language)}
            </Text>
            <Text style={s0.settingLabel}>
              {account.totalDraws} {game.totalDraws.toLocaleString(game.settings.language)}
            </Text>
            <Text style={s0.settingLabel}>
              {account.chips} {game.chocoChips.toLocaleString(game.settings.language)} · {account.premiumChips} {game.premiumChips.toLocaleString(game.settings.language)}
            </Text>
            <Text style={s0.settingLabel}>{account.rebirths} {game.rebirths}</Text>
            <Text style={s0.settingLabel}>
              {modal.equippedOven}{" "}
              {(() => { const oven = OVENS.find((item) => item.id === game.equippedOvenId); return oven ? ovenDisplayName(oven.id, oven.name, game.settings.language ?? "ko") : modal.none; })()}
            </Text>
            <Pressable accessibilityRole="button"
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
        <View style={[s0.modalShade, modalInsets, { direction: game.settings.language === "ar" ? "rtl" : "ltr" }]}>
          <View style={s0.modalCard}>
            <Text style={s0.modalTitle}>😇 {pageText[game.settings.language].rebirth}</Text>
            <Text style={s0.settingLabel}>{modal.currentRebirth} {game.rebirths}</Text>
            <Text style={s0.settingLabel}>
              {account.multiplier} x{Math.pow(1.5, game.rebirths).toFixed(2)} → {account.nextMultiplier} x
              {Math.pow(1.5, game.rebirths + 1).toFixed(2)}
            </Text>
            <Text style={s0.mailSub}>
              {account.rebirthKeeps}
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
              {game.cookies.toLocaleString(game.settings.language)} /{" "}
              {(100000 * Math.pow(5, game.rebirths)).toLocaleString(game.settings.language)}
            </Text>
            <Pressable accessibilityRole="button"
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
