import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requestChallenge } from "../_shared/aaClient.ts";

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

    console.log(`[Auth Challenge] Requesting challenge for DID: ${did}`);
    
    // Use shared AA client
    const data = await requestChallenge(did);
    
    console.log('[Auth Challenge] Challenge received from AA-API');

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