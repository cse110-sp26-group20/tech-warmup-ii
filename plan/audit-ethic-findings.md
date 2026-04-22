# Ethical & Dark Pattern Audit Report

## 1. Executive Summary

**Compliance Status: Partially Compliant (Action Required)**

The system implements several responsible features, such as clear stop controls for auto-spin and independent reel math (avoiding artificial near-misses). However, the game contains severe violations regarding transparent information (a completely mismatched paytable) and manipulative reward structures designed to coerce engagement (streak FOMO and bankruptcy bonuses). The auto-spin system also lacks modern safety rails.

## 2. Violations Found

### A. Obscured Probability / RTP Confusion (Severity: HIGH)

- **Location:** `src/index.html` (Paytable Tab) vs. `src/logic/SlotMachineMath.js` (`PAYTABLE`)
- **Why it is a problem:** The UI paytable is completely disconnected from the actual game math. For example, the UI claims `3x Seven` pays **100x**, while the internal math awards **3000x**. `3x Bell` claims **20x** in UI but pays **500x** in math. Presenting false payout information to players is a critical transparency violation.
- **Additional Note:** The game's math applies the player's single wager to all 5 paylines without dividing it, resulting in a massively inflated RTP of ~480%. While in favor of the player, it fundamentally misrepresents how slot wagering works.

### B. Manipulative Reward Structures (Severity: HIGH)

- **Location:** `src/controller/GameManager.js` (`checkDailyReward`)
- **Why it is a problem:**
  1. **Bankruptcy Bonus:** The system explicitly rewards players for draining their balance (`if (this.wallet.getBalance() === 0) { reward = 10; ... }`). This encourages compulsive risk-taking to hit zero just to trigger the "safety net."
  2. **Escalating Streaks:** The daily streak system uses a fire emoji and escalating monetary rewards to heavily pressure users into daily return (FOMO).

### C. Forced Engagement Mechanics (Severity: MEDIUM)

- **Location:** `src/controller/GameManager.js` (`startAutoSpin`, `stopReels`)
- **Why it is a problem:** The Auto-Spin feature lacks safety limits. There are no stop-loss limits, time limits, or "stop on big win" conditions. Combined with a short 800ms delay between spins, this facilitates extended, unchecked play that can rapidly drain a user's balance while they are disengaged.

### D. Misleading Feedback Loops (Severity: LOW)

- **Location:** `src/audio/AudioManager.js` (`playWin`)
- **Why it is a problem:** A 20x win triggers the `playJackpot` audio function, which uses a complex escalating sequence of chords to simulate a massive payout. Treating relatively small wins (20x) as "jackpots" artificially inflates the player's perception of their success state.

## 3. Design Risks

- **Hold-to-Repeat Bets:** The `bindEvents` function in `src/ui/view.js` implements a hold-to-repeat mechanic on the bet adjusters. If a player accidentally rests on the button, it can rapidly drain their balance on the next spin without explicit confirmation of the new high wager.
- **Hidden Math:** The 96% per-line RTP and symbol probabilities are entirely hidden from the player. While common in some jurisdictions, modern ethical game design favors open disclosure of odds.

## 4. Required Fixes

1. **Sync Paytables:** Update `index.html` to reflect the exact math used in `SlotMachineMath.js` (or vice versa) so players know exactly what they stand to win.
2. **Fix Wager Math:** If a wager is 1, it should either be split across the 5 lines (0.2 per line) or the UI must clearly state the player is betting $1 \* 5 lines = $5 total.
3. **Remove Bankruptcy Incentives:** Change the bonus system to a flat daily login amount, rather than a bonus that actively rewards hitting a zero balance.
4. **Auto-Spin Safeguards:** Implement basic parameters for Auto-Spin (e.g., "Stop if balance decreases by X", "Stop if single win exceeds Y").

## 5. Safe Design Recommendations

- **Reality Checks:** Implement a session timer or spin counter that pauses the game every X minutes/spins, requiring the player to acknowledge how long they've been playing before continuing.
- **De-escalate Streaks:** Remove the "🔥" streak counter and escalating logic. A simple, flat daily login bonus provides a welcoming experience without applying coercive psychological pressure to return every single day.
- **Transparent Odds:** Add a section in the Paytable tab that explicitly states the theoretical Return to Player (RTP) and the odds of hitting the highest payout.
