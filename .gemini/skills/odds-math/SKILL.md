---
name: odds-math
description: Use this skill to calculate slot machine odds, Return to Player (RTP), and establish probability weights for symbols.
---

# Odds & Math

**Role:** Expert Casino Game Architect
**Context:** Foundational domain knowledge for slot machine mathematical modeling and probability.

---

## 1. RTP (Return to Player)

**Definition & Calculation**
RTP (Return to Player) is the theoretical percentage of all wagered money that a slot machine is mathematically designed to pay back to players over a massive volume of spins (often millions). It is calculated simply as: 
`RTP = (Total Amount Returned to Players) / (Total Amount Wagered) * 100`
For example, a game with a 96% RTP is programmed to return an average of $96 for every $100 wagered. The remaining 4% represents the "House Edge."

**Significance in Context**
*   **Real-Money Gambling:** RTP is strictly regulated by governing bodies (such as state gaming commissions in NV or CA). It dictates the long-term profitability of the casino and must meet legal minimums to guarantee fairness and compliance.
*   **Social Casino (Free-to-Play):** Because the currency is virtual and cannot be cashed out, developers have more flexibility. RTP in social slots is often tuned higher (e.g., 100% to 120% during onboarding, settling around 95-98% later) to create a satisfying "Reward Loop." A generous RTP extends session times, keeps players engaged, and encourages eventual in-app purchases (e.g., coin packs) without risking real financial loss to the operator.

## 2. Probability & Weighting

**Virtual Reels & Symbol Weighting**
Modern digital slots (and even physical stepper slots with decoupled internal architecture) do not rely on equal probability for every symbol. Instead, they utilize "Virtual Reels." A virtual reel is a vast array of numbers mapped to specific symbols. 

**Symbol Weighting** means assigning different probabilities to different symbols. A low-value symbol (like a Cherry) might occupy 50 out of 100 virtual stops (a 50% probability), while a high-value symbol or a Jackpot trigger might occupy only 1 out of 100 stops (a 1% probability). 

**Probability per Reel Stop**
When a player presses the "SPIN" button, the Random Number Generator (RNG) instantly selects a number for each reel. The probability of any specific symbol landing on a given reel is:
`Probability = (Weight of the Symbol on that Reel) / (Total Weight of all Symbols on that Reel)`
Because outcomes are generated instantaneously by the RNG before the UI animation even begins, the visual spinning of the reels is purely cosmetic playback.

## 3. Paytable & Hit Frequency

**Paytable Structure**
The Paytable is the game's payout ruleset. It defines the exact multiplier or credit value awarded for landing specific combinations (e.g., matching three "7s" on an active payline, or landing three Scatters anywhere on the grid). It also dictates the behaviors of special mechanics like Wilds and Bonus triggers.

**Hit Frequency**
Hit Frequency is the percentage of total spins that result in *any* payout, regardless of the size. If a game has a 30% hit frequency, a player can expect some form of visual/audio win feedback roughly 3 out of every 10 spins.

**The Mathematical Relationship**
Hit Frequency and the Paytable are deeply interconnected. To maintain a specific RTP:
*   If you design a game with a **high Hit Frequency**, the Paytable must primarily offer very small payouts (sometimes even less than the initial bet, known as "false wins"). This keeps novice players emotionally engaged through constant feedback.
*   If you design a game with a **low Hit Frequency**, the Paytable can afford to offer massive multipliers. This creates a high-risk, high-reward environment preferred by experienced players chasing jackpots.

## 4. Developer's Math Model

To construct the core logic of a slot machine, a developer must define and balance several foundational variables in their mathematical model. In a decoupled architecture, this model strictly acts as the "brain," independent of the visual layer:

*   **Symbol Weights Array:** The data structure (often a weighted list or probability table) defined for *each individual reel*. Developers tweak these arrays to control exactly how often Wilds, Scatters, and top symbols appear.
*   **Paytable Multipliers:** A configuration dictionary detailing the payout values for all valid combinations (e.g., `{"cherry_3": 5, "cherry_4": 15, "cherry_5": 50}`).
*   **RTP Target:** The overarching mathematical goal. The developer must run simulations of millions of spins to prove that the combination of the Symbol Weights Array and the Paytable Multipliers mathematically converges on the desired RTP.
*   **Volatility/Variance Level:** The behavioral profile of the game.
    *   *Low Volatility:* Flatter weights, lower paytable multipliers, higher hit frequency. (Appeals to Casual/Escapist personas).
    *   *High Volatility:* Heavily weighted against top symbols, massive paytable multipliers, lower hit frequency. (Appeals to High Rollers/Experienced personas).