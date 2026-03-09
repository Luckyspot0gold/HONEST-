/**
 * LSTM-BASED PREDICTIVE SENSORY ALERT SYSTEM
 * PATENT CLAIM: Method for translating LSTM-predicted market deviations into
 * multi-sensory alerts with temporal coherence mapping
 */

export interface LSTMPrediction {
    timestamp: number;
    predictedPrice: number;
    predictedVolatility: number;
    confidence: number;              // 0.0 to 1.0
    timeHorizon: 'immediate' | 'short' | 'medium' | 'long';
    deviationSeverity: DeviationLevel;
    sensoryAlertPattern: AlertPattern;
}

export enum DeviationLevel {
    NORMAL = 'normal',             // Within 1σ of baseline
    WARNING = 'warning',           // 1-2σ deviation
    CRITICAL = 'critical',         // 2-3σ deviation
    URGENT = 'urgent',             // >3σ deviation (black swan)
    EXTREME = 'extreme'            // >5σ deviation (market anomaly)
}

export interface AlertPattern {
    audio: AudioAlert;
    haptic: HapticAlert;
    visual: VisualAlert;
    priority: number;              // 1-100, higher = more urgent
    duration: number;              // ms
    repetition: 'single' | 'burst' | 'continuous';
}

export class LSTMPredictiveEngine {
    private lstmModel: LSTMModel;
    private baselineMemory: BaselineMemory;
    private deviationDetector: DeviationDetector;
    private alertGenerator: AlertGenerator;
    
    // Golden ratio for prediction intervals
    private static readonly PREDICTION_INTERVALS = {
        immediate: 60,             // 60 seconds
        short: 300,                // 5 minutes
        medium: 1800,              // 30 minutes
        long: 7200                // 2 hours
    };
    
    // Deviation thresholds (standard deviations)
    private static readonly DEVIATION_THRESHOLDS = {
        warning: 1.0,             // 1σ
        critical: 2.0,            // 2σ
        urgent: 3.0,              // 3σ
        extreme: 5.0              // 5σ
    };
    
    constructor(
        historicalData: HistoricalPriceData[],
        config?: {
            lookbackWindow: number;      // Default: 1000 periods
            hiddenLayers: number;        // Default: 3
            neuronsPerLayer: number;     // Default: 128
            dropoutRate: number;         // Default: 0.2
            trainingEpochs: number;      // Default: 100
        }
    ) {
        this.lstmModel = this.initializeLSTMModel(config);
        this.baselineMemory = new BaselineMemory();
        this.deviationDetector = new DeviationDetector();
        this.alertGenerator = new AlertGenerator();
        
        // Train on historical data
        this.trainModel(historicalData);
    }
    
    /**
     * PROCESS FINANCIAL DATA THROUGH LSTM PIPELINE
     */
    async processFinancialStream(
        realTimeData: {
            price: number;
            volume: number;
            timestamp: number;
            indicators: {
                rsi: number;
                macd: number;
                bollingerUpper: number;
                bollingerLower: number;
                atr: number;            // Average True Range (volatility)
                vwap: number;           // Volume Weighted Average Price
            };
        },
        vitalProcesses: VitalProcessMetrics
    ): Promise<{
        predictions: LSTMPrediction[];
        baseline: BaselineMetrics;
        deviations: CriticalDeviation[];
        sensoryAlerts: AlertPattern[];
    }> {
        
        // 1. UPDATE BASELINE (moving window)
        this.baselineMemory.update({
            price: realTimeData.price,
            volume: realTimeData.volume,
            volatility: realTimeData.indicators.atr,
            timestamp: realTimeData.timestamp,
            vitalProcesses
        });
        
        // 2. GENERATE LSTM PREDICTIONS
        const predictions = await this.generatePredictions(
            realTimeData,
            vitalProcesses,
            ['immediate', 'short', 'medium', 'long']
        );
        
        // 3. DETECT CRITICAL DEVIATIONS
        const deviations = this.detectDeviations(
            realTimeData,
            predictions,
            this.baselineMemory.getCurrentBaseline()
        );
        
        // 4. GENERATE SENSORY ALERTS
        const sensoryAlerts = this.generateSensoryAlerts(deviations);
        
        return {
            predictions,
            baseline: this.baselineMemory.getCurrentBaseline(),
            deviations,
            sensoryAlerts
        };
    }
    
