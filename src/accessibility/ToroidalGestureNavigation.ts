// src/accessibility/ToroidalGestureNavigation.ts
export class ToroidalGestureNavigation {
  private gestureMap: Map<Gesture, ToroidalMovement>;
  private currentPosition: ToroidalCoordinate;
  private screenReader: ScreenReaderAdapter;
  private hapticEngine: HapticEngine;
  
  constructor() {
    this.gestureMap = this.createGestureMap();
    this.currentPosition = { theta: 0, phi: 0, radius: 1 };
    this.screenReader = new ScreenReaderAdapter();
    this.hapticEngine = new HapticEngine();
  }
  
  private createGestureMap(): Map<Gesture, ToroidalMovement> {
    return new Map([
      ['swipe_right', { dTheta: Math.PI/8, dPhi: 0, dRadius: 0 }],
      ['swipe_left', { dTheta: -Math.PI/8, dPhi: 0, dRadius: 0 }],
      ['swipe_up', { dTheta: 0, dPhi: Math.PI/8, dRadius: 0 }],
      ['swipe_down', { dTheta: 0, dPhi: -Math.PI/8, dRadius: 0 }],
      ['pinch_in', { dTheta: 0, dPhi: 0, dRadius: -0.1 }],
      ['pinch_out', { dTheta: 0, dPhi: 0, dRadius: 0.1 }],
      ['rotate_cw', { dTheta: Math.PI/4, dPhi: 0, dRadius: 0 }],
      ['rotate_ccw', { dTheta: -Math.PI/4, dPhi: 0, dRadius: 0 }],
      ['double_tap', { dTheta: 0, dPhi: 0, dRadius: 0, action: 'select' }],
      ['open_palm', { dTheta: 0, dPhi: 0, dRadius: 0, action: 'menu' }]
    ]);
  }
  
  handleGesture(gesture: Gesture): NavigationResult {
    const movement = this.gestureMap.get(gesture);
    if (!movement) return { success: false };
    
    // Update position on torus
    this.currentPosition.theta = 
      (this.currentPosition.theta + movement.dTheta) % (2 * Math.PI);
    this.currentPosition.phi = 
      (this.currentPosition.phi + movement.dPhi) % (2 * Math.PI);
    this.currentPosition.radius = 
      Math.max(0.1, Math.min(2, this.currentPosition.radius + movement.dRadius));
    
    // Get content at new position
    const content = this.getContentAtPosition(this.currentPosition);
    
    // Provide multi-sensory feedback
    this.screenReader.speak(this.describePosition(content));
    this.hapticEngine.playPattern(this.getHapticPattern(content));
    
    return {
      success: true,
      newPosition: this.currentPosition,
      content,
      layer: this.getLayerAtRadius(this.currentPosition.radius)
    };
  }
  
  private getLayerAtRadius(radius: number): ToroidalLayer {
    if (radius < 0.5) return 'foundational';
    if (radius < 1.0) return 'physical';
    if (radius < 1.5) return 'metaphysical';
    return 'creative';
  }
}
