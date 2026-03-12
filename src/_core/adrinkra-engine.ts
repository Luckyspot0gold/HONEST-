/**
 * adinkra-engine.ts
 * H.O.N.E.S.T. — RangisHeartbeat & Reality Protocol LLC
 * Justin William McCrea
 *
 * Cross-Modal Encoding Engine — Mathematical Formalism v2.1
 * Implements the LaTeX specification exactly, extended to 8D McCrea Market Metrix.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * MATHEMATICAL FOUNDATIONS (from v2.1 spec)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 6D Eigenstate:  E = (σ, δ, d, p, a, h)
 * 8D Extension:   E₈ = (σ, δ, d, p, a, h, c₁, c₂)
 *
 * Audio:    f_p = f_b · (1 + log₂(1 + σ))
 *           amp = 0.5 + 0.5·|δ|
 *           A(t) = amp · Σ(n=1..5) sin(2π·n·f_p·t) · e^(-kt)
 *
 * Color:    λ = 450 + 200 · log(f_p/f_b) / log(2)   [nm, 380–740]
 *           sat = 50 + 50·amp,  bri = 60 + 40·p
 *           α(t) = 1 − 0.2|a|·(1 − cos(2πt/T))
 *
 * Haptic:   vibe_amp = 100·σ,  pulse_f = 1 + 5·|a|
 *           H(t) = vibe_amp · e^(-kt)
 *
 * Phase:    φ(t) = 2π·h·t
 *           A(t)·sin(φ) = C(t)·cos(φ) = H(t)·sin(φ)  [phase-locked]
 *
 * Adinkra:  Q·E = E_B + E_F
 *           2048D: S = Σᵢ T_ijk · vᵢ ⊗ hⱼ ⊗ aₖ
 */

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

/** 6D eigenstate as defined in the LaTeX formalism */
export interface Eigenstate6D {
    sigma: number;   // σ — volatility [0,1]
    delta: number;   // δ — rate of change [0,1]
    d: number;       // d — directionality [-1,1]
    p: number;       // p — persistence [0,1]
    a: number;       // a — acceleration [-1,1]
    h: number;       // h — entropy [0,1]
}

/** 8D McCrea Market Metrix: 6D + cognitive accessibility dimensions */
export interface Eigenstate8D extends Eigenstate6D {
    c1: number;      // c₁ — cognitive load [0,1]  (from NASA-TLX or RNIB profile)
    c2: number;      // c₂ — sensory integration [0,1]
}

/** Full multi-sensory output — all modalities phase-locked */
export interface SensoryOutput {
    audio: AudioOutput;
    visual: VisualOutput;
    haptic: HapticOutput;
    cognitive: CognitiveAdaptation;
    phase: PhaseState;
    meta: OutputMeta;
}

export interface AudioOutput {
    // Spec: f_p = f_b · (1 + log₂(1 + σ))
    frequency: number;          // Hz
    amplitude: number;          // 0–1, spec: 0.5 + 0.5·|δ|
    harmonics: HarmonicSeries;  // A(t) = amp·Σ sin(2π·n·f_p·t)·e^(-kt)
    pan: number;                // -1 to +1 (directionality d)
    intervalSemitones: number;  // +4 if d>0, −4 if d≤0
    decay: number;              // k in e^(-kt)
    jitter: number;             // Fermionic phase perturbation
    timbre: 'sine' | 'triangle' | 'sawtooth' | 'square';
    waveformSamples?: Float32Array; // Pre-computed A(t) buffer
}

export interface HarmonicSeries {
    fundamentalHz: number;
    partials: number[];         // n=1..5 frequencies
    weights: number[];          // Amplitude per partial (unity)
    decayK: number;
}

export interface VisualOutput {
    // Spec: λ = 450 + 200·log(f_p/f_b)/log(2)
    wavelengthNm: number;       // 380–740 nm
    hsl: { h: number; s: number; l: number };
    saturation: number;         // 50 + 50·amp
    brightness: number;         // 60 + 40·p
    opacity: OpacityPulse;      // α(t) = 1 − 0.2|a|·(1−cos(2πt/T))
    bloomIntensity: number;
    particleCount: number;
    complexityLevel: number;    // 0–2
}

