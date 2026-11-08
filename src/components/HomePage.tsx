import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { s0 } from '../../App.styles';
import { TapCookie } from './TapCookie';
import { AutomationVista } from './AutomationVista';
import { getClickGain, getCps, useGameStore } from '../store/useGameStore';
import { OVENS } from '../data/ovens';
import { MISSIONS, getMissionProgress } from '../data/missions';
import { accountText, homeText, labels, modalText, ovenDisplayName, pageText } from '../i18n/translations';
import { type ProductionEvent } from '../utils/production';

type Props = {
  active: boolean; clock: number; productionEvent: ProductionEvent | null; canDraw: boolean;
  onTap(): number; onDraw(odds: boolean): void; onPanel(panel: 'mail' | 'missions'): void; onRebirth(): void;
};

export function HomePage({ active, clock, productionEvent, canDraw, onTap, onDraw, onPanel, onRebirth }: Props) {
  const game = useGameStore();
  const { width, height } = useWindowDimensions();
  const phone = width < 500;
  const short = height < 820;
  const language = game.settings.language;
  const text = labels[language];
  const home = homeText[language];
  const modal = modalText[language];
  const account = accountText[language];
  const cps = getCps(game);
  const mailCount = ['tutorial', 'welcome', 'chips', 'moon'].filter(id =>
    !game.claimedMail.includes(id) && (id !== 'tutorial' || game.tutorialComplete)).length;
  const missionCount = MISSIONS.filter(mission => !game.claimedMissions.includes(mission.id)
    && getMissionProgress(mission.id, game) >= mission.target).length;
  const [playSize, setPlaySize] = useState({ width: 300, height: 220 });
  const leftWidth = phone ? 56 : 72;
  const rightWidth = phone ? 72 : 100;
  const cookieSize = Math.max(64, Math.min(320,
    playSize.width - leftWidth - rightWidth - 34,
    playSize.height - 74,
  ));
  const day = new Date(clock);
  const dayIndex = Math.floor(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) / 86400000);
  const dailyOven = OVENS[dayIndex % OVENS.length];
  return (
<ScrollView style={[s0.homeScroll, !active && s0.hidden]}
        contentContainerStyle={[s0.body, phone && s0.bodyPhone, short && s0.bodyShort]}>
        {game.pendingOffline > 0 && <View style={[s0.off, short && s0.offShort]}>
          <View style={s0.rowCopy}>
            <Text style={s0.offTitle}>{text.offline}</Text>
            <Text style={s0.offSub}>
              {game.pendingOffline
                ? `${Math.floor(game.offlineSeconds / 60)}${account.minutes} ${game.offlineSeconds % 60}${account.seconds} · +${game.pendingOffline.toLocaleString(game.settings.language)}`
                : modal.offlineWaiting}
            </Text>
          </View>
          <Pressable accessibilityRole="button"
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
        </View>}
        <View style={[s0.board, short && s0.boardShort]}>
          <View style={s0.statRow}>
            <Stat a={home.click} b={`+${getClickGain(game)}`} />
            <Stat a={home.rebirth} b={`x${Math.pow(1.5, game.rebirths).toFixed(2)}`} />
          </View>
          <View style={[s0.boostRow, short && s0.boostRowShort]}>
            <Pressable accessibilityRole="button"
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
                  {game.boostUntil > clock && game.boostMultiplier === 2
                    ? `${home.active} · ${Math.ceil((game.boostUntil - clock) / 1000)}${home.seconds}`
                    : home.doubleCost}
                </Text>
                <View style={s0.boostUse}><Text style={s0.boostUseText}>{game.boostUntil > clock && game.boostMultiplier === 2 ? "✓" : home.use}</Text></View>
              </View>
            </Pressable>
            <Pressable accessibilityRole="button"
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
                  {game.boostUntil > clock && game.boostMultiplier === 4
                    ? `${home.active} · ${Math.ceil((game.boostUntil - clock) / 1000)}${home.seconds}`
                    : home.feverCost}
                </Text>
                <View style={s0.boostUse}><Text style={s0.boostUseText}>{game.boostUntil > clock && game.boostMultiplier === 4 ? "✓" : home.use}</Text></View>
              </View>
            </Pressable>
          </View>
          <View style={[s0.play, { minHeight: Math.max(232, Math.min(320, width - leftWidth - rightWidth - 72, height * 0.29) + 74) }]} onLayout={({ nativeEvent }) => {
            const { width: w, height: h } = nativeEvent.layout;
            setPlaySize((prev) => prev.width === w && prev.height === h ? prev : { width: w, height: h });
          }}>
            <View style={[s0.left, short && s0.leftShort, { width: leftWidth }]}>
              <Side
                e="📬"
                t={home.mail}
                badge={mailCount}
                compact={short}
                disabled={!game.tutorialComplete && game.tutorialStep < 3}
                onPress={() => onPanel("mail")}
              />
              <Side
                e="📋"
                t={home.missions}
                badge={missionCount}
                compact={short}
                disabled={!game.tutorialComplete}
                onPress={() => onPanel("missions")}
              />
              <Pressable accessibilityRole="button"
                disabled={!game.tutorialComplete}
                onPress={onRebirth}
                style={[s0.side, short && s0.sideShort, !game.tutorialComplete && s0.sideLocked]}
              >
                <Text style={s0.sideE}>😇</Text>
                <Text style={s0.sideT}>{home.rebirth}</Text>
              </Pressable>
              <Pressable accessibilityRole="button"
                disabled={!canDraw}
                onPress={() => onDraw(true)}
                style={[s0.side, short && s0.sideShort, !canDraw && s0.sideLocked]}
              >
                <Text style={s0.sideE}>🎲</Text>
                <Text style={s0.sideT}>{home.odds}</Text>
              </Pressable>
            </View>
            <View style={s0.cookieZone}>
              <TapCookie size={cookieSize} rebirths={game.rebirths} language={game.settings.language}
                boost={game.boostUntil > clock ? game.boostMultiplier : 1} onTap={onTap} />
              <Text style={s0.tap}>{text.tapCookie}</Text>
            </View>
            <View style={[s0.right, short && s0.rightShort, { width: rightWidth }]}>
              <Stat
                compact
                tight={short}
                a={pageText[game.settings.language].drawLevel}
                b={`Lv.${game.drawLevel}`}
              />
              <Stat
                compact
                tight={short}
                a={pageText[game.settings.language].nextBoost}
                b={game.nextDrawBoost === "none" ? pageText[game.settings.language].none
                  : game.nextDrawBoost === "diary" ? "×50" : "×15"}
              />
              <Stat
                compact
                tight={short}
                a={home.buff}
                b={
                  game.boostUntil > clock
                    ? `×${game.boostMultiplier} ${Math.ceil((game.boostUntil - clock) / 1000)}${home.seconds}`
                    : home.waiting
                }
              />
            </View>
          </View>
          <AutomationVista counts={game.buildings} upgrades={game.buildingUpgrades} totalCps={cps} event={productionEvent}
            language={game.settings.language} active={active} />
          <Pressable accessibilityRole="button"
            disabled={!canDraw}
            onPress={() => onDraw(false)}
            style={[s0.promo, short && s0.promoShort, !canDraw && s0.claimDisabled]}
          >
            <Text style={s0.promoE}>🎁</Text>
            <View style={s0.rowCopy}>
              <Text style={s0.promoT}>{text.todayOven}</Text>
              <Text style={s0.promoS}>{ovenDisplayName(dailyOven.id, dailyOven.name, game.settings.language)} · {dailyOven.rarity}</Text>
            </View>
            <Text style={s0.arrow}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
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
      <Text style={[s0.statA, compact && s0.statLabelCompact]}>{a}</Text>
      <Text style={[s0.statB, compact && s0.statValueCompact]}>{b}</Text>
    </View>
  );
}
function Side({
  e,
  t,
  onPress,
  compact = false,
  disabled = false,
  badge = 0,
}: {
  e: string;
  t: string;
  onPress?: () => void;
  compact?: boolean;
  disabled?: boolean;
  badge?: number;
}) {
  return (
    <Pressable accessibilityRole="button"
      accessibilityLabel={badge && !disabled ? `${t}, ${badge}` : t}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s0.side, compact && s0.sideShort, disabled && s0.sideLocked]}
    >
      <Text style={s0.sideE}>{e}</Text>
      <Text style={s0.sideT}>{t}</Text>
      {badge > 0 && !disabled && <View style={s0.badge}><Text style={s0.badgeText}>{badge}</Text></View>}
    </Pressable>
  );
}
