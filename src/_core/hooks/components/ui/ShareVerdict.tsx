import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Twitter, MessageCircle, Send, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareVerdictProps {
  asset: string;
  coherence: number;
  decision: 'BUY' | 'SELL' | 'HOLD';
  timestamp: number;
}

/**
 * Share Verdict Component
 * 
 * Allows users to share their market eigenstate verdict on social platforms:
 * - Twitter/X
 * - Discord
 * - Telegram
 * - Copy to clipboard
 */
export function ShareVerdict({ asset, coherence, decision, timestamp }: ShareVerdictProps) {
  const [copied, setCopied] = useState(false);

  const getCoherenceLabel = (coherence: number) => {
    if (coherence > 0.8) return 'COHERENT TREND';
    if (coherence > 0.5) return 'ALIGNED';
    if (coherence > 0.0) return 'TRANSITIONAL';
    if (coherence > -0.5) return 'UNCERTAIN';
    return 'DECOHERENT';
  };

  const generateShareText = () => {
    const coherenceLabel = getCoherenceLabel(coherence);
    const emoji = decision === 'BUY' ? '📈' : decision === 'SELL' ? '📉' : '➡️';
    
    return `${emoji} ${asset} Market Eigenstate Analysis\n\n` +
           `Coherence: ${coherence.toFixed(3)} (${coherenceLabel})\n` +
           `Decision: ${decision}\n` +
           `Time: ${new Date(timestamp).toLocaleString()}\n\n` +
           `Powered by H.O.N.E.S.T. - 6D Quantum Market Analysis\n` +
           `#HONEST #MarketData #Avalanche #Web3`;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleTwitterShare = () => {
    const text = generateShareText();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    toast.success('Opening Twitter...');
  };

  const handleDiscordShare = () => {
    const text = generateShareText();
    // Discord doesn't have a direct share URL, so we copy to clipboard
    navigator.clipboard.writeText(`${text}\n${shareUrl}`);
    toast.success('Copied to clipboard! Paste in Discord');
  };

  const handleTelegramShare = () => {
    const text = generateShareText();
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
    toast.success('Opening Telegram...');
  };

  const handleCopyToClipboard = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/50 hover:bg-primary/10"
          aria-label="Share verdict on social media"
        >
          <Share2 className="w-4 h-4" />
          Share Verdict
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Share on Social Media</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleTwitterShare} className="gap-2 cursor-pointer">
          <Twitter className="w-4 h-4" />
          <span>Share on X (Twitter)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDiscordShare} className="gap-2 cursor-pointer">
          <MessageCircle className="w-4 h-4" />
          <span>Share on Discord</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleTelegramShare} className="gap-2 cursor-pointer">
          <Send className="w-4 h-4" />
          <span>Share on Telegram</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyToClipboard} className="gap-2 cursor-pointer">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
