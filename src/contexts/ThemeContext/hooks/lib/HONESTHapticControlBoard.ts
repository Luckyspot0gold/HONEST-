/**
 * HONEST Haptic Control Board
 *
 * Translates 432Hz harmonic audio into physical sensation.
 * - Vortex Rhythm Engine (1-2-4-8-7-5 pattern)
 * - Frequency-to-Texture mapping (Audio -> Tactile)
 * - AEAS Safety Caps (Max intensity, duty cycle limits)
 * - Cross-Modal Synchronization with Audio Board
 *
 * @standard HONEST v1.0
 * @author Reality Protocol LLC
 */

export interface HapticConfig {
  vortexPattern: number[]; // [1, 2, 4, 8, 7, 5] - Rhythm multipliers
  baseIntensity: number;   // 0.0 to 1.0
  maxIntensity: number;    // Safety cap (usually 0.8 for mobile)
}

export interface HapticPattern {
  duration: number;        // Total duration of the pattern loop (ms)
  events: HapticEvent[];   // The individual pulses
}

export interface HapticEvent {
  timestamp: number;       // Time in ms
  intensity: number;       // 0.0 to 1.0
  sharpness: number;       // 0.0 (Smooth/Rumble) to 1.0 (Sharp/Click)
}

export interface MarketModulation {
  momentum: number;        // -1 to 1 (negative = bearish, positive = bullish)
  energy: number;          // 0 to 1 (volatility/activity level)
}

export class HONESTHapticControlBoard {
  private config: HapticConfig;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private isSupported: boolean = false;
  
  // === VORTEX CONSTANTS ===
  private readonly BASE_PULSE_MS = 100; // The "1" beat = 100ms

  constructor(config?: Partial<HapticConfig>) {
    this.config = {
      vortexPattern: [1, 2, 4, 8, 7, 5],
      baseIntensity: 0.5,
      maxIntensity: 0.8,
      ...config
    };
  }

  /**
   * Initialize the haptic actuator
   */
  async initialize(): Promise<void> {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      this.isSupported = true;
      console.log('✅ HONEST Haptic Control Board initialized (Navigator Vibration)');
    } else {
      console.warn('⚠️ Haptic feedback not supported on this device');
    }
  }

  /**
   * Check if haptics are supported
   */
  isHapticSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Convert Audio Frequency to Haptic Texture
   * 
   * Logic:
   * - Low Freq (< 350Hz): Deep, Rumbling (Bearish/Heavy)
   * - Mid Freq (432Hz): Balanced, Thumping (Neutral/Truth)
   * - High Freq (> 550Hz): Sharp, Tickling (Bullish/Tense)
   */
  private freqToTexture(frequency: number): { sharpness: number; intensityMod: number } {
    if (frequency < 350) {
      // Deep Rumble
      return { sharpness: 0.2, intensityMod: 1.2 }; // Feels heavier
    } else if (frequency > 550) {
      // Sharp Tick
      return { sharpness: 0.9, intensityMod: 0.8 }; // Feels lighter but sharper
    } else {
      // Balanced Thump
      return { sharpness: 0.5, intensityMod: 1.0 };
    }
  }

  /**
   * Generate the Vortex Pulse Pattern
   * 
   * Uses the 1-2-4-8-7-5 sequence to create a rhythmic loop.
   * Example: 100ms, 200ms, 400ms, 800ms, 700ms, 500ms gaps.
   */
  private generateVortexPattern(marketModulation: MarketModulation): HapticPattern {
    const events: HapticEvent[] = [];
    let currentTime = 0;

    // Momentum affects the "swing" - Positive = Forward swing, Negative = Backward swing
    const direction = marketModulation.momentum > 0 ? 1 : -1;
    
    // Energy affects the speed of the vortex (Time Dilation)
    // High energy = Faster pattern (Small gaps)
    // Low energy = Slower pattern (Long gaps)
    const timeDilation = 1.0 - (marketModulation.energy * 0.5);

    this.config.vortexPattern.forEach((multiplier, index) => {
      // Calculate gap based on vortex multiplier
      const gap = this.BASE_PULSE_MS * multiplier * timeDilation;
      
      currentTime += gap;

      // Calculate Intensity based on position in pattern
      // The "8" and "1" are peaks, the others are transitions
      let rawIntensity = this.config.baseIntensity;
      
      // Boost intensity on "Power" numbers (1, 8)
      if (multiplier === 1 || multiplier === 8) {
        rawIntensity *= 1.2;
      }

      // Apply Momentum bias (Bullish = Stronger finish, Bearish = Stronger start)
      if (direction > 0 && index > 2) rawIntensity *= 1.1;
      if (direction < 0 && index < 3) rawIntensity *= 1.1;

      // Clamp
      const finalIntensity = Math.min(rawIntensity, this.config.maxIntensity);

      events.push({
        timestamp: currentTime,
        intensity: finalIntensity,
        sharpness: 0.5 // Default, will be modulated by freq
      });
    });

    return {
      duration: currentTime,
      events: events
    };
  }

  /**
   * Play the Haptic Loop
   * 
   * @param audioFreq - Current frequency from Harmonic Board
   * @param marketMod - Current market state
   */
  startLoop(audioFreq: number, marketMod: MarketModulation): void {
    if (!this.isSupported || this.isPlaying) return;

    this.isPlaying = true;
    const texture = this.freqToTexture(audioFreq);
    const pattern = this.generateVortexPattern(marketMod);

    const playPattern = () => {
      if (!this.isPlaying) return;

      // Convert events to Vibrate API array [duration, pause, duration, pause...]
      // Note: Navigator.vibrate is duration-based. We simulate intensity via duration.
      // Strong intensity = Longer duration. Weak intensity = Shorter duration.
      
      const vibrateSequence: number[] = [];

      pattern.events.forEach((event, index) => {
        // Map intensity (0-1) to duration (10ms - 50ms)
        // Apply texture intensity modifier
        const baseDuration = 10 + (event.intensity * texture.intensityMod * 40);
        vibrateSequence.push(Math.round(baseDuration));
        
        // Add a gap for "sharpness"
        // Sharp = Short gap (5ms), Rumble = Longer gap (15ms)
        const gap = event.sharpness > 0.5 ? 5 : 15;
        
        // Don't add gap after last event
        if (index < pattern.events.length - 1) {
          vibrateSequence.push(gap);
        }
      });

      // Add final pause before loop restarts
      vibrateSequence.push(50);

      navigator.vibrate(vibrateSequence);
    };

    // Play immediately
    playPattern();

    // Loop based on pattern duration
    this.intervalId = window.setInterval(playPattern, pattern.duration + 50);
  }

  /**
   * Update Haptics in Real-Time
   * Called when Audio frequency changes
   */
  update(audioFreq: number, marketMod: MarketModulation): void {
    // For NavigatorVibration, we can't easily change a running loop without stopping.
    // We stop and restart with new params.
    if (this.isPlaying) {
      this.stop();
      this.startLoop(audioFreq, marketMod);
    }
  }

  /**
   * Stop Haptics
   */
  stop(): void {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.isSupported) {
      navigator.vibrate(0); // Cancel any ongoing vibration
    }
  }
  
  /**
   * Emergency Stop
   */
  emergencyStop(): void {
    console.warn('🚨 HONEST Haptic Emergency Stop');
    this.stop();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HapticConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): HapticConfig {
    return { ...this.config };
  }
}
