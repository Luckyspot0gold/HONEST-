ile: scripts/deploy.js
const hre = require("hardhat");
require('dotenv').config();

async function main() {
    console.log("🚀 Deploying Reality Protocol NFT Contract...");
    
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "AVAX");
    
    // Deploy contract
    const RealityProtocolNFT = await hre.ethers.getContractFactory("RealityProtocolNFT");
    const nft = await RealityProtocolNFT.deploy(deployer.address);
    
    await nft.waitForDeployment();
    
    const contractAddress = await nft.getAddress();
    
    console.log("✅ Contract deployed to:", contractAddress);
    console.log("🔗 View on Snowtrace:", `https://testnet.snowtrace.io/address/${contractAddress}`);
    console.log("");
    console.log("📋 Add this to your .env file:");
    console.log(`VITE_NFT_CONTRACT_ADDRESS=${contractAddress}`);
    console.log("");
    console.log("⏳ Waiting 30 seconds before verification...");
    
    // Wait for block confirmations
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Verify on Snowtrace
    console.log("🔍 Verifying contract on Snowtrace...");
    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: [deployer.address],
        });
        console.log("✅ Contract verified!");
    } catch (error) {
        console.log("⚠️ Verification failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
