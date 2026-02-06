import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface BlochSphere6DProps {
  eigenstate?: {
    dimensions: {
      price: number;
      volume: number;
      momentum: number;
      sentiment: number;
      temporal: number;
      spatial: number;
    };
    coherence: number;
  };
  className?: string;
}

export function BlochSphere6D({ eigenstate, className = '' }: BlochSphere6DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const torusRef = useRef<THREE.Mesh | null>(null);
  const arrowRef = useRef<THREE.ArrowHelper | null>(null);
  const yellowSphereRef = useRef<THREE.Mesh | null>(null);
  const blueSphereRef = useRef<THREE.Mesh | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(3, 2, 5);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls for interactive camera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Red torus for real dimensions (price, volume, momentum)
    const torusGeometry = new THREE.TorusGeometry(1, 0.1, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.3,
      metalness: 0.5,
      roughness: 0.2
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torus);
    torusRef.current = torus;

    // Yellow sphere for positive imaginary dimension (sentiment)
    const yellowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.5
      })
    );
    yellowSphere.position.set(1.5, 0, 0);
    scene.add(yellowSphere);
    yellowSphereRef.current = yellowSphere;

    // Blue sphere for negative imaginary dimension (temporal)
    const blueSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0x0000ff,
        emissive: 0x0000ff,
        emissiveIntensity: 0.5
      })
    );
    blueSphere.position.set(-1.5, 0, 0);
    scene.add(blueSphere);
    blueSphereRef.current = blueSphere;

    // Purple vector arrow for spatial dimension
    const arrowDirection = new THREE.Vector3(1, 1, 1).normalize();
    const arrowOrigin = new THREE.Vector3(0, 0, 0);
    const arrow = new THREE.ArrowHelper(arrowDirection, arrowOrigin, 2, 0xff00ff, 0.3, 0.2);
    scene.add(arrow);
    arrowRef.current = arrow;

    // Add 6D metric labels
    const labels = ['Price', 'Volume', 'Momentum', 'Sentiment', 'Temporal', 'Spatial'];
    const labelPositions = [
      new THREE.Vector3(0, 1.5, 0),      // Price (top)
      new THREE.Vector3(0, -1.5, 0),     // Volume (bottom)
      new THREE.Vector3(1.5, 0.5, 0),    // Momentum (right-top)
      new THREE.Vector3(1.8, 0, 0),      // Sentiment (yellow sphere)
      new THREE.Vector3(-1.8, 0, 0),     // Temporal (blue sphere)
      new THREE.Vector3(0, 0, 1.8)       // Spatial (forward)
    ];

    labels.forEach((label, i) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      context.fillStyle = '#ffffff';
      context.font = 'bold 32px Arial';
      context.textAlign = 'center';
      context.fillText(label, 128, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(labelPositions[i]);
      sprite.scale.set(0.8, 0.2, 1);
      scene.add(sprite);
    });

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (torusRef.current) {
        torusRef.current.rotation.y += 0.01;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    setIsInitialized(true);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isInitialized]);

  // Update visualization when eigenstate changes
  useEffect(() => {
    if (!eigenstate || !isInitialized) return;

    const { dimensions, coherence } = eigenstate;

    // Update torus rotation speed based on momentum
    if (torusRef.current) {
      const rotationSpeed = 0.01 + Math.abs(dimensions.momentum) * 0.02;
      torusRef.current.rotation.y += rotationSpeed;
    }

    // Update yellow sphere position based on sentiment
    if (yellowSphereRef.current) {
      const sentimentOffset = dimensions.sentiment * 0.5;
      yellowSphereRef.current.position.x = 1.5 + sentimentOffset;
      yellowSphereRef.current.position.y = sentimentOffset * 0.3;
    }

    // Update blue sphere position based on temporal
    if (blueSphereRef.current) {
      const temporalOffset = dimensions.temporal * 0.5;
      blueSphereRef.current.position.x = -1.5 + temporalOffset;
      blueSphereRef.current.position.y = temporalOffset * 0.3;
    }

    // Update arrow direction based on spatial dimension
    if (arrowRef.current) {
      const spatialVector = new THREE.Vector3(
        dimensions.price,
        dimensions.volume,
        dimensions.spatial
      ).normalize();
      arrowRef.current.setDirection(spatialVector);
      
      // Change arrow color based on coherence
      const arrowColor = coherence > 0 ? 0xff00ff : 0xff0000;
      arrowRef.current.setColor(arrowColor);
    }
  }, [eigenstate, isInitialized]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full min-h-[400px] ${className}`}
      style={{ position: 'relative' }}
    >
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-white">Loading 6D Bloch Sphere...</p>
        </div>
      )}
    </div>
  );
}
