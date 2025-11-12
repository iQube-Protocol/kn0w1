import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Wallet, Link, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function WalletOnboarding() {
  const { state, linkFioHandle, showOnboarding, setShowOnboarding } = useWallet();
  const [step, setStep] = useState<'welcome' | 'fio-link' | 'complete'>('welcome');
  const [fioHandle, setFioHandle] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkFio = async () => {
    // Validate FIO handle format: [name]@domain
    if (!fioHandle.includes('@') || !fioHandle.match(/^[a-z0-9]+@[a-z0-9]+$/i)) {
      toast({
        title: 'Invalid Handle',
        description: 'FIO handle must be in format: name@domain (e.g., dele@qripto or dele@knyt)',
        variant: 'destructive',
      });
      return;
    }

    setIsLinking(true);
    try {
      await linkFioHandle(fioHandle);
      setStep('complete');
    } catch (error) {
      console.error('FIO linking failed:', error);
    } finally {
      setIsLinking(false);
    }
  };

  const handleSkip = () => {
    setShowOnboarding(false);
  };

  const handleComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Welcome to KNYT Wallet
          </DialogTitle>
        </DialogHeader>

        {step === 'welcome' && (
          <div className="space-y-4">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Wallet Created</p>
                    <p className="text-sm text-muted-foreground">
                      {state.address?.substring(0, 12)}...
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <h4 className="font-medium">What's Next?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Link your FIO handle (name@knyt or name@qripto) for identity-based signing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Pay for content instantly without QR codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Manage your digital assets and entitlements</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip for Now
              </Button>
              <Button onClick={() => setStep('fio-link')} className="flex-1">
                Link FIO Handle
              </Button>
            </div>
          </div>
        )}

        {step === 'fio-link' && (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <Link className="h-5 w-5 text-primary mt-1" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Link Your FIO Handle</p>
                  <p className="text-xs text-muted-foreground">
                    Connect your FIO handle (name@knyt or name@qripto) to sign transactions with your identity
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="fio-handle">FIO Handle</Label>
              <Input
                id="fio-handle"
                placeholder="yourname@knyt"
                value={fioHandle}
                onChange={(e) => setFioHandle(e.target.value)}
                disabled={isLinking}
              />
              <p className="text-xs text-muted-foreground">
                Use dele@knyt for testing with the mock server
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleSkip} disabled={isLinking} className="flex-1">
                Skip for Now
              </Button>
              <Button 
                onClick={handleLinkFio} 
                disabled={!fioHandle || isLinking}
                className="flex-1"
              >
                {isLinking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Linking...
                  </>
                ) : (
                  'Link Handle'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">All Set!</p>
                  <p className="text-sm text-muted-foreground">
                    Your wallet is ready with FIO handle {state.fioHandle}
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                You can now:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Pay for content with your wallet</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Sign transactions with {state.fioHandle}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Manage your digital entitlements</span>
                </li>
              </ul>
            </div>

            <Button onClick={handleComplete} className="w-full">
              Start Exploring
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
