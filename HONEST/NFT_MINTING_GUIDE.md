# HONEST Truth Certificate NFT Minting Guide

## Overview

The H.O.N.E.S.T. system now supports minting market eigenstate verdicts as NFTs on **Avalanche C-Chain**. Each Truth Certificate is an ERC-721 NFT containing:

- **6D Eigenstate Dimensions** (price, volume, momentum, sentiment, temporal, spatial)
- **Coherence Score** (-1 to 1)
- **Market Decision** (BUY/SELL/HOLD)
- **5-Layer Recursive Truth Verification Proof**
- **Cryptographic Hash** (SHA-256) of full eigenstate data
- **Timestamp** and **Asset Identifier**

This feature is built for the **Avalanche x402 Hackathon (Payments track)** and demonstrates immutable, on-chain truth verification.

---

## Smart Contract

**Contract:** `HonestTruthCertificate.sol`  
**Standard:** ERC-721 (NFT)  
**License:** Apache 2.0  
**Networks:**
- **Fuji Testnet** (Chain ID: 43113) - Free testnet AVAX
- **Avalanche Mainnet** (Chain ID: 43114) - Real AVAX required

### Contract Features

- `mintTruthCertificate()` - Mint a new Truth Certificate NFT
- `getEigenstateRecord()` - Retrieve on-chain eigenstate data
- `totalSupply()` - Get total number of minted NFTs
- `tokenURI()` - Get NFT metadata URI
- `ownerOf()` - Get owner address for a token ID

---

## Deployment

