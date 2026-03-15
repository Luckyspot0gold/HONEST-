/**
 * H.O.N.E.S.T. Multimodal Input Engine
 * Production TypeScript v1.0.0
 * Covers: Hand, Eye, Face, Voice, Switch modalities with progressive adaptation
 * Patent: RP-2026-001 Claims 46-60 (dependent continuation)
 */

// ============================================================================
// CORE TYPES AND INTERFACES
// ============================================================================

interface CapabilityProfile {
  hands: CapabilityScore;
  eyes: CapabilityScore;
  face: CapabilityScore;
  voice: CapabilityScore;
  switch: CapabilityScore;
  timestamp: Date;
  confidence: number;
}

interface CapabilityScore {
  available: boolean;
  reliability: number; // 0.0 - 1.0
  latency: number; // ms
  fatigueRate: number; // degradation per hour
  lastSuccessfulUse: Date;
}

interface InputModality {
  id: 'hands' | 'eyes' | 'face' | 'voice' | 'switch';
  priority: number;
  activationThreshold: number;
  fallbackChain: string[];
}

interface UserInputProfile {
  primary: InputModality;
  secondary?: InputModality;
  tertiary?: InputModality;
  adaptationStage: 'stable' | 'degrading' | 'transitioning' | 'critical';
  predictedTransitionDate?: Date;
  accessibilityLevel: 'full' | 'reduced' | 'minimal' | 'locked-in';
  financialMorseEnabled: boolean;
}

// ============================================================================
// FINANCIAL MORSE CODE DICTIONARY
// ============================================================================

export const FINANCIAL_MORSE: Record<string, string> = {
  // Cryptocurrencies
  '.-': 'BTC',           // Bitcoin
  '-...': 'ETH',         // Ethereum
  '-.-.': 'SOL',         // Solana
  '-..': 'DOGE',         // Dogecoin
  '.': 'ADA',            // Cardano (dot)
  '..-.': 'FIL',         // Filecoin
  
  // Traditional Assets
  '--.': 'GOLD',         // Gold
  '....': 'SPX',         // S&P 500
  '..': 'UP',            // Trend Up
  '.-.': 'VOL',          // Volatility View
  '-': 'DOWN',           // Trend Down
  '--..': 'ZOOM',        // Zoom toggle
  '---': 'MENU',         // Main menu
  '.--.': 'PORT',        // Portfolio view
  '--.-': 'QUIT',        // Exit/Back
  '.-.-.': 'CONFIRM',    // Confirm selection
  '-.-.--': 'ALERT',     // Emergency alert
  '...-': 'VOICE',        // Toggle voice feedback
  '-..-': 'HELP',         // Help/Shortcuts
};

export const MORSE_TIMING = {
  DOT_DURATION: 200,      // ms
  DASH_DURATION: 600,   // ms
  INTER_ELEMENT: 200,   // ms between dots/dashes
  INTER_LETTER: 600,    // ms between letters
  WORD_SPACE: 1400,     // ms between words
  TIMEOUT: 2000,        // Reset if no input
};

// ============================================================================
// CAPABILITY ASSESSMENT ENGINE
// ============================================================================

export class CapabilityAssessor {
  private testResults: Map<string, CapabilityScore> = new Map();
  private assessmentDuration: number = 180000; // 3 minutes max
  
  async assessUserCapabilities(): Promise<CapabilityProfile> {
    const startTime = Date.now();
    
    // Parallel capability testing with timeout
    const tests = await Promise.all([
      this.testHandTracking(),
      this.testEyeTracking(),
      this.testFacialGestures(),
      this.testVoiceControl(),
      this.detectSwitchHardware()
    ]);
    
    const [hands, eyes, face, voice, switchCap] = tests;
    
    // Calculate overall confidence based on test quality
    const confidence = this.calculateConfidence(tests, Date.now() - startTime);
    
    return {
      hands, eyes, face, voice, switch: switchCap,
      timestamp: new Date(),
      confidence
    };
  }
  
  private async testHandTracking(): Promise<CapabilityScore> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // MediaPipe Hands test sequence
      const testSequence = ['swipe_right', 'pinch', 'palm_stop'];
      let successfulGestures = 0;
      let totalLatency = 0;
      
