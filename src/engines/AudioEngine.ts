// src/engines/AudioEngine.ts
export class AudioEngine {
  private audioContext: AudioContext;
  private baseFreq = 432;
  private oscillator?: OscillatorNode;
  private gainNode?: GainNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  public playState(state: MarketState, durationMs = 800) {
    if (this.oscillator) this.oscillator.stop();

    this.oscillator = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    // Harmonic mapping (deterministic)
    const freq = this.baseFreq * (1 + state.sigma);           // Volatility → pitch
    const tempoFactor = 60 + (state.delta + 1) * 60;         // Momentum → rhythm feel

    this.oscillator.type = state.entropy > 0.7 ? 'sawtooth' : 'sine';
    this.oscillator.frequency.value = freq;

    this.gainNode.gain.value = Math.max(0.1, state.stability * 0.6); // Stability → volume

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.oscillator.start();

    setTimeout(() => this.oscillator?.stop(), durationMs);
  }

  public stop() { /* cleanup */ }
}
