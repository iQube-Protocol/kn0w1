import { useEffect, useState } from 'react';
import { Building2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AgentSite {
  id: string;
  display_name: string;
  site_slug: string;
  is_master: boolean;
  status: string;
  seed_status: string | null;
}

export function SiteSelector() {
  const { isUberAdmin, currentSiteId, setCurrentSiteId } = useAuth();
  const navigate = useNavigate();
  const [sites, setSites] = useState<AgentSite[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSiteChange = (siteId: string) => {
    setCurrentSiteId(siteId);
    navigate(`/admin/${siteId}/overview`);
  };

  useEffect(() => {
    if (!isUberAdmin) return;

    const fetchSites = async () => {
      // Fetch all sites for uber admins
      const { data, error } = await supabase
        .from('agent_sites')
        .select('id, display_name, site_slug, is_master, status, seed_status')
        .order('is_master', { ascending: false })
        .order('display_name');

      if (error) {
        console.error('Error fetching sites:', error);
        return;
      }

      setSites(data || []);
      
      // Auto-select master site if no site is selected
      if (!currentSiteId && data && data.length > 0) {
        const masterSite = data.find(s => s.is_master);
        const newSiteId = masterSite?.id || data[0].id;
        setCurrentSiteId(newSiteId);
        
        // Navigate to the selected site's overview
        if (import.meta.env.DEV) {
          console.debug('[SiteSelector] Auto-selecting and navigating to:', newSiteId);
        }
        navigate(`/admin/${newSiteId}/overview`, { replace: true });
      }
      
      setLoading(false);
    };

    fetchSites();
  }, [isUberAdmin, currentSiteId, setCurrentSiteId]);

  if (!isUberAdmin || loading) {
    return null;
  }

  const currentSite = sites.find(s => s.id === currentSiteId);

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={currentSiteId || undefined} onValueChange={handleSiteChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select a site to manage">
            {currentSite && (
              <div className="flex items-center gap-2">
                {currentSite.is_master && (
                  <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                    MASTER
                  </span>
                )}
                <span>{currentSite.display_name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sites.map((site) => (
            <SelectItem key={site.id} value={site.id} disabled={site.status === 'inactive'}>
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {site.is_master && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        MASTER
                      </span>
                    )}
                    {site.status === 'inactive' && (
                      <span className="text-xs bg-red-500/20 text-red-600 px-1.5 py-0.5 rounded">
                        INACTIVE
                      </span>
                    )}
                    <span className={`font-medium ${site.status === 'inactive' ? 'opacity-50' : ''}`}>
                      {site.display_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>/{site.site_slug}</span>
                    {site.seed_status && (
                      <span className={`px-1.5 py-0.5 rounded ${
                        site.seed_status === 'completed' ? 'bg-green-500/20 text-green-600' :
                        site.seed_status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                        'bg-red-500/20 text-red-600'
                      }`}>
                        {site.seed_status}
                      </span>
                    )}
                  </div>
                </div>
                {site.id === currentSiteId && <Check className="h-4 w-4" />}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
