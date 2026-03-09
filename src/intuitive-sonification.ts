/**
 * INTUITIVE SONIFICATION ENGINE - Real-time sensory immersion without prediction
 * 
 * PATENT CLAIM: Real-time multi-sensory data translation system that enables
 * human intuitive pattern recognition through harmonic/haptic/visual mapping.
 */

import { CMM, Industry, ColorMapping } from './color-mapping-matrix';

export interface SensoryImmersionProfile {
    // User's sensory preferences
    latencyTolerance: number;          // ms (0 = immediate, 1000 = smoothed)
    sensoryBandwidth: 'narrow' | 'standard' | 'wide';
    crossModalCoupling: number;        // 0.0 to 1.0 (how much senses interact)
    proprioceptiveWeighting: number;   // 0.0 to 1.0 (body awareness vs auditory)
    
    // Neurodivergent adaptations
    sensoryAvoidanceThresholds: {
        auditory: number;      // 0.0 to 1.0
        haptic: number;        // 0.0 to 1.0
        visual: number;        // 0.0 to 1.0
    };
    patternRecognitionStyle: 'sequential' | 'parallel' | 'holistic';
    temporalResolution: 'micro' | 'macro' | 'both';
}

export interface IntuitiveOutput {
    // IMMEDIATE sensory data (no predictions)
    currentHarmonic: HarmonicState;
    currentHaptic: HapticState;
    currentVisual: VisualState;
    
    // Pattern reinforcement (for intuition building)
    patternHistory: PatternSignature[];
    sensoryAnchors: SensoryAnchor[];
    
    // User interpretation markers (added by user)
    userInterpretations: UserMark[];
}

interface HarmonicState {
    fundamental: number;                // 432 Hz base
    harmonicSeries: Harmonic[];
    timbre: 'smooth' | 'textured' | 'granular';
    spatialization: StereoField;
    amplitudeEnvelope: Envelope;
}

interface HapticState {
    primaryPattern: VibrationPattern;
    secondaryPatterns: VibrationPattern[];
    bodyMap: BodyMapping;              // Where vibrations occur on body
    intensityGradient: number[];      // How intensity flows through pattern
}

interface VisualState {
    primaryColor: ColorMapping;
    secondaryColors: ColorMapping[];
    movementPattern: MovementPattern;
    depthLayers: number;               // 3D depth perception
}

interface PatternSignature {
    timestamp: number;
    sensorySignature: {
        harmonicFingerprint: number[];
        hapticFingerprint: number[];
        colorFingerprint: string[];
    };
    marketCondition: string;          // User-labeled, not predicted
    duration: number;                  // How long pattern lasted
}

interface SensoryAnchor {
    condition: string;                  // "bull run", "flash crash", "consolidation"
    harmonicAnchor: number;             // Reference frequency
    hapticAnchor: VibrationPattern;    // Reference vibration
    colorAnchor: ColorMapping;          // Reference color
    userConfidence: number;            // 0.0 to 1.0
}

interface UserMark {
    timestamp: number;
    userPrediction: string;            // "I feel upward pressure", "This feels heavy"
    confidence: number;                // User's confidence in their intuition
    sensoryContext: IntuitiveOutput;   // What they were feeling when they marked
    outcome?: string;                  // Added later - what actually happened
}

export class IntuitiveSonificationEngine {
    private immersionProfile: SensoryImmersionProfile;
    private audioContext: AudioContext;
    private patternHistory: PatternSignature[] = [];
    private sensoryAnchors: Map<string, SensoryAnchor> = new Map();
    private userMarks: UserMark[] = [];
    
    // Golden ratio intervals for natural harmony
    private static readonly GOLDEN_INTERVALS = [
        1,                              // Fundamental
        1.6180339887,                   // φ
        2.6180339887,                   // φ²
        4.2360679775,                   // φ³
        6.8541019662,                   // φ⁴
        11.0901699437,                  // φ⁵
        17.94427191,                    // φ⁶
        29.0344418537                   // φ⁷
    ];
    
