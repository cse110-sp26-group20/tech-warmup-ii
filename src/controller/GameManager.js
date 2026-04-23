/**
 * Controller/Manager for the Slot Machine logic.
 */
export class GameManager {
  /**
   * Constructs the GameManager.
   * @param {Object} wallet - The wallet instance managing the user's balance.
   * @param {Function} executeSpin - The function that calculates the spin result.
   * @param {Array<Array<number[]>>} paylines - The array of payline coordinates.
   * @param {Object} view - The view instance handling UI updates.
   * @param {Object} audioManager - The audio manager instance.
   */
  constructor(wallet, executeSpin, paylines, view, audioManager = null) {
    this.wallet = wallet;
    this.executeSpin = executeSpin;
    this.paylines = paylines;
    this.view = view;
    this.audioManager = audioManager;

    this.currentBet = 1;
    this.isSpinning = false;
    this.isActive = false;
    this.isDrawerOpen = false;
    this.isAutoSpinning = false;
    this.autoSpinsRemaining = 0;
    this.autoSpinStopLoss = null;
    this.autoSpinWinLimit = null;
    this.autoSpinStartBalance = 0;
    this.dailyStorageKey = 'slot_machine_daily_data';
    this.dailyData = this._loadDailyData();

    this.view.bindEvents({
      onSpinClick: () => this.handleSpinClick(),
      onAdjustBet: (amount) => this.adjustBet(amount),
      onAutoSpinToggle: (spins) => this.toggleAutoSpin(spins),
    });

    this.view.updateUI(this.wallet.getBalance(), this.currentBet);
    this.view.updateStreak(this.dailyData.streak);
  }

  /**
   * Starts the game session, allowing user input.
   */
  startGame() {
    this.isActive = true;
    this.checkDailyReward();
  }

