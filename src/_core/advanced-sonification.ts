2️⃣ ADVANCED SONIFICATION ALGORITHMS
src/core/advanced-sonification.ts
/**
 * Advanced Data Sonification Engine
 * PATENT CLAIM: Non-linear perceptual mapping with predictive anticipation
 * and cross-modal coherence optimization
 */

import * as tf from '@tensorflow/tfjs';

export interface SonificationConfig {
    baseFrequency: number;        // 432 Hz default
    mappingFunction: 'linear' | 'sigmoid' | 'logarithmic' | 'exponential' | 'piecewise';
    smoothingFactor: number;      // 0-1, higher = smoother
    enablePrediction: boolean;
    predictionHorizon: number;    // milliseconds ahead
    coherenceModulation: boolean;
    userCalibration?: UserCalibrationProfile;
}

export interface UserCalibrationProfile {
    hapticThresholds: {
        noticeable: number;
        comfortable: number;
        intense: number;
    };
    audioThresholds: {
        quietest: number;
        comfortable: number;
        loudest: number;
    };
    visualSensitivity: number;    // 0-1
    preferredModality: 'audio' | 'haptic' | 'visual' | 'balanced';
}

/**
 * Non-Linear Mapping Functions
 * Create perceptual "sensation thresholds" for dramatic changes
 */
export class NonLinearMapper {
    /**
     * SIGMOID MAPPING
     * Creates smooth S-curve with dramatic shift at threshold
     * Perfect for: Market crashes, vital sign emergencies
     */
    static sigmoid(value: number, midpoint: number = 0, steepness: number = 1): number {
        return 1 / (1 + Math.exp(-steepness * (value - midpoint)));
    }
    
    /**
     * PIECEWISE THRESHOLD MAPPING
     * Little change during normal ranges, dramatic during extremes
     * 
     * Example: Volatility
     * - 0-20%: Gentle vibration (barely noticeable)
     * - 20-40%: Linear increase
     * - 40%+: Exponential increase (ALERT!)
     */
    static piecewiseVolatility(volatility: number): number {
        if (volatility < 0.2) {
            // Subtle range: 0-20% volatility → 0-0.3 output
            return volatility * 1.5;
        } else if (volatility < 0.4) {
            // Linear range: 20-40% → 0.3-0.6 output
            return 0.3 + (volatility - 0.2) * 1.5;
        } else {
            // Exponential range: 40%+ → 0.6-1.0 output (dramatic!)
            return 0.6 + Math.min(0.4, Math.pow((volatility - 0.4) * 2, 1.5));
        }
    }
    
    /**
     * LOGARITHMIC MAPPING
     * Compresses large value ranges into perceptible differences
     * Perfect for: Price ranges (BTC $1K to $100K)
     */
    static logarithmic(value: number, base: number = 10): number {
        return Math.log(Math.max(1, value)) / Math.log(base);
    }
    
    /**
     * EXPONENTIAL MAPPING
     * Emphasizes small changes in critical ranges
     * Perfect for: Medical vitals (small BP change = big deal)
     */
    static exponential(value: number, exponent: number = 2): number {
        return Math.pow(value, exponent);
    }
    
    /**
     * COHERENCE-MODULATED MAPPING
     * Uses eigenstate coherence to create harmonic or dissonant output
     * 
     * High coherence (-1 or +1) = Consonant chords (major scale)
     * Low coherence (near 0) = Dissonant chords (minor, clusters)
     */
    static coherenceToHarmony(coherence: number, baseFreq: number = 432): number[] {
        const absCoherence = Math.abs(coherence);
        
        if (absCoherence > 0.8) {
            // High coherence = Major triad (consonant)
            return [
                baseFreq,           // Root
                baseFreq * 1.25,    // Major third
                baseFreq * 1.5      // Perfect fifth
            ];
        } else if (absCoherence > 0.5) {
            // Medium coherence = Minor triad (somewhat dissonant)
            return [
                baseFreq,
                baseFreq * 1.2,     // Minor third
                baseFreq * 1.5
            ];
        } else {
            // Low coherence = Cluster chord (very dissonant)
            return [
                baseFreq,
                baseFreq * 1.06,    // Half-step
                baseFreq * 1.12,    // Whole-step
                baseFreq * 1.19     // Minor third (clash!)
            ];
        }
    }
}

