import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Target, 
  Settings, 
  Eye, 
  Edit, 
  Sparkles,
  Bot,
  Lock,
  Unlock
} from 'lucide-react';

interface AgentSite {
  id: string;
  title: string;
  site_slug: string;
  status: string;
  created_at: string;
}

interface Aigent {
  id: string;
  name: string;
  agent_kind: string;
  is_system_agent: boolean;
  is_mutable: boolean;
  system_prompt_md: string;
}

interface AgentBranch {
  id: string;
  kind: string;
  display_name: string;
  short_summary: string;
  long_context_md: string;
}

interface MissionPillar {
  id: string;
  display_name: string;
  short_summary: string;
  goals_json: any;
  kpis_json: any;
}

export function Overview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [agentSite, setAgentSite] = useState<AgentSite | null>(null);
  const [aigents, setAigents] = useState<Aigent[]>([]);
  const [branches, setBranches] = useState<AgentBranch[]>([]);
  const [pillars, setPillars] = useState<MissionPillar[]>([]);
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchAgentSiteData();
    }
  }, [user]);

  const fetchAgentSiteData = async () => {
    try {
      // Get user's agent site
      const { data: siteData, error: siteError } = await supabase
        .from('agent_sites')
        .select('*')
        .eq('owner_user_id', user?.id)
        .single();

      if (siteError) {
        console.error('No agent site found:', siteError);
        return;
      }

      setAgentSite(siteData);

      // Get aigents for this site
      const { data: aigentsData, error: aigentsError } = await supabase
        .from('aigents')
        .select('*')
        .eq('agent_site_id', siteData.id);

      if (!aigentsError && aigentsData) {
        setAigents(aigentsData);
      }

      // Get branches for this site
      const { data: branchesData, error: branchesError } = await supabase
        .from('agent_branches')
        .select('*')
        .eq('agent_site_id', siteData.id);

      if (!branchesError && branchesData) {
        setBranches(branchesData);
      }

      // Get pillars for this site
      const { data: pillarsData, error: pillarsError } = await supabase
        .from('mission_pillars')
        .select('*')
        .eq('agent_site_id', siteData.id);

      if (!pillarsError && pillarsData) {
        setPillars(pillarsData);
      }

      // Compile system prompt
      compileSystemPrompt(branchesData || [], pillarsData || []);

    } catch (error) {
      console.error('Error fetching agent site data:', error);
      toast({
        title: "Error",
        description: "Failed to load agent site data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const compileSystemPrompt = (branchesData: AgentBranch[], pillarsData: MissionPillar[]) => {
    const mythos = branchesData.find(b => b.kind === 'mythos');
    const logos = branchesData.find(b => b.kind === 'logos');
    
    const prompt = `
## Agent Context

### Safety Guidelines
${mythos?.long_context_md ? `Safety notes: ${mythos.long_context_md.split('\n')[0]}` : 'No specific safety guidelines.'}

### Logos (Real-world Purpose)
${logos?.long_context_md || 'No logos context defined.'}

### Mythos (Narrative Identity)  
${mythos?.long_context_md || 'No mythos context defined.'}

### Mission Pillars
${pillarsData.map(pillar => `
**${pillar.display_name}**
${pillar.short_summary}
Goals: ${Array.isArray(pillar.goals_json) ? pillar.goals_json.join(', ') : 'No goals'}
KPIs: ${Array.isArray(pillar.kpis_json) ? pillar.kpis_json.join(', ') : 'No KPIs'}
`).join('\n')}
    `.trim();

    setCompiledPrompt(prompt);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agentSite) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Agent Site Found</h2>
        <p className="text-muted-foreground mb-6">
          You need to complete the setup wizard first.
        </p>
        <Button onClick={() => window.location.href = '/admin/setup'}>
          Start Setup
        </Button>
      </div>
    );
  }

  const mythosData = branches.find(b => b.kind === 'mythos');
  const logosData = branches.find(b => b.kind === 'logos');

  return (
    <div className="space-y-6">
      {/* Site Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{agentSite.title}</h1>
          <p className="text-muted-foreground">Agent Site Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={agentSite.status === 'active' ? 'default' : 'secondary'}>
            {agentSite.status}
          </Badge>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview Site
          </Button>
        </div>
      </div>

      {/* Aigents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aigents.map((aigent) => (
          <Card key={aigent.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <CardTitle className="text-lg">{aigent.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {aigent.is_system_agent ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  <Badge variant={aigent.agent_kind === 'satoshi' ? 'default' : 'secondary'}>
                    {aigent.agent_kind}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {aigent.is_system_agent 
                  ? 'System-managed agent providing canonical guidance'
                  : 'User-customizable agent based on your Mythos and Logos'
                }
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={!aigent.is_mutable}>
                  <Edit className="w-4 h-4 mr-2" />
                  {aigent.is_mutable ? 'Edit' : 'View Only'}
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <CardTitle>{mythosData?.display_name || 'Mythos'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {mythosData?.short_summary || 'Your narrative identity and story'}
            </p>
            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <strong>Context:</strong>
                <p className="text-muted-foreground mt-1">
                  {mythosData?.long_context_md?.slice(0, 150) || 'No context defined'}
                  {mythosData?.long_context_md && mythosData.long_context_md.length > 150 && '...'}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Mythos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <CardTitle>{logosData?.display_name || 'Logos'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {logosData?.short_summary || 'Your real-world expertise and purpose'}
            </p>
            <div className="space-y-2 mb-4">
              <div className="text-sm">
                <strong>Context:</strong>
                <p className="text-muted-foreground mt-1">
                  {logosData?.long_context_md?.slice(0, 150) || 'No context defined'}
                  {logosData?.long_context_md && logosData.long_context_md.length > 150 && '...'}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Logos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mission Pillars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Mission Pillars
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar) => (
              <div key={pillar.id} className="space-y-3">
                <div>
                  <h4 className="font-medium">{pillar.display_name}</h4>
                  <p className="text-sm text-muted-foreground">{pillar.short_summary}</p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Goals</p>
                    <ul className="text-sm space-y-1">
                      {Array.isArray(pillar.goals_json) && pillar.goals_json.slice(0, 2).map((goal, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          {goal}
                        </li>
                      ))}
                      {Array.isArray(pillar.goals_json) && pillar.goals_json.length > 2 && (
                        <li className="text-muted-foreground">+{pillar.goals_json.length - 2} more...</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">KPIs</p>
                    <ul className="text-sm space-y-1">
                      {Array.isArray(pillar.kpis_json) && pillar.kpis_json.slice(0, 2).map((kpi, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-secondary rounded-full"></div>
                          {kpi}
                        </li>
                      ))}
                      {Array.isArray(pillar.kpis_json) && pillar.kpis_json.length > 2 && (
                        <li className="text-muted-foreground">+{pillar.kpis_json.length - 2} more...</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <Button size="sm" variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Manage Pillars
          </Button>
        </CardContent>
      </Card>

      {/* Compiled System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Compiled System Prompt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {compiledPrompt}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This is the compiled context that will be used for your agent interactions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}