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

  const gameManager = new GameManager(
    wallet,
    executeSpin,
    PAYLINES,
    view,
    audioManager,
  );
  window.slotManager = gameManager;

  view.bindMenuEvents({
    onStartGame: () => {
      audioManager.unlockContext();
      audioManager.playAmbient();
      view.hideMenu();
      gameManager.startGame();
    },
    onOpenPaytable: () => {
      view.switchTab('tab-paytable');
      if (view.toggleDrawer) view.toggleDrawer(true);
    },
    onOpenSocial: () => {
      view.switchTab('tab-social');
      if (view.toggleDrawer) view.toggleDrawer(true);
    },
  });

  view.bindDrawerEvents({
    onToggleDrawer: (isOpen) => gameManager.setDrawerOpen(isOpen),
    onMuteToggle: (isMuted) => audioManager.toggleMute(isMuted),
    onVolumeChange: (volume) => audioManager.setVolume(volume),
    onResetBalance: () => gameManager.resetBalance(),
  });
});