    /**
     * LSTM PREDICTION GENERATION
     */
    private async generatePredictions(
        currentData: any,
        vitalProcesses: VitalProcessMetrics,
        horizons: string[]
    ): Promise<LSTMPrediction[]> {
        
        const predictions: LSTMPrediction[] = [];
        
        for (const horizon of horizons) {
            const timeSteps = LSTMPredictiveEngine.PREDICTION_INTERVALS[horizon];
            
            // Prepare input sequence (last 100 time steps)
            const inputSequence = this.prepareInputSequence(
                this.baselineMemory.getRecentHistory(100),
                currentData,
                vitalProcesses
            );
            
            // Run LSTM inference
            const lstmOutput = await this.lstmModel.predict(inputSequence, timeSteps);
            
            // Calculate confidence based on model certainty
            const confidence = this.calculatePredictionConfidence(lstmOutput);
            
            // Determine deviation severity
            const deviationSeverity = this.calculateDeviationSeverity(
                lstmOutput.predictedPrice,
                lstmOutput.predictedVolatility,
                this.baselineMemory.getCurrentBaseline()
            );
            
            // Generate sensory alert pattern based on severity
            const sensoryAlertPattern = this.alertGenerator.generatePattern(
                deviationSeverity,
                horizon,
                {
                    predictedPrice: lstmOutput.predictedPrice,
                    predictedVolatility: lstmOutput.predictedVolatility,
                    currentPrice: currentData.price,
                    currentVolatility: currentData.indicators.atr
                }
            );
            
            predictions.push({
                timestamp: Date.now(),
                predictedPrice: lstmOutput.predictedPrice,
                predictedVolatility: lstmOutput.predictedVolatility,
                confidence,
                timeHorizon: horizon,
                deviationSeverity,
                sensoryAlertPattern
            });
        }
        
        return predictions;
    }
    
    /**
     * CRITICAL DEVIATION DETECTION
     */
    private detectDeviations(
        currentData: any,
        predictions: LSTMPrediction[],
        baseline: BaselineMetrics
    ): CriticalDeviation[] {
        
        const deviations: CriticalDeviation[] = [];
        
        // Check price deviations
        const priceDeviation = Math.abs(currentData.price - baseline.price.mean) / baseline.price.stdDev;
        
        if (priceDeviation >= LSTMPredictiveEngine.DEVIATION_THRESHOLDS.urgent) {
            deviations.push({
                type: 'price',
                severity: priceDeviation >= 5 ? 'extreme' : 
                         priceDeviation >= 3 ? 'urgent' : 'critical',
                magnitude: priceDeviation,
                direction: currentData.price > baseline.price.mean ? 'bullish' : 'bearish',
                timeframe: 'immediate',
                confidence: 0.95
            });
        }
        
        // Check volatility deviations
        const volatilityDeviation = Math.abs(
            currentData.indicators.atr - baseline.volatility.mean
        ) / baseline.volatility.stdDev;
        
        if (volatilityDeviation >= LSTMPredictiveEngine.DEVIATION_THRESHOLDS.critical) {
            deviations.push({
                type: 'volatility',
                severity: volatilityDeviation >= 5 ? 'extreme' : 
                         volatilityDeviation >= 3 ? 'urgent' : 'critical',
                magnitude: volatilityDeviation,
                direction: 'explosive', // High volatility can go either way
                timeframe: 'immediate',
                confidence: 0.90
            });
        }
        
        // Check volume deviations
        const volumeDeviation = Math.abs(
            currentData.volume - baseline.volume.mean
        ) / baseline.volume.stdDev;
        
        if (volumeDeviation >= LSTMPredictiveEngine.DEVIATION_THRESHOLDS.warning) {
            deviations.push({
                type: 'volume',
                severity: volumeDeviation >= 3 ? 'urgent' : 
                         volumeDeviation >= 2 ? 'critical' : 'warning',
                magnitude: volumeDeviation,
                direction: currentData.volume > baseline.volume.mean ? 'increasing' : 'decreasing',
                timeframe: 'short',
                confidence: 0.85
            });
        }
        
        // Check prediction confidence drop (coherence breakdown)
        const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
        if (avgConfidence < 0.7 && baseline.coherence > 0.8) {
            deviations.push({
                type: 'coherence',
                severity: 'critical',
                magnitude: 1 - avgConfidence,
                direction: 'breakdown',
                timeframe: 'medium',
                confidence: 0.88
            });
        }
        
        // Check for curve anomalies (non-linear deviations)
        const curveAnomaly = this.detectCurveAnomaly(currentData, baseline);
        if (curveAnomaly.detected) {
            deviations.push({
                type: 'curve',
                severity: curveAnomaly.severity,
                magnitude: curveAnomaly.magnitude,
                direction: curveAnomaly.direction,
                timeframe: curveAnomaly.timeframe,
                confidence: curveAnomaly.confidence
            });
        }
        
        return deviations;
    }
    
