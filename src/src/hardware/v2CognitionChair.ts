/**
 * Audio/Haptic/Bluetooth Cognition Chair
 * 12 Haptic Zones + 6 Speakers
 * Patent Claim: Anatomical zone-mapped economic haptic furniture
 * Inventor: Justin W. McCrea, Reality Protocol LLC
 *
 * ZONES:
 * Z1:  Head vibration (HRI resonance)
 * Z2:  Right shoulder vibration (IV3D momentum)
 * Z3:  Left shoulder vibration (IV3D sentiment)
 * Z4:  Right kidney (HIV chaos high)
 * Z5:  Left kidney (HIV chaos low)
 * Z6:  Seat pad right (ISS whale buy)
 * Z7:  Seat pad tailbone (ROC rate of change)
 * Z8:  Seat pad left (ISS whale sell)
 * Z9:  Right thigh (HSI stability high)
 * Z10: Left thigh (HSI stability low)
 * Z11: Lower spine center (SOS sonic stability)
 * Z12: Spine/head top upright (HRI peak resonance)
 *
 * SPEAKERS:
 * S1: Head left (432Hz harmonic L channel)
 * S2: Head right (432Hz harmonic R channel)
 * S3: Shoulder right (bullish chord)
 * S4: Shoulder left (bearish chord)
 * S5: Chair leg fold right (bass rumble)
 * S6: Chair leg fold left (bass rumble)
 */

import type { M3Output } from '../metrics/mccrea-m3/McCreaMarketMetrics';

export type HapticZone =
  | 'Z1_head' | 'Z2_shoulder_right' | 'Z3_shoulder_left'
  | 'Z4_kidney_right' | 'Z5_kidney_left'
  | 'Z6_seat_right' | 'Z7_seat_tailbone' | 'Z8_seat_left'
  | 'Z9_thigh_right' | 'Z10_thigh_left'
  | 'Z11_lower_spine' | 'Z12_upper_spine_head';

export type SpeakerChannel =
  | 'S1_head_left' | 'S2_head_right'
  | 'S3_shoulder_right' | 'S4_shoulder_left'
  | 'S5_leg_right' | 'S6_leg_left';

export interface ZoneCommand {
  zone: HapticZone;
  intensity: number;
  frequency: number;
  pattern: number[];
  duration: number;
}

export interface SpeakerCommand {
  channel: SpeakerChannel;
  frequency: number;
  volume: number;
  waveform: 'sine' | 'triangle' | 'sawtooth';
  pan: number;
}

export class CognitionChair {
  private bluetoothDevice: any = null;
  private audioCtx: AudioContext | null = null;
  private connected = false;

