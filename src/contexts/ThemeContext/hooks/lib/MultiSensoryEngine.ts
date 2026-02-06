/**
 * MultiSensoryEngine.ts
 * Coordinated Multi-Sensory Feedback System
 * 
 * Orchestrates Audio (7-Bells), Haptic (Vortex), and Voice engines for
 * synchronized multi-sensory accessibility experience with cross-modal
 * frequency-to-texture mapping.
 */

import { getAudioEngine, type BellType } from './AudioEngine';
import { HONESTHapticControlBoard, type MarketModulation } from './HONESTHapticControlBoard';
import { getVoiceEngine, type EigenstateData } from './VoiceEngine';
import { getWebAudioEngine, type EigenstateAudioData } from './WebAudioEngine';

export interface MultiSensoryConfig {
  audioEnabled: boolean;
  hapticEnabled: boolean;
  voiceEnabled: boolean;
  autoNarrate: boolean;
  hapticIntensity: number; // 0.0 to 1.0
  useWebAudio: boolean; // Use Web Audio API instead of pre-recorded bells
}

export class MultiSensoryEngine {
  private audioEngine = getAudioEngine();
  private webAudioEngine = getWebAudioEngine();
  private hapticBoard: HONESTHapticControlBoard;
  private voiceEngine = getVoiceEngine();
  
  private config: MultiSensoryConfig = {
    audioEnabled: true,
    hapticEnabled: false, // Disabled by default - user must enable
    voiceEnabled: true,
    autoNarrate: false,
    hapticIntensity: 0.5,
    useWebAudio: true // Default to Web Audio API
  };

  private lastCoherence: number | null = null;
  private isHapticInitialized: boolean = false;

  constructor() {
    // Initialize HONEST Haptic Control Board
    this.hapticBoard = new HONESTHapticControlBoard({
      baseIntensity: this.config.hapticIntensity,
      maxIntensity: 0.8
    });
  }

  /**
   * Initialize haptic system (requires user gesture)
   */
  async initializeHaptics(): Promise<void> {
    if (!this.isHapticInitialized) {
      await this.hapticBoard.initialize();
      this.isHapticInitialized = true;
    }
  }

  /**
   * Calculate market modulation from eigenstate data
   */
  private calculateMarketModulation(data: EigenstateData): MarketModulation {
    const { coherence, dimensions } = data;
    
    // Momentum: derived from coherence (-1 to 1)
    // Coherence already represents market direction
    const momentum = coherence;
    
    // Energy: derived from volatility/momentum magnitude
    // dimensions is an array of numbers [price, volume, momentum, sentiment, time, space]
    // Use momentum dimension (index 2) if available
    const momentumDim = dimensions.length > 2 ? dimensions[2] : coherence;
    const volatility = Math.abs(momentumDim);
    
    // Normalize energy to 0-1 range
    const energy = Math.min(1.0, volatility);
    
    return { momentum, energy };
  }

  /**
   * Trigger all enabled sensory feedback for eigenstate update
   */
  triggerEigenstateUpdate(data: EigenstateData): void {
    const { coherence, dimensions } = data;

    // Audio feedback (7-Bells or Web Audio)
    if (this.config.audioEnabled) {
      if (this.config.useWebAudio) {
        // Use Web Audio API for real-time synthesis
        const audioData: EigenstateAudioData = {
          dimensions: {
            price: dimensions[0] || 0,
            volume: dimensions[1] || 0,
            momentum: dimensions[2] || 0,
            sentiment: dimensions[3] || 0,
            temporal: dimensions[4] || 0,
            spatial: dimensions[5] || 0
          },
          coherence,
          phase_angle: 0 // Not used in Web Audio
        };
        
        if (this.webAudioEngine.getIsPlaying()) {
          this.webAudioEngine.updateTones(audioData);
        } else {
          this.webAudioEngine.start(audioData).catch(err => {
            console.error('[MultiSensory] Failed to start Web Audio:', err);
          });
        }
      } else {
        // Use pre-recorded bells
        this.audioEngine.playCoherenceBell(coherence, 1200);
      }
    }

    // Haptic feedback (Vortex with cross-modal sync)
    if (this.config.hapticEnabled && this.isHapticInitialized) {
      // Get current audio frequency for texture mapping
      const audioFreq = this.audioEngine.getCurrentFrequency();
      
      // Calculate market modulation from eigenstate
      const marketMod = this.calculateMarketModulation(data);
      
      // Update haptic with synchronized frequency and market state
      this.hapticBoard.update(audioFreq, marketMod);
      
      // If not already playing, start the loop
      if (!this.hapticBoard['isPlaying']) {
        this.hapticBoard.startLoop(audioFreq, marketMod);
      }
    }

    // Voice feedback
    if (this.config.voiceEnabled) {
      if (this.config.autoNarrate) {
        // Full description on auto-narrate
        this.voiceEngine.speakEigenstate(data, false);
      } else if (this.lastCoherence !== null) {
        // Just announce significant changes
        const change = Math.abs(coherence - this.lastCoherence);
        if (change > 0.15) {
          this.voiceEngine.speakCoherenceChange(this.lastCoherence, coherence);
        }
      }
    }

    this.lastCoherence = coherence;
  }

