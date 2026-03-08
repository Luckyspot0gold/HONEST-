/**
 * WCAG AA++ Accessibility Layer (Patent Claim: Neurodivergent Adaptation)
 * ARIA labels, reduced motion, high-contrast CMM, screen reader support
 */

import { useCognitiveLoad } from '../hooks/useCognitiveLoad';
import { CMM } from '../core/color-mapping-matrix';

export const WCAGLayer = {
  // High-contrast CMM variants
  highContrastMap: {
    ...CMM,  // Inherit standard
    finance: {
      bullish: '#00ff00',  // Bright green
      bearish: '#ff0000',  // Bright red
      neutral: '#ffffff'   // White
    }
  },

  // Reduced motion observer
  prefersReducedMotion: typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false,

  // Screen reader descriptions for sensory states
  ariaDescriptions: (sensory: any) => ({
    role: 'status',
    'aria-live': 'polite',
    'aria-label': `Market state: ${sensory.visual.semantic}. Audio: ${sensory.audio.frequency}Hz. Haptic: ${sensory.haptic.pattern}.`
  }),

  // Auto-apply based on cognitive load
  applyAccessibility: (sensory: any, cognitiveState: any) => {
    if (cognitiveState.isOverloaded || WCAGLayer.prefersReducedMotion) {
      return {
        ...sensory,
        visual: { ...sensory.visual, animationDuration: 0 },
        haptic: { ...sensory.haptic, intensity: Math.min(sensory.haptic.intensity, 0.5) }
      };
    }
    return sensory;
  }
};
