/**
 * HONEST-LEDGER v1.0
 * The Immutable Record Storage Standard.
 * This defines the structure for recording a translated economic event.
 * It is storage-agnostic (blockchain, database, IPFS).
 * 
 * Part of the H.O.N.E.S.T. framework:
 * Harmonic Objective Non-biased Equitable Sensory Translation
 */

import { SensoryTranslation } from './HONEST_SENSE';

export interface HonestRecord {
  metricId: string;
  metricValue: number;
  translation: SensoryTranslation;
  timestamp: number;
  recordHash: string; // A SHA-256 hash for integrity
  coherence?: number; // Optional eigenstate coherence
  exhaustion?: number; // Optional Archimedes exhaustion
  sources?: string[]; // Optional list of oracle sources
}

/**
 * [LEDGER-1] Creates a canonical, verifiable record.
 * This record can be stored in any immutable storage system.
 * 
 * @param metricId - Unique identifier for the metric
 * @param metricValue - Calculated metric value
 * @param translation - Sensory translation parameters
 * @param coherence - Optional coherence metric
 * @param exhaustion - Optional exhaustion metric
 * @param sources - Optional list of oracle sources
 * @returns Honest record with integrity hash
 */
export function createHonestRecord(
  metricId: string,
  metricValue: number,
  translation: SensoryTranslation,
  coherence?: number,
  exhaustion?: number,
  sources?: string[]
): HonestRecord {
  const timestamp = Date.now();
  
  // Create a canonical string representation for hashing
  const dataString = JSON.stringify({
    metricId,
    metricValue,
    audioFrequency: translation.audioFrequency,
    hapticIntensity: translation.hapticIntensity,
    visualColor: translation.visualColor,
    timestamp,
    coherence,
    exhaustion,
    sources
  });
  
  const recordHash = hashString(dataString);

  console.log(`[HONEST-LEDGER] Creating record for ${metricId} with hash ${recordHash}`);
  
  return {
    metricId,
    metricValue,
    translation,
    timestamp,
    recordHash,
    coherence,
    exhaustion,
    sources,
  };
}

/**
 * [LEDGER-2] Verifies the integrity of a Honest record.
 * Recomputes the hash and compares with stored hash.
 * 
 * @param record - Honest record to verify
 * @returns true if record is valid, false if tampered
 */
export function verifyHonestRecord(record: HonestRecord): boolean {
  const dataString = JSON.stringify({
    metricId: record.metricId,
    metricValue: record.metricValue,
    audioFrequency: record.translation.audioFrequency,
    hapticIntensity: record.translation.hapticIntensity,
    visualColor: record.translation.visualColor,
    timestamp: record.timestamp,
    coherence: record.coherence,
    exhaustion: record.exhaustion,
    sources: record.sources
  });
  
  const computedHash = hashString(dataString);
  const isValid = computedHash === record.recordHash;
  
  if (!isValid) {
    console.error(`[HONEST-LEDGER] Record verification failed for ${record.metricId}`);
  }
  
  return isValid;
}

/**
 * [LEDGER-3] Creates a blockchain-ready truth certificate.
 * Formats the record for NFT metadata or smart contract storage.
 * 
 * @param record - Honest record to format
 * @returns NFT metadata object
 */
export function createTruthCertificate(record: HonestRecord): object {
  return {
    name: `HONEST Truth Certificate - ${record.metricId}`,
    description: `Verified economic truth for ${record.metricId} at ${new Date(record.timestamp).toISOString()}`,
    image: `ipfs://QmTruthCertificate/${record.recordHash}`, // Placeholder IPFS URI
    attributes: [
      {
        trait_type: "Metric ID",
        value: record.metricId
      },
      {
        trait_type: "Metric Value",
        value: record.metricValue
      },
      {
        trait_type: "Audio Frequency",
        value: `${record.translation.audioFrequency.toFixed(2)} Hz`
      },
      {
        trait_type: "Haptic Intensity",
        value: `${(record.translation.hapticIntensity * 100).toFixed(1)}%`
      },
      {
        trait_type: "Visual Color",
        value: record.translation.visualColor
      },
      {
        trait_type: "Coherence",
        value: record.coherence !== undefined ? `${(record.coherence * 100).toFixed(1)}%` : "N/A"
      },
      {
        trait_type: "Exhaustion",
        value: record.exhaustion !== undefined ? `${(record.exhaustion * 100).toFixed(1)}%` : "N/A"
      },
      {
        trait_type: "Timestamp",
        value: new Date(record.timestamp).toISOString()
      },
      {
        trait_type: "Record Hash",
        value: record.recordHash
      },
      {
        trait_type: "Sources",
        value: record.sources ? record.sources.join(", ") : "N/A"
      }
    ],
    properties: {
      recordHash: record.recordHash,
      timestamp: record.timestamp,
      coherence: record.coherence,
      exhaustion: record.exhaustion
    }
  };
}

/**
 * Simple hashing function (replace with crypto library in production)
 * Uses a basic string hash algorithm for demonstration.
 * 
 * @param str - String to hash
 * @returns Hexadecimal hash string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * [LEDGER-4] Exports record to JSON format for storage.
 * Ensures consistent serialization across platforms.
 * 
 * @param record - Honest record to export
 * @returns JSON string
 */
export function exportRecordToJSON(record: HonestRecord): string {
  return JSON.stringify(record, null, 2);
}

/**
 * [LEDGER-5] Imports record from JSON format.
 * Validates structure and verifies integrity.
 * 
 * @param jsonString - JSON string to import
 * @returns Honest record if valid, null if invalid
 */
export function importRecordFromJSON(jsonString: string): HonestRecord | null {
  try {
    const record = JSON.parse(jsonString) as HonestRecord;
    
    // Validate required fields
    if (!record.metricId || !record.metricValue || !record.translation || !record.timestamp || !record.recordHash) {
      console.error('[HONEST-LEDGER] Invalid record structure');
      return null;
    }
    
    // Verify integrity
    if (!verifyHonestRecord(record)) {
      console.error('[HONEST-LEDGER] Record integrity check failed');
      return null;
    }
    
    return record;
  } catch (error) {
    console.error('[HONEST-LEDGER] Failed to parse record JSON:', error);
    return null;
  }
}
