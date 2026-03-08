/**
 * Haptic Head Wear with Audio Speakers
 * Patent Claim: Anatomical head-mapped economic haptic feedback
 * Inventor: Justin W. McCrea, Reality Protocol LLC
 * 
 * 5 vibration zones + 2 speakers for embodied market perception
 * 
 * Zones:
 * Z1: Crown (HRI/ROC)
 * Z2: Left Temporal (IV3D sentiment)
 * Z3: Right Temporal (IV3D momentum)
 * Z4: Forehead (HIV/ISS)
 * Z5: Top of Spine (HSI/SOS)
 * 
 * Speakers:
 * S1: Left Ear (432Hz L channel)
 * S2: Right Ear (432Hz R channel)
 */

import type { M3Output } from '../metrics/mccrea-m3/McCreaMarketMetrics';

export type HeadZone =
  | 'Z1_crown' | 'Z2_left_temporal' | 'Z3_right_temporal'
  | 'Z4_forehead' | 'Z5_top_of_spine';

export type SpeakerChannel =
  | 'S1_left_ear' | 'S2_right_ear';

export interface HeadZoneCommand {
  zone: HeadZone;
  intensity: number;
  frequency: number;
  pattern: number[];
  duration: number;
}

export interface HeadSpeakerCommand {
  channel: SpeakerChannel;
  frequency: number;
  volume: number;
  waveform: 'sine' | 'triangle' | 'sawtooth';
  pan: number;
}

export class HapticHeadWear {
  private bluetoothDevice: any = null;
  private audioCtx: AudioContext | null = null;
  private connected = false;

  async connect(): Promise<boolean> {
    try {
      if ('bluetooth' in navigator) {
        this.bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
          filters: [{ namePrefix: 'HapticHeadWear' }],
          optionalServices: ['haptic_head_service']
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

  mapM3ToZones(m3: M3Output): HeadZoneCommand[] {
    const momentum = m3.IV3D[0];
    const volatility = m3.IV3D[1];
    const sentiment = m3.IV3D[2];

    return [
      {
        zone: 'Z1_crown',
        intensity: Math.max(0.1, m3.HRI / 100),
        frequency: 40,
        pattern: m3.HRI > 70 ? [60, 30, 60] : [100, 50, 100],
        duration: 800
      },
      {
        zone: 'Z2_left_temporal',
        intensity: Math.max(0, (100 - sentiment) / 100),
        frequency: 80,
        pattern: sentiment < 40 ? [150, 75, 150] : [40, 20],
        duration: 600
      },
      {
        zone: 'Z3_right_temporal',
        intensity: Math.max(0, momentum / 100),
        frequency: 80,
        pattern: momentum > 50 ? [150, 75, 150] : [40, 20],
        duration: 600
      },
      {
        zone: 'Z4_forehead',
        intensity: Math.min(1, m3.HIV / 80),
        frequency: 25,
        pattern: m3.HIV > 60 ? [200, 100, 200, 100] : [60, 30],
        duration: 1000
      },
      {
        zone: 'Z5_top_of_spine',
        intensity: m3.HSI / 100,
        frequency: 45,
        pattern: m3.HSI > 60 ? [50, 50, 50] : [120, 60, 120],
        duration: 900
      }
    ];
  }

  mapM3ToSpeakers(m3: M3Output): HeadSpeakerCommand[] {
    const baseFreq = 432 * (1 + (m3.HRI - 50) / 200);
    const bullishFreq = baseFreq * 1.25;
    const bearishFreq = baseFreq * 0.8;

    return [
      {
        channel: 'S1_left_ear',
        frequency: baseFreq,
        volume: Math.min(0.8, m3.HRI / 120),
        waveform: 'sine',
        pan: -0.7
      },
      {
        channel: 'S2_right_ear',
        frequency: baseFreq,
        volume: Math.min(0.8, m3.HRI / 120),
        waveform: 'sine',
        pan: 0.7
      }
    ];
  }

  async playSpeakers(commands: HeadSpeakerCommand[]): Promise<void> {
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

export default HapticHeadWear;

HAPTIC HEAD WEAR (Top View)
    ┌─────────────────────────────┐
    │  Z1: Crown Vibration      │ ← Top of head
    │  ┌─────────────────────┐  │
    │  │  Z4: Forehead      │  │ ← Front center
    │  │  Vibration        │  │
    │  └─────────────────────┘  │
    │                         │
    │  Z2: Left Temporal     Z3: Right Temporal │ ← Sides
    │  Vibration           Vibration          │
    │                         │
    │  Z5: Top of Spine     │ ← Back of head
    │  (Back of Head)      │
    └─────────────────────────────┘

    SPEAKERS:
    - S1: Left Ear Speaker
    - S2: Right Ear Speaker
