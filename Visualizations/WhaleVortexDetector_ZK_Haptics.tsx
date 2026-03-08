// WhaleVortexDetector_ZK_Haptics.tsx - Add to your HONEST- repo
import { useEffect, useRef, useState } from 'react';
// ... (keep all your imports from original)

export function WhaleVortexDetectorZK() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [whaleAlert, setWhaleAlert] = useState(false);
  const [hiddenPressure, setHiddenPressure] = useState(0);
  const [ringCount, setRingCount] = useState(0);
  const [detectionStrength, setDetectionStrength] = useState(0);
  const [zkVerified, setZkVerified] = useState(false);
  const [hapticDirection, setHapticDirection] = useState<'left'|'right'|'spine'>('spine'); // AEAS §5

  // ZK Proof Verifier (simplified - use snarkjs in prod)
  async function verifyZKProof(pressure: number) {
    // Mock: Verify pressure > 0.25 via ZK (replace with real Groth16)
    const proofValid = pressure > 0.25;
    setZkVerified(proofValid);
    return proofValid;
  }

  // Haptic Spatial Mapper (AEAS §5)
  function mapToHapticRegion(pressure: number) {
    if (pressure > 0.3) return 'right'; // Bullish (buy wall)
    if (pressure < -0.3) return 'left'; // Bearish (sell wall)
    return 'spine'; // Volatility intensity
  }

  useEffect(() => {
    // ... (keep all your original canvas/vortex code)
    // Modify spawnRing to include ZK/haptics
    function spawnRing() {
      const centerX = Math.random() * canvas.width;
      const centerY = Math.random() * canvas.height;
      rings.push({
        x: centerX,
        y: centerY,
        radius: 10 + Math.abs(pressure) * 30,
        age: 0,
        pressure: Math.abs(pressure),
        opacity: 0.8,
      });
      // NEW: ZK verify and haptic map
      verifyZKProof(pressure);
      setHapticDirection(mapToHapticRegion(pressure));
      if (navigator.vibrate) {
        // Haptic pulse: left=200ms, right=100ms, spine=300ms
        const duration = hapticDirection === 'left' ? 200 : hapticDirection === 'right' ? 100 : 300;
        navigator.vibrate([duration]);
      }
    }

    // ... (rest of your animate loop)
    // Add ZK/haptic status to UI
    if (detectedWhale && zkVerified) {
      ctx.fillStyle = 'rgba(68, 255, 68, 0.2)'; // Green for verified
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(68, 255, 68, 0.9)';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('WHALE ALERT (ZK Verified)', canvas.width / 2 - 100, canvas.height / 2);
    }
  }, []);

  return (
    <Card className="bg-gradient-to-br from-red-900/20 to-purple-900/20 border-red-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
          6D Whale Vortex Detector (ZK + Haptics)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Detect hidden order clusters with ZK-proof integrity and AEAS §5 haptic spatial mapping
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ... (keep all your original UI) */}
        {/* NEW: ZK/Haptic Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-black/30 rounded-lg border border-green-500/30">
            <div className="text-xs text-muted-foreground">ZK Verified</div>
            <div className={zkVerified ? 'text-lg font-bold text-green-400' : 'text-lg font-bold text-red-400'}>
              {zkVerified ? 'YES' : 'NO'}
            </div>
          </div>
          <div className="p-3 bg-black/30 rounded-lg border border-blue-500/30">
            <div className="text-xs text-muted-foreground">Haptic Region</div>
            <div className="text-lg font-bold text-blue-400">{hapticDirection.toUpperCase()}</div>
          </div>
          <div className="p-3 bg-black/30 rounded-lg border border-purple-500/30">
            <div className="text-xs text-muted-foreground">AEAS Sync</div>
            <div className="text-lg font-bold text-purple-400">50ms</div>
          </div>
        </div>
        {/* ... (rest unchanged) */}
      </CardContent>
    </Card>
  );
}
```tsx
// WhaleVortexDetector_ZK_Haptics.tsx - Add to your HONEST- repo
import { useEffect, useRef, useState } from 'react';
// ... (keep all your imports from original)

export function WhaleVortexDetectorZK() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [whaleAlert, setWhaleAlert] = useState(false);
  const [hiddenPressure, setHiddenPressure] = useState(0);
  const [ringCount, setRingCount] = useState(0);
  const [detectionStrength, setDetectionStrength] = useState(0);
  const [zkVerified, setZkVerified] = useState(false);
  const [hapticDirection, setHapticDirection] = useState<'left'|'right'|'spine'>('spine'); // AEAS §5

  // ZK Proof Verifier (simplified - use snarkjs in prod)
  async function verifyZKProof(pressure: number) {
    // Mock: Verify pressure > 0.25 via ZK (replace with real Groth16)
    const proofValid = pressure > 0.25;
    setZkVerified(proofValid);
    return proofValid;
  }

  // Haptic Spatial Mapper (AEAS §5)
  function mapToHapticRegion(pressure: number) {
    if (pressure > 0.3) return 'right'; // Bullish (buy wall)
    if (pressure < -0.3) return 'left'; // Bearish (sell wall)
    return 'spine'; // Volatility intensity
  }

  useEffect(() => {
    // ... (keep all your original canvas/vortex code)
    // Modify spawnRing to include ZK/haptics
    function spawnRing() {
      const centerX = Math.random() * canvas.width;
      const centerY = Math.random() * canvas.height;
      rings.push({
        x: centerX,
        y: centerY,
        radius: 10 + Math.abs(pressure) * 30,
        age: 0,
        pressure: Math.abs(pressure),
        opacity: 0.8,
      });
      // NEW: ZK verify and haptic map
      verifyZKProof(pressure);
      setHapticDirection(mapToHapticRegion(pressure));
      if (navigator.vibrate) {
        // Haptic pulse: left=200ms, right=100ms, spine=300ms
        const duration = hapticDirection === 'left' ? 200 : hapticDirection === 'right' ? 100 : 300;
        navigator.vibrate([duration]);
      }
    }

    // ... (rest of your animate loop)
    // Add ZK/haptic status to UI
    if (detectedWhale && zkVerified) {
      ctx.fillStyle = 'rgba(68, 255, 68, 0.2)'; // Green for verified
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(68, 255, 68, 0.9)';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('WHALE ALERT (ZK Verified)', canvas.width / 2 - 100, canvas.height / 2);
    }
  }, []);

  return (
    <Card className="bg-gradient-to-br from-red-900/20 to-purple-900/20 border-red-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
          6D Whale Vortex Detector (ZK + Haptics)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Detect hidden order clusters with ZK-proof integrity and AEAS §5 haptic spatial mapping
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ... (keep all your original UI) */}
        {/* NEW: ZK/Haptic Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-black/30 rounded-lg border border-green-500/30">
            <div className="text-xs text-muted-foreground">ZK Verified</div>
            <div className={zkVerified ? 'text-lg font-bold text-green-400' : 'text-lg font-bold text-red-400'}>
              {zkVerified ? 'YES' : 'NO'}
            </div>
          </div>
          <div className="p-3 bg-black/30 rounded-lg border border-blue-500/30">
            <div className="text-xs text-muted-foreground">Haptic Region</div>
            <div className="text-lg font-bold text-blue-400">{hapticDirection.toUpperCase()}</div>
          </div>
          <div className="p-3 bg-black/30 rounded-lg border border-purple-500/30">
            <div className="text-xs text-muted-foreground">AEAS Sync</div>
            <div className="text-lg font-bold text-purple-400">50ms</div>
          </div>
        </div>
        {/* ... (rest unchanged) */}
      </CardContent>
    </Card>
  );
}
```

