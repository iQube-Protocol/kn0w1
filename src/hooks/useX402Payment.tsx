import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/hooks/use-toast';
import { signWithAgentiQ } from '@/lib/wallet/agentiqClient';

export function useX402Payment() {
  const { client, state } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const payWithWallet = async (params: {
    assetId: string;
    amount: number;
    asset: string;
    recipientDid: string;
  }) => {
    if (!state.initialized) {
      throw new Error('Wallet not initialized');
    }

    setIsProcessing(true);

    try {
      // 1. Check balance
      const balance = state.balances[params.asset] || 0;
      if (balance < params.amount) {
        throw new Error(`Insufficient balance. You have ${balance} ${params.asset}, need ${params.amount}`);
      }

      // 2. Create x402 quote
      const quote = await client.createX402Quote({
        to: `did:${params.recipientDid}`,
        amount: params.amount,
        asset: params.asset,
      });

      toast({
        title: 'Payment Quote Generated',
        description: `Amount: ${params.amount} ${params.asset}`,
      });

      // 3. Sign transaction using AgentiQ SDK
      const signature = await signWithAgentiQ(quote.txId);
      await client.signX402Transaction(quote.txId, signature);

      toast({
        title: 'Transaction Signed',
        description: 'Broadcasting payment...',
      });

      // 4. Send payment
      const result = await client.sendX402Payment(quote.txId);

      // 5. Poll for settlement
      const finalStatus = await pollSettlement(quote.txId);

      if (finalStatus === 'settled') {
        toast({
          title: 'Payment Complete!',
          description: 'Access granted to content',
        });
        return { success: true, txId: quote.txId };
      } else {
        throw new Error('Payment failed to settle');
      }
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

  const pollSettlement = async (txId: string): Promise<string> => {
    const maxAttempts = 60; // 5 minutes (5s intervals)
    
    for (let i = 0; i < maxAttempts; i++) {
      const status = await client.getX402Status(txId);
      
      if (status.status === 'settled') {
        return 'settled';
      }
      
      if (status.status === 'failed') {
        throw new Error('Payment failed');
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Payment settlement timeout');
  };

  return { payWithWallet, isProcessing };
}