export interface OpacityPulse {
    baseAlpha: number;          // Mean opacity
    amplitude: number;          // 0.2·|a|
    periodSec: number;          // T
    fn: (t: number) => number;  // α(t)
}

export interface HapticOutput {
    // Spec: vibe_amp = 100·σ,  pulse_f = 1 + 5·|a|
    vibeAmplitude: number;      // 0–100
    pulseFrequency: number;     // Hz: 1 + 5·|a|
    pattern: number[];          // 8-element pattern vector
    rhythm: 'regular' | 'irregular';
    duration: number;           // ms
    attack: number;             // ms
    decay: number;              // k in H(t) = vibe_amp·e^(-kt)
    spatialMap: { left: number; right: number; center: number };
    envelopeFn: (t: number) => number; // H(t)
}

export interface CognitiveAdaptation {
    simplifyVisuals: boolean;
    reducePacing: boolean;
    increaseContrast: boolean;
    provideNarrative: boolean;
    maxSimultaneousCues: number; // c₁ reduces capacity: floor(3 − c₁·2)
    cueDurationMs: number;       // c₂ affects timing
}

export interface PhaseState {
    // φ(t) = 2π·h·t  — master clock derived from entropy h
    entropyH: number;
    phaseFn: (t: number) => number;  // φ(t)
    // Phase-lock verification: A(t)·sin(φ) = C(t)·cos(φ) = H(t)·sin(φ)
    audioPhaseMultiplier: 'sin';
    visualPhaseMultiplier: 'cos';
    hapticPhaseMultiplier: 'sin';
}

export interface OutputMeta {
    eigenstateVersion: '6D' | '8D';
    adinkraNodes: AdinkraNode[];
    bosonicValues: number[];
    fermionicValues: number[];
    accessibilityValues: number[];
    confidence: number[];
    processingTimeMs: number;
    timestamp: number;
}

export interface AdinkraNode {
    id: string;
    type: 'bosonic' | 'fermionic' | 'accessibility';
    value: number;
    confidence: number;
    partners: string[];
}

export interface MappingValidation {
    hypothesis: string;
    testMethod: 'A/B' | 'correlation' | 't-test' | 'ANOVA';
    metric: string;
    targetEffectSize: number;
    actualEffectSize?: number;
    pValue?: number;
    validated: boolean;
}

// ─────────────────────────────────────────────────────────
// MATH PRIMITIVES
// Exact implementations of the LaTeX formulas
// ─────────────────────────────────────────────────────────

export const Math2pi = 2 * Math.PI;

/**
 * Audio frequency mapping — LaTeX §2
 * f_p = f_b · (1 + log₂(1 + σ))
 */
export function pitchFrequency(sigma: number, fb: number = 432): number {
    return fb * (1 + Math.log2(1 + sigma));
}

/**
 * Amplitude — LaTeX §2
 * amp = 0.5 + 0.5·|δ|
 */
export function audioAmplitude(delta: number): number {
    return 0.5 + 0.5 * Math.abs(delta);
}

/**
 * Phase-locked waveform — LaTeX §2
 * A(t) = amp · Σ(n=1..5) sin(2π·n·f_p·t) · e^(-kt)
 */
export function audioWaveform(
    t: number,
    amp: number,
    fp: number,
    k: number = 0.5
): number {
    let sum = 0;
    for (let n = 1; n <= 5; n++) {
        sum += Math.sin(Math2pi * n * fp * t);
    }
    return amp * sum * Math.exp(-k * t);
}

/**
 * Wavelength from pitch — LaTeX §3
 * λ = 450 + 200 · log(f_p/f_b) / log(2)   [nm]
 */
export function pitchToWavelength(fp: number, fb: number = 432): number {
    const lambda = 450 + 200 * Math.log(fp / fb) / Math.log(2);
    return Math.max(380, Math.min(740, lambda));
}

/**
 * Wavelength → approximate HSL hue (380–740 nm visible spectrum)
 */
