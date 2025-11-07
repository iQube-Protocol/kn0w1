import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Lock, Unlock, X } from 'lucide-react';

interface AssetPolicy {
  id?: string;
  rights: string[];
  price_amount: number;
  price_asset: string;
  pay_to_did: string;
  tokenqube_template?: string;
  visibility: 'private' | 'link' | 'public';
}

interface AssetPolicyFormProps {
  contentItemId?: string;
  onPolicySaved?: () => void;
}

const RIGHTS_OPTIONS = [
  { value: 'view', label: 'View', description: 'Read-only access' },
  { value: 'stream', label: 'Stream', description: 'Play audio/video' },
  { value: 'download', label: 'Download', description: 'Download to device' },
];

const ASSET_OPTIONS = [
  { value: 'QCT', label: '$QCT (QriptoCENT)' },
  { value: 'QOYN', label: '$QOYN' },
];

export function AssetPolicyForm({ contentItemId, onPolicySaved }: AssetPolicyFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingPolicy, setExistingPolicy] = useState<AssetPolicy | null>(null);
  const [userDid, setUserDid] = useState<string>('');
  
  const [policy, setPolicy] = useState<AssetPolicy>({
    rights: ['view', 'stream'],
    price_amount: 0,
    price_asset: 'QCT',
    pay_to_did: '',
    visibility: 'public',
  });

  useEffect(() => {
    if (contentItemId) {
      fetchExistingPolicy();
    }
    fetchUserDid();
  }, [contentItemId]);

  const fetchUserDid = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: didData } = await supabase
        .from('did_identities')
        .select('did')
        .eq('user_id', user.id)
        .single();

      if (didData) {
        setUserDid(didData.did);
        setPolicy(prev => ({ ...prev, pay_to_did: didData.did }));
      } else {
        // Generate a temporary DID format
        const tempDid = `did:iq:${user.id.slice(0, 8)}`;
        setUserDid(tempDid);
        setPolicy(prev => ({ ...prev, pay_to_did: tempDid }));
      }
    } catch (error) {
      console.error('Error fetching user DID:', error);
    }
  };

  const fetchExistingPolicy = async () => {
    if (!contentItemId) return;
    
    try {
      const { data, error } = await supabase
        .from('asset_policies')
        .select('*')
        .eq('asset_id', contentItemId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const visibility = (data.visibility as 'private' | 'link' | 'public') || 'public';
        const policyData: AssetPolicy = {
          id: data.id,
          rights: data.rights || ['view', 'stream'],
          price_amount: typeof data.price_amount === 'string' ? parseFloat(data.price_amount) : data.price_amount,
          price_asset: data.price_asset || 'QCT',
          pay_to_did: data.pay_to_did || userDid,
          tokenqube_template: data.tokenqube_template || undefined,
          visibility,
        };
        setExistingPolicy(policyData);
        setPolicy(policyData);
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
    }
  };

  const handleRightToggle = (right: string) => {
    setPolicy(prev => {
      const newRights = prev.rights.includes(right)
        ? prev.rights.filter(r => r !== right)
        : [...prev.rights, right];
      return { ...prev, rights: newRights };
    });
  };

  const handleSave = async () => {
    if (!contentItemId) {
      toast({
        title: 'Error',
        description: 'Content must be saved before setting policy',
        variant: 'destructive',
      });
      return;
    }

    if (policy.rights.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one right must be selected',
        variant: 'destructive',
      });
      return;
    }

    if (!policy.pay_to_did) {
      toast({
        title: 'Error',
        description: 'Payment DID is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const policyData = {
        asset_id: contentItemId,
        rights: policy.rights,
        price_amount: policy.price_amount,
        price_asset: policy.price_asset,
        pay_to_did: policy.pay_to_did,
        tokenqube_template: policy.tokenqube_template || null,
        visibility: policy.visibility,
      };

      if (existingPolicy) {
        const { error } = await supabase
          .from('asset_policies')
          .update(policyData)
          .eq('id', existingPolicy.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('asset_policies')
          .insert([policyData]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Asset policy saved successfully',
      });
      
      if (onPolicySaved) onPolicySaved();
      fetchExistingPolicy();
    } catch (error) {
      console.error('Error saving policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to save asset policy',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFree = policy.price_amount === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Asset Monetization Policy
        </CardTitle>
        <CardDescription>
          Set pricing and access rights for this content. Configure x402 payment integration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing */}
        <div className="space-y-3">
          <Label>Pricing</Label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={policy.price_amount}
                onChange={(e) => setPolicy(prev => ({ 
                  ...prev, 
                  price_amount: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
            <Select
              value={policy.price_asset}
              onValueChange={(value) => setPolicy(prev => ({ ...prev, price_asset: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_OPTIONS.map(asset => (
                  <SelectItem key={asset.value} value={asset.value}>
                    {asset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isFree && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Free access (set price above 0 to require payment)
            </p>
          )}
        </div>

        {/* Access Rights */}
        <div className="space-y-3">
          <Label>Access Rights</Label>
          <div className="space-y-2">
            {RIGHTS_OPTIONS.map(right => (
              <div key={right.value} className="flex items-start gap-3 p-3 rounded-lg border">
                <Switch
                  checked={policy.rights.includes(right.value)}
                  onCheckedChange={() => handleRightToggle(right.value)}
                />
                <div className="flex-1">
                  <div className="font-medium">{right.label}</div>
                  <div className="text-sm text-muted-foreground">{right.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {policy.rights.map(right => (
              <Badge key={right} variant="secondary" className="gap-1">
                {right}
                <button
                  onClick={() => handleRightToggle(right)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="space-y-3">
          <Label>Visibility</Label>
          <Select
            value={policy.visibility}
            onValueChange={(value: 'private' | 'link' | 'public') => 
              setPolicy(prev => ({ ...prev, visibility: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div>
                  <div className="font-medium">Public</div>
                  <div className="text-xs text-muted-foreground">Anyone can discover</div>
                </div>
              </SelectItem>
              <SelectItem value="link">
                <div>
                  <div className="font-medium">Link Only</div>
                  <div className="text-xs text-muted-foreground">Only via direct link</div>
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div>
                  <div className="font-medium">Private</div>
                  <div className="text-xs text-muted-foreground">Invitation required</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payment DID */}
        <div className="space-y-3">
          <Label>Payment Recipient (DID)</Label>
          <Input
            placeholder="did:iq:..."
            value={policy.pay_to_did}
            onChange={(e) => setPolicy(prev => ({ ...prev, pay_to_did: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            Payments will be sent to this decentralized identifier
          </p>
        </div>

        {/* TokenQube Template (Optional) */}
        <div className="space-y-3">
          <Label>TokenQube Template (Optional)</Label>
          <Input
            placeholder="template-id"
            value={policy.tokenqube_template || ''}
            onChange={(e) => setPolicy(prev => ({ ...prev, tokenqube_template: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            Optional: Mint NFT licenses on purchase using this template
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={loading || !contentItemId}
          >
            {loading ? 'Saving...' : existingPolicy ? 'Update Policy' : 'Create Policy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}