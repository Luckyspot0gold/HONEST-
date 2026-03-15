// Facial gesture engine
const facialGestureConfig = {
  sensors: ['webcam', 'optional_EMG'], // EMG for reliability
  
  gestures: {
    'eyebrow_raise': {
      threshold: 0.6,
      holdTime: 200,
      cooldown: 500,
      action: 'SELECT',
      audioFeedback: 'ascending-tone'
    },
    'left_smile': {
      threshold: 0.5,
      action: 'NEXT_ELEMENT',
      hapticPattern: 'short-pulse-right' // Haptic feedback on right side
    },
    'jaw_clench': {
      threshold: 0.7,
      mode: 'HOLD', // Hold to drag, release to drop
      action: 'GRAB_RELEASE'
    }
  },
  
  // ALS-specific adaptations
  adaptations: {
    reducedMobility: true,    // Detects limited range of motion
    fatigueDetection: true,   // Monitors gesture strength decay
    autoScaling: true,        // Adjusts thresholds as condition progresses
    fallbackToEye: true       // If facial fails, switch to eye-only
  }
};
