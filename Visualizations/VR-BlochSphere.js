🌐 VR BLOCH SPHERE - PRODUCTION BUILD
Architecture Overview
VR Bloch Sphere System
│
├── Core Engine (Three.js + WebXR)
├── Market Data Mapper (Economic → Spatial)
├── Multi-Asset Positioning
├── Spatial Audio Integration
└── Control Interface (Desktop + VR Controllers)
TASK 1: Core VR Engine
frontend/assets/js/bloch_sphere_vr.js
/**
 * VR Bloch Sphere Engine
 * Maps market states to quantum-inspired 3D phase space
 * 
 * Coordinate System:
 * - Theta (θ): Exhaustion level (0° to 180°)
 * - Phi (φ): Momentum direction (-90° to +90°)
 * - Radius (r): Momentum strength
 * - Color: Risk level (spectrum from your notes)
 */

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

class BlochSphereVR {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = {
            sphereRadius: 5,
            baseFrequency: 432,
            enableAudio: options.enableAudio !== false,
            enableHaptic: options.enableHaptic !== false,
            showGrid: options.showGrid !== false,
            ...options
        };
        
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sphere = null;
        
        // Asset tracking
        this.assets = new Map();
        this.assetMeshes = new Map();
        
        // Audio context for spatial sound
        this.audioContext = null;
        this.audioSources = new Map();
        
        // VR controllers
        this.controllers = [];
        
