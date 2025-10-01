import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Sparkles, Target, Users, Settings } from 'lucide-react';

interface SetupState {
  // Step 1-2: Branch names
  mythosName: string;
  logosName: string;
  
  // Step 3: Mythos definition
  mythosOrigin: string;
  mythosValues: string[];
  mythosTone: string;
  mythosAudience: string;
  mythosSafety: string;
  
  // Step 4: Logos definition
  logosDomain: string;
  logosOutcomes: string;
  logosCTAs: string;
  logosConstraints: string;
  
  // Step 5-6: Mission Pillars
  pillar1Name: string;
  pillar1Summary: string;
  pillar1Context: string;
  pillar1Goals: string[];
  pillar1KPIs: string[];
  
  pillar2Name: string;
  pillar2Summary: string;
  pillar2Context: string;
  pillar2Goals: string[];
  pillar2KPIs: string[];
  
  // Step 7: Utilities
  contentCreationOn: boolean;
  teachingOn: boolean;
  commercialOn: boolean;
  socialOn: boolean;
  
  // Step 8: Audience & Consent
  primaryAudience: string;
  consentCopy: string;
}

const INITIAL_STATE: SetupState = {
  mythosName: 'Mythos',
  logosName: 'Logos',
  mythosOrigin: '',
  mythosValues: [],
  mythosTone: '',
  mythosAudience: '',
  mythosSafety: '',
  logosDomain: '',
  logosOutcomes: '',
  logosCTAs: '',
  logosConstraints: '',
  pillar1Name: 'Civic Readiness',
  pillar1Summary: 'Building informed and engaged citizens',
  pillar1Context: 'Content and activities focused on civic education, community engagement, and democratic participation.',
  pillar1Goals: ['Increase civic knowledge', 'Encourage community participation', 'Promote informed decision-making'],
  pillar1KPIs: ['Civic knowledge assessments completed', 'Community events attended', 'Voting participation'],
  pillar2Name: 'Teach & Learn',
  pillar2Summary: 'Sharing knowledge and continuous learning',
  pillar2Context: 'Educational content, tutorials, and learning experiences with earn opportunities.',
  pillar2Goals: ['Share valuable knowledge', 'Enable peer learning', 'Reward learning progress'],
  pillar2KPIs: ['Lessons completed', 'Knowledge assessments passed', 'Learning rewards earned'],
  contentCreationOn: true,
  teachingOn: false,
  commercialOn: false,
  socialOn: true,
  primaryAudience: '',
  consentCopy: 'I agree to receive updates and communications from this agent site.'
};

const steps = [
  { title: 'Welcome', icon: Sparkles },
  { title: 'Branches', icon: Target },
  { title: 'Mythos', icon: Users },
  { title: 'Logos', icon: Target },
  { title: 'Pillars', icon: Target },
  { title: 'Goals & KPIs', icon: Target },
  { title: 'Utilities', icon: Settings },
  { title: 'Review', icon: Sparkles }
];