/**
 * Temporal Smoothing Engine
 * Prevents jerky, overwhelming signals via filtering
 */
export class TemporalSmoother {
    private history: number[] = [];
    private maxHistoryLength: number = 100;
    
    /**
     * EXPONENTIAL MOVING AVERAGE (EMA)
     * Smooth out rapid fluctuations while staying responsive
     */
    exponentialMovingAverage(newValue: number, alpha: number = 0.3): number {
        if (this.history.length === 0) {
            this.history.push(newValue);
            return newValue;
        }
        
        const lastEMA = this.history[this.history.length - 1];
        const ema = alpha * newValue + (1 - alpha) * lastEMA;
        
        this.history.push(ema);
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
        
        return ema;
    }
    
    /**
     * LOW-PASS FILTER (BUTTERWORTH)
     * Removes high-frequency noise from sensor data
     */
    lowPassFilter(value: number, cutoffFreq: number = 0.1): number {
        // Simple 1st-order Butterworth filter
        const RC = 1 / (cutoffFreq * 2 * Math.PI);
        const dt = 0.1; // Assume 100ms sample rate
        const alpha = dt / (RC + dt);
        
        return this.exponentialMovingAverage(value, alpha);
    }
    
    /**
     * KALMAN FILTER
     * Optimal estimation for noisy sensor readings
     * Perfect for: Eye-tracking, biometric sensors
     */
    kalmanFilter(measurement: number, processNoise: number = 0.01, measurementNoise: number = 0.1): number {
        // Simplified 1D Kalman filter
        if (this.history.length === 0) {
            this.history = [measurement, 1.0]; // [estimate, error_covariance]
            return measurement;
        }
        
        let [estimate, errorCov] = this.history.slice(-2);
        
        // Prediction
        const predictedEstimate = estimate;
        const predictedErrorCov = errorCov + processNoise;
        
        // Update
        const kalmanGain = predictedErrorCov / (predictedErrorCov + measurementNoise);
        const newEstimate = predictedEstimate + kalmanGain * (measurement - predictedEstimate);
        const newErrorCov = (1 - kalmanGain) * predictedErrorCov;
        
        this.history.push(newEstimate, newErrorCov);
        if (this.history.length > this.maxHistoryLength * 2) {
            this.history.splice(0, 2);
        }
        
        return newEstimate;
    }
}

/**
 * Predictive Sonification Engine
 * Uses ML to generate "leading" sensory signals for subconscious premonition
 */
export class PredictiveSonification {
    private model: tf.LayersModel | null = null;
    private trainingData: number[][] = [];
    
