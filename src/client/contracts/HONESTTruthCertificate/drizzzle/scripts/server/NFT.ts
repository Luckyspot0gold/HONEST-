import { ethers } from 'ethers';
// Environment variables will be accessed via process.env

/**
 * NFT Contract Interaction Utilities for HONEST Truth Certificates
 * 
 * This module provides server-side functions to interact with the deployed
 * HonestTruthCertificate NFT contract on Avalanche C-Chain.
 */

// Contract ABI (Application Binary Interface) - only the functions we need
const CONTRACT_ABI = [
  "function mintTruthCertificate(address recipient, string asset, uint256 timestamp, int256 coherence, string decision, bytes32 proofHash, string dataURI, string tokenURI) public returns (uint256)",
  "function getEigenstateRecord(uint256 tokenId) public view returns (tuple(string asset, uint256 timestamp, int256 coherence, string decision, bytes32 proofHash, string dataURI))",
  "function totalSupply() public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
];

// Avalanche C-Chain RPC URLs
const AVALANCHE_RPC_URLS = {
  mainnet: 'https://api.avax.network/ext/bc/C/rpc',
  fuji: 'https://api.avax-test.network/ext/bc/C/rpc',
};

// Chain IDs
const CHAIN_IDS = {
  mainnet: 43114,
  fuji: 43113,
};

/**
 * Get ethers provider for Avalanche C-Chain
 */
export function getProvider(network: 'mainnet' | 'fuji' = 'fuji') {
  return new ethers.JsonRpcProvider(AVALANCHE_RPC_URLS[network]);
}

/**
 * Get contract instance (read-only)
 */
export function getContract(contractAddress: string, network: 'mainnet' | 'fuji' = 'fuji') {
  const provider = getProvider(network);
  return new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
}

/**
 * Get contract instance with signer (for write operations)
 */
export function getContractWithSigner(
  contractAddress: string,
  privateKey: string,
  network: 'mainnet' | 'fuji' = 'fuji'
) {
  const provider = getProvider(network);
  const wallet = new ethers.Wallet(privateKey, provider);
  return new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
}

/**
 * Mint a Truth Certificate NFT
 * 
 * @param params Minting parameters
 * @returns Transaction receipt and token ID
 */
export async function mintTruthCertificate(params: {
  contractAddress: string;
  privateKey: string;
  recipient: string;
  asset: string;
  timestamp: number;
  coherence: number; // -1 to 1 (will be scaled to -1000 to 1000)
  decision: 'BUY' | 'SELL' | 'HOLD';
  proofHash: string; // SHA-256 hash as hex string
  dataURI: string; // URI to full eigenstate JSON
  tokenURI: string; // NFT metadata URI
  network?: 'mainnet' | 'fuji';
}) {
  const contract = getContractWithSigner(
    params.contractAddress,
    params.privateKey,
    params.network || 'fuji'
  );

  // Scale coherence from -1..1 to -1000..1000 for Solidity precision
  const scaledCoherence = Math.round(params.coherence * 1000);

  // Convert proof hash to bytes32 format
  const proofHashBytes32 = params.proofHash.startsWith('0x')
    ? params.proofHash
    : `0x${params.proofHash}`;

  // Call the mint function
  const tx = await contract.mintTruthCertificate(
    params.recipient,
    params.asset,
    params.timestamp,
    scaledCoherence,
    params.decision,
    proofHashBytes32,
    params.dataURI,
    params.tokenURI
  );

  // Wait for transaction confirmation
  const receipt = await tx.wait();

  // Extract token ID from event logs
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'TruthCertificateMinted';
    } catch {
      return false;
    }
  });

  let tokenId: bigint | null = null;
  if (event) {
    const parsed = contract.interface.parseLog(event);
    tokenId = parsed?.args?.tokenId;
  }

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    tokenId: tokenId ? tokenId.toString() : null,
    gasUsed: receipt.gasUsed.toString(),
  };
}

/**
 * Get eigenstate record for a given token ID
 */
export async function getEigenstateRecord(
  contractAddress: string,
  tokenId: number,
  network: 'mainnet' | 'fuji' = 'fuji'
) {
  const contract = getContract(contractAddress, network);
  const record = await contract.getEigenstateRecord(tokenId);

  return {
    asset: record.asset,
    timestamp: Number(record.timestamp),
    coherence: Number(record.coherence) / 1000, // Scale back to -1..1
    decision: record.decision,
    proofHash: record.proofHash,
    dataURI: record.dataURI,
  };
}

/**
 * Get total supply of minted NFTs
 */
export async function getTotalSupply(
  contractAddress: string,
  network: 'mainnet' | 'fuji' = 'fuji'
) {
  const contract = getContract(contractAddress, network);
  const supply = await contract.totalSupply();
  return Number(supply);
}

/**
 * Get token URI (metadata) for a given token ID
 */
export async function getTokenURI(
  contractAddress: string,
  tokenId: number,
  network: 'mainnet' | 'fuji' = 'fuji'
) {
  const contract = getContract(contractAddress, network);
  return await contract.tokenURI(tokenId);
}

/**
 * Get owner address for a given token ID
 */
export async function getTokenOwner(
  contractAddress: string,
  tokenId: number,
  network: 'mainnet' | 'fuji' = 'fuji'
) {
  const contract = getContract(contractAddress, network);
  return await contract.ownerOf(tokenId);
}

/**
 * Generate NFT metadata JSON (ERC-721 standard)
 */
export function generateNFTMetadata(params: {
  asset: string;
  coherence: number;
  decision: 'BUY' | 'SELL' | 'HOLD';
  timestamp: number;
  imageURI?: string;
}) {
  const coherenceLabel =
    params.coherence > 0.8 ? 'COHERENT TREND' :
    params.coherence > 0.5 ? 'ALIGNED' :
    params.coherence > 0.0 ? 'TRANSITIONAL' :
    params.coherence > -0.5 ? 'UNCERTAIN' :
    params.coherence > -0.8 ? 'MISALIGNED' :
    'DECOHERENT';

  const decisionColor =
    params.decision === 'BUY' ? '#10b981' :
    params.decision === 'SELL' ? '#ef4444' :
    '#f59e0b';

  return {
    name: `HONEST Truth Certificate - ${params.asset}`,
    description: `Cryptographically verified market eigenstate verdict for ${params.asset} with 5-layer recursive truth verification. Coherence: ${params.coherence.toFixed(3)} (${coherenceLabel}). Decision: ${params.decision}.`,
    image: params.imageURI || 'https://files.manuscdn.com/user_upload_by_module/session_file/93610584/zzLBvexGzpKSjpys.png',
    external_url: 'https://honest.manus.space',
    attributes: [
      {
        trait_type: 'Asset',
        value: params.asset,
      },
      {
        trait_type: 'Coherence',
        display_type: 'number',
        value: params.coherence,
      },
      {
        trait_type: 'Coherence Label',
        value: coherenceLabel,
      },
      {
        trait_type: 'Decision',
        value: params.decision,
      },
      {
        trait_type: 'Timestamp',
        display_type: 'date',
        value: params.timestamp,
      },
      {
        trait_type: 'Verification',
        value: '5-Layer Recursive Truth',
      },
      {
        trait_type: 'Standard',
        value: 'HONEST-LEDGER',
      },
      {
        trait_type: 'Hackathon',
        value: 'Avalanche x402 Payments',
      },
    ],
    properties: {
      decision_color: decisionColor,
      coherence_label: coherenceLabel,
      verification_layers: 5,
    },
  };
}
