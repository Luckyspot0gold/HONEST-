/**
 * BOLT.NEW HAND GESTURE INTEGRATION
 * PATENT CLAIM: Hand/eye/head gesture-based control system for neurodivergent
 * and motor-impaired users in financial data visualization
 */

import { BoltModel, HandKeypoints } from '@boltnew/boltnew';

export interface HandGesture {
    name: string;
    confidence: number;
    keypoints: HandKeypoints[];
    timestamp: number;
    duration: number;
}

export interface EyeGaze {
    x: number;              // Screen position 0-1
    y: number;              // Screen position 0-1
    confidence: number;
    eyeOpenness: number;    // 0-1 (0=closed, 1=fully open)
    blinkState: 'open' | 'closing' | 'closed' | 'opening';
}

export interface HeadPose {
    pitch: number;          // Nodding yes (- to +)
    yaw: number;           // Shaking no (- to +)
    roll: number;          // Tilting head
    confidence: number;
    movementSpeed: number;  // Degrees per second
}

export interface GestureCommand {
    type: 'hand' | 'eye' | 'head' | 'combination';
    gesture: string;
    parameters: Record<string, any>;
    confidence: number;
    timestamp: number;
    userIntent: UserIntent;
}

export interface UserIntent {
    action: 'adjust_volume' | 'change_market' | 'mark_interpretation' |
            'pause_resume' | 'zoom_in_out' | 'toggle_mode' |
            'request_assistance' | 'emergency_stop' | 'calibrate';
    target?: string;
    value?: number;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
}

export class BoltAccessibilityController {
    private boltModel: BoltModel;
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    
    // Gesture recognition state
    private activeGestures: Map<string, HandGesture> = new Map();
    private eyeGazeHistory: EyeGaze[] = [];
    private headPoseHistory: HeadPose[] = [];
    private gestureHistory: GestureCommand[] = [];
    
    // Accessibility profiles
    private currentProfile: AccessibilityProfile;
    private userCapabilities: UserCapabilities;
    
    // Sensory system integration
    private sensorySystem: SensorySystemInterface;
    
    // Calibration data
    private calibrationData: CalibrationData = {
        screenBounds: { x: 0, y: 0, width: 1920, height: 1080 },
        headNeutral: { pitch: 0, yaw: 0, roll: 0 },
        eyeCalibrationPoints: [],
        gestureBaselines: new Map()
    };
    
    constructor(
        sensorySystem: SensorySystemInterface,
        userCapabilities: UserCapabilities
    ) {
        this.sensorySystem = sensorySystem;
        this.userCapabilities = userCapabilities;
        this.currentProfile = this.createDefaultProfile(userCapabilities);
        
        // Initialize video and canvas
        this.videoElement = document.createElement('video');
        this.canvasElement = document.createElement('canvas');
        this.context = this.canvasElement.getContext('2d')!;
        
        // Initialize Bolt model
        this.boltModel = new BoltModel({
            modelType: 'hand_eye_head',
            detectionConfidence: 0.7,
            maxHands: 2,
            eyeTracking: true,
            headPose: true,
            smoothness: 0.8
        });
    }
    