    /**
     * LSTM MODEL FOR TIME-SERIES PREDICTION
     * Predicts next value 100-500ms ahead
     */
    async buildLSTMModel(inputShape: number = 10, outputShape: number = 1) {
        const model = tf.sequential({
            layers: [
                tf.layers.lstm({
                    units: 50,
                    returnSequences: true,
                    inputShape: [inputShape, 1]
                }),
                tf.layers.lstm({
                    units: 50,
                    returnSequences: false
                }),
                tf.layers.dense({ units: 25, activation: 'relu' }),
                tf.layers.dense({ units: outputShape })
            ]
        });
        
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mae']
        });
        
        this.model = model;
        return model;
    }
    
    /**
     * TRAIN ON HISTORICAL DATA
     * Learn patterns from user's past market interactions
     */
    async trainOnHistory(historicalData: number[], epochs: number = 50) {
        if (!this.model) {
            await this.buildLSTMModel();
        }
        
        // Prepare sequences
        const sequenceLength = 10;
        const xs: number[][] = [];
        const ys: number[] = [];
        
        for (let i = 0; i < historicalData.length - sequenceLength; i++) {
            xs.push(historicalData.slice(i, i + sequenceLength));
            ys.push(historicalData[i + sequenceLength]);
        }
        
        const xsTensor = tf.tensor3d(xs.map(seq => seq.map(v => [v])));
        const ysTensor = tf.tensor2d(ys.map(v => [v]));
        
        await this.model!.fit(xsTensor, ysTensor, {
            epochs,
            batchSize: 32,
            shuffle: true,
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
                }
            }
        });
        
        xsTensor.dispose();
        ysTensor.dispose();
    }
    
    /**
     * PREDICT NEXT VALUE
     * Generate "premonition" signal for user
     */
    async predict(recentValues: number[]): Promise<number> {
        if (!this.model) {
            throw new Error('Model not trained');
        }
        
        const inputTensor = tf.tensor3d([recentValues.map(v => [v])]);
        const prediction = this.model.predict(inputTensor) as tf.Tensor;
        const value = (await prediction.data())[0];
        
        inputTensor.dispose();
        prediction.dispose();
        
        return value;
    }
    
    /**
     * GENERATE ANTICIPATORY HAPTIC PATTERN
     * User feels trend BEFORE it's visually obvious
     */
    async generateAnticipatorySensation(
        currentValue: number, 
        recentHistory: number[]
    ): Promise<{ frequency: number; intensity: number; pattern: string }> {
        const predictedValue = await this.predict(recentHistory);
        const delta = predictedValue - currentValue;
        
        // If prediction shows upward movement, increase frequency slightly
        // If downward, decrease frequency
        const anticipatoryFrequency = 432 + (delta * 50); // ±50 Hz shift
        
        // Intensity based on magnitude of predicted change
        const intensity = Math.min(1.0, Math.abs(delta) / 10);
        
        // Pattern: 'leading' for upward prediction, 'warning' for downward
        const pattern = delta > 0 ? 'leading_pulse' : 'warning_pulse';
        
        return {
            frequency: anticipatoryFrequency,
            intensity,
            pattern
        };
    }
}

/**
 * Cross-Modal Calibration System
 * Personalizes sensory perception through user onboarding
 */
export class CrossModalCalibration {
    private calibrationResults: UserCalibrationProfile | null = null;
    
    /**
     * HAPTIC CALIBRATION SEQUENCE
     * Determine user's personal thresholds
     */
    async calibrateHaptics(): Promise<{ noticeable: number; comfortable: number; intense: number }> {
        const results = { noticeable: 0, comfortable: 0, intense: 0 };
        
        // Test sequence: Start at 0.1, increment by 0.1 until user responds
        console.log('Starting haptic calibration...');
        console.log('We will send vibrations of increasing intensity.');
        console.log('Press SPACE when you first notice the vibration.');
        
        // Simulate calibration (in real app, this would be interactive)
        for (let intensity = 0.1; intensity <= 1.0; intensity += 0.1) {
            // await sendHapticPulse(intensity);
            // const response = await waitForUserInput();
            
            // Simulated user responses
            if (intensity >= 0.2 && !results.noticeable) {
                results.noticeable = intensity;
                console.log(`Noticeable threshold: ${intensity}`);
            }
            if (intensity >= 0.5 && !results.comfortable) {
                results.comfortable = intensity;
                console.log(`Comfortable threshold: ${intensity}`);
            }
            if (intensity >= 0.8 && !results.intense) {
                results.intense = intensity;
                console.log(`Intense threshold: ${intensity}`);
                break;
            }
        }
        
        return results;
    }
    
    /**
     * AUDIO CALIBRATION SEQUENCE
     * Determine comfortable frequency and volume ranges
     */
    async calibrateAudio(): Promise<{ quietest: number; comfortable: number; loudest: number }> {
        const results = { quietest: 0, comfortable: 0, loudest: 0 };
        
        console.log('Starting audio calibration...');
        console.log('We will play tones of increasing volume.');
        
        // Test sequence: Start at 0.1 volume, increment until user responds
        for (let volume = 0.1; volume <= 1.0; volume += 0.1) {
            // await playTone(432, volume);
            
            // Simulated responses
            if (volume >= 0.15 && !results.quietest) {
                results.quietest = volume;
                console.log(`Quietest audible: ${volume}`);
            }
            if (volume >= 0.4 && !results.comfortable) {
                results.comfortable = volume;
                console.log(`Comfortable volume: ${volume}`);
            }
            if (volume >= 0.7 && !results.loudest) {
                results.loudest = volume;
                console.log(`Loudest tolerable: ${volume}`);
                break;
            }
        }
        
        return results;
    }
    
