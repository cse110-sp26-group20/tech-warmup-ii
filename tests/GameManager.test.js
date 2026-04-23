import { GameManager } from '../src/controller/GameManager.js';
import { jest } from '@jest/globals';

describe('GameManager', () => {
  let walletMock;
  let executeSpinMock;
  let viewMock;
  let paylines;
  let gameManager;

  beforeEach(() => {
    jest.useFakeTimers();

    walletMock = {
      getBalance: jest.fn().mockReturnValue(100),
      deductBet: jest.fn().mockReturnValue(true),
      addWin: jest.fn(),
    };

    executeSpinMock = jest.fn().mockReturnValue({
      grid: [
        ['A', 'A', 'A'],
        ['B', 'B', 'B'],
        ['C', 'C', 'C'],
      ],
      totalPayout: 50,
      winningLines: [{ lineIndex: 0, symbol: 'A', length: 3, payout: 50 }],
    });

    viewMock = {
      bindEvents: jest.fn(),
      updateUI: jest.fn(),
      updateStatus: jest.fn(),
      setSpinningState: jest.fn(),
      clearWinEffects: jest.fn(),
      renderGrid: jest.fn(),
      showWinEffects: jest.fn(),
      showLossEffects: jest.fn(),
      animateSpin: jest.fn(),
      setAutoSpinState: jest.fn(),
      updateStreak: jest.fn(),
      showDailyReward: jest.fn(),
    };

    paylines = [
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
    ];

    gameManager = new GameManager(
      walletMock,
      executeSpinMock,
      paylines,
      viewMock,
    );
    gameManager.startGame();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should bind view events and update UI initially', () => {
      expect(viewMock.bindEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          onSpinClick: expect.any(Function),
          onAdjustBet: expect.any(Function),
        }),
      );
      expect(viewMock.updateUI).toHaveBeenCalledWith(100, 1);
    });
  });

  describe('isSpinning Guard', () => {
    it('should prevent duplicate spins while already spinning', () => {
      gameManager.handleSpinClick();
      expect(gameManager.isSpinning).toBe(true);

      // Attempt second spin
      gameManager.handleSpinClick();

      // Deduct bet should only be called once
      expect(walletMock.deductBet).toHaveBeenCalledTimes(1);

      // Math evaluation should only be called once
      expect(executeSpinMock).toHaveBeenCalledTimes(1);

      // setSpinningState should only be called once with true
      expect(viewMock.setSpinningState).toHaveBeenCalledTimes(1);

      jest.runAllTimers();
    });
  });

  describe('Bet Deduction and Spin Flow', () => {
    it('should deduct bet and sequence actions correctly on a valid spin', () => {
      gameManager.handleSpinClick();

      // 1. Deduct bet
      expect(walletMock.deductBet).toHaveBeenCalledWith(1);

      // 2. State updates
      expect(gameManager.isSpinning).toBe(true);
      expect(viewMock.setSpinningState).toHaveBeenCalledWith(true);
      expect(viewMock.clearWinEffects).toHaveBeenCalled();
      expect(viewMock.updateStatus).toHaveBeenCalledWith('Spinning...');

      // 3. Evaluate spin (called before stopReels / timer)
      expect(executeSpinMock).toHaveBeenCalledWith(1);

      // Winnings should not be applied yet (timer hasn't fired)
      expect(walletMock.addWin).not.toHaveBeenCalled();

      // Resolve spin
      jest.runAllTimers();

      // 4. Stop reels and apply winnings
      expect(viewMock.setSpinningState).toHaveBeenCalledWith(false);
      expect(walletMock.addWin).toHaveBeenCalledWith(50);
      expect(gameManager.isSpinning).toBe(false);
    });

    it('should not continue spin flow if bet deduction fails (insufficient funds)', () => {
      walletMock.deductBet.mockReturnValue(false); // Simulate failure

      gameManager.handleSpinClick();

      expect(walletMock.deductBet).toHaveBeenCalledWith(1);
      expect(viewMock.updateStatus).toHaveBeenCalledWith('Insufficient funds!');

      // Spin flow should not continue
      expect(gameManager.isSpinning).toBe(false);
      expect(executeSpinMock).not.toHaveBeenCalled();
      expect(viewMock.setSpinningState).not.toHaveBeenCalled();
    });
  });

  describe('Win Callback Firing', () => {
    it('should apply winnings and update UI when the result is a win', () => {
      gameManager.handleSpinClick();
      jest.runAllTimers();

      expect(viewMock.renderGrid).toHaveBeenCalledWith(expect.any(Array));
      expect(viewMock.showWinEffects).toHaveBeenCalledWith(
        50,
        expect.any(Array),
        paylines,
      );
      expect(walletMock.addWin).toHaveBeenCalledWith(50);

      // One update UI on initialization, one on handleSpinClick, one on stopReels
      expect(viewMock.updateUI).toHaveBeenCalledTimes(3);
      expect(gameManager.isSpinning).toBe(false);
    });

    it('should handle non-winning spin correctly', () => {
      executeSpinMock.mockReturnValue({
        grid: [
          ['A', 'B', 'C'],
          ['C', 'A', 'B'],
          ['B', 'C', 'A'],
        ],
        totalPayout: 0,
        winningLines: [],
      });

      gameManager.handleSpinClick();
      jest.runAllTimers();

      expect(walletMock.addWin).not.toHaveBeenCalled();
      expect(viewMock.showWinEffects).not.toHaveBeenCalled();
      expect(viewMock.showLossEffects).toHaveBeenCalled();
      expect(gameManager.isSpinning).toBe(false);
    });
  });

  describe('Adjusting Bets', () => {
    it('should adjust bet when not spinning', () => {
      gameManager.adjustBet(1);
      expect(gameManager.currentBet).toBe(2);
      expect(viewMock.updateUI).toHaveBeenCalledWith(100, 2);
    });

    it('should prevent adjusting bet while spinning', () => {
      gameManager.handleSpinClick(); // triggers spinning state

      const beforeBet = gameManager.currentBet;
      gameManager.adjustBet(1);

      expect(gameManager.currentBet).toBe(beforeBet); // Bet should not change

      jest.runAllTimers();
    });

    it('should not allow bet to go below 1 or above wallet balance', () => {
      gameManager.adjustBet(-1); // should remain 1
      expect(gameManager.currentBet).toBe(1);

      for (let i = 0; i < 150; i++) {
        gameManager.adjustBet(1);
      }
      expect(gameManager.currentBet).toBe(100);
    });
  });

  describe('Auto-Spin', () => {
    it('should not start auto-spin with invalid spins', () => {
      gameManager.toggleAutoSpin(0);
      expect(gameManager.isAutoSpinning).toBe(false);
      expect(viewMock.updateStatus).toHaveBeenCalledWith('Enter a valid spin count (> 0)');
    });

    it('should start auto-spin and update UI', () => {
      gameManager.toggleAutoSpin(5);
      expect(gameManager.isAutoSpinning).toBe(true);
      expect(gameManager.autoSpinsRemaining).toBe(5);
      expect(viewMock.setAutoSpinState).toHaveBeenCalledWith(true, 5);
      expect(gameManager.isSpinning).toBe(true); // Should trigger first spin
      jest.runAllTimers(); // Resolve initial spin
    });

    it('should stop auto-spin manually', () => {
      gameManager.toggleAutoSpin(5); // Start
      expect(gameManager.isAutoSpinning).toBe(true);
      gameManager.toggleAutoSpin(0); // Stop manually
      expect(gameManager.isAutoSpinning).toBe(false);
      expect(gameManager.autoSpinsRemaining).toBe(0);
      expect(viewMock.setAutoSpinState).toHaveBeenCalledWith(false, 0);
      jest.runAllTimers(); // clear up any remaining timers
    });

    it('should stop auto-spin automatically when spins run out', () => {
      gameManager.toggleAutoSpin(1);
      expect(gameManager.isAutoSpinning).toBe(true);
      expect(gameManager.autoSpinsRemaining).toBe(1);

      // Resolve the spin (1 second visual delay + 0.8s pause delay)
      jest.runAllTimers();
      
      expect(gameManager.isAutoSpinning).toBe(false);
      expect(gameManager.autoSpinsRemaining).toBe(0);
      expect(viewMock.updateStatus).toHaveBeenCalledWith('Auto-Spin Complete');
    });

    it('should stop auto-spin if balance is insufficient', () => {
      walletMock.getBalance.mockReturnValue(0); // Simulate no money
      walletMock.deductBet.mockReturnValue(false); // Can't deduct
      
      gameManager.toggleAutoSpin(5);
      
      expect(gameManager.isAutoSpinning).toBe(false);
      expect(viewMock.updateStatus).toHaveBeenCalledWith('Insufficient funds for auto-spin!');
    });
  });

  describe('Daily Login/Retention Mechanic', () => {
    let mockStorage = {};
    const REAL_LOCAL_STORAGE = global.window ? global.window.localStorage : null;

    beforeEach(() => {
      mockStorage = {};
      if (!global.window) global.window = {};
      global.window.localStorage = {
        getItem: jest.fn((key) => mockStorage[key] || null),
        setItem: jest.fn((key, val) => { mockStorage[key] = val; }),
        removeItem: jest.fn((key) => { delete mockStorage[key]; }),
        clear: jest.fn(() => { mockStorage = {}; })
      };
      
      // We override showDailyReward to immediately fire the callback to test wallet logic
      viewMock.showDailyReward.mockImplementation((msg, cb) => cb());
    });

    afterEach(() => {
      if (global.window) {
        global.window.localStorage = REAL_LOCAL_STORAGE;
      }
      jest.useRealTimers();
    });

    it('should grant first-time login streak of 1 and $10 bonus', () => {
      const gm = new GameManager(walletMock, executeSpinMock, paylines, viewMock);
      gm.startGame(); // triggers checkDailyReward

      expect(viewMock.updateStreak).toHaveBeenCalledWith(1);
      expect(walletMock.addWin).toHaveBeenCalledWith(10);
      
      const savedData = JSON.parse(mockStorage['slot_machine_daily_data']);
      expect(savedData.streak).toBe(1);
      expect(savedData.lastLogin).toBe(new Date().toDateString());
    });

    it('should not grant a second reward on the same day', () => {
      // Simulate already logged in today
      mockStorage['slot_machine_daily_data'] = JSON.stringify({
        lastLogin: new Date().toDateString(),
        streak: 1
      });

      const gm = new GameManager(walletMock, executeSpinMock, paylines, viewMock);
      gm.startGame();

      // updateStreak is still called from constructor, but checkDailyReward returns early
      expect(viewMock.updateStreak).toHaveBeenCalledWith(1);
      expect(walletMock.addWin).not.toHaveBeenCalled(); // No extra reward
    });

    it('should increment streak and grant $20 on consecutive days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      mockStorage['slot_machine_daily_data'] = JSON.stringify({
        lastLogin: yesterday.toDateString(),
        streak: 1
      });

      const gm = new GameManager(walletMock, executeSpinMock, paylines, viewMock);
      gm.startGame();

      expect(viewMock.updateStreak).toHaveBeenCalledWith(2);
      expect(walletMock.addWin).toHaveBeenCalledWith(20); // 2 * 10
      
      const savedData = JSON.parse(mockStorage['slot_machine_daily_data']);
      expect(savedData.streak).toBe(2);
      expect(savedData.lastLogin).toBe(new Date().toDateString());
    });

    it('should reset streak to 1 if a day is missed', () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 5);
      
      mockStorage['slot_machine_daily_data'] = JSON.stringify({
        lastLogin: lastWeek.toDateString(),
        streak: 5
      });

      const gm = new GameManager(walletMock, executeSpinMock, paylines, viewMock);
      gm.startGame();

      expect(viewMock.updateStreak).toHaveBeenCalledWith(1);
      expect(walletMock.addWin).toHaveBeenCalledWith(10); // reset back to $10 bonus
      
      const savedData = JSON.parse(mockStorage['slot_machine_daily_data']);
      expect(savedData.streak).toBe(1);
    });

    it('should cap streak bonus at $50 (5 days)', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      mockStorage['slot_machine_daily_data'] = JSON.stringify({
        lastLogin: yesterday.toDateString(),
        streak: 10
      });

      const gm = new GameManager(walletMock, executeSpinMock, paylines, viewMock);
      gm.startGame();

      expect(viewMock.updateStreak).toHaveBeenCalledWith(11);
      expect(walletMock.addWin).toHaveBeenCalledWith(50); // Capped at $50
    });

    it('should grant the regular streak bonus even if balance is 0 (removed manipulative bankruptcy reward)', () => {
      walletMock.getBalance.mockReturnValue(0);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      mockStorage['slot_machine_daily_data'] = JSON.stringify({
        lastLogin: yesterday.toDateString(),
        streak: 3
      });

      const gm = new GameManager(walletMock, executeSpinMock, paylines, viewMock);
      gm.startGame();

      expect(viewMock.updateStreak).toHaveBeenCalledWith(4);
      // Flat bonus is now based purely on streak: 4 * 10 = 40
      expect(walletMock.addWin).toHaveBeenCalledWith(40);
      expect(viewMock.showDailyReward).toHaveBeenCalledWith(
        expect.stringContaining("Daily Streak: 4"), 
        expect.any(Function)
      );
    });
  });
});