    /**
     * HOW TO "HEAR" DEVIATIONS: AUDIO PATTERNS
     */
    private generateAudioAlerts(deviations: CriticalDeviation[]): AudioAlert[] {
        return deviations.map(dev => {
            let baseFrequency: number;
            let harmonicSeries: number[];
            let rhythmPattern: RhythmPattern;
            
            switch (dev.severity) {
                case 'extreme':
                    // 111.11 Hz "Return to Sender" frequency + dissonant harmonics
                    baseFrequency = 111.11;
                    harmonicSeries = [1, 2.5, 3.5, 4.5]; // Dissonant intervals
                    rhythmPattern = { pattern: [0.1, 0.1, 0.1, 0.5], bpm: 180 }; // Staccato bursts
                    break;
                    
                case 'urgent':
                    // 432 Hz with minor 3rd tension
                    baseFrequency = 432;
                    harmonicSeries = [1, 1.2, 1.8, 2.4]; // Minor intervals
                    rhythmPattern = { pattern: [0.2, 0.3, 0.5], bpm: 120 };
                    break;
                    
                case 'critical':
                    // 528 Hz (healing) with perfect 5th
                    baseFrequency = 528;
                    harmonicSeries = [1, 1.5, 2, 3]; // Perfect intervals
                    rhythmPattern = { pattern: [0.3, 0.7], bpm: 90 };
                    break;
                    
                case 'warning':
                    // 639 Hz (connecting) with major 3rd
                    baseFrequency = 639;
                    harmonicSeries = [1, 1.25, 1.5, 2]; // Major intervals
                    rhythmPattern = { pattern: [0.5, 0.5], bpm: 60 };
                    break;
                    
                default:
                    // 432 Hz with golden ratio harmonics
                    baseFrequency = 432;
                    harmonicSeries = [1, 1.618, 2.618, 4.236]; // φ ratios
                    rhythmPattern = { pattern: [1], bpm: 60 };
            }
            
            // Add directional modulation
            if (dev.direction === 'bearish') {
                // Descending glissando
                return {
                    baseFrequency,
                    harmonicSeries,
                    rhythmPattern,
                    modulation: {
                        type: 'glissando',
                        direction: 'descending',
                        range: 0.8, // 20% frequency drop
                        duration: 1000 // ms
                    },
                    spatialization: { left: 0.8, right: 0.2 }, // Left-heavy for bearish
                    volume: 0.9 - (0.1 * ['extreme', 'urgent', 'critical', 'warning'].indexOf(dev.severity))
                };
            } else if (dev.direction === 'bullish') {
                // Ascending glissando
                return {
                    baseFrequency,
                    harmonicSeries,
                    rhythmPattern,
                    modulation: {
                        type: 'glissando',
                        direction: 'ascending',
                        range: 1.2, // 20% frequency rise
                        duration: 1000
                    },
                    spatialization: { left: 0.2, right: 0.8 }, // Right-heavy for bullish
                    volume: 0.9 - (0.1 * ['extreme', 'urgent', 'critical', 'warning'].indexOf(dev.severity))
                };
            } else {
                // Volatility/curve anomaly - tremolo effect
                return {
                    baseFrequency,
                    harmonicSeries,
                    rhythmPattern,
                    modulation: {
                        type: 'tremolo',
                        rate: 10 + (dev.magnitude * 5), // Hz
                        depth: 0.5 + (dev.magnitude * 0.3)
                    },
                    spatialization: { left: 0.5, right: 0.5 },
                    volume: 0.8
                };
            }
        });
    }
    
