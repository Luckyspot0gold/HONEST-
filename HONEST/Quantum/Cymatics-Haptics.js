// Generate Quantum-Enhanced Haptic Patterns (from whitepaper)
function generateQuantumHapticPattern(frequency, lambda, entanglement, intensity = 1) {
  const basePattern = 1000 / frequency * 100;
  const lambdaPattern = 1000 / lambda * 100;
  const quantumPattern = [
    basePattern * intensity,
    50,
    lambdaPattern * intensity,
    100,
    basePattern * entanglement,
    150
  ];
  return quantumPattern;
}

// Market Volatility Feedback
function getVolatilityFeedback(volatility) {
  if (volatility < 10) return 'Low: Gentle, steady vibrations';
  if (volatility < 30) return 'Medium: Pulsing patterns';
  if (volatility < 50) return 'High: Rapid, intense vibrations';
  return 'Extreme: Emergency vibration sequences';
}

// Example Usage: Tie to market data
const sampleFreq = 432;
const sampleLambda = 111.11;
const sampleEntanglement = 0.8;
const pattern = generateQuantumHapticPattern(sampleFreq, sampleLambda, sampleEntanglement, 1.2);
console.log('Haptic Pattern:', pattern);

// Vibrate (Web API for testing)
if ('vibrate' in navigator) {
  navigator.vibrate(pattern);
} else {
  console.log('Vibration API not supported—use Bluetooth vest.');
}

// UI Controls (e.g., bind to buttons)
document.getElementById('startHaptics').addEventListener('click', () => {
  navigator.vibrate(pattern);
});
