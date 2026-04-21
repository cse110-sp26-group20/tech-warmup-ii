import { calculatePayout, generateGrid, PAYTABLE } from '../src/logic/SlotMachineMath.js';

describe('SlotMachineMath', () => {

    describe('calculatePayout', () => {
        
        it('returns 0 for a completely losing grid', () => {
            const losingGrid = [
                ['CHERRY', 'LEMON', 'ORANGE'],
                ['PLUM', 'BELL', 'SEVEN'],
                ['CHERRY', 'PLUM', 'BELL']
            ];
            
            const result = calculatePayout(losingGrid, 1);
            expect(result.totalPayout).toBe(0);
            expect(result.winningLines.length).toBe(0);
        });

        const symbols = Object.keys(PAYTABLE);
        symbols.forEach((symbol) => {
            it(`correctly identifies a win for 3 ${symbol}s and applies correct multiplier`, () => {
                const grid = [
                    ['LEMON', 'ORANGE', 'PLUM'],
                    [symbol, symbol, symbol], 
                    ['CHERRY', 'BELL', 'LEMON']
                ];

                if (symbol === 'LEMON') grid[0][0] = 'SEVEN';
                if (symbol === 'CHERRY') grid[2][0] = 'SEVEN';
                if (symbol === 'ORANGE') grid[0][1] = 'SEVEN';
                
                const wagerPerLine = 1;
                const result = calculatePayout(grid, wagerPerLine);
                
                expect(result.totalPayout).toBe(PAYTABLE[symbol] * wagerPerLine);
                expect(result.winningLines.length).toBe(1);
                
                const win = result.winningLines[0];
                expect(win.symbol).toBe(symbol);
                expect(win.lineIndex).toBe(0); 
                expect(win.payout).toBe(PAYTABLE[symbol] * wagerPerLine);
            });
        });

        it('calculates multiple winning lines correctly', () => {
             const grid = [
                 ['CHERRY', 'CHERRY', 'CHERRY'],
                 ['ORANGE', 'PLUM', 'BELL'],
                 ['LEMON', 'LEMON', 'LEMON']
             ];

             const wagerPerLine = 2; 
             const result = calculatePayout(grid, wagerPerLine);

             const expectedPayout = (PAYTABLE['CHERRY'] * wagerPerLine) + (PAYTABLE['LEMON'] * wagerPerLine);
             expect(result.totalPayout).toBe(expectedPayout);
             expect(result.winningLines.length).toBe(2);
             
             const winLinesIndices = result.winningLines.map(w => w.lineIndex);
             expect(winLinesIndices).toContain(1); 
             expect(winLinesIndices).toContain(2); 
        });

        it('calculates diagonal winning lines correctly', () => {
            const grid = [
                ['SEVEN', 'CHERRY', 'LEMON'],
                ['PLUM', 'SEVEN', 'BELL'],
                ['ORANGE', 'CHERRY', 'SEVEN']
            ];

            const result = calculatePayout(grid, 1);
            expect(result.totalPayout).toBe(PAYTABLE['SEVEN']);
            expect(result.winningLines.length).toBe(1);
            expect(result.winningLines[0].lineIndex).toBe(3);
        });
    });

    describe('generateGrid', () => {
        it('generates a 3x3 grid with valid symbols', () => {
            const grid = generateGrid();
            expect(grid.length).toBe(3);
            grid.forEach(row => {
                expect(row.length).toBe(3);
                row.forEach(symbol => {
                    expect(Object.keys(PAYTABLE)).toContain(symbol);
                });
            });
        });
    });
});