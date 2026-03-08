// Healthcare Adapter (MRI/CT/EEG → Sensory)
import { MultiSensoryEngine } from '../../engines/MultiSensoryEngine';
import { Industry } from '../../core/color-mapping-matrix';

export class HealthcareAdapter {
  private engine = new MultiSensoryEngine();

  adaptVitals(vitals: { hr: number; spo2: number; temp: number }) {
    const avg = (vitals.hr + vitals.spo2 + vitals.temp) / 3;
    return this.engine.generateOutput({
      industry: Industry.HEALTHCARE,
      value: avg / 100,  // Normalize 0-1
      pteTensor: [[vitals.hr/100], [vitals.spo2/100]]  // Simplified tensor
    });
  }

  adaptImaging(scanData: { hounsfield: number; anomalyScore: number }) {
    return this.engine.generateOutput({
      industry: Industry.MEDICAL_IMAGING,
      value: scanData.anomalyScore,
      pteTensor: [[scanData.hounsfield/1000]]
    });
  }
}
