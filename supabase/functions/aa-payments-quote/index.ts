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

    const { asset_id, buyer_did, dest_chain, asset_symbol } = await req.json();

    if (!asset_id || !buyer_did) {
      return new Response(
        JSON.stringify({ error: 'asset_id and buyer_did are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call the RPC function to generate quote
    const { data: quote, error } = await supabaseClient
      .rpc('rpc_issue_quote', {
        p_asset_id: asset_id,
        p_buyer_did: buyer_did,
        p_dest_chain: dest_chain || null,
        p_asset_symbol: asset_symbol || 'QCT'
      });

    if (error) throw error;

    // Build x402 response with headers
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/aa-payments-notify`;
    
    const x402Response = {
      ...quote,
      callback: callbackUrl,
      from_chain: dest_chain || 'polygon.sepolia',
    };

    const x402Headers = {
      'X-402-Protocol': 'x402',
      'X-402-Request-ID': quote.request_id,
      'X-402-Asset': quote.asset_symbol,
      'X-402-Amount': quote.amount,
      'X-402-From-Chain': dest_chain || 'polygon.sepolia',
      'X-402-To-Chain': quote.to_chain || 'base.sepolia',
      'X-402-Recipient': quote.recipient,
      'X-402-Callback': callbackUrl,
    };

    return new Response(
      JSON.stringify({
        x402: x402Response,
        headers: x402Headers,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating quote:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});