FILE 3: frontend/assets/js/unified-controller.js
/**
 * Unified Controller - Reality Protocol
 * Orchestrates Truth Matrix + Archimedes + VR Bloch Sphere
 */

import BlochSphereVR from './bloch_sphere_vr.js';

class UnifiedController {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentAsset = 'BTC';
        this.currentMode = 'unified';
        
        // System components
        this.blochSphere = null;
        this.audioSystem = null;
        this.updateInterval = null;
        
        // State
        this.isLive = false;
        this.lastEigenstate = null;
        this.lastArchimedes = null;
        
        // Animation
        this.heroAnimation = null;
    }
    
    async init() {
        console.log('🌟 Initializing Reality Protocol Unified Experience...');
        
        // Initialize hero background animation
        this.initHeroAnimation();
        
        // Initialize VR Bloch Sphere
        await this.initBlochSphere();
        
        // Initialize 7-bell audio system
        this.initAudioSystem();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial data load
        await this.updateAllData();
        
        // Start live updates
        this.startLiveUpdates();
        
        console.log('✅ Reality Protocol ready!');
    }
    
    initHeroAnimation() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Particle system for hero background
        const particles = [];
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                color: `rgba(0, 212, 255, ${Math.random() * 0.5})`
            });
        }
        
        const animate = () => {
            ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p, i) => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                
                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                
                // Draw connections
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });
            
            this.heroAnimation = requestAnimationFrame(animate);
        };
        
        animate();
        
        // Resize handler
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
    
    async initBlochSphere() {
        const container = document.getElementById('sphere-container');
        if (!container) {
            console.warn('Sphere container not found');
            return;
        }
        
        this.blochSphere = new BlochSphereVR(container, {
            sphereRadius: 5,
            baseFrequency: 432,
            enableAudio: true,
            enableHaptic: true,
            showGrid: true
        });
        
        console.log('✅ VR Bloch Sphere initialized');
    }
    
    initAudioSystem() {
        this.audioSystem = new SevenBellAudioSystem(432);
        console.log('✅ 7-Bell Audio System initialized');
    }
    
    setupEventListeners() {
        // Asset selection
        document.querySelectorAll('.asset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const asset = e.currentTarget.dataset.asset;
                this.selectAsset(asset);
            });
        });
        
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.selectMode(mode);
            });
        });
        
        // Audio controls
        const volumeSlider = document.getElementById('master-volume');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                this.audioSystem.setMasterVolume(volume);
                document.getElementById('volume-display').textContent = `${e.target.value}%`;
            });
        }
        
        // Spectrum layer clicks
        document.querySelectorAll('.spectrum-layer').forEach(layer => {
            layer.addEventListener('click', (e) => {
                const freq = e.currentTarget.dataset.freq;
                const layerIndex = Array.from(document.querySelectorAll('.spectrum-layer')).indexOf(e.currentTarget);
                this.audioSystem.playBellForLayer(layerIndex, 0.8);
            });
        });
    }
    
    async selectAsset(asset) {
        this.currentAsset = asset;
        
        // Update UI
        document.querySelectorAll('.asset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.asset === asset);
        });
        
        // Update data
        await this.updateAllData();
        
        console.log(`📊 Switched to ${asset}`);
    }
    
    selectMode(mode) {
        this.currentMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Show/hide panels based on mode
        this.updatePanelVisibility();
        
        console.log(`🎛️ Mode: ${mode}`);
    }
    
    updatePanelVisibility() {
        // This would show/hide different panels based on selected mode
        // For unified mode, show everything
        // For individual modes, show only relevant panels
        
        const panels = {
            'unified': { sphere: true, data: true },
            'archimedes': { sphere: false, data: true },
            'truth-matrix': { sphere: true, data: true },
            'vr-sphere': { sphere: true, data: false }
        };
        
        const config = panels[this.currentMode];
        
        // Implement panel visibility logic here
    }
    
    async updateAllData() {
        try {
            // Fetch both Truth Matrix and Archimedes data
            const [eigenstate, archimedes] = await Promise.all([
                this.fetchEigenstate(this.currentAsset),
                this.fetchArchimedes(this.currentAsset)
            ]);
            
            this.lastEigenstate = eigenstate;
            this.lastArchimedes = archimedes;
            
            // Update all UI components
            this.updateCoherence(eigenstate);
            this.updateExhaustion(archimedes);
            this.updateDimensions(eigenstate);
            this.updateDecision(eigenstate);
            this.updateBlochSphere(eigenstate, archimedes);
            
        } catch (error) {
            console.error('Failed to update data:', error);
            this.showError('Failed to fetch market data');
        }
    }
    
    async fetchEigenstate(asset) {
        const response = await fetch(`${this.apiBaseUrl}/v1/eigenstate/${asset}`);
        if (!response.ok) throw new Error(`Eigenstate API error: ${response.status}`);
        return await response.json();
    }
    
    async fetchArchimedes(asset) {
        const response = await fetch(`${this.apiBaseUrl}/analyze/macd`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                asset: asset,
                periods: 100,
                fast_period: 12,
                slow_period: 26,
                signal_period: 9,
                n_slices: 50
            })
        });
        if (!response.ok) throw new Error(`Archimedes API error: ${response.status}`);
        return await response.json();
    }
    
    updateCoherence(eigenstate) {
        const coherence = eigenstate.coherence;
        const coherenceNum = document.getElementById('coherence-number');
        const coherenceText = document.getElementById('coherence-text');
        const meterNeedle = document.getElementById('meter-needle');
        const meterFill = document.getElementById('meter-fill');
        
        if (coherenceNum) {
            coherenceNum.textContent = coherence.toFixed(3);
        }
        
        // Interpret coherence
        let interpretation = '';
        let color = '';
        
        if (Math.abs(coherence) > 0.8) {
            interpretation = 'Highly coherent - Strong directional conviction';
            color = '#10b981';
        } else if (Math.abs(coherence) > 0.5) {
            interpretation = 'Moderately coherent - Clear trend forming';
            color = '#3b82f6';
        } else if (Math.abs(coherence) > 0.2) {
            interpretation = 'Low coherence - Mixed signals, uncertainty';
            color = '#fbbf24';
        } else {
            interpretation = 'Decoherent - High uncertainty, conflicting data';
            color = '#ef4444';
        }
        
        if (coherenceText) {
            coherenceText.textContent = interpretation;
            coherenceText.style.color = color;
        }
        
        // Update meter visualization
        if (meterNeedle && meterFill) {
            // Needle angle: -90° to +90°
            const angle = coherence * 90;
            meterNeedle.setAttribute('transform', `rotate(${angle} 100 100)`);
            
            // Fill arc (stroke-dashoffset)
            const maxDash = 251.2; // Approximate arc length
            const offset = maxDash * (1 - (coherence + 1) / 2);
            meterFill.style.strokeDashoffset = offset;
            meterFill.style.stroke = color;
        }
        
        // Update live coherence in trinity card
        const liveCoherence = document.getElementById('live-coherence');
        if (liveCoherence) {
            liveCoherence.textContent = coherence.toFixed(2);
        }
    }
    
    updateExhaustion(archimedes) {
        const metadata = archimedes.sensory_output.metadata;
        
        const positiveBar = document.getElementById('positive-bar');
        const negativeBar = document.getElementById('negative-bar');
        const positiveValue = document.getElementById('positive-value');
        const negativeValue = document.getElementById('negative-value');
        const exhaustionPercent = document.getElementById('exhaustion-percent');
        
        const maxArea = Math.max(
            Math.abs(metadata.positive_area),
            Math.abs(metadata.negative_area),
            1
        );
        
        const posWidth = (Math.abs(metadata.positive_area) / maxArea) * 100;
        const negWidth = (Math.abs(metadata.negative_area) / maxArea) * 100;
        
        if (positiveBar) positiveBar.style.width = `${posWidth}%`;
        if (negativeBar) negativeBar.style.width = `${negWidth}%`;
        if (positiveValue) positiveValue.textContent = metadata.positive_area.toFixed(2);
        if (negativeValue) negativeValue.textContent = metadata.negative_area.toFixed(2);
        if (exhaustionPercent) {
            const exhaustion = metadata.exhaustion * 100;
            exhaustionPercent.textContent = `${exhaustion.toFixed(1)}%`;
            
            // Color code
            if (exhaustion > 70) {
                exhaustionPercent.style.color = '#ef4444';
            } else if (exhaustion > 40) {
                exhaustionPercent.style.color = '#fbbf24';
            } else {
                exhaustionPercent.style.color = '#10b981';
            }
        }
    }
    
    updateDimensions(eigenstate) {
        const dims = eigenstate.dimensions;
        
        const updateDim = (id, value) => {
            const bar = document.getElementById(`dim-${id}`);
            const val = document.getElementById(`val-${id}`);
            
            if (bar) {
                // Convert -1..+1 to 0..100%
                const width = ((value + 1) / 2) * 100;
                bar.style.width = `${width}%`;
            }
            if (val) {
                val.textContent = value.toFixed(2);
            }
        };
        
        // Real dimensions
        updateDim('price', dims.real.x);
        updateDim('volume', dims.real.y);
        updateDim('momentum', dims.real.z);
        
        // Imaginary dimensions
        updateDim('sentiment', dims.imaginary.i);
        updateDim('temporal', dims.imaginary.j);
        updateDim('spatial', dims.imaginary.k);
    }
    
    updateDecision(eigenstate) {
        const decisionValue = document.getElementById('decision-value');
        const decisionIcon = document.getElementById('decision-icon');
        const decisionConfidence = document.getElementById('decision-confidence');
        const liveDecision = document.getElementById('live-decision');
        
        const decision = eigenstate.decision;
        const confidence = Math.abs(eigenstate.coherence);
        
        const icons = {
            'BUY': '📈',
            'SELL': '📉',
            'HOLD': '⏸️'
        };
        
        const colors = {
            'BUY': '#10b981',
            'SELL': '#ef4444',
            'HOLD': '#fbbf24'
        };
        
        if (decisionValue) {
            decisionValue.textContent = decision;
            decisionValue.style.color = colors[decision];
        }
        
        if (decisionIcon) {
            decisionIcon.textContent = icons[decision];
        }
        
        if (decisionConfidence) {
            decisionConfidence.textContent = `${(confidence * 100).toFixed(1)}%`;
        }
        
        if (liveDecision) {
            liveDecision.textContent = decision;
        }
    }
    
    async updateBlochSphere(eigenstate, archimedes) {
        if (!this.blochSphere) return;
        
        // Combine eigenstate with archimedes exhaustion
        const combinedMetrics = {
            coherence: eigenstate.coherence,
            phase_angle: eigenstate.phase_angle,
            decision: eigenstate.decision,
            dimensions: eigenstate.dimensions,
            net_force: archimedes.sensory_output.metadata.net_force,
            exhaustion: archimedes.sensory_output.metadata.exhaustion,
            positive_area: archimedes.sensory_output.metadata.positive_area,
            negative_area: archimedes.sensory_output.metadata.negative_area
        };
        
        // Add/update asset in sphere
        await this.blochSphere.updateMarketData(this.currentAsset, combinedMetrics);
        
        // Play corresponding bell
        const rsi = (eigenstate.dimensions.real.z + 1) * 50; // -1..+1 to 0..100
        const layer = this.getRSILayer(rsi);
        this.audioSystem.playBellForLayer(layer, Math.abs(eigenstate.coherence));
    }
    
    getRSILayer(rsi) {
        if (rsi < 20) return 0;      // Violet
        if (rsi < 35) return 1;      // Indigo
        if (rsi < 50) return 2;      // Blue
        if (rsi < 65) return 3;      // Green
        if (rsi < 75) return 4;      // Yellow
        if (rsi < 85) return 5;      // Orange
        return 6;                     // Red
    }
    
    startLiveUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.isLive = true;
        
        // Update every 5 seconds
        this.updateInterval = setInterval(() => {
            this.updateAllData();
        }, 5000);
        
        console.log('🔴 Live updates started');
    }
    
    stopLiveUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        this.isLive = false;
        console.log('⏸️ Live updates stopped');
    }
    
    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

