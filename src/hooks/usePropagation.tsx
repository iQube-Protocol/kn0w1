import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePropagation() {
  const { currentSiteId, isUberAdmin } = useAuth();
  const [isMasterSite, setIsMasterSite] = useState(false);
  const [canPropagate, setCanPropagate] = useState(false);

  useEffect(() => {
    if (!currentSiteId || !isUberAdmin) {
      setCanPropagate(false);
      return;
    }

    // Check if current site is master
    supabase
      .from('agent_sites')
      .select('is_master')
      .eq('id', currentSiteId)
      .single()
      .then(({ data }) => {
        const isMaster = data?.is_master || false;
        setIsMasterSite(isMaster);
        setCanPropagate(isUberAdmin && isMaster);
      });
  }, [currentSiteId, isUberAdmin]);

  const markForPropagation = async (
    entityType: 'content_item' | 'content_category' | 'mission_pillar' | 'agent_branch' | 'utilities_config',
    entityId: string,
    entityData: any,
    notes?: string
  ) => {
    if (!canPropagate || !currentSiteId) {
      throw new Error('Cannot propagate from this site');
    }

    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('master_site_updates')
      .insert({
        source_site_id: currentSiteId,
        update_type: entityType,
        entity_id: entityId,
        entity_data: entityData,
        status: 'pending',
        created_by: user.user.id,
        notes,
      });

    if (error) throw error;

    return true;
  };

  return {
    canPropagate,
    isMasterSite,
    markForPropagation,
  };
}
