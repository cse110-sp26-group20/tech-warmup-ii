import { spin as executeSpin, PAYLINES } from './logic/SlotMachineMath.js';
import { Wallet } from './state/Wallet.js';
import { View } from './ui/view.js';
import { GameManager } from './controller/GameManager.js';
import { AudioManager } from './audio/AudioManager.js';

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  const wallet = new Wallet(1000);
  const view = new View();
  const audioManager = new AudioManager();

  window.slotManager = new GameManager(wallet, executeSpin, PAYLINES, view, audioManager);
});
