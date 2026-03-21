// src/render/AudioSynthesizer.ts
import { AudioOutput } from '../engine/adinkra-engine';

export class AudioSynthesizer {
    private ctx: AudioContext | null = null;

    public init() {
        this.ctx = new AudioContext();
    }

    // Play a short burst based on the engine output
    public play(output: AudioOutput, durationSec: number = 1.0) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Connect nodes
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Configure from engine output
        osc.type = output.timbre;
        osc.frequency.setValueAtTime(output.frequency, now);
        
        // Apply envelope (amp * decay)
        gain.gain.setValueAtTime(output.amplitude, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

        osc.start(now);
        osc.stop(now + durationSec);
    }
}
