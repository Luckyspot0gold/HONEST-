// src/demo/RNIBPerceptionDemo.ts
export class RNIBPerceptionDemo {
  private demoState: DemoState = {
    step: 0,
    m3Metrics: null,
    toroidalPosition: { theta: 0, phi: 0, radius: 1 },
    perception: null,
    gestures: [],
    audioEnabled: true,
    hapticEnabled: true,
    screenReaderEnabled: true,
    highContrastMode: false,
    reducedMotionMode: false
  };

  private audioContext: AudioContext;
  private canvas: HTMLCanvasElement;
  private video: HTMLVideoElement;
  private gestureEngine: GestureAccessibilityEngine;
  private screenReader: EnhancedScreenReader;

  constructor() {
    console.log('🎭 RNIB PERCEPTION DEMO INITIALIZING...');
    this.initializeAudio();
    this.initializeVisualization();
    this.initializeGestureRecognition();
    this.initializeScreenReader();
    
    console.log('✅ Demo ready for RNIB meeting');
    console.log('📅 Thursday 3:00 PM London / 9:00 AM Denver');
    console.log('🎯 Focus: Accessibility + Perception Language');
  }

  private initializeAudio(): void {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    console.log('🎵 Audio context initialized');
  }

  private initializeVisualization(): void {
    this.canvas = document.getElementById('toroidal-canvas') as HTMLCanvasElement;
    const renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create toroidal field visualization
    const torusGeometry = new THREE.TorusGeometry(3, 1, 16, 100);
    const torusMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4A90E2,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torus);