/**
 * Seven Bell Audio System
 * Sacred frequency harmonics for market states
 */
class SevenBellAudioSystem {
    constructor(baseFrequency = 432) {
        this.baseFrequency = baseFrequency;
        this.audioContext = null;
        this.masterGain = null;
        this.bells = this.createBellBank();
        
        // Initialize on first user interaction
        document.addEventListener('click', () => this.initAudio(), { once: true });
    }
    
    initAudio() {
        if (this.audioContext) return;
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);
        
        console.log('🔊 Audio system initialized');
    }
    
    createBellBank() {
        return [
            { freq: 396, name: "Root", chakra: "Violet" },
            { freq: 417, name: "Sacral", chakra: "Indigo" },
            { freq: 432, name: "Solar", chakra: "Blue" },
            { freq: 528, name: "Heart", chakra: "Green" },
            { freq: 639, name: "Throat", chakra: "Yellow" },
            { freq: 741, name: "Third Eye", chakra: "Orange" },
            { freq: 852, name: "Crown", chakra: "Red" }
        ];
    }
    
    playBellForLayer(layer, intensity = 0.8) {
        if (!this.audioContext || layer < 0 || layer > 6) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const bell = this.bells[layer];
        const now = this.audioContext.currentTime;
        
        // Create three oscillators for rich bell sound
        const oscs = [
            { freq: bell.freq, gain: 0.5 },      // Fundamental
            { freq: bell.freq * 2, gain: 0.3 },  // 2nd harmonic
            { freq: bell.freq * 3, gain: 0.2 }   // 3rd harmonic
        ];
        
        oscs.forEach(({ freq, gain: gainValue }) => {
            const osc = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Bell envelope (fast attack, long decay)
            oscGain.gain.setValueAtTime(0, now);
            oscGain.gain.linearRampToValueAtTime(gainValue * intensity, now + 0.01);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
            
            osc.connect(oscGain);
            oscGain.connect(this.masterGain);
            
            osc.start(now);
            osc.stop(now + 2.0);
        });
        
        console.log(`🔔 Bell ${layer + 1}: ${bell.name} (${bell.freq} Hz) - ${bell.chakra}`);
    }
    
    playSequence(startLayer = 0, endLayer = 6, interval = 200) {
        let current = startLayer;
        const direction = startLayer < endLayer ? 1 : -1;
        
        const playNext = () => {
            this.playBellForLayer(current, 0.8);
            current += direction;
            
            if ((direction > 0 && current <= endLayer) ||
                (direction < 0 && current >= endLayer)) {
                setTimeout(playNext, interval);
            }
        };
        
        playNext();
    }
    
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }
}

