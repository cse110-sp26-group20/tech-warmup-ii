/**
 * @class Wallet
 * A persistent state wrapper that manages the player's bankroll using localStorage.
 */
export class Wallet {
    /**
     * Initializes the Wallet.
     * @param {number} [initialBalance=1000] - The starting balance if no existing balance is found.
     */
    constructor(initialBalance = 1000) {
        this.storageKey = 'slot_machine_bankroll';
        
        const savedBalance = this._loadBalance();
        if (savedBalance !== null) {
            this._balance = savedBalance;
        } else {
            this._balance = initialBalance;
            this._saveBalance(this._balance);
        }
    }

    /**
     * Loads the balance from localStorage.
     * @private
     * @returns {number|null} The saved balance, or null if not found.
     */
    _loadBalance() {
        if (typeof window !== 'undefined' && window.localStorage) {
            const saved = window.localStorage.getItem(this.storageKey);
            if (saved !== null) {
                const parsed = parseFloat(saved);
                return isNaN(parsed) ? null : parsed;
            }
        }
        return null;
    }

    /**
     * Saves the current balance to localStorage.
     * @private
     * @param {number} amount - The amount to save.
     */
    _saveBalance(amount) {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(this.storageKey, amount.toString());
        }
    }

    /**
     * Gets the current balance.
     * @returns {number} The current balance.
     */
    getBalance() {
        return this._balance;
    }

    /**
     * Deducts the wager from the balance if sufficient funds exist.
     * @param {number} amount - The wager amount to deduct.
     * @returns {boolean} True if the deduction was successful, false if insufficient funds.
     */
    deductBet(amount) {
        if (amount <= 0) return false;
        
        if (this._balance >= amount) {
            this._balance -= amount;
            this._saveBalance(this._balance);
            return true;
        }
        return false;
    }

    /**
     * Adds a winning amount to the balance.
     * @param {number} amount - The won amount.
     */
    addWin(amount) {
        if (amount > 0) {
            this._balance += amount;
            this._saveBalance(this._balance);
        }
    }
}