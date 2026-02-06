import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

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

export function EigenstateVisualizerEnhanced({ 
  eigenstate, 
  width = 600, 
  height = 600 
}: EigenstateVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const ringsRef = useRef<THREE.Group | null>(null);
  const dimensionSpheres = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.05);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 6;
    camera.position.y = 1;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    // Post-processing for bloom glow
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 2, 100);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Coherence color mapping
    const getCoherenceColor = (coherence: number) => {
      if (coherence > 0.8) return new THREE.Color(0x00ff00); // Green
      if (coherence > 0.5) return new THREE.Color(0x7fff00); // Yellow-green
      if (coherence > 0.0) return new THREE.Color(0xffd700); // Gold
      if (coherence > -0.5) return new THREE.Color(0xff8c00); // Orange
      return new THREE.Color(0xff0000); // Red
    };

    const coherenceColor = getCoherenceColor(eigenstate.coherence);

    // Center sphere (represents the asset) with pulsing glow
    const centerGeometry = new THREE.SphereGeometry(0.4, 64, 64);
    const centerMaterial = new THREE.MeshPhongMaterial({
      color: coherenceColor,
      emissive: coherenceColor,
      emissiveIntensity: 0.8,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
    scene.add(centerSphere);

    // Particle system for dimension interactions
    const particleCount = 1000;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i3 + 2] = radius * Math.cos(phi);

      particleColors[i3] = coherenceColor.r;
      particleColors[i3 + 1] = coherenceColor.g;
      particleColors[i3 + 2] = coherenceColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Orbital rings for imaginary dimensions
    const ringsGroup = new THREE.Group();
    const ringColors = [0xff0000, 0x00ff00, 0x0000ff];
    
    ringColors.forEach((color, index) => {
      const ringGeometry = new THREE.TorusGeometry(2 + index * 0.5, 0.02, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      
      // Rotate rings to different orientations
      ring.rotation.x = (Math.PI / 3) * index;
      ring.rotation.y = (Math.PI / 4) * index;
      
      ringsGroup.add(ring);
    });
    
    scene.add(ringsGroup);
    ringsRef.current = ringsGroup;

    // 6 Dimension spheres with trails
    const dimensions = [
      { name: 'Price', value: eigenstate.dimensions.price, color: 0xff0000, position: new THREE.Vector3(1, 0, 0) },
      { name: 'Volume', value: eigenstate.dimensions.volume, color: 0x00ff00, position: new THREE.Vector3(0, 1, 0) },
      { name: 'Momentum', value: eigenstate.dimensions.momentum, color: 0x0000ff, position: new THREE.Vector3(0, 0, 1) },
      { name: 'Sentiment', value: eigenstate.dimensions.sentiment, color: 0xffff00, position: new THREE.Vector3(-1, 0, 0) },
      { name: 'Temporal', value: eigenstate.dimensions.temporal, color: 0xff00ff, position: new THREE.Vector3(0, -1, 0) },
      { name: 'Spatial', value: eigenstate.dimensions.spatial, color: 0x00ffff, position: new THREE.Vector3(0, 0, -1) }
    ];

    dimensions.forEach((dim, index) => {
      const scaledPosition = dim.position.clone().multiplyScalar(Math.abs(dim.value) * 2.5);
      
      // Dimension sphere
      const dimGeometry = new THREE.SphereGeometry(0.15, 32, 32);
      const dimMaterial = new THREE.MeshPhongMaterial({
        color: dim.color,
        emissive: dim.color,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.8
      });
      const dimSphere = new THREE.Mesh(dimGeometry, dimMaterial);
      dimSphere.position.copy(scaledPosition);
      scene.add(dimSphere);
      dimensionSpheres.current.push(dimSphere);

      // Connection line to center
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        scaledPosition
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: dim.color,
        transparent: true,
        opacity: 0.5,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    });

    // Animation loop
    let time = 0;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate center sphere
      centerSphere.rotation.y += 0.005;
      centerSphere.rotation.x += 0.002;

      // Pulse center sphere
      const pulse = 1 + Math.sin(time * 2) * 0.1;
      centerSphere.scale.set(pulse, pulse, pulse);

      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.001;
        particlesRef.current.rotation.x += 0.0005;
        
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + i) * 0.001;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Rotate rings
      if (ringsRef.current) {
        ringsRef.current.rotation.y += 0.003;
        ringsRef.current.rotation.x += 0.002;
      }

      // Animate dimension spheres
      dimensionSpheres.current.forEach((sphere, index) => {
        const orbit = Math.sin(time + index) * 0.1;
        sphere.position.y += orbit * 0.01;
        sphere.rotation.y += 0.02;
      });

      // Rotate camera slightly
      camera.position.x = Math.sin(time * 0.1) * 0.5;
      camera.position.y = 1 + Math.cos(time * 0.15) * 0.3;
      camera.lookAt(0, 0, 0);

      // Render with bloom
      if (composerRef.current) {
        composerRef.current.render();
      }
    };

    animate();

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [eigenstate, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        borderRadius: '12px'
      }} 
    />
  );
}