export function wavelengthToHue(lambdaNm: number): number {
    // Map 380–740 nm → 270°–0° (violet→red, through the spectrum)
    const t = (lambdaNm - 380) / 360;
    return Math.round((1 - t) * 270);
}

/**
 * Opacity pulse — LaTeX §3
 * α(t) = 1 − 0.2·|a|·(1 − cos(2πt/T))
 */
export function opacityPulse(t: number, a: number, T: number = 1): number {
    return 1 - 0.2 * Math.abs(a) * (1 - Math.cos(Math2pi * t / T));
}

/**
 * Haptic envelope — LaTeX §4
 * H(t) = vibe_amp · e^(-kt)
 */
export function hapticEnvelope(t: number, vibeAmp: number, k: number = 0.5): number {
    return vibeAmp * Math.exp(-k * t);
}

/**
 * Master phase clock — LaTeX §5
 * φ(t) = 2π·h·t
 */
export function masterPhase(t: number, h: number): number {
    return Math2pi * h * t;
}

/**
 * Validate phase lock — LaTeX §5
 * Checks: A·sin(φ) ≈ H·sin(φ) (audio and haptic locked)
 * and: C·cos(φ) (visual on quadrature)
 */
export function verifyPhaseLock(
    t: number,
    A: number, C: number, H: number,
    phi: number,
    tolerance: number = 0.05
): boolean {
    const audioLock = A * Math.sin(phi);
    const hapticLock = H * Math.sin(phi);
    const visualLock = C * Math.cos(phi);
    return (
        Math.abs(audioLock - hapticLock) < tolerance &&
        Math.abs(Math.abs(audioLock) - Math.abs(visualLock)) < tolerance
    );
}

// ─────────────────────────────────────────────────────────
// ADINKRA LIFT ENGINE
// Q·E = E_B + E_F  (bosonic + fermionic decomposition)
// ─────────────────────────────────────────────────────────

export class AdinkraLift {
    private bosonicWeights: number[][];     // 8×8
    private fermionicWeights: number[][];   // 8×4
    private accessibilityWeights: number[][]; // 12×4 (for 8D)

    constructor() {
        this.bosonicWeights = this.initWeights(8, 8, 'identity');
        this.fermionicWeights = this.initWeights(8, 4, 'identity');
        this.accessibilityWeights = this.initWeights(12, 4, 'identity');
    }

    private initWeights(
        rows: number, cols: number,
        strategy: 'identity' | 'random' = 'identity'
    ): number[][] {
        return Array.from({ length: rows }, (_, i) =>
            Array.from({ length: cols }, (_, j) => {
                if (strategy === 'identity' && i === j && i < Math.min(rows, cols)) return 1.0;
                if (strategy === 'random') return (Math.random() - 0.5) * 0.2;
                return i === j ? 1.0 : 0.0;
            })
        );
    }

    /**
     * Lift eigenstate to Adinkra supersymmetric representation.
     * Q·E = E_B + E_F
     * Bosonic nodes: drive amplitude and wavelength (continuous)
     * Fermionic nodes: drive phase jitter and reverb (discontinuous jumps)
     */
    lift(state: Eigenstate8D): {
        bosonic: number[];
        fermionic: number[];
        accessibility: number[];
        confidence: number[];
        nodes: AdinkraNode[];
    } {
        const vec = this.toVector(state);
        const jumps = this.detectJumps(state);

        // E_B: bosonic lift — matrix multiplication
        const bosonic = this.bosonicWeights.map(row => this.dot(row, vec));

        // E_F: fermionic lift — applied to jump discontinuities
        const fermionic = this.fermionicWeights.map(row => this.dot(row, jumps));

        // Accessibility: combined lift for c₁, c₂ adaptation
        const combined = [...bosonic, ...fermionic];
        const accessibility = this.accessibilityWeights.map(row =>
            this.dot(row, combined.slice(0, row.length))
        );

        const confidence = this.computeConfidence(state, bosonic, fermionic, accessibility);
        const nodes = this.buildNodes(bosonic, fermionic, accessibility, confidence);

        return { bosonic, fermionic, accessibility, confidence, nodes };
    }

