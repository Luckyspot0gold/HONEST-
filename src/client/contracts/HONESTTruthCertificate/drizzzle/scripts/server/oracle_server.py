"""
Honest Oracle - REST API Server
Reality Protocol LLC

FastAPI server that exposes the Honest Oracle as a REST API endpoint.

Endpoints:
- GET /oracle/{asset} - Get truth certificate for an asset
- GET /health - Health check endpoint

Author: Manus AI
Date: January 6, 2026
Classification: Proprietary and Confidential
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List
import logging
import time

from data_collector import DataCollector
from truth_engine import TruthEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Honest Oracle API",
    description="Multi-source cryptographic oracle for market data verification",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize oracle components
data_collector = DataCollector(timeout=10, max_retries=2)
truth_engine = TruthEngine(min_sources=2, outlier_threshold=0.15)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Honest Oracle API",
        "version": "1.0.0",
        "description": "Multi-source cryptographic oracle for market data verification",
        "endpoints": {
            "/oracle/{asset}": "Get truth certificate for an asset",
            "/health": "Health check endpoint",
            "/docs": "Interactive API documentation"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": int(time.time()),
        "service": "honest-oracle"
    }


@app.get("/oracle/{asset}")
async def get_oracle_data(
    asset: str,
    sources: Optional[str] = Query(
        None,
        description="Comma-separated list of sources (e.g., 'pyth,coingecko')"
    ),
    min_consistency: float = Query(
        0.8,
        ge=0.0,
        le=1.0,
        description="Minimum required consistency score"
    ),
    min_sources: int = Query(
        2,
        ge=1,
        description="Minimum required number of sources"
    )
):
    """
    Get truth certificate for a given asset.
    
    Args:
        asset: Asset ticker (e.g., 'BTC', 'ETH', 'SOL')
        sources: Optional comma-separated list of specific sources
        min_consistency: Minimum consistency score required (0.0-1.0)
        min_sources: Minimum number of sources required
    
    Returns:
        JSON response with truth certificate
    
    Raises:
        HTTPException: If data collection or verification fails
    """
    start_time = time.time()
    
    try:
        # Parse sources if provided
        source_list = None
        if sources:
            source_list = [s.strip() for s in sources.split(",")]
        
        # Step 1: Collect data
        logger.info(f"Collecting data for {asset} from sources: {source_list or 'all'}")
        data_points = await data_collector.collect(asset, sources=source_list)
        
        if not data_points:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to collect data for {asset} from any source"
            )
        
        # Step 2: Process through truth engine
        logger.info(f"Processing {len(data_points)} data points through truth engine")
        certificate = truth_engine.process(data_points)
        
        # Step 3: Validate certificate
        if not certificate.is_valid(min_consistency=min_consistency, min_sources=min_sources):
            logger.warning(
                f"Certificate for {asset} failed validation: "
                f"consistency={certificate.consistency_score:.2%}, "
                f"sources={certificate.source_count}"
            )
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "Certificate failed validation",
                    "consistency_score": certificate.consistency_score,
                    "min_consistency": min_consistency,
                    "source_count": certificate.source_count,
                    "min_sources": min_sources
                }
            )
        
        # Step 4: Calculate response time
        response_time_ms = (time.time() - start_time) * 1000
        
        # Step 5: Return certificate
        response = {
            "asset": asset.upper(),
            "certificate": certificate.to_dict(),
            "validation": {
                "is_valid": True,
                "min_consistency": min_consistency,
                "min_sources": min_sources
            },
            "performance": {
                "response_time_ms": round(response_time_ms, 2),
                "target_ms": 500
            }
        }
        
        logger.info(
            f"Oracle response for {asset}: "
            f"${certificate.consensus_value:.2f} "
            f"(consistency={certificate.consistency_score:.2%}, "
            f"time={response_time_ms:.0f}ms)"
        )
        
        return JSONResponse(content=response)
    
    except ValueError as e:
        logger.error(f"ValueError for {asset}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Unexpected error for {asset}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/assets")
async def list_supported_assets():
    """List all supported assets"""
    return {
        "assets": list(data_collector.asset_map.keys()),
        "count": len(data_collector.asset_map)
    }


@app.get("/sources")
async def list_supported_sources():
    """List all supported data sources"""
    return {
        "sources": list(data_collector.sources.keys()),
        "count": len(data_collector.sources)
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run the server
    uvicorn.run(
        "oracle_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
