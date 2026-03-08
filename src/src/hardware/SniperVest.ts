SNIPER VEST (Front View)
    ┌─────────────────────────────┐
    │  Z1: Head Zone            │ ← Top of shoulders/neck
    │  ┌─────────────────────┐  │
    │  │  Z2: Left Shoulder  │  │ ← + Speaker #1
    │  │  Vibration        │  │
    │  └─────────────────────┘  │
    │                         │
    │  Z3: Right Shoulder    │ ← + Speaker #2
    │  Vibration           │
    │                         │
    │  Z4: Left Kidney      Z5: Right Kidney │ ← + Speakers #3 & #4
    │  Vibration          Vibration        │
    │                         │
    │  Z6: Between Shoulder Blades │ ← Center spine
    │  Vibration           │
    │                         │
    │  Z7: Lower Spine Center │ ← Bottom of vest
    │  Vibration           │
    └─────────────────────────────┘
/**
 * Sniper Vest for Haptic Trading
 * Patent Claim: Anatomical torso-mapped economic haptic feedback
 * Inventor: Justin W. McCrea, Reality Protocol LLC
 * 
 * 7 vibration zones + 4 speakers for embodied market perception
 * 
 * Zones:
 * Z1: Head Zone (HRI/ROC)
 * Z2: Left Shoulder Zone (IV3D sentiment)
 * Z3: Right Shoulder Zone (IV3D momentum)
 * Z4: Left Kidney Zone (HIV/ISS)
 * Z5: Right Kidney Zone (HIV/ISS)
 * Z6: Between Shoulder Blades (SOS)
 * Z7: Lower Spine Center (HSI)
 * 
 * Speakers:
 * S1: Left Shoulder Speaker
 * S2: Right Shoulder Speaker
 * S3: Left Kidney Speaker
 * S4: Right Kidney Speaker
 */

import type { M3Output } from '../metrics/mccrea-m3/McCreaMarketMetrics';

export type VestZone =
  | 'Z1_head' | 'Z2_left_shoulder' | 'Z3_right_shoulder'
  | 'Z4_left_kidney' | 'Z5_right_kidney'
  | 'Z6_between_blades' | 'Z7_lower_spine';

export type VestSpeakerChannel =
  | 'S1_left_shoulder' | 'S2_right_shoulder'
  | 'S3_left_kidney' | 'S4_right_kidney';

export interface VestZoneCommand {
  zone: VestZone;
  intensity: number;
  frequency: number;
  pattern: number[];
  duration: number;
}

export interface VestSpeakerCommand {
  channel: VestSpeakerChannel;
  frequency: number;
  volume: number;
  waveform: 'sine' | 'triangle' | 'sawtooth';
  pan: number;
}

export class SniperVest {
  private bluetoothDevice: any = null;
  private audioCtx: AudioContext | null = null;
  private connected = false;

