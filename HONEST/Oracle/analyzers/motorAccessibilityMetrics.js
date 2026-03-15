// Motor accessibility analytics
const motorAccessibilityMetrics = {
  inputModality: 'eye_dwell', // or 'facial', 'switch_morse', etc.
  selectionTime: 3400,        // ms from target appearance to selection
  errorRate: 0.12,            // 12% misselections
  fatigueIndex: 0.34,         // Derived from tremor/drift patterns
  cognitiveLoad: {
    baseline: 0.45,
    duringTask: 0.67,
    postTask: 0.52
  },
  adaptationSpeed: 0.78,      // How quickly user learned interface
  satisfaction: 4.2           // 1-5 Likert scale
};
