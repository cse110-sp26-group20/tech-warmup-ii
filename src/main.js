import { spin as executeSpin, PAYLINES } from './logic/SlotMachineMath.js';
import { Wallet } from './state/Wallet.js';

/**
 * Maps logic symbols to emoji representations.
 */
const SYMBOL_MAP = {
    'CHERRY': '🍒',
    'LEMON': '🍋',
    'ORANGE': '🍊',
    'PLUM': '🍇', // using grapes for plum
    'BELL': '🔔',
    'SEVEN': '🎰'
};

/**
 * Controller/Manager for the Slot Machine UI.
 */
class Manager {
    constructor() {
        this.wallet = new Wallet(1000);
        this.currentBet = 1;
        this.isSpinning = false;

        this.initDOM();
        this.bindEvents();
        this.updateUI();
    }

    initDOM() {
        this.balanceEl = document.getElementById('balance-amount');
        this.betEl = document.getElementById('bet-amount');
        this.statusEl = document.getElementById('status-message');
        this.spinBtn = document.getElementById('btn-spin');
        this.incBtn = document.getElementById('btn-increase-bet');
        this.decBtn = document.getElementById('btn-decrease-bet');
        this.cells = document.querySelectorAll('.slot-cell');
    }

    bindEvents() {
        this.spinBtn.addEventListener('click', () => this.handleSpinClick());
        this.incBtn.addEventListener('click', () => this.adjustBet(1));
        this.decBtn.addEventListener('click', () => this.adjustBet(-1));
    }

    updateUI() {
        this.balanceEl.textContent = `$${this.wallet.getBalance()}`;
        this.betEl.textContent = this.currentBet;
    }

    adjustBet(amount) {
        if (this.isSpinning) return;
        const newBet = this.currentBet + amount;
        if (newBet >= 1 && newBet <= 10) {
            this.currentBet = newBet;
            this.updateUI();
        }
    }

    clearWinEffects() {
        this.cells.forEach(cell => {
            cell.classList.remove('win-glow');
        });
        this.statusEl.textContent = '';
        this.statusEl.style.color = '#ffcccc';
    }

    handleSpinClick() {
        if (this.isSpinning) return;

        // Deduct Bet
        if (!this.wallet.deductBet(this.currentBet)) {
            this.statusEl.textContent = "Insufficient funds!";
            return;
        }

        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.updateUI();
        this.clearWinEffects();
        this.statusEl.textContent = "Spinning...";

        // Add spinning animation to cells
        this.cells.forEach(cell => cell.classList.add('spinning'));

        // Determine outcome immediately (instantaneous resolution)
        const result = executeSpin(this.currentBet);

        // Simulate spinning time before revealing the outcome
        setTimeout(() => {
            this.stopReels(result);
        }, 1000); // 1 second visual delay
    }

    stopReels(result) {
        this.cells.forEach(cell => cell.classList.remove('spinning'));

        // Update DOM with results
        const grid = result.grid;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const symbol = grid[row][col];
                const cell = document.querySelector(`.slot-cell[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    const span = cell.querySelector('.symbol');
                    if (span) {
                        span.textContent = SYMBOL_MAP[symbol] || '❓';
                    }
                }
            }
        }

        // Handle Wins
        if (result.totalPayout > 0) {
            this.showWinEffects(result);
            this.wallet.addWin(result.totalPayout);
        } else {
            this.statusEl.textContent = "Try again!";
        }

        this.updateUI();
        this.isSpinning = false;
        this.spinBtn.disabled = false;
    }

    showWinEffects(result) {
        this.statusEl.textContent = `WIN: $${result.totalPayout}!`;
        this.statusEl.style.color = '#ffd700';

        // Animate winning cells
        result.winningLines.forEach(lineResult => {
            const coords = PAYLINES[lineResult.lineIndex];
            if (coords) {
                coords.forEach(([r, c]) => {
                    const cell = document.querySelector(`.slot-cell[data-row="${r}"][data-col="${c}"]`);
                    if (cell) {
                        cell.classList.add('win-glow');
                    }
                });
            }
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.slotManager = new Manager();
});