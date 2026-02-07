/**
 * HONEST-SENSE v1.0
 * The Sensory Translation API Standard.
 * This defines the canonical mapping from economic metrics to
 * universal sensory outputs (audio, haptics, visuals).
 * 
 * Part of the H.O.N.E.S.T. framework:
 * Harmonic Objective Non-biased Equitable Sensory Translation
 */

export interface SensoryTranslation {
  audioFrequency: number; // In Hz (432 Hz base)
  hapticIntensity: number; // 0.0 to 1.0
  visualColor: string;     // Hex code
  visualPulse: number;     // 0.0 to 1.0
  exhaustionTone?: number; // Optional exhaustion audio frequency
  exhaustionVibration?: number; // Optional exhaustion haptic frequency
}

/**
 * [SENSE-1] The canonical translation function.
 * Maps a metric value to sensory output based on the Manifesto's principles.
 * 
 * Principles:
 * - Harmonic Integrity: 432 Hz carrier frequency
 * - Universality of Perception: Haptic intensity maps to volatility
 * - Sensory Symbiosis: Visual feedback reinforces audio/haptic
 * 
 * @param metricValue - Current metric value
 * @param baseline - Baseline value for comparison
 * @param exhaustion - Optional exhaustion metric (0-1)
 * @returns Sensory translation parameters
 */
export function translateToSensory(
  metricValue: number,
  baseline: number,
  exhaustion?: number
): SensoryTranslation {
  const deviation = metricValue - baseline;
  const normalizedDeviation = deviation / baseline;

  // Harmonic Integrity: 432Hz carrier
  const audioFrequency = 432 * (1 + normalizedDeviation);
  
  // Universality of Perception: Haptic intensity maps to volatility
  const volatility = Math.abs(normalizedDeviation);
  const hapticIntensity = Math.min(volatility * 10, 1.0);

  // Sensory Symbiosis: Visual feedback
  const isPositive = normalizedDeviation >= 0;
  const visualColor = isPositive ? '#00ff88' : '#ff4757';
  const visualPulse = Math.min(volatility * 15, 1.0);
  
  // Exhaustion modulation (if provided)
  let exhaustionTone: number | undefined;
  let exhaustionVibration: number | undefined;
  
  if (exhaustion !== undefined) {
    // Lower frequency when exhausted
    exhaustionTone = 432 * (1 - exhaustion * 0.5);
    
    // Slower vibration when exhausted
    exhaustionVibration = 2 + (exhaustion * 8); // 2-10 Hz range
  }
  
  console.log(
    `[HONEST-SENSE] Translating Value -> Freq:${audioFrequency.toFixed(2)}Hz, ` +
    `Haptic:${hapticIntensity.toFixed(2)}, ` +
    `${exhaustion !== undefined ? `Exhaustion:${(exhaustion * 100).toFixed(1)}%` : ''}`
  );
  
  return {
    audioFrequency,
    hapticIntensity,
    visualColor,
    visualPulse,
    exhaustionTone,
    exhaustionVibration,
  };
}

/**
 * [SENSE-2] Translates Archimedes MACD analysis to sensory output.
 * Specialized translation for exhaustion-based market analysis.
 * 
 * @param netForce - Net force from Archimedes analysis
 * @param exhaustion - Exhaustion metric (0-1)
 * @param totalArea - Total area under MACD histogram
 * @returns Sensory translation parameters
 */
export function translateArchimedesToSensory(
  netForce: number,
  exhaustion: number,
  totalArea: number
): SensoryTranslation {
  // Audio mapping
  const frequencyDeviation = netForce / 100.0;
  const audioFrequency = 432 * (1 + frequencyDeviation);
  const exhaustionTone = 432 * (1 - exhaustion * 0.5);
  
  // Haptic mapping
  const hapticIntensity = Math.min(Math.abs(netForce) / 20.0, 1.0);
  const exhaustionVibration = 2 + (exhaustion * 8);
  
  // Visual mapping
  const brightness = Math.min(Math.abs(totalArea) / 30.0, 1.0);
  const visualColor = netForce > 0 
    ? `rgba(0, 255, 136, ${brightness})` // Green for positive
    : `rgba(255, 71, 87, ${brightness})`; // Red for negative
  const visualPulse = brightness;
  
  console.log(
    `[HONEST-SENSE] Archimedes Translation -> Freq:${audioFrequency.toFixed(2)}Hz, ` +
    `Exhaustion:${(exhaustion * 100).toFixed(1)}%, NetForce:${netForce.toFixed(2)}`
  );
  
  return {
    audioFrequency,
    hapticIntensity,
    visualColor,
    visualPulse,
    exhaustionTone,
    exhaustionVibration,
  };
}

/**
 * [SENSE-3] Validates sensory translation parameters.
 * Ensures all values are within acceptable ranges.
 * 
 * @param translation - Sensory translation to validate
 * @returns true if translation is valid, false otherwise
 */
export function validateSensoryTranslation(translation: SensoryTranslation): boolean {
  // Audio frequency should be reasonable (100-2000 Hz)
  if (translation.audioFrequency < 100 || translation.audioFrequency > 2000) {
    return false;
  }
  
  // Haptic intensity must be 0-1
  if (translation.hapticIntensity < 0 || translation.hapticIntensity > 1) {
    return false;
  }
  
  // Visual pulse must be 0-1
  if (translation.visualPulse < 0 || translation.visualPulse > 1) {
    return false;
  }
  
  // Visual color must be a valid hex or rgba string
  if (!translation.visualColor.match(/^(#[0-9a-fA-F]{6}|rgba?\([^)]+\))$/)) {
    return false;
  }
  
  return true;
}

/**
 * [SENSE-4] Interpolates between two sensory translations.
 * Useful for smooth transitions in real-time updates.
 * 
 * @param from - Starting sensory translation
 * @param to - Target sensory translation
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated sensory translation
 */
export function interpolateSensory(
  from: SensoryTranslation,
  to: SensoryTranslation,
  t: number
): SensoryTranslation {
  const clampedT = Math.max(0, Math.min(1, t));
  
  return {
    audioFrequency: from.audioFrequency + (to.audioFrequency - from.audioFrequency) * clampedT,
    hapticIntensity: from.hapticIntensity + (to.hapticIntensity - from.hapticIntensity) * clampedT,
    visualColor: clampedT < 0.5 ? from.visualColor : to.visualColor, // Discrete color transition
    visualPulse: from.visualPulse + (to.visualPulse - from.visualPulse) * clampedT,
    exhaustionTone: from.exhaustionTone && to.exhaustionTone
      ? from.exhaustionTone + (to.exhaustionTone - from.exhaustionTone) * clampedT
      : undefined,
    exhaustionVibration: from.exhaustionVibration && to.exhaustionVibration
      ? from.exhaustionVibration + (to.exhaustionVibration - from.exhaustionVibration) * clampedT
      : undefined,
  };
}
