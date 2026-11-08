# Recovery specification audit — 2026-11-08

This is the current implementation and verification record. It supersedes the outstanding implementation lists in the earlier November 8 checkpoints; their dated observations remain historical evidence. The scope is the supplied September 14 recovery specification on Expo SDK 57, not Play Store publication or certification on the user's physical Fold.

## Final changes

- Split the app shell, Home, Settings and styles into separate files. The six other pages remain separate React components in `GamePages.tsx`, sharing page primitives and styles.
- Settings expose all seven native language names, accessible checked states, four tap sounds, two music styles, sound/music/vibration toggles and the six-press reset flow. Five warnings precede the sixth press; the flash precedes reset achievement handling. Closing the dialog cancels the confirmation sequence.
- Localized all 17 oven names and corrected the Korean names to the supplied specification. Arabic pages use right-to-left layout. Long rail labels wrap. Mail and mission badges reflect actual available claims.
- Bulk draws use bounded 200-draw transactions, yield between batches, guard duplicate submissions and preserve all awarded copies. Every draw still gets its own presentation; the last presentation must finish before results appear.
- Inventory shows the currently equipped oven at the top. Listed oven multipliers include enhancement, fusion and traits rather than showing an incomplete base value.
- Restored the original app icon. The APK asset named `5c.webp` is actually PNG; its bytes were preserved and the destination extension corrected to `.png` after Expo Doctor caught the mismatch.
- Android versions below API 35 explicitly use a cream status bar with dark text. Draw cinematics hide the status bar and restore it afterwards. Safe areas remain handled by safe-area-context.
- Music remains off. Audio explicitly respects silent mode where supported and disables background playback. Standalone app configuration excludes microphone access, recording and audio foreground services; Expo Go's own permissions are controlled by Expo Go.

## Requirement coverage

| Requirement | Implementation / evidence |
| --- | --- |
| Portrait, normal phone and wide Fold layout; width and height responsive | Current dimensions and measured playfield determine cookie size; rails occupy separate space; Home scrolls above a fixed safe-area dock. Browser captures at 360×640, 360×800, 412×915 and 768×896. Native Android tested at 360 DP and 720 DP during this recovery. A screenshot is not proof of physical folding. |
| Original cookie, emoji controls, bright cream/blue theme, warm matching HUD/dock | Original alpha cutout is contained in a square frame; warm beige HUD/dock and seven emoji tabs retained. `home-rebirth-360.jpg`, `home-rebirth-fold.jpg`, `android-home-final.png`. |
| Korean default, honorific copy, seven languages; no filler captions | Korean action/tutorial copy; native language selector; translated data and controls; `오늘의 오븐` displays that day's actual oven. Seven-language dictionary and oven-name regression, plus 49 browser page checks in `language-screen-checks.json`. |
| Home/Draw/Inventory/Automation/Exchange/Upgrades/Achievements; settings outside dock | All seven pages are wired to live store actions. Gear opens Settings; profile shows lifetime production, taps, draws, rebirth, chips and equipment. Footer reads `Powered By Kixha`. |
| Readable resource HUD with compact numbers | Phone resource cells use two rows without ellipses; wide layout uses one row. `compactNumber` handles large values, and CPS preserves meaningful fractional values. |
| Home rails, notification badges, central cookie and separate automation | Mail/Missions/Rebirth/Odds left; draw level/next boost/current buff right. Geometry and screenshots show no rail/cookie/dock overlap. Badges derive from claimable content. |
| Exact per-press gain, crumbs/ripple/bite, fast tapping, one gradient ring, final rainbow | `TapCookie` gives each press an independent receipt; effects use the cookie container; bite reveals the blue playfield. No auto-click blocking. Earlier live feedback checks and `tap-feedback-phone.jpg`; every gain derives from the real store. |
| Haptics and selected tap sound | Enabled-setting guards on click, draws, rewards and Secret events; four restored sound assets. Native toggles verified. Physical vibration strength and audible sound quality were not measured. |
| Home Double Potion and Fever | 5,000/45 s/2× and 25,000/20 s/4×; states/countdowns/costs in Home; shared warm/rainbow cookie ring. Tests cover exact price, no stacking/double charge, restoration and exact expiry. |
| Cookie/chip/premium/dictionary/diary economy and bulk exchange | Cookie exchange 100,000 per chip, one/ten/all controls; premium 10,000 chips; dictionary 1,000,000 chips; diary three dictionaries. Added end-to-end store accounting regression for crafting and single-use prepared boosts. |
| Dictionary ×15 and diary ×50 next-draw high-rarity weights | Shared draw pool applies the boost to Mythic+ once. Bulk-versus-sequential tests cover both currencies and all boost modes; first draw consumes the prepared boost. |
| Six buildings, Korean names, 80% last purchase refund, unlimited rising upgrades | Building data and store validate ownership/currency; per-type and global upgrades; regression coverage for refund, prices, multipliers and persistence through sale/rebirth. |
| Separate Home building areas, tier sizes, stacked copies, income and arrival | `AutomationVista` provides six separate horizontal lots, representative stacks/full counts and tier sizes. Actual integer production is allocated without creating/loss of income. Purchases animate even at high owned counts. Earlier fixture and live purchase evidence retained. |
| All 17 ovens / nine rarity tiers available, no legacy locks | Shared pool and odds modal include all 17. Existing recovery behavior retains all ovens initially available/owned with one retained copy; no rebirth rarity locks. Korean and six translated name sets are complete. |
| Inventory resources, equipment, enhancement, increasing fusion, dismantling, sort | Live controls and top equipped summary. Regression compares displayed multipliers with actual production for all 17 ovens and four traits. Fusion consumes 2 then 3 additional copies and preserves one. |
| Cores/Epirus/traits and universal substitution | Four core types, Aurora +2, Eternal +2, Secret Infinity +5, Phoenix +2, rebirth Twilight +2. New dismantling regression verifies exact crystal balances and last-copy protection. Trait tests cover selected unequipped oven, 1/2/3 matching-then-Infinity costs and persisted none→Shiny→Inverted→Glitch. |
| Basic/premium/trait tabs, single/ten/all, draw XP and separate odds | All controls wired; premium has its own pool. Basic unboosted level-one Secret probability 0.0329%; ordinary UI shows `???`. Odds normalize and cover all ovens. Native single/ten draws and browser all-19 draw completed. |
| Every oven flies across actual screen width, exits before next result | Production `DrawSequence`, 1.1 s per flight, rotation and rarity trail. Browser 17-oven and repeated-Secret fixtures; native 10-draw flight observed at item 3/10 followed by grouped results totaling 10. |
| Secret always plays, ×95, sustained rainbow/slashes, 57 cookie pieces | Every Secret produces a 6.4 s scene regardless of duplicates; actual cookie image partitioned into 57 source tiles, scrambled/reassembled; complete cookie retained. Repeated-Secret and tile-coverage tests, plus earlier live screenshots. Reduced-motion fallback verified separately. |
| Rebirth keeps permanent progress and changes cookie appearance | Requirement 100,000×5^n; only spendable cookies cleared, ×1.5 cumulative multiplier, Twilight +2, changing sparkle/color. Store regression plus real browser rebirth: 15 buildings retained, CPS 1,710→2,565, click 95→142, x1.50 and equipment survive reload. |
| Missions, standard/hidden achievements and unlock toast | Eight mission themes with real progress and one-time claims; all three enhancement systems count for the upgrade mission. Earned achievement IDs persist through spending; secret entries hidden until earned. Full reset test preserves only the reset milestone and reset count. |
| Non-blocking new-save tutorial, 15 buildings, first draw, mailbox +10 once | Global guidance uses normal layout space and gates navigation. Browser entire flow verified in prior continuation. Native continuation bought buildings 1→15, completed first draw, finished tutorial and claimed mail: chips 9→19, claim disabled, badge 4→3. |
| Complete persistence / safe restore / offline 75%, four-hour cap | Hydration gate, retry without defaults overwrite, legacy nested-field merging, timestamped boosts, fractional production, claim idempotence. Native process restart retained earlier game progress and showed +10,800 after four-hour capped absence at 1 CPS. Tests cover restart, clock rollback and boost expiry integration. |
| Modular UTF-8 source / assets / isolated test controls | Modular components/data/store/utils; no replacement characters in tested language dictionaries. Supplied original assets; no paid service. Development presentation fixtures are web + `__DEV__` gated and do not access player storage. |
| SDK 57 and desktop launcher | Installed Expo 57.0.32 with SDK-matched dependencies. Desktop `Start-Cookie-Clicker-Expo.bat` points to this checkout and runs `npx expo start --lan`. |

