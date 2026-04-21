---
name: slot-basics
description: Use this skill to understand and implement core slot machine mechanics, including grid layouts, reel structures, paylines, and basic symbol behaviors.
---

# Slot Machine Basics (Domain Knowledge)

## 1. Concept Definition
In a digital context, a slot machine is a software-driven game of chance where players wager credits (either real money or virtual currency) to spin reels and win based on matching symbol combinations. Unlike mechanical machines, digital slots are entirely virtual, relying on software to determine outcomes. In social and mobile entertainment contexts, the focus shifts away from financial gambling toward pure entertainment, utilizing "fake currency," vibrant visual themes, and engaging retention mechanics (like daily missions, leaderboards, and reward loops) to provide a satisfying, risk-free experience.

## 2. Core Mechanics
* **Reels and Grid**: The play area is defined by a grid of vertical columns (Reels) and horizontal positions (Rows). A common digital layout is a 5x3 grid. The reels spin to randomize the display.
* **Symbols**: The icons that populate the reels. These include:
  * *Standard Symbols*: Low or high-value icons that form basic wins.
  * *Wilds*: Special symbols that substitute for others to help complete winning combinations.
  * *Scatters / Bonus Symbols*: Symbols that trigger special features (like Free Spins or minigames) and often pay out regardless of where they land.
* **Paylines**: Specific, pre-defined patterns across the reels. A player wins if a required combination of matching symbols lands along an active payline. Modern digital slots also utilize "Ways to Win" (matching symbols on adjacent reels) or "Cluster Pays."
* **RNG (Random Number Generator)**: The fundamental algorithm that drives the game. The RNG continuously generates random numbers. The exact millisecond a player presses "Spin," the RNG determines the final outcome. The outcome is statistically independent, meaning previous spins do not influence future ones, ensuring complete fairness.

## 3. Developer's Perspective
From a technical standpoint, a modern digital slot machine relies on a strictly decoupled architecture:
* **Core Logic / Math Engine (RNG)**: This is the brain of the game. It runs the RNG to determine the spin outcome instantly upon user input. It handles all probability calculations, payout rules (Paytable), Return to Player (RTP) percentages, and volatility constraints.
* **State Management**: The system responsible for tracking the player's current session. It manages the player's balance, wager amount, and current game phase (e.g., base game vs. bonus round). It must be robust to ensure data integrity and prevent state loss during interruptions.
* **UI / Presentation Layer**: The frontend experience, completely separated from the outcome logic. Once the math engine determines the result, this layer "plays back" that outcome through animations, sound effects, and visual feedback (often called "juice"). It handles the responsive layout, the spinning animations, particle explosions for wins, and user controls (like the Spin and Bet buttons), focusing purely on engagement and user experience.