/**
 * Global functions for onclick handlers
 */
window.scrollToExperience = () => {
    document.getElementById('experience').scrollIntoView({ behavior: 'smooth' });
};

window.scrollToLearn = () => {
    document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
};

window.focusModule = (module) => {
    const modes = {
        'archimedes': 'archimedes',
        'truth-matrix': 'truth-matrix',
        'vr-sphere': 'vr-sphere'
    };
    
    if (unifiedController && modes[module]) {
        unifiedController.selectMode(modes[module]);
        scrollToExperience();
    }
};

window.toggleVR = () => {
    if (unifiedController && unifiedController.blochSphere) {
        // Trigger VR mode
        const vrButton = document.querySelector('button[aria-label="VR"]');
        if (vrButton) vrButton.click();
    }
};

window.resetCamera = () => {
    if (unifiedController && unifiedController.blochSphere) {
        unifiedController.blochSphere.camera.position.set(0, 1.6, 8);
        unifiedController.blochSphere.camera.lookAt(0, 0, 0);
    }
};

window.playBellSequence = () => {
    if (unifiedController && unifiedController.audioSystem) {
        unifiedController.audioSystem.playSequence(0, 6, 300);
    }
};

window.toggleSpatialAudio = () => {
    // Toggle spatial audio on/off
    if (unifiedController && unifiedController.blochSphere) {
        unifiedController.blochSphere.options.enableAudio = 
            !unifiedController.blochSphere.options.enableAudio;
        
        const btn = document.getElementById('toggle-spatial');
        if (btn) {
            btn.textContent = unifiedController.blochSphere.options.enableAudio 
                ? '🎧 Spatial Audio: ON' 
                : '🎧 Spatial Audio: OFF';
        }
    }
};

