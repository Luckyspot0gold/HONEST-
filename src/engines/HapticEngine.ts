// src/engines/HapticEngine.ts
export class HapticEngine {
  public triggerPattern(state: MarketState) {
    if (!navigator.vibrate) return;

    const intensity = Math.floor(state.sigma * 100) + 30;
    const duration = Math.floor(200 + state.stability * 600);

    // Simple pattern: Volatility = sharp pulses, Momentum = direction feel
    const pattern = state.delta > 0 
      ? [duration / 3, 50, duration / 2] 
      : [duration / 2, 50, duration / 3];

    navigator.vibrate(pattern);
  }
}