  async connect(): Promise<boolean> {
    try {
      if ('bluetooth' in navigator) {
        this.bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
          filters: [{ namePrefix: 'CognitionChair' }],
          optionalServices: ['haptic_chair_service']
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

  mapM3ToZones(m3: M3Output): ZoneCommand[] {
    const momentum = m3.IV3D[0];
    const volatility = m3.IV3D[1];
    const sentiment = m3.IV3D[2];

    return [
      {
        zone: 'Z1_head',
        intensity: m3.HRI / 100,
        frequency: 40,
        pattern: m3.HRI > 70 ? [60, 30, 60] : [100, 50, 100],
        duration: 800
      },
      {
        zone: 'Z2_shoulder_right',
        intensity: Math.max(0, momentum / 100),
        frequency: 80,
        pattern: momentum > 50 ? [150, 75, 150] : [40, 20],
        duration: 600
      },
      {
        zone: 'Z3_shoulder_left',
        intensity: Math.max(0, (100 - sentiment) / 100),
        frequency: 80,
        pattern: sentiment < 40 ? [150, 75, 150] : [40, 20],
        duration: 600
      },
      {
        zone: 'Z4_kidney_right',
        intensity: Math.min(1, m3.HIV / 80),
        frequency: 25,
        pattern: m3.HIV > 60 ? [200, 100, 200, 100] : [60, 30],
        duration: 1000
      },
      {
        zone: 'Z5_kidney_left',
        intensity: Math.min(1, m3.HIV / 100),
        frequency: 25,
        pattern: m3.HIV > 40 ? [150, 75, 150] : [40, 20],
        duration: 1000
      },
      {
        zone: 'Z6_seat_right',
        intensity: m3.ISS > 30 ? 0.8 : 0.1,
        frequency: 15,
        pattern: m3.ISS > 30 ? [300, 150, 300] : [30, 30],
        duration: m3.ISS > 30 ? 1500 : 400
      },
      {
        zone: 'Z7_seat_tailbone',
        intensity: Math.min(1, Math.abs(m3.ROC) / 15),
        frequency: 50,
        pattern: m3.ROC > 0
          ? [50, 30, 80, 30, 120]
          : [120, 30, 80, 30, 50],
        duration: 1000
      },
      {
        zone: 'Z8_seat_left',
        intensity: m3.ISS > 20 && m3.ROC < 0 ? 0.8 : 0.1,
        frequency: 15,
        pattern: m3.ISS > 20 ? [300, 150, 300] : [30, 30],
        duration: m3.ISS > 20 ? 1500 : 400
      },
      {
        zone: 'Z9_thigh_right',
        intensity: m3.HSI / 100,
        frequency: 60,
        pattern: m3.HSI > 70 ? [40, 40, 40, 40] : [100, 50, 100],
        duration: 800
      },
      {
        zone: 'Z10_thigh_left',
        intensity: Math.max(0, (100 - m3.HSI) / 100),
        frequency: 60,
        pattern: m3.HSI < 30 ? [150, 50, 150, 50] : [40, 40],
        duration: 800
      },
      {
        zone: 'Z11_lower_spine',
        intensity: m3.SOS / 100,
        frequency: 45,
        pattern: m3.SOS > 60 ? [50, 50, 50] : [120, 60, 120],
        duration: 900
      },
      {
        zone: 'Z12_upper_spine_head',
        intensity: m3.HRI / 100,
        frequency: 35,
        pattern: m3.HRI > 80 ? [40, 20, 40, 20, 40] : [80, 40, 80],
        duration: 1000
      }
    ];
  }

  mapM3ToSpeakers(m3: M3Output): SpeakerCommand[] {
    const baseFreq = 432 * (1 + (m3.HRI - 50) / 200);
    const bullishFreq = baseFreq * 1.25;
    const bearishFreq = baseFreq * 0.8;
    const bassFreq = baseFreq * 0.25;
    const chaosWave = m3.HIV > 60 ? 'sawtooth' as const : 'sine' as const;

    return [
      {
        channel: 'S1_head_left',
        frequency: baseFreq,
        volume: Math.min(0.8, m3.HRI / 120),
        waveform: 'sine',
        pan: -0.7
      },
      {
        channel: 'S2_head_right',
        frequency: baseFreq,
        volume: Math.min(0.8, m3.HRI / 120),
        waveform: 'sine',
        pan: 0.7
      },
      {
        channel: 'S3_shoulder_right',
        frequency: bullishFreq,
        volume: Math.max(0, m3.IV3D[0] / 150),
        waveform: 'triangle',
        pan: 0.9
      },
      {
        channel: 'S4_shoulder_left',
        frequency: bearishFreq,
        volume: Math.max(0, (100 - m3.IV3D[2]) / 150),
        waveform: 'triangle',
        pan: -0.9
      },
      {
        channel: 'S5_leg_right',
        frequency: bassFreq,
        volume: Math.min(0.6, m3.HIV / 150),
        waveform: chaosWave,
        pan: 0.5
      },
      {
        channel: 'S6_leg_left',
        frequency: bassFreq,
        volume: Math.min(0.6, m3.HIV / 150),
        waveform: chaosWave,
        pan: -0.5
      }
    ];
  }

  async playSpeakers(commands: SpeakerCommand[]): Promise<void> {
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

export default CognitionChair;