    /**
     * HOW TO "FEEL" DEVIATIONS: HAPTIC PATTERNS
     */
    private generateHapticAlerts(deviations: CriticalDeviation[]): HapticAlert[] {
        return deviations.map(dev => {
            let pattern: VibrationPattern;
            let bodyMap: BodyMapping;
            let intensity: number;
            
            switch (dev.severity) {
                case 'extreme':
                    // Fibonacci chaotic pattern (1-3-4-7-11)
                    pattern = {
                        intensities: [1, 0.8, 0.6, 0.9, 0.7, 0.5, 1, 0.3],
                        frequencies: [200, 180, 160, 140, 120, 100, 80, 60],
                        durations: [50, 50, 50, 50, 50, 50, 50, 50], // ms
                        waveform: 'square'
                    };
                    intensity = 1.0;
                    break;
                    
                case 'urgent':
                    // Growing Fibonacci pattern (1-2-4-8)
                    pattern = {
                        intensities: [0.3, 0.5, 0.7, 0.9],
                        frequencies: [100, 120, 140, 160],
                        durations: [100, 100, 100, 100],
                        waveform: 'sawtooth'
                    };
                    intensity = 0.9;
                    break;
                    
                case 'critical':
                    // Stable Fibonacci pattern (1-1-2-3-5)
                    pattern = {
                        intensities: [0.5, 0.5, 0.6, 0.7, 0.8],
                        frequencies: [80, 80, 90, 100, 110],
                        durations: [150, 150, 150, 150, 150],
                        waveform: 'triangle'
                    };
                    intensity = 0.8;
                    break;
                    
                case 'warning':
                    // Gentle pulse (1-1-1)
                    pattern = {
                        intensities: [0.3, 0.3, 0.3],
                        frequencies: [60, 60, 60],
                        durations: [200, 200, 200],
                        waveform: 'sine'
                    };
                    intensity = 0.6;
                    break;
                    
                default:
                    // Calm baseline (single pulse)
                    pattern = {
                        intensities: [0.2],
                        frequencies: [40],
                        durations: [500],
                        waveform: 'sine'
                    };
                    intensity = 0.4;
            }
            
            // Map to body based on deviation type and direction
            if (dev.type === 'price') {
                if (dev.direction === 'bullish') {
                    // Right side of body
                    bodyMap = {
                        locations: [
                            { position: 'rightShoulder', intensity },
                            { position: 'rightArm', intensity: intensity * 0.8 },
                            { position: 'rightHip', intensity: intensity * 0.6 }
                        ],
                        symmetry: 'asymmetric'
                    };
                } else {
                    // Left side of body
                    bodyMap = {
                        locations: [
                            { position: 'leftShoulder', intensity },
                            { position: 'leftArm', intensity: intensity * 0.8 },
                            { position: 'leftHip', intensity: intensity * 0.6 }
                        ],
                        symmetry: 'asymmetric'
                    };
                }
            } else if (dev.type === 'volatility' || dev.type === 'curve') {
                // Spine and central body
                bodyMap = {
                    locations: [
                        { position: 'spineUpper', intensity },
                        { position: 'spineMiddle', intensity: intensity * 0.9 },
                        { position: 'spineLower', intensity: intensity * 0.8 },
                        { position: 'chest', intensity: intensity * 0.7 }
                    ],
                    symmetry: 'symmetric'
                };
            } else {
                // Volume/coherence - distributed
                bodyMap = {
                    locations: [
                        { position: 'chest', intensity },
                        { position: 'abdomen', intensity: intensity * 0.7 },
                        { position: 'thighs', intensity: intensity * 0.5 }
                    ],
                    symmetry: 'symmetric'
                };
            }
            
            return {
                pattern,
                bodyMap,
                duration: dev.severity === 'extreme' ? 5000 : 
                         dev.severity === 'urgent' ? 3000 :
                         dev.severity === 'critical' ? 2000 : 1000,
                repeat: dev.severity === 'extreme' ? 3 : 
                       dev.severity === 'urgent' ? 2 : 1
            };
        });
    }
    
