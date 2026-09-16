import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { BUILDINGS } from "../data/buildings";
import { OVENS, RARITY_COLORS } from "../data/ovens";
import { useGameStore } from "../store/useGameStore";

const fmt = (value: number) => Math.floor(value).toLocaleString("ko-KR");

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
  const [showOdds, setShowOdds] = useState(false);
  const draw = (premium = false, count = 1) => {
    const drawnIds: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const drawn = game.draw(premium);
      if (!drawn) break;
      drawnIds.push(drawn.id);
    }
    if (drawnIds.length) {
      setResults(drawnIds);
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
      <View style={s.row}>
        <Button title="🍫 기본" onPress={() => setMode("basic")} />
        <Button title="💎 프리미엄" onPress={() => setMode("premium")} />
        <Button title="✨ 특성" onPress={() => setMode("trait")} />
      </View>
      {mode !== "trait" ? (
        <>
          <Text style={s.section}>
            {mode === "basic" ? "초코칩 뽑기" : "프리미엄 초코칩 뽑기"}
          </Text>
          <View style={s.row}>
            <Button title="1회 뽑기" onPress={() => draw(mode === "premium")} />
            <Button
              title="10회 뽑기"
              onPress={() => draw(mode === "premium", 10)}
            />
            <Button
              title="전부 뽑기"
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
        <View style={s.resultShade}>
          <View style={s.resultCard}>
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
                  {oven.rarity === "Secret" ? "???" : oven.rarity}
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
                보유 {owned.level}개 · 융합 {owned.fusion} · 특성 {owned.trait}
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
});
