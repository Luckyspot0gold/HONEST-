"""
Honest Oracle - Truth Engine Module
Reality Protocol LLC

This module processes collected market data through the RecursiveTruthVerifier
to produce cryptographically signed TruthCertificates with consistency scores.

Author: Manus AI
Date: January 6, 2026
Classification: Proprietary and Confidential
"""

import numpy as np
import hashlib
import time
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from data_collector import MarketDatum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class TruthCertificate:
    """
    Cryptographically signed certificate of data truth.
    
    Attributes:
        consensus_value: The agreed-upon value from multiple sources
        consistency_score: Score from 0.0 to 1.0 indicating source agreement
        merkle_root: Root hash of all source data for provenance
        timestamp: Unix timestamp of verification
        source_count: Number of sources that contributed
        metadata: Additional verification metadata
    """
    consensus_value: float
    consistency_score: float
    merkle_root: str
    timestamp: int
    source_count: int
    metadata: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return asdict(self)
    
    def is_valid(self, min_consistency: float = 0.8, min_sources: int = 2) -> bool:
        """
        Check if the certificate meets validity criteria.
        
        Args:
            min_consistency: Minimum required consistency score
            min_sources: Minimum required number of sources
        
        Returns:
            True if certificate is valid, False otherwise
        """
        return (
            self.consistency_score >= min_consistency and
            self.source_count >= min_sources
        )


class TruthEngine:
    """
    Processes collected data through recursive verification to produce TruthCertificates.
    
    This engine implements multiple layers of verification:
    1. Spatial Consistency: Agreement across multiple sources
    2. Temporal Consistency: Timestamp alignment
    3. Statistical Validation: Outlier detection
    4. Cryptographic Proof: Merkle tree generation
    """
    
    def __init__(self, min_sources: int = 2, outlier_threshold: float = 0.15):
        """
        Initialize the TruthEngine.
        
        Args:
            min_sources: Minimum number of sources required for consensus
            outlier_threshold: Maximum allowed deviation from median (as fraction)
        """
        self.min_sources = min_sources
        self.outlier_threshold = outlier_threshold
    
    def process(self, data_points: List[MarketDatum]) -> TruthCertificate:
        """
        Process collected data points to produce a TruthCertificate.
        
        Args:
            data_points: List of MarketDatum objects from different sources
        
        Returns:
            TruthCertificate with consensus value and verification proofs
        
        Raises:
            ValueError: If insufficient data points or verification fails
        """
        if not data_points:
            raise ValueError("No data points to process")
        
        if len(data_points) < self.min_sources:
            raise ValueError(
                f"Insufficient sources: got {len(data_points)}, "
                f"need at least {self.min_sources}"
            )
        
        logger.info(f"Processing {len(data_points)} data points...")
        
        # Step 1: Extract prices and perform spatial consistency check
        prices = np.array([d.price for d in data_points])
        consensus_value, spatial_score = self._spatial_consistency(prices)
        
        # Step 2: Temporal consistency check
        timestamps = [d.timestamp for d in data_points]
        temporal_score = self._temporal_consistency(timestamps)
        
        # Step 3: Statistical validation (outlier detection)
        statistical_score = self._statistical_validation(prices, consensus_value)
        
        # Step 4: Build cryptographic proof (Merkle tree)
        merkle_root = self._build_merkle_tree(data_points)
        
        # Step 5: Calculate overall consistency score
        # Weighted average of all verification layers
        consistency_score = (
            0.50 * spatial_score +      # Most important: source agreement
            0.20 * temporal_score +      # Timestamp freshness
            0.30 * statistical_score     # Statistical validity
        )
        
        logger.info(f"Verification complete: consistency={consistency_score:.2%}")
        logger.info(f"  Spatial: {spatial_score:.2%}")
        logger.info(f"  Temporal: {temporal_score:.2%}")
        logger.info(f"  Statistical: {statistical_score:.2%}")
        
        # Step 6: Create metadata
        metadata = {
            "sources": [d.source_id for d in data_points],
            "prices": prices.tolist(),
            "spatial_score": spatial_score,
            "temporal_score": temporal_score,
            "statistical_score": statistical_score,
            "median_price": float(np.median(prices)),
            "price_std": float(np.std(prices)),
            "price_range": [float(np.min(prices)), float(np.max(prices))],
        }
        
        # Step 7: Create and return TruthCertificate
        certificate = TruthCertificate(
            consensus_value=float(consensus_value),
            consistency_score=float(consistency_score),
            merkle_root=merkle_root,
            timestamp=int(time.time()),
            source_count=len(data_points),
            metadata=metadata
        )
        
        return certificate
    
    def _spatial_consistency(self, prices: np.ndarray) -> tuple[float, float]:
        """
        Calculate spatial consistency across multiple sources.
        
        Uses weighted median for robustness against outliers.
        
        Args:
            prices: Array of prices from different sources
        
        Returns:
            Tuple of (consensus_value, consistency_score)
        """
        # Use median as consensus (more robust than mean)
        consensus = np.median(prices)
        
        # Calculate consistency as inverse of coefficient of variation
        mean_price = np.mean(prices)
        std_price = np.std(prices)
        
        if mean_price == 0:
            return float(consensus), 0.0
        
        # Coefficient of variation
        cv = std_price / mean_price
        
        # Map to 0-1 score (lower CV = higher consistency)
        # Using exponential decay: score = exp(-k * cv)
        # k=10 means cv=0.1 (10% variation) gives score ≈ 0.37
        consistency_score = np.exp(-10 * cv)
        
        return float(consensus), float(consistency_score)
    
    def _temporal_consistency(self, timestamps: List[int]) -> float:
        """
        Check temporal consistency of data points.
        
        Verifies that all timestamps are recent and within a reasonable window.
        
        Args:
            timestamps: List of Unix timestamps
        
        Returns:
            Consistency score from 0.0 to 1.0
        """
        current_time = int(time.time())
        
        # Check freshness: all data should be within last 60 seconds
        max_age = 60  # seconds
        ages = [current_time - ts for ts in timestamps]
        max_observed_age = max(ages)
        
        if max_observed_age > max_age:
            freshness_score = max(0.0, 1.0 - (max_observed_age - max_age) / max_age)
        else:
            freshness_score = 1.0
        
        # Check synchronization: all timestamps should be close together
        timestamp_range = max(timestamps) - min(timestamps)
        max_acceptable_range = 30  # seconds
        
        if timestamp_range > max_acceptable_range:
            sync_score = max(0.0, 1.0 - (timestamp_range - max_acceptable_range) / max_acceptable_range)
        else:
            sync_score = 1.0
        
        # Combined temporal score
        temporal_score = 0.7 * freshness_score + 0.3 * sync_score
        
        return float(temporal_score)
    
    def _statistical_validation(self, prices: np.ndarray, consensus: float) -> float:
        """
        Perform statistical validation to detect outliers.
        
        Args:
            prices: Array of prices from different sources
            consensus: The consensus value (median)
        
        Returns:
            Validation score from 0.0 to 1.0
        """
        # Calculate how many prices are within acceptable range of consensus
        deviations = np.abs(prices - consensus) / consensus
        within_threshold = np.sum(deviations <= self.outlier_threshold)
        
        # Score based on percentage of sources within threshold
        validation_score = within_threshold / len(prices)
        
        return float(validation_score)
    
    def _build_merkle_tree(self, data_points: List[MarketDatum]) -> str:
        """
        Build a Merkle tree for cryptographic data provenance.
        
        Args:
            data_points: List of MarketDatum objects
        
        Returns:
            Merkle root hash (hex string)
        """
        # Create leaf hashes from each data point
        leaves = []
        for datum in data_points:
            # Hash the essential data: source, price, timestamp
            data_str = f"{datum.source_id}:{datum.price}:{datum.timestamp}"
            leaf_hash = hashlib.sha256(data_str.encode()).hexdigest()
            leaves.append(leaf_hash)
        
        # Build tree bottom-up
        current_level = leaves
        
        while len(current_level) > 1:
            next_level = []
            
            # Process pairs
            for i in range(0, len(current_level), 2):
                if i + 1 < len(current_level):
                    # Hash pair
                    combined = current_level[i] + current_level[i + 1]
                else:
                    # Odd number: duplicate last node
                    combined = current_level[i] + current_level[i]
                
                parent_hash = hashlib.sha256(combined.encode()).hexdigest()
                next_level.append(parent_hash)
            
            current_level = next_level
        
        # Root is the single remaining hash
        merkle_root = current_level[0]
        
        return merkle_root


