// PTE feeds M3 metrics
import { PTE } from './ProbabilityTensorEngine';
import { McCreaMarketMetrics } from '../metrics/mccrea-m3/McCreaMarketMetrics';

export class PTE_M3Integrator {
  async integrate(marketData: any) {
    const pte = new PTE(marketData);
    const tensor = await pte.computePRM();  // PTE tensor output
    const m3 = new McCreaMarketMetrics(tensor);
    return m3.calculateM3(marketData);  // Full M3 with HRI/HSI/etc.
  }
}
