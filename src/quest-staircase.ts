/**
 * quest-staircase-v2.3-final.ts
 * H.O.N.E.S.T. — Reality Protocol LLC
 * Justin William McCrea
 *
 * QUEST Bayesian Adaptive Psychometric Staircase — v2.3 FINAL
 *
 * VVV Venice AI Review Cycle — all issues addressed:
 *   ✓ maxTrials in constructor (bug fix — prevents infinite loop)
 *   ✓ Mid-session lapse check (clinical validity)
 *   ✓ Entropy-to-frequency scaling documented (perceptual reasoning)
 *   ✓ FFT cross-correlation flagged as TODO (production scaling)
 *   ✓ Shrinkage factor noted as Phase 2 optimization
 *
 * Watson & Pelli (1983): QUEST: A Bayesian adaptive psychometric method.
 * Perception & Psychophysics, 33(2), 113–120.
 *
 * All thresholds in log₁₀ space (Weber-Fechner: ΔI/I = k).
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type HapticTestType =
    | 'frequency_discrimination'
    | 'amplitude_discrimination'
    | 'pattern_recognition'
    | 'spatial_localisation'
    | 'temporal_order';

export interface QUESTParams {
    tGuess:     number;
    tGuessSd:   number;
    pThreshold: number;
    beta:       number;
    delta:      number;
    gamma:      number;
}

export interface TrialRecord {
    trialN:    number;
    intensity: number;
    response:  boolean;
    isCatch:   boolean;
    rt:        number;
    timestamp: number;
}

export interface QUESTResult {
    thresholdLog10:  number;
    thresholdLinear: number;
    posteriorSD:     number;
    trialsCompleted: number;
    converged:       boolean;
    lapseRate:       number;
    sessionValid:    boolean;
    catchTrialCount: number;
    catchFailures:   number;
    hitMaxTrials:    boolean;   // NEW: flag if stopped by limit not convergence
    trials:          TrialRecord[];
}

export interface PopulationPrior {
    populationMu:    number;
    populationSigma: number;
    n:               number;
    lastUpdated:     number;
}

export interface CatchTrialConfig {
    insertEveryN:        number;
    suprathresholdBoost: number;
    lapseThreshold:      number;
    // NEW: mid-session abort threshold — pause if this exceeded early
    midSessionAbortRate: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_PARAMS: Record<HapticTestType, QUESTParams> = {
    frequency_discrimination: { tGuess:1.0,tGuessSd:0.5,pThreshold:0.75,beta:3.5,delta:0.02,gamma:0.5 },
    amplitude_discrimination:  { tGuess:0.8,tGuessSd:0.4,pThreshold:0.75,beta:3.5,delta:0.02,gamma:0.5 },
    pattern_recognition:       { tGuess:1.2,tGuessSd:0.6,pThreshold:0.75,beta:2.5,delta:0.05,gamma:0.33 },
    spatial_localisation:      { tGuess:0.9,tGuessSd:0.4,pThreshold:0.75,beta:3.0,delta:0.02,gamma:0.25 },
    temporal_order:            { tGuess:1.1,tGuessSd:0.5,pThreshold:0.75,beta:3.5,delta:0.02,gamma:0.5 },
};

export const DEFAULT_CATCH_CONFIG: CatchTrialConfig = {
    insertEveryN:        8,
    suprathresholdBoost: 2.0,
    lapseThreshold:      0.25,
    midSessionAbortRate: 0.5,   // NEW: abort if 50%+ of early catches missed
};

// ─────────────────────────────────────────────────────────────────────────────
// POPULATION PRIOR MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export class PopulationPriorManager {
    private priors: Map<HapticTestType, PopulationPrior> = new Map();
    private readonly MIN_N_FOR_PRIOR = 10;

    updateEstimate(testType: HapticTestType, userThreshold: number, userSD: number): void {
        const prior = this.priors.get(testType);
        if (!prior) {
            this.priors.set(testType, {
                populationMu: userThreshold, populationSigma: userSD,
                n: 1, lastUpdated: Date.now(),
            });
            return;
        }
        const n_new    = prior.n + 1;
        const mu_new   = (prior.n * prior.populationMu + userThreshold) / n_new;
        const sig_new  = Math.sqrt(
            ((prior.n - 1) * prior.populationSigma ** 2
                + (userThreshold - prior.populationMu) ** 2
                + userSD ** 2
            ) / (n_new - 1)
        );
        prior.populationMu    = mu_new;
        prior.populationSigma = sig_new;
        prior.n               = n_new;
        prior.lastUpdated     = Date.now();
    }

    getPrior(testType: HapticTestType): QUESTParams {
        const base  = DEFAULT_PARAMS[testType];
        const prior = this.priors.get(testType);
        if (!prior || prior.n < this.MIN_N_FOR_PRIOR) return base;

        // VVV note: shrinkage = 0.7 is hardcoded here intentionally for MVP.
        // Phase 2 optimization: shrinkage = f(n) = 0.5 + 0.5*(1/√n)
        // gives tighter convergence as population grows. Not critical for N<50.
        const shrinkage = 0.7;
        return { ...base, tGuess: prior.populationMu, tGuessSd: prior.populationSigma * shrinkage };
    }

    getStats(): Record<string, { n:number; mu:number; sigma:number }|null> {
        const result: Record<string, { n:number; mu:number; sigma:number }|null> = {};
        for (const t of Object.keys(DEFAULT_PARAMS) as HapticTestType[]) {
            const p = this.priors.get(t);
            result[t] = p ? { n:p.n, mu:p.populationMu, sigma:p.populationSigma } : null;
        }
        return result;
    }

    async save(endpoint: string): Promise<void> {
        const data: Record<string,PopulationPrior> = {};
        for (const [k,v] of this.priors) data[k] = v;
        await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).catch(()=>{});
    }

    async load(endpoint: string): Promise<void> {
        try {
            const data = await (await fetch(endpoint)).json() as Record<string,PopulationPrior>;
            for (const [k,v] of Object.entries(data)) this.priors.set(k as HapticTestType, v);
        } catch { /* start fresh */ }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CATCH TRIAL UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export function shouldInsertCatch(trialN: number, cfg = DEFAULT_CATCH_CONFIG): boolean {
    return trialN > 0 && trialN % cfg.insertEveryN === 0;
}

