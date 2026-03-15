// Eye tracking configuration for severe motor impairment
const eyeTrackingConfig = {
  calibration: {
    points: 9,              // Standard 9-point calibration
    adaptiveDrift: true,    // Compensates for head movement/position changes
    recalibrationInterval: 300, // Auto-recalibrate every 5 minutes
    fatigueCompensation: true   // Adjusts for drooping eyelids
  },
  
  interactionModes: {
    // Mode 1: Dwell selection (for stable gaze)
    dwell: {
      activationTime: 800,    // ms to trigger (adjustable 500-2000ms)
      visualFeedback: 'progress-ring', // Fills as you look
      audioFeedback: 'countdown-beep', // Audio countdown
      hapticFeedback: 'pulse'  // If wearable haptic device available
    },
    
    // Mode 2: Blink selection (for users who can blink reliably)
    blink: {
      sensitivity: 0.7,       // Threshold for blink detection
      doubleBlink: true,      // Double-blink for right-click/context
      blinkHold: false        // Long blink for drag operations
    },
    
    // Mode 3: Smooth pursuit (for users with nystagmus or unstable gaze)
    pursuit: {
      targetFollowing: true,  // Follow moving targets
      velocityThreshold: 30   // deg/s to distinguish pursuit from saccade
    }
  },
  
  // H.O.N.E.S.T. integration: Map gaze to data exploration
  financialNavigation: {
    heatmapGaze: true,        // Track where users look on charts
    audioPanner: true,        // Sonify data based on gaze direction
    zoomOnDwell: true,        // Auto-zoom where looking
    snapToData: true          // Magnetic snapping to data points
  }
};
