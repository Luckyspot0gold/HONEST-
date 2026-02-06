import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, ExternalLink, Wallet } from 'lucide-react';
import { trpc } from '@/lib/trpc';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface NFTMintingProps {
  eigenstate: {
    asset: string;
    timestamp: number;
    coherence: number;
    decision: 'BUY' | 'SELL' | 'HOLD';
    dimensions: any;
  };
}

/**
 * NFT Minting Component for HONEST Truth Certificates
 * 
 * Allows users to mint their eigenstate verdict as an NFT on Avalanche C-Chain.
 * Requires wallet address and uses backend to handle minting with gas fees.
 */
export function NFTMinting({ eigenstate }: NFTMintingProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState<'fuji' | 'mainnet'>('fuji');
  const [mintResult, setMintResult] = useState<any>(null);

  const mintMutation = trpc.nft.mint.useMutation({
    onSuccess: (data) => {
      setMintResult(data);
    },
    onError: (error) => {
      console.error('Minting failed:', error);
    },
  });

  const handleMint = () => {
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      alert('Please enter a valid Ethereum/Avalanche wallet address');
      return;
    }

    mintMutation.mutate({
      recipient: walletAddress,
      asset: eigenstate.asset,
      timestamp: eigenstate.timestamp,
      coherence: eigenstate.coherence,
      decision: eigenstate.decision,
      eigenstateData: eigenstate,
      network,
    });
  };

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        alert('Failed to connect wallet. Please try manually entering your address.');
      }
    } else {
      alert('MetaMask or compatible wallet not detected. Please install MetaMask or enter your wallet address manually.');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Mint Truth Certificate NFT
        </CardTitle>
        <CardDescription>
          Mint this eigenstate verdict as an NFT on Avalanche C-Chain. Your Truth Certificate will be permanently recorded on-chain with cryptographic proof.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!mintResult ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  id="wallet-address"
                  type="text"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleConnectWallet}
                  disabled={mintMutation.isPending}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your Avalanche C-Chain wallet address or connect MetaMask
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <select
                id="network"
                value={network}
                onChange={(e) => setNetwork(e.target.value as 'fuji' | 'mainnet')}
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={mintMutation.isPending}
              >
                <option value="fuji">Fuji Testnet (Free)</option>
                <option value="mainnet">Avalanche Mainnet</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {network === 'fuji' 
                  ? 'Test network - no real AVAX required' 
                  : 'Production network - requires real AVAX for gas fees'}
              </p>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>Eigenstate Summary:</strong>
                <div className="mt-2 space-y-1">
                  <div>Asset: <span className="font-mono">{eigenstate.asset}</span></div>
                  <div>Coherence: <span className="font-mono">{eigenstate.coherence.toFixed(3)}</span></div>
                  <div>Decision: <span className="font-mono font-bold">{eigenstate.decision}</span></div>
                  <div>Timestamp: <span className="font-mono">{new Date(eigenstate.timestamp).toLocaleString()}</span></div>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleMint}
              disabled={mintMutation.isPending || !walletAddress}
              className="w-full"
            >
              {mintMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting NFT...
                </>
              ) : (
                'Mint Truth Certificate'
              )}
            </Button>

            {mintMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {mintMutation.error?.message || 'Failed to mint NFT. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>NFT Minted Successfully!</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <div>
                <strong>Token ID:</strong> <span className="font-mono">{mintResult.tokenId}</span>
              </div>
              <div>
                <strong>Transaction Hash:</strong>
                <div className="font-mono text-xs break-all">{mintResult.transactionHash}</div>
              </div>
              <div>
                <strong>Block Number:</strong> <span className="font-mono">{mintResult.blockNumber}</span>
              </div>
              <div>
                <strong>Gas Used:</strong> <span className="font-mono">{mintResult.gasUsed}</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(mintResult.explorerUrl, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Snowtrace
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setMintResult(null);
                setWalletAddress('');
              }}
            >
              Mint Another
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