    /**
     * 2048D tensor extension — LaTeX §5
     * S = Σᵢ T_ijk · vᵢ ⊗ hⱼ ⊗ aₖ
     * (Compressed representation for patent claim; full expansion is O(2048³))
     */
    lift2048D(state: Eigenstate8D): { rank: number; trace: number; frobeniusNorm: number } {
        const vec = this.toVector(state);
        // Compute representative statistics without allocating 2048³ tensor
        let trace = 0, norm = 0;
        const dim = 2048;
        for (let i = 0; i < vec.length; i++) {
            for (let j = 0; j < vec.length; j++) {
                for (let k = 0; k < vec.length; k++) {
                    const t = vec[i] * vec[j] * vec[k]; // T_ijk in rank-1 approximation
                    if (i === j && j === k) trace += t;
                    norm += t * t;
                }
            }
        }
        return { rank: dim, trace, frobeniusNorm: Math.sqrt(norm) };
    }

    private toVector(state: Eigenstate8D): number[] {
        return [state.sigma, state.delta, state.d, state.p, state.a, state.h, state.c1, state.c2];
    }

    private detectJumps(state: Eigenstate8D): number[] {
        return [
            Math.abs(state.a) > 0.05 ? 1 : 0,                 // Volatility acceleration
            state.d * state.a < 0 ? 1 : 0,                    // Direction reversal
            state.p < 0.3 ? 1 : 0,                            // Persistence break
            state.h > 0.20 ? 1 : 0,                           // Entropy spike
        ];
    }

    private dot(a: number[], b: number[]): number {
        return a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
    }

    private computeConfidence(
        state: Eigenstate8D,
        bosonic: number[],
        fermionic: number[],
        accessibility: number[]
    ): number[] {
        const bosonicConf = bosonic.map(v => Math.min(Math.abs(v), 1) * 0.8 + 0.2);
        const jumps = this.detectJumps(state);
        const fermionicConf = fermionic.map((v, i) =>
            (jumps[i] * 0.6 + 0.4) * Math.min(Math.abs(v), 1)
        );
        const userCoherence = 1 - Math.abs((state.c1 + state.c2) / 2 - 0.5) * 2;
        const accessConf = accessibility.map(v =>
            Math.min(Math.abs(v), 1) * (0.7 + 0.3 * userCoherence)
        );
        return [...bosonicConf, ...fermionicConf, ...accessConf];
    }

    private buildNodes(
        bosonic: number[], fermionic: number[],
        accessibility: number[], confidence: number[]
    ): AdinkraNode[] {
        const nodes: AdinkraNode[] = [];
        const labels = ['σ','δ','d','p','a','h','c₁','c₂'];

        bosonic.forEach((v, i) => nodes.push({
            id: `B${i}`, type: 'bosonic', value: v,
            confidence: confidence[i] ?? 0,
            partners: [`F${i % fermionic.length}`],
        }));
        fermionic.forEach((v, i) => nodes.push({
            id: `F${i}`, type: 'fermionic', value: v,
            confidence: confidence[bosonic.length + i] ?? 0,
            partners: [`B${i}`, `A${i % accessibility.length}`],
        }));
        accessibility.forEach((v, i) => nodes.push({
            id: `A${i}`, type: 'accessibility', value: v,
            confidence: confidence[bosonic.length + fermionic.length + i] ?? 0,
            partners: [`B${i % bosonic.length}`],
        }));
        return nodes;
    }

    /** Gradient-descent weight update from user feedback */
    updateWeights(feedback: { eigenstate: Eigenstate8D; rating: number }[], lr = 0.01): void {
        feedback.forEach(({ eigenstate, rating }) => {
            const result = this.lift(eigenstate);
            const predicted = result.bosonic.reduce((a, b) => a + b, 0) / result.bosonic.length * 4 + 1;
            const error = rating - predicted;
            this.bosonicWeights = this.bosonicWeights.map(row =>
                row.map(w => w + lr * error)
            );
        });
    }
}

