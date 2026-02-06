import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Eye, Volume2, Type, Palette, Bell, Vibrate, Mic } from 'lucide-react';
import { getMultiSensoryEngine } from '@/lib/MultiSensoryEngine';
import { Slider } from '@/components/ui/slider';

export function AccessibilitySettings() {
  const { settings, updateSettings } = useAccessibility();
  const multiSensory = getMultiSensoryEngine();
  const engines = multiSensory.getEngines();
  
  const [audioVolume, setAudioVolume] = useState(engines.audio.getVolume() * 100);
  const [hapticIntensity, setHapticIntensity] = useState(engines.haptic.getConfig().baseIntensity * 100);
  const [voiceRate, setVoiceRate] = useState(engines.voice.getConfig().rate);
  const [voicePitch, setVoicePitch] = useState(engines.voice.getConfig().pitch);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-primary/50 hover:bg-primary/10"
          aria-label="Open accessibility settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Accessibility Settings
          </DialogTitle>
          <DialogDescription>
            Customize your experience to match your accessibility needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Visual Preferences */}
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Visual Preferences
              </CardTitle>
              <CardDescription>
                Adjust visual display for better readability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast" className="text-base">
                    High Contrast Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Increase color contrast for better visibility
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
                  aria-label="Toggle high contrast mode"
                />
              </div>

              {/* Color Blind Mode */}
              <div className="space-y-2">
                <Label htmlFor="color-blind-mode" className="text-base flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color Blind Mode
                </Label>
                <Select
                  value={settings.colorBlindMode}
                  onValueChange={(value) => updateSettings({ colorBlindMode: value as any })}
                >
                  <SelectTrigger id="color-blind-mode" className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia (Green-Blind)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia (Blue-Blind)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Adjust colors for different types of color vision deficiency
                </p>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label htmlFor="font-size" className="text-base flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Font Size
                </Label>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value) => updateSettings({ fontSize: value as any })}
                >
                  <SelectTrigger id="font-size" className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal (100%)</SelectItem>
                    <SelectItem value="large">Large (125%)</SelectItem>
                    <SelectItem value="extra-large">Extra Large (150%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Increase text size for better readability
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Motion Preferences */}
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Motion Preferences</CardTitle>
              <CardDescription>
                Control animations and movement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion" className="text-base">
                    Reduced Motion
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                  aria-label="Toggle reduced motion"
                />
              </div>
            </CardContent>
          </Card>

          {/* Screen Reader */}
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                Screen Reader
              </CardTitle>
              <CardDescription>
                Control announcements for assistive technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="announce-updates" className="text-base">
                    Announce Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Announce real-time changes to screen readers
                  </p>
                </div>
                <Switch
                  id="announce-updates"
                  checked={settings.announceUpdates}
                  onCheckedChange={(checked) => updateSettings({ announceUpdates: checked })}
                  aria-label="Toggle update announcements"
                />
              </div>
            </CardContent>
          </Card>

          {/* Multi-Sensory Feedback (7-Bells System) */}
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Multi-Sensory Feedback
              </CardTitle>
              <CardDescription>
                7-Bells of McCrea Market Metrics - Audio, Haptic, and Voice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio-enabled" className="text-base flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    432 Hz Harmonic Audio
                  </Label>
                  <Switch
                    id="audio-enabled"
                    checked={!engines.audio.isMutedStatus()}
                    onCheckedChange={() => engines.audio.toggleMute()}
                    aria-label="Toggle audio bells"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audio-volume" className="text-sm text-muted-foreground">
                    Volume: {Math.round(audioVolume)}%
                  </Label>
                  <Slider
                    id="audio-volume"
                    value={[audioVolume]}
                    onValueChange={([value]) => {
                      setAudioVolume(value);
                      engines.audio.setVolume(value / 100);
                    }}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                    aria-label="Audio volume"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => engines.audio.testAllBells()}
                  className="w-full"
                >
                  Test Audio Bells
                </Button>
              </div>

              {/* Haptic Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="haptic-enabled" className="text-base flex items-center gap-2">
                    <Vibrate className="w-4 h-4" />
                    Haptic Feedback
                  </Label>
                  <Switch
                    id="haptic-enabled"
                    checked={multiSensory.getConfig().hapticEnabled}
                    onCheckedChange={(checked) => multiSensory.setConfig({ hapticEnabled: checked })}
                    aria-label="Toggle haptic feedback"
                    disabled={!engines.haptic.isHapticSupported()}
                  />
                </div>
                {engines.haptic.isHapticSupported() ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="haptic-intensity" className="text-sm text-muted-foreground">
                        Intensity: {Math.round(hapticIntensity)}%
                      </Label>
                      <Slider
                        id="haptic-intensity"
                        value={[hapticIntensity]}
                        onValueChange={([value]) => {
                          setHapticIntensity(value);
                          multiSensory.setConfig({ hapticIntensity: value / 100 });
                        }}
                        min={0}
                        max={100}
                        step={10}
                        className="w-full"
                        aria-label="Haptic intensity"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        await multiSensory.initializeHaptics();
                        // Test vortex patterns with different frequencies
                        const testFreqs = [432, 540, 648, 378, 216];
                        for (const freq of testFreqs) {
                          engines.haptic.startLoop(freq, { momentum: 0.5, energy: 0.6 });
                          await new Promise(r => setTimeout(r, 1500));
                          engines.haptic.stop();
                          await new Promise(r => setTimeout(r, 300));
                        }
                      }}
                      className="w-full"
                    >
                      Test Vortex Patterns
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Haptic feedback not supported on this device
                  </p>
                )}
              </div>

              {/* Voice Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voice-enabled" className="text-base flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    AI Voice Descriptions
                  </Label>
                  <Switch
                    id="voice-enabled"
                    checked={engines.voice.isVoiceEnabled()}
                    onCheckedChange={() => engines.voice.toggleEnabled()}
                    aria-label="Toggle voice descriptions"
                    disabled={!engines.voice.isVoiceSupported()}
                  />
                </div>
                {engines.voice.isVoiceSupported() ? (
                  <>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-narrate" className="text-sm">
                        Auto-Narrate Updates
                      </Label>
                      <Switch
                        id="auto-narrate"
                        checked={engines.voice.isAutoNarrateEnabled()}
                        onCheckedChange={() => engines.voice.toggleAutoNarrate()}
                        aria-label="Toggle auto-narration"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voice-rate" className="text-sm text-muted-foreground">
                        Speech Rate: {voiceRate.toFixed(1)}x
                      </Label>
                      <Slider
                        id="voice-rate"
                        value={[voiceRate * 10]}
                        onValueChange={([value]) => {
                          const rate = value / 10;
                          setVoiceRate(rate);
                          engines.voice.setConfig({ rate });
                        }}
                        min={5}
                        max={20}
                        step={1}
                        className="w-full"
                        aria-label="Voice speech rate"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => engines.voice.testVoice()}
                      className="w-full"
                    >
                      Test Voice
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Voice synthesis not supported on this browser
                  </p>
                )}
              </div>

              {/* Test All Systems */}
              <Button
                variant="default"
                onClick={() => multiSensory.testAllSystems()}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Test All Multi-Sensory Systems
              </Button>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                updateSettings({
                  highContrast: false,
                  reducedMotion: false,
                  colorBlindMode: 'none',
                  fontSize: 'normal',
                  announceUpdates: true
                });
              }}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
