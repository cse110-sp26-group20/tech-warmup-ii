/* global global */
import { jest } from '@jest/globals';
import { Wallet } from '../src/state/Wallet.js';

describe('Wallet', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};

    // Mock window and localStorage
    global.window = {
      localStorage: {
        getItem: jest.fn((key) => {
          return key in mockStorage ? mockStorage[key] : null;
        }),
        setItem: jest.fn((key, value) => {
          mockStorage[key] = value.toString();
        }),
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.window;
  });

  describe('Initialization and getBalance', () => {
    test('A. getBalance returns default balance (1000) when localStorage is empty', () => {
      const wallet = new Wallet();
      expect(wallet.getBalance()).toBe(1000);
      expect(global.window.localStorage.setItem).toHaveBeenCalledWith(
        'slot_machine_bankroll',
        '1000',
      );
    });

    test('A. getBalance returns custom initial balance when localStorage is empty', () => {
      const wallet = new Wallet(500);
      expect(wallet.getBalance()).toBe(500);
      expect(global.window.localStorage.setItem).toHaveBeenCalledWith(
        'slot_machine_bankroll',
        '500',
      );
    });

    test('A. getBalance loads from localStorage if present', () => {
      mockStorage['slot_machine_bankroll'] = '2500';
      const wallet = new Wallet();
      expect(wallet.getBalance()).toBe(2500);
      expect(global.window.localStorage.getItem).toHaveBeenCalledWith(
        'slot_machine_bankroll',
      );
    });

    test('A. getBalance handles invalid number in localStorage gracefully', () => {
      mockStorage['slot_machine_bankroll'] = 'invalid_data';
      const wallet = new Wallet();
      expect(wallet.getBalance()).toBe(1000);
    });
  });

  describe('deductBet', () => {
    test('B. deductBet deducts valid bet (success case) and persists', () => {
      const wallet = new Wallet(1000);
      const success = wallet.deductBet(100);
      expect(success).toBe(true);
      expect(wallet.getBalance()).toBe(900);
      expect(global.window.localStorage.setItem).toHaveBeenCalledWith(
        'slot_machine_bankroll',
        '900',
      );
    });

    test('C. deductBet rejects bet larger than current balance (insufficient funds)', () => {
      const wallet = new Wallet(100);
      const success = wallet.deductBet(200);
      expect(success).toBe(false);
      expect(wallet.getBalance()).toBe(100); // Balance unchanged
      expect(global.window.localStorage.setItem).toHaveBeenCalledTimes(1); // Only initial save
    });

    test('D. deductBet rejects zero bet', () => {
      const wallet = new Wallet(1000);
      const success = wallet.deductBet(0);
      expect(success).toBe(false);
      expect(wallet.getBalance()).toBe(1000); // Balance unchanged
      expect(global.window.localStorage.setItem).toHaveBeenCalledTimes(1); // Only initial save
    });

    test('E. deductBet rejects negative bet', () => {
      const wallet = new Wallet(1000);
      const success = wallet.deductBet(-50);
      expect(success).toBe(false);
      expect(wallet.getBalance()).toBe(1000); // Balance unchanged
      expect(global.window.localStorage.setItem).toHaveBeenCalledTimes(1); // Only initial save
    });
  });

  describe('addWin', () => {
    test('F. addWin increases balance correctly and persists (positive case)', () => {
      const wallet = new Wallet(1000);
      wallet.addWin(500);
      expect(wallet.getBalance()).toBe(1500);
      expect(global.window.localStorage.setItem).toHaveBeenCalledWith(
        'slot_machine_bankroll',
        '1500',
      );
    });

    test('G. addWin ignores zero win amount', () => {
      const wallet = new Wallet(1000);
      wallet.addWin(0);
      expect(wallet.getBalance()).toBe(1000); // Balance unchanged
      expect(global.window.localStorage.setItem).toHaveBeenCalledTimes(1); // Only initial save
    });

    test('addWin ignores negative win amount', () => {
      const wallet = new Wallet(1000);
      wallet.addWin(-100);
      expect(wallet.getBalance()).toBe(1000); // Balance unchanged
      expect(global.window.localStorage.setItem).toHaveBeenCalledTimes(1); // Only initial save
    });
  });

  describe('H. localStorage persistence', () => {
    test('Verifies a Wallet instance can restore previously saved balance', () => {
      const wallet1 = new Wallet(2000);
      wallet1.deductBet(100);
      wallet1.addWin(50);
      expect(wallet1.getBalance()).toBe(1950);
      expect(mockStorage['slot_machine_bankroll']).toBe('1950');

      const wallet2 = new Wallet();
      expect(wallet2.getBalance()).toBe(1950);
    });
  });
});
