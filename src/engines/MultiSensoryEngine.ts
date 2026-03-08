/**
 * Unified Multi-Sensory Engine (Patent Claim: Phase-Locked Synchronization)
 * Translates PTE/M3 data → synchronized audio/haptic/visual/cymatic outputs
 */

import { CMM } from '../core/color-mapping-matrix';
import type { Industry } from '../core/color-mapping-matrix';

export interface SensoryOutput {
  audio: { frequency: number; waveform: 'sine' | 'sawtooth'; volume: number };
  haptic: { intensity: number; frequency: number; duration: number; pattern: string };
  visual: { color: string; blochState: [number, number, number]; torusParams: any };
  cymatic: { nodes: number; pattern: string };
}

export class MultiSensoryEngine {
  private baseFreq = 432;  // Hz

  generateOutput(data: { industry: Industry; value: number; pteTensor: number[][] }): SensoryOutput {
    const cmm = CMM.mapValue(data.industry, data.value);
    
    return {
      audio: {
        frequency: cmm.audioFreq,
        waveform: this.getWaveformFromTensor(data.pteTensor),
        volume: cmm.hapticPattern.intensity
      },
      haptic: cmm.hapticPattern,
      visual: {
        color: cmm.hex,
        blochState: this.tensorToBloch(data.pteTensor),  // [x,y,z] for 6D projection
        torusParams: { radius: data.value * 10, twist: cmm.hue / 360 }
      },
      cymatic: {
        nodes: Math.floor(data.value * 100),
        pattern: cmm.semantic.includes('critical') ? 'chaos' : 'harmonic'
      }
    };
  }

  private getWaveformFromTensor(tensor: number[][]): 'sine' | 'sawtooth' {
    const entropy = this.calculateEntropy(tensor);
    return entropy > 0.5 ? 'sawtooth' : 'sine';  // Chaotic = sawtooth
  }

  private tensorToBloch(tensor: number[][]): [number, number, number] {
    // Project 5D tensor to Bloch sphere (x,y,z)
    return [
      tensor[0][0] - tensor[1][1],  // Real part diff
      tensor[0][1] + tensor[1][0],  // Imag part sum
      tensor[0][2] - tensor[2][0]   // Momentum/volatility
    ];
  }

  private calculateEntropy(tensor: number[][]): number {
    // Shannon entropy of probability distribution
    const probs = tensor.flat().map(p => Math.exp(p));
    const sum = probs.reduce((a, b) => a + b, 0);
    return -probs.reduce((sum, p) => sum + (p/sum) * Math.log2(p/sum), 0) / Math.log2(probs.length);
  }
}
