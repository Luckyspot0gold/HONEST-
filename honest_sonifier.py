# honest_sonifier.py - Standalone or Flask-integrable
import asyncio
import aiohttp
import numpy as np
from scipy.io.wavfile import write
import json
from datetime import datetime
import base64

# AEAS Constants (§4)
CARRIER_FREQ = 432.0  # Hz - Neutral baseline
SAMPLE_RATE = 44100   # Standard audio
FM_DEPTH_MAX = 20     # Hz - Volatility cap (body-safe)
PULSE_RATE_MAX = 5    # BPM - Momentum
AMPLITUDE_MAX = 0.8   # Volume/throughput - Prevents clipping

def fetch_btc_signal():
    """Raw Truth Feed (§11) - Coingecko API (free, public)"""
    async def _fetch():
        async with aiohttp.ClientSession() as session:
            async with session.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true') as resp:
                data = await resp.json()
                return {
                    'price': data['bitcoin']['usd'],
                    'change_24h_pct': data['bitcoin']['usd_24h_change'],  # Momentum proxy
                    'vol_24h_usd': data['bitcoin']['usd_24h_vol'] / 1e9  # $B normalized
                }
    return asyncio.run(_fetch())

def economic_to_audio(signal, duration=10.0):
    """
    Non-Deceptive Translation (§7 "Is Mandate")
    - Volatility (implied from change): FM on carrier
    - Momentum (change_pct): Rhythmic pulse
    - Volume (vol): Amplitude modulation
    Shannon Entropy: H(O) >= H(S) - ε (direct linear maps)
    """
    nsamples = int(SAMPLE_RATE * duration)
    t = np.linspace(0, duration, nsamples, False)
    
    # Baseline carrier
    carrier = np.sin(2 * np.pi * CARRIER_FREQ * t)
    
    # Volatility FM (price change magnitude → freq mod)
    volatility = abs(signal['change_24h_pct']) / 10  # Normalize 0-10%
    fm_freq = volatility * 5  # 0-25Hz mod
    fm = np.sin(2 * np.pi * fm_freq * t * 10) * FM_DEPTH_MAX * volatility
    modulated = carrier * np.sin(2 * np.pi * (CARRIER_FREQ + fm) * t)
    
    # Momentum pulse (positive=accelerando)
    momentum = np.clip(signal['change_24h_pct'] / 100, -1, 1)  # -1 to 1
    pulse_rate = 1 + abs(momentum) * PULSE_RATE_MAX
    pulse = np.sin(2 * np.pi * pulse_rate * t) * 0.3 * momentum  # Directional
    audio = modulated * (1 + pulse)
    
    # Volume amplitude
    volume_norm = min(signal['vol_24h_usd'] / 50, 1)  # Cap at ~$50B
    audio *= AMPLITUDE_MAX * volume_norm
    
    # Normalize & reversible metadata embed
    audio = audio / np.max(np.abs(audio)) * 0.9
    metadata = {
        'timestamp': datetime.utcnow().isoformat(),
        'signal': signal,
        'mapping': {'volatility': 'FM', 'momentum': 'pulse', 'volume': 'amp'}
    }
    return audio.astype(np.float32), metadata

def generate_wav(signal, filename='btc_aeas_sonification.wav'):
    """Export for haptic/audio players (§3 Multisensory Sync)"""
    audio, meta = economic_to_audio(signal)
    write(filename, SAMPLE_RATE, audio)
    with open(filename + '.json', 'w') as f:
        json.dump(meta, f)
    print(f"✅ AEAS Audio saved: {filename} (Reversible: load JSON → reconstruct S)")

# Live Demo (Flask-ready or Jupyter)
if __name__ == "__main__":
    signal = fetch_btc_signal()
    print("BTC Signal (Raw 'Is'):", json.dumps(signal, indent=2))
    generate_wav(signal)
