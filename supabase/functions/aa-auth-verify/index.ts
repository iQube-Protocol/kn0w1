import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jws } = await req.json();

    if (!jws) {
      throw new Error('JWS signature is required');
    }

    // Proxy request to AigentZ
    const aigentzBase = Deno.env.get('AIGENT_Z_API_BASE');
    
    if (!aigentzBase) {
      throw new Error('AIGENT_Z_API_BASE secret not configured');
    }
    
    console.log(`[Auth Verify] Proxying signature verification to ${aigentzBase}`);
    
    const response = await fetch(`${aigentzBase}/aa/v1/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jws }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AigentZ error:', response.status, errorText);
      throw new Error(`AigentZ error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Auth Verify] Auth token received from AigentZ');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('aa-auth-verify error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