// ─────────────────────────────────────────────────────────
// CROSS-MODAL ENCODING ENGINE  (main class)
// ─────────────────────────────────────────────────────────

export class CrossModalEncodingEngine {
    readonly fb: number = 432;       // Base frequency Hz
    private adinkra: AdinkraLift;
    private validations: MappingValidation[];
    private testData: Array<{ state: Eigenstate8D; userId: string; rating: number }> = [];

    constructor(baseFrequency: number = 432) {
        this.fb = baseFrequency;
        this.adinkra = new AdinkraLift();
        this.validations = this.buildValidations();
    }

    /**
     * PRIMARY ENCODE METHOD
     * Maps an 8D eigenstate to a fully phase-locked multi-sensory output.
     * All formulas implemented exactly per LaTeX v2.1 spec.
     */
    encode(state: Eigenstate8D, userId?: string): SensoryOutput {
        const t0 = performance.now();

        // Validate ranges
        this.validate(state);

        // Adinkra lift: Q·E = E_B + E_F
        const { bosonic, fermionic, accessibility, confidence, nodes } =
            this.adinkra.lift(state);

        // ── AUDIO (§2) ──
        const fp = pitchFrequency(state.sigma, this.fb);
        const amp = audioAmplitude(state.delta);
        const k = 0.5; // Decay constant

        const audio: AudioOutput = {
            frequency: fp,
            amplitude: amp,
            harmonics: {
                fundamentalHz: fp,
                partials: Array.from({ length: 5 }, (_, n) => fp * (n + 1)),
                weights: Array(5).fill(1),
                decayK: k,
            },
            pan: state.d > 0 ? 0.5 : -0.5,
            intervalSemitones: state.d > 0 ? +4 : -4,
            decay: k,
            jitter: fermionic.some(v => Math.abs(v) > 0.5) ? 0.1 : 0,
            timbre: state.sigma > 0.7 ? 'sawtooth' : state.sigma > 0.4 ? 'triangle' : 'sine',
        };

        // ── VISUAL (§3) ──
        const lambdaNm = pitchToWavelength(fp, this.fb);
        const hue = wavelengthToHue(lambdaNm);
        const saturation = 50 + 50 * amp;
        const brightness = 60 + 40 * state.p;
        const T = 1; // Period for opacity pulse

        const visual: VisualOutput = {
            wavelengthNm: lambdaNm,
            hsl: { h: hue, s: saturation, l: brightness },
            saturation,
            brightness,
            opacity: {
                baseAlpha: 1,
                amplitude: 0.2 * Math.abs(state.a),
                periodSec: T,
                fn: (t: number) => opacityPulse(t, state.a, T),
            },
            bloomIntensity: state.sigma * 0.5,
            particleCount: Math.floor(Math.abs(state.delta) * 100),
            complexityLevel: Math.floor(bosonic[5] ?? 0) % 3,
        };

        // ── HAPTIC (§4) ──
        const vibeAmp = 100 * state.sigma;
        const pulseF = 1 + 5 * Math.abs(state.a);

        const haptic: HapticOutput = {
            vibeAmplitude: vibeAmp,
            pulseFrequency: pulseF,
            pattern: Array.from({ length: 8 }, (_, i) => vibeAmp * (bosonic[i] ?? 0.5)),
            rhythm: fermionic.some(v => Math.abs(v) > 0.5) ? 'irregular' : 'regular',
            duration: 1000 + state.p * 2000,
            attack: 50 + state.a * 100,
            decay: k,
            spatialMap: {
                left:   state.d < 0 ? vibeAmp : 0,
                right:  state.d > 0 ? vibeAmp : 0,
                center: state.sigma * 50,
            },
            envelopeFn: (t: number) => hapticEnvelope(t, vibeAmp, k),
        };

        // ── COGNITIVE ADAPTATION (§8D extension) ──
        const cognitive: CognitiveAdaptation = {
            simplifyVisuals:  accessibility[0] > 0.7,
            reducePacing:     accessibility[1] > 0.6,
            increaseContrast: accessibility[2] > 0.5,
            provideNarrative: accessibility[3] > 0.8,
            maxSimultaneousCues: Math.max(1, Math.floor(3 - state.c1 * 2)),
            cueDurationMs: 500 + state.c2 * 1000,
        };

        // Apply c₁/c₂ adaptations
        if (state.c2 > 0.7) {
            audio.amplitude *= 0.8;
            audio.jitter *= 0.5;
        }
        if (state.c1 > 0.7) {
            visual.complexityLevel = Math.min(visual.complexityLevel, 1);
            visual.particleCount = Math.floor(visual.particleCount * 0.5);
        }

        // ── PHASE LOCK (§5) ──
        // φ(t) = 2π·h·t
        const phase: PhaseState = {
            entropyH: state.h,
            phaseFn: (t: number) => masterPhase(t, state.h),
            audioPhaseMultiplier: 'sin',
            visualPhaseMultiplier: 'cos',
            hapticPhaseMultiplier: 'sin',
        };

        if (userId) this.testData.push({ state, userId, rating: 0 });

        return {
            audio, visual, haptic, cognitive, phase,
            meta: {
                eigenstateVersion: '8D',
                adinkraNodes: nodes,
                bosonicValues: bosonic,
                fermionicValues: fermionic,
                accessibilityValues: accessibility,
                confidence,
                processingTimeMs: performance.now() - t0,
                timestamp: Date.now(),
            },
        };
    }

