export const STORAGE_KEY = 'slot_player_balance';
const DEFAULT_STARTING_BALANCE = 1000;

/**
 * Reads the current coin count from localStorage.
 * Defaults to the starting amount if no data exists.
 */
export function getBalance() {
    // In a browser environment, we access the global window.localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored === null || stored === undefined) {
        // Initialize with default balance if first time
        setBalance(DEFAULT_STARTING_BALANCE);
        return DEFAULT_STARTING_BALANCE;
    }
    
    return parseInt(stored, 10);
}

/**
 * Adds or subtracts coins from the total and saves it back to localStorage.
 * @param {number} amount - The amount to add (positive) or subtract (negative).
 * @returns {number} The new balance.
 */
export function updateBalance(amount) {
    const currentBalance = getBalance();
    const newBalance = currentBalance + amount;
    
    // Prevent negative balances (though the UI should prevent betting if < 0)
    const finalBalance = newBalance < 0 ? 0 : newBalance;
    setBalance(finalBalance);
    
    return finalBalance;
}

/**
 * Internal helper to simply save the balance to localStorage.
 */
function setBalance(amount) {
    localStorage.setItem(STORAGE_KEY, amount.toString());
}
