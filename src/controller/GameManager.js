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
   */
  constructor(wallet, executeSpin, paylines, view) {
    this.wallet = wallet;
    this.executeSpin = executeSpin;
    this.paylines = paylines;
    this.view = view;

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
    const newBet = this.currentBet + amount;
    if (newBet >= 1 && newBet <= 10) {
      this.currentBet = newBet;
      this.view.updateUI(this.wallet.getBalance(), this.currentBet);
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

    // Determine outcome immediately (instantaneous resolution)
    const result = this.executeSpin(this.currentBet);

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
    } else {
      this.view.updateStatus('Try again!');
    }

    this.view.updateUI(this.wallet.getBalance(), this.currentBet);
    this.isSpinning = false;
  }
}
