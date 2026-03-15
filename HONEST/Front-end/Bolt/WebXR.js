// Simplified gesture integration architecture
const gestureConfig = {
  modes: {
    '2d-desktop': ['swipe-right', 'swipe-left', 'pinch', 'palm-forward'],
    '3d-vr': ['pan', 'rotate', 'pinch-drag', 'two-hand-spread'],
    'audio-spatial': ['point', 'circle', 'swipe-up', 'swipe-down']
  },
  feedback: {
    audio: true,      // Text-to-speech confirmation
    haptic: true,     // Device vibration
    sonification: true // Contextual sound effects
  },
  calibration: {
    adaptive: true,    // Learns user's movement range
    sensitivity: 0.7, // 0-1, adjustable per user
    fatigueDetection: true // Suggests breaks if erratic motion detected
  }
};

// Integration with your H.O.N.E.S.T. sensory outputs
function onGestureDetected(gesture, intent) {
  // Update cognitive load (c₁) based on gesture complexity
  updateCognitiveLoad(gesture.complexity);
  
  // Provide multi-sensory feedback
  triggerHarmonicFeedback(gesture.type);  // Audio confirmation
  triggerHapticPattern(gesture.pattern);   // Tactile feedback
  updateVisualFeedback(gesture.color);     // Color flash (WCAG safe)
  
  // Log for research (H7-H12)
  logGestureForStudy({
    participantId,
    gesture,
    accuracy,
    latency,
    cognitiveLoadChange: c₁
  });
}
