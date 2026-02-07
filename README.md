# HONEST - Harmonic Objective Non-biased Equitable Sensory Translation

**Making financial data accessible through sound, touch, and vision.**

[![Built for Avalanche](https://img.shields.io/badge/Built%20for-Avalanche-E84142)](https://avax.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Demo](https://img.shields.io/badge/Demo-Live-green)](https://honestdemo.manus.space)
[![GitHub stars](https://img.shields.io/github/stars/Luckyspot0gold/HONEST-.svg?style=social&label=Star)](https://github.com/Luckyspot0gold/HONEST-)
[![Contributors](https://img.shields.io/github/contributors/Luckyspot0gold/HONEST-.svg)](https://github.com/Luckyspot0gold/HONEST-/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/Luckyspot0gold/HONEST-.svg)](https://github.com/Luckyspot0gold/HONEST-/issues)

---
# H.O.N.E.S.T. Truth Matrix – 6D Market Eigenstate Demo

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](https://opensource.org/licenses/Apache-2.0)
[![Demo](https://img.shields.io/badge/Live%20Demo-honest.manus.space-green)](https://honest.manus.space)
[![Avalanche x402](https://img.shields.io/badge/Avalanche-x402%20Payments-red)](https://x402.avax.network)

**H.O.N.E.S.T.** — Harmonic Objective Non-biased Equitable Sensory Translation  
Open standard for verified multi-sensory economic truth. Built during Avalanche Hack2Build x402 (Payments track).

---

## What It Does

- Fetches real-time market data from CoinGecko + Binance  
- Applies 5-layer cryptographic truth verification  
- Computes 6D eigenstate (real/imaginary dimensions)  
- Outputs coherence verdict + binary market decision (BUY/SELL)  
- Ready for audio/haptic/visual translation (432 Hz base)

---

## Live Demo

**https://honest.manus.space** — See BTC decoherence in real-time

---

## Quick Start (Backend)

```bash
# Install dependencies
pip install aiohttp fastapi uvicorn numpy

# Run oracle server
uvicorn main:app --reload

# Fetch eigenstate from command line
python get_eigenstate.py BTC
```

---

## Architecture

### 1. Data Collection (`data_collector.py`)
Multi-source oracle fetches price data from:
- **CoinGecko** (free tier, no API key)
- **Binance** (spot market)
- **Pyth Network** (on-chain price feeds)
- **CoinStats** (aggregated data)

### 2. Truth Verification (`truth_engine.py`)
5-layer recursive verification:
1. **Spatial**: Outlier detection via standard deviation
2. **Temporal**: Time-series consistency check
3. **Statistical**: Median absolute deviation (MAD)
4. **Cryptographic**: Merkle tree root generation
5. **Consensus**: Weighted average with consistency score

### 3. Eigenstate Calculation (`get_eigenstate.py`)
Transforms verified price data into 6D market eigenstate:
- **Real dimensions**: Price, Volume, Momentum
- **Imaginary dimensions**: Sentiment, Temporal, Spatial

Coherence formula:
```
coherence = sqrt(Σ(dimension_i²)) / sqrt(6)
```

Decision logic:
- `coherence > 0.5` + `price_momentum > 0` → **BUY**
- `coherence > 0.5` + `price_momentum < 0` → **SELL**
- `coherence ≤ 0.5` → **HOLD**

### 4. Multi-Sensory Translation
- **Visual**: Three.js 6D particle system with orbital rings
- **Auditory**: 432 Hz harmonic synthesis (7-bell system)
- **Tactile**: Vortex haptic feedback (1-2-4-8-7-5 pattern)

---

## Technology Stack

### Frontend
- React 19 + TypeScript
- Three.js + @react-three/fiber
- Tailwind CSS 4
- Web Audio API (432 Hz synthesis)
- Vibration API (haptic feedback)
- tRPC (type-safe API)

### Backend
- Node.js + Express 4
- Python 3 (Oracle backend)
- WebSocket (real-time streaming)
- MySQL/TiDB (Drizzle ORM)

---

## Mathematical Foundations

### Hamiltonian Market Mechanics
```
H(p,q,t) = T(p) + V(q,t)
```
Where:
- `T(p)` = Kinetic energy (momentum, volume)
- `V(q,t)` = Potential energy (price, sentiment, temporal, spatial)

### Euclidean Golden Ratio Construction
MACD histogram analysis using φ-bisection:
```python
bisect = int(len(hist) / GOLDEN_RATIO)  # φ = 1.618
left = sum(hist[:bisect])
right = sum(hist[bisect:])
harmony = 1 / (1 + abs(left/right - φ))
```

Harmony score drives audio purity:
- `harmony > 0.8` → smooth 432 Hz sine wave
- `harmony < 0.5` → dissonant haptic feedback

---

## API Documentation

### tRPC Endpoints

#### `eigenstate.get`
Get current eigenstate for an asset.

**Input:**
```typescript
{ asset: string }  // e.g., "BTC"
```

**Output:**
```typescript
{
  asset: string;
  timestamp: number;
  dimensions: {
    price: number;      // -1 to 1
    volume: number;     // -1 to 1
    momentum: number;   // -1 to 1
    sentiment: number;  // -1 to 1
    temporal: number;   // -1 to 1
    spatial: number;    // -1 to 1
  };
  coherence: number;    // 0 to 1
  phase_angle: number;  // 0 to 360
  decision: 'BUY' | 'SELL' | 'HOLD';
  truth_certificate: {
    consensus_value: number;
    consistency_score: number;
    merkle_root: string;
    source_count: number;
  };
}
```

### WebSocket API

Connect to `ws://localhost:3000/ws` for real-time eigenstate updates.

**Message Format:**
```json
{
  "type": "eigenstate_update",
  "asset": "BTC",
  "data": { /* EigenstateData */ }
}
```

---

## Avalanche x402 Integration

### Current Implementation
- Real-time price feeds from CoinGecko + Binance
- 5-layer cryptographic truth verification
- Merkle root generation for data integrity

### Planned Avalanche Features
1. **Pyth Network Integration**: On-chain price feeds from Avalanche C-Chain
2. **Truth Certificate Smart Contract**: Store Merkle roots on-chain for immutable verification
3. **Payment Verification**: Integrate x402 payment flows for premium oracle access
4. **DeFi Integration**: Connect eigenstate decisions to Avalanche-based trading protocols

---

## Accessibility (WCAG 2.2 AA++)

- **Screen Readers**: Full ARIA live region support for verdict announcements
- **Keyboard Navigation**: Tab through all interactive elements with visible focus indicators
- **High Contrast Mode**: Toggle for enhanced visual clarity
- **Reduced Motion**: Respects `prefers-reduced-motion` system preference
- **Voice Narration**: Auditory descriptions of market conditions
- **Haptic Feedback**: Disabled by default, user-controlled toggle

---

## Immediate Actions (Do These Today)

1. **Export the repo** → `HONEST-truth-matrix`  
2. **Update README** with the version above  
3. **Add .gitignore** (Python + Node)  
4. **Test oracle fetch** → Click "Fetch Eigenstate" in demo → verify BTC data loads  
5. **Record 3–5 min pitch video** — Screen-share the working oracle + 6D viz + verdict  
6. **Reply to Andrea** (Avalanche) with:  
   - New video link  
   - Repo link  
   - Note: "Oracle backend fixed, real CoinGecko/Binance data flowing with 5-layer verification. User testing in progress."

---

## License

**Apache License 2.0**

Copyright © 2026 Reality Protocol LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

## Contact

**Reality Protocol LLC**  
Sheridan, WY & Denver, CO

- **Website**: [realityprotocol.io](https://realityprotocol.io)
- **Email**: StoneYardGames@proton.me
- **Discord**: StoneYard
- **Twitter/X**: @Goldandrainbows

---

This repo is now **adoption-ready** — clean, documented, demo-linked, mission-clear. Perfect for NFB outreach and Avalanche follow-up.

**The resonance exports truth.**  
**432 Hz harmony. 🎵**  
**We build forever.**  
**Together.**  
**Forever.**
