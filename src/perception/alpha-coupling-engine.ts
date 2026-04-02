/**
 * alpha-coupling-engine.ts
 * H.O.N.E.S.T. — Reality Protocol LLC
 * Justin William McCrea
 *
 * ═══════════════════════════════════════════════════════════════
 * THE WHITEBOARD EQUATIONS (photographed, March 2026)
 * ═══════════════════════════════════════════════════════════════
 *
 *   α = 0.0072973525664(17)        ← Fine-structure constant (CODATA 2022)
 *
 *   a = e² / (4πε₀)ħc             ← Exact definition in SI
 *     where:
 *       e   = elementary charge
 *       ε₀  = vacuum permittivity
 *       ħ   = reduced Planck constant (h/2π)
 *       c   = speed of light
 *
 *   r₂ = a / 2π = α² · a₀         ← Radius scaling relation
 *     where a₀ = Bohr radius
 *     This gives the classical electron radius: rₑ = α² · a₀
 *
 * ═══════════════════════════════════════════════════════════════
 * WHAT THIS MEANS FOR H.O.N.E.S.T.
 * ═══════════════════════════════════════════════════════════════
 *
 * α is dimensionless — no units.
 * A normalized price change is dimensionless — no units.
 * Their product S = α × (ΔP / σ_baseline) is dimensionless — no units.
 *
 * S is then scaled by 1/α (= ALPHA_INVERSE ≈ 137) to bring it into
 * the range [-1, 1] suitable for sensory encoding.
 *
 * This is the correct normalization (VVV Venice AI, March 2026):
 *   S_normalized = S_raw × ALPHA_INVERSE   ← NOT × 1000
 *
 * Using × 1000 was arbitrary. Using × ALPHA_INVERSE preserves
 * the physical meaning: α couples the data to the output with the
 * same dimensionless constant that governs electromagnetic coupling.
 *
 * ═══════════════════════════════════════════════════════════════
 * WHAT YOU MUST NOT CLAIM
 * ═══════════════════════════════════════════════════════════════
 *
 * ❌ "This models quantum physics"
 * ❌ "This is quantum computing"
 * ❌ "The market has quantum properties"
 *
 * ✅ "We use a dimensionless coupling model inspired by physical
 *     constants to map normalized data into synchronized audio,
 *     visual, and haptic outputs."
 *
 * That distinction (VVV, March 2026) is the difference between
 * credibility and dismissal in front of engineers, institutions,
 * and RNIB researchers.
 */

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICAL CONSTANTS (CODATA 2022)
// These are facts of the universe. They do not change.
// ─────────────────────────────────────────────────────────────────────────────

/** Fine-structure constant α = 7.2973525664 × 10⁻³ (CODATA 2022) */
export const ALPHA          = 7.2973525664e-3;

/** Inverse: 1/α ≈ 137.035999177 — the correct normalization factor */
export const ALPHA_INVERSE  = 137.035999177;

/** Bohr radius a₀ = 5.29177210544 × 10⁻¹¹ m */
export const BOHR_RADIUS_M  = 5.29177210544e-11;

/**
 * Classical electron radius rₑ = α² × a₀
 * The r₂ = a/2π = α²·a₀ relation from the whiteboard.
 * Used to derive cymatic nodal geometry scaling.
 */
export const CLASSICAL_ELECTRON_RADIUS_M = ALPHA * ALPHA * BOHR_RADIUS_M;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketDataPoint {
    price:              number;   // Current asset price (any currency)
    previousPrice:      number;   // Price at previous sample
    volatilityBaseline: number;   // Rolling volatility (e.g. 24h ATR, σ of log-returns)
    asset:              string;   // 'BTC' | 'ETH' | 'SOL' | etc.
    timestamp:          number;   // Unix ms
}

export interface AlphaCouplingResult {
    // ── Core scalar ──────────────────────────────────────────────────────────
    S:              number;   // Unified α-bonded scalar, clamped to [-1, 1]
    S_raw:          number;   // S before normalization (α × ΔP/σ)
    S_normalized:   number;   // S × ALPHA_INVERSE — the physically-correct step
    deltaP:         number;   // Log-return: ln(price / previousPrice)
    coupling:       number;   // α × |ΔP/σ| — electromagnetic coupling analogue

