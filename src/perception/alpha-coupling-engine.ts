/**
 * alpha-coupling-engine-v2.ts
 * H.O.N.E.S.T. — Reality Protocol LLC
 * Justin William McCrea
 * 
 * CORRECTED VERSION — α PRESERVATION
 * VVV Venice AI + DeepSeek V3.2 + J.W. McCrea 
 * 2026-04-02
 */

// ─────────────────────────────────────────────────────────────────────────────
// FIXED CONSTANTS & CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/** Fine-structure constant α = 7.2973525664 × 10⁻^1^ (CODATA 2022) */
export const ALPHA = 7.2973525664e-3;

/** GAIN FACTOR (empirically determined, NOT 1/α) */
export const DEFAULT_GAIN = 100;  // Maps financial volatility → human perception

/** Small epsilon to avoid division by zero */
export const EPSILON = 1e-8;

/** Volatility floor - minimum value for normalization */
export const VOLATILITY_FLOOR = 1e-4;

/** Winsorization cutoff - limit extreme z-scores */
export const Z_SCORE_CAP = 5.0;

/** Rolling window for volatility estimation (ms) */
export const VOLATILITY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─────────────────────────────────────────────────────────────────────────────
// USER CALIBRATION SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

export interface UserCalibrationProfile {
    userId: string;
    calibratedAt: number; // Unix timestamp
    
    // Per-modality thresholds
    audio: {
        jnd: number;         // Just Noticeable Difference (Hz)
        comfortRange: [number, number]; // [minHz, maxHz]
        optimalGain: number; // User-specific gain adjustment
    };
    
    haptic: {
        jnd: number;         // JND for vibration frequency
        comfortRange: [number, number]; // [minHz, maxHz]
        intensityPreference: number; // 0-1 scale
    };
    
    visual: {
        colorSensitivity: number; // 0-1 scale
        brightnessPreference: number; // 0-1 scale
        contrastThreshold: number;
    };
    
    // Overall system gain adjustment
    systemGainMultiplier: number; // Default = 1.0
    
    // Calibration metadata
    calibrationTrials: number;
    confidenceScore: number; // 0-1
    lastUpdated: number;
}

export class PerceptualCalibrationSystem {
    private profiles = new Map<string, UserCalibrationProfile>();
    private runningCalibrations = new Map<string, CalibrationSession>();
    
    /**
     * Staircase method for determining JND
     * Implements 1-up-2-down rule (63% threshold)
     */
    async calibrateModality(
        userId: string,
        modality: 'audio' | 'haptic' | 'visual',
        initialValue: number,
        initialStep: number,
        trials: number = 30
    ): Promise<number> {
        let currentValue = initialValue;
        let stepSize = initialStep;
        let direction: 'up' | 'down' = 'up';
        let reversalCount = 0;
        let lastReversalValue = currentValue;
        
        const reversalValues: number[] = [];
        
        for (let i = 0; i < trials; i++) {
            // Present stimulus
            const stimulus = this.generateStimulus(modality, currentValue);
            
            // Get user response (in real UI, this would be async)
            const userDetected = await this.presentAndGetResponse(stimulus);
            
            // Update staircase
            if (userDetected) {
                // Correct detection → make it harder
                direction = 'down';
                currentValue = this.adjustValue(currentValue, -stepSize);
            } else {
                // No detection → make it easier
                direction = 'up';
                currentValue = this.adjustValue(currentValue, stepSize);
            }
            
            // Check for reversal
            if (i > 0) {
                const prevDirection = this.runningCalibrations.get(userId)?.lastDirection;
                if (prevDirection && prevDirection !== direction) {
                    reversalCount++;
                    reversalValues.push(lastReversalValue);
                    lastReversalValue = currentValue;
                    
                    // Reduce step size after each reversal
                    stepSize *= 0.7;
                }
            }
            
            this.runningCalibrations.get(userId)!.lastDirection = direction;
        }
        
        // JND = mean of last few reversals
        const validReversals = reversalValues.slice(-4);
        const jnd = validReversals.length > 0 
            ? validReversals.reduce((a, b) => a + b, 0) / validReversals.length
            : initialStep;
        
        return jnd;
    }
    
    /**
     * Full user calibration protocol
     */
    async calibrateUser(userId: string): Promise<UserCalibrationProfile> {
        const session: CalibrationSession = {
            userId,
            modality: 'audio',
            step: 0,
            lastDirection: 'up'
        };
        this.runningCalibrations.set(userId, session);
        
        // 1. Calibrate audio JND
        const audioJnd = await this.calibrateModality(
            userId, 'audio', 440, 10, 25
        );
        
        // 2. Determine comfort range
        const audioComfortMin = await this.findThreshold(
            userId, 'audio', 'min', 100, 800
        );
        const audioComfortMax = await this.findThreshold(
            userId, 'audio', 'max', 100, 800
        );
        
        // 3. Calibrate haptic
        const hapticJnd = await this.calibrateModality(
            userId, 'haptic', 50, 5, 20
        );
        
        // 4. Visual sensitivity
        const colorSensitivity = await this.calibrateColorSensitivity(userId);
        
        // 5. Determine optimal system gain
        const optimalGain = await this.findOptimalGain(userId);
        
        const profile: UserCalibrationProfile = {
            userId,
            calibratedAt: Date.now(),
            audio: {
                jnd: audioJnd,
                comfortRange: [audioComfortMin, audioComfortMax],
                optimalGain: optimalGain
            },
            haptic: {
                jnd: hapticJnd,
                comfortRange: [5, 150], // Human tactile range
                intensityPreference: await this.calibrateHapticIntensity(userId)
            },
            visual: {
                colorSensitivity,
                brightnessPreference: await this.calibrateBrightness(userId),
                contrastThreshold: await this.calibrateContrast(userId)
            },
            systemGainMultiplier: optimalGain,
            calibrationTrials: 100,
            confidenceScore: await this.calculateConfidence(userId),
            lastUpdated: Date.now()
        };
        
        this.profiles.set(userId, profile);
        this.runningCalibrations.delete(userId);
        
        return profile;
    }
    
    // Helper methods would be implemented in UI
    private async presentAndGetResponse(stimulus: any): Promise<boolean> {
        // UI implementation
        return false;
    }
    
    private adjustValue(current: number, delta: number): number {
        return current + delta;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLLING VOLATILITY ESTIMATOR
// ─────────────────────────────────────────────────────────────────────────────

export class RollingVolatilityEstimator {
    private prices: { price: number; timestamp: number }[] = [];
    private logReturns: number[] = [];
    private windowSizeMs: number;
    
    constructor(windowSizeMs: number = VOLATILITY_WINDOW_MS) {
        this.windowSizeMs = windowSizeMs;
    }
    
    update(currentPrice: number, timestamp: number): number {
        // Add new price
        this.prices.push({ price: currentPrice, timestamp });
        
        // Remove old prices outside window
        const cutoff = timestamp - this.windowSizeMs;
        this.prices = this.prices.filter(p => p.timestamp >= cutoff);
        
        if (this.prices.length < 2) {
            return VOLATILITY_FLOOR;
        }
        
        // Calculate log returns
        const returns = [];
        for (let i = 1; i < this.prices.length; i++) {
            const ret = Math.log(this.prices[i].price / this.prices[i-1].price);
            returns.push(ret);
        }
        
        this.logReturns = returns;
        
        // Calculate standard deviation (volatility)
        if (returns.length < 2) {
            return
