import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Lock, Check, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface AssetPolicy {
  price_amount: number;
  price_asset: string;
  rights: string[];
  visibility: string;
}

interface PurchaseButtonProps {
  assetId: string;
  policy: AssetPolicy;
  hasAccess?: boolean;
  onPurchaseComplete?: () => void;
}

export function PurchaseButton({ assetId, policy, hasAccess, onPurchaseComplete }: PurchaseButtonProps) {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [x402Request, setX402Request] = useState<any>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'pending' | 'settled'>('idle');

  const isFree = policy.price_amount === 0;

  const handlePurchaseClick = async () => {
    if (isFree || hasAccess) {
      // Free content or already purchased - just grant access
      if (onPurchaseComplete) onPurchaseComplete();
      return;
    }

    setShowDialog(true);
    await generatePaymentRequest();
  };

  const generatePaymentRequest = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to purchase content',
          variant: 'destructive',
        });
        return;
      }

      // Get or create user DID
      let { data: didData } = await supabase
        .from('did_identities')
        .select('did')
        .eq('user_id', user.id)
        .single();

      let buyerDid = didData?.did;
      
      if (!buyerDid) {
        // Create temporary DID
        buyerDid = `did:iq:${user.id.slice(0, 8)}`;
        const { error: didError } = await supabase
          .from('did_identities')
          .insert([{ user_id: user.id, did: buyerDid }]);
        
        if (didError) console.error('Error creating DID:', didError);
      }

      // Call payment quote endpoint
      const { data, error } = await supabase.functions.invoke('aa-payments-quote', {
        body: {
          asset_id: assetId,
          buyer_did: buyerDid,
          dest_chain: 'base.sepolia',
          asset_symbol: policy.price_asset,
        },
      });

      if (error) throw error;

      setX402Request(data);
      setPurchaseStatus('pending');
      
      // Poll for settlement
      pollForSettlement(data.x402.request_id);
    } catch (error) {
      console.error('Error generating payment request:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate payment request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const pollForSettlement = async (requestId: string) => {
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setPurchaseStatus('idle');
        toast({
          title: 'Payment Timeout',
          description: 'Payment request expired. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const { data } = await supabase
          .from('x402_transactions')
          .select('status')
          .eq('request_id', requestId)
          .single();

        if (data?.status === 'settled') {
          clearInterval(interval);
          setPurchaseStatus('settled');
          toast({
            title: 'Purchase Complete!',
            description: 'Your content access has been granted',
          });
          
          setTimeout(() => {
            setShowDialog(false);
            if (onPurchaseComplete) onPurchaseComplete();
          }, 2000);
        } else if (data?.status === 'failed' || data?.status === 'refunded') {
          clearInterval(interval);
          setPurchaseStatus('idle');
          toast({
            title: 'Payment Failed',
            description: 'Your payment could not be processed',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error polling transaction:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  if (hasAccess) {
    return (
      <Badge variant="default" className="gap-1">
        <Check className="h-3 w-3" />
        Owned
      </Badge>
    );
  }

  return (
    <>
      <Button
        onClick={handlePurchaseClick}
        variant={isFree ? 'secondary' : 'default'}
        size="sm"
        className="gap-2"
      >
        {isFree ? (
          <>
            <Lock className="h-4 w-4" />
            Access Free
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Buy {policy.price_amount} {policy.price_asset}
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {purchaseStatus === 'settled' ? 'Purchase Complete!' : 'Complete Purchase'}
            </DialogTitle>
            <DialogDescription>
              {purchaseStatus === 'settled'
                ? 'Your content access has been granted'
                : `Pay ${policy.price_amount} ${policy.price_asset} to unlock this content`}
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}

          {purchaseStatus === 'settled' && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <p className="text-center font-medium">Access granted!</p>
            </div>
          )}

          {x402Request && purchaseStatus === 'pending' && (
            <div className="space-y-4">
              <div className="flex justify-center py-4">
                <div className="p-4 bg-background border rounded-lg">
                  <QRCodeSVG 
                    value={JSON.stringify(x402Request.x402)} 
                    size={200}
                    level="H"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {policy.price_amount} {policy.price_asset}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rights:</span>
                  <span className="font-medium">{policy.rights.join(', ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Request ID:</span>
                  <span className="font-mono text-xs">{x402Request.x402.request_id.slice(0, 8)}...</span>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Payment Instructions:</p>
                <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>Scan QR code with x402-compatible wallet</li>
                  <li>Confirm payment in your wallet</li>
                  <li>Access will be granted automatically</li>
                </ol>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                Waiting for payment...
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}