      for (const gesture of testSequence) {
        const result = await this.detectGestureWithTimeout(gesture, 10000);
        if (result.detected) {
          successfulGestures++;
          totalLatency += result.latency;
        }
      }
      
      stream.getTracks().forEach(t => t.stop());
      
      const reliability = successfulGestures / testSequence.length;
      
      return {
        available: reliability > 0.5,
        reliability,
        latency: reliability > 0 ? totalLatency / successfulGestures : Infinity,
        fatigueRate: this.estimateFatigueRate('hands', reliability),
        lastSuccessfulUse: new Date()
      };
    } catch (e) {
      return this.nullCapability();
    }
  }
  
  private async testEyeTracking(): Promise<CapabilityScore> {
    // WebGazer or Tobii integration
    try {
      if ('EyeTracker' in window || await this.initializeWebGazer()) {
        const calibrationPoints = 9;
        let successfulFixations = 0;
        let driftMeasurements: number[] = [];
        
        for (let i = 0; i < calibrationPoints; i++) {
          const fixation = await this.testFixation(i);
          if (fixation.accuracy < 2) { // Within 2 degrees
            successfulFixations++;
          }
          driftMeasurements.push(fixation.drift);
        }
        
        const avgDrift = driftMeasurements.reduce((a, b) => a + b, 0) / driftMeasurements.length;
        const reliability = successfulFixations / calibrationPoints;
        
        return {
          available: reliability > 0.6,
          reliability,
          latency: 150 + (avgDrift * 50), // Higher drift = higher effective latency
          fatigueRate: 0.15, // Eyes fatigue moderately
          lastSuccessfulUse: new Date()
        };
      }
      return this.nullCapability();
    } catch (e) {
      return this.nullCapability();
    }
  }
  
  private async testFacialGestures(): Promise<CapabilityScore> {
    // MediaPipe Face Mesh test
    try {
      const testGestures = ['eyebrow_raise', 'smile', 'jaw_clench'];
      let detected = 0;
      let intensities: number[] = [];
      
      for (const gesture of testGestures) {
        const result = await this.detectFacialGesture(gesture, 5000);
        if (result.detected) {
          detected++;
          intensities.push(result.intensity);
        }
      }
      
      const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
      const reliability = detected / testGestures.length;
      
      return {
        available: reliability > 0.4 && avgIntensity > 0.3,
        reliability,
        latency: 800, // Facial gestures slightly slower
        fatigueRate: 0.25, // Facial muscles fatigue faster
        lastSuccessfulUse: new Date()
      };
    } catch (e) {
      return this.nullCapability();
    }
  }
  
  private async testVoiceControl(): Promise<CapabilityScore> {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return this.nullCapability();
    }
    
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    
    return new Promise((resolve) => {
      let successfulCommands = 0;
      const testCommands = ['select', 'next', 'back', 'buy', 'sell'];
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        if (testCommands.some(cmd => transcript.includes(cmd))) {
          successfulCommands++;
        }
      };
      
      recognition.onend = () => {
        const reliability = successfulCommands / testCommands.length;
        resolve({
          available: reliability > 0.5,
          reliability,
          latency: 1200, // Speech processing latency
          fatigueRate: 0.05, // Voice fatigues slowly
          lastSuccessfulUse: new Date()
        });
      };
      
      recognition.start();
      setTimeout(() => recognition.stop(), 10000);
    });
  }
  
  private async detectSwitchHardware(): Promise<CapabilityScore> {
    // Detect USB switches, Bluetooth switches, or audio input (sip/puff)
    const hasUSB = 'usb' in navigator;
    const hasBluetooth = 'bluetooth' in navigator;
    
    // Audio-based switch detection (sip/puff creates distinct frequency signatures)
    const audioSwitch = await this.testAudioSwitch();
    
    const available = hasUSB || hasBluetooth || audioSwitch.detected;
    
    return {
      available,
      reliability: available ? 0.95 : 0, // Switches are highly reliable if present
      latency: audioSwitch.detected ? 500 : 100, // Audio slightly slower
      fatigueRate: 0.1, // Depends on switch type
      lastSuccessfulUse: new Date()
    };
  }
  
  // Helper methods
  private nullCapability(): CapabilityScore {
    return {
      available: false,
      reliability: 0,
      latency: Infinity,
      fatigueRate: 1,
      lastSuccessfulUse: new Date(0)
    };
  }
  
  private calculateConfidence(tests: CapabilityScore[], duration: number): number {
    const validTests = tests.filter(t => t.available).length;
    const timeQuality = Math.max(0, 1 - (duration - 120000) / 60000); // Penalize if > 2min
    return (validTests / 5) * 0.7 + timeQuality * 0.3;
  }
  
  // Placeholder implementations for specific detection methods
  private async detectGestureWithTimeout(gesture: string, timeout: number): Promise<{detected: boolean, latency: number}> {
    // MediaPipe Hands integration
    return { detected: true, latency: 450 };
  }
  
  private async initializeWebGazer(): Promise<boolean> {
    // WebGazer.js initialization
    return true;
  }
  
  private async testFixation(pointIndex: number): Promise<{accuracy: number, drift: number}> {
    // Eye tracking calibration test
    return { accuracy: 1.5, drift: 0.3 };
  }
  
  private async detectFacialGesture(gesture: string, timeout: number): Promise<{detected: boolean, intensity: number}> {
    // MediaPipe Face Mesh detection
    return { detected: true, intensity: 0.6 };
  }
  
  private async testAudioSwitch(): Promise<{detected: boolean}> {
    // Audio frequency analysis for sip/puff
    return { detected: false };
  }
  
  private estimateFatigueRate(modality: string, reliability: number): number {
    const baseRates: Record<string, number> = {
      hands: 0.2, eyes: 0.15, face: 0.25, voice: 0.05, switch: 0.1
    };
    return baseRates[modality] * (2 - reliability); // Higher reliability = lower fatigue impact
  }
}

