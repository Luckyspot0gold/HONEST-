/**
 * Eigenstate Router
 * 
 * tRPC router for accessing real-time market eigenstate data
 * from the Enhanced Oracle v2.0 system.
 */

import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { 
  getEigenstateFromOracle, 
  getSupportedAssets,
  calculateEigenstate,
  calculateCoherence,
  getDecision,
  type EigenstateData 
} from './oracle';

// In-memory cache for eigenstate data (5-second TTL)
interface CachedEigenstate {
  data: EigenstateData;
  timestamp: number;
  archimedes?: {
    histogram: number[];
    exhaustion: number;
    netForce: number;
    audioFrequency: number;
    hapticIntensity: number;
    visualColor: string;
  };
}
const eigenstateCache = new Map<string, CachedEigenstate>();
const CACHE_TTL = 5000; // 5 seconds

/**
 * Generate mock eigenstate data (fallback when Python oracle is unavailable)
 */
function generateMockEigenstate(asset: string): EigenstateData {
  const baseCoherence = Math.random() * 2 - 1; // -1 to 1
  
  const dimensions = {
    price: Math.random() * 2 - 1,
    volume: Math.random() * 2 - 1,
    momentum: Math.random() * 2 - 1,
    sentiment: Math.random() * 2 - 1,
    temporal: Math.random() * 2 - 1,
    spatial: Math.random() * 2 - 1
  };
  
  const coherence = calculateCoherence(dimensions);
  
  return {
    asset,
    timestamp: Date.now(),
    dimensions,
    coherence,
    phase_angle: Math.random() * 360,
    decision: getDecision(coherence)
  };
}

export const eigenstateRouter = router({
  /**
   * Get eigenstate data for a specific asset
   */
  get: publicProcedure
    .input(z.object({
      asset: z.string().min(1).max(10)
    }))
    .query(async ({ input }) => {
      const { asset } = input;
      const assetUpper = asset.toUpperCase();
      
      // Check cache first
      const cached = eigenstateCache.get(assetUpper);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return {
          success: true,
          data: cached.data,
          source: 'cache' as const,
          archimedes: cached.archimedes
        };
      }
      
      // Try to get data from Python oracle
      try {
        const oracleResponse = await getEigenstateFromOracle(assetUpper);
        
        if (oracleResponse.success && oracleResponse.data) {
          // Generate Archimedes MACD data
          const mockHistogram = Array.from({ length: 20 }, () => (Math.random() - 0.5) * 2);
          const positiveArea = mockHistogram.filter(v => v > 0).reduce((sum, v) => sum + v, 0);
          const negativeArea = Math.abs(mockHistogram.filter(v => v < 0).reduce((sum, v) => sum + v, 0));
          const totalArea = positiveArea + negativeArea;
          const exhaustion = totalArea > 0 ? Math.abs(positiveArea - negativeArea) / totalArea : 0;
          const netForce = positiveArea - negativeArea;
          const audioFrequency = 432 * (1 + (exhaustion - 0.5));
          const hapticIntensity = Math.min(Math.abs(netForce) * 0.2, 1.0);
          const visualColor = netForce > 0 ? '#10b981' : '#ef4444';
          
          const archimedesdData = {
            histogram: mockHistogram,
            exhaustion,
            netForce,
            audioFrequency,
            hapticIntensity,
            visualColor
          };
          
          // Cache the result
          eigenstateCache.set(assetUpper, {
            data: oracleResponse.data,
            timestamp: Date.now(),
            archimedes: archimedesdData
          } as any);
          
          return {
            success: true,
            data: oracleResponse.data,
            source: 'oracle' as const,
            archimedes: archimedesdData
          };
        }
      } catch (error) {
        console.error(`Oracle error for ${assetUpper}:`, error);
      }
      
      // Fallback to mock data
      const mockData = generateMockEigenstate(assetUpper);
      
      // Generate mock Archimedes data
      const mockHistogram = Array.from({ length: 20 }, () => (Math.random() - 0.5) * 2);
      const positiveArea = mockHistogram.filter(v => v > 0).reduce((sum, v) => sum + v, 0);
      const negativeArea = Math.abs(mockHistogram.filter(v => v < 0).reduce((sum, v) => sum + v, 0));
      const totalArea = positiveArea + negativeArea;
      const exhaustion = totalArea > 0 ? Math.abs(positiveArea - negativeArea) / totalArea : 0;
      const netForce = positiveArea - negativeArea;
      const audioFrequency = 432 * (1 + (exhaustion - 0.5));
      const hapticIntensity = Math.min(Math.abs(netForce) * 0.2, 1.0);
      const visualColor = netForce > 0 ? '#10b981' : '#ef4444';
      
      const mockArchimedes = {
        histogram: mockHistogram,
        exhaustion,
        netForce,
        audioFrequency,
        hapticIntensity,
        visualColor
      };
      
      // Cache mock data too
      eigenstateCache.set(assetUpper, {
        data: mockData,
        timestamp: Date.now(),
        archimedes: mockArchimedes
      } as any);
      
      return {
        success: true,
        data: mockData,
        source: 'mock' as const,
        archimedes: mockArchimedes
      };
    }),
  
  /**
   * Get list of supported assets
   */
  listAssets: publicProcedure
    .query(() => {
      return {
        assets: getSupportedAssets()
      };
    }),
  
  /**
   * Get multiple eigenstates at once
   */
  getMultiple: publicProcedure
    .input(z.object({
      assets: z.array(z.string()).min(1).max(10)
    }))
    .query(async ({ input }) => {
      const { assets } = input;
      
      const results = await Promise.all(
        assets.map(async (asset) => {
          const assetUpper = asset.toUpperCase();
          
          // Check cache
          const cached = eigenstateCache.get(assetUpper);
          if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return {
              asset: assetUpper,
              success: true,
              data: cached.data,
              source: 'cache' as const
            };
          }
          
          // Try oracle
          try {
            const oracleResponse = await getEigenstateFromOracle(assetUpper);
            
            if (oracleResponse.success && oracleResponse.data) {
              eigenstateCache.set(assetUpper, {
                data: oracleResponse.data,
                timestamp: Date.now()
              });
              
              return {
                asset: assetUpper,
                success: true,
                data: oracleResponse.data,
                source: 'oracle' as const
              };
            }
          } catch (error) {
            console.error(`Oracle error for ${assetUpper}:`, error);
          }
          
          // Fallback to mock
          const mockData = generateMockEigenstate(assetUpper);
          eigenstateCache.set(assetUpper, {
            data: mockData,
            timestamp: Date.now()
          });
          
          return {
            asset: assetUpper,
            success: true,
            data: mockData,
            source: 'mock' as const
          };
        })
      );
      
      return {
        results
      };
    })
});