export function getCatchIntensity(threshold: number, cfg = DEFAULT_CATCH_CONFIG): number {
    return threshold + cfg.suprathresholdBoost;
}

export function evaluateLapses(
    trials: TrialRecord[],
    cfg = DEFAULT_CATCH_CONFIG,
): { lapseRate:number; sessionValid:boolean; catchCount:number; failures:number } {
    const catches  = trials.filter(t => t.isCatch);
    const failures = catches.filter(t => !t.response).length;
    const lapseRate = catches.length > 0 ? failures / catches.length : 0;
    return { lapseRate, sessionValid: lapseRate < cfg.lapseThreshold, catchCount: catches.length, failures };
}

// NEW (VVV Priority 1): Mid-session lapse check
// Returns true if session should be paused/aborted early
export function checkMidSessionLapse(
    trials:   TrialRecord[],
    cfg = DEFAULT_CATCH_CONFIG,
): { shouldAbort: boolean; currentLapseRate: number; message: string } {
    const catches   = trials.filter(t => t.isCatch);
    if (catches.length === 0) return { shouldAbort:false, currentLapseRate:0, message:'No catch trials yet' };

    const failures     = catches.filter(t => !t.response).length;
    const currentRate  = failures / catches.length;
    const shouldAbort  = currentRate >= cfg.midSessionAbortRate;

    return {
        shouldAbort,
        currentLapseRate: currentRate,
        message: shouldAbort
            ? `High lapse rate (${(currentRate*100).toFixed(0)}%) — pause and re-instruct participant`
            : `Lapse rate nominal (${(currentRate*100).toFixed(0)}%)`,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADAPTIVE TRANSITION TIME (VVV Fix 3 — with documented perceptual reasoning)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entropy h ∈ [0,1] maps to perceptual frequency range 0.5–4.5 Hz.
 *
 * Perceptual reasoning (documented per VVV request):
 *   - Haptic sensitivity peak: ~2 Hz (Meissner corpuscles, flutter detection)
 *   - Audio temporal resolution: ~4 Hz minimum for pitch change detection
 *   - Very low frequencies (<0.5 Hz) cause haptic adaptation (receptor fatigue)
 *   - The 0.5 Hz floor prevents the static h≈0 case from producing no sensation
 *
 * Physics: transition_time ≈ 2 / f_dominant (two full cycles for smooth blend)
 */
export function getTransitionTimeMs(h: number): number {
    // Perceptual frequency scaling (not a direct 1:1 with φ(t) = 2πht)
    // φ(t) = 2πht controls phase; this controls perceptual update smoothness
    const dominantFreqHz = 0.5 + h * 4.0;   // 0.5 Hz (h=0) → 4.5 Hz (h=1)
    const transitionMs   = (2.0 / dominantFreqHz) * 1000;
    return Math.max(50, Math.min(1000, transitionMs));
}

export const TRANSITION_TIME_TABLE = Array.from(
    { length: 11 }, (_,i) => ({ h: i/10, ms: getTransitionTimeMs(i/10) })
);

// ─────────────────────────────────────────────────────────────────────────────
// TEMPORAL PHASE-LOCK VERIFICATION (VVV Fix 4)
// Cross-correlation based — checks temporal alignment, not just amplitude.
// ─────────────────────────────────────────────────────────────────────────────

export function verifyPhaseLockTemporal(
    audioSignal:     number[],
    hapticSignal:    number[],
    visualSignal:    number[],
    sampleRate  = 48000,
    toleranceSamples = 2,
): {
    audioHapticLagSamples:     number;
    audioVisualLagSamples:     number;
    expectedQuadratureSamples: number;
    audioHapticLocked:         boolean;
    audioVisualQuadrature:     boolean;
    fullyLocked:               boolean;
    phaseErrorDegrees: { audioHaptic:number; audioVisual:number };
} {
    const ahLag = findPeakLagBrute(audioSignal, hapticSignal);
    const avLag = findPeakLagBrute(audioSignal, visualSignal);
    const qc    = Math.round(sampleRate / 4);   // 90° in samples

    const ahLocked = Math.abs(ahLag) <= toleranceSamples;
    const avQuad   = Math.abs(Math.abs(avLag) - qc) <= toleranceSamples;

    return {
        audioHapticLagSamples:     ahLag,
        audioVisualLagSamples:     avLag,
        expectedQuadratureSamples: qc,
        audioHapticLocked:         ahLocked,
        audioVisualQuadrature:     avQuad,
        fullyLocked:               ahLocked && avQuad,
        phaseErrorDegrees: {
            audioHaptic: (ahLag / sampleRate) * 360,
            audioVisual: ((avLag - qc) / sampleRate) * 360,
        },
    };
}

/**
 * Brute-force cross-correlation — O(n²).
 * Fine for RNIB study (offline, short ~100ms buffers).
 * TODO (production): Replace with FFT-based cross-correlation O(n log n)
 *   using: crossSpec = FFT(a) · conj(FFT(b)); corr = IFFT(crossSpec)
 *   Requires zero-padding to next power of 2 for linear (not circular) correlation.
 */
function findPeakLagBrute(a: number[], b: number[]): number {
    const n      = a.length;
    const maxLag = Math.min(n - 1, Math.round(n / 2));
    let bestLag = 0, bestCorr = -Infinity;
    for (let lag = -maxLag; lag <= maxLag; lag++) {
        let corr = 0;
        for (let i = 0; i < n; i++) {
            const j = i + lag;
            if (j >= 0 && j < n) corr += a[i] * b[j];
        }
        if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
    }
    return bestLag;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE QUEST ENGINE — v2.3 with maxTrials safety (VVV bug fix)
// ─────────────────────────────────────────────────────────────────────────────

export class QUESTStaircase {
    private params:      QUESTParams;
    private posterior:   number[];
    private intensities: number[];
    private trials:      TrialRecord[] = [];
    private trialCount   = 0;
    private readonly N_GRID      = 200;
    private readonly testType:    HapticTestType;
    private readonly catchConfig: CatchTrialConfig;
    private readonly maxTrials:   number;     // VVV FIX: prevents infinite loop

    constructor(
        testType:     HapticTestType,
        params?:      Partial<QUESTParams>,
        catchConfig?: Partial<CatchTrialConfig>,
        maxTrials  = 60,   // VVV FIX: safety limit — if unusual thresholds, stop at 60
    ) {
        this.testType    = testType;
        this.catchConfig = { ...DEFAULT_CATCH_CONFIG, ...catchConfig };
        this.params      = { ...DEFAULT_PARAMS[testType], ...params };
        this.maxTrials   = maxTrials;

        const { tGuess, tGuessSd } = this.params;
        const lo = tGuess - 3 * tGuessSd;
        const hi = tGuess + 3 * tGuessSd;
        this.intensities = Array.from({ length:this.N_GRID },
            (_,i) => lo + (i/(this.N_GRID-1))*(hi-lo));
        this.posterior   = this.intensities.map(x => this.logNormalPdf(x, tGuess, tGuessSd));
        this.normalisePosterior();
    }

    nextIntensity(): { intensity:number; isCatch:boolean } {
        if (shouldInsertCatch(this.trialCount, this.catchConfig)) {
            return { intensity: getCatchIntensity(this.currentThreshold(), this.catchConfig), isCatch:true };
        }
        const mapIdx = this.posterior.indexOf(Math.max(...this.posterior));
        return { intensity: this.intensities[mapIdx], isCatch:false };
    }

    update(intensity: number, correct: boolean, isCatch: boolean, rt = 0): void {
        this.trialCount++;
        if (!isCatch) {
            this.posterior = this.posterior.map((logP, i) => {
                const pC = this.psychometricFn(intensity, this.intensities[i]);
                return logP + Math.log(correct ? pC : 1 - pC);
            });
            this.normalisePosterior();
        }
        this.trials.push({ trialN:this.trialCount, intensity, response:correct, isCatch, rt, timestamp:Date.now() });
    }

    // VVV FIX: Check mid-session lapse after each catch trial update
    checkMidSession(): { shouldAbort:boolean; currentLapseRate:number; message:string } {
        return checkMidSessionLapse(this.trials, this.catchConfig);
    }

    currentThreshold(): number {
        let mu = 0;
        for (let i = 0; i < this.N_GRID; i++) mu += this.intensities[i] * Math.exp(this.posterior[i]);
        return mu;
    }

    posteriorSD(): number {
        const mu = this.currentThreshold();
        let v = 0;
        for (let i = 0; i < this.N_GRID; i++) v += Math.exp(this.posterior[i]) * (this.intensities[i] - mu) ** 2;
        return Math.sqrt(v);
    }

    // VVV FIX: maxTrials in convergence check — no more infinite loops
    converged(): boolean {
        if (this.trialCount >= this.maxTrials) return true;   // Safety stop
        return this.posteriorSD() < 0.1 && this.trialCount >= 15;
    }

    getResult(): QUESTResult {
        const t    = this.currentThreshold();
        const laps = evaluateLapses(this.trials, this.catchConfig);
        return {
            thresholdLog10:  t,
            thresholdLinear: Math.pow(10, t),
            posteriorSD:     this.posteriorSD(),
            trialsCompleted: this.trialCount,
            converged:       this.posteriorSD() < 0.1,
            lapseRate:       laps.lapseRate,
            sessionValid:    laps.sessionValid,
            catchTrialCount: laps.catchCount,
            catchFailures:   laps.failures,
            hitMaxTrials:    this.trialCount >= this.maxTrials,   // NEW flag
            trials:          [...this.trials],
        };
    }

    private psychometricFn(x: number, threshold: number): number {
        const { beta, delta, gamma } = this.params;
        return gamma + (1 - gamma - delta) * (1 - Math.exp(-Math.pow(10, beta*(x-threshold))));
    }
    private logNormalPdf(x: number, mu: number, sigma: number): number {
        return -0.5 * ((x - mu) / sigma) ** 2;
    }
    private normalisePosterior(): void {
        const maxV = Math.max(...this.posterior);
        this.posterior = this.posterior.map(p => p - maxV);
        const sumE = this.posterior.reduce((s, p) => s + Math.exp(p), 0);
        this.posterior = this.posterior.map(p => p - Math.log(sumE));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CALIBRATION SESSION RUNNER
// ─────────────────────────────────────────────────────────────────────────────

export interface CalibrationSession {
    participantId: string;
    results:       Partial<Record<HapticTestType, QUESTResult>>;
    totalTrials:   number;
    durationMs:    number;
    allValid:      boolean;
    abortedTests:  HapticTestType[];    // Tests aborted due to high lapse rate
}

export async function runCalibrationSession(
    participantId: string,
    testTypes:     HapticTestType[],
    priorManager:  PopulationPriorManager,
    onTrial: (
        testType:  HapticTestType,
        intensity: number,
        isCatch:   boolean,
    ) => Promise<{ correct:boolean; rt:number }>,
    onMidSessionAbort?: (testType: HapticTestType, message: string) => Promise<'continue'|'abort'>,
): Promise<CalibrationSession> {
    const start        = Date.now();
    const results: Partial<Record<HapticTestType,QUESTResult>> = {};
    const abortedTests: HapticTestType[] = [];
    let totalTrials    = 0;

    for (const testType of testTypes) {
        const params  = priorManager.getPrior(testType);
        const quest   = new QUESTStaircase(testType, params);
        let aborted   = false;

        while (!quest.converged()) {
            const { intensity, isCatch } = quest.nextIntensity();
            const { correct, rt }        = await onTrial(testType, intensity, isCatch);
            quest.update(intensity, correct, isCatch, rt);

            // VVV FIX: Mid-session lapse check after each catch trial
            if (isCatch) {
                const check = quest.checkMidSession();
                if (check.shouldAbort && onMidSessionAbort) {
                    const decision = await onMidSessionAbort(testType, check.message);
                    if (decision === 'abort') {
                        abortedTests.push(testType);
                        aborted = true;
                        break;
                    }
                    // 'continue' → re-instruct and proceed
                }
            }
        }

        const result = quest.getResult();
        results[testType] = result;
        totalTrials += result.trialsCompleted;

        if (!aborted && result.sessionValid) {
            priorManager.updateEstimate(testType, result.thresholdLog10, result.posteriorSD);
        }
    }

    return {
        participantId, results, totalTrials,
        durationMs:  Date.now() - start,
        allValid:    Object.values(results).every(r => r?.sessionValid ?? false) && abortedTests.length === 0,
        abortedTests,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// PATENT ENABLEMENT NOTE (for attorney John Arsino)
// ─────────────────────────────────────────────────────────────────────────────

export const PATENT_ENABLEMENT_NOTE = {
    issue:       '2048D claim vs 8D preferred embodiment',
    risk:        'Examiner may require working 2048D demonstration (35 U.S.C. § 112)',
    mitigation:  'Claim 5 (RP-2026-001) covers 8D as preferred embodiment',
    specLanguage:'8D = "preferred embodiment"; 2048D = "generalized embodiment enabled by the same separable tensor mathematics"',
    action:      'Confirm Claim 5 is present and claim 1 describes n≥8 generically before USPTO filing',
    vvvSource:   'VVV Venice AI review, March 2026',
} as const;

export default QUESTStaircase;
