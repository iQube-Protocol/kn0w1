import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Loader2 } from 'lucide-react';
import { WalletModal } from './WalletModal';
import { cn } from '@/lib/utils';

interface WalletDockProps {
  skin?: 'translucent' | 'solid';
}

export function WalletDock({ skin = 'translucent' }: WalletDockProps) {
  const { state, initializeWallet } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleClick = async () => {
    if (!state.initialized) {
      setIsInitializing(true);
      try {
        await initializeWallet();
      } finally {
        setIsInitializing(false);
      }
    } else {
      setShowModal(true);
    }
  };

  const primaryBalance = state.balances['QCT'] || 0;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'rounded-full px-4 py-2 flex items-center gap-2 border',
          {
            'bg-background/50 backdrop-blur-md border-border/50': skin === 'translucent',
            'bg-background border-border': skin === 'solid',
          }
        )}
        onClick={handleClick}
        disabled={isInitializing}
      >
        {isInitializing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Initializing...</span>
          </>
        ) : !state.initialized ? (
          <>
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Create Wallet</span>
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">{primaryBalance.toFixed(2)} QCT</span>
            {state.fioHandle && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {state.fioHandle}
              </Badge>
            )}
          </>
        )}
      </Button>
      {state.initialized && <WalletModal open={showModal} onOpenChange={setShowModal} />}
    </>
  );
}
