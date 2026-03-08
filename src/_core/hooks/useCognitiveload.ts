/**
 * AI Cognitive Load Hook (Patent Claim: Real-time Load Adaptation)
 * Monitors eye/scroll/biometrics → auto-simplifies multi-sensory outputs
 */

import { useState, useEffect, useCallback } from 'react';
import { CMM } from '../core/color-mapping-matrix';

export interface CognitiveLoadState {
  load: number;           // 0-1 (0.8+ = overload)
  baseline: number;       // User-calibrated normal
  isOverloaded: boolean;
  isUnderEngaged: boolean;
  adaptations: string[];  // e.g., ['reduced_visuals', 'haptic_shift']
}

export const useCognitiveLoad = (options: { threshold?: number } = {}) => {
  const { threshold = 0.3 } = options;
  const [state, setState] = useState<CognitiveLoadState>({
    load: 0.5, baseline: 0.5, isOverloaded: false, isUnderEngaged: false, adaptations: []
  });

  const calculateLoad = useCallback(() => {
    // Simulate real metrics (eye-tracking, scroll, biometrics)
    const eyeFixation = Math.random() * 500 + 200;  // ms (high = overload)
    const scrollSpeed = Math.random() * 300;         // px/s (high = overload)
    const hrv = 50 + Math.random() * 30;             // Heart rate variability (low = stress)

    const load = (eyeFixation / 700 + scrollSpeed / 400 + (1 - hrv / 80)) / 3;
    return Math.min(1, Math.max(0, load));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const load = calculateLoad();
      const overloaded = load > state.baseline + threshold;
      const underEngaged = load < state.baseline - threshold;

      const adaptations: string[] = [];
      if (overloaded) {
        adaptations.push('reduced_visuals', 'haptic_shift', 'audio_narration');
      } else if (underEngaged) {
        adaptations.push('gamification', 'multi_sensory_variety');
      }

      setState({ load, baseline: state.baseline, isOverloaded: overloaded, 
                 isUnderEngaged: underEngaged, adaptations });
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateLoad, state.baseline, threshold]);

  const calibrateBaseline = () => setState(prev => ({ ...prev, baseline: state.load }));

  const applyAdaptations = (sensoryOutput: any) => {
    if (state.isOverloaded) {
      // Simplify: Reduce complexity, shift to haptics/audio
      return {
        ...sensoryOutput,
        visual: { ...sensoryOutput.visual, complexity: 0.3 },  // Low detail
        haptic: { ...sensoryOutput.haptic, intensity: 0.8 },   // Primary mode
        audio: { ...sensoryOutput.audio, narration: true }
      };
    }
    return sensoryOutput;
  };

  return { state, calibrateBaseline, applyAdaptations };
};
