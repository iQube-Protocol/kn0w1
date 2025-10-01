import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GitBranch, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PropagateButtonProps {
  entityType: 'content_item' | 'content_category' | 'mission_pillar' | 'agent_branch' | 'utilities_config';
  entityId: string;
  entityData: any;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function PropagateButton({
  entityType,
  entityId,
  entityData,
  label = 'Mark for Propagation',
  variant = 'outline',
}: PropagateButtonProps) {
  const { toast } = useToast();
  const { currentSiteId, isUberAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  // Only show on master sites for uber admins
  const [isMasterSite, setIsMasterSite] = useState(false);

  useState(() => {
    if (!currentSiteId) return;
    
    supabase
      .from('agent_sites')
      .select('is_master')
      .eq('id', currentSiteId)
      .single()
      .then(({ data }) => {
        if (data) setIsMasterSite(data.is_master);
      });
  });

  if (!isUberAdmin || !isMasterSite) {
    return null;
  }

  const handlePropagate = async () => {
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated');
      }

      // Create update record
      const { error } = await supabase
        .from('master_site_updates')
        .insert({
          source_site_id: currentSiteId,
          update_type: entityType,
          entity_id: entityId,
          entity_data: entityData,
          status: 'pending',
          created_by: user.user.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Update marked for propagation. Go to Update Propagation to approve and push.',
      });
    } catch (error) {
      console.error('Error marking for propagation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mark for propagation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <GitBranch className="h-4 w-4 mr-2" />
          )}
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark for Estate-Wide Propagation?</AlertDialogTitle>
          <AlertDialogDescription>
            This will create a pending update that can be reviewed and pushed to all branch sites
            from the Update Propagation dashboard.
            <br /><br />
            <strong>Entity Type:</strong> {entityType.replace('_', ' ')}
            <br />
            <strong>Status:</strong> Pending approval
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handlePropagate}>
            Mark for Propagation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
