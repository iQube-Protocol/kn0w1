import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get request body
    const payload = await req.json();

    if (!payload.quote_id || !payload.asset_id || !payload.recipient_did) {
      throw new Error('Missing required fields: quote_id, asset_id, recipient_did');
    }

    // Proxy request to Gateway with API key
    const gatewayBase = Deno.env.get('GATEWAY_BASE') || 'https://gateway.dev-beta.aigentz.me';
    const apiKey = Deno.env.get('GATEWAY_API_KEY');
    
    console.log(`[Gateway Intent] Using gateway base: ${gatewayBase}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    const response = await fetch(`${gatewayBase}/propose_intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gateway error:', response.status, errorText);
      throw new Error(`Gateway error: ${response.status}`);
    }

    const data = await response.json();

    // Log intent proposal for audit trail
    console.log('Intent proposed:', {
      user_id: user.id,
      quote_id: payload.quote_id,
      asset_id: payload.asset_id,
      recipient_did: payload.recipient_did,
      intent_id: data.intent_id,
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('gateway-intent error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
