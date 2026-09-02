// Programmatic sound generator using Web Audio API to prevent asset loading issues

class SoundSystem {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch {
      console.warn("Web Audio API not supported");
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gainVals: number[], delays: number[] = [0]) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Resume context if suspended (browser security)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    
    let time = this.ctx.currentTime;
    gainVals.forEach((val, index) => {
      const delay = delays[index] || (duration / gainVals.length);
      time += delay;
      gainNode.gain.linearRampToValueAtTime(val, time);
    });
    
    // Ramp to zero at the end
    gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Sound effects
  public playClick() {
    this.playTone(800, 'sine', 0.05, [0.1, 0], [0.01, 0.04]);
  }

  public playCoin() {
    this.playTone(987.77, 'sine', 0.08, [0.15, 0.15], [0.02, 0.06]);
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.15, [0.15, 0], [0.02, 0.13]);
    }, 80);
  }

  public playDiceRoll() {
    // Generate dice roll rumbling
    let time = 0;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const freq = 100 + Math.random() * 80;
        this.playTone(freq, 'triangle', 0.08, [0.2, 0], [0.02, 0.06]);
      }, time);
      time += 70;
    }
  }

  public playDiceLand() {
    this.playTone(250, 'triangle', 0.1, [0.25, 0], [0.03, 0.07]);
    setTimeout(() => {
      this.playTone(400, 'sine', 0.08, [0.15, 0], [0.02, 0.06]);
    }, 40);
  }

  public playCorrect() {
    // Major chord arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.25, [0.12, 0], [0.05, 0.2]);
      }, index * 80);
    });
  }

  public playIncorrect() {
    // Minor second slide / buzz
    this.playTone(180, 'sawtooth', 0.35, [0.15, 0.02, 0], [0.05, 0.25, 0.05]);
    setTimeout(() => {
      this.playTone(150, 'sawtooth', 0.35, [0.15, 0.02, 0], [0.05, 0.25, 0.05]);
    }, 80);
  }

  public playLevelUp() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Ascending C major
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.3, [0.1, 0.05, 0], [0.05, 0.15, 0.1]);
      }, index * 60);
    });
  }

  public playSiren() {
    // Alert / Siren sound
    this.playTone(440, 'triangle', 0.5, [0.2, 0.2, 0], [0.1, 0.3, 0.1]);
    setTimeout(() => {
      this.playTone(554.37, 'triangle', 0.5, [0.2, 0.2, 0], [0.1, 0.3, 0.1]);
    }, 250);
  }

  // Tile-specific sound effects
  public playTrap() {
    // Scary sting — descending minor
    const notes = [440, 370, 311, 261];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.3, [0.18, 0.02, 0], [0.04, 0.2, 0.06]);
      }, i * 90);
    });
  }

  public playTreasure() {
    // Coin jingle — ascending sparkle
    const notes = [783.99, 987.77, 1174.66, 1567.98];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.25, [0.14, 0], [0.04, 0.21]);
      }, i * 70);
    });
  }

  public playTeleport() {
    // Sci-fi whoosh
    this.playTone(200, 'sine', 0.5, [0.0, 0.2, 0.15, 0], [0.05, 0.1, 0.2, 0.15]);
    setTimeout(() => {
      this.playTone(800, 'sine', 0.4, [0.15, 0], [0.1, 0.3]);
    }, 150);
  }

  public playBonus() {
    // Short cheerful ding
    this.playTone(659.25, 'sine', 0.2, [0.15, 0], [0.03, 0.17]);
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, [0.15, 0], [0.03, 0.17]), 100);
  }

  public playSkip() {
    // Frozen/clock stop feel
    this.playTone(300, 'triangle', 0.4, [0.1, 0.1, 0], [0.05, 0.25, 0.1]);
  }

  public playDiceReveal(value: number) {
    // Ascending notes based on dice value — higher roll = higher pitch
    const baseFreq = 300 + value * 60;
    this.playTone(baseFreq, 'sine', 0.4, [0.0, 0.2, 0.15, 0], [0.02, 0.1, 0.2, 0.08]);
    setTimeout(() => {
      this.playTone(baseFreq * 1.5, 'sine', 0.3, [0.15, 0], [0.05, 0.25]);
    }, 180);
  }

  public playVictory() {
    const notes = [523.25, 523.25, 523.25, 523.25, 659.25, 587.33, 659.25, 783.99, 1046.50];
    const delays = [0, 150, 300, 450, 600, 750, 900, 1050, 1200];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.4, [0.15, 0.05, 0], [0.05, 0.25, 0.1]);
      }, delays[index]);
    });
  }

  public playCombo() {
    // Rising two-tone horn — signals a multi-kill streak
    this.playTone(523.25, 'square', 0.15, [0.12, 0], [0.03, 0.12]);
    setTimeout(() => this.playTone(783.99, 'square', 0.2, [0.14, 0], [0.03, 0.17]), 130);
    setTimeout(() => this.playTone(1046.50, 'square', 0.25, [0.12, 0], [0.03, 0.22]), 260);
  }

  public playSuddenDeath() {
    // Heavy ominous gong — signals a sudden death
    this.playTone(95, 'sine', 0.9, [0.28, 0.2, 0.05, 0], [0.02, 0.2, 0.5, 0.35]);
    setTimeout(() => {
      const notes = [180, 150, 120, 90];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 'sawtooth', 0.3, [0.15, 0.02, 0], [0.04, 0.2, 0.06]);
        }, i * 120);
      });
    }, 300);
  }

  public playShift() {
    // Quick reverse slide — for reverse movement / swap events
    this.playTone(600, 'triangle', 0.2, [0.12, 0.08, 0], [0.03, 0.12, 0.06]);
    setTimeout(() => this.playTone(300, 'triangle', 0.25, [0.12, 0], [0.03, 0.2]), 160);
  }

  public playCoinsTriple() {
    // Faster, brighter coin cascade — 3x coin reward
    const notes = [987.77, 1318.51, 1567.98, 1975.53];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.12, [0.15, 0], [0.02, 0.1]);
      }, i * 60);
    });
  }
}

export const sounds = new SoundSystem();
export default sounds;