    /**
     * INITIALIZE TRACKING SYSTEM
     */
    async initialize(): Promise<void> {
        try {
            // Request camera permissions
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                    frameRate: { ideal: 30 }
                },
                audio: false
            });
            
            this.videoElement.srcObject = stream;
            await this.videoElement.play();
            
            // Load Bolt model
            await this.boltModel.load();
            
            // Start tracking loop
            this.startTrackingLoop();
            
            // Load calibration if exists
            await this.loadCalibration();
            
            console.log('Bolt Accessibility Controller initialized');
        } catch (error) {
            console.error('Failed to initialize Bolt controller:', error);
            throw new Error('Camera access required for gesture control');
        }
    }
    
    /**
     * MAIN TRACKING LOOP
     */
    private startTrackingLoop(): void {
        const processFrame = async () => {
            if (this.videoElement.readyState !== this.videoElement.HAVE_ENOUGH_DATA) {
                requestAnimationFrame(processFrame);
                return;
            }
            
            // Draw video to canvas
            this.canvasElement.width = this.videoElement.videoWidth;
            this.canvasElement.height = this.videoElement.videoHeight;
            this.context.drawImage(this.videoElement, 0, 0);
            
            // Process frame through Bolt
            const imageData = this.context.getImageData(
                0, 0,
                this.canvasElement.width,
                this.canvasElement.height
            );
            
            const predictions = await this.boltModel.predict(imageData);
            
            // Extract features
            const hands = this.extractHandGestures(predictions);
            const eyeGaze = this.extractEyeGaze(predictions);
            const headPose = this.extractHeadPose(predictions);
            
            // Update gesture tracking
            this.updateActiveGestures(hands);
            this.updateEyeGazeHistory(eyeGaze);
            this.updateHeadPoseHistory(headPose);
            
            // Detect commands from combined inputs
            const commands = this.detectCommands(hands, eyeGaze, headPose);
            
            // Execute commands
            commands.forEach(command => this.executeCommand(command));
            
            // Provide sensory feedback for successful recognition
            if (commands.length > 0) {
                this.provideConfirmationFeedback(commands);
            }
            
            requestAnimationFrame(processFrame);
        };
        
        processFrame();
    }
    
    /**
     * HAND GESTURE RECOGNITION
     */
    private extractHandGestures(predictions: any[]): HandGesture[] {
        const gestures: HandGesture[] = [];
        
        predictions.forEach((prediction, handIndex) => {
            if (!prediction.keypoints || prediction.keypoints.length < 21) {
                return;
            }
            
            // Convert Bolt keypoints to our format
            const keypoints: HandKeypoints[] = prediction.keypoints.map((kp: any) => ({
                x: kp.x,
                y: kp.y,
                z: kp.z || 0,
                confidence: kp.confidence || 1.0,
                name: kp.name || 'unknown'
            }));
            
            // Recognize gestures
            const recognizedGestures = this.recognizeGestures(keypoints, handIndex);
            gestures.push(...recognizedGestures);
        });
        
        return gestures;
    }
    
    /**
     * GESTURE RECOGNITION ENGINE
     */
    private recognizeGestures(keypoints: HandKeypoints[], handIndex: number): HandGesture[] {
        const gestures: HandGesture[] = [];
        
        // Calculate finger states
        const fingerStates = this.calculateFingerStates(keypoints);
        
        // OPEN PALM - All fingers extended
        if (this.isOpenPalm(fingerStates)) {
            gestures.push({
                name: 'open_palm',
                confidence: this.calculateGestureConfidence(keypoints, 'open_palm'),
                keypoints,
                timestamp: Date.now(),
                duration: 0
            });
        }
        
        // FIST - All fingers closed
        if (this.isFist(fingerStates)) {
            gestures.push({
                name: 'fist',
                confidence: this.calculateGestureConfidence(keypoints, 'fist'),
                keypoints,
                timestamp: Date.now(),
                duration: 0
            });
        }
        
        // THUMBS UP - Thumb extended, others closed
        if (this.isThumbsUp(fingerStates, keypoints)) {
            gestures.push({
                name: 'thumbs_up',
                confidence: this.calculateGestureConfidence(keypoints, 'thumbs_up'),
                keypoints,
                timestamp: Date.now(),
                duration: 0
            });
        }
        
        // THUMBS DOWN - Thumb extended downward
        if (this.isThumbsDown(fingerStates, keypoints)) {
            gestures.push({
                name: 'thumbs_down',
                confidence: this.calculateGestureConfidence(keypoints, 'thumbs_down'),
                keypoints,
                timestamp: Date.now(),
                duration: 0
            });
        }
        
        // PEACE SIGN - Index and middle extended
        if (this.isPeaceSign(fingerStates)) {
            gestures.push({
                name: 'peace_sign',
                confidence: this.calculateGestureConfidence(keypoints, 'peace_sign'),
                keypoints,
                timestamp: Date.now(),
                duration: 0
            });
        }
        
        // OK SIGN - Thumb and index forming circle
        if (this.isOKSign(fingerStates, keypoints)) {
            gestures.push({
                name: 'ok_sign',
                confidence: this.calculateGestureConfidence(keypoints, 'ok_sign'),
                keypoints,
                timestamp: Date.now(),
                duration: 0
            });
        }
        
        // POINTING - Index finger extended
        if (this.isPointing(fingerStates)) {
            gestures.push({
                name: 'point',
                confidence: this.calculateGestureConfidence(keypoints, 'point'),
                keypoints,
                timestamp: Date.now(),
                duration: 0
            });
        }
        
        // PINCH - Thumb and index close together
        if (this.isPinch(keypoints)) {
            gestures.push({
                name: 'pinch',
                confidence: this.calculateGestureConfidence(keypoints, 'pinch'),
                keypoints,
                timestamp: Date.now(),
                duration: 0
            });
        }
        
        // SWIPE DETECTION (requires history)
        const swipeGesture = this.detectSwipe(keypoints, handIndex);
        if (swipeGesture) {
            gestures.push(swipeGesture);
        }
        
        return gestures;
    }
    
    /**
     * EYE GAZE TRACKING
     */
    private extractEyeGaze(predictions: any[]): EyeGaze {
        // Extract eye gaze from Bolt predictions
        const eyeData = predictions.find(p => p.type === 'eye');
        
        if (!eyeData || !eyeData.gaze) {
            return {
                x: 0.5,
                y: 0.5,
                confidence: 0,
                eyeOpenness: 1,
                blinkState: 'open'
            };
        }
        
        // Convert to screen coordinates
        const screenX = this.mapToScreenX(eyeData.gaze.x);
        const screenY = this.mapToScreenY(eyeData.gaze.y);
        
        return {
            x: screenX,
            y: screenY,
            confidence: eyeData.confidence || 0.7,
            eyeOpenness: eyeData.eyeOpenness || 1,
            blinkState: this.determineBlinkState(eyeData)
        };
    }
    
    /**
     * HEAD POSE TRACKING
     */
    private extractHeadPose(predictions: any[]): HeadPose {
        const headData = predictions.find(p => p.type === 'head');
        
        if (!headData || !headData.pose) {
            return {
                pitch: 0,
                yaw: 0,
                roll: 0,
                confidence: 0,
                movementSpeed: 0
            };
        }
        
        // Calculate movement speed from history
        const currentPose = headData.pose;
        const previousPose = this.headPoseHistory[this.headPoseHistory.length - 1];
        
        let movementSpeed = 0;
        if (previousPose) {
            const deltaTime = Date.now() - (previousPose as any).timestamp;
            const deltaPitch = Math.abs(currentPose.pitch - previousPose.pitch);
            const deltaYaw = Math.abs(currentPose.yaw - previousPose.yaw);
            const deltaRoll = Math.abs(currentPose.roll - previousPose.roll);
            
            const totalDelta = deltaPitch + deltaYaw + deltaRoll;
            movementSpeed = deltaTime > 0 ? totalDelta / (deltaTime / 1000) : 0;
        }
        
        return {
            pitch: currentPose.pitch,
            yaw: currentPose.yaw,
            roll: currentPose.roll,
            confidence: headData.confidence || 0.8,
            movementSpeed
        };
    }
    
    /**
     * COMMAND DETECTION FROM COMBINED INPUTS
     */
    private detectCommands(
        hands: HandGesture[],
        eyeGaze: EyeGaze,
        headPose: HeadPose
    ): GestureCommand[] {
        const commands: GestureCommand[] = [];
        
        // HAND GESTURE COMMANDS
        hands.forEach(gesture => {
            const command = this.gestureToCommand(gesture);
            if (command) commands.push(command);
        });
        
        // EYE GAZE COMMANDS (dwell time)
        const gazeCommand = this.gazeToCommand(eyeGaze);
        if (gazeCommand) commands.push(gazeCommand);
        
        // HEAD POSE COMMANDS
        const headCommand = this.headPoseToCommand(headPose);
        if (headCommand) commands.push(headCommand);
        
        // COMBINATION COMMANDS (hand + eye, eye + head, etc.)
        const combinationCommands = this.detectCombinationCommands(hands, eyeGaze, headPose);
        commands.push(...combinationCommands);
        
        return commands;
    }
    
    /**
     * MAPPING: GESTURE → FINANCIAL SENSORY SYSTEM COMMAND
     */
    private gestureToCommand(gesture: HandGesture): GestureCommand | null {
        // Get gesture mapping from current accessibility profile
        const mapping = this.currentProfile.gestureMappings[gesture.name];
        
        if (!mapping || gesture.confidence < mapping.minConfidence) {
            return null;
        }
        
        // Check if gesture meets duration threshold
        const existingGesture = this.activeGestures.get(gesture.name);
        if (existingGesture) {
            gesture.duration = Date.now() - existingGesture.timestamp;
        } else {
            gesture.duration = 0;
        }
        
        // Update active gestures
        this.activeGestures.set(gesture.name, gesture);
        
        // Only trigger if gesture held for required time
        if (gesture.duration < mapping.holdTime) {
            return null;
        }
        
        // Calculate parameters based on gesture properties
        const parameters = this.calculateGestureParameters(gesture, mapping);
        
        return {
            type: 'hand',
            gesture: gesture.name,
            parameters,
            confidence: gesture.confidence,
            timestamp: Date.now(),
            userIntent: {
                action: mapping.action,
                target: mapping.target,
                value: parameters.value,
                urgency: mapping.urgency || 'medium'
            }
        };
    }
    
    /**
     * EYE GAZE COMMANDS (Dwell selection)
     */
    private gazeToCommand(gaze: EyeGaze): GestureCommand | null {
        // Update gaze history
        this.eyeGazeHistory.push({
            ...gaze,
            timestamp: Date.now()
        });
        
        // Keep only recent history
        if (this.eyeGazeHistory.length > 60) { // 2 seconds at 30fps
            this.eyeGazeHistory.shift();
        }
        
        // Check for dwell (looking at same spot)
        if (this.eyeGazeHistory.length < 30) return null; // Need at least 1 second
        
        const recentGazes = this.eyeGazeHistory.slice(-30);
        const avgX = recentGazes.reduce((sum, g) => sum + g.x, 0) / recentGazes.length;
        const avgY = recentGazes.reduce((sum, g) => sum + g.y, 0) / recentGazes.length;
        
        // Calculate variance
        const varianceX = recentGazes.reduce((sum, g) => sum + Math.pow(g.x - avgX, 2), 0) / recentGazes.length;
        const varianceY = recentGazes.reduce((sum, g) => sum + Math.pow(g.y - avgY, 2), 0) / recentGazes.length;
        
        // Low variance = dwell
        if (varianceX < 0.001 && varianceY < 0.001 && gaze.confidence > 0.7) {
            // Map gaze position to screen element
            const screenElement = this.mapGazeToElement(avgX, avgY);
            
            if (screenElement) {
                return {
                    type: 'eye',
                    gesture: 'dwell_select',
                    parameters: {
                        screenX: avgX,
                        screenY: avgY,
                        element: screenElement,
                        dwellTime: recentGazes.length / 30 // seconds
                    },
                    confidence: gaze.confidence,
                    timestamp: Date.now(),
                    userIntent: {
                        action: 'select_element',
                        target: screenElement.id,
                        value: avgX,
                        urgency: 'low'
                    }
                };
            }
        }
        
        // Check for blink patterns
        const blinkPattern = this.detectBlinkPattern(this.eyeGazeHistory);
        if (blinkPattern) {
            return {
                type: 'eye',
                gesture: blinkPattern.pattern,
                parameters: {
                    blinkCount: blinkPattern.count,
                    pattern: blinkPattern.pattern
                },
                confidence: gaze.confidence,
                timestamp: Date.now(),
                userIntent: {
                    action: this.mapBlinkPatternToAction(blinkPattern.pattern),
                    urgency: blinkPattern.count > 3 ? 'high' : 'medium'
                }
            };
        }
        
        return null;
    }
    
    /**
     * HEAD POSE COMMANDS
     */
    private headPoseToCommand(pose: HeadPose): GestureCommand | null {
        // Update head pose history
        this.headPoseHistory.push({
            ...pose,
            timestamp: Date.now()
        });
        
        if (this.headPoseHistory.length > 60) {
            this.headPoseHistory.shift();
        }
        
        // Detect nodding (yes)
        const nodPattern = this.detectNodPattern(this.headPoseHistory);
        if (nodPattern) {
            return {
                type: 'head',
                gesture: 'nod',
                parameters: {
                    intensity: nodPattern.intensity,
                    speed: nodPattern.speed,
                    count: nodPattern.count
                },
                confidence: pose.confidence,
                timestamp: Date.now(),
                userIntent: {
                    action: 'confirm_action',
                    urgency: 'medium'
                }
            };
        }
        
        // Detect shaking (no)
        const shakePattern = this.detectShakePattern(this.headPoseHistory);
        if (shakePattern) {
            return {
                type: 'head',
                gesture: 'shake',
                parameters: {
                    intensity: shakePattern.intensity,
                    speed: shakePattern.speed,
                    count: shakePattern.count
                },
                confidence: pose.confidence,
                timestamp: Date.now(),
                userIntent: {
                    action: 'cancel_action',
                    urgency: 'medium'
                }
            };
        }
        
        // Detect tilt (maybe/unsure)
        const tiltPattern = this.detectTiltPattern(this.headPoseHistory);
        if (tiltPattern) {
            return {
                type: 'head',
                gesture: 'tilt',
                parameters: {
                    direction: tiltPattern.direction,
                    angle: tiltPattern.angle
                },
                confidence: pose.confidence,
                timestamp: Date.now(),
                userIntent: {
                    action: 'toggle_mode',
                    target: 'uncertainty_mode',
                    urgency: 'low'
                }
            };
        }
        
        return null;
    }
    
    /**
     * COMBINATION COMMANDS (Multi-modal)
     */
    private detectCombinationCommands(
        hands: HandGesture[],
        eyeGaze: EyeGaze,
        headPose: HeadPose
    ): GestureCommand[] {
        const commands: GestureCommand[] = [];
        
        // HAND + EYE: Point at something while looking at it
        const pointingGesture = hands.find(g => g.name === 'point');
        if (pointingGesture && pointingGesture.confidence > 0.8) {
            // Get pointing direction
            const pointingDirection = this.calculatePointingDirection(pointingGesture.keypoints);
            
            // Check if pointing direction aligns with gaze
            const gazeTarget = { x: eyeGaze.x, y: eyeGaze.y };
            const pointingTarget = this.calculatePointingTarget(pointingDirection);
            
            const distance = Math.sqrt(
                Math.pow(gazeTarget.x - pointingTarget.x, 2) +
                Math.pow(gazeTarget.y - pointingTarget.y, 2)
            );
            
            if (distance < 0.1) { // Pointing and looking at same place
                commands.push({
                    type: 'combination',
                    gesture: 'point_and_look',
                    parameters: {
                        pointingDirection,
                        gazeTarget,
                        distance
                    },
                    confidence: Math.min(pointingGesture.confidence, eyeGaze.confidence),
                    timestamp: Date.now(),
                    userIntent: {
                        action: 'precise_select',
                        target: 'precise_element',
                        value: distance,
                        urgency: 'high'
                    }
                });
            }
        }
        
        // EYE + HEAD: Look at something and nod
        if (headPose.movementSpeed > 30 && Math.abs(headPose.pitch) > 10) {
            // Quick nod while looking at something
            const gazeElement = this.mapGazeToElement(eyeGaze.x, eyeGaze.y);
            if (gazeElement) {
                commands.push({
                    type: 'combination',
                    gesture: 'look_and_nod',
                    parameters: {
                        gazeElement: gazeElement.id,
                        nodIntensity: Math.abs(headPose.pitch),
                        nodSpeed: headPose.movementSpeed
                    },
                    confidence: Math.min(eyeGaze.confidence, headPose.confidence),
                    timestamp: Date.now(),
                    userIntent: {
                        action: 'select_and_confirm',
                        target: gazeElement.id,
                        urgency: 'high'
                    }
                });
            }
        }
        
        // HAND + HEAD: Thumbs up with nod
        const thumbsUpGesture = hands.find(g => g.name === 'thumbs_up');
        if (thumbsUpGesture && Math.abs(headPose.pitch) > 5) {
            commands.push({
                type: 'combination',
                gesture: 'thumbs_up_nod',
                parameters: {
                    gestureConfidence: thumbsUpGesture.confidence,
                    nodAngle: headPose.pitch
                },
                confidence: Math.min(thumbsUpGesture.confidence, headPose.confidence),
                timestamp: Date.now(),
                userIntent: {
                    action: 'strong_confirm',
                    urgency: 'high'
                }
            });
        }
        
        return commands;
    }
    
    /**
     * EXECUTE COMMANDS ON SENSORY SYSTEM
     */
    private executeCommand(command: GestureCommand): void {
        console.log(`Executing command: ${command.gesture}`, command);
        
        // Execute based on user intent
        switch (command.userIntent.action) {
            case 'adjust_volume':
                this.sensorySystem.adjustAudioVolume(command.parameters.value || 0.1);
                break;
                
            case 'adjust_haptic':
                this.sensorySystem.adjustHapticIntensity(command.parameters.value || 0.1);
                break;
                
            case 'adjust_visual':
                this.sensorySystem.adjustVisualBrightness(command.parameters.value || 0.1);
                break;
                
            case 'change_market':
                this.sensorySystem.navigateToMarket(command.parameters.marketId);
                break;
                
            case 'mark_interpretation':
                this.sensorySystem.markInterpretation(
                    command.parameters.prediction || 'neutral',
                    command.parameters.confidence || 0.7
                );
                break;
                
            case 'pause_resume':
                this.sensorySystem.togglePause();
                break;
                
            case 'zoom_in_out':
                this.sensorySystem.adjustZoom(command.parameters.direction === 'in' ? 1.1 : 0.9);
                break;
                
            case 'toggle_mode':
                this.sensorySystem.toggleSensoryMode(command.parameters.mode);
                break;
                
            case 'request_assistance':
                this.sensorySystem.requestAssistance(command.parameters.assistanceType);
                break;
                
            case 'emergency_stop':
                this.sensorySystem.emergencyStop();
                break;
                
            case 'calibrate':
                this.startCalibration(command.parameters.calibrationType);
                break;
                
            case 'select_element':
                this.sensorySystem.selectElement(command.parameters.elementId);
                break;
                
            case 'confirm_action':
                this.sensorySystem.confirmAction();
                break;
                
            case 'cancel_action':
                this.sensorySystem.cancelAction();
                break;
                
            case 'precise_select':
                this.sensorySystem.preciseSelect(command.parameters.target);
                break;
                
            case 'select_and_confirm':
                this.sensorySystem.selectAndConfirm(command.parameters.target);
                break;
                
            case 'strong_confirm':
                this.sensorySystem.confirmWithStrength(command.parameters.strength || 1.0);
                break;
        }
        
        // Log command for training
        this.logCommandForTraining(command);
    }
    
    /**
     * ACCESSIBILITY PROFILES
     */
    createDefaultProfile(capabilities: UserCapabilities): AccessibilityProfile {
        const profile: AccessibilityProfile = {
            profileId: 'default_neurodivergent',
            profileName: 'Neurodivergent Default',
            userCapabilities: capabilities,
            gestureMappings: this.getDefaultGestureMappings(capabilities),
            eyeGazeSettings: {
                dwellTime: capabilities.motorControl === 'limited' ? 2000 : 1000,
                blinkDetection: capabilities.blinkControl ? 'single_double' : 'none',
                gazeSmoothing: 0.8,
                gazePrediction: capabilities.motorControl === 'tremor' ? 0.3 : 0
            },
            headPoseSettings: {
                nodThreshold: 15,
                shakeThreshold: 20,
                tiltThreshold: 25,
                speedSensitivity: capabilities.motorControl === 'slow' ? 0.5 : 1.0
            },
            handGestureSettings: {
                minConfidence: capabilities.motorControl === 'tremor' ? 0.6 : 0.7,
                holdTime: capabilities.motorControl === 'slow' ? 1500 : 800,
                twoHandedGestures: capabilities.handsAvailable === 2,
                allowSymmetricalGestures: capabilities.motorControl === 'asymmetric'
            },
            sensoryFeedback: {
                audioConfirmation: capabilities.hearing !== 'impaired',
                hapticConfirmation: capabilities.touchSensitivity !== 'impaired',
                visualConfirmation: capabilities.vision !== 'impaired',
                confirmationDuration: 500
            },
            combinationGestures: {
                enabled: capabilities.cognitiveLoad === 'low',
                timeout: 2000,
                requireConfirmation: capabilities.cognitiveLoad === 'high'
            }
        };
        
        return profile;
    }
    
    /**
     * CALIBRATION SYSTEM
     */
    async startCalibration(type: 'eye' | 'head' | 'hand' | 'full'): Promise<void> {
        console.log(`Starting ${type} calibration`);
        
        switch (type) {
            case 'eye':
                await this.calibrateEyeTracking();
                break;
            case 'head':
                await this.calibrateHeadTracking();
                break;
            case 'hand':
                await this.calibrateHandTracking();
                break;
            case 'full':
                await this.calibrateFullSystem