### Prerequisites

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Get Testnet AVAX:**
   - Visit [Avalanche Fuji Faucet](https://core.app/tools/testnet-faucet/)
   - Connect your wallet and request testnet AVAX

3. **Set Environment Variables:**
   ```bash
   # Add to .env file
   PRIVATE_KEY=your_wallet_private_key_here
   VITE_NFT_CONTRACT_ADDRESS=deployed_contract_address_here
   NFT_MINTER_PRIVATE_KEY=backend_wallet_private_key_here
   ```

### Deploy to Fuji Testnet

```bash
npx hardhat run scripts/deploy.ts --network fuji
```

**Expected Output:**
```
🚀 Deploying HONEST Truth Certificate NFT contract...

Deploying contracts with account: 0x...
Account balance: 10.0 AVAX

✅ HonestTruthCertificate deployed to: 0x...

📝 Contract Details:
   Name: HONEST Truth Certificate
   Symbol: HONEST
   Owner: 0x...
   Total Supply: 0

🔗 Next Steps:
1. Save the contract address to your .env file:
   VITE_NFT_CONTRACT_ADDRESS=0x...

2. Verify the contract on Snowtrace (optional):
   npx hardhat verify --network fuji 0x...

3. Test minting a Truth Certificate:
   npx hardhat run scripts/mint.ts --network fuji
```

### Deploy to Mainnet

```bash
npx hardhat run scripts/deploy.ts --network avalanche
```

⚠️ **Warning:** Mainnet deployment requires real AVAX for gas fees.

---

## API Endpoints

The NFT minting functionality is exposed via tRPC API:

### `trpc.nft.mint`

Mint a new Truth Certificate NFT.

**Input:**
```typescript
{
  recipient: string;        // Wallet address (0x...)
  asset: string;            // e.g., "BTC", "ETH", "AVAX"
  timestamp: number;        // Unix timestamp
  coherence: number;        // -1 to 1
  decision: 'BUY' | 'SELL' | 'HOLD';
  eigenstateData: any;      // Full eigenstate object
  dataURI?: string;         // Optional URI to eigenstate JSON
  network?: 'mainnet' | 'fuji';  // Default: 'fuji'
}
```

**Output:**
```typescript
{
  success: true;
  transactionHash: string;
  blockNumber: number;
  tokenId: string;
  gasUsed: string;
  metadata: object;         // ERC-721 metadata JSON
  explorerUrl: string;      // Snowtrace transaction URL
}
```

### `trpc.nft.getRecord`

Get eigenstate record for a token ID.

**Input:**
```typescript
{
  tokenId: number;
  network?: 'mainnet' | 'fuji';
}
```

**Output:**
```typescript
{
  asset: string;
  timestamp: number;
  coherence: number;
  decision: string;
  proofHash: string;
  dataURI: string;
}
```

### `trpc.nft.getTotalSupply`

Get total number of minted NFTs.

**Input:**
```typescript
{
  network?: 'mainnet' | 'fuji';
}
```

**Output:**
```typescript
{
  totalSupply: number;
}
```

---

## Frontend Integration

### NFTMinting Component

The `NFTMinting` component provides a user-friendly interface for minting Truth Certificates.

**Usage:**
```tsx
import { NFTMinting } from '@/components/NFTMinting';

<NFTMinting eigenstate={eigenstateData} />
```

**Features:**
- MetaMask wallet connection
- Manual wallet address input
- Network selection (Fuji/Mainnet)
- Eigenstate summary preview
- Transaction status tracking
- Snowtrace explorer link

---

## HONEST-LEDGER Standard Integration

The NFT minting system integrates with the **HONEST-LEDGER** standard for immutable truth records:

```typescript
import { HonestLedger } from '@/lib/honest-ledger';

// Create a ledger record
const record = HonestLedger.createRecord({
  asset: 'BTC',
  coherence: 0.85,
  decision: 'BUY',
  timestamp: Date.now(),
  dimensions: eigenstateData.dimensions,
  proofHash: 'sha256_hash_here',
});

// Export as JSON for storage
const json = HonestLedger.exportToJSON(record);

// Mint as NFT
const result = await trpc.nft.mint.mutate({
  recipient: walletAddress,
  ...record,
  eigenstateData: json,
});
```

---

## NFT Metadata Structure

Each Truth Certificate NFT includes ERC-721 compliant metadata:

```json
{
  "name": "HONEST Truth Certificate - BTC",
  "description": "Cryptographically verified market eigenstate verdict for BTC with 5-layer recursive truth verification. Coherence: 0.850 (ALIGNED). Decision: BUY.",
  "image": "https://honest.manus.space/honest-logo.png",
  "external_url": "https://honest.manus.space",
  "attributes": [
    {
      "trait_type": "Asset",
      "value": "BTC"
    },
    {
      "trait_type": "Coherence",
      "display_type": "number",
      "value": 0.85
    },
    {
      "trait_type": "Coherence Label",
      "value": "ALIGNED"
    },
    {
      "trait_type": "Decision",
      "value": "BUY"
    },
    {
      "trait_type": "Timestamp",
      "display_type": "date",
      "value": 1706400000000
    },
    {
      "trait_type": "Verification",
      "value": "5-Layer Recursive Truth"
    },
    {
      "trait_type": "Standard",
      "value": "HONEST-LEDGER"
    },
    {
      "trait_type": "Hackathon",
      "value": "Avalanche x402 Payments"
    }
  ],
  "properties": {
    "decision_color": "#10b981",
    "coherence_label": "ALIGNED",
    "verification_layers": 5
  }
}
```

---

## Verification on Snowtrace

After minting, verify your NFT on Snowtrace:

**Fuji Testnet:**
```
https://testnet.snowtrace.io/address/0x...
```

**Mainnet:**
```
https://snowtrace.io/address/0x...
```

You can view:
- Transaction history
- Token holders
- Contract source code (if verified)
- Individual NFT metadata

---

## Security Considerations

1. **Private Keys:** Never commit private keys to version control. Use `.env` files and add them to `.gitignore`.

2. **Gas Fees:** Backend minting requires a funded wallet. Monitor balance to prevent failed transactions.

3. **Rate Limiting:** Implement rate limiting on the `trpc.nft.mint` endpoint to prevent abuse.

4. **Metadata Storage:** In production, store NFT metadata on IPFS or decentralized storage instead of centralized servers.

5. **Contract Ownership:** The contract owner can mint NFTs. Use multi-sig wallets for mainnet deployments.

---

## Troubleshooting

### "Insufficient funds for gas"
- Ensure your wallet has enough AVAX for gas fees
- Get testnet AVAX from the [Fuji Faucet](https://core.app/tools/testnet-faucet/)

### "NFT contract address not configured"
- Set `VITE_NFT_CONTRACT_ADDRESS` in your `.env` file
- Restart the dev server after updating environment variables

### "NFT minter private key not configured"
- Set `NFT_MINTER_PRIVATE_KEY` in your `.env` file
- This should be a backend wallet with AVAX for gas fees

### "Transaction failed"
- Check Snowtrace for transaction details
- Verify contract is deployed and accessible
- Ensure wallet has sufficient AVAX balance

---

## Future Enhancements

- [ ] IPFS metadata storage
- [ ] Batch minting for multiple eigenstates
- [ ] NFT marketplace integration
- [ ] Historical eigenstate gallery
- [ ] Social sharing of minted NFTs
- [ ] Royalty system for secondary sales
- [ ] DAO governance for contract upgrades

---

## Resources

- [Avalanche Documentation](https://docs.avax.network/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [Snowtrace Explorer](https://snowtrace.io/)
- [Avalanche x402 Hackathon](https://www.avax.network/x402)

---

## License

Apache 2.0 - See [LICENSE](./LICENSE) for details.

**Reality Protocol LLC** - Sheridan, WY & Denver, CO
