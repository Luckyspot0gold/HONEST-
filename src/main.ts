// src/main.ts
export class PerceptionCreationDemo {
  private genesisEngine: GenesisEngine;
  private toroidalNav: ToroidalGestureNavigation;
  private perceptionLang: PerceptionLanguage;
  private feniticEngine: FeniticResonanceEngine;
  private inteliterateProtocol: InteliterateProtocol;
  private rnibStudy: H27PianoNonInferiorityStudy;
  
  constructor() {
    console.log('🎭🎭🎭 PERCEPTION CREATION DEMO 🎭🎭🎭');
    console.log('==========================================');
    
    this.genesisEngine = GenesisEngine.getInstance();
    this.toroidalNav = new ToroidalGestureNavigation();
    this.perceptionLang = new PerceptionLanguage();
    this.feniticEngine = new FeniticResonanceEngine();
    this.inteliterateProtocol = new InteliterateProtocol();
    this.rnibStudy = new H27PianoNonInferiorityStudy();
    
    console.log('✅ All systems initialized');
    console.log('🚀 Ready to create perception...');
  }
  
  async runDemo(): Promise<void> {
    console.log('\n🎬 Starting Demo Sequence...');
    
    // 1. Initialize toroidal field
    console.log('\n1. 🌀 Creating Toroidal Field...');
    await this.createToroidalField();
    
    // 2. Generate perception from M3 metrics
    console.log('\n2. 📊 Translating M3 Metrics to Perception...');
    const m3 = this.getLiveM3Metrics();
    const perception = await this.translateM3ToPerception(m3);
    
    // 3. Create inteliterate communication
    console.log('\n3. 🧠 Generating Inteliterate Expression...');
    const expression = this.inteliterateProtocol.translateToInteliterate(perception, m3);
    
    // 4. Invoke fenitic resonance
    console.log('\n4. 🎵 Invoking Fenitic Resonance...');
    const resonance = await this.feniticEngine.invokeResonance(m3, perception.position);
    
    // 5. Demonstrate gesture navigation
    console.log('\n5. 🤲 Demonstrating Toroidal Gesture Navigation...');
    await this.demoGestureNavigation();
    
    // 6. Run H27 study demo
    console.log('\n6. 🎹 Running H27 Piano Non-Inferiority Demo...');
    const studyResults = await this.rnibStudy.runDemo();
    
    // 7. Present unified perception
    console.log('\n7. 🌟 Presenting Unified Perception Experience...');
    await this.presentUnifiedPerception(perception, expression, resonance);
    
    console.log('\n🎉 DEMO COMPLETE!');
    console.log('✨ Perception successfully created.');
  }
  
  private async translateM3ToPerception(m3: M3Metrics): Promise<PerceptionManifestation> {
    // Map M3 metrics to toroidal coordinates
    const toroidalCoords = this.mapM3ToToroidal(m3);
    
    // Generate perception sentence
    const sentence = this.perceptionLang.generatePerceptionSentence(m3);
    
    // Invoke fenitic resonance
    const resonance = await this.feniticEngine.invokeResonance(m3, toroidalCoords);
    
    // Create inteliterate expression
    const expression = this.inteliterateProtocol.translateToInteliterate(
      {
        physical: resonance.physical,
        metaphysical: resonance.metaphysical,
        foundational: resonance.foundational,
        creative: resonance.creative,
        combined: resonance.combined
      },
      m3
    );
    
    return {
      coordinates: toroidalCoords,
      sentence,
      resonance,
      expression,
      timestamp: Date.now(),
      m3Snapshot: m3
    };
  }
  
