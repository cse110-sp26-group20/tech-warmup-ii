/**
 * Maps logic symbols to emoji representations.
 * @constant {Object<string, string>}
 */
const SYMBOL_MAP = {
  CHERRY: '🍒',
  LEMON: '🍋',
  ORANGE: '🍊',
  PLUM: '🍇', // using grapes for plum
  BELL: '🔔',
  SEVEN: '🎰',
};

/**
 * Handles DOM manipulation and UI rendering for the slot machine.
 */
export class View {
  /**
   * Initializes the View, querying required DOM elements.
   */
  constructor() {
    this.initDOM();
  }

  /**
   * Queries and caches DOM elements.
   */
  initDOM() {
    this.balanceEl = document.getElementById('balance-amount');
    this.betEl = document.getElementById('bet-amount');
    this.statusEl = document.getElementById('status-message');
    this.spinBtn = document.getElementById('btn-spin');
    this.incBtn = document.getElementById('btn-increase-bet');
    this.decBtn = document.getElementById('btn-decrease-bet');
    this.cells = document.querySelectorAll('.slot-cell');
  }

  /**
   * Binds event listeners to UI buttons.
   * @param {Object} handlers - Event handlers provided by the controller.
   * @param {Function} handlers.onSpinClick - Callback for the spin button.
   * @param {Function} handlers.onAdjustBet - Callback for the bet adjustment buttons.
   */
  bindEvents(handlers) {
    this.spinBtn.addEventListener('click', () => handlers.onSpinClick());

    const setupHoldToRepeat = (btn, amount) => {
      let holdTimeout = null;
      let repeatInterval = null;

      const stopHold = () => {
        if (holdTimeout) clearTimeout(holdTimeout);
        if (repeatInterval) clearInterval(repeatInterval);
        holdTimeout = null;
        repeatInterval = null;
      };

      const startHold = (e) => {
        if (e.type === 'touchstart' && e.cancelable) {
          e.preventDefault();
        }
        if (holdTimeout !== null || repeatInterval !== null) return;
        
        handlers.onAdjustBet(amount);
        
        holdTimeout = setTimeout(() => {
          repeatInterval = setInterval(() => {
            handlers.onAdjustBet(amount);
          }, 100);
        }, 500);
      };

      btn.addEventListener('mousedown', startHold);
      btn.addEventListener('touchstart', startHold, { passive: false });

      btn.addEventListener('mouseup', stopHold);
      btn.addEventListener('mouseleave', stopHold);
      btn.addEventListener('touchend', stopHold);
      btn.addEventListener('touchcancel', stopHold);
    };

    setupHoldToRepeat(this.incBtn, 1);
    setupHoldToRepeat(this.decBtn, -1);
  }

  /**
   * Updates the displayed balance and bet amounts.
   * @param {number} balance - The current balance.
   * @param {number} bet - The current bet amount.
   */
  updateUI(balance, bet) {
    this.balanceEl.textContent = `$${balance}`;
    this.betEl.textContent = bet;
  }

  /**
   * Updates the status message text and optionally its color.
   * @param {string} message - The status message to display.
   * @param {string|null} [color=null] - The CSS color to apply, or null to leave unchanged.
   */
  updateStatus(message, color = null) {
    this.statusEl.textContent = message;
    if (color !== null) {
      this.statusEl.style.color = color;
    }
  }

  /**
   * Toggles the UI state for spinning.
   * @param {boolean} isSpinning - Whether the slot machine is currently spinning.
   */
  setSpinningState(isSpinning) {
    this.spinBtn.disabled = isSpinning;
    if (isSpinning) {
      this.cells.forEach((cell) => cell.classList.add('spinning'));
    } else {
      this.cells.forEach((cell) => cell.classList.remove('spinning'));
      if (this.spinInterval) {
        clearInterval(this.spinInterval);
        this.spinInterval = null;
      }
    }
  }

  /**
   * Clears any winning visual effects and resets the status color.
   */
  clearWinEffects() {
    this.cells.forEach((cell) => {
      cell.classList.remove('win-glow', 'dimmed', 'loss-dim');
    });
    this.statusEl.textContent = '';
    this.statusEl.style.color = '#ffcccc';
  }