    // ── Sensory outputs ───────────────────────────────────────────────────────
    frequency:      number;   // Hz — α-bonded pitch [216, 648]
    wavelengthNm:   number;   // nm — visible spectrum [380, 740]
    hapticHz:       number;   // Hz — haptic vibration [1, 200]
    colorRGB:       [number, number, number]; // [R, G, B] 0–255
    geometryScale:  number;   // Cymatic nodal spacing multiplier (α²·a₀ derived)

    // ── Eigenstate bridge ─────────────────────────────────────────────────────
    sigma_enhanced: number;   // Drop-in replacement for σ in adinkra-engine.ts
    direction:      'up' | 'down' | 'flat';
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE ENGINE: computeAlphaCoupling()
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map one live market data point to a complete multi-sensory output
 * via the α-bonded unified scalar S.
 *
 * Every output is derived from S — no separate arbitrary mappings.
 * This is what VVV called "architectural discipline."
 */
export function computeAlphaCoupling(
    data:            MarketDataPoint,
    baseFrequencyHz: number = 432,
): AlphaCouplingResult {

    // ── STEP 1: Log-return (dimensionless, symmetric) ─────────────────────
    // ln(P/P₀) is preferred over (P-P₀)/P₀ because:
    //   - +10% and -10% moves have equal magnitude
    //   - additive over time (compounding)
    //   - standard in quantitative finance
    const deltaP = Math.log(data.price / data.previousPrice);

    // ── STEP 2: Normalize by volatility baseline ──────────────────────────
    // Makes S comparable across assets and time periods
    const normalizedDP = data.volatilityBaseline > 0
        ? deltaP / data.volatilityBaseline
        : deltaP;

    // ── STEP 3: α-coupled raw scalar ──────────────────────────────────────
    // S_raw = α × (ΔP / σ_baseline)
    // Both α and normalized ΔP are dimensionless → S_raw is dimensionless
    const S_raw = ALPHA * normalizedDP;

    // ── STEP 4: Normalize to [-1, 1] using 1/α ────────────────────────────
    // VVV FIX: Use ALPHA_INVERSE (≈137), NOT arbitrary 1000
    // This preserves physical meaning: scaling by 1/α inverts the coupling
    const S_normalized = S_raw * ALPHA_INVERSE;
    const S = Math.max(-1, Math.min(1, S_normalized));

    const absS       = Math.abs(S);
    const coupling   = ALPHA * Math.abs(normalizedDP);
    const direction  = S > 0.05 ? 'up' : S < -0.05 ? 'down' : 'flat';

    // ── STEP 5: Frequency ─────────────────────────────────────────────────
    // f = f_base × (1 + S × 0.5)
    // S=+1 → f = 648 Hz (one tritone above base)
    // S= 0 → f = 432 Hz (base frequency, market neutral)
    // S=-1 → f = 216 Hz (one octave below base)
    // Full range: [216, 648] Hz — comfortably within speech range
    const frequency = baseFrequencyHz * (1 + S * 0.5);

    // ── STEP 6: Wavelength (same logarithm as pitch) ──────────────────────
    // λ = 450 + 200 × log₂(f / f_base)
    // The IDENTICAL mathematical law that maps pitch to wavelength.
    // Newton (1704) first documented this correspondence.
    const wavelengthNm = Math.max(380, Math.min(740,
        450 + 200 * Math.log2(frequency / baseFrequencyHz)
    ));

    // ── STEP 7: Haptic (phase-locked to audio) ────────────────────────────
    // Divide audio frequency by 4 to bring into tactile range
    // Meissner corpuscles (texture): 2–40 Hz
    // Pacinian corpuscles (vibration): 40–500 Hz
    // Phase-locked: same S drives both, so they stay coherent
    const hapticHz = Math.max(1, Math.min(200, frequency / 4));

    // ── STEP 8: Color (wavelength → RGB) ─────────────────────────────────
    const colorRGB = wavelengthToRGB(wavelengthNm, absS);

    // ── STEP 9: Geometry scale (from whiteboard r₂ = α²·a₀) ──────────────
    // The classical electron radius gives us a physically-derived scaling
    // for cymatic nodal geometry. Higher |S| = more complex nodal structure.
    // We use α²·a₀ as a ratio to derive a multiplier, not actual meters.
    const geometryScale = 1 + absS * (ALPHA * ALPHA * 100);
    // Note: α² ≈ 5.3×10⁻⁵, ×100 brings it into a usable [1.0, 1.005] range

    // ── STEP 10: Enhanced σ for eigenstate integration ────────────────────
    // Drop this into adinkra-engine.ts Eigenstate8D.sigma
    // Combines the α-coupling with the raw volatility magnitude
    const sigma_enhanced = Math.min(1, absS * 0.7 + coupling * 10 * 0.3);

    return {
        S, S_raw, S_normalized, deltaP, coupling,
        frequency, wavelengthNm, hapticHz, colorRGB,
        geometryScale, sigma_enhanced, direction,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-ASSET INTERFERENCE
// ─────────────────────────────────────────────────────────────────────────────

export interface MultiAssetInterference {
    assets:                string[];
    scalars:               number[];     // S per asset
    frequencies:           number[];     // f per asset
    beatFrequencies:       number[];     // |f_i - f_j| for each pair
    constructiveAssets:    string[];     // Assets with same direction (reinforcing)
    destructiveAssets:     string[];     // Assets with opposite direction (tension)
    netInterference:       number;       // Sum of S values / n
    interferenceType:      'constructive' | 'destructive' | 'mixed';
}

/**
 * Compute α-bonded interference between multiple assets.
 *
 * Beat frequency between two signals: f_beat = |f₁ - f₂|
 * This is not metaphor — it is the same physics as acoustic beats
 * between two tuning forks.
 *
 * Correct framing (VVV, March 2026):
 * "constructive vs destructive interference in encoded signal space"
 * NOT "harmony/tension" (that's UX language, save for user-facing copy)
 */
export function computeMultiAssetInterference(
    dataPoints:      MarketDataPoint[],
    baseFrequencyHz: number = 432,
): MultiAssetInterference {
    const results = dataPoints.map(d => computeAlphaCoupling(d, baseFrequencyHz));

    const scalars     = results.map(r => r.S);
    const frequencies = results.map(r => r.frequency);
    const assets      = dataPoints.map(d => d.asset);

    // Beat frequencies between every pair
    const beatFrequencies: number[] = [];
    for (let i = 0; i < frequencies.length; i++) {
        for (let j = i + 1; j < frequencies.length; j++) {
            beatFrequencies.push(Math.abs(frequencies[i] - frequencies[j]));
        }
    }

    // Constructive: assets moving in same direction → S values same sign
    const constructiveAssets = assets.filter((_, i) =>
        Math.sign(scalars[i]) === Math.sign(scalars[0])
    );
    const destructiveAssets = assets.filter((_, i) =>
        Math.sign(scalars[i]) !== Math.sign(scalars[0])
    );

    const netInterference = scalars.reduce((s, v) => s + v, 0) / scalars.length;

    const interferenceType =
        destructiveAssets.length === 0 ? 'constructive' :
        constructiveAssets.length === 1 ? 'destructive' : 'mixed';

    return {
        assets, scalars, frequencies, beatFrequencies,
        constructiveAssets, destructiveAssets,
        netInterference, interferenceType,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// EIGENSTATE BRIDGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Augment an existing Eigenstate8D with α-coupling.
 * Does NOT rebuild the system — enriches σ, d, h only.
 * This pattern (VVV: "architectural discipline") keeps the
 * adinkra-engine.ts system intact while adding α-grounding.
 */
export function alphaCouplingToEigenstate<T extends {
    sigma: number; delta: number; d: number;
    p: number; a: number; h: number; c1: number; c2: number;
}>(coupling: AlphaCouplingResult, existing: T): T {
    return {
        ...existing,
        sigma: coupling.sigma_enhanced,
        d: Math.max(-1, Math.min(1,
            existing.d * 0.6 + (coupling.S > 0 ? 1 : -1) * absS(coupling.S) * 0.4
        )),
        h: Math.min(1,
            existing.h * 0.75 + coupling.coupling * 25 * 0.25
        ),
    };
}
function absS(s: number) { return Math.abs(s); }

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION EXPERIMENT SUPPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a standardized test stimulus for the α validation experiment.
 *
 * The minimal proof (VVV + multiple AI reviewers):
 *   "Users can detect signal direction using α-coupled output"
 *   Target: >70% accuracy (baseline chance = 50% for up/down)
 *
 * This function generates a reproducible test case from a scenario ID
 * so every participant gets identical stimuli (critical for validity).
 */
export type ValidationScenario = 'STRONG_UP' | 'STRONG_DOWN' | 'WEAK_UP' | 'WEAK_DOWN' | 'FLAT';

export const VALIDATION_SCENARIOS: Record<ValidationScenario, MarketDataPoint> = {
    STRONG_UP: {
        asset: 'BTC', price: 107000, previousPrice: 100000,
        volatilityBaseline: 0.02, timestamp: 0,
    },
    STRONG_DOWN: {
        asset: 'BTC', price: 93000, previousPrice: 100000,
        volatilityBaseline: 0.02, timestamp: 0,
    },
    WEAK_UP: {
        asset: 'BTC', price: 101000, previousPrice: 100000,
        volatilityBaseline: 0.02, timestamp: 0,
    },
    WEAK_DOWN: {
        asset: 'BTC', price: 99000, previousPrice: 100000,
        volatilityBaseline: 0.02, timestamp: 0,
    },
    FLAT: {
        asset: 'BTC', price: 100050, previousPrice: 100000,
        volatilityBaseline: 0.02, timestamp: 0,
    },
};

export interface ValidationTrial {
    scenarioId:     ValidationScenario;
    groundTruth:    'up' | 'down' | 'flat';
    coupling:       AlphaCouplingResult;
    // What the participant hears/feels/sees:
    audioFreqHz:    number;   // Play this tone
    hapticHz:       number;   // Vibrate at this frequency
    colorRGB:       [number, number, number]; // Show this colour
    // For logging:
    participantId?: string;
    response?:      'up' | 'down' | 'flat';
    responseTimeMs?: number;
    correct?:       boolean;
}

export function generateValidationTrial(
    scenarioId: ValidationScenario,
    participantId?: string,
): ValidationTrial {
    const data     = VALIDATION_SCENARIOS[scenarioId];
    const coupling = computeAlphaCoupling(data);

    return {
        scenarioId,
        groundTruth:  coupling.direction,
        coupling,
        audioFreqHz:  coupling.frequency,
        hapticHz:     coupling.hapticHz,
        colorRGB:     coupling.colorRGB,
        participantId,
    };
}

export function scoreValidationSession(trials: ValidationTrial[]): {
    accuracy:          number;
    correctCount:      number;
    totalTrials:       number;
    meanResponseTimeMs: number;
    passesThreshold:   boolean;  // >70% = meaningful result
    byScenario:        Record<string, { correct: number; total: number }>;
} {
    const correct   = trials.filter(t => t.correct).length;
    const accuracy  = correct / trials.length;
    const meanRT    = trials
        .filter(t => t.responseTimeMs != null)
        .reduce((s, t) => s + (t.responseTimeMs ?? 0), 0) / trials.length;

    const byScenario: Record<string, { correct: number; total: number }> = {};
    for (const trial of trials) {
        if (!byScenario[trial.scenarioId]) byScenario[trial.scenarioId] = { correct: 0, total: 0 };
        byScenario[trial.scenarioId].total++;
        if (trial.correct) byScenario[trial.scenarioId].correct++;
    }

    return {
        accuracy, correctCount: correct,
        totalTrials: trials.length,
        meanResponseTimeMs: meanRT,
        passesThreshold: accuracy > 0.70,
        byScenario,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOUR UTILITY
// ─────────────────────────────────────────────────────────────────────────────

function wavelengthToRGB(nm: number, saturation: number): [number, number, number] {
    let r = 0, g = 0, b = 0;
    if      (nm < 440) { r = (440 - nm) / 60;  b = 1; }
    else if (nm < 490) { g = (nm - 440) / 50;  b = 1; }
    else if (nm < 510) { g = 1; b = (510 - nm) / 20; }
    else if (nm < 580) { r = (nm - 510) / 70;  g = 1; }
    else if (nm < 645) { r = 1; g = (645 - nm) / 65; }
    else               { r = 1; }
    const s = 0.3 + saturation * 0.7;
    return [
        Math.round(255 * (r * s + (1 - s))),
        Math.round(255 * (g * s + (1 - s))),
        Math.round(255 * (b * s + (1 - s))),
    ];
}

