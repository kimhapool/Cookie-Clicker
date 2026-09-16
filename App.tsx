import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { getCps, useGameStore } from "./src/store/useGameStore";

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
function Stat({ a, b, compact = false }: { a: string; b: string; compact?: boolean }) {
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
  const { width } = useWindowDimensions();
  const phone = width < 500;
  const game = useGameStore();
  const n = game.cookies;
  const cps = getCps(game);
  useEffect(() => {
    const timer = setInterval(() => game.tick(1), 1000);
    return () => clearInterval(timer);
  }, [game.tick]);
  const tapCookie = () => {
    game.click();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
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
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>🍪 {n.toLocaleString("ko-KR")}</Text>
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>🎟️ 148</Text>
        </View>
        <View style={[s0.res, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>💎 0</Text>
        </View>
        <View style={[s0.res, s0.cps, phone && s0.resPhone]}>
          <Text numberOfLines={1} style={[s0.resT, phone && s0.resTPhone]}>⚡ CPS {Math.floor(cps).toLocaleString("ko-KR")}</Text>
        </View>
        <View style={[s0.setting, phone && s0.settingPhone]}>
          <Text>⚙️</Text>
        </View>
      </View>
      <View style={[s0.body, phone && s0.bodyPhone]}>
        <View style={s0.off}>
          <View>
            <Text style={s0.offTitle}>오프라인 보상</Text>
            <Text style={s0.offSub}>19분 36초 · +482,945,939</Text>
          </View>
          <Pressable style={s0.claim}>
            <Text style={s0.claimT}>받기</Text>
          </Pressable>
        </View>
        <View style={s0.board}>
          <View style={s0.statRow}>
            <Stat a="클릭" b="+1,820" />
            <Stat a="환생" b="x7.59" />
          </View>
          <Text style={s0.work}>쿠키 작업대</Text>
          <View style={s0.play}>
            <View style={s0.left}>
              <Side e="📬" t="우편" />
              <Side e="📋" t="미션" />
              <Side e="😇" t="환생" />
              <Side e="🎲" t="확률" />
            </View>
            <View style={s0.cookieZone}>
              <View style={s0.shadow} />
              <Cookie onPress={tapCookie} />
              <Text style={s0.tap}>쿠키를 눌러 굽기</Text>
            </View>
            <View style={s0.right}>
              <Stat compact a="뽑기 레벨" b="Lv.11" />
              <Stat compact a="다음 부스트" b="없음" />
              <Stat compact a="버프" b="대기" />
            </View>
          </View>
          <View style={s0.promo}>
            <Text style={s0.promoE}>🎁</Text>
            <View>
          <Text style={s0.promoT}>오늘의 오븐</Text>
          <Text style={s0.promoS}>오늘의 오븐을 확인하세요</Text>
            </View>
            <Text style={s0.arrow}>›</Text>
          </View>
        </View>
      </View>
      <View style={s0.dock}>
        {tabs.map((t, i) => (
          <Pressable
            key={t}
            onPress={() => setTab(i)}
            style={[s0.tab, tab === i && s0.active]}
          >
            <Text style={[s0.tabT, tab === i && s0.activeT]}>{t}</Text>
          </Pressable>
        ))}
      </View>
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
  tab: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: "#b00838",
    borderWidth: 2,
    borderColor: "#760019",
    alignItems: "center",
    justifyContent: "center",
  },
  active: { backgroundColor: GOLD },
  tabT: {
    fontSize: 13,
    lineHeight: 23,
    textAlign: "center",
    fontWeight: "900",
    color: "white",
  },
  activeT: { color: INK },
});
