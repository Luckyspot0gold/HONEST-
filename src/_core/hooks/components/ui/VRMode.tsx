import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Glasses, X } from 'lucide-react';

interface VRModeProps {
  eigenstate: {
    dimensions: {
      price: number;
      volume: number;
      momentum: number;
      sentiment: number;
      temporal: number;
      spatial: number;
    };
    coherence: number;
    decision: 'BUY' | 'SELL' | 'HOLD';
  } | null;
  onClose: () => void;
}

const GOLDEN_RATIO = 1.618;

export function VRMode({ eigenstate, onClose }: VRModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vrSupported, setVrSupported] = useState(false);
  const [vrSession, setVrSession] = useState<XRSession | null>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    blochSphere: THREE.Mesh;
    axes: THREE.Group;
    pins: THREE.Group;
    animationId: number | null;
  } | null>(null);

  useEffect(() => {
    // Check WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-vr').then((supported: boolean) => {
        setVrSupported(supported);
      });
    }

    // Initialize Three.js scene
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Create Bloch Sphere (Central Eigenstate)
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const blochSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(blochSphere);

    // Create 6D Axes
    const axes = new THREE.Group();
    const axisColors = {
      price: 0xff0000,      // Red
      volume: 0x00ff00,     // Green
      momentum: 0x0000ff,   // Blue
      sentiment: 0xffff00,  // Yellow
      temporal: 0xff00ff,   // Magenta
      spatial: 0x00ffff     // Cyan
    };

    Object.entries(axisColors).forEach(([name, color], index) => {
      const angle = (index / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 2;
      const y = Math.sin(angle) * 2;
      
      const axisMaterial = new THREE.LineBasicMaterial({ color });
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, 0)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, axisMaterial);
      axes.add(line);

      // Add label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
      context.font = 'Bold 32px Arial';
      context.fillText(name.toUpperCase(), 10, 40);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x * 1.3, y * 1.3, 0);
      sprite.scale.set(0.5, 0.125, 1);
      axes.add(sprite);
    });
    scene.add(axes);

    // Create pins group
    const pins = new THREE.Group();
    scene.add(pins);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Store scene reference
    sceneRef.current = {
      scene,
      camera,
      renderer,
      blochSphere,
      axes,
      pins,
      animationId: null
    };

    // Animation loop
    const animate = () => {
      if (!sceneRef.current) return;
      
      sceneRef.current.animationId = requestAnimationFrame(animate);
      
      // Rotate sphere for immersion
      sceneRef.current.blochSphere.rotation.y += 0.005;
      sceneRef.current.axes.rotation.y += 0.002;
      
      sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !sceneRef.current) return;
      
      sceneRef.current.camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      sceneRef.current.camera.updateProjectionMatrix();
      sceneRef.current.renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      if (sceneRef.current?.renderer) {
        sceneRef.current.renderer.dispose();
        containerRef.current?.removeChild(sceneRef.current.renderer.domElement);
      }
    };
  }, []);

  // Update visualization when eigenstate changes
  useEffect(() => {
    if (!eigenstate || !sceneRef.current) return;

    const { dimensions, coherence, decision } = eigenstate;

    // Update sphere color based on decision
    const sphereColor = decision === 'BUY' ? 0x00ff00 : decision === 'SELL' ? 0xff0000 : 0xffff00;
    (sceneRef.current.blochSphere.material as THREE.MeshBasicMaterial).color.setHex(sphereColor);

    // Update sphere scale based on coherence
    const scale = 1 + coherence * 0.5;
    sceneRef.current.blochSphere.scale.set(scale, scale, scale);

    // Clear existing pins
    sceneRef.current.pins.clear();

    // Add pins for each dimension
    Object.entries(dimensions).forEach(([name, value], index) => {
      const angle = (index / 6) * Math.PI * 2;
      const radius = 1 + Math.abs(value) * 0.5;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      const pinGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const pinColor = value > 0 ? 0x00ff00 : 0xff0000;
      const pinMaterial = new THREE.MeshBasicMaterial({ color: pinColor });
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(x, y, 0);
      pin.userData = { dimension: name, value };
      sceneRef.current!.pins.add(pin);
    });
  }, [eigenstate]);

  const enterVR = async () => {
    if (!sceneRef.current || !vrSupported) return;

    try {
      const session = await (navigator as any).xr.requestSession('immersive-vr');
      setVrSession(session);
      
      await sceneRef.current.renderer.xr.setSession(session);
      
      session.addEventListener('end', () => {
        setVrSession(null);
      });
    } catch (error) {
      console.error('Failed to enter VR:', error);
    }
  };

  const exitVR = () => {
    if (vrSession) {
      vrSession.end();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        <Card className="bg-black/80 border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Glasses className="w-5 h-5" />
              VR Mode - 6D Eigenstate Visualization
            </CardTitle>
            <CardDescription className="text-gray-400">
              Immersive Bloch sphere with golden ratio markers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {eigenstate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coherence:</span>
                    <span className="text-green-400 font-mono">
                      {(eigenstate.coherence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Decision:</span>
                    <span className={`font-bold ${
                      eigenstate.decision === 'BUY' ? 'text-green-400' :
                      eigenstate.decision === 'SELL' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {eigenstate.decision}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          {vrSupported && !vrSession && (
            <Button onClick={enterVR} variant="default" className="bg-green-600 hover:bg-green-700">
              <Glasses className="w-4 h-4 mr-2" />
              Enter VR
            </Button>
          )}
          {vrSession && (
            <Button onClick={exitVR} variant="destructive">
              Exit VR
            </Button>
          )}
          <Button onClick={onClose} variant="outline" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-full" />

      {!vrSupported && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Card className="bg-yellow-900/80 border-yellow-500/30">
            <CardContent className="pt-4">
              <p className="text-yellow-200 text-sm">
                WebXR not supported. View in desktop mode or use a VR-capable browser.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