// Initialize on load
const unifiedController = new UnifiedController();

document.addEventListener('DOMContentLoaded', () => {
    unifiedController.init();
});

export default UnifiedController;
FILE 4: Additional CSS Animations
frontend/assets/css/unified-animations.css
/**
 * Advanced animations for Reality Protocol
 */

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(100px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100px);
    }
}

@keyframes glow {
    0%, 100% {
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
    }
    50% {
        box-shadow: 0 0 40px rgba(0, 212, 255, 0.8);
    }
}

@keyframes rotate3d {
    from {
        transform: rotateY(0deg);
    }
    to {
        transform: rotateY(360deg);
    }
}

/* Data update animations */
@keyframes dataUpdate {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
        background: rgba(0, 212, 255, 0.2);
    }
    100% {
        transform: scale(1);
    }
}

.data-updated {
    animation: dataUpdate 0.5s ease-out;
}

/* Coherence meter pulse */
@keyframes coherencePulse {
    0%, 100% {
        filter: drop-shadow(0 0 5px currentColor);
    }
    50% {
        filter: drop-shadow(0 0 15px currentColor);
    }
}

#meter-needle {
    animation: coherencePulse 2s ease-in-out infinite;
}

/* Decision shake (for uncertainty) */
@keyframes decisionShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.decision-uncertain {
    animation: decisionShake 0.5s ease-in-out;
}

