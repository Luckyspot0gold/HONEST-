<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quantum RangiBeats: AEAS §5 Haptic Oracle</title>
    <style>
        body { background: #1e293b; color: #f8fafc; font-family: monospace; text-align: center; padding: 2rem; }
        button { background: #0ea5e9; color: white; border: none; padding: 1rem 2rem; font-size: 1.2rem; border-radius: 0.5rem; cursor: pointer; }
        button:hover { background: #0284c7; }
        #status { margin: 2rem 0; font-size: 1.1rem; }
        #signal { background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 0.5rem; margin: 1rem; }
    </style>
</head>
<body>
    <h1>⏸ Quantum Rangis H.O.N.E.S.T.</h1>
    <p>Enter the Market Consciousness Field<br><small>AEAS §5: Haptic Economic Cognition (Volatility → Freq | Momentum → Pulse | Volume → Amp)</small></p>
    
    <button onclick="calibrateMarket()">Begin Calibration</button>
    <div id="status">Ready to resonate...</div>
    <div id="signal"></div>

    <script>
        // AEAS Constants (§5 Safety Constraints)
        const VIBE_FREQ_MAX = 200;  // Hz - Body-safe cap
        const PULSE_MAX = 500;      // ms - Momentum pressure
        const AMP_MAX = 1.0;        // Pattern strength
        const BASE_FREQ = 432;      // Sync w/ §4 Audio

        async function fetchBTCTruthFeed() {
            const resp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true');
            const data = await resp.json();
            return {
                price: data.bitcoin.usd,
                change_pct: data.bitcoin.usd_24h_change,  // Momentum
                vol_norm: Math.min(data.bitcoin.usd_24h_vol / 5e10, 1)  // $50B cap → 0-1
            };
        }

        function economicToHaptic(signal) {
            // Non-Deceptive Mapping (§7 "Is Mandate") - Reversible: JSON → reconstruct S
            const volatility = Math.abs(signal.change_pct) / 20;  // 0-5% → 0-1
            const momentum = Math.sign(signal.change_pct);        // -1/0/1 dir
            const volume = signal.vol_norm;

            // Haptic Pattern: [duration_ms, pause_ms] x repeats
            const freq = Math.floor(volatility * VIBE_FREQ_MAX);  // Volatility freq
            const pulseLen = PULSE_MAX * Math.abs(momentum);      // Pressure dur
            const ampPattern = Array(4).fill([pulseLen, 100]).flat();  // 4-cycle loop

            return {
                pattern: ampPattern.map(d => d * volume * AMP_MAX),  // Volume scales
                metadata: { ...signal, mapping: {vol: 'freq', mom: 'pulse', volu: 'amp' } }
            };
        }

        async function vibratePattern(pattern) {
            if ('vibrate' in navigator) {
                navigator.vibrate(pattern);
            } else {
                document.getElementById('status').innerHTML = '💻 Desktop: No haptic support. Use mobile!';
            }
        }

        async function calibrateMarket() {
            const statusEl = document.getElementById('status');
            const signalEl = document.getElementById('signal');
            statusEl.innerHTML = '🔄 Fetching Truth Feed...';

            try {
                const signal = await fetchBTCTruthFeed();
                const haptic = economicToHaptic(signal);

                signalEl.innerHTML = `
                    <strong>Raw Signal (Is):</strong><br>
                    Price: $${signal.price.toLocaleString()}<br>
                    Momentum: ${signal.change_pct.toFixed(2)}%<br>
                    Volume: ${(signal.vol_norm * 100).toFixed(0)}%<br>
                    <small>Reversible: ${JSON.stringify(haptic.metadata)}</small>
                `;

                statusEl.innerHTML = `✅ Calibrating... Feel the field! (${haptic.pattern.join(', ')} ms)`;
                await vibratePattern(haptic.pattern);  // <50ms sync potential w/ audio

                setTimeout(() => statusEl.innerHTML = '⏸ Calibrated. Recalibrate?', 5000);
            } catch (e) {
                statusEl.innerHTML = `❌ Feed error: ${e.message}`;
            }
        }

        // Auto-cal on load (opt-in)
        window.onload = () => { if (navigator.vibrate) calibrateMarket(); };
    </script>
</body>
</html>
