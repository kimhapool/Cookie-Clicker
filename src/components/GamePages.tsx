import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { BUILDINGS } from "../data/buildings";
import { UPGRADES } from "../data/upgrades";
import { OVENS, RARITY_COLORS } from "../data/ovens";
import { useGameStore } from "../store/useGameStore";

const fmt = (value: number) => Math.floor(value).toLocaleString("ko-KR");
const BASIC_WEIGHT = {
  Common: 45,
  Uncommon: 25,
  Rare: 14,
  Epic: 8,
  Legendary: 4.4,
  Mythic: 2,
  Eternal: 1,
  Celestial: 0.55,
  Secret: 0.0329,
} as const;
const PREMIUM_WEIGHT = {
  Common: 8,
  Uncommon: 13,
  Rare: 19,
  Epic: 20,
  Legendary: 17,
  Mythic: 12,
  Eternal: 7,
  Celestial: 3.5,
  Secret: 0.329,
} as const;
const ovenChance = (rarity: keyof typeof BASIC_WEIGHT, premium: boolean) => {
  const table = premium ? PREMIUM_WEIGHT : BASIC_WEIGHT;
  const total = Object.values(table).reduce((sum, value) => sum + value, 0);
  return `${((table[rarity] / total) * 100).toFixed(rarity === "Secret" ? 4 : 2)}%`;
};

function Button({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[s.button, disabled && s.disabled]}
    >
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
}

function Page({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>{title}</Text>
      {children}
    </ScrollView>
  );
}

