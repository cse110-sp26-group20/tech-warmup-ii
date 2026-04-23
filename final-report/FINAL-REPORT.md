# Final Report: Tech Warm-Up II (slot machine built with an AI coding agent)

**Harness:** Gemini 3.1 Pro via the Gemini CLI

---

## 1. What we were trying to do

The warm-up asked us a simple question with a messy answer: can an AI coding agent, used carefully, actually produce software that a team would be willing to sign off on?

We built a single-player browser slot machine with 3×3 reels, 5 paylines, a persistent wallet, audio, auto-spin, and a daily reward. We tried to do it by prompting Gemini instead of writing the code ourselves. The rules said we had to use one harness the whole time, keep a log of every turn, and avoid touching the code by hand unless the AI failed after we tried to fix it through prompts.

We treated this as an experiment, not a demo. The point wasn't to ship a slot machine; it was to find out where the AI helped us and where it quietly made things worse.

## 2. How we set the project up

Before anyone wrote a prompt, we split into small research cells. Each person picked a slice of the domain (jargon, math, UI/UX, legal restrictions, mobile slot apps, user types) and dropped their notes into `plan/raw-research/`. Those notes were then consolidated into [`plan/research-overview.md`](../plan/research-overview.md), which ran to ~170 lines and covered everything from RTP and volatility to California's sweepstakes-casino ban. That document became the reference sheet that the AI would later be told to read before coding anything.

From the research we wrote the two required persona documents (Marcus, 42, casual casino player; Bobby, 9, who absolutely should not be exposed to real-money mechanics) and seven user stories covering casual, competitive, first-time, older, escapist, and social players. Those personas came back later. The ethics audit in Section 5 is essentially "what would Bobby's parent say about this screen?"

Our AI strategy (see [`plan/ai-plan.md`](../plan/ai-plan.md)) had two moving parts:

1. **Skill files.** We put our domain knowledge into `.gemini/skills/<name>/SKILL.md` files with YAML frontmatter so the Gemini CLI would auto-discover them and pull them into context before generating code. That let us stop pasting the same research into every prompt.
2. **Plan-first rule.** For every increment, the AI had to output a plan and wait for a human "go." No code on the first turn. This was the single rule that saved us the most time.

Work was then split into 20 sequenced increments across four rotating sub-groups, documented in [`plan/increment-plan.md`](../plan/increment-plan.md). Only one group was allowed to touch the AI at a time, every prompt was archived under `plan/prompts/<timestamp>.md`, and every turn got a structured entry appended to [`plan/ai-use-log.md`](../plan/ai-use-log.md). Humans committed the code, not the agent.

### Why Gemini 3.1 Pro via Gemini CLI?

We picked it for three pragmatic reasons. It was the only harness of the three allowed options that had a first-class, documented skill-files feature, which we wanted to try as an experiment in itself. It has a large context window, which mattered once the repo grew past a dozen files and we wanted it to re-read the whole thing before each increment. And a long-running CLI session meant we could keep state between prompts inside one increment without re-uploading research. We stuck with it the entire project and never swapped models.

## 3. What we actually built

A working 3×3 slot machine in vanilla HTML / CSS / JS, structured as three decoupled layers:

- **Logic.** [`src/logic/SlotMachineMath.js`](../src/logic/SlotMachineMath.js). Weighted RNG, paytable, payline evaluation. Pure, no DOM, testable.
- **State.** [`src/state/Wallet.js`](../src/state/Wallet.js). Balance persisted to `localStorage`, atomic deduct/add.
- **Controller + View.** [`src/controller/GameManager.js`](../src/controller/GameManager.js) orchestrates spins; [`src/ui/view.js`](../src/ui/view.js) owns the DOM. They talk through injected callbacks, not globals.

On top of that sits a main-menu splash screen, a tabbed side drawer for Settings / Paytable / a mock Social hub, a procedurally-synthesised audio engine that produces every sound with the Web Audio API and zero asset files, a hold-to-repeat bet adjuster, responsible auto-spin with mandatory stop conditions (spin count, stop-loss, single-win cap), and a daily login bonus with an honest streak.

Under the hood we also wrote:

- A Jest test suite that ended at **42 passing tests** across three files: `SlotMachineMath.test.js`, `Wallet.test.js`, and `GameManager.test.js`.
- A headless Monte Carlo RTP simulator at [`scripts/rtp-sim.js`](../scripts/rtp-sim.js) that runs 500,000 spins against the real math module.
- A seeded demo-mode script at `scripts/force-demo-outcomes.js` for predictable video recording.
- An ESLint / Prettier / Stylelint / HTMLHint tool-chain wired into `npm run lint`, clean on every commit after Increment 2.

The legal footer ("for amusement only", "no real money prizes", "21+", 1-800-GAMBLER) sits below the game per California requirements.

Following the initial project finalization, we executed a final "stretch goal" increment to transition the application from a standalone frontend to a **Full-Stack Client-Server architecture**. 

