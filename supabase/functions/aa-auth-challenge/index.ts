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
    const { did } = await req.json();

    if (!did) {
      throw new Error('DID is required');
    }

    // Proxy request to AigentZ
    const aigentzBase = Deno.env.get('AIGENT_Z_API_BASE');
    
    if (!aigentzBase) {
      throw new Error('AIGENT_Z_API_BASE secret not configured');
    }
    
    // Validate that the secret is a valid URL, not an API key
    if (!aigentzBase.startsWith('http://') && !aigentzBase.startsWith('https://')) {
      console.error('[Auth Challenge] AIGENT_Z_API_BASE is not a valid URL:', aigentzBase.substring(0, 20) + '...');
      throw new Error('AIGENT_Z_API_BASE must be a valid URL (e.g., https://dev-beta.aigentz.me)');
    }
    
    console.log(`[Auth Challenge] Using AigentZ base: ${aigentzBase}`);
    
    const url = new URL('/aa/v1/auth/challenge', aigentzBase).toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ did }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AigentZ error:', response.status, errorText);
      throw new Error(`AigentZ error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Auth Challenge] Challenge received from AigentZ');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('aa-auth-challenge error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});