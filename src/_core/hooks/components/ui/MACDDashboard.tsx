import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface MACDDashboardProps {
  macdHistogram: number[];
  exhaustion: number;
  netForce: number;
  audioFrequency: number;
  hapticIntensity: number;
  visualColor: string;
}

const GOLDEN_RATIO = 1.618;

export function MACDDashboard({
  macdHistogram,
  exhaustion,
  netForce,
  audioFrequency,
  hapticIntensity,
  visualColor
}: MACDDashboardProps) {
  // Prepare data for Recharts
  const chartData = useMemo(() => {
    return macdHistogram.map((value, index) => ({
      index,
      value,
      isPositive: value > 0
    }));
  }, [macdHistogram]);

  // Calculate golden ratio bisection point
  const goldenBisectionIndex = useMemo(() => {
    return Math.floor(macdHistogram.length / GOLDEN_RATIO);
  }, [macdHistogram.length]);

  // Calculate positive and negative areas
  const areas = useMemo(() => {
    const positiveArea = macdHistogram.filter(v => v > 0).reduce((sum, v) => sum + v, 0);
    const negativeArea = Math.abs(macdHistogram.filter(v => v < 0).reduce((sum, v) => sum + v, 0));
    const totalArea = positiveArea + negativeArea;
    
    return { positiveArea, negativeArea, totalArea };
  }, [macdHistogram]);

  // Custom tooltip for MACD histogram
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-2 rounded shadow-lg">
          <p className="text-sm font-semibold">Index: {data.index}</p>
          <p className={`text-sm ${data.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            Value: {data.value.toFixed(4)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* MACD Histogram Chart */}
      <Card>
        <CardHeader>
          <CardTitle>MACD Histogram - Archimedes Exhaustion Analysis</CardTitle>
          <CardDescription>
            Positive (green) and negative (red) areas with golden ratio bisection at index {goldenBisectionIndex}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="index" 
                label={{ value: 'Time Period', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'MACD Value', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Golden ratio bisection line */}
              <ReferenceLine 
                x={goldenBisectionIndex} 
                stroke="#FFD700" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: 'φ (1.618)', position: 'top', fill: '#FFD700' }}
              />
              
              {/* Zero line */}
              <ReferenceLine 
                y={0} 
                stroke="#666" 
                strokeWidth={1}
              />
              
              <Bar dataKey="value" name="MACD Histogram">
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isPositive ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Archimedes Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Exhaustion Meter */}
        <Card>
          <CardHeader>
            <CardTitle>Exhaustion</CardTitle>
            <CardDescription>Archimedes area cancellation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{(exhaustion * 100).toFixed(1)}%</span>
                <span className={`text-sm ${exhaustion > 0.7 ? 'text-red-500' : exhaustion > 0.4 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {exhaustion > 0.7 ? 'High' : exhaustion > 0.4 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    exhaustion > 0.7 ? 'bg-red-500' : exhaustion > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${exhaustion * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                <p>Positive Area: {areas.positiveArea.toFixed(2)}</p>
                <p>Negative Area: {areas.negativeArea.toFixed(2)}</p>
                <p>Total Area: {areas.totalArea.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Force Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Net Force</CardTitle>
            <CardDescription>Market momentum direction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{netForce.toFixed(2)}</span>
                <span className="text-2xl">
                  {netForce > 0 ? '↗️' : netForce < 0 ? '↘️' : '→'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {netForce > 0 ? 'Bullish momentum' : netForce < 0 ? 'Bearish momentum' : 'Neutral'}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    netForce > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min(Math.abs(netForce) * 10, 100)}%`,
                    marginLeft: netForce < 0 ? 'auto' : '0'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sensory Mapping */}
        <Card>
          <CardHeader>
            <CardTitle>Sensory Translation</CardTitle>
            <CardDescription>H.O.N.E.S.T. multi-sensory output</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Audio Frequency</p>
                <p className="text-lg font-semibold">{audioFrequency.toFixed(2)} Hz</p>
                <p className="text-xs text-muted-foreground">
                  {Math.abs(audioFrequency - 432) < 10 ? '(Pure 432 Hz)' : `(${audioFrequency > 432 ? '+' : ''}${(audioFrequency - 432).toFixed(1)} Hz from base)`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Haptic Intensity</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${hapticIntensity * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">{(hapticIntensity * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visual Color</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border border-border"
                    style={{ backgroundColor: visualColor }}
                  />
                  <span className="text-sm font-mono">{visualColor}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Golden Ratio Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Archimedes Method of Exhaustion</CardTitle>
          <CardDescription>Ancient geometry meets modern market analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The golden ratio (φ = 1.618) bisects the MACD histogram at index {goldenBisectionIndex}, 
            dividing the data into harmonically proportioned segments. The exhaustion metric measures 
            how much positive and negative areas cancel each other out, revealing market equilibrium states. 
            This ancient mathematical principle, used by Archimedes to calculate areas and volumes, 
            now translates market momentum into multi-sensory truth.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
