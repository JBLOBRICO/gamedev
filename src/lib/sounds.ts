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

  public playVictory() {
    const notes = [523.25, 523.25, 523.25, 523.25, 659.25, 587.33, 659.25, 783.99, 1046.50];
    const delays = [0, 150, 300, 450, 600, 750, 900, 1050, 1200];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.4, [0.15, 0.05, 0], [0.05, 0.25, 0.1]);
      }, delays[index]);
    });
  }
}

export const sounds = new SoundSystem();
export default sounds;
