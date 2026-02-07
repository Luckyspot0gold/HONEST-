import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

/**
 * Hardhat configuration for deploying HONEST Truth Certificate NFTs
 * to Avalanche C-Chain (Fuji testnet and mainnet)
 * 
 * Network Details:
 * - Fuji Testnet: https://api.avax-test.network/ext/bc/C/rpc
 * - Mainnet: https://api.avax.network/ext/bc/C/rpc
 * - Chain ID (Fuji): 43113
 * - Chain ID (Mainnet): 43114
 * 
 * Get testnet AVAX from: https://core.app/tools/testnet-faucet/
 */

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Avalanche Fuji Testnet
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Avalanche C-Chain Mainnet
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Local Hardhat network for testing
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
