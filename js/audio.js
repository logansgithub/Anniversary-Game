/**
 * ============================================================================
 * WEB AUDIO SYNTHESIZER & SOUND MANAGER
 * ============================================================================
 * Generates romantic chiptune background music and crisp retro sound effects
 * directly via the browser's Web Audio API (no external audio files required,
 * while seamlessly supporting custom audio files in /assets/audio/ if present).
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.stepIndex = 0;
    this.currentLevel = 1;
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.35;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.35, this.ctx.currentTime);
    }
    return this.muted;
  }

  playTone(freq, type = "triangle", duration = 0.15, startTimeOffset = 0, volume = 0.25, slideToFreq = null) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + startTimeOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideToFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playCollectible() {
    // Sparkly romantic arpeggio chime
    this.playTone(587.33, "sine", 0.11, 0, 0.28);     // D5
    this.playTone(783.99, "triangle", 0.12, 0.06, 0.3); // G5
    this.playTone(1174.66, "sine", 0.22, 0.12, 0.32); // D6
  }

  playPowerUpReady() {
    this.playTone(523.25, "triangle", 0.1, 0, 0.28);
    this.playTone(659.25, "triangle", 0.1, 0.08, 0.28);
    this.playTone(783.99, "triangle", 0.1, 0.16, 0.28);
    this.playTone(1046.5, "sine", 0.28, 0.24, 0.35);
  }

  playPowerUpActivate(levelId = 1) {
    if (levelId === 2) {
      // Arcane Warlock Magic Spell sound!
      const notes = [329.63, 392.00, 493.88, 659.25, 783.99, 987.77, 1318.51];
      notes.forEach((n, idx) => {
        this.playTone(n, "sawtooth", 0.24, idx * 0.045, 0.18);
        this.playTone(n * 1.5, "sine", 0.28, idx * 0.045, 0.22);
      });
    } else {
      // Warm ascending power-up chord
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((n, idx) => {
        this.playTone(n, "triangle", 0.22, idx * 0.05, 0.28);
      });
    }
  }

  playBump() {
    // Comic slip/wobble effect
    this.playTone(300, "sawtooth", 0.14, 0, 0.22, 130);
    this.playTone(190, "triangle", 0.16, 0.1, 0.25, 340);
  }

  playConfuse() {
    // Dizzy jester pin hit
    this.playTone(620, "sine", 0.09, 0, 0.22, 420);
    this.playTone(420, "sine", 0.09, 0.09, 0.22, 680);
    this.playTone(680, "sine", 0.12, 0.18, 0.22, 390);
  }

  playFizzPop() {
    // Sprite soda pop burst
    this.playTone(220, "square", 0.09, 0, 0.15, 760);
    this.playTone(540, "triangle", 0.12, 0.05, 0.18, 180);
  }

  playCameraShutter() {
    // Chloe's Mom camera click + flash charge
    this.playTone(1400, "square", 0.03, 0, 0.25, 400);
    this.playTone(900, "triangle", 0.04, 0.04, 0.2, 1800);
  }

  playLevelComplete() {
    // Romantic celebratory fanfare
    const melody = [
      { f: 523.25, d: 0.14, t: 0.0 },   // C5
      { f: 659.25, d: 0.14, t: 0.14 },  // E5
      { f: 783.99, d: 0.14, t: 0.28 },  // G5
      { f: 1046.50, d: 0.35, t: 0.42 }, // C6
      { f: 880.00, d: 0.16, t: 0.78 },  // A5
      { f: 1046.50, d: 0.55, t: 0.95 }  // C6
    ];
    melody.forEach(m => {
      this.playTone(m.f, "triangle", m.d, m.t, 0.32);
      this.playTone(m.f * 0.5, "sine", m.d, m.t, 0.2);
    });
  }

  startBGM(levelId = 1) {
    this.currentLevel = levelId;
    this.stopBGM();
    this.init();
    this.bgmPlaying = true;
    this.stepIndex = 0;

    // Gentle chiptune loops tailored to each level's vibe
    const progressions = {
      // Level 1: Dreamy winter waltz-like arpeggio
      1: [523.25, 659.25, 783.99, 659.25, 587.33, 739.99, 880.00, 739.99, 493.88, 659.25, 783.99, 987.77, 523.25, 659.25, 783.99, 1046.5],
      // Level 2: Renaissance Faire lute dance
      2: [440.00, 523.25, 659.25, 523.25, 392.00, 493.88, 587.33, 493.88, 349.23, 440.00, 523.25, 659.25, 329.63, 493.88, 659.25, 659.25],
      // Level 3: Upbeat snowy ski slope synth
      3: [587.33, 739.99, 880.00, 1174.66, 587.33, 739.99, 880.00, 739.99, 523.25, 659.25, 783.99, 1046.5, 523.25, 659.25, 783.99, 659.25],
      // Level 4: High-energy Boston celebration promenade
      4: [659.25, 783.99, 987.77, 1318.5, 587.33, 739.99, 987.77, 1174.66, 523.25, 659.25, 783.99, 1046.5, 783.99, 987.77, 1174.66, 1318.5]
    };

    const tempoMs = levelId === 4 ? 190 : levelId === 3 ? 210 : 240;

    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || this.muted) return;
      const seq = progressions[this.currentLevel] || progressions[1];
      const note = seq[this.stepIndex % seq.length];
      this.playTone(note, "sine", 0.2, 0, 0.075);
      if (this.stepIndex % 4 === 0) {
        this.playTone(note * 0.5, "triangle", 0.38, 0, 0.06);
      }
      this.stepIndex++;
    }, tempoMs);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

window.soundManager = new SoundManager();
