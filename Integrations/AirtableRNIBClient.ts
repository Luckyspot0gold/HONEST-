// src/Integrations/AirtableRNIBClient.ts
export class AirtableRNIBClient {
  private base: AirtableBase;
  
  constructor(apiKey: string, baseId: string) {
    this.base = new Airtable({ apiKey }).base(baseId);
  }

  async createParticipant(participantData: ParticipantData): Promise<string> {
    const record = await this.base('Participants').create({
      'Participant ID': participantData.id,
      'Vision Status': participantData.visionStatus,
      'Consent Tier': participantData.consentTier,
      'Accessibility Profile': JSON.stringify(participantData.profile),
      'Compensation Owed': 0,
      'Sessions Completed': 0,
      'Status': 'registered'
    });
    
    return record.getId();
  }

  async recordSession(
    participantId: string,
    hypothesis: string,
    data: any
  ): Promise<void> {
    await this.base('Sessions').create({
      'Participant ID': participantId,
      'Hypothesis': hypothesis,
      'Timestamp': new Date().toISOString(),
      'Data': JSON.stringify(data),
      'NASA TLX Score': data.nasaTLX,
      'Accuracy': data.accuracy,
      'Response Time Avg': data.avgResponseTime
    });

    // Update compensation
    await this.updateCompensation(participantId, 15); // £15/hour
  }

  async getStudyProgress(): Promise<StudyProgress> {
    const participants = await this.base('Participants').select().all();
    const sessions = await this.base('Sessions').select().all();
    
    return {
      totalParticipants: participants.length,
      completedSessions: sessions.length,
      hypothesesCompleted: this.countHypotheses(sessions),
      compensationOwed: this.calculateTotalCompensation(participants)
    };
  }
}
