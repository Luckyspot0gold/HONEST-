// src/studies/H27_PianoNonInferiority.ts
export class H27PianoNonInferiorityStudy {
  private pianoInterface: PianoFinancialInterface;
  private chartInterface: ChartFinancialInterface;
  private participants: Participant[];
  private results: StudyResult[];
  
  constructor() {
    this.pianoInterface = new PianoFinancialInterface();
    this.chartInterface = new ChartFinancialInterface();
    this.participants = [];
    this.results = [];
    
    console.log('🎹 H27 Piano Non-Inferiority Study Initialized');
    console.log('   Hypothesis: Piano interface non-inferior to visual charts');
    console.log('   Margin Δ: 0.10 (10% non-inferiority margin)');
    console.log('   Target N: 60 participants');
  }
  
  async runStudy(): Promise<StudyResults> {
    console.log('🚀 Starting H27 Study...');
    
    // Recruit participants
    await this.recruitParticipants();
    
    // Randomize to piano or chart group
    this.randomizeGroups();
    
    // Run tests
    const pianoResults = await this.testPianoGroup();
    const chartResults = await this.testChartGroup();
    
    // Analyze results
    const analysis = this.analyzeResults(pianoResults, chartResults);
    
    // Check non-inferiority
    const isNonInferior = this.checkNonInferiority(analysis);
    
    return {
      hypothesis: 'H27: Piano interface non-inferior to visual charts for trend identification',
      isNonInferior,
      pianoResults,
      chartResults,
      analysis,
      interpretation: this.generateInterpretation(analysis, isNonInferior)
    };
  }
  
  private async testPianoGroup(): Promise<ParticipantResult[]> {
    console.log('🎵 Testing Piano Group...');
    const results: ParticipantResult[] = [];
    
    const pianoGroup = this.participants.filter(p => p.group === 'piano');
    
    for (const participant of pianoGroup) {
      console.log(`   Participant ${participant.id}: Piano Interface`);
      
      // Present financial data as piano chords
      const testData = this.generateTestData();
      const pianoPresentation = this.pianoInterface.presentData(testData);
      
      // Measure performance
      const startTime = Date.now();
      const accuracy = await this.measureAccuracy(participant, pianoPresentation);
      const responseTime = Date.now() - startTime;
      const cognitiveLoad = await this.measureCognitiveLoad(participant);
      const confidence = await this.measureConfidence(participant);
      
      results.push({
        participantId: participant.id,
        interface: 'piano',
        accuracy,
        responseTime,
        cognitiveLoad,
        confidence,
        feedback: await this.collectFeedback(participant)
      });
    }
    
    return results;
  }
  
  private async testChartGroup(): Promise<ParticipantResult[]> {
    console.log('📊 Testing Chart Group...');
    const results: ParticipantResult[] = [];
    
    const chartGroup = this.participants.filter(p => p.group === 'chart');
    
    for (const participant of chartGroup) {
      console.log(`   Participant ${participant.id}: Chart Interface`);
      
      // Present financial data as traditional charts
      const testData = this.generateTestData();
      const chartPresentation = this.chartInterface.presentData(testData);
      
      // Measure performance
      const startTime = Date.now();
      const accuracy = await this.measureAccuracy(participant, chartPresentation);
      const responseTime = Date.now() - startTime;
      const cognitiveLoad = await this.measureCognitiveLoad(participant);
      const confidence = await this.measureConfidence(participant);
      
      results.push({
        participantId: participant.id,
        interface: 'chart',
        accuracy,
        responseTime,
        cognitiveLoad,
        confidence,
        feedback: await this.collectFeedback(participant)
      });
    }
    
    return results;
  }
  
  private checkNonInferiority(analysis: StatisticalAnalysis): boolean {
    const margin = 0.10; // 10% non-inferiority margin
    const difference = analysis.meanDifference;
    const confidenceInterval = analysis.confidenceInterval;
    
    // Non-inferiority if upper bound of CI is less than margin
    const isNonInferior = confidenceInterval.upper < margin;
    
    console.log(`📈 Non-Inferiority Analysis:`);
    console.log(`   Mean Difference: ${difference.toFixed(3)}`);
    console.log(`   Confidence Interval: [${confidenceInterval.lower.toFixed(3)}, ${confidenceInterval.upper.toFixed(3)}]`);
    console.log(`   Margin Δ: ${margin}`);
    console.log(`   Is Non-Inferior: ${isNonInferior}`);
    
    return isNonInferior;
  }
}
