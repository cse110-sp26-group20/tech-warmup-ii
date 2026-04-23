/**
 * scripts/force-demo-outcomes.js
 * 
 * Inject this script into the browser console to force deterministic spin outcomes
 * for presentation and recording purposes.
 * 
 * Usage:
 * 1. Open DevTools in your browser.
 * 2. Paste this entire script and run it, or serve it and include it via <script>.
 * 3. Use `window.enableDemoMode()` to start intercepting spins.
 * 4. Use `window.disableDemoMode()` to restore normal random RNG gameplay.
 * 5. Use `window.resetDemoSequence()` to restart the deterministic sequence from the beginning.
 */

(function() {
  if (!window.slotManager) {
    console.error('[Demo Override] ERROR: window.slotManager is not available. Ensure the game is fully loaded first.');
    return;
  }

  // Same payout table as SlotMachineMath.js
  const PAYTABLE = {
    CHERRY: 5,
    LEMON: 15,
    ORANGE: 40,
    PLUM: 100,
    BELL: 500,
    SEVEN: 3000,
  };

  // 1. Small win: 3 CHERRY on Middle horizontal (row 1)
  const grid1 = [
    ['ORANGE', 'BELL', 'LEMON'],
    ['CHERRY', 'CHERRY', 'CHERRY'],
    ['LEMON', 'PLUM', 'ORANGE']
  ];

  // 2. Loss: No lines
  const grid2 = [
    ['ORANGE', 'PLUM', 'CHERRY'],
    ['LEMON', 'CHERRY', 'BELL'],
    ['BELL', 'LEMON', 'PLUM']
  ];

  // 3. Medium win: 3 ORANGE on Middle horizontal
  const grid3 = [
    ['LEMON', 'PLUM', 'CHERRY'],
    ['ORANGE', 'ORANGE', 'ORANGE'],
    ['BELL', 'CHERRY', 'LEMON']
  ];

  // 4. Near miss: 2 SEVENs and a PLUM on Middle horizontal
  const grid4 = [
    ['CHERRY', 'BELL', 'ORANGE'],
    ['SEVEN', 'SEVEN', 'PLUM'],
    ['BELL', 'LEMON', 'CHERRY']
  ];

  // 5. Jackpot: 3 SEVENs on Middle horizontal
  const grid5 = [
    ['CHERRY', 'LEMON', 'ORANGE'],
    ['SEVEN', 'SEVEN', 'SEVEN'],
    ['ORANGE', 'CHERRY', 'BELL']
  ];

  const grids = [grid1, grid2, grid3, grid4, grid5];
  let sequenceIndex = 0;

  // Store the original spin function to allow restoration
  const originalExecuteSpin = window.slotManager.executeSpin;
  let isDemoActive = false;

  /**
   * Helper to evaluate a specific payline
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
   * Helper to calculate payout using hardcoded PAYTABLE
   */
  function calculatePayout(grid, wagerPerLine) {
    let totalPayout = 0;
    const winningLines = [];
    const paylines = window.slotManager.paylines;

    paylines.forEach((line, index) => {
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
   * The overridden spin function
   */
  function forcedSpin(wagerPerLine = 1) {
    const grid = grids[sequenceIndex];
    const result = calculatePayout(grid, wagerPerLine);
    
    console.log(`[Demo Override] Forced spin sequence ${sequenceIndex + 1}/${grids.length}. Result: ${result.totalPayout > 0 ? 'Win ' + result.totalPayout : 'Loss'}`);

    // Cycle to next grid sequence
    sequenceIndex = (sequenceIndex + 1) % grids.length;

    return {
      grid,
      totalPayout: result.totalPayout,
      winningLines: result.winningLines,
    };
  }

  // --- Exposed Global APIs for Developers ---

  window.enableDemoMode = function() {
    if (isDemoActive) {
      console.log('[Demo Override] Already active.');
      return;
    }
    window.slotManager.executeSpin = forcedSpin;
    isDemoActive = true;
    console.log('[Demo Override] Activated! Deterministic outcomes will be forced.');
  };

  window.disableDemoMode = function() {
    if (!isDemoActive) return;
    window.slotManager.executeSpin = originalExecuteSpin;
    isDemoActive = false;
    console.log('[Demo Override] Deactivated! Normal RNG restored.');
  };

  window.resetDemoSequence = function() {
    sequenceIndex = 0;
    console.log('[Demo Override] Sequence index reset to 0 (Small Win next).');
  };

  console.log('[Demo Override] Script loaded. Type window.enableDemoMode() in console to start.');
})();
