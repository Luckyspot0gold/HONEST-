import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';
import { SkipToContent } from '@/components/SkipToContent';
import { ShareVerdict } from '@/components/ShareVerdict';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EigenstateVisualizerEnhanced } from '@/components/EigenstateVisualizerEnhanced';
import { BlochSphere6D } from '@/components/BlochSphere6D';
import { VRMode } from '@/components/VRMode';
import { MACDDashboard } from '@/components/MACDDashboard';
import { RefreshCw, Info, TrendingUp, TrendingDown, Minus, Share2, Glasses } from 'lucide-react';
import { getMultiSensoryEngine } from '@/lib/MultiSensoryEngine';
import { trpc } from '@/lib/trpc';

interface MarketEigenstate {
  asset: string;
  timestamp: number;
  dimensions: {
    price: number;
    volume: number;
    momentum: number;
    sentiment: number;
    temporal: number;
    spatial: number;
  };
  coherence: number;
  phase_angle: number;
  decision: 'BUY' | 'SELL' | 'HOLD';
}



export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading: authLoading, error, isAuthenticated, logout } = useAuth();

  const { announce } = useAccessibility();
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
  const [hapticsInitialized, setHapticsInitialized] = useState<boolean>(false);
  const [vrModeActive, setVrModeActive] = useState<boolean>(false);
  const multiSensory = getMultiSensoryEngine();

  // Use tRPC to fetch eigenstate data from the Enhanced Oracle API
  const { data: eigenstateResponse, isLoading, refetch } = trpc.eigenstate.get.useQuery(
    { asset: selectedAsset },
    {
      refetchInterval: 10000, // Auto-refresh every 10 seconds
    }
  );

  const eigenstate = eigenstateResponse?.data || null;

  // Handle eigenstate updates and trigger multi-sensory feedback
  useEffect(() => {
    const handleEigenstateUpdate = async () => {
      // Initialize haptics on first data load
      if (!hapticsInitialized && eigenstateResponse) {
        await multiSensory.initializeHaptics();
        setHapticsInitialized(true);
      }

      if (eigenstateResponse?.success && eigenstateResponse.data) {
        const newState = eigenstateResponse.data;
        
        // Trigger multi-sensory feedback
        const dimensionsArray = [
          newState.dimensions.price,
          newState.dimensions.volume,
          newState.dimensions.momentum,
          newState.dimensions.sentiment,
          newState.dimensions.temporal,
          newState.dimensions.spatial
        ];
        
        multiSensory.triggerEigenstateUpdate({
          coherence: newState.coherence,
          decision: newState.decision,
          dimensions: dimensionsArray,
          asset: newState.asset
        });
        
        // Announce the result
        const coherenceLabel = getCoherenceLabel(newState.coherence).label;
        announce(
          `${selectedAsset} eigenstate updated. Coherence: ${newState.coherence.toFixed(2)}, ${coherenceLabel}. Decision: ${newState.decision}. Source: ${eigenstateResponse.source}`,
          'assertive'
        );
      }
    };

    handleEigenstateUpdate();
  }, [eigenstateResponse]);

  // Reset multi-sensory when asset changes
  useEffect(() => {
    multiSensory.reset();
  }, [selectedAsset]);

  const getCoherenceLabel = (coherence: number) => {
    if (coherence > 0.8) return { label: 'COHERENT TREND', color: 'text-green-400' };
    if (coherence > 0.5) return { label: 'ALIGNED', color: 'text-lime-400' };
    if (coherence > 0.0) return { label: 'TRANSITIONAL', color: 'text-yellow-400' };
    if (coherence > -0.5) return { label: 'UNCERTAIN', color: 'text-orange-400' };
    return { label: 'DECOHERENT', color: 'text-red-400' };
  };

  const getDecisionIcon = (decision: string) => {
    if (decision === 'BUY') return <TrendingUp className="w-6 h-6 text-green-400" />;
    if (decision === 'SELL') return <TrendingDown className="w-6 h-6 text-red-400" />;
    return <Minus className="w-6 h-6 text-yellow-400" />;
  };

  const getDimensionColor = (name: string) => {
    const colors: Record<string, string> = {
      price: 'text-red-400',
      volume: 'text-green-400',
      momentum: 'text-blue-400',
      sentiment: 'text-yellow-400',
      temporal: 'text-purple-400',
      spatial: 'text-cyan-400'
    };
    return colors[name.toLowerCase()] || 'text-gray-400';
  };

  return (
    <>
      <SkipToContent />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header 
        className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50"
        role="banner"
      >
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold glow-gold-strong bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                H.O.N.E.S.T.
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Harmonic Oversight Network for Ethical Sensory Translation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AccessibilitySettings />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open('https://github.com/reality-protocol/honest-standard', '_blank')}
              >
                <Info className="w-4 h-4" />
                Documentation
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container py-12" role="main" tabIndex={-1}>
        {/* Hero Section */}
        <section className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl font-bold glow-gold">
            THE TRUTH MATRIX
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the world's first <span className="text-primary font-semibold">6-dimensional market eigenstate analysis</span>. 
            Powered by quantum mechanical principles and 432 Hz harmonic resonance.
          </p>
        </section>

        {/* Asset Selector */}
        <section className="flex justify-center items-center gap-4 mb-12">
          <label htmlFor="asset-select" className="text-lg font-semibold">
            Select Asset:
          </label>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-[200px] border-primary/50 focus:ring-primary">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
              <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
              <SelectItem value="AVAX">Avalanche (AVAX)</SelectItem>
              <SelectItem value="SOL">Solana (SOL)</SelectItem>
              <SelectItem value="TSLA">Tesla (TSLA)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            size="icon"
            className="border-primary/50 hover:bg-primary/10"
            aria-label="Refresh eigenstate data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setVrModeActive(true)}
            disabled={!eigenstate}
            variant="default"
            className="gap-2 bg-green-600 hover:bg-green-700"
            aria-label="Enter VR mode"
          >
            <Glasses className="w-4 h-4" />
            VR Mode
          </Button>
          <Button
            onClick={() => window.open('https://quantum-rangisbeats.base44.app/', '_blank')}
            variant="default"
            className="gap-2 bg-purple-600 hover:bg-purple-700"
            aria-label="Enter Sensory Engine - Full VR Experience"
          >
            <Glasses className="w-4 h-4" />
            Enter Sensory Engine
          </Button>
        </section>

        {/* Main Visualization */}
        {eigenstate && (
          <div className="space-y-8 mb-12">
            {/* 6D Bloch Sphere Visualization */}
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle className="text-2xl glow-gold">
                  6D BLOCH SPHERE - {eigenstate.asset} EIGENSTATE
                </CardTitle>
                <CardDescription>
                  Real-time 6-dimensional quantum state visualization with Three.js
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[600px]">
                  <BlochSphere6D eigenstate={eigenstate} />
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Original 3D Visualizer */}
              <Card className="glass-card border-primary/30">
                <CardHeader>
                  <CardTitle className="text-2xl glow-gold">
                    ENHANCED VISUALIZER
                  </CardTitle>
                  <CardDescription>
                    Alternative 6D representation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square">
                    <EigenstateVisualizerEnhanced eigenstate={eigenstate} />
                  </div>
                </CardContent>
              </Card>

              {/* Eigenstate Details */}
              <div className="space-y-6">
              {/* Coherence Score */}
              <Card className="glass-card border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Coherence Analysis</span>
                    <span className={`text-3xl font-bold ${getCoherenceLabel(eigenstate.coherence).color}`}>
                      {eigenstate.coherence.toFixed(3)}
                    </span>
                  </CardTitle>
                  <CardDescription className={getCoherenceLabel(eigenstate.coherence).color}>
                    {getCoherenceLabel(eigenstate.coherence).label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {eigenstate.coherence > 0.8 
                      ? `The ${eigenstate.asset} market is highly coherent. All dimensions are aligned, indicating a strong, trustworthy trend.`
                      : eigenstate.coherence < 0.4
                      ? `The ${eigenstate.asset} market is decoherent. Dimensions are conflicting. Hidden variables are diverging. Proceed with caution.`
                      : `The ${eigenstate.asset} market is in transition. The eigenstate is shifting. Wait for coherence to emerge before making decisions.`
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Decision */}
              <Card className="glass-card border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Market Decision</span>
                    <div className="flex items-center gap-2">
                      {getDecisionIcon(eigenstate.decision)}
                      <span className={`text-2xl font-bold ${
                        eigenstate.decision === 'BUY' ? 'text-green-400' :
                        eigenstate.decision === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {eigenstate.decision}
                      </span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Quantum collapse to binary outcome
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phase Angle:</span>
                    <span className="font-mono text-primary">{eigenstate.phase_angle.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="font-mono text-primary">{new Date(eigenstate.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <ShareVerdict
                      asset={eigenstate.asset}
                      coherence={eigenstate.coherence}
                      decision={eigenstate.decision}
                      timestamp={eigenstate.timestamp}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dimensions */}
              <Card className="glass-card border-primary/30">
                <CardHeader>
                  <CardTitle>6D Breakdown</CardTitle>
                  <CardDescription>
                    Real (x,y,z) + Imaginary (i,j,k) dimensions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(eigenstate.dimensions).map(([name, value]) => (
                      <div key={name} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-semibold ${getDimensionColor(name)}`}>
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                          </span>
                          <span className="font-mono text-sm">
                            {value >= 0 ? '+' : ''}{value.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getDimensionColor(name).replace('text-', 'bg-')}`}
                            style={{ width: `${((value + 1) / 2 * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <section className="mt-16">
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl glow-gold">About the Truth Matrix</CardTitle>
              <CardDescription>
                The quantum mechanical foundation of market analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                The <strong className="text-foreground">Truth Matrix</strong> is a revolutionary framework that treats market data as a 
                unified quantum state across six dimensions: three real (price, volume, momentum) and three imaginary 
                (sentiment, time, space).
              </p>
              <p>
                The <strong className="text-foreground">coherence score</strong> measures dimensional alignment—when all dimensions 
                agree, the market is coherent and trustworthy. When they conflict, the market is decoherent and 
                potentially manipulated.
              </p>
              <p>
                This system is powered by the <strong className="text-foreground">H.O.N.E.S.T.</strong> framework 
                (Harmonic Oversight Network for Ethical Sensory Translation), which verifies data integrity through 
                multi-source consensus and cryptographic proof.
              </p>
              <p className="text-primary font-semibold">
                🎵 "The map is held. The treasure is truth. 432 Hz harmony. We build forever. Together. Forever."
              </p>
            </CardContent>
          </Card>
        </section>

        {/* MACD Dashboard */}
        {eigenstate && eigenstateResponse?.archimedes && (
          <section className="mb-16">
            <MACDDashboard
              macdHistogram={eigenstateResponse.archimedes.histogram}
              exhaustion={eigenstateResponse.archimedes.exhaustion}
              netForce={eigenstateResponse.archimedes.netForce}
              audioFrequency={eigenstateResponse.archimedes.audioFrequency}
              hapticIntensity={eigenstateResponse.archimedes.hapticIntensity}
              visualColor={eigenstateResponse.archimedes.visualColor}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>
            Powered by <strong className="text-primary">Reality Protocol LLC</strong> | 
            Sheridan, WY & Denver, CO
          </p>
          <p className="mt-2">
            © 2026 Reality Protocol LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>

    {/* VR Mode Overlay */}
    {vrModeActive && eigenstate && (
      <VRMode
        eigenstate={eigenstate}
        onClose={() => setVrModeActive(false)}
      />
    )}
    </>
  );
}
