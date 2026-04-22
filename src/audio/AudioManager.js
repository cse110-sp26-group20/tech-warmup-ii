/**
 * Procedural audio manager for the slot machine using the Web Audio API.
 */
export class AudioManager {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.5; // Default volume
    this.masterGain.connect(this.context.destination);
    
    this.isMuted = false;
    this.spinOsc = null;
    this.spinNoise = null;
    
    this.unlockContext();
  }

  /**
   * Unlocks the AudioContext on the first user interaction.
   */
  unlockContext() {
    const unlock = () => {
      if (this.context.state === 'suspended') {
        this.context.resume();
      }
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock, { passive: true });
  }

  /**
   * Toggles the master mute state.
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.masterGain.gain.value = this.isMuted ? 0 : 0.5;
  }

  /**
   * Plays the continuous spinning sound.
   */
  playSpin() {
    if (this.context.state === 'suspended') return;
    
    // Low frequency oscillator for mechanical whir
    this.spinOsc = this.context.createOscillator();
    this.spinOsc.type = 'sawtooth';
    this.spinOsc.frequency.value = 40;
    
    const oscGain = this.context.createGain();
    oscGain.gain.value = 0.1;
    this.spinOsc.connect(oscGain);
    oscGain.connect(this.masterGain);
    
    // Filtered white noise
    const bufferSize = this.context.sampleRate * 2; // 2 seconds buffer
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    this.spinNoise = this.context.createBufferSource();
    this.spinNoise.buffer = buffer;
    this.spinNoise.loop = true;
    
    const noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 400;
    
    const noiseGain = this.context.createGain();
    noiseGain.gain.value = 0.05;
    
    this.spinNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    this.spinOsc.start();
    this.spinNoise.start();
  }

  /**
   * Stops the continuous spinning sound.
   */
  stopSpin() {
    if (this.spinOsc) {
      this.spinOsc.stop();
      this.spinOsc.disconnect();
      this.spinOsc = null;
    }
    if (this.spinNoise) {
      this.spinNoise.stop();
      this.spinNoise.disconnect();
      this.spinNoise = null;
    }
  }

  /**
   * Plays a percussive "thud" for a reel stopping.
   */
  playReelStop() {
    if (this.context.state === 'suspended') return;
    
    const osc = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    osc.type = 'sine';
    
    // Pitch shift: fast drop from 150Hz to 40Hz
    osc.frequency.setValueAtTime(150, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.context.currentTime + 0.1);
    
    // Rapid decay envelope
    gainNode.gain.setValueAtTime(0.5, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.2);
  }

  /**
   * Plays a win sound, escalating based on the multiplier.
   * @param {number} multiplier - The win multiplier to determine intensity.
   */
  playWin(multiplier) {
    if (this.context.state === 'suspended') return;
    
    if (multiplier >= 20) {
      this.playJackpot();
    } else {
      this.playSmallWin(multiplier);
    }
  }

  /**
   * FM Synthesis for small/medium wins. Bright metallic bells.
   */
  playSmallWin(multiplier) {
    const time = this.context.currentTime;
    const dur = 1.0 + Math.min(multiplier * 0.1, 1.0); // Duration based on multiplier
    
    // Carrier oscillator
    const carrier = this.context.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = 400 + Math.min(multiplier * 10, 400); // Base freq scales with win
    
    // Modulator oscillator for FM
    const modulator = this.context.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.value = 800;
    
    const modGain = this.context.createGain();
    modGain.gain.value = 600; // Modulation depth
    
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    
    // Envelope
    const gainNode = this.context.createGain();
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.3, time + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + dur); // Decay
    
    carrier.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    modulator.start(time);
    carrier.start(time);
    
    modulator.stop(time + dur);
    carrier.stop(time + dur);
  }

  /**
   * Jackpot sound: complex escalating sequence of chords, resonant filter sweep.
   */
  playJackpot() {
    const time = this.context.currentTime;
    
    // Sequence of notes (arpeggio)
    const notes = [300, 400, 500, 600, 800, 1000, 1200, 1600];
    const noteLength = 0.15;
    
    notes.forEach((freq, index) => {
      const osc = this.context.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;
      
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      // Resonant filter sweep
      filter.frequency.setValueAtTime(freq * 0.5, time + index * noteLength);
      filter.frequency.linearRampToValueAtTime(freq * 4, time + index * noteLength + noteLength * 0.8);
      filter.Q.value = 10;
      
      const gainNode = this.context.createGain();
      gainNode.gain.setValueAtTime(0, time + index * noteLength);
      gainNode.gain.linearRampToValueAtTime(0.15, time + index * noteLength + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + index * noteLength + noteLength);
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      osc.start(time + index * noteLength);
      osc.stop(time + index * noteLength + noteLength);
    });
    
    // Final sustained chord
    const chordTime = time + notes.length * noteLength;
    [600, 800, 1200].forEach(freq => {
      const osc = this.context.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, chordTime);
      filter.frequency.exponentialRampToValueAtTime(4000, chordTime + 1.0);
      filter.Q.value = 5;
      
      const gainNode = this.context.createGain();
      gainNode.gain.setValueAtTime(0, chordTime);
      gainNode.gain.linearRampToValueAtTime(0.2, chordTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, chordTime + 3.0);
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      osc.start(chordTime);
      osc.stop(chordTime + 3.0);
    });
  }
}
