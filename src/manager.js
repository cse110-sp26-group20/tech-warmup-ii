import { generateSpinOutcome, calculateWin } from './brain.js';
import { getBalance, updateBalance } from './wallet.js';

// --- State ---
let currentBet = 10;
let isSpinning = false;

// --- DOM Elements ---
const balanceDisplay = document.getElementById('balance-display');
const spinButton = document.getElementById('spin-button');
const gridDisplay = document.getElementById('grid-display');
const messageDisplay = document.getElementById('message-display');

/**
 * Initializes the UI with starting data.
 */
export function init() {
    updateBalanceUI(getBalance());
    spinButton.addEventListener('click', handleSpinClick);
    
    // Initial empty grid state
    const emptyGrid = [
        ['?', '?', '?', '?', '?'],
        ['?', '?', '?', '?', '?'],
        ['?', '?', '?', '?', '?']
    ];
    renderGrid(emptyGrid);
    messageDisplay.textContent = 'Ready to play! Bet: ' + currentBet;
}

/**
 * Updates the balance text on the screen.
 */
function updateBalanceUI(amount) {
    balanceDisplay.textContent = amount;
}

/**
 * The main sequence triggered when the user clicks "Spin".
 */
function handleSpinClick() {
    // 1. Check Locks: Don't allow multiple spins at once
    if (isSpinning) return;

    // 2. Validate Funds
    const currentBalance = getBalance();
    if (currentBalance < currentBet) {
        messageDisplay.textContent = 'Not enough coins!';
        return;
    }

    // --- SPIN STARTED ---
    isSpinning = true;
    spinButton.disabled = true;
    messageDisplay.textContent = 'Spinning...';

    // 3. Deduct Bet (Atomic-ish)
    updateBalanceUI(updateBalance(-currentBet));

    // Simulate a brief network/processing delay for the "Spin" feel
    setTimeout(() => {
        // 4. Generate Outcome (Math Engine)
        const outcomeMatrix = generateSpinOutcome();
        const winAmount = calculateWin(outcomeMatrix, currentBet);

        // 5. Update State & UI
        renderGrid(outcomeMatrix);

        if (winAmount > 0) {
            // Apply winnings to the wallet
            updateBalanceUI(updateBalance(winAmount));
            showWinEffects(winAmount);
        } else {
            messageDisplay.textContent = 'Try again!';
        }

        // --- SPIN COMPLETED ---
        isSpinning = false;
        spinButton.disabled = false;
        
    }, 500); // Fake half-second delay for the spin animation
}

/**
 * Renders the 2D array grid to the HTML DOM.
 */
function renderGrid(matrix) {
    // Clear existing grid
    gridDisplay.innerHTML = '';
    
    // Create new elements based on the outcome matrix
    matrix.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'grid-row';
        row.forEach(symbol => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'grid-cell';
            // Use an emoji mapping for visual feedback in the prototype
            cellDiv.textContent = getEmojiForSymbol(symbol);
            rowDiv.appendChild(cellDiv);
        });
        gridDisplay.appendChild(rowDiv);
    });
}

/**
 * Displays a celebratory message.
 */
function showWinEffects(winAmount) {
    messageDisplay.textContent = `🎉 You won ${winAmount} coins! 🎉`;
    // In a real app, we'd trigger particle systems and sounds here
}

/**
 * Helper to map text symbols to emojis for the UI.
 */
function getEmojiForSymbol(symbol) {
    const emojiMap = {
        'cherry': '🍒',
        'lemon': '🍋',
        'orange': '🍊',
        'plum': '🫐', // Using blueberry for plum
        'bell': '🔔',
        'wild': '⭐',
        '?': '❓'
    };
    return emojiMap[symbol] || symbol;
}

// Start the manager when the script loads
init();
