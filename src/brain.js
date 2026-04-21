// Define how often each symbol appears (higher number = more common)
export const symbolWeights = {
    cherry: 50,
    lemon: 30,
    orange: 15,
    plum: 10,
    bell: 5,
    wild: 1 // Very rare
};

// Map winning combinations to payout multipliers (simplified for 3, 4, or 5 in a row)
// We'll use a simple format: "symbol_count": multiplier
export const paytable = {
    cherry_3: 2, cherry_4: 5, cherry_5: 10,
    lemon_3: 3, lemon_4: 8, lemon_5: 15,
    orange_3: 4, orange_4: 10, orange_5: 20,
    plum_3: 5, plum_4: 15, plum_5: 30,
    bell_3: 10, bell_4: 25, bell_5: 50,
    wild_3: 20, wild_4: 50, wild_5: 100
};

// Helper: Get an array of symbols based on their weights for random selection
function createWeightedArray(weights) {
    const arr = [];
    for (const [symbol, weight] of Object.entries(weights)) {
        for (let i = 0; i < weight; i++) {
            arr.push(symbol);
        }
    }
    return arr;
}

const weightedSymbolsArray = createWeightedArray(symbolWeights);

/**
 * Picks one symbol randomly based on the predefined weights.
 */
export function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * weightedSymbolsArray.length);
    return weightedSymbolsArray[randomIndex];
}

/**
 * Generates the outcome for a 5x3 grid.
 * Returns a 2D array: 3 rows, 5 columns.
 */
export function generateSpinOutcome() {
    const grid = [];
    const rows = 3;
    const cols = 5;

    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push(getRandomSymbol());
        }
        grid.push(row);
    }
    return grid;
}

/**
 * Checks the grid for wins based on the paytable.
 * For this MVP, we evaluate the 3 horizontal rows as our 3 paylines.
 */
export function calculateWin(outcomeMatrix, betAmount) {
    let totalMultiplier = 0;

    // Check each horizontal row (3 paylines)
    for (let r = 0; r < outcomeMatrix.length; r++) {
        const row = outcomeMatrix[r];
        let matchCount = 1;
        
        // Find the first symbol to match against (it could be wild)
        let firstSymbol = row[0];
        
        // Count consecutive matching symbols from left to right
        for (let c = 1; c < row.length; c++) {
            const currentSymbol = row[c];
            
            // If our first symbol was wild and we hit a non-wild, 
            // the non-wild becomes our target matching symbol
            if (firstSymbol === 'wild' && currentSymbol !== 'wild') {
                firstSymbol = currentSymbol;
            }
            
            // It matches if it's the exact same symbol OR if it's a wild substituting for it
            if (currentSymbol === firstSymbol || currentSymbol === 'wild' || firstSymbol === 'wild') {
                matchCount++;
            } else {
                break; // Winning lines must start from the leftmost reel and be consecutive
            }
        }

        // If we have 3 or more matches, check the paytable
        if (matchCount >= 3) {
            // If the whole line is wilds, our target symbol remains 'wild'
            const winKey = `${firstSymbol}_${matchCount}`;
            if (paytable[winKey]) {
                totalMultiplier += paytable[winKey];
            }
        }
    }

    return totalMultiplier * betAmount;
}
