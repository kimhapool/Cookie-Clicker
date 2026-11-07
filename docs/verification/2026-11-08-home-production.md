# Home, automation and trait recovery checkpoint — 2026-11-08

This checkpoint follows the draw presentation checkpoint. It does not certify the complete recovery specification or a physical Android release.

## Implemented

- Home automation now groups each owned building type separately, stacks up to four representative copies, uses tier-dependent emoji sizes and shows the full owned count. Each type has its own income receipt. Largest-remainder allocation makes those receipts sum to the actual integer amount credited, including fractional production carried between ticks.
- Purchases animate the newest representative copy even after eight copies. Home preserves pending arrivals when another page is open. Automation-page CPS includes equipped ovens, traits, fusion, boosts, rebirth, global upgrades and the new building-specific upgrades.
- Each building type has permanent, unlimited upgrade levels: production grows by 20% per level; the first upgrade costs ten times its initial purchase price and subsequent costs grow by 1.75. Upgrades require an owned building, preserve ownership and survive selling/rebirth/restart. Older saves receive zero-level defaults. Small CPS values display decimals rather than hiding improvements such as 1 to 1.2 CPS.
- `TapCookie` replaces the shared timeout/animation implementation. Each press has an independent exact-gain label, centered ring and outward-moving crumbs. The bite reveals the same blue playfield. Uniform press scale preserves the original cookie proportions. The profile thumbnail also uses the original cutout.
- Rapid tapping uses one gradient ring; its final stage and Fever rotate a continuous rainbow. A 900 ms idle timeout ends rapid-tap stages. Double Potion and Fever have distinct warm/rainbow visuals. The inactive boost card no longer falsely reports that it is active when the other boost is running.
- Native animation runs on Reanimated shared values; React updates happen on presses and completion boundaries. Reduced motion retains brief opacity feedback without travel/rotation/crumbs. Receipt IDs are allocated outside React state updater functions.
- Trait draws can target any owned oven independently of equipment. The picker includes all 17 ovens. Core names, current/next trait, available crystals, cost and Infinity substitution are visible. Unaffordable and maximum-tier actions are disabled. All four specified core names have seven-language translations.
- Removed redundant workshop and upgrade-page filler blocks. Wide screens allocate more height to the cookie while narrow screens keep the rails separate. Home content scrolls when its combined content cannot fit above the dock.

## Verification performed

- `npm test`: 19 passing scenarios. New coverage verifies income conservation; building-specific multipliers; upgrade cost/ownership gates; old-save restoration; upgrade persistence through selling/rebirth; and trait draws on an unequipped oven with escalating matching/Infinity costs.
- `npx tsc --noEmit`: passed after the final source changes.
- Actual browser game flow: manually generated cookies, bought a building, observed Home income, later sent 500 keyboard activations through the visible cookie button, purchased the 1,000-cookie building upgrade, and observed 1.2 CPS in both HUD and Automation. Reloading the game retained 1.2 CPS and the building.
- Normal-phone browser sizes 360×800 and 412×915 plus Fold-like 768×896 were exercised. Cookie, side rails, automation area and fixed dock remained separate. The Home body is vertically scrollable; this is not a claim that all Home content fits without scrolling.
- The isolated development fixture showed all six building groups and a ninth-copy arrival. Six receipts summed to the displayed credited total 3,647,557.
- In the same isolated fixture, consecutive taps retained independent +1,820 labels; after completion there were zero feedback nodes and the idle aura opacity was zero. Fever used the same cookie-centered rainbow ring.
- The production TraitDraw component was exercised in the isolated fixture: select the Secret oven, advance through Shiny, Inverted and Glitch, consume one matching crystal and five universal crystals, then disable the capped action. The real store's matching path and persistence are separately covered by tests.
- Browser error logs were empty for the exercised flows. Browser testing cannot establish physical touch feel, native FPS, haptics or Android system-bar behavior.
- Impeccable detector returned no findings for the changed production UI.
- Final Android production export: 998 modules, Hermes `index-ac6796e5fbc6440598ba6bf98d8f7292.hbc`. This is a bundle export, not an installed APK.
- The desktop launcher `C:/Users/rhkim/Desktop/Start-Cookie-Clicker-Expo.bat` still points to this checkout and starts Expo on LAN. Dependencies remain on SDK 57.

## Evidence

- `home-final-phone.jpg`, `home-final-fold.jpg`: final Home integration at the tested viewport sizes.
- `building-upgrade-fold.jpg`: real-game upgrade level and 1.2 CPS.
- `automation-phone.jpg`: six-type development fixture (horizontal strip).
- `tap-feedback-phone.jpg`: isolated exact-gain/rainbow feedback.
- `trait-selected-phone.jpg`: selected Secret oven at Glitch with consumed crystals.
- Earlier `home-automation-*` and `home-tap-*` images are intermediate verification captures, superseded for final layout by `home-final-*`.

The development fixture uses local React state, imports store types only, and does not read/write the player's game. Both preview entry points remain gated by `__DEV__` and web platform checks.

## Remaining verification / recovery work

- Full seven-language and accessibility pass across all pages/modals, including long names, right-to-left text, native language selection and exact source-spec oven naming.
- Final consistency pass on high-volume bulk drawing, game pacing, tutorial-to-mailbox flow in the complete UI, and notification badges.
- Release assets/package review and physical Android/Fold play testing: touch targets, folding while open, system bars, audio/haptics, reduced-motion settings, performance, suspend/resume and process restart.

Music remains off by default. No physical device validation or complete-release claim is made here.
