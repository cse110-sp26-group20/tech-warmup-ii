import { spin as executeSpin, PAYLINES } from './logic/SlotMachineMath.js';
import { Wallet } from './state/Wallet.js';
import { View } from './ui/view.js';
import { GameManager } from './controller/GameManager.js';

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const wallet = new Wallet(1000);
  const view = new View();

  window.slotManager = new GameManager(wallet, executeSpin, PAYLINES, view);
});
