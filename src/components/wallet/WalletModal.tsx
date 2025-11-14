import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Wallet, Link } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WalletDiagnostics } from './WalletDiagnostics';

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { state } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');

  const copyAddress = () => {
    if (state.address) {
      navigator.clipboard.writeText(state.address);
      toast({ title: 'Address Copied', description: 'Wallet address copied to clipboard' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            KNYT Wallet
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Address Card */}
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Wallet Address</p>
                  <Button variant="ghost" size="sm" onClick={copyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm font-mono bg-muted px-3 py-2 rounded">
                  {state.address}
                </p>
              </div>
            </Card>

            {/* FIO Handle Card */}
            {state.fioHandle && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <Link className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">FIO Handle</p>
                    <p className="text-sm text-muted-foreground">{state.fioHandle}</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">Verified</Badge>
                </div>
              </Card>
            )}

            {/* Balances */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Balances</h3>
                <Badge variant="outline" className="text-xs">
                  {state.sseConnected ? 'Live' : 'Offline'}
                </Badge>
              </div>
              <div className="grid gap-2">
                {Object.entries(state.balances).map(([asset, amount]) => (
                  <Card key={asset} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{asset}</p>
                        <p className="text-sm text-muted-foreground">
                          {asset === 'QCT' ? 'Qripto Credits' : asset}
                        </p>
                      </div>
                      <p className="text-xl font-bold">{amount.toFixed(2)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Policy Info */}
            <Card className="p-4 bg-muted/50">
              <div className="space-y-1">
                <p className="text-sm font-medium">Key Management</p>
                <p className="text-xs text-muted-foreground">
                  {state.policy === 'delegated' 
                    ? 'Keys managed by AgentiQ service (recommended)'
                    : 'Local key storage'
                  }
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Transaction history will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">DID</p>
                  <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-2 rounded">
                    {state.did}
                  </p>
                </div>
                
                {!state.fioHandle && (
                  <Button variant="outline" className="w-full">
                    <Link className="mr-2 h-4 w-4" />
                    Link FIO Handle
                  </Button>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="diagnostics" className="space-y-4">
            <WalletDiagnostics />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
