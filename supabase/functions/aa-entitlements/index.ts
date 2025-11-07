import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from auth
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const asset_id = url.pathname.split('/').pop();

    if (!asset_id) {
      return new Response(
        JSON.stringify({ error: 'asset_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has entitlement
    const { data: entitlements, error } = await supabaseClient
      .from('entitlements')
      .select('*, x402_transactions(*)')
      .eq('asset_id', asset_id)
      .eq('holder_user_id', user.id);

    if (error) throw error;

    const hasAccess = entitlements && entitlements.length > 0;
    let accessDetails = null;

    if (hasAccess) {
      const entitlement = entitlements[0];
      
      // Generate signed URL if user has download rights
      let signedUrl = null;
      if (entitlement.rights.includes('download') || entitlement.rights.includes('stream')) {
        // Get media asset for the content
        const { data: mediaAssets } = await supabaseClient
          .from('media_assets')
          .select('storage_path')
          .eq('content_item_id', asset_id)
          .limit(1);

        if (mediaAssets && mediaAssets.length > 0 && mediaAssets[0].storage_path) {
          const { data: urlData } = await supabaseClient
            .storage
            .from('content-files')
            .createSignedUrl(mediaAssets[0].storage_path, 3600); // 1 hour expiry

          signedUrl = urlData?.signedUrl;
        }
      }

      accessDetails = {
        rights: entitlement.rights,
        tokenqube_id: entitlement.tokenqube_id,
        expires_at: entitlement.expires_at,
        url: signedUrl,
      };
    }

    return new Response(
      JSON.stringify({
        has_access: hasAccess,
        ...accessDetails,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking entitlement:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});