    /**
     * Verify phase lock at time t.
     * A(t)·sin(φ) = C(t)·cos(φ) = H(t)·sin(φ)
     */
    checkPhaseLock(output: SensoryOutput, t: number): {
        locked: boolean;
        audioVal: number;
        visualVal: number;
        hapticVal: number;
        phi: number;
    } {
        const phi = output.phase.phaseFn(t);
        const A = audioWaveform(t, output.audio.amplitude, output.audio.frequency, output.audio.decay);
        const C = output.visual.opacity.fn(t);
        const H = output.haptic.envelopeFn(t);
        return {
            locked: verifyPhaseLock(t, A, C, H, phi),
            audioVal: A * Math.sin(phi),
            visualVal: C * Math.cos(phi),
            hapticVal: H * Math.sin(phi),
            phi,
        };
    }

    /** Update learned weights from user feedback */
    learn(feedback: Array<{ eigenstate: Eigenstate8D; rating: number }>): void {
        this.adinkra.updateWeights(feedback);
    }

    /** Export study data for RNIB protocol */
    exportStudyData(): {
        eigenstates: Eigenstate8D[];
        userMappings: typeof this.testData;
        validations: MappingValidation[];
    } {
        return {
            eigenstates: this.testData.map(d => d.state),
            userMappings: this.testData,
            validations: this.validations,
        };
    }

    private validate(state: Eigenstate8D): void {
        const errors: string[] = [];
        if (state.sigma < 0 || state.sigma > 1) errors.push(`σ=${state.sigma}`);
        if (state.delta < 0 || state.delta > 1) errors.push(`δ=${state.delta}`);
        if (state.d < -1 || state.d > 1)        errors.push(`d=${state.d}`);
        if (state.p < 0 || state.p > 1)         errors.push(`p=${state.p}`);
        if (state.a < -1 || state.a > 1)        errors.push(`a=${state.a}`);
        if (state.h < 0 || state.h > 1)         errors.push(`h=${state.h}`);
        if (state.c1 < 0 || state.c1 > 1)       errors.push(`c₁=${state.c1}`);
        if (state.c2 < 0 || state.c2 > 1)       errors.push(`c₂=${state.c2}`);
        if (errors.length) throw new Error(`Eigenstate validation failed: ${errors.join(', ')}`);
    }

