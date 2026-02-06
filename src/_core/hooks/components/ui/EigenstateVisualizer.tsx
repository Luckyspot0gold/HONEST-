import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MarketEigenstate {
  asset: string;
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

interface EigenstateVisualizerProps {
  eigenstate: MarketEigenstate;
  width?: number;
  height?: number;
}

export function EigenstateVisualizer({ 
  eigenstate, 
  width = 600, 
  height = 600 
}: EigenstateVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Coherence color mapping
    const getCoherenceColor = (coherence: number) => {
      if (coherence > 0.8) return 0x00ff00; // Green
      if (coherence > 0.5) return 0x7fff00; // Yellow-green
      if (coherence > 0.0) return 0xffd700; // Gold
      if (coherence > -0.5) return 0xff8c00; // Orange
      return 0xff0000; // Red
    };

    const coherenceColor = getCoherenceColor(eigenstate.coherence);

    // Center sphere (represents the asset)
    const centerGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const centerMaterial = new THREE.MeshPhongMaterial({
      color: coherenceColor,
      emissive: coherenceColor,
      emissiveIntensity: 0.5,
      shininess: 100
    });
    const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
    scene.add(centerSphere);

    // 6 Dimension vectors
    const dimensions = [
      { name: 'Price', value: eigenstate.dimensions.price, color: 0xff0000, position: new THREE.Vector3(1, 0, 0) },
      { name: 'Volume', value: eigenstate.dimensions.volume, color: 0x00ff00, position: new THREE.Vector3(0, 1, 0) },
      { name: 'Momentum', value: eigenstate.dimensions.momentum, color: 0x0000ff, position: new THREE.Vector3(0, 0, 1) },
      { name: 'Sentiment', value: eigenstate.dimensions.sentiment, color: 0xffff00, position: new THREE.Vector3(-1, 0, 0) },
      { name: 'Temporal', value: eigenstate.dimensions.temporal, color: 0xff00ff, position: new THREE.Vector3(0, -1, 0) },
      { name: 'Spatial', value: eigenstate.dimensions.spatial, color: 0x00ffff, position: new THREE.Vector3(0, 0, -1) }
    ];

    dimensions.forEach((dim) => {
      const scaledPosition = dim.position.clone().multiplyScalar(Math.abs(dim.value) * 2);
      
      // Create line
      const points = [new THREE.Vector3(0, 0, 0), scaledPosition];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: dim.color, linewidth: 2 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);

      // Create endpoint sphere
      const endpointGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const endpointMaterial = new THREE.MeshBasicMaterial({ color: dim.color });
      const endpoint = new THREE.Mesh(endpointGeometry, endpointMaterial);
      endpoint.position.copy(scaledPosition);
      scene.add(endpoint);
    });

    // Coherence ring
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.05, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: coherenceColor,
      transparent: true,
      opacity: Math.abs(eigenstate.coherence)
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Animation loop
    const animateScene = () => {
      // Rotate the entire scene
      scene.rotation.y += 0.005;
      scene.rotation.x += 0.002;

      // Pulse the center sphere
      const scale = 1 + Math.abs(eigenstate.coherence) * 0.2 * Math.sin(Date.now() * 0.003);
      centerSphere.scale.set(scale, scale, scale);

      // Rotate the coherence ring
      ring.rotation.z += 0.01;

      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animateScene);
    };

    animateScene();

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      renderer.dispose();
    };
  }, [eigenstate, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}
      aria-label={`6D Eigenstate visualization for ${eigenstate.asset} with coherence score ${eigenstate.coherence.toFixed(2)}`}
    />
  );
}