    /**
     * HOW TO "SEE" DEVIATIONS: VISUAL PATTERNS
     */
    private generateVisualAlerts(deviations: CriticalDeviation[]): VisualAlert[] {
        return deviations.map(dev => {
            let primaryColor: ColorMapping;
            let secondaryColors: ColorMapping[];
            let movement: MovementPattern;
            let brightness: number;
            
            // Color mapping based on severity
            switch (dev.severity) {
                case 'extreme':
                    primaryColor = { hex: '#FF0000', name: 'emergency_red' };
                    secondaryColors = [
                        { hex: '#FF4500', name: 'orange_red' },
                        { hex: '#DC143C', name: 'crimson' }
                    ];
                    movement = 'chaoticDivergent';
                    brightness = 1.0;
                    break;
                    
                case 'urgent':
                    primaryColor = { hex: '#FF8C00', name: 'dark_orange' };
                    secondaryColors = [
                        { hex: '#FFA500', name: 'orange' },
                        { hex: '#FFD700', name: 'gold' }
                    ];
                    movement = 'chaoticConvergent';
                    brightness = 0.9;
                    break;
                    
                case 'critical':
                    primaryColor = { hex: '#FFD700', name: 'gold' };
                    secondaryColors = [
                        { hex: '#FFFF00', name: 'yellow' },
                        { hex: '#FFEC8B', name: 'light_goldenrod' }
                    ];
                    movement = 'downwardSpiral';
                    brightness = 0.8;
                    break;
                    
                case 'warning':
                    primaryColor = { hex: '#ADFF2F', name: 'green_yellow' };
                    secondaryColors = [
                        { hex: '#7FFF00', name: 'chartreuse' },
                        { hex: '#00FF7F', name: 'spring_green' }
                    ];
                    movement = 'gentlePulse';
                    brightness = 0.7;
                    break;
                    
                default:
                    primaryColor = { hex: '#00BFFF', name: 'deep_sky_blue' };
                    secondaryColors = [
                        { hex: '#1E90FF', name: 'dodger_blue' },
                        { hex: '#87CEEB', name: 'sky_blue' }
                    ];
                    movement = 'stationary';
                    brightness = 0.6;
            }
            
            // Direction indicator
            let directionIndicator: 'arrow_up' | 'arrow_down' | 'spiral' | 'pulse' = 'pulse';
            if (dev.direction === 'bullish') directionIndicator = 'arrow_up';
            if (dev.direction === 'bearish') directionIndicator = 'arrow_down';
            if (dev.type === 'volatility') directionIndicator = 'spiral';
            
            return {
                primaryColor,
                secondaryColors,
                movement,
                brightness,
                directionIndicator,
                opacity: 0.9,
                blinkRate: dev.severity === 'extreme' ? 5 : // 5 Hz blink
                          dev.severity === 'urgent' ? 3 :  // 3 Hz blink
                          dev.severity === 'critical' ? 2 : // 2 Hz blink
                          0,                               // No blink
                duration: dev.severity === 'extreme' ? 10000 :
                         dev.severity === 'urgent' ? 7000 :
                         dev.severity === 'critical' ? 5000 :
                         3000
            };
        });
    }
    
