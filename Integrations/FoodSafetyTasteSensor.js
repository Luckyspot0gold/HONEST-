class FoodSafetyTasteSensor {
    generateAlert(spoilageLevel) {
        const alert = spoilageLevel < 0.3 ? 'safe' : spoilageLevel < 0.7 ? 'caution' : 'unsafe';
        return {
            visual: { color: alert === 'safe' ? 'green' : 'red' },
            audio: { frequency: alert === 'safe' ? 528 : 852 },
            haptic: { pattern: alert === 'safe' ? 'single_tap' : 'rapid_pulse' }
        };
    }
}