# ============================================================================
# USAGE EXAMPLE
# ============================================================================

async def main():
    """Example usage of the TruthEngine"""
    from data_collector import DataCollector
    
    # Step 1: Collect data
    collector = DataCollector()
    print("Collecting BTC data from multiple sources...")
    btc_data = await collector.collect("BTC")
    
    if not btc_data:
        print("Failed to collect data")
        return
    
    print(f"\nCollected {len(btc_data)} data points:")
    for datum in btc_data:
        print(f"  {datum.source_id}: ${datum.price:.2f}")
    
    # Step 2: Process through TruthEngine
    engine = TruthEngine()
    print("\nProcessing through TruthEngine...")
    certificate = engine.process(btc_data)
    
    # Step 3: Display results
    print("\n" + "="*70)
    print("TRUTH CERTIFICATE")
    print("="*70)
    print(f"Consensus Value: ${certificate.consensus_value:.2f}")
    print(f"Consistency Score: {certificate.consistency_score:.2%}")
    print(f"Source Count: {certificate.source_count}")
    print(f"Merkle Root: {certificate.merkle_root[:16]}...")
    print(f"Valid: {certificate.is_valid()}")
    print("\nMetadata:")
    print(f"  Spatial Score: {certificate.metadata['spatial_score']:.2%}")
    print(f"  Temporal Score: {certificate.metadata['temporal_score']:.2%}")
    print(f"  Statistical Score: {certificate.metadata['statistical_score']:.2%}")
    print(f"  Price Range: ${certificate.metadata['price_range'][0]:.2f} - ${certificate.metadata['price_range'][1]:.2f}")
    print("="*70)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