// ============================================================================
// PROGRESSIVE ADAPTATION MONITOR
// ============================================================================

export class ProgressiveAdaptationMonitor {
  private baseline: CapabilityProfile | null = null;
  private history: CapabilityProfile[] = [];
  private readonly HISTORY_WINDOW = 30; // days
  private degradationCallbacks: Array<(stage: string, nextModality?: string) => void> = [];
  
  setBaseline(profile: CapabilityProfile): void {
    this.baseline = profile;
    this.history = [profile];
  }
  
  async monitor(): Promise<void> {
    const assessor = new CapabilityAssessor();
    const current = await assessor.assessUserCapabilities();
    
    if (!this.baseline) {
      this.setBaseline(current);
      return;
    }
    
    this.history.push(current);
    this.trimHistory();
    
    const degradation = this.calculateDegradation(this.baseline, current);
    const prediction = this.predictTransitionDate(degradation);
    
    if (prediction.urgency === 'immediate') {
      this.triggerTransition(current, degradation);
    } else if (prediction.urgency === 'preparing') {
      this.notifyPreparation(prediction.daysUntil, degradation);
    }
    
    // Store for research (H23)
    this.logForResearch(current, degradation, prediction);
  }
  
  private calculateDegradation(baseline: CapabilityProfile, current: CapabilityProfile): Record<string, number> {
    const modalities = ['hands', 'eyes', 'face', 'voice', 'switch'] as const;
    const degradation: Record<string, number> = {};
    
    for (const mod of modalities) {
      const base = baseline[mod].reliability;
      const curr = current[mod].reliability;
      degradation[mod] = Math.max(0, (base - curr) / base);
    }
    
    return degradation;
  }
  
  private predictTransitionDate(degradation: Record<string, number>): {
    urgency: 'stable' | 'preparing' | 'immediate';
    daysUntil?: number;
    recommendedModality?: string;
  } {
    const primary = this.getPrimaryModality();
    const primaryDeg = degradation[primary];
    
    if (primaryDeg > 0.5) {
      return { urgency: 'immediate', daysUntil: 0, recommendedModality: this.selectFallback(primary) };
    }
    
    if (primaryDeg > 0.3) {
      // Linear extrapolation: if 30% degraded in X days, when will it hit 50%?
      const daysElapsed = this.getDaysSinceBaseline();
      const degradationRate = primaryDeg / daysElapsed;
      const daysUntilCritical = (0.5 - primaryDeg) / degradationRate;
      
      if (daysUntilCritical <= 30) {
        return { 
          urgency: 'preparing', 
          daysUntil: Math.floor(daysUntilCritical),
          recommendedModality: this.selectFallback(primary)
        };
      }
    }
    
    return { urgency: 'stable' };
  }
  
