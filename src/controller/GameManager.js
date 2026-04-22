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

    this.view.bindEvents({
      onSpinClick: () => this.handleSpinClick(),
      onAdjustBet: (amount) => this.adjustBet(amount),
    });

    this.view.updateUI(this.wallet.getBalance(), this.currentBet);
  }

  /**
   * Adjusts the current bet by a given amount.
   * @param {number} amount - The amount to change the bet by (+1 or -1).
   */
  adjustBet(amount) {
    if (this.isSpinning) return;

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
   * Handles the action of clicking the spin button.
   */
  handleSpinClick() {
    if (this.isSpinning) return;

    // Deduct Bet
    if (!this.wallet.deductBet(this.currentBet)) {
      this.view.updateStatus('Insufficient funds!');
      return;
    }

    this.isSpinning = true;
    this.view.setSpinningState(true);
    this.view.updateUI(this.wallet.getBalance(), this.currentBet);
    this.view.clearWinEffects();
    this.view.updateStatus('Spinning...');

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
  }
}