    /**
     * VISUAL SENSITIVITY TEST
     * Determine flicker fusion threshold and contrast sensitivity
     */
    async calibrateVisual(): Promise<number> {
        console.log('Starting visual calibration...');
        console.log('We will show flashing patterns of varying speed.');
        
        let flickerFusionThreshold = 60; // Hz, typical human threshold
        
        // Test flicker rates from 10 Hz to 80 Hz
        for (let rate = 10; rate <= 80; rate += 5) {
            // await showFlickeringPattern(rate);
            // const response = await askUserIfFlickering();
            
            // Simulated: Most humans fuse around 50-70 Hz
            if (rate >= 60) {
                flickerFusionThreshold = rate;
                console.log(`Flicker fusion threshold: ${rate} Hz`);
                break;
            }
        }
        
        // Sensitivity score: 0-1 (higher = more sensitive)
        const sensitivity = flickerFusionThreshold / 100;
        return Math.min(1.0, sensitivity);
    }
    
    /**
     * MODALITY PREFERENCE TEST
     * Determine which sensory channel user prefers
     */
    async determineModalityPreference(): Promise<'audio' | 'haptic' | 'visual' | 'balanced'> {
        console.log('Testing modality preferences...');
        
        // Present same information via each modality
        // Ask user to rate effectiveness 1-10
        
        const ratings = {
            audio: 7,    // Simulated ratings
            haptic: 8,
            visual: 6
        };
        
        const max = Math.max(...Object.values(ratings));
        const preference = Object.keys(ratings).find(k => ratings[k as keyof typeof ratings] === max);
        
        if (Math.abs(ratings.audio - ratings.haptic) < 2 && Math.abs(ratings.haptic - ratings.visual) < 2) {
            return 'balanced';
        }
        
        return preference as 'audio' | 'haptic' | 'visual';
    }
    
    /**
     * COMPLETE CALIBRATION WORKFLOW
     * Run full onboarding sequence
     */
    async runFullCalibration(): Promise<UserCalibrationProfile> {
        console.log('🎯 Starting H.O.N.E.S.T. Sensory Calibration');
        console.log('This will take approximately 5 minutes.');
        console.log('');
        
        const hapticThresholds = await this.calibrateHaptics();
        const audioThresholds = await this.calibrateAudio();
        const visualSensitivity = await this.calibrateVisual();
        const preferredModality = await this.determineModalityPreference();
        
        this.calibrationResults = {
            hapticThresholds,
            audioThresholds,
            visualSensitivity,
            preferredModality
        };
        
        console.log('');
        console.log('✅ Calibration complete!');
        console.log('Profile:', this.calibrationResults);
        
        return this.calibrationResults;
    }
    
    /**
     * SAVE CALIBRATION TO DATABASE
     * Build proprietary dataset of personalized perception
     */
    async saveCalibration(userId: string): Promise<void> {
        if (!this.calibrationResults) {
            throw new Error('No calibration data to save');
        }
        
        // In production, save to database
        const calibrationRecord = {
            userId,
            timestamp: new Date().toISOString(),
            profile: this.calibrationResults,
            version: '1.0'
        };
        
        console.log('Saving calibration:', calibrationRecord);
        
        // await db.collection('user_calibrations').insertOne(calibrationRecord);
    }
}

/**
 * UNIFIED ADVANCED SONIFICATION ENGINE
 * Combines all techniques for optimal sensory experience
 */
export class AdvancedSonificationEngine {
    private smoother = new TemporalSmoother();
    private predictor = new PredictiveSonification();
    private calibrator = new CrossModalCalibration();
    
    private userProfile: UserCalibrationProfile | null = null;
    
