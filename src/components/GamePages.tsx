import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
  const draw = (premium = false, count = 1) => {
    for (let i = 0; i < count; i += 1) if (!game.draw(premium)) break;
  };
  return (
    <Page title="🎰 오븐 뽑기">
      <View style={s.hero}>
        <Text style={s.heroText}>모든 등급의 오븐이 뽑기에서 등장합니다</Text>
        <Text style={s.balance}>
          🍫 {fmt(game.chocoChips)} · 💎 {fmt(game.premiumChips)}
        </Text>
      </View>
      <Text style={s.section}>기본 초코칩 뽑기</Text>
      <View style={s.row}>
        <Button title="1회 뽑기" onPress={() => draw()} />
        <Button title="10회 뽑기" onPress={() => draw(false, 10)} />
      </View>
      <Text style={s.section}>프리미엄 초코칩 뽑기</Text>
      <View style={s.row}>
        <Button title="1회 뽑기" onPress={() => draw(true)} />
        <Button title="10회 뽑기" onPress={() => draw(true, 10)} />
      </View>
      <Text style={s.section}>등장 오븐</Text>
      {OVENS.map((oven) => (
        <View
          key={oven.id}
          style={[s.oven, { borderColor: RARITY_COLORS[oven.rarity] }]}
        >
          <Text style={s.ovenName}>{oven.name}</Text>
          <Text style={[s.rarity, { color: RARITY_COLORS[oven.rarity] }]}>
            {oven.rarity === "Secret" ? "???" : oven.rarity}
          </Text>
        </View>
      ))}
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
    </Page>
  );
}

export function InventoryPage() {
  const game = useGameStore();
  return (
    <Page title="🎒 인벤토리">
      <View style={s.hero}>
        <Text style={s.balance}>🍪 {fmt(game.cookies)}</Text>
        <Text style={s.balance}>
          🍫 {fmt(game.chocoChips)} · 💎 {fmt(game.premiumChips)}
        </Text>
      </View>
      <Text style={s.section}>오븐 컬렉션</Text>
      {game.ovens
        .filter((owned) => owned.level > 0)
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
                레벨 {owned.level} · 융합 {owned.fusion} · 클릭 x{oven.click}
              </Text>
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
        <Text style={s.cardTitle}>🍪 클릭 강화</Text>
        <Text style={s.info}>
          장착한 오븐과 환생 보너스가 클릭 보상에 적용됩니다.
        </Text>
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
});
