import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, MessageCircle, Star, Users } from 'lucide-react';
import { ChatInterface } from '@/components/ChatInterface';

interface AgentSite {
  id: string;
  title: string;
  site_slug: string;
  status: string;
  branding_json: any;
}

interface Aigent {
  id: string;
  name: string;
  agent_kind: string;
  system_prompt_md: string;
}

interface AgentBranch {
  id: string;
  kind: string;
  display_name: string;
  short_summary: string;
}

export function Preview() {
  const { siteSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agentSite, setAgentSite] = useState<AgentSite | null>(null);
  const [aigents, setAigents] = useState<Aigent[]>([]);
  const [branches, setBranches] = useState<AgentBranch[]>([]);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (siteSlug) {
      fetchSiteData();
    }
  }, [siteSlug]);

  const fetchSiteData = async () => {
    try {
      // Get agent site by slug
      const { data: siteData, error: siteError } = await supabase
        .from('agent_sites')
        .select('*')
        .eq('site_slug', siteSlug)
        .single();

      if (siteError) {
        console.error('Site not found:', siteError);
        return;
      }

      setAgentSite(siteData);

      // Get aigents for this site
      const { data: aigentsData } = await supabase
        .from('aigents')
        .select('*')
        .eq('agent_site_id', siteData.id);

      if (aigentsData) {
        setAigents(aigentsData);
      }

      // Get branches for this site
      const { data: branchesData } = await supabase
        .from('agent_branches')
        .select('*')
        .eq('agent_site_id', siteData.id);

      if (branchesData) {
        setBranches(branchesData);
      }

    } catch (error) {
      console.error('Error fetching site data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agentSite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Site Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The site "{siteSlug}" could not be found.
          </p>
          <Button onClick={() => navigate('/admin')}>
            Return to Admin
          </Button>
        </div>
      </div>
    );
  }

  const mythosData = branches.find(b => b.kind === 'mythos');
  const logosData = branches.find(b => b.kind === 'logos');
  const primaryAigent = aigents.find(a => a.agent_kind === 'satoshi') || aigents[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{agentSite.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Preview Mode • {agentSite.site_slug}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={agentSite.status === 'active' ? 'default' : 'secondary'}>
                {agentSite.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm">
              <Bot className="w-4 h-4" />
              AI-Powered Agent Site
            </div>
            <h2 className="text-4xl font-bold tracking-tight">
              Welcome to {agentSite.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {mythosData?.short_summary || 'An intelligent agent ready to assist you with personalized guidance and expertise.'}
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => setShowChat(true)}
                className="gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Start Conversation
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Star className="w-5 h-5" />
                Learn More
              </Button>
            </div>
          </div>

          {/* Agent Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aigents.map((aigent) => (
              <Card key={aigent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{aigent.name}</CardTitle>
                      <Badge variant={aigent.agent_kind === 'satoshi' ? 'default' : 'secondary'}>
                        {aigent.agent_kind}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {aigent.system_prompt_md?.slice(0, 120) || 'An intelligent agent ready to assist you.'}
                    {aigent.system_prompt_md && aigent.system_prompt_md.length > 120 && '...'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowChat(true)}
                    className="w-full gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat with {aigent.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* About Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mythosData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {mythosData.display_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {mythosData.short_summary}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {logosData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {logosData.display_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {logosData.short_summary}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </main>

      {/* Chat Interface */}
      {showChat && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl h-[600px] bg-card rounded-lg shadow-xl border">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Chat with {primaryAigent?.name || 'Agent'}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChat(false)}
              >
                ✕
              </Button>
            </div>
            <div className="h-[calc(600px-73px)]">
              <ChatInterface 
                isExpanded={true}
                onToggle={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}