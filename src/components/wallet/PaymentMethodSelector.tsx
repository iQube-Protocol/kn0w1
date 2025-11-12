import { useWallet } from '@/contexts/WalletContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, QrCode, Plus, Check } from 'lucide-react';

interface PaymentMethodSelectorProps {
  amount: number;
  asset: string;
  assetId: string;
  onMethodSelect: (method: 'qr' | 'wallet' | 'create-wallet') => void;
}

export function PaymentMethodSelector({
  amount,
  asset,
  assetId,
  onMethodSelect,
}: PaymentMethodSelectorProps) {
  const { state } = useWallet();
  const hasWallet = state.initialized;
  const hasFioHandle = !!state.fioHandle;
  const balance = state.balances[asset] || 0;
  const hasSufficientBalance = balance >= amount;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="font-semibold">Choose Payment Method</h3>
        <p className="text-sm text-muted-foreground">
          Purchase for {amount} {asset}
        </p>
      </div>

      <div className="space-y-3">
        {/* Wallet Payment Option */}
        {hasWallet && (
          <Card
            className={`p-4 cursor-pointer transition-all ${
              hasSufficientBalance
                ? 'hover:border-primary hover:bg-primary/5'
                : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => hasSufficientBalance && onMethodSelect('wallet')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Pay with KNYT Wallet</p>
                  <p className="text-sm text-muted-foreground">
                    {hasFioHandle
                      ? `Sign with ${state.fioHandle}`
                      : 'Instant payment'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Balance: {balance.toFixed(2)} {asset}
                    </p>
                    {hasSufficientBalance ? (
                      <Badge variant="secondary" className="text-xs">
                        Sufficient
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Insufficient
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {hasSufficientBalance && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </div>
          </Card>
        )}

        {/* QR Code Option */}
        <Card
          className="p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
          onClick={() => onMethodSelect('qr')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Scan QR Code</p>
                <p className="text-sm text-muted-foreground">
                  Use any x402-compatible wallet
                </p>
              </div>
            </div>
            <Check className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>

        {/* Create Wallet Option */}
        {!hasWallet && (
          <Card
            className="p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all border-dashed"
            onClick={() => onMethodSelect('create-wallet')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Create KNYT Wallet</p>
                  <p className="text-sm text-muted-foreground">
                    Set up instant payments in seconds
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {hasWallet && !hasSufficientBalance && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Insufficient wallet balance. Use QR code payment instead.
          </p>
        </div>
      )}
    </div>
  );
}
