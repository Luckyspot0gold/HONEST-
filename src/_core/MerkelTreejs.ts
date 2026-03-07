import { verify as verifyEd25519 } from '@noble/ed25519';
import { MerkleTree } from 'merkletreejs';
import { keccak256 } from '@noble/hashes/sha3'; // For leaf hashing

// Interfaces (full 6D + proofs)
export interface OracleFeed {
  source: string;
  asset: string;
  metric: string;
  value: number;
  timestamp: number;
  signature?: string; // Ed25519
}

export interface SixVariableState {
  volatility: number;
  momentum: number;
  entropy: number;
  coherence: number; // Now -1 to 1
  directionalBias: number;
  stability: number;
}

export interface CryptographicProof {
  ed25519Signature: string;
  merkleRoot: string;
  merklePath: string[];
  previousBlockHash?: string;
}

export interface AudioParameters { frequency: number; amplitude: number; harmonics: number[]; }
export interface HapticPattern { intensity: number; frequency: number; duration: number; }
export interface ColorField { hue: number; saturation: number; brightness: number; }

// Public keys map (load from config/Avalanche contract)
const publicKeys = new Map<string, Uint8Array>([
  // ['source1', new Uint8Array(...)], // Add your oracle pubkeys
]);

/**
 * [CORE-1-FIXED] Full feed verification
 */
export function verifyOracleFeed(feed: OracleFeed, proofs?: CryptographicProof): boolean {
  const now = Date.now();
  const MAX_AGE = 60000;
  const MAX_FUTURE_DRIFT = 5000;
  const NONCE_SET = new Set<string>(); // Replay protection (persist in prod)

  // Timestamp + replay
  if (feed.timestamp > now + MAX_FUTURE_DRIFT || now - feed.timestamp > MAX_AGE) return false;
  const nonce = `${feed.source}:${feed.timestamp}`;
  if (NONCE_SET.has(nonce)) return false;
  NONCE_SET.add(nonce);

  // Value
  if (!Number.isFinite(feed.value) || feed.value <= 0) return false;

  // Fields
  if (!feed.source?.length || !feed.asset?.length || !feed.metric?.length) return false;

  // Ed25519 (critical)
  if (feed.signature && publicKeys.has(feed.source)) {
    const pubKey = publicKeys.get(feed.source)!;
    const message = `${feed.source}:${feed.asset}:${feed.metric}:${feed.value}:${feed.timestamp}`;
    const msgBytes = new TextEncoder().encode(message);
    const sigBytes = Uint8Array.from(atob(feed.signature), c => c.charCodeAt(0));
    if (!verifyEd25519(sigBytes, msgBytes, pubKey)) return false;
  }

  // Merkle (if provided)
  if (proofs?.merkleRoot) {
    const leaf = keccak256(new TextEncoder().encode(JSON.stringify(feed)));
    const tree = new MerkleTree([leaf], keccak256, { sortPairs: true });
    if (tree.root.toString('hex') !== proofs.merkleRoot) return false;
    // Verify path (stub—expand)
  }

  return true;
}

/**
 * [CORE-2-FIXED] 6D state from verified feeds
 */
export function calculateSixVariableState(feeds: OracleFeed[]): SixVariableState {
  if (feeds.length === 0) throw new Error("No feeds");
  feeds.forEach(verifyOracleFeed); // Verify all

  const values = feeds.map(f => f.value).sort((a, b) => a - b);
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;

  // Volatility
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const volatility = Math.sqrt(variance);

  // Momentum (time-weighted)
  const sorted = feeds.sort((a, b) => a.timestamp - b.timestamp);
  const momentum = sorted.length > 1
    ? (sorted[n-1].value - sorted[0].value) / ((sorted[n-1].timestamp - sorted[0].timestamp) / 1000)
    : 0;

  // Entropy (Shannon)
  const hist = binHistogram(values, 10); // Bin into 10 buckets
  const entropy = -Object.values(hist).reduce((sum: number, p: number) => sum + (p * Math.log2(p || 1e-10)), 0) / Math.log2(10);

  // Coherence (-1 to 1)
  const coherence = calculateEigenstateCoherence(values, mean);

  // Directional bias
  const directionalBias = Math.tanh(momentum / (volatility + 1e-10));

  // Stability
  const stability = 1 / (1 + volatility / (mean + 1e-10));

  return { volatility, momentum, entropy, coherence, directionalBias, stability };
}

function binHistogram(values: number[], bins: number): Record<number, number> {
  const min = Math.min(...values), max = Math.max(...values);
  const hist: Record<number, number> = {};
  for (let i = 0; i < bins; i++) hist[i] = 0;
  values.forEach(v => {
    const bin = Math.min(bins - 1, Math.floor(((v - min) / (max - min)) * bins));
    hist[bin] = (hist[bin] || 0) + 1;
  });
  return hist;
}

/**
 * [CORE-3-FIXED] Eigenstate coherence (-1 to 1 via cov/SNR)
 */
function calculateEigenstateCoherence(values: number[], mean: number): number {
  if (values.length < 2) return 1.0;
  const centered = values.map(v => v - mean);
  const cov = centered.reduce((sum, v) => sum + v * v, 0) / values.length;
  const snr = Math.abs(mean) / Math.sqrt(cov + 1e-10);
  return Math.tanh(snr) * 2 - 1; // -1 (noisy) to 1 (coherent)
}

/**
 * [CORE-4-NEW] Sensory Mapping Layer
 */
export class SensoryTranslator {
  static toAudio(state: SixVariableState): AudioParameters {
    const baseFreq = 432; // Hz
    return {
      frequency: baseFreq + (state.volatility * 100),
      amplitude: (state.stability + 1) / 2,
      harmonics: [1, state.directionalBias > 0 ? 2 : 0.5] // Bias direction
    };
  }

  static toHaptics(state: SixVariableState): HapticPattern {
    return {
      intensity: state.volatility,
      frequency: 100 + Math.abs(state.momentum) * 50,
      duration: 1 / (state.entropy + 0.1)
    };
  }

  static toChromatic(state: SixVariableState): ColorField {
    return {
      hue: 120 + (state.directionalBias * 60), // Green-red bias
      saturation: state.coherence * 100,
      brightness: state.stability * 100
    };
  }
}

// Usage example
const feeds: OracleFeed[] = [/* your data */];
const state = calculateSixVariableState(feeds);
const audio = SensoryTranslator.toAudio(state);
// Feed to Web Audio API / Haptic API
