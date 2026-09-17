import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { BUILDINGS } from "../data/buildings";
import { UPGRADES } from "../data/upgrades";
import { OVENS, RARITY_COLORS } from "../data/ovens";
import { useGameStore } from "../store/useGameStore";
import { automationText, inventoryText, labels, pageText } from "../i18n/translations";

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
  Secret: 0.065756,
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
const HIGH_RARITIES = new Set(["Mythic", "Eternal", "Celestial", "Secret"]);
const ovenChance = (
  rarity: keyof typeof BASIC_WEIGHT,
  premium: boolean,
  level: number,
  boost: "none" | "dictionary" | "diary",
) => {
  const table = premium ? PREMIUM_WEIGHT : BASIC_WEIGHT;
  const boostMultiplier = boost === "diary" ? 50 : boost === "dictionary" ? 15 : 1;
  const levelBonus = premium ? 1 : 1 + Math.max(0, level - 1) * 0.035;
  const weightFor = (itemRarity: keyof typeof BASIC_WEIGHT) =>
    table[itemRarity] *
    (HIGH_RARITIES.has(itemRarity) ? boostMultiplier * levelBonus : 1);
  const total = OVENS.reduce((sum, oven) => sum + weightFor(oven.rarity), 0);
  return `${((weightFor(rarity) / total) * 100).toFixed(rarity === "Secret" ? 4 : 2)}%`;
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
  const copy = pageText[game.settings.language ?? "ko"];
  const [mode, setMode] = useState<"basic" | "premium" | "trait">("basic");
  const [results, setResults] = useState<string[]>([]);
  const [flying, setFlying] = useState<string[]>([]);
  const [flightIndex, setFlightIndex] = useState(0);
  const [secretPhase, setSecretPhase] = useState(2);
  const [showOdds, setShowOdds] = useState(false);
  const flyProgress = useRef(new Animated.Value(0)).current;
  const secretPulse = useRef(new Animated.Value(0)).current;
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
  useEffect(() => {
    if (!hasSecret) {
      secretPulse.stopAnimation();
      secretPulse.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(secretPulse, {
          toValue: 1,
          duration: 620,
          useNativeDriver: true,
        }),
        Animated.timing(secretPulse, {
          toValue: 0,
          duration: 620,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [hasSecret, secretPulse]);
  return (
    <Page title={`🎰 ${copy.drawTitle}`}>
      <View style={s.hero}>
        <Text style={s.balance}>
          🍫 {fmt(game.chocoChips)} · 💎 {fmt(game.premiumChips)}
        </Text>
        <Text style={s.info}>
          {copy.drawLevel} Lv.{game.drawLevel} · {copy.nextBoost}{" "}
          {game.nextDrawBoost === "none"
            ? copy.none
            : game.nextDrawBoost === "dictionary"
              ? "×15"
              : "×50"}
        </Text>
      </View>
      <View style={s.modeRow}>
        {[
          ["basic", "🍫", copy.basic],
          ["premium", "💎", copy.premium],
          ["trait", "✨", copy.trait],
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
              {mode === "basic" ? copy.chipDraw : copy.premiumOvenDraw}
            </Text>
            <Text style={s.drawSub}>
              {game.nextDrawBoost === "none"
                ? copy.collectionHint
                : copy.boostHint}
            </Text>
          </View>
          <View style={s.row}>
            <Button
              title={copy.drawOnce}
              disabled={mode === "premium" ? game.premiumChips < 1 : game.chocoChips < 1}
              onPress={() => draw(mode === "premium")}
            />
            <Button
              title={copy.drawTen}
              disabled={mode === "premium" ? game.premiumChips < 10 : game.chocoChips < 10}
              onPress={() => draw(mode === "premium", 10)}
            />
            <Button
              title={copy.drawAll}
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
            <Button title={copy.odds} onPress={() => setShowOdds(true)} />
            {game.dictionaries > 0 && (
              <Button
                title={copy.useDictionary}
                onPress={() => game.prepareDrawBoost("dictionary")}
              />
            )}
            {game.diaries > 0 && (
              <Button
                title={copy.useDiary}
                onPress={() => game.prepareDrawBoost("diary")}
              />
            )}
          </View>
        </>
      ) : (
        <>
          <Text style={s.section}>{copy.traitDraw}</Text>
          <View style={s.card}>
            <Text style={s.cardTitle}>
              {OVENS.find((oven) => oven.id === selected.ovenId)?.name}
            </Text>
            <Text style={s.info}>
              {copy.currentTrait}: {selected.trait} · {copy.traitHint}
            </Text>
            <Button
              title={copy.traitDraw}
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
                <View pointerEvents="none" style={s.secretSlashField}>
                  {Array.from({ length: 12 }, (_, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        s.secretSlashLine,
                        {
                          top: `${(index * 17) % 94}%`,
                          opacity: secretPulse.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.16, 0.96, 0.25],
                          }),
                          transform: [
                            {
                              translateX: secretPulse.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-120 + (index % 3) * 38, 130 - (index % 4) * 32],
                              }),
                            },
                            { rotate: `${index % 2 ? -28 : 28}deg` },
                          ],
                        },
                      ]}
                    />
                  ))}
                </View>
                {secretPhase < 2 ? (
                  <View style={s.secretFragments}>
                    {Array.from({ length: 57 }, (_, index) => (
                      <View
                        key={index}
                        style={[
                          s.secretPiece,
                          {
                            left: `${secretPhase === 0 ? (index * 37) % 92 : 42 + ((index % 7) - 3) * 3}%`,
                            top: `${secretPhase === 0 ? (index * 61) % 88 : 42 + (Math.floor(index / 7) - 4) * 3}%`,
                            opacity: secretPhase === 0 ? 0.9 : 0.35,
                            transform: [
                              {
                                rotate: `${secretPhase === 0 ? (index * 29) % 180 : 0}deg`,
                              },
                            ],
                          },
                        ]}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={s.secretCookieHalo}>
                    <Image
                      source={require("../../assets/cookie-cutout.png")}
                      style={s.secretCookieImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                <Text style={s.secretReveal}>∞ SECRET OVEN ∞</Text>
              </>
            )}
            <Text style={s.resultSparkle}>✦ ✦ ✦</Text>
            <Text style={s.resultTitle}>{results.length} {copy.drawResult}</Text>
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
            <Button title={copy.confirm} onPress={() => setResults([])} />
          </View>
        </View>
      </Modal>
      <Modal transparent animationType="fade" visible={!!flyingOven}>
        <View style={s.flightShade}>
          <View pointerEvents="none" style={s.flightStars}>
            {Array.from({ length: 28 }, (_, index) => (
              <Text
                key={index}
                style={[
                  s.flightStar,
                  {
                    left: `${(index * 37 + 9) % 96}%`,
                    top: `${(index * 61 + 4) % 92}%`,
                    fontSize: 7 + (index % 4) * 4,
                    opacity: 0.24 + (index % 5) * 0.14,
                    color: index % 3 === 0 ? "#ffb9ed" : index % 3 === 1 ? "#8de7ff" : "#fff8c9",
                  },
                ]}
              >
                {index % 4 === 0 ? "✦" : "·"}
              </Text>
            ))}
          </View>
          <View pointerEvents="none" style={s.flightNebulaOne} />
          <View pointerEvents="none" style={s.flightNebulaTwo} />
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
              {mode === "premium" ? copy.premiumOdds : copy.basicOdds}
            </Text>
            {OVENS.map((oven) => (
              <View key={oven.id} style={s.oddsRow}>
                <Text style={s.ovenName}>{oven.name}</Text>
                <Text style={[s.rarity, { color: RARITY_COLORS[oven.rarity] }]}>
                  {oven.rarity === "Secret"
                    ? "???"
                    : `${oven.rarity} · ${ovenChance(oven.rarity, mode === "premium", game.drawLevel, game.nextDrawBoost)}`}
                </Text>
              </View>
            ))}
            <Button title={copy.close} onPress={() => setShowOdds(false)} />
          </ScrollView>
        </View>
      </Modal>
    </Page>
  );
}

export function AutomationPage() {
  const game = useGameStore();
  const copy = pageText[game.settings.language ?? "ko"];
  const words = automationText[game.settings.language ?? "ko"];
  const [arriving, setArriving] = useState<string | null>(null);
  const arrival = useRef(new Animated.Value(0)).current;
  const buyBuilding = (id: string) => {
    if (!game.buyBuilding(id)) return;
    setArriving(id);
    arrival.setValue(0);
    Animated.sequence([
      Animated.timing(arrival, {
        toValue: 0.72,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(arrival, {
        toValue: 1,
        friction: 4,
        tension: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setArriving(null));
  };
  return (
    <Page title={`🏭 ${labels[game.settings.language ?? "ko"].automation}`}>
      <Text style={s.info}>{words.info}</Text>
      {BUILDINGS.map((building) => {
        const count = game.buildings[building.id] || 0;
        const cost = Math.floor(building.baseCost * Math.pow(1.15, count));
        return (
          <View key={building.id} style={s.card}>
            <Text style={s.cardTitle}>
              {building.emoji} {building.name}
            </Text>
            <Text style={s.info}>
              {words.owned} {count} · {words.perSecond} {fmt(building.baseCps * count)}
            </Text>
            {count > 0 && (
              <View style={s.productionLine}>
                {Array.from({ length: Math.min(count, 8) }, (_, index) => {
                  const isArriving = arriving === building.id && index === count - 1;
                  return (
                    <Animated.Text
                      key={`${building.id}-${index}`}
                      style={[
                        s.productionIcon,
                        isArriving && {
                          opacity: arrival,
                          transform: [
                            {
                              translateX: arrival.interpolate({
                                inputRange: [0, 0.72, 1],
                                outputRange: [-90, 8, 0],
                              }),
                            },
                            {
                              scale: arrival.interpolate({
                                inputRange: [0, 0.72, 1],
                                outputRange: [0.25, 1.26, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      {building.emoji}
                    </Animated.Text>
                  );
                })}
                {count > 8 && <Text style={s.productionMore}>+{count - 8}</Text>}
              </View>
            )}
            <View style={s.row}>
              <Button
                title={`${fmt(cost)} ${copy.buy}`}
                disabled={game.cookies < cost}
                onPress={() => buyBuilding(building.id)}
              />
              <Button
                title={copy.sell}
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
  const copy = pageText[game.settings.language ?? "ko"];
  return (
    <Page title={`💱 ${labels[game.settings.language ?? "ko"].exchange}`}>
      <Text style={s.info}>100,000 쿠키를 초코칩 1개로 교환합니다.</Text>
      <View style={s.card}>
        <Text style={s.cardTitle}>🍪 → 🍫</Text>
        <Text style={s.info}>보유 쿠키 {fmt(game.cookies)}</Text>
        <View style={s.row}>
          <Button
            title="1개 교환"
            disabled={game.cookies < 100000}
            onPress={() => game.exchangeCookies(100000)}
          />
          <Button
            title="10개 교환"
            disabled={game.cookies < 1000000}
            onPress={() => game.exchangeCookies(1000000)}
          />
          <Button
            title="전부 교환"
            disabled={game.cookies < 100000}
            onPress={() => game.exchangeCookies(game.cookies)}
          />
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>🍫 고급 교환</Text>
        <Text style={s.info}>초코칩 10,000개 → 프리미엄 초코칩 1개</Text>
        <Button
          title="프리미엄 초코칩 교환"
          disabled={game.chocoChips < 10000}
          onPress={() => game.exchangeChips("premium")}
        />
        <Text style={s.info}>초코칩 1,000,000개 → 미래를 담은 사전 1권</Text>
        <Button
          title="미래를 담은 사전 교환"
          disabled={game.chocoChips < 1000000}
          onPress={() => game.exchangeChips("dictionary")}
        />
        <Text style={s.info}>사전 3권 → 시간 여행자의 일기 1권</Text>
        <Button
          title="시간 여행자의 일기 제작"
          disabled={game.dictionaries < 3}
          onPress={() => game.exchangeChips("diary")}
        />
      </View>
    </Page>
  );
}

export function InventoryPage() {
  const game = useGameStore();
  const copy = pageText[game.settings.language ?? "ko"];
  const words = inventoryText[game.settings.language ?? "ko"];
  const [descending, setDescending] = useState(false);
  const rarityRank = (id: string) =>
    Object.keys(RARITY_COLORS).indexOf(
      OVENS.find((oven) => oven.id === id)!.rarity,
    );
  return (
    <Page title={`🎒 ${labels[game.settings.language ?? "ko"].inventory}`}>
      <View style={s.hero}>
        <Text style={s.balance}>🍪 {fmt(game.cookies)}</Text>
        <Text style={s.balance}>
          🍫 {fmt(game.chocoChips)} · 💎 {fmt(game.premiumChips)}
        </Text>
        <Text style={s.info}>
          {words.dictionary} {game.dictionaries} · {words.diary} {game.diaries}
        </Text>
        <Text style={s.info}>
          {words.aurora} {game.epirus.aurora} · {words.opternal} {game.epirus.opternal} · {words.twilight}{" "}
          {game.epirus.twilight} · {words.phoenix} {game.epirus.phoenix} · {words.infinity}{" "}
          {game.epirus.infinity}
        </Text>
      </View>
      <View style={s.row}>
        <Text style={s.section}>{words.collection}</Text>
        <Button
          title={descending ? copy.descending : copy.ascending}
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
                {game.equippedOvenId === oven.id ? `${words.equipped} · ` : ""}
                {oven.name}
              </Text>
              <Text style={s.info}>
                {words.owned} {owned.level} · {words.fusion} {owned.fusion} (x
                {Math.pow(1.25, owned.fusion).toFixed(2)}) · {words.trait} {owned.trait}
              </Text>
              <View style={s.row}>
                <Button title={copy.equip} onPress={() => game.equipOven(oven.id)} />
                <Button
                  title={`${copy.fuse} (${owned.fusion + 2})`}
                  disabled={owned.level - 1 < owned.fusion + 2}
                  onPress={() => game.fuseOven(oven.id)}
                />
                <Button
                  title={copy.dismantle}
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
  const copy = pageText[game.settings.language ?? "ko"];
  const need = 100000 * Math.pow(5, game.rebirths);
  return (
    <Page title={`⚡ ${labels[game.settings.language ?? "ko"].upgrades}`}>
      <View style={s.card}>
        <Text style={s.cardTitle}>🌟 환생</Text>
        <Text style={s.info}>
          환생할 때마다 클릭과 자동화 생산량이 50% 증가합니다.
        </Text>
        <Text style={s.info}>
          현재 {game.rebirths}회 · 필요 쿠키 {fmt(need)}
        </Text>
        <Button
          title={copy.rebirth}
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
    ["새 출발", game.resets >= 1, "데이터 초기화 후 다시 베이커리를 열었습니다"],
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
    <Page title={`🏆 ${labels[game.settings.language ?? "ko"].achievements}`}>
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
  productionLine: {
    minHeight: 43,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: "#e8f4ff",
    borderWidth: 1,
    borderColor: "#c8dced",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  productionIcon: { fontSize: 27, marginRight: -4 },
  productionMore: { marginLeft: 7, color: "#3c627c", fontWeight: "900" },
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
  secretSlashField: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    borderRadius: 28,
  },
  secretSlashLine: {
    position: "absolute",
    left: "-28%",
    width: "160%",
    height: 4,
    borderRadius: 4,
    backgroundColor: "#ff75ec",
    shadowColor: "#49ddff",
    shadowOpacity: 1,
    shadowRadius: 11,
  },
  secretCookieHalo: {
    width: 158,
    height: 158,
    borderRadius: 79,
    backgroundColor: "#ffe163",
    borderWidth: 6,
    borderColor: "#ff62d8",
    shadowColor: "#58ddff",
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  secretCookieImage: { width: 140, height: 140 },
  secretReveal: {
    color: "#fff0a2",
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: "900",
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
  flightStars: { ...StyleSheet.absoluteFill },
  flightStar: { position: "absolute", fontWeight: "900" },
  flightNebulaOne: { position: "absolute", width: 310, height: 310, borderRadius: 180, top: -130, left: -120, backgroundColor: "#45225d", opacity: 0.42 },
  flightNebulaTwo: { position: "absolute", width: 370, height: 370, borderRadius: 220, bottom: -230, right: -170, backgroundColor: "#173e73", opacity: 0.45 },
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
