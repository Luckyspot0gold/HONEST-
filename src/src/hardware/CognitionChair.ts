cat > src/hardware/CognitionChair.ts << 'ENDOFFILE'
/**
 * Audio/Haptic/Bluetooth Cognition Chair
 * Patent Claim: Anatomical zone-mapped economic haptic furniture
 * Inventor: Justin W. McCrea, Reality Protocol LLC
 * 
 * 8-zone haptic chair with spatial audio for embodied
 * economic cognition. Each body zone maps to a specific
 * McCrea Market Metric (M3) for intuitive market perception.
 * 
 * Zones:
 * 1. Head Speakers (L/R) - HRI spatial audio (432Hz base)
 * 2. Head Vibration - SOS stability hum
 * 3. Right Shoulder Pad - IV3D[0] momentum (bullish = right)
 * 4. Left Shoulder Pad - IV3D[2] sentiment (bearish = left)
 * 5. Kidney/Lower Back - HIV chaos rumble
 * 6. Spine - ROC rate-of-change wave
 * 7. Seat - ISS whale detection thump
 * 8. Legs - HSI stability pulse
 */

import type { M3Output } from '../metrics/mccrea-m3/McCreaMarketMetrics';

export type ChairZone = 
  | 'head_speaker_left' | 'head_speaker_right'
  | 'head_vibration'
  | 'shoulder_right' | 'shoulder_left'
  | 'kidney' | 'spine'
  | 'seat' | 'legs';

export interface ChairZoneCommand {
  zone: ChairZone;
  intensity: number;
  frequency: number;
  pattern: number[];
  duration: number;
}

export class CognitionChair {
  private bluetoothDevice: any = null;
  private connected = false;

  async connect(): Promise<boolean> {
    if (!('bluetooth' in navigator)) {
      console.log('Bluetooth not available, using simulation mode');
      return false;
    }
    try {
      this.bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
        filters: [{ namePrefix: 'CognitionChair' }],
        optionalServices: ['haptic_chair_service']
      });
      const server = await this.bluetoothDevice.gatt?.connect();
      this.connected = !!server;
      console.log('Cognition Chair connected');
      return this.connected;
    } catch (e) {
      console.log('Chair connection failed:', e);
      return false;
    }
  }

  mapM3ToChair(m3: M3Output): ChairZoneCommand[] {
    const commands: ChairZoneCommand[] = [];

    // Zone 1-2: Head speakers + vibration (HRI + SOS)
    commands.push({
      zone: 'head_speaker_left',
      intensity: m3.HRI / 100,
      frequency: 432 * (1 + (m3.HRI - 50) / 200),
      pattern: [100, 50, 100],
      duration: 1000
    });
    commands.push({
      zone: 'head_speaker_right',
      intensity: m3.HRI / 100,
      frequency: 432 * (1 + (m3.HRI - 50) / 200),
      pattern: [100, 50, 100],
      duration: 1000
    });
    commands.push({
      zone: 'head_vibration',
      intensity: Math.max(0.1, m3.SOS / 100),
      frequency: 40,
      pattern: m3.SOS > 70 ? [50, 50] : [100, 30, 100],
      duration: 800
    });

    // Zone 3-4: Shoulder pads (IV3D momentum/sentiment)
    const momentum = m3.IV3D[0];
    const sentiment = m3.IV3D[2];
    commands.push({
      zone: 'shoulder_right',
      intensity: Math.max(0, momentum / 100),
      frequency: 80,
      pattern: momentum > 50 ? [150, 75, 150] : [40, 20],
      duration: 600
    });
    commands.push({
      zone: 'shoulder_left',
      intensity: Math.max(0, (100 - sentiment) / 100),
      frequency: 80,
      pattern: sentiment < 50 ? [150, 75, 150] : [40, 20],
      duration: 600
    });

    // Zone 5: Kidney (HIV chaos)
    commands.push({
      zone: 'kidney',
      intensity: m3.HIV / 100,
      frequency: 25,
      pattern: m3.HIV > 60 
        ? [200, 100, 200, 100, 200] 
        : [80, 40, 80],
      duration: 1200
    });

    // Zone 6: Spine (ROC rate of change)
    const rocAbs = Math.min(Math.abs(m3.ROC), 20);
    commands.push({
      zone: 'spine',
      intensity: rocAbs / 20,
      frequency: 50 + rocAbs * 5,
      pattern: m3.ROC > 0 
        ? [50, 30, 80, 30, 120] 
        : [120, 30, 80, 30, 50],
      duration: 1000
    });

    // Zone 7: Seat (ISS whale detection)
    commands.push({
      zone: 'seat',
      intensity: m3.ISS > 20 ? 0.9 : 0.1,
      frequency: m3.ISS > 20 ? 15 : 60,
      pattern: m3.ISS > 20 
        ? [300, 100, 300] 
        : [30, 30],
      duration: m3.ISS > 20 ? 1500 : 400
    });

    // Zone 8: Legs (HSI stability)
    commands.push({
      zone: 'legs',
      intensity: m3.HSI / 100,
      frequency: 60,
      pattern: m3.HSI > 70 
        ? [40, 40, 40, 40] 
        : [100, 50, 100, 50, 100],
      duration: 800
    });

    return commands;
  }

  async executeCommands(commands: ChairZoneCommand[]): Promise<void> {
    for (const cmd of commands) {
      if (this.connected) {
        await this.sendBluetooth(cmd);
      } else {
        this.simulateZone(cmd);
      }
    }
  }

  private async sendBluetooth(cmd: ChairZoneCommand): Promise<void> {
    console.log(`BT → ${cmd.zone}: ${(cmd.intensity * 100).toFixed(0)}% @ ${cmd.frequency}Hz`);
  }

  private simulateZone(cmd: ChairZoneCommand): void {
    if (cmd.intensity > 0.3 && 'vibrate' in navigator) {
      navigator.vibrate(cmd.pattern);
    }
    console.log(`SIM → ${cmd.zone}: ${(cmd.intensity * 100).toFixed(0)}% [${cmd.pattern}]`);
  }
}

export default CognitionChair;
ENDOFFILE
