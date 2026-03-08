class ProprioceptiveMedicalVR {
    vitalsToHaptics(vitals) {
        return {
            heartbeat: {
                zone: 'left_chest',
                pattern: this.generateHeartbeatPattern(vitals.heartRate),
                intensity: vitals.bloodPressure / 120
            },
            breathing: {
                zone: 'sternum',
                pattern: 'sinusoidal',
                frequency: vitals.respiration / 60
            }
        };
    }
}
