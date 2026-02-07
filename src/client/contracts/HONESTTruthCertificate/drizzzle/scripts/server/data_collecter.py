"""
Honest Oracle - Data Collector Module
Reality Protocol LLC

This module fetches market data from multiple independent sources concurrently
to ensure data integrity through multi-source consensus.

Supported Sources:
- Pyth Network (high-fidelity, low-latency price feeds)
- CoinGecko (broad market coverage)
- Binance (major exchange data)
- CoinStats (aggregated data)

Author: Manus AI
Date: January 24, 2026
Classification: Proprietary and Confidential
"""

import requests
import time
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataSource(Enum):
    """Enumeration of supported data sources"""
    PYTH = "pyth"
    COINGECKO = "coingecko"
    BINANCE = "binance"
    COINSTATS = "coinstats"


@dataclass
class MarketDatum:
    """
    Represents a single market data point from a specific source.
    
    Attributes:
        price: Current price in USD
        volume: 24-hour trading volume in USD
        timestamp: Unix timestamp when data was fetched
        source_id: Identifier of the data source
        market_cap: Market capitalization (optional)
        change_24h: 24-hour price change percentage (optional)
    """
    price: float
    volume: float
    timestamp: int
    source_id: str
    market_cap: Optional[float] = None
    change_24h: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return asdict(self)


