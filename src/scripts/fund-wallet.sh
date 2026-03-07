# 1. Go to: https://core.app/tools/testnet-faucet/
# 2. Connect MetaMask (or paste address)
# 3. Select "Avalanche Fuji C-Chain"
# 4. Click "Drip"
# 5. Wait 10-30 seconds
# ✅ You now have 10 AVAX!
Option B: Hit ALL the Faucets (32 AVAX Total!)
# Run this script to get testnet AVAX from all sources
# File: scripts/fund-wallet.sh

#!/bin/bash

WALLET_ADDRESS="0xYOUR_ADDRESS_HERE"

echo "🚰 Funding wallet: $WALLET_ADDRESS"
echo ""

# Core App Faucet (10 AVAX)
echo "1️⃣  Core Faucet (10 AVAX)"
echo "   → Visit: https://core.app/tools/testnet-faucet/"
echo "   → Connect wallet & click Drip"
echo ""

# Snowtrace Faucet (5 AVAX)
echo "2️⃣  Snowtrace Faucet (5 AVAX)"
curl -X POST "https://faucet.snowtrace.io/api/faucet" \
  -H "Content-Type: application/json" \
  -d "{\"address\": \"$WALLET_ADDRESS\"}"
echo ""

# GetBlock Faucet (2 AVAX)
echo "3️⃣  GetBlock Faucet (2 AVAX)"
echo "   → Visit: https://getblock.io/faucet/avalanche-fuji"
echo ""

# Chainstack Faucet (10 AVAX)
echo "4️⃣  Chainstack Faucet (10 AVAX)"
echo "   → Visit: https://faucet.chainstack.com/avalanche-fuji"
echo ""

# QuickNode Faucet (5 AVAX)
echo "5️⃣  QuickNode Faucet (5 AVAX)"
echo "   → Visit: https://faucet.quicknode.com/avalanche/fuji"
echo ""

echo "💰 Total possible: 32 AVAX"
echo "⏱️  Wait ~1 minute, then check balance"