/* Spectrum layer active state */
.spectrum-layer.active {
    animation: glow 1s ease-in-out infinite;
    transform: scale(1.1);
    z-index: 10;
}

/* Loading state */
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(0, 212, 255, 0.3);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Particle effects for high coherence */
@keyframes particleFloat {
    0% {
        transform: translateY(0) translateX(0);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: translateY(-100px) translateX(20px);
        opacity: 0;
    }
}

.coherence-particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--primary);
    border-radius: 50%;
    animation: particleFloat 2s ease-out infinite;
}

/* Dimension bar fill animation */
.dim-fill {
    position: relative;
    overflow: hidden;
}

.dim-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
    );
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    to {
        left: 100%;
    }
}

/* Bell ring visualization */
@keyframes bellRing {
    0% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
    }
    50% {
        transform: scale(1.2) rotate(5deg);
    }
    100% {
        transform: scale(1.5) rotate(0deg);
        opacity: 0;
    }
}

.bell-ring-effect {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid var(--primary);
    border-radius: 50%;
    animation: bellRing 1s ease-out;
}

/* Responsive scaling */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
FILE 5: Mock Data Generator (For Testing)
frontend/assets/js/mock-data.js
/**
 * Mock Data Generator
 * For testing when backend isn't available
 */

export class MockDataGenerator {
    constructor() {
        this.baseValues = {
            BTC: { price: 45000, volatility: 0.02 },
            ETH: { price: 2500, volatility: 0.03 },
            SOL: { price: 100, volatility: 0.05 },
            AVAX: { price: 35, volatility: 0.04 }
        };
    }
    
    generateEigenstate(asset) {
        const base = this.baseValues[asset] || this.baseValues.BTC;
        
        // Generate somewhat realistic 6D eigenstate
        const momentum = (Math.random() - 0.5) * 2; // -1 to +1
        const price =