        // Animation
        this.clock = new THREE.Clock();
        this.mixers = [];
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.createBlochSphere();
        this.createCoordinateSystem();
        this.setupVRControls();
        this.setupAudio();
        this.setupEventListeners();
        this.animate();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e27); // Your HONEST dark theme
        
        // Add fog for depth perception
        this.scene.fog = new THREE.FogExp2(0x0a0e27, 0.05);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 8); // Eye level, stepped back
        this.camera.lookAt(0, 0, 0);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
        
        // Add VR button
        const vrButton = VRButton.createButton(this.renderer);
        vrButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: #00d4ff;
            color: #0a0e27;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 212, 255, 0.5);
        `;
        document.body.appendChild(vrButton);
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Directional light (main)
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
        
        // Point lights for atmosphere (matching your color spectrum)
        const colors = [
            { color: 0x9333ea, pos: [4, 0, 0] },    // Violet
            { color: 0x4f46e5, pos: [-4, 0, 0] },   // Indigo
            { color: 0x3b82f6, pos: [0, 4, 0] },    // Blue
            { color: 0x10b981, pos: [0, -4, 0] },   // Green
            { color: 0xfbbf24, pos: [0, 0, 4] },    // Yellow
            { color: 0xf59e0b, pos: [0, 0, -4] }    // Orange
        ];
        
        colors.forEach(({ color, pos }) => {
            const light = new THREE.PointLight(color, 0.3, 10);
            light.position.set(...pos);
            this.scene.add(light);
        });
    }
    
    createBlochSphere() {
        // Main sphere geometry
        const geometry = new THREE.SphereGeometry(
            this.options.sphereRadius,
            64,
            64
        );
        
        // Wireframe material with glow
        const material = new THREE.MeshPhongMaterial({
            color: 0x00d4ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            emissive: 0x00d4ff,
            emissiveIntensity: 0.2
        });
        
        this.sphere = new THREE.Mesh(geometry, material);
        this.sphere.castShadow = true;
        this.sphere.receiveShadow = true;
        this.scene.add(this.sphere);
        
        // Add inner glow sphere
        const glowGeometry = new THREE.SphereGeometry(
            this.options.sphereRadius * 0.98,
            32,
            32
        );
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(glowSphere);
        
        // Add latitude/longitude grid lines
        if (this.options.showGrid) {
            this.createGridLines();
        }
    }
    
    createGridLines() {
        const gridMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00d4ff,
            opacity: 0.4,
            transparent: true
        });
        
        // Latitude lines (parallels)
        for (let lat = -80; lat <= 80; lat += 20) {
            const radius = this.options.sphereRadius * Math.cos(lat * Math.PI / 180);
            const height = this.options.sphereRadius * Math.sin(lat * Math.PI / 180);
            const points = [];
            
            for (let lon = 0; lon <= 360; lon += 5) {
                const x = radius * Math.cos(lon * Math.PI / 180);
                const z = radius * Math.sin(lon * Math.PI / 180);
                points.push(new THREE.Vector3(x, height, z));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, gridMaterial);
            this.scene.add(line);
        }
        
        // Longitude lines (meridians)
        for (let lon = 0; lon < 360; lon += 20) {
            const points = [];
            
            for (let lat = -90; lat <= 90; lat += 5) {
                const radius = this.options.sphereRadius * Math.cos(lat * Math.PI / 180);
                const height = this.options.sphereRadius * Math.sin(lat * Math.PI / 180);
                const x = radius * Math.cos(lon * Math.PI / 180);
                const z = radius * Math.sin(lon * Math.PI / 180);
                points.push(new THREE.Vector3(x, height, z));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, gridMaterial);
            this.scene.add(line);
        }
    }
    
    createCoordinateSystem() {
        // X, Y, Z axes
        const axisLength = this.options.sphereRadius * 1.5;
        
        // X-axis (Red) - Risk dimension
        const xGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-axisLength, 0, 0),
            new THREE.Vector3(axisLength, 0, 0)
        ]);
        const xMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const xAxis = new THREE.Line(xGeometry, xMaterial);
        this.scene.add(xAxis);
        
        // Y-axis (Green) - Momentum strength
        const yGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, -axisLength, 0),
            new THREE.Vector3(0, axisLength, 0)
        ]);
        const yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const yAxis = new THREE.Line(yGeometry, yMaterial);
        this.scene.add(yAxis);
        
        // Z-axis (Blue) - Time/Phase
        const zGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, -axisLength),
            new THREE.Vector3(0, 0, axisLength)
        ]);
        const zMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const zAxis = new THREE.Line(zGeometry, zMaterial);
        this.scene.add(zAxis);
        
        // Add axis labels
        this.addAxisLabels();
    }
    
    addAxisLabels() {
        const loader = new THREE.FontLoader();
        
        // Note: sprites need to be updated to oracles
        const createTextSprite = (text, color) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 128;
            
            ctx.fillStyle = color;
            ctx.font = 'Bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 128, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(2, 1, 1);
            
            return sprite;
        };
        
        const axisLength = this.options.sphereRadius * 1.5;
        
        // Labels
        const xLabel = createTextSprite('RISK', '#ff0000');
        xLabel.position.set(axisLength + 1, 0, 0);
        this.scene.add(xLabel);
        
        const yLabel = createTextSprite('MOMENTUM', '#00ff00');
        yLabel.position.set(0, axisLength + 1, 0);
        this.scene.add(yLabel);
        
        const zLabel = createTextSprite('PHASE', '#0000ff');
        zLabel.position.set(0, 0, axisLength + 1);
        this.scene.add(zLabel);
    }
    
    setupVRControls() {
        const controllerModelFactory = new XRControllerModelFactory();
        
        // Controller 1 (right hand typically)
        const controller1 = this.renderer.xr.getController(0);
        controller1.addEventListener('selectstart', () => this.onSelectStart(0));
        controller1.addEventListener('selectend', () => this.onSelectEnd(0));
        this.scene.add(controller1);
        
        const controllerGrip1 = this.renderer.xr.getControllerGrip(0);
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
        this.scene.add(controllerGrip1);
        
        // Controller 2 (left hand typically)
        const controller2 = this.renderer.xr.getController(1);
        controller2.addEventListener('selectstart', () => this.onSelectStart(1));
        controller2.addEventListener('selectend', () => this.onSelectEnd(1));
        this.scene.add(controller2);
        
        const controllerGrip2 = this.renderer.xr.getControllerGrip(1);
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
        this.scene.add(controllerGrip2);
        
        this.controllers = [controller1, controller2];
        
        // Add ray pointers
        this.controllers.forEach((controller, i) => {
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -1)
            ]);
            const material = new THREE.LineBasicMaterial({ color: 0x00d4ff });
            const line = new THREE.Line(geometry, material);
            line.scale.z = 5;
            controller.add(line);
        });
    }
    
    setupAudio() {
        if (!this.options.enableAudio) return;
        
        // Create audio context (will be resumed on user interaction)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain node
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Desktop controls (mouse orbit)
        this.setupOrbitControls();
    }
    
    setupOrbitControls() {
        // Simple mouse orbit for desktop view
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            this.sphere.rotation.y += deltaX * 0.01;
            this.sphere.rotation.x += deltaY * 0.01;
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Zoom with mouse wheel
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.position.z += e.deltaY * 0.01;
            this.camera.position.z = Math.max(3, Math.min(15, this.camera.position.z));
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onSelectStart(controllerIndex) {
        console.log(`Controller ${controllerIndex} select start`);
        // Implement asset selection/interaction
    }
    
    onSelectEnd(controllerIndex) {
        console.log(`Controller ${controllerIndex} select end`);
    }
    
    // ==========================================
    // MARKET DATA MAPPING - THE MAGIC HAPPENS HERE
    // ==========================================
    
    /**
     * Convert market metrics to Bloch sphere coordinates
     * Based on your sketches and notes
     */
    marketToBlochCoordinates(metrics) {
        const {
            net_force,
            exhaustion,
            positive_area,
            negative_area,
            rsi = 50,  // Default if not provided
            volume_ratio = 1.0
        } = metrics;
        
        // Theta: Exhaustion level (0 = north pole, π = south pole)
        // High exhaustion = middle latitudes (oscillating)
        // Low exhaustion = poles (strong trend)
        const theta = exhaustion * Math.PI;
        
        // Phi: Momentum direction
        // Positive net_force = eastern hemisphere
        // Negative net_force = western hemisphere
        const phi = Math.atan2(net_force, positive_area + Math.abs(negative_area) + 0.1);
        
        // Radius: Momentum strength (distance from center)
        // Normalize to sphere surface (0 to sphereRadius)
        const strength = Math.abs(net_force) / 10; // Normalize
        const r = this.options.sphereRadius * Math.min(strength, 1.0);
        
        // Convert spherical to Cartesian
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.cos(theta);  // Height = momentum strength
        const z = r * Math.sin(theta) * Math.sin(phi);
        
        // Color based on risk (RSI + exhaustion)
        const riskLevel = (rsi / 100) * 0.5 + exhaustion * 0.5;
        const color = this.getRiskColor(riskLevel);
        
        return { 
            position: new THREE.Vector3(x, y, z),
            color,
            theta,
            phi,
            r,
            riskLevel
        };
    }
    
    /**
     * Your color spectrum from the notes:
     * Violet (safest) → Red (riskiest)
     */
    getRiskColor(riskLevel) {
        // 0.0 = Violet (safe), 1.0 = Red (risky)
        const colors = [
            new THREE.Color(0x9333ea),  // Violet
            new THREE.Color(0x4f46e5),  // Indigo
            new THREE.Color(0x3b82f6),  // Blue
            new THREE.Color(0x10b981),  // Green
            new THREE.Color(0xfbbf24),  // Yellow
            new THREE.Color(0xf59e0b),  // Orange
            new THREE.Color(0xef4444)   // Red
        ];
        
        const index = Math.floor(riskLevel * (colors.length - 1));
        const nextIndex = Math.min(index + 1, colors.length - 1);
        const t = (riskLevel * (colors.length - 1)) - index;
        
        return colors[index].clone().lerp(colors[nextIndex], t);
    }
    
    /**
     * Add or update an asset on the sphere
     */
    async addAsset(assetSymbol, metrics) {
        const coords = this.marketToBlochCoordinates(metrics);
        
        // Create or update asset mesh
        if (this.assetMeshes.has(assetSymbol)) {
            this.updateAssetMesh(assetSymbol, coords, metrics);
        } else {
            this.createAssetMesh(assetSymbol, coords, metrics);
        }
        
        // Update spatial audio
        if (this.options.enableAudio) {
            this.updateAssetAudio(assetSymbol, coords, metrics);
        }
        
        // Store data
        this.assets.set(assetSymbol, { metrics, coords });
    }
    
    createAssetMesh(assetSymbol, coords, metrics) {
        // Create glowing sphere for asset
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: coords.color,
            emissive: coords.color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(coords.position);
        mesh.castShadow = true;
        
        // Add pulsing animation
        mesh.userData = {
            symbol: assetSymbol,
            baseScale: 1.0,
            pulseSpeed: 1.0 + metrics.exhaustion
        };
        
        // Add label
        const label = this.createAssetLabel(assetSymbol);
        label.position.set(0, 0.4, 0);
        mesh.add(label);
        
        // Add trail effect (shows movement history)
        const trail = this.createTrail(coords.color);
        mesh.add(trail);
        mesh.userData.trail = trail;
        
        this.scene.add(mesh);
        this.assetMeshes.set(assetSymbol, mesh);
    }
    
    updateAssetMesh(assetSymbol, coords, metrics) {
        const mesh = this.assetMeshes.get(assetSymbol);
        
        // Animate position change
        const targetPosition = coords.position;
        mesh.position.lerp(targetPosition, 0.1); // Smooth movement
        
        // Update color
        mesh.material.color = coords.color;
        mesh.material.emissive = coords.color;
        
        // Update trail
        if (mesh.userData.trail) {
            this.updateTrail(mesh.userData.trail, mesh.position, coords.color);
        }
    }
    
    createAssetLabel(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'Bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(1, 0.25, 1);
        
        return sprite;
    }
    
    createTrail(color) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(100 * 3); // 100 points
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            linewidth: 2
        });
        
        const trail = new THREE.Line(geometry, material);
        trail.userData.positions = [];
        trail.userData.maxLength = 100;
        
        return trail;
    }
    
    updateTrail(trail, newPosition, color) {
        trail.userData.positions.push(newPosition.clone());
        
        // Keep only last N positions
        if (trail.userData.positions.length > trail.userData.maxLength) {
            trail.userData.positions.shift();
        }
        
        // Update geometry
        const positions = trail.geometry.attributes.position.array;
        trail.userData.positions.forEach((pos, i) => {
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
        });
        trail.geometry.attributes.position.needsUpdate = true;
        
        // Update color
        trail.material.color = color;
    }
    
    /**
     * Spatial audio positioning
     */
    updateAssetAudio(assetSymbol, coords, metrics) {
        if (!this.audioContext) return;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        let audioSource = this.audioSources.get(assetSymbol);
        
        if (!audioSource) {
            audioSource = this.createAudioSource(assetSymbol, metrics);
            this.audioSources.set(assetSymbol, audioSource);
        }
        
        // Update 3D position
        audioSource.panner.positionX.value = coords.position.x;
        audioSource.panner.positionY.value = coords.position.y;
        audioSource.panner.positionZ.value = coords.position.z;
        
        // Update frequency based on metrics
        const baseFreq = this.options.baseFrequency;
        const frequency = baseFreq * (1 + 0.5 * Math.tanh(metrics.net_force / 10));
        audioSource.oscillator.frequency.setValueAtTime(
            frequency,
            this.audioContext.currentTime
        );
        
        // Update volume based on risk
        const volume = 0.1 * (1 - metrics.exhaustion);
        audioSource.gain.gain.setValueAtTime(
            volume,
            this.audioContext.currentTime
        );
    }
    
    createAudioSource(assetSymbol, metrics) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const panner = this.audioContext.createPanner();
        
        // Configure spatial panner
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 20;
        panner.rolloffFactor = 1;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        
        // Set oscillator type based on asset
        oscillator.type = 'sine';
        
        // Connect audio graph
        oscillator.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.masterGain);
        
        // Start oscillator
        oscillator.start();
        
        return { oscillator, gain: gainNode, panner };
    }
    
    /**
     * Remove asset from sphere
     */
    removeAsset(assetSymbol) {
        // Remove mesh
        const mesh = this.assetMeshes.get(assetSymbol);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.assetMeshes.delete(assetSymbol);
        }
        
        // Stop audio
        const audioSource = this.audioSources.get(assetSymbol);
        if (audioSource) {
            audioSource.oscillator.stop();
            audioSource.oscillator.disconnect();
            audioSource.gain.disconnect();
            audioSource.panner.disconnect();
            this.audioSources.delete(assetSymbol);
        }
        
        // Remove data
        this.assets.delete(assetSymbol);
    }
    
    /**
     * Main animation loop
     */
    animate() {
        this.renderer.setAnimationLoop(() => this.render());
    }
    
    render() {
        const delta = this.clock.getDelta();
        
        // Rotate sphere slowly
        this.sphere.rotation.y += 0.001;
        
        // Animate asset meshes (pulsing effect)
        this.assetMeshes.forEach((mesh, symbol) => {
            const pulse = Math.sin(Date.now() * 0.001 * mesh.userData.pulseSpeed) * 0.1 + 1;
            mesh.scale.setScalar(mesh.userData.baseScale * pulse);
        });
        
        // Update audio listener position to camera
        if (this.audioContext) {
            const listenerPos = this.camera.position;
            this.audioContext.listener.positionX.value = listenerPos.x;
            this.audioContext.listener.positionY.value = listenerPos.y;
            this.audioContext.listener.positionZ.value = listenerPos.z;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Public API: Update market data
     */
    async updateMarketData(assetSymbol, metrics) {
        await this.addAsset(assetSymbol, metrics);
    }
    
    /**
     * Get all assets currently on sphere
     */
    getAssets() {
        return Array.from(this.assets.keys());
    }
    
    /**
     * Clear all assets
     */
    clearAllAssets() {
        this.assets.forEach((_, symbol) => this.removeAsset(symbol));
    }
    
    /**
     * Take screenshot
     */
    takeScreenshot() {
        return this.renderer.domElement.toDataURL('image/png');
    }
    
    /**
     * Cleanup
     */
    dispose() {
        // Stop animation
        this.renderer.setAnimationLoop(null);
        
        // Clear all assets
        this.clearAllAssets();
        
        // Dispose scene objects
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        // Dispose renderer
        this.renderer.dispose();
        
        // Stop audio
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Export for use
export default BlochSphereVR;
TASK 2: Integration with MACD Backend
frontend/assets/js/vr_market_controller.js
/**
 * VR Market Controller
 *
