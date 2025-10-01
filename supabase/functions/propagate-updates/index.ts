import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropagateUpdateRequest {
  updateId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify uber admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is uber admin
    const { data: isUberAdmin } = await supabase.rpc('is_mm_super_admin', { uid: user.id });
    if (!isUberAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Uber admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { updateId }: PropagateUpdateRequest = await req.json();

    console.log('Propagating update:', updateId);

    // Get the update details
    const { data: update, error: updateError } = await supabase
      .from('master_site_updates')
      .select(`
        *,
        source_site:agent_sites!source_site_id(id, display_name, is_master)
      `)
      .eq('id', updateId)
      .single();

    if (updateError || !update) {
      console.error('Error fetching update:', updateError);
      return new Response(
        JSON.stringify({ error: 'Update not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all branch sites (non-master sites)
    const { data: branchSites, error: sitesError } = await supabase
      .from('agent_sites')
      .select('id, display_name, site_slug')
      .eq('is_master', false);

    if (sitesError || !branchSites) {
      console.error('Error fetching branch sites:', sitesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch branch sites' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${branchSites.length} branch sites to propagate to`);

    const results = {
      success: [] as string[],
      failed: [] as string[],
      total: branchSites.length,
    };

    // Propagate based on update type
    for (const site of branchSites) {
      try {
        console.log(`Propagating to site: ${site.display_name} (${site.id})`);

        switch (update.update_type) {
          case 'content_item':
            await propagateContentItem(supabase, update, site.id);
            break;
          case 'content_category':
            await propagateContentCategory(supabase, update, site.id);
            break;
          case 'mission_pillar':
            await propagateMissionPillar(supabase, update, site.id);
            break;
          case 'agent_branch':
            await propagateAgentBranch(supabase, update, site.id);
            break;
          case 'utilities_config':
            await propagateUtilitiesConfig(supabase, update, site.id);
            break;
          default:
            console.warn(`Unknown update type: ${update.update_type}`);
            results.failed.push(site.display_name);
            continue;
        }

        results.success.push(site.display_name);
        console.log(`Successfully propagated to ${site.display_name}`);
      } catch (error) {
        console.error(`Error propagating to ${site.display_name}:`, error);
        results.failed.push(site.display_name);
      }
    }

    // Mark update as pushed
    await supabase
      .from('master_site_updates')
      .update({
        status: 'pushed',
        pushed_at: new Date().toISOString(),
        target_sites: branchSites.map(s => s.id),
      })
      .eq('id', updateId);

    console.log('Propagation complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: `Propagated to ${results.success.length} of ${results.total} sites`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Propagation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function propagateContentItem(supabase: any, update: any, targetSiteId: string) {
  const entityData = update.entity_data;
  
  // Check if content item already exists in target site
  const { data: existing } = await supabase
    .from('content_items')
    .select('id')
    .eq('agent_site_id', targetSiteId)
    .eq('slug', entityData.slug)
    .single();

  if (existing) {
    // Update existing
    await supabase
      .from('content_items')
      .update({
        ...entityData,
        agent_site_id: targetSiteId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    // Insert new (remove id to let DB generate new one)
    const { id, ...dataWithoutId } = entityData;
    await supabase
      .from('content_items')
      .insert({
        ...dataWithoutId,
        agent_site_id: targetSiteId,
      });
  }
}

async function propagateContentCategory(supabase: any, update: any, targetSiteId: string) {
  const entityData = update.entity_data;
  
  const { data: existing } = await supabase
    .from('content_categories')
    .select('id')
    .eq('agent_site_id', targetSiteId)
    .eq('slug', entityData.slug)
    .single();

  if (existing) {
    await supabase
      .from('content_categories')
      .update({
        ...entityData,
        agent_site_id: targetSiteId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    const { id, ...dataWithoutId } = entityData;
    await supabase
      .from('content_categories')
      .insert({
        ...dataWithoutId,
        agent_site_id: targetSiteId,
      });
  }
}

async function propagateMissionPillar(supabase: any, update: any, targetSiteId: string) {
  const entityData = update.entity_data;
  
  const { data: existing } = await supabase
    .from('mission_pillars')
    .select('id')
    .eq('agent_site_id', targetSiteId)
    .eq('display_name', entityData.display_name)
    .single();

  if (existing) {
    await supabase
      .from('mission_pillars')
      .update({
        ...entityData,
        agent_site_id: targetSiteId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    const { id, ...dataWithoutId } = entityData;
    await supabase
      .from('mission_pillars')
      .insert({
        ...dataWithoutId,
        agent_site_id: targetSiteId,
      });
  }
}

async function propagateAgentBranch(supabase: any, update: any, targetSiteId: string) {
  const entityData = update.entity_data;
  
  const { data: existing } = await supabase
    .from('agent_branches')
    .select('id')
    .eq('agent_site_id', targetSiteId)
    .eq('display_name', entityData.display_name)
    .single();

  if (existing) {
    await supabase
      .from('agent_branches')
      .update({
        ...entityData,
        agent_site_id: targetSiteId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    const { id, ...dataWithoutId } = entityData;
    await supabase
      .from('agent_branches')
      .insert({
        ...dataWithoutId,
        agent_site_id: targetSiteId,
      });
  }
}

async function propagateUtilitiesConfig(supabase: any, update: any, targetSiteId: string) {
  const entityData = update.entity_data;
  
  const { data: existing } = await supabase
    .from('utilities_config')
    .select('id')
    .eq('agent_site_id', targetSiteId)
    .single();

  if (existing) {
    await supabase
      .from('utilities_config')
      .update({
        ...entityData,
        agent_site_id: targetSiteId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    const { id, ...dataWithoutId } = entityData;
    await supabase
      .from('utilities_config')
      .insert({
        ...dataWithoutId,
        agent_site_id: targetSiteId,
      });
  }
}
