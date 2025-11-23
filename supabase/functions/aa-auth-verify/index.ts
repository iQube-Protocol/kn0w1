import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifySignature } from "../_shared/aaClient.ts";

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

    console.log(`[Auth Verify] Verifying signature`);
    
    // Use shared AA client - note: AA-API expects 'signature' not 'jws'
    const data = await verifySignature('did:placeholder', jws);
    
    console.log('[Auth Verify] Auth token received from AA-API');

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
