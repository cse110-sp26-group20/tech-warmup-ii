# Increment plan

## 1. Where we are (snapshot)
*   **Knowledge Ingestion & Planning:** We have completed the research phase, generating the initial AI plan ([plan/ai-plan.md](plan/ai-plan.md)) and architecture specifications ([doc/frontend-architecture-spec.md](doc/frontend-architecture-spec.md)).
*   **Layer 1 (The Brain):** The core slot machine mathematical logic, probability weights, and payout calculations are fully implemented and completely decoupled from the DOM in [src/logic/SlotMachineMath.js](src/logic/SlotMachineMath.js).
*   **Layer 2 (The Wallet):** A persistent state manager utilizing `localStorage` to handle the player's bankroll is in place at [src/state/Wallet.js](src/state/Wallet.js).
*   **Rough UI skeleton:** [src/index.html](src/index.html), [src/style.css](src/style.css), and [src/main.js](src/main.js) already render a 3-zone layout (top balance, center 3×3 grid, bottom bet/spin controls) and a working spin loop, generated in the `2026-04-21_17-48-10` turn. Controller and DOM code are currently **coupled** inside `src/main.js` — this must be refactored to satisfy our 3-layer rule.
*   **Unit Testing:** We have written comprehensive Jest tests for the core logic, which verify the 96% RTP payout logic and payline detections ([tests/SlotMachineMath.test.js](tests/SlotMachineMath.test.js)).
*   **AI Use Log:** We currently have **9 entries** in [plan/ai-use-log.md](plan/ai-use-log.md) against the 20-entry minimum required by the rubric.

## 2. Gaps we must close
*   **Linting & Quality Toolchain:** We lack an ESLint and Prettier setup to automatically enforce JavaScript, HTML, and CSS formatting.
*   **Layer 3 (The Manager) is coupled to the DOM:** `src/main.js` mixes controller logic with DOM queries. It must be split into a DOM-free controller and a view module.
*   **UI polish:** The skeleton works but needs staggered reel animation, payline highlight, particle/audio win feedback, and theme polish.
*   **Regulatory & Safety Features:** The legal footer ("for amusement only", "21+", California problem-gambling hotline) and safeguards against unconditional autoplay are not yet implemented.
*   **End-to-End Testing:** Optional but highly recommended Playwright E2E tests are missing.
*   **Final Rubric Deliverables:** The project final report, slide deck PDF, and presentation video are outstanding.

## 3. Sequenced increments (one group at a time)

### Group 1: Andre + Anvik
*   **Increment 2:** Setup the linting toolchain (ESLint/Prettier, stylelint, HTMLHint) and npm scripts (`lint`, `lint:fix`) to ensure JS/HTML/CSS meet quality standards. Fix any issues the linter flags in existing `src/` and `tests/`.
*   **Increment 3:** Write and execute missing unit tests for [src/state/Wallet.js](src/state/Wallet.js) to guarantee robust bankroll management (getBalance default, deductBet success/insufficient/zero/negative, addWin positive/zero, localStorage persistence mocked).
*   **Increment 4:** Refactor the coupled `Manager` class inside [src/main.js](src/main.js) into a DOM-free controller at `src/controller/GameManager.js` and a view module at `src/ui/view.js`. `src/main.js` becomes a thin entry point that instantiates both and wires them via callbacks/events. No behavior change — the spin loop must still work end-to-end.
*   **Increment 5:** Add `tests/GameManager.test.js` exercising the new controller with a mock Wallet and mock math module (ensures isSpinning guard, bet deduction order, win callback firing). Run full lint + test sweep; commit green.

### Group 2: Jad + Yezhi + Noah
*   **Increment 6:** Implement reel spin animations (CSS/JS) that strictly play back the already-determined outcome from the GameManager.
*   **Increment 7:** Add win feedback visuals (e.g., highlighting winning paylines and amplifying coin display) and minimal loss feedback.
*   **Increment 8:** Apply a cohesive thematic styling (colors, layout) mapping to the 3-zone UI structure (Top Bar, Center Reels, Bottom Bar).
*   **Increment 9:** Integrate the required legal footer ("for amusement only / no real-money prizes / 21+") and the California problem-gambling hotline.
*   **Increment 10:** Update and polish the main [README.md](README.md) to reflect the finished UI architecture and run instructions.

### Group 3: Iban + Abas + Cadie
*   **Increment 11:** Implement adjustable Bet controls (increase/decrease wager) in the UI and wire them to the GameManager.
*   **Increment 12:** Implement the Auto-Spin feature, strictly enforcing a prompt for stop conditions (no unconditional autoplay allowed).
*   **Increment 13:** Implement a basic daily login/retention mechanic (e.g., granting a flat bonus if the balance is zero or tracking a daily streak).
*   **Increment 14:** Conduct an AI self-audit pass—prompt the AI to review the UI and logic against the "no dark patterns" rules and the 3-layer architecture constraints.
*   **Increment 15:** Generate a structured summary report of the self-audit findings, saved to `plan/audit-findings.md`.

### Group 4: Christine + Adam + Esha
*   **Increment 16:** Address and fix the violations or architecture gaps identified in the Increment 14/15 self-audit.
*   **Increment 17:** Implement an RTP simulation script (`scripts/rtp-sim.js`) to spin the math model 1,000,000 times and verify the 96% RTP target.
*   **Increment 18:** Set up and write Playwright E2E tests for the core gameplay loop (load, bet, spin, balance update).
*   **Increment 19:** Execute a final, full linting and formatting sweep across all JS, HTML, and CSS files.
*   **Increment 20:** Generate a seeded-RNG demo scenario script (forcing specific outcomes) to guarantee smooth, predictable recording for the final presentation video.

### Team deliverables (not AI increments — done together)
*   **Final Report:** `final-report/FINAL-REPORT.md`
*   **Slide Deck:** PDF presentation (4–7 slides) stored in `final-report/`
*   **Presentation Video:** ≤4-minute recorded video stored in `final-report/`

## 4. Coordination rules
*   **Task Lock:** Claim your increment in Slack before prompting to prevent overlap.
*   **One Group at a Time:** Only one group is permitted to interact with the AI or make changes at any given moment.
*   **Prompt Archiving:** Archive every prompt into `plan/prompts/<YYYY-MM-DD_HH-MM-SS>.md` before executing.
*   **Log Updates:** Append a structured entry to [plan/ai-use-log.md](plan/ai-use-log.md) immediately after each AI turn.
*   **Human Commits:** Humans must review and commit the changes generated by the AI. The AI agent does not commit code.
*   **Fixed Harness:** Gemini 3.1 Pro via Gemini CLI is the only approved AI harness for this project.