  private triggerTransition(current: CapabilityProfile, degradation: Record<string, number>): void {
    const primary = this.getPrimaryModality();
    const fallback = this.selectFallback(primary);
    
    // Notify all listeners
    this.degradationCallbacks.forEach(cb => cb('critical', fallback));
    
    // Auto-switch if user has pre-authorized
    if (this.hasAutoSwitchConsent()) {
      this.executeModalitySwitch(fallback);
    }
  }
  
  private notifyPreparation(daysUntil: number, degradation: Record<string, number>): void {
    const fallback = this.selectFallback(this.getPrimaryModality());
    this.degradationCallbacks.forEach(cb => cb('preparing', fallback));
  }
  
  private selectFallback(currentModality: string): string {
    const hierarchy = ['hands', 'eyes', 'face', 'voice', 'switch'];
    const currentIndex = hierarchy.indexOf(currentModality);
    
    // Find next available modality
    for (let i = currentIndex + 1; i < hierarchy.length; i++) {
      const mod = hierarchy[i];
      const latest = this.history[this.history.length - 1];
      if (latest[mod as keyof CapabilityProfile]?.available) {
        return mod;
      }
    }
    
    return 'switch'; // Ultimate fallback
  }
  
  private logForResearch(
    current: CapabilityProfile, 
    degradation: Record<string, number>,
    prediction: ReturnType<typeof this.predictTransitionDate>
  ): void {
    const researchPayload = {
      timestamp: new Date().toISOString(),
      baselineReliability: this.baseline?.hands.reliability,
      currentReliability: current.hands.reliability,
      degradationVector: degradation,
      predictedTransitionDays: prediction.daysUntil,
      actualTransition: prediction.urgency === 'immediate',
      // For H23: Predictive accuracy tracking
      predictionAccuracy: null as number | null // Filled in retrospect
    };
    
    // Send to H.O.N.E.S.T. research backend
    fetch('/api/research/motor-adaptation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(researchPayload)
    });
  }
  
  // Utility methods
  private trimHistory(): void {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.HISTORY_WINDOW);
    this.history = this.history.filter(h => h.timestamp > cutoff);
  }
  
  private getDaysSinceBaseline(): number {
    if (!this.baseline) return 0;
    return (Date.now() - this.baseline.timestamp.getTime()) / (1000 * 60 * 60 * 24);
  }
  
  private getPrimaryModality(): string {
    // Determine from history or default
    return 'hands'; // Simplified
  }
  
  private hasAutoSwitchConsent(): boolean {
    // Check user preferences
    return false; // Conservative default
  }
  
  private executeModalitySwitch(newModality: string): void {
    // Trigger UI transition
    console.log(`Auto-switching to ${newModality}`);
  }
  
  onDegradationDetected(callback: (stage: string, nextModality?: string) => void): void {
    this.degradationCallbacks.push(callback);
  }
}

// ============================================================================
// PREDICTIVE FINANCIAL UI
// ============================================================================

export class PredictiveFinancialUI {
  private userHistory: Array<{
    timestamp: Date;
    asset: string;
    action: string;
    context: string;
  }> = [];
  
  private portfolio: Set<string> = new Set();
  private marketContext: {
    marketOpen: boolean;
    highVolatility: boolean;
    earningsSeason: boolean;
  } = { marketOpen: false, highVolatility: false, earningsSeason: false };
  
  updateContext(context: typeof this.marketContext): void {
    this.marketContext = context;
  }
  
  setPortfolio(assets: string[]): void {
    this.portfolio = new Set(assets);
  }
  