    /**
     * CURVE ANOMALY DETECTION (Urgent Curves)
     */
    private detectCurveAnomaly(
        currentData: any,
        baseline: BaselineMetrics
    ): {
        detected: boolean;
        severity: DeviationLevel;
        magnitude: number;
        direction: string;
        timeframe: string;
        confidence: number;
    } {
        // Calculate second derivative (acceleration of price change)
        const recentPrices = this.baselineMemory.getRecentHistory(10).map(d => d.price);
        if (recentPrices.length < 5) {
            return { detected: false, severity: 'normal', magnitude: 0, direction: 'none', timeframe: 'immediate', confidence: 0 };
        }
        
        // Calculate velocity (first derivative)
        const velocities: number[] = [];
        for (let i = 1; i < recentPrices.length; i++) {
            velocities.push(recentPrices[i] - recentPrices[i - 1]);
        }
        
        // Calculate acceleration (second derivative)
        const accelerations: number[] = [];
        for (let i = 1; i < velocities.length; i++) {
            accelerations.push(velocities[i] - velocities[i - 1]);
        }
        
        // Detect curve anomalies (sudden changes in acceleration)
        const avgAcceleration = accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
        const accelerationStd = Math.sqrt(
            accelerations.map(a => Math.pow(a - avgAcceleration, 2)).reduce((a, b) => a + b, 0) / accelerations.length
        );
        
        const currentAcceleration = accelerations[accelerations.length - 1];
        const accelerationZScore = Math.abs(currentAcceleration - avgAcceleration) / (accelerationStd || 1);
        
        if (accelerationZScore > 3) {
            return {
                detected: true,
                severity: accelerationZScore > 5 ? 'extreme' : 
                         accelerationZScore > 4 ? 'urgent' : 'critical',
                magnitude: accelerationZScore,
                direction: currentAcceleration > 0 ? 'accelerating_up' : 'accelerating_down',
                timeframe: 'immediate',
                confidence: Math.min(0.95, 0.7 + (accelerationZScore * 0.05))
            };
        }
        
        // Check for inflection points (change from positive to negative acceleration or vice versa)
        if (accelerations.length >= 3) {
            const signChanges = this.countSignChanges(accelerations.slice(-3));
            if (signChanges >= 2) {
                return {
                    detected: true,
                    severity: 'critical',
                    magnitude: signChanges,
                    direction: 'inflection',
                    timeframe: 'short',
                    confidence: 0.85
                };
            }
        }
        
        return { detected: false, severity: 'normal', magnitude: 0, direction: 'none', timeframe: 'immediate', confidence: 0 };
    }
    
    /**
     * VOLATILITY & COHERENCE PROXY CALCULATION
     */
    calculateVolatilityCoherenceProxy(
        priceData: number[],
        volumeData: number[],
        timeWindow: number = 100
    ): {
        volatilityProxy: number;      // 0-1, higher = more volatile
        coherenceProxy: number;       // 0-1, higher = more coherent/patterned
        deviationScore: number;       // 0-1, higher = more deviant from baseline
        anomalyProbability: number;   // 0-1, probability of anomaly
    } {
        if (priceData.length < timeWindow) {
            return { volatilityProxy: 0, coherenceProxy: 1, deviationScore: 0, anomalyProbability: 0 };
        }
        
        const recentPrices = priceData.slice(-timeWindow);
        const recentVolumes = volumeData.slice(-timeWindow);
        
        // 1. Volatility Proxy: Normalized standard deviation
        const priceMean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
        const priceVariance = recentPrices.reduce((sum, price) => sum + Math.pow(price - priceMean, 2), 0) / recentPrices.length;
        const priceStdDev = Math.sqrt(priceVariance);
        const normalizedVolatility = Math.min(1, priceStdDev / priceMean);
        
        // 2. Coherence Proxy: Hurst exponent approximation
        const hurstExponent = this.calculateHurstExponent(recentPrices);
        const coherenceProxy = Math.max(0, Math.min(1, hurstExponent));
        
        // 3. Deviation Score: Mahalanobis distance from baseline
        const baseline = this.baselineMemory.getCurrentBaseline();
        const deviationScore = this.calculateMahalanobisDistance(
            [priceMean, normalizedVolatility, hurstExponent],
            [
                [baseline.price.mean, baseline.price.stdDev, 0],
                [baseline.volatility.mean, baseline.volatility.stdDev, 0],
                [baseline.coherence, 0.1, 0] // Assume coherence has low variance
            ]
        );
        
        // 4. Anomaly Probability: Combined score
        const anomalyProbability = Math.min(1,
            (normalizedVolatility * 0.4) +
            ((1 - coherenceProxy) * 0.3) +
            (deviationScore * 0.3)
        );
        
        return {
            volatilityProxy: normalizedVolatility,
            coherenceProxy,
            deviationScore: Math.min(1, deviationScore),
            anomalyProbability
        };
    }
    