    // Fibonacci-based vibration patterns (1-2-4-8-7-5)
    private static readonly FIBONACCI_PATTERNS = {
        growing: [1, 2, 4, 8, 16],      // Expanding energy
        contracting: [8, 7, 5, 3, 2, 1], // Diminishing energy
        stable: [1, 1, 2, 3, 5, 8],     // Balanced growth
        chaotic: [1, 3, 4, 7, 11, 18]  // Unpredictable
    };
    
    constructor(audioContext: AudioContext, profile?: Partial<SensoryImmersionProfile>) {
        this.audioContext = audioContext;
        this.immersionProfile = {
            latencyTolerance: 50,       // Very low latency for real-time
            sensoryBandwidth: 'wide',
            crossModalCoupling: 0.7,    // Strong sensory interaction
            proprioceptiveWeighting: 0.5,
            sensoryAvoidanceThresholds: {
                auditory: 0.8,
                haptic: 0.9,
                visual: 0.7
            },
            patternRecognitionStyle: 'holistic',
            temporalResolution: 'both'
        };
        
        if (profile) {
            this.immersionProfile = { ...this.immersionProfile, ...profile };
        }
    }
    
    /**
     * REAL-TIME SENSORY IMMERSION - No predictions, pure present-moment translation
     */
    immerseInPresent(
        currentState: {
            price: number;
            volume: number;
            momentum: number;
            sentiment: number;
            volatility: number;
            correlation: number;
        },
        industry: Industry,
        dataStreamId: string,
        userContext?: {
            isFirstExperience: boolean;
            previousOutcome?: 'correct' | 'incorrect' | 'neutral';
            currentEmotion?: 'calm' | 'agitated' | 'focused' | 'overwhelmed';
        }
    ): IntuitiveOutput {
        
        // 1. IMMEDIATE harmonic translation (no smoothing unless requested)
        const harmonicState = this.translateToHarmonics(currentState, userContext);
        
        // 2. Haptic vibration patterns based on Fibonacci sequences
        const hapticState = this.translateToHaptics(currentState, harmonicState);
        
        // 3. Color mapping through CMM
        const visualState = this.translateToVisuals(currentState, industry);
        
        // 4. Build pattern signature for user's intuition development
        const patternSig = this.buildPatternSignature(
            harmonicState,
            hapticState,
            visualState,
            currentState
        );
        
        // 5. Store in history for pattern recognition
        this.patternHistory.push(patternSig);
        
        // 6. Limit history to reasonable size
        if (this.patternHistory.length > 1000) {
            this.patternHistory.shift();
        }
        
        // 7. Check for pattern reinforcement (user learning)
        const reinforcedAnchor = this.checkPatternReinforcement(patternSig);
        
        return {
            currentHarmonic: harmonicState,
            currentHaptic: hapticState,
            currentVisual: visualState,
            patternHistory: this.patternHistory.slice(-10), // Last 10 patterns
            sensoryAnchors: reinforcedAnchor ? [this.sensoryAnchors.get(reinforcedAnchor)!] : [],
            userInterpretations: this.getRecentUserMarks(dataStreamId)
        };
    }
    
