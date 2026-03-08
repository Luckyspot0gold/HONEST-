class ThermalPlantMonitor {
    getThermalHaptic(thermalType) {
        const thermalToHaptic = {
            'warm_pulse': { frequency: 200, pattern: 'pulse' },
            'cold_spike': { frequency: 20, pattern: 'spike' }
        };
        return thermalToHaptic[thermalType];
    }
}
