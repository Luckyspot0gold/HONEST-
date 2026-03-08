/**
 * Sniper Vest Hardware Integration (Patent Claim: Spatial Haptic Mapping)
 * Bluetooth vest + mobile fallback for anatomical feedback
 */

export class SniperVest {
  private device?: BluetoothDevice;
  private server?: BluetoothRemoteGATTServer;

  async connect() {
    if ('bluetooth' in navigator) {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['haptic_vest_service'] }]
      });
      this.server = await this.device.gatt?.connect();
      console.log('Sniper Vest connected');
    }
  }

  async vibrateSpatial(zone: 'left_chest' | 'wrist' | 'sternum', pattern: any) {
    if (this.server) {
      const service = await this.server.getPrimaryService('haptic_vest_service');
      const char = await service.getCharacteristic('spatial_haptic');
      await char.writeValue(this.encodeSpatialPattern(zone, pattern));
    } else {
      // Mobile fallback
      navigator.vibrate(pattern.duration || 200);
    }
  }

  private encodeSpatialPattern(zone: string, pattern: any): Uint8Array {
    const zoneCode = { left_chest: 0x01, wrist: 0x02, sternum: 0x03 }[zone];
    return new Uint8Array([zoneCode, pattern.intensity * 255, pattern.frequency, pattern.pattern.charCodeAt(0)]);
  }

  // Medical vitals example
  async pulseVitals(vitals: { hr: number; bp: number }) {
    await this.vibrateSpatial('left_chest', { 
      intensity: vitals.hr / 200, 
      frequency: vitals.bp / 2, 
      duration: 800,
      pattern: 'pulse'
    });
  }
}
