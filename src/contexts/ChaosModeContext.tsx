/**
 * Chaos Mode Context
 * 
 * Manages chaos mode state and intensity multipliers for
 * dramatically intensified particle effects, audio, and haptic feedback
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ChaosModeState {
  enabled: boolean;
  intensity: number; // 1x to 5x multiplier
  particleMultiplier: number;
  audioDistortion: number;
  hapticIntensity: number;
  screenShake: boolean;
}

interface ChaosModeContextType {
  chaosMode: ChaosModeState;
  toggleChaosMode: () => void;
  setIntensity: (intensity: number) => void;
  emergencyStop: () => void;
}

const defaultState: ChaosModeState = {
  enabled: false,
  intensity: 1,
  particleMultiplier: 1,
  audioDistortion: 0,
  hapticIntensity: 0.5,
  screenShake: false
};

const ChaosModeContext = createContext<ChaosModeContextType | undefined>(undefined);

export function ChaosModeProvider({ children }: { children: React.ReactNode }) {
  const [chaosMode, setChaosMode] = useState<ChaosModeState>(defaultState);

  const toggleChaosMode = useCallback(() => {
    setChaosMode(prev => {
      if (prev.enabled) {
        // Turning off - reset to defaults
        return defaultState;
      } else {
        // Turning on - apply default chaos intensity
        return calculateChaosModeState(true, 2); // Start at 2x intensity
      }
    });
  }, []);

  const setIntensity = useCallback((intensity: number) => {
    const clampedIntensity = Math.max(1, Math.min(5, intensity));
    setChaosMode(prev => ({
      ...prev,
      ...calculateChaosModeState(prev.enabled, clampedIntensity)
    }));
  }, []);

  const emergencyStop = useCallback(() => {
    setChaosMode(defaultState);
    
    // Announce emergency stop
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Chaos mode emergency stop activated');
      utterance.rate = 1.5;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return (
    <ChaosModeContext.Provider value={{ chaosMode, toggleChaosMode, setIntensity, emergencyStop }}>
      {children}
    </ChaosModeContext.Provider>
  );
}

export function useChaosMode() {
  const context = useContext(ChaosModeContext);
  if (!context) {
    throw new Error('useChaosMode must be used within ChaosModeProvider');
  }
  return context;
}

function calculateChaosModeState(enabled: boolean, intensity: number): ChaosModeState {
  if (!enabled) {
    return defaultState;
  }

  return {
    enabled: true,
    intensity,
    particleMultiplier: 1 + (intensity - 1) * 0.5, // 1x to 3x
    audioDistortion: (intensity - 1) * 0.2, // 0 to 0.8
    hapticIntensity: Math.min(1.0, 0.5 + (intensity - 1) * 0.15), // 0.5 to 1.0
    screenShake: intensity >= 3 // Enable screen shake at 3x or higher
  };
}
