# Frontend Architecture Spec (2-Day Prototype)

## 1. The 3-Layer Architecture
We are building this fast but keeping the data separate from the visuals. This means we can plug in a real database later without rewriting the UI. 

### Layer 1: The Brain (Math/Logic)
This layer handles the rules and the randomness. It doesn't know anything about the screen or the animations.

*   **Variables:**
    *   `symbolWeights`: Defines how often each symbol appears (e.g., `{ cherry: 50, seven: 5 }`).
    *   `paytable`: Maps winning combinations to payout multipliers (e.g., `{ cherry_3: 5, seven_3: 50 }`).
*   **Functions:**
    *   `getRandomSymbol(reelWeights)`: Picks one symbol based on the provided weights.
    *   `generateSpinOutcome()`: Runs `getRandomSymbol` for all spots on the grid and returns the final result (e.g., a 2D array for a 5x3 grid).
    *   `calculateWin(outcomeMatrix, betAmount)`: Checks the grid against the `paytable` and returns the total coins won.

### Layer 2: The Wallet (Fake DB / Storage)
This layer saves and loads the player's coins. For now, it's just a simple wrapper around `localStorage`.

*   **Variables:**
    *   `STORAGE_KEY`: The string key used for `localStorage` (e.g., `'slot_player_balance'`).
*   **Functions:**
    *   `getBalance()`: Reads the current coin count from `localStorage`. Defaults to a starting amount if empty.
    *   `updateBalance(amount)`: Adds or subtracts coins from the total and saves it back to `localStorage`.

### Layer 3: The Manager (Controller)
This layer is the glue. It handles user clicks, talks to the Wallet and the Brain, and tells the UI what to do.

*   **Variables:**
    *   `currentBet`: The amount the player wants to wager on the next spin.
    *   `isSpinning`: A simple boolean flag to block the Spin button so the player can't click it again while the reels are moving.
*   **Functions:**
    *   `handleSpinClick()`: The main sequence. Checks `isSpinning`. If false, checks if `getBalance()` has enough coins. If yes, deducts the bet, calls `generateSpinOutcome()` and `calculateWin()`, updates the Wallet, and passes the result to the UI functions.
    *   `playReelAnimations(outcomeMatrix)`: Tells the visual layer to start spinning and exactly where to stop.
    *   `showWinEffects(winAmount)`: Triggers the celebration graphics and sounds if the player won.
