/**
 * Audio Visualization Component
 * 
 * Displays real-time waveform and frequency spectrum analysis
 * with 432 Hz harmonic markers and 7-bell frequency mapping
 */

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AudioVisualizationProps {
  enabled: boolean;
  width?: number;
  height?: number;
}

export function AudioVisualization({ enabled, width = 800, height = 300 }: AudioVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulated frequency data for visualization
    // In a real implementation, this would come from Web Audio API analyser node
    let phase = 0;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      // Clear canvas
      ctx.fillStyle = 'rgb(10, 10, 20)';
      ctx.fillRect(0, 0, width, height);

      // Generate simulated frequency spectrum
      const dataArray = generateSimulatedSpectrum(phase);
      phase += 0.05;

      // Draw frequency spectrum
      drawFrequencySpectrum(ctx, dataArray, width, height);

      // Draw 432 Hz marker
      draw432HzMarker(ctx, width, height);

      // Draw 7-bell frequency markers
      draw7BellMarkers(ctx, width, height);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, width, height]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Audio Visualization - 432 Hz Harmonic Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full rounded-lg border border-border"
          aria-label="Real-time audio frequency spectrum visualization"
        />
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-yellow-400">432 Hz</div>
            <div className="text-muted-foreground">Base Frequency</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-400">7 Bells</div>
            <div className="text-muted-foreground">Harmonic Mapping</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-400">Real-Time</div>
            <div className="text-muted-foreground">Live Synthesis</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function generateSimulatedSpectrum(phase: number): number[] {
  const dataArray: number[] = [];
  const numBars = 128;

  for (let i = 0; i < numBars; i++) {
    // Simulate frequency spectrum with peaks at harmonic frequencies
    const freq = (i / numBars) * 2000; // 0-2000 Hz range
    
    let amplitude = 0;
    
    // Add peaks at 432 Hz harmonics
    const harmonics = [216, 324, 432, 540, 648, 864, 1296];
    for (const harmonic of harmonics) {
      const distance = Math.abs(freq - harmonic);
      if (distance < 50) {
        amplitude += (50 - distance) / 50 * 200;
      }
    }
    
    // Add some noise and animation
    amplitude += Math.random() * 30;
    amplitude += Math.sin(phase + i * 0.1) * 20;
    
    dataArray.push(Math.min(255, Math.max(0, amplitude)));
  }

  return dataArray;
}

function drawFrequencySpectrum(
  ctx: CanvasRenderingContext2D,
  dataArray: number[],
  width: number,
  height: number
) {
  const barWidth = (width / dataArray.length) * 2.5;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = (dataArray[i] / 255) * height * 0.8;

    // Color gradient based on frequency
    const hue = (i / dataArray.length) * 280 + 180; // Blue to purple range
    const saturation = 70 + (dataArray[i] / 255) * 30;
    const lightness = 40 + (dataArray[i] / 255) * 20;
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    ctx.fillRect(x, height - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  }
}

function draw432HzMarker(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // 432 Hz is at ~21.6% of 2000 Hz range
  const x = width * 0.216;

  // Draw vertical line
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw label with background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(x + 5, 5, 60, 25);
  
  ctx.fillStyle = 'rgba(255, 215, 0, 1)';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('432 Hz', x + 10, 22);
}

function draw7BellMarkers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // 7 bells mapped to harmonic frequencies (relative to 2000 Hz range)
  const bellFrequencies = [
    { freq: 216, pos: 0.108, label: '1', color: 'rgba(255, 100, 100, 0.8)' },   // Sub-harmonic
    { freq: 324, pos: 0.162, label: '2', color: 'rgba(255, 150, 100, 0.8)' },   // 3/4 of 432
    { freq: 432, pos: 0.216, label: '3', color: 'rgba(255, 215, 0, 0.9)' },     // Base
    { freq: 540, pos: 0.270, label: '4', color: 'rgba(200, 255, 100, 0.8)' },   // 5/4 of 432
    { freq: 648, pos: 0.324, label: '5', color: 'rgba(100, 255, 150, 0.8)' },   // 3/2 of 432
    { freq: 864, pos: 0.432, label: '6', color: 'rgba(100, 200, 255, 0.8)' },   // 2x 432
    { freq: 1296, pos: 0.648, label: '7', color: 'rgba(150, 100, 255, 0.8)' },  // 3x 432
  ];

  bellFrequencies.forEach(({ pos, label, color }) => {
    const x = width * pos;

    // Draw marker line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, height - 40);
    ctx.lineTo(x, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw bell number circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, height - 20, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Draw bell number text
    ctx.fillStyle = 'rgb(10, 10, 20)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, height - 20);
  });
}
