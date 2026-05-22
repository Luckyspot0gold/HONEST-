// src/components/HarmonicChart.tsx
import { Chart } from 'chart.js';
import { StateExtractor } from '../engines/StateExtractor';
import { AudioEngine, HapticEngine } from '../engines';

export class HarmonicIndicator {
  private extractor = new StateExtractor();
  private audio = new AudioEngine();
  private haptic = new HapticEngine();
  private chart: Chart;

  constructor(canvasId: string) {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: { datasets: [{ label: 'Price', data: [] }] },
      options: { /* standard responsive config */ }
    });
  }

  public onNewData(newPoints: any[]) {
    const state = this.extractor.extract(newPoints);

    // Update standard line chart
    this.chart.data.labels.push(new Date().toLocaleTimeString());
    this.chart.data.datasets[0].data.push(newPoints[newPoints.length-1].price);
    this.chart.update('none');

    // Multisensory layer
    this.audio.playState(state);
    this.haptic.triggerPattern(state);
  }
}
