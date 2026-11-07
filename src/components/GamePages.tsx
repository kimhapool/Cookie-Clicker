import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { BUILDINGS } from "../data/buildings";
import { UPGRADES } from "../data/upgrades";
import { STANDARD_ACHIEVEMENTS, SECRET_ACHIEVEMENTS } from "../data/achievements";
import { OVENS, RARITY_COLORS, type Rarity, type Oven } from "../data/ovens";
import { getDrawPool } from "../data/drawOdds";
import { getOvenUpgradeCost, useGameStore } from "../store/useGameStore";
import { automationText, buildingDisplayName, inventoryText, labels, ovenDisplayName, pageText, progressText, traitNames, upgradeDisplay } from "../i18n/translations";

import { DrawSequence } from "./DrawSequence";

const fmt = (value: number) => Math.floor(value).toLocaleString("ko-KR");
const ovenChance = (
  rarity: Rarity,
  premium: boolean,
  level: number,
  boost: "none" | "dictionary" | "diary",
) => {
  const chance = getDrawPool(premium, boost, level).find(item => item.oven.rarity === rarity)?.chance ?? 0;
  return `${(chance * 100).toFixed(2)}%`;
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

export function DrawPage({ initialOdds = false }: { initialOdds?: boolean }) {
  const insets = useSafeAreaInsets();
  const modalInsets = { paddingTop: Math.max(16, insets.top), paddingBottom: Math.max(16, insets.bottom) };
  const game = useGameStore();
  const language = game.settings.language ?? "ko";
  const copy = pageText[language];
  const [mode, setMode] = useState<"basic" | "premium" | "trait">("basic");
  const [results, setResults] = useState<string[]>([]);
  const [sequence, setSequence] = useState<Oven[]>([]);
  const [showOdds, setShowOdds] = useState(initialOdds);
  const finishSequence = useCallback(() => {
    setResults(sequence.map(oven => oven.id));
    setSequence([]);
  }, [sequence]);
  const draw = (premium = false, count = 1) => {
    if (sequence.length || results.length) return;
    const drawnIds: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const drawn = game.draw(premium);
      if (!drawn) break;
      drawnIds.push(drawn.id);
    }
    if (drawnIds.length) {
      setResults([]);
      setSequence(drawnIds.map(id => OVENS.find(oven => oven.id === id)!));
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
              {(() => { const oven = OVENS.find((item) => item.id === selected.ovenId); return oven ? ovenDisplayName(oven.id, oven.name, language) : ""; })()}
            </Text>
            <Text style={s.info}>
              {copy.currentTrait}: {traitNames[language][selected.trait] ?? selected.trait} · {copy.traitHint}
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
        <View style={[s.resultShade, modalInsets, hasSecret && s.secretShade]}>
          <View style={[s.resultCard, hasSecret && s.secretCard]}>
            <Text style={s.resultSparkle}>✦ ✦ ✦</Text>
            <Text style={[s.resultTitle, hasSecret && { color: "#fff8e9" }]}>{results.length} {copy.drawResult}</Text>
            <ScrollView style={s.resultList} contentContainerStyle={s.resultListContent}>
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
                  {ovenDisplayName(oven.id, oven.name, language)} ×{count} · {oven.rarity}
                </Text>
              );
            })}
            </ScrollView>
            <Button title={copy.confirm} onPress={() => setResults([])} />
          </View>
        </View>
      </Modal>
      {sequence.length > 0 && <DrawSequence ovens={sequence} language={language} onComplete={finishSequence} />}
      <Modal
        transparent
        animationType="slide"
        visible={showOdds}
        onRequestClose={() => setShowOdds(false)}
      >
        <View style={[s.resultShade, modalInsets]}>
          <View style={s.oddsCard}>
            <Text style={s.resultTitle}>
              {mode === "premium" ? copy.premiumOdds : copy.basicOdds}
            </Text>
            <ScrollView style={s.resultList} contentContainerStyle={s.oddsContent}>
            {OVENS.map((oven) => (
              <View key={oven.id} style={s.oddsRow}>
                <Text style={[s.ovenName, { flex: 1, minWidth: 0 }]}>{ovenDisplayName(oven.id, oven.name, language)}</Text>
                <Text style={[s.rarity, { color: RARITY_COLORS[oven.rarity] }]}>
                  {oven.rarity === "Secret"
                    ? "???"
                    : `${oven.rarity} · ${ovenChance(oven.rarity, mode === "premium", game.drawLevel, game.nextDrawBoost)}`}
                </Text>
              </View>
            ))}
            </ScrollView>
            <Button title={copy.close} onPress={() => setShowOdds(false)} />
          </View>
        </View>
      </Modal>
    </Page>
  );
}

