/**
 * Chaos Mode Control Panel
 * 
 * User interface for controlling chaos mode intensity and emergency stop
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Zap, Power } from 'lucide-react';
import { useChaosMode } from '@/contexts/ChaosModeContext';
import { getMultiSensoryEngine } from '@/lib/MultiSensoryEngine';

export function ChaosModeControl() {
  const { chaosMode, toggleChaosMode, setIntensity, emergencyStop } = useChaosMode();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (chaosMode.enabled && chaosMode.intensity >= 4) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [chaosMode.enabled, chaosMode.intensity]);

  const handleToggle = () => {
    if (!chaosMode.enabled) {
      // Warn user before enabling
      const confirmed = window.confirm(
        'Chaos Mode will dramatically intensify all sensory feedback. ' +
        'This includes increased particle effects, audio distortion, and haptic intensity. ' +
        'Continue?'
      );
      if (!confirmed) return;
    }
    
    toggleChaosMode();
  };

  const handleIntensityChange = (value: number[]) => {
    setIntensity(value[0]);
    
    // Update multi-sensory engine with new intensity
    const multiSensory = getMultiSensoryEngine();
    multiSensory.setConfig({
      hapticIntensity: chaosMode.hapticIntensity
    });
  };

  const handleEmergencyStop = () => {
    emergencyStop();
    
    // Stop all multi-sensory feedback
    const multiSensory = getMultiSensoryEngine();
    multiSensory.emergencyStop();
  };

  return (
    <Card className={`w-full ${chaosMode.enabled ? 'border-red-500 border-2' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className={`h-5 w-5 ${chaosMode.enabled ? 'text-red-500 animate-pulse' : ''}`} />
          Chaos Mode
        </CardTitle>
        <CardDescription>
          Dramatically intensify all sensory feedback
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="chaos-toggle" className="flex items-center gap-2">
            <Power className="h-4 w-4" />
            Enable Chaos Mode
          </Label>
          <Switch
            id="chaos-toggle"
            checked={chaosMode.enabled}
            onCheckedChange={handleToggle}
            aria-label="Toggle chaos mode"
          />
        </div>

        {/* Intensity Slider */}
        {chaosMode.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="intensity-slider">
                Intensity: {chaosMode.intensity.toFixed(1)}x
              </Label>
              <Slider
                id="intensity-slider"
                min={1}
                max={5}
                step={0.5}
                value={[chaosMode.intensity]}
                onValueChange={handleIntensityChange}
                className="w-full"
                aria-label="Chaos mode intensity"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Intense</span>
                <span>Extreme</span>
                <span className="text-red-500">MAX</span>
              </div>
            </div>

            {/* Effect Multipliers */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold">Particles</div>
                <div className="text-muted-foreground">
                  {chaosMode.particleMultiplier.toFixed(1)}x
                </div>
              </div>
              <div>
                <div className="font-semibold">Audio Distortion</div>
                <div className="text-muted-foreground">
                  {(chaosMode.audioDistortion * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="font-semibold">Haptic Intensity</div>
                <div className="text-muted-foreground">
                  {(chaosMode.hapticIntensity * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="font-semibold">Screen Shake</div>
                <div className="text-muted-foreground">
                  {chaosMode.screenShake ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>

            {/* Warning */}
            {showWarning && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-red-500">High Intensity Warning</div>
                  <div className="text-muted-foreground">
                    Extreme sensory feedback may cause discomfort. Use emergency stop if needed.
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Stop Button */}
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={handleEmergencyStop}
              aria-label="Emergency stop all chaos mode effects"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              EMERGENCY STOP
            </Button>
          </>
        )}

        {/* Info when disabled */}
        {!chaosMode.enabled && (
          <div className="text-sm text-muted-foreground">
            Chaos mode amplifies all sensory feedback including particle effects, audio synthesis, 
            and haptic vibrations. Enable to experience intensified market data visualization.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
