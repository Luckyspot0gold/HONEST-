import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import {
  mintTruthCertificate,
  getEigenstateRecord,
  getTotalSupply,
  getTokenURI,
  getTokenOwner,
  generateNFTMetadata,
} from './nft';
import { createHash } from 'crypto';

/**
 * tRPC Router for HONEST Truth Certificate NFT operations
 * 
 * Endpoints:
 * - mint: Mint a new Truth Certificate NFT on Avalanche C-Chain
 * - getRecord: Get eigenstate record for a token ID
 * - getTotalSupply: Get total number of minted NFTs
 * - getTokenURI: Get metadata URI for a token ID
 * - getOwner: Get owner address for a token ID
 * - generateMetadata: Generate ERC-721 metadata JSON
 */

export const nftRouter = router({
  /**
   * Mint a Truth Certificate NFT
   * 
   * Requires:
   * - VITE_NFT_CONTRACT_ADDRESS: Deployed contract address
   * - NFT_MINTER_PRIVATE_KEY: Private key with AVAX for gas fees
   */
  mint: publicProcedure
    .input(
      z.object({
        recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
        asset: z.string().min(1).max(10),
        timestamp: z.number().int().positive(),
        coherence: z.number().min(-1).max(1),
        decision: z.enum(['BUY', 'SELL', 'HOLD']),
        eigenstateData: z.any(), // Full eigenstate data for proof hash
        dataURI: z.string().url().optional(),
        network: z.enum(['mainnet', 'fuji']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const contractAddress = process.env.VITE_NFT_CONTRACT_ADDRESS;
      const privateKey = process.env.NFT_MINTER_PRIVATE_KEY;

      if (!contractAddress) {
        throw new Error('NFT contract address not configured. Set VITE_NFT_CONTRACT_ADDRESS in environment.');
      }

      if (!privateKey) {
        throw new Error('NFT minter private key not configured. Set NFT_MINTER_PRIVATE_KEY in environment.');
      }

      // Generate proof hash from eigenstate data
      const proofHash = createHash('sha256')
        .update(JSON.stringify(input.eigenstateData))
        .digest('hex');

      // Generate NFT metadata
      const metadata = generateNFTMetadata({
        asset: input.asset,
        coherence: input.coherence,
        decision: input.decision,
        timestamp: input.timestamp,
      });

      // In production, upload metadata to IPFS or decentralized storage
      // For now, we'll use a placeholder URI
      const metadataURI = input.dataURI || `https://honest.manus.space/api/nft/metadata/${input.asset}/${input.timestamp}`;
      const tokenURI = metadataURI;

      // Mint the NFT
      const result = await mintTruthCertificate({
        contractAddress,
        privateKey,
        recipient: input.recipient,
        asset: input.asset,
        timestamp: input.timestamp,
        coherence: input.coherence,
        decision: input.decision,
        proofHash: `0x${proofHash}`,
        dataURI: metadataURI,
        tokenURI,
        network: input.network || 'fuji',
      });

      return {
        success: true,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        tokenId: result.tokenId,
        gasUsed: result.gasUsed,
        metadata,
        explorerUrl: input.network === 'mainnet'
          ? `https://snowtrace.io/tx/${result.transactionHash}`
          : `https://testnet.snowtrace.io/tx/${result.transactionHash}`,
      };
    }),

  /**
   * Get eigenstate record for a token ID
   */
  getRecord: publicProcedure
    .input(
      z.object({
        tokenId: z.number().int().nonnegative(),
        network: z.enum(['mainnet', 'fuji']).optional(),
      })
    )
    .query(async ({ input }) => {
      const contractAddress = process.env.VITE_NFT_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error('NFT contract address not configured.');
      }

      const record = await getEigenstateRecord(
        contractAddress,
        input.tokenId,
        input.network || 'fuji'
      );

      return record;
    }),

  /**
   * Get total supply of minted NFTs
   */
  getTotalSupply: publicProcedure
    .input(
      z.object({
        network: z.enum(['mainnet', 'fuji']).optional(),
      })
    )
    .query(async ({ input }) => {
      const contractAddress = process.env.VITE_NFT_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error('NFT contract address not configured.');
      }

      const supply = await getTotalSupply(contractAddress, input.network || 'fuji');

      return { totalSupply: supply };
    }),

  /**
   * Get token URI (metadata) for a token ID
   */
  getTokenURI: publicProcedure
    .input(
      z.object({
        tokenId: z.number().int().nonnegative(),
        network: z.enum(['mainnet', 'fuji']).optional(),
      })
    )
    .query(async ({ input }) => {
      const contractAddress = process.env.VITE_NFT_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error('NFT contract address not configured.');
      }

      const uri = await getTokenURI(
        contractAddress,
        input.tokenId,
        input.network || 'fuji'
      );

      return { tokenURI: uri };
    }),

  /**
   * Get owner address for a token ID
   */
  getOwner: publicProcedure
    .input(
      z.object({
        tokenId: z.number().int().nonnegative(),
        network: z.enum(['mainnet', 'fuji']).optional(),
      })
    )
    .query(async ({ input }) => {
      const contractAddress = process.env.VITE_NFT_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error('NFT contract address not configured.');
      }

      const owner = await getTokenOwner(
        contractAddress,
        input.tokenId,
        input.network || 'fuji'
      );

      return { owner };
    }),

  /**
   * Generate NFT metadata JSON (for preview/testing)
   */
  generateMetadata: publicProcedure
    .input(
      z.object({
        asset: z.string(),
        coherence: z.number(),
        decision: z.enum(['BUY', 'SELL', 'HOLD']),
        timestamp: z.number(),
      })
    )
    .query(({ input }) => {
      return generateNFTMetadata(input);
    }),
});