    /**
     * HARMONIC TRANSLATION: Present-moment frequency mapping
     */
    private translateToHarmonics(
        state: Record<string, number>,
        userContext?: any
    ): HarmonicState {
        
        // Base frequency from price with golden ratio harmonics
        const baseFreq = 432; // Standard harmonic
        
        // Determine harmonic series based on market state
        let harmonicIndices: number[];
        if (state.volatility > 0.7) {
            harmonicIndices = [0, 3, 7]; // Wider spread for volatility
        } else if (state.momentum > 0.5) {
            harmonicIndices = [0, 2, 4, 6]; // Upward progression
        } else if (state.momentum < -0.5) {
            harmonicIndices = [0, 1, 3, 5]; // Downward progression
        } else {
            harmonicIndices = [0, 2, 5]; // Neutral, consonant
        }
        
        // Generate harmonics
        const harmonicSeries: Harmonic[] = harmonicIndices.map((index, i) => {
            const ratio = IntuitiveSonificationEngine.GOLDEN_INTERVALS[index];
            const freq = baseFreq * ratio;
            
            // Adjust based on volume (amplitude) and sentiment (detuning)
            const volumeScale = 0.5 + (state.volume * 0.5);
            const sentimentDetune = state.sentiment * 0.02; // ±2% detuning
            
            return {
                frequency: freq * (1 + sentimentDetune),
                amplitude: (0.7 / (i + 1)) * volumeScale, // Higher harmonics quieter
                phase: (Math.PI * i) / harmonicIndices.length,
                type: this.determineWaveform(state)
            };
        });
        
        // Timbre based on volatility
        let timbre: 'smooth' | 'textured' | 'granular';
        if (state.volatility < 0.3) {
            timbre = 'smooth';
        } else if (state.volatility < 0.7) {
            timbre = 'textured';
        } else {
            timbre = 'granular';
        }
        
        // Stereo field based on correlation
        const spatialization: StereoField = {
            left: Math.max(0, 0.5 - (state.correlation * 0.5)),
            right: Math.max(0, 0.5 + (state.correlation * 0.5)),
            center: 0.5,
            width: Math.abs(state.correlation)
        };
        
        // Amplitude envelope based on volume changes
        const envelope: Envelope = {
            attack: 10 + (state.volatility * 50), // ms
            decay: 50 + (state.volume * 100),
            sustain: 0.7 + (state.momentum * 0.3),
            release: 100 + (Math.abs(state.sentiment) * 200)
        };
        
        return {
            fundamental: baseFreq,
            harmonicSeries,
            timbre,
            spatialization,
            amplitudeEnvelope: envelope
        };
    }
    
    /**
     * HAPTIC TRANSLATION: Fibonacci-based vibration patterns
     */
    private translateToHaptics(
        state: Record<string, number>,
        harmonicState: HarmonicState
    ): HapticState {
        
        // Select pattern based on market conditions
        let pattern: number[];
        if (state.volume > 0.7 && state.momentum > 0.5) {
            pattern = IntuitiveSonificationEngine.FIBONACCI_PATTERNS.growing;
        } else if (state.volume > 0.7 && state.momentum < -0.5) {
            pattern = IntuitiveSonificationEngine.FIBONACCI_PATTERNS.contracting;
        } else if (Math.abs(state.correlation) > 0.7) {
            pattern = IntuitiveSonificationEngine.FIBONACCI_PATTERNS.stable;
        } else {
            pattern = IntuitiveSonificationEngine.FIBONACCI_PATTERNS.chaotic;
        }
        
        // Normalize pattern to 0-1 range
        const maxVal = Math.max(...pattern);
        const normalizedPattern = pattern.map(val => val / maxVal);
        
        // Map to intensities based on volume
        const intensities = normalizedPattern.map(val => 
            Math.min(1.0, val * (0.5 + (state.volume * 0.5)))
        );
        
        // Frequencies based on harmonic series
        const baseFreq = 50; // Base haptic frequency
        const frequencies = pattern.map((val, i) => {
            if (harmonicState.harmonicSeries[i]) {
                return baseFreq * (harmonicState.harmonicSeries[i].frequency / 432);
            }
            return baseFreq * (1 + (i * 0.5));
        });
        
        // Durations based on momentum (positive = longer, negative = shorter)
        const baseDuration = 100; // ms
        const durations = pattern.map(val => 
            baseDuration * (1 + (state.momentum * 0.5))
        );
        
        // Body mapping - where on body vibrations occur
        const bodyMap: BodyMapping = {
            locations: [
                { position: 'chest', intensity: intensities[0] },
                { position: 'leftArm', intensity: intensities[1] },
                { position: 'rightArm', intensity: intensities[2] },
                { position: 'leftLeg', intensity: intensities[3] },
                { position: 'rightLeg', intensity: intensities[4] }
            ],
            symmetry: Math.abs(state.correlation) > 0.5 ? 'symmetric' : 'asymmetric'
        };
        
        // Intensity gradient - how intensity flows through pattern
        const gradient = this.calculateIntensityGradient(intensities, state.momentum);
        
        return {
            primaryPattern: {
                intensities,
                frequencies,
                durations,
                waveform: 'sine'
            },
            secondary
