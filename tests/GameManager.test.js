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

    it('should not allow bet to go below 1 or above 10', () => {
      gameManager.adjustBet(-1); // should remain 1
      expect(gameManager.currentBet).toBe(1);

      for (let i = 0; i < 15; i++) {
        gameManager.adjustBet(1);
      }
      expect(gameManager.currentBet).toBe(10);
    });
  });
});
