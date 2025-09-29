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

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: string;
  category_id: string;
  status: string;
  slug: string;
  featured: boolean;
  views_count: number;
  l2e_points: number;
}

interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface MissionPillar {
  id: string;
  display_name: string;
  short_summary: string;
  long_context_md: string;
}

export function Preview() {
  const { siteSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agentSite, setAgentSite] = useState<AgentSite | null>(null);
  const [aigents, setAigents] = useState<Aigent[]>([]);
  const [branches, setBranches] = useState<AgentBranch[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [pillars, setPillars] = useState<MissionPillar[]>([]);
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

      // Get content items for this site
      const { data: contentData } = await supabase
        .from('content_items')
        .select('*')
        .eq('agent_site_id', siteData.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (contentData) {
        setContentItems(contentData);
      }

      // Get categories for this site
      const { data: categoriesData } = await supabase
        .from('content_categories')
        .select('*')
        .eq('agent_site_id', siteData.id)
        .order('order_index');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Get mission pillars for this site
      const { data: pillarsData } = await supabase
        .from('mission_pillars')
        .select('*')
        .eq('agent_site_id', siteData.id);

      if (pillarsData) {
        setPillars(pillarsData);
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

  const handlePopulateMasterContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await supabase.functions.invoke('clone-master-template', {
        body: { 
          agentSiteId: agentSite?.id,
          userEmail: user?.email 
        }
      });

      if (response.error) {
        console.error('Error populating content:', response.error);
        return;
      }

      // Refresh the page data
      await fetchSiteData();
    } catch (error) {
      console.error('Error calling clone function:', error);
    }
  };

  // Check if site has no content and show populate button
  const hasNoContent = contentItems.length === 0 && categories.length === 0 && pillars.length === 0;

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
              {hasNoContent ? 
                'This site is ready to be populated with content from the master template.' :
                mythosData?.short_summary || 'An intelligent agent ready to assist you with personalized guidance and expertise.'
              }
            </p>
            <div className="flex justify-center gap-4 pt-4">
              {hasNoContent ? (
                <Button 
                  size="lg" 
                  onClick={handlePopulateMasterContent}
                  className="gap-2"
                >
                  <Star className="w-5 h-5" />
                  Populate with Master Content
                </Button>
              ) : (
                <>
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
                </>
              )}
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

          {/* Mission Pillars */}
          {pillars.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center">Mission Pillars</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pillars.map((pillar) => (
                  <Card key={pillar.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        {pillar.display_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {pillar.short_summary}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Content Categories */}
          {categories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center">Content Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {category.description || 'Category description'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Featured Content */}
          {contentItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center">Featured Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentItems.slice(0, 6).map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{item.type}</Badge>
                        {item.featured && <Badge variant="default">Featured</Badge>}
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {item.description?.slice(0, 120) || 'Content description'}
                        {item.description && item.description.length > 120 && '...'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.views_count} views</span>
                        {item.l2e_points > 0 && <span>{item.l2e_points} points</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

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