    /**
     * HURST EXPONENT CALCULATION (for coherence)
     */
    private calculateHurstExponent(prices: number[]): number {
        if (prices.length < 10) return 0.5; // Neutral if insufficient data
        
        const n = prices.length;
        const mean = prices.reduce((a, b) => a + b, 0) / n;
        
        // Calculate cumulative deviation from mean
        const deviations = prices.map(p => p - mean);
        const cumulative = new Array(n);
        cumulative[0] = deviations[0];
        for (let i = 1; i < n; i++) {
            cumulative[i] = cumulative[i - 1] + deviations[i];
        }
        
        // Calculate range
        const range = Math.max(...cumulative) - Math.min(...cumulative);
        
        // Calculate standard deviation
        const stdDev = Math.sqrt(deviations.reduce((sum, d) => sum + d * d, 0) / n);
        
        // Hurst exponent = log(R/S) / log(n)
        if (stdDev === 0) return 0.5;
        const hurst = Math.log(range / stdDev) / Math.log(n);
        
        return Math.max(0, Math.min(1, hurst));
    }
    
    /**
     * GENERATE SENSORY ALERTS FROM DEVIATIONS
     */
    private generateSensoryAlerts(deviations: CriticalDeviation[]): AlertPattern[] {
        if (deviations.length === 0) {
            return [this.generateBaselinePattern()];
        }
        
        return deviations.map(dev => {
            const audioAlert = this.generateAudioAlerts([dev])[0];
            const hapticAlert = this.generateHapticAlerts([dev])[0];
            const visualAlert = this.generateVisualAlerts([dev])[0];
            
            // Calculate priority based on severity and confidence
            const severityWeight = {
                extreme: 100,
                urgent: 80,
                critical: 60,
                warning: 40,
                normal: 10
            }[dev.severity];
            
            const priority = Math.min(100, severityWeight + (dev.confidence * 20));
            
            return {
                audio: audioAlert,
                haptic: hapticAlert,
                visual: visualAlert,
                priority,
                duration: dev.severity === 'extreme' ? 10000 :
                         dev.severity === 'urgent' ? 7000 :
                         dev.severity === 'critical' ? 5000 :
                         dev.severity === 'warning' ? 3000 : 1000,
                repetition: dev.severity === 'extreme' ? 'burst' :
                           dev.severity === 'urgent' ? 'burst' :
                           'single'
            };
        });
    }
    
    /**
     * BASELINE PATTERN (normal market conditions)
     */
    private generateBaselinePattern(): AlertPattern {
        return {
            audio: {
                baseFrequency: 432,
                harmonicSeries: [1, 1.618, 2.618, 4.236], // Golden ratios
                rhythmPattern: { pattern: [1], bpm: 60 },
                modulation: { type: 'none' },
                spatialization: { left: 0.5, right: 0.5 },
                volume: 0.3
            },
            haptic: {
                pattern: {
                    intensities: [0.1],
                    frequencies: [40],
                    durations: [1000],
                    waveform: 'sine'
                },
                bodyMap: {
                    locations: [{ position: 'chest', intensity: 0.1 }],
                    symmetry: 'symmetric'
                },
                duration: 1000,
                repeat: 0 // No repetition
            },
            visual: {
                primaryColor: { hex: '#00BFFF', name: 'deep_sky_blue' },
                secondaryColors: [
                    { hex: '#1E90FF', name: 'dodger_blue' },
                    { hex: '#87CEEB', name: 'sky_blue' }
                ],
                movement: 'stationary',
                brightness: 0.3,
                directionIndicator: 'pulse',
                opacity: 0.5,
                blinkRate: 0,
                duration: 1000
            },
            priority: 10,
            duration: 1000,
            repetition: 'single'
        };
    }
    