export function Setup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<SetupState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);

  const updateState = (updates: Partial<SetupState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Load saved draft or existing site on component mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editSiteId = params.get('edit');
    
    if (editSiteId) {
      // Load existing site for editing
      setEditMode(true);
      setEditingSiteId(editSiteId);
      loadExistingSite(editSiteId);
    } else {
      // Load saved draft
      loadSavedDraft();
    }
  }, [user, toast]);

  const loadExistingSite = async (siteId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get agent site
      const { data: site, error: siteError } = await supabase
        .from('agent_sites')
        .select('*')
        .eq('id', siteId)
        .single();

      if (siteError) throw siteError;

      // Get branches
      const { data: branches } = await supabase
        .from('agent_branches')
        .select('*')
        .eq('agent_site_id', siteId);

      const mythos = branches?.find(b => b.kind === 'mythos');
      const logos = branches?.find(b => b.kind === 'logos');

      // Get pillars
      const { data: pillars } = await supabase
        .from('mission_pillars')
        .select('*')
        .eq('agent_site_id', siteId);

      // Get utilities
      const { data: utilities } = await supabase
        .from('utilities_config')
        .select('*')
        .eq('agent_site_id', siteId)
        .maybeSingle();

      // Populate state from existing data
      setState({
        mythosName: mythos?.display_name || 'Mythos',
        logosName: logos?.display_name || 'Logos',
        mythosOrigin: mythos?.long_context_md || '',
        mythosValues: Array.isArray(mythos?.values_json) ? (mythos.values_json as string[]) : [],
        mythosTone: mythos?.tone || '',
        mythosAudience: mythos?.audience || '',
        mythosSafety: mythos?.safety_notes_md || '',
        logosDomain: logos?.long_context_md?.split('\n')[0]?.replace('Domain: ', '') || '',
        logosOutcomes: logos?.long_context_md?.split('\n')[1]?.replace('Outcomes: ', '') || '',
        logosCTAs: logos?.long_context_md?.split('\n')[2]?.replace('CTAs: ', '') || '',
        logosConstraints: logos?.long_context_md?.split('\n')[3]?.replace('Constraints: ', '') || '',
        pillar1Name: pillars?.[0]?.display_name || 'Pillar 1',
        pillar1Summary: pillars?.[0]?.short_summary || '',
        pillar1Context: pillars?.[0]?.long_context_md || '',
        pillar1Goals: Array.isArray(pillars?.[0]?.goals_json) ? (pillars[0].goals_json as string[]) : [],
        pillar1KPIs: Array.isArray(pillars?.[0]?.kpis_json) ? (pillars[0].kpis_json as string[]) : [],
        pillar2Name: pillars?.[1]?.display_name || 'Pillar 2',
        pillar2Summary: pillars?.[1]?.short_summary || '',
        pillar2Context: pillars?.[1]?.long_context_md || '',
        pillar2Goals: Array.isArray(pillars?.[1]?.goals_json) ? (pillars[1].goals_json as string[]) : [],
        pillar2KPIs: Array.isArray(pillars?.[1]?.kpis_json) ? (pillars[1].kpis_json as string[]) : [],
        contentCreationOn: utilities?.content_creation_on || false,
        teachingOn: utilities?.teaching_on || false,
        commercialOn: utilities?.commercial_on || false,
        socialOn: utilities?.social_on || false,
        primaryAudience: '',
        consentCopy: 'I agree to receive updates and communications from this agent site.'
      });

      toast({
        title: "Site Loaded",
        description: "You can now edit your agent site configuration.",
      });
    } catch (error) {
      console.error('Error loading site for editing:', error);
      toast({
        title: "Error",
        description: "Failed to load site data for editing.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSavedDraft = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('setup_drafts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setState({ ...INITIAL_STATE, ...(data.setup_state as Partial<SetupState>) });
        setCurrentStep(data.current_step);
        toast({
          title: "Draft Loaded",
          description: "Your previous setup progress has been restored.",
        });
      }
    } catch (error) {
      console.error('Error loading setup draft:', error);
    }
  };

  const saveDraft = async () => {
    if (!user) return;
    
    setSavingDraft(true);
    try {
      const { error } = await supabase
        .from('setup_drafts')
        .upsert([{
          user_id: user.id,
          setup_state: JSON.parse(JSON.stringify(state)),
          current_step: currentStep
        }]);

      if (error) throw error;
      
      toast({
        title: "Progress Saved",
        description: "Your setup progress has been saved.",
      });
    } catch (error) {
      console.error('Error saving setup draft:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const skipSetupAndSave = async () => {
    await saveDraft();
    navigate('/admin/overview');
  };

  const cloneFromMasterTemplate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create agent site with master template
      const siteSlug = `${user.email?.split('@')[0]}-site-${Date.now()}`;
      
      const { data: siteData, error: siteError } = await supabase
        .from('agent_sites')
        .insert({
          owner_user_id: user.id,
          site_slug: siteSlug,
          title: `${user.email?.split('@')[0]} Agent Site`
        })
        .select()
        .single();

      if (siteError) throw siteError;

      // Assign owner super_admin role for this site
      await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'super_admin',
          agent_site_id: siteData.id
        });

      // Call clone-master-template edge function
      const { error: cloneError } = await supabase.functions.invoke('clone-master-template', {
        body: {
          agentSiteId: siteData.id,
          userEmail: user.email
        }
      });

      if (cloneError) throw cloneError;

      // Clean up draft
      await supabase.from('setup_drafts').delete().eq('user_id', user.id);

      toast({
        title: "Site Created from Master Template!",
        description: "Your agent site has been created with sample content.",
      });

      window.location.href = `/preview/${siteData.site_slug}`;
    } catch (error) {
      console.error('Error cloning from master template:', error);
      toast({
        title: "Error",
        description: "Failed to clone from master template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSite = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (editMode && editingSiteId) {
        // Update existing site
        await updateExistingSite(editingSiteId);
      } else {
        // Create new site
        await createNewSite();
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast({
        title: "Error",
        description: editMode ? "Failed to update agent site." : "Failed to create agent site.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateExistingSite = async (siteId: string) => {
    // Update branches
    const { data: branches } = await supabase
      .from('agent_branches')
      .select('id, kind')
      .eq('agent_site_id', siteId);

    const mythosId = branches?.find(b => b.kind === 'mythos')?.id;
    const logosId = branches?.find(b => b.kind === 'logos')?.id;

    if (mythosId) {
      await supabase
        .from('agent_branches')
        .update({
          display_name: state.mythosName,
          long_context_md: state.mythosOrigin,
          values_json: state.mythosValues,
          tone: state.mythosTone,
          audience: state.mythosAudience,
          safety_notes_md: state.mythosSafety
        })
        .eq('id', mythosId);
    }

    if (logosId) {
      await supabase
        .from('agent_branches')
        .update({
          display_name: state.logosName,
          long_context_md: `Domain: ${state.logosDomain}\nOutcomes: ${state.logosOutcomes}\nCTAs: ${state.logosCTAs}\nConstraints: ${state.logosConstraints}`
        })
        .eq('id', logosId);
    }

    // Delete and recreate pillars
    await supabase
      .from('mission_pillars')
      .delete()
      .eq('agent_site_id', siteId);

    await supabase
      .from('mission_pillars')
      .insert([
        {
          agent_site_id: siteId,
          display_name: state.pillar1Name,
          short_summary: state.pillar1Summary,
          long_context_md: state.pillar1Context,
          goals_json: state.pillar1Goals,
          kpis_json: state.pillar1KPIs
        },
        {
          agent_site_id: siteId,
          display_name: state.pillar2Name,
          short_summary: state.pillar2Summary,
          long_context_md: state.pillar2Context,
          goals_json: state.pillar2Goals,
          kpis_json: state.pillar2KPIs
        }
      ]);

    // Update utilities
    await supabase
      .from('utilities_config')
      .update({
        content_creation_on: state.contentCreationOn,
        teaching_on: state.teachingOn,
        commercial_on: state.commercialOn,
        social_on: state.socialOn
      })
      .eq('agent_site_id', siteId);

    toast({
      title: "Site Updated!",
      description: "Your agent site configuration has been updated.",
    });

    window.location.href = '/admin/overview';
  };

  const createNewSite = async () => {
    // Check if site already exists
    const { data: existingSite, error: existingErr } = await supabase
      .from('agent_sites')
      .select('id, site_slug')
      .eq('owner_user_id', user!.id)
      .maybeSingle();

    if (existingErr) throw existingErr;

    if (existingSite) {
      toast({
        title: 'Agent site already exists',
        description: 'Opening your dashboard.'
      });
      await supabase.from('setup_drafts').delete().eq('user_id', user!.id);
      window.location.href = '/admin/overview';
      return;
    }

    // Create agent site
    const { data: siteData, error: siteError } = await supabase
      .from('agent_sites')
      .insert({
        owner_user_id: user!.id,
        site_slug: `${user!.email?.split('@')[0]}-site`,
        title: `${user!.email?.split('@')[0]} Agent Site`
      })
      .select()
      .single();

    if (siteError) throw siteError;

    // Assign owner super_admin role for this site
    await supabase
      .from('user_roles')
      .insert({
        user_id: user!.id,
        role: 'super_admin',
        agent_site_id: siteData.id
      });

    // Create Satoshi Agent (locked)
    const { error: satoshiError } = await supabase
      .from('aigents')
      .insert({
        agent_site_id: siteData.id,
        name: 'Satoshi Agent',
        agent_kind: 'satoshi',
        is_system_agent: true,
        is_mutable: false,
        system_prompt_md: 'You are the Satoshi Agent, providing canonical guidance on 21 Sats and Bitcoin fundamentals.'
      });

    if (satoshiError) throw satoshiError;

    // Create KNYT Agent (user-customizable)
    const { error: knytError } = await supabase
      .from('aigents')
      .insert({
        agent_site_id: siteData.id,
        name: 'KNYT Agent',
        agent_kind: 'knyt',
        is_system_agent: false,
        is_mutable: true
      });

    if (knytError) throw knytError;

    // Create Mythos branch
    const { error: mythosError } = await supabase
      .from('agent_branches')
      .insert({
        agent_site_id: siteData.id,
        kind: 'mythos',
        display_name: state.mythosName,
        short_summary: 'Your narrative identity and story',
        long_context_md: state.mythosOrigin,
        values_json: state.mythosValues,
        tone: state.mythosTone,
        audience: state.mythosAudience,
        safety_notes_md: state.mythosSafety
      });

    if (mythosError) throw mythosError;

    // Create Logos branch
    const { error: logosError } = await supabase
      .from('agent_branches')
      .insert({
        agent_site_id: siteData.id,
        kind: 'logos',
        display_name: state.logosName,
        short_summary: 'Your real-world expertise and purpose',
        long_context_md: `Domain: ${state.logosDomain}\nOutcomes: ${state.logosOutcomes}\nCTAs: ${state.logosCTAs}\nConstraints: ${state.logosConstraints}`
      });

    if (logosError) throw logosError;

    // Create Mission Pillars
    const { error: pillar1Error } = await supabase
      .from('mission_pillars')
      .insert({
        agent_site_id: siteData.id,
        display_name: state.pillar1Name,
        short_summary: state.pillar1Summary,
        long_context_md: state.pillar1Context,
        goals_json: state.pillar1Goals,
        kpis_json: state.pillar1KPIs
      });

    if (pillar1Error) throw pillar1Error;

    const { error: pillar2Error } = await supabase
      .from('mission_pillars')
      .insert({
        agent_site_id: siteData.id,
        display_name: state.pillar2Name,
        short_summary: state.pillar2Summary,
        long_context_md: state.pillar2Context,
        goals_json: state.pillar2Goals,
        kpis_json: state.pillar2KPIs
      });

    if (pillar2Error) throw pillar2Error;

    // Create utilities config
    const { error: utilitiesError } = await supabase
      .from('utilities_config')
      .insert({
        agent_site_id: siteData.id,
        content_creation_on: state.contentCreationOn,
        teaching_on: state.teachingOn,
        commercial_on: state.commercialOn,
        social_on: state.socialOn
      });

    if (utilitiesError) throw utilitiesError;

    // Clean up draft after successful creation
    await supabase
      .from('setup_drafts')
      .delete()
      .eq('user_id', user!.id);

    toast({
      title: "Success!",
      description: "Your agent site has been created successfully.",
    });

    // Force refresh auth state to pick up new agent site
    window.location.href = '/admin/overview';
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Welcome to 21 Sats Agent Setup</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Let's create your personalized agent site in just a few steps. We'll help you define your Mythos (story), Logos (purpose), and twin mission pillars.
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg max-w-lg mx-auto">
              <p className="text-sm text-muted-foreground">
                This should take about 8-10 minutes to complete.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {!editMode && (
                <Button 
                  onClick={cloneFromMasterTemplate}
                  disabled={loading}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading ? 'Cloning...' : 'Clone from Master Template'}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={skipSetupAndSave}
                className="text-sm"
                disabled={savingDraft || editMode}
              >
                {savingDraft ? 'Saving...' : 'Save & Continue Later'}
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Name Your Branches</h2>
              <p className="text-muted-foreground">
                What would you like to call your Mythos (story/character) and Logos (real-world role)?
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mythosName">Mythos Branch Name</Label>
                <Input
                  id="mythosName"
                  value={state.mythosName}
                  onChange={(e) => updateState({ mythosName: e.target.value })}
                  placeholder="e.g., Mythos, Character, Story"
                />
                <p className="text-xs text-muted-foreground">Your narrative identity</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logosName">Logos Branch Name</Label>
                <Input
                  id="logosName"
                  value={state.logosName}
                  onChange={(e) => updateState({ logosName: e.target.value })}
                  placeholder="e.g., Logos, Purpose, Mission"
                />
                <p className="text-xs text-muted-foreground">Your real-world expertise</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Define Your {state.mythosName}</h2>
              <p className="text-muted-foreground">
                Tell us about your character's origin, values, tone of voice, and why they exist.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mythosOrigin">Origin & Story (2-3 sentences)</Label>
                <Textarea
                  id="mythosOrigin"
                  value={state.mythosOrigin}
                  onChange={(e) => updateState({ mythosOrigin: e.target.value })}
                  placeholder="Think movie trailer: who are you, what do you stand for, what makes your character unique?"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mythosTone">Tone & Voice</Label>
                  <Input
                    id="mythosTone"
                    value={state.mythosTone}
                    onChange={(e) => updateState({ mythosTone: e.target.value })}
                    placeholder="e.g., Friendly, Professional, Witty"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mythosAudience">Target Audience</Label>
                  <Input
                    id="mythosAudience"
                    value={state.mythosAudience}
                    onChange={(e) => updateState({ mythosAudience: e.target.value })}
                    placeholder="e.g., Crypto newcomers, Educators"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mythosSafety">Safety Guidelines (Optional)</Label>
                <Textarea
                  id="mythosSafety"
                  value={state.mythosSafety}
                  onChange={(e) => updateState({ mythosSafety: e.target.value })}
                  placeholder="Topics to avoid or special considerations..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Define Your {state.logosName}</h2>
              <p className="text-muted-foreground">
                What's your domain of expertise? What outcomes should people get? What actions do you want them to take?
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logosDomain">Domain of Expertise</Label>
                <Input
                  id="logosDomain"
                  value={state.logosDomain}
                  onChange={(e) => updateState({ logosDomain: e.target.value })}
                  placeholder="e.g., Bitcoin Education, Financial Literacy, Civic Engagement"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logosOutcomes">Target Outcomes</Label>
                <Textarea
                  id="logosOutcomes"
                  value={state.logosOutcomes}
                  onChange={(e) => updateState({ logosOutcomes: e.target.value })}
                  placeholder="What results should people achieve through your guidance?"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logosCTAs">Primary Calls-to-Action</Label>
                <Input
                  id="logosCTAs"
                  value={state.logosCTAs}
                  onChange={(e) => updateState({ logosCTAs: e.target.value })}
                  placeholder="e.g., Start learning, Join community, Download wallet"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logosConstraints">Constraints & Compliance</Label>
                <Textarea
                  id="logosConstraints"
                  value={state.logosConstraints}
                  onChange={(e) => updateState({ logosConstraints: e.target.value })}
                  placeholder="Any legal, regulatory, or ethical constraints to consider..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Name Your Twin Mission Pillars</h2>
              <p className="text-muted-foreground">
                These are the two main tracks your agent will focus on. You can customize the default names or keep them.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">First Pillar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pillar1Name">Pillar Name</Label>
                    <Input
                      id="pillar1Name"
                      value={state.pillar1Name}
                      onChange={(e) => updateState({ pillar1Name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pillar1Summary">Summary</Label>
                    <Input
                      id="pillar1Summary"
                      value={state.pillar1Summary}
                      onChange={(e) => updateState({ pillar1Summary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pillar1Context">Context & Description</Label>
                    <Textarea
                      id="pillar1Context"
                      value={state.pillar1Context}
                      onChange={(e) => updateState({ pillar1Context: e.target.value })}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Second Pillar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pillar2Name">Pillar Name</Label>
                    <Input
                      id="pillar2Name"
                      value={state.pillar2Name}
                      onChange={(e) => updateState({ pillar2Name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pillar2Summary">Summary</Label>
                    <Input
                      id="pillar2Summary"
                      value={state.pillar2Summary}
                      onChange={(e) => updateState({ pillar2Summary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pillar2Context">Context & Description</Label>
                    <Textarea
                      id="pillar2Context"
                      value={state.pillar2Context}
                      onChange={(e) => updateState({ pillar2Context: e.target.value })}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Set Goals & KPIs</h2>
              <p className="text-muted-foreground">
                Define 3 goals and 3 key performance indicators for each pillar.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{state.pillar1Name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Goals (one per line)</Label>
                    <Textarea
                      value={state.pillar1Goals.join('\n')}
                      onChange={(e) => updateState({ pillar1Goals: e.target.value.split('\n').filter(Boolean) })}
                      rows={3}
                      placeholder="Goal 1&#10;Goal 2&#10;Goal 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>KPIs (one per line)</Label>
                    <Textarea
                      value={state.pillar1KPIs.join('\n')}
                      onChange={(e) => updateState({ pillar1KPIs: e.target.value.split('\n').filter(Boolean) })}
                      rows={3}
                      placeholder="KPI 1&#10;KPI 2&#10;KPI 3"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{state.pillar2Name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Goals (one per line)</Label>
                    <Textarea
                      value={state.pillar2Goals.join('\n')}
                      onChange={(e) => updateState({ pillar2Goals: e.target.value.split('\n').filter(Boolean) })}
                      rows={3}
                      placeholder="Goal 1&#10;Goal 2&#10;Goal 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>KPIs (one per line)</Label>
                    <Textarea
                      value={state.pillar2KPIs.join('\n')}
                      onChange={(e) => updateState({ pillar2KPIs: e.target.value.split('\n').filter(Boolean) })}
                      rows={3}
                      placeholder="KPI 1&#10;KPI 2&#10;KPI 3"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose Utilities to Start</h2>
              <p className="text-muted-foreground">
                Select which features you'd like to enable for your agent site. You can always change these later.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`cursor-pointer transition-colors ${state.contentCreationOn ? 'ring-2 ring-primary' : ''}`} onClick={() => updateState({ contentCreationOn: !state.contentCreationOn })}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" checked={state.contentCreationOn} readOnly className="rounded" />
                    <div>
                      <h3 className="font-medium">Content Creation</h3>
                      <p className="text-sm text-muted-foreground">Rich editor, media uploads, publishing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-colors ${state.teachingOn ? 'ring-2 ring-primary' : ''}`} onClick={() => updateState({ teachingOn: !state.teachingOn })}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" checked={state.teachingOn} readOnly className="rounded" />
                    <div>
                      <h3 className="font-medium">Teaching/Learning</h3>
                      <p className="text-sm text-muted-foreground">Lessons, quizzes, progress tracking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-colors ${state.commercialOn ? 'ring-2 ring-primary' : ''}`} onClick={() => updateState({ commercialOn: !state.commercialOn })}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" checked={state.commercialOn} readOnly className="rounded" />
                    <div>
                      <h3 className="font-medium">Commercial</h3>
                      <p className="text-sm text-muted-foreground">Offers, payments, revenue tracking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-colors ${state.socialOn ? 'ring-2 ring-primary' : ''}`} onClick={() => updateState({ socialOn: !state.socialOn })}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" checked={state.socialOn} readOnly className="rounded" />
                    <div>
                      <h3 className="font-medium">Social</h3>
                      <p className="text-sm text-muted-foreground">Social media integration, sharing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Create Site</h2>
              <p className="text-muted-foreground">
                Review your configuration and create your agent site.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Branches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div><strong>{state.mythosName}:</strong> {state.mythosOrigin.slice(0, 100)}...</div>
                    <div><strong>{state.logosName}:</strong> {state.logosDomain}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mission Pillars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div><strong>{state.pillar1Name}:</strong> {state.pillar1Summary}</div>
                    <div><strong>{state.pillar2Name}:</strong> {state.pillar2Summary}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enabled Utilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {state.contentCreationOn && <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">Content Creation</span>}
                  {state.teachingOn && <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">Teaching/Learning</span>}
                  {state.commercialOn && <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">Commercial</span>}
                  {state.socialOn && <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">Social</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Agent Site Setup</h1>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={(currentStep + 1) / steps.length * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={saveDraft}
                disabled={savingDraft}
                className="text-sm"
              >
                {savingDraft ? 'Saving...' : 'Save Progress'}
              </Button>
            )}
            
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleCreateSite}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Site' : 'Create Site')}
                <Sparkles className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}