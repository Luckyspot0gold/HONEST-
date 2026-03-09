/**
 * H.O.N.E.S.T. Hardware API Architecture
 * Standardized protocol for haptic chairs, vests, wearables
 * 
 * PATENT CLAIM: Multi-modal sensory synchronization protocol
 */

import { SonificationOutput } from './advanced-sonification';

export enum DeviceType {
    HAPTIC_CHAIR = 'haptic_chair',
    COGNITION_VEST = 'cognition_vest',
    SENSORY_GLOVES = 'sensory_gloves',
    NEURO_HAT = 'neuro_hat',
    BODY_SUIT = 'body_suit',
    PLEASURABLE = 'pleasurable',
    SOCKS = 'socks'
}

export enum MotorType {
    LINEAR_RESONANT_ACTUATOR = 'lra',
    ECCENTRIC_ROTATING_MASS = 'erm',
    PIEZOELECTRIC = 'piezo',
    ELECTROACTIVE_POLYMER = 'eap',
    ELECTROTACTILE = 'electrotactile'
}

export interface DeviceCapability {
    motorCount: number;
    motorPositions: Array<{x: number; y: number; z: number}>; // Normalized 0-1
    motorTypes: MotorType[];
    maxFrequency: number;    // Hz
    minFrequency: number;    // Hz
    maxIntensity: number;   // 0-1
    audioOutput: boolean;
    samplingRate?: number;   // For audio-capable devices
    latency: number;         // ms
}

export interface UserCalibration {
    sensitivityMap: Map<string, number>; // Device position -> sensitivity multiplier
    frequencyPreferences: Map<string, [number, number]>; // Position -> preferred freq range
    intensityThresholds: {
        minimumPerceptible: number;
        comfortable: number;
        maximumTolerable: number;
    };
    crossModalEnhancement: boolean; // Audio enhances haptic perception
    deviceSpecificTuning: Record<string, any>;
}

export class HardwareAPI {
    private devices = new Map<string, DeviceProfile>();
    private connections = new Map<string, WebSocket>();
    private deviceRegistry = new Map<string, DeviceCapability>();
    private userCalibrations = new Map<string, UserCalibration>();
    
    constructor(private apiBaseUrl: string = 'wss://api.realityprotocol.com/v1/hardware') {}
    
