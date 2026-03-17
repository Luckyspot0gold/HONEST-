// src/studies/H27_PianoNonInferiority.ts
export class H27PianoNonInferiorityTest {
  async runTest(participants: Participant[]): Promise<TestResult> {
    const pianoGroup = participants.filter(p => p.group === 'piano');
    const chartGroup = participants.filter(p => p.group === 'chart');
    
    const pianoResults = await this.testPianoInterface(pianoGroup);
    const chartResults = await this.testChartInterface(chartGroup);
    
    return {
      hypothesis: 'H27: Piano interface non-inferior to visual charts',
      success: this.isNonInferior(pianoResults, chartResults, 0.10),
      data: {
        piano: pianoResults,
        charts: chartResults,
        effectSize: this.calculateEffectSize(pianoResults, chartResults),
        confidenceInterval: this.calculateCI(pianoResults, chartResults)
      },
      interpretation: this.generateInterpretation(pianoResults, chartResults)
    };
  }
  
  private async testPianoInterface(participants: Participant[]): Promise<TestMetrics> {
    const metrics: TestMetrics[] = [];
    
    for (const participant of participants) {
      // Present financial data as piano chords
      const pianoInterface = new PianoFinancialInterface();
      const testData = this.generateTestData();
      
      const startTime = Date.now();
      const accuracy = await pianoInterface.testTrendIdentification(
        participant,
        testData
      );
      const endTime = Date.now();
      
      metrics.push({
        participantId: participant.id,
        accuracy,
        responseTime: endTime - startTime,
        cognitiveLoad: await this.measureCognitiveLoad(participant),
        confidence: await this.measureConfidence(participant)
      });
    }
    
    return this.aggregateMetrics(metrics);
  }
}
