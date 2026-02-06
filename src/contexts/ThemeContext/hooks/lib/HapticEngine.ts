/**
 * HapticEngine.ts
 * 7-Pattern Haptic Feedback System for McCrea Market Metrics
 * 
 * Provides tactile feedback for market conditions using device vibration.
 * Maps to the 7-Bells audio system for consistent multi-sensory experience.
 */

export type HapticPattern = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface HapticConfig {
  pattern: number[];
  name: string;
  marketState: string;
  description: string;
}

/**
 * 7-Pattern Haptic Mapping (McCrea Market Metrics)
 * Patterns are arrays of [vibrate_ms, pause_ms, ...] sequences
 */
export const HAPTIC_PATTERNS: Record<HapticPattern, HapticConfig> = {
  1: {
    pattern: [100], // Single short pulse
    name: "Neutral Pulse",
    marketState: "Neutral/Stable",
    description: "Single gentle pulse - market is stable"
  },
  2: {
    pattern: [80, 100, 80], // Double pulse
    name: "Optimistic Pulse",
    marketState: "Slight Bullish",
    description: "Two quick pulses - gentle upward momentum"
  },
  3: {
    pattern: [80, 80, 80, 80, 80], // Triple pulse
    name: "Rising Pulse",
    marketState: "Moderate Bullish",
    description: "Three rhythmic pulses - clear bullish trend"
  },
  4: {
    pattern: [50, 50, 50, 50, 50, 50, 50], // Rapid pulse
    name: "Triumph Pulse",
    marketState: "Strong Bullish",
    description: "Rapid pulsing - powerful upward surge"
  },
  5: {
    pattern: [200], // Single long pulse
    name: "Caution Pulse",
    marketState: "Slight Bearish",
    description: "Single sustained pulse - gentle downward pressure"
  },
  6: {
    pattern: [200, 150, 200], // Two long pulses
    name: "Warning Pulse",
    marketState: "Moderate Bearish",
    description: "Two sustained pulses - clear bearish trend"
  },
  7: {
    pattern: [400], // Continuous vibration
    name: "Alert Pulse",
    marketState: "Strong Bearish",
    description: "Long continuous vibration - significant downward movement"
  }
};

export class HapticEngine {
  private isSupported: boolean = false;
  private intensity: number = 1.0;
  private isEnabled: boolean = true;

  constructor() {
    // Check if Vibration API is supported
    this.isSupported = 'vibrate' in navigator;
    
    if (!this.isSupported) {
      console.warn('Vibration API not supported on this device');
    }
  }

  /**
   * Check if haptic feedback is supported
   */
  isHapticSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Map coherence score (-1 to +1) to haptic pattern (1-7)
   */
  getPatternFromCoherence(coherence: number): HapticPattern {
    if (coherence >= 0.7) return 4;  // Strong Bullish
    if (coherence >= 0.3) return 3;  // Moderate Bullish
    if (coherence >= 0.1) return 2;  // Slight Bullish
    if (coherence >= -0.1) return 1; // Neutral
    if (coherence >= -0.3) return 5; // Slight Bearish
    if (coherence >= -0.7) return 6; // Moderate Bearish
    return 7; // Strong Bearish
  }

  /**
   * Scale pattern by intensity (0.0 to 1.0)
   */
  private scalePattern(pattern: number[]): number[] {
    return pattern.map(duration => Math.round(duration * this.intensity));
  }

  /**
   * Trigger a haptic pattern
   */
  triggerPattern(patternNumber: HapticPattern): void {
    if (!this.isSupported || !this.isEnabled) return;

    try {
      const config = HAPTIC_PATTERNS[patternNumber];
      const scaledPattern = this.scalePattern(config.pattern);
      navigator.vibrate(scaledPattern);
    } catch (error) {
      console.error('Error triggering haptic pattern:', error);
    }
  }

  /**
   * Trigger haptic based on coherence score
   */
  triggerCoherenceHaptic(coherence: number): void {
    const patternNumber = this.getPatternFromCoherence(coherence);
    this.triggerPattern(patternNumber);
  }

  /**
   * Trigger a sequence of patterns
   */
  async triggerSequence(patterns: HapticPattern[], interval: number = 500): Promise<void> {
    for (const pattern of patterns) {
      this.triggerPattern(pattern);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  /**
   * Stop all vibrations
   */
  stop(): void {
    if (this.isSupported) {
      navigator.vibrate(0);
    }
  }

  /**
   * Set intensity (0.0 to 1.0)
   */
  setIntensity(intensity: number): void {
    this.intensity = Math.max(0, Math.min(1, intensity));
  }

  /**
   * Get current intensity
   */
  getIntensity(): number {
    return this.intensity;
  }

  /**
   * Toggle haptic feedback
   */
  toggleEnabled(): void {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stop();
    }
  }

  /**
   * Get enabled status
   */
  isHapticEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get pattern configuration
   */
  getPatternConfig(patternNumber: HapticPattern): HapticConfig {
    return HAPTIC_PATTERNS[patternNumber];
  }

  /**
   * Test all patterns in sequence
   */
  async testAllPatterns(): Promise<void> {
    const sequence: HapticPattern[] = [1, 2, 3, 4, 1, 5, 6, 7];
    await this.triggerSequence(sequence, 800);
  }

  /**
   * Get device haptic capabilities description
   */
  getCapabilitiesDescription(): string {
    if (!this.isSupported) {
      return "Haptic feedback not supported on this device";
    }
    if (!this.isEnabled) {
      return "Haptic feedback disabled";
    }
    return `Haptic feedback enabled at ${Math.round(this.intensity * 100)}% intensity`;
  }
}

// Singleton instance
let hapticEngineInstance: HapticEngine | null = null;

export function getHapticEngine(): HapticEngine {
  if (!hapticEngineInstance) {
    hapticEngineInstance = new HapticEngine();
  }
  return hapticEngineInstance;
}
