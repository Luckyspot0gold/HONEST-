// Add accessibility hooks to existing frontiers
export class HarmonicFrontier {
  async describeAudio(): Promise<string> {
    // Generate screen reader description of audio output
    return `Pitch: ${this.frequency}Hz, Volatility: ${this.volatility}`;
  }
}

export class HapticFrontier {
  getHapticDescription(): string {
    // Describe pattern for screen readers
    return `Eight-beat pattern with ${this.amplitude} intensity`;
  }
}