  async connect(): Promise<boolean> {
    try {
      if ('bluetooth' in navigator) {
        this.bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
          filters: [{ namePrefix: 'SniperVest' }],
          optionalServices: ['haptic_vest_service']
        });
        const server = await this.bluetoothDevice.gatt?.connect();
        this.connected = !!server;
      }
    } catch (e) {
      console.log('Bluetooth unavailable, simulation mode');
    }

    if (typeof AudioContext !== 'undefined') {
      this.audioCtx = new AudioContext();
    }

    return this.connected;
  }

  mapM3ToZones(m3: M3Output): VestZoneCommand[] {
    const momentum = m3.IV3D[0];
    const volatility = m3.IV3D[1];
    const sentiment = m3.IV3D[2];

    return [
      {
        zone: 'Z1_head',
        intensity: Math.max(0.1, m3.HRI / 100),
        frequency: 40,
        pattern: m3.HRI > 70 ? [60, 30, 60] : [100, 50, 100],
        duration: 800
      },
      {
        zone: 'Z2_left_shoulder',
        intensity: Math.max(0, (100 - sentiment) / 100),
        frequency: 80,
        pattern: sentiment < 40 ? [150, 75, 150] : [40, 20],
        duration: 600
      },
      {
        zone: 'Z3_right_shoulder',
        intensity: Math.max(0, momentum / 100),
        frequency: 80,
        pattern: momentum > 50 ? [150, 75, 150] : [40, 20],
        duration: 600
      },
      {
        zone: 'Z4_left_kidney',
        intensity: Math.min(1, m3.HIV / 80),
        frequency: 25,
        pattern: m3.HIV > 60 ? [200, 100, 200, 100] : [60, 30],
        duration: 1000
      },
      {
        zone: 'Z5_right_kidney',
        intensity: Math.min(1, m3.HIV / 100),
        frequency: 25,
        pattern: m3.HIV > 40 ? [150, 75, 150] : [40, 20],
        duration: 1000
      },
      {
        zone: 'Z6_between_blades',
        intensity: m3.SOS / 100,
        frequency: 45,
        pattern: m3.SOS > 60 ? [50, 50, 50] : [120, 60, 120],
        duration: 900
      },
      {
        zone: 'Z7_lower_spine',
        intensity: m3.HSI / 100,
        frequency: 60,
        pattern: m3.HSI > 70 ? [40, 40, 40, 40] : [100, 50, 100],
        duration: 800
      }
    ];
  }

  mapM3ToSpeakers(m3: M3Output): VestSpeakerCommand[] {
    const baseFreq = 432 * (1 + (m3.HRI - 50) / 200);
    const bullishFreq = baseFreq * 1.25;
    const bearishFreq = baseFreq * 0.8;
    const bassFreq = baseFreq * 0.25;
    const chaosWave = m3.HIV > 60 ? 'sawtooth' as const : 'sine' as const;

    return [
      {
        channel: 'S1_left_shoulder',
        frequency: baseFreq,
        volume: Math.min(0.8, m3.HRI / 120),
        waveform: 'sine',
        pan: -0.7
      },
      {
        channel: 'S2_right_shoulder',
        frequency: baseFreq,
        volume: Math.min(0.8, m3.HRI / 120),
        waveform: 'sine',
        pan: 0.7
      },
      {
        channel: 'S3_left_kidney',
        frequency: bassFreq,
        volume: Math.min(0.6, m3.HIV / 150),
        waveform: chaosWave,
        pan: -0.5
      },
      {
        channel: 'S4_right_kidney',
        frequency: bassFreq,
        volume: Math.min(0.6, m3.HIV / 150),
        waveform: chaosWave,
        pan: 0.5
      }
    ];
  }

  async playSpeakers(commands: VestSpeakerCommand[]): Promise<void> {
    if (!this.audioCtx) return;

    for (const cmd of commands) {
      if (cmd.volume < 0.05) continue;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const panner = this.audioCtx.createStereoPanner();

      osc.type = cmd.waveform;
      osc.frequency.value = cmd.frequency;
      gain.gain.value = cmd.volume;
      panner.pan.value = cmd.pan;

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 1.5);
    }
  }

  async executeAll(m3: M3Output): Promise<void> {
    const zones = this.mapM3ToZones(m3);
    const speakers = this.mapM3ToSpeakers(m3);

    for (const cmd of zones) {
      if (this.connected) {
        console.log(`BT ${cmd.zone}: ${(cmd.intensity * 100).toFixed(0)}%`);
      } else if (cmd.intensity > 0.2 && 'vibrate' in navigator) {
        navigator.vibrate(cmd.pattern);
      }
      console.log(`ZONE ${cmd.zone}: ${(cmd.intensity * 100).toFixed(0)}% @ ${cmd.frequency}Hz [${cmd.pattern}]`);
    }

    await this.playSpeakers(speakers);
  }
}

export default SniperVest;
