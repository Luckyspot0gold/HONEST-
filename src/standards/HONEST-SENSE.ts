/**
 * HONEST-SENSE v1.0
 * The Sensory Translation API Standard.
 * This defines the canonical mapping from economic metrics to
 * universal sensory outputs (audio, haptics, visuals).
 */

export interface SensoryTranslation {
  audioFrequency: number; // In Hz
  hapticIntensity: number; // 0.0 to 1.0
  visualColor: string;     // Hex code
  visualPulse: number;     // 0.0 to 1.0
}

/**
 * [SENSE-1] The canonical translation function.
 * Maps a metric value to sensory output based on the Manifesto's principles.
 */
export function translateToSensory(metricValue: number, baseline: number): SensoryTranslation {
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
  
  console.log(`[HONEST-SENSE] Translating Value -> Freq:${audioFrequency.toFixed(2)}Hz, Haptic:${hapticIntensity.toFixed(2)}`);
  
  return {
    audioFrequency,
    hapticIntensity,
    visualColor,
    visualPulse,
  };
}
