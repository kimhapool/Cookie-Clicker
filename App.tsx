import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import {
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
import { useEffect, useState } from "react";
import { getCps, useGameStore } from "./src/store/useGameStore";
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
  const { width } = useWindowDimensions();
  const s = small ? 54 : Math.min(190, Math.max(100, width * 0.285));
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
}: {
  a: string;
  b: string;
  compact?: boolean;
}) {
  return (
    <View style={[s0.stat, compact && s0.statCompact]}>
      <Text style={s0.statA}>{a}</Text>
      <Text style={s0.statB}>{b}</Text>
    </View>
  );
}
function Side({ e, t }: { e: string; t: string }) {
  return (
    <Pressable style={s0.side}>
      <Text style={s0.sideE}>{e}</Text>
      <Text style={s0.sideT}>{t}</Text>
    </Pressable>
  );
}
export default function App() {
  const [tab, setTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { width } = useWindowDimensions();
  const phone = width < 500;
  const game = useGameStore();
  const n = game.cookies;
  const cps = getCps(game);
  useEffect(() => {
    const timer = setInterval(() => game.tick(1), 1000);
    return () => clearInterval(timer);
  }, [game.tick]);
  useEffect(() => {
    game.checkOffline();
  }, [game.checkOffline]);
  const tapCookie = () => {
    game.click();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => undefined,
    );
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
      <View style={[s0.head, phone && s0.headPhone]}>
        <View style={[s0.avatar, phone && s0.avatarPhone]}>
          <Cookie small />
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            🍪 {n.toLocaleString("ko-KR")}
          </Text>
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            🎟️ 148
          </Text>
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>
            💎 0
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
      <View style={[s0.body, phone && s0.bodyPhone, tab !== 0 && s0.hidden]}>
        <View style={s0.off}>
          <View>
            <Text style={s0.offTitle}>오프라인 보상</Text>
            <Text style={s0.offSub}>
              {game.pendingOffline
                ? `돌아온 보상 · +${game.pendingOffline.toLocaleString("ko-KR")}`
                : "오프라인 보상을 준비 중입니다"}
            </Text>
          </View>
          <Pressable
            disabled={!game.pendingOffline}
            onPress={() => game.claimOffline()}
            style={[s0.claim, !game.pendingOffline && s0.claimDisabled]}
          >
            <Text style={s0.claimT}>받기</Text>
          </Pressable>
        </View>
        <View style={s0.board}>
          <View style={s0.statRow}>
            <Stat
              a="클릭"
              b={`+${Math.max(1, Math.floor((game.ovens.find((o) => o.ovenId === game.equippedOvenId)?.level || 1) * Math.pow(1.5, game.rebirths)))}`}
            />
            <Stat a="환생" b={`x${Math.pow(1.5, game.rebirths).toFixed(2)}`} />
          </View>
          <Text style={s0.work}>쿠키 작업대</Text>
          <View style={s0.play}>
            <View style={s0.left}>
              <Side e="📬" t="우편" />
              <Side e="📋" t="미션" />
              <Pressable onPress={() => setTab(5)} style={s0.side}>
                <Text style={s0.sideE}>😇</Text>
                <Text style={s0.sideT}>환생</Text>
              </Pressable>
              <Pressable onPress={() => setTab(1)} style={s0.side}>
                <Text style={s0.sideE}>🎲</Text>
                <Text style={s0.sideT}>확률</Text>
              </Pressable>
            </View>
            <View style={s0.cookieZone}>
              <View style={s0.shadow} />
              <Cookie onPress={tapCookie} />
              <Text style={s0.tap}>쿠키를 눌러 굽기</Text>
            </View>
            <View style={s0.right}>
              <Stat
                compact
                a="보유 오븐"
                b={`${game.ovens.filter((o) => o.level > 0).length}종`}
              />
              <Stat compact a="초코칩" b={`${game.chocoChips}개`} />
              <Stat compact a="버프" b="대기" />
            </View>
          </View>
          <Pressable onPress={() => setTab(1)} style={s0.promo}>
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
      <View style={[s0.dock, phone && s0.dockPhone]}>
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
              <Text style={s0.settingLabel}>언어</Text>
              <Pressable
                onPress={() =>
                  game.updateSettings({
                    language: game.settings.language === "ko" ? "en" : "ko",
                  })
                }
                style={s0.languageButton}
              >
                <Text style={s0.languageText}>
                  {game.settings.language === "ko" ? "한국어" : "English"}
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => setSettingsOpen(false)}
              style={s0.closeButton}
            >
              <Text style={s0.closeText}>닫기</Text>
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
  claimT: { fontSize: 20, fontWeight: "900", color: INK },
  board: {
    flex: 1,
    backgroundColor: BOARD,
    borderWidth: 4,
    borderColor: "#cbdcf1",
    borderRadius: 44,
    padding: 14,
  },
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
  work: {
    height: 28,
    textAlign: "center",
    paddingTop: 10,
    fontSize: 17,
    fontWeight: "900",
    color: INK,
  },
  play: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { width: 66, gap: 6 },
  right: { width: 100, gap: 6 },
  side: {
    height: 52,
    borderRadius: 20,
    backgroundColor: GOLD,
    borderWidth: 3,
    borderColor: "#9e1634",
    alignItems: "center",
    justifyContent: "center",
  },
  sideE: { fontSize: 20 },
  sideT: { fontSize: 12, fontWeight: "900", color: INK },
  cookieZone: { flex: 1, alignItems: "center", justifyContent: "center" },
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
