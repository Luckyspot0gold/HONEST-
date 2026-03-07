# Check AVAX balance
npx hardhat run scripts/check-balance.js --network fuji
Create: scripts/check-balance.js
const hre = require("hardhat");
require('dotenv').config();

async function main() {
    const provider = new hre.ethers.JsonRpcProvider(
        "https://api.avax-test.network/ext/bc/C/rpc"
    );
    
    const wallet1Address = new hre.ethers.Wallet(
        process.env.DEPLOYER_PRIVATE_KEY,
        provider
    ).address;
    
    const balance1 = await provider.getBalance(wallet1Address);
    
    console.log("👷 Deployer Wallet:", wallet1Address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance1), "AVAX");
    console.log("");
    
    if (process.env.RECEIVER_PRIVATE_KEY) {
        const wallet2Address = new hre.ethers.Wallet(
            process.env.RECEIVER_PRIVATE_KEY,
            provider
        ).address;
        
        const balance2 = await provider.getBalance(wallet2Address);
        
        console.log("💰 Receiver Wallet:", wallet2Address);
        console.log("💰 Balance:", hre.ethers.formatEther(balance2), "AVAX");
    }
    
    const minRequired = hre.ethers.parseEther("5");
    if (balance1 < minRequired) {
        console.log("");
        console.log("⚠️  WARNING: You need at least 5 AVAX to deploy");
        console.log("🚰 Get more from: https://core.app/tools/testnet-faucet/");
    } else {
        console.log("");
        console.log("✅ You're ready to deploy!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