    /**
     * DEVICE REGISTRATION PROTOCOL
     */
    async registerDevice(
        deviceId: string,
        deviceType: DeviceType,
        capabilities: DeviceCapability,
        firmwareVersion: string
    ): Promise<RegistrationResponse> {
        
        // Send registration request
        const response = await fetch(`${this.apiBaseUrl}/device/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Device-ID': deviceId,
                'X-Firmware-Version': firmwareVersion
            },
            body: JSON.stringify({
                deviceType,
                capabilities,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            throw new Error(`Registration failed: ${response.statusText}`);
        }
        
        const registration: RegistrationResponse = await response.json();
        
        // Store device profile
        this.devices.set(deviceId, {
            id: deviceId,
            type: deviceType,
            capabilities,
            firmwareVersion,
            registeredAt: new Date(),
            lastSeen: new Date(),
            calibration: null
        });
        
        // Establish WebSocket connection
        await this.connectDeviceWebSocket(deviceId, registration.authToken);
        
        return registration;
    }
    
    /**
     * WEBSOCKET CONNECTION FOR REAL-TIME STREAMS
     */
    private async connectDeviceWebSocket(deviceId: string, authToken: string): Promise<void> {
        const wsUrl = `${this.apiBaseUrl}/stream/${deviceId}?token=${authToken}`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log(`Device ${deviceId} connected`);
            this.connections.set(deviceId, ws);
        };
        
        ws.onmessage = (event) => {
            this.handleDeviceMessage(deviceId, JSON.parse(event.data));
        };
        
        ws.onerror = (error) => {
            console.error(`Device ${deviceId} WebSocket error:`, error);
        };
        
        ws.onclose = () => {
            console.log(`Device ${deviceId} disconnected`);
            this.connections.delete(deviceId);
            // Attempt reconnection after delay
            setTimeout(() => this.connectDeviceWebSocket(deviceId, authToken), 5000);
        };
    }
    
    /**
     * MULTI-SENSORY STREAMING PROTOCOL
     */
    async streamToDevice(
        deviceId: string,
        dataStreamId: string,
        sonification: SonificationOutput,
        priority: 'high' | 'medium' | 'low' = 'medium'
    ): Promise<void> {
        const device = this.devices.get(deviceId);
        const connection = this.connections.get(deviceId);
        
        if (!device || !connection) {
            throw new Error(`Device ${deviceId} not connected`);
        }
        
        // Apply device-specific calibration
        const calibratedOutput = this.applyCalibration(deviceId, sonification);
        
        // Convert to device-specific protocol
        const deviceMessage = this.formatForDevice(device, calibratedOutput, priority);
        
        // Send via WebSocket
        if (connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify(deviceMessage));
        } else {
            throw new Error(`Device ${deviceId} connection not open`);
        }
        
        // Update device last seen
        device.lastSeen = new Date();
    }
    
    /**
     * DEVICE-SPECIFIC CALIBRATION APPLICATION
     */
    private applyCalibration(deviceId: string, output: SonificationOutput): SonificationOutput {
        const calibration = this.userCalibrations.get(deviceId);
        if (!calibration) return output;
        
        const calibrated = { ...output };
        
        // Apply intensity thresholds
        const { minimumPerceptible, comfortable, maximumTolerable } = calibration.intensityThresholds;
        
        // Scale intensities to comfortable range
        calibrated.hapticPattern.intensities = calibrated.hapticPattern.intensities.map(intensity => {
            // Map from system intensity (0-1) to user's comfortable range
            const scaled = minimumPerceptible + (intensity * (comfortable - minimumPerceptible));
            return Math.min(scaled, maximumTolerable);
        });
        
        // Apply sensitivity mapping
        if (calibration.sensitivityMap.size > 0) {
            // Device has position-specific sensitivities
            // This would be implemented based on motor positions
        }
        
        // Apply frequency preferences
        if (calibration.frequencyPreferences.size > 0) {
            // Adjust frequencies to user's preferred ranges
        }
        
        // Cross-modal enhancement
        if (calibration.crossModalEnhancement) {
            // Audio enhances haptic perception - boost haptic when audio present
            if (calibrated.amplitude > 0.1) {
                calibrated.hapticPattern.intensities = calibrated.hapticPattern.intensities.map(
                    i => i * 1.3 // 30% enhancement
                );
            }
        }
        
        return calibrated;
    }
    
    /**
     * DEVICE-SPECIFIC MESSAGE FORMATTING
     */
    private formatForDevice(
        device: DeviceProfile,
        output: SonificationOutput,
        priority: 'high' | 'medium' | 'low'
    ): DeviceMessage {
        
        switch (device.type) {
            case DeviceType.HAPTIC_CHAIR:
                return this.formatForHapticChair(device, output, priority);
            case DeviceType.COGNITION_VEST:
                return this.formatForCognitionVest(device, output, priority);
            case DeviceType.SENSORY_GLOVES:
                return this.formatForSensoryGloves(device, output, priority);
            case DeviceType.NEURO_HAT:
                return this.formatForNeuroHat(device, output, priority);
            case DeviceType.BODY_SUIT:
                return this.formatForBodySuit(device, output, priority);
            case DeviceType.PLEASURABLE:
                return this.formatForPleasurable(device, output, priority);
            case DeviceType.SOCKS:
                return this.formatForSocks(device, output, priority);
            default:
                return this.formatGeneric(device, output, priority);
        }
    }
    
    /**
     * HAPTIC CHAIR PROTOCOL: Full-body immersion
     */
    private formatForHapticChair(
        device: DeviceProfile,
        output: SonificationOutput,
        priority: string
    ): DeviceMessage {
        // Chair has motors at: back (0.5, 0.3), seat (0.5, 0.7), lumbar (0.3, 0.5)
        const motorMapping = [
            { position: 'back', motorIndex: 0, intensity: output.hapticPattern.intensities[0] },
            { position: 'seat', motorIndex: 1, intensity: output.hapticPattern.intensities[1] },
            { position: 'lumbar', motorIndex: 2, intensity: output.hapticPattern.intensities[2] }
        ];
        
        return {
            protocolVersion: '1.0',
            deviceId: device.id,
            timestamp: Date.now(),
            priority,
            hapticCommands: motorMapping.map(m => ({
                motor: m.motorIndex,
                intensity: m.intensity,
                frequency: output.hapticPattern.frequencies[0],
                duration: output.hapticPattern.durations[0],
                waveform: 'sine'
            })),
            audioCommand: {
                frequency: output.primaryFrequency,
                volume: output.amplitude,
                duration: 1000 // Continuous while data flows
            },
            spatialPosition: output.spatialPosition,
            colorCommand: {
                hex: output.hex,
                brightness: 0.7,
                duration: 1000
            }
        };
    }
    
    /**
     * COGNITION VEST PROTOCOL: Chest-mounted feedback
     */
    private formatForCognitionVest(
        device: DeviceProfile,
        output: SonificationOutput,
        priority: string
    ): DeviceMessage {
        // Vest has 8 motors in circular pattern
        const motorCount = Math.min(8, device.capabilities.motorCount);
        const motorIntensities = [];
        
        // Create circular pattern based on spatial position
        for (let i = 0; i < motorCount; i++) {
            const angle = (i / motorCount) * Math.PI * 2;
            const positionFactor = Math.cos(angle + (output.spatialPosition * Math.PI));
            const intensity = output.hapticPattern.intensities[i % output.hapticPattern.intensities.length];
            motorIntensities.push(Math.max(0, intensity * (0.5 + positionFactor * 0.5)));
        }
        
        return {
            protocolVersion: '1.0',
            deviceId: device.id,
            timestamp: Date.now(),
            priority,
            hapticCommands: motorIntensities.map((intensity, index) => ({
                motor: index,
                intensity,
                frequency: output.hapticPattern.frequencies[index % output.hapticPattern.frequencies.length],
                duration: output.hapticPattern.durations[index % output.hapticPattern.durations.length],
                waveform: 'sine'
            })),
            audioCommand: null, // Vest typically doesn't have audio
            spatialPosition: output.spatialPosition,
            colorCommand: {
                hex: output.hex,
                brightness: 0.5,
                duration: 1000
            }
        };
    }
    
    /**
     * USER CALIBRATION PROTOCOL
     */
    async calibrateDevice(
        deviceId: string,
        calibrationSteps: CalibrationStep[]
    ): Promise<UserCalibration> {
        
        const calibration: UserCalibration = {
            sensitivityMap: new Map(),
            frequencyPreferences: new Map(),
            intensityThresholds: {
                minimumPerceptible: 0.1,
                comfortable: 0.5,
                maximumTolerable: 0.9
            },
            crossModalEnhancement: true,
            deviceSpecificTuning: {}
        };
        
        // Run through calibration steps
        for (const step of calibrationSteps) {
            await this.runCalibrationStep(deviceId, step, calibration);
        }
        
        // Save calibration
        this.userCalibrations.set(deviceId, calibration);
        
        // Update device profile
        const device = this.devices.get(deviceId);
        if (device) {
            device.calibration = calibration;
        }
        
        return calibration;
    }
    
    private async runCalibrationStep(
        deviceId: string,
        step: CalibrationStep,
        calibration: UserCalibration
    ): Promise<void> {
        // Implementation would:
        // 1. Send test pattern to device
        // 2. Wait for user feedback (via app/voice/button)
        // 3. Adjust calibration parameters
        // 4. Repeat until user confirms comfort
        
        // Placeholder implementation
        switch (step.type) {
            case 'intensity_threshold':
                // Find minimum perceptible intensity
                let intensity = 0.1;
                while (intensity < 1.0) {
                    await this.streamToDevice(deviceId, 'calibration', {
                        primaryFrequency: 432,
                        harmonics: [],
                        amplitude: 0.5,
                        envelope: { attack: 100, decay: 100, sustain: 0.5, release: 100 },
                        spatialPosition: 0,
                        hapticPattern: {
                            intensities: [intensity],
                            frequencies: [100],
                            durations: [500]
                        },
                        binauralBeat: null,
                        hue: 0,
                        saturation: 0,
                        lightness: 50,
                        rgb: [255, 255, 255],
                        hex: '#ffffff',
                        semantic: 'calibration',
                        audioFreq: 432,
                        hapticPattern: { intensity: 0.5, frequency: 100, duration: 500, pattern: 'continuous' }
                    });
                    
                    // In production: wait for user feedback via app
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    intensity += 0.1;
                }
                break;
                
            case 'frequency_preference':
                // Test different frequencies
                break;
                
            case 'spatial_mapping':
                // Map motor positions to body locations
                break;
        }
    }
}

// Type Definitions
interface DeviceProfile {
    id: string;
    type: DeviceType;
    capabilities: DeviceCapability;
    firmwareVersion: string;
    registeredAt: Date;
    lastSeen: Date;
    calibration: UserCalibration | null;
}

interface RegistrationResponse {
    deviceId: string;
    authToken: string;
    expiresAt: number;
    streamingEndpoint: string;
    calibrationEndpoint: string;
}

interface DeviceMessage {
    protocolVersion: string;
    deviceId: string;
    timestamp: number;
    priority: 'high' | 'medium' | 'low';
    hapticCommands: Array<{
        motor: number;
        intensity: number;
        frequency: number;
        duration: number;
        waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
    }>;
    audioCommand: {
        frequency: number;
        volume: number;
        duration: number;
    } | null;
    spatialPosition: number;
    colorCommand: {
        hex: string;
        brightness: number;
        duration: number;
    } | null;
}

interface CalibrationStep {
    type: 'intensity_threshold' | 'frequency_preference' | 'spatial_mapping';
    parameters: Record<string, any>;
    description: string;
}

// Export singleton
export const HardwareAPIInstance = new HardwareAPI();
