/**
 * AudioEngine.ts
 * 7-Bells of McCrea Market Metrics - 432 Hz Harmonic Audio System
 * 
 * Provides multi-sensory audio feedback for market conditions using
 * harmonic frequencies based on the 432 Hz standard.
 */

export type BellType = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface BellConfig {
  frequency: number;
  name: string;
  marketState: string;
  description: string;
}

/**
 * 7-Bells Frequency Mapping (McCrea Market Metrics)
 * All frequencies derived from 432 Hz base (natural harmonic)
 */
export const BELLS: Record<BellType, BellConfig> = {
  1: {
    frequency: 432,
    name: "Base Bell",
    marketState: "Neutral/Stable",
    description: "Market is in equilibrium, no significant movement"
  },
  2: {
    frequency: 486, // φ × 432 ≈ 486
    name: "Golden Bell",
    marketState: "Slight Bullish",
    description: "Gentle upward momentum detected"
  },
  3: {
    frequency: 540, // 1.25 × 432
    name: "Rising Bell",
    marketState: "Moderate Bullish",
    description: "Clear bullish trend confirmed"
  },
  4: {
    frequency: 648, // 1.5 × 432
    name: "Triumph Bell",
    marketState: "Strong Bullish",
    description: "Powerful upward surge in progress"
  },
  5: {
    frequency: 378, // 0.875 × 432
    name: "Caution Bell",
    marketState: "Slight Bearish",
    description: "Gentle downward pressure detected"
  },
  6: {
    frequency: 324, // 0.75 × 432
    name: "Warning Bell",
    marketState: "Moderate Bearish",
    description: "Clear bearish trend confirmed"
  },
  7: {
    frequency: 216, // 0.5 × 432
    name: "Alert Bell",
    marketState: "Strong Bearish",
    description: "Significant downward movement in progress"
  }
};

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private currentOscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.3;
  private isMuted: boolean = false;
  private currentFrequency: number = 432; // Track current frequency for haptic sync

  constructor() {
    // AudioContext will be created on first user interaction
  }

  /**
   * Initialize AudioContext (must be called after user gesture)
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
    }
  }

  /**
   * Map coherence score (-1 to +1) to bell number (1-7)
   */
  getBellFromCoherence(coherence: number): BellType {
    if (coherence >= 0.7) return 4;  // Strong Bullish
    if (coherence >= 0.3) return 3;  // Moderate Bullish
    if (coherence >= 0.1) return 2;  // Slight Bullish
    if (coherence >= -0.1) return 1; // Neutral
    if (coherence >= -0.3) return 5; // Slight Bearish
    if (coherence >= -0.7) return 6; // Moderate Bearish
    return 7; // Strong Bearish
  }

  /**
   * Play a bell tone for a specific duration
   */
  playBell(bellNumber: BellType, duration: number = 1000): void {
    try {
      this.initAudioContext();
      
      if (!this.audioContext || !this.gainNode) return;

      // Stop any currently playing tone
      this.stop();

      const bell = BELLS[bellNumber];
      
      // Create oscillator
      this.currentOscillator = this.audioContext.createOscillator();
      this.currentOscillator.type = 'sine';
      this.currentOscillator.frequency.value = bell.frequency;
      this.currentFrequency = bell.frequency; // Store for haptic sync

      // Create envelope for natural bell sound
      const now = this.audioContext.currentTime;
      const attackTime = 0.01;
      const decayTime = duration / 1000;

      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(
        this.isMuted ? 0 : this.volume,
        now + attackTime
      );
      this.gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        now + attackTime + decayTime
      );

      // Connect and start
      this.currentOscillator.connect(this.gainNode);
      this.currentOscillator.start(now);
      this.currentOscillator.stop(now + attackTime + decayTime);

      this.isPlaying = true;

      // Clean up after tone finishes
      this.currentOscillator.onended = () => {
        this.isPlaying = false;
        this.currentOscillator = null;
      };

    } catch (error) {
      console.error('Error playing bell:', error);
    }
  }

  /**
   * Play bell based on coherence score
   */
  playCoherenceBell(coherence: number, duration: number = 1000): void {
    const bellNumber = this.getBellFromCoherence(coherence);
    this.playBell(bellNumber, duration);
  }

  /**
   * Play a sequence of bells (for alerts or patterns)
   */
  async playSequence(bells: BellType[], interval: number = 500): Promise<void> {
    for (const bell of bells) {
      this.playBell(bell, interval * 0.8);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  /**
   * Stop currently playing tone
   */
  stop(): void {
    if (this.currentOscillator && this.isPlaying) {
      try {
        this.currentOscillator.stop();
        this.currentOscillator.disconnect();
      } catch (error) {
        // Oscillator may have already stopped
      }
      this.currentOscillator = null;
      this.isPlaying = false;
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && !this.isMuted) {
      this.gainNode.gain.value = this.volume;
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Toggle mute
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.gainNode) {
      this.gainNode.gain.value = this.isMuted ? 0 : this.volume;
    }
  }

  /**
   * Get mute status
   */
  isMutedStatus(): boolean {
    return this.isMuted;
  }

  /**
   * Get bell configuration
   */
  getBellConfig(bellNumber: BellType): BellConfig {
    return BELLS[bellNumber];
  }

  /**
   * Get current frequency (for haptic synchronization)
   */
  getCurrentFrequency(): number {
    return this.currentFrequency;
  }

  /**
   * Test all bells in sequence
   */
  async testAllBells(): Promise<void> {
    const sequence: BellType[] = [1, 2, 3, 4, 1, 5, 6, 7];
    await this.playSequence(sequence, 600);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
let audioEngineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}
