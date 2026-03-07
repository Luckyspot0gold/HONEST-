// mint_reality_capsule.js - Paste into your base44 dashboard <script>
import { createWalletClient, custom, createPublicClient, http } from 'viem'
import { avalancheFuji } from 'viem/chains'
import { Wallet } from '@viem/avalanche' // Or avalanche-wallet-bridge

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http('https://api.avax-test.network/ext/bc/C/rpc')
})

const walletClient = createWalletClient({
  chain: avalancheFuji,
  transport: custom(window.avalanche || window.core), // Avalanche Wallet
})

// ABI: Minimal RealityCapsule ERC721 Minter (deploy below)
const MINTER_ABI = [
  { name: 'mintTimestampOnly', type: 'function', stateMutability: 'payable', inputs: [{ name: '_tokenId', type: 'uint256' }], outputs: [] }
]
const MINTER_ADDRESS = '0xYourDeployedMinterOnFuji' // Deploy → Replace

const FREQUENCY_MAP = { BTC: 432, ETH: 528, AVAX: 396, SOL: 639, BNB: 741 } // Your cymatics

async function mintRealityCapsule(asset = 'AVAX') {
  try {
    // 1. Network Check/Switch (Fix "Wrong network")
    const chainId = await publicClient.getChainId()
    if (chainId !== 43113n) {
      await walletClient.switchChain({ id: 43113n })
      return // Retry on switch
    }

    // 2. User selects freq/RSI → TokenId (Immutable timestamp)
    const timestamp = Math.floor(Date.now() / 1000)
    const tokenId = BigInt((timestamp << 8) | FREQUENCY_MAP[asset]) // e.g., 0x...432
    const statusEl = document.querySelector('#status') || console

    statusEl.textContent = '🔄 Simulating mint...'

    // 3. Simulate (Pre-flight, gas est)
    const { request } = await publicClient.simulateContract({
      address: MINTER_ADDRESS,
      abi: MINTER_ABI,
      functionName: 'mintTimestampOnly',
      args: [tokenId],
      account: '0x5148...e923' // Your addr
    })

    // 4. Mint (0.0001 AVAX)
    statusEl.textContent = '⏳ Minting Capsule...'
    const hash = await walletClient.writeContract(request)
    await publicClient.waitForTransactionReceipt({ hash })

    // 5. SUCCESS! Haptic/Audio/ARIA (RNIB §2 Multi-Modal)
    navigator.vibrate([200, 100, 200]) // Success pulse
    const audioCtx = new AudioContext()
    const osc = audioCtx.createOscillator()
    osc.frequency.value = FREQUENCY_MAP[asset]
    osc.connect(audioCtx.destination)
    osc.start(); osc.stop(audioCtx.currentTime + 1)

    document.querySelector('[aria-live]')?.textContent = `✅ SUCCESS: Reality Capsule #${tokenId} minted! Tx: ${hash}`
    statusEl.innerHTML = `✅ Capsule Minted! Token: ${tokenId.toString()} | Tx: <a href="https://testnet.snowtrace.io/tx/${hash}">${hash.slice(0,10)}...</a>`

    // Update UI: Add to "Minted Reality Capsules"
    document.querySelector('.minted-list')?.insertAdjacentHTML('beforeend', `<div>Capsule #${tokenId} (${FREQUENCY_MAP[asset]}Hz)</div>`)

  } catch (error) {
    console.error('Mint Error:', error)
    document.querySelector('#status').textContent = `❌ Mint failed: ${error.shortMessage || error.message}. Console for details.`
    navigator.vibrate([500]) // Error buzz
  }
}

// Button Hook (Your "Mint via Timestamp Only")
document.querySelector('#mint-timestamp')?.addEventListener('click', () => mintRealityCapsule('AVAX'))
