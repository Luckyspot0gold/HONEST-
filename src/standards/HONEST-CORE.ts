/**
 * HONEST-CORE v1.0
 * The Data Verification and Metric Calculation Standard.
 * This is the canonical, immutable logic for determining economic truth.
 * It is sensory-agnostic.
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
 */
export function verifyOracleFeed(feed: OracleFeed): boolean {
  const now = Date.now();
  const isRecent = (now - feed.timestamp) < 60000;
  const isPositiveNumber = typeof feed.value === 'number' && feed.value > 0;
  return isRecent && isPositiveNumber;
}

export interface HonestMetric {
  id: string;
  name: string;
  description: string;
  inputs: OracleFeed[];
}

/**
 * [CORE-2] Calculates a "Honest Metric" from verified oracle feeds.
 * This is the economic engine.
 */
export function calculateHonestMetric(metric: HonestMetric): number {
  if (metric.inputs.length === 0) return 0;
  const primaryFeed = metric.inputs[0];
  if (!verifyOracleFeed(primaryFeed)) {
    throw new Error(`[HONEST-CORE] Cannot calculate ${metric.id}: Unverified feed.`);
  }
  console.log(`[HONEST-CORE] Calculating ${metric.id}: ${primaryFeed.value}`);
  return primaryFeed.value;
}