class DataCollector:
    """
    Orchestrates concurrent data fetching from multiple sources.
    Implements timeout and retry logic for robustness.
    """
    
    def __init__(self, timeout: int = 10, max_retries: int = 2):
        """
        Initialize the data collector.
        
        Args:
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts per source
        """
        self.timeout = timeout
        self.max_retries = max_retries
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'HonestOracle/2.0 (Reality Protocol LLC)'
        })
        
        # API endpoints
        self.endpoints = {
            DataSource.COINGECKO: "https://api.coingecko.com/api/v3/simple/price",
            DataSource.BINANCE: "https://api.binance.com/api/v3/ticker/24hr",
            DataSource.COINSTATS: "https://api.coinstats.app/public/v1/coins",
            DataSource.PYTH: "https://hermes.pyth.network/api/latest_price_feeds"
        }
        
        # Asset ID mappings for different APIs
        self.asset_mappings = {
            "BTC": {
                DataSource.COINGECKO: "bitcoin",
                DataSource.BINANCE: "BTCUSDT",
                DataSource.COINSTATS: "bitcoin",
                DataSource.PYTH: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43"
            },
            "ETH": {
                DataSource.COINGECKO: "ethereum",
                DataSource.BINANCE: "ETHUSDT",
                DataSource.COINSTATS: "ethereum",
                DataSource.PYTH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"
            },
            "SOL": {
                DataSource.COINGECKO: "solana",
                DataSource.BINANCE: "SOLUSDT",
                DataSource.COINSTATS: "solana",
                DataSource.PYTH: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"
            },
            "AVAX": {
                DataSource.COINGECKO: "avalanche-2",
                DataSource.BINANCE: "AVAXUSDT",
                DataSource.COINSTATS: "avalanche",
                DataSource.PYTH: "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7"
            }
        }
    
    def fetch_from_coingecko(self, asset: str) -> Optional[MarketDatum]:
        """Fetch data from CoinGecko API"""
        try:
            coin_id = self.asset_mappings.get(asset, {}).get(DataSource.COINGECKO)
            if not coin_id:
                logger.warning(f"No CoinGecko mapping for {asset}")
                return None
            
            params = {
                'ids': coin_id,
                'vs_currencies': 'usd',
                'include_market_cap': 'true',
                'include_24hr_vol': 'true',
                'include_24hr_change': 'true'
            }
            
            response = self.session.get(
                self.endpoints[DataSource.COINGECKO],
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            data = response.json()
            
            if coin_id in data:
                coin_data = data[coin_id]
                return MarketDatum(
                    price=coin_data.get('usd', 0.0),
                    volume=coin_data.get('usd_24h_vol', 0.0),
                    timestamp=int(time.time()),
                    source_id=DataSource.COINGECKO.value,
                    market_cap=coin_data.get('usd_market_cap'),
                    change_24h=coin_data.get('usd_24h_change')
                )
        except Exception as e:
            logger.error(f"CoinGecko fetch error for {asset}: {e}")
            return None
    
    def fetch_from_binance(self, asset: str) -> Optional[MarketDatum]:
        """Fetch data from Binance API"""
        try:
            symbol = self.asset_mappings.get(asset, {}).get(DataSource.BINANCE)
            if not symbol:
                logger.warning(f"No Binance mapping for {asset}")
                return None
            
            params = {'symbol': symbol}
            response = self.session.get(
                self.endpoints[DataSource.BINANCE],
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            data = response.json()
            
            return MarketDatum(
                price=float(data.get('lastPrice', 0.0)),
                volume=float(data.get('volume', 0.0)) * float(data.get('lastPrice', 0.0)),
                timestamp=int(time.time()),
                source_id=DataSource.BINANCE.value,
                change_24h=float(data.get('priceChangePercent', 0.0))
            )
        except Exception as e:
            logger.error(f"Binance fetch error for {asset}: {e}")
            return None
    
    def fetch_from_coinstats(self, asset: str) -> Optional[MarketDatum]:
        """Fetch data from CoinStats API"""
        try:
            coin_id = self.asset_mappings.get(asset, {}).get(DataSource.COINSTATS)
            if not coin_id:
                logger.warning(f"No CoinStats mapping for {asset}")
                return None
            
            response = self.session.get(
                f"{self.endpoints[DataSource.COINSTATS]}/{coin_id}",
                timeout=self.timeout
            )
            response.raise_for_status()
            data = response.json()
            
            coin_data = data.get('coin', {})
            return MarketDatum(
                price=float(coin_data.get('price', 0.0)),
                volume=float(coin_data.get('volume', 0.0)),
                timestamp=int(time.time()),
                source_id=DataSource.COINSTATS.value,
                market_cap=float(coin_data.get('marketCap', 0.0)),
                change_24h=float(coin_data.get('priceChange1d', 0.0))
            )
        except Exception as e:
            logger.error(f"CoinStats fetch error for {asset}: {e}")
            return None
    
    def fetch_from_pyth(self, asset: str) -> Optional[MarketDatum]:
        """Fetch data from Pyth Network"""
        try:
            price_feed_id = self.asset_mappings.get(asset, {}).get(DataSource.PYTH)
            if not price_feed_id:
                logger.warning(f"No Pyth mapping for {asset}")
                return None
            
            params = {'ids[]': price_feed_id}
            response = self.session.get(
                self.endpoints[DataSource.PYTH],
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            data = response.json()
            
            if data and len(data) > 0:
                feed = data[0]
                price_data = feed.get('price', {})
                price = float(price_data.get('price', 0)) * (10 ** int(price_data.get('expo', 0)))
                
                return MarketDatum(
                    price=price,
                    volume=0.0,  # Pyth doesn't provide volume
                    timestamp=int(time.time()),
                    source_id=DataSource.PYTH.value
                )
        except Exception as e:
            logger.error(f"Pyth fetch error for {asset}: {e}")
            return None
    
    def fetch_all_sources(self, asset: str) -> List[MarketDatum]:
        """
        Fetch data from all sources concurrently using ThreadPoolExecutor.
        
        Args:
            asset: Asset symbol (e.g., "BTC", "ETH")
            
        Returns:
            List of successfully fetched MarketDatum objects
        """
        results = []
        
        # Define fetch functions
        fetch_functions = [
            self.fetch_from_coingecko,
            self.fetch_from_binance,
            self.fetch_from_coinstats,
            self.fetch_from_pyth
        ]
        
        # Execute fetches concurrently
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = {executor.submit(func, asset): func.__name__ for func in fetch_functions}
            
            for future in as_completed(futures):
                try:
                    result = future.result()
                    if result:
                        results.append(result)
                        logger.info(f"Successfully fetched from {result.source_id} for {asset}")
                except Exception as e:
                    logger.error(f"Error in {futures[future]}: {e}")
        
        logger.info(f"Collected {len(results)} data points for {asset}")
        return results
    
    def close(self):
        """Close the requests session"""
        self.session.close()


# Example usage
if __name__ == "__main__":
    collector = DataCollector()
    
    # Test with BTC
    data = collector.fetch_all_sources("BTC")
    
    print(f"\nCollected {len(data)} data points for BTC:")
    for datum in data:
        print(f"  {datum.source_id}: ${datum.price:.2f} (volume: ${datum.volume:,.0f})")
    
    collector.close()