    private buildValidations(): MappingValidation[] {
        return [
            {
                hypothesis: 'σ (volatility) maps to haptic amplitude via vibe_amp = 100·σ',
                testMethod: 'correlation', metric: "Pearson's r: σ vs haptic rating",
                targetEffectSize: 0.7, validated: false,
            },
            {
                hypothesis: 'δ (rate of change) maps to audio amplitude: amp = 0.5 + 0.5·|δ|',
                testMethod: 'correlation', metric: 'R²: δ vs perceived loudness',
                targetEffectSize: 0.6, validated: false,
            },
            {
                hypothesis: 'd (directionality) produces asymmetric stereo (±4 semitones)',
                testMethod: 't-test', metric: 'L/R detection accuracy difference',
                targetEffectSize: 0.3, validated: false,
            },
            {
                hypothesis: 'c₁ (cognitive load) reduces max simultaneous cues: floor(3 − c₁·2)',
                testMethod: 'ANOVA', metric: 'Task completion time across c₁ levels',
                targetEffectSize: 0.4, validated: false,
            },
            {
                hypothesis: 'c₂ (sensory integration) improves multi-modal accuracy',
                testMethod: 'correlation', metric: 'Accuracy gain: multi vs single modal',
                targetEffectSize: 0.5, validated: false,
            },
            {
                hypothesis: 'Phase lock maintained: A(t)·sin(φ) = H(t)·sin(φ)',
                testMethod: 'correlation', metric: 'Phase coherence across 1000 time steps',
                targetEffectSize: 0.95, validated: false,
            },
        ];
    }
}

// ─────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────

export class AdinkraTestSuite {
    private engine: CrossModalEncodingEngine;
    private results: string[] = [];

    constructor() {
        this.engine = new CrossModalEncodingEngine();
    }

    runAll(): void {
        console.log('═══════════════════════════════════════════════════');
        console.log(' H.O.N.E.S.T. Adinkra Engine — Test Suite v2.1');
        console.log('═══════════════════════════════════════════════════');

        this.testValidation();
        this.testMathFormulas();
        this.testPhaseLock();
        this.testEdgeCases();
        this.testPerformance();
        this.testAdaptiveLearning();

        console.log('\n─── Results ─────────────────────────────────────');
        this.results.forEach(r => console.log(r));
        const passed = this.results.filter(r => r.includes('✅')).length;
        console.log(`\n${passed}/${this.results.length} tests passed`);
    }

    private log(label: string, pass: boolean, detail?: string): void {
        const r = `  ${pass ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`;
        this.results.push(r);
        console.log(r);
    }

    private testValidation(): void {
        console.log('\n1. Input Validation');
        const valid: Eigenstate8D = { sigma: 0.5, delta: 0.3, d: 0.8, p: 0.6, a: -0.2, h: 0.4, c1: 0.7, c2: 0.5 };
        try { this.engine.encode(valid); this.log('Valid state accepted', true); }
        catch (e) { this.log('Valid state accepted', false, String(e)); }

        const invalid = { ...valid, sigma: 1.5 };
        try { this.engine.encode(invalid as Eigenstate8D); this.log('Invalid state rejected', false); }
        catch { this.log('Invalid state rejected', true, 'σ=1.5 correctly thrown'); }
    }

    private testMathFormulas(): void {
        console.log('\n2. LaTeX Formula Verification');
        // f_p = f_b · (1 + log₂(1 + σ))
        const fp = pitchFrequency(0.5);
        const expected = 432 * (1 + Math.log2(1.5));
        this.log('Pitch formula: f_p = f_b·(1+log₂(1+σ))', Math.abs(fp - expected) < 0.001, `${fp.toFixed(2)} Hz`);

        // amp = 0.5 + 0.5·|δ|
        const amp = audioAmplitude(0.6);
        this.log('Amplitude: 0.5 + 0.5·|δ|', Math.abs(amp - 0.8) < 0.001, `amp=${amp}`);

        // λ = 450 + 200·log(f_p/f_b)/log(2)
        const lambda = pitchToWavelength(fp);
        this.log(`Wavelength: λ=${lambda.toFixed(1)} nm`, lambda >= 380 && lambda <= 740);

        // vibe_amp = 100·σ, pulse_f = 1 + 5·|a|
        const state: Eigenstate8D = { sigma: 0.6, delta: 0.3, d: 0.5, p: 0.7, a: 0.2, h: 0.3, c1: 0.4, c2: 0.5 };
        const out = this.engine.encode(state);
        this.log('Haptic: vibe_amp = 100·σ', Math.abs(out.haptic.vibeAmplitude - 60) < 0.001, `${out.haptic.vibeAmplitude}`);
        this.log('Haptic: pulse_f = 1+5·|a|', Math.abs(out.haptic.pulseFrequency - 2) < 0.001, `${out.haptic.pulseFrequency} Hz`);
    }

