// src/perception/TorusField.ts
export class TorusField {
  private majorRadius: number;  // Physical → Metaphysical dimension
  private minorRadius: number;   // Foundational → Creative dimension
  private resonanceMatrix: Map<string, ResonancePoint>;
  private flowVector: Vector3;
  
  constructor() {
    this.majorRadius = Math.PI * 8;  // 8D tensor dimensions
    this.minorRadius = Math.PI * 4;   // 4 foundational layers
    this.initializeResonanceMatrix();
    this.flowVector = new Vector3(1, 0, 0);
    
    console.log('🌀 Toroidal Field Initialized:');
    console.log(`   Major Radius: ${this.majorRadius} (Metaphysical Dimension)`);
    console.log(`   Minor Radius: ${this.minorRadius} (Physical Dimension)`);
    console.log(`   Resonance Points: ${this.resonanceMatrix.size}`);
  }
  
  private initializeResonanceMatrix(): void {
    this.resonanceMatrix = new Map([
      // FOUNDOMENTIAL LAYER (Existence)
      ['existence', { 
        frequency: 136.1, 
        color: '#000000',
        meaning: 'being',
        sound: 'ohm',
        vibration: 'stillness',
        layer: 'foundational'
      }],
      
      // PHYSICAL LAYER (Sensation)
      ['sensation', {
        frequency: 396,
        color: '#FF6B6B',
        meaning: 'presence',
        sound: 'ut',
        vibration: 'pulse',
        layer: 'physical'
      }],
      
      // METAPHYSICAL LAYER (Meaning)
      ['relationship', {
        frequency: 528,
        color: '#4ECDC4',
        meaning: 'connection',
        sound: 're',
        vibration: 'harmony',
        layer: 'metaphysical'
      }],
      
      // CREATIVE LAYER (Expression)
      ['expression', {
        frequency: 639,
        color: '#FFD166',
        meaning: 'manifestation',
        sound: 'mi',
        vibration: 'rhythm',
        layer: 'creative'
      }],
      
      // COMMUNICATION LAYER (Language)
      ['communication', {
        frequency: 741,
        color: '#06D6A0',
        meaning: 'exchange',
        sound: 'fa',
        vibration: 'oscillation',
        layer: 'communication'
      }],
      
      // EPISTEMOLOGY LAYER (Knowledge)
      ['epistemology', {
        frequency: 852,
        color: '#118AB2',
        meaning: 'understanding',
        sound: 'sol',
        vibration: 'resonance',
        layer: 'epistemological'
      }],
      
      // CREATIVITY LAYER (Envoking)
      ['creativity', {
        frequency: 963,
        color: '#EF476F',
        meaning: 'invoking',
        sound: 'la',
        vibration: 'amplitude',
        layer: 'creative'
      }],
      
      // INTELITERATE LAYER (Intelligence + Literacy)
      ['inteliterate', {
        frequency: 1080,
        color: '#7209B7',
        meaning: 'comprehension',
        sound: 'si',
        vibration: 'coherence',
        layer: 'inteliterate'
      }]
    ]);
  }
  
  calculatePositionOnTorus(theta: number, phi: number): ToroidalCoordinate {
    const x = (this.majorRadius + this.minorRadius * Math.cos(phi)) * Math.cos(theta);
    const y = (this.majorRadius + this.minorRadius * Math.cos(phi)) * Math.sin(theta);
    const z = this.minorRadius * Math.sin(phi);
    
    return {
      x, y, z,
      theta: theta % (2 * Math.PI),
      phi: phi % (2 * Math.PI),
      resonance: this.calculateResonanceAt(theta, phi),
      layer: this.determineLayer(phi),
      meaning: this.determineMeaning(theta, phi)
    };
  }
  
  private calculateResonanceAt(theta: number, phi: number): Resonance {
    const fundamental = 432; // A4 tuning
    const harmonicSeries = this.calculateHarmonicSeries(theta, phi);
    
    return {
      frequency: fundamental * harmonicSeries,
      amplitude: Math.sin(theta) * Math.cos(phi),
      phase: Math.atan2(Math.sin(theta), Math.cos(phi)),
      harmonics: this.generateHarmonics(harmonicSeries),
      cymaticPattern: this.generateCymaticPattern(theta, phi)
    };
  }
}