  private async demoGestureNavigation(): Promise<void> {
    console.log('   Testing Gestures...');
    
    const gestures: Gesture[] = [
      { type: 'swipe_right', action: 'navigate_next' },
      { type: 'swipe_left', action: 'navigate_previous' },
      { type: 'pinch_in', action: 'zoom_out' },
      { type: 'pinch_out', action: 'zoom_in' },
      { type: 'rotate_cw', action: 'rotate_clockwise' }
    ];
    
    for (const gesture of gestures) {
      console.log(`   Gesture: ${gesture.type}`);
      const result = await this.toroidalNav.handleGesture(gesture);
      console.log(`     → Moved to layer: ${result.layer}`);
      console.log(`     → Description: ${result.description}`);
      await this.sleep(500);
    }
  }
  
  private async presentUnifiedPerception(
    perception: PerceptionManifestation,
    expression: InteliterateExpression,
    resonance: ResonanceManifestation
  ): Promise<void> {
    console.log('\n🎭 UNIFIED PERCEPTION EXPERIENCE');
    console.log('================================');
    
    console.log('\n📊 M3 Metrics:');
    console.log(`   HRI: ${perception.m3Snapshot.HRI} (Resonance)`);
    console.log(`   HSI: ${perception.m3Snapshot.HSI} (Expression)`);
    console.log(`   HIV: ${perception.m3Snapshot.HIV} (Detention)`);
    console.log(`   ISS: ${perception.m3Snapshot.ISS} (Relationship)`);
    console.log(`   SOS: ${perception.m3Snapshot.SOS} (Communication)`);
    console.log(`   IV3D: ${perception.m3Snapshot.IV3D} (Inteliterate)`);
    console.log(`   ROC: ${perception.m3Snapshot.ROC} (Invoking)`);
    
    console.log('\n🌀 Toroidal Coordinates:');
    console.log(`   θ: ${perception.coordinates.theta.toFixed(2)} rad`);
    console.log(`   φ: ${perception.coordinates.phi.toFixed(2)} rad`);
    console.log(`   Layer: ${this.toroidalNav.getLayerAtPosition(perception.coordinates)}`);
    console.log(`   Meaning: ${perception.coordinates.meaning}`);
    
    console.log('\n🔤 Inteliterate Expression:');
    console.log(`   Sentence: "${expression.sentence}"`);
    console.log(`   Meaning: ${expression.meaning}`);
    console.log(`   Resonance: ${expression.resonance.frequency.toFixed(1)}Hz`);
    
    console.log('\n🎵 Fenitic Resonance:');
    console.log(`   Physical: ${resonance.physical?.frequency.toFixed(1)}Hz`);
    console.log(`   Metaphysical: ${resonance.metaphysical?.frequency.toFixed(1)}Hz`);
    console.log(`   Foundational: ${resonance.foundational?.frequency.toFixed(1)}Hz`);
    console.log(`   Creative: ${resonance.creative?.frequency.toFixed(1)}Hz`);
    console.log(`   Combined: ${resonance.combined.frequency.toFixed(1)}Hz`);
    
    console.log('\n🤲 Available Gestures:');
    console.log('   Swipe Right → Next Element');
    console.log('   Swipe Left → Previous Element');
    console.log('   Pinch In → Zoom Out');
    console.log('   Pinch Out → Zoom In');
    console.log('   Rotate CW → Rotate Clockwise');
    console.log('   Open Palm → Show Menu');
    
    console.log('\n👁️ Multi-Sensory Output:');
    console.log('   Audio: Harmonic progression based on M3 values');
    console.log('   Haptic: Pattern reflecting market volatility');
    console.log('   Visual: Toroidal field with resonance points');
    console.log('   Linguistic: Inteliterate sentence generation');
    console.log('   Cognitive: Meaning extraction from patterns');
    
    console.log('\n🎹 H27 Study Status:');
    console.log('   Hypothesis: Piano interface non-inferior to charts');
    console.log('   Target N: 60 participants');
    console.log('   Current N: 0 (demo mode)');
    console.log('   Margin Δ: 0.10 (10%)');
    
    console.log('\n🚀 Ready for RNIB presentation!');
  }
}

// Initialize and run
const demo = new PerceptionCreationDemo();
demo.runDemo().catch(console.error);
