import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/hooks/use-toast';
import { signDIDChallenge } from '@/lib/wallet/didQube';

export function useX402Payment() {
  const { client, state } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const payWithWallet = async (params: {
    assetId: string;
    amount: number;
    asset: string;
    recipientDid: string;
  }) => {
    if (!state.initialized || !state.did) {
      throw new Error('Wallet not initialized');
    }

    setIsProcessing(true);

    try {
      // 1. Check balance
      const balance = state.balances[params.asset] || 0;
      if (balance < params.amount) {
        throw new Error(`Insufficient balance. You have ${balance} ${params.asset}, need ${params.amount}`);
      }

      // 2. Get quotes from Gateway
      console.log('Requesting quotes from Gateway...');
      const quotes = await client.getQuotes({
        chain: 'ethereum', // TODO: derive from asset
        size_usd: params.amount,
      });

      if (!quotes || quotes.length === 0) {
        throw new Error('No quotes available');
      }

      const quote = quotes[0];
      toast({
        title: 'Payment Quote Generated',
        description: `Amount: ${params.amount} ${params.asset}`,
      });

      // 3. Propose intent to Gateway
      console.log('Proposing intent to Gateway...');
      const intent = await client.proposeIntent({
        quote_id: quote.id,
        asset_id: params.assetId,
        recipient_did: params.recipientDid,
      });

      if (!intent.success) {
        throw new Error('Intent proposal failed');
      }

      toast({
        title: 'Payment Intent Created',
        description: `Intent ID: ${intent.intent_id}`,
      });

      // 4. Wait for settlement via SSE (already subscribed in WalletContext)
      // The SSE will emit settlement events which update state
      // For now, return immediately with intent_id
      toast({
        title: 'Payment Processing',
        description: 'Waiting for settlement...',
      });

      return { 
        success: true, 
        txId: intent.intent_id,
        status: intent.status 
      };
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { payWithWallet, isProcessing };
}