export function AutomationPage() {
  const game = useGameStore();
  const language = game.settings.language ?? "ko";
  const copy = pageText[language];
  const words = automationText[language];
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
              {building.emoji} {buildingDisplayName(building.id, building.name, language)}
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
  const words = progressText[game.settings.language ?? "ko"];
  return (
    <Page title={`💱 ${labels[game.settings.language ?? "ko"].exchange}`}>
      <Text style={s.info}>{words.exchangeInfo}</Text>
      <View style={s.card}>
        <Text style={s.cardTitle}>🍪 → 🍫</Text>
        <Text style={s.info}>{words.cookiesOwned} {fmt(game.cookies)}</Text>
        <View style={s.row}>
          <Button
            title={words.exchangeOne}
            disabled={game.cookies < 100000}
            onPress={() => game.exchangeCookies(100000)}
          />
          <Button
            title={words.exchangeTen}
            disabled={game.cookies < 1000000}
            onPress={() => game.exchangeCookies(1000000)}
          />
          <Button
            title={words.exchangeAll}
            disabled={game.cookies < 100000}
            onPress={() => game.exchangeCookies(game.cookies)}
          />
        </View>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>{words.premiumExchange}</Text>
        <Text style={s.info}>{words.premiumCost}</Text>
        <Button
          title={words.premiumExchange}
          disabled={game.chocoChips < 10000}
          onPress={() => game.exchangeChips("premium")}
        />
        <Text style={s.info}>{words.dictionaryCost}</Text>
        <Button
          title={words.dictionaryExchange}
          disabled={game.chocoChips < 1000000}
          onPress={() => game.exchangeChips("dictionary")}
        />
        <Text style={s.info}>{words.diaryCost}</Text>
        <Button
          title={words.diaryCraft}
          disabled={game.dictionaries < 3}
          onPress={() => game.exchangeChips("diary")}
        />
      </View>
    </Page>
  );
}

export function InventoryPage() {
  const game = useGameStore();
  const language = game.settings.language ?? "ko";
  const copy = pageText[language];
  const words = inventoryText[language];
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
            <View
              key={oven.id}
              style={[s.oven, { borderColor: RARITY_COLORS[oven.rarity] }]}
            >
              <Text style={s.ovenName}>
                {game.equippedOvenId === oven.id ? `${words.equipped} · ` : ""}
                {ovenDisplayName(oven.id, oven.name, language)}
              </Text>
              <Text style={s.info}>
                Lv.{owned.upgradeLevel ?? 0} · 🍪 ×{(oven.click * 1.1 ** (owned.upgradeLevel ?? 0)).toFixed(2)}
                {" · "}CPS ×{(oven.cps * 1.1 ** (owned.upgradeLevel ?? 0)).toFixed(2)}
              </Text>
              <Button
                title={`${labels[language].upgrades} +10% · 🍪 ${fmt(getOvenUpgradeCost(owned))}`}
                disabled={game.cookies < getOvenUpgradeCost(owned)}
                onPress={() => game.upgradeOven(oven.id)}
              />
              <Text style={s.info}>
                {words.owned} {owned.level} · {words.fusion} {owned.fusion} (x
                {Math.pow(1.25, owned.fusion).toFixed(2)}) · {words.trait} {traitNames[language][owned.trait] ?? owned.trait}
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
            </View>
          );
        })}
    </Page>
  );
}

export function UpgradesPage() {
  const game = useGameStore();
  const language = game.settings.language ?? "ko";
  const copy = pageText[language];
  const words = progressText[language];
  const need = 100000 * Math.pow(5, game.rebirths);
  return (
    <Page title={`⚡ ${labels[game.settings.language ?? "ko"].upgrades}`}>
      <View style={s.card}>
        <Text style={s.cardTitle}>🌟 {copy.rebirth}</Text>
        <Text style={s.info}>
          {words.rebirthInfo}
        </Text>
        <Text style={s.info}>
          {words.rebirthCost.replace("{count}", String(game.rebirths)).replace("{cost}", fmt(need))}
        </Text>
        <Button
          title={copy.rebirth}
          disabled={game.cookies < need}
          onPress={() => game.rebirth()}
        />
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>{words.sweetBoost}</Text>
        <Text style={s.info}>{words.boostInfo}</Text>
      </View>
      <Text style={s.section}>{words.permanent}</Text>
      {UPGRADES.map((upgrade) => {
        const display = upgradeDisplay(upgrade.id, upgrade.name, upgrade.description, language);
        const level = game.upgrades[upgrade.id];
        const cost = Math.floor(
          upgrade.baseCost * Math.pow(upgrade.growth, level),
        );
        return (
          <View key={upgrade.id} style={s.card}>
            <Text style={s.cardTitle}>
              {upgrade.emoji} {display.name} · Lv.{level}
            </Text>
            <Text style={s.info}>{display.description}</Text>
            <Button
              title={words.upgradeCost.replace("{cost}", fmt(cost))}
              disabled={game.cookies < cost}
              onPress={() => game.buyUpgrade(upgrade.id)}
            />
          </View>
        );
      })}
      <View style={s.card}>
        <Text style={s.cardTitle}>{words.production}</Text>
        <Text style={s.info}>{words.productionInfo}</Text>
      </View>
    </Page>
  );
}

export function AchievementsPage() {
  const game = useGameStore();
  const words = progressText[game.settings.language ?? "ko"];
  const entries = STANDARD_ACHIEVEMENTS.map((id, i) => [
    words.achievements[i][0], game.achievements.includes(id), words.achievements[i][1],
  ]);
  const secretEntries = SECRET_ACHIEVEMENTS.map((id, i) => [
    words.secretAchievements[i][0], game.achievements.includes(id), words.secretAchievements[i][1],
  ]);
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
    maxHeight: "100%",
    maxWidth: 400,
    alignItems: "center",
    gap: 10,
    padding: 26,
    borderRadius: 30,
    borderWidth: 5,
    backgroundColor: "#fff8e9",
  },
  resultList: { flexShrink: 1, width: "100%" },
  resultListContent: { gap: 12 },
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
    maxHeight: "100%",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff8e9",
    borderRadius: 24,
  },
  oddsContent: { gap: 10 },
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

});
