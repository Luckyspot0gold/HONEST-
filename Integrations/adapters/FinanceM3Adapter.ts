import { McCreaMarketMetrics } from '../../metrics/mccrea-m3/McCreaMarketMetrics';

export class FinanceM3Adapter {
  adaptBTC(data: any) {
    const m3 = new McCreaMarketMetrics(data);
    const metrics = m3.calculateM3(data);
    return {
      alert: metrics.HIV > 0.8 ? 'Whale Activity (ISS High)' : 'Stable (HSI High)',
      rocSignal: metrics.ROC > 5 ? 'Buy' : metrics.ROC < -5 ? 'Sell' : 'Hold'
    };
  }
}