  /**
   * Trigger specific bell/pattern combination
   */
  triggerPattern(bellNumber: BellType, description?: string): void {
    if (this.config.audioEnabled) {
      this.audioEngine.playBell(bellNumber, 1000);
    }

    if (this.config.hapticEnabled && this.isHapticInitialized) {
      // Get audio frequency for the bell
      const audioFreq = this.audioEngine.getCurrentFrequency();
      
      // Create market modulation based on bell number
      // Bells 1-4 are bullish (positive momentum), 5-7 are bearish (negative)
      const momentum = bellNumber <= 4 ? (bellNumber - 1) * 0.33 : -(bellNumber - 4) * 0.33;
      const energy = Math.abs(momentum);
      
      this.hapticBoard.update(audioFreq, { momentum, energy });
      
      if (!this.hapticBoard['isPlaying']) {
        this.hapticBoard.startLoop(audioFreq, { momentum, energy });
      }
    }

    if (this.config.voiceEnabled && description) {
      this.voiceEngine.speak(description, false);
    }
  }

  /**
   * Speak eigenstate description (manual trigger)
   */
  speakCurrentState(data: EigenstateData): void {
    if (this.config.voiceEnabled) {
      this.voiceEngine.speakEigenstate(data, true);
    }
  }

  /**
   * Test all sensory systems
   */
  async testAllSystems(): Promise<void> {
    // Ensure haptics are initialized
    await this.initializeHaptics();

    // Announce test
    if (this.config.voiceEnabled) {
      this.voiceEngine.speak("Testing multi-sensory systems. Audio, haptic vortex, and voice.", true);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Test audio
    if (this.config.audioEnabled) {
      if (this.config.voiceEnabled) {
        this.voiceEngine.speak("Testing audio bells.", true);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      await this.audioEngine.testAllBells();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test haptic (Vortex patterns)
    if (this.config.hapticEnabled && this.hapticBoard.isHapticSupported()) {
      if (this.config.voiceEnabled) {
        this.voiceEngine.speak("Testing vortex haptic patterns.", true);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Test different vortex patterns
      const testPatterns: Array<{ freq: number; momentum: number; energy: number }> = [
        { freq: 432, momentum: 0, energy: 0.5 },    // Neutral
        { freq: 648, momentum: 0.8, energy: 0.8 },  // Strong Bullish
        { freq: 216, momentum: -0.8, energy: 0.8 }  // Strong Bearish
      ];
      
      for (const pattern of testPatterns) {
        this.hapticBoard.startLoop(pattern.freq, { 
          momentum: pattern.momentum, 
          energy: pattern.energy 
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.hapticBoard.stop();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Test voice
    if (this.config.voiceEnabled) {
      this.voiceEngine.speak("Multi-sensory test complete. All systems operational.", true);
    }
  }

  /**
   * Stop all sensory feedback
   */
  stopAll(): void {
    this.audioEngine.stop();
    this.webAudioEngine.stop();
    this.hapticBoard.stop();
    this.voiceEngine.stop();
  }

  /**
   * Emergency stop all systems
   */
  emergencyStop(): void {
    this.audioEngine.stop();
    this.hapticBoard.emergencyStop();
    this.voiceEngine.stop();
  }

  /**
   * Set configuration
   */
  setConfig(config: Partial<MultiSensoryConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Sync with individual engines
    if (config.voiceEnabled !== undefined) {
      if (!config.voiceEnabled) {
        this.voiceEngine.stop();
      }
    }
    
    if (config.autoNarrate !== undefined) {
      this.voiceEngine.toggleAutoNarrate();
    }

    if (config.hapticIntensity !== undefined) {
      this.hapticBoard.updateConfig({
        baseIntensity: config.hapticIntensity
      });
    }

    if (config.hapticEnabled === false) {
      this.hapticBoard.stop();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): MultiSensoryConfig {
    return { ...this.config };
  }

  /**
   * Get individual engines for fine-tuning
   */
  getEngines() {
    return {
      audio: this.audioEngine,
      haptic: this.hapticBoard,
      voice: this.voiceEngine
    };
  }

  /**
   * Get capabilities summary
   */
  getCapabilitiesSummary(): string {
    const capabilities: string[] = [];
    
    capabilities.push(`Audio: ${this.audioEngine.isMutedStatus() ? 'Muted' : 'Active'}`);
    capabilities.push(`Haptic: ${this.hapticBoard.isHapticSupported() ? 'Vortex Engine' : 'Not supported'}`);
    capabilities.push(`Voice: ${this.voiceEngine.isVoiceSupported() ? 'Active' : 'Not supported'}`);
    
    return capabilities.join(' | ');
  }

  /**
   * Reset last coherence (for new asset)
   */
  reset(): void {
    this.lastCoherence = null;
    this.stopAll();
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.stopAll();
    this.audioEngine.dispose();
  }
}

// Singleton instance
let multiSensoryEngineInstance: MultiSensoryEngine | null = null;

export function getMultiSensoryEngine(): MultiSensoryEngine {
  if (!multiSensoryEngineInstance) {
    multiSensoryEngineInstance = new MultiSensoryEngine();
  }
  return multiSensoryEngineInstance;
}