  /**
   * Gets a specific slot cell element.
   * @param {number} row - The row index.
   * @param {number} col - The column index.
   * @returns {Element|null} The DOM element or null.
   */
  getCell(row, col) {
    return document.querySelector(
      `.slot-cell[data-row="${row}"][data-col="${col}"]`,
    );
  }

  /**
   * Updates the symbol text content of a specific cell.
   * @param {number} row - The row index.
   * @param {number} col - The column index.
   * @param {string} symbolStr - The symbol text to set.
   */
  updateCell(row, col, symbolStr) {
    const cell = this.getCell(row, col);
    if (cell) {
      const span = cell.querySelector('.symbol');
      if (span) span.textContent = symbolStr;
    }
  }

  /**
   * Animates the spinning reels before revealing the final grid.
   * @param {string[][]} finalGrid - The precomputed final grid to display.
   * @param {number} duration - The total duration of the spin animation in ms.
   */
  animateSpin(finalGrid, duration) {
    const symbols = Object.values(SYMBOL_MAP);
    const intervalTime = 50;

    // Stop columns progressively
    const stopTimes = [duration * 0.33, duration * 0.66, duration];

    let elapsed = 0;
    let animationIndex = 0;

    if (this.spinInterval) {
      clearInterval(this.spinInterval);
    }

    this.spinInterval = setInterval(() => {
      elapsed += intervalTime;
      animationIndex++;

      for (let col = 0; col < 3; col++) {
        if (elapsed >= stopTimes[col]) {
          // Stop spinning for this column
          for (let row = 0; row < 3; row++) {
            this.updateCell(row, col, SYMBOL_MAP[finalGrid[row][col]] || '❓');
            const cell = this.getCell(row, col);
            if (cell) cell.classList.remove('spinning');
          }
        } else {
          // Cycle symbols
          for (let row = 0; row < 3; row++) {
            const symbolIndex = (animationIndex + row + col) % symbols.length;
            this.updateCell(row, col, symbols[symbolIndex]);
          }
        }
      }

      if (elapsed >= duration) {
        clearInterval(this.spinInterval);
        this.spinInterval = null;
      }
    }, intervalTime);
  }

  /**
   * Renders the symbol grid into the DOM.
   * @param {string[][]} grid - The 2D array of symbols to render.
   */
  renderGrid(grid) {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const symbol = grid[row][col];
        const cell = document.querySelector(
          `.slot-cell[data-row="${row}"][data-col="${col}"]`,
        );
        if (cell) {
          const span = cell.querySelector('.symbol');
          if (span) {
            span.textContent = SYMBOL_MAP[symbol] || '❓';
          }
        }
      }
    }
  }

  /**
   * Displays the winning amount and animates the winning paylines.
   * @param {number} totalPayout - The total amount won.
   * @param {Array<Object>} winningLines - The array of winning line objects.
   * @param {Array<Array<number[]>>} paylines - The array of payline coordinates.
   */
  showWinEffects(totalPayout, winningLines, paylines) {
    this.statusEl.textContent = `WIN: $${totalPayout}!`;
    this.statusEl.style.color = '#ffd700';

    // Dim all cells first to emphasize the win
    this.cells.forEach((cell) => cell.classList.add('dimmed'));

    // Animate winning cells
    winningLines.forEach((lineResult) => {
      const coords = paylines[lineResult.lineIndex];
      if (coords) {
        coords.forEach(([r, c]) => {
          const cell = document.querySelector(
            `.slot-cell[data-row="${r}"][data-col="${c}"]`,
          );
          if (cell) {
            cell.classList.remove('dimmed');
            cell.classList.add('win-glow');
          }
        });
      }
    });
  }

  /**
   * Provides minimal feedback for a non-winning spin.
   */
  showLossEffects() {
    this.statusEl.textContent = 'Try again!';
    this.statusEl.style.color = '#aaaaaa';
    this.cells.forEach((cell) => cell.classList.add('loss-dim'));
  }
}
