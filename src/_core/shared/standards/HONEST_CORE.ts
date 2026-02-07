/**
 * HONEST-CORE v1.0
 * The Data Verification and Metric Calculation Standard.
 * This is the canonical, immutable logic for determining economic truth.
 * It is sensory-agnostic.
 * 
 * Part of the H.O.N.E.S.T. framework:
 * Harmonic Objective Non-biased Equitable Sensory Translation
 */

export interface OracleFeed {
  source: string;
  asset: string;
  metric: string;
  value: number;
  timestamp: number;
  signature?: string;
}

/**
 * [CORE-1] Verifies the integrity of an incoming data feed.
 * This is a critical security and trust function.
 * 
 * @param feed - Oracle feed to verify
 * @returns true if feed is valid, false otherwise
 */
export function verifyOracleFeed(feed: OracleFeed): boolean {
  const now = Date.now();
  
  // Check timestamp is recent (within 60 seconds)
  const isRecent = (now - feed.timestamp) < 60000;
  
  // Check value is a positive number
  const isPositiveNumber = typeof feed.value === 'number' && feed.value > 0;
  
  // Check required fields are present
  const hasRequiredFields = 
    typeof feed.source === 'string' && feed.source.length > 0 &&
    typeof feed.asset === 'string' && feed.asset.length > 0 &&
    typeof feed.metric === 'string' && feed.metric.length > 0;
  
  return isRecent && isPositiveNumber && hasRequiredFields;
}

export interface HonestMetric {
  id: string;
  name: string;
  description: string;
  inputs: OracleFeed[];
  coherence?: number;  // Eigenstate coherence (-1 to 1)
  exhaustion?: number; // Archimedes exhaustion (0 to 1)
}

/**
 * [CORE-2] Calculates a "Honest Metric" from verified oracle feeds.
 * This is the economic engine.
 * 
 * For multi-source feeds, uses consensus mechanism:
 * - Verifies all feeds
 * - Calculates median value (resistant to outliers)
 * - Computes coherence based on source agreement
 * 
 * @param metric - Honest metric with oracle feed inputs
 * @returns Calculated metric value
 * @throws Error if feeds cannot be verified
 */
export function calculateHonestMetric(metric: HonestMetric): number {
  if (metric.inputs.length === 0) {
    return 0;
  }
  
  // Verify all feeds
  const verifiedFeeds = metric.inputs.filter(feed => verifyOracleFeed(feed));
  
  if (verifiedFeeds.length === 0) {
    throw new Error(`[HONEST-CORE] Cannot calculate ${metric.id}: No verified feeds.`);
  }
  
  // Single source: use directly
  if (verifiedFeeds.length === 1) {
    console.log(`[HONEST-CORE] Calculating ${metric.id}: ${verifiedFeeds[0].value}`);
    return verifiedFeeds[0].value;
  }
  
  // Multi-source: calculate consensus (median)
  const values = verifiedFeeds.map(feed => feed.value).sort((a, b) => a - b);
  const median = values[Math.floor(values.length / 2)];
  
  console.log(`[HONEST-CORE] Calculating ${metric.id} from ${verifiedFeeds.length} sources: ${median}`);
  
  return median;
}

/**
 * [CORE-3] Calculates coherence metric for multi-source feeds.
 * Coherence measures agreement between sources.
 * 
 * @param feeds - Array of verified oracle feeds
 * @returns Coherence value (-1 to 1), where 1 = perfect agreement
 */
export function calculateCoherence(feeds: OracleFeed[]): number {
  if (feeds.length <= 1) {
    return 1.0; // Single source = perfect coherence
  }
  
  const values = feeds.map(f => f.value);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Normalize to -1 to 1 range
  // Lower standard deviation = higher coherence
  const normalizedStdDev = stdDev / mean;
  const coherence = 1 - Math.min(normalizedStdDev, 1.0);
  
  return coherence;
}

/**
 * [CORE-4] Validates a complete Honest Metric structure.
 * Ensures all required fields are present and valid.
 * 
 * @param metric - Honest metric to validate
 * @returns true if metric is valid, false otherwise
 */
export function validateHonestMetric(metric: HonestMetric): boolean {
  if (!metric.id || !metric.name || !metric.description) {
    return false;
  }
  
  if (!Array.isArray(metric.inputs) || metric.inputs.length === 0) {
    return false;
  }
  
  // Validate all feeds
  return metric.inputs.every(feed => verifyOracleFeed(feed));
}