* **The Logic Pivot:** We introduced a **Node.js/Express** backend to act as the centralized "Source of Truth" for the game's competitive state.
* **Global Leaderboard:** Replaced the local mock social data with a persistent API-driven leaderboard. Player "Cash Outs" now trigger a `POST` request to the server, synchronizing high scores across all independent browser sessions.
* **Resilience:** The system includes an "Offline Mode" fallback; the game remains fully playable via local logic if the backend server is unreachable, ensuring zero disruption to the core user experience.

## 4. The data

This is the part we care most about, because everything else is vibes.

### 4.1 Increments and hand-edits

We completed 20 AI increments (1 → 20, with an extra 14.5 and 17.5, and a final extra leaderboard increment). The `ai-use-log.md` has 23 structured entries. Every entry lists the archived prompt, what the AI did, what it got right, and what it got wrong. Across the whole project we did not record a single increment where a human had to hand-edit the code because the AI couldn't be prompted into fixing it. That is not the same as saying the AI got everything right on the first try. It usually didn't. But the plan-first rule meant we caught most drift before code was written.

### 4.2 RTP simulation (Increment 18)

The slot math was designed to target a 96% return-to-player. We validated this empirically by running 500,000 spins headless:

| Metric | Result |
|---|---|
| Total wagered | 2,500,000 |
| Total returned | 2,416,230 |
| Observed RTP | **96.65%** |
| Target RTP | 96.00% |
| Convergence | Steady, within ±2% tolerance |

This is honestly a better result than we expected given that the top symbol is a 3000× multiplier on 1% probability. True ±0.1% convergence would need 5–10M spins, but for a warm-up this was plenty. The script itself exits cleanly on invalid wagers and guards against corrupt spin results, which we only added *after* an early run produced `NaN` totals and we realised the math module was returning `undefined` in one edge case.

### 4.3 Ethics / dark-pattern audit (Increments 17 and 17.5)

We asked the AI to audit its own output against a list of dark-pattern categories (loss of user control, misleading feedback, manipulative rewards, obscured probability, forced engagement). The findings live in [`plan/audit-ethic-findings.md`](../plan/audit-ethic-findings.md) and they were not flattering:

| Severity | Category | What it caught |
|---|---|---|
| HIGH | Obscured probability | UI paytable said 3× Seven paid 100×. The math paid 3000×. Every row was mismatched. |
| HIGH | Manipulative rewards | `checkDailyReward` literally gave a bonus for hitting a $0 balance, an incentive to drain your wallet. |
| MEDIUM | Forced engagement | Auto-spin had no stop-loss, no single-win cap, no time limit. |
| LOW | Misleading feedback | A 20× win triggered the full "jackpot" audio sequence. |

We then fixed the HIGH and MEDIUM findings in Increment 17.5: paytable rewritten to match the real multipliers, bankruptcy bonus removed in favour of a flat streak, stop-loss and single-win cap wired into auto-spin. Tests still passed.

The honest takeaway is that the AI never pointed out any of these on its own while it was *writing* the code. It needed to be pointed at its own output with an explicit audit prompt before it would flag them. A designer who'd thought about Bobby (the 9-year-old persona) would have caught the bankruptcy bonus the moment it was proposed.

### 4.4 Lint, format, and style

The final sweep in Increment 19 found zero issues (`plan/final-lint-sweep.md`). Part of the credit goes to the tool-chain itself, and part goes to the plan-first rule: because the AI was required to describe what it was about to do, we could veto style-violating approaches before they hit disk.

### 4.5 Things the AI got wrong

From the log, in chronological order, the most useful failures to remember:

- **Over-engineered docs (2026-04-21 11:03).** Our first architecture doc came back with microservices, event buses, and words we'd never used in the prompt. We threw it out and asked again, this time constraining it to a 3-layer model. Lesson: without a constraint the model optimises for looking sophisticated.
- **Non-runnable first UI (2026-04-21 12:10).** First HTML/CSS/JS turn produced code that didn't wire up. The controller and the view referenced different DOM ids. We added more precise prompts about how the UI should connect to JS.
- **Wrong feature entirely (2026-04-21 17:48).** We asked for a multi-game machine. We got a classic video slot. No error, no push-back. It just silently delivered the simpler thing. This is the one that stuck with us most: the AI is happy to interpret requirements down.
- **Missed its own ethical landmines (above).** Only surfaced them when explicitly audited.
- **Lint tool failing silently (2026-04-22 15:12).** One increment reported "manually verified against ESLint patterns" because `npm run lint` threw exit code 127 in the AI's sandbox. If we hadn't noticed the note, we'd have shipped unchecked code.

### 4.6 Unexpected Capabilities 

- **One-Shot Full-Stack Generation (2026-04-22 20:37):** In a final experimental prompt, the AI successfully generated a synchronized backend (Express) and frontend (Fetch API) bridge in a single turn. It accurately managed cross-file dependencies, port mapping, and CORS configuration without manual code intervention, proving the agent's capability to handle distributed system design when given a stable 3-layer foundation.

## 5. Discussion: answering the learning goals

