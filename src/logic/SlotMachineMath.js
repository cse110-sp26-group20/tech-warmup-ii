/**
 * @typedef {'CHERRY' | 'LEMON' | 'ORANGE' | 'PLUM' | 'BELL' | 'SEVEN'} SymbolType
 */

/**
 * Symbol weights mapping, defining the probability out of 100 per stop.
 * @type {Record<SymbolType, number>}
 */
export const SYMBOL_WEIGHTS = {
  CHERRY: 45,
  LEMON: 25,
  ORANGE: 15,
  PLUM: 10,
  BELL: 4,
  SEVEN: 1,
};

/**
 * Payout multipliers for a 3-of-a-kind match.
 * @type {Record<SymbolType, number>}
 */
export const PAYTABLE = {
  CHERRY: 5,
  LEMON: 15,
  ORANGE: 40,
  PLUM: 100,
  BELL: 500,
  SEVEN: 3000,
};

/**
 * Definition of the 5 standard paylines for a 3x3 grid.
 * Each payline is an array of coordinate pairs [row, col].
 */
export const PAYLINES = [
  [
    [1, 0],
    [1, 1],
    [1, 2],
  ], // Middle horizontal (index 0)
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ], // Top horizontal (index 1)
  [
    [2, 0],
    [2, 1],
    [2, 2],
  ], // Bottom horizontal (index 2)
  [
    [0, 0],
    [1, 1],
    [2, 2],
  ], // Diagonal down (index 3)
  [
    [2, 0],
    [1, 1],
    [0, 2],
  ], // Diagonal up (index 4)
];

/**
 * Generates a random integer between 0 (inclusive) and max (exclusive).
 * @param {number} max - The exclusive upper bound.
 * @returns {number} The random integer.
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Selects a random symbol based on the defined weights.
 * @returns {SymbolType} The selected symbol.
 */
export function getRandomSymbol() {
  const totalWeight = 100;
  const randomThreshold = getRandomInt(totalWeight);

  let cumulativeWeight = 0;
  for (const [symbol, weight] of Object.entries(SYMBOL_WEIGHTS)) {
    cumulativeWeight += weight;
    if (randomThreshold < cumulativeWeight) {
      return /** @type {SymbolType} */ (symbol);
    }
  }
  return 'CHERRY'; // Fallback
}

/**
 * Generates a single reel (a column of 3 symbols).
 * @returns {SymbolType[]} An array representing one reel.
 */
function generateReel() {
  return [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
}

/**
 * Generates a full 3x3 grid of symbols.
 * Reels are generated independently.
 * @returns {SymbolType[][]} A 3x3 matrix representing the slot grid (row x col).
 */
export function generateGrid() {
  // Generate 3 reels (columns), then transpose to rows for easier row x col access
  const reels = [generateReel(), generateReel(), generateReel()];

  const grid = [
    [reels[0][0], reels[1][0], reels[2][0]],
    [reels[0][1], reels[1][1], reels[2][1]],
    [reels[0][2], reels[1][2], reels[2][2]],
  ];

  return grid;
}

/**
 * Checks if a specific payline has a winning combination on the grid.
 * @param {SymbolType[][]} grid - The 3x3 grid.
 * @param {number[][]} line - The array of [row, col] coordinates for the payline.
 * @returns {SymbolType | null} The winning symbol, or null if no win.
 */
function getWinningSymbol(grid, line) {
  const [r0, c0] = line[0];
  const [r1, c1] = line[1];
  const [r2, c2] = line[2];

  const symbol1 = grid[r0][c0];
  const symbol2 = grid[r1][c1];
  const symbol3 = grid[r2][c2];

  if (symbol1 === symbol2 && symbol2 === symbol3) {
    return symbol1;
  }
  return null;
}

/**
 * Calculates the total payout and identifies winning lines for a given grid.
 * @param {SymbolType[][]} grid - The 3x3 grid of symbols.
 * @param {number} [wagerPerLine=1] - The wager applied to each active payline.
 * @returns {{totalPayout: number, winningLines: Array<{lineIndex: number, symbol: SymbolType, payout: number}>}} The payout result.
 */
export function calculatePayout(grid, wagerPerLine = 1) {
  let totalPayout = 0;
  const winningLines = [];

  PAYLINES.forEach((line, index) => {
    const winningSymbol = getWinningSymbol(grid, line);

    if (winningSymbol) {
      const multiplier = PAYTABLE[winningSymbol] || 0;
      const payout = multiplier * wagerPerLine;

      totalPayout += payout;
      winningLines.push({
        lineIndex: index,
        symbol: winningSymbol,
        payout: payout,
      });
    }
  });

  return { totalPayout, winningLines };
}

/**
 * Performs a complete spin: generates the grid and calculates payouts.
 * @param {number} [wagerPerLine=1] - Wager per active line.
 * @returns {{grid: SymbolType[][], totalPayout: number, winningLines: Array<{lineIndex: number, symbol: SymbolType, payout: number}>}} The spin result.
 */
export function spin(wagerPerLine = 1) {
  const grid = generateGrid();
  const result = calculatePayout(grid, wagerPerLine);
  return {
    grid,
    totalPayout: result.totalPayout,
    winningLines: result.winningLines,
  };
}
