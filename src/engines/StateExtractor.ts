// src/engines/StateExtractor.ts
export interface MarketState {
  sigma: number;    // Volatility [0-1]
  delta: number;    // Momentum [-1 to 1]
  entropy: number;  // Disorder [0-1]
  coherence: number;// Alignment [0-1]
  direction: number;// Trend bias [-1 to 1]
  stability: number;// Persistence [0-1]
}

export class StateExtractor {
  private windowSize = 20; // adjustable

  public extract(data: Array<{price: number; volume?: number; timestamp?: number}>): MarketState {
    if (data.length < 5) return this.getNeutralState();

    const prices = data.map(d => d.price);
    const returns = this.calculateReturns(prices);

    return {
      sigma: this.normalizeVolatility(returns),
      delta: this.calculateMomentum(returns),
      entropy: this.calculateEntropy(returns),
      coherence: this.calculateCoherence(prices),
      direction: this.calculateDirection(returns),
      stability: this.calculateStability(prices)
    };
  }

  private calculateReturns(prices: number[]): number[] {
    return prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
  }

  private normalizeVolatility(returns: number[]): number {
    const std = this.stdDev(returns);
    return Math.min(1, std * 10); // tune scaling
  }

  private calculateMomentum(returns: number[]): number {
    const recent = returns.slice(-5);
    return recent.reduce((a, b) => a + b, 0) / recent.length;
  }

  // Add your existing tensor / eigenstate math here for the other vars
  private calculateEntropy(returns: number[]): number { /* Shannon or sample entropy */ return 0.5; }
  private calculateCoherence(prices: number[]): number { /* correlation or PCA */ return 0.7; }
  private calculateDirection(returns: number[]): number { return Math.tanh(this.calculateMomentum(returns) * 3); }
  private calculateStability(prices: number[]): number { /* low variance in higher-order diffs */ return 0.6; }

  private stdDev(arr: number[]): number {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  private getNeutralState(): MarketState {
    return { sigma: 0.3, delta: 0, entropy: 0.5, coherence: 0.7, direction: 0, stability: 0.6 };
  }
}
