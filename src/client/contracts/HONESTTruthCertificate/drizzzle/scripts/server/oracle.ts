/**
 * Oracle Integration Module
 * 
 * Provides TypeScript/Node.js wrapper around the Python Enhanced Oracle v2.0
 * for real-time market eigenstate data with 5-layer truth verification.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface EigenstateData {
  asset: string;
  timestamp: number;
  dimensions: {
    price: number;
    volume: number;
    momentum: number;
    sentiment: number;
    temporal: number;
    spatial: number;
  };
  coherence: number;
  phase_angle: number;
  decision: 'BUY' | 'SELL' | 'HOLD';
  truth_certificate?: {
    consensus_value: number;
    consistency_score: number;
    merkle_root: string;
    source_count: number;
  };
}

export interface OracleResponse {
  success: boolean;
  data?: EigenstateData;
  error?: string;
}

/**
 * Call the Python Enhanced Oracle to get eigenstate data for an asset
 */
export async function getEigenstateFromOracle(asset: string): Promise<OracleResponse> {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, 'get_eigenstate.py');
    
    // Spawn Python process
    const python = spawn('python3', [pythonScript, asset]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error(`Oracle error: ${stderr}`);
        resolve({
          success: false,
          error: `Oracle process exited with code ${code}: ${stderr}`
        });
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve({
          success: true,
          data: result
        });
      } catch (error) {
        console.error(`Failed to parse oracle response: ${error}`);
        resolve({
          success: false,
          error: `Failed to parse oracle response: ${error}`
        });
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      python.kill();
      resolve({
        success: false,
        error: 'Oracle request timed out after 5 seconds'
      });
    }, 5000);
  });
}

/**
 * Get list of supported assets
 */
export function getSupportedAssets(): string[] {
  return [
    'BTC',
    'ETH',
    'AVAX',
    'SOL',
    'TSLA',
    'AAPL',
    'GOOGL',
    'MSFT'
  ];
}

/**
 * Calculate 6D eigenstate from raw market data
 * This is a simplified version - the Python oracle does the full calculation
 */
export function calculateEigenstate(
  price: number,
  volume: number,
  priceChange: number,
  marketCap: number
): EigenstateData['dimensions'] {
  // Normalize values to -1 to 1 range
  const normalizePrice = (p: number) => Math.tanh(p / 50000); // Normalize around $50k
  const normalizeVolume = (v: number) => Math.tanh(v / 1e9); // Normalize around $1B
  const normalizeMomentum = (m: number) => Math.tanh(m / 10); // Normalize around 10%
  
  // Real dimensions (x, y, z)
  const priceNorm = normalizePrice(price);
  const volumeNorm = normalizeVolume(volume);
  const momentumNorm = normalizeMomentum(priceChange);
  
  // Imaginary dimensions (i, j, k) - derived from real dimensions
  const sentiment = (priceNorm + momentumNorm) / 2; // Average of price and momentum
  const temporal = Math.sin(Date.now() / 1000 / 3600) * 0.3; // Time-based oscillation
  const spatial = Math.cos(Date.now() / 1000 / 3600) * 0.3; // Space-based oscillation
  
  return {
    price: priceNorm,
    volume: volumeNorm,
    momentum: momentumNorm,
    sentiment,
    temporal,
    spatial
  };
}

/**
 * Calculate coherence score from dimensions
 * Coherence measures how aligned all dimensions are
 */
export function calculateCoherence(dimensions: EigenstateData['dimensions']): number {
  const values = Object.values(dimensions);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Coherence is inverse of standard deviation, normalized to -1 to 1
  // Low variance = high coherence (aligned dimensions)
  // High variance = low coherence (conflicting dimensions)
  const coherence = 1 - Math.min(stdDev * 2, 1);
  
  // Adjust for overall direction (positive or negative)
  return mean >= 0 ? coherence : -coherence;
}

/**
 * Determine market decision from coherence score
 */
export function getDecision(coherence: number): 'BUY' | 'SELL' | 'HOLD' {
  if (coherence > 0.5) return 'BUY';
  if (coherence < -0.5) return 'SELL';
  return 'HOLD';
}
