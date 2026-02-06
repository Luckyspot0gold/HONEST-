/**
 * Web Audio API-based 432 Hz Harmonic Audio Engine
 * 
 * Generates real-time sine waves tuned to 432 Hz base frequency
 * with 7-bell harmonic system mapped to market dimensions.
 */

const BASE_FREQUENCY = 432; // Hz - Universal harmonic frequency

// 7-Bell Harmonic Ratios (based on musical intervals)
const HARMONIC_RATIOS = [
  1.0,    // Fundamental (432 Hz)
  9/8,    // Major second
  5/4,    // Major third
  4/3,    // Perfect fourth
  3/2,    // Perfect fifth
  5/3,    // Major sixth
  15/8,   // Major seventh
];

// Dimension to Bell mapping
const DIMENSION_TO_BELL: Record<string, number> = {
  price: 0,      // Fundamental
  volume: 1,     // Major second
  momentum: 2,   // Major third
  sentiment: 3,  // Perfect fourth
  temporal: 4,   // Perfect fifth
  spatial: 5,    // Major sixth
};

export interface EigenstateAudioData {
  dimensions: {
    price: number;
    volume: number;
    momentum: number;
    sentiment: number;
    temporal: number;
    spatial: number;
  };
  coherence: number;
  phase_angle: number;
}

export class WebAudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: Map<string, OscillatorNode> = new Map();
  private gains: Map<string, GainNode> = new Map();
  private isPlaying: boolean = false;
  private currentData: EigenstateAudioData | null = null;

  constructor() {
    // Audio context will be created on first user interaction
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Master volume
      this.masterGain.connect(this.audioContext.destination);

      console.log('[WebAudioEngine] Initialized at sample rate:', this.audioContext.sampleRate);
    } catch (error) {
      console.error('[WebAudioEngine] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Start playing harmonic tones based on eigenstate data
   */
  async start(data: EigenstateAudioData): Promise<void> {
    if (!this.audioContext || !this.masterGain) {
      await this.initialize();
    }

    if (this.isPlaying) {
      this.updateTones(data);
      return;
    }

    this.currentData = data;
    this.isPlaying = true;

    // Create oscillators for each dimension
    const dimensions = Object.keys(data.dimensions) as Array<keyof typeof data.dimensions>;
    
    dimensions.forEach((dimension) => {
      this.createOscillator(dimension, data);
    });

    console.log('[WebAudioEngine] Started playing');
  }

  /**
   * Create oscillator for a specific dimension
   */
  private createOscillator(dimension: keyof EigenstateAudioData['dimensions'], data: EigenstateAudioData): void {
    if (!this.audioContext || !this.masterGain) return;

    const bellIndex = DIMENSION_TO_BELL[dimension] || 0;
    const frequency = BASE_FREQUENCY * HARMONIC_RATIOS[bellIndex];
    const amplitude = Math.abs(data.dimensions[dimension]); // 0-1 range

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    // Create gain node for this oscillator
    const gain = this.audioContext.createGain();
    gain.gain.value = amplitude * 0.15; // Scale down individual volumes

    // Connect: oscillator -> gain -> master gain -> destination
    oscillator.connect(gain);
    gain.connect(this.masterGain);

    // Start oscillator
    oscillator.start();

    // Store references
    this.oscillators.set(dimension, oscillator);
    this.gains.set(dimension, gain);
  }

  /**
   * Update tone parameters based on new eigenstate data
   */
  updateTones(data: EigenstateAudioData): void {
    if (!this.audioContext || !this.isPlaying) return;

    this.currentData = data;

    const dimensions = Object.keys(data.dimensions) as Array<keyof typeof data.dimensions>;
    
    dimensions.forEach((dimension) => {
      const gain = this.gains.get(dimension);
      if (gain) {
        const amplitude = Math.abs(data.dimensions[dimension]);
        // Smooth transition
        gain.gain.linearRampToValueAtTime(
          amplitude * 0.15,
          this.audioContext!.currentTime + 0.1
        );
      }
    });

    // Adjust master volume based on coherence
    if (this.masterGain) {
      const coherenceVolume = 0.2 + (data.coherence + 1) * 0.1; // 0.2 to 0.4 range
      this.masterGain.gain.linearRampToValueAtTime(
        coherenceVolume,
        this.audioContext.currentTime + 0.1
      );
    }
  }

  /**
   * Stop all oscillators
   */
  stop(): void {
    if (!this.isPlaying) return;

    this.oscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch (error) {
        // Oscillator may already be stopped
      }
    });

    this.oscillators.clear();
    this.gains.clear();
    this.isPlaying = false;

    console.log('[WebAudioEngine] Stopped playing');
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext!.currentTime + 0.05
      );
    }
  }

  /**
   * Get current playing state
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current eigenstate data
   */
  getCurrentData(): EigenstateAudioData | null {
    return this.currentData;
  }

  /**
   * Cleanup and dispose
   */
  dispose(): void {
    this.stop();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.masterGain = null;
  }
}

// Singleton instance
let webAudioEngineInstance: WebAudioEngine | null = null;

export function getWebAudioEngine(): WebAudioEngine {
  if (!webAudioEngineInstance) {
    webAudioEngineInstance = new WebAudioEngine();
  }
  return webAudioEngineInstance;
}