  async predictNextSelection(): Promise<Array<{
    asset: string;
    confidence: number;
    reasoning: string[];
  }>> {
    const predictions: Array<{asset: string, confidence: number, reasoning: string[]}> = [];
    const now = new Date();
    const hour = now.getHours();
    
    // Time-based predictions
    if (this.marketContext.marketOpen && (hour >= 9 && hour <= 16)) {
      // Business hours: likely checking stocks
      const stockAssets = Array.from(this.portfolio).filter(a => !this.isCrypto(a));
      if (stockAssets.length > 0) {
        predictions.push({
          asset: stockAssets[0],
          confidence: 0.7,
          reasoning: ['market_hours', 'portfolio_context']
        });
      }
    } else {
      // After hours: crypto more likely
      const cryptoAssets = Array.from(this.portfolio).filter(a => this.isCrypto(a));
      if (cryptoAssets.length > 0) {
        predictions.push({
          asset: cryptoAssets[0],
          confidence: 0.6,
          reasoning: ['after_hours', 'crypto_preference']
        });
      }
    }
    
    // Recency-based
    const recent = this.getRecentAssets(3);
    for (const asset of recent) {
      const existing = predictions.find(p => p.asset === asset);
      if (existing) {
        existing.confidence += 0.15;
        existing.reasoning.push('recent_history');
      } else {
        predictions.push({
          asset,
          confidence: 0.45,
          reasoning: ['recent_history']
        });
      }
    }
    
    // Volatility alerts
    if (this.marketContext.highVolatility) {
      predictions.forEach(p => {
        p.reasoning.push('volatility_alert');
        p.confidence += 0.1;
      });
    }
    
    // Sort by confidence
    return predictions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }
  
  generateScanningOrder(): string[] {
    // Reorder UI elements based on predictions
    const predictions = this.predictNextSelection();
    const predictedAssets = predictions.map(p => p.asset);
    
    // Standard order: all available assets
    const standardOrder = this.getAllAvailableAssets();
    
    // Move predicted assets to front
    return [...predictedAssets, ...standardOrder.filter(a => !predictedAssets.includes(a))];
  }
  