    async initialize(userId: string) {
        // Load user calibration if exists
        // this.userProfile = await loadUserCalibration(userId);
        
        // If no calibration, run it
        if (!this.userProfile) {
            console.log('No calibration found. Running calibration...');
            this.userProfile = await this.calibrator.runFullCalibration();
            await this.calibrator.saveCalibration(userId);
        }
        
        // Train predictor on historical data
        // const historicalData = await fetchUserMarketHistory(userId);
        // await this.predictor.trainOnHistory(historicalData);
    }
    
    /**
     * PROCESS DATA VALUE TO MULTI-SENSORY OUTPUT
     * The main pipeline combining all advanced techniques
     */
    async processValue(
        rawValue: number,
        recentHistory: number[],
        coherence: number,
        config: SonificationConfig
    ): Promise<{
        audio: { frequencies: number[]; amplitude: number };
        haptic: { intensity: number; frequency: number; pattern: string };
        visual: { hue: number; saturation: number; lightness: number };
    }> {
        // Step 1: Apply temporal smoothing
        const smoothedValue = config.smoothingFactor > 0 
            ? this.smoother.exponentialMovingAverage(rawValue, config.smoothingFactor)
            : rawValue;
        
        // Step 2: Non-linear mapping
        let mappedValue: number;
        switch (config.mappingFunction) {
            case 'sigmoid':
                mappedValue = NonLinearMapper.sigmoid(smoothedValue, 0, 2);
                break;
            case 'logarithmic':
                mappedValue = NonLinearMapper.logarithmic(smoothedValue);
                break;
            case 'exponential':
                mappedValue = NonLinearMapper.exponential(smoothedValue, 1.5);
                break;
            case 'piecewise':
                mappedValue = NonLinearMapper.piecewiseVolatility(smoothedValue);
                break;
            default:
                mappedValue = smoothedValue;
        }
        
        // Step 3: Coherence-modulated harmony
        const audioFrequencies = config.coherenceModulation
            ? NonLinearMapper.coherenceToHarmony(coherence, config.baseFrequency)
            : [config.baseFrequency];
        
        // Step 4: Predictive anticipation (if enabled)
        let anticipatorySensation = null;
        if (config.enablePrediction && recentHistory.length >= 10) {
            anticipatorySensation = await this.predictor.generateAnticipatorySensation(
                smoothedValue,
                recentHistory
            );
        }
        
        // Step 5: Apply user calibration
        const audioAmplitude = this.userProfile
            ? this.scaleToUserPreference(mappedValue, 'audio', this.userProfile)
            : mappedValue * 0.5;
        
        const hapticIntensity = this.userProfile
            ? this.scaleToUserPreference(mappedValue, 'haptic', this.userProfile)
            : mappedValue * 0.7;
        
        // Step 6: Build final output
        return {
            audio: {
                frequencies: audioFrequencies,
                amplitude: audioAmplitude
            },
            haptic: {
                intensity: hapticIntensity,
                frequency: anticipatorySensation?.frequency || 100,
                pattern: anticipatorySensation?.pattern || 'continuous'
            },
            visual: {
                hue: mappedValue * 360,
                saturation: 70 + (coherence * 30),
                lightness: 50
            }
        };
    }
    
    /**
     * SCALE OUTPUT TO USER'S PERSONAL THRESHOLDS
     * Ensures comfortable, personalized experience
     */
    private scaleToUserPreference(
        value: number,
        modality: 'audio' | 'haptic',
        profile: UserCalibrationProfile
    ): number {
        if (modality === 'haptic') {
            const { noticeable, comfortable, intense } = profile.hapticThresholds;
            
            if (value < 0.3) {
                // Low range: scale between noticeable and comfortable
                return noticeable + (value / 0.3) * (comfortable - noticeable);
            } else {
                // High range: scale between comfortable and intense
                return comfortable + ((value - 0.3) / 0.7) * (intense - comfortable);
            }
        } else {
            const { quietest, comfortable, loudest } = profile.audioThresholds;
            
            if (value < 0.5) {
                return quietest + (value / 0.5) * (comfortable - quietest);
            } else {
                return comfortable + ((value - 0.5) / 0.5) * (loudest - comfortable);
            }
        }
    }
}

// Export singleton
export const AdvancedSonification = new AdvancedSonificationEngine();