**Challenges we ran into using AI for SWE-quality software.** The biggest one is that the AI is confident about things it shouldn't be. It wrote a paytable, it wrote a math engine, and it didn't notice they disagreed by a factor of 30. It was happy to build a feature that looked reasonable but wasn't what we asked for. It will skip a step (like running the linter) if the step fails, and just say so in a sentence buried in a long log entry. None of this is a deal-breaker, but all of it means a human has to keep reading.

**How important research was to our model of the software.** Enormous. The research document is what let us write prompts with actual specifics ("96% RTP", "3x3 grid", "5 paylines", "California requires a problem-gambling hotline") instead of just "build a slot machine." The skill files bundled that research into the agent's context automatically. When we gave the agent vague prompts in early turns (before the skills were wired up) we got vague, generic output. When we gave it the research up front, it started sounding like us.

**How planning and precision influenced outcomes.** The plan-first rule was the best thing we did. Roughly half the time, the plan the AI proposed was wrong or went past scope, and we corrected it in prose, which was cheap. If we'd let it generate code first, we'd have been reviewing diffs instead of plans, which is slower and more error-prone. Precision in the plan (file names, function names, test cases) translated almost 1-to-1 into precision in the code. Vague plans produced vague code.

**How user- and domain-centred thinking mattered.** The ethics audit is the clearest evidence. Marcus and Bobby aren't just documents we wrote to tick a rubric box; they're the reason we noticed that a "bankruptcy bonus" is morally indefensible and that a "jackpot" sound on a 20× win is a lie. The AI will cheerfully build either of those unless someone on the team is asking "who is this for, and what happens to them?"

**How team norms and discipline mattered.** Three rules carried us. One, only one group talks to the AI at a time. That stops merge conflicts and contradictory prompts. Two, every prompt is archived and every turn is logged, so future turns can read the history and stay consistent. Three, humans commit, not the agent, which keeps the git history honest and forces a review pause between turns. Without those we'd have a faster, messier project.

**Will our team use AI going forward?** Yes, but not the way we started. We will not use it as a code generator you pour a vague prompt into. We will use it as a second-pair programmer that has to explain the plan before writing anything, has domain context loaded into it, and gets its output audited with a checklist before anything is merged. Effectively: the same rules as a junior engineer on their first week, plus a paper trail.

## 6. What we'd do differently next time

- Wire the linter and test runner into the AI's sandbox from day one so it can't "manually verify" anything.
- Write the paytable display and the math from a single source of truth. The Increment 17 audit found the paytable disconnect because we let the AI invent numbers in the UI and the math independently. One JSON file would have prevented that.
- Add a Playwright E2E test from around Increment 6, not at the end. We kept meaning to and kept shipping instead.
- Be more aggressive about rejecting output that silently changes the requirements (see the "multi-game → single-game" failure).

## 7. Team roster

| Member | Research focus | Increments (code) |
|---|---|---|
| Andre | Slot machine jargon / terminology | 2–5 (lint tool-chain, Wallet tests, GameManager refactor, controller tests) |
| Anvik | Legal restrictions (app) | 2–5 (partner on Group 1 increments, prompt authoring) |
| Yezhi | Real / physical slot machines | 6–10 (reel animation, win-loss visuals, theme, legal footer, README) |
| Jad | UI / UX, wireframes | 6–10 |
| Noah | User personas and stories | 6–10 |
| Iban | Free-to-play mobile slots | 11–16  (bet controls, audio engine, menu, drawer, auto-spin, daily bonus) |
| Abas | Types of users (novice vs experienced) | 11–16 |
| Cadie | Mobile gambling legal restrictions | 11–16 |
| Christine | Legal restrictions (general) | 17–20 (ethics audit, audit fixes, RTP sim, lint sweep, demo script) |
| Adam | Mobile slot apps (features / visuals) | 17–20 |
| Esha | Entertainment value, additional user stories | 17–20 |

Every member also contributed to [`plan/research-overview.md`](../plan/research-overview.md) and to prompt review during their group's active increment window.

## 8. Repository map

- `src/`: application code, three-layer architecture.
- `server/server.js`: Node.js/Express backend for global score persistence.
- `src/api/apiClient.js`: Frontend service for RESTful communication.
- `tests/`: Jest unit tests (42 passing).
- `scripts/rtp-sim.js`: headless Monte Carlo RTP validator.
- `scripts/force-demo-outcomes.js`: seeded sequence for the demo video.
- `plan/research-overview.md`: consolidated domain research.
- `plan/ai-plan.md`: the strategy that governed every prompt.
- `plan/increment-plan.md`: 20-increment sequence and group rotation.
- `plan/ai-use-log.md`: turn-by-turn log of everything the AI did.
- `plan/prompts/`: verbatim archive of every prompt we sent.
- `plan/audit-ethic-findings.md`: dark-pattern audit.
- `plan/final-lint-sweep.md`: final code-quality sweep.
- `final-report/`: this report, the slide deck PDF, and the presentation video.