  getMorseSuggestion(currentSequence: string): Array<{code: string, meaning: string, relevance: number}> {
    // Predict next Morse code based on partial input
    const matches = Object.entries(FINANCIAL_MORSE)
      .filter(([code, _]) => code.startsWith(currentSequence))
      .map(([code, meaning]) => ({
        code,
        meaning,
        relevance: this.calculateRelevance(meaning)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
    
    return matches;
  }
  
  private calculateRelevance(asset: string): number {
    let score = 0;
    
    // In portfolio = higher relevance
    if (this.portfolio.has(asset)) score += 0.4;
    
    // Recently viewed
    if (this.getRecentAssets(5).includes(asset)) score += 0.3;
    
    // Market context
    if (this.marketContext.highVolatility && this.isVolatile(asset)) score += 0.2;
    
    return Math.min(1, score);
  }
  
  private isCrypto(asset: string): boolean {
    return ['BTC', 'ETH', 'SOL', 'DOGE', 'ADA'].includes(asset);
  }
  
  private isVolatile(asset: string): boolean {
    // Check volatility metrics
    return ['BTC', 'ETH', 'DOGE'].includes(asset);
  }
  
  private getRecentAssets(count: number): string[] {
    return this.userHistory
      .slice(-count)
      .map(h => h.asset)
      .filter((v, i, a) => a.indexOf(v) === i); // Unique
  }
  
  private getAllAvailableAssets(): string[] {
    return Object.values(FINANCIAL_MORSE);
  }
  
  logInteraction(asset: string, action: string): void {
    this.userHistory.push({
      timestamp: new Date(),
      asset,
      action,
      context: JSON.stringify(this.marketContext)
    });
  }
}

// ============================================================================
// HAWKING MODE FIVE-STAGE CONFIGURATION
// ============================================================================

export type ALSStage = 'early' | 'mid' | 'late' | 'advanced' | 'locked-in';

interface StageConfiguration {
  primaryInput: string;
  secondaryInput?: string;
  scanningMode: 'none' | 'linear' | 'group' | 'morse' | 'binary';
  dwellTime: number;
  predictiveUI: boolean;
  emergencyGesture?: string;
}

export const HAWKING_MODE_CONFIG: Record<ALSStage, StageConfiguration> = {
  early: {
    primaryInput: 'hands',
    secondaryInput: 'eyes',
    scanningMode: 'none',
    dwellTime: 1000,
    predictiveUI: true,
    emergencyGesture: 'palm_stop'
  },
  mid: {
    primaryInput: 'eyes',
    secondaryInput: 'face',
    scanningMode: 'none',
    dwellTime: 1200,
    predictiveUI: true,
    emergencyGesture: 'eyebrow_raise_hold'
  },
  late: {
    primaryInput: 'eyes',
    secondaryInput: 'switch',
    scanningMode: 'linear',
    dwellTime: 1500,
    predictiveUI: true,
    emergencyGesture: 'double_blink'
  },
  advanced: {
    primaryInput: 'switch',
    secondaryInput: 'eyes',
    scanningMode: 'morse',
    dwellTime: 2000,
    predictiveUI: true,
    emergencyGesture: 'long_puff'
  },
  'locked-in': {
    primaryInput: 'switch',
    scanningMode: 'morse',
    dwellTime: 2500,
    predictiveUI: true,
    emergencyGesture: 'sos_pattern' // ... --- ...
  }
};

export class HawkingModeController {
  private currentStage: ALSStage = 'early';
  private monitor: ProgressiveAdaptationMonitor;
  
  constructor() {
    this.monitor = new ProgressiveAdaptationMonitor();
    this.monitor.onDegradationDetected((stage, nextModality) => {
      this.handleStageTransition(stage, nextModality);
    });
  }
  
  getCurrentConfig(): StageConfiguration {
    return HAWKING_MODE_CONFIG[this.currentStage];
  }
  
  private handleStageTransition(degradationStage: string, nextModality?: string): void {
    const stageMap: Record<string, ALSStage> = {
      'early_degradation': 'mid',
      'mid_degradation': 'late',
      'late_degradation': 'advanced',
      'critical': 'locked-in'
    };
    
    const newStage = stageMap[degradationStage];
    if (newStage && newStage !== this.currentStage) {
      this.executeStageTransition(this.currentStage, newStage);
    }
  }
  
  private executeStageTransition(from: ALSStage, to: ALSStage): void {
    const config = HAWKING_MODE_CONFIG[to];
    
    // Notify user
    this.notifyUserOfTransition(from, to);
    
    // Reconfigure UI
    this.reconfigureInput(config);
    
    // Log for research
    this.logStageTransition(from, to);
    
    this.currentStage = to;
  }
  
  private notifyUserOfTransition(from: ALSStage, to: ALSStage): void {
    // Audio + haptic notification of capability change
    const message = `Transitioning from ${from} to ${to} mode. New primary input: ${HAWKING_MODE_CONFIG[to].primaryInput}`;
    // Trigger audio/haptic feedback
  }
  
  private reconfigureInput(config: StageConfiguration): void {
    // Apply new input configuration
    console.log('Reconfiguring for:', config);
  }
  
  private logStageTransition(from: ALSStage, to: ALSStage): void {
    fetch('/api/research/als-progression', {
      method: 'POST',
      body: JSON.stringify({ from, to, timestamp: new Date().toISOString() })
    });
  }
}

// ============================================================================
// MORSE CODE INPUT PROCESSOR
// ============================================================================

export class MorseInputProcessor {
  private buffer: string = '';
  private lastInputTime: number = 0;
  private isActive: boolean = false;
  
  onPatternRecognized: ((symbol: string, meaning: string) => void) | null = null;
  onPartialPattern: ((possibilities: Array<{code: string, meaning: string}>) => void) | null = null;
  
  processInput(type: 'dot' | 'dash' | 'space' | 'timeout'): void {
    const now = Date.now();
    
    if (type === 'timeout') {
      this.finalizeBuffer();
      return;
    }
    
    if (type === 'space') {
      if (this.buffer.length > 0) {
        this.finalizeBuffer();
      }
      return;
    }
    
    // Add to buffer
    this.buffer += type === 'dot' ? '.' : '-';
    this.lastInputTime = now;
    
    // Check for matches
    const matches = this.getMatches(this.buffer);
    
    if (matches.length === 1 && matches[0].code === this.buffer) {
      // Exact match
      this.onPatternRecognized?.(this.buffer, matches[0].meaning);
      this.buffer = '';
    } else if (matches.length > 0) {
      // Partial match - notify for UI feedback
      this.onPartialPattern?.(matches);
    } else {
      // No matches - error feedback
      this.handleInvalidPattern();
      this.buffer = '';
    }
    
    // Set timeout for auto-finalize
    this.scheduleTimeout();
  }
  
  private getMatches(pattern: string): Array<{code: string, meaning: string}> {
    return Object.entries(FINANCIAL_MORSE)
      .filter(([code, _]) => code.startsWith(pattern))
      .map(([code, meaning]) => ({ code, meaning }));
  }
  
  private finalizeBuffer(): void {
    if (this.buffer.length === 0) return;
    
    const meaning = FINANCIAL_MORSE[this.buffer];
    if (meaning) {
      this.onPatternRecognized?.(this.buffer, meaning);
    } else {
      this.handleInvalidPattern();
    }
    
    this.buffer = '';
  }
  
  private handleInvalidPattern(): void {
    // Error feedback: distinct tone + haptic pattern
    console.error('Invalid Morse pattern');
  }
  
  private scheduleTimeout(): void {
    // Clear existing timeout
    // Set new timeout for MORSE_TIMING.TIMEOUT
  }
}

// ============================================================================
// MAIN EXPORT AND INITIALIZATION
// ============================================================================

export class MultimodalInputEngine {
  assessor: CapabilityAssessor;
  monitor: ProgressiveAdaptationMonitor;
  predictor: PredictiveFinancialUI;
  hawking: HawkingModeController;
  morse: MorseInputProcessor;
  
  constructor() {
    this.assessor = new CapabilityAssessor();
    this.monitor = new ProgressiveAdaptationMonitor();
    this.predictor = new PredictiveFinancialUI();
    this.hawking = new HawkingModeController();
    this.morse = new MorseInputProcessor();
  }
  
  async initialize(): Promise<UserInputProfile> {
    const capabilities = await this.assessor.assessUserCapabilities();
    this.monitor.setBaseline(capabilities);
    
    // Determine optimal profile
    const profile = this.generateProfile(capabilities);
    
    // Start monitoring if degenerative condition indicated
    if (profile.adaptationStage !== 'stable') {
      this.startMonitoring();
    }
    
    return profile;
  }
  
  private generateProfile(capabilities: CapabilityProfile): UserInputProfile {
    // Priority: hands > eyes > face > voice > switch
    const modalities: Array<{id: string, score: CapabilityScore}> = [
      { id: 'hands', score: capabilities.hands },
      { id: 'eyes', score: capabilities.eyes },
      { id: 'face', score: capabilities.face },
      { id: 'voice', score: capabilities.voice },
      { id: 'switch', score: capabilities.switch }
    ].sort((a, b) => b.score.reliability - a.score.reliability);
    
    const available = modalities.filter(m => m.score.available);
    
    return {
      primary: this.modalityToInput(available[0]),
      secondary: available[1] ? this.modalityToInput(available[1]) : undefined,
      tertiary: available[2] ? this.modalityToInput(available[2]) : undefined,
      adaptationStage: this.determineAdaptationStage(available),
      accessibilityLevel: this.determineAccessibilityLevel(available),
      financialMorseEnabled: available.length <= 2 || available.slice(-1)[0]?.id === 'switch'
    };
  }
  
  private modalityToInput(modality: {id: string, score: CapabilityScore}): InputModality {
    return {
      id: modality.id as any,
      priority: 1,
      activationThreshold: 0.5,
      fallbackChain: []
    };
  }
  
  private determineAdaptationStage(available: Array<{id: string, score: CapabilityScore}>): UserInputProfile['adaptationStage'] {
    if (available.length <= 1) return 'critical';
    if (available[0].score.reliability < 0.6) return 'degrading';
    if (available.length <= 2) return 'transitioning';
    return 'stable';
  }
  
  private determineAccessibilityLevel(available: Array<{id: string, score: CapabilityScore}>): UserInputProfile['accessibilityLevel'] {
    if (available.length === 0 || available[0].id === 'switch') return 'locked-in';
    if (available.length <= 2) return 'minimal';
    if (available.length <= 3) return 'reduced';
    return 'full';
  }
  
  private startMonitoring(): void {
    setInterval(() => this.monitor.monitor(), 60000); // Check every minute
  }
}

// Usage example
export async function initializeHONESTInput(): Promise<MultimodalInputEngine> {
  const engine = new MultimodalInputEngine();
  const profile = await engine.initialize();
  
  console.log('H.O.N.E.S.T. Input Profile:', profile);
  
  // Configure Morse if enabled
  if (profile.financialMorseEnabled) {
    engine.morse.onPatternRecognized = (symbol, meaning) => {
      console.log(`Morse input: ${symbol} = ${meaning}`);
      // Trigger financial action
    };
  }
  
  return engine;
}