## Final automated validation

- `npm test`: **27 passed, 0 failed**. These execute the actual Zustand store with an isolated async storage adapter, not the player's save.
- `npx tsc --noEmit`: passed after the last production source change.
- `npx expo-doctor`: **21/21 passed** after the icon correction and audio configuration.
- `npx expo export --platform android`: passed, **1001 modules**, Hermes `index-3326b0110720afcd89944ad861facb68.hbc`, **2,720,494 bytes**.
- Impeccable detector: six changed source files scanned with no reported findings. The tool explicitly used regex-only checks; this does not certify visual contrast or target size. Rendered-screen checks supplied the visual evidence.
- `git diff --check`: passed (Windows line-ending notices only).
- Browser error log for the exercised current flows: empty.

## Current native play-test evidence

BlueStacks Pie64 / Android 9, existing Expo Go SDK 57. The native saved game is separate from the browser test profile.

1. Restarted Expo Go and restored the earlier one-building save. Confirmed cream status bar with readable clock, automatic production and music toggle off.
2. Claimed capped offline production, bought fourteen additional ovens, reached 15/15 and advanced the tutorial.
3. Drew one brick oven, finished the tutorial and claimed the +10-chip mail exactly once.
4. Drew ten ovens: chips 19→9. Observed full-screen animated flight with status bar hidden. Results contained Eternal Prism ×1, Starforge ×1, Caramel Pressure ×1, Copper Rotary ×1, Clay Starter ×4, Brick Hearth ×1 and Tin Sheet ×1: exactly ten.
5. Returned to Home with CPS 15, nine chips, tutorial no longer present and all seven tabs available. Status bar restored. Saved `android-home-final.png`, `android-tutorial-mail.png` and `android-ten-draws.png`.

## Verification boundaries

No physical Android/Fold was connected. Actual fold/unfold while running, physical haptic feel, audio audition (music intentionally remained off), release-mode sustained frame rate and store distribution are not certified by these tests. The export is an Android Hermes bundle, not a signed APK/AAB. No Google Play upload was made. These are release qualification limits, not omitted gameplay implementations.

The implementation covers the supplied recovery feature set. Keep these boundaries visible when preparing a future signed release; do not describe the current bundle check as a Play Store launch.