export function DrawPage() {
  const game = useGameStore();
  const [mode, setMode] = useState<"basic" | "premium" | "trait">("basic");
  const [results, setResults] = useState<string[]>([]);
  const [flying, setFlying] = useState<string[]>([]);
  const [flightIndex, setFlightIndex] = useState(0);
  const [secretPhase, setSecretPhase] = useState(2);
  const [showOdds, setShowOdds] = useState(false);
  const flyProgress = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const draw = (premium = false, count = 1) => {
    const drawnIds: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const drawn = game.draw(premium);
      if (!drawn) break;
      drawnIds.push(drawn.id);
    }
    if (drawnIds.length) {
      setResults([]);
      setFlying(drawnIds);
      const flyNext = (index: number) => {
        setFlightIndex(index);
        flyProgress.setValue(0);
        Animated.timing(flyProgress, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }).start(() => {
          if (index + 1 < drawnIds.length)
            setTimeout(() => flyNext(index + 1), 70);
          else {
            setFlying([]);
            if (drawnIds.includes("oven-16")) {
              setSecretPhase(0);
              setTimeout(() => setSecretPhase(1), 700);
              setTimeout(() => setSecretPhase(2), 1500);
            }
            setResults(drawnIds);
          }
        });
      };
      flyNext(0);
      if (game.settings.vibration)
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => undefined);
    }
  };
  const grouped = results.reduce<Record<string, number>>(
    (acc, id) => ({ ...acc, [id]: (acc[id] ?? 0) + 1 }),
    {},
  );
  const selected = game.ovens.find(
    (oven) => oven.ovenId === game.equippedOvenId,
  )!;
  const hasSecret = results.includes("oven-16");
  const flyingOven = flying.length
    ? OVENS.find((oven) => oven.id === flying[flightIndex])
    : null;
  return (
    <Page title="🎰 오븐 뽑기">
      <View style={s.hero}>
        <Text style={s.balance}>
          🍫 {fmt(game.chocoChips)} · 💎 {fmt(game.premiumChips)}
        </Text>
        <Text style={s.info}>
          뽑기 레벨 Lv.{game.drawLevel} · 다음 보정{" "}
          {game.nextDrawBoost === "none"
            ? "없음"
            : game.nextDrawBoost === "dictionary"
              ? "15배"
              : "50배"}
        </Text>
      </View>
      <View style={s.modeRow}>
        {[
          ["basic", "🍫", "기본"],
          ["premium", "💎", "프리미엄"],
          ["trait", "✨", "특성"],
        ].map(([id, emoji, label]) => (
          <Pressable
            key={id}
            onPress={() => setMode(id as "basic" | "premium" | "trait")}
            style={[s.modeTab, mode === id && s.modeTabActive]}
          >
            <Text style={s.modeEmoji}>{emoji}</Text>
            <Text style={[s.modeText, mode === id && s.modeTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      {mode !== "trait" ? (
        <>
          <View style={[s.drawShowcase, mode === "premium" && s.drawShowcasePremium]}>
            <Text style={s.drawOrbit}>✦</Text>
            <Text style={s.drawOven}>{mode === "basic" ? "🍪" : "💎"}</Text>
            <Text style={s.drawTitle}>
              {mode === "basic" ? "초코칩 뽑기" : "프리미엄 오븐 뽑기"}
            </Text>
            <Text style={s.drawSub}>
              {game.nextDrawBoost === "none"
                ? "오븐을 획득하고 컬렉션을 강화하세요"
                : "다음 뽑기에 준비된 확률 보정이 적용됩니다"}
            </Text>
          </View>
          <View style={s.row}>
            <Button
              title="1회 뽑기"
              disabled={mode === "premium" ? game.premiumChips < 1 : game.chocoChips < 1}
              onPress={() => draw(mode === "premium")}
            />
            <Button
              title="10회 뽑기"
              disabled={mode === "premium" ? game.premiumChips < 10 : game.chocoChips < 10}
              onPress={() => draw(mode === "premium", 10)}
            />
            <Button
              title="전부 뽑기"
              disabled={mode === "premium" ? game.premiumChips < 1 : game.chocoChips < 1}
              onPress={() =>
                draw(
                  mode === "premium",
                  mode === "premium" ? game.premiumChips : game.chocoChips,
                )
              }
            />
          </View>
          <View style={s.row}>
            <Button title="확률 보기" onPress={() => setShowOdds(true)} />
            {game.dictionaries > 0 && (
              <Button
                title="사전 사용"
                onPress={() => game.prepareDrawBoost("dictionary")}
              />
            )}
            {game.diaries > 0 && (
              <Button
                title="일기 사용"
                onPress={() => game.prepareDrawBoost("diary")}
              />
            )}
          </View>
        </>
      ) : (
        <>
          <Text style={s.section}>특성 뽑기</Text>
          <View style={s.card}>
            <Text style={s.cardTitle}>
              {OVENS.find((oven) => oven.id === selected.ovenId)?.name}
            </Text>
            <Text style={s.info}>
              현재 특성: {selected.trait} · 코어 결정으로 다음 특성을
              획득합니다.
            </Text>
            <Button
              title="특성 뽑기"
              disabled={selected.trait === "글리치"}
              onPress={() => game.rollTrait(selected.ovenId)}
            />
          </View>
        </>
      )}
      <Modal
        transparent
        animationType="fade"
        visible={results.length > 0}
        onRequestClose={() => setResults([])}
      >
        <View style={[s.resultShade, hasSecret && s.secretShade]}>
          <View style={[s.resultCard, hasSecret && s.secretCard]}>
            {hasSecret && (
              <>
                <Text style={s.secretSlash}>╲ ╱ ╲ ╱ ╲ ╱</Text>
                {secretPhase < 2 ? (
                  <View style={s.secretFragments}>
                    {Array.from({ length: 57 }, (_, index) => (
                      <View
                        key={index}
                        style={[
                          s.secretPiece,
                          {
                            left: `${(index * 37) % 92}%`,
                            top: `${(index * 61) % 88}%`,
                            opacity: secretPhase === 0 ? 0.9 : 0.35,
                          },
                        ]}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={s.secretCookie}>🍪</Text>
                )}
                <Text style={s.secretSlash}>╱ ╲ ╱ ╲ ╱ ╲</Text>
              </>
            )}
            <Text style={s.resultSparkle}>✦ ✦ ✦</Text>
            <Text style={s.resultTitle}>{results.length}회 뽑기 결과</Text>
            {Object.entries(grouped).map(([id, count]) => {
              const oven = OVENS.find((item) => item.id === id)!;
              return (
                <Text
                  key={id}
                  style={[
                    s.resultRarity,
                    { color: RARITY_COLORS[oven.rarity] },
                  ]}
                >
                  {oven.name} ×{count} · {oven.rarity}
                </Text>
              );
            })}
            <Button title="확인" onPress={() => setResults([])} />
          </View>
        </View>
      </Modal>
      <Modal transparent animationType="fade" visible={!!flyingOven}>
        <View style={s.flightShade}>
          {flyingOven && (
            <Animated.View
              style={[
                s.flightOven,
                {
                  borderColor: RARITY_COLORS[flyingOven.rarity],
                  opacity: flyProgress.interpolate({
                    inputRange: [0, 0.08, 0.9, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                  transform: [
                    {
                      translateX: flyProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-width * 0.72, width * 0.72],
                      }),
                    },
                    {
                      rotate: flyProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["-25deg", "300deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text
                style={[
                  s.flightOrb,
                  { color: RARITY_COLORS[flyingOven.rarity] },
                ]}
              >
                ✦
              </Text>
              <Text style={s.flightEmoji}>🔥</Text>
              <Text style={s.flightName}>{flyingOven.name}</Text>
              <Text
                style={[s.rarity, { color: RARITY_COLORS[flyingOven.rarity] }]}
              >
                {flyingOven.rarity}
              </Text>
            </Animated.View>
          )}
        </View>
      </Modal>
      <Modal
        transparent
        animationType="slide"
        visible={showOdds}
        onRequestClose={() => setShowOdds(false)}
      >
        <View style={s.resultShade}>
          <ScrollView style={s.oddsCard} contentContainerStyle={s.oddsContent}>
            <Text style={s.resultTitle}>
              {mode === "premium" ? "프리미엄 확률" : "기본 확률"}
            </Text>
            {OVENS.map((oven) => (
              <View key={oven.id} style={s.oddsRow}>
                <Text style={s.ovenName}>{oven.name}</Text>
                <Text style={[s.rarity, { color: RARITY_COLORS[oven.rarity] }]}>
                  {oven.rarity === "Secret"
                    ? "???"
                    : `${oven.rarity} · ${ovenChance(oven.rarity, mode === "premium")}`}
                </Text>
              </View>
            ))}
            <Button title="닫기" onPress={() => setShowOdds(false)} />
          </ScrollView>
        </View>
      </Modal>
    </Page>
  );
}

export function AutomationPage() {
  const game = useGameStore();
  return (
    <Page title="🏭 자동화">
      <Text style={s.info}>
        자동화 오븐은 초당 쿠키를 생산합니다. 판매 시 구매가의 80%를
        돌려받습니다.
      </Text>
      {BUILDINGS.map((building) => {
        const count = game.buildings[building.id] || 0;
        const cost = Math.floor(building.baseCost * Math.pow(1.15, count));
        return (
          <View key={building.id} style={s.card}>
            <Text style={s.cardTitle}>
              {building.emoji} {building.name}
            </Text>
            <Text style={s.info}>
              보유 {count}개 · 초당 {fmt(building.baseCps * count)}
            </Text>
            <View style={s.row}>
              <Button
                title={`${fmt(cost)} 구매`}
                onPress={() => game.buyBuilding(building.id)}
              />
              <Button
                title="판매"
                disabled={!count}
                onPress={() => game.sellBuilding(building.id)}
              />
            </View>
          </View>
        );
      })}
    </Page>
  );
}

export function ExchangePage() {
  const game = useGameStore();
  return (
    <Page title="💱 교환소">
      <Text style={s.info}>100,000 쿠키를 초코칩 1개로 교환합니다.</Text>
      <View style={s.card}>
        <Text style={s.cardTitle}>🍪 → 🍫</Text>
        <Text style={s.info}>보유 쿠키 {fmt(game.cookies)}</Text>
        <View style={s.row}>
          <Button
            title="1개 교환"
            onPress={() => game.exchangeCookies(100000)}
          />
          <Button
            title="10개 교환"
            onPress={() => game.exchangeCookies(1000000)}
          />
          <Button
            title="전부 교환"
            onPress={() => game.exchangeCookies(game.cookies)}
          />
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>🍫 고급 교환</Text>
        <Text style={s.info}>초코칩 10,000개 → 프리미엄 초코칩 1개</Text>
        <Button
          title="프리미엄 초코칩 교환"
          onPress={() => game.exchangeChips("premium")}
        />
        <Text style={s.info}>초코칩 1,000,000개 → 미래를 담은 사전 1권</Text>
        <Button
          title="미래를 담은 사전 교환"
          onPress={() => game.exchangeChips("dictionary")}
        />
        <Text style={s.info}>사전 3권 → 시간 여행자의 일기 1권</Text>
        <Button
          title="시간 여행자의 일기 제작"
          onPress={() => game.exchangeChips("diary")}
        />
      </View>
    </Page>
  );
}

export function InventoryPage() {
  const game = useGameStore();
  const [descending, setDescending] = useState(false);
  const rarityRank = (id: string) =>
    Object.keys(RARITY_COLORS).indexOf(
      OVENS.find((oven) => oven.id === id)!.rarity,
    );
  return (
    <Page title="🎒 인벤토리">
      <View style={s.hero}>
        <Text style={s.balance}>🍪 {fmt(game.cookies)}</Text>
        <Text style={s.balance}>
          🍫 {fmt(game.chocoChips)} · 💎 {fmt(game.premiumChips)}
        </Text>
        <Text style={s.info}>
          미래를 담은 사전 {game.dictionaries}권 · 시간 여행자의 일기{" "}
          {game.diaries}권
        </Text>
        <Text style={s.info}>
          오로라 {game.epirus.aurora} · 옵터널 {game.epirus.opternal} · 황혼{" "}
          {game.epirus.twilight} · 피닉스 {game.epirus.phoenix} · 인피니티{" "}
          {game.epirus.infinity}
        </Text>
      </View>
      <View style={s.row}>
        <Text style={s.section}>오븐 컬렉션</Text>
        <Button
          title={descending ? "등급 내림차순" : "등급 오름차순"}
          onPress={() => setDescending(!descending)}
        />
      </View>
      {game.ovens
        .filter((owned) => owned.level > 0)
        .sort((a, b) =>
          descending
            ? rarityRank(b.ovenId) - rarityRank(a.ovenId)
            : rarityRank(a.ovenId) - rarityRank(b.ovenId),
        )
        .map((owned) => {
          const oven = OVENS.find(
            (candidate) => candidate.id === owned.ovenId,
          )!;
          return (
            <Pressable
              key={oven.id}
              onPress={() => game.equipOven(oven.id)}
              style={[s.oven, { borderColor: RARITY_COLORS[oven.rarity] }]}
            >
              <Text style={s.ovenName}>
                {game.equippedOvenId === oven.id ? "장착됨 · " : ""}
                {oven.name}
              </Text>
              <Text style={s.info}>
                보유 {owned.level}개 · 융합 {owned.fusion} (x
                {Math.pow(1.25, owned.fusion).toFixed(2)}) · 특성 {owned.trait}
              </Text>
              <View style={s.row}>
                <Button title="장착" onPress={() => game.equipOven(oven.id)} />
                <Button
                  title={`융합 (${owned.fusion + 2}개)`}
                  disabled={owned.level - 1 < owned.fusion + 2}
                  onPress={() => game.fuseOven(oven.id)}
                />
                <Button
                  title="분해"
                  disabled={owned.level < 2}
                  onPress={() => game.dismantleOven(oven.id)}
                />
              </View>
            </Pressable>
          );
        })}
    </Page>
  );
}

export function UpgradesPage() {
  const game = useGameStore();
  const need = 100000 * Math.pow(5, game.rebirths);
  return (
    <Page title="⚡ 강화">
      <View style={s.card}>
        <Text style={s.cardTitle}>🌟 환생</Text>
        <Text style={s.info}>
          환생할 때마다 클릭과 자동화 생산량이 50% 증가합니다.
        </Text>
        <Text style={s.info}>
          현재 {game.rebirths}회 · 필요 쿠키 {fmt(need)}
        </Text>
        <Button
          title="환생하기"
          disabled={game.cookies < need}
          onPress={() => game.rebirth()}
        />
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>🍪 달콤한 부스트</Text>
        <Text style={s.info}>부스트는 홈 화면에서 사용하실 수 있습니다.</Text>
      </View>
      <Text style={s.section}>영구 강화</Text>
      {UPGRADES.map((upgrade) => {
        const level = game.upgrades[upgrade.id];
        const cost = Math.floor(
          upgrade.baseCost * Math.pow(upgrade.growth, level),
        );
        return (
          <View key={upgrade.id} style={s.card}>
            <Text style={s.cardTitle}>
              {upgrade.emoji} {upgrade.name} · Lv.{level}
            </Text>
            <Text style={s.info}>{upgrade.description}</Text>
            <Button
              title={`${fmt(cost)} 쿠키로 강화`}
              disabled={game.cookies < cost}
              onPress={() => game.buyUpgrade(upgrade.id)}
            />
          </View>
        );
      })}
      <View style={s.card}>
        <Text style={s.cardTitle}>🏭 생산 강화</Text>
        <Text style={s.info}>자동화 오븐을 늘려 초당 생산량을 올리세요.</Text>
      </View>
    </Page>
  );
}

export function AchievementsPage() {
  const game = useGameStore();
  const entries = [
    ["첫 반죽", game.taps >= 1, "쿠키를 처음 구웠습니다"],
    [
      "빵집 개업",
      game.buildings.grandma_oven >= 1,
      "가정용 오븐을 구매했습니다",
    ],
    [
      "오븐 수집가",
      game.ovens.filter((oven) => oven.level > 0).length >= 5,
      "오븐 5종을 보유했습니다",
    ],
    ["달콤한 전환", game.chocoChips >= 10, "초코칩 10개를 모았습니다"],
    ["새로운 생", game.rebirths >= 1, "첫 환생을 완료했습니다"],
  ];
  const secretEntries = [
    ["달빛 제빵사", game.totalDraws >= 50, "숨겨진 뽑기 기록을 달성했습니다"],
    [
      "무한의 향",
      game.ovens.find((oven) => oven.ovenId === "oven-16")?.level! >= 2,
      "Secret 오븐을 다시 만났습니다",
    ],
  ];
  return (
    <Page title="🏆 도전과제">
      {entries.map(([title, done, description]) => (
        <View key={String(title)} style={[s.card, done ? s.done : s.locked]}>
          <Text style={s.cardTitle}>
            {done ? "🏆" : "🔒"} {title}
          </Text>
          <Text style={s.info}>{description}</Text>
        </View>
      ))}
      {secretEntries
        .filter(([, done]) => done)
        .map(([title, , description]) => (
          <View key={String(title)} style={[s.card, s.done]}>
            <Text style={s.cardTitle}>🌙 {title}</Text>
            <Text style={s.info}>{description}</Text>
          </View>
        ))}
    </Page>
  );
}

const s = StyleSheet.create({
  page: { padding: 18, gap: 12, backgroundColor: "#f8eed7", flexGrow: 1 },
  title: { fontSize: 28, fontWeight: "900", color: "#401923" },
  section: { fontSize: 20, fontWeight: "900", color: "#401923", marginTop: 8 },
  hero: {
    backgroundColor: "#e2f1ff",
    borderRadius: 22,
    padding: 18,
    borderWidth: 2,
    borderColor: "#bfd7ef",
    gap: 6,
  },
  modeRow: { flexDirection: "row", gap: 8 },
  modeTab: {
    flex: 1,
    minHeight: 62,
    borderRadius: 18,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff8e9",
    borderWidth: 2,
    borderColor: "#ddc699",
  },
  modeTabActive: { backgroundColor: "#ffca45", borderColor: "#9e1634" },
  modeEmoji: { fontSize: 22 },
  modeText: { marginTop: 2, color: "#735943", fontSize: 13, fontWeight: "900" },
  modeTextActive: { color: "#401923" },
  drawShowcase: {
    minHeight: 164,
    borderRadius: 28,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#2b466f",
    borderWidth: 3,
    borderColor: "#8ecdf1",
  },
  drawShowcasePremium: { backgroundColor: "#502f79", borderColor: "#db91ed" },
  drawOrbit: {
    position: "absolute",
    top: 4,
    right: "20%",
    color: "#fff3a8",
    fontSize: 54,
    textShadowColor: "#7ce6ff",
    textShadowRadius: 14,
  },
  drawOven: { fontSize: 54, textShadowColor: "#fff3a8", textShadowRadius: 16 },
  drawTitle: { marginTop: 3, color: "#fff", fontSize: 22, fontWeight: "900" },
  drawSub: { marginTop: 4, color: "#dbefff", fontSize: 13, fontWeight: "700" },
  heroText: { fontSize: 16, fontWeight: "700", color: "#4b5663" },
  balance: { fontSize: 18, fontWeight: "900", color: "#401923" },
  card: {
    backgroundColor: "#fff8e9",
    borderRadius: 20,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: "#d9bd85",
  },
  cardTitle: { fontSize: 19, fontWeight: "900", color: "#401923" },
  info: { fontSize: 14, fontWeight: "700", color: "#6a5a50" },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  button: {
    backgroundColor: "#ffca45",
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexGrow: 1,
    alignItems: "center",
  },
  disabled: { opacity: 0.4 },
  buttonText: { fontWeight: "900", color: "#401923" },
  oven: {
    backgroundColor: "#fff",
    borderLeftWidth: 6,
    borderRadius: 14,
    padding: 13,
    gap: 3,
  },
  ovenName: { fontSize: 16, fontWeight: "900", color: "#401923" },
  rarity: { fontWeight: "900" },
  done: { borderColor: "#d7a221" },
  locked: { opacity: 0.58 },
  resultShade: {
    flex: 1,
    backgroundColor: "#241129bb",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  resultCard: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    gap: 10,
    padding: 26,
    borderRadius: 30,
    borderWidth: 5,
    backgroundColor: "#fff8e9",
  },
  resultSparkle: { color: "#d7a221", fontSize: 24, letterSpacing: 5 },
  resultTitle: { color: "#401923", fontSize: 22, fontWeight: "900" },
  resultRarity: { fontSize: 17, fontWeight: "900" },
  resultOven: { fontSize: 72 },
  resultName: {
    color: "#401923",
    fontSize: 24,
    textAlign: "center",
    fontWeight: "900",
  },
  oddsCard: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "82%",
    backgroundColor: "#fff8e9",
    borderRadius: 24,
  },
  oddsContent: { padding: 20, gap: 10 },
  oddsRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  secretShade: { backgroundColor: "#050308" },
  secretCard: { backgroundColor: "#120820", borderColor: "#ff4dcc" },
  secretCookie: {
    fontSize: 90,
    textShadowColor: "#ff4dcc",
    textShadowRadius: 26,
  },
  secretSlash: {
    color: "#ff63e8",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 5,
  },
  secretFragments: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    borderColor: "#ff4dcc",
    overflow: "hidden",
    backgroundColor: "#271037",
  },
  secretPiece: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: "#f4b355",
    transform: [{ rotate: "35deg" }],
  },
  flightShade: {
    flex: 1,
    backgroundColor: "#090a25",
    justifyContent: "center",
    overflow: "hidden",
  },
  flightOven: {
    width: 220,
    alignSelf: "center",
    alignItems: "center",
    padding: 18,
    borderRadius: 28,
    borderWidth: 4,
    backgroundColor: "#18133f",
    shadowColor: "#fff",
    shadowOpacity: 0.7,
    shadowRadius: 18,
  },
  flightOrb: { position: "absolute", left: -35, top: -30, fontSize: 78 },
  flightEmoji: { fontSize: 60 },
  flightName: {
    color: "#fff",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "900",
  },
});
