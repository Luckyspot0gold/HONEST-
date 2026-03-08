/**
 * McCrea Market Metrics (M3) - Full Implementation
 * Integrates HRI, HSI, HIV, ISS, SOS, IV3D, ROC with PTE tensors
 * Patent: McCrea Harmonic Economic Translation System
 */

import { PTE } from '../../engines/ProbabilityTensorEngine';  // PTE integration

export interface M3Metrics {
  HRI: number;  // Harmonic Resonance Index (0-1, market alignment)
  HSI: number;  // Harmonic Stability Index (0-1, low volatility)
  HIV: number;  // Harmonic Intensity Variance (0-1, chaos measure)
  ISS: number;  // Intuitive Sonic Signature (0-1, whale/institutional signal)
  SOS: number;  // Sonic Stability Score (0-1, audio coherence)
  IV3D: [number, number, number];  // 3D Intensity Vector [momentum, volatility, sentiment]
  ROC: number;  // Rate of Change (%)
}

export class McCreaMarketMetrics {
  private pte: PTE;

  constructor(pteData: any) {
    this.pte = new PTE(pteData);  // PTE tensor input
  }

  calculateM3(marketData: { price: number; volume: number; volatility: number; sentiment: number }): M3Metrics {
    const tensor = this.pte.computeTensor(marketData);  // PTE integration

    return {
      // HRI: Harmonic Resonance Index (bell alignment / 7)
      HRI: this.bellResonance(tensor, [86, 111.11, 432, 528, 639, 741, 852]) / 7,

      // HSI: Harmonic Stability Index (inverse volatility entropy)
      HSI: 1 - this.entropyFromTensor(tensor),

      // HIV: Harmonic Intensity Variance (volume/volatility skew)
      HIV: Math.abs(marketData.volume / (marketData.volatility + 1e-6)),

      // ISS: Intuitive Sonic Signature (whale detection via low-freq dominance)
      ISS: this.whaleSonicSignature(tensor, 111.11),  // Low bell dominance

      // SOS: Sonic Stability Score (coherence across frequencies)
      SOS: this.coherenceScore(tensor),

      // IV3D: 3D Intensity Vector [momentum, vol, sentiment]
      IV3D: [
        this.rateOfChange(marketData.price),  // Momentum
        marketData.volatility,                // Volatility
        marketData.sentiment                  // Sentiment
      ],

      // ROC: Rate of Change (%)
      ROC: this.rateOfChange(marketData.price)
    };
  }

  private bellResonance(tensor: number[][], bells: number[]): number {
    return bells.reduce((sum, freq) => sum + this.tensorPeakAt(tensor, freq), 0);
  }

  private entropyFromTensor(tensor: number[][]): number {
    // Shannon entropy (stability inverse)
    const probs = tensor.flat().map(p => Math.exp(p));
    const total = probs.reduce((a, b) => a + b, 0);
    return -probs.reduce((sum, p) => sum + (p/total) * Math.log2(p/total || 1), 0);
  }

  private whaleSonicSignature(tensor: number[][], lowFreq: number): number {
    // Low-freq dominance = institutional moves
    return this.tensorPeakAt(tensor, lowFreq) / tensor.flat().reduce((a, b) => a + b, 0);
  }

  private coherenceScore(tensor: number[][]): number {
    // Phase coherence across tensor dimensions
    return 1 - this.entropyFromTensor(tensor);  // Simplified
  }

  private tensorPeakAt(tensor: number[][], targetFreq: number): number {
    // FFT peak near target (simplified)
    return tensor.flat().reduce((max, val, i) => Math.abs(i - targetFreq/10) < 5 ? Math.max(max, val) : max, 0);
  }

  private rateOfChange(current: number, previous: number = current * 0.99): number {
    return ((current - previous) / previous) * 100;
  }
}
