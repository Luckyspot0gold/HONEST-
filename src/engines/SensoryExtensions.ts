// Olfactory (scent cartridges), Gustatory (taste strips), Thermal (thermoelectric)
export class SensoryExtensions {
  olfactory(volatility: number) {
    return volatility > 0.8 ? 'burnt_copper' : 'rain_fresh';  // Cartridge IDs
  }
  gustatory(spoilage: number) {
    return spoilage > 0.5 ? 'bitter' : 'sweet';  // Taste strip response
  }
  thermal(tempDelta: number) {
    return tempDelta > 5 ? 'warm_pulse' : 'cool_wave';  // Vest feedback
  }
}