    // Helper methods
    private countSignChanges(numbers: number[]): number {
        let changes = 0;
        for (let i = 1; i < numbers.length; i++) {
            if ((numbers[i] > 0 && numbers[i - 1] < 0) || 
                (numbers[i] < 0 && numbers[i - 1] > 0)) {
                changes++;
            }
        }
        return changes;
    }
    
    private calculateMahalanobisDistance(point: number[], covarianceMatrix: number[][]): number {
        // Simplified Mahalanobis distance calculation
        const dim = point.length;
        let distance = 0;
        
        for (let i = 0; i < dim; i++) {
            const variance = covarianceMatrix[i][i];
            if (variance > 0) {
                distance += Math.pow(point[i] - covarianceMatrix[i][0], 2) / variance;
            }
        }
        
        return Math.sqrt(distance);
    }
}

// Supporting interfaces
interface HistoricalPriceData {
    price: number;
    volume: number;
    timestamp: number;
    high: number;
    low: number;
    close: number;
    open: number;
}

interface VitalProcessMetrics {
    liquidity: number;          // 0-1
    marketDepth: number;       // 0-1
    orderFlow: number;         // -1 to 1 (negative = more sells)
    spread: number;            // bid-ask spread percentage
    slippage: number;          // 0-1
    fundingRate?: number;       // For perpetual contracts
    openInterest?: number;     // For derivatives
}

interface BaselineMemory {
    update(data: any): void;
    getCurrentBaseline(): BaselineMetrics;
    getRecentHistory(count: number): any[];
}

interface DeviationDetector {
    detectDeviations(current: any, predictions: LSTMPrediction[], baseline: BaselineMetrics): CriticalDeviation[];
}

interface AlertGenerator {
    generatePattern(severity: DeviationLevel, horizon: string, context: any): AlertPattern;
}

interface LSTMModel {
    predict(inputSequence: number[][], timeSteps: number): Promise<{
        predictedPrice: number;
        predictedVolatility: number;
        confidence: number;
    }>;
}

interface CriticalDeviation {
    type: 'price' | 'volatility' | 'volume' | 'coherence' | 'curve';
    severity: DeviationLevel;
    magnitude: number;
    direction: string;
    timeframe: string;
    confidence: number;
}

interface BaselineMetrics {
    price: { mean: number; stdDev: number; };
    volume: { mean: number; stdDev: number; };
    volatility: { mean: number; stdDev: number; };
    coherence: number;          // 0-1, higher = more patterned
    lastUpdated: number;
}

interface AudioAlert {
    baseFrequency: number;
    harmonicSeries: number[];
    rhythmPattern: RhythmPattern;
    modulation: {
        type: 'glissando' | 'tremolo' | 'vibrato' | 'none';
        direction?: 'ascending' | 'descending';
        range?: number;
        rate?: number;
        depth?: number;
        duration?: number;
    };
    spatialization: { left: number; right: number; };
    volume: number;
}

interface RhythmPattern {
    pattern: number[];          // Durations in beats
    bpm: number;                // Beats per minute
}

interface HapticAlert {
    pattern: VibrationPattern;
    bodyMap: BodyMapping;
    duration: number;
    repeat: number;
}

interface VisualAlert {
    primaryColor: ColorMapping;
    secondaryColors: ColorMapping[];
    movement: MovementPattern;
    brightness: number;
    directionIndicator: 'arrow_up' | 'arrow_down' | 'spiral' | 'pulse';
    opacity: number;
    blinkRate: number;          // Hz, 0 = no blink
    duration: number;
}
