#!/usr/bin/env python3
"""
Command-line wrapper for Oracle eigenstate calculation
Called by Node.js to get eigenstate data for a specific asset
"""

import sys
import json
from data_collector import DataCollector
from truth_engine import TruthEngine
import numpy as np

def get_eigenstate(asset: str):
    """Get eigenstate data for an asset"""
    try:
        # Initialize components
        data_collector = DataCollector(timeout=10, max_retries=2)
        truth_engine = TruthEngine(min_sources=2, outlier_threshold=0.15)
        
        # Collect data from all sources
        data_points = data_collector.fetch_all_sources(asset)
        
        if not data_points:
            raise ValueError(f"No data available for {asset}")
        
        # Process through truth engine
        certificate = truth_engine.process(data_points)
        
        # Calculate 6D eigenstate dimensions (normalized to -1 to 1)
        price_val = certificate.consensus_value
        
        # Calculate volume from data points
        avg_volume = np.mean([d.volume for d in data_points if d.volume > 0])
        
        # Generate dimensions based on available data
        dimensions = {
            "price": float(np.tanh((price_val - 50000) / 10000)),  # Normalized price momentum
            "volume": float(np.tanh(avg_volume / 1e9)),  # Normalized volume
            "momentum": float(np.random.uniform(-0.5, 0.5)),  # Placeholder for momentum
            "sentiment": float(certificate.consistency_score * 2 - 1),  # Map 0-1 to -1-1
            "temporal": float(np.random.uniform(-0.5, 0.5)),  # Placeholder for temporal
            "spatial": float(np.random.uniform(-0.5, 0.5))  # Placeholder for spatial
        }
        
        # Calculate coherence (average of absolute dimension values)
        coherence = float(np.mean([abs(v) for v in dimensions.values()]))
        
        # Determine decision based on coherence and price momentum
        if coherence > 0.5 and dimensions["price"] > 0:
            decision = "BUY"
        elif coherence > 0.5 and dimensions["price"] < 0:
            decision = "SELL"
        else:
            decision = "HOLD"
        
        # Build response
        result = {
            "asset": asset.upper(),
            "timestamp": int(certificate.timestamp * 1000),  # Convert to milliseconds
            "dimensions": dimensions,
            "coherence": coherence,
            "phase_angle": float(np.random.uniform(0, 360)),
            "decision": decision,
            "truth_certificate": {
                "consensus_value": float(certificate.consensus_value),
                "consistency_score": float(certificate.consistency_score),
                "merkle_root": certificate.merkle_root,
                "source_count": certificate.source_count
            }
        }
        
        # Close the data collector session
        data_collector.close()
        
        # Output JSON to stdout
        print(json.dumps(result))
        return 0
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "asset": asset
        }
        print(json.dumps(error_result), file=sys.stderr)
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Asset argument required"}), file=sys.stderr)
        sys.exit(1)
    
    asset = sys.argv[1]
    exit_code = get_eigenstate(asset)
    sys.exit(exit_code)
