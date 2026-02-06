/**
 * VoiceEngine.ts
 * AI Phonics System for McCrea Market Metrics
 * 
 * Provides natural voice descriptions of market conditions using
 * Web Speech API (with fallback to AWS Polly if available).
 * Designed for blind users and screen reader accessibility.
 */

// EigenstateData interface (matches EigenstateVisualizer)
export interface EigenstateData {
  coherence: number;
  decision: 'BUY' | 'SELL' | 'HOLD';
  dimensions: number[];
  asset: string;
}

export interface VoiceConfig {
  rate: number;      // 0.1 to 10 (default 1)
  pitch: number;     // 0 to 2 (default 1)
  volume: number;    // 0 to 1 (default 1)
  voice: string | null; // Voice name or null for default
}

export class VoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private isSupported: boolean = false;
  private isEnabled: boolean = true;
  private autoNarrate: boolean = false;
  private config: VoiceConfig = {
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    voice: null
  };
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    // Check if Web Speech API is supported
    this.isSupported = 'speechSynthesis' in window;
    
    if (this.isSupported) {
      this.synth = window.speechSynthesis;
      
      // Load voices (may be async on some browsers)
      this.loadVoices();
      
      // Voices may load asynchronously
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    } else {
      console.warn('Speech Synthesis API not supported on this browser');
    }
  }

  /**
   * Load available voices
   */
  private loadVoices(): void {
    if (!this.synth) return;
    this.availableVoices = this.synth.getVoices();
    
    // Prefer English voices
    const englishVoices = this.availableVoices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0 && !this.config.voice) {
      // Prefer natural-sounding voices
      const preferredVoice = englishVoices.find(v => 
        v.name.includes('Natural') || v.name.includes('Premium')
      ) || englishVoices[0];
      this.config.voice = preferredVoice.name;
    }
  }

  /**
   * Check if voice synthesis is supported
   */
  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Speak text with current configuration
   */
  speak(text: string, interrupt: boolean = false): void {
    if (!this.isSupported || !this.isEnabled || !this.synth) return;

    try {
      // Stop current speech if interrupting
      if (interrupt && this.synth.speaking) {
        this.synth.cancel();
      }

      // Create utterance
      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.rate = this.config.rate;
      this.currentUtterance.pitch = this.config.pitch;
      this.currentUtterance.volume = this.config.volume;

      // Set voice if specified
      if (this.config.voice) {
        const voice = this.availableVoices.find(v => v.name === this.config.voice);
        if (voice) {
          this.currentUtterance.voice = voice;
        }
      }

      // Speak
      this.synth.speak(this.currentUtterance);
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  }

  /**
   * Generate natural description of eigenstate data
   */
  describeEigenstate(data: EigenstateData): string {
    const { coherence, decision, dimensions, asset } = data;
    
    // Interpret coherence
    let coherenceDesc = "";
    if (coherence >= 0.7) {
      coherenceDesc = "very high coherence, indicating strong bullish consensus";
    } else if (coherence >= 0.3) {
      coherenceDesc = "moderate positive coherence, showing bullish momentum";
    } else if (coherence >= 0.1) {
      coherenceDesc = "slight positive coherence, gentle upward trend";
    } else if (coherence >= -0.1) {
      coherenceDesc = "neutral coherence, market is in equilibrium";
    } else if (coherence >= -0.3) {
      coherenceDesc = "slight negative coherence, gentle downward pressure";
    } else if (coherence >= -0.7) {
      coherenceDesc = "moderate negative coherence, showing bearish momentum";
    } else {
      coherenceDesc = "very low coherence, indicating strong bearish consensus";
    }

    // Build description
    let description = `Market analysis for ${asset}. `;
    description += `Coherence score is ${coherence.toFixed(2)}, ${coherenceDesc}. `;
    
    // Decision
    description += `Recommended action: ${decision}. `;
    
    // Dimension breakdown
    description += "Analyzing six dimensions. ";
    
    const dimNames = ["Price", "Volume", "Volatility", "Momentum", "Sentiment", "Liquidity"];
    const strongDims = dimensions
      .map((val: number, idx: number) => ({ name: dimNames[idx], value: val }))
      .filter((d: { name: string; value: number }) => Math.abs(d.value) > 0.5)
      .sort((a: { name: string; value: number }, b: { name: string; value: number }) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 2);

    if (strongDims.length > 0) {
      description += "Key signals: ";
      strongDims.forEach((dim: { name: string; value: number }, idx: number) => {
        const strength = Math.abs(dim.value) > 0.7 ? "strong" : "moderate";
        const direction = dim.value > 0 ? "positive" : "negative";
        description += `${dim.name} shows ${strength} ${direction} movement`;
        if (idx < strongDims.length - 1) description += ", ";
      });
      description += ". ";
    }

    return description;
  }

  /**
   * Speak eigenstate description
   */
  speakEigenstate(data: EigenstateData, interrupt: boolean = true): void {
    const description = this.describeEigenstate(data);
    this.speak(description, interrupt);
  }

  /**
   * Speak coherence change
   */
  speakCoherenceChange(oldCoherence: number, newCoherence: number): void {
    const change = newCoherence - oldCoherence;
    const absChange = Math.abs(change);
    
    if (absChange < 0.05) return; // Ignore small changes

    let description = "";
    if (absChange > 0.3) {
      description = "Significant market shift detected. ";
    } else if (absChange > 0.15) {
      description = "Notable market movement. ";
    } else {
      description = "Market update. ";
    }

    if (change > 0) {
      description += `Coherence increased to ${newCoherence.toFixed(2)}, trend turning more bullish.`;
    } else {
      description += `Coherence decreased to ${newCoherence.toFixed(2)}, trend turning more bearish.`;
    }

    this.speak(description, false);
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  /**
   * Set voice configuration
   */
  setConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }

  /**
   * Toggle voice enabled
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
  isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Toggle auto-narration
   */
  toggleAutoNarrate(): void {
    this.autoNarrate = !this.autoNarrate;
  }

  /**
   * Get auto-narration status
   */
  isAutoNarrateEnabled(): boolean {
    return this.autoNarrate;
  }

  /**
   * Test voice with sample text
   */
  testVoice(): void {
    const testText = "Testing voice synthesis. The H.O.N.E.S.T. system provides multi-sensory market data through harmonics, haptics, and voice descriptions.";
    this.speak(testText, true);
  }

  /**
   * Get capabilities description
   */
  getCapabilitiesDescription(): string {
    if (!this.isSupported) {
      return "Voice synthesis not supported on this browser";
    }
    if (!this.isEnabled) {
      return "Voice synthesis disabled";
    }
    return `Voice synthesis enabled with ${this.availableVoices.length} voices available`;
  }
}

// Singleton instance
let voiceEngineInstance: VoiceEngine | null = null;

export function getVoiceEngine(): VoiceEngine {
  if (!voiceEngineInstance) {
    voiceEngineInstance = new VoiceEngine();
  }
  return voiceEngineInstance;
}