  /**
   * Loads the daily data from localStorage.
   * @private
   * @returns {Object} The parsed daily data or a fresh default object.
   */
  _loadDailyData() {
    const defaultData = { lastLogin: null, streak: 0 };
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(this.dailyStorageKey);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to load daily data', e);
      }
    }
    return defaultData;
  }

  /**
   * Saves the daily data to localStorage.
   * @private
   */
  _saveDailyData() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        this.dailyStorageKey,
        JSON.stringify(this.dailyData),
      );
    }
  }

  /**
   * Checks for and applies daily login rewards and streaks.
   */
  checkDailyReward() {
    const today = new Date().toDateString();

    // Check if already logged in today
    if (this.dailyData.lastLogin === today) return;

    let reward = 0;
    let message = '';

    const lastLoginDate = this.dailyData.lastLogin
      ? new Date(this.dailyData.lastLogin)
      : null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Calculate Streak
    if (
      lastLoginDate &&
      lastLoginDate.toDateString() === yesterday.toDateString()
    ) {
      this.dailyData.streak++;
    } else {
      this.dailyData.streak = 1; // First day or missed day
    }

    // Apply rewards
    // Streak bonus: $10 per day, capped at $50
    reward = Math.min(this.dailyData.streak * 10, 50);
    message = `Daily Streak: ${this.dailyData.streak} 🔥! You earned a $${reward} bonus!`;

    this.dailyData.lastLogin = today;
    this._saveDailyData();
    this.view.updateStreak(this.dailyData.streak);

    if (reward > 0) {
      if (this.view.showDailyReward) {
        this.view.showDailyReward(message, () => {
          this.wallet.addWin(reward);
          this.view.updateUI(this.wallet.getBalance(), this.currentBet);
        });
      } else {
        // Fallback for tests without full view mock
        this.wallet.addWin(reward);
        this.view.updateUI(this.wallet.getBalance(), this.currentBet);
      }
    }
  }

  /**
   * Sets the drawer open state, pausing interactions when true.
   * @param {boolean} isOpen
   */
  setDrawerOpen(isOpen) {
    this.isDrawerOpen = isOpen;
  }

  /**
   * Resets the wallet balance to 1000 and updates UI.
   */
  resetBalance() {
    this.wallet.reset(1000);
    this.currentBet = 1;
    this.view.updateUI(this.wallet.getBalance(), this.currentBet);
    this.view.updateStatus('Balance reset!');
  }

  /**
   * Adjusts the current bet by a given amount.
   * @param {number} amount - The amount to change the bet by (+1 or -1).
   */
  adjustBet(amount) {
    if (!this.isActive || this.isSpinning || this.isDrawerOpen) return;

    const balance = this.wallet.getBalance();

    if (amount > 0 && this.currentBet >= balance) {
      this.view.updateStatus('Not enough balance!');
      return;
    }

    if (amount < 0 && this.currentBet <= 1) {
      this.view.updateStatus('Minimum bet is 1');
      return;
    }

    this.currentBet += amount;
    this.view.updateUI(balance, this.currentBet);

    if (this.currentBet === balance && amount > 0) {
      this.view.updateStatus('Max bet reached!');
    } else if (this.currentBet === 1 && amount < 0) {
      this.view.updateStatus('Minimum bet is 1');
    } else {
      this.view.updateStatus('');
    }
  }

  /**
   * Toggles the auto-spin mode.
   * @param {number} spins - The number of auto-spins to perform.
   */
  toggleAutoSpin(spins) {
    if (!this.isActive || this.isDrawerOpen) return;

    if (this.isAutoSpinning) {
      this.stopAutoSpin();
    } else {
      if (this.isSpinning) return;
      if (spins > 0) {
        this.startAutoSpin(spins);
      } else {
        this.view.updateStatus('Enter a valid spin count (> 0)');
      }
    }
  }

  /**
   * Starts the auto-spin loop.
   * @param {number} spins - Number of spins to execute.
   */
  startAutoSpin(spins) {
    if (this.wallet.getBalance() < this.currentBet) {
      this.view.updateStatus('Insufficient funds for auto-spin!');
      return;
    }

    this.isAutoSpinning = true;
    this.autoSpinsRemaining = spins;
    this.view.setAutoSpinState(true, this.autoSpinsRemaining);
    this.handleSpinClick(true);
  }

  /**
   * Stops the auto-spin loop immediately.
   */
  stopAutoSpin() {
    this.isAutoSpinning = false;
    this.autoSpinsRemaining = 0;
    this.view.setAutoSpinState(false, 0);
  }

  /**
   * Handles the action of clicking the spin button.
   * @param {boolean} [isAutoSpin=false] - Whether this spin is triggered automatically.
   */
  handleSpinClick(isAutoSpin = false) {
    if (!this.isActive || this.isSpinning || this.isDrawerOpen) return;

    if (this.isAutoSpinning && !isAutoSpin) return;

    // Deduct Bet
    if (!this.wallet.deductBet(this.currentBet)) {
      this.view.updateStatus('Insufficient funds!');
      if (this.isAutoSpinning) this.stopAutoSpin();
      return;
    }

    this.isSpinning = true;
    this.view.setSpinningState(true);
    this.view.updateUI(this.wallet.getBalance(), this.currentBet);
    this.view.clearWinEffects();
    this.view.updateStatus(
      this.isAutoSpinning
        ? `Auto-Spinning... (${this.autoSpinsRemaining})`
        : 'Spinning...',
    );

    if (this.audioManager) {
      this.audioManager.playSpin();
    }

    // Determine outcome immediately (instantaneous resolution)
    const result = this.executeSpin(this.currentBet);

    // Play visual spin animation
    this.view.animateSpin(result.grid, 1000, () => {
      if (this.audioManager) {
        this.audioManager.playReelStop();
      }
    });

    // Simulate spinning time before revealing the outcome
    setTimeout(() => {
      this.stopReels(result);
    }, 1000); // 1 second visual delay
  }

  /**
   * Stops the reels and updates the game state with the spin result.
   * @param {Object} result - The result of the spin.
   */
  stopReels(result) {
    if (this.audioManager) {
      this.audioManager.stopSpin();
    }

    this.view.setSpinningState(false);
    this.view.renderGrid(result.grid);

    // Handle Wins
    if (result.totalPayout > 0) {
      this.view.showWinEffects(
        result.totalPayout,
        result.winningLines,
        this.paylines,
      );
      this.wallet.addWin(result.totalPayout);
      if (this.audioManager) {
        this.audioManager.playWin(result.totalPayout / this.currentBet);
      }
    } else {
      this.view.showLossEffects();
    }

    this.view.updateUI(this.wallet.getBalance(), this.currentBet);
    this.isSpinning = false;

    if (this.isAutoSpinning) {
      this.autoSpinsRemaining--;
      this.view.setAutoSpinState(true, this.autoSpinsRemaining);

      const lossAmount = this.autoSpinStartBalance - this.wallet.getBalance();
      const hitStopLoss =
        this.autoSpinStopLoss !== null && lossAmount >= this.autoSpinStopLoss;
      const hitWinLimit =
        this.autoSpinWinLimit !== null &&
        result.totalPayout >= this.autoSpinWinLimit;

      if (hitStopLoss) {
        this.view.updateStatus('Stop Loss reached. Auto-Spin stopped.');
        this.stopAutoSpin();
      } else if (hitWinLimit) {
        this.view.updateStatus('Win Limit reached. Auto-Spin stopped.');
        this.stopAutoSpin();
      } else if (this.autoSpinsRemaining <= 0) {
        this.stopAutoSpin();
        this.view.updateStatus('Auto-Spin Complete');
      } else if (this.wallet.getBalance() < this.currentBet) {
        this.view.updateStatus('Insufficient funds! Auto-Spin stopped.');
        this.stopAutoSpin();
      } else {
        // Schedule next spin
        setTimeout(() => {
          if (this.isAutoSpinning) {
            this.handleSpinClick(true);
          }
        }, 800); // Pause between spins
      }
    }
  }
}
