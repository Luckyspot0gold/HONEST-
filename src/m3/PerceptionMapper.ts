// src/m3/PerceptionMapper.ts
export class M3PerceptionMapper {
  private metricToPerception: Map<keyof M3Metrics, PerceptionMapping>;
  
  constructor() {
    this.metricToPerception = new Map([
      ['HRI', { // Harmonic Resonance Index
        toroidalLayer: 'foundational',
        sound: this.mapToSolfege.bind(this, 'ohm'),
        color: this.mapToColor.bind(this, 'blue'),
        haptic: this.mapToHaptic.bind(this, 'steady_pulse'),
        linguistic: 'resonance',
        metaphysical: 'existence_vibration'
      }],
      ['HSI', { // Harmonic Sentiment Index
        toroidalLayer: 'creative',
        sound: this.mapToSolfege.bind(this, 'sol'),
        color: this.mapToColor.bind(this, 'green'),
        haptic: this.mapToHaptic.bind(this, 'gentle_vibration'),
        linguistic: 'expression',
        metaphysical: 'outward_manifestation'
      }],
      ['HIV', { // Harmonic Intensity Volume
        toroidalLayer: 'physical',
        sound: this.mapToSolfege.bind(this, 'fa'),
        color: this.mapToColor.bind(this, 'red'),
        haptic: this.mapToHaptic.bind(this, 'intense_throb'),
        linguistic: 'detention',
        metaphysical: 'phenomenological_presence'
      }],
      ['ISS', { // Instability Stability Score
        toroidalLayer: 'metaphysical',
        sound: this.mapToSolfege.bind(this, 'mi'),
        color: this.mapToColor.bind(this, 'yellow'),
        haptic: this.mapToHaptic.bind(this, 'wavering_pattern'),
        linguistic: 'relationship',
        metaphysical: 'balance_tension'
      }],
      ['SOS', { // Sonar Oscillation Score
        toroidalLayer: 'communication',
        sound: this.mapToSolfege.bind(this, 're'),
        color: this.mapToColor.bind(this, 'purple'),
        haptic: this.mapToHaptic.bind(this, 'oscillating_waves'),
        linguistic: 'interact',
        metaphysical: 'signal_exchange'
      }],
      ['IV3D', { // Interdimensional Volatility
        toroidalLayer: 'epistemological',
        sound: this.mapToSolfege.bind(this, 'do'),
        color: this.mapToColor.bind(this, 'teal'),
        haptic: this.mapToHaptic.bind(this, 'dimensional_shift'),
        linguistic: 'inteliterate',
        metaphysical: 'knowledge_transformation'
      }],
      ['ROC', { // Rate of Change
        toroidalLayer: 'creative',
        sound: this.mapToSolfege.bind(this, 'si'),
        color: this.mapToColor.bind(this, 'pink'),
        haptic: this.mapToHaptic.bind(this, 'accelerating_rhythm'),
        linguistic: 'invoking',
        metaphysical: 'envoking_change'
      }]
    ]);
  }
  
  mapToPerceptionLanguage(m3: M3Metrics): PerceptionSentence {
    const words: PerceptionWord[] = [];
    
    Object.entries(m3).forEach(([metric, value]) => {
      const mapping = this.metricToPerception.get(metric as keyof M3Metrics);
      if (mapping) {
        words.push({
          word: mapping.linguistic,
          sound: mapping.sound(value),
          color: mapping.color(value),
          haptic: mapping.haptic(value),
          meaning: mapping.metaphysical,
          intensity: value / 100
        });
      }
    });
    
    return this.constructSentence(words);
  }
}
