import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, Music, Radio } from 'lucide-react';
import { getMultiSensoryEngine } from '@/lib/MultiSensoryEngine';

export function AudioControlPanel() {
  const multiSensory = getMultiSensoryEngine();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [useWebAudio, setUseWebAudio] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleAudio = () => {
    const config = multiSensory.getConfig();
    if (isPlaying) {
      multiSensory.stopAll();
      setIsPlaying(false);
    } else {
      multiSensory.setConfig({ audioEnabled: true });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    // Update volume in audio engine
    // Note: This would need to be implemented in the audio engines
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    // Implement mute functionality
  };

  const handleToggleWebAudio = (checked: boolean) => {
    setUseWebAudio(checked);
    const config = multiSensory.getConfig();
    multiSensory.setConfig({ useWebAudio: checked });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          432 Hz Audio Control
        </CardTitle>
        <CardDescription>
          Control harmonic audio feedback and synthesis mode
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Play/Stop Button */}
        <div className="flex items-center justify-between">
          <Label htmlFor="audio-toggle">Audio Playback</Label>
          <Button
            id="audio-toggle"
            variant={isPlaying ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleAudio}
          >
            {isPlaying ? 'Stop' : 'Play'} Audio
          </Button>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="volume-slider" className="flex items-center gap-2">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              Volume
            </Label>
            <span className="text-sm text-muted-foreground">{volume}%</span>
          </div>
          <Slider
            id="volume-slider"
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            disabled={isMuted}
            className="w-full"
          />
        </div>

        {/* Mute Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="mute-toggle" className="flex items-center gap-2">
            <VolumeX className="w-4 h-4" />
            Mute
          </Label>
          <Switch
            id="mute-toggle"
            checked={isMuted}
            onCheckedChange={handleToggleMute}
          />
        </div>

        {/* Web Audio Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="web-audio-toggle" className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Web Audio Synthesis
            </Label>
            <p className="text-xs text-muted-foreground">
              Real-time 432 Hz harmonic generation
            </p>
          </div>
          <Switch
            id="web-audio-toggle"
            checked={useWebAudio}
            onCheckedChange={handleToggleWebAudio}
          />
        </div>

        {/* Audio Mode Info */}
        <div className="p-3 bg-secondary/30 rounded-lg border border-border">
          <div className="flex items-start gap-2">
            <Radio className="w-4 h-4 mt-0.5 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {useWebAudio ? 'Web Audio API Mode' : '7-Bells Mode'}
              </p>
              <p className="text-xs text-muted-foreground">
                {useWebAudio
                  ? 'Real-time sine wave synthesis tuned to 432 Hz with 7-bell harmonic ratios mapped to market dimensions.'
                  : 'Pre-recorded bell tones with 432 Hz base frequency for coherence-based feedback.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
