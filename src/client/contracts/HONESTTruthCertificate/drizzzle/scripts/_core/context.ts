import { ethers } from "hardhat";

/**
 * Deploy HONEST Truth Certificate NFT contract to Avalanche C-Chain
 * 
 * Usage:
 * - Local: npx hardhat run scripts/deploy.ts
 * - Fuji Testnet: npx hardhat run scripts/deploy.ts --network fuji
 * - Mainnet: npx hardhat run scripts/deploy.ts --network avalanche
 */
async function main() {
  console.log("🚀 Deploying HONEST Truth Certificate NFT contract...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "AVAX\n");

  // Deploy the contract
  const HonestTruthCertificate = await ethers.getContractFactory("HonestTruthCertificate");
  const contract = await HonestTruthCertificate.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ HonestTruthCertificate deployed to:", contractAddress);
  console.log("\n📝 Contract Details:");
  console.log("   Name:", await contract.name());
  console.log("   Symbol:", await contract.symbol());
  console.log("   Owner:", await contract.owner());
  console.log("   Total Supply:", (await contract.totalSupply()).toString());

  console.log("\n🔗 Next Steps:");
  console.log("1. Save the contract address to your .env file:");
  console.log(`   VITE_NFT_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\n2. Verify the contract on Snowtrace (optional):");
  console.log(`   npx hardhat verify --network fuji ${contractAddress}`);
  console.log("\n3. Test minting a Truth Certificate:");
  console.log(`   npx hardhat run scripts/mint.ts --network fuji`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