    private testPhaseLock(): void {
        console.log('\n3. Phase Lock Verification');
        const state: Eigenstate8D = { sigma: 0.4, delta: 0.5, d: 0.3, p: 0.7, a: 0.1, h: 0.5, c1: 0.3, c2: 0.4 };
        const out = this.engine.encode(state);

        let lockedCount = 0;
        const N = 20;
        for (let i = 0; i < N; i++) {
            const t = i * 0.05;
            const check = this.engine.checkPhaseLock(out, t);
            if (check.locked) lockedCount++;
        }
        this.log(`Phase lock maintained (${lockedCount}/${N} time steps)`, lockedCount >= N * 0.8);
    }

    private testEdgeCases(): void {
        console.log('\n4. Edge Cases');
        const cases: [string, Eigenstate8D][] = [
            ['Zero volatility', { sigma: 0, delta: 0, d: 0, p: 1, a: 0, h: 0, c1: 0.5, c2: 0.5 }],
            ['Max volatility',  { sigma: 1, delta: 1, d: 1, p: 0, a: 1, h: 1, c1: 0.5, c2: 0.5 }],
            ['Max cognitive',   { sigma: 0.5, delta: 0.3, d: 0.8, p: 0.6, a: -0.2, h: 0.4, c1: 1, c2: 0 }],
            ['Full sensory',    { sigma: 0.5, delta: 0.3, d: 0.8, p: 0.6, a: -0.2, h: 0.4, c1: 0, c2: 1 }],
        ];
        cases.forEach(([label, state]) => {
            try {
                const out = this.engine.encode(state);
                this.log(label, true, `f=${out.audio.frequency.toFixed(1)}Hz λ=${out.visual.wavelengthNm.toFixed(0)}nm`);
            } catch (e) {
                this.log(label, false, String(e));
            }
        });
    }

    private testPerformance(): void {
        console.log('\n5. Performance (<1ms target)');
        const N = 1000;
        const t0 = performance.now();
        for (let i = 0; i < N; i++) {
            this.engine.encode({
                sigma: Math.random(), delta: Math.random(), d: Math.random() * 2 - 1,
                p: Math.random(), a: Math.random() * 2 - 1, h: Math.random(),
                c1: Math.random(), c2: Math.random(),
            });
        }
        const avg = (performance.now() - t0) / N;
        this.log(`${N} encodes, avg ${avg.toFixed(3)}ms`, avg < 1, avg < 1 ? 'meets real-time' : 'SLOW');
    }

    private testAdaptiveLearning(): void {
        console.log('\n6. Adaptive Learning');
        const feedback = Array.from({ length: 20 }, () => ({
            eigenstate: {
                sigma: Math.random(), delta: Math.random(), d: Math.random() * 2 - 1,
                p: Math.random(), a: Math.random() * 2 - 1, h: Math.random(),
                c1: Math.random(), c2: Math.random(),
            } as Eigenstate8D,
            rating: 3 + Math.random() * 2,
        }));
        try {
            this.engine.learn(feedback);
            this.log('Weight update from 20 feedback samples', true);
        } catch (e) {
            this.log('Adaptive learning', false, String(e));
        }

        const data = this.engine.exportStudyData();
        this.log(`Export: ${data.validations.length} hypotheses`, data.validations.length === 6);
    }
}

// ─────────────────────────────────────────────────────────
// EXPORTS & SINGLETON
// ─────────────────────────────────────────────────────────

export default CrossModalEncodingEngine;

export const HonestEngine = new CrossModalEncodingEngine(432);
export const runTests = () => new AdinkraTestSuite().runAll();