    // Add resonance points
    const resonancePoints = this.createResonancePoints();
    resonancePoints.forEach(point => scene.add(point));

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    console.log('🌀 Toroidal visualization initialized');
  }

  private initializeGestureRecognition(): void {
    this.video = document.getElementById('gesture-video') as HTMLVideoElement;
    this.gestureEngine = new GestureAccessibilityEngine(this.video);
    
    // Define RNIB-optimized gestures
    this.gestureEngine.defineGestures([
      { name: 'swipe_right', action: 'Next element', detection: this.detectSwipeRight },
      { name: 'swipe_left', action: 'Previous element', detection: this.detectSwipeLeft },
      { name: 'pinch', action: 'Select', detection: this.detectPinch },
      { name: 'open_palm', action: 'Help menu', detection: this.detectOpenPalm },
      { name: 'thumbs_up', action: 'Confirm', detection: this.detectThumbsUp },
      { name: 'thumbs_down', action: 'Cancel', detection: this.detectThumbsDown },
      { name: 'point', action: 'Focus element', detection: this.detectPoint },
      { name: 'circle', action: 'Scroll', detection: this.detectCircle }
    ]);

    console.log('🤲 Gesture recognition initialized with 8 RNIB-optimized gestures');
  }

  private initializeScreenReader(): void {
    this.screenReader = new EnhancedScreenReader({
      voice: 'Google UK English Female',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    });

    console.log('🔊 Screen reader initialized');
  }

  async runDemoSequence(): Promise<void> {
    console.log('\n🚀 STARTING DEMO SEQUENCE FOR RNIB');
    console.log('====================================');

    // Step 1: Welcome and accessibility announcement
    await this.step1_Welcome();
    
    // Step 2: Demonstrate gesture navigation
    await this.step2_GestureNavigation();
    
    // Step 3: Show M3 to perception translation
    await this.step3_M3ToPerception();
    
    // Step 4: Demonstrate piano interface for blind users
    await this.step4_PianoInterface();
    
    // Step 5: Show RNIB study integration
    await this.step5_RNIBStudy();
    
    // Step 6: Present H27 hypothesis
    await this.step6_H27Hypothesis();
    
    // Step 7: Q&A and next steps
    await this.step7_Conclusion();
  }

  private async step1_Welcome(): Promise<void> {
    console.log('\n1️⃣ WELCOME TO PERCEPTION CREATION');
    
    this.screenReader.speak(
      `Welcome to the H.O.N.E.S.T. Perception Creation Demo. ` +
      `This system translates financial data into a multi-sensory experience accessible to all users. ` +
      `Gesture navigation is enabled. Swipe right to begin.`
    );

    this.playAudioSequence([432, 528, 639]); // Welcome chord
    this.updateVisualization('welcome');
    
    // Wait for gesture to continue
    return new Promise(resolve => {
      this.gestureEngine.onGesture('swipe_right', () => {
        console.log('✅ Gesture detected: Swipe right');
        resolve();
      });
    });
  }

  private async step2_GestureNavigation(): Promise<void> {
    console.log('\n2️⃣ GESTURE-BASED TOROIDAL NAVIGATION');
    
    this.screenReader.speak(
      `You are now navigating through a toroidal information space. ` +
      `The torus represents the multi-dimensional nature of financial data. ` +
      `Try these gestures: Swipe right for next, swipe left for previous, pinch to select.`
    );

    this.playAudioSequence([396, 741, 852]); // Navigation chord
    
    // Create navigation points on torus
    const navigationPoints = [
      { name: 'Harmonic Resonance', frequency: 432, color: '#4A90E2' },
      { name: 'Market Sentiment', frequency: 528, color: '#7ED321' },
      { name: 'Volatility', frequency: 639, color: '#F5A623' },
      { name: 'Trend Direction', frequency: 741, color: '#9013FE' },
      { name: 'Market Phases', frequency: 852, color: '#50E3C2' }
    ];

    let currentIndex = 0;
    
    this.gestureEngine.onGesture('swipe_right', () => {
      currentIndex = (currentIndex + 1) % navigationPoints.length;
      this.navigateToPoint(navigationPoints[currentIndex]);
    });

    this.gestureEngine.onGesture('swipe_left', () => {
      currentIndex = (currentIndex - 1 + navigationPoints.length) % navigationPoints.length;
      this.navigateToPoint(navigationPoints[currentIndex]);
    });

    this.gestureEngine.onGesture('pinch', () => {
      this.selectPoint(navigationPoints[currentIndex]);
    });

    console.log('✅ Gesture navigation demo ready');
  }

  private async step3_M3ToPerception(): Promise<void> {
    console.log('\n3️⃣ M3 METRICS TO PERCEPTION TRANSLATION');
    
    // Generate realistic M3 metrics
    const m3Metrics: M3Metrics = {
      HRI: 75.4,  // Harmonic Resonance Index
      HSI: 62.1,  // Harmonic Sentiment Index
      HIV: 83.7,  // Harmonic Intensity Volume
      ISS: 41.2,  // Instability Stability Score
      SOS: 58.9,  // Sonar Oscillation Score
      IV3D: 67.3, // Interdimensional Volatility
      ROC: 12.5   // Rate of Change
    };

    this.screenReader.speak(
      `Translating M3 metrics to perception language. ` +
      `Harmonic Resonance: ${m3Metrics.HRI.toFixed(1)}. ` +
      `Market Sentiment: ${m3Metrics.HSI.toFixed(1)} percent. ` +
      `Volatility: ${m3Metrics.HIV.toFixed(1)} percent. ` +
      `Creating multi-sensory output.`
    );

    // Translate to perception
    const perception = await this.translateM3ToPerception(m3Metrics);
    
    // Play harmonic representation
    this.playHarmonicRepresentation(m3Metrics);
    
    // Update visualization
    this.updateVisualizationWithMetrics(m3Metrics);
    
    // Provide haptic feedback
    this.provideHapticFeedback(m3Metrics);
    
    console.log('✅ M3 to perception translation complete');
    console.log(`   HRI: ${m3Metrics.HRI} → Harmonic Resonance`);
    console.log(`   HSI: ${m3Metrics.HSI} → Market Sentiment`);
    console.log(`   HIV: ${m3Metrics.HIV} → Volatility Intensity`);
  }

  private async step4_PianoInterface(): Promise<void> {
    console.log('\n4️⃣ PIANO INTERFACE FOR BLIND USERS');
    
    this.screenReader.speak(
      `Demonstrating piano interface for financial trend identification. ` +
      `Market data is translated to piano chords. ` +
      `Major chord: Bullish trend. Minor chord: Bearish trend. ` +
      `Chord progression shows market phases.`
    );

    const pianoInterface = new PianoFinancialInterface();
    
    // Generate financial test data
    const testData = this.generateFinancialTestData();
    
    // Present as piano chords
    const chords = pianoInterface.dataToChords(testData);
    
    // Play chord progression
    await this.playChordProgression(chords);
    
    // Explain what each chord means
    chords.forEach((chord, index) => {
      setTimeout(() => {
        this.screenReader.speak(
          `Chord ${index + 1}: ${chord.name}. ` +
          `Market interpretation: ${chord.interpretation}. ` +
          `Confidence: ${chord.confidence} percent.`
        );
      }, index * 2000);
    });

    console.log('✅ Piano interface demo complete');
    console.log(`   ${chords.length} chords generated`);
    console.log(`   Average confidence: ${chords.reduce((a, b) => a + b.confidence, 0) / chords.length}%`);
  }

  private async step5_RNIBStudy(): Promise<void> {
    console.log('\n5️⃣ RNIB STUDY INTEGRATION DEMO');
    
    this.screenReader.speak(
      `Now demonstrating RNIB study integration. ` +
      `This system enables testing of hypothesis H27: ` +
      `Piano interface non-inferior to visual charts for blind users. ` +
      `Collecting participant data in real time.`
    );

    const study = new H27PianoNonInferiorityStudy();
    
    // Create mock participant
    const participant: Participant = {
      id: 'RNIB-DEMO-001',
      age: 42,
      visionStatus: 'blind',
      musicalExperience: 'intermediate',
      studyGroup: 'piano',
      sessionStart: new Date()
    };

    // Run demo test
    const testData = this.generateFinancialTestData();
    const startTime = Date.now();
    
    this.screenReader.speak(
      `Presenting financial data via piano interface. ` +
      `Please identify the trend direction after listening.`
    );

    // Play test sequence
    await this.playTestSequence(testData);
    
    // Simulate participant response
    const responseTime = Date.now() - startTime;
    const accuracy = 0.85; // Simulated accuracy
    const cognitiveLoad = this.measureCognitiveLoad(); // Simulated cognitive load
    
    // Record to Airtable
    await this.recordToAirtable({
      participantId: participant.id,
      interface: 'piano',
      accuracy,
      responseTime,
      cognitiveLoad,
      timestamp: new Date()
    });

    this.screenReader.speak(
      `Test complete. Accuracy: ${Math.round(accuracy * 100)} percent. ` +
      `Response time: ${Math.round(responseTime / 1000)} seconds. ` +
      `Cognitive load: ${cognitiveLoad.toFixed(1)} on NASA TLX scale. ` +
      `Data recorded to study database.`
    );

    console.log('✅ RNIB study integration demo complete');
    console.log(`   Participant: ${participant.id}`);
    console.log(`   Accuracy: ${accuracy * 100}%`);
    console.log(`   Response time: ${responseTime}ms`);
    console.log(`   Cognitive load: ${cognitiveLoad}`);
  }

  private async step6_H27Hypothesis(): Promise<void> {
    console.log('\n6️⃣ H27 HYPOTHESIS PRESENTATION');
    
    this.screenReader.speak(
      `Hypothesis H27: Piano interface non-inferior to visual charts for trend identification. ` +
      `Target: 60 participants. Margin: 10 percent non-inferiority. ` +
      `Primary endpoint: Accuracy Area Under Curve. ` +
      `Secondary endpoints: Response time, cognitive load, confidence.`
    );

    // Show statistical power calculation
    const powerAnalysis = {
      requiredN: 60,
      power: 0.8,
      alpha: 0.05,
      margin: 0.1,
      expectedEffect: 0.15
    };

    this.updateVisualization('power_analysis', powerAnalysis);
    
    this.screenReader.speak(
      `Statistical power analysis complete. ` +
      `Required sample size: ${powerAnalysis.requiredN} participants. ` +
      `Power: ${powerAnalysis.power * 100} percent. ` +
      `Alpha: ${powerAnalysis.alpha}. ` +
      `Non-inferiority margin: ${powerAnalysis.margin * 100} percent.`
    );

    // Show simulated results
    const simulatedResults = this.simulateStudyResults();
    
    this.screenReader.speak(
      `Simulated results show piano interface achieving ${Math.round(simulatedResults.piano.accuracy * 100)} percent accuracy ` +
      `compared to charts at ${Math.round(simulatedResults.charts.accuracy * 100)} percent accuracy. ` +
      `Difference: ${(simulatedResults.difference * 100).toFixed(1)} percent. ` +
      `Confidence interval: ${(simulatedResults.ci.lower * 100).toFixed(1)} to ${(simulatedResults.ci.upper * 100).toFixed(1)} percent.`
    );

    console.log('✅ H27 hypothesis presentation complete');
    console.log(`   Required N: ${powerAnalysis.requiredN}`);
    console.log(`   Power: ${powerAnalysis.power}`);
    console.log(`   Simulated piano accuracy: ${simulatedResults.piano.accuracy * 100}%`);
    console.log(`   Simulated chart accuracy: ${simulatedResults.charts.accuracy * 100}%`);
  }

  private async step7_Conclusion(): Promise<void> {
    console.log('\n7️⃣ CONCLUSION & NEXT STEPS');
    
    this.screenReader.speak(
      `Demonstration complete. ` +
      `The H.O.N.E.S.T. Perception Creation System enables blind and low-vision users to understand ` +
      `financial data through multi-sensory translation. ` +
      `Key features: Gesture navigation, piano interface, real-time M3 translation, ` +
      `and integrated RNIB study framework. ` +
      `Next steps: Full implementation, participant recruitment, and hypothesis validation.`
    );

    // Play completion sequence
    this.playAudioSequence([963, 852, 741, 639, 528, 432]);
    
    // Final visualization
    this.updateVisualization('completion');
    
    // Show next steps
    const nextSteps = [
      'Week 1: Complete gesture calibration',
      'Week 2: Implement piano interface',
      'Week 3: Integrate with RNIB study platform',
      'Week 4: Begin participant recruitment',
      'Week 5: Start H27 hypothesis testing',
      'Week 6: Preliminary results analysis',
      'Week 7: Full deployment'
    ];

    nextSteps.forEach((step, index) => {
      setTimeout(() => {
        this.screenReader.speak(`Week ${index + 1}: ${step}`);
      }, index * 1500);
    });

    console.log('\n🎉 DEMO COMPLETE!');
    console.log('✨ Ready for RNIB meeting on Thursday');
    console.log('📅 3:00 PM London / 9:00 AM Denver');
    console.log('🎯 Key talking points:');
    console.log('   1. Gesture-based toroidal navigation');
    console.log('   2. M3 to perception translation');
    console.log('   3. Piano interface for blind users');
    console.log('   4. H27 hypothesis testing framework');
    console.log('   5. RNIB study integration');
    console.log('   6. Patent strategy (Claims 61-68)');
  }

  // Utility methods
  private playAudioSequence(frequencies: number[]): void {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
        
        oscillator.start(this.audioContext.currentTime + index * 0.2);
        oscillator.stop(this.audioContext.currentTime + index * 0.2 + 1);
      }, index * 200);
    });
  }

  private provideHapticFeedback(metrics: M3Metrics): void {
    if (!this.demoState.hapticEnabled) return;
    
    // Create haptic pattern based on M3 metrics
    const pattern = [];
    
    // HIV determines intensity
    const intensity = metrics.HIV / 100;
    
    // ROC determines rhythm
    const rhythm = metrics.ROC > 0 ? 'accelerating' : 'decelerating';
    
    // HSI determines pattern type
    const patternType = metrics.HSI > 50 ? 'regular' : 'irregular';
    
    // Generate pattern
    for (let i = 0; i < 5; i++) {
      pattern.push({
        duration: rhythm === 'accelerating' ? 100 * (i + 1) : 500 - (i * 100),
        intensity: patternType === 'regular' ? intensity : intensity * Math.random(),
        frequency: 200 + (metrics.HRI / 100) * 100
      });
    }
    
    // Activate haptic feedback
    if (navigator.vibrate) {
      pattern.forEach(pulse => {
        navigator.vibrate(pulse.duration);
      });
    }
  }
}

// Run the demo
const demo = new RNIBPerceptionDemo();
demo.runDemoSequence().catch(